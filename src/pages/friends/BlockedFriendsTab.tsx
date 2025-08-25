import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Filter, Users } from "lucide-react";
import { useFriendsStore } from "../../stores/friends";
import { BlockFriendCard } from "../../components/friends/FriendCard";
import { BlockedFriendSort } from "../../types/friends"; // Importez le type correct

const BlockedFriendsTab: React.FC = () => {
  const {
    blockedFriends,
    blockedFriendsPagination,
    isBlockedFriendsLoading,
    blockedFriendsError,
    getBlockedFriends,
    unblockUser,
  } = useFriendsStore();

  const [sortBy, setSortBy] = useState<BlockedFriendSort>("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    const loadBlockedFriends = async () => {
      try {
        await getBlockedFriends({
          sort: sortBy,
          page: currentPage,
          limit,
        });
      } catch (error) {
        // toast.error("Erreur lors du chargement des amis bloqués");
      }
    };

    loadBlockedFriends();
  }, [getBlockedFriends, sortBy, currentPage, limit]);

  // Gérer les erreurs
  useEffect(() => {
    if (blockedFriendsError) {
      toast.error(blockedFriendsError);
    }
  }, [blockedFriendsError]);

  const handleUnblock = async (friendId: string) => {
    try {
      await unblockUser(friendId);
      toast.success("Utilisateur débloqué avec succès");
      // Recharger la liste après déblocage
      await getBlockedFriends({ sort: sortBy, page: currentPage, limit });
    } catch (error) {
      toast.error("Erreur lors du déblocage");
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isBlockedFriendsLoading && blockedFriends.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">
          Chargement des amis bloqués...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 items-center">
          <h2 className="text-2xl font-bold text-foreground">Amis bloqués</h2>

          {blockedFriendsPagination && (
            <span className="text-sm text-muted-foreground">
              {blockedFriendsPagination.total} ami(s) bloqué(s)
            </span>
          )}
        </div>

        <div className="flex gap-3 items-center">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as BlockedFriendSort);
              setCurrentPage(1); // Reset à la première page quand on change le tri
            }}
            className="input input-sm bg-background text-foreground border-border"
            disabled={isBlockedFriendsLoading}
          >
            <option value="name">Trier par nom</option>
            <option value="mutual">Amis mutuels</option>
            <option value="recent">Récemment bloqué</option>
          </select>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter size={14} />
            <span>{blockedFriends.length} affiché(s)</span>
          </div>
        </div>
      </div>

      {/* Liste des amis bloqués */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blockedFriends.map((friend) => (
          <BlockFriendCard
            key={friend.id}
            friend={friend}
            onUnblockUser={handleUnblock}
            isLoading={isBlockedFriendsLoading}
          />
        ))}
      </div>

      {/* Message vide */}
      {blockedFriends.length === 0 && !isBlockedFriendsLoading && (
        <div className="col-span-full text-center py-12">
          <Users size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aucun ami bloqué
          </h3>
          <p className="text-muted-foreground">
            Vous n'avez bloqué aucun utilisateur pour le moment
          </p>
        </div>
      )}

      {/* Pagination */}
      {blockedFriendsPagination && blockedFriendsPagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isBlockedFriendsLoading}
            className="px-4 py-2 bg-background border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          <span className="text-sm text-muted-foreground">
            Page {currentPage} sur {blockedFriendsPagination.pages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={
              currentPage === blockedFriendsPagination.pages ||
              isBlockedFriendsLoading
            }
            className="px-4 py-2 bg-background border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default BlockedFriendsTab;
