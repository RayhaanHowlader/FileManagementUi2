import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Missing email or OTP" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 })
    }

    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json({ error: "No OTP found, please request a new one" }, { status: 400 })
    }

    if (new Date() > user.otpExpiry) {
      return NextResponse.json({ error: "OTP has expired, please request a new one" }, { status: 400 })
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }

    // Mark verified and clear OTP
    user.isVerified = true
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 })
  } catch (err) {
    console.error("verify-otp error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
