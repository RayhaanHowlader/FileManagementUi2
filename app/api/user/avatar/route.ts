import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/auth"
import { updateUserAvatar } from "@/lib/db"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userEmail = session?.user?.email

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("avatar") as File | null

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "securefiles/avatars",
            public_id: `avatar_${userEmail.replace(/[@.]/g, "_")}`,
            overwrite: true,
            invalidate: true,
            transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
          },
          (err, res) => {
            if (err || !res) return reject(err ?? new Error("Upload failed"))
            resolve(res as { secure_url: string })
          }
        )
        .end(buffer)
    })

    // Use native MongoDB driver — bypasses Mongoose model caching issues
    const updateResult = await updateUserAvatar(userEmail, result.secure_url)

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 })
    }

    // Cache-bust the URL for the browser
    const avatarUrl = `${result.secure_url}?v=${Date.now()}`
    return NextResponse.json({ avatarUrl })
  } catch (err) {
    console.error("Avatar upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
