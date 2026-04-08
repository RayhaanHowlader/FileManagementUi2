import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDb } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json()
    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()
    const user = await db.collection("users").findOne({ email: email.toLowerCase() })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (!user.otp || !user.otpExpiry) return NextResponse.json({ error: "No OTP found, request a new one" }, { status: 400 })
    if (new Date() > new Date(user.otpExpiry)) return NextResponse.json({ error: "OTP has expired" }, { status: 400 })
    if (user.otp !== otp) return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })

    const hashed = await bcrypt.hash(newPassword, 10)

    await db.collection("users").updateOne(
      { email: email.toLowerCase() },
      { $set: { password: hashed, updatedAt: new Date() }, $unset: { otp: "", otpExpiry: "" } }
    )

    return NextResponse.json({ message: "Password reset successful" })
  } catch (err) {
    console.error("reset-password error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
