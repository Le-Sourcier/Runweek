import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUserContext } from "../../hooks/useUser";
import Button from "../../components/ui/Button";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Smartphone,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { AccountTab } from "./tabs/AccountTab";
import { NotificationTab } from "./tabs/NotificationTab";
import { PrivacyTab } from "./tabs/PrivacyTab";
import { LanguageTab } from "./tabs/LanguageTab";
import { AppearanceTab } from "./tabs/AppearanceTab";
import { DeviceTab } from "./tabs/DeviceTab";
import { BillingTab } from "./tabs/BillingTab";
import { SupportTab } from "./tabs/SupprtTab";

export default function Settings() {
  const { user, updateUserPreferences } = useUserContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get initial tab and section from URL params
  const initialTab = searchParams.get("tab") || "account";

  const [activeTab, setActiveTab] = useState(initialTab);

  const [dataSharing, setDataSharing] = useState({
    enabled: user?.preferences?.enabled || false,
    shareNutrition: user?.preferences?.shareNutrition || false,
    shareActivities: user?.preferences?.shareActivities || false,
    shareGoals: user?.preferences?.shareGoals || false,
    shareAchievements: user?.preferences?.shareAchievements || false,
    allowFriendRequests: user?.preferences?.allowFriendRequests || false,
    showInSearch: user?.preferences?.showInSearch || false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // @ts-ignore
  const handleDataSharingToggle = (
    key: keyof typeof dataSharing,
    value: boolean
  ) => {
    const newDataSharing = { ...dataSharing, [key]: value };

    setDataSharing(newDataSharing);

    // If disabling main sharing, disable all sub-options
    if (key === "enabled" && !value) {
      newDataSharing.shareNutrition = false;
      newDataSharing.shareActivities = false;
      newDataSharing.shareGoals = false;
      newDataSharing.shareAchievements = false;
      newDataSharing.allowFriendRequests = false;
      newDataSharing.showInSearch = false;
    }

    updateUserPreferences({
      ...user?.preferences,
      ...newDataSharing,
    });

    toast.success("Paramètres de partage mis à jour");
  };

  const handleAccountDeletion = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // if (deleteUser) {
      //   deleteUser();
      // }

      toast.success("Compte supprimé avec succès");
      navigate("/login");
    } catch (error) {
      toast.error("Erreur lors de la suppression du compte");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const settingsSections = [
    {
      id: "account",
      title: "Compte",
      description: "Gérez vos informations personnelles et votre sécurité",
      icon: <User size={20} />,
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Configurez vos préférences de notifications",
      icon: <Bell size={20} />,
    },
    {
      id: "privacy",
      title: "Confidentialité",
      description: "Contrôlez le partage de vos données et votre visibilité",
      icon: <Shield size={20} />,
    },
    {
      id: "appearance",
      title: "Apparence",
      description: "Personnalisez l'apparence de l'application",
      icon: <Palette size={20} />,
    },
    {
      id: "language",
      title: "Langue & Région",
      description: "Définissez votre langue et région préférées",
      icon: <Globe size={20} />,
    },
    {
      id: "devices",
      title: "Appareils",
      description: "Gérez vos appareils connectés",
      icon: <Smartphone size={20} />,
    },
    {
      id: "billing",
      title: "Facturation",
      description: "Gérez votre abonnement et vos paiements",
      icon: <CreditCard size={20} />,
    },
    // {
    //   id: "support",
    //   title: "Aide",
    //   description: "Obtenez de l'aide et contactez le support",
    //   icon: <HelpCircle size={20} />,
    // },
  ];

  return (
    <main className="flex-1 p-4 md:p-6 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez vos préférences et paramètres de compte
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border overflow-x-auto">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleTabChange(section.id)}
              className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === section.id
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted"
              }`}
            >
              <span className="flex items-center gap-2">
                {section.icon}
                {section.title}
              </span>
            </button>
          ))}
        </div>

        {/* Settings content */}
        <div className="space-y-6">
          {/* Account Settings */}
          {activeTab === "account" && <AccountTab />}

          {/* Notifications Settings */}
          {activeTab === "notifications" && <NotificationTab />}

          {/* Privacy Settings */}
          {activeTab === "privacy" && <PrivacyTab />}

          {/* Appearance Settings */}
          {activeTab === "appearance" && <AppearanceTab />}

          {/* Language & Region Settings */}
          {activeTab === "language" && <LanguageTab />}

          {/* Devices Settings */}
          {activeTab === "devices" && <DeviceTab />}

          {/* Billing Settings */}
          {activeTab === "billing" && <BillingTab />}

          {/* Support Settings */}
          {activeTab === "support" && <SupportTab />}
        </div>

        {/* Delete Account Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card text-card-foreground rounded-lg shadow-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle size={32} className="text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Supprimer le compte
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Êtes-vous sûr de vouloir supprimer définitivement votre
                      compte ? Cette action ne peut pas être annulée.
                    </p>
                  </div>
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm text-destructive font-medium">
                      Toutes vos données seront supprimées :
                    </p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                      <li>• Profil et informations personnelles</li>
                      <li>• Historique des courses et activités</li>
                      <li>• Objectifs et réalisations</li>
                      <li>• Données nutritionnelles</li>
                      <li>• Connexions sociales</li>
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleAccountDeletion}
                      // isLoading={isLoading}
                      className="flex-1"
                    >
                      {isLoading
                        ? "Suppression..."
                        : "Supprimer définitivement"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
