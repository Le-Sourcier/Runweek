import { useState } from "react";
import { BlockedFriend, Friend } from "../../types/friends";
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
  Unlock,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatTimeAgo } from "../../utils/date-formatter";
import ConversationModal from "./ConversationModal";
import BlockFriendModal from "./BlockFriendModal";
import { getInitials } from "../../utils/get-initial";
import { ProfileNameCircle } from "../ui/ProfileNameCircle";
import FormattedDate from "../ui/FormattedDate";
import { useLanguage } from "../../providers/LanguageProvider";

interface FriendCardProps {
  friend: Friend;
  onViewProfile: (friend: Friend) => void;
  onRemoveFriend: (friendId: string) => void;
  onBlockUser: (userId: string, raison: string) => Promise<void>;
  onReportUser: (userId: string, reason: string) => Promise<void>;
  onSendMessage: (friendId: string, message: string) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  onViewProfile,
  onRemoveFriend,
  onBlockUser,
  onReportUser,
  onSendMessage,
}) => {

  const { currentLanguage } = useLanguage();

  const [showDropdown, setShowDropdown] = useState(false);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  const [isBlockedFriendModalOpen, setIsBlockedFriendModalOpen] = useState(false);

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
        .join("\n")}\n\nEntrez le numéro (1-${reasons.length
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
          <div className="relative flex items-center">
            {friend.profileImage ? (
              <img
                src={friend.profileImage}
                alt={friend.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-background"
              />
            ) : <ProfileNameCircle name={getInitials(friend.name)} radius={12} />}
            {friend.isOnline && (
              <div className="absolute -bottom-0 -right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
            )}
          </div>
          <div className="flex-1 flex-col items-center">
            <h3 className="font-semibold text-foreground">{friend.name}</h3>
            <p className="text-sm text-muted-foreground">
              {friend.isOnline
                ? "En ligne"
                : <>Vu <FormattedDate date={friend.lastActivity} mode="relative" locale={currentLanguage} /></>
              }
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
            onClick={() => setIsConversationModalOpen(true)}
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
                    onSendMessage(friend.id, " ");
                    setShowDropdown(false);
                    setIsConversationModalOpen(true);
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
                    onBlockUser(friend.id, "");
                    setIsBlockedFriendModalOpen(true);
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
      <ConversationModal
        isOpen={isConversationModalOpen}
        onClose={() => {
          setIsConversationModalOpen(false);
        }}
        friend={friend}
      // onSendMessage={onSendMessage}
      />
      <BlockFriendModal
        isOpen={isBlockedFriendModalOpen}
        onClose={() => {
          setIsBlockedFriendModalOpen(false);
        }}
        friend={friend}
        onBlockFriend={onBlockUser}
      />
    </motion.div>
  );
};

interface BlockFriendCardProps {
  friend: BlockedFriend;
  onUnblockUser: (friendId: string) => void;
  isLoading: boolean;
}
export const BlockFriendCard: React.FC<BlockFriendCardProps> = ({
  friend,
  onUnblockUser,
  isLoading,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* En-tête avec avatar et nom */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          {friend.profileImage ? (
            <img
              src={friend.profileImage}
              alt={friend.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <User size={24} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {friend.name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {friend.email}
          </p>
        </div>
      </div>

      {/* Informations */}
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users size={14} />
          <span>{friend.mutualFriends} ami(s) mutuel(s)</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={14} />
          <span>Bloqué le {formatDate(friend.blockedAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Membre depuis {formatDate(friend.joinedDate)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Profil: {friend.preferences.profileVisibility}</span>
        </div>
      </div>

      {/* Bouton de déblocage */}
      <div className="mt-4 pt-4 border-t border-border">
        <button
          onClick={() => onUnblockUser(friend.id)}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Unlock size={16} />
          Débloquer
        </button>
      </div>
    </div>
  );
};
export default FriendCard;
