import express from 'express';
import Stripe from 'stripe';
import { User } from '../models/User.js';
import { Settings } from '../models/Settings.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

import { processSubscriptionAndRewards } from '../utils/referral.js';

const router = express.Router();
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(key, { apiVersion: '2025-02-24.acacia' as any });
  }
  return stripeClient;
}

// 1. Créer une session Stripe Checkout pour un abonnement
router.post('/create-checkout-session', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { plan, duration } = req.body; // e.g. plan: 'pro', duration: 'monthly'
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
       // Mock subscription if no stripe key is provided
       const globalSettings: any = await Settings.findOne({ id: 'global' });
       const prices = globalSettings?.subscriptionPrices || { workerQuarterly: 5000, workerSemiannual: 8000, workerYearly: 14000 };
       const promoActive = globalSettings?.promoEnabled && globalSettings?.promoEndDate && new Date() < new Date(globalSettings.promoEndDate);

       const expirationDate = new Date();
       let durationInMonths = 3;
       let amount = prices.workerQuarterly;
       let planDesc = 'Trimestriel';

       if (duration === 'yearly') {
         durationInMonths = 12;
         amount = prices.workerYearly;
         planDesc = 'Annuel';
       } else if (duration === 'semiannual') {
         durationInMonths = 6;
         amount = prices.workerSemiannual;
         planDesc = 'Semestriel';
       } else {
         // duration === 'quarterly'
         durationInMonths = 3;
         amount = prices.workerQuarterly;
         planDesc = 'Trimestriel';
       }

       if (promoActive) durationInMonths += 1;
       expirationDate.setMonth(expirationDate.getMonth() + durationInMonths);
       
       await User.findByIdAndUpdate(user._id, {
         subscription: {
           plan: duration,
           status: 'active',
           activeUntil: expirationDate
         }
       });

       await processSubscriptionAndRewards(user._id.toString(), amount, `Abonnement ${planDesc}`);

       const appUrl = process.env.APP_URL || req.headers.origin || `${req.protocol}://${req.get('host')}`;
       return res.json({ url: `${appUrl}/dashboard?success=true` });
    }

    const stripe = getStripe();
    const appUrl = process.env.APP_URL || req.headers.origin || `${req.protocol}://${req.get('host')}`;

    const globalSettingsForStripe: any = await Settings.findOne({ id: 'global' });
    const pricesStripe = globalSettingsForStripe?.subscriptionPrices || { workerQuarterly: 5000, workerSemiannual: 8000, workerYearly: 14000 };

    // Définir les prix selon vos plans
    let amount = pricesStripe.workerQuarterly;
    if (duration === 'yearly') amount = pricesStripe.workerYearly;
    else if (duration === 'semiannual') amount = pricesStripe.workerSemiannual;
    // convert to smallest unit if needed (like centimes). For XOF, stripe uses integers (no decimal), but some docs say XOF is lowest unit. Let's keep the actual amount.
    const currency = 'xof';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: currency,
            recurring: {
              interval: duration === 'yearly' ? 'year' : 'month',
            },
            product_data: {
              name: `Abonnement ${plan === 'pro' ? 'Professionnel' : 'Standard'} (${duration})`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      customer_email: user.email,
      client_reference_id: user._id.toString(),
      success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${appUrl}/dashboard?canceled=true`,
      metadata: {
        userId: user._id.toString(),
        plan,
        duration,
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. Webhook Stripe pour écouter les paiements réussis
// Attention: le corps de la requête webhook doit être en format brut (raw)
// Nous utiliserons express.raw() dans server.ts pour cette route spécifique, 
// ou on le fait ici si le middleware global n'interfère pas.

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripe();
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (!sig || !endpointSecret) {
      // Si on teste en local sans webhook secret, on parse juste le body
      event = req.body;
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Gérer les différents événements Stripe
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Paiement et souscription réussis
        const userId = session.client_reference_id || session.metadata?.userId;
        const plan = session.metadata?.plan || 'pro';
        const duration = session.metadata?.duration || 'monthly';
        
        if (userId) {
          const globalSettings: any = await Settings.findOne({ id: 'global' });
          const prices = globalSettings?.subscriptionPrices || { workerQuarterly: 5000, workerSemiannual: 8000, workerYearly: 14000 };
          const promoActive = globalSettings?.promoEnabled && globalSettings?.promoEndDate && new Date() < new Date(globalSettings.promoEndDate);

          const expirationDate = new Date();
          let durationInMonths = 3;
          let amount = prices.workerQuarterly;
          let planDesc = 'Trimestriel';

          if (duration === 'yearly') {
            durationInMonths = 12;
            amount = prices.workerYearly;
            planDesc = 'Annuel';
          } else if (duration === 'semiannual') {
            durationInMonths = 6;
            amount = prices.workerSemiannual;
            planDesc = 'Semestriel';
          } else {
            durationInMonths = 3;
            amount = prices.workerQuarterly;
            planDesc = 'Trimestriel';
          }

          if (promoActive) durationInMonths += 1;
          expirationDate.setMonth(expirationDate.getMonth() + durationInMonths);

          await User.findByIdAndUpdate(userId, {
            isVerified: true, // optionnel: valider l'utilisateur
            subscription: {
              plan: duration,
              status: 'active',
              activeUntil: expirationDate,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            }
          });
          
          await processSubscriptionAndRewards(userId.toString(), amount, `Abonnement ${planDesc}`);
          console.log(`User ${userId} subscribed to ${duration} until ${expirationDate}`);
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        // Paiement récurrent réussi, prolonger l'abonnement
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;
        
        const user = await User.findOne({ 
          'subscription.stripeCustomerId': customerId,
          'subscription.stripeSubscriptionId': subscriptionId
        });

        if (user && user.subscription) {
          const expirationDate = new Date(invoice.lines.data[0].period.end * 1000);
          await User.findByIdAndUpdate(user._id, {
            'subscription.activeUntil': expirationDate,
            'subscription.status': 'active'
          });
          console.log(`User subscription updated until ${expirationDate}`);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        await User.findOneAndUpdate(
          { 'subscription.stripeCustomerId': customerId },
          { 'subscription.status': 'past_due' } // ou annulé
        );
        break;
      }
      // Vous pouvez ajouter d'autres événements comme customer.subscription.deleted...
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('Error processing webhook:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

export default router;
