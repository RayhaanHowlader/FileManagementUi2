import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getDb, ObjectId } from "@/lib/db"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.email) return false
  const db = await getDb()
  const user = await db.collection("users").findOne(
    { email: session.user.email },
    { projection: { role: 1 } }
  )
  return user?.role === "admin"
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const db = await getDb()
  const updateFields: Record<string, unknown> = { updatedAt: new Date() }
  if (body.permissions) updateFields.permissions = body.permissions
  if (body.role) updateFields.role = body.role

  await db.collection("users").updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  )

  return NextResponse.json({ message: "Updated" })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const db = await getDb()
  await db.collection("users").deleteOne({ _id: new ObjectId(id) })

  return NextResponse.json({ message: "Deleted" })
}
