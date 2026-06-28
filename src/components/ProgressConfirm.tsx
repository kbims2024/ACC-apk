import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';

interface ProgressConfirmProps {
  isSubmitting: boolean;
  isSuccess: boolean;
  progress: number;
  successMessage: React.ReactNode;
  onClose?: () => void;
}

export default function ProgressConfirm({
  isSubmitting,
  isSuccess,
  progress,
  successMessage,
  onClose
}: ProgressConfirmProps) {
  if (!isSubmitting && !isSuccess) return null;

  return (
    <div className="py-6 flex flex-col items-center justify-center text-center">
      {isSubmitting && !isSuccess ? (
        <div className="w-full max-w-sm">
          <div className="mb-2 flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
            <span>Chargement...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.2 }}
            />
          </div>
        </div>
      ) : isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full"
        >
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <div className="text-lg font-medium text-slate-900 dark:text-white mb-6 leading-relaxed">
            {successMessage}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition"
            >
              Fermer
            </button>
          )}
        </motion.div>
      ) : null}
    </div>
  );
}
