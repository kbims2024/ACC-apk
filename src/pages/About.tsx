import React from 'react';
import { useSettingsStore } from '../lib/store';

export default function About() {
  const { settings } = useSettingsStore();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {settings?.contentPages?.about ? (
        <div 
          className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400"
          dangerouslySetInnerHTML={{ __html: settings.contentPages.about }}
        />
      ) : (
        <>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">À propos de nous</h1>
          <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
            <p className="mb-4">
              ArtisanChapChap est la plateforme n°1 pour trouver et contacter les meilleurs artisans près de chez vous.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
