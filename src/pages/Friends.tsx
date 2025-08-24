// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import { useFriends } from "../context/FriendsContext";
// import FriendCard from "../components/friends/FriendCard";
// import FriendRequestCard from "../components/friends/FriendRequestCard";
// import ActivityFeed from "../components/friends/ActivityFeed";
// import UserSearchResults from "../components/friends/UserSearchResults";
// import FriendsStats from "../components/friends/FriendsStats";
// import FriendProfileModal from "../components/friends/FriendProfileModal";
// import AddFriendModal from "../components/friends/AddFriendModal";
// import CommentModal from "../components/friends/CommentModal";
// import MessageModal from "../components/friends/MessageModal";
// import ReportUserModal from "../components/friends/ReportUserModal";
// import ConversationModal from "../components/friends/ConversationModal";
// import Card from "../components/ui/Card";
// import Input from "../components/ui/Input";
// import Badge from "../components/ui/Badge";
// import { UserPlus, Search, Filter, Users } from "lucide-react";
// import { AnimatePresence, motion } from "framer-motion";
// import { Friend } from "../types/friends";
// import { useFriendsStore } from "../stores/friends";

// const Friends: React.FC = () => {
//   // const {
//   //   friends,
//   //   friendRequests,
//   //   sentRequests,
//   //   friendActivities,
//   //   friendsStats,
//   //   searchResults,
//   //   isSearching,
//   //   sendFriendRequest,
//   //   acceptFriendRequest,
//   //   declineFriendRequest,
//   //   removeFriend,
//   //   searchUsers,
//   //   clearSearchResults,
//   //   blockUser,
//   //   reportUser,
//   // } = useFriends();

//   const {
//     friends,
//     friendRequests,
//     sentRequests,
//     friendActivities,
//     friendsStats,
//     searchResults,
//     isSearching,
//     sendFriendRequest,
//     acceptFriendRequest,
//     declineFriendRequest,
//     removeFriend,
//     searchUsers,
//     clearSearchResults,
//     blockUser,
//     reportUser,
//   } = useFriendsStore();

//   const [activeTab, setActiveTab] = useState<
//     "friends" | "requests" | "discover" | "activity"
//   >("friends");
//   const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
//   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
//   const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [likedActivities, setLikedActivities] = useState<Set<string>>(
//     new Set()
//   );
//   const [activityComments, setActivityComments] = useState<Map<string, number>>(
//     new Map()
//   );
//   const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
//   const [selectedActivityForComment, setSelectedActivityForComment] = useState<{
//     id: string;
//     friendName: string;
//   } | null>(null);
//   const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
//   const [isReportModalOpen, setIsReportModalOpen] = useState(false);
//   const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
//   const [selectedFriendForAction, setSelectedFriendForAction] =
//     useState<Friend | null>(null);
//   const [friendsFilter, setFriendsFilter] = useState<
//     "all" | "online" | "offline"
//   >("all");
//   const [sortBy, setSortBy] = useState<"name" | "lastActivity" | "level">(
//     "name"
//   );

//   // Load initial data from localStorage
//   React.useEffect(() => {
//     // Load liked activities
//     const likes = JSON.parse(
//       localStorage.getItem("runweek_activity_likes") || "{}"
//     );
//     setLikedActivities(new Set(Object.keys(likes)));

//     // Load activity comments count
//     const comments = JSON.parse(
//       localStorage.getItem("runweek_activity_comments") || "{}"
//     );
//     const commentsMap = new Map();
//     Object.entries(comments).forEach(
//       ([activityId, commentsList]: [string, any]) => {
//         commentsMap.set(activityId, commentsList.length);
//       }
//     );
//     setActivityComments(commentsMap);
//   }, []);

//   const handleSendFriendRequest = async (email: string, message?: string) => {
//     return await sendFriendRequest(email, message);
//   };

//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//     if (query.trim()) {
//       searchUsers(query);
//     } else {
//       clearSearchResults();
//     }
//   };

//   const handleViewProfile = (friend: Friend) => {
//     setSelectedFriend(friend);
//     setIsProfileModalOpen(true);
//   };

//   const handleSendMessage = (friendId: string) => {
//     const friend = friends.find((f) => f.id === friendId);
//     if (friend) {
//       setSelectedFriendForAction(friend);
//       setIsConversationModalOpen(true);
//     }
//   };

//   const handleShareActivity = (activityId: string) => {
//     const activity = friendActivities.find((a) => a.id === activityId);
//     if (!activity) return;

//     // Créer le contenu à partager
//     const shareContent = {
//       title: `${activity.friend.name} - ${activity.title}`,
//       text: `${activity.description}\n\nVia Runweek`,
//       url: `${window.location.origin}/activity/${activityId}`,
//     };

//     // Sauvegarder l'activité partagée
//     const sharedActivities = JSON.parse(
//       localStorage.getItem("runweek_shared_activities") || "[]"
//     );
//     const sharedActivity = {
//       id: `shared_${Date.now()}`,
//       originalActivityId: activityId,
//       sharedBy: "current_user",
//       sharedAt: new Date().toISOString(),
//       activity: activity,
//       shareContent: shareContent,
//     };
//     sharedActivities.push(sharedActivity);
//     localStorage.setItem(
//       "runweek_shared_activities",
//       JSON.stringify(sharedActivities)
//     );

//     // Essayer l'API Web Share native d'abord
//     if (
//       navigator.share &&
//       navigator.canShare &&
//       navigator.canShare(shareContent)
//     ) {
//       navigator
//         .share(shareContent)
//         .then(() => {
//           toast.success("Activité partagée avec succès !");
//         })
//         .catch((error) => {
//           console.error("Erreur lors du partage:", error);
//           // Fallback vers le presse-papiers
//           fallbackToClipboard(shareContent);
//         });
//     } else {
//       // Fallback vers le presse-papiers
//       fallbackToClipboard(shareContent);
//     }
//   };

//   const fallbackToClipboard = (shareContent: any) => {
//     const shareText = `${shareContent.title}\n${shareContent.text}\n${shareContent.url}`;

//     if (navigator.clipboard && navigator.clipboard.writeText) {
//       navigator.clipboard
//         .writeText(shareText)
//         .then(() => {
//           toast.success("Lien copié dans le presse-papiers !");
//         })
//         .catch(() => {
//           // Fallback ultime
//           fallbackCopyMethod(shareText);
//         });
//     } else {
//       fallbackCopyMethod(shareText);
//     }
//   };

//   const fallbackCopyMethod = (text: string) => {
//     // Méthode de fallback pour les navigateurs plus anciens
//     const textArea = document.createElement("textarea");
//     textArea.value = text;
//     textArea.style.position = "fixed";
//     textArea.style.left = "-999999px";
//     textArea.style.top = "-999999px";
//     document.body.appendChild(textArea);
//     textArea.focus();
//     textArea.select();

//     try {
//       const successful = document.execCommand("copy");
//       if (successful) {
//         toast.success("Lien copié dans le presse-papiers !");
//       } else {
//         toast.error("Impossible de copier le lien");
//       }
//     } catch (err) {
//       toast.error("Partage non supporté par ce navigateur");
//     } finally {
//       document.body.removeChild(textArea);
//     }
//   };

//   const handleLikeActivity = (activityId: string) => {
//     const activity = friendActivities.find((a) => a.id === activityId);
//     if (!activity) return;

//     setLikedActivities((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(activityId)) {
//         newSet.delete(activityId);
//       } else {
//         newSet.add(activityId);

//         // Create a notification for the friend
//         const notifications = JSON.parse(
//           localStorage.getItem("runweek_friend_notifications") || "[]"
//         );
//         const notification = {
//           id: `notif_${Date.now()}`,
//           type: "like",
//           fromUserId: "current_user",
//           toUserId: activity.friend.id,
//           activityId: activityId,
//           message: `a aimé votre ${
//             activity.type === "run" ? "course" : "activité"
//           }`,
//           timestamp: new Date().toISOString(),
//           read: false,
//         };

//         notifications.push(notification);
//         localStorage.setItem(
//           "runweek_friend_notifications",
//           JSON.stringify(notifications)
//         );
//       }
//       return newSet;
//     });

//     // Store likes in localStorage
//     const likes = JSON.parse(
//       localStorage.getItem("runweek_activity_likes") || "{}"
//     );
//     if (likedActivities.has(activityId)) {
//       delete likes[activityId];
//     } else {
//       likes[activityId] = {
//         userId: "current_user",
//         timestamp: new Date().toISOString(),
//       };
//     }
//     localStorage.setItem("runweek_activity_likes", JSON.stringify(likes));
//   };

//   const handleCommentActivity = (activityId: string, friendName: string) => {
//     setSelectedActivityForComment({ id: activityId, friendName });
//     setIsCommentModalOpen(true);
//   };

//   const handleRealSendMessage = (friendId: string, messageText: string) => {
//     const conversations = JSON.parse(
//       localStorage.getItem("runweek_conversations") || "[]"
//     );
//     const conversation = conversations.find((conv: any) =>
//       conv.participants.includes(friendId)
//     );

//     if (conversation) {
//       const newMessage = {
//         id: `msg_${Date.now()}`,
//         senderId: "current_user",
//         text: messageText,
//         timestamp: new Date().toISOString(),
//         read: false,
//       };

//       conversation.messages.push(newMessage);
//       conversation.lastMessage = newMessage;
//       conversation.updatedAt = new Date().toISOString();

//       localStorage.setItem(
//         "runweek_conversations",
//         JSON.stringify(conversations)
//       );
//       toast.success(`Message envoyé !`);
//     }
//   };

//   const handleReportUser = (
//     userId: string,
//     reason: string,
//     details: string,
//     severity: "low" | "medium" | "high"
//   ) => {
//     const reports = JSON.parse(
//       localStorage.getItem("runweek_user_reports") || "[]"
//     );
//     const user =
//       friends.find((f) => f.id === userId) ||
//       searchResults.find((u) => u.id === userId);

//     if (user) {
//       const newReport = {
//         id: `report_${Date.now()}`,
//         reportedUserId: userId,
//         reportedUserName: user.name,
//         reportedUserEmail: user.email,
//         reason,
//         details,
//         severity,
//         timestamp: new Date().toISOString(),
//         status: "pending",
//         reviewedBy: null,
//         reviewedAt: null,
//         action: null,
//       };

//       reports.push(newReport);
//       localStorage.setItem("runweek_user_reports", JSON.stringify(reports));

//       // Actions automatiques selon la gravité
//       if (severity === "high") {
//         // Retirer automatiquement de la liste d'amis pour les cas graves
//         removeFriend(userId);

//         // Ajouter à la liste des utilisateurs bloqués
//         const blockedUsers = JSON.parse(
//           localStorage.getItem("runweek_blocked_users") || "[]"
//         );
//         blockedUsers.push({
//           id: userId,
//           name: user.name,
//           email: user.email,
//           blockedAt: new Date().toISOString(),
//           reason: "Signalement grave automatique",
//         });
//         localStorage.setItem(
//           "runweek_blocked_users",
//           JSON.stringify(blockedUsers)
//         );
//       }

//       toast.success(
//         `${user.name} a été signalé. Notre équipe examinera le rapport dans les 24h.`
//       );
//     }
//   };

//   const handleSubmitComment = (commentText: string) => {
//     if (!selectedActivityForComment) return;

//     const activity = friendActivities.find(
//       (a) => a.id === selectedActivityForComment.id
//     );
//     if (!activity) return;

//     // Store comment in localStorage
//     const comments = JSON.parse(
//       localStorage.getItem("runweek_activity_comments") || "{}"
//     );
//     if (!comments[selectedActivityForComment.id]) {
//       comments[selectedActivityForComment.id] = [];
//     }

//     const newComment = {
//       id: `comment_${Date.now()}`,
//       activityId: selectedActivityForComment.id,
//       userId: "current_user",
//       userName: "Vous",
//       text: commentText,
//       timestamp: new Date().toISOString(),
//     };

//     comments[selectedActivityForComment.id].push(newComment);
//     localStorage.setItem("runweek_activity_comments", JSON.stringify(comments));

//     // Update local state
//     setActivityComments((prev) => {
//       const newMap = new Map(prev);
//       const currentCount = newMap.get(selectedActivityForComment.id) || 0;
//       newMap.set(selectedActivityForComment.id, currentCount + 1);
//       return newMap;
//     });

//     // Create notification for the friend
//     const notifications = JSON.parse(
//       localStorage.getItem("runweek_friend_notifications") || "[]"
//     );
//     const notification = {
//       id: `notif_${Date.now()}`,
//       type: "comment",
//       fromUserId: "current_user",
//       toUserId: activity.friend.id,
//       activityId: selectedActivityForComment.id,
//       message: `a commenté votre ${
//         activity.type === "run" ? "course" : "activité"
//       }: "${commentText.substring(0, 50)}${
//         commentText.length > 50 ? "..." : ""
//       }"`,
//       timestamp: new Date().toISOString(),
//       read: false,
//     };

//     notifications.push(notification);
//     localStorage.setItem(
//       "runweek_friend_notifications",
//       JSON.stringify(notifications)
//     );

//     toast.success(
//       `Commentaire ajouté sur l'activité de ${selectedActivityForComment.friendName}`
//     );
//     setIsCommentModalOpen(false);
//     setSelectedActivityForComment(null);
//   };

//   // Filtrer et trier les amis
//   const filteredAndSortedFriends = friends
//     .filter((friend) => {
//       if (friendsFilter === "online") return friend.isOnline;
//       if (friendsFilter === "offline") return !friend.isOnline;
//       return true;
//     })
//     .sort((a, b) => {
//       switch (sortBy) {
//         case "name":
//           return a.name.localeCompare(b.name);
//         case "lastActivity":
//           return (
//             new Date(b.lastActivity).getTime() -
//             new Date(a.lastActivity).getTime()
//           );
//         case "level":
//           return (b.stats?.level || 0) - (a.stats?.level || 0);
//         default:
//           return 0;
//       }
//     });

//   // Real-time updates for friend status
//   React.useEffect(() => {
//     const interval = setInterval(() => {
//       // Simulate real-time updates of friend online status
//       const updatedFriends = friends.map((friend) => ({
//         ...friend,
//         isOnline: Math.random() > 0.7, // 30% chance to be online
//         lastActivity: friend.isOnline
//           ? new Date().toISOString()
//           : friend.lastActivity,
//       }));

//       // This would normally come from a WebSocket or polling mechanism
//       // For demo purposes, we'll update localStorage
//       localStorage.setItem(
//         "runweek_friends_status",
//         JSON.stringify(updatedFriends)
//       );
//     }, 30000); // Update every 30 seconds

//     return () => clearInterval(interval);
//   }, [friends]);

//   return (
//     <div className="p-4 md:p-6 space-y-6">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-foreground">Amis</h1>
//           <p className="text-muted-foreground">
//             Connectez-vous avec d'autres coureurs et partagez votre progression
//           </p>
//         </div>
//         <button
//           onClick={() => setIsAddFriendModalOpen(true)}
//           className="btn btn-primary flex items-center gap-2"
//         >
//           <UserPlus size={16} />
//           Ajouter un ami
//         </button>
//       </div>

//       {/* Statistiques */}
//       {friendsStats && <FriendsStats stats={friendsStats} />}

//       {/* Onglets */}
//       <div className="flex border-b border-border">
//         {[
//           { id: "friends", label: "Mes amis", count: friends.length },
//           { id: "requests", label: "Demandes", count: friendRequests.length },
//           { id: "discover", label: "Découvrir", count: null },
//           { id: "activity", label: "Activité", count: null },
//         ].map((tab) => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id as any)}
//             className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
//               activeTab === tab.id
//                 ? "text-primary border-b-2 border-primary"
//                 : "text-muted-foreground hover:text-foreground"
//             }`}
//           >
//             {tab.label}
//             {tab.count !== null && tab.count > 0 && (
//               <Badge variant="secondary" className="text-xs">
//                 {tab.count}
//               </Badge>
//             )}
//           </button>
//         ))}
//       </div>

//       {/* Contenu des onglets */}
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={activeTab}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -20 }}
//           transition={{ duration: 0.2 }}
//         >
//           {/* Onglet Mes amis */}
//           {activeTab === "friends" && (
//             <div className="space-y-4">
//               {/* Filtres et tri */}
//               <div className="flex flex-wrap gap-3 items-center justify-between">
//                 <div className="flex gap-2">
//                   <select
//                     value={friendsFilter}
//                     onChange={(e) => setFriendsFilter(e.target.value as any)}
//                     className="input input-sm bg-background text-foreground border-border"
//                   >
//                     <option value="all">Tous les amis</option>
//                     <option value="online">En ligne</option>
//                     <option value="offline">Hors ligne</option>
//                   </select>

//                   <select
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value as any)}
//                     className="input input-sm bg-background text-foreground border-border"
//                   >
//                     <option value="name">Trier par nom</option>
//                     <option value="lastActivity">Dernière activité</option>
//                     <option value="level">Niveau</option>
//                   </select>
//                 </div>

//                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                   <Filter size={14} />
//                   <span>{filteredAndSortedFriends.length} amis affichés</span>
//                 </div>
//               </div>

//               {/* Liste des amis */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {filteredAndSortedFriends.map((friend) => (
//                   <FriendCard
//                     key={friend.id}
//                     friend={friend}
//                     onViewProfile={handleViewProfile}
//                     onRemoveFriend={removeFriend}
//                     onBlockUser={blockUser}
//                     onReportUser={reportUser}
//                     onSendMessage={handleSendMessage}
//                   />
//                 ))}
//                 {filteredAndSortedFriends.length === 0 && (
//                   <div className="col-span-full text-center py-12">
//                     <Users
//                       size={48}
//                       className="mx-auto text-muted-foreground mb-4"
//                     />
//                     <h3 className="text-lg font-semibold text-foreground mb-2">
//                       {friendsFilter === "all"
//                         ? "Aucun ami pour le moment"
//                         : "Aucun ami correspondant au filtre"}
//                     </h3>
//                     <p className="text-muted-foreground mb-4">
//                       {friendsFilter === "all"
//                         ? "Commencez à construire votre communauté de coureurs"
//                         : "Essayez de changer les filtres ou ajoutez de nouveaux amis"}
//                     </p>
//                     <button
//                       onClick={() => setIsAddFriendModalOpen(true)}
//                       className="btn btn-primary"
//                     >
//                       <UserPlus size={16} className="mr-2" />
//                       Ajouter un ami
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Onglet Demandes */}
//           {activeTab === "requests" && (
//             <div className="space-y-6">
//               {/* Demandes reçues */}
//               {friendRequests.length > 0 && (
//                 <Card title="Demandes reçues">
//                   <div className="space-y-4">
//                     {friendRequests.map((request) => (
//                       <FriendRequestCard
//                         key={request.id}
//                         request={request}
//                         onAccept={acceptFriendRequest}
//                         onDecline={declineFriendRequest}
//                         type="received"
//                       />
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {/* Demandes envoyées */}
//               {sentRequests.length > 0 && (
//                 <Card title="Demandes envoyées">
//                   <div className="space-y-3">
//                     {sentRequests.map((request) => (
//                       <FriendRequestCard
//                         key={request.id}
//                         request={request}
//                         onAccept={acceptFriendRequest}
//                         onDecline={declineFriendRequest}
//                         type="sent"
//                       />
//                     ))}
//                   </div>
//                 </Card>
//               )}

//               {friendRequests.length === 0 && sentRequests.length === 0 && (
//                 <div className="text-center py-12">
//                   <Users
//                     size={48}
//                     className="mx-auto text-muted-foreground mb-4"
//                   />
//                   <h3 className="text-lg font-semibold text-foreground mb-2">
//                     Aucune demande d'ami
//                   </h3>
//                   <p className="text-muted-foreground">
//                     Les demandes d'amis que vous recevez et envoyez apparaîtront
//                     ici
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Onglet Découvrir */}
//           {activeTab === "discover" && (
//             <div className="space-y-6">
//               <Card title="Rechercher des utilisateurs">
//                 <div className="space-y-4">
//                   <div className="relative">
//                     <Input
//                       type="text"
//                       value={searchQuery}
//                       onChange={(e) => handleSearch(e.target.value)}
//                       placeholder="Rechercher par nom ou email..."
//                       className="pl-10"
//                     />
//                     <Search
//                       className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
//                       size={16}
//                     />
//                   </div>

//                   <UserSearchResults
//                     results={searchResults}
//                     isSearching={isSearching}
//                     onViewProfile={handleViewProfile}
//                     onSendFriendRequest={(email) => sendFriendRequest(email)}
//                     searchQuery={searchQuery}
//                   />
//                 </div>
//               </Card>
//             </div>
//           )}

//           {/* Onglet Activité */}
//           {activeTab === "activity" && (
//             <Card title="Activité de vos amis">
//               <ActivityFeed
//                 activities={friendActivities}
//                 likedActivities={likedActivities}
//                 activityComments={activityComments}
//                 onLikeActivity={handleLikeActivity}
//                 onCommentActivity={handleCommentActivity}
//                 onShareActivity={handleShareActivity}
//               />
//             </Card>
//           )}
//         </motion.div>
//       </AnimatePresence>

//       {/* Modals */}
//       <AddFriendModal
//         isOpen={isAddFriendModalOpen}
//         onClose={() => setIsAddFriendModalOpen(false)}
//         onSendFriendRequest={handleSendFriendRequest}
//         isLoading={isSearching}
//       />

//       <MessageModal
//         isOpen={isMessageModalOpen}
//         onClose={() => {
//           setIsMessageModalOpen(false);
//           setSelectedFriendForAction(null);
//         }}
//         friend={selectedFriendForAction}
//         onSendMessage={handleRealSendMessage}
//       />

//       <ReportUserModal
//         isOpen={isReportModalOpen}
//         onClose={() => {
//           setIsReportModalOpen(false);
//           setSelectedFriendForAction(null);
//         }}
//         friend={selectedFriendForAction}
//         onReportUser={handleReportUser}
//       />

//       <ConversationModal
//         isOpen={isConversationModalOpen}
//         onClose={() => {
//           setIsConversationModalOpen(false);
//           setSelectedFriendForAction(null);
//         }}
//         friend={selectedFriendForAction}
//         onSendMessage={handleRealSendMessage}
//       />

//       <FriendProfileModal
//         friend={selectedFriend}
//         isOpen={isProfileModalOpen}
//         onClose={() => setIsProfileModalOpen(false)}
//         onSendMessage={handleSendMessage}
//         onRemoveFriend={removeFriend}
//         onBlockUser={(userId) => {
//           const friend = friends.find((f) => f.id === userId);
//           if (
//             friend &&
//             window.confirm(
//               `Êtes-vous sûr de vouloir bloquer ${friend.name} ? Cette action est irréversible.`
//             )
//           ) {
//             blockUser(userId);
//           }
//         }}
//         onReportUser={(userId, reason) => {
//           const friend = friends.find((f) => f.id === userId);
//           if (friend) {
//             setSelectedFriendForAction(friend);
//             setIsReportModalOpen(true);
//           }
//         }}
//       />

//       <CommentModal
//         isOpen={isCommentModalOpen}
//         onClose={() => {
//           setIsCommentModalOpen(false);
//           setSelectedActivityForComment(null);
//         }}
//         friendName={selectedActivityForComment?.friendName || ""}
//         onSubmitComment={handleSubmitComment}
//       />
//     </div>
//   );
// };

// export default Friends;
