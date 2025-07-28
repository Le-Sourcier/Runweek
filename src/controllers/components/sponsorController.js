// Refactored version of userController.js
const db = require("../../models");
const { v4: uuidv4 } = require("uuid");

const { Users, Profiles, UserRelations } = db;
const { serverMessage } = require("../../utils");

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
            const { id: userId } = req.user;
            console.log("Generating referral code for user:", userId);

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
    // checkReferralCode: async (req, res) => {
    //     try {
    //         const { referral_code } = req.params;

    //         if (!referral_code) {
    //             return serverMessage(res, "INVALID_REFERRAL_CODE");
    //         }

    //         const sponsorRelation = await UserRelations.findOne({
    //             where: {
    //                 relation_token: referral_code,
    //                 type: "SPONSOR",
    //             },
    //             include: {
    //                 model: Users,
    //                 as: "inviter",
    //                 attributes: ["id", "email"],
    //             },
    //         });

    //         if (!sponsorRelation) {
    //             return serverMessage(res, "REFERRAL_CODE_NOT_FOUND");
    //         }

    //         return serverMessage(res, "REFERRAL_CODE_VALID", {
    //             inviter: {
    //                 id: sponsorRelation.inviter.id,
    //                 email: sponsorRelation.inviter.email,
    //             },
    //             referral_code: sponsorRelation.relation_token,
    //         });
    //     } catch (error) {
    //         console.error("CHECK_REFERRAL_CODE_ERROR", error);
    //         return serverMessage(res, "CHECK_REFERRAL_CODE_ERROR");
    //     }
    // },
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

            if (!sponsorRelation || !sponsorRelation.inviter) {
                return serverMessage(res, "REFERRAL_CODE_NOT_FOUND");
            }

            const filleuls = await UserRelations.findAll({
                where: {
                    related_by: sponsorRelation.inviter.id,
                    type: "SPONSOR",
                },
                include: {
                    model: Users,
                    as: "user", //change to "invitee"
                    attributes: ["id", "email"],
                },
            });

            const invitees = filleuls
                .filter((rel) => rel.user)
                .map((rel) => ({
                    id: rel.user.id,
                    email: rel.user.email,
                }));

            return serverMessage(res, "REFERRAL_CODE_VALID", {
                inviter: {
                    id: sponsorRelation.inviter.id,
                    email: sponsorRelation.inviter.email,
                },
                referral_code: sponsorRelation.relation_token,
                invitees,
            });
        } catch (error) {
            console.error("CHECK_REFERRAL_CODE_ERROR", error);
            return serverMessage(res, "CHECK_REFERRAL_CODE_ERROR");
        }
    },
};
