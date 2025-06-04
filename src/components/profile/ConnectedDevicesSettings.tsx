import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import Card from '../ui/Card';
import Badge from '../ui/Badge'; // Assuming Badge component exists and is styled
import { Activity, Smartphone, Check, X, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConnectedDevicesSettingsProps {
  onBack: () => void;
}

// Define a type for individual connected devices if not already defined in UserContext
// For now, let's assume a structure based on typical device info
interface ConnectedDevice {
  id: string;
  name: string;
  type: 'fitness_tracker' | 'smartwatch' | 'other';
  lastSync: string; // ISO date string
  status: 'connected' | 'disconnected' | 'sync_error';
}

export default function ConnectedDevicesSettings({ onBack }: ConnectedDevicesSettingsProps) {
  const { user, updateUserProfile } = useUser();

  // Local state to manage devices, initialized from user context
  // This allows modification (like revoke) before updating the context
  const [devices, setDevices] = useState<ConnectedDevice[]>(user?.connectedDevices || []);

  useEffect(() => {
    setDevices(user?.connectedDevices || []);
  }, [user?.connectedDevices]);

  const handleRevokeDevice = (deviceId: string) => {
    const updatedDevices = devices.filter(device => device.id !== deviceId);
    setDevices(updatedDevices); // Update local state immediately for UI responsiveness

    // Persist changes through the user context
    // updateUserProfile should be able to handle partial updates to user object.
    // Assuming updateUserProfile merges the new connectedDevices array with the existing user profile.
    if (user) {
        updateUserProfile({ ...user, connectedDevices: updatedDevices });
        console.log(`Device ${deviceId} revoked. New device list:`, updatedDevices);
        // Optionally, show a success toast/notification
    }
  };

  const handleAddDevice = () => {
    // For now, just an alert. In a real app, this would navigate or open a modal.
    alert('Imagine you are being redirected to a page to add a new device!');
    // Example of adding a dummy device locally (not persisted until save through context)
    // const newDevice: ConnectedDevice = {
    //   id: `new-${Date.now()}`,
    //   name: 'New Fitness Tracker',
    //   type: 'fitness_tracker',
    //   lastSync: new Date().toISOString(),
    //   status: 'connected',
    // };
    // setDevices([...devices, newDevice]);
  };

  const getDeviceIcon = (type: ConnectedDevice['type']) => {
    switch (type) {
      case 'fitness_tracker':
        return <Activity size={20} className="text-muted-foreground" />;
      case 'smartwatch':
        return <Smartphone size={20} className="text-muted-foreground" />;
      default:
        return <Activity size={20} className="text-muted-foreground" />; // Default icon
    }
  };

  const getStatusBadgeVariant = (status: ConnectedDevice['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'connected':
        return 'default'; // Assuming 'default' is green or positive
      case 'disconnected':
        return 'secondary'; // Assuming 'secondary' is grey or neutral
      case 'sync_error':
        return 'destructive'; // Assuming 'destructive' is red or error
      default:
        return 'outline';
    }
  }

  return (
    <Card title="Connected Devices" className="bg-card text-card-foreground border-border">
      <button onClick={onBack} className="btn btn-ghost mb-6 text-sm">
        &larr; Back to Account Settings
      </button>

      <div className="space-y-4 mb-6">
        {devices.length > 0 ? (
          devices.map((device, index) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.075, duration: 0.25, ease: "easeOut" }}
              className="p-4 border border-border rounded-lg flex items-center justify-between hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {getDeviceIcon(device.type)}
                <div>
                  <h4 className="font-medium text-foreground">{device.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Last synced: {new Date(device.lastSync).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getStatusBadgeVariant(device.status)} className="capitalize">
                  {device.status.replace('_', ' ')}
                  {device.status === 'connected' && <Check size={12} className="ml-1 inline" />}
                </Badge>
                <button
                  onClick={() => handleRevokeDevice(device.id)}
                  className="btn btn-icon btn-ghost text-destructive hover:bg-destructive/10"
                  title="Revoke Device"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-4">No devices connected.</p>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-border flex justify-center">
        <button onClick={handleAddDevice} className="btn btn-outline dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20 flex items-center gap-2">
          <PlusCircle size={18} />
          Add New Device
        </button>
      </div>
    </Card>
  );
}
