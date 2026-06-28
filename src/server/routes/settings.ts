import express from 'express';
import { Settings } from '../models/Settings.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) {
      settings = await Settings.create({ id: 'global' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.patch('/', adminAuth, async (req, res) => {
  try {
    const { 
      logoUrl, 
      platformName, 
      flashInfoEnabled, 
      flashInfoBgColor,
      flashInfos, 
      timerEnabled, 
      timerBgColor,
      timerEndDate, 
      timerTitle,
      savedColors,
      subscriptionPrices,
      contentPages,
      withdrawMethodsByCountry,
      depositMethodsByCountry
    } = req.body;
    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) {
      settings = new Settings({ id: 'global' });
    }
    if (logoUrl !== undefined) settings.logoUrl = logoUrl;
    if (platformName !== undefined) settings.platformName = platformName;
    if (flashInfoEnabled !== undefined) settings.flashInfoEnabled = flashInfoEnabled;
    if (flashInfoBgColor !== undefined) settings.flashInfoBgColor = flashInfoBgColor;
    if (flashInfos !== undefined) settings.flashInfos = flashInfos;
    if (timerEnabled !== undefined) settings.timerEnabled = timerEnabled;
    if (timerBgColor !== undefined) settings.timerBgColor = timerBgColor;
    if (timerEndDate !== undefined) settings.timerEndDate = timerEndDate;
    if (timerTitle !== undefined) settings.timerTitle = timerTitle;
    if (savedColors !== undefined) settings.savedColors = savedColors;
    if (subscriptionPrices !== undefined) settings.subscriptionPrices = subscriptionPrices;
    if (contentPages !== undefined) settings.contentPages = contentPages;
    if (withdrawMethodsByCountry !== undefined) settings.withdrawMethodsByCountry = withdrawMethodsByCountry;
    if (depositMethodsByCountry !== undefined) settings.depositMethodsByCountry = depositMethodsByCountry;
    let isLegalOrPriceChanged = false;
    if (subscriptionPrices !== undefined || contentPages !== undefined) {
      isLegalOrPriceChanged = true;
      settings.settingsVersion = (settings.settingsVersion || 0) + 1;
    }
    
    await settings.save();
    
    if (isLegalOrPriceChanged) {
      const io = req.app.get('io');
      if (io) {
        io.emit('settings_updated', { version: settings.settingsVersion });
      }
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
