import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import mongoose from 'mongoose';
import { processSubscriptionAndRewards } from '../utils/referral.js';

const router = express.Router();

router.post('/create-checkout-session', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { planId, paymentMethod } = req.body; 

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }
    
    // Determine amount based on plan
    let amount = 0;
    let baseDurationParams = 3 * 30 * 24 * 60 * 60 * 1000;
    let finalPlanId = 'quarterly';
    let planLabel = 'Trimestriel';

    if (planId === 'worker_semiannual') {
       amount = 800;
       baseDurationParams = 6 * 30 * 24 * 60 * 60 * 1000;
       finalPlanId = 'semiannual';
       planLabel = 'Semestriel';
    } else if (planId === 'worker_yearly') {
       amount = 1400;
       baseDurationParams = 365 * 24 * 60 * 60 * 1000;
       finalPlanId = 'yearly';
       planLabel = 'Annuel';
    } else {
       amount = 500;
       baseDurationParams = 3 * 30 * 24 * 60 * 60 * 1000;
       finalPlanId = 'quarterly';
       planLabel = 'Trimestriel';
    }

    // Mock logic for non-card methods (like MVP mobile_money/crypto mock)
    if (paymentMethod === 'mobile_money' || paymentMethod === 'crypto') {
       const { Settings } = await import('../models/Settings.js');
       const globalSettings: any = await Settings.findOne({ id: 'global' });
       const promoActive = globalSettings?.promoEnabled && globalSettings?.promoEndDate && new Date() < new Date(globalSettings.promoEndDate);

       const extraDuration = promoActive ? 30 * 24 * 60 * 60 * 1000 : 0;
       const baseDuration = baseDurationParams;

       user.subscription = {
         plan: finalPlanId,
         activeUntil: new Date(Date.now() + baseDuration + extraDuration)
       }
       await user.save();
       
       await processSubscriptionAndRewards(user._id.toString(), amount, `Abonnement ${planLabel}`);
       
       return res.json({ success: true, message: 'Paiement simulé avec succès.', url: '/dashboard' });
    }

    // Determine Paystack amount (in Kobo or smallest unit) => multiply by 100
    let paystackAmount = amount * 100;

    // Use Paystack API
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (paystackKey && paystackKey !== 'sk_test_mock') {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          amount: paystackAmount,
          callback_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
          metadata: {
            userId: user._id,
            planId,
            realAmount: amount
          }
        })
      });

      const data = await response.json();
      if (data.status) {
        return res.json({ url: data.data.authorization_url });
      } else {
        throw new Error(data.message || 'Erreur Paystack');
      }
    }

    // Simulation fallback if no real PAYSTACK key is provided
    const { Settings } = await import('../models/Settings.js');
    const globalSettings: any = await Settings.findOne({ id: 'global' });
    const promoActive = globalSettings?.promoEnabled && globalSettings?.promoEndDate && new Date() < new Date(globalSettings.promoEndDate);

    const extraDuration = promoActive ? 30 * 24 * 60 * 60 * 1000 : 0; // 1 month free
    const baseDuration = baseDurationParams;

    user.subscription = {
      plan: finalPlanId,
      activeUntil: new Date(Date.now() + baseDuration + extraDuration)
    };
    await user.save();
    
    await processSubscriptionAndRewards(user._id.toString(), amount, `Abonnement ${planLabel}`);
    
    res.json({ success: true, message: 'Simulation de paiement Paystack réussie.', url: '/dashboard' });

  } catch (error) {
    console.error('Paystack error:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la session de paiement' });
  }
});

// Optional: Webhook endpoint for handling Paystack events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // Webhook logic would go here to verify signature and handle charge.success
  try {
    const event = JSON.parse(req.body.toString());
    if (event.event === 'charge.success') {
      const data = event.data;
      if (data.metadata && data.metadata.userId && data.metadata.realAmount) {
          // Find user, grant subscription if not already
          const user = await User.findById(data.metadata.userId);
          if (user) {
            const { Settings } = await import('../models/Settings.js');
            const globalSettings: any = await Settings.findOne({ id: 'global' });
            const promoActive = globalSettings?.promoEnabled && globalSettings?.promoEndDate && new Date() < new Date(globalSettings.promoEndDate);
            const extraDuration = promoActive ? 30 * 24 * 60 * 60 * 1000 : 0;
            
            let baseDur = 3 * 30 * 24 * 60 * 60 * 1000;
            let finalPlan = 'quarterly';
            let planDesc = 'Trimestriel';

            if (data.metadata.planId === 'worker_semiannual') {
               baseDur = 6 * 30 * 24 * 60 * 60 * 1000;
               finalPlan = 'semiannual';
               planDesc = 'Semestriel';
            } else if (data.metadata.planId === 'worker_yearly') {
               baseDur = 365 * 24 * 60 * 60 * 1000;
               finalPlan = 'yearly';
               planDesc = 'Annuel';
            }

            user.subscription = {
              plan: finalPlan,
              activeUntil: new Date(Date.now() + baseDur + extraDuration)
            };
            await user.save();

            await processSubscriptionAndRewards(user._id.toString(), data.metadata.realAmount, `Abonnement ${planDesc}`);
        }
      }
    }
  } catch (err) {
    console.error('Webhook error:', err);
  }
  
  res.sendStatus(200);
});

export default router;
