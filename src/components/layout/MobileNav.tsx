import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Brain, Calendar, Utensils } from 'lucide-react';

type MobileNavProps = {
  className?: string;
};

export default function MobileNav({ className = "" }: MobileNavProps) {
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <BarChart2 size={20} />, label: 'Stats', path: '/statistics' },
    { icon: <Brain size={20} />, label: 'Coach', path: '/coach' },
    { icon: <Calendar size={20} />, label: 'Calendar', path: '/calendar' },
    { icon: <Utensils size={20} />, label: 'Diet', path: '/diet' },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t h-16 z-40 ${className}`}>
      <div className="grid grid-cols-5 h-full">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] ${ /* Softened scale */
                isActive ? 'text-primary' : 'text-gray-500 hover:text-primary/80'
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