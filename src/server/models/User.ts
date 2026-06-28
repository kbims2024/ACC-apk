import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  whatsappPhone: { type: String },
  password: { type: String, required: true },
  clearPassword: { type: String },
  role: { type: String, enum: ['worker', 'client', 'admin'], default: 'client' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  entityType: { type: String, enum: ['individual', 'company'], default: 'individual' },
  companyName: { type: String },
  photo: { type: String, default: '' },
  
  // Worker-specific
  profession: { type: String },
  country: { type: String },
  location: { type: String },
  shortDescription: { type: String },
  videoUrl: { type: String },
  description: { type: String },
  experience: { type: Number },
  hourlyRate: { type: Number },
  availability: { type: Boolean, default: true },
  availWeekdays: { type: String, default: '08:00 - 18:00' },
  availSaturday: { type: String, default: '09:00 - 14:00' },
  availSunday: { type: String, default: 'Fermé' },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  portfolio: [{ type: String }],
  subscription: {
    plan: { type: String, enum: ['free', 'monthly', 'quarterly', 'semiannual', 'yearly', 'pro'], default: 'free' },
    activeUntil: { type: Date },
    status: { type: String, default: 'inactive' },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
  },

  // Client-specific
  freeRequestsLeft: { type: Number, default: 3 },

  // Affiliation System
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  walletBalance: { type: Number, default: 0 },
  referralStats: {
    l1Count: { type: Number, default: 0 },
    l2Count: { type: Number, default: 0 },
    l3Count: { type: Number, default: 0 },
    l1Revenue: { type: Number, default: 0 },
    l2Revenue: { type: Number, default: 0 },
    l3Revenue: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    transferredRevenue: { type: Number, default: 0 }
  },
  biometricKey: { type: String, select: false },
  kycStatus: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified' },
  acceptedSettingsVersion: { type: Number, default: 0 },
}, {
  timestamps: true 
});

userSchema.index({ email: 1, role: 1 }, { unique: true });

export const User = (mongoose.models.User || mongoose.model<any>('User', userSchema)) as mongoose.Model<any>;
