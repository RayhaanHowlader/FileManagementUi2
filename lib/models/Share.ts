import mongoose, { Schema, Document, models } from "mongoose"

export interface IShare extends Document {
  fileId: mongoose.Types.ObjectId
  fileName: string
  fileUrl: string
  fileType: string
  sharedBy: string
  sharedWith: string
  token: string
  permission: "view" | "download"
  expiresAt: Date
  otp?: string          // hashed OTP for OTP-based sharing
  otpExpiry?: Date
  createdAt: Date
}

const ShareSchema = new Schema<IShare>(
  {
    fileId: { type: Schema.Types.ObjectId, ref: "File", required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: "" },
    sharedBy: { type: String, required: true },
    sharedWith: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    permission: { type: String, enum: ["view", "download"], default: "view" },
    expiresAt: { type: Date, required: true },
    otp: { type: String, default: "" },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
)

export const Share = models.Share || mongoose.model<IShare>("Share", ShareSchema)
