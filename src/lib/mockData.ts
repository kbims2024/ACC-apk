export const MOCK_USER_CLIENT = {
  _id: 'client_mock_1',
  name: 'Amadou Kouamé',
  email: 'client@example.com',
  role: 'client',
  entityType: 'individual',
  phone: '+225 01 02 03 04 05',
  freeRequestsLeft: 3,
};

export const MOCK_USER_WORKER = {
  _id: 'worker_mock_1',
  name: 'Moussa Diabaté',
  email: 'artisan@example.com',
  role: 'worker',
  entityType: 'individual',
  phone: '+225 07 08 09 10 11',
  profession: 'Plombier',
  location: 'Abidjan, Cocody',
  rating: 4.8,
  hourlyRate: 5000,
  description: 'Plombier professionnel avec plus de 10 ans d\'expérience. J\'interviens rapidement pour toutes urgences 24/7.',
  reviewsCount: 24,
  subscription: { plan: 'free' },
  kycStatus: 'pending',
  whatsappPhone: '+225 07 08 09 10 11',
  portfolio: [
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1607472586893-edb57cb31422?auto=format&fit=crop&q=80&w=800'
  ]
};

export const MOCK_WORKERS = [
  MOCK_USER_WORKER,
  // Plombiers
  { _id: 'plombier_2', name: 'Alassane', entityType: 'individual', profession: 'Plombier', location: 'Abidjan, Yopougon', rating: 4.5, hourlyRate: 4000, description: 'Intervention rapide pour toutes fuites et installations sanitaires.', reviewsCount: 12 },
  { _id: 'plombier_3', name: 'EauPro', entityType: 'company', companyName: 'EauPro CI', profession: 'Plombier', location: 'Abidjan, Marcory', rating: 4.9, hourlyRate: 6000, description: 'Entreprise spécialisée en plomberie pour particuliers et professionnels.', reviewsCount: 56 },
  { _id: 'plombier_4', name: 'Franck', entityType: 'individual', profession: 'Plombier', location: 'Bouaké', rating: 4.2, hourlyRate: 3500, description: 'Plomberie générale et débouchage. Déplacement dans toute la ville.', reviewsCount: 8 },
  { _id: 'plombier_5', name: 'Kouassi Sanitaires', entityType: 'company', companyName: 'Kouassi Sanitaires', profession: 'Plombier', location: 'Abidjan, Bingerville', rating: 4.7, hourlyRate: 4500, description: 'Vente et installation de matériels sanitaires. Service garanti.', reviewsCount: 31 },
  // Électriciens
  { _id: 'worker_mock_2', name: 'Awa Koné', entityType: 'individual', profession: 'Électricien', location: 'Abidjan, Yopougon', rating: 4.9, hourlyRate: 3500, description: 'Installation électrique, dépannage et mise aux normes. Travail soigné.', reviewsCount: 42 },
  { _id: 'elec_2', name: 'Zokou', entityType: 'individual', profession: 'Électricien', location: 'Abidjan, Cocody', rating: 4.6, hourlyRate: 4000, description: 'Spécialiste des installations complexes et dépannage urgent.', reviewsCount: 22 },
  { _id: 'elec_3', name: 'Volt Plus', entityType: 'company', companyName: 'Volt Plus SARL', profession: 'Électricien', location: 'San Pedro', rating: 4.8, hourlyRate: 6500, description: 'Électricité industrielle et bâtiment. Équipe qualifiée.', reviewsCount: 89 },
  { _id: 'elec_4', name: 'Soro', entityType: 'individual', profession: 'Électricien', location: 'Abidjan, Abobo', rating: 4.3, hourlyRate: 3000, description: 'Installation de compteurs, lustres, et vérification des câblages.', reviewsCount: 15 },
  { _id: 'elec_5', name: 'Lumière CI', entityType: 'company', companyName: 'Lumière CI', profession: 'Électricien', location: 'Abidjan, Treichville', rating: 5.0, hourlyRate: 7000, description: 'Solutions d\'éclairage intelligentes et rénovation électrique.', reviewsCount: 45 },
  // Menuisiers
  { _id: 'worker_mock_3', name: 'Koffi Menuiserie', entityType: 'company', companyName: 'Koffi Bois Pro SA', profession: 'Menuisier', location: 'Bouaké', rating: 4.5, hourlyRate: 4000, description: 'Fabrication de meubles sur mesure, portes, et réparation de boiseries.', reviewsCount: 15 },
  { _id: 'men_2', name: 'Yao', entityType: 'individual', profession: 'Menuisier', location: 'Abidjan, Koumassi', rating: 4.8, hourlyRate: 4500, description: 'Expert en ébénisterie et création de dressings sur mesure.', reviewsCount: 34 },
  { _id: 'men_3', name: 'Bois Doré', entityType: 'company', companyName: 'Bois Doré', profession: 'Menuisier', location: 'Abidjan, Riviera', rating: 4.7, hourlyRate: 5000, description: 'Aménagement intérieur bois, parquet et charpente.', reviewsCount: 28 },
  { _id: 'men_4', name: 'Camara', entityType: 'individual', profession: 'Menuisier', location: 'Korhogo', rating: 4.4, hourlyRate: 3000, description: 'Fabrication de lits, armoires et portes pour habitations.', reviewsCount: 11 },
  { _id: 'men_5', name: 'Menuiserie Moderne', entityType: 'company', companyName: 'Menuiserie Moderne CI', profession: 'Menuisier', location: 'Abidjan, Marcory', rating: 4.9, hourlyRate: 5500, description: 'Finitions de haute qualité et design moderne.', reviewsCount: 52 },
  // Climatisation
  { _id: 'worker_mock_4', name: 'Jean-Marc', entityType: 'company', companyName: 'Clim Plus CI', profession: 'Climatisation', location: 'Abidjan, Marcory', rating: 5.0, hourlyRate: 6000, description: 'Installation, entretien et réparation de climatiseurs (Split et fenêtres). Entreprise certifiée.', reviewsCount: 8 },
  { _id: 'clim_2', name: 'Oumar', entityType: 'individual', profession: 'Climatisation', location: 'Abidjan, Cocody', rating: 4.6, hourlyRate: 4500, description: 'Nettoyage de splits, recharge de gaz et réparation de cartes.', reviewsCount: 19 },
  { _id: 'clim_3', name: 'Air Frais', entityType: 'company', companyName: 'Air Frais Services', profession: 'Climatisation', location: 'Yamoussoukro', rating: 4.8, hourlyRate: 5000, description: 'Maintenance préventive et curative de systèmes de climatisation.', reviewsCount: 41 },
  { _id: 'clim_4', name: 'Bamba', entityType: 'individual', profession: 'Climatisation', location: 'Abidjan, Adjamé', rating: 4.2, hourlyRate: 3500, description: 'Dépannage rapide de climatiseurs toutes marques.', reviewsCount: 25 },
  { _id: 'clim_5', name: 'Froid Express', entityType: 'company', companyName: 'Froid Express CI', profession: 'Climatisation', location: 'Abidjan, Plateau', rating: 4.9, hourlyRate: 7000, description: 'Intervention tertiaire et résidentielle de haut de gamme.', reviewsCount: 63 },
  // Peintres
  { _id: 'worker_mock_5', name: 'Alain', entityType: 'individual', profession: 'Peintre', location: 'Abidjan, Cocody', rating: 4.7, hourlyRate: 4500, description: 'Peinture intérieure et extérieure. Finitions impeccables et respect des délais.', reviewsCount: 12 },
  { _id: 'peintre_2', name: 'Couleurs de Pro', entityType: 'company', companyName: 'Couleurs de Pro', profession: 'Peintre', location: 'Abidjan, Yopougon', rating: 4.8, hourlyRate: 5000, description: 'Ravalement de façade et peinture décorative.', reviewsCount: 37 },
  { _id: 'peintre_3', name: 'Seydou', entityType: 'individual', profession: 'Peintre', location: 'Daloa', rating: 4.4, hourlyRate: 3000, description: 'Travail sérieux et propre pour tous vos murs et plafonds.', reviewsCount: 14 },
  { _id: 'peintre_4', name: 'Déco Plus', entityType: 'company', companyName: 'Déco Plus SARL', profession: 'Peintre', location: 'Abidjan, Riviera', rating: 4.9, hourlyRate: 6000, description: 'Application de techniques spéciales (stucco, enduits...).', reviewsCount: 48 },
  { _id: 'peintre_5', name: 'Ange', entityType: 'individual', profession: 'Peintre', location: 'Abidjan, Bingerville', rating: 4.5, hourlyRate: 4000, description: 'Peintre bâtiment expérimenté. Devis gratuit.', reviewsCount: 21 },
  // Mécaniciens
  { _id: 'meca_1', name: 'Garage Auto', entityType: 'company', companyName: 'Garage Auto Rapide', profession: 'Mécanicien', location: 'Abidjan, Cocody', rating: 4.8, hourlyRate: 5000, description: 'Réparation toutes marques, vidange et diagnostic électronique.', reviewsCount: 88 },
  { _id: 'meca_2', name: 'Karim', entityType: 'individual', profession: 'Mécanicien', location: 'Bouaké', rating: 4.5, hourlyRate: 3500, description: 'Spécialiste moteurs diesel et entretien de véhicules lourds.', reviewsCount: 26 },
  { _id: 'meca_3', name: 'Auto Services', entityType: 'company', companyName: 'Auto Services CI', profession: 'Mécanicien', location: 'Abidjan, Yopougon', rating: 4.7, hourlyRate: 4500, description: 'Mécanique générale, tôlerie et peinture automobile.', reviewsCount: 54 },
  { _id: 'meca_4', name: 'Traoré', entityType: 'individual', profession: 'Mécanicien', location: 'Man', rating: 4.9, hourlyRate: 4000, description: 'Intervention à domicile ou lieu de panne rapide.', reviewsCount: 17 },
  { _id: 'meca_5', name: 'Pro Méca', entityType: 'company', companyName: 'Pro Méca', profession: 'Mécanicien', location: 'Abidjan, Treichville', rating: 4.6, hourlyRate: 5500, description: 'Experts en boîtes automatiques et pièces de rechange.', reviewsCount: 39 },
  // Maçons
  { _id: 'macon_1', name: 'BTP Ivoire', entityType: 'company', companyName: 'BTP Ivoire', profession: 'Maçon', location: 'Abidjan, Bingerville', rating: 4.9, hourlyRate: 6000, description: 'Gros œuvre, petits travaux, pose de carrelage et dallage.', reviewsCount: 72 },
  { _id: 'macon_2', name: 'Kassi', entityType: 'individual', profession: 'Maçon', location: 'Aboisso', rating: 4.4, hourlyRate: 3500, description: 'Construction de clôtures, murs, et petites extensions.', reviewsCount: 13 },
  { _id: 'macon_3', name: 'Général Bâtiment', entityType: 'company', companyName: 'Général Bâtiment', profession: 'Maçon', location: 'Abidjan, Cocody', rating: 4.7, hourlyRate: 5500, description: 'Équipe complète pour vos chantiers résidentiels.', reviewsCount: 44 },
  { _id: 'macon_4', name: 'Issa', entityType: 'individual', profession: 'Maçon', location: 'Abidjan, Abobo', rating: 4.6, hourlyRate: 4000, description: 'Spécialiste de la brique et du crépissage soigné.', reviewsCount: 29 },
  { _id: 'macon_5', name: 'Constructions Rapides', entityType: 'company', companyName: 'Constructions Rapides SARL', profession: 'Maçon', location: 'San Pedro', rating: 4.8, hourlyRate: 7000, description: 'Solutions clés en main pour la maçonnerie moderne.', reviewsCount: 61 },
  // Couturiers
  { _id: 'cout_1', name: 'Kadi', entityType: 'individual', profession: 'Couturier', location: 'Abidjan, Treichville', rating: 4.9, hourlyRate: 3000, description: 'Couture sur mesure, retouches et création de tenues traditionnelles.', reviewsCount: 41 },
  { _id: 'cout_2', name: 'Atelier Mode', entityType: 'company', companyName: 'Atelier Mode Beauté', profession: 'Couturier', location: 'Abidjan, Cocody', rating: 4.7, hourlyRate: 5000, description: 'Robes de mariée, tailleurs et prêt-à-porter personnalisé.', reviewsCount: 25 },
  { _id: 'cout_3', name: 'Brahima', entityType: 'individual', profession: 'Couturier', location: 'Bouaké', rating: 4.5, hourlyRate: 2500, description: 'Spécialiste chemises et pantalons homme. Coupe parfaite.', reviewsCount: 19 },
  // Vulcanisateurs
  { _id: 'vulco_1', name: 'Momo Pneus', entityType: 'individual', profession: 'Vulcanisateur', location: 'Abidjan, Yopougon', rating: 4.6, hourlyRate: 1500, description: 'Réparation de crevaisons, vente et montage de pneus neufs et occasion.', reviewsCount: 38 },
  { _id: 'vulco_2', name: 'Station Vulco', entityType: 'company', companyName: 'Station Vulco Express', profession: 'Vulcanisateur', location: 'Abidjan, Marcory', rating: 4.8, hourlyRate: 2000, description: 'Équilibrage, parallélisme et réparation rapide.', reviewsCount: 62 },
  { _id: 'vulco_3', name: 'Daouda', entityType: 'individual', profession: 'Vulcanisateur', location: 'Yamoussoukro', rating: 4.3, hourlyRate: 1000, description: 'Dépannage pneus motos et voitures.', reviewsCount: 15 },
  // Aides
  { _id: 'aide_1', name: 'Sylla', entityType: 'individual', profession: 'Aide Maçon', location: 'Abidjan, Abobo', rating: 4.7, hourlyRate: 2000, description: 'Aide maçon expérimenté, très dynamique et respectueux sur les chantiers.', reviewsCount: 14 },
  { _id: 'aide_2', name: 'Kouassi', entityType: 'individual', profession: 'Aide Plombier', location: 'Abidjan, Bingerville', rating: 4.5, hourlyRate: 2500, description: 'Motivation au top, je peux aider dans les poses de tuyauterie.', reviewsCount: 8 },
  { _id: 'aide_3', name: 'Ousmane', entityType: 'individual', profession: 'Aide Électricien', location: 'Abidjan, Koumassi', rating: 4.6, hourlyRate: 2500, description: 'Tirage de câbles, saignées. Je connais les bases.', reviewsCount: 11 },
  { _id: 'aide_4', name: 'Bamba', entityType: 'individual', profession: 'Aide Menuisier', location: 'Abidjan, Yopougon', rating: 4.4, hourlyRate: 2000, description: 'Aide pour le ponçage et l\'assemblage.', reviewsCount: 6 },
  { _id: 'aide_5', name: 'Kone', entityType: 'individual', profession: 'Aide Peintre', location: 'Abidjan, Cocody', rating: 4.8, hourlyRate: 2500, description: 'Je prépare vos murs (enduit, ponçage, nettoyage) avant peinture.', reviewsCount: 18 },
  // Sous-traitants
  { _id: 'st_1', name: 'BTP Réseaux', entityType: 'company', companyName: 'BTP Réseaux', profession: 'Sous-traitant BTP', location: 'Abidjan, Cocody', rating: 4.9, hourlyRate: 15000, description: 'Sous-traitance de gros œuvres, génie civil et VRD.', reviewsCount: 34 },
  { _id: 'st_2', name: 'Elec Industrie', entityType: 'company', companyName: 'Elec Industrie Plus', profession: 'Sous-traitant Électricité', location: 'Abidjan, Yopougon', rating: 4.8, hourlyRate: 10000, description: 'Sous-traitance pour l\'installation électrique industrielle.', reviewsCount: 21 },
  { _id: 'st_3', name: 'Plomb Pro CI', entityType: 'company', companyName: 'Plomb Pro CI', profession: 'Sous-traitant Plomberie', location: 'San Pedro', rating: 4.7, hourlyRate: 12000, description: 'Sous-traitants en plomberie pour grands chantiers complexes.', reviewsCount: 15 },
  { _id: 'st_4', name: 'Menuiserie Bati', entityType: 'company', companyName: 'Menuiserie Bati', profession: 'Sous-traitant Menuiserie', location: 'Bouaké', rating: 4.5, hourlyRate: 8000, description: 'Traitement de commandes en série de menuiserie bois et alu.', reviewsCount: 11 },
  { _id: 'st_5', name: 'Entreprise Peイントre CI', entityType: 'company', companyName: 'Entreprise Peinture CI', profession: 'Sous-traitant Peinture', location: 'Yamoussoukro', rating: 4.6, hourlyRate: 6000, description: 'Sous-traitants pour peinture en bâtiment grands volumes.', reviewsCount: 22 },
  // Carreleurs
  { _id: 'carreleur_1', name: 'Zongo', entityType: 'individual', profession: 'Carreleur', location: 'Abidjan, Abobo', rating: 4.6, hourlyRate: 3500, description: 'Pose de carreaux, faïence et marbre. Travail soigné avec de belles finitions.', reviewsCount: 23 },
  // Fouilleurs
  { _id: 'fouilleur_1', name: 'Drissa', entityType: 'individual', profession: 'Fouilleur', location: 'Abidjan, Yopougon', rating: 4.8, hourlyRate: 2000, description: 'Spécialiste de la fouille pour fondations, fosses septiques et canalisations. Équipe disponible.', reviewsCount: 14 },
  // Architectes
  { _id: 'archi_1', name: 'Bamba Design', entityType: 'company', companyName: 'Bamba Design Studio', profession: 'Architecte', location: 'Abidjan, Cocody', rating: 4.9, hourlyRate: 15000, description: 'Conception de plans 2D/3D et suivi de chantier résidentiel et commercial.', reviewsCount: 45 },
  // Démarcheurs immobiliers
  { _id: 'demarcheur_1', name: 'Touré', entityType: 'individual', profession: 'Démarcheur immobilier', location: 'Abidjan, Cocody', rating: 4.5, hourlyRate: 0, description: 'Recherche de terrains, maisons et appartements. Commission sur conclusion.', reviewsCount: 31 },
];

export const MOCK_REQUESTS_WORKER = [
  { _id: 'req_1', clientId: MOCK_USER_CLIENT, workerId: MOCK_USER_WORKER, serviceDetails: 'Fuite d\'eau sous l\'évier de la cuisine, intervention urgente requise.', location: 'Cocody, Angré', date: new Date().toISOString(), status: 'pending' },
  { _id: 'req_2', clientId: { name: 'Fatou Bamba' }, workerId: MOCK_USER_WORKER, serviceDetails: 'Remplacement de robinetterie salle de bain.', location: 'Cocody, Riviera 2', date: new Date(Date.now() - 86400000).toISOString(), status: 'accepted' },
  { _id: 'req_3', clientId: { name: 'Cédric Yao' }, workerId: MOCK_USER_WORKER, serviceDetails: 'Débouchage de canalisation principale.', location: 'Plateau', date: new Date(Date.now() - 400000000).toISOString(), status: 'completed' },
];

export const MOCK_REQUESTS_CLIENT = [
  { _id: 'req_1', clientId: MOCK_USER_CLIENT, workerId: MOCK_USER_WORKER, serviceDetails: 'Fuite d\'eau sous l\'évier de la cuisine, intervention urgente requise.', location: 'Cocody, Angré', date: new Date().toISOString(), status: 'pending' },
  { _id: 'req_c2', clientId: MOCK_USER_CLIENT, workerId: MOCK_WORKERS[1], serviceDetails: 'Installation de 4 nouveaux disjoncteurs.', location: 'Cocody, Angré', date: new Date(Date.now() - 86400000).toISOString(), status: 'completed' },
];

export const MOCK_REVIEWS = [
  { _id: 'rev_1', rating: 5, comment: 'Très professionnel et ponctuel. Je recommande vivement Moussa !', clientId: { name: 'Kader T.' }, createdAt: new Date(Date.now() - 10000000).toISOString() },
  { _id: 'rev_2', rating: 4, comment: 'Bon travail, le problème est résolu. Ses tarifs sont clairs dès le départ.', clientId: { name: 'Béatrice N.' }, createdAt: new Date(Date.now() - 80000000).toISOString() },
];
