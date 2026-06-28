import { Link } from 'react-router-dom';
import { Hammer, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { useSettingsStore } from '../lib/store';

export default function Footer() {
  const { settings } = useSettingsStore();
  const platformName = settings?.platformName || 'ArtisanChapChap';

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt={platformName} className="h-10 w-10 object-cover rounded-full shrink-0 group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center transform shrink-0 group-hover:scale-105 transition-transform duration-300 ring-2 ring-accent-400 ring-offset-2 dark:ring-offset-slate-900 shadow-sm">
                  <Hammer className="w-5 h-5 text-white transform -rotate-12" />
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
                <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white leading-tight">
                  {platformName}
                </span>
              )}
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
              La plateforme n°1 pour trouver et contacter les meilleurs artisans près de chez vous. Qualité, rapidité et confiance.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#!" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-brand-100 hover:text-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#!" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-brand-100 hover:text-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#!" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-brand-100 hover:text-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#!" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-brand-100 hover:text-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 uppercase text-sm tracking-wider">Liens Rapides</h3>
            <ul className="space-y-3 relative">
              <li>
                <Link to="/" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-brand-400"></span> Accueil
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-brand-400"></span> Trouver un artisan
                </Link>
              </li>
              <li>
                <Link to="/register?type=worker" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-brand-400"></span> Devenir Artisan
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-brand-400"></span> Connexion
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Info */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 uppercase text-sm tracking-wider">Informations</h3>
            <ul className="space-y-3 relative">
              <li>
                <Link to="/about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span> À propos de nous
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span> Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span> Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span> Aide & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 uppercase text-sm tracking-wider">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Quartier des Affaires,<br />
                  Abidjan, Côte d'Ivoire
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-500 shrink-0" />
                <a href="tel:+22500000000" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 transition-colors">
                  +225 00 00 00 00
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-500 shrink-0" />
                <a href="mailto:contact@artisanchapchap.com" className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 transition-colors">
                  contact@artisanchapchap.com
                </a>
              </li>
            </ul>
          </div>
          
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} {platformName}. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            Fait avec <span className="text-rose-500">❤️</span> pour les artisans.
          </div>
        </div>
      </div>
    </footer>
  );
}
