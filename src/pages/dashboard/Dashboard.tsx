import { useUserContext } from "../../hooks/useUser";
import { LayoutGrid } from "lucide-react";
import { useState } from "react";
import { defaultDashboardWidgetsConfig } from "../../providers/UserProvider";
import WidgetManagementModal from "../../components/dashboard/WidgetManagementModal";

import WeeklySummaryWidget from "../../components/dashboard/widgets/WeeklySummaryWidget";
import HeartRateTrendWidget from "../../components/dashboard/widgets/HeartRateTrendWidget";
import { RecentAchievements } from "../../components/dashboard/widgets/RecentAchievements";
import { UpcomingWorkouts } from "../../components/dashboard/widgets/UpcomingWorkouts";
import { RecentPersonalRecords } from "../../components/dashboard/widgets/RecentPersonalRecords";
import { StatsGrid } from "../../components/dashboard/widgets/StatsGrid";
import { GoalSummary } from "../../components/dashboard/widgets/GoalSummary";
import TipOfTheDayWidget from "../../components/dashboard/widgets/TipOfTheDayWidget";

export default function Dashboard() {
  const { user, updateUserPreferences } = useUserContext();

  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);

  if (!user) return null;

  // Determine active widget configuration
  const activeWidgetConfig =
    user.preferences?.dashboardWidgetsConfig || defaultDashboardWidgetsConfig;

  const sortedVisibleWidgetIds = Object.entries(activeWidgetConfig)
    .filter(([, config]) => config.isVisible)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([id]) => id);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
          Bonjour, {user.fname}!
        </h1>
        <button
          onClick={() => setIsWidgetModalOpen(true)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
          aria-label="Personnaliser le tableau de bord"
        >
          <LayoutGrid size={20} />
        </button>
      </div>
      {/* Dynamically Rendered Widgets in a Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedVisibleWidgetIds.map((widgetId) => {
          let widgetContent = null;
          // @ts-ignore
          const widgetConfig = activeWidgetConfig[widgetId];
          const span = widgetConfig?.defaultSpan || 1;
          const colSpanClass = span === 2 ? "lg:col-span-2" : "lg:col-span-1";

          switch (widgetId) {
            case "statsGrid":
              widgetContent = <StatsGrid />;
              break;
            case "heartRateTrend":
              widgetContent = <HeartRateTrendWidget />;
              break;
            case "goalSummary":
              widgetContent = <GoalSummary />;
              break;
            case "upcomingWorkouts":
              widgetContent = <UpcomingWorkouts />;
              break;
            case "recentAchievements":
              widgetContent = <RecentAchievements />;
              break;
            case "recentPRs":
              widgetContent = <RecentPersonalRecords />;
              break;
            case "weeklySummary":
              widgetContent = <WeeklySummaryWidget />;
              break;
            case "tipOfTheDay":
              widgetContent = <TipOfTheDayWidget />;
              break;
            default:
              return null;
          }

          // Each render function is now responsible for ensuring its content is appropriately spaced (e.g. via Card or a div with mb-8)
          // The grid `gap-6` will handle spacing between items.
          return (
            <div key={widgetId} className={`${colSpanClass}`}>
              {widgetContent}
            </div>
          );
        })}
      </div>
      {/* Static Elements: Connect Device Banner */}
      {!user?.connectedDevices?.some(
        (device) => device.status === "connected"
      ) && (
        <div className="bg-primary dark:bg-primary-600 rounded-xl p-6 text-primary-foreground mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-xl mb-2">
                Connectez votre appareil Garmin
              </h3>
              <p className="text-white dark:opacity-90">
                Suivez vos activités automatiquement et obtenez des analyses
                détaillées
              </p>
            </div>
            <button className="px-6 py-2.5 bg-white dark:bg-gray-100 text-primary dark:text-primary-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors font-medium">
              Connecter
            </button>
          </div>
        </div>
      )}
      {/* Last Updated Time */}
      <div className="text-xs text-muted-foreground/80 dark:text-muted-foreground/60 mt-8 text-center">
        <span>Dernière mise à jour: 21:30</span>
        <button className="ml-2 text-primary hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
          Actualiser
        </button>
      </div>
      <WidgetManagementModal
        isOpen={isWidgetModalOpen}
        onClose={() => setIsWidgetModalOpen(false)}
        currentConfig={
          user.preferences?.dashboardWidgetsConfig ||
          defaultDashboardWidgetsConfig
        }
        onSave={(newConfig) => {
          if (updateUserPreferences) {
            // Ensure function exists before calling
            // @ts-ignore
            updateUserPreferences({
              ...(user.preferences || {}),
              dashboardWidgetsConfig: newConfig,
            });
          }
        }}
      />
    </div>
  );
}
