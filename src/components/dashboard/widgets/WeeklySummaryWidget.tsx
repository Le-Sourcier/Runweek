// src/components/dashboard/widgets/WeeklySummaryWidget.tsx
import React from 'react';
import { useUser } from '../../../context/UserContext';
import { BarChart2, Zap, CalendarDays } from 'lucide-react'; // Example icons

const WeeklySummaryWidget: React.FC = () => {
  const { user } = useUser();

  // Mock data for demonstration alongside real data
  const weeklyDistance = user?.stats?.weeklyDistance || 0;
  const weeklyWorkouts = 3; // Mock
  const activeDaysThisWeek = 4; // Mock

  return (
    <div className="p-1"> {/* Reduced padding as Card already has it */}
      <h4 className="text-md font-semibold text-card-foreground mb-3">Résumé Hebdomadaire</h4>
      <div className="space-y-3">
        <div className="flex items-center">
          <BarChart2 size={20} className="text-primary mr-3" />
          <div>
            <p className="text-sm text-muted-foreground">Distance cette semaine</p>
            <p className="text-lg font-semibold text-card-foreground">{weeklyDistance.toFixed(1)} km</p>
          </div>
        </div>
        <div className="flex items-center">
          <Zap size={20} className="text-yellow-500 dark:text-yellow-400 mr-3" />
          <div>
            <p className="text-sm text-muted-foreground">Séances cette semaine</p>
            <p className="text-lg font-semibold text-card-foreground">{weeklyWorkouts}</p>
          </div>
        </div>
        <div className="flex items-center">
          <CalendarDays size={20} className="text-green-500 dark:text-green-400 mr-3" />
          <div>
            <p className="text-sm text-muted-foreground">Jours actifs</p>
            <p className="text-lg font-semibold text-card-foreground">{activeDaysThisWeek}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummaryWidget;
