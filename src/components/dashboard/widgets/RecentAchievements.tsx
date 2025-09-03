import { Trophy } from "lucide-react";
import { FC } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../hooks/useAppNavigation";
import { getBaseMessage } from "../../../utils/error-handler";
import { useLanguage } from "../../../providers/LanguageProvider";
import { useAchievementsStore } from "../../../stores/achievements";
import { motion } from "framer-motion";

export const RecentAchievements: FC = () => {
  const { currentLanguage: language } = useLanguage();
  const { achievements } = useAchievementsStore();
  const recentAchievements = achievements.filter(_ => !_.isLocked).slice(0, 3);
  return (
    <div className="chart-container mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-card-foreground">
          Réalisations récentes
        </h3>
        <Link
          to={ROUTES.ACHIEVEMENTS}
          className="text-primary hover:text-primary-600 duration-300 transition-colors dark:hover:text-primary-300 text-sm font-medium flex items-center gap-1"
        >
          Voir tout
          <Trophy size={14} />
        </Link>
      </div>
      {
        recentAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentAchievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="achievement-card bg-white dark:bg-gray-800 border dark:border-gray-700"
              >
                <div className="h-10 w-10 bg-card-dark rounded-full flex items-center justify-center">
                  <Trophy className="text-primary" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground">
                    {getBaseMessage(achievement.title, language)}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {getBaseMessage(achievement.description, language)}
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    {/* {async () => await parseDate(achievement.earnedDate!)} */}
                    {new Date(achievement.earnedDate!).toLocaleDateString(
                      language,
                      { month: "long", day: "numeric", year: "numeric" }
                    )}
                  </p>
                </div>
              </motion.div>
            ))}</div>
        ) : (
          <div className="text-center py-4">
            <Trophy size={24} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-3">
              Aucune réalisation récente pour le moment.
            </p>
            <Link
              to={ROUTES.ACHIEVEMENTS}
              className="btn btn-outline dark:hover:bg-gray-700 dark:border-gray-600 btn-sm"
            >
              Voir les réalisations
            </Link>
          </div>
        )}
    </div>
  )
};

