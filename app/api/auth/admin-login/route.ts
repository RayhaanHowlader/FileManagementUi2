import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
    }

    const isAdmin =
      (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) ||
      (email === process.env.ADMIN_EMAIL_2 && password === process.env.ADMIN_PASSWORD_2)

    if (!isAdmin) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 })
    }

    return NextResponse.json({ message: "Admin authenticated" }, { status: 200 })
  } catch (err) {
    console.error("admin-login error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
