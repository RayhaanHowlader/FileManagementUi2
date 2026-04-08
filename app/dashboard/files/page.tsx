"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Upload, Search, Filter, MoreHorizontal, FileText,
  Image as ImageIcon, File, FileArchive, Download,
  Share2, Trash2, Eye, Folder, Grid, List,
  ChevronDown, Check, X, Loader2, Video, RefreshCw, Lock
} from "lucide-react"
import { cn } from "@/lib/utils"
import ShareFileModal from "@/components/share-file-modal"
import FilePreviewModal from "@/components/file-preview-modal"
import FilePasswordModal from "@/components/file-password-modal"
import { toast } from "@/hooks/use-toast"

type FileItem = {
  _id: string
  name: string
  type: string
  size: number
  url: string
  owner: string
  ownerName: string
  shared: boolean
  downloadable: boolean
  shareable: boolean
  hasPassword: boolean
  createdAt: string
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-chart-2" />
  if (type.startsWith("video/")) return <Video className="h-5 w-5 text-chart-1" />
  if (type === "application/pdf") return <FileText className="h-5 w-5 text-destructive" />
  if (type.includes("zip") || type.includes("archive") || type.includes("tar"))
    return <FileArchive className="h-5 w-5 text-chart-4" />
  if (type.includes("word") || type.includes("document") || type.includes("sheet"))
    return <FileText className="h-5 w-5 text-chart-1" />
  if (type.includes("folder")) return <Folder className="h-5 w-5 text-chart-3" />
  return <File className="h-5 w-5 text-muted-foreground" />
}

export default function FilesPage() {
  const { data: session } = useSession()
  const currentUserId = (session?.user as any)?.id ?? (session?.user as any)?.sub ?? ""
  const isAdmin = (session?.user as any)?.role === "admin"

  // Fetch permissions from DB directly — never trust stale JWT
  const [userPerms, setUserPerms] = useState({ read: true, download: true, delete: false, share: true })
  const [dbRole, setDbRole] = useState<string>("user")
  const [dbUserId, setDbUserId] = useState<string>("")

  useEffect(() => {
    fetch("/api/user/role")
      .then((r) => r.json())
      .then((d) => {
        setDbRole(d.role ?? "user")
        if (d.permissions) setUserPerms(d.permissions)
        if (d.userId) setDbUserId(d.userId)
      })
      .catch(() => {})
  }, [])

  const effectiveAdmin = isAdmin || dbRole === "admin"
  const effectiveUserId = dbUserId || currentUserId

  // Admin-enforced permission gates (admin can restrict anyone)
  const canPreview = effectiveAdmin || userPerms.read !== false
  const canDownloadAny = effectiveAdmin || userPerms.download !== false
  const canShare = effectiveAdmin || userPerms.share !== false
  const canUpload = effectiveAdmin || userPerms.download !== false

  const canDelete = (file: FileItem) =>
    effectiveAdmin || (userPerms.delete !== false && file.owner === effectiveUserId)
  // Always allow preview — modal handles what it can show
  const isPreviewable = (file: FileItem) =>
    canPreview && (
    file.type.startsWith("image/") ||
    file.type.startsWith("video/") ||
    file.type === "application/pdf" ||
    file.type.startsWith("audio/") ||
    file.type.includes("wordprocessingml") ||
    file.type.includes("msword") ||
    file.type === "text/plain" ||
    /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(file.name) ||
    /\.(mp4|webm|ogg|mov)$/i.test(file.name) ||
    /\.(mp3|wav|flac|aac)$/i.test(file.name) ||
    /\.(docx|doc)$/i.test(file.name) ||
    /\.(txt|csv|md)$/i.test(file.name) ||
    file.name.toLowerCase().endsWith(".pdf")
    )
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [selectedFileForShare, setSelectedFileForShare] = useState<FileItem | null>(null)
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterType, setFilterType] = useState("all")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ name: string; percent: number; status: "uploading" | "done" | "error" }[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [allowDownload, setAllowDownload] = useState(true)
  const [allowShare, setAllowShare] = useState(true)
  const [filePassword, setFilePassword] = useState("")
  const [usePassword, setUsePassword] = useState(false)
  // password gate state
  const [passwordGateFile, setPasswordGateFile] = useState<{ file: FileItem; action: "preview" | "download" } | null>(null)
  const [unlockedFiles, setUnlockedFiles] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ ids: string[]; names: string[] } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Receive File via OTP state
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [receiveOtp, setReceiveOtp] = useState("")
  const [receiveLoading, setReceiveLoading] = useState(false)
  const [receiveError, setReceiveError] = useState("")
  const [receivedFile, setReceivedFile] = useState<{ id: string; name: string; url: string; type: string; permission: string } | null>(null)

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/files")
      const data = await res.json()
      if (res.ok) setFiles(data.files)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false
    if (filterType === "images") return file.type.startsWith("image/")
    if (filterType === "videos") return file.type.startsWith("video/")
    if (filterType === "documents") return file.type.includes("pdf") || file.type.includes("word") || file.type.includes("sheet")
    if (filterType === "archives") return file.type.includes("zip") || file.type.includes("tar")
    return true
  })

  const uploadFiles = async (fileList: FileList) => {
    setUploading(true)
    const names = Array.from(fileList).map((f) => f.name)
    setUploadProgress(names.map((name) => ({ name, percent: 0, status: "uploading" as const })))

    for (let i = 0; i < fileList.length; i++) {
      const fd = new FormData()
      fd.append("file", fileList[i])
      fd.append("downloadable", String(allowDownload))
      fd.append("shareable", String(allowShare))
      if (usePassword && filePassword) fd.append("filePassword", filePassword)

      await new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest()
        xhr.open("POST", "/api/files")
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setUploadProgress((prev) =>
              prev.map((p, idx) => idx === i ? { ...p, percent: pct } : p)
            )
          }
        }
        xhr.onload = () => {
          const ok = xhr.status >= 200 && xhr.status < 300
          setUploadProgress((prev) =>
            prev.map((p, idx) => idx === i ? { ...p, percent: 100, status: ok ? "done" : "error" } : p)
          )
          resolve()
        }
        xhr.onerror = () => {
          setUploadProgress((prev) =>
            prev.map((p, idx) => idx === i ? { ...p, status: "error" } : p)
          )
          resolve()
        }
        xhr.send(fd)
      })
    }

    setUploading(false)
    await fetchFiles()
    setTimeout(() => { setShowUploadModal(false); setUploadProgress([]); setUsePassword(false); setFilePassword(""); setAllowShare(true) }, 1500)
  }

  const needsPassword = (file: FileItem) =>
    file.hasPassword && file.owner !== currentUserId && !unlockedFiles.has(file._id)

  const handlePreview = (file: FileItem) => {
    setShowActionsMenu(null)
    if (needsPassword(file)) { setPasswordGateFile({ file, action: "preview" }); return }
    // Log preview
    fetch("/api/files/log", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "preview", fileId: file._id, fileName: file.name, fileType: file.type }) })
    setPreviewFile(file)
  }

  const handleDownloadWithGate = (file: FileItem) => {
    setShowActionsMenu(null)
    if (!canDownloadAny) return // admin blocked download permission
    if (needsPassword(file)) { setPasswordGateFile({ file, action: "download" }); return }
    handleDownload(file)
  }

  const handleDelete = (id: string) => {
    setShowActionsMenu(null)
    const file = files.find((f) => f._id === id)
    setDeleteConfirm({ ids: [id], names: [file?.name ?? "this file"] })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      for (const id of deleteConfirm.ids) {
        await fetch(`/api/files/${id}`, { method: "DELETE" })
      }
      setFiles((prev) => prev.filter((f) => !deleteConfirm.ids.includes(f._id)))
      setSelectedFiles((prev) => prev.filter((id) => !deleteConfirm.ids.includes(id)))
      setDeleteConfirm(null)
      toast({
        title: "Deleted successfully",
        description: deleteConfirm.ids.length === 1
          ? `"${deleteConfirm.names[0]}" has been deleted.`
          : `${deleteConfirm.ids.length} files have been deleted.`,
      })
    } finally {
      setDeleting(false)
    }
  }

  const toggleSelectFile = (id: string) =>
    setSelectedFiles((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])

  const toggleSelectAll = () =>
    setSelectedFiles(selectedFiles.length === filteredFiles.length ? [] : filteredFiles.map((f) => f._id))

  const handleDownload = async (file: FileItem) => {
    setShowActionsMenu(null)
    // Log download
    fetch("/api/files/log", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "download", fileId: file._id, fileName: file.name, fileType: file.type }) })
    try {
      const res = await fetch(file.url)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // fallback: open in new tab
      window.open(file.url, "_blank")
    }
  }

  const handleBulkDownload = async () => {
    const selected = files.filter((f) => selectedFiles.includes(f._id))
    for (const file of selected) {
      await handleDownload(file)
    }
  }

  const handleShare = (file: FileItem) => {
    setSelectedFileForShare(file)
    setShowShareModal(true)
    setShowActionsMenu(null)
  }

  const filterLabels: Record<string, string> = {
    all: "All Files", images: "Images", videos: "Videos",
    documents: "Documents", archives: "Archives",
  }

  // Rendered inline — kept outside JSX tree to avoid remount issues
  const renderActionMenu = (file: FileItem) => {
    if (showActionsMenu !== file._id) return null
    return (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setShowActionsMenu(null)} />
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border border-border bg-popover py-1 shadow-lg">
          {isPreviewable(file) && (
            <button
              onClick={() => handlePreview(file)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
            >
              <Eye className="h-4 w-4" /> Preview
              {file.hasPassword && !unlockedFiles.has(file._id) && file.owner !== effectiveUserId && !effectiveAdmin && (
                <Lock className="h-3 w-3 ml-auto text-amber-500" />
              )}
            </button>
          )}
          {canDownloadAny && (
            <button
              onClick={() => handleDownloadWithGate(file)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
            >
              <Download className="h-4 w-4" /> Download
              {file.hasPassword && !unlockedFiles.has(file._id) && file.owner !== effectiveUserId && !effectiveAdmin && (
                <Lock className="h-3 w-3 ml-auto text-amber-500" />
              )}
            </button>
          )}
          {(canShare && (effectiveAdmin || file.owner === effectiveUserId || file.shareable !== false)) && (
            <button
              onClick={() => handleShare(file)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          )}
          {canDelete(file) && (
            <>
              <hr className="my-1 border-border" />
              <button
                onClick={() => handleDelete(file._id)}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-accent"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header + Toolbar combined */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Files</h1>
            <p className="text-sm text-muted-foreground">Manage and share your files securely</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={fetchFiles}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
              <RefreshCw className="h-4 w-4" /><span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={() => { setShowReceiveModal(true); setReceiveOtp(""); setReceiveError(""); setReceivedFile(null) }}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
              <Download className="h-4 w-4" /><span>Receive File</span>
            </button>
            {canUpload && (
              <button onClick={() => setShowUploadModal(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <Upload className="h-4 w-4" /><span>Upload Files</span>
              </button>
            )}
          </div>
        </div>

        {/* Search + filter row */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="search" placeholder="Search files..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="relative">
              <button onClick={() => setFilterOpen(!filterOpen)}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
                <Filter className="h-4 w-4" /> {filterLabels[filterType]} <ChevronDown className="h-3 w-3" />
              </button>
              {filterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
                  <div className="absolute left-0 top-full z-50 mt-2 w-44 rounded-md border border-border bg-popover py-1 shadow-lg">
                    {Object.entries(filterLabels).map(([key, label]) => (
                      <button key={key} onClick={() => { setFilterType(key); setFilterOpen(false) }}
                        className={cn("flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent", filterType === key && "text-primary font-medium")}>
                        {filterType === key ? <Check className="h-3 w-3" /> : <span className="w-3" />}
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center rounded-md border border-input">
            <button onClick={() => setViewMode("list")} className={cn("rounded-l-md p-2 transition-colors", viewMode === "list" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50")}>
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("grid")} className={cn("rounded-r-md p-2 transition-colors", viewMode === "grid" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50")}>
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* File count */}
      {!loading && filteredFiles.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">{filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}</p>
          {selectedFiles.length > 0 && (
            <p className="text-sm font-medium">{selectedFiles.length} selected</p>
          )}
        </div>
      )}
      {/* Bulk actions */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <span className="text-sm font-medium">{selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected</span>
          <div className="flex flex-wrap items-center gap-2">
            {selectedFiles.length === 1 && (() => {
              const f = files.find(f => f._id === selectedFiles[0])
              return f && canShare && (effectiveAdmin || f.owner === effectiveUserId || f.shareable !== false) ? (
                <button
                  onClick={() => { setSelectedFileForShare(f); setShowShareModal(true) }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-background px-3 text-sm font-medium hover:bg-accent">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              ) : null
            })()}
            <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-background px-3 text-sm font-medium hover:bg-accent"
              onClick={handleBulkDownload}>
              <Download className="h-4 w-4" /> Download
            </button>
            {selectedFiles.every(id => canDelete(files.find(f => f._id === id)!)) && (
              <button
                onClick={() => {
                  const names = selectedFiles.map((id) => files.find((f) => f._id === id)?.name ?? id)
                  setDeleteConfirm({ ids: [...selectedFiles], names })
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-destructive/10 px-3 text-sm font-medium text-destructive hover:bg-destructive/20">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <File className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-medium">No files yet</p>
          <p className="text-sm text-muted-foreground mt-1">Upload your first file to get started</p>
          <button onClick={() => setShowUploadModal(true)}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Upload className="h-4 w-4" /> Upload Files
          </button>
        </div>
      )}

      {/* List view */}
      {!loading && filteredFiles.length > 0 && viewMode === "list" && (
        <div className="rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="w-12 px-4 py-3 text-left">
                    <button onClick={toggleSelectAll}
                      className={cn("flex h-5 w-5 items-center justify-center rounded border transition-colors",
                        selectedFiles.length === filteredFiles.length && filteredFiles.length > 0
                          ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background hover:bg-accent")}>
                      {selectedFiles.length === filteredFiles.length && filteredFiles.length > 0 && <Check className="h-3 w-3" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">Owner</th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">Size</th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground lg:table-cell">Modified</th>
                  <th className="w-12 px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFiles.map((file) => (
                  <tr key={file._id} className="transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelectFile(file._id)}
                        className={cn("flex h-5 w-5 items-center justify-center rounded border transition-colors",
                          selectedFiles.includes(file._id) ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background hover:bg-accent")}>
                        {selectedFiles.includes(file._id) && <Check className="h-3 w-3" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => canPreview && handlePreview(file)}>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium hover:underline">{file.name}</p>
                          {file.shared && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Share2 className="h-3 w-3" /> Shared
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">{file.ownerName}</td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">{formatBytes(file.size)}</td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative flex justify-end">
                        <button onClick={() => setShowActionsMenu(showActionsMenu === file._id ? null : file._id)}
                          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {renderActionMenu(file)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid view */}
      {!loading && filteredFiles.length > 0 && viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFiles.map((file) => (
            <div key={file._id}
              className={cn("group relative rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50",
                selectedFiles.includes(file._id) ? "border-primary" : "border-border")}>
              <button onClick={() => toggleSelectFile(file._id)}
                className={cn("absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded border transition-all",
                  selectedFiles.includes(file._id) ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background opacity-0 group-hover:opacity-100")}>
                {selectedFiles.includes(file._id) && <Check className="h-3 w-3" />}
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                  {getFileIcon(file.type)}
                </div>
                <p className="mt-3 w-full truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <div className="absolute right-3 top-3">
                <button onClick={() => setShowActionsMenu(showActionsMenu === file._id ? null : file._id)}
                  className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-background group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {renderActionMenu(file)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
            <button onClick={() => { if (!uploading) { setShowUploadModal(false); setUploadProgress([]); setUsePassword(false); setFilePassword(""); setAllowShare(true) } }}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-accent">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold">Upload Files</h2>
            <p className="mt-1 text-sm text-muted-foreground">Drag and drop or click to browse</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files) }}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={cn("mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
                dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/50 hover:border-primary/50")}>
              {uploading ? <Loader2 className="h-12 w-12 animate-spin text-primary" /> : <Upload className="h-12 w-12 text-muted-foreground" />}
              <p className="mt-4 text-sm font-medium">{uploading ? "Uploading..." : "Drop files here or click to browse"}</p>
              <p className="mt-1 text-xs text-muted-foreground">Images, videos, documents, archives — any file type</p>
            </div>
            <input ref={fileInputRef} type="file" multiple className="hidden"
              onChange={(e) => { if (e.target.files?.length) uploadFiles(e.target.files) }} />

            {/* Downloadable toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Allow others to download</p>
                <p className="text-xs text-muted-foreground">If off, others can only view the file</p>
              </div>
              <button
                type="button"
                onClick={() => setAllowDownload(!allowDownload)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${allowDownload ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${allowDownload ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            {/* Shareable toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Allow others to share</p>
                <p className="text-xs text-muted-foreground">If off, only you and admins can share this file</p>
              </div>
              <button
                type="button"
                onClick={() => setAllowShare(!allowShare)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${allowShare ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${allowShare ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            {/* Password protection toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Password protect</p>
                <p className="text-xs text-muted-foreground">Others must enter a key to access</p>
              </div>
              <button
                type="button"
                onClick={() => { setUsePassword(!usePassword); setFilePassword("") }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${usePassword ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${usePassword ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            {usePassword && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Set file password / key"
                  value={filePassword}
                  onChange={(e) => setFilePassword(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
            {uploadProgress.length > 0 && (
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {uploadProgress.map((p, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={cn("truncate max-w-[200px]",
                        p.status === "done" ? "text-green-700" :
                        p.status === "error" ? "text-red-600" : "text-muted-foreground")}>
                        {p.status === "done" ? "✓ " : p.status === "error" ? "✗ " : ""}{p.name}
                      </span>
                      <span className="text-muted-foreground ml-2 shrink-0">{p.percent}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-200",
                          p.status === "done" ? "bg-green-500" :
                          p.status === "error" ? "bg-red-500" : "bg-primary")}
                        style={{ width: `${p.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { if (!uploading) { setShowUploadModal(false); setUploadProgress([]); setUsePassword(false); setFilePassword(""); setAllowShare(true) } }} disabled={uploading}
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent disabled:opacity-50">
                Cancel
              </button>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="inline-flex h-10 items-center gap-2 justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4" /> Browse Files</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold">Delete {deleteConfirm.ids.length > 1 ? `${deleteConfirm.ids.length} files` : "file"}?</p>
                <p className="text-sm text-muted-foreground truncate max-w-[220px]">
                  {deleteConfirm.ids.length === 1 ? deleteConfirm.names[0] : `${deleteConfirm.names.slice(0, 2).join(", ")}${deleteConfirm.names.length > 2 ? ` +${deleteConfirm.names.length - 2} more` : ""}`}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">This action cannot be undone. The file will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-input bg-background text-sm font-medium hover:bg-accent disabled:opacity-50">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-destructive text-sm font-medium text-white hover:bg-destructive/90 disabled:opacity-50">
                {deleting ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Gate Modal */}
      {passwordGateFile && (
        <FilePasswordModal
          fileName={passwordGateFile.file.name}
          fileId={passwordGateFile.file._id}
          onClose={() => setPasswordGateFile(null)}
          onSuccess={() => {
            const { file, action } = passwordGateFile
            setUnlockedFiles((prev) => new Set([...prev, file._id]))
            setPasswordGateFile(null)
            if (action === "preview") setPreviewFile(file)
            else handleDownload(file)
          }}
        />
      )}

      {/* Preview Modal */}
      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} userCanDownload={canDownloadAny} />}

      {/* Share Modal */}
      {showShareModal && selectedFileForShare && (
        <ShareFileModal
          file={{ id: selectedFileForShare._id, name: selectedFileForShare.name, type: selectedFileForShare.type, size: formatBytes(selectedFileForShare.size), url: selectedFileForShare.url }}
          onClose={() => { setShowShareModal(false); setSelectedFileForShare(null) }}
        />
      )}

      {/* Receive File Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-5">
            <button onClick={() => setShowReceiveModal(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-accent">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Receive File</h2>
                <p className="text-sm text-muted-foreground">Enter the OTP sent to your email</p>
              </div>
            </div>

            {!receivedFile ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">One-Time Password (OTP)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={receiveOtp}
                    onChange={(e) => { setReceiveOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setReceiveError("") }}
                    className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                {receiveError && <p className="text-sm text-destructive">{receiveError}</p>}
                <button
                  onClick={async () => {
                    if (receiveOtp.length !== 6) { setReceiveError("Enter a 6-digit OTP"); return }
                    setReceiveLoading(true)
                    setReceiveError("")
                    try {
                      const res = await fetch("/api/files/receive-otp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ otp: receiveOtp }),
                      })
                      const data = await res.json()
                      if (!res.ok) { setReceiveError(data.error ?? "Invalid OTP"); return }
                      setReceivedFile(data.file)
                    } finally {
                      setReceiveLoading(false)
                    }
                  }}
                  disabled={receiveLoading || receiveOtp.length !== 6}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {receiveLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</> : "Access File"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">OTP verified successfully</p>
                    <p className="text-xs text-green-600 truncate">{receivedFile.name}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const fakeFile = {
                        _id: receivedFile.id,
                        name: receivedFile.name,
                        type: receivedFile.type,
                        size: 0,
                        url: receivedFile.url,
                        owner: "",
                        ownerName: "",
                        shared: true,
                        downloadable: receivedFile.permission === "download",
                        shareable: false,
                        hasPassword: false,
                        createdAt: new Date().toISOString(),
                      }
                      setPreviewFile(fakeFile)
                      setShowReceiveModal(false)
                    }}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent"
                  >
                    <Eye className="h-4 w-4" /> Preview
                  </button>
                  {receivedFile.permission === "download" && (
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(receivedFile.url)
                          const blob = await res.blob()
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url; a.download = receivedFile.name
                          document.body.appendChild(a); a.click()
                          document.body.removeChild(a); URL.revokeObjectURL(url)
                        } catch { window.open(receivedFile.url, "_blank") }
                      }}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Download className="h-4 w-4" /> Download
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
