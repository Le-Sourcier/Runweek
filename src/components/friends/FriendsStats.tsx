import React from "react";
import { FriendsStats as FriendsStatsType } from "../../types/friends";
import Card from "../ui/Card";
import { Users, Clock, Share2 } from "lucide-react";
import { motion } from "framer-motion";

interface FriendsStatsProps {
  stats: FriendsStatsType;
  className?: string;
}

const FriendsStats: React.FC<FriendsStatsProps> = ({
  stats,
  className = "",
}) => {
  const statCards = [
    {
      icon: <Users size={20} />,
      label: "Total amis",
      value: stats.totalFriends,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      trend: "+2 ce mois",
      trendColor: "text-green-500",
    },
    {
      icon: (
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      ),
      label: "En ligne",
      value: stats.onlineFriends,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      trend: `${Math.round(
        (stats.onlineFriends / Math.max(stats.totalFriends, 1)) * 100
      )}% actifs`,
      trendColor: "text-green-500",
    },
    {
      icon: <Clock size={20} />,
      label: "Demandes en attente",
      value: stats.pendingRequests,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      trend: stats.pendingRequests > 0 ? "Action requise" : "Aucune",
      trendColor:
        stats.pendingRequests > 0 ? "text-yellow-500" : "text-muted-foreground",
    },
    {
      icon: <Share2 size={20} />,
      label: "Connexions mutuelles",
      value: stats.mutualConnections,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      trend:
        stats.mutualConnections > 10 ? "Réseau étendu" : "Développer le réseau",
      trendColor:
        stats.mutualConnections > 10
          ? "text-purple-500"
          : "text-muted-foreground",
    },
  ];

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div
                className={`h-12 w-12 ${stat.bgColor} ${stat.color} rounded-full flex items-center justify-center`}
              >
                {stat.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <span className={`text-xs ${stat.trendColor} font-medium`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default FriendsStats;
