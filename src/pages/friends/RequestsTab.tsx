import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useFriendsStore } from "../../stores/friends";
import FriendRequestCard from "../../components/friends/FriendRequestCard";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

// Types pour les filtres
type RequestFilter = "all" | "received" | "sent";

const RequestsTab: React.FC = () => {
  const {
    friendRequests, // Contient toutes les demandes avec champ 'type'
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
        // Charger seulement le type sélectionné
        await getFriendsRequest(activeFilter);
      } catch (err) {
        console.error("Error loading requests:", err);
      } finally {
        setLocalLoading(false);
      }
    };

    loadRequests();
  }, [getFriendsRequest, activeFilter]);

  // Filtrer les demandes selon le filtre actif
  const filteredRequests = friendRequests.filter((request) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "received") return request.type === "received";
    if (activeFilter === "sent") return request.type === "sent";
    return true;
  });

  // Compter les demandes par type pour les badges
  const receivedCount = friendRequests.filter(
    (r) => r.type === "received"
  ).length;
  const sentCount = friendRequests.filter((r) => r.type === "sent").length;

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
              count: friendRequests.length,
            },
            {
              id: "received" as RequestFilter,
              label: "Reçues",
              count: receivedCount,
            },
            {
              id: "sent" as RequestFilter,
              label: "Envoyées",
              count: sentCount,
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
      {filteredRequests.length > 0 && (
        <Card
          title={
            activeFilter === "all"
              ? "Toutes les demandes"
              : activeFilter === "received"
              ? "Demandes reçues"
              : "Demandes envoyées"
          }
        >
          <div className="space-y-4">
            {filteredRequests.map((request) => (
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
      {filteredRequests.length === 0 && (
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
      )}
    </div>
  );
};

export default RequestsTab;
