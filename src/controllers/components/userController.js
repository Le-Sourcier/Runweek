// Refactored version of userController.js
const dayjs = require("dayjs");
const bcrypt = require("bcrypt");
const db = require("../../models");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");

const {
  Users,
  Profiles,
  Sessions,
  Plans,
  Subscriptions,
  Roles,
  UserRelations,
  Notifications,
  GoogleAuth,
  Lang,
} = db;
const sendMail = require("../../functions/components/sendMail");
const MailInvitationTemplate = require("../../../lib/MailInvitationTemplate");
const mailVerificationTemplate = require("../../../lib/mailVerificationTemplate");
const {
  serverMessage,
  isAdminOrSuperAdmin,
  generateRandomPassword,
  createNotification,
  getClientIp,
  getGeoLocation,
} = require("../../utils");
const PasswordResetTemplate = require("../../../lib/PasswordResetTemplate");

module.exports = {
  register: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { fname, lname, email, password } = req.body;

      // Vérifications de doublons
      if (await Users.findOne({ where: { email } }))
        return serverMessage(res, "ACCOUNT_ALREADY_EXISTS");

      // Création utilisateur
      const user = await Users.create({ email, password }, { transaction });

      // Création profil
      await Profiles.create(
        {
          user_id: user.id,
          fname,
          lname,
        },
        { transaction }
      );

      // Génère et sauvegarde le token de vérification
      const verificationToken = user.generateVerificationToken();
      user.token = verificationToken;
      await user.save({ transaction });

      await transaction.commit();

      // Email de vérification
      const link = `${process.env.ORIGINE_URL}/verify-mail?pk=${user.token}`;
      const html = mailVerificationTemplate(link);

      await sendMail({
        to: email,
        subject: `Hi ${fname}, Welcome!`,
        html,
      });

      return serverMessage(res, "ACCOUNT_CREATED");
    } catch (error) {
      await transaction.rollback();
      console.error("REGISTER_ERROR", error);
      return serverMessage(res, "REGISTER_ERROR");
    }
  },

  inviteMember: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id: admin_id } = req.user;
      const { fname, lname, phone, email, role, credit = 0 } = req.body;
      if (!fname || !lname || !email || !role) {
        return serverMessage(res, "REQUIRED_FIELDS_MISSING");
      }

      const existingUser = await Users.findOne({ where: { email } });
      if (existingUser) return serverMessage(res, "ACCOUNT_ALREADY_EXISTS");

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
        return serverMessage(res, "INSUFFICIENT_PERMISSIONS");

      const company = admin.profile?.company || null;
      const website = admin.profile?.website || null;
      const currentSubscription = admin?.subscriptions?.[0];
      const adminPlan = currentSubscription?.plan;

      if (!adminPlan) return serverMessage(res, "PLAN_NOT_FOUND");

      // Vérification du crédit disponible
      let adminAvailableCredit =
        admin.subscriptions?.[0]?.credit_allocated || 0;
      if (credit > adminAvailableCredit)
        return serverMessage(res, "NOT_ENOUGH_CREDIT", {
          available: adminAvailableCredit,
        });

      const password = generateRandomPassword();

      // Création du user
      const user = await Users.create(
        {
          email,
          password,
        },
        { transaction }
      );

      // Création du profil
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

      // Création du rôle
      const roleInstance = await Roles.create(
        {
          user_id: user.id,
          account_type: role || "USER",
        },
        { transaction }
      );

      // Lien de relation d'équipe
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

      // Vérification du crédit disponible
      adminAvailableCredit = currentSubscription?.credit_allocated || 0;
      if (credit > adminAvailableCredit)
        return serverMessage(res, "NOT_ENOUGH_CREDIT", {
          available: adminAvailableCredit,
        });

      // Mise à jour du crédit
      currentSubscription.credit_allocated = adminAvailableCredit - credit;
      await currentSubscription.save({ transaction });

      // Abonnement hérité du plan admin
      await Subscriptions.create(
        {
          user_id: user.id,
          plan_id: adminPlan.id,
          // billing_type: adminPlan.prices.billing_type,
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

      return serverMessage(res, "ACCOUNT_CREATED", {
        email,
        password,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("INVITE_MEMBER_ERROR:", error);
      return serverMessage(res, "INVITE_MEMBER_ERROR");
    }
  },

  login: async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;

      const user = await Users.findOne({
        where: { email },
        include: ["profile"],
      });

      if (!user) return serverMessage(res, "PROFILE_NOT_FOUND");

      if (!(await user.verifyPassword(password))) {
        return serverMessage(res, "INVALID_CREDENTIALS");
      }

      if (user.status !== "VERIFIED") {
        return serverMessage(res, `ACCOUNT_${user.status}`);
      }

      // Vérifie si une session active existe déjà
      const existingSession = await Sessions.findOne({
        where: {
          user_id: user.id,
          expires_at: {
            [Op.gt]: new Date(), // session non expirée
          },
        },
      });

      let refreshToken, accessToken;

      if (existingSession) {
        refreshToken = existingSession.token;
      } else {
        // Sinon, créer un nouveau refreshToken
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

      // Génère ou réutilise accessToken
      accessToken = accessToken || user.generateTokens().accessToken;

      // Update user plan
      const subc = await Subscriptions.findOne({
        where: { user_id: user.id, is_active: true },
        include: [{ model: Plans, as: "plan" }],
      });
      // user.role = "ADMIN";
      // subc.plan.name = "EXPERT";
      // subc.credit_allocated = 1800000600;

      // await user.save();
      // await subc.save();
      // await subc.plan.save();

      // Update le token de vérification (email) → accessToken actif
      user.token = accessToken;
      await user.save();

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: rememberMe
          ? 30 * 24 * 60 * 60 * 1000 // 30 jours
          : 7 * 24 * 60 * 60 * 1000, // 7 jours
      });

      return serverMessage(res, "LOGIN_SUCCESS", {
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error(error);
      return serverMessage(res, "LOGIN_ERROR");
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
              "address",
              "bio",
              "image",
              "lang",
            ],
          },
          {
            model: GoogleAuth,
            as: "googleAuth",
            attributes: ["id", "is_linked", "refresh_token"],
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
          {
            model: db.DataSharingPreferences,
            as: "dataSharingPreferences",
            attributes: [
              "enabled",
              "shareNutrition",
              "shareActivities",
              "shareGoals",
              "shareAchievements",
              "allowFriendRequests",
              "showInSearch",
            ],
          },
        ],
      });

      if (!user) return serverMessage(res, "PROFILE_NOT_FOUND");

      const subc = await Subscriptions.findOne({
        where: { user_id: user.id },
        include: [{ model: Plans, as: "plan" }],
      });

      // const subscription = user.subscriptions?.[0]; // s'il y a une seule active
      const planName = subc?.plan?.name || "FREE";
      const currentCredits = subc?.credit_allocated ?? 0;

      const prefData = user.dataSharingPreferences;

      // const langs = await Lang.findAll();

      // const avLangs = langs.map((lang) => {
      //   return {
      //     code: lang.code,
      //     name: lang.name,
      //     flag: lang.flag,
      //     enabled: lang.enabled,
      //   };
      // });

      // Preferences:
      const pref = {
        enabled: prefData.enabled,
        shareNutrition: prefData.shareNutrition,
        shareActivities: prefData.shareActivities,
        shareGoals: prefData.shareGoals,
        shareAchievements: prefData.shareAchievements,
        allowFriendRequests: prefData.allowFriendRequests,
        showInSearch: prefData.showInSearch,
      };

      const data = {
        id: user.id,
        email: user.email,
        role: user.role,

        // Profile info
        fname: user.profile?.fname,
        lname: user.profile?.lname,
        phone: user.profile?.phone,
        address: user.profile.address ?? null,
        image: user.profile?.image ?? null,
        lang: user.profile?.lang,
        bio: user.profile?.bio ?? null,

        socialAccounts: user.googleAuth && [
          {
            id: user.googleAuth.id,
            name: "google",
            connected: user.googleAuth.is_linked,
            refresh_token: user.googleAuth.refresh_token,
          },
        ],
        preferences: pref,
        // Date
        createdAt: user.createdAt,
      };

      return serverMessage(res, "SUCCESS", data);
    } catch (error) {
      console.error("getMe error:", error);
      return serverMessage(res);
    }
  },
  refresh: async (req, res) => {
    try {
      const token = req.body.refreshToken;
      if (!token) return serverMessage(res, "UNAUTHORIZED_ACCESS");

      // 1. Vérification du token JWT
      const { id } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

      // 2. Validation en base (Sessions)
      const session = await Sessions.findOne({ where: { token } });
      if (!session || dayjs(session.expires_at).isBefore(dayjs())) {
        return serverMessage(res, "TOKEN_EXPIRED");
      }

      // 3. Chargement de l'utilisateur
      const user = await Users.findByPk(id);
      if (!user) return serverMessage(res, "PROFILE_NOT_FOUND");

      // 4. Rotation des tokens
      const { accessToken, refreshToken: newRefreshToken } =
        user.generateTokens();

      // Mise à jour de la session
      session.token = newRefreshToken;
      session.expires_at = dayjs().add(7, "days").toDate(); // ou autre durée
      await session.save();

      // (optionnel) Réécriture du cookie
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return serverMessage(res, "SUCCESS", {
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.error("Refresh error:", error);
      return serverMessage(res, "TOKEN_INVALID");
    }
  },
  updateUser: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const userId = req.user?.id;
      if (!userId) return serverMessage(res, "UNAUTHORIZED", 401);

      const { fname, lname, phone, address, bio, lang } = req.body;

      const profile = await Profiles.findOne({
        where: { user_id: userId },
        transaction,
      });

      if (!profile) {
        await transaction.rollback();
        return serverMessage(res, "PROFILE_NOT_FOUND", 404);
      }

      const updatableFields = {
        fname,
        lname,
        phone,
        address,
        bio,
        lang,
      };

      Object.entries(updatableFields).forEach(([key, value]) => {
        if (req.body.hasOwnProperty(key)) {
          profile[key] = value;
        }
      });

      const user = await Users.findByPk(userId);

      await profile.save({ transaction });
      await transaction.commit();

      const data = {
        id: user.id,
        email: user.email,
        role: user.role,

        // Profile info
        fname: profile?.fname,
        lname: profile?.lname,
        phone: profile?.phone,
        address: profile.address ?? null,
        image: profile?.image ?? null,
        bio: profile?.bio ?? null,
        lang: profile?.lang,
        // Date
        createdAt: profile?.updatedAt,
      };

      return serverMessage(res, "PROFILE_UPDATED", data);
    } catch (error) {
      await transaction.rollback();
      console.error("Error updating profile:", error);
      return serverMessage(res, "INTERNAL_SERVER_ERROR", 500);
    }
  },

  updatePassword: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.user;
      const { oldPassword, newPassword } = req.body;

      const user = await Users.findByPk(id);
      if (!user || !(await user.verifyPassword(oldPassword)))
        return serverMessage(res, "OLD_PASSWORD_INVALID");

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save({ transaction });
      await transaction.commit();

      return serverMessage(res, "PASSWORD_RESET_SUCCESS");
    } catch (error) {
      await transaction.rollback();
      return serverMessage(res);
    }
  },

  verifyMail: async (req, res) => {
    // const transaction = await db.sequelize.transaction();

    try {
      const { token } = req.body;

      if (!token) {
        return serverMessage(res, "INVALID_OR_EXPIRED_TOKEN");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Users.findOne({
        where: { id: decoded.id },
        // transaction,
        include: ["profile"],
      });

      if (!user || user.status === "VERIFIED") {
        return serverMessage(res, "INVALID_OR_EXPIRED_TOKEN");
      }

      // Vérifie si token est trop vieux
      const lastUpdate = new Date(user.updatedAt).getTime();
      const isExpired = Date.now() - lastUpdate > 15 * 60 * 1000;
      if (isExpired) {
        return serverMessage(res, "INVALID_OR_EXPIRED_TOKEN", {
          email: user.email,
        });
      }

      // Validation de l’email
      user.status = "VERIFIED";
      user.token = null; // Désactivation du token de vérif

      await user.save();

      // await createNotification({
      //   user_id: user.id,
      //   type: "ACCOUNT_VALIDATED",
      //   content: `Félicitations ${user.profile.fname} ${user.profile.lname}, votre compte a été validé avec succès`,
      // });

      return serverMessage(res, "ACCOUNT_VALIDATED_SUCCESS");
    } catch (error) {
      console.log("ERROR IN MAIL VERIFICATION: ", error);

      if (["TokenExpiredError", "JsonWebTokenError"].includes(error.name)) {
        return serverMessage(res, "INVALID_OR_EXPIRED_TOKEN");
      }
      return serverMessage(res);
    }
  },
  resendMail: async (req, res) => {
    try {
      const { email } = req.body;

      // Vérifie que l'email est fourni
      if (!email || typeof email !== "string") {
        return serverMessage(res, "INVALID_EMAIL_FORMAT");
      }

      // Recherche de l'utilisateur
      const user = await Users.findOne({ where: { email } });

      if (!user) {
        return serverMessage(res, "ACCOUNT_NOT_FOUND");
      }

      // Si le compte est déjà vérifié
      if (user.status === "VERIFIED") {
        return serverMessage(res, "ACCOUNT_ALREADY_VERIFIED");
      }

      // 🔐 Génére un token de vérification temporaire (15 min)
      const token = user.generateVerificationToken();
      user.token = token;
      await user.save();

      // Récupère le profil pour personnaliser le message
      const profile = await Profiles.findOne({
        where: { user_id: user.id },
      });

      const fullName = profile?.fname || user.email.split("@")[0];

      const verificationUrl = `${process.env.ORIGINE_URL}/verify-mail?pk=${token}`;
      const html = mailVerificationTemplate(verificationUrl);

      // Envoie de l'email
      const result = await sendMail({
        to: email,
        subject: `👋 Hi ${fullName}, confirm your email`,
        html,
      });

      if (result?.accepted?.length) {
        return serverMessage(res, "EMAIL_SENDING_SUCCESS");
      } else {
        // console.error("Mail not accepted:", result);
        return serverMessage(res, "EMAIL_SENDING_FAILED");
      }
    } catch (error) {
      console.error("Error in resendMail:", error);
      return serverMessage(res, "EMAIL_SENDING_FAILED");
    }
  },

  getAvailableLang: async (req, res) => {
    try {
      const langs = await Lang.findAll();

      const data = langs.map((lang) => {
        return {
          code: lang.code,
          name: lang.name,
          flag: lang.flag,
          enabled: lang.enabled,
        };
      });
      return serverMessage(res, "SUCESS", data);
    } catch (error) {
      return serverMessage("ERROR_RETRIEVES_APP_LANGUAGES_CONFIG");
    }
  },

  verifyPasswordToken: async (req, res) => {
    try {
      const { token } = req.body;
      const user = await Users.findOne({ where: { reset_token: token } });
      if (!user || dayjs(user.reset_token_expires_at).isBefore(dayjs()))
        return serverMessage(res, "INVALID_OR_EXPIRED_TOKEN");

      const profile = await Profiles.findOne({
        where: { user_id: user.id },
      });
      return serverMessage(res, "NEXT_STEP", {
        firstName: profile?.fname,
      });
    } catch (error) {
      return serverMessage(res);
    }
  },
  forgetPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await Users.findOne({ where: { email } });
      if (!user) return serverMessage(res, "PROFILE_NOT_FOUND");

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
        subject: "Reset Your Password - RunWeek",
        text: rLink,
        html,
      });

      return result?.accepted?.length
        ? serverMessage(res, "EMAIL_SINDING_SUCCESS")
        : serverMessage(res, "EMAIL_SENDING_FAILED");
    } catch (error) {
      return serverMessage(res);
    }
  },

  resetPassword: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { token, password } = req.body;
      const user = await Users.findOne({ where: { reset_token: token } });

      if (!user) return serverMessage(res, "INVALID_OR_EXPIRED_TOKEN");
      else if (dayjs(user.reset_token_expires_at).isBefore(dayjs()))
        return serverMessage(res, "INVALID_OR_EXPIRED_TOKEN", {
          email: user.email,
        });

      Object.assign(user, {
        password: await bcrypt.hash(password, 10),
        reset_token: null,
        reset_token_expires_at: null,
      });
      await user.save({ transaction });
      await transaction.commit();

      return serverMessage(res, "PASSWORD_RECOVERED_SUCCESS");
    } catch (error) {
      await transaction.rollback();
      return serverMessage(res);
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
      if (!user) return serverMessage(res, "ACCOUNT_NOT_FOUND");

      // Supprimer manuellement les éléments liés à cause des contraintes de FK
      await Subscriptions.destroy({
        where: { user_id: id },
        transaction,
      });
      await Sessions.destroy({ where: { user_id: id }, transaction });
      await Profiles.destroy({ where: { user_id: id }, transaction });
      await Notifications.destroy({
        where: { user_id: id },
        transaction,
      });

      // Ensuite on peut supprimer l'utilisateur
      await user.destroy({ transaction });

      await transaction.commit();
      return serverMessage(res, "USER_DELETED");
    } catch (error) {
      console.error("ERROR during user deletion:", error);
      await transaction.rollback();
      return serverMessage(res);
    }
  },
  getAllUsers: async (req, res) => {
    try {
      const { id } = req.user;
      if (!id) return serverMessage(res, "ACCESS_DENIED");

      const currentUser = await Users.findByPk(id);
      if (!isAdminOrSuperAdmin(currentUser)) {
        return serverMessage(res, "INSUFFICIENT_PERMISSIONS");
      }
      const users = await Users.findAll({
        include: ["profile"],
      });

      if (!users || users.length === 0)
        return serverMessage(res, "RECORDED_USERS_NOT_FOUND");

      const formatted = users.map((user) => {
        return {
          id: user.id,
          email: user.email,
          role: user.role,

          // Profile info
          fname: user.profile?.fname,
          lname: user.profile?.lname,
          phone: user.profile?.phone,
          address: user.profile?.address ?? null,
          image: user.profile?.image ?? null,
          bio: user.profile?.bio ?? null,

          // Date
          updatedAt: user.updatedAt,
          createdAt: user.createdAt,
        };
      });

      return serverMessage(res, "SUCCESS", formatted);
    } catch (error) {
      console.error("getAllUsers error:", error);
      return serverMessage(res);
    }
  },
  getUserWithDetails: async (req, res) => {
    try {
      const { id } = req.user;
      if (!id) return serverMessage(res, "ACCESS_DENIED");

      const currentUser = await Users.findByPk(id);
      if (!isAdminOrSuperAdmin(currentUser)) {
        return serverMessage(res, "INSUFFICIENT_PERMISSIONS");
      }
      const user = await Users.findByPk(req.params.id, {
        include: ["profile"],
      });

      if (!user) return serverMessage(res, "ACCOUNT_NOT_FOUND");

      const formatted = {
        id: user.id,
        email: user.email,
        role: user.role,

        // Profile info
        fname: user.profile?.fname,
        lname: user.profile?.lname,
        phone: user.profile?.phone,
        address: user.profile?.address ?? null,
        image: user.profile?.image ?? null,
        bio: user.profile?.bio ?? null,

        // Date
        updatedAt: user.updatedAt,
        createdAt: user.createdAt,
      };

      return serverMessage(res, "SUCCESS", formatted);
    } catch (error) {
      console.error("getAllUsers error:", error);
      return serverMessage(res);
    }
  },
  getAllSessions: async (req, res) => {
    try {
      const { id } = req.user;

      const sessions = await Sessions.findAll({
        where: { user_id: id },
      });

      if (!sessions || sessions.length === 0)
        return serverMessage(res, "NO_SESSIONS_FOUNDED");

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

      return serverMessage(res, "SUCCESS", formatted);
    } catch (error) {
      console.error("getAllSessions error:", error);
      return serverMessage(res);
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

      return serverMessage(res, "SUCCESS", {
        sponsoredUsers,
        sponsors,
      });
    } catch (error) {
      console.error("getUserSponsorships error:", error);
      return serverMessage(res);
    }
  },
  generateReferralCode: async (req, res) => {
    try {
      const userId = req.user.id;

      // Chercher s'il existe déjà un code de parrainage actif pour cet utilisateur
      let relation = await UserRelations.findOne({
        where: {
          related_by: userId,
          type: "SPONSOR",
          status: "PENDING",
          user_id: null,
        },
      });

      // Si aucun, créer un nouveau token
      if (!relation) {
        const token = uuidv4().slice(0, 8).toUpperCase(); // ex : 'A1B2C3D4'

        relation = await UserRelations.create({
          related_by: userId,
          user_id: null,
          type: "SPONSOR",
          status: "PENDING",
          relation_token: token,
          expires_at: null, // ou une date d'expiration si souhaité
        });
      }

      return serverMessage(res, "REFERRAL_CODE_GENERATED", {
        referral_code: relation.relation_token,
      });
    } catch (error) {
      console.error("Generate referral code error:", error);
      return serverMessage(res, "REFERRAL_CODE_GENERATION_FAILED");
    }
  },
  checkReferralCode: async (req, res) => {
    try {
      const { referral_code } = req.params;

      if (!referral_code) {
        return serverMessage(res, "INVALID_REFERRAL_CODE");
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
        return serverMessage(res, "REFERRAL_CODE_NOT_FOUND");
      }

      return serverMessage(res, "REFERRAL_CODE_VALID", {
        inviter: {
          id: sponsorRelation.inviter.id,
          email: sponsorRelation.inviter.email,
        },
        referral_code: sponsorRelation.relation_token,
      });
    } catch (error) {
      console.error("CHECK_REFERRAL_CODE_ERROR", error);
      return serverMessage(res, "CHECK_REFERRAL_CODE_ERROR");
    }
  },

  // Initialisation de l'authentification Google
  initiateGoogleAuth: (req, res) => {
    try {
      // Construire l'URL d'authentification Google manuellement
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(
        {
          client_id: process.env.GOOGLE_CLIENT_ID,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          response_type: "code",
          scope: [
            "profile",
            "email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/fitness.activity.read",
            "https://www.googleapis.com/auth/fitness.heart_rate.read",
            "https://www.googleapis.com/auth/fitness.sleep.read",
            "https://www.googleapis.com/auth/fitness.location.read",
            "openid",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
          include_granted_scopes: "true",
        }
      ).toString()}`;

      res.redirect(authUrl);
    } catch (error) {
      console.error("Google auth initiation error:", error.message);
      return serverMessage(res, "GOOGLE_AUTH_INITIATION_FAILED");
    }
  },

  // Échanger le code Google contre des tokens
  exchangeGoogleCode: async (req, res) => {
    try {
      const { code } = req.body;

      if (!code) {
        return serverMessage(res, "GOOGLE_AUTH_CODE_REQUIRED");
      }

      // Initialiser le client OAuth2 Google
      const oAuth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      let tokenResponse;
      try {
        tokenResponse = await oAuth2Client.getToken({
          code: code,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        });
      } catch (error) {
        const err = error.response?.data.error;
        if (err) {
          return serverMessage(res, "INVALID_GOOGLE_GRANT");
        }
        console.error("Token exchange error details:", error.response?.data);
        return serverMessage(res, "INVALID_GOOGLE_AUTH_CODE");
      }

      const { tokens } = tokenResponse;

      // Vérifier le token ID pour obtenir les infos utilisateur
      const ticket = await oAuth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const googleId = payload.sub;
      const email = payload.email;

      // Chercher l'utilisateur par Google ID ou email
      let user = await Users.findOne({
        where: { email },
        include: [
          { model: Profiles, as: "profile" },
          { model: GoogleAuth, as: "googleAuth" },
        ],
      });

      // Si l'utilisateur n'existe pas, le créer
      if (!user) {
        const transaction = await db.sequelize.transaction();

        try {
          // Générer un mot de passe aléatoire
          const randomPassword = require("crypto")
            .randomBytes(16)
            .toString("hex");
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          // Créer l'utilisateur
          user = await Users.create(
            {
              email: email,
              password: hashedPassword,
              status: "VERIFIED",
            },
            { transaction }
          );

          // Créer le profil
          await Profiles.create(
            {
              user_id: user.id,
              fname: payload.given_name || "",
              lname: payload.family_name || "",
              image: payload.picture || null,
            },
            { transaction }
          );

          // Créer l'enregistrement GoogleAuth
          await GoogleAuth.create(
            {
              user_id: user.id,
              google_id: googleId,
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              token_expiry: tokens.expiry_date
                ? new Date(tokens.expiry_date)
                : new Date(Date.now() + 3500 * 1000),
              scopes: tokens.scope || "",
              is_linked: true,
              last_sync: new Date(),
            },
            { transaction }
          );

          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          console.error("Error creating user:", error.message);
          return serverMessage(res, "USER_CREATION_FAILED");
        }
      } else {
        // Mettre à jour les tokens Google pour l'utilisateur existant
        await GoogleAuth.upsert({
          user_id: user.id,
          google_id: googleId,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : new Date(Date.now() + 3500 * 1000),
          scopes: tokens.scope || "",
          is_linked: true,
          last_sync: new Date(),
        });
      }

      const { accessToken, refreshToken } = user.generateTokens();
      // Créer ou mettre à jour la session
      const expiresAt = dayjs().add(7, "days").toDate();
      const ip = getClientIp(req);

      await Sessions.upsert({
        user_id: user.id,
        token: refreshToken,
        expires_at: expiresAt,
        ip_address: ip,
        user_agent: req.headers["user-agent"],
      });

      // Mettre à jour le token de l'utilisateur
      await Users.update({ token: accessToken }, { where: { id: user.id } });

      return serverMessage(res, "LOGIN_SUCCESS", {
        accessToken,
        refreshToken,
      });
    } catch (error) {
      // console.error("Google code exchange error:", error);
      // return serverMessage(res, "GOOGLE_AUTH_EXCHANGE_FAILED");

      console.error("Google code exchange error:", error);

      // Gestion plus spécifique des erreurs
      if (error.message.includes("invalid_grant")) {
        return serverMessage(res, "GOOGLE_AUTH_CODE_EXPIRED");
      }
      if (error.message.includes("invalid_client")) {
        return serverMessage(res, "GOOGLE_CLIENT_CONFIG_ERROR");
      }

      return serverMessage(res, "GOOGLE_AUTH_EXCHANGE_FAILED");
    }
  },

  // Modifiez le callback pour juste rediriger avec le code
  handleGoogleCallback: async (req, res, next) => {
    passport.authenticate(
      "google",
      { session: false },
      async (err, user, info) => {
        try {
          if (err) {
            console.error("Google auth error:", err);
            const frontendUrl =
              process.env.NODE_ENV !== "production"
                ? process.env.FRONTEND_URL_DEV
                : process.env.FRONTEND_URL;
            return res.redirect(`${frontendUrl}/login?error=auth_failed`);
          }

          // Rediriger vers le frontend avec le code d'autorisation
          const frontendUrl =
            process.env.NODE_ENV !== "production"
              ? process.env.FRONTEND_URL_DEV
              : process.env.FRONTEND_URL;

          frontendUrl = "http://localhost:5173";

          if (req.query.code) {
            res.redirect(
              `${frontendUrl}/auth/google/callback?code=${req.query.code}`
            );
          } else {
            res.redirect(`${frontendUrl}/login?error=no_code`);
          }
        } catch (error) {
          console.error("Error in Google callback:", error);
          const frontendUrl =
            process.env.NODE_ENV !== "production"
              ? process.env.FRONTEND_URL_DEV
              : process.env.FRONTEND_URL;
          res.redirect(`${frontendUrl}/login?error=auth_failed`);
        }
      }
    )(req, res, next);
  },
  // Link an existing user account with Google
  linkGoogleAccount: async (req, res) => {
    try {
      const { code } = req.body; // ← Recevoir le code d'autorisation, pas un token
      const userId = req.user.id;

      if (!code) {
        return serverMessage(res, "GOOGLE_AUTH_CODE_REQUIRED");
      }

      // Initialiser le client OAuth2 Google
      const oAuth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || "postmessage" // Pour les flows sans redirection
      );

      // Échanger le code contre les tokens
      let tokens;
      try {
        const { tokens: googleTokens } = await oAuth2Client.getToken(code);
        tokens = googleTokens;
      } catch (error) {
        console.error("Google token exchange error:", error);
        return serverMessage(res, "INVALID_GOOGLE_AUTH_CODE");
      }

      if (!tokens.access_token || !tokens.id_token) {
        return serverMessage(res, "GOOGLE_TOKEN_EXCHANGE_FAILED");
      }

      // Vérifier le token ID Google pour obtenir les infos utilisateur
      let payload;
      try {
        const ticket = await oAuth2Client.verifyIdToken({
          idToken: tokens.id_token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (error) {
        console.error("Google token verification error:", error);
        return serverMessage(res, "INVALID_GOOGLE_TOKEN");
      }

      // Vérifier que l'email Google correspond à l'email de l'utilisateur connecté
      const user = await Users.findByPk(userId);
      if (user.email !== payload.email) {
        return serverMessage(res, "GOOGLE_EMAIL_MISMATCH");
      }

      // Chercher ou créer l'enregistrement GoogleAuth
      const [googleAuth, created] = await GoogleAuth.findOrCreate({
        where: { user_id: userId },
        defaults: {
          user_id: userId,
          google_id: payload.sub,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null, // refresh_token peut être null
          token_expiry: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : new Date(Date.now() + 3500 * 1000),
          scopes: tokens.scope || "",
          is_linked: true,
          last_sync: new Date(),
        },
      });

      if (!created) {
        // Vérifier si le compte Google est déjà lié
        if (googleAuth.is_linked) {
          return serverMessage(res, "GOOGLE_ACCOUNT_ALREADY_LINKED");
        }

        // Mettre à jour avec les nouveaux tokens
        await GoogleAuth.update(
          {
            google_id: payload.sub,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || googleAuth.refresh_token, // Garder l'ancien si nouveau null
            token_expiry: tokens.expiry_date
              ? new Date(tokens.expiry_date)
              : new Date(Date.now() + 3500 * 1000),
            scopes: tokens.scope || googleAuth.scopes,
            is_linked: true,
            last_sync: new Date(),
          },
          { where: { user_id: userId } }
        );
      }

      return serverMessage(res, "GOOGLE_ACCOUNT_LINKED", {
        googleLinked: true,
        email: user.email,
        hasRefreshToken: !!tokens.refresh_token,
      });
    } catch (error) {
      console.error("Error linking Google account:", error);
      return serverMessage(res, "GOOGLE_LINK_FAILED");
    }
  },
  // Unlink un compte Google d'un utilisateur
  unlinkGoogleAccount: async (req, res) => {
    try {
      const userId = req.user.id;

      // Vérifier si l'utilisateur existe
      const user = await Users.findByPk(userId, {
        include: {
          model: GoogleAuth,
          as: "googleAuth",
          attributes: [
            "is_linked",
            "google_id",
            "refresh_token",
            "access_token",
            "scopes",
          ],
        },
      });
      if (!user) {
        return serverMessage(res, "USER_NOT_FOUND");
      }

      // Vérifier si le compte Google est déjà lié
      if (!user.googleAuth.is_linked) {
        return serverMessage(res, "GOOGLE_ACCOUNT_NOT_LINKED");
      }

      // Dé-lier le compte Google
      await GoogleAuth.update(
        {
          is_linked: false,
          google_id: null,
          refresh_token: null,
          access_token: null,
          scopes: null,
          expires_at: null, // Optionnel
        },
        { where: { user_id: userId } }
      );

      return serverMessage(res, "GOOGLE_ACCOUNT_UNLINKED", {
        googleLinked: false,
        email: user.email,
      });
    } catch (error) {
      console.error("Error unlinking Google account:", error);
      return serverMessage(res, "GOOGLE_UNLINK_FAILED");
    }
  },
  // Deconnect an existing Google account
  disconnectGoogle: async (req, res) => {
    try {
      const userId = req.user.id;

      // Trouver l'utilisateur
      const user = await Users.findByPk(userId, {
        include: {
          model: GoogleAuth,
          as: "googleAuth",
          attributes: ["is_linked", "refresh_token", "access_token"],
        },
      });

      if (!user.googleAuth.is_linked) {
        return serverMessage(res, "NO_GOOGLE_ACCOUNT_LINKED");
      }

      // Révoquer l'accès Google (si nous avons stocké le refresh token)
      // Note: Cette étape nécessite que vous ayez stocké le refresh_token Google
      if (user.googleAuth.refresh_token) {
        try {
          await axios.post(
            "https://oauth2.googleapis.com/revoke",
            {
              token: user.googleAuth.refresh_token,
            },
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );
        } catch (revokeError) {
          console.warn(
            "Google revoke error (may be normal if token already expired):",
            revokeError.message
          );
        }
      }

      // Mettre à jour l'utilisateur pour indiquer que Google n'est plus lié
      await GoogleAuth.update(
        {
          is_linked: false,
          google_id: null,
          refresh_token: null,
          access_token: null,
          scopes: null,
          expires_at: null, // Optionnel
        },
        { where: { user_id: userId } }
      );
      return serverMessage(res, "GOOGLE_ACCOUNT_DISCONNECTED");
    } catch (error) {
      console.error("Error disconnecting Google account:", error);
      return serverMessage(res, "GOOGLE_DISCONNECT_FAILED");
    }
  },
};
