import React from 'react';
import { useSettingsStore } from '../lib/store';

export default function Terms() {
  const { settings } = useSettingsStore();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {settings?.contentPages?.terms ? (
        <div 
          className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400"
          dangerouslySetInnerHTML={{ __html: settings.contentPages.terms }}
        />
      ) : (
        <>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Conditions d'utilisation</h1>
          <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
            <p className="mb-4">Dernière mise à jour : {new Date().toLocaleDateString()}</p>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">1. Acceptation des conditions</h2>
            <p className="mb-4">
              En accédant et en utilisant cette plateforme, vous acceptez d'être lié par ces conditions d'utilisation.
            </p>
          </div>
        </>
      )}

      <div className="mt-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Conditions d'éligibilité & de retrait</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Pour bénéficier de vos commissions, vous devez vous-même disposer d'un abonnement actif (en cas d'expiration, les gains sont gelés). De plus, le retrait est possible à partir de <strong className="text-slate-900 dark:text-white">1 000 FCFA</strong> accumulés.
        </p>
      </div>
    </div>
  );
}
