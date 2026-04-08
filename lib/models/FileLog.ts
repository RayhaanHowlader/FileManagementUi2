import mongoose, { Schema, Document, models } from "mongoose"

export interface IFileLog extends Document {
  action: "preview" | "download" | "upload" | "delete" | "share"
  userId: string
  userName: string
  userEmail: string
  fileId: string
  fileName: string
  fileType: string
  createdAt: Date
}

const FileLogSchema = new Schema<IFileLog>(
  {
    action:     { type: String, enum: ["preview", "download", "upload", "delete", "share"], required: true },
    userId:     { type: String, required: true },
    userName:   { type: String, required: true },
    userEmail:  { type: String, required: true },
    fileId:     { type: String, required: true },
    fileName:   { type: String, required: true },
    fileType:   { type: String, default: "" },
  },
  { timestamps: true }
)

export const FileLog = models.FileLog || mongoose.model<IFileLog>("FileLog", FileLogSchema)
