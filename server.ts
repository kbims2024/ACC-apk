import express from 'express';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Prevent node process from crashing
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT'] }
  });

  // Make io accessible to routers
  app.set('io', io);

  // --- API Routes imports ---
  const authRoutes = (await import('./src/server/routes/auth.js')).default;
  const userRoutes = (await import('./src/server/routes/users.js')).default;
  const requestRoutes = (await import('./src/server/routes/requests.js')).default;
  const paystackRoutes = (await import('./src/server/routes/paystack.js')).default;
  const stripeRoutes = (await import('./src/server/routes/stripe.js')).default;
  const aiRoutes = (await import('./src/server/routes/ai.js')).default;
  const settingsRoutes = (await import('./src/server/routes/settings.js')).default;
  const adminRoutes = (await import('./src/server/routes/admin.js')).default;
  const tenderRoutes = (await import('./src/server/routes/tenders.js')).default;

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
  });

  // Mount raw routes for webhooks FIRST
  app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
    // on route vers notre route stripe existante
    next();
  });

  // Middleware
  app.use(compression());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cors());

  // Database Connection
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ MongoDB Connected');
      try {
        await mongoose.connection.collection('users').dropIndex('email_1');
        console.log('✅ Dropped legacy email_1 index');
      } catch (e) {
        // Ignorer si l'index n'existe pas
      }
    } catch (err) {
      console.error('❌ MongoDB connection error:', err);
    }
  } else {
    console.warn('⚠️ MONGO_URI is not set. Database features will not work.');
  }

  // Mount other routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/paystack', paystackRoutes);
  app.use('/api/stripe', stripeRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/tenders', tenderRoutes);

  // Socket.io connection logic
  const onlineUsers = new Map<string, string>();

  io.on('connection', (socket) => {
    console.log('👤 Client connected:', socket.id);
    
    socket.on('join', (userId) => {
      socket.join(userId);
      onlineUsers.set(socket.id, userId);
      // Broadcast that this user is online to everyone
      io.emit('userStatus', { userId, status: 'online' });
      console.log(`User ${userId} joined their room`);
    });

    socket.on('checkStatus', (userIds: string[]) => {
      const onlineSet = new Set(Array.from(onlineUsers.values()));
      const statusMap: Record<string, string> = {};
      userIds.forEach(id => {
        statusMap[id] = onlineSet.has(id) ? 'online' : 'offline';
      });
      socket.emit('statusResult', statusMap);
    });

    socket.on('disconnect', () => {
      const userId = onlineUsers.get(socket.id);
      if (userId) {
        onlineUsers.delete(socket.id);
        const isStillOnline = Array.from(onlineUsers.values()).includes(userId);
        if (!isStillOnline) {
          io.emit('userStatus', { userId, status: 'offline' });
        }
      }
      console.log('👤 Client disconnected:', socket.id);
    });
  });

  // --- Vite Middleware for Development ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production setup: serve standard Vite output
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
