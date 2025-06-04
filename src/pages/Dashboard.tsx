import { useUser } from "../context/UserContext";
import { usePRs } from "../context/PRContext"; // Import usePRs
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
} from "lucide-react"; // Added PlusCircle
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { user } = useUser();
  const { processedPRs: prs } = usePRs(); // Fetch PRs

  if (!user) return null;

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
      {/* Header with last updated time */}
      <div className="flex justify-end items-center text-sm text-gray-500">
        <span>Dernière mise à jour: 21:30</span>
        <button className="ml-2 text-primary-500 hover:text-primary-600 font-medium">
          Actualiser
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="stat-card"
        >
          <span className="stat-label">Fréquence cardiaque</span>
          <div className="flex items-baseline gap-2 mt-2">
            <div className="flex items-center gap-2">
              <Heart className="text-red-500" size={24} />
              <span className="stat-value">72 bpm</span>
            </div>
            <span className="text-green-500 text-sm font-medium">+2</span>
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
              <Activity className="text-primary-500" size={24} />
              <span className="stat-value">85/100</span>
            </div>
            <span className="text-green-500 text-sm font-medium">+5 pts</span>
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
              <Moon className="text-purple-500" size={24} />
              <span className="stat-value">7.5 hrs</span>
            </div>
            <span className="text-green-500 text-sm font-medium">Bon</span>
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
              <Footprints className="text-orange-500" size={24} />
              <span className="stat-value">8,432</span>
            </div>
            <span className="text-orange-500 text-sm font-medium">
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
              <Trophy className="text-yellow-500" size={24} />
              <span className="stat-value">{totalPRs} Total</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm text-gray-500 ml-8">
              {prsThisMonth} Ce Mois-ci
            </span>
          </div>
        </motion.div>
      </div>

      {/* Heart Rate Trend and Upcoming Workouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 chart-container">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-medium text-gray-900">
                Tendance de fréquence cardiaque
              </h3>
              <p className="text-sm text-gray-500">
                Moyenne des 7 derniers jours
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Moy:</span>
              <span className="font-medium text-red-500">72 BPM</span>
              <span className="text-green-500">↑</span>
            </div>
          </div>

          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={heartRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="day"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  domain={["dataMin - 5", "dataMax + 5"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: "#EF4444", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#EF4444" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium text-gray-900">Entraînements à venir</h3>
            <Link
              to="/calendar"
              className="text-primary-500 text-sm font-medium hover:text-primary-600 flex items-center gap-1"
            >
              Voir calendrier
              <Calendar size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingWorkouts.map((workout, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-gray-100 hover:border-primary-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {workout.title}
                    </h4>
                    <p className="text-sm text-gray-500">{workout.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {workout.distance}
                    </p>
                    <p className="text-sm text-gray-500">{workout.duration}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="chart-container">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium text-gray-900">Réalisations récentes</h3>
          <Link
            to="/achievements"
            className="text-primary-500 text-sm font-medium hover:text-primary-600 flex items-center gap-1"
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
              className="achievement-card"
            >
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Trophy className="text-primary-500" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {achievement.title}
                </h4>
                <p className="text-sm text-gray-500">
                  {achievement.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">{achievement.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Personal Records Section */}
      <div className="chart-container">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium text-gray-900">Records Récents</h3>
          <div className="flex items-center gap-3">
            {" "}
            {/* Updated to gap-3 for spacing */}
            <Link
              to="/personal-records"
              className="text-primary-500 text-sm font-medium hover:text-primary-600 flex items-center gap-1"
            >
              Voir tout
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/personal-records" // Navigates to the page where PRs can be added
              className="bg-primary-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary-600 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle size={16} />
              Ajouter un Record
            </Link>
          </div>
        </div>

        {recentPRs.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucun record personnel enregistré pour le moment.{" "}
            <Link
              to="/personal-records"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              En ajoutez un!
            </Link>
          </p>
        ) : (
          <div className="space-y-4">
            {recentPRs.map((pr) => (
              <div
                key={pr.id}
                className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-primary-600">
                      {pr.distance} km Record
                    </h4>
                    <p className="text-sm text-gray-700">
                      Temps: <span className="font-medium">{pr.time}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    {pr.date && (
                      <p className="text-xs text-gray-500">
                        {format(parseISO(pr.date), "d MMM yyyy", {
                          locale: fr,
                        })}
                      </p>
                    )}
                    {pr.notes && (
                      <p
                        className="text-xs text-gray-400 mt-1 truncate"
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

      {/* Connect Device Banner */}
      <div className="bg-primary-500 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-xl mb-2">
              Connectez votre appareil Garmin
            </h3>
            <p className="text-white/90">
              Suivez vos activités automatiquement et obtenez des analyses
              détaillées
            </p>
          </div>
          <button className="px-6 py-2.5 bg-white text-primary-500 rounded-lg hover:bg-white/90 transition-colors font-medium">
            Connecter
          </button>
        </div>
      </div>
    </div>
  );
}
