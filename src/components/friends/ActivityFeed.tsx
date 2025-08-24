import React from "react";
import { Heart, MessageCircle, Share2, Clock, MapPin, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface Activity {
  id: string;
  friend: {
    id: string;
    name: string;
    avatar: string;
  };
  type: "run" | "bike" | "swim" | "workout";
  title: string;
  description: string;
  timestamp: string;
  stats?: {
    distance?: number;
    duration?: number;
    pace?: string;
    calories?: number;
  };
  location?: string;
  image?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  likedActivities: Set<string>;
  activityComments: Map<string, number>;
  onLikeActivity: (activityId: string) => void;
  onCommentActivity: (activityId: string, friendName: string) => void;
  onShareActivity: (activityId: string) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  likedActivities,
  activityComments,
  onLikeActivity,
  onCommentActivity,
  onShareActivity,
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "run":
        return "🏃‍♂️";
      case "bike":
        return "🚴‍♂️";
      case "swim":
        return "🏊‍♂️";
      case "workout":
        return "💪";
      default:
        return "🏃‍♂️";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - activityTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `il y a ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `il y a ${days}j`;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Zap size={48} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Aucune activité récente
        </h3>
        <p className="text-muted-foreground">
          Les activités de vos amis apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          {/* En-tête de l'activité */}
          <div className="flex items-start gap-3 mb-3">
            <img
              src={activity.friend.avatar}
              alt={activity.friend.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-foreground">
                  {activity.friend.name}
                </span>
                <span className="text-lg">
                  {getActivityIcon(activity.type)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
              <h4 className="font-medium text-foreground mb-1">
                {activity.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {activity.description}
              </p>
            </div>
          </div>

          {/* Statistiques */}
          {activity.stats && (
            <div className="flex flex-wrap gap-4 mb-3 text-sm">
              {activity.stats.distance && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin size={14} />
                  <span>{activity.stats.distance} km</span>
                </div>
              )}
              {activity.stats.duration && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock size={14} />
                  <span>
                    {Math.floor(activity.stats.duration / 60)}:
                    {(activity.stats.duration % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              )}
              {activity.stats.pace && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Zap size={14} />
                  <span>{activity.stats.pace}</span>
                </div>
              )}
              {activity.stats.calories && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  🔥
                  <span>{activity.stats.calories} cal</span>
                </div>
              )}
            </div>
          )}

          {/* Localisation */}
          {activity.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
              <MapPin size={14} />
              <span>{activity.location}</span>
            </div>
          )}

          {/* Image de l'activité */}
          {activity.image && (
            <div className="mb-3">
              <img
                src={activity.image}
                alt="Activité"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            <button
              onClick={() => onLikeActivity(activity.id)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
                likedActivities.has(activity.id)
                  ? "text-red-500 bg-red-50 hover:bg-red-100"
                  : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
              }`}
            >
              <Heart
                size={16}
                className={
                  likedActivities.has(activity.id) ? "fill-current" : ""
                }
              />
              <span>J'aime</span>
            </button>

            <button
              onClick={() =>
                onCommentActivity(activity.id, activity.friend.name)
              }
              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-colors"
            >
              <MessageCircle size={16} />
              <span>
                Commenter
                {activityComments.has(activity.id) &&
                  activityComments.get(activity.id)! > 0 && (
                    <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 rounded">
                      {activityComments.get(activity.id)}
                    </span>
                  )}
              </span>
            </button>

            <button
              onClick={() => onShareActivity(activity.id)}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm text-muted-foreground hover:text-green-500 hover:bg-green-50 transition-colors"
            >
              <Share2 size={16} />
              <span>Partager</span>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ActivityFeed;
