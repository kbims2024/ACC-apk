import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  id: { type: String, default: 'global', unique: true },
  logoUrl: { type: String, default: '' },
  platformName: { type: String, default: 'ArtisanChapChap' },
  
  // Bande 1 : Flash Infos (Bannière défilante)
  flashInfoEnabled: { type: Boolean, default: false },
  flashInfoBgColor: { type: String, default: '#E11D48' },
  flashInfos: [{
    text: { type: String, required: true },
    priority: { type: Number, default: 0 }
  }],
  
  // Bande 2 : Compte à rebours
  timerEnabled: { type: Boolean, default: false },
  timerBgColor: { type: String, default: '#BE123C' },
  timerEndDate: { type: Date, default: null },
  timerTitle: { type: String, default: 'Expire dans :' },
  
  // Couleurs sauvegardées en favoris
  savedColors: { type: [String], default: [] },

  // Tarifs des abonnements
  subscriptionPrices: {
    workerQuarterly: { type: Number, default: 5000 },
    workerSemiannual: { type: Number, default: 8000 },
    workerYearly: { type: Number, default: 14000 },
  },

  // Contenus des pages légales et informations
  contentPages: {
    about: { type: String, default: '<h1>À propos de nous</h1><p>Contenu à modifier par l\'administrateur...</p>' },
    terms: { type: String, default: '<h1>Conditions d\'utilisation</h1><p>Contenu à modifier par l\'administrateur...</p>' },
    privacy: { type: String, default: '<h1>Politique de confidentialité</h1><p>Contenu à modifier par l\'administrateur...</p>' },
    faq: { type: String, default: '<h1>Aide & FAQ</h1><p>Contenu à modifier par l\'administrateur...</p>' }
  },

  // Liste méthodes
  withdrawMethodsByCountry: [{
    country: { type: String, required: true },
    methods: [{ type: String }]
  }],
  depositMethodsByCountry: [{
    country: { type: String, required: true },
    methods: [{ type: String }]
  }],

  totalAccRevenue: { type: Number, default: 0 },
  transferredAccRevenue: { type: Number, default: 0 },

  settingsVersion: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const Settings = mongoose.model('Settings', settingsSchema);
