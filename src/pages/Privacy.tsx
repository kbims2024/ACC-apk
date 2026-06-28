import React from 'react';
import { useSettingsStore } from '../lib/store';

export default function Privacy() {
  const { settings } = useSettingsStore();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {settings?.contentPages?.privacy ? (
        <div 
          className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400"
          dangerouslySetInnerHTML={{ __html: settings.contentPages.privacy }}
        />
      ) : (
        <>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Politique de confidentialité</h1>
          <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
            <p className="mb-4">Dernière mise à jour : {new Date().toLocaleDateString()}</p>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">1. Collecte des données</h2>
            <p className="mb-4">
              Nous collectons les informations que vous nous fournissez directement.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
