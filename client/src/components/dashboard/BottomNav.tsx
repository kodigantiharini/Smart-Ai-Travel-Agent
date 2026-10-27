import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, MapPin, Sparkles, Calendar, Plane } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { label: 'Home', path: '/', icon: Compass },
    { label: 'Explore', path: '/explore', icon: MapPin },
    { label: 'AI Plan', path: '/planner', icon: Sparkles, isHighlight: true },
    { label: 'Bookings', path: '/bookings', icon: Plane },
    { label: 'Trips', path: '/trips', icon: Calendar },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 transition-colors shadow-lg"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))',
      }}
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 min-w-[56px] py-1 px-1 rounded-xl touch-target transition-all duration-200 relative ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    {item.isHighlight ? (
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-transform ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
                      </div>
                    ) : (
                      <div className="p-1">
                        <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                      </div>
                    )}
                    {item.isHighlight && !isActive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] tracking-tight mt-0.5 truncate max-w-[64px] ${
                      isActive ? 'font-extrabold' : ''
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && !item.isHighlight && (
                    <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
