import { useState } from 'react';
import { useUser } from '../context/UserContext';
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
  X
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
  const [activeTab, setActiveTab] = useState('general');
  const [theme, setTheme] = useState('system');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-gray-600">Gérez vos préférences et votre compte</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-4">
          <nav className="space-y-1">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`w-full p-3 flex items-center justify-between rounded-lg transition-colors ${
                  activeTab === section.id
                    ? 'bg-primary-50 text-primary'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${
                    activeTab === section.id
                      ? 'text-primary'
                      : 'text-gray-500'
                  }`}>
                    {section.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{section.title}</p>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {section.badge && (
                    <Badge variant={section.badge.variant}>
                      {section.badge.text}
                    </Badge>
                  )}
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t">
            <button className="w-full p-3 flex items-center gap-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={20} />
              <span className="font-medium">Supprimer le compte</span>
            </button>
          </div>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card title="Préférences de notifications">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Notifications par email</h3>
                      <p className="text-sm text-gray-500">Recevez des mises à jour par email</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.email ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.email ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Notifications push</h3>
                      <p className="text-sm text-gray-500">Recevez des notifications sur votre appareil</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.push ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.push ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Réalisations</h3>
                      <p className="text-sm text-gray-500">Notifications pour les nouveaux badges</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, achievements: !prev.achievements }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.achievements ? 'bg-primary' : 'bg-gray-200'
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
        </div>
      </div>
    </div>
  );
}