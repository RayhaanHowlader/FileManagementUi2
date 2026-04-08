import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { connectDB } from "@/lib/mongodb"
import { File } from "@/lib/models/File"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { fileId, password } = await req.json()
  if (!fileId || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  await connectDB()
  const file = await File.findById(fileId).select("password owner")
  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 })

  if (!file.password) return NextResponse.json({ valid: true }) // no password set

  const valid = await bcrypt.compare(password, file.password)
  if (!valid) return NextResponse.json({ error: "Incorrect password" }, { status: 401 })

  return NextResponse.json({ valid: true })
}
