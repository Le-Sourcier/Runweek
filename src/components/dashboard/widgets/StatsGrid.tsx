import { Activity, Footprints, Heart, Moon, Trophy } from "lucide-react";
import { FC } from "react";
import { motion } from "framer-motion";
import { isThisMonth, parseISO } from "date-fns";
import { usePRs } from "../../../context/PRContext";

export const StatsGrid: FC = () => {

  const { processedPRs } = usePRs();
  const totalPRs = processedPRs?.length || 0;
  const prsThisMonth =
    processedPRs?.filter((pr) => pr.date && isThisMonth(parseISO(pr.date))).length || 0;

  return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="stat-card"
    >
      <span className="stat-label">Fréquence cardiaque</span>
      <div className="flex items-baseline gap-2 mt-2">
        <div className="flex items-center gap-2">
          <Heart className="text-red-500 dark:text-red-400" size={24} />
          <span className="stat-value">72 bpm</span>
        </div>
        <span className="text-green-500 dark:text-green-400 text-sm font-medium">
          +2
        </span>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="stat-card"
    >
      <span className="stat-label">Score d'activité</span>
      <div className="flex items-baseline gap-2 mt-2">
        <div className="flex items-center gap-2">
          <Activity
            className="text-primary-500 dark:text-primary-400"
            size={24}
          />
          <span className="stat-value">85/100</span>
        </div>
        <span className="text-green-500 dark:text-green-400 text-sm font-medium">
          +5 pts
        </span>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="stat-card"
    >
      <span className="stat-label">Qualité du sommeil</span>
      <div className="flex items-baseline gap-2 mt-2">
        <div className="flex items-center gap-2">
          <Moon className="text-purple-500 dark:text-purple-400" size={24} />
          <span className="stat-value">7.5 hrs</span>
        </div>
        <span className="text-green-500 dark:text-green-400 text-sm font-medium">
          Bon
        </span>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="stat-card"
    >
      <span className="stat-label">Pas quotidiens</span>
      <div className="flex items-baseline gap-2 mt-2">
        <div className="flex items-center gap-2">
          <Footprints
            className="text-orange-500 dark:text-orange-400"
            size={24}
          />
          <span className="stat-value">8,432</span>
        </div>
        <span className="text-orange-500 dark:text-orange-400 text-sm font-medium">
          1,568 restants
        </span>
      </div>
    </motion.div>

    {/* PR Summary Card */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }} // New delay
      className="stat-card"
    >
      <span className="stat-label">Records Personnels</span>
      <div className="flex items-baseline gap-2 mt-2">
        <div className="flex items-center gap-2">
          <Trophy
            className="text-yellow-500 dark:text-yellow-400"
            size={24}
          />
          <span className="stat-value">{totalPRs} Total</span>
        </div>
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-sm text-muted-foreground ml-8">
          {prsThisMonth} Ce Mois-ci
        </span>
      </div>
    </motion.div>
  </div>
  );
}