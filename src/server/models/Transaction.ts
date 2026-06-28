import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'XOF' },
  type: { type: String, enum: ['subscription', 'withdrawal', 'deposit', 'transfer', 'commission'], default: 'subscription' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  description: { type: String },
  reference: { type: String },
  date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const Transaction = (mongoose.models.Transaction || mongoose.model<any>('Transaction', transactionSchema)) as mongoose.Model<any>;
