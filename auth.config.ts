import type { NextAuthConfig } from "next-auth"

// Edge-safe config — no Node.js modules here
export const authConfig: NextAuthConfig = {
  providers: [],
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
  },
  session: { strategy: "jwt" },
}
