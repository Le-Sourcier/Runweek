const express = require("express");
const router = express.Router();
const askAI = require("../../services/askAI");
const db = require("../../models");
const ctr = require("./../../controllers/components/chatController");

/**
 * @openapi
 * components:
 *   schemas:
 *     MessageCoachIA:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Identifiant unique du message
 *         type:
 *           type: string
 *           enum: [text, recommandation, conseil]
 *           description: |
 *             Type de message :
 *             - text : Échange texte simple
 *             - recommandation : Recommandation personnalisée
 *             - conseil : Conseil d'entraînement
 *         message:
 *           type: string
 *           description: Contenu du message
 *         sender:
 *           type: string
 *           enum: [bot, user]
 *           description: Expéditeur du message
 *       required:
 *         - type
 *         - message
 *         - sender
 */
/**
 * @openapi
 * /api/aicoach:
 *   post:
 *     tags:
 *       - Coach IA
 *     summary: Obtenir des conseils du coach IA
 *     description: >
 *       Envoie un message au coach IA et reçoit une réponse standardisée.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Question ou message de l'utilisateur pour le coach.
 *                 example: "Comment améliorer mon rythme de course pour un 10 km ?"
 *     responses:
 *       200:
 *         description: Réponse du coach IA au format standardisé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "SUCCESS"
 *                 data:
 *                   $ref: '#/components/schemas/MessageCoachIA'
 */
router
  .post("/", ctr.sendMessage)

  /**
   * @openapi
   * /api/aicoach/workouts:
   *   post:
   *     tags:
   *       - Coach IA
   *     summary: Obtenir des suggestions d'entraînement personnalisées
   *     description: >
   *       Retourne des suggestions d'entraînement au format message standardisé.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Liste de suggestions d'entraînement sous forme de messages standardisés.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "SUCCESS"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/MessageCoachIA'
   */
  .post("/workouts", ctr.workOut)
  /**
   * @openapi
   * /api/aicoach/running-plan:
   *   post:
   *     tags:
   *       - Coach IA
   *     summary: Générer un plan de course hebdomadaire
   *     description: >
   *       Retourne un plan de course sous forme de messages conseils standardisés.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - goal
   *               - level
   *             properties:
   *               goal:
   *                 type: string
   *                 example: "Préparer un 10km"
   *               level:
   *                 type: string
   *                 enum: [débutant, intermédiaire, avancé]
   *                 example: "intermédiaire"
   *     responses:
   *       200:
   *         description: Plan de course généré sous forme de messages standardisés.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "SUCCESS"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/MessageCoachIA'
   */
  .post("/running-plan", ctr.runningPlan)

  /**
   * @openapi
   * /api/aicoach/recommendations:
   *   post:
   *     tags:
   *       - Coach IA
   *     summary: Obtenir des recommandations personnalisées
   *     description: >
   *       Retourne des recommandations au format message standardisé.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Liste de recommandations sous forme de messages standardisés.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "SUCCESS"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/MessageCoachIA'
   */
  .post("/recommendations", ctr.recommandation)

  /**
   * @openapi
   * components:
   *   securitySchemes:
   *     bearerAuth:
   *       type: http
   *       scheme: bearer
   *       bearerFormat: JWT
   *   schemas:
   *     MessageCoachIA:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *           example: 12
   *         type:
   *           type: string
   *           description: Type de message (texte, image, audio, etc.)
   *           example: "text"
   *         message:
   *           type: string
   *           description: Contenu du message
   *           example: "Bonjour, comment puis-je vous aider aujourd'hui ?"
   *         sender:
   *           type: string
   *           description: Expéditeur du message (user ou coach)
   *           example: "bot"
   *         metadata:
   *           type: object
   *           description: Métadonnées associées au message
   *           example:
   *             sentiment: "positif"
   *             confidence: 0.92
   *
   * /api/aicoach/history:
   *   get:
   *     tags:
   *       - Coach IA
   *     summary: Récupérer l'historique des chats avec le coach IA
   *     description: >
   *       Retourne l'historique complet des messages échangés avec le coach IA pour l'utilisateur authentifié.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Historique des messages du coach IA.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 status:
   *                   type: integer
   *                   example: 200
   *                 message:
   *                   type: string
   *                   example: "SUCCESS"
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/MessageCoachIA'
   *       401:
   *         description: Non autorisé. L'utilisateur doit fournir un token JWT valide.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 401
   *                 message:
   *                   type: string
   *                   example: "UNAUTHORIZED"
   *       500:
   *         description: Erreur interne du serveur.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: true
   *                 status:
   *                   type: integer
   *                   example: 500
   *                 message:
   *                   type: string
   *                   example: "INTERNAL_SERVER_ERROR"
   *                 data:
   *                   type: object
   *                   example:
   *                     error: "Erreur interne lors de la récupération de l'historique du chat."
   */
  .get("/history", ctr.getChatMessage);

module.exports = router;
