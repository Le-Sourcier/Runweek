import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart2,
  Brain,
  Calendar as CalendarIcon,
  Target,
  Award,
  User,
  HelpCircle,
  X,
  Activity,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { motion } from "framer-motion";

type SidebarProps = {
  className?: string;
  onClose?: () => void;
};

export default function Sidebar({ className = "", onClose }: SidebarProps) {
  const { user } = useUser();

  const navItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Tableau de bord",
      path: "/",
    },
    {
      icon: <BarChart2 size={20} />,
      label: "Statistiques",
      path: "/statistics",
    },
    { icon: <Brain size={20} />, label: "Coach IA", path: "/coach" },
    {
      icon: <CalendarIcon size={20} />,
      label: "Calendrier",
      path: "/calendar",
    },
    { icon: <Target size={20} />, label: "Objectifs", path: "/goals" },
    { icon: <Award size={20} />, label: "Réalisations", path: "/achievements" },
    {
      icon: <Award size={20} />,
      label: "Records Perso",
      path: "/personal-records",
    }, // Added line
    { icon: <User size={20} />, label: "Profil", path: "/profile" },
    {
      icon: <HelpCircle size={20} />,
      label: "Aide & Support",
      path: "/support",
    },
  ];

  return (
    <aside
      className={` dark:bg-gray-800 dark:border-gray-700 w-64 bg-white border-r border-gray-200 flex flex-col ${className}`}
    >
      {/* Top section with logo and close button for mobile */}
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Runweek</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-md hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-[1.03] active:scale-[0.97]"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* User profile summary */}
      {user && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-medium text-sm">{user.name}</h3>
              <p className="text-xs text-gray-500">Level {user.stats.level}</p>
            </div>
          </div>

          <div className="mt-3">
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <motion.div
                className="bg-primary h-full"
                initial={{ width: 0 }}
                animate={{ width: `${(user.stats.points % 1000) / 10}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{user.stats.points} XP</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all hover:translate-x-1
                  ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900"
                  }
                `}
                end={item.path === "/"}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings */}
      <div className="p-3 border-t">
        <NavLink
          to="/settings"
          className="dark:hover:bg-gray-600 flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all hover:translate-x-1"
        >
          <span>Paramètres</span>
        </NavLink>
      </div>
    </aside>
  );
}
