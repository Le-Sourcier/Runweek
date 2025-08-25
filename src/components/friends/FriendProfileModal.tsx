import React, { useState } from "react";
import { Friend } from "../../types/friends";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import {
  MessageCircle,
  Share2,
  UserX,
  Flag,
  Calendar,
  MapPin,
  Activity,
  Trophy,
  Clock,
  TrendingUp,
  Heart,
  Users,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { Modal } from "../ui/Modal";
import { formatTimeAgo } from "../../utils/date-formatter";

interface FriendProfileModalProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (friendId: string) => void;
  onRemoveFriend: (friendId: string) => void;
  onBlockUser: (userId: string) => void;
  onReportUser: (userId: string, reason: string) => void;
}

const FriendProfileModal: React.FC<FriendProfileModalProps> = ({
  friend,
  isOpen,
  onClose,
  onSendMessage,
  onRemoveFriend,
  onBlockUser,
  onReportUser,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "stats" | "activity">(
    "overview"
  );
  const [isFollowing, setIsFollowing] = useState(false);

  if (!friend) return null;

  // const formatTimeAgo = (timestamp: string) => {
  //   const now = new Date();
  //   const time = new Date(timestamp);
  //   const diffInHours = Math.floor(
  //     (now.getTime() - time.getTime()) / (1000 * 60 * 60)
  //   );

  //   if (diffInHours < 1) return "Il y a quelques minutes";
  //   if (diffInHours < 24) return `Il y a ${diffInHours}h`;
  //   const diffInDays = Math.floor(diffInHours / 24);
  //   if (diffInDays < 7) return `Il y a ${diffInDays}j`;
  //   return time.toLocaleDateString("fr-FR");
  // };

  const handleReportUser = () => {
    const reasons = [
      "Contenu inapproprié",
      "Harcèlement",
      "Spam",
      "Faux profil",
      "Comportement abusif",
      "Autre",
    ];

    const reasonInput = prompt(
      `Raison du signalement:\n${reasons
        .map((r, i) => `${i + 1}. ${r}`)
        .join("\n")}\n\nEntrez le numéro (1-${
        reasons.length
      }) ou décrivez une autre raison:`
    );

    if (reasonInput) {
      const reasonIndex = parseInt(reasonInput) - 1;
      const selectedReason = reasons[reasonIndex] || reasonInput;

      // Add additional context if it's a serious report
      const additionalInfo =
        selectedReason.includes("Harcèlement") ||
        selectedReason.includes("Comportement abusif")
          ? prompt("Pouvez-vous fournir plus de détails sur cet incident ?")
          : null;

      const fullReason = additionalInfo
        ? `${selectedReason} - ${additionalInfo}`
        : selectedReason;
      onReportUser(friend.id, fullReason);
    }
  };

  const mockRecentActivities = [
    {
      id: "act1",
      type: "run",
      title: "Course matinale",
      description: "8.5 km en 42 minutes",
      timestamp: "2025-01-20T08:30:00Z",
      data: { distance: 8.5, time: "42:15", pace: "4:58" },
    },
    {
      id: "act2",
      type: "achievement",
      title: "Nouveau badge",
      description: 'Badge "Régularité" débloqué',
      timestamp: "2025-01-19T16:45:00Z",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="space-y-6">
        {/* En-tête du profil */}
        <div className="flex items-start gap-6">
          <div className="relative">
            <img
              src={friend.profileImage}
              alt={friend.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-background shadow-lg"
            />
            {friend.isOnline && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {friend.name}
                </h2>
                <p className="text-muted-foreground">{friend.email}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>
                      Membre depuis{" "}
                      {new Date(friend.joinedDate).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>
                      {friend.isOnline
                        ? "En ligne maintenant"
                        : `Vu ${formatTimeAgo(friend.lastActivity)}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`btn btn-sm ${
                    isFollowing ? "btn-secondary" : "btn-outline"
                  } flex items-center gap-1`}
                >
                  {isFollowing ? <EyeOff size={14} /> : <Eye size={14} />}
                  {isFollowing ? "Ne plus suivre" : "Suivre"}
                </button>

                {friend.stats && friend.stats.level >= 5 && (
                  <Badge variant="warning" className="flex items-center gap-1">
                    <Star size={12} />
                    Coureur expérimenté
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-border">
          {[
            { id: "overview", label: "Aperçu", icon: <Eye size={16} /> },
            {
              id: "stats",
              label: "Statistiques",
              icon: <TrendingUp size={16} />,
            },
            {
              id: "activity",
              label: "Activité récente",
              icon: <Activity size={16} />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        <div className="min-h-64">
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {friend.stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg border border-border">
                    <Activity
                      size={24}
                      className="mx-auto text-blue-500 mb-2"
                    />
                    <p className="text-2xl font-bold text-foreground">
                      {friend.stats.totalDistance}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      km parcourus
                    </p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg border border-border">
                    <Trophy
                      size={24}
                      className="mx-auto text-yellow-500 mb-2"
                    />
                    <p className="text-2xl font-bold text-foreground">
                      {friend.stats.totalRuns}
                    </p>
                    <p className="text-sm text-muted-foreground">courses</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg border border-border">
                    <Clock size={24} className="mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {friend.stats.averagePace}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      allure moyenne
                    </p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg border border-border">
                    <Star size={24} className="mx-auto text-purple-500 mb-2" />
                    <p className="text-2xl font-bold text-foreground">
                      {friend.stats.level}
                    </p>
                    <p className="text-sm text-muted-foreground">niveau</p>
                  </div>
                </div>
              )}

              <div className="bg-background p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users size={16} />
                  Informations de connexion
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Amis en commun:
                    </span>
                    <span className="font-medium text-foreground">
                      {friend.mutualFriends}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Membre depuis:
                    </span>
                    <span className="font-medium text-foreground">
                      {new Date(friend.joinedDate).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Dernière activité:
                    </span>
                    <span className="font-medium text-foreground">
                      {formatTimeAgo(friend.lastActivity)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "stats" && friend.stats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-background p-4 rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-500" />
                    Performance
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Distance totale:
                      </span>
                      <span className="font-bold text-foreground">
                        {friend.stats.totalDistance.toFixed(1)} km
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Allure moyenne:
                      </span>
                      <span className="font-bold text-foreground">
                        {friend.stats.averagePace}/km
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Courses totales:
                      </span>
                      <span className="font-bold text-foreground">
                        {friend.stats.totalRuns}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-background p-4 rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Trophy size={16} className="text-yellow-500" />
                    Progression
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Niveau actuel:
                      </span>
                      <span className="font-bold text-foreground">
                        Niveau {friend.stats.level}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Distance moyenne:
                      </span>
                      <span className="font-bold text-foreground">
                        {(
                          friend.stats.totalDistance / friend.stats.totalRuns
                        ).toFixed(1)}{" "}
                        km
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (friend.stats.level / 10) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Progression vers le niveau {friend.stats.level + 1}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparaison avec l'utilisateur actuel */}
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  Comparaison avec vous
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Distance</p>
                    <p className="font-bold text-foreground">
                      {friend.stats.totalDistance > 300 ? "+" : "-"}
                    </p>
                    <p className="text-xs text-primary">
                      {friend.stats.totalDistance > 300
                        ? "Plus expérimenté"
                        : "Niveau similaire"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Allure</p>
                    <p className="font-bold text-foreground">
                      {friend.stats.averagePace < "6:00" ? "⚡" : "🐌"}
                    </p>
                    <p className="text-xs text-primary">
                      {friend.stats.averagePace < "6:00"
                        ? "Plus rapide"
                        : "Rythme détendu"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Niveau</p>
                    <p className="font-bold text-foreground">
                      {friend.stats.level > 5 ? "🏆" : "🌟"}
                    </p>
                    <p className="text-xs text-primary">
                      {friend.stats.level > 5
                        ? "Niveau avancé"
                        : "En progression"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "activity" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {mockRecentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="bg-background p-4 rounded-lg border border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {activity.type === "run" ? (
                        <Activity size={16} className="text-blue-500" />
                      ) : (
                        <Trophy size={16} className="text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-foreground">
                        {activity.title}
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>

                      {activity.data && (
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className="flex items-center gap-1">
                            <MapPin size={10} />
                            {activity.data.distance} km
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {activity.data.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp size={10} />
                            {activity.data.pace}/km
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <button className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                        <Heart size={14} />
                      </button>
                      <button className="p-1 text-muted-foreground hover:text-primary transition-colors">
                        <MessageCircle size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Actions principales */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            onClick={() => onSendMessage(friend.id)}
            className="flex-1 flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Envoyer un message
          </Button>
          <Button
            variant="outline"
            className="flex-1 flex items-center gap-2"
            onClick={() => {
              navigator.share?.({
                title: `Profil de ${friend.name}`,
                text: `Découvrez le profil de ${friend.name} sur Runweek`,
                url: window.location.href,
              }) || navigator.clipboard.writeText(window.location.href);
            }}
          >
            <Share2 size={16} />
            Partager le profil
          </Button>
        </div>

        {/* Actions secondaires */}
        <div className="flex justify-center gap-6 pt-2 text-sm">
          <button
            onClick={() => {
              onRemoveFriend(friend.id);
              onClose();
            }}
            className="text-destructive hover:underline flex items-center gap-1"
          >
            <UserX size={14} />
            Supprimer cet ami
          </button>
          <button
            onClick={() => {
              onBlockUser(friend.id);
              onClose();
            }}
            className="text-muted-foreground hover:text-destructive hover:underline flex items-center gap-1"
          >
            <EyeOff size={14} />
            Bloquer
          </button>
          <button
            onClick={handleReportUser}
            className="text-muted-foreground hover:text-destructive hover:underline flex items-center gap-1"
          >
            <Flag size={14} />
            Signaler
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FriendProfileModal;
