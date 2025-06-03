import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext'; // Added useTheme import
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { 
  Bell, 
  Globe, 
  Lock,
  Smartphone,
  Palette,
  Languages,
  CreditCard,
  Shield,
  Activity,
  Trash2,
  ChevronRight,
  Check,
  X,
  Users, // Added Users icon
  Facebook, // Added Facebook icon
  Twitter, // Added Twitter icon
  Instagram, // Added Instagram icon
  Linkedin, // Added Linkedin icon
  Link2 // Added Link2 icon as a fallback
} from 'lucide-react';
import { motion } from 'framer-motion';

type SettingSection = {
  id: string;
  title: string;
  icon: JSX.Element;
  description: string;
  badge?: {
    text: string;
    variant: 'primary' | 'warning' | 'error';
  };
};

export default function Settings() {
  const { user } = useUser();
  const { colorPalette, setColorPalette } = useTheme(); // Added theme context
  const [activeTab, setActiveTab] = useState('general');
  const [currentThemeOption, setCurrentThemeOption] = useState('system'); // Renamed theme to currentThemeOption to avoid conflict
  const [language, setLanguage] = useState('fr');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    achievements: true,
    reminders: true,
    updates: false
  });

  const settingSections: SettingSection[] = [
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell size={20} />,
      description: 'Gérez vos préférences de notifications',
      badge: {
        text: '3 nouveaux',
        variant: 'primary'
      }
    },
    {
      id: 'appearance',
      title: 'Apparence',
      icon: <Palette size={20} />,
      description: 'Personnalisez l\'apparence de l\'application'
    },
    {
      id: 'language',
      title: 'Langue et région',
      icon: <Globe size={20} />,
      description: 'Définissez vos préférences régionales'
    },
    {
      id: 'devices',
      title: 'Appareils connectés',
      icon: <Smartphone size={20} />,
      description: 'Gérez vos appareils connectés',
      badge: {
        text: '2 actifs',
        variant: 'primary'
      }
    },
    {
      id: 'privacy',
      title: 'Confidentialité',
      icon: <Lock size={20} />,
      description: 'Contrôlez vos données et leur utilisation'
    },
    {
      id: 'billing',
      title: 'Facturation',
      icon: <CreditCard size={20} />,
      description: 'Gérez vos abonnements et paiements',
      badge: {
        text: 'Pro',
        variant: 'primary'
      }
    },
    {
      id: 'connected-accounts',
      title: 'Comptes connectés',
      icon: <Users size={20} />,
      description: 'Liez vos comptes de médias sociaux'
    }
  ];

  const connectedDevices = [
    {
      id: 'd1',
      name: 'Garmin Forerunner 955',
      type: 'Montre connectée',
      lastSync: '2025-03-15T10:30:00',
      status: 'connected'
    },
    {
      id: 'd2',
      name: 'iPhone 15 Pro',
      type: 'Smartphone',
      lastSync: '2025-03-15T10:45:00',
      status: 'connected'
    }
  ];

  const availableColorPalettes = [
    { name: 'Default', id: 'default', color: '#6366F1' }, // Example primary color
    { name: 'Ocean Blue', id: 'blue', color: '#3B82F6' },
    { name: 'Forest Green', id: 'green', color: '#10B981' },
    { name: 'Royal Purple', id: 'purple', color: '#8B5CF6' },
    { name: 'Sunset Orange', id: 'orange', color: '#F59E0B' },
  ];

  const socialAccounts = [
    { id: 'facebook', name: 'Facebook', icon: <Facebook size={24} />, connected: false },
    { id: 'twitter', name: 'Twitter', icon: <Twitter size={24} />, connected: false },
    { id: 'instagram', name: 'Instagram', icon: <Instagram size={24} />, connected: false },
    { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin size={24} />, connected: false },
    { id: 'strava', name: 'Strava', icon: <Link2 size={24} />, connected: true }, // Example of a connected app
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Paramètres</h1>
        <p className="text-gray-600 dark:text-gray-400">Gérez vos préférences et votre compte</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-4 bg-white dark:bg-gray-800">
          <nav className="space-y-1">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`w-full p-3 flex items-center justify-between rounded-lg transition-colors ${
                  activeTab === section.id
                    ? 'bg-primary-50 text-primary dark:bg-primary-900 dark:text-primary-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${
                    activeTab === section.id
                      ? 'text-primary dark:text-primary-300'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {section.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{section.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {section.badge && (
                    <Badge variant={section.badge.variant}>
                      {section.badge.text}
                    </Badge>
                  )}
                  <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                </div>
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t dark:border-gray-700">
            <button className="w-full p-3 flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
              <Trash2 size={20} />
              <span className="font-medium">Supprimer le compte</span>
            </button>
          </div>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card title="Apparence" className="bg-white dark:bg-gray-800">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Thème</h3>
                    <div className="flex gap-4">
                      {['light', 'dark', 'system'].map((option) => (
                        <button
                          key={option}
                          onClick={() => setCurrentThemeOption(option)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            currentThemeOption === option
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-white">Palette de couleurs</h3>
                    <div className="flex flex-wrap gap-3">
                      {availableColorPalettes.map((palette) => (
                        <button
                          key={palette.id}
                          onClick={() => setColorPalette(palette.id)}
                          className={`p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                            colorPalette === palette.id ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-primary' : ''
                          }`}
                          title={palette.name}
                          data-testid={`palette-option-${palette.id}`} // Added data-testid
                        >
                          <div
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: palette.color }}
                          ></div>
                           <span className="sr-only">{palette.name}</span>
                        </button>
                      ))}
                    </div>
                     {colorPalette !== 'default' && (
                        <button
                            onClick={() => setColorPalette('default')}
                            className="mt-4 text-sm text-primary hover:underline"
                        >
                            Réinitialiser la palette
                        </button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card title="Préférences de notifications" className="bg-white dark:bg-gray-800">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">Notifications par email</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Recevez des mises à jour par email</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.email ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.email ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">Notifications push</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Recevez des notifications sur votre appareil</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.push ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.push ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">Réalisations</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notifications pour les nouveaux badges</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, achievements: !prev.achievements }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.achievements ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.achievements ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'devices' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card title="Appareils connectés">
                <div className="space-y-4">
                  {connectedDevices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Activity size={24} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{device.name}</h3>
                          <p className="text-sm text-gray-500">{device.type}</p>
                          <p className="text-xs text-gray-400">
                            Dernière synchronisation: {new Date(device.lastSync).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="success" className="flex items-center gap-1">
                          <Check size={12} />
                          Connecté
                        </Badge>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <X size={16} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button className="w-full p-4 border border-dashed rounded-lg text-center hover:border-primary hover:bg-gray-50 transition-all">
                    <span className="text-primary font-medium">+ Ajouter un appareil</span>
                  </button>
                </div>
              </Card>

              <Card title="Synchronisation">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Synchronisation automatique</h3>
                      <p className="text-sm text-gray-500">Synchroniser automatiquement les données</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Synchronisation en arrière-plan</h3>
                      <p className="text-sm text-gray-500">Mettre à jour même lorsque l'app est fermée</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Dernière synchronisation</h3>
                      <p className="text-sm text-gray-500">Il y a 5 minutes</p>
                    </div>
                    <button className="btn btn-outline">
                      Synchroniser maintenant
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'privacy' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card title="Confidentialité">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Visibilité du profil</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="visibility" className="text-primary" defaultChecked />
                        <span>Public</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="visibility" className="text-primary" />
                        <span>Amis uniquement</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="visibility" className="text-primary" />
                        <span>Privé</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">Données de localisation</h3>
                        <p className="text-sm text-gray-500">Gérez l'accès à votre position</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                      </button>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Shield size={16} />
                        <span>Vos données de localisation sont cryptées</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-3">Exportation des données</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Téléchargez une copie de vos données personnelles
                    </p>
                    <button className="btn btn-outline">
                      Exporter les données
                    </button>
                  </div>
                </div>
              </Card>

              <Card title="Sécurité">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Authentification à deux facteurs</h3>
                      <p className="text-sm text-gray-500">Ajoutez une couche de sécurité supplémentaire</p>
                    </div>
                    <Badge variant="warning">Non activé</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Sessions actives</h3>
                      <p className="text-sm text-gray-500">Gérez vos connexions actives</p>
                    </div>
                    <Badge variant="primary">2 appareils</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'connected-accounts' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card title="Comptes connectés" className="bg-white dark:bg-gray-800">
                <div className="space-y-4">
                  {socialAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-primary-600 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400">
                          {account.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">{account.name}</h3>
                          <p className={`text-sm ${account.connected ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {account.connected ? 'Connecté' : 'Non connecté'}
                          </p>
                        </div>
                      </div>
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          account.connected
                            ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900'
                            : 'bg-primary-50 text-primary hover:bg-primary-100 dark:bg-primary-800/60 dark:text-primary-300 dark:hover:bg-primary-700'
                        }`}
                      >
                        {account.connected ? 'Déconnecter' : 'Connecter'}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}