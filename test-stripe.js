import Stripe from 'stripe';

async function run() {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    const stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' });
    
    console.log("Creating session...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'xof',
            recurring: { interval: 'month' },
            product_data: { name: 'Abonnement Professionnel (monthly)' },
            unit_amount: 500,
          },
          quantity: 1,
        },
      ],
      customer_email: 'test@example.com',
      client_reference_id: '1234567890',
      success_url: 'http://localhost:3000/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true',
      cancel_url: 'http://localhost:3000/dashboard?canceled=true',
      metadata: { userId: '1234567890', plan: 'pro', duration: 'monthly' },
    });
    console.log("Success! Session ID:", session.id);
  } catch (err) {
    console.error("Stripe Error:", err.message);
  }
}
run();
