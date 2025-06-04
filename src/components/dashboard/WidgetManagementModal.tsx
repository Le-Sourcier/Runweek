import React, { useState, useEffect } from 'react';
import { defaultDashboardWidgetsConfig } from '../../context/UserContext'; // Import the default config
import Button from '../ui/Button'; // Assuming a Button component exists
import { X } from 'lucide-react';

interface WidgetConfig {
  isVisible: boolean;
  order: number;
}

interface DashboardWidgetsConfig {
  [widgetId: string]: WidgetConfig;
}

interface WidgetManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: DashboardWidgetsConfig;
  // defaultWidgetOrder is implicitly handled by defaultDashboardWidgetsConfig
  onSave: (newConfig: DashboardWidgetsConfig) => void;
}

const widgetDisplayNames: { [widgetId: string]: string } = {
  statsGrid: "Résumé des Statistiques",
  heartRateTrend: "Tendance de Fréquence Cardiaque",
  goalSummary: "Objectifs Actifs",
  upcomingWorkouts: "Entraînements à Venir",
  recentAchievements: "Réalisations Récentes",
  recentPRs: "Records Personnels Récents",
  weeklySummary: "Résumé Hebdomadaire",
  tipOfTheDay: "Conseil du Jour",
};

// Get sorted list of widget IDs based on default order
const sortedWidgetIds = Object.entries(defaultDashboardWidgetsConfig)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([id]) => id);


const WidgetManagementModal: React.FC<WidgetManagementModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}) => {
  const [editedConfig, setEditedConfig] = useState<DashboardWidgetsConfig>({});

  useEffect(() => {
    // Initialize editedConfig with a deep copy of currentConfig,
    // ensuring all default widgets are present.
    const initialConfig: DashboardWidgetsConfig = {};
    sortedWidgetIds.forEach(widgetId => {
      const defaultConfigForWidget = defaultDashboardWidgetsConfig[widgetId]; // Already contains isVisible, order, defaultSpan
      const userConfigForWidget = currentConfig[widgetId];

      initialConfig[widgetId] = {
        isVisible: userConfigForWidget?.isVisible ?? defaultConfigForWidget.isVisible,
        order: userConfigForWidget?.order ?? defaultConfigForWidget.order,
        defaultSpan: userConfigForWidget?.defaultSpan ?? defaultConfigForWidget.defaultSpan, // Preserve or set defaultSpan
      };
    });
    setEditedConfig(initialConfig);
  }, [isOpen, currentConfig]);

  const handleToggleVisibility = (widgetId: string) => {
    setEditedConfig((prevConfig) => {
      const newVisibility = !prevConfig[widgetId]?.isVisible;
      // Ensure order and defaultSpan are preserved or correctly defaulted
      const currentOrder = prevConfig[widgetId]?.order || defaultDashboardWidgetsConfig[widgetId].order;
      const currentSpan = prevConfig[widgetId]?.defaultSpan || defaultDashboardWidgetsConfig[widgetId].defaultSpan;

      return {
        ...prevConfig,
        [widgetId]: {
          // ...prevConfig[widgetId], // This might carry over old properties if widgetId wasn't in prevConfig
          isVisible: newVisibility,
          order: currentOrder,
          defaultSpan: currentSpan,
        },
      };
    });
  };

  const handleSaveChanges = () => {
    // Filter out widgets that might not be in widgetDisplayNames (though unlikely with current setup)
    const validConfig: DashboardWidgetsConfig = {};
    for (const widgetId in editedConfig) {
      if (Object.prototype.hasOwnProperty.call(widgetDisplayNames, widgetId)) {
        validConfig[widgetId] = editedConfig[widgetId];
      }
    }
    onSave(validConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card text-card-foreground rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Personnaliser les Widgets</h2>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </Button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-grow pr-2">
          {sortedWidgetIds.map((widgetId) => {
            const displayName = widgetDisplayNames[widgetId] || widgetId;
            const isVisible = editedConfig[widgetId]?.isVisible || false; // Default to false if not in config

            return (
              <div key={widgetId} className="flex items-center justify-between p-3 bg-background rounded-md border border-border">
                <span className="text-sm font-medium">{displayName}</span>
                <label htmlFor={`toggle-${widgetId}`} className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id={`toggle-${widgetId}`}
                      className="sr-only peer"
                      checked={isVisible}
                      onChange={() => handleToggleVisibility(widgetId)}
                    />
                    <div className="w-10 h-6 bg-muted rounded-full peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-800 after:border-gray-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </div>
                </label>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WidgetManagementModal;
