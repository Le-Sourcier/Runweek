const dayjs = require("dayjs");
const bcrypt = require("bcrypt");
const db = require("../../models");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

const {
    Users,
    Profiles,
    Sessions,
    Plans,
    Subscriptions,
    Roles,
    UserRelations,
    Notifications,
} = db;
const sendMail = require("../../functions/components/sendMail");
const MailInvitationTemplate = require("../../../lib/MailInvitationTemplate");
const mailVerificationTemplate = require("../../../lib/mailVerificationTemplate");
const {
    isAdminOrSuperAdmin,
    generateRandomPassword,
    createNotification,
    getClientIp,
    getGeoLocation,
} = require("../../utils");
const PasswordResetTemplate = require("../../../lib/PasswordResetTemplate");

const jsonResponse = (res, status, message, data) => {
    return res.status(status).json({ error: status >= 400, message, data });
}

module.exports = {
    register: async (req, res) => {
        const transaction = await db.sequelize.transaction();
        try {
            const {
                fname,
                lname,
                company,
                phone,
                website,
                email,
                password,
                referral_code,
            } = req.body;

            if (await Users.findOne({ where: { email } }))
                return jsonResponse(res, 400, "Account already exists");

            const user = await Users.create(
                { email, password },
                { transaction }
            );

            await Profiles.create(
                {
                    user_id: user.id,
                    fname,
                    lname,
                    company,
                    phone,
                    website,
                },
                { transaction }
            );

            if (referral_code) {
                const sponsorCode = await UserRelations.findOne({
                    where: {
                        relation_token: referral_code,
                        type: "SPONSOR",
                    },
                    transaction,
                });

                if (sponsorCode) {
                    const sponsorId = sponsorCode.related_by;

                    await UserRelations.create(
                        {
                            user_id: user.id,
                            related_by: sponsorId,
                            type: "SPONSOR",
                            status: "ACCEPTED",
                            accepted_at: new Date(),
                        },
                        { transaction }
                    );

                    const sponsoredCount = await UserRelations.count({
                        where: {
                            related_by: sponsorId,
                            type: "SPONSOR",
                            status: "ACCEPTED",
                        },
                        transaction,
                    });

                    if (sponsoredCount === 5) {
                        const sponsor = await Users.findByPk(sponsorId, {
                            include: {
                                model: Subscriptions,
                                as: "subscriptions",
                                include: [{ model: Plans, as: "plan" }],
                            },
                            transaction,
                        });

                        const sponsorSub = sponsor?.subscriptions?.[0];
                        if (sponsorSub) {
                            sponsorSub.credit_allocated += 500;
                            await sponsorSub.save({ transaction });
                        }
                    }
                }
            }

            const verificationToken = user.generateVerificationToken();
            user.token = verificationToken;
            await user.save({ transaction });

            await transaction.commit();

            const link = `${process.env.ORIGINE_URL}/verify-mail?pk=${user.token}`;
            const html = mailVerificationTemplate(link);

            await sendMail({
                to: email,
                subject: `Hi ${fname}, Welcome!`,
                html,
            });

            return jsonResponse(res, 201, "Account created successfully");
        } catch (error) {
            await transaction.rollback();
            console.error("REGISTER_ERROR", error);
            return jsonResponse(res, 500, "Registration failed");
        }
    },

    inviteMember: async (req, res) => {
        const transaction = await db.sequelize.transaction();
        try {
            const { id: admin_id } = req.user;
            const { fname, lname, phone, email, role, credit = 0 } = req.body;
            if (!fname || !lname || !email || !role) {
                return jsonResponse(res, 400, "Required fields are missing");
            }

            const existingUser = await Users.findOne({ where: { email } });
            if (existingUser)
                return jsonResponse(res, 400, "Account already exists");

            const admin = await Users.findByPk(admin_id, {
                include: [
                    { model: Profiles, as: "profile" },
                    {
                        model: Subscriptions,
                        as: "subscriptions",
                        include: [{ model: Plans, as: "plan" }],
                    },
                ],
                transaction,
            });

            if (!admin || admin.role !== "ADMIN")
                return jsonResponse(res, 403, "Insufficient permissions");

            const company = admin.profile?.company || null;
            const website = admin.profile?.website || null;
            const currentSubscription = admin?.subscriptions?.[0];
            const adminPlan = currentSubscription?.plan;

            if (!adminPlan) return jsonResponse(res, 404, "Plan not found");

            let adminAvailableCredit =
                admin.subscriptions?.[0]?.credit_allocated || 0;
            if (credit > adminAvailableCredit)
                return jsonResponse(res, 403, "Not enough credit", { available: adminAvailableCredit });

            const password = generateRandomPassword();

            const user = await Users.create(
                {
                    email,
                    password,
                },
                { transaction }
            );

            await Profiles.create(
                {
                    user_id: user.id,
                    fname,
                    lname,
                    phone,
                    company,
                    website,
                },
                { transaction }
            );

            await Roles.create(
                {
                    user_id: user.id,
                    account_type: role || "USER",
                },
                { transaction }
            );

            await UserRelations.create(
                {
                    user_id: user.id,
                    related_by: admin_id,
                    type: "TEAM_INVITE",
                    status: "ACCEPTED",
                    custom_quota: credit,
                },
                { transaction }
            );

            const token = user.generateVerificationToken();
            user.token = token;
            await user.save({ transaction });

            adminAvailableCredit = currentSubscription?.credit_allocated || 0;
            if (credit > adminAvailableCredit)
                return jsonResponse(res, 403, "Not enough credit", { available: adminAvailableCredit });

            currentSubscription.credit_allocated =
                adminAvailableCredit - credit;
            await currentSubscription.save({ transaction });

            await Subscriptions.create(
                {
                    user_id: user.id,
                    plan_id: adminPlan.id,
                },
                { transaction }
            );

            await transaction.commit();

            const link = `${process.env.ORIGINE_URL}/verify-mail?pk=${user.token}`;
            const html = MailInvitationTemplate(link, { email, password });

            await sendMail({
                to: email,
                subject: `👋 Bienvenue dans l'équipe ${company || ""}`,
                html,
            });

            return jsonResponse(res, 201, "Account created successfully", { email, password });
        } catch (error) {
            await transaction.rollback();
            console.error("INVITE_MEMBER_ERROR:", error);
            return jsonResponse(res, 500, "Invite member error");
        }
    },

    login: async (req, res) => {
        try {
            const { email, password, rememberMe } = req.body;

            const user = await Users.findOne({
                where: { email },
                include: ["profile"],
            });

            if (!user) return jsonResponse(res, 404, "Profile not found");

            if (!(await user.verifyPassword(password))) {
                return jsonResponse(res, 400, "Invalid credentials");
            }

            if (user.status !== "VERIFIED") {
                return jsonResponse(res, 400, `Account ${user.status}`);
            }

            const existingSession = await Sessions.findOne({
                where: {
                    user_id: user.id,
                    expires_at: {
                        [Op.gt]: new Date(),
                    },
                },
            });

            let refreshToken, accessToken;

            if (existingSession) {
                refreshToken = existingSession.token;
            } else {
                const tokens = user.generateTokens();
                accessToken = tokens.accessToken;
                refreshToken = tokens.refreshToken;

                const expiresAt = dayjs().add(7, "days").toDate();

                const ip = getClientIp(req);

                await Sessions.create({
                    user_id: user.id,
                    token: refreshToken,
                    expires_at: expiresAt,
                    ip_address: ip,
                    user_agent: req.headers["user-agent"],
                });
            }

            accessToken = accessToken || user.generateTokens().accessToken;

            user.token = accessToken;
            await user.save();

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
                maxAge: rememberMe
                    ? 30 * 24 * 60 * 60 * 1000
                    : 7 * 24 * 60 * 60 * 1000,
            });

            return jsonResponse(res, 200, "Login successful", { accessToken, refreshToken });
        } catch (error) {
            console.error(error);
            return jsonResponse(res, 500, "Login error");
        }
    },
    getMe: async (req, res) => {
        try {
            const user = await Users.findByPk(req.user.id, {
                include: [
                    {
                        model: Profiles,
                        as: "profile",
                        attributes: [
                            "fname",
                            "lname",
                            "phone",
                            "company",
                            "website",
                            "address",
                            "bio",
                            "image",
                        ],
                    },
                    {
                        model: db.Subscriptions,
                        as: "subscriptions",
                        where: { is_active: true },
                        required: false,
                        include: [
                            {
                                model: db.Plans,
                                as: "plan",
                                attributes: ["name"],
                            },
                        ],
                    },
                ],
            });

            if (!user) return jsonResponse(res, 404, "Profile not found");

            const subc = await Subscriptions.findOne({
                where: { user_id: user.id },
                include: [{ model: Plans, as: "plan" }],
            });

            const planName = subc?.plan?.name || "FREE";
            const currentCredits = subc?.credit_allocated ?? 0;

            const data = {
                id: user.id,
                email: user.email,
                role: user.role,
                fname: user.profile?.fname,
                lname: user.profile?.lname,
                phone: user.profile?.phone,
                address: user.profile.address ?? null,
                image: user.profile?.image ?? null,
                bio: user.profile?.bio ?? null,
                company: user.profile?.company,
                website: user.profile?.website,
                plan: planName,
                credits: currentCredits,
                updatedAt: user.updatedAt,
            };

            return jsonResponse(res, 200, "Success", data);
        } catch (error) {
            console.error("getMe error:", error);
            return jsonResponse(res, 500, "Internal Server Error");
        }
    },
    refresh: async (req, res) => {
        try {
            const token = req.body.refreshToken;
            if (!token) return jsonResponse(res, 401, "Unauthorized access");

            const { id } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

            const session = await Sessions.findOne({ where: { token } });
            if (!session || dayjs(session.expires_at).isBefore(dayjs())) {
                return jsonResponse(res, 401, "Token expired");
            }

            const user = await Users.findByPk(id);
            if (!user) return jsonResponse(res, 404, "Profile not found");

            const { accessToken, refreshToken: newRefreshToken } =
                user.generateTokens();

            session.token = newRefreshToken;
            session.expires_at = dayjs().add(7, "days").toDate();
            await session.save();

            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return jsonResponse(res, 200, "Success", { accessToken, refreshToken: newRefreshToken });
        } catch (error) {
            console.error("Refresh error:", error);
            return jsonResponse(res, 401, "Token invalid");
        }
    },
    updateUser: async (req, res) => {
        const transaction = await db.sequelize.transaction();
        try {
            const userId = req.user?.id;
            if (!userId) return jsonResponse(res, 401, "Unauthorized");

            const { fname, lname, phone, company, website, address, bio } =
                req.body;

            const profile = await Profiles.findOne({
                where: { user_id: userId },
                transaction,
            });

            if (!profile) {
                await transaction.rollback();
                return jsonResponse(res, 404, "Profile not found");
            }

            const updatableFields = {
                fname,
                lname,
                phone,
                company,
                website,
                address,
                bio,
            };

            Object.entries(updatableFields).forEach(([key, value]) => {
                if (req.body.hasOwnProperty(key)) {
                    profile[key] = value;
                }
            });

            await profile.save({ transaction });
            await transaction.commit();

            return jsonResponse(res, 200, "Profile updated");
        } catch (error) {
            await transaction.rollback();
            console.error("Error updating profile:", error);
            return jsonResponse(res, 500, "Internal server error");
        }
    },

    updatePassword: async (req, res) => {
        const transaction = await db.sequelize.transaction();
        try {
            const { id } = req.user;
            const { oldPassword, newPassword } = req.body;

            const user = await Users.findByPk(id);
            if (!user || !(await user.verifyPassword(oldPassword)))
                return jsonResponse(res, 400, "Old password invalid");

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save({ transaction });
            await transaction.commit();

            return jsonResponse(res, 200, "Password reset successfully");
        } catch (error) {
            await transaction.rollback();
            return jsonResponse(res, 500, "Internal Server Error");
        }
    },

    verifyMail: async (req, res) => {
        try {
            const { token } = req.body;

            if (!token) {
                return jsonResponse(res, 400, "Invalid or expired token");
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await Users.findOne({
                where: { id: decoded.id },
                include: ["profile"],
            });

            if (!user || user.status === "VERIFIED") {
                return jsonResponse(res, 400, "Invalid or expired token");
            }

            const lastUpdate = new Date(user.updatedAt).getTime();
            const isExpired = Date.now() - lastUpdate > 15 * 60 * 1000;
            if (isExpired) {
                return jsonResponse(res, 400, "Invalid or expired token", { email: user.email });
            }

            const freePlan = await Plans.findOne({
                where: { name: "FREE" },
            });

            await Subscriptions.create(
                {
                    user_id: user.id,
                    plan_id: freePlan.id,
                    billing_type: "FREE",
                    credit_allocated: 1000,
                    is_active: true,
                }
            );

            user.status = "VERIFIED";
            user.token = null;

            await user.save();

            await createNotification({
                user_id: user.id,
                type: "ACCOUNT_VALIDATED",
                content: `Félicitations ${user.profile.fname} ${user.profile.lname}, votre compte a été validé avec succès et votre abonnement au plan ${freePlan.name} a été activé avec ${freePlan.monthly_credits} crédits gratuits.`,
            });

            return jsonResponse(res, 200, "Account validated successfully");
        } catch (error) {
            console.log("ERROR IN MAIL VERIFICATION: ", error);

            if (
                ["TokenExpiredError", "JsonWebTokenError"].includes(error.name)
            ) {
                return jsonResponse(res, 400, "Invalid or expired token");
            }
            return jsonResponse(res, 500, "Internal Server Error");
        }
    },
    resendMail: async (req, res) => {
        try {
            const { email } = req.body;

            if (!email || typeof email !== "string") {
                return jsonResponse(res, 400, "Invalid email format");
            }

            const user = await Users.findOne({ where: { email } });

            if (!user) {
                return jsonResponse(res, 404, "Account not found");
            }

            if (user.status === "VERIFIED") {
                return jsonResponse(res, 400, "Account already verified");
            }

            const token = user.generateVerificationToken();
            user.token = token;
            await user.save();

            const profile = await Profiles.findOne({
                where: { user_id: user.id },
            });

            const fullName = profile?.fname || user.email.split("@")[0];

            const verificationUrl = `${process.env.ORIGINE_URL}/verify-mail?pk=${token}`;
            const html = mailVerificationTemplate(verificationUrl);

            const result = await sendMail({
                to: email,
                subject: `👋 Hi ${fullName}, confirm your email`,
                html,
            });

            if (result?.accepted?.length) {
                return jsonResponse(res, 200, "Email sent successfully");
            } else {
                return jsonResponse(res, 500, "Email sending failed");
            }
        } catch (error) {
            console.error("Error in resendMail:", error);
            return jsonResponse(res, 500, "Email sending failed");
        }
    },

    verifyPasswordToken: async (req, res) => {
        try {
            const { token } = req.body;
            const user = await Users.findOne({ where: { reset_token: token } });
            if (!user || dayjs(user.reset_token_expires_at).isBefore(dayjs()))
                return jsonResponse(res, 400, "Invalid or expired token");

            const profile = await Profiles.findOne({
                where: { user_id: user.id },
            });
            return jsonResponse(res, 200, "Next step", { firstName: profile?.fname });
        } catch (error) {
            return jsonResponse(res, 500, "Internal Server Error");
        }
    },
    forgetPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await Users.findOne({ where: { email } });
            if (!user) return jsonResponse(res, 404, "Profile not found");

            const token = user.generateVerificationToken();
            const expiresAt = dayjs().add(15, "minutes").toDate();

            Object.assign(user, {
                reset_token: token,
                reset_token_expires_at: expiresAt,
            });
            await user.save();

            const rLink = `${process.env.ORIGINE_URL}/reset-password?pk=${token}`;
            const html = PasswordResetTemplate({
                RESET_LINK: rLink,
            });
            const result = await sendMail({
                to: email,
                subject: "Reset Your Password - Your Prospect Pro",
                text: rLink,
                html,
            });

            return result?.accepted?.length
                ? jsonResponse(res, 200, "Email sent successfully")
                : jsonResponse(res, 500, "Email sending failed");
        } catch (error) {
            return jsonResponse(res, 500, "Internal Server Error");
        }
    },

    resetPassword: async (req, res) => {
        const transaction = await db.sequelize.transaction();
        try {
            const { token, password } = req.body;
            const user = await Users.findOne({ where: { reset_token: token } });

            if (!user) return jsonResponse(res, 400, "Invalid or expired token");
            else if (dayjs(user.reset_token_expires_at).isBefore(dayjs()))
                return jsonResponse(res, 400, "Invalid or expired token", { email: user.email });

            Object.assign(user, {
                password: await bcrypt.hash(password, 10),
                reset_token: null,
                reset_token_expires_at: null,
            });
            await user.save({ transaction });
            await transaction.commit();

            return jsonResponse(res, 200, "Password recovered successfully");
        } catch (error) {
            await transaction.rollback();
            return jsonResponse(res, 500, "Internal Server Error");
        }
    },

    delete: async (req, res) => {
        const transaction = await db.sequelize.transaction();
        try {
            const { id } = req.user;

            const user = await Users.findByPk(id, {
                include: ["subscriptions", "sessions", "profile"],
                transaction,
            });
            if (!user) return jsonResponse(res, 404, "Account not found");

            await Subscriptions.destroy({ where: { user_id: id }, transaction });
            await Sessions.destroy({ where: { user_id: id }, transaction });
            await Profiles.destroy({ where: { user_id: id }, transaction });
            await Notifications.destroy({ where: { user_id: id }, transaction });

            await user.destroy({ transaction });

            await transaction.commit();
            return jsonResponse(res, 200, "User deleted");
        } catch (error) {
            console.error("ERROR during user deletion:", error);
            await transaction.rollback();
            return jsonResponse(res, 500, "Internal Server Error");
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const { id } = req.user;
            if (!id) return jsonResponse(res, 403, "Access denied");

            const currentUser = await Users.findByPk(id);
            if (!isAdminOrSuperAdmin(currentUser)) {
                return jsonResponse(res, 403, "Insufficient permissions");
            }
            const users = await Users.findAll({
                include: [
                    "profile",
                    {
                        model: db.Subscriptions,
                        as: "subscriptions",
                        where: { is_active: true },
                        required: false,
                        include: [
                            {
                                model: db.Plans,
                                as: "plan",
                                attributes: ["name"],
                            },
                        ],
                    },
                ],
            });

            if (!users || users.length === 0)
                return jsonResponse(res, 404, "Recorded users not found");

            const formatted = users.map((user) => {
                const currentSubscription = user.subscriptions?.[0];
                const planName = currentSubscription.plan.name;
                const currentCredits = currentSubscription.credit_allocated;

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    fname: user.profile?.fname,
                    lname: user.profile?.lname,
                    phone: user.profile?.phone,
                    address: user.profile?.address ?? null,
                    image: user.profile?.image ?? null,
                    bio: user.profile?.bio ?? null,
                    company: user.profile?.company,
                    website: user.profile?.website,
                    plan: planName,
                    credits: currentCredits,
                    updatedAt: user.updatedAt,
                    createdAt: user.createdAt,
                };
            });

            return jsonResponse(res, 200, "Success", formatted);
        } catch (error) {
            console.error("getAllUsers error:", error);
            return jsonResponse(res, 500, "Internal Server Error");
        }
    },
    getUserWithDetails: async (req, res) => {
        try {
            const { id } = req.user;
            if (!id) return jsonResponse(res, 403, "Access denied");

            const currentUser = await Users.findByPk(id);
            if (!isAdminOrSuperAdmin(currentUser)) {
                return jsonResponse(res, 403, "Insufficient permissions");
            }
            const user = await Users.findByPk(req.params.id, {
                include: [
                    "profile",
                    {
                        model: db.Subscriptions,
                        as: "subscriptions",
                        where: { is_active: true },
                        required: false,
                        include: [
                            {
                                model: db.Plans,
                                as: "plan",
                                attributes: ["name"],
                            },
                        ],
                    },
                ],
            });

            if (!user) return jsonResponse(res, 404, "Account not found");
            const currentSubscription = user.subscriptions?.[0];
            const planName = currentSubscription.plan.name;
            const currentCredits = currentSubscription.credit_allocated;

            const formatted = {
                id: user.id,
                email: user.email,
                role: user.role,
                fname: user.profile?.fname,
                lname: user.profile?.lname,
                phone: user.profile?.phone,
                address: user.profile?.address ?? null,
                image: user.profile?.image ?? null,
                bio: user.profile?.bio ?? null,
                company: user.profile?.company,
                website: user.profile?.website,
                plan: planName,
                credits: currentCredits,
                updatedAt: user.updatedAt,
                createdAt: user.createdAt,
            };

            return jsonResponse(res, 200, "Success", formatted);
        } catch (error) {
            console.error("getAllUsers error:", error);
            return jsonResponse(res, 500, "Internal Server Error");
        }
    },
    getAllSessions: async (req, res) => {
        try {
            const { id } = req.user;

            const sessions = await Sessions.findAll({
                where: { user_id: id },
            });

            if (!sessions || sessions.length === 0)
                return jsonResponse(res, 404, "No sessions found");

            const formatted = await Promise.all(
                sessions.map(async (session) => {
                    const location = await getGeoLocation(session.ip_address);

                    return {
                        id: session.id,
                        ip_address: session.ip_address,
                        location,
                        user_agent: session.user_agent,
                        expires_at: session.expires_at,
                        updatedAt: session.updatedAt,
                        createdAt: session.createdAt,
                    };
                })
            );

            return jsonResponse(res, 200, "Success", formatted);
        } catch (error) {
            console.error("getAllSessions error:", error);
            return jsonResponse(res, 500, "Internal Server Error");
        }
    },
    getUserSponsorships: async (req, res) => {
        try {
            const user_id = req.user.id;

            const sponsoredUsers = await UserRelations.findAll({
                where: { related_by: user_id, type: "SPONSOR" },
                include: [
                    {
                        model: Users,
                        as: "user",
                        include: [{ model: Profiles, as: "profile" }],
                    },
                ],
            });

            const sponsors = await UserRelations.findAll({
                where: { user_id, type: "SPONSOR" },
                include: [
                    {
                        model: Users,
                        as: "inviter",
                        include: [{ model: Profiles, as: "profile" }],
                    },
                ],
            });

            return jsonResponse(res, 200, "Success", { sponsoredUsers, sponsors });
        } catch (error) {
            console.error("getUserSponsorships error:", error);
            return jsonResponse(res, 500, "Internal Server Error");
        }
    },
    generateReferralCode: async (req, res) => {
        try {
            const userId = req.user.id;

            let relation = await UserRelations.findOne({
                where: {
                    related_by: userId,
                    type: "SPONSOR",
                    status: "PENDING",
                    user_id: null,
                },
            });

            if (!relation) {
                const token = uuidv4().slice(0, 8).toUpperCase();

                relation = await UserRelations.create({
                    related_by: userId,
                    user_id: null,
                    type: "SPONSOR",
                    status: "PENDING",
                    relation_token: token,
                    expires_at: null,
                });
            }

            return jsonResponse(res, 200, "Referral code generated", { referral_code: relation.relation_token });
        } catch (error) {
            console.error("Generate referral code error:", error);
            return jsonResponse(res, 500, "Referral code generation failed");
        }
    },
    checkReferralCode: async (req, res) => {
        try {
            const { referral_code } = req.params;

            if (!referral_code) {
                return jsonResponse(res, 400, "Invalid referral code");
            }

            const sponsorRelation = await UserRelations.findOne({
                where: {
                    relation_token: referral_code,
                    type: "SPONSOR",
                },
                include: {
                    model: Users,
                    as: "inviter",
                    attributes: ["id", "email"],
                },
            });

            if (!sponsorRelation) {
                return jsonResponse(res, 404, "Referral code not found");
            }

            return jsonResponse(res, 200, "Referral code valid", {
                inviter: {
                    id: sponsorRelation.inviter.id,
                    email: sponsorRelation.inviter.email,
                },
                referral_code: sponsorRelation.relation_token,
            });
        } catch (error) {
            console.error("CHECK_REFERRAL_CODE_ERROR", error);
            return jsonResponse(res, 500, "Check referral code error");
        }
    },
};