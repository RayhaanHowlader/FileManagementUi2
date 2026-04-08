import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getDb } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ role: "user", permissions: { read: true, write: true, delete: false, share: true } })
  }

  const db = await getDb()
  const user = await db.collection("users").findOne(
    { email: session.user.email },
    { projection: { role: 1, permissions: 1, _id: 1 } }
  )

  return NextResponse.json({
    role: user?.role ?? "user",
    userId: user?._id?.toString() ?? "",
    permissions: user?.permissions ?? { read: true, download: true, delete: false, share: true },
  })
}
