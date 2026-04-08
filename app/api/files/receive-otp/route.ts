import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongodb"
import { OtpShare } from "@/lib/models/OtpShare"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { otp } = await req.json()
    if (!otp || otp.length !== 6) {
      return NextResponse.json({ error: "Enter a valid 6-digit OTP" }, { status: 400 })
    }

    await connectDB()

    // Fetch all non-expired OTP shares
    const shares = await OtpShare.find({
      expiresAt: { $gt: new Date() },
    }).lean()

    if (!shares.length) {
      return NextResponse.json({ error: "OTP not found or has expired" }, { status: 404 })
    }

    // bcrypt compare against each stored hash
    for (const share of shares) {
      const valid = await bcrypt.compare(otp, share.otpHash)
      if (valid) {
        // Delete after use — one-time only
        await OtpShare.deleteOne({ _id: share._id })

        return NextResponse.json({
          file: {
            id: share.fileId,
            name: share.fileName,
            url: share.fileUrl,
            type: share.fileType,
            permission: share.permission,
          },
        })
      }
    }

    return NextResponse.json({ error: "Invalid OTP" }, { status: 401 })
  } catch (err) {
    console.error("receive-otp error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
