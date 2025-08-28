import React, { useState } from "react";
import { toast } from "react-toastify";
import { Search } from "lucide-react";
import { useFriendsStore } from "../../stores/friends";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import UserSearchResults from "../../components/friends/UserSearchResults";

const DiscoverTab: React.FC = () => {
  const {
    searchResults,
    isSearching,
    searchUsers,
    clearSearchResults,
    sendFriendRequest,
  } = useFriendsStore();

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchUsers(query);
    } else {
      clearSearchResults();
    }
  };

  const handleSendFriendRequest = async (email: string) => {
    try {
      const success = await sendFriendRequest(email);
      if (success) {
        toast.success("Demande d'ami envoyée avec succès !");
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la demande d'ami");
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Rechercher des utilisateurs">
        <div className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="pl-10"
              disabled={isSearching}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={16}
            />
          </div>

          <UserSearchResults
            results={searchResults}
            isSearching={isSearching}
            onSendFriendRequest={handleSendFriendRequest}
            searchQuery={searchQuery}
          />
        </div>
      </Card>
    </div>
  );
};

export default DiscoverTab;
