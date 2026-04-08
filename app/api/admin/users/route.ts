import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getDb } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // All authenticated users can view the user list (read-only)
    const db = await getDb()
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0, otp: 0, otpExpiry: 0 } })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ users })
  } catch (err) {
    console.error("admin/users GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
