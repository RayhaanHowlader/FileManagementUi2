import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongodb"
import { OtpShare } from "@/lib/models/OtpShare"
import { sendOtpShareEmail } from "@/lib/share-mailer"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { fileId, fileName, fileUrl, fileType, recipientEmail, permission, expiry } = await req.json()
    if (!fileId || !fileName || !fileUrl || !recipientEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpHash = await bcrypt.hash(otp, 10)

    const expiryMs = expiry === "10 minutes" ? 10 * 60 * 1000 : 5 * 60 * 1000
    const expiresAt = new Date(Date.now() + expiryMs)

    await connectDB()

    // Store in dedicated otpshares collection
    await OtpShare.create({
      otpHash,
      fileId,
      fileName,
      fileUrl,
      fileType: fileType ?? "",
      permission: permission ?? "view",
      sharedBy: session.user.email,
      expiresAt,
    })

    // Email the plain OTP to recipient
    await sendOtpShareEmail({
      to: recipientEmail,
      fromName: session.user.name ?? session.user.email,
      fileName,
      otp,
      expiry,
      permission: permission ?? "view",
    })

    return NextResponse.json({ message: "OTP sent to recipient" })
  } catch (err) {
    console.error("share-otp error:", err)
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
  }
}
