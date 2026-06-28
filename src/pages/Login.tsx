import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { ArrowRight, Lightbulb, Fingerprint, Eye, EyeOff, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const queryParams = new URLSearchParams(window.location.search);
  const returnTo = queryParams.get('returnTo') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Password Reset State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.login);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetError('');
    setResetMessage('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, phone: resetPhone, newPassword: resetNewPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
      setResetMessage(data.message);
      
      // Clear form except message
      setResetEmail('');
      setResetPhone('');
      setResetNewPassword('');
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const dataText = await res.text();
      let data;
      try {
        data = JSON.parse(dataText);
      } catch (e) {
        throw new Error(res.ok ? 'Erreur de parsing de la réponse' : 'Erreur réseau: ' + dataText.substring(0, 50));
      }

      if (!res.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      setAuth(data.user, data.token);
      // Pour la démo: on enregistre les identifiants pour simuler la biométrie
      localStorage.setItem('demo_biometric_key', JSON.stringify({ email, password }));
      navigate(returnTo);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFingerprintLogin = async () => {
    setError('');
    const isEnabled = localStorage.getItem("fingerprint_enabled") === "true";
    if (!isEnabled) {
      setError("Veuillez d'abord activer l'authentification par empreinte dans votre tableau de bord.");
      return;
    }

    // Simulation: Si le client a configuré l'empreinte, on le connecte
    const storedKey = localStorage.getItem('demo_biometric_key');
    if (!storedKey) {
      setError('Aucune donnée biométrique trouvée sur cet appareil.');
      return;
    }
    
    setLoading(true);
    try {
      const { email, biometricKey } = JSON.parse(storedKey);

      if (window.PublicKeyCredential) {
        try {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);
          const credential = await navigator.credentials.get({
              publicKey: {
                  challenge: challenge,
                  rpId: window.location.hostname,
                  userVerification: "required",
              }
          });
          if (!credential) throw new Error("Annulé");
        } catch (err) {
          console.warn("WebAuthn GET failed, falling back to mock", err);
          if (!window.confirm("Capteur non détecté. Simuler le capteur d'empreinte digitale ?")) {
             setLoading(false);
             return;
          }
        }
      } else {
        if (!window.confirm("Appuyez sur le capteur d'empreinte digitale (Simulation de l'interface native)")) {
          setLoading(false);
          return;
        }
      }

      const res = await fetch('/api/auth/biometric-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, biometricKey })
      });
      
      const dataText = await res.text();
      let data;
      try {
        data = JSON.parse(dataText);
      } catch (e) {
        throw new Error(res.ok ? 'Erreur de parsing' : 'Erreur réseau: ' + dataText.substring(0, 50));
      }

      if (!res.ok) throw new Error(data.error || 'Erreur de connexion');
      
      setAuth(data.user, data.token);
      navigate(returnTo);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800"
      >
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">Bon retour</h2>
          <p className="text-slate-500 dark:text-slate-400">Connectez-vous pour accéder à votre espace</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"/> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Adresse email</label>
            <input 
              type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white dark:bg-slate-900 transition-colors outline-none font-medium text-slate-900 dark:text-white"
              placeholder="vous@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Mot de passe</label>
              <button type="button" onClick={() => setIsResetModalOpen(true)} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Oublié ?</button>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} required
                value={password} onChange={e => setPassword(e.target.value)}
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
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 mt-4 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed group shadow-md shadow-brand-600/20 ring-2 ring-accent-400 ring-offset-2"
          >
            {loading ? 'Vérification...' : <>Se connecter <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all"/></>}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-4">
          <div className="h-px bg-slate-100 flex-1 border-none"/>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">ou</span>
          <div className="h-px bg-slate-100 flex-1 border-none"/>
        </div>

        <button 
          onClick={handleFingerprintLogin}
          type="button" 
          className="w-full h-12 mt-4 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:bg-slate-800 transition-all flex items-center justify-center gap-3"
        >
          <Fingerprint className="w-5 h-5 text-brand-600 dark:text-brand-400"/> Connexion par empreinte
        </button>
        
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Vous débutez sur Artisan ChapChap ? <Link to="/register" className="text-slate-900 dark:text-white font-bold hover:underline">Créer un compte</Link>
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {isResetModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Mot de passe oublié</h3>
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {resetMessage ? (
                  <div className="flex flex-col items-center justify-center text-center py-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Succès !</h4>
                    <p className="text-slate-600 dark:text-slate-300 font-medium mb-6">{resetMessage}</p>
                    <button
                      type="button"
                      onClick={() => setIsResetModalOpen(false)}
                      className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors w-full"
                    >
                      Fermer
                    </button>
                  </div>
                ) : (
                  <>
                    {resetError && (
                      <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
                        {resetError}
                      </div>
                    )}
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Email du compte</label>
                        <input
                          type="email"
                          required
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 dark:text-white"
                          placeholder="vous@email.com"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Numéro de téléphone</label>
                        <input
                          type="tel"
                          required
                          value={resetPhone}
                          onChange={(e) => setResetPhone(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 dark:text-white"
                          placeholder="0102030405"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Nouveau mot de passe</label>
                        <input
                          type="password"
                          required
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 dark:text-white"
                          placeholder="Nouveau mot de passe"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isResetting}
                        className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold mt-2 disabled:opacity-50"
                      >
                        {isResetting ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
