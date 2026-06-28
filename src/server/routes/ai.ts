import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

const ai = new GoogleGenAI({});

router.post('/generate-description', async (req, res) => {
  const { type, occupation } = req.body;
  if (!occupation) {
    return res.status(400).json({ error: "Le métier est requis" });
  }

  let prompt = "";
  if (type === "short") {
    prompt = `En tant qu'expert en marketing pour les artisans et professionnels, génère une phrase d'accroche très courte et très attrayante (maximum 150 caractères) pour le profil professionnel d'un(e) ${occupation}. La phrase doit être à la première personne (je) et ne pas commencer par des guillemets.`;
  } else {
    prompt = `En tant qu'expert en marketing pour les artisans et professionnels, génère une description complète attrayante et professionnelle d'environ 3 à 4 phrases pour la section "À propos" du profil d'un(e) ${occupation}. La description doit être à la première personne (je), mettre en valeur le savoir-faire, le sérieux, et la passion du métier, et donner envie aux clients de faire appel à ses services. Ne mets pas de guillemets autour du texte.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    // Clean up potentially wrapped quotes
    let resultText = response.text || "";
    resultText = resultText.replace(/^["']/, '').replace(/["']$/, '').trim();

    res.json({ text: resultText });
  } catch (error: any) {
    console.error("Erreur de génération IA: ", error);
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "La clé API Gemini (GEMINI_API_KEY) n'est pas configurée. Veuillez l'ajouter dans les variables d'environnement de votre hébergeur (ex: Vercel)." });
    }

    res.status(500).json({ error: error.message || "Erreur interne lors de la génération de la description." });
  }
});

router.post('/generate-page-content', async (req, res) => {
  const { page } = req.body;
  if (!page) {
    return res.status(400).json({ error: "La page est requise" });
  }

  const prompts: Record<string, string> = {
    about: "Génère un contenu HTML (avec <h1>, <p>, <h2>, <ul> etc.) pour la page 'À propos de nous' d'une plateforme de mise en relation d'artisans appelée ArtisanChapChap. Met en avant la confiance, la proximité et la qualité.",
    terms: "Génère un contenu HTML (avec <h1>, <p>, <h2>, <ul> etc.) pour la page 'Conditions d'utilisation' d'une plateforme de mise en relation d'artisans appelée ArtisanChapChap. Le texte doit être sérieux et couvrir les aspects basiques (comptes, responsabilités, acceptation).",
    privacy: "Génère un contenu HTML (avec <h1>, <p>, <h2>, <ul> etc.) pour la page 'Politique de confidentialité' d'une plateforme de mise en relation d'artisans appelée ArtisanChapChap. Décris la collecte, la sécurité et le partage des données.",
    faq: "Génère un contenu HTML (avec <h1>, et plusieurs divs contenant <h2> pour chaque question et <p> pour la réponse) pour la page 'Aide & FAQ' d'une plateforme de mise en relation d'artisans appelée ArtisanChapChap. Questions: Comment trouver un artisan ?, L'inscription est-elle gratuite ?, Comment contacter un artisan ?, Comment laisser un avis ?"
  };

  const prompt = prompts[page as keyof typeof prompts];
  if (!prompt) {
    return res.status(400).json({ error: "Page invalide" });
  }

  const fullPrompt = `${prompt} Renvoie UNIQUEMENT du HTML, pas de blocs markdown, pas de prologue.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });
    
    let resultText = response.text || "";
    resultText = resultText.replace(/^```html\n?/, '').replace(/\n?```$/, '').trim();

    res.json({ text: resultText });
  } catch (error: any) {
    console.error("Erreur de génération IA: ", error);
    res.status(500).json({ error: error.message || "Erreur interne lors de la génération." });
  }
});

export default router;
