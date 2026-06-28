import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  photos: [{ type: String }]
}, {
  timestamps: true
});

export const Review = (mongoose.models.Review || mongoose.model<any>('Review', reviewSchema)) as mongoose.Model<any>;
