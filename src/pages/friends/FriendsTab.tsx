import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Filter, Users } from "lucide-react";
import { Friend } from "../../types/friends";
import { useFriendsStore } from "../../stores/friends";
import FriendCard from "../../components/friends/FriendCard";
import FriendProfileModal from "../../components/friends/FriendProfileModal";

const FriendsTab: React.FC = () => {
  const {
    friends,
    getFriends,
    removeFriend,
    blockUser,
    reportUser,
    isLoading,
  } = useFriendsStore();

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [friendsFilter, setFriendsFilter] = useState<
    "all" | "online" | "offline"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "recent" | "level">("name");

  useEffect(() => {
    const loadFriends = async () => {
      try {
        await getFriends({ status: friendsFilter, sort: sortBy });
      } catch (error) {
        // toast.error("Erreur lors du chargement des amis");
      }
    };

    loadFriends();
  }, [getFriends, friendsFilter, sortBy]);

  const handleViewProfile = (friend: Friend) => {
    setSelectedFriend(friend);
    setIsProfileModalOpen(true);
  };

  const handleRealSendMessage = (friendId: string) => {
    const conversations = JSON.parse(
      localStorage.getItem("runweek_conversations") || "[]"
    );
    const conversation = conversations.find((conv: any) =>
      conv.participants.includes(friendId)
    );

    if (conversation) {
      const newMessage = {
        id: `msg_${Date.now()}`,
        senderId: "current_user",
        text: "messageText",
        timestamp: new Date().toISOString(),
        read: false,
      };

      conversation.messages.push(newMessage);
      conversation.lastMessage = newMessage;
      conversation.updatedAt = new Date().toISOString();

      localStorage.setItem(
        "runweek_conversations",
        JSON.stringify(conversations)
      );
      toast.success(`Message envoyé !`);
    }
  };

  const filteredAndSortedFriends = friends
    .filter((friend) => {
      if (friendsFilter === "online") return friend.isOnline;
      if (friendsFilter === "offline") return !friend.isOnline;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "recent":
          return (
            new Date(b.lastActivity).getTime() -
            new Date(a.lastActivity).getTime()
          );
        case "level":
          return (b.stats?.level || 0) - (a.stats?.level || 0);
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Chargement des amis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtres et tri */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <select
            value={friendsFilter}
            onChange={(e) => setFriendsFilter(e.target.value as any)}
            className="input input-sm bg-background text-foreground border-border"
            disabled={isLoading}
          >
            <option value="all">Tous les amis</option>
            <option value="online">En ligne</option>
            <option value="offline">Hors ligne</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input input-sm bg-background text-foreground border-border"
            disabled={isLoading}
          >
            <option value="name">Trier par nom</option>
            <option value="lastActivity">Dernière activité</option>
            <option value="level">Niveau</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter size={14} />
          <span>{filteredAndSortedFriends.length} amis affichés</span>
        </div>
      </div>

      {/* Liste des amis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedFriends.map((friend) => (
          <FriendCard
            key={friend.id}
            friend={friend}
            onViewProfile={handleViewProfile}
            onRemoveFriend={removeFriend}
            onBlockUser={blockUser}
            onReportUser={reportUser}
            onSendMessage={() => handleRealSendMessage(friend.id)}
          />
        ))}
        {filteredAndSortedFriends.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {friendsFilter === "all"
                ? "Aucun ami pour le moment"
                : "Aucun ami correspondant au filtre"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {friendsFilter === "all"
                ? "Commencez à construire votre communauté de coureurs"
                : "Essayez de changer les filtres ou ajoutez de nouveaux amis"}
            </p>
          </div>
        )}
      </div>

      <FriendProfileModal
        friend={selectedFriend}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSendMessage={handleRealSendMessage}
        onRemoveFriend={removeFriend}
        onBlockUser={blockUser}
        onReportUser={reportUser}
      />
    </div>
  );
};

export default FriendsTab;
