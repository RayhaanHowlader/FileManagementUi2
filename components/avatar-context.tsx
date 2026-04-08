"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

type AvatarContextType = {
  avatarUrl: string
  setAvatarUrl: (url: string) => void
  refetch: () => void
}

const AvatarContext = createContext<AvatarContextType>({
  avatarUrl: "",
  setAvatarUrl: () => {},
  refetch: () => {},
})

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [avatarUrl, setAvatarUrl] = useState("")

  const refetch = useCallback(() => {
    if (status !== "authenticated") return
    if ((session?.user as any)?.role === "admin") return

    fetch(`/api/user/profile?t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        setAvatarUrl(data.user?.avatarUrl ?? "")
      })
      .catch(() => {})
  }, [session, status])

  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <AvatarContext.Provider value={{ avatarUrl, setAvatarUrl, refetch }}>
      {children}
    </AvatarContext.Provider>
  )
}

export const useAvatar = () => useContext(AvatarContext)
