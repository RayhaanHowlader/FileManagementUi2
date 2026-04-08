import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getDb } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ ok: false }, { status: 401 })

    const { action, fileId, fileName, fileType } = await req.json()
    if (!action || !fileId || !fileName) return NextResponse.json({ ok: false }, { status: 400 })

    const db = await getDb()
    const dbUser = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { _id: 1, fullName: 1 } }
    )

    await db.collection("filelogs").insertOne({
      action,
      userId: dbUser?._id?.toString() ?? session.user.email,
      userName: dbUser?.fullName ?? session.user.name ?? session.user.email,
      userEmail: session.user.email,
      fileId,
      fileName,
      fileType: fileType ?? "",
      createdAt: new Date(),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("log error:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const db = await getDb()
    const dbUser = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { role: 1 } }
    )
    if (dbUser?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const logs = await db.collection("filelogs")
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray()

    return NextResponse.json({ logs })
  } catch (err) {
    console.error("log GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
