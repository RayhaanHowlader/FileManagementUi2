/**
 * Inserts admin users directly into the `users` collection.
 * Run with: npx tsx --env-file=.env scripts/seed-admin.ts
 */
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const MONGO_URI = process.env.MONGO_URI!
const DB_NAME = "securefiles"

const admins = [
  { fullName: "Rayhaan",  email: "rayhaanhowlader1805@gmail.com", password: "Rayhaan@123" },
  { fullName: "Rayhaan",  email: "rayhaan@gmail.com",             password: "rayhaan@123" },
]

async function seed() {
  const client = new MongoClient(MONGO_URI)
  await client.connect()
  console.log("Connected to MongoDB →", DB_NAME)

  const db = client.db(DB_NAME)
  const col = db.collection("users")

  for (const admin of admins) {
    const existing = await col.findOne({ email: admin.email })

    if (existing) {
      await col.updateOne(
        { email: admin.email },
        { $set: { role: "admin", isVerified: true, updatedAt: new Date() } }
      )
      console.log(`✓ Updated to admin: ${admin.email}`)
    } else {
      const hashed = await bcrypt.hash(admin.password, 10)
      await col.insertOne({
        fullName: admin.fullName,
        email: admin.email,
        password: hashed,
        role: "admin",
        isVerified: true,
        jobTitle: "",
        avatarUrl: "",
        permissions: { read: true, download: true, delete: true, share: true },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log(`✓ Created admin: ${admin.email}`)
    }
  }

  await client.close()
  console.log("Done.")
}

seed().catch((err) => { console.error(err); process.exit(1) })
