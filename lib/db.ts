import { MongoClient, Db, ObjectId } from "mongodb"

const MONGO_URI = process.env.MONGO_URI!
const DB_NAME = "securefiles"

let client: MongoClient | null = null
let db: Db | null = null

export async function getDb(): Promise<Db> {
  if (db) return db
  client = new MongoClient(MONGO_URI)
  await client.connect()
  db = client.db(DB_NAME)
  return db
}

export async function updateUserAvatar(email: string, avatarUrl: string) {
  const database = await getDb()
  const result = await database.collection("users").updateOne(
    { email },
    { $set: { avatarUrl, updatedAt: new Date() } }
  )
  return result
}

export async function getUserByEmail(email: string) {
  const database = await getDb()
  return database.collection("users").findOne({ email })
}

export { ObjectId }
