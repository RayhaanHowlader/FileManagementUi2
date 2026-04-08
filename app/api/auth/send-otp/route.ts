import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { sendOtpEmail } from "@/lib/mailer"

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password } = await req.json()

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    const existing = await User.findOne({ email })
    if (existing && existing.isVerified) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const hashedPassword = await bcrypt.hash(password, 10)

    // Upsert unverified user (overwrite if they tried before)
    await User.findOneAndUpdate(
      { email },
      { fullName, email, password: hashedPassword, otp, otpExpiry, isVerified: false },
      { upsert: true, new: true }
    )

    await sendOtpEmail(email, otp)

    return NextResponse.json({ message: "OTP sent" }, { status: 200 })
  } catch (err) {
    console.error("send-otp error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
