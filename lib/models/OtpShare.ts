import mongoose, { Schema, Document, models } from "mongoose"

export interface IOtpShare extends Document {
  otpHash: string
  fileId: string
  fileName: string
  fileUrl: string
  fileType: string
  permission: "view" | "download"
  sharedBy: string
  expiresAt: Date
}

const OtpShareSchema = new Schema<IOtpShare>({
  otpHash:    { type: String, required: true },
  fileId:     { type: String, required: true },
  fileName:   { type: String, required: true },
  fileUrl:    { type: String, required: true },
  fileType:   { type: String, default: "" },
  permission: { type: String, enum: ["view", "download"], default: "view" },
  sharedBy:   { type: String, required: true },
  expiresAt:  { type: Date, required: true },
}, { timestamps: true })

// MongoDB TTL — auto-deletes documents after expiresAt
OtpShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const OtpShare = models.OtpShare || mongoose.model<IOtpShare>("OtpShare", OtpShareSchema)
