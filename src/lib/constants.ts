export const PHONE_PREFIXES = [
  { code: '+229', country: 'Bénin' },
  { code: '+226', country: 'Burkina Faso' },
  { code: '+257', country: 'Burundi' },
  { code: '+237', country: 'Cameroun' },
  { code: '+236', country: 'Centrafrique' },
  { code: '+242', country: 'Congo' },
  { code: '+225', country: 'Côte d\'Ivoire' },
  { code: '+241', country: 'Gabon' },
  { code: '+224', country: 'Guinée' },
  { code: '+223', country: 'Mali' },
  { code: '+227', country: 'Niger' },
  { code: '+243', country: 'RDC' },
  { code: '+250', country: 'Rwanda' },
  { code: '+221', country: 'Sénégal' },
  { code: '+235', country: 'Tchad' },
  { code: '+228', country: 'Togo' }
];

export function parsePhone(phone: string | undefined): { prefix: string, number: string } {
  if (!phone) return { prefix: '+225', number: '' };
  for (const p of PHONE_PREFIXES) {
    if (phone.startsWith(p.code)) {
      return { prefix: p.code, number: phone.slice(p.code.length).trim() };
    }
  }
  return { prefix: '+225', number: phone.trim() };
}

export const COMMON_PROFESSIONS = [
  'Plombier', 'Aide Plombier', 'Électricien', 'Aide Électricien', 'Menuisier', 'Aide Menuisier',
  'Peintre', 'Aide Peintre', 'Climatisation', 'Aide Climatisation', 'Mécanicien', 'Aide Mécanicien',
  'Vulcanisateur', 'Maçon', 'Aide Maçon', 'Couturier', 'Carreleur', 'Fouilleur', 'Architecte',
  'Démarcheur immobilier', 'Sous-traitant BTP', 'Sous-traitant Plomberie', 'Sous-traitant Électricité',
  'Sous-traitant Menuiserie', 'Sous-traitant Peinture', 'Servante', 'Technicien de surface',
  'Gestionnaire de stock', 'Créateur de contenu', 'Cuisinier', 'Jardinier', 'Chauffeur',
  'Livreur', 'Gardien', 'Développeur Web', 'Infographiste', 'Photographe', 'Coiffeur',
  'Esthéticienne'
].sort();

export const COUNTRIES = [
  'Bénin',
  'Burkina Faso',
  'Burundi',
  'Cameroun',
  'Centrafrique',
  'Congo',
  "Côte d'Ivoire",
  'Gabon',
  'Guinée',
  'Mali',
  'Niger',
  'RDC',
  'Rwanda',
  'Sénégal',
  'Tchad',
  'Togo'
].sort();

export const COUNTRY_FLAGS: Record<string, string> = {
  'Bénin': 'https://flagcdn.com/w20/bj.png',
  'Burkina Faso': 'https://flagcdn.com/w20/bf.png',
  'Burundi': 'https://flagcdn.com/w20/bi.png',
  'Cameroun': 'https://flagcdn.com/w20/cm.png',
  'Centrafrique': 'https://flagcdn.com/w20/cf.png',
  'Congo': 'https://flagcdn.com/w20/cg.png',
  "Côte d'Ivoire": 'https://flagcdn.com/w20/ci.png',
  'Gabon': 'https://flagcdn.com/w20/ga.png',
  'Guinée': 'https://flagcdn.com/w20/gn.png',
  'Mali': 'https://flagcdn.com/w20/ml.png',
  'Niger': 'https://flagcdn.com/w20/ne.png',
  'RDC': 'https://flagcdn.com/w20/cd.png',
  'Rwanda': 'https://flagcdn.com/w20/rw.png',
  'Sénégal': 'https://flagcdn.com/w20/sn.png',
  'Tchad': 'https://flagcdn.com/w20/td.png',
  'Togo': 'https://flagcdn.com/w20/tg.png'
};

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  "Côte d'Ivoire": [
    'Abidjan (Cocody)', 'Abidjan (Yopougon)', 'Abidjan (Abobo)', 'Abidjan (Marcory)', 'Abidjan (Plateau)',
    'Bouaké', 'San Pedro', 'Yamoussoukro', 'Korhogo', 'Daloa', 'Man', 'Gagnoa', 'Soubré', 'Odienné',
    'Divo', 'Abengourou', 'Grand-Bassam', 'Agboville', 'Assinie', 'Jacqueville'
  ].sort(),
  'Sénégal': ['Dakar', 'Thiès', 'Rufisque', 'Saint-Louis', 'Ziguinchor', 'Mbour'].sort(),
  'Mali': ['Bamako', 'Sikasso', 'Mopti', 'Koutiala', 'Kayes'].sort(),
  'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora'].sort(),
  'Togo': ['Lomé', 'Sokodé', 'Kara', 'Kpalimé', 'Atakpamé'].sort(),
  'Bénin': ['Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Abomey'].sort(),
  'Niger': ['Niamey', 'Maradi', 'Zinder', 'Tahoua', 'Agadez'].sort(),
  'Guinée': ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé'].sort(),
  'Cameroun': ['Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Maroua'].sort(),
  'RDC': ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kisangani', 'Goma'].sort(),
  'Burundi': ['Bujumbura', 'Gitega', 'Ngozi'].sort(),
  'Centrafrique': ['Bangui', 'Bimbo', 'Berbérati'].sort(),
  'Congo': ['Brazzaville', 'Pointe-Noire', 'Dolisie'].sort(),
  'Gabon': ['Libreville', 'Port-Gentil', 'Franceville'].sort(),
  'Rwanda': ['Kigali', 'Butare', 'Gitarama'].sort(),
  'Tchad': ['N\'Djaména', 'Moundou', 'Sarh'].sort()
};

export const PAYMENT_LOGOS: Record<string, string> = {
  // Côte d'Ivoire, Sénégal, Mali, Burkina, Guinée, Cameroun, etc.
  'Orange Money': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg',
  'MTN Money': 'https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg',
  'MTN Mobile Money': 'https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg',
  'Wave': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Wave_Mobile_Money_logo.png',
  'Moov Money': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Moov_Africa_logo.png',
  'Moov Africa': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Moov_Africa_logo.png',
  'Free Money': 'https://fr.allafrica.com/download/pic/main/main/csiid/00561570:4632b0ec0337c768997a38fe411b033d:arc614x376:w1200:us1.jpg',
  'TMoney': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Togocom_logo.png/1200px-Togocom_logo.png',
  'Flooz': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Moov_Africa_logo.png', // Souvent assimilé à Moov
  'Coris Money': 'https://coris-bank.com/wp-content/uploads/2021/08/logo-coris-money.png',
  'SAMA Money': 'https://sama.money/wp-content/uploads/2021/08/logo.png',
  'Airtel Money': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Airtel_logo.svg/512px-Airtel_logo.svg.png',
  'M-Pesa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/512px-M-PESA_LOGO-01.svg.png',

  // Cartes et Crypto
  'Carte Visa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png',
  'Mastercard': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png',
  'Crypto (USDT)': 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024',
  'PayPal': 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg'
};

export const LOCAL_PAYMENT_METHODS_BY_COUNTRY: Record<string, string[]> = {
  "Côte d'Ivoire": ["Orange Money", "MTN Money", "Wave", "Moov Money"],
  "Sénégal": ["Orange Money", "Wave", "Free Money"],
  "Mali": ["Orange Money", "Moov Africa", "SAMA Money"],
  "Burkina Faso": ["Orange Money", "Moov Africa", "Coris Money"],
  "Togo": ["TMoney", "Flooz"],
  "Bénin": ["MTN Mobile Money", "Moov Money"],
  "Niger": ["Airtel Money", "Moov Africa", "Orange Money"],
  "Guinée": ["Orange Money", "MTN Mobile Money"],
  "Cameroun": ["Orange Money", "MTN Mobile Money"],
  "RDC": ["M-Pesa", "Orange Money", "Airtel Money"],
  "Burundi": ["Lumicash", "Ecocash"], 
  "Centrafrique": ["Orange Money"],
  "Congo": ["MTN Mobile Money", "Airtel Money"],
  "Gabon": ["Airtel Money", "Moov Africa"],
  "Rwanda": ["MTN Mobile Money", "Airtel Money"],
  "Tchad": ["Airtel Money", "Moov Africa"],
};

