import React from 'react';
import { useSettingsStore } from '../lib/store';

export default function Faq() {
  const { settings } = useSettingsStore();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {settings?.contentPages?.faq ? (
        <div 
          className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400"
          dangerouslySetInnerHTML={{ __html: settings.contentPages.faq }}
        />
      ) : (
        <>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Aide & FAQ</h1>
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Comment trouver un artisan ?</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Utilisez la barre de recherche sur la page d'accueil.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
