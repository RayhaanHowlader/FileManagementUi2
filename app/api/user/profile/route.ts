import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getDb } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    const email = session?.user?.email
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const db = await getDb()
    const user = await db.collection("users").findOne(
      { email },
      { projection: { password: 0, otp: 0, otpExpiry: 0 } }
    )

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json({ user })
  } catch (err) {
    console.error("Profile GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    const email = session?.user?.email
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { fullName, jobTitle } = await req.json()

    const db = await getDb()
    await db.collection("users").updateOne(
      { email },
      { $set: { fullName, jobTitle, updatedAt: new Date() } }
    )

    const user = await db.collection("users").findOne(
      { email },
      { projection: { password: 0, otp: 0, otpExpiry: 0 } }
    )

    return NextResponse.json({ user })
  } catch (err) {
    console.error("Profile PATCH error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
