import mongoose, { Schema, Document, models } from "mongoose"

export interface IUser extends Document {
  fullName: string
  email: string
  password: string
  role: "user" | "admin"
  isVerified: boolean
  jobTitle?: string
  avatarUrl?: string
  permissions?: {
    read: boolean
    download: boolean
    delete: boolean
    share: boolean
  }
  otp?: string
  otpExpiry?: Date
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    jobTitle: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    permissions: {
      type: {
        read: { type: Boolean, default: true },
        download: { type: Boolean, default: true },
        delete: { type: Boolean, default: false },
        share: { type: Boolean, default: true },
      },
      default: () => ({ read: true, download: true, delete: false, share: true }),
    },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
)

export const User = models.User || mongoose.model<IUser>("User", UserSchema)
