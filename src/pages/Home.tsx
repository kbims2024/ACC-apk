import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Hammer,
  CheckCircle,
  Shield,
  Briefcase,
  Star,
  Clock,
  Gift,
} from "lucide-react";
import { motion } from "motion/react";
import EligibilityWizard from "../components/EligibilityWizard";
import { useAuthStore } from "../lib/store";

const containerVariant = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function Home() {
  const [isEligibilityWizardOpen, setIsEligibilityWizardOpen] = useState(false);
  const [activeTendersCount, setActiveTendersCount] = useState<number>(0);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showClientOptions, setShowClientOptions] = useState(false);

  useEffect(() => {
    fetch("/api/tenders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Count only 'open' tenders
          const openCount = data.filter((t) => t.status === "open").length;
          setActiveTendersCount(openCount);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100dvh-5rem)] flex flex-col justify-center py-8 md:min-h-0 md:block md:pt-16 md:pb-24 overflow-hidden">
        {/* Abstract Background element */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-brand-100/50 dark:bg-brand-900/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 -ml-32 w-[400px] h-[400px] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            variants={containerVariant}
            initial="hidden"
            animate="show"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              variants={itemVariant}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 text-brand-700 text-sm sm:text-base font-medium mb-6 md:mb-8 -mt-4 md:-mt-6 dark:text-yellow-400"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
              La plateforme n°1 des artisans qualifiés
            </motion.div>

            <motion.h1
              variants={itemVariant}
              className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tight mb-6 md:mb-8 leading-[1.1]"
            >
              Construisez vos projets avec les{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-500">
                meilleurs artisans
              </span>
              .
            </motion.h1>

            <motion.p
              variants={itemVariant}
              className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Plombiers, électriciens, peintres... Artisan ChapChap vous met en
              relation instantanément avec des professionnels vérifiés près de
              chez vous.
            </motion.p>

            <motion.div
              variants={itemVariant}
              className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mt-8"
            >
              <Link to="/search">
                <motion.button
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-[300px] h-12 md:h-14 bg-brand-600 text-white px-4 rounded-2xl font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-brand-600/20 border-4 border-yellow-400"
                >
                  Rechercher un ouvrier <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/appels-offres?action=create">
                <motion.button
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-[300px] h-12 md:h-14 bg-yellow-400 text-brand-700 px-4 rounded-2xl font-bold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-yellow-400/20 border-4 border-brand-600"
                >
                  Publier une demande de devis{" "}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </motion.div>

            {/* Active Tenders Count Button */}
            <motion.div variants={itemVariant} className="mt-6">
              {showClientOptions ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in zoom-in duration-300">
                   <button
                    onClick={() => navigate('/appels-offres', { state: { activeTab: 'all', statusFilter: 'all' } })}
                    className="bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-400 px-6 py-2.5 rounded-full font-bold text-sm transition-colors border border-brand-200 dark:border-brand-800/50 shadow-sm whitespace-nowrap"
                   >
                     Toutes les demandes
                   </button>
                   <button
                    onClick={() => navigate('/dashboard', { state: { scrollTo: 'client-stats' } })}
                    className="bg-brand-600 text-white hover:bg-brand-700 px-6 py-2.5 rounded-full font-bold text-sm transition-colors shadow-sm whitespace-nowrap"
                   >
                     Mes demandes
                   </button>
                </div>
              ) : (
                <motion.button
                  onClick={() => {
                    if (user && user.role !== "worker") {
                      setShowClientOptions(true);
                    } else {
                      navigate("/appels-offres", { state: { activeTab: 'all', statusFilter: 'all' } });
                    }
                  }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mx-auto flex items-center justify-center gap-2 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-400 px-6 py-2.5 rounded-full font-bold text-sm transition-colors border border-brand-200 dark:border-brand-800/50 shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {activeTendersCount} demande
                  {activeTendersCount > 1 ? "s" : ""} de devis en cours
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="col-span-1 md:col-span-2 bg-brand-600 rounded-[2rem] p-6 md:p-8 relative overflow-hidden text-left border-2 border-accent-400"
          >
            <div className="relative z-10">
              <div className="flex items-center md:block gap-4 mb-3 md:mb-0">
                <div className="w-12 h-12 shrink-0 bg-brand-500 rounded-2xl flex items-center justify-center md:mb-4 border border-accent-400 ring-2 ring-accent-400 ring-offset-1">
                  <Shield className="w-6 h-6 text-accent-400" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white md:mb-3">
                  Profils 100% Vérifiés
                </h3>
              </div>
              <p className="text-brand-100 text-sm sm:text-base max-w-md">
                Chaque artisan de notre plateforme passe par un processus de
                vérification strict : identité, diplômes et précédentes
                réalisations.
              </p>
            </div>
            {/* Decorative pattern */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
              <Shield className="w-64 h-64 sm:w-80 sm:h-80 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="col-span-1 bg-brand-50 dark:bg-slate-900 border border-brand-100 dark:border-slate-800 rounded-[2rem] p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center md:block gap-4 mb-3 md:mb-0">
                <div className="w-10 h-10 shrink-0 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center md:mb-4 shadow-sm">
                  <Star className="w-5 h-5 text-brand-600 fill-brand-100 dark:text-brand-400" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white md:mb-2">
                  Avis authentiques
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Seuls les clients ayant fait appel à un artisan peuvent laisser
                un avis.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-[2rem] p-6 flex flex-col"
          >
            <div className="flex items-center md:block gap-4 mb-3 md:mb-0">
              <div className="w-10 h-10 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center md:mb-4">
                <Clock className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white md:mb-2">
                Réponse rapide
              </h3>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Recevez des devis et des propositions en moins de 24h.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="col-span-1 md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6"
          >
            <div className="flex-1">
              <h3 className="font-display text-[1.15rem] leading-tight whitespace-nowrap min-[380px]:text-lg sm:text-xl md:text-2xl sm:whitespace-normal font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                Un tableau de bord intuitif
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mb-5">
                Gérez vos demandes de chantier, suivez l'avancement, et
                communiquez directement depuis votre espace personnel
                ultra-moderne.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm sm:text-base text-slate-700 dark:text-slate-200 font-medium">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Suivi en
                  temps réel
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base text-slate-700 dark:text-slate-200 font-medium">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Acceptez ou
                  refusez en 1 clic
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Affiliation Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="col-span-1 md:col-span-3 bg-gradient-to-br from-brand-50 to-amber-50 dark:from-brand-900/40 dark:to-amber-900/20 border border-brand-200 dark:border-brand-800 rounded-3xl p-6 sm:p-8 lg:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center gap-6 lg:gap-8"
          >
            <div className="flex-1 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-blue-400 text-sm font-bold mb-4 uppercase tracking-widest">
                <Gift className="w-4 h-4" /> Programme d'Affiliation Exclusif
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Gagnez de l'argent en partageant l'application !
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg mb-6 leading-relaxed">
                Invitez vos amis et confrères à rejoindre Artisan ChapChap et
                générez des revenus passifs sur{" "}
                <span className="font-bold text-brand-700 dark:text-blue-400">
                  2 niveaux d'affiliation
                </span>
                . Fait encore plus intéressant, ces récompenses sont{" "}
                <span className="font-bold">à vie</span> ! Chaque fois que vos
                filleuls (ou leurs filleuls jusqu'au niveau 2) s'abonnent, vous
                êtes automatiquement récompensé !
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-black text-brand-600 mb-1 dark:text-brand-400">
                    25%
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Niveau 1
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-black text-brand-600 mb-1 dark:text-brand-400">
                    10%
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Niveau 2
                  </div>
                </div>
              </div>

              <div className="mt-8 relative z-20">
                <button
                  onClick={() => setIsEligibilityWizardOpen(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3.5 rounded-xl font-bold transition-colors shadow-md shadow-amber-600/20 inline-flex items-center gap-2 ring-2 ring-accent-400 ring-offset-2 dark:ring-offset-slate-900"
                >
                  Se lancer dès maintenant <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="w-full lg:w-80 flex flex-col items-center justify-center relative z-10 mt-8 lg:mt-0 shrink-0">
              <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white dark:bg-slate-800 rounded-full flex flex-col items-center justify-center shadow-2xl border-4 border-brand-100 dark:border-slate-700 rotate-3 hover:rotate-0 transition-transform duration-500">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Revenus
                </span>
                <span className="text-3xl font-black text-brand-600 text-center leading-none">
                  Passifs
                  <br />
                  <span className="text-amber-500">& Illimités</span>
                </span>
              </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-amber-500/10 dark:border-amber-500/5 rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-brand-500/10 dark:border-brand-500/5 rounded-full pointer-events-none" />
          </motion.div>
        </div>
      </section>

      <EligibilityWizard
        isOpen={isEligibilityWizardOpen}
        onClose={() => setIsEligibilityWizardOpen(false)}
      />
    </div>
  );
}
