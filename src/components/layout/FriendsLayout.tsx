import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import FriendsStats from "../../components/friends/FriendsStats";
import AddFriendModal from "../../components/friends/AddFriendModal";
import Badge from "../../components/ui/Badge";
import { UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useFriendsStore } from "../../stores/friends";
import ActivityTab from "../../pages/friends/ActivityTab";
import DiscoverTab from "../../pages/friends/DiscoverTab";
import FriendsTab from "../../pages/friends/FriendsTab";
import RequestsTab from "../../pages/friends/RequestsTab";

const FriendsLayout: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);

  const { friendsStats, getFriendsStats } = useFriendsStore();

  const tabs = [
    { id: "friends", label: "Mes amis", count: 0 },
    { id: "requests", label: "Demandes", count: 0 },
    { id: "discover", label: "Découvrir", count: null },
    { id: "activity", label: "Activité", count: null },
  ] as const;

  type TabType = (typeof tabs)[number]["id"];

  // Get current tab from URL or default to "friends"
  const currentTab = (searchParams.get("tab") as TabType) || "friends";

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await getFriendsStats();
      } catch (error) {
        toast.error("Erreur lors du chargement des statistiques");
      }
    };

    loadInitialData();
  }, [getFriendsStats]);

  const handleTabChange = (tab: TabType) => {
    setSearchParams({ tab });
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case "friends":
        return <FriendsTab />;
      case "requests":
        return <RequestsTab />;
      case "discover":
        return <DiscoverTab />;
      case "activity":
        return <ActivityTab />;
      default:
        return <FriendsTab />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Amis</h1>
          <p className="text-muted-foreground">
            Connectez-vous avec d'autres coureurs et partagez votre progression
          </p>
        </div>
        <button
          onClick={() => setIsAddFriendModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <UserPlus size={16} />
          Ajouter un ami
        </button>
      </div>

      {/* Statistiques */}
      {friendsStats && <FriendsStats stats={friendsStats} />}

      {/* Onglets */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              currentTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <Badge variant="secondary" className="text-xs">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AddFriendModal
        isOpen={isAddFriendModalOpen}
        onClose={() => setIsAddFriendModalOpen(false)}
        onSendFriendRequest={function (
          email: string,
          message?: string
        ): Promise<boolean> {
          throw new Error("Function not implemented.");
        }}
        isLoading={false}
      />
    </div>
  );
};

export default FriendsLayout;
