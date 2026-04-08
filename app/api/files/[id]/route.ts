import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongodb"
import { File } from "@/lib/models/File"
import { getDb } from "@/lib/db"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  // Get role and real DB id from DB — never trust stale JWT
  const db = await getDb()
  const dbUser = await db.collection("users").findOne(
    { email: session.user.email },
    { projection: { _id: 1, role: 1 } }
  )
  const isAdmin = dbUser?.role === "admin"
  const userId = dbUser?._id?.toString()

  await connectDB()
  const file = await File.findById(id)
  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 })

  // Only admin or file owner can delete
  if (!isAdmin && String(file.owner) !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const isVideo = file.type.startsWith("video/")
  const isImage = file.type.startsWith("image/")
  const resourceType = isImage ? "image" : isVideo ? "video" : "raw"

  await cloudinary.uploader.destroy(file.publicId, { resource_type: resourceType })
  await file.deleteOne()

  return NextResponse.json({ message: "Deleted" })
}
