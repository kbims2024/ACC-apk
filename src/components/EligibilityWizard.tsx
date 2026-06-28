import React, { useState } from 'react';
import { X, CheckCircle, ChevronRight, UserPlus, CreditCard, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../lib/store';

interface EligibilityWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EligibilityWizard({ isOpen, onClose }: EligibilityWizardProps) {
  const user = useAuthStore(state => state.user);
  
  // Decide dynamically the starting step based on login status
  const [currentStep, setCurrentStep] = useState(user ? 2 : 1);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10"
        >
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="mb-8 pr-12">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-display mb-2">
              Étapes d'éligibilité
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Suivez ces étapes simples pour activer et commencer à générer vos revenus passifs.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {/* Step 1 */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${currentStep === 1 ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${currentStep === 1 ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                   {user || currentStep > 1 ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className={`font-bold ${currentStep === 1 ? 'text-brand-900 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>Créer un compte</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Inscrivez-vous gratuitement sur la plateforme.</p>
                  {currentStep === 1 && !user && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                       <Link to="/register" className="inline-flex bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors shadow-sm">
                         S'inscrire maintenant
                       </Link>
                       <button onClick={() => setCurrentStep(2)} className="text-sm font-bold text-brand-600 hover:text-brand-700 py-2 transition-colors dark:text-brand-400">
                         J'ai déjà un compte
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${currentStep === 2 ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${currentStep === 2 ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                   {currentStep > 2 ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <CreditCard className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className={`font-bold ${currentStep === 2 ? 'text-brand-900 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>S'abonner</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ouvrez votre tableau de bord et activez votre abonnement pour débloquer les commissions.</p>
                  {currentStep === 2 && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                       <Link to="/dashboard" onClick={onClose} className="inline-flex bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors shadow-sm">
                         Aller au tableau de bord
                       </Link>
                       <button onClick={() => setCurrentStep(3)} className="text-sm font-bold text-brand-600 hover:text-brand-700 py-2 transition-colors dark:text-brand-400">
                         Passer cette étape
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${currentStep === 3 ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${currentStep === 3 ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold ${currentStep === 3 ? 'text-brand-900 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>Partager son lien</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Invitez vos amis et confrères. Gagnez vos premières commissions dès leur abonnement.</p>
                  {currentStep === 3 && (
                    <div className="mt-4">
                       <Link to="/dashboard" onClick={onClose} className="inline-flex bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors shadow-sm">
                         Récupérer mon lien
                       </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
