import type { NextAuthConfig } from "next-auth"

// Edge-safe config — no Node.js modules here
export const authConfig: NextAuthConfig = {
  providers: [], // providers with DB logic are added in auth.ts (Node runtime only)
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isDashboard = nextUrl.pathname.startsWith("/dashboard")
      if (isDashboard) return isLoggedIn
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.sub = user.id
        token.role = (user as any).role
        token.permissions = (user as any).permissions
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // use token.id first, fall back to token.sub
        session.user.id = (token.id ?? token.sub) as string
        ;(session.user as any).role = token.role
        ;(session.user as any).permissions = token.permissions
      }
      return session
    },
  },
  session: { strategy: "jwt" },
}
