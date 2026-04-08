import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongodb"
import { File } from "@/lib/models/File"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// GET — list ALL files (everyone sees all files; delete is restricted by owner/admin on frontend+backend)
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const files = await File.find({}).sort({ createdAt: -1 }).lean()
  // Strip password hash, add hasPassword boolean
  const safeFiles = files.map(({ password, ...f }) => ({
    ...f,
    _id: f._id.toString(),
    owner: f.owner?.toString() ?? "",
    hasPassword: !!password,
  }))
  return NextResponse.json({ files: safeFiles })
}

// POST — upload a file
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id ?? session.user.email ?? "unknown"
  const userName = session.user.name ?? session.user.email ?? "Unknown"

  const formData = await req.formData()
  const file = formData.get("file") as globalThis.File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
  const downloadable = formData.get("downloadable") !== "false"
  const shareable = formData.get("shareable") !== "false"
  const rawPassword = (formData.get("filePassword") as string) ?? ""
  const hashedPassword = rawPassword ? await bcrypt.hash(rawPassword, 10) : ""

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Determine resource type
  const isVideo = file.type.startsWith("video/")
  const isImage = file.type.startsWith("image/")
  const resourceType: "image" | "video" | "raw" = isImage ? "image" : isVideo ? "video" : "raw"

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "securefiles/files",
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (err, res) => {
          if (err || !res) return reject(err)
          resolve(res as { secure_url: string; public_id: string })
        }
      )
      .end(buffer)
  })

  await connectDB()
  const saved = await File.create({
    name: file.name,
    type: file.type,
    size: file.size,
    url: result.secure_url,
    publicId: result.public_id,
    owner: userId,
    ownerName: userName,
    downloadable,
    shareable,
    password: hashedPassword,
  })

  return NextResponse.json({ file: saved }, { status: 201 })
}
