import React from 'react';
import { LayoutDashboard, Utensils, Activity, PieChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Ana Sayfa', activeColor: '#8b5cf6' },
    { path: '/nutrition', icon: Utensils, label: 'Beslenme', activeColor: '#10b981' },
    { path: '/workouts', icon: Activity, label: 'Antrenman', activeColor: '#f43f5e' },
    { path: '/analysis', icon: PieChart, label: 'Analiz', activeColor: '#6366f1' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      {/* Glass Container */}
      <div
        className="relative overflow-hidden rounded-2xl border border-white/20 dark:border-white/10"
        style={{
          background: isDarkMode
            ? 'rgba(15, 23, 42, 0.75)'
            : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: isDarkMode
            ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
        }}
      >
        {/* Inner glow effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDarkMode
              ? 'radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)'
              : 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)'
          }}
        />

        {/* Navigation Items */}
        <div className="relative flex justify-around items-center py-3 px-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center py-2 px-5 rounded-xl transition-all duration-300 group"
              >
                {/* Active background pill */}
                {active && (
                  <div
                    className="absolute inset-0 rounded-xl transition-all duration-300"
                    style={{
                      backgroundColor: `${item.activeColor}15`,
                      boxShadow: `0 0 20px ${item.activeColor}20`
                    }}
                  />
                )}

                {/* Icon */}
                <div className={`relative transition-all duration-300 ${active ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-105'}`}>
                  <item.icon
                    size={24}
                    strokeWidth={active ? 2.2 : 1.8}
                    style={{
                      color: active
                        ? item.activeColor
                        : isDarkMode ? '#64748b' : '#94a3b8',
                      filter: active ? `drop-shadow(0 0 8px ${item.activeColor}60)` : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] font-semibold mt-1.5 transition-all duration-300 ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'
                    }`}
                  style={{
                    color: active
                      ? item.activeColor
                      : isDarkMode ? '#94a3b8' : '#64748b'
                  }}
                >
                  {item.label}
                </span>

                {/* Active indicator line */}
                {active && (
                  <div
                    className="absolute -bottom-0 w-8 h-0.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: item.activeColor,
                      boxShadow: `0 0 10px ${item.activeColor}`
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;