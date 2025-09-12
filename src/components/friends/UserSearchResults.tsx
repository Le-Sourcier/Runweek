import React, { useState } from "react";
import { Friend } from "../../types/friends";
import {
  Eye,
  UserPlus,
  Users,
  Activity,
  Trophy,
  Clock,
  MapPin,
  Star,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import Badge from "../ui/Badge";
import FriendProfileModal from "./FriendProfileModal";
import ConversationModal from "./ConversationModal";

interface UserSearchResultsProps {
  results: Friend[];
  isSearching: boolean;
  onSendFriendRequest: (email: string) => void;
  searchQuery: string;
}

const UserSearchResults: React.FC<UserSearchResultsProps> = ({
  results,
  isSearching,
  onSendFriendRequest,
  searchQuery,
}) => {
  const getCompatibilityScore = (user: Friend) => {
    // Calcul simple de compatibilité basé sur les stats
    if (!user.stats) return 0;

    // Logique de compatibilité plus sophistiquée
    const currentUserLevel = 5; // This should come from actual user data
    const currentUserPace = 5.5; // This should come from actual user data (in minutes per km)

    let score = 50; // Base score

    // Level compatibility (30 points max)
    const levelDiff = Math.abs(user.stats.level - currentUserLevel);
    const levelScore = Math.max(0, 30 - levelDiff * 5);
    score += levelScore;

    // Pace compatibility (20 points max)
    const userPaceMinutes =
      parseFloat(user.stats.averagePace.split(":")[0]) +
      parseFloat(user.stats.averagePace.split(":")[1]) / 60;
    const paceDiff = Math.abs(userPaceMinutes - currentUserPace);
    const paceScore = Math.max(0, 20 - paceDiff * 10);
    score += paceScore;

    // Activity level compatibility (20 points max)
    const activityScore = user.stats.totalRuns > 20 ? 20 : user.stats.totalRuns;
    score += activityScore;

    // Mutual friends bonus (10 points max)
    const mutualScore = Math.min(user.mutualFriends * 2, 10);
    score += mutualScore;

    return Math.min(100, Math.round(score));
  };

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const getCompatibilityLabel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-500" };
    if (score >= 60) return { label: "Bon", color: "text-blue-500" };
    if (score >= 40) return { label: "Moyen", color: "text-yellow-500" };
    return { label: "Faible", color: "text-gray-500" };
  };

  if (isSearching) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Recherche d'utilisateurs...</p>
      </div>
    );
  }

  if (searchQuery && results.length === 0) {
    return (
      <div className="text-center py-12">
        <Users size={48} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Aucun utilisateur trouvé
        </h3>
        <p className="text-muted-foreground">
          Aucun résultat pour "{searchQuery}"
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Essayez avec un nom ou email différent
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((user, index) => {
        const compatibilityScore = getCompatibilityScore(user);
        const compatibility = getCompatibilityLabel(compatibilityScore);

        return (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:border-primary/50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="relative">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-background"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full object-cover ring-2 ring-background border dark:border-gray-700 border-gray-200 flex items-center justify-center font-bold gap-1">
                    <span className="capitalize">
                      {user.name.split(" ")[0].slice(0, 1)}
                    </span>{" "}
                    <span className="capitalize">
                      {user.name.split(" ")[1].slice(0, 1)}
                    </span>
                  </div>
                )}
                {user.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background"></div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground text-lg">
                      {user.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star size={12} className={compatibility.color} />
                        <span
                          className={`text-xs font-medium ${compatibility.color}`}
                        >
                          {compatibility.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Compatibilité {compatibilityScore}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informations de base */}
                <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                  {user.mutualFriends > 0 && (
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-primary" />
                      <span>{user.mutualFriends} amis en commun</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>
                      Membre depuis{" "}
                      {new Date(user.joinedDate).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>

                {/* Statistiques */}
                {user.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-background p-2 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Activity size={12} className="text-blue-500" />
                        <span className="text-xs text-muted-foreground">
                          Distance
                        </span>
                      </div>
                      <p className="font-semibold text-foreground text-sm">
                        {/* {user.stats.totalDistance.toFixed(1)} km */}
                        {user.stats.totalDistance} km
                      </p>
                    </div>
                    <div className="bg-background p-2 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Trophy size={12} className="text-yellow-500" />
                        <span className="text-xs text-muted-foreground">
                          Niveau
                        </span>
                      </div>
                      <p className="font-semibold text-foreground text-sm">
                        {user.stats.level}
                      </p>
                    </div>
                    <div className="bg-background p-2 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock size={12} className="text-green-500" />
                        <span className="text-xs text-muted-foreground">
                          Allure
                        </span>
                      </div>
                      <p className="font-semibold text-foreground text-sm">
                        {user.stats.averagePace}
                      </p>
                    </div>
                    <div className="bg-background p-2 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <MapPin size={12} className="text-purple-500" />
                        <span className="text-xs text-muted-foreground">
                          Courses
                        </span>
                      </div>
                      <p className="font-semibold text-foreground text-sm">
                        {user.stats.totalRuns}
                      </p>
                    </div>
                  </div>
                )}

                {/* Badges de préférences */}
                {user.preferences && (
                  <div className="flex gap-2 mb-3">
                    <Badge
                      variant={
                        user.preferences.profileVisibility === "public"
                          ? "primary"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      Profil{" "}
                      {user.preferences.profileVisibility === "public"
                        ? "public"
                        : "privé"}
                    </Badge>
                    <Badge
                      variant={
                        user.preferences.activityVisibility === "public"
                          ? "primary"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      Activités{" "}
                      {user.preferences.activityVisibility === "public"
                        ? "publiques"
                        : "privées"}
                    </Badge>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="btn btn-outline btn-sm flex items-center gap-1 flex-1"
                  >
                    <Eye size={14} />
                    Voir le profil
                  </button>
                  <button
                    onClick={() => onSendFriendRequest(user.email)}
                    className="btn btn-primary btn-sm flex items-center gap-1 flex-1"
                  >
                    <UserPlus size={14} />
                    Ajouter comme ami
                  </button>
                </div>
              </div>
            </div>

            <FriendProfileModal
              friend={user}
              isOpen={isProfileModalOpen}
              onClose={() => setIsProfileModalOpen(false)}
              onSendMessage={function (): void {
                throw new Error("Function not implemented.");
              }}
              // onRemoveFriend={function (friendId: string): void {
              //   throw new Error("Function not implemented.");
              // }}
              // onBlockUser={function (userId: string): void {
              //   throw new Error("Function not implemented.");
              // }}
            />

            <ConversationModal
              friend={user}
              isOpen={isChatModalOpen}
              onClose={() => setIsChatModalOpen(false)}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default UserSearchResults;
