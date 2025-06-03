import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Brain, Calendar, Target } from 'lucide-react';

type MobileNavProps = {
  className?: string;
};

export default function MobileNav({ className = "" }: MobileNavProps) {
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <BarChart2 size={20} />, label: 'Stats', path: '/statistics' },
    { icon: <Brain size={20} />, label: 'Coach', path: '/coach' },
    { icon: <Calendar size={20} />, label: 'Calendar', path: '/calendar' },
    { icon: <Target size={20} />, label: 'Goals', path: '/goals' },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t h-16 z-40 ${className}`}>
      <div className="grid grid-cols-5 h-full">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center ${
                isActive ? 'text-primary' : 'text-gray-500'
              }`
            }
            end={item.path === '/'}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}