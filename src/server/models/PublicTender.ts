import mongoose from "mongoose";

const publicTenderSchema = new mongoose.Schema(
  {
    tenderId: { type: String },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    guestContact: { type: String }, // either connected client or guest
    title: { type: String, required: true },
    description: { type: String },
    audioData: { type: String },
    attachmentUrl: { type: String },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "accepted", "completed"],
      default: "open",
    },
    acceptedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    responses: [
      {
        workerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: { type: String },
        price: { type: Number },
        attachmentUrl: { type: String },
        audioUrl: { type: String },
        isConsulted: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const PublicTender = (mongoose.models.PublicTender ||
  mongoose.model<any>(
    "PublicTender",
    publicTenderSchema,
  )) as mongoose.Model<any>;
