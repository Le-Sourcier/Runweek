const express = require("express");
const router = express.Router();
const { authorize } = require("../../middlewares/authMiddleware");
const ctr = require("../../controllers/components/friendsController");

// GET /api/friends - Récupérer la liste des amis
router
  .get("/", authorize, ctr.getFriends)

  // GET /api/friends/requests - Récupérer les demandes d'amis
  .get("/requests", authorize, ctr.getFriendRequests)

  // POST /api/friends/request - Envoyer une demande d'ami
  .post("/request", authorize, ctr.sendFriendRequest)

  // PUT /api/friends/requests/:id/accept - Accepter une demande d'ami
  .put("/requests/:id/accept", authorize, ctr.acceptFriendRequest)

  // PUT /api/friends/requests/:id/decline - Refuser une demande d'ami
  .put("/requests/:id/decline", authorize, ctr.declineFriendRequest)

  // DELETE /api/friends/:id - Supprimer un ami
  .delete("/:id", authorize, ctr.deleteFriend)

  // GET /api/friends/search - Rechercher des utilisateurs
  .get("/search", authorize, ctr.searchUsers)

  // GET /api/friends/conversations - Récupérer les conversations
  .get("/conversations", authorize, ctr.getConversations)

  // GET /api/friends/conversations/:id/messages - Récupérer les messages d'une conversation
  .get("/conversations/:id/messages", authorize, ctr.getConversationMessages)

  // POST /api/friends/:id/message - Envoyer un message à un ami
  .post("/:id/message", authorize, ctr.sendMessage)

  // GET /api/friends/activity-feed - Récupérer le feed d'activités des amis
  .get("/activity-feed", authorize, ctr.getActivityFeed)

  // POST /api/friends/share-activity - Partager une activité
  .post("/share-activity", authorize, ctr.shareActivity)

  // POST /api/friends/activity/:id/like - Liker une activité
  .post("/activity/:id/like", authorize, ctr.likeActivity)

  // POST /api/friends/activity/:id/comment - Commenter une activité
  .post("/activity/:id/comment", authorize, ctr.commentActivity)

  // POST /api/friends/report - Signaler un utilisateur
  .post("/report", authorize, ctr.reportUser)

  // GET /api/friends/stats - Statistiques des amis
  .get("/stats", authorize, ctr.getFriendsStats)

  // PUT /api/friends/:id/block - Bloquer un utilisateur
  .put("/:id/block", authorize, ctr.blockUser);

module.exports = router;
