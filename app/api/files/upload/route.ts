import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongodb"
import { File } from "@/lib/models/File"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary as raw resource
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            folder: "securefiles",
            public_id: `${Date.now()}-${file.name.replace(/\s+/g, "_")}`,
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        .end(buffer)
    })

    await connectDB()

    const saved = await File.create({
      name: file.name,
      url: result.secure_url,
      publicId: result.public_id,
      size: file.size,
      type: file.type,
      uploadedBy: session.user.id,
    })

    return NextResponse.json({ file: saved }, { status: 201 })
  } catch (err) {
    console.error("upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
