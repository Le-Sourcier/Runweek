import React from "react";
import { FriendRequest } from "../../types/friends";
import { CheckCircle, X, Calendar, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  request,
  onAccept,
  onDecline,
}) => {
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

  // const friend = type === 'received' ? request.from : request.to;

  return (
    <motion.div
      initial={{ opacity: 0, x: request.type === "received" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-4 flex-1">
        {request.image ? (
          <img
            src={request.image}
            alt={request.fname}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full object-cover flex gap-0 items-center border border-gray-600 justify-center">
            <span className="capitalize"> {request.fname.slice(0, 1)}</span>
            <span className="capitalize"> {request.lname.slice(0, 1)}</span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <h4 className="font-semibold text-foreground">{request.fname}</h4>
            <h4 className="font-semibold text-foreground">{request.lname}</h4>
          </div>{" "}
          <p className="text-sm text-muted-foreground">{request.email}</p>
          <div className="flex items-center gap-3 mt-1">
            {/* {request.mutualFriends > 0 && (
              <p className="text-xs text-primary flex items-center gap-1">
                <Users size={10} />
                {friend.mutualFriends} amis en commun
              </p>
            )} */}
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar size={10} />
              {request.type === "received" ? "Reçue" : "Envoyée"}{" "}
              {formatTimeAgo(request.createdAt)}
            </p>
          </div>
          {request.requestMessage && (
            <div className="mt-2 p-2 bg-muted/50 rounded-lg border-l-2 border-primary/50">
              <p className="text-sm text-foreground italic flex items-start gap-2">
                <MessageCircle
                  size={12}
                  className="text-primary mt-0.5 flex-shrink-0"
                />
                "{request.requestMessage}"
              </p>
            </div>
          )}
        </div>
      </div>

      {request.type === "received" ? (
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(request.id)}
            className="btn btn-primary btn-sm flex items-center gap-1"
          >
            <CheckCircle size={14} />
            Accepter
          </button>
          <button
            onClick={() => onDecline(request.id)}
            className="btn btn-outline btn-sm flex items-center gap-1"
          >
            <X size={14} />
            Refuser
          </button>
        </div>
      ) : (
        <div className="text-right">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            En attente
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default FriendRequestCard;
