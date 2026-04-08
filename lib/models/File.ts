import mongoose, { Schema, Document, models } from "mongoose"

export interface IFile extends Document {
  name: string
  type: string        // mime type e.g. image/png
  size: number        // bytes
  url: string         // cloudinary secure_url
  publicId: string    // cloudinary public_id for deletion
  owner: mongoose.Types.ObjectId
  ownerName: string
  shared: boolean
  downloadable: boolean
  shareable: boolean  // if false, only admin/owner can share this file
  password?: string   // hashed — if set, non-owners must enter it to access
  createdAt: Date
  updatedAt: Date
}

const FileSchema = new Schema<IFile>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerName: { type: String, required: true },
    shared: { type: Boolean, default: false },
    downloadable: { type: Boolean, default: true },
    shareable: { type: Boolean, default: true },
    password: { type: String, default: "" },
  },
  { timestamps: true }
)

export const File = models.File || mongoose.model<IFile>("File", FileSchema)
