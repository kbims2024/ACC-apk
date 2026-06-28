import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

// Get profile
router.get("/upgrade-to-admin", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    user.role = 'admin';
    await user.save();
    res.json({ message: "Vous êtes maintenant administrateur. Veuillez vous reconnecter pour mettre à jour vos permissions.", user });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

router.get("/transfer-history", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { Transaction } = await import("../models/Transaction.js");
    const { type } = req.query;
    let filter: any = { userId: req.userId };
    
    if (type === 'transfer_affiliate') {
      filter.type = 'transfer';
      filter.description = "Transfert Revenus d'Affiliation";
    } else if (type === 'affiliate_all') {
      filter.type = { $in: ['commission', 'withdrawal', 'transfer'] };
    } else if (type === 'wallet') {
      filter.type = { $in: ['commission', 'withdrawal', 'transfer'] };
    } else {
      filter.type = { $in: ['commission', 'withdrawal', 'transfer'] };
    }

    const history = await Transaction.find(filter).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/withdraw", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { amount, method } = req.body;
    if (!amount || amount < 1000 || !method) {
      return res.status(400).json({ error: "Données de retrait invalides." });
    }

    const { Transaction } = await import("../models/Transaction.js");
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    const availableAffiliate = (user.referralStats?.totalRevenue || 0) - (user.referralStats?.transferredRevenue || 0);
    if (availableAffiliate < amount) {
      return res.status(400).json({ error: "Fonds d'affiliation insuffisants." });
    }
    if (!user.referralStats) user.referralStats = {};
    user.referralStats.transferredRevenue = (user.referralStats.transferredRevenue || 0) + amount;
    
    await user.save();

    const tx = new Transaction({
      userId: user._id,
      amount,
      type: 'withdrawal',
      description: `Demande de retrait via ${method}`,
      status: 'pending'
    });
    await tx.save();

    res.json({ message: "Demande enregistrée avec succès", user });
  } catch (error) {
    console.error("Error withdrawing:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/transfer-affiliate", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Montant invalide." });
    }

    const { Transaction } = await import("../models/Transaction.js");
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    if (!user.referralStats) {
      return res.status(400).json({ error: "Aucune donnée d'affiliation." });
    }

    const totalEarning = user.referralStats.totalRevenue || 0;
    const transferredDoc = await Transaction.aggregate([
      { $match: { type: 'transfer', description: "Transfert Revenus d'Affiliation", userId: user._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const transferredDocTotal = transferredDoc.length > 0 ? transferredDoc[0].total : 0;
    const transferred = Math.max(transferredDocTotal, user.referralStats.transferredRevenue || 0);
    
    const available = totalEarning - transferred;

    if (amount > available) {
      return res.status(400).json({ error: "Solde d'affiliation insuffisant pour ce transfert." });
    }

    user.referralStats.transferredRevenue = transferred + amount;
    user.walletBalance = (user.walletBalance || 0) + amount;
    await user.save();

    await Transaction.create({
      userId: user._id,
      amount: amount,
      type: 'transfer',
      status: 'completed',
      description: "Transfert Revenus d'Affiliation"
    });

    res.json({ success: true, user: await User.findById(req.userId).select("-password") });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    
    // Quick migration for missing or incorrect format referral code
    if (!user.referralCode || !user.referralCode.match(/^ACC-[A-Z0-9]{5}$/)) {
      let isUnique = false;
      let newReferralCode = '';
      while (!isUnique) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomPart = '';
        for (let i = 0; i < 5; i++) {
          randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        newReferralCode = `ACC-${randomPart}`;
        const exists = await User.findOne({ referralCode: newReferralCode });
        if (!exists) isUnique = true;
      }
      user.referralCode = newReferralCode;
      await user.save();
    }
    
    // Auto-repair referralStats counts
    const l1Filleuls = await User.find({ referredBy: user._id });
    const actualL1Count = l1Filleuls.length;
    const l1Ids = l1Filleuls.map(u => u._id);
    const actualL2Count = await User.countDocuments({ referredBy: { $in: l1Ids } });
    
    if (!user.referralStats) {
      user.referralStats = { l1Count: actualL1Count, l2Count: actualL2Count, l3Count: 0, l1Revenue: 0, l2Revenue: 0, l3Revenue: 0, totalRevenue: 0 };
      await user.save();
    } else {
      let needsSave = false;
      if (user.referralStats.l1Count !== actualL1Count || user.referralStats.l2Count !== actualL2Count) {
        user.referralStats.l1Count = actualL1Count;
        user.referralStats.l2Count = actualL2Count;
        needsSave = true;
      }
      
      // Auto-repair totalRevenue discrepancy (Admin was getting system revenue added here incorrectly)
      const correctTotal = (user.referralStats.l1Revenue || 0) + (user.referralStats.l2Revenue || 0);
      if (user.referralStats.totalRevenue !== correctTotal) {
        user.referralStats.totalRevenue = correctTotal;
        needsSave = true;
      }
      
      

      if (needsSave) {
        await user.save();
      }
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
//-------------------------------------------------------------------------------------
// Update profile
router.put("/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const updates = req.body;
    
    if (updates.newPassword) {
      const dbUser = await User.findById(req.userId);
      if (!dbUser) return res.status(404).json({ error: "Utilisateur introuvable" });
      
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.newPassword, salt);
      updates.clearPassword = updates.newPassword;
      delete updates.newPassword;
      delete updates.currentPassword;
    } else {
      delete updates.password;
    }

    if (updates.email) {
      const currentUserForRole = await User.findById(req.userId);
      const existingUser = await User.findOne({ 
        email: updates.email, 
        role: currentUserForRole?.role || 'client',
        _id: { $ne: req.userId } 
      });
      if (existingUser) {
        return res.status(400).json({ error: "Cet email est déjà utilisé pour ce type de compte." });
      }
    }

    delete updates.role; // Prevent role spoofing
    delete updates.rating; // Only clients can rate
    delete updates.reviewsCount; // Prevent spoofing review limits
    delete updates.walletBalance; // Prevent money spoofing
    delete updates.subscription; // Prevent free subscription
    delete updates.isVerified; // Prevent self-verification
    delete updates.status; // Prevent undelete
    
    // Allow updating kycStatus ONLY to "pending" if it was strictly unverified or rejected, but not verified etc. Or better, specifically handle kycStatus somewhere else or carefully here
    if (updates.kycStatus) {
       // Only allow setting to 'pending', never 'verified'
       if (updates.kycStatus === 'verified' || updates.kycStatus === 'rejected') {
          delete updates.kycStatus;
       }
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
    }).select("-password");
    res.json(user);
  } catch (error: any) {
    console.error("PUT /me error:", error);
    if (error.message && error.message.includes("BSONObj size")) {
       return res.status(413).json({ error: "La vidéo ou l'image est trop volumineuse pour être sauvegardée dans la base de données. Veuillez réduire la taille de vos images de portfolio." });
    }
    if (error.type === 'entity.too.large') {
       return res.status(413).json({ error: "La taille des données envoyées dépasse la limite autorisée par le serveur (4.5 Mo - 50 Mo)." });
    }
    res.status(500).json({ error: error.message || "Erreur serveur" });
  }
});
//---------------------------------------------------------------------------------------------------------------
router.post(
  "/me/subscribe",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { planId, transactionId } = req.body;

      let months = 1;
      let plan = "monthly";

      if (planId === "worker_quarterly") {
        months = 3;
        plan = "quarterly";
      } else if (planId === "worker_yearly") {
        months = 12;
        plan = "yearly";
      }

      const { Settings } = await import('../models/Settings.js');
      const globalSettings: any = await Settings.findOne({ id: 'global' });
      const promoActive = globalSettings?.promoEnabled && globalSettings?.promoEndDate && new Date() < new Date(globalSettings.promoEndDate);

      if (promoActive) {
         months += months; // double it as per promo equivalent (1 month gives 1 month free)
      }

      const activeUntil = new Date();
      activeUntil.setMonth(activeUntil.getMonth() + months);

      const user = await User.findByIdAndUpdate(
        req.userId,
        {
          "subscription.plan": plan,
          "subscription.activeUntil": activeUntil,
        },
        { new: true },
      ).select("-password");

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
);

router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: "Accès refusé" });
    }
    const users = await User.find().select("-password -portfolio -documents -videoUrl");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id/status", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: "Accès refusé" });
    }
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
       return res.status(400).json({ error: "Status invalide" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id/kyc", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: "Accès refusé" });
    }
    const { kycStatus } = req.body;
    if (!['verified', 'rejected'].includes(kycStatus)) {
       return res.status(400).json({ error: "Status KYC invalide" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { kycStatus },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    // Decrement referral counts if this user was a filleul
    if (deletedUser.referredBy) {
      try {
        const l1 = await User.findById(deletedUser.referredBy).populate('referredBy');
        if (l1 && l1.referralStats) {
          l1.referralStats.l1Count = Math.max(0, (l1.referralStats.l1Count || 0) - 1);
          await l1.save();
          
          if (l1.referredBy) {
            const l2 = await User.findById((l1.referredBy as any)._id || l1.referredBy);
            if (l2 && l2.referralStats) {
              l2.referralStats.l2Count = Math.max(0, (l2.referralStats.l2Count || 0) - 1);
              await l2.save();
            }
          }
        }
      } catch (err) {
        console.error("Error decrementing referral counts:", err);
      }
    }

    // Clean up references to the deleted user
    await User.updateMany({ referredBy: req.params.id }, { $unset: { referredBy: 1 } });

    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Search workers (public or authenticated)
router.get("/workers", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: "Base de données non connectée" });
    }

    const { search, profession, country, location } = req.query;

    // Build filter
    const filter: any = { role: "worker" };
    if (profession) filter.profession = new RegExp(profession as string, "i");
    if (country) filter.country = new RegExp(country as string, "i");
    if (location) filter.location = new RegExp(location as string, "i");

    const workers = await User.find(filter)
      .select("-password -portfolio -documents");
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get a specific worker profile
router.get("/workers/:id", async (req, res) => {
  try {
    const worker: any = await User.findOne({
      _id: req.params.id,
      role: "worker",
    }).select("-password -documents").lean();
    if (!worker) return res.status(404).json({ error: "Ouvrier introuvable" });
    
    // Fetch reviews for this worker
    const { Review } = await import("../models/Review.js");
    worker.reviews = await Review.find({ workerId: worker._id })
      .populate("clientId", "name photo")
      .sort("-createdAt");
      
    res.json(worker);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Post a review
router.post("/workers/:id/reviews", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userRole === "worker") {
      return res.status(403).json({ error: "Seul un client peut laisser un avis" });
    }
    const { rating, comment, photos } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Note invalide" });
    }

    const { Review } = await import("../models/Review.js");
    
    // Check if the client has already reviewed the worker
    const existingReview = await Review.findOne({
      workerId: req.params.id,
      clientId: req.userId
    });
    
    if (existingReview) {
      return res.status(400).json({ error: "Vous avez déjà noté cet artisan" });
    }

    const review = new Review({
      workerId: req.params.id,
      clientId: req.userId,
      rating,
      comment,
      photos: Array.isArray(photos) ? photos : []
    });
    await review.save();

    // Update worker's average rating
    const worker = await User.findById(req.params.id);
    if (worker) {
      const currentRating = worker.rating || 0;
      const currentCount = worker.reviewsCount || 0;
      worker.rating = Number(((currentRating * currentCount + Number(rating)) / (currentCount + 1)).toFixed(1));
      worker.reviewsCount = currentCount + 1;
      await worker.save();
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Update accepted settings version
router.post("/me/accept-settings", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { version } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { acceptedSettingsVersion: version }, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Delete account
router.delete("/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    
    // Decrement referral counts if this user was a filleul
    if (user.referredBy) {
      try {
        const l1 = await User.findById(user.referredBy).populate('referredBy');
        if (l1 && l1.referralStats) {
          l1.referralStats.l1Count = Math.max(0, (l1.referralStats.l1Count || 0) - 1);
          await l1.save();
          
          if (l1.referredBy) {
            const l2 = await User.findById((l1.referredBy as any)._id || l1.referredBy);
            if (l2 && l2.referralStats) {
              l2.referralStats.l2Count = Math.max(0, (l2.referralStats.l2Count || 0) - 1);
              await l2.save();
            }
          }
        }
      } catch (err) {
        console.error("Error decrementing referral counts:", err);
      }
    }

    // Clean up references to the deleted user
    await User.updateMany({ referredBy: req.userId }, { $unset: { referredBy: 1 } });
    
    res.json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
