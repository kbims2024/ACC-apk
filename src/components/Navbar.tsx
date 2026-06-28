import { Link, useLocation } from 'react-router-dom';
import { useAuthStore, useThemeStore, useSettingsStore } from '../lib/store';
import { LogOut, User, Search, Hammer, Moon, Sun, Settings, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { settings } = useSettingsStore();
  const location = useLocation();

  const platformName = settings?.platformName || 'ArtisanChapChap';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/60 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={platformName} className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-full shrink-0 group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-600 rounded-full flex items-center justify-center transform shrink-0 group-hover:scale-105 transition-transform duration-300 ring-2 ring-accent-400 ring-offset-2 dark:ring-offset-slate-900 shadow-sm">
                <Hammer className="w-5 h-5 sm:w-6 sm:h-6 text-white transform -rotate-12" />
              </div>
            )}
            {platformName.replace(/\s+/g, '') === 'ArtisanChapChap' ? (
              <span className="font-display font-extrabold text-[15px] sm:text-xl tracking-tight flex flex-col leading-none justify-center">
                <span className="text-slate-900 dark:text-white drop-shadow-sm">
                  <span className="text-[#0ea5e9]">A</span>rtisan
                </span>
                <span className="text-slate-900 dark:text-white drop-shadow-sm">
                  <span className="text-[#eab308]">C</span>hap
                  <span className="text-[#0ea5e9]">C</span>hap
                </span>
              </span>
            ) : (
              <span className="font-display font-bold text-[15px] sm:text-2xl tracking-tight text-slate-900 dark:text-white flex flex-col sm:block leading-tight sm:leading-normal">
                {platformName}
              </span>
            )}
          </Link>

          {/* Navigation links & Actions */}
          <div className="flex items-center gap-1 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Basculer le thème"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <Link 
              to="/search" 
              className={`text-sm font-medium transition-colors flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-lg 
              ${location.pathname === '/search' ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/30' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <Search className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Trouver un pro</span>
            </Link>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

            {user ? (
              <div className="flex items-center gap-1 sm:gap-3">
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`p-2 rounded-full transition-colors flex items-center justify-center ${location.pathname === '/admin' ? 'bg-rose-100 text-rose-600' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
                    title="Panel d'Administration"
                  >
                    <Shield className="w-5 h-5 sm:w-5 sm:h-5" />
                  </Link>
                )}
                <Link to="/dashboard" className="flex items-center gap-2 pl-1 sm:pl-2">
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 sm:p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors ml-1 sm:ml-2"
                  title="Se déconnecter"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-3 shrink-0">
                <Link 
                  to="/login" 
                  className="bg-brand-50 dark:bg-brand-900/30 text-brand-600 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-sm hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors shadow-sm whitespace-nowrap"
                >
                  Connexion
                </Link>
                <Link to="/register">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-brand-600 text-white px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-sm hover:bg-brand-700 transition-colors shadow-md shadow-brand-600/20 whitespace-nowrap ring-2 ring-accent-400 ring-offset-2 dark:ring-offset-slate-900"
                  >
                    S'inscrire
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
