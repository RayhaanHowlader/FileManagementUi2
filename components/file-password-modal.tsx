"use client"

import { useState } from "react"
import { Lock, Eye, EyeOff, Loader2, X } from "lucide-react"

interface FilePasswordModalProps {
  fileName: string
  fileId: string
  onSuccess: () => void
  onClose: () => void
}

export default function FilePasswordModal({ fileName, fileId, onSuccess, onClose }: FilePasswordModalProps) {
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/files/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Incorrect password")
        return
      }
      onSuccess()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <Lock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold">Password Protected</p>
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{fileName}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          This file is password protected. Enter the key to access it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="Enter file password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError("") }}
              autoFocus
              className={`h-10 w-full rounded-md border px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${error ? "border-destructive" : "border-input bg-background"}`}
            />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={!password || loading}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</> : "Unlock File"}
          </button>
        </form>
      </div>
    </div>
  )
}
