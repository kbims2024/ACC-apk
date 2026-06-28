import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/Navbar';
import PromoBanner from './components/PromoBanner';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import Dashboard from './pages/Dashboard';
import WorkerProfile from './pages/WorkerProfile';
import Admin from './pages/Admin';
import MakeAdmin from './pages/MakeAdmin';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Faq from './pages/Faq';
import TenderList from './pages/TenderList';
import FloatingHomeButton from './components/FloatingHomeButton';
import { useAuthStore, useSettingsStore } from './lib/store';
import { io, Socket } from 'socket.io-client';
import { Toaster } from 'react-hot-toast';
import { playBeep } from './lib/audio';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-full pb-8"
    >
      {children}
    </motion.div>
  );
};

export default function App() {
  const { token, user, setUser, logout } = useAuthStore();
  const { settings, setSettings } = useSettingsStore();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newVersion, setNewVersion] = useState(0);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
        playBeep();
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    // Fetch global settings
    fetch('/api/settings')
      .then(res => {
        if(res.ok) return res.json();
      })
      .then(data => {
        if(data) {
          setSettings(data);
          if (data.logoUrl) {
            const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
            if (link) link.href = data.logoUrl;
          }
          if (data.platformName) {
            document.title = data.platformName;
          }
          
          if (user && user.acceptedSettingsVersion !== undefined) {
             if (user.acceptedSettingsVersion < (data.settingsVersion || 0)) {
               setNewVersion(data.settingsVersion);
               setShowUpdateModal(true);
             }
          }
        }
      })
      .catch(err => console.error("Could not load settings:", err));

    if (token && !user) {
      fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error('Token expired or invalid');
        return res.json();
      })
      .then(data => {
        setUser(data);
      })
      .catch((error) => {
        console.error('Failed to fetch user state:', error);
        logout();
      });
    }
  }, [token, user?.acceptedSettingsVersion, logout, setUser, setSettings]);

  useEffect(() => {
    const socket: Socket = io();
    socket.on('settings_updated', (data) => {
       if (user && (user.acceptedSettingsVersion || 0) < data.version) {
         setNewVersion(data.version);
         setShowUpdateModal(true);
         // Fetch the new settings to apply them instantly
         fetch('/api/settings').then(r=>r.json()).then(d=>setSettings(d));
       }
    });

    return () => {
      socket.off('settings_updated');
      socket.disconnect();
    };
  }, [user, setSettings]);

  const handleAcceptSettings = async () => {
    setIsAccepting(true);
    try {
      const res = await fetch('/api/users/me/accept-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ version: newVersion })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setShowUpdateModal(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAccepting(false);
    }
  };

  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen font-sans flex flex-col">
      <ScrollToTop />
      <Toaster position="bottom-center" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff', borderRadius: '12px' } }} />
      <Navbar />
      <PromoBanner />
      <main className={`max-w-7xl mx-auto flex-grow w-full relative ${isHomePage ? '' : 'py-6 sm:px-6 lg:px-8'}`}>
        {showUpdateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Mise à jour importante</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Notre administration a mis à jour les conditions d'utilisation ou les tarifs de la plateforme. Veuillez accepter ces changements pour continuer à utiliser ArtisanChapChap.
              </p>
              <button
                onClick={handleAcceptSettings}
                disabled={isAccepting}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-brand-500/30"
              >
                {isAccepting ? 'Validation...' : 'J\'accepte les nouvelles conditions'}
              </button>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {/* @ts-ignore */}
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
            <Route path="/appels-offres" element={<PageTransition><TenderList /></PageTransition>} />
            <Route path="/worker/:id" element={<PageTransition><WorkerProfile /></PageTransition>} />
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
            <Route path="/make-me-admin" element={<PageTransition><MakeAdmin /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
            <Route path="/faq" element={<PageTransition><Faq /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <FloatingHomeButton />
    </div>
  );
}
