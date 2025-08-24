import React, { useState } from "react";
import { Friend } from "../../types/friends";
import {
  MoreVertical,
  Eye,
  MessageCircle,
  UserX,
  EyeOff,
  Trophy,
  Activity,
  MapPin,
  Users,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

interface FriendCardProps {
  friend: Friend;
  onViewProfile: (friend: Friend) => void;
  onRemoveFriend: (friendId: string) => void;
  onBlockUser: (userId: string) => void;
  onReportUser: (userId: string, reason: string) => void;
  onSendMessage: (friendId: string) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  onViewProfile,
  onRemoveFriend,
  onBlockUser,
  onReportUser,
  onSendMessage,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Il y a quelques minutes";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    return time.toLocaleDateString("fr-FR");
  };

  const handleReportUser = () => {
    const reasons = [
      "Contenu inapproprié",
      "Harcèlement",
      "Spam",
      "Faux profil",
      "Comportement abusif",
      "Autre",
    ];

    const reasonIndex = prompt(
      `Sélectionnez une raison:\n${reasons
        .map((r, i) => `${i + 1}. ${r}`)
        .join("\n")}\n\nEntrez le numéro (1-${
        reasons.length
      }) ou décrivez une autre raison:`
    );

    if (reasonIndex) {
      const selectedReason = reasons[parseInt(reasonIndex) - 1] || reasonIndex;
      onReportUser(friend.id, selectedReason);
    }
    setShowDropdown(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <img
              src={friend.profileImage}
              alt={friend.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-background"
            />
            {friend.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{friend.name}</h3>
            <p className="text-sm text-muted-foreground">
              {friend.isOnline
                ? "En ligne"
                : `Vu ${formatTimeAgo(friend.lastActivity)}`}
            </p>
            {friend.mutualFriends > 0 && (
              <p className="text-xs text-primary flex items-center gap-1 mt-1">
                <Users size={12} />
                {friend.mutualFriends} amis en commun
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSendMessage(friend.id)}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
            title="Envoyer un message"
          >
            <MessageCircle size={16} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-10 bg-card border border-border rounded-lg shadow-lg z-20 min-w-48">
                <button
                  onClick={() => {
                    onViewProfile(friend);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 rounded-t-lg"
                >
                  <Eye size={14} />
                  Voir le profil
                </button>
                <button
                  onClick={() => {
                    onSendMessage(friend.id);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                >
                  <MessageCircle size={14} />
                  Envoyer un message
                </button>
                <hr className="border-border" />
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Êtes-vous sûr de vouloir supprimer ${friend.name} de vos amis ?`
                      )
                    ) {
                      onRemoveFriend(friend.id);
                    }
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted text-destructive flex items-center gap-2"
                >
                  <UserX size={14} />
                  Supprimer
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Êtes-vous sûr de vouloir bloquer ${friend.name} ? Cette action est irréversible.`
                      )
                    ) {
                      onBlockUser(friend.id);
                    }
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted text-destructive flex items-center gap-2"
                >
                  <EyeOff size={14} />
                  Bloquer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {friend.stats && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Activity size={12} className="text-blue-500" />
              <span className="text-muted-foreground">Distance:</span>
              <span className="font-medium text-foreground">
                {friend.stats.totalDistance ?? 0} km
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy size={12} className="text-yellow-500" />
              <span className="text-muted-foreground">Niveau:</span>
              <span className="font-medium text-foreground">
                {friend.stats?.level ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-green-500" />
              <span className="text-muted-foreground">Allure:</span>
              <span className="font-medium text-foreground">
                {friend.stats?.averagePace ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-purple-500" />
              <span className="text-muted-foreground">Courses:</span>
              <span className="font-medium text-foreground">
                {friend.stats?.totalRuns ?? 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FriendCard;
