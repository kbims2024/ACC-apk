import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { UserPlus, ArrowRight, Lightbulb, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_USER_WORKER, MOCK_USER_CLIENT } from '../lib/mockData';

import { COMMON_PROFESSIONS as ALL_PROFESSIONS, COUNTRIES, CITIES_BY_COUNTRY, PHONE_PREFIXES, COUNTRY_FLAGS } from '../lib/constants';
import CustomSelect from '../components/CustomSelect';

export default function Register() {
  const queryParams = new URLSearchParams(window.location.search);
  const initialRef = queryParams.get('ref') || '';
  const initialRole = queryParams.get('role') || 'client';
  const initialEmail = queryParams.get('email') || '';
  const returnTo = queryParams.get('returnTo') || '/dashboard';
  
  const [formData, setFormData] = useState({ name: '', email: initialEmail, phonePrefix: '+225', phoneNumber: '', whatsappPrefix: '+225', whatsappNumber: '', password: '', role: initialRole, entityType: 'individual', companyName: '', profession: '', customProfession: '', country: "Côte d'Ivoire", location: '', referralCode: initialRef, sameAsPhone: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [professionSuggestions, setProfessionSuggestions] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.login);

  React.useEffect(() => {
    // Mock the AI suggestions by dynamically generating options based on what they type
    if (formData.profession === 'Autres' && formData.customProfession.length > 2) {
      const input = formData.customProfession.trim();
      
      const suggestions = [
        input.charAt(0).toUpperCase() + input.slice(1),
        `Spécialiste en ${input.toLowerCase()}`,
        `Expert ${input.toLowerCase()}`,
        `Artisan ${input.toLowerCase()}`
      ];
      // Filter out exact duplicates
      
      // If the current input exactly matches one of the suggestions (meaning they probably selected it), don't show the dropdown
      if (suggestions.includes(formData.customProfession)) {
        setProfessionSuggestions([]);
      } else {
        setProfessionSuggestions(Array.from(new Set(suggestions)));
      }
    } else {
      setProfessionSuggestions([]);
    }
  }, [formData.customProfession, formData.profession]);

  React.useEffect(() => {
    const contactMethod = localStorage.getItem('pendingRequestContactMethod');
    const guestContact = localStorage.getItem('pendingRequestGuestContact');
    
    if (contactMethod && guestContact) {
      setFormData(prev => {
        const newData = { ...prev };
        if (contactMethod === 'email') {
          newData.email = guestContact;
        } else if (contactMethod === 'phone') {
          newData.phoneNumber = guestContact.replace(/^\+?\d+\s*/, ''); // simple extraction
        } else if (contactMethod === 'whatsapp') {
          newData.sameAsPhone = false;
          newData.whatsappNumber = guestContact.replace(/^\+?\d+\s*/, '');
        }
        return newData;
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        profession: formData.profession === 'Autres' ? (formData.customProfession || 'Autres') : formData.profession,
        phone: `${formData.phonePrefix} ${formData.phoneNumber}`,
        whatsappPhone: formData.sameAsPhone 
          ? `${formData.phonePrefix} ${formData.phoneNumber}` 
          : `${formData.whatsappPrefix} ${formData.whatsappNumber}`
      };
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const dataText = await res.text();
      let data;
      try {
        data = JSON.parse(dataText);
      } catch (e) {
        throw new Error(res.ok ? 'Erreur de parsing de la réponse' : 'Erreur réseau: ' + dataText.substring(0, 50));
      }

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setAuth(data.user, data.token);
      // Pour la démo: on enregistre les identifiants pour simuler la biométrie
      localStorage.setItem('demo_biometric_key', JSON.stringify({ email: formData.email, password: formData.password }));
      navigate(returnTo);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-brand-600/30 ring-2 ring-accent-400 ring-offset-2">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">Rejoindre l'aventure</h2>
          <p className="text-slate-500 dark:text-slate-400">Créez votre compte en moins d'une minute.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"/> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector */}
          <div className="pb-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Je m'inscris en tant que :</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${formData.role === 'client' ? 'border-brand-600 bg-brand-50' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700'}`}>
                <input type="radio" value="client" className="hidden" checked={formData.role === 'client'} onChange={e => setFormData({...formData, role: e.target.value})} />
                <span className={`font-semibold ${formData.role === 'client' ? 'text-brand-700' : 'text-slate-500 dark:text-slate-400'}`}>Client</span>
                <span className="text-xs text-center text-slate-400">Chercher un pro</span>
              </label>
              
              <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${formData.role === 'worker' ? 'border-brand-600 bg-brand-50' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700'}`}>
                <input type="radio" value="worker" className="hidden" checked={formData.role === 'worker'} onChange={e => setFormData({...formData, role: e.target.value})} />
                <span className={`font-semibold ${formData.role === 'worker' ? 'text-brand-700' : 'text-slate-500 dark:text-slate-400'}`}>Artisan</span>
                <span className="text-xs text-center text-slate-400">Offrir mes services</span>
              </label>
            </div>
          </div>

          <div className="pb-2 mt-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
              {formData.role === 'client' ? 'Type de client :' : 'Type de prestataire :'}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-all ${formData.entityType === 'individual' ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'hover:border-slate-300 dark:border-slate-600'}`}>
                <input type="radio" value="individual" className="hidden" checked={formData.entityType === 'individual'} onChange={e => setFormData({...formData, entityType: e.target.value})} />
                <span className={`text-sm font-semibold ${formData.entityType === 'individual' ? 'text-brand-700' : 'text-slate-500 dark:text-slate-400'}`}>
                  {formData.role === 'client' ? 'Particulier' : 'Indépendant'}
                </span>
              </label>
              
              <label className={`cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-all ${formData.entityType === 'company' ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'hover:border-slate-300 dark:border-slate-600'}`}>
                <input type="radio" value="company" className="hidden" checked={formData.entityType === 'company'} onChange={e => setFormData({...formData, entityType: e.target.value})} />
                <span className={`text-sm font-semibold ${formData.entityType === 'company' ? 'text-brand-700' : 'text-slate-500 dark:text-slate-400'}`}>
                  {formData.role === 'client' ? 'Entreprise' : 'Société / Agence'}
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5 mt-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Nom complet</label>
            <input 
              type="text" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none font-medium text-slate-900 dark:text-white"
              placeholder="Ex: Jean Dupont"
            />
          </div>

          {formData.entityType === 'company' && (
            <div className="space-y-1.5 mt-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Nom de l'entreprise</label>
              <input 
                type="text" required
                value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none font-medium text-slate-900 dark:text-white"
                placeholder="Ex: Dupont Services SARL"
              />
            </div>
          )}

          {formData.role === 'worker' && (
            <div className="space-y-1.5 mt-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Métier / Qualification</label>
              <CustomSelect
                value={formData.profession}
                onChange={val => setFormData({...formData, profession: val})}
                options={[...ALL_PROFESSIONS.map(prof => ({label: prof, value: prof})), {label: "Autres", value: "Autres"}]}
                placeholder="Sélectionnez un métier"
                className="w-full"
              />
              
              {formData.profession === 'Autres' && (
                <div className="mt-3 bg-brand-50/50 dark:bg-brand-900/10 p-4 rounded-xl border border-brand-100 dark:border-brand-900/30">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Saisissez votre métier</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.customProfession} 
                      onChange={e => setFormData({...formData, customProfession: e.target.value})}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors outline-none font-medium text-slate-900 dark:text-white"
                      placeholder="Tapez le nom de votre métier..."
                    />
                    
                    {/* Auto-suggest dropdown mock */}
                    <AnimatePresence>
                      {professionSuggestions.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                          className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700"
                        >
                          <ul className="max-h-48 overflow-y-auto py-1">
                            {professionSuggestions.map((sug, idx) => (
                              <li 
                                key={idx} 
                                onClick={() => setFormData({...formData, customProfession: sug})}
                                className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-200"
                              >
                                {sug}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5 mt-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Pays</label>
            <CustomSelect
              value={formData.country}
              onChange={val => {
                const prefix = PHONE_PREFIXES.find(p => p.country === val)?.code || formData.phonePrefix;
                setFormData({...formData, country: val, location: '', phonePrefix: prefix, whatsappPrefix: prefix});
              }}
              options={COUNTRIES.map(c => ({
                label: <span className="flex items-center gap-2"><img src={COUNTRY_FLAGS[c]} alt={c} className="w-5 h-auto rounded-[2px]" /> {c}</span>,
                value: c
              }))}
              placeholder="Sélectionnez un pays"
              className="w-full"
            />
          </div>

          <div className="space-y-1.5 mt-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Ville / Commune</label>
            <CustomSelect
              value={formData.location}
              onChange={val => setFormData({...formData, location: val})}
              options={(CITIES_BY_COUNTRY[formData.country] || []).map(loc => ({
                label: loc,
                value: loc
              }))}
              placeholder="Sélectionnez une localisation"
              disabled={!formData.country}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5 mt-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Adresse email</label>
            <input 
              type="email" required
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none font-medium text-slate-900 dark:text-white"
              placeholder="jean@example.com"
            />
          </div>

          <div className="space-y-1.5 mt-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Numéro de téléphone</label>
            <div className="flex gap-2">
              <div className="relative w-1/3 min-w-[120px]">
                <CustomSelect
                  value={formData.phonePrefix}
                  onChange={val => setFormData({...formData, phonePrefix: val})}
                  options={PHONE_PREFIXES.map(prefix => ({
                    label: <span className="flex items-center gap-2"><img src={COUNTRY_FLAGS[prefix.country]} alt={prefix.country} className="w-5 h-auto rounded-[2px]" /> {prefix.code}</span>,
                    value: prefix.code
                  }))}
                  className="w-full"
                />
              </div>
              <input 
                type="tel" required
                value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none font-medium text-slate-900 dark:text-white flex-1"
                placeholder="01 02 03 04 05"
              />
            </div>
          </div>

          <div className="space-y-1.5 mt-4">
            <label className="flex items-center gap-2 cursor-pointer mt-2 text-sm text-slate-600 dark:text-slate-300">
              <input 
                type="checkbox" 
                checked={formData.sameAsPhone} 
                onChange={e => setFormData({...formData, sameAsPhone: e.target.checked})}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 focus:ring-2 border-slate-300"
              />
              Mon numéro WhatsApp est identique
            </label>

            {!formData.sameAsPhone && (
              <div className="mt-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-2">Numéro WhatsApp <span className="text-emerald-500 text-xs">Aide à être contacté</span></label>
                <div className="flex gap-2">
                  <div className="relative w-1/3 min-w-[120px]">
                    <CustomSelect
                      value={formData.whatsappPrefix}
                      onChange={val => setFormData({...formData, whatsappPrefix: val})}
                      options={PHONE_PREFIXES.map(prefix => ({
                        label: <span className="flex items-center gap-2"><img src={COUNTRY_FLAGS[prefix.country]} alt={prefix.country} className="w-5 h-auto rounded-[2px]" /> {prefix.code}</span>,
                        value: prefix.code
                      }))}
                      className="w-full"
                    />
                  </div>
                  <input 
                    type="tel" required={!formData.sameAsPhone}
                    value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none font-medium text-slate-900 dark:text-white flex-1"
                    placeholder="01 02 03 04 05"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5 mt-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Mot de passe</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} required
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none font-medium text-slate-900 dark:text-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {formData.role === 'worker' && (
            <div className="space-y-1.5 mt-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 text-slate-500">Code de parrainage (optionnel)</label>
              <input 
                type="text" 
                value={formData.referralCode} onChange={e => setFormData({...formData, referralCode: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none font-medium text-slate-900 dark:text-white uppercase"
                placeholder="EX: ABCD12"
              />
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 mt-4 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed group shadow-md shadow-brand-600/20 ring-2 ring-accent-400 ring-offset-2"
          >
            {loading ? 'Création en cours...' : <>Créer mon compte <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all"/></>}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Déjà inscrit ? <Link to="/login" className="text-slate-900 dark:text-white font-bold hover:underline">Se connecter sur son espace</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
