import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PublicTender' },
  guestContact: { type: String },
  serviceDetails: { type: String },
  audioData: { type: String },
  attachmentUrl: { type: String },
  location: { type: String, required: true },
  contactMethod: { type: String, enum: ['app', 'whatsapp', 'phone', 'email'], default: 'app' },
  isRead: { type: Boolean, default: false }, // For worker (legacy)
  clientHasUnread: { type: Boolean, default: false }, // For client (legacy)
  workerUnreadCount: { type: Number, default: 0 },
  clientUnreadCount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
  responses: [{
    text: { type: String },
    audioData: { type: String },
    attachmentUrl: { type: String },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    deletedForEveryone: { type: Boolean, default: false }
  }],
  firstAcceptorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
}, {
  timestamps: true // Adds createdAt and updatedAt
});

export const ServiceRequest = (mongoose.models.ServiceRequest || mongoose.model<any>('ServiceRequest', requestSchema)) as mongoose.Model<any>;
