const db = require("../../models");
const { v4: uuidv4 } = require("uuid");

const { Users, Profiles, UserRelations } = db;

module.exports = {
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

            return res.status(200).json({
                error: false,
                message: "Success",
                data: {
                    sponsoredUsers,
                    sponsors,
                }
            });
        } catch (error) {
            console.error("getUserSponsorships error:", error);
            return res.status(500).json({ error: true, message: "Internal Server Error" });
        }
    },
    generateReferralCode: async (req, res) => {
        try {
            const { id: userId } = req.user;
            console.log("Generating referral code for user:", userId);

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

            return res.status(200).json({
                error: false,
                message: "Referral code generated",
                data: {
                    referral_code: relation.relation_token,
                }
            });
        } catch (error) {
            console.error("Generate referral code error:", error);
            return res.status(500).json({ error: true, message: "Referral code generation failed" });
        }
    },
    checkReferralCode: async (req, res) => {
        try {
            const { referral_code } = req.params;

            if (!referral_code) {
                return res.status(400).json({ error: true, message: "Invalid referral code" });
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

            if (!sponsorRelation || !sponsorRelation.inviter) {
                return res.status(404).json({ error: true, message: "Referral code not found" });
            }

            const filleuls = await UserRelations.findAll({
                where: {
                    related_by: sponsorRelation.inviter.id,
                    type: "SPONSOR",
                },
                include: {
                    model: Users,
                    as: "user",
                    attributes: ["id", "email"],
                },
            });

            const invitees = filleuls
                .filter((rel) => rel.user)
                .map((rel) => ({
                    id: rel.user.id,
                    email: rel.user.email,
                }));

            return res.status(200).json({
                error: false,
                message: "Referral code valid",
                data: {
                    inviter: {
                        id: sponsorRelation.inviter.id,
                        email: sponsorRelation.inviter.email,
                    },
                    referral_code: sponsorRelation.relation_token,
                    invitees,
                }
            });
        } catch (error) {
            console.error("CHECK_REFERRAL_CODE_ERROR", error);
            return res.status(500).json({ error: true, message: "Check referral code error" });
        }
    },
};