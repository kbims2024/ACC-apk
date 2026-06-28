import express from "express";
import { User } from "../models/User.js";
import { ServiceRequest as ArtisanRequest } from "../models/ServiceRequest.js";
import { Transaction } from "../models/Transaction.js";
import { adminAuth } from "../middleware/auth.js";
import { Settings } from "../models/Settings.js";

const router = express.Router();

router.get("/stats", adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let createdAtFilter: any = {};
    if (startDate && endDate) {
      createdAtFilter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    } else if (startDate) {
      createdAtFilter.createdAt = { $gte: new Date(startDate as string) };
    } else if (endDate) {
      createdAtFilter.createdAt = { $lte: new Date(endDate as string) };
    }

    // Basic User Counts
    const totalClients = await User.countDocuments({ role: "client", ...createdAtFilter });
    const totalArtisans = await User.countDocuments({ role: "worker", ...createdAtFilter });

    // Active vs Inactive Artisans
    const now = new Date();
    const activeArtisans = await User.countDocuments({
      role: "worker",
      "subscription.activeUntil": { $gte: now },
      ...createdAtFilter
    });
    const inactiveArtisans = totalArtisans - activeArtisans; // those without or expired subscription

    // Affiliation System
    const affiliatesAggregation = await User.aggregate([
      { $match: { referredBy: { $exists: true, $ne: null } } },
      { $group: { _id: "$referredBy", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "referrerDetails"
        }
      },
      { $match: { "referrerDetails.0": { $exists: true } } },
      { $sort: { count: -1 } }
    ]);
    
    const totalAffiliates = affiliatesAggregation.length;
    
    // Top 5 Affiliates
    let topAffiliates = [];
    if (affiliatesAggregation.length > 0) {
      const top5AffiliatesData = affiliatesAggregation.slice(0, 5);
      topAffiliates = await User.find({ _id: { $in: top5AffiliatesData.map(a => a._id) } })
        .select("name email profileImage phone")
        .lean();
        
      const m = new Map();
      top5AffiliatesData.forEach(d => m.set(d._id.toString(), d.count));
      
      topAffiliates = topAffiliates.map(a => ({
        ...a,
        filleulsCount: m.get(a._id.toString()) || 0
      })).sort((a, b) => b.filleulsCount - a.filleulsCount);
    }

    // Revenue tracking from Transactions
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    } else if (startDate) {
      dateFilter.date = { $gte: new Date(startDate as string) };
    } else if (endDate) {
       dateFilter.date = { $lte: new Date(endDate as string) };
    }
    
    const revenueAggregation = await Transaction.aggregate([
      { $match: { type: 'subscription', status: 'completed', ...dateFilter } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
    ]);
    
    // If no transactions found yet, default to calculating active artisans hypothetically if they wanted, 
    // but better to just say 0 or compute hypothetical fallback for existing.
    let totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // Top 5 Clients
    const topClientsAggregation = await ArtisanRequest.aggregate([
      { $group: { _id: "$clientId", requestCount: { $sum: 1 } } },
      { $sort: { requestCount: -1 } },
      { $limit: 5 }
    ]);
    
    let topClients = [];
    if (topClientsAggregation.length > 0) {
      topClients = await User.find({ _id: { $in: topClientsAggregation.map(c => c._id) } })
                             .select("name email createdAt location profileImage")
                             .lean();
      
      const countsMap = new Map();
      topClientsAggregation.forEach(t => countsMap.set(t._id.toString(), t.requestCount));
      
      topClients = topClients.map(c => ({
        ...c,
        requestCount: countsMap.get(c._id.toString()) || 0
      })).sort((a, b) => b.requestCount - a.requestCount);
    } else {
      topClients = await User.find({ role: "client" })
                             .sort({ createdAt: 1 })
                             .limit(5)
                             .select("name email createdAt location profileImage")
                             .lean();
    }

    // Top 5 Artisans
    const planValues: any = { "yearly": 3, "quarterly": 2, "monthly": 1, "free": 0 };
    let topArtisansUnsorted = await User.find({
      role: "worker",
      "subscription.activeUntil": { $gte: now }
    })
      .select("name email profession rating reviewsCount walletBalance profileImage subscription")
      .lean();
      
    topArtisansUnsorted.sort((a: any, b: any) => {
      const aPlanValue = planValues[a.subscription?.plan] || 0;
      const bPlanValue = planValues[b.subscription?.plan] || 0;
      if (aPlanValue !== bPlanValue) {
        return bPlanValue - aPlanValue;
      }
      return (b.rating || 0) - (a.rating || 0);
    });

    const topArtisans = topArtisansUnsorted.slice(0, 5);

    // Get admin's own referral code
    const adminUser = await User.findById((req as any).userId);
    const adminReferralCode = adminUser?.referralCode || "";

    let settings = await Settings.findOne({ id: 'global' });
    if (!settings) settings = new Settings({ id: 'global' });

    // ACC REVENUE
    const accRevenueRange = totalRevenue * 0.65;
    
    const accTransferredRangeDoc = await Transaction.aggregate([
      { $match: { type: 'withdrawal', description: { $regex: /Revenus ACC/ }, status: 'completed', ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const accTransferredRange = accTransferredRangeDoc.length > 0 ? accTransferredRangeDoc[0].total : 0;
    
    // Absolute ACC Revenue (to find available)
    const accTotalDoc = await Transaction.aggregate([
      { $match: { type: 'subscription', status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const accTotalAllTime = accTotalDoc.length > 0 ? accTotalDoc[0].total * 0.65 : 0;
    const accTransferredAllTimeDoc = await Transaction.aggregate([
      { $match: { type: 'withdrawal', description: { $regex: /Revenus ACC/ }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const accTransferredAllTimeDocTotal = accTransferredAllTimeDoc.length > 0 ? accTransferredAllTimeDoc[0].total : 0;
    const accTransferredAllTime = Math.max(accTransferredAllTimeDocTotal, settings.transferredAccRevenue || 0);
    const accAvailable = accTotalAllTime - accTransferredAllTime;

    // ADMIN AFFILIATE REVENUE
    // The admin's own affiliate earnings in range. We need Transactions. Wait, we don't store affiliate earning transactions directly...
    // Actually, `referralStats.totalRevenue` is the *all-time* total. We don't have historical affiliate earning events unless we reconstruct them from subscriptions. But that's complicated. Let's just return the all-time for now (or 0 if we can't). 
    // Wait, the client asked for: `total revenu affiliés, total transféré, total disponible`. 
    // And if filtered by date, "on doit savoir le total revenu affiliés, total transféré..."
    // Since we don't have an `affiliate_commission` transaction type, the total affiliate revenue in date range is tricky. I'll just return the all-time properties from `adminUser.referralStats`.

    // Get all artisans where admin is L1
    const l1Artisans = await User.find({ referredBy: adminUser?._id }).select('_id');
    const l1Ids = l1Artisans.map(a => a._id);
    
    // Get all artisans where admin is L2
    const l2Artisans = await User.find({ referredBy: { $in: l1Ids } }).select('_id');
    const l2Ids = l2Artisans.map(a => a._id);

    // Sum subscriptions in dateFilter for L1
    const l1SubDoc = await Transaction.aggregate([
      { $match: { type: 'subscription', status: 'completed', userId: { $in: l1Ids }, ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const l1Total = l1SubDoc.length > 0 ? l1SubDoc[0].total : 0;

    // Sum subscriptions in dateFilter for L2
    const l2SubDoc = await Transaction.aggregate([
      { $match: { type: 'subscription', status: 'completed', userId: { $in: l2Ids }, ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const l2Total = l2SubDoc.length > 0 ? l2SubDoc[0].total : 0;
    
    const adminAffiliateRevenueRange = (l1Total * 0.25) + (l2Total * 0.10);

    const adminAffiliateTotalAllTime = adminUser?.referralStats?.totalRevenue || 0;
    
    const adminAffiliateTransferredAllTimeDoc = await Transaction.aggregate([
      { $match: { type: 'withdrawal', description: { $regex: /Revenus d'Affiliation/ }, userId: adminUser?._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const adminAffiliateTransferredAllTimeDocTotal = adminAffiliateTransferredAllTimeDoc.length > 0 ? adminAffiliateTransferredAllTimeDoc[0].total : 0;
    const adminAffiliateTransferredAllTime = Math.max(adminAffiliateTransferredAllTimeDocTotal, adminUser?.referralStats?.transferredRevenue || 0);
    
    const adminAffiliateAvailable = adminAffiliateTotalAllTime - adminAffiliateTransferredAllTime;

    const affiliateTransferredRangeDoc = await Transaction.aggregate([
      { $match: { type: 'withdrawal', description: { $regex: /Revenus d'Affiliation/ }, userId: adminUser?._id, status: 'completed', ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const adminAffiliateTransferredRange = affiliateTransferredRangeDoc.length > 0 ? affiliateTransferredRangeDoc[0].total : 0;

    // WALLET REVENUE
    const walletReceivedRangeDoc = await Transaction.aggregate([
      { $match: { type: 'transfer', userId: adminUser?._id, status: 'completed', ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const walletReceivedRange = walletReceivedRangeDoc.length > 0 ? walletReceivedRangeDoc[0].total : 0;

    const walletWithdrawnRangeDoc = await Transaction.aggregate([
      { $match: { type: 'withdrawal', userId: adminUser?._id, status: 'completed', ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const walletWithdrawnRange = walletWithdrawnRangeDoc.length > 0 ? walletWithdrawnRangeDoc[0].total : 0;
    
    // Absolute Wallet values
    const walletAvailable = adminUser?.walletBalance || 0;

    res.json({
      totalClients,
      totalArtisans,
      activeArtisans,
      inactiveArtisans,
      totalAffiliates,
      topAffiliates,
      totalRevenue, // subscription total in range
      accRevenue: accRevenueRange,
      accTransferred: accTransferredRange,
      accAvailable,
      adminAffiliateRevenue: adminAffiliateRevenueRange,
      adminAffiliateTransferred: adminAffiliateTransferredRange,
      adminAffiliateAvailable,
      walletReceived: walletReceivedRange,
      walletWithdrawn: walletWithdrawnRange,
      walletAvailable,
      topClients,
      topArtisans,
      adminReferralCode,
      // Pass the counts
      adminFilleulsN1: adminUser?.referralStats?.l1Count || 0,
      adminFilleulsN2: adminUser?.referralStats?.l2Count || 0
    });
  } catch (error) {
    console.error("Erreur serveur admin stats:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/transfer-history", adminAuth, async (req, res) => {
  try {
    const { type } = req.query;
    const adminUser = await User.findById((req as any).userId);
    let filter: any = { userId: adminUser?._id };
    
    if (type === 'transfer_acc') {
      filter.type = 'withdrawal';
      filter.description = { $regex: /ACC/i };
    } else if (type === 'acc') {
      delete filter.userId;
      filter.$or = [
        { type: 'subscription' },
        { type: 'withdrawal', description: { $regex: /ACC/i }, userId: adminUser?._id }
      ];
    } else if (type === 'transfer_affiliate') {
      filter.type = 'withdrawal';
      filter.description = { $regex: /Affiliation/i };
    } else if (type === 'affiliate_all_platform') {
      delete filter.userId;
      filter.type = { $in: ['commission', 'withdrawal', 'transfer'] };
      filter.description = { $not: /ACC/i };
    } else if (type === 'subscriptions_global') {
      delete filter.userId;
      filter.type = 'subscription';
    } else if (type === 'commissions') {
      delete filter.userId; // All users
      filter.type = 'commission';
    } else if (type === 'wallet') {
      filter.type = { $in: ['transfer', 'withdrawal'] };
    } else {
      filter.type = { $in: ['transfer', 'withdrawal'] };
    }

    const history = await Transaction.find(filter).sort({ createdAt: -1 }).populate('userId', 'name email country').limit(200);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/withdraw", adminAuth, async (req, res) => {
  try {
    const { amount, method, source } = req.body;
    if (!amount || amount <= 0 || !method || !source) {
      return res.status(400).json({ error: "Données de retrait invalides." });
    }

    const adminUser = await User.findById((req as any).userId);
    if (!adminUser) return res.status(404).json({ error: "Admin introuvable" });

    if (source === 'acc') {
      const revenueAggregation = await Transaction.aggregate([
        { $match: { type: 'subscription', status: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
      ]);
      const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;
      const accRevenue = totalRevenue * 0.65;

      let settings = await Settings.findOne({ id: 'global' });
      if (!settings) settings = new Settings({ id: 'global' });
      
      const transferredDocTotalDoc = await Transaction.aggregate([
        { $match: { type: 'withdrawal', description: { $regex: /Revenus ACC/ }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      const transferredDocTotal = transferredDocTotalDoc.length > 0 ? transferredDocTotalDoc[0].total : 0;

      const transferred = Math.max(transferredDocTotal, settings.transferredAccRevenue || 0);
      const available = accRevenue - transferred;

      if (amount > available) {
        return res.status(400).json({ error: "Solde ACC insuffisant pour ce retrait." });
      }

      settings.transferredAccRevenue = transferred + amount;
      await settings.save();

      await Transaction.create({
        userId: adminUser._id,
        amount: amount,
        type: 'withdrawal',
        status: 'completed',
        description: `Retrait Revenus ACC via ${method}`
      });
    } else if (source === 'affiliate') {
      const l1Ids = (await User.find({ referredBy: adminUser._id }).select('_id')).map(a => a._id);
      const l2Ids = (await User.find({ referredBy: { $in: l1Ids } }).select('_id')).map(a => a._id);

      const l1SubDoc = await Transaction.aggregate([
        { $match: { type: 'subscription', status: 'completed', userId: { $in: l1Ids } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      const l1Total = l1SubDoc.length > 0 ? l1SubDoc[0].total : 0;

      const l2SubDoc = await Transaction.aggregate([
        { $match: { type: 'subscription', status: 'completed', userId: { $in: l2Ids } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      const l2Total = l2SubDoc.length > 0 ? l2SubDoc[0].total : 0;
      
      const totalAffiliateRevenue = (l1Total * 0.25) + (l2Total * 0.10);
      
      const transferredAffiliateDoc = await Transaction.aggregate([
        { $match: { type: 'withdrawal', description: { $regex: /Revenus d'Affiliation/ }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      const transferredAffiliateTotal = transferredAffiliateDoc.length > 0 ? transferredAffiliateDoc[0].total : 0;
      const transferred = Math.max(transferredAffiliateTotal, adminUser.referralStats?.transferredRevenue || 0);

      const available = totalAffiliateRevenue - transferred;

      if (amount > available) {
        return res.status(400).json({ error: "Solde d'affiliation insuffisant pour ce retrait." });
      }

      if (!adminUser.referralStats) adminUser.referralStats = {};
      adminUser.referralStats.transferredRevenue = transferred + amount;
      await adminUser.save();

      await Transaction.create({
        userId: adminUser._id,
        amount: amount,
        type: 'withdrawal',
        status: 'completed',
        description: `Retrait Revenus d'Affiliation via ${method}`
      });
    } else {
      return res.status(400).json({ error: "Source de retrait invalide." });
    }

    res.json({ success: true, message: "Retrait réussi", user: adminUser });
  } catch (error) {
    console.error("Erreur admin withdraw:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/reset-data", adminAuth, async (req, res) => {
  try {
    const { resetFinances, resetTenders, resetRequests } = req.body;

    if (resetFinances) {
      await User.updateMany({}, { 
        $set: { 
          walletBalance: 0,
          "referralStats.totalRevenue": 0,
          "referralStats.transferredRevenue": 0,
          "referralStats.l1Revenue": 0,
          "referralStats.l2Revenue": 0,
          "referralStats.l3Revenue": 0
        },
        $unset: { subscription: 1 } 
      });
      await Transaction.deleteMany({});
      await Settings.updateOne({ id: 'global' }, { $set: { transferredAccRevenue: 0 } });
    }

    if (resetTenders) {
      const { PublicTender } = await import('../models/PublicTender.js');
      await PublicTender.deleteMany({});
    }

    if (resetRequests) {
      await ArtisanRequest.deleteMany({});
    }

    res.json({ success: true, message: "Les données sélectionnées ont été réinitialisées." });
  } catch (error) {
    console.error("Erreur serveur admin reset-data:", error);
    res.status(500).json({ error: "Erreur serveur lors de la réinitialisation" });
  }
});

export default router;
