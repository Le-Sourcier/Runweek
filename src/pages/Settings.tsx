import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useTheme } from "../context/ThemeContext";
import Card from "../components/ui/Card";
import ThemePreview from "../components/ui/ThemePreview";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Smartphone,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Check,
  Users,
  Share2,
  Eye,
  EyeOff,
  AlertTriangle,
  Activity,
  Target,
  Award,
  Utensils,
  MapPin,
  Clock,
  Mail,
  MessageSquare,
  Download,
  Trash2,
  Lock,
  Key,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Languages,
  Calendar,
  Plus,
  DollarSign,
  CreditCard as CardIcon,
  FileText,
  ExternalLink,
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  LogOut,
  UserX,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function Settings() {
  const { user, updateUserPreferences, logout, deleteUser } = useUser();
  const { theme, setTheme, colorPalette, setColorPalette } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get initial tab and section from URL params
  const initialTab = searchParams.get('tab') || 'account';
  const initialSection = searchParams.get('section');
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedSection, setExpandedSection] = useState<string | null>(initialSection);

  // Form states for various settings
  const [accountForm, setAccountForm] = useState({
    firstName: user?.fname || '',
    lastName: user?.lname || '',
    email: user?.email || '',
    phone: '',
    bio: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationForm, setNotificationForm] = useState({
    email: user?.preferences?.notificationSettings?.email || true,
    push: user?.preferences?.notificationSettings?.push || true,
    achievements: user?.preferences?.notificationSettings?.achievements || true,
    reminders: user?.preferences?.notificationSettings?.reminders || true,
    updates: user?.preferences?.notificationSettings?.updates || false,
    weeklyReport: true,
    socialActivity: true,
    coachTips: true,
  });

  const [languageForm, setLanguageForm] = useState({
    language: user?.preferences?.language || 'fr',
    region: user?.preferences?.region || 'FR',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  });

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
    setExpandedSection(null);
  };

  // Handle direct navigation to specific sections
  useEffect(() => {
    if (initialSection) {
      setExpandedSection(initialSection);
    }
  }, [initialSection]);

  // Initialize forms when user data changes
  useEffect(() => {
    if (user) {
      setAccountForm({
        firstName: user.fname || '',
        lastName: user.lname || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
      
      setNotificationForm({
        email: user.preferences?.notificationSettings?.email || true,
        push: user.preferences?.notificationSettings?.push || true,
        achievements: user.preferences?.notificationSettings?.achievements || true,
        reminders: user.preferences?.notificationSettings?.reminders || true,
        updates: user.preferences?.notificationSettings?.updates || false,
        weeklyReport: user.preferences?.notificationSettings?.weeklyReport || true,
        socialActivity: user.preferences?.notificationSettings?.socialActivity || true,
        coachTips: user.preferences?.notificationSettings?.coachTips || true,
      });

      setLanguageForm({
        language: user.preferences?.language || 'fr',
        region: user.preferences?.region || 'FR',
        timezone: user.preferences?.timezone || 'Europe/Paris',
        dateFormat: user.preferences?.dateFormat || 'DD/MM/YYYY',
        timeFormat: user.preferences?.timeFormat || '24h',
      });
    }
  }, [user]);

  const handleDataSharingToggle = (key: keyof typeof dataSharing, value: boolean) => {
    const newDataSharing = { ...dataSharing, [key]: value };
    
    // If disabling main sharing, disable all sub-options
    if (key === 'enabled' && !value) {
      newDataSharing.shareNutrition = false;
      newDataSharing.shareActivities = false;
      newDataSharing.shareGoals = false;
      newDataSharing.shareAchievements = false;
      newDataSharing.allowFriendRequests = false;
      newDataSharing.showInSearch = false;
    }

    updateUserPreferences({
      ...user?.preferences,
      dataSharing: newDataSharing,
    });

    toast.success('Paramètres de partage mis à jour');
  };

  const handleShareNutritionChange = (shareNutrition: boolean) => {
    const newDataSharing = { ...dataSharing, shareNutrition };
    setDataSharing(newDataSharing);
    updateUserPreferences({
      ...user?.preferences,
      dataSharing: newDataSharing,
    });
  };

  const handleShareActivitiesChange = (shareActivities: boolean) => {
    const newDataSharing = { ...dataSharing, shareActivities };
    setDataSharing(newDataSharing);
    updateUserPreferences({
      ...user?.preferences,
      dataSharing: newDataSharing,
    });
  };

  const handleShareGoalsChange = (shareGoals: boolean) => {
    const newDataSharing = { ...dataSharing, shareGoals };
    setDataSharing(newDataSharing);
    updateUserPreferences({
      ...user?.preferences,
      dataSharing: newDataSharing,
    });
  };

  const handleShareAchievementsChange = (shareAchievements: boolean) => {
    const newDataSharing = { ...dataSharing, shareAchievements };
    setDataSharing(newDataSharing);
    updateUserPreferences({
      ...user?.preferences,
      dataSharing: newDataSharing,
    });
  };

  const handleAllowFriendRequestsChange = (allowFriendRequests: boolean) => {
    const newDataSharing = { ...dataSharing, allowFriendRequests };
    setDataSharing(newDataSharing);
    updateUserPreferences({
      ...user?.preferences,
      dataSharing: newDataSharing,
    });
  };

  const handleShowInSearchChange = (showInSearch: boolean) => {
    const newDataSharing = { ...dataSharing, showInSearch };
    setDataSharing(newDataSharing);
    updateUserPreferences({
      ...user?.preferences,
      dataSharing: newDataSharing,
    });
  };

  const handleAccountUpdate = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUserPreferences({
        ...user?.preferences,
        personalInfo: accountForm,
      });
      
      toast.success('Informations personnelles mises à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast.success('Mot de passe modifié avec succès');
    } catch (error) {
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = () => {
    updateUserPreferences({
      ...user?.preferences,
      notificationSettings: notificationForm,
    });
    toast.success('Préférences de notifications mises à jour');
  };

  const handleLanguageUpdate = () => {
    updateUserPreferences({
      ...user?.preferences,
      ...languageForm,
    });
    toast.success('Paramètres de langue et région mis à jour');
  };

  const handleAccountDeletion = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (deleteUser) {
        deleteUser();
      }
      
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

  const colorPalettes = [
    { id: "default", name: "Défaut", primary: "#6366F1", secondary: "#10B981" },
    { id: "blue", name: "Bleu", primary: "#3B82F6", secondary: "#06B6D4" },
    { id: "green", name: "Vert", primary: "#10B981", secondary: "#84CC16" },
    { id: "purple", name: "Violet", primary: "#8B5CF6", secondary: "#EC4899" },
    { id: "orange", name: "Orange", primary: "#F97316", secondary: "#EAB308" },
    { id: "red", name: "Rouge", primary: "#EF4444", secondary: "#F97316" },
  ];

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  ];

  const regions = [
    { code: 'FR', name: 'France', currency: 'EUR' },
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'CA', name: 'Canada', currency: 'CAD' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
    { code: 'DE', name: 'Germany', currency: 'EUR' },
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

  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    disabled = false 
  }: { 
    checked: boolean; 
    onChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <label
        className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors ${
          disabled 
            ? 'bg-gray-300 cursor-not-allowed' 
            : checked 
              ? "bg-primary" 
              : "bg-muted"
        }`}
      >
        <span
          className={`block h-6 w-6 rounded-full bg-card shadow transform transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-6" : ""
          }`}
        ></span>
      </label>
    </div>
  );

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
          {activeTab === "account" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Personal Information */}
              <Card title="Informations personnelles" className="bg-card text-card-foreground border-border">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={user?.profileImage}
                      alt={user?.fname}
                      className="w-20 h-20 rounded-full object-cover border-4 border-border"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{user?.fname} {user?.lname}</h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                      <p className="text-sm text-muted-foreground">Membre depuis {new Date(user?.updatedAt || '').toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Prénom</label>
                      <Input
                        value={accountForm.firstName}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Nom</label>
                      <Input
                        value={accountForm.lastName}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <Input
                      type="email"
                      value={accountForm.email}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Téléphone</label>
                    <Input
                      type="tel"
                      value={accountForm.phone}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                    <textarea
                      value={accountForm.bio}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Parlez-nous de vous et de vos objectifs de course..."
                      className="input w-full h-24 resize-none"
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{accountForm.bio.length}/200 caractères</p>
                  </div>

                  <Button onClick={handleAccountUpdate} isLoading={isLoading} className="w-full md:w-auto">
                    <Save size={16} className="mr-2" />
                    Sauvegarder les modifications
                  </Button>
                </div>
              </Card>

              {/* Security Settings */}
              <Card title="Sécurité" className="bg-card text-card-foreground border-border">
                <div className="space-y-6">
                  {/* Password Change */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Key size={18} />
                      Changer le mot de passe
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Mot de passe actuel</label>
                        <Input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Votre mot de passe actuel"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Nouveau mot de passe</label>
                          <Input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="Nouveau mot de passe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Confirmer le mot de passe</label>
                          <Input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirmer le mot de passe"
                          />
                        </div>
                      </div>
                      <Button onClick={handlePasswordChange} isLoading={isLoading} variant="outline">
                        <Lock size={16} className="mr-2" />
                        Changer le mot de passe
                      </Button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="border-t border-border pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <Shield size={18} />
                          Authentification à deux facteurs
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ajoutez une couche de sécurité supplémentaire à votre compte
                        </p>
                      </div>
                      <ToggleSwitch
                        checked={user?.preferences?.isTwoFactorEnabled || false}
                        onChange={(value) =>
                          updateUserPreferences({
                            ...user?.preferences,
                            isTwoFactorEnabled: value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Session Management */}
                  <div className="border-t border-border pt-6">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Activity size={18} />
                      Sessions actives
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-foreground">Session actuelle</p>
                            <p className="text-sm text-muted-foreground">Chrome sur Windows • Paris, France</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">Maintenant</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <div>
                            <p className="font-medium text-foreground">iPhone App</p>
                            <p className="text-sm text-muted-foreground">iOS • Paris, France</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Il y a 2h</span>
                          <Button variant="outline" size="sm">Déconnecter</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card title="Zone de danger" className="bg-card text-card-foreground border-destructive">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <AlertTriangle size={20} className="text-destructive mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-destructive">Supprimer le compte</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <Button 
                        variant="destructive" 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2"
                      >
                        <UserX size={16} />
                        Supprimer mon compte
                      </Button>
                    </div>
                    <Button variant="outline" onClick={logout} className="flex items-center gap-2">
                      <LogOut size={16} />
                      Se déconnecter
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card title="Préférences de notifications" className="bg-card text-card-foreground border-border">
                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Mail size={18} />
                      Notifications par email
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">Notifications générales</p>
                          <p className="text-sm text-muted-foreground">Mises à jour importantes et alertes de sécurité</p>
                        </div>
                        <ToggleSwitch
                          checked={notificationForm.email}
                          onChange={(value) => setNotificationForm(prev => ({ ...prev, email: value }))}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">Rapport hebdomadaire</p>
                          <p className="text-sm text-muted-foreground">Résumé de vos activités et progrès</p>
                        </div>
                        <ToggleSwitch
                          checked={notificationForm.weeklyReport}
                          onChange={(value) => setNotificationForm(prev => ({ ...prev, weeklyReport: value }))}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">Conseils du coach</p>
                          <p className="text-sm text-muted-foreground">Recommandations personnalisées de l'IA</p>
                        </div>
                        <ToggleSwitch
                          checked={notificationForm.coachTips}
                          onChange={(value) => setNotificationForm(prev => ({ ...prev, coachTips: value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className="border-t border-border pt-6">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Smartphone size={18} />
                      Notifications push
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">Notifications push</p>
                          <p className="text-sm text-muted-foreground">Alertes en temps réel sur votre appareil</p>
                        </div>
                        <ToggleSwitch
                          checked={notificationForm.push}
                          onChange={(value) => setNotificationForm(prev => ({ ...prev, push: value }))}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">Réalisations</p>
                          <p className="text-sm text-muted-foreground">Nouveaux badges et accomplissements</p>
                        </div>
                        <ToggleSwitch
                          checked={notificationForm.achievements}
                          onChange={(value) => setNotificationForm(prev => ({ ...prev, achievements: value }))}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">Rappels d'entraînement</p>
                          <p className="text-sm text-muted-foreground">Rappels pour vos courses programmées</p>
                        </div>
                        <ToggleSwitch
                          checked={notificationForm.reminders}
                          onChange={(value) => setNotificationForm(prev => ({ ...prev, reminders: value }))}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">Activité sociale</p>
                          <p className="text-sm text-muted-foreground">Likes, commentaires et nouvelles connexions</p>
                        </div>
                        <ToggleSwitch
                          checked={notificationForm.socialActivity}
                          onChange={(value) => setNotificationForm(prev => ({ ...prev, socialActivity: value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleNotificationUpdate} className="w-full md:w-auto">
                      <Save size={16} className="mr-2" />
                      Sauvegarder les préférences
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Privacy Settings */}
          {activeTab === "privacy" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Data Sharing */}
              <Card title="Partage de données" className="bg-card text-card-foreground border-border">
                <div className="space-y-6">
                  {/* Main data sharing toggle */}
                  <div 
                    className={`p-4 rounded-lg border-2 transition-all ${
                      expandedSection === 'dataSharing' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <Share2 size={18} />
                          Partage de données principal
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Activez cette option pour pouvoir partager vos données avec d'autres utilisateurs
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={dataSharing?.enabled || false}
                          onChange={(e) => {
                            const newEnabled = e.target.checked;
                            const newDataSharing = {
                              ...dataSharing,
                              enabled: newEnabled,
                              // Si on désactive le partage principal, désactiver toutes les sous-options
                              ...(newEnabled ? {} : {
                                shareNutrition: false,
                                shareActivities: false,
                                shareGoals: false,
                                shareAchievements: false,
                                allowFriendRequests: false,
                                showInSearch: false,
                              })
                            };
                            setDataSharing(newDataSharing);
                            
                            // Sauvegarder immédiatement
                            if (user && updateUserPreferences) {
                              updateUserPreferences({
                                ...user.preferences,
                                dataSharing: newDataSharing
                              });
                            }
                          }}
                        />
                        <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                          dataSharing?.enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-200 ease-in-out ${
                            dataSharing?.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}></div>
                        </div>
                      </label>
                    </div>

                    {!dataSharing.enabled && (
                      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                              Partage désactivé
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                              Vous ne pourrez pas partager de contenu, être trouvé par d'autres utilisateurs, ou accéder aux fonctionnalités sociales.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sub-options (only when main sharing is enabled) */}
                  <AnimatePresence>
                    {dataSharing.enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 pl-4 border-l-2 border-primary/20"
                      >
                        <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                          <div>
                            <h5 className="font-medium text-foreground flex items-center gap-2">
                              <Utensils size={16} />
                              Partage nutritionnel
                            </h5>
                            <p className="text-xs text-muted-foreground">
                              Partagez vos repas et analyses nutritionnelles avec vos amis
                            </p>
                          </div>
                          <ToggleSwitch
                            checked={dataSharing.shareNutrition}
                            onChange={handleShareNutritionChange}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                          <div>
                            <h5 className="font-medium text-foreground flex items-center gap-2">
                              <Activity size={16} />
                              Partage d'activités
                            </h5>
                            <p className="text-xs text-muted-foreground">
                              Partagez vos courses et entraînements
                            </p>
                          </div>
                          <ToggleSwitch
                            checked={dataSharing.shareActivities}
                            onChange={handleShareActivitiesChange}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                          <div>
                            <h5 className="font-medium text-foreground flex items-center gap-2">
                              <Target size={16} />
                              Partage d'objectifs
                            </h5>
                            <p className="text-xs text-muted-foreground">
                              Partagez vos objectifs et progrès avec la communauté
                            </p>
                          </div>
                          <ToggleSwitch
                            checked={dataSharing.shareGoals}
                            onChange={handleShareGoalsChange}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                          <div>
                            <h5 className="font-medium text-foreground flex items-center gap-2">
                              <Award size={16} />
                              Partage de réalisations
                            </h5>
                            <p className="text-xs text-muted-foreground">
                              Partagez vos badges et accomplissements
                            </p>
                          </div>
                          <ToggleSwitch
                            checked={dataSharing.shareAchievements}
                            onChange={handleShareAchievementsChange}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                          <div>
                            <h5 className="font-medium text-foreground flex items-center gap-2">
                              <Users size={16} />
                              Demandes d'amis
                            </h5>
                            <p className="text-xs text-muted-foreground">
                              Autorisez les autres utilisateurs à vous envoyer des demandes d'amis
                            </p>
                          </div>
                          <ToggleSwitch
                            checked={dataSharing.allowFriendRequests}
                            onChange={handleAllowFriendRequestsChange}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                          <div>
                            <h5 className="font-medium text-foreground flex items-center gap-2">
                              <Eye size={16} />
                              Visible dans la recherche
                            </h5>
                            <p className="text-xs text-muted-foreground">
                              Permettez aux autres de vous trouver par recherche
                            </p>
                          </div>
                          <ToggleSwitch
                            checked={dataSharing.showInSearch}
                            onChange={handleShowInSearchChange}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Privacy summary */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Info size={16} />
                      Résumé de confidentialité
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        {dataSharing.enabled ? (
                          <CheckCircle size={14} className="text-green-500" />
                        ) : (
                          <XCircle size={14} className="text-red-500" />
                        )}
                        <span className="text-muted-foreground">
                          Partage {dataSharing.enabled ? 'activé' : 'désactivé'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {dataSharing.showInSearch ? (
                          <Eye size={14} className="text-green-500" />
                        ) : (
                          <EyeOff size={14} className="text-gray-500" />
                        )}
                        <span className="text-muted-foreground">
                          {dataSharing.showInSearch ? 'Trouvable' : 'Non trouvable'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {dataSharing.allowFriendRequests ? (
                          <Users size={14} className="text-green-500" />
                        ) : (
                          <UserX size={14} className="text-gray-500" />
                        )}
                        <span className="text-muted-foreground">
                          Demandes d'amis {dataSharing.allowFriendRequests ? 'autorisées' : 'bloquées'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {Object.values(dataSharing).filter(Boolean).length - 1}/6 types de contenu partagés
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Profile Visibility */}
              <Card title="Visibilité du profil" className="bg-card text-card-foreground border-border">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-foreground">Visibilité des activités</h4>
                      <p className="text-sm text-muted-foreground">
                        Qui peut voir vos activités de course
                      </p>
                    </div>
                    <select
                      value={user?.preferences?.activityVisibility || 'friends'}
                      onChange={(e) =>
                        updateUserPreferences({
                          ...user?.preferences,
                          activityVisibility: e.target.value as any,
                        })
                      }
                      className="input w-32"
                    >
                      <option value="only_me">Moi seul</option>
                      <option value="friends">Amis</option>
                      <option value="public">Public</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-foreground">Visibilité du profil</h4>
                      <p className="text-sm text-muted-foreground">
                        Qui peut voir votre profil complet
                      </p>
                    </div>
                    <select
                      value={user?.preferences?.profileVisibility || 'friends'}
                      onChange={(e) =>
                        updateUserPreferences({
                          ...user?.preferences,
                          profileVisibility: e.target.value as any,
                        })
                      }
                      className="input w-32"
                    >
                      <option value="only_me">Moi seul</option>
                      <option value="friends">Amis</option>
                      <option value="public">Public</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-foreground">Partage de localisation</h4>
                      <p className="text-sm text-muted-foreground">
                        Inclure la localisation dans vos activités partagées
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={user?.preferences?.locationSharing || false}
                      onChange={(value) =>
                        updateUserPreferences({
                          ...user?.preferences,
                          locationSharing: value,
                        })
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* Data Export & Deletion */}
              <Card title="Gestion des données" className="bg-card text-card-foreground border-border">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-foreground">Exporter mes données</h4>
                      <p className="text-sm text-muted-foreground">
                        Téléchargez une copie de toutes vos données
                      </p>
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download size={16} />
                      Exporter
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-foreground">Supprimer mes données</h4>
                      <p className="text-sm text-muted-foreground">
                        Supprimez définitivement toutes vos données
                      </p>
                    </div>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <Trash2 size={16} />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Appearance Settings */}
          {activeTab === "appearance" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card title="Thème" className="bg-card text-card-foreground border-border">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4 text-foreground">Mode d'affichage</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setTheme("light")}
                        className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                          theme === "light"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Sun size={24} />
                        <span className="text-sm font-medium">Clair</span>
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                          theme === "dark"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Moon size={24} />
                        <span className="text-sm font-medium">Sombre</span>
                      </button>
                      <button
                        className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all border-border hover:border-primary/50 opacity-50 cursor-not-allowed`}
                      >
                        <Monitor size={24} />
                        <span className="text-sm font-medium">Auto</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4 text-foreground">Palette de couleurs</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {colorPalettes.map((palette) => (
                        <button
                          key={palette.id}
                          onClick={() => setColorPalette(palette.id)}
                          data-testid={`palette-option-${palette.id}`}
                          className={`p-4 rounded-lg border transition-all ${
                            colorPalette === palette.id
                              ? "ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: palette.primary }}
                            />
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: palette.secondary }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {palette.name}
                          </span>
                        </button>
                      ))}
                    </div>
                    <ThemePreview />
                  </div>

                  {/* Display Settings */}
                  <div className="border-t border-border pt-6">
                    <h4 className="font-medium mb-4 text-foreground">Affichage</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">Animations</p>
                          <p className="text-sm text-muted-foreground">Activer les animations de l'interface</p>
                        </div>
                        <ToggleSwitch
                          checked={user?.preferences?.enableAnimations !== false}
                          onChange={(value) =>
                            updateUserPreferences({
                              ...user?.preferences,
                              enableAnimations: value,
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">Mode compact</p>
                          <p className="text-sm text-muted-foreground">Réduire l'espacement pour plus de contenu</p>
                        </div>
                        <ToggleSwitch
                          checked={user?.preferences?.compactMode || false}
                          onChange={(value) =>
                            updateUserPreferences({
                              ...user?.preferences,
                              compactMode: value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Language & Region Settings */}
          {activeTab === "language" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card title="Langue et région" className="bg-card text-card-foreground border-border">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">Langue</label>
                      <div className="space-y-2">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setLanguageForm(prev => ({ ...prev, language: lang.code }))}
                            className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                              languageForm.language === lang.code
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <span className="text-xl">{lang.flag}</span>
                            <span className="font-medium">{lang.name}</span>
                            {languageForm.language === lang.code && (
                              <Check size={16} className="ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">Région</label>
                      <div className="space-y-2">
                        {regions.map((region) => (
                          <button
                            key={region.code}
                            onClick={() => setLanguageForm(prev => ({ ...prev, region: region.code }))}
                            className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                              languageForm.region === region.code
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <span className="font-medium">{region.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{region.currency}</span>
                              {languageForm.region === region.code && (
                                <Check size={16} />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h4 className="font-medium mb-4 text-foreground">Formats</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Fuseau horaire</label>
                        <select
                          value={languageForm.timezone}
                          onChange={(e) => setLanguageForm(prev => ({ ...prev, timezone: e.target.value }))}
                          className="input w-full"
                        >
                          <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                          <option value="America/New_York">America/New_York (GMT-5)</option>
                          <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                          <option value="Australia/Sydney">Australia/Sydney (GMT+11)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Format de date</label>
                        <select
                          value={languageForm.dateFormat}
                          onChange={(e) => setLanguageForm(prev => ({ ...prev, dateFormat: e.target.value }))}
                          className="input w-full"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Format d'heure</label>
                        <select
                          value={languageForm.timeFormat}
                          onChange={(e) => setLanguageForm(prev => ({ ...prev, timeFormat: e.target.value }))}
                          className="input w-full"
                        >
                          <option value="24h">24 heures</option>
                          <option value="12h">12 heures (AM/PM)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleLanguageUpdate} className="w-full md:w-auto">
                    <Save size={16} className="mr-2" />
                    Sauvegarder les paramètres
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

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
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          device.status === 'connected' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {device.type === 'Smartphone' ? <Smartphone size={20} /> : 
                           device.type === 'Smartwatch' ? <Clock size={20} /> : 
                           <Activity size={20} />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{device.name}</h4>
                          <p className="text-sm text-muted-foreground">{device.type}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              device.status === 'connected' 
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
                      isLoading={isLoading}
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