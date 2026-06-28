import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/test', (req, res) => { res.json({ msg: 'auth router test works' }); });

// Register
router.post('/register', async (req, res) => {
  console.log("=== REGISTER ENDPOINT HIT ===");
  console.log("Payload:", req.body);
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("DB NOT CONNECTED");
      return res.status(500).json({ error: "Base de données non connectée. Vérifiez vos clés et l'autorisation des IPs (0.0.0.0/0) sur MongoDB Atlas." });
    }

    const { name, email, phone, whatsappPhone, password, role, entityType, companyName, profession, country, location, referralCode } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Mot de passe manquant" });
    }

    const userRole = role || 'client';
    // Check if user exists
    const existingUser = await User.findOne({ email, role: userRole });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé pour ce type de compte' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Resolve referredBy
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: { $regex: new RegExp(`^${referralCode}$`, 'i') } });
      if (referrer) {
        referredBy = referrer._id;
      }
    }
    
    // Auto-assign admin as referrer if worker and no valid parrain
    if (!referredBy && role === 'worker') {
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        referredBy = admin._id;
      }
    }

    // Generate a unique referral code
    let newReferralCode = '';
    let isUnique = false;
    while (!isUnique) {
      // Format: ACC-XXXXX (5 letters/numbers)
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randomPart = '';
      for (let i = 0; i < 5; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      newReferralCode = `ACC-${randomPart}`;
      const exists = await User.findOne({ referralCode: newReferralCode });
      if (!exists) isUnique = true;
    }

    // Create user
    const newUser = new User({
      name,
      email,
      phone,
      whatsappPhone: whatsappPhone || '',
      password: hashedPassword,
      clearPassword: password,
      role: role || 'client', // 'worker' or 'client'
      entityType: entityType || 'individual',
      companyName: companyName || '',
      profession: profession || '',
      country: country || '',
      location: location || '',
      referralCode: newReferralCode,
      referredBy
    });

    console.log("Saving user:", newUser);
    await newUser.save();

    // Update referral counts
    if (referredBy) {
      try {
        const l1 = await User.findById(referredBy).populate('referredBy');
        if (l1) {
          if (!l1.referralStats) l1.referralStats = { l1Count: 0, l2Count: 0, l3Count: 0, l1Revenue: 0, l2Revenue: 0, l3Revenue: 0, totalRevenue: 0 };
          l1.referralStats.l1Count = (l1.referralStats.l1Count || 0) + 1;
          await l1.save();
          
          if (l1.referredBy) {
            const l2 = await User.findById(l1.referredBy._id || l1.referredBy);
            if (l2) {
              if (!l2.referralStats) l2.referralStats = { l1Count: 0, l2Count: 0, l3Count: 0, l1Revenue: 0, l2Revenue: 0, l3Revenue: 0, totalRevenue: 0 };
              l2.referralStats.l2Count = (l2.referralStats.l2Count || 0) + 1;
              await l2.save();
            }
          }
        }
      } catch (err) {
        console.error("Error updating referral counts:", err);
      }
    }

    // Create token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    console.log("User registered successfully");
    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ error: 'Erreur serveur: ' + ((error as Error).message || 'Erreur inconnue') });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: "Base de données non connectée. Vérifiez vos clés et l'autorisation des IPs (0.0.0.0/0) sur MongoDB Atlas." });
    }

    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Find users by email
    const users = await User.find({ email });
    if (users.length === 0) {
      return res.status(400).json({ error: 'Identifiants invalides' });
    }

    let matchedUser = null;

    // If role is provided, try to find the match for that specific role first
    if (role) {
      const userWithRole = users.find(u => u.role === role && u.password);
      if (userWithRole) {
        const isMatch = await bcrypt.compare(password, userWithRole.password);
        if (isMatch) {
          matchedUser = userWithRole;
        }
      }
    }

    // If no role provided or not matched yet, try to find any matching password
    if (!matchedUser) {
      for (const u of users) {
        if (!u.password) continue;
        const isMatch = await bcrypt.compare(password, u.password);
        if (isMatch) {
          matchedUser = u;
          break; // Prefer the first one that matches
        }
      }
    }

    if (!matchedUser) {
      return res.status(400).json({ error: 'Identifiants invalides' });
    }

    if (matchedUser.status === 'suspended') {
      return res.status(403).json({ error: 'Votre compte a été suspendu par l\'administration.' });
    }

    const user = matchedUser;

    if (!user.clearPassword) {
      user.clearPassword = password;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur: ' + ((error as Error).message || 'Erreur inconnue') });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, phone, newPassword } = req.body;

    if (!email || !phone || !newPassword) {
      return res.status(400).json({ error: "L'email, le téléphone et le nouveau mot de passe sont requis." });
    }

    const user = await User.findOne({ email, phone });
    if (!user) {
      return res.status(404).json({ error: "Aucun utilisateur correspondant à ces informations." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ error: "Erreur lors de la réinitialisation." });
  }
});

// Biometric Login
router.post('/biometric-login', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: "Base de données non connectée." });
    }

    const { email, biometricKey } = req.body;

    // Find user by email and strongly select biometricKey
    const user = await User.findOne({ email }).select('+biometricKey');
    
    if (!user || !user.biometricKey || user.biometricKey !== biometricKey) {
      return res.status(400).json({ error: 'Empreinte non reconnue ou désactivée' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Votre compte a été suspendu par l\'administration.' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Don't send the biometricKey back
    const userObject = user.toObject();
    delete userObject.biometricKey;
    delete userObject.password;

    res.json({ user: userObject, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur: ' + ((error as Error).message || 'Erreur inconnue') });
  }
});

// Switch Account without password (if same email)
router.post('/switch-account', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { targetRole } = req.body;
    
    if (!targetRole) {
      return res.status(400).json({ error: "Rôle cible manquant." });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ error: 'Utilisateur introuvable.' });

    // Look for another account with same email and target role
    const targetUser = await User.findOne({ email: currentUser.email, role: targetRole });
    
    if (!targetUser) {
      return res.status(404).json({ error: 'Aucun compte trouvé avec cet e-mail pour ce rôle.' });
    }

    if (targetUser.status === 'suspended') {
      return res.status(403).json({ error: 'Le compte cible a été suspendu par l\'administration.' });
    }

    const token = jwt.sign(
      { userId: targetUser._id, role: targetUser.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    const userObject = targetUser.toObject();
    delete userObject.biometricKey;
    delete userObject.password;

    res.json({ user: userObject, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Check if alternative account exists
router.get('/alternative-account', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ error: 'Utilisateur introuvable.' });

    const targetRole = currentUser.role === 'client' ? 'worker' : 'client';
    const targetUser = await User.findOne({ email: currentUser.email, role: targetRole });

    res.json({ hasAlternativeAccount: !!targetUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

export default router;
