import { useUser } from "../context/UserContext";
import { usePRs } from "../context/PRContext"; // Import usePRs
import { useNotifications } from "../context/NotificationContext"; // Import for notifications
import { toast } from "react-toastify"; // Import for toasts
import { isThisMonth, parseISO, format } from "date-fns"; // Import date-fns functions & format
import { fr } from "date-fns/locale"; // Import French locale for date formatting
import {
  Heart,
  Activity,
  Moon,
  Footprints,
  Calendar,
  Trophy,
  ArrowRight,
  PlusCircle,
  Sunrise,
  MessageSquare,
  Target, // Added Target for Goal Summary
} from "lucide-react"; // Added PlusCircle, Sunrise, MessageSquare
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ProgressBar from "../components/ui/ProgressBar"; // Added ProgressBar for Goal Summary
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "../components/ui/Card"; // Import Card component for the new test buttons

export default function Dashboard() {
  const userContext = useUser(); // Use userContext to access unlockSpecificAchievement
  const { user } = userContext;
  const notificationContext = useNotifications(); // Use notificationContext to access addNotification
  const { processedPRs: prs } = usePRs(); // Fetch PRs

  if (!user) return null;

  const userName = user.name || "Utilisateur"; // Fallback if name is not set

  // Process goals for "Goal Summary" section
  const activeGoals = (user?.goals || [])
    .filter((goal) => !goal.completed)
    .sort((a, b) => {
      try {
        return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
      } catch {
        return 0; // Handle invalid dates if necessary
      }
    })
    .slice(0, 3);

  // Calculate PR statistics
  const totalPRs = prs?.length || 0;
  const prsThisMonth =
    prs?.filter((pr) => pr.date && isThisMonth(parseISO(pr.date))).length || 0;

  // Process PRs for "Recent Personal Records" section
  const recentPRs = (prs || [])
    .slice() // Create a shallow copy before sorting to avoid mutating the original context state
    .sort((a, b) => {
      try {
        return parseISO(b.date).getTime() - parseISO(a.date).getTime();
      } catch {
        // Handle invalid date strings if necessary, e.g., by pushing them to the end or logging an error
        return 0;
      }
    })
    .slice(0, 3); // Take top 3 recent PRs

  // Mock data for heart rate trend
  const heartRateData = [
    { day: "Mar", value: 72 },
    { day: "Mer", value: 74 },
    { day: "Jeu", value: 71 },
    { day: "Ven", value: 73 },
    { day: "Sam", value: 70 },
    { day: "Dim", value: 71 },
    { day: "Lun", value: 72 },
  ];

  // Mock data for upcoming workouts
  const upcomingWorkouts = [
    {
      title: "Course longue",
      time: "Demain",
      distance: "10.0 km",
      duration: "1h 30m",
    },
    {
      title: "Entraînement par intervalles",
      time: "Dans 2 jours",
      distance: "5.0 km",
      duration: "45m",
    },
  ];

  // Mock data for recent achievements
  const recentAchievements = [
    {
      title: "Nouveau record de distance",
      description: "15km en une séance",
      time: "Il y a 2 jours",
    },
    {
      title: "Objectif hebdomadaire atteint",
      description: "4 entraînements cette semaine",
      time: "Hier",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Personalized Greeting */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Bonjour, {userName}!
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              <Moon
                className="text-purple-500 dark:text-purple-400"
                size={24}
              />
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
              {" "}
              {/* Changed text-gray-500 to text-muted-foreground */}
              {prsThisMonth} Ce Mois-ci
            </span>
          </div>
        </motion.div>
      </div>

      {/* Heart Rate Trend */}
      <div className="chart-container mb-8">
        <div className="flex justify-between items-start mb-4">
          {" "}
          {/* mb-6 to mb-4 as per new style */}
          <div>
            <h3 className="text-xl font-semibold text-card-foreground mb-1">
              {" "}
              {/* Applied new title style, reduced bottom margin */}
              Tendance de fréquence cardiaque
            </h3>
            <p className="text-sm text-muted-foreground">
              {" "}
              {/* text-gray-500 to text-muted-foreground */}
              Moyenne des 7 derniers jours
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Moy:</span>{" "}
            {/* text-gray-500 to text-muted-foreground */}
            <span className="font-medium text-red-500 dark:text-red-400">
              72 BPM
            </span>{" "}
            {/* Added dark variant */}
            <span className="text-green-500 dark:text-green-400">↑</span>
          </div>
        </div>

        <div className="h-[240px]">
          {" "}
          {/* mb-6 was on parent, adjusted title's mb */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={heartRateData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                domain={["dataMin - 5", "dataMax + 5"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)", // Using theme radius
                }}
                // itemStyle and labelStyle are often better handled by global CSS overrides for recharts if needed
                // For direct props:
                // itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                // labelStyle={{ color: "hsl(var(--popover-foreground))", fontWeight: "bold" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 4 }} // Added r:4 for dot size
                activeDot={{ r: 6, fill: "hsl(var(--destructive))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Workouts */}
      <div className="chart-container mb-8">
        <div className="flex justify-between items-center mb-4">
          {" "}
          {/* mb-6 to mb-4 */}
          <h3 className="text-xl font-semibold text-card-foreground">
            Entraînements à venir
          </h3>{" "}
          {/* Applied new title style */}
          <Link
            to="/calendar"
            className="text-primary hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center gap-1" /* Ensured base primary color */
          >
            Voir calendrier
            <Calendar size={14} />
          </Link>
        </div>
        <div className="space-y-4">
          {upcomingWorkouts.map((workout, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-card-foreground">
                    {" "}
                    {/* text-gray-900 to text-card-foreground */}
                    {workout.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {workout.time}
                  </p>{" "}
                  {/* text-gray-500 to text-muted-foreground */}
                </div>
                <div className="text-right">
                  <p className="font-medium text-card-foreground">
                    {" "}
                    {/* text-gray-900 to text-card-foreground */}
                    {workout.distance}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {workout.duration}
                  </p>{" "}
                  {/* text-gray-500 to text-muted-foreground */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Summary Section */}
      <Card
        title="Vos Objectifs Actifs"
        action={
          <Link
            to="/goals"
            className="text-primary hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
          >
            Voir tout
          </Link>
        }
        className="mb-8"
      >
        {activeGoals.length > 0 ? (
          <div className="space-y-4">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="mb-4 last:mb-0">
                {" "}
                {/* Added last:mb-0 to prevent double margin if only one item */}
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-medium text-card-foreground">
                    {goal.title}
                  </h4>
                  {goal.deadline && (
                    <p className="text-xs text-muted-foreground">
                      Échéance:{" "}
                      {format(parseISO(goal.deadline), "MMM d", { locale: fr })}
                    </p>
                  )}
                </div>
                <ProgressBar
                  value={goal.current}
                  max={goal.target}
                  height="sm"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {goal.current} / {goal.target} {goal.unit}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Target size={24} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-3">
              Vous n'avez aucun objectif actif pour le moment.
            </p>
            <Link to="/goals" className="btn btn-outline btn-sm">
              Définir un Nouvel Objectif
            </Link>
          </div>
        )}
      </Card>

      {/* Recent Achievements */}
      <div className="chart-container mb-8">
        <div className="flex justify-between items-center mb-4">
          {" "}
          {/* mb-6 to mb-4 */}
          <h3 className="text-xl font-semibold text-card-foreground">
            Réalisations récentes
          </h3>{" "}
          {/* Applied new title style */}
          <Link
            to="/achievements"
            className="text-primary hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center gap-1" /* Ensured base primary color */
          >
            Voir tout
            <Trophy size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentAchievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="achievement-card bg-white dark:bg-gray-800 border dark:border-gray-700" // Added bg and border for dark mode consistency
            >
              <div className="h-10 w-10 bg-primary-100 dark:bg-primary-700/20 rounded-full flex items-center justify-center">
                {" "}
                {/* Adjusted dark bg for primary accent */}
                <Trophy
                  className="text-primary dark:text-primary-400"
                  size={20}
                />{" "}
                {/* Ensured base primary color */}
              </div>
              <div>
                <h4 className="font-medium text-card-foreground">
                  {" "}
                  {/* text-gray-900 to text-card-foreground */}
                  {achievement.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {" "}
                  {/* text-gray-500 to text-muted-foreground */}
                  {achievement.description}
                </p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  {achievement.time}
                </p>{" "}
                {/* text-gray-400 to text-muted-foreground/80 */}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Personal Records Section */}
      <div className="chart-container mb-8">
        <div className="flex justify-between items-center mb-4">
          {" "}
          {/* mb-6 to mb-4 */}
          <h3 className="text-xl font-semibold text-card-foreground">
            Records Récents
          </h3>{" "}
          {/* Applied new title style */}
          <div className="flex items-center gap-3">
            <Link
              to="/personal-records"
              className="text-primary hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center gap-1" /* Ensured base primary color */
            >
              Voir tout
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/personal-records"
              className="bg-primary-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle size={16} />
              Ajouter un Record
            </Link>
          </div>
        </div>
        {recentPRs.length === 0 ? (
          <div className="text-center py-4">
            <Trophy size={24} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-3">
              Aucun record personnel pour le moment.
            </p>
            <Link to="/personal-records" className="btn btn-outline btn-sm">
              Ajouter un Record
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentPRs.map((pr) => (
              <div
                key={pr.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md dark:hover:shadow-primary-500/10 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-primary dark:text-primary-400">
                      {" "}
                      {/* Ensured base primary color */}
                      {pr.distance} km Record
                    </h4>
                    <p className="text-sm text-card-foreground">
                      {" "}
                      {/* text-gray-700 to text-card-foreground */}
                      Temps: <span className="font-medium">{pr.time}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    {pr.date && (
                      <p className="text-xs text-muted-foreground/80">
                        {" "}
                        {/* text-gray-500 to text-muted-foreground/80 */}
                        {format(parseISO(pr.date), "d MMM yyyy", {
                          locale: fr,
                        })}
                      </p>
                    )}
                    {pr.notes && (
                      <p
                        className="text-xs text-muted-foreground/70 mt-1 truncate" /* text-gray-400 to text-muted-foreground/70 for more subtlety */
                        title={pr.notes}
                      >
                        {pr.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connect Device Banner - Conditionally Rendered */}
      {!user?.connectedDevices?.some(
        (device) => device.status === "connected"
      ) && (
        <div className="bg-primary dark:bg-primary-600 rounded-xl p-6 text-primary-foreground mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-xl mb-2">
                Connectez votre appareil Garmin
              </h3>
              <p className="opacity-90">
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
          {" "}
          {/* Ensured base primary color */}
          Actualiser
        </button>
      </div>
    </div>
  );
}
