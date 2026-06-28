import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FloatingHomeButton() {
  const location = useLocation();

  // Don't show the button on the home page itself
  if (location.pathname === '/') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        className="fixed top-24 sm:top-20 right-4 sm:right-6 z-50"
      >
        <Link
          to="/"
          className="flex items-center justify-center gap-1.5 bg-brand-600 text-white p-2 sm:px-3 sm:py-2 rounded-full sm:rounded-xl shadow-md shadow-brand-600/20 hover:bg-brand-700 hover:shadow-brand-600/30 transition-all font-semibold text-xs ring-2 ring-accent-400 ring-offset-2 dark:ring-offset-slate-900 group"
          title="Retour à l'accueil"
        >
          <Home className="w-4 h-4 sm:w-4 sm:h-4 transition-transform group-hover:-translate-y-0.5" />
          <span className="hidden sm:inline-block">Accueil</span>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
