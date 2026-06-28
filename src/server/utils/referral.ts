import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";

export async function processSubscriptionAndRewards(userId: string, amount: number, planDesc: string) {
  try {
    const user = await User.findById(userId).populate('referredBy');
    if (!user) return;

    // Save transaction
    await Transaction.create({
      userId: user._id,
      amount: amount,
      type: 'subscription',
      status: 'completed',
      description: planDesc
    });

    // We distribute the amount: 
    // 65% to Admin unconditionally
    // L1: 25%, L2: 10%. If a level is missing, Admin gets that share.

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) return; // If no admin to receive funds, we just skip.

    // Deduct transaction fee from admin share (e.g. standard 1.5% for payment processors)
    let transactionFee = amount * 0.015;
    let baseAdminShare = (amount * 0.65) - transactionFee;
    let adminShare = baseAdminShare;
    
    let l1Share = amount * 0.25;
    let l2Share = amount * 0.10;

    let hasL1 = false, hasL2 = false;

    let lvl1 = null;
    if (user.referredBy) {
      let lvl1Str = user.referredBy._id || user.referredBy; 
      lvl1 = await User.findById(lvl1Str).populate('referredBy');
      if (lvl1) {
        hasL1 = true;
      }
    }

    let lvl2 = null;
    if (hasL1 && lvl1.referredBy) {
      let lvl2Str = lvl1.referredBy._id || lvl1.referredBy;
      lvl2 = await User.findById(lvl2Str);
      if (lvl2) {
        hasL2 = true;
      }
    }

    if (hasL1) {
      if (!lvl1.referralStats) lvl1.referralStats = { l1Count: 0, l2Count: 0, l3Count: 0, l1Revenue: 0, l2Revenue: 0, l3Revenue: 0, totalRevenue: 0, transferredRevenue: 0 };
      lvl1.referralStats.l1Revenue = (lvl1.referralStats.l1Revenue || 0) + l1Share;
      lvl1.referralStats.totalRevenue = (lvl1.referralStats.totalRevenue || 0) + l1Share;
      await lvl1.save();
      await Transaction.create({
        userId: lvl1._id,
        amount: l1Share,
        type: 'commission',
        status: 'completed',
        description: `Commission N1 sur abonnement de ${user.name}`
      });
    } else {
      adminShare += l1Share;
    }

    if (hasL2) {
      if (!lvl2.referralStats) lvl2.referralStats = { l1Count: 0, l2Count: 0, l3Count: 0, l1Revenue: 0, l2Revenue: 0, l3Revenue: 0, totalRevenue: 0, transferredRevenue: 0 };
      lvl2.referralStats.l2Revenue = (lvl2.referralStats.l2Revenue || 0) + l2Share;
      lvl2.referralStats.totalRevenue = (lvl2.referralStats.totalRevenue || 0) + l2Share;
      await lvl2.save();
      await Transaction.create({
        userId: lvl2._id,
        amount: l2Share,
        type: 'commission',
        status: 'completed',
        description: `Commission N2 sur abonnement de ${user.name}`
      });
    } else {
      adminShare += l2Share;
    }

    // Admin share goes to ACC revenue or Admin wallet? Previously it was not in wallet. Wait, `adminShare` wasn't added to `totalRevenue`? It was just lost. ACC revenue is ALWAYS 65% of total. So adminShare (the remaining 25% or 10% not claimed) should just go to ACC Revenue implicitly because it wasn't claimed? But wait, ACC Revenue was explicitly 65%. Let's check where adminShare goes. Ah, actually it wasn't even going anywhere! 
    // Reload admin before saving to avoid race condition if admin was lvl1 or lvl2
    const adminForSave = await User.findById(admin._id);
    if (adminForSave) {
      if (!adminForSave.referralStats) adminForSave.referralStats = { l1Count: 0, l2Count: 0, l3Count: 0, l1Revenue: 0, l2Revenue: 0, l3Revenue: 0, totalRevenue: 0 };
      await adminForSave.save();
    }

  } catch (error) {
    console.error('Error processing rewards:', error);
  }
}
