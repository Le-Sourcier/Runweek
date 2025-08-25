import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Users } from "lucide-react";
import { useFriendsStore } from "../../stores/friends";
import FriendRequestCard from "../../components/friends/FriendRequestCard";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

// Types pour les filtres
type RequestFilter = "all" | "received" | "sent";

const RequestsTab: React.FC = () => {
  const {
    friendRequests,
    sentRequests,
    getFriendsRequest,
    acceptFriendRequest,
    declineFriendRequest,
    isLoading,
  } = useFriendsStore();

  const [activeFilter, setActiveFilter] = useState<RequestFilter>("all");
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    const loadRequests = async () => {
      setLocalLoading(true);
      try {
        if (activeFilter === "all") {
          // Charger à la fois les demandes reçues et envoyées
          await Promise.all([
            getFriendsRequest("received"),
            getFriendsRequest("sent"),
          ]);
        } else {
          // Charger seulement le type sélectionné
          await getFriendsRequest(activeFilter);
        }
      } catch (err) {
        // toast.error(err.message);
      } finally {
        setLocalLoading(false);
      }
    };

    loadRequests();
  }, [getFriendsRequest, activeFilter]);

  // Combiner les demandes pour le filtre "all"
  const allRequests = [...friendRequests, ...sentRequests];

  if (isLoading || localLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Chargement des demandes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <div className="flex border-b border-border">
          {[
            {
              id: "all" as RequestFilter,
              label: "Toutes",
              count: allRequests.length,
            },
            {
              id: "received" as RequestFilter,
              label: "Reçues",
              count: friendRequests.length,
            },
            {
              id: "sent" as RequestFilter,
              label: "Envoyées",
              count: sentRequests.length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
                activeFilter === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Contenu en fonction du filtre */}
      {activeFilter === "all" && allRequests.length > 0 && (
        <Card title="Toutes les demandes">
          <div className="space-y-4">
            {allRequests.map((request) => (
              <FriendRequestCard
                key={request.id}
                request={request}
                onAccept={acceptFriendRequest}
                onDecline={declineFriendRequest}
              />
            ))}
          </div>
        </Card>
      )}

      {activeFilter === "received" && friendRequests.length > 0 && (
        <Card title="Demandes reçues">
          <div className="space-y-4">
            {friendRequests.map((request) => (
              <FriendRequestCard
                key={request.id}
                request={request}
                onAccept={acceptFriendRequest}
                onDecline={declineFriendRequest}
              />
            ))}
          </div>
        </Card>
      )}

      {activeFilter === "sent" && sentRequests.length > 0 && (
        <Card title="Demandes envoyées">
          <div className="space-y-4">
            {sentRequests.map((request) => (
              <FriendRequestCard
                key={request.id}
                request={request}
                onAccept={acceptFriendRequest}
                onDecline={declineFriendRequest}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Aucune demande */}
      {(activeFilter === "all" && allRequests.length === 0) ||
      (activeFilter === "received" && friendRequests.length === 0) ||
      (activeFilter === "sent" && sentRequests.length === 0) ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {activeFilter === "all"
              ? "Aucune demande d'ami"
              : activeFilter === "received"
              ? "Aucune demande reçue"
              : "Aucune demande envoyée"}
          </h3>
          <p className="text-muted-foreground">
            {activeFilter === "all"
              ? "Les demandes d'amis que vous recevez et envoyez apparaîtront ici"
              : activeFilter === "received"
              ? "Les demandes d'amis que vous recevrez apparaîtront ici"
              : "Les demandes d'amis que vous envoyez apparaîtront ici"}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default RequestsTab;
