import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { sendOtpEmail } from "@/lib/mailer"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

    const db = await getDb()
    const user = await db.collection("users").findOne({ email: email.toLowerCase() })

    // Always return success to prevent email enumeration
    if (!user) return NextResponse.json({ message: "OTP sent if account exists" })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    await db.collection("users").updateOne(
      { email: email.toLowerCase() },
      { $set: { otp, otpExpiry, updatedAt: new Date() } }
    )

    await sendOtpEmail(email, otp)

    return NextResponse.json({ message: "OTP sent" })
  } catch (err) {
    console.error("forgot-password error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
