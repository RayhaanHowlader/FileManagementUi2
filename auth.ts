import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.sub = user.id
        token.role = (user as any).role
        token.permissions = (user as any).permissions
      }
      // Re-fetch role from DB if missing (stale token from before DB migration)
      if (!token.role && (token.id || token.sub)) {
        try {
          await connectDB()
          const dbUser = await User.findById(token.id ?? token.sub).lean() as any
          if (dbUser) {
            token.role = dbUser.role ?? "user"
            token.permissions = dbUser.permissions
              ? {
                  read: dbUser.permissions.read,
                  write: dbUser.permissions.write,
                  delete: dbUser.permissions.delete,
                  share: dbUser.permissions.share,
                }
              : { read: true, write: true, delete: false, share: true }
          }
        } catch { /* ignore */ }
      }
      return token
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        await connectDB()
        const user = await User.findOne({ email })
        if (!user) return null

        // Admin users are always verified — skip isVerified check for them
        if (user.role !== "admin" && !user.isVerified) return null

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        return {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          role: user.role ?? "user",
          permissions: user.permissions
            ? {
                read: user.permissions.read,
                download: (user.permissions as any).download,
                delete: user.permissions.delete,
                share: user.permissions.share,
              }
            : { read: true, download: true, delete: false, share: true },
        }
      },
    }),
  ],
})
