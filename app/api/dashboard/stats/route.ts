import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getDb } from "@/lib/db"
import { connectDB } from "@/lib/mongodb"
import { File } from "@/lib/models/File"
import { Share } from "@/lib/models/Share"
import mongoose from "mongoose"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Always check role from DB directly — never trust stale JWT
  const db = await getDb()
  // Look up user _id from DB by email to avoid stale JWT id issues
  const dbUserFull = await db.collection("users").findOne(
    { email: session.user.email },
    { projection: { _id: 1, role: 1 } }
  )
  const isAdmin = dbUserFull?.role === "admin"
  const userId = dbUserFull?._id  // real ObjectId from DB

  await connectDB()

  const fileQuery = isAdmin ? {} : { owner: userId }

  const [files, shares, totalUsers] = await Promise.all([
    File.find(fileQuery).sort({ createdAt: -1 }).lean(),
    Share.find(isAdmin ? {} : { sharedBy: session.user.email }).sort({ createdAt: -1 }).lean(),
    isAdmin ? db.collection("users").countDocuments({ role: { $ne: "admin" } }) : Promise.resolve(0),
  ])

  const totalFiles = files.length
  const totalBytes = files.reduce((sum, f) => sum + (f.size ?? 0), 0)

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const sharesThisWeek = shares.filter((s) => new Date(s.createdAt) > weekAgo).length
  const totalShares = shares.length

  const recentFiles = files.slice(0, 5).map((f) => ({
    _id: f._id.toString(),
    name: f.name,
    type: f.type,
    size: f.size,
    url: f.url,
    ownerName: f.ownerName,
    downloadable: f.downloadable ?? true,
    createdAt: f.createdAt,
  }))

  const fileActivity = files.slice(0, 10).map((f) => ({
    id: f._id.toString(),
    user: f.ownerName,
    action: "uploaded",
    target: f.name,
    time: new Date(f.createdAt).toISOString(),
  }))

  const shareActivity = shares.slice(0, 10).map((s) => ({
    id: s._id.toString(),
    user: s.sharedBy,
    action: "shared",
    target: s.fileName,
    time: new Date(s.createdAt).toISOString(),
  }))

  const recentActivity = [...fileActivity, ...shareActivity]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8)

  return NextResponse.json({
    totalFiles,
    totalBytes,
    sharesThisWeek,
    totalShares,
    totalUsers,
    recentFiles,
    recentActivity,
    isAdmin,
  })
}
