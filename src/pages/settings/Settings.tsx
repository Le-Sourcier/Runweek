import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUserContext } from "../../hooks/useUser";
import { useTheme } from "../../context/ThemeContext";
import Card from "../../components/ui/Card";
import ThemePreview from "../../components/ui/ThemePreview";
import Button from "../../components/ui/Button";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Smartphone,
  CreditCard,
  HelpCircle,
  Moon,
  Sun,
  Monitor,
  AlertTriangle,
  Activity,
  Clock,
  MessageSquare,
  Download,
  Wifi,
  Plus,
  CreditCard as CardIcon,
  FileText,
  ExternalLink,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { ToggleSwitch } from "../../components/ui/ToggleSwitch";
import { AccountTab } from "./tabs/AccountTab";
import { NotificationTab } from "./tabs/NotificationTab";
import { PrivacyTab } from "./tabs/PrivacyTab";
import { LanguageTab } from "./tabs/LanguageTab";
import { AppearanceTab } from "./tabs/AppearanceTab";

export default function Settings() {
  const { user, updateUserPreferences } = useUserContext();
 
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get initial tab and section from URL params
  const initialTab = searchParams.get('tab') || 'account';

  const [activeTab, setActiveTab] = useState(initialTab);

  const [dataSharing, setDataSharing] = useState({
    enabled: user?.preferences?.dataSharing?.enabled || false,
    shareNutrition: user?.preferences?.dataSharing?.shareNutrition || false,
    shareActivities: user?.preferences?.dataSharing?.shareActivities || false,
    shareGoals: user?.preferences?.dataSharing?.shareGoals || false,
    shareAchievements: user?.preferences?.dataSharing?.shareAchievements || false,
    allowFriendRequests: user?.preferences?.dataSharing?.allowFriendRequests || false,
    showInSearch: user?.preferences?.dataSharing?.showInSearch || false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };


  // @ts-ignore
  const handleDataSharingToggle = (key: keyof typeof dataSharing, value: boolean) => {
    const newDataSharing = { ...dataSharing, [key]: value };

    setDataSharing(newDataSharing);

    // If disabling main sharing, disable all sub-options
    if (key === 'enabled' && !value) {
      newDataSharing.shareNutrition = false;
      newDataSharing.shareActivities = false;
      newDataSharing.shareGoals = false;
      newDataSharing.shareAchievements = false;
      newDataSharing.allowFriendRequests = false;
      newDataSharing.showInSearch = false;
    }

    // @ts-ignore
    updateUserPreferences({
      ...user?.preferences,
      dataSharing: newDataSharing,
    });

    toast.success('Paramètres de partage mis à jour');
  };

  const handleAccountDeletion = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // if (deleteUser) {
      //   deleteUser();
      // }

      toast.success('Compte supprimé avec succès');
      navigate('/login');
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte');
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
    {
      id: "support",
      title: "Aide",
      description: "Obtenez de l'aide et contactez le support",
      icon: <HelpCircle size={20} />,
    },
  ];
  
  const connectedDevices = [
    {
      id: 'device1',
      name: 'iPhone 15 Pro',
      type: 'Smartphone',
      status: 'connected',
      lastSync: '2025-01-20T10:30:00Z',
      battery: 85,
    },
    {
      id: 'device2',
      name: 'Apple Watch Series 9',
      type: 'Smartwatch',
      status: 'connected',
      lastSync: '2025-01-20T09:15:00Z',
      battery: 72,
    },
    {
      id: 'device3',
      name: 'Garmin Forerunner 955',
      type: 'GPS Watch',
      status: 'disconnected',
      lastSync: '2025-01-18T14:20:00Z',
      battery: null,
    },
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
              className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === section.id
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
          {activeTab === "appearance" && ( <AppearanceTab />)}

          {/* Language & Region Settings */}
          {activeTab === "language" && <LanguageTab />}

          {/* Devices Settings */}
          {activeTab === "devices" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card title="Appareils connectés" className="bg-card text-card-foreground border-border">
                <div className="space-y-4">
                  {connectedDevices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${device.status === 'connected' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {device.type === 'Smartphone' ? <Smartphone size={20} /> :
                            device.type === 'Smartwatch' ? <Clock size={20} /> :
                              <Activity size={20} />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{device.name}</h4>
                          <p className="text-sm text-muted-foreground">{device.type}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${device.status === 'connected'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                              }`}>
                              {device.status === 'connected' ? 'Connecté' : 'Déconnecté'}
                            </span>
                            {device.battery && (
                              <span className="text-xs text-muted-foreground">
                                Batterie: {device.battery}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Sync: {new Date(device.lastSync).toLocaleDateString()}
                        </span>
                        <Button variant="outline" size="sm">
                          {device.status === 'connected' ? 'Déconnecter' : 'Reconnecter'}
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-border pt-4">
                    <Button className="w-full flex items-center justify-center gap-2">
                      <Wifi size={16} />
                      Ajouter un nouvel appareil
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Sync Settings */}
              <Card title="Synchronisation" className="bg-card text-card-foreground border-border">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-foreground">Synchronisation automatique</h4>
                      <p className="text-sm text-muted-foreground">
                        Synchroniser automatiquement vos données
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={user?.preferences?.syncSettings?.autoSync !== false}
                      onChange={(value) =>
                        updateUserPreferences({
                          ...user?.preferences,
                          syncSettings: {
                            ...user?.preferences?.syncSettings,
                            autoSync: value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-foreground">Sync en arrière-plan</h4>
                      <p className="text-sm text-muted-foreground">
                        Synchroniser même quand l'app est fermée
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={user?.preferences?.syncSettings?.backgroundSync || false}
                      onChange={(value) =>
                        updateUserPreferences({
                          ...user?.preferences,
                          syncSettings: {
                            ...user?.preferences?.syncSettings,
                            backgroundSync: value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-foreground">Dernière synchronisation</h4>
                      <p className="text-sm text-muted-foreground">
                        Il y a 5 minutes
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <RefreshCw size={14} />
                      Synchroniser maintenant
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Billing Settings */}
          {activeTab === "billing" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card title="Abonnement actuel" className="bg-card text-card-foreground border-border">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-foreground">Plan Premium</h4>
                      <p className="text-sm text-muted-foreground">Accès complet à toutes les fonctionnalités</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">9,99€/mois</p>
                      <p className="text-xs text-muted-foreground">Renouvelé le 25/02/2025</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-background rounded-lg border border-border">
                      <CheckCircle size={24} className="mx-auto text-green-500 mb-2" />
                      <p className="text-sm font-medium text-foreground">Coach IA illimité</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg border border-border">
                      <CheckCircle size={24} className="mx-auto text-green-500 mb-2" />
                      <p className="text-sm font-medium text-foreground">Analyses avancées</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg border border-border">
                      <CheckCircle size={24} className="mx-auto text-green-500 mb-2" />
                      <p className="text-sm font-medium text-foreground">Synchronisation multi-appareils</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">
                      Changer de plan
                    </Button>
                    <Button variant="destructive" className="flex-1">
                      Annuler l'abonnement
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Payment Methods */}
              <Card title="Méthodes de paiement" className="bg-card text-card-foreground border-border">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <CardIcon size={20} className="text-primary" />
                      <div>
                        <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expire 12/2027</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Modifier</Button>
                      <Button variant="destructive" size="sm">Supprimer</Button>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Plus size={16} className="mr-2" />
                    Ajouter une méthode de paiement
                  </Button>
                </div>
              </Card>

              {/* Billing History */}
              <Card title="Historique de facturation" className="bg-card text-card-foreground border-border">
                <div className="space-y-3">
                  {[
                    { date: '2025-01-20', amount: '9,99€', status: 'Payé', invoice: 'INV-2025-001' },
                    { date: '2024-12-20', amount: '9,99€', status: 'Payé', invoice: 'INV-2024-012' },
                    { date: '2024-11-20', amount: '9,99€', status: 'Payé', invoice: 'INV-2024-011' },
                  ].map((bill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-foreground">{bill.invoice}</p>
                        <p className="text-sm text-muted-foreground">{bill.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">{bill.amount}</span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          {bill.status}
                        </span>
                        <Button variant="outline" size="sm">
                          <Download size={14} className="mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Support Settings */}
          {activeTab === "support" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card title="Centre d'aide" className="bg-card text-card-foreground border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Ressources</h4>
                    <div className="space-y-3">
                      <button className="w-full p-3 text-left border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-primary" />
                          <div>
                            <p className="font-medium text-foreground">Guide d'utilisation</p>
                            <p className="text-sm text-muted-foreground">Apprenez à utiliser toutes les fonctionnalités</p>
                          </div>
                          <ExternalLink size={14} className="ml-auto text-muted-foreground" />
                        </div>
                      </button>
                      <button className="w-full p-3 text-left border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <MessageSquare size={18} className="text-primary" />
                          <div>
                            <p className="font-medium text-foreground">FAQ</p>
                            <p className="text-sm text-muted-foreground">Réponses aux questions fréquentes</p>
                          </div>
                          <ExternalLink size={14} className="ml-auto text-muted-foreground" />
                        </div>
                      </button>
                      <button className="w-full p-3 text-left border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <HelpCircle size={18} className="text-primary" />
                          <div>
                            <p className="font-medium text-foreground">Contacter le support</p>
                            <p className="text-sm text-muted-foreground">Obtenez de l'aide personnalisée</p>
                          </div>
                          <ExternalLink size={14} className="ml-auto text-muted-foreground" />
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Informations système</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Version de l'app</span>
                        <span className="font-medium text-foreground">2.1.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dernière mise à jour</span>
                        <span className="font-medium text-foreground">20/01/2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plateforme</span>
                        <span className="font-medium text-foreground">Web</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID utilisateur</span>
                        <span className="font-medium text-foreground font-mono text-xs">{user?.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Feedback */}
              <Card title="Votre avis compte" className="bg-card text-card-foreground border-border">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Aidez-nous à améliorer Runweek en partageant vos commentaires
                  </p>
                  <textarea
                    placeholder="Partagez vos suggestions, signaler un bug, ou dites-nous ce que vous aimez..."
                    className="input w-full h-24 resize-none"
                  />
                  <div className="flex gap-3">
                    <Button className="flex-1">
                      Envoyer un commentaire
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Signaler un problème
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
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
                    <h3 className="text-lg font-semibold text-foreground">Supprimer le compte</h3>
                    <p className="text-muted-foreground mt-2">
                      Êtes-vous sûr de vouloir supprimer définitivement votre compte ?
                      Cette action ne peut pas être annulée.
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
                      {isLoading ? 'Suppression...' : 'Supprimer définitivement'}
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