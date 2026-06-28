import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';

// Using .js extensions in imports as they are in the original server.ts if required, 
// though we can also just let Vercel handle it without extensions if it's TS.
// Wait, in server.ts the imports were with dynamic import('.js').
import authRoutes from '../src/server/routes/auth.js';
import userRoutes from '../src/server/routes/users.js';
import requestRoutes from '../src/server/routes/requests.js';
import paystackRoutes from '../src/server/routes/paystack.js';
import stripeRoutes from '../src/server/routes/stripe.js';
import aiRoutes from '../src/server/routes/ai.js';
import settingsRoutes from '../src/server/routes/settings.js';
import adminRoutes from '../src/server/routes/admin.js';
import tenderRoutes from '../src/server/routes/tenders.js';

dotenv.config();

const app = express();

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Database Connection
let isConnecting = false;

app.use(async (req, res, next) => {
  if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI is not set.');
    return next();
  }

  if (mongoose.connection.readyState === 1) {
    return next();
  }

  try {
    if (!isConnecting) {
      isConnecting = true;
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ MongoDB Connected');
      isConnecting = false;
    } else {
      // Wait a bit if it's currently connecting
      let retries = 20;
      while (isConnecting && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 250));
        retries--;
      }
    }
    next();
  } catch (err) {
    isConnecting = false;
    console.error('❌ MongoDB connection error:', err);
    next(); // Let the route handlers handle the connection error if they want
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/paystack', paystackRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tenders', tenderRoutes);

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

export default app;
