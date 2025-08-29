import { motion } from "framer-motion"
import { FC } from "react";
import Card from "../../../components/ui/Card"
import { Activity, Clock, RefreshCw, Smartphone, Wifi } from "lucide-react";
import Button from "../../../components/ui/Button";
import { ToggleSwitch } from "../../../components/ui/ToggleSwitch";
import { useUserContext } from "../../../hooks/useUser";

export const DeviceTab: FC = () => {

  const { user, updateUserPreferences } = useUserContext();

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
                <Button variant="outline">
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
                  // @ts-ignore
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
                  // @ts-ignore
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
            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCw size={14} />
              Synchroniser maintenant
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};