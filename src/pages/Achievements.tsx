import { FC, useEffect, useState } from "react";
import { useUserContext } from "../hooks/useUser";
import { useAchievementsStore } from "../stores/achievements";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import {
  Award,
  Trophy,
  Medal,
  Zap,
  Flag,
  Timer,
  MapPin,
  Flame,
  Target,
  Lock,
  CheckCircle,
  Loader,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMessages } from "../hooks/useMessage";
import { extractErrorMessage, getBaseMessage } from "../utils/error-handler";
import { useLanguage } from "../providers/LanguageProvider";

// Helper function to get icon component
const getIconComponent = (iconName: string, className: string = "") => {
  const icons: Record<string, JSX.Element> = {
    Award: <Award size={24} className={className} />,
    Trophy: <Trophy size={24} className={className} />,
    Medal: <Medal size={24} className={className} />,
    Zap: <Zap size={24} className={className} />,
    Flag: <Flag size={24} className={className} />,
    Timer: <Timer size={24} className={className} />,
    MapPin: <MapPin size={24} className={className} />,
    Flame: <Flame size={24} className={className} />,
  };

  return icons[iconName] || <Award size={24} className={className} />;
};

export const Achievements: FC = () => {
  const { user } = useUserContext();
  const { showMessage } = useMessages();
  const { currentLanguage: language } = useLanguage();

  const [activeCategory, setActiveCategory] = useState("all");

  const {
    achievements,
    isLoading,
    getUserAchievements,
    getAchievementStats,
    getAvailableAchievements,
  } = useAchievementsStore();

  // Categories for achievements
  const categories = [
    { id: "all", name: "All Achievements" },
    { id: "running", name: "Running" },
    { id: "distance", name: "Distance" },
    { id: "consistency", name: "Consistency" },
    { id: "speed", name: "Speed" },
    { id: "challenge", name: "Challenges" },
    { id: "earned", name: "Earned" },
    { id: "locked", name: "Locked" },
  ];

  useEffect(() => {
    if (user) {
      try {
        getUserAchievements();
      } catch (error) {
        console.log("Error:", error);
        showMessage(extractErrorMessage(error).message);
      }
      try {
        getAchievementStats();
      } catch (error) {
        showMessage(extractErrorMessage(error).message);
      }
      try {
        getAvailableAchievements();
      } catch (error) {
        showMessage(extractErrorMessage(error).message);
      }
    }
  }, [
    user,
    getUserAchievements,
    getAchievementStats,
    getAvailableAchievements,
  ]);

  if (!user) return null;

  const earnedCount = achievements.filter((a) => !a.isLocked).length;
  const lockedCount = achievements.filter((a) => a.isLocked).length;
  const totalCount = achievements.length;

  let filteredAchievements = achievements;
  if (activeCategory === "earned") {
    filteredAchievements = achievements.filter((a) => !a.isLocked);
  } else if (activeCategory === "locked") {
    filteredAchievements = achievements.filter((a) => a.isLocked);
  } else if (activeCategory !== "all") {
    filteredAchievements = achievements.filter(
      (a) => a.category === activeCategory
    );
  }

  if (isLoading && achievements.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
        <p className="text-muted-foreground">
          Celebrate your running milestones and unlock new badges
        </p>
      </div>

      {/* Stats overview */}
      <Card className="bg-card text-card-foreground border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col md:flex-col items-center gap-2 p-4 bg-background rounded-lg text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                {earnedCount}
              </h3>
              <p className="text-muted-foreground text-sm">Badges Earned</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-col items-center gap-2 p-4 bg-background rounded-lg text-center">
            <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                {lockedCount}
              </h3>
              <p className="text-muted-foreground text-sm">Badges to Unlock</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-col items-center gap-2 p-4 bg-background rounded-lg text-center">
            <div className="h-12 w-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
              <Target size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                {totalCount > 0 ? ((earnedCount / totalCount) * 100).toFixed(0) : 0}%
              </h3>
              <p className="text-muted-foreground text-sm">Completion Rate</p>
            </div>
          </div>
        </div>
      </Card>


      {/* Categories filter */}
      <Card className="bg-card text-card-foreground border-border">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`btn text-sm px-3 py-1.5 h-auto ${activeCategory === category.id
                ? "btn-primary"
                : "btn-outline dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20"
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Unified Achievements Grid */}
      <Card className="bg-card text-card-foreground border-border">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            {categories.find((c) => c.id === activeCategory)?.name ||
              "All Achievements"}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredAchievements.length} achievements
          </span>
        </div>
        {filteredAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className={`rounded-lg p-4 flex flex-col items-center text-center transition-opacity h-full ${!achievement.isLocked
                  ? "bg-background border border-border shadow-sm"
                  : "bg-muted/50 border border-dashed border-border opacity-70 hover:opacity-100"
                  }`}
              >
                <div
                  className={`h-16 w-16 rounded-full flex items-center justify-center mb-3 relative ${!achievement.isLocked
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  {getIconComponent(
                    achievement.icon,
                    !achievement.isLocked
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                  {!achievement.isLocked ? (
                    <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                  ) : (
                    <div className="absolute -top-1 -right-1 h-6 w-6 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center border-2 border-background">
                      <Lock size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <Badge
                  variant={
                    !achievement.isLocked
                      ? achievement.category === "distance"
                        ? "primary"
                        : achievement.category === "speed"
                          ? "secondary"
                          : achievement.category === "consistency"
                            ? "warning"
                            : "default"
                      : "default"
                  }
                  className="mb-2 text-xs"
                >
                  {achievement.category.charAt(0).toUpperCase() +
                    achievement.category.slice(1)}
                </Badge>
                <h3 className="font-semibold text-foreground text-md mb-1">
                  {getBaseMessage(achievement.title, language)}
                </h3>
                <p className="text-muted-foreground text-xs flex-grow">
                  {getBaseMessage(achievement.description, language)}
                </p>
                {!achievement.isLocked && achievement.earnedDate && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Earned on{" "}
                    {new Date(achievement.earnedDate).toLocaleDateString(
                      "en-US",
                      { month: "long", day: "numeric", year: "numeric" }
                    )}
                  </p>
                )}
                {!achievement.isLocked && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {achievement.points} points
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No achievements match this filter. Keep pushing to unlock more!
          </p>
        )}
      </Card>
    </div>
  );
}

export default Achievements;