import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongodb"
import { Share } from "@/lib/models/Share"
import { File } from "@/lib/models/File"
import crypto from "crypto"

const EXPIRY_MAP: Record<string, number> = {
  "1 hour": 1 * 60 * 60 * 1000,
  "24 hours": 24 * 60 * 60 * 1000,
  "7 days": 7 * 24 * 60 * 60 * 1000,
  "30 days": 30 * 24 * 60 * 60 * 1000,
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Check share permission (admins always allowed)
    const userRole = (session.user as any).role
    const userId = (session.user as any).id ?? session.user.email
    const userPerms = (session.user as any).permissions
    if (userRole !== "admin" && userPerms?.share === false) {
      return NextResponse.json({ error: "You don't have permission to share files" }, { status: 403 })
    }

    const { fileId, fileName, fileUrl, fileType, permission, expiry } = await req.json()

    if (!fileId || !fileName || !fileUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if the file allows sharing (admins and owners are exempt)
    await connectDB()
    const fileDoc = await File.findById(fileId).lean() as any
    if (fileDoc && fileDoc.shareable === false && userRole !== "admin" && String(fileDoc.owner) !== String(userId)) {
      return NextResponse.json({ error: "The file owner has disabled sharing for this file" }, { status: 403 })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiryMs = EXPIRY_MAP[expiry] ?? EXPIRY_MAP["7 days"]
    const expiresAt = new Date(Date.now() + expiryMs)

    await Share.create({
      fileId,
      fileName,
      fileUrl,
      fileType: fileType ?? "",
      sharedBy: session.user.email,
      sharedWith: "public",   // link share — anyone with the link
      token,
      permission: permission ?? "view",
      expiresAt,
    })

    const shareLink = `${process.env.NEXTAUTH_URL}/share/${token}`
    return NextResponse.json({ shareLink, token })
  } catch (err) {
    console.error("share-link error:", err)
    return NextResponse.json({ error: "Failed to generate link" }, { status: 500 })
  }
}
