"use client"

import { useState } from "react"
import { X, Download, FileText, File, FileArchive, ExternalLink, Loader2 } from "lucide-react"

type FileItem = {
  _id: string
  name: string
  type: string
  size: number
  url: string
  ownerName: string
  downloadable: boolean
  createdAt: string
}

interface FilePreviewModalProps {
  file: FileItem
  onClose: () => void
  userCanDownload?: boolean
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function downloadFile(url: string, name: string) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = blobUrl
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
  } catch {
    window.open(url, "_blank")
  }
}

export default function FilePreviewModal({ file, onClose, userCanDownload = true }: FilePreviewModalProps) {
  const [pdfLoaded, setPdfLoaded] = useState(false)
  const [pdfError, setPdfError] = useState(false)
  const [txtContent, setTxtContent] = useState<string | null>(null)
  const [txtLoading, setTxtLoading] = useState(false)

  const t = file.type.toLowerCase()
  const n = file.name.toLowerCase()

  const isImage = t.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/.test(n)
  const isVideo = t.startsWith("video/") || /\.(mp4|webm|ogg|mov)$/.test(n)
  const isPdf = t === "application/pdf" || n.endsWith(".pdf")
  const isAudio = t.startsWith("audio/") || /\.(mp3|wav|flac|aac)$/.test(n)
  const isDocx = t.includes("wordprocessingml") || t.includes("msword") || n.endsWith(".docx") || n.endsWith(".doc")
  const isTxt = t === "text/plain" || n.endsWith(".txt") || n.endsWith(".csv") || n.endsWith(".md")
  const canPreview = isImage || isVideo || isPdf || isAudio || isDocx || isTxt

  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`
  const canDownload = file.downloadable !== false && userCanDownload

  // Load txt content on mount if needed
  if (isTxt && txtContent === null && !txtLoading) {
    setTxtLoading(true)
    fetch(file.url)
      .then((r) => r.text())
      .then((text) => setTxtContent(text))
      .catch(() => setTxtContent("Could not load file content."))
      .finally(() => setTxtLoading(false))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-4xl flex-col rounded-xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
          <div className="min-w-0">
            <p className="truncate font-semibold">{file.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatBytes(file.size)} · {file.ownerName} · {new Date(file.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            {(isPdf || isDocx) && (
              <a href={file.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
                <ExternalLink className="h-4 w-4" /> Open
              </a>
            )}
            {canDownload && (
              <button onClick={() => downloadFile(file.url, file.name)}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
                <Download className="h-4 w-4" /> Download
              </button>
            )}
            <button onClick={onClose} className="rounded-md p-2 text-muted-foreground hover:bg-accent">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center min-h-[300px]">
          {isImage && (
            <div className="flex items-center justify-center w-full p-4 min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={file.url} alt={file.name} className="max-h-[70vh] max-w-full rounded-lg object-contain" />
            </div>
          )}

          {isVideo && (
            <video src={file.url} controls className="max-h-[70vh] max-w-full rounded-lg">
              Your browser does not support video playback.
            </video>
          )}

          {isAudio && (
            <div className="flex flex-col items-center gap-6 p-12">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <p className="font-medium">{file.name}</p>
              <audio src={file.url} controls className="w-full max-w-md" />
            </div>
          )}

          {isPdf && !pdfError && (
            <div className="relative w-full h-[75vh]">
              {!pdfLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/30">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading PDF...</p>
                </div>
              )}
              <iframe src={googleDocsUrl} className="w-full h-full border-0" title={file.name}
                onLoad={() => setPdfLoaded(true)} onError={() => setPdfError(true)} />
            </div>
          )}

          {isPdf && pdfError && (
            <div className="flex flex-col items-center gap-4 p-12 text-center">
              <FileText className="h-16 w-16 text-destructive" />
              <div>
                <p className="font-medium">Could not load PDF preview</p>
                <p className="text-sm text-muted-foreground mt-1">Open it directly or download to view.</p>
              </div>
              <div className="flex gap-3">
                <a href={file.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent">
                  <ExternalLink className="h-4 w-4" /> Open in browser
                </a>
                {canDownload && (
                  <button onClick={() => downloadFile(file.url, file.name)}
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    <Download className="h-4 w-4" /> Download
                  </button>
                )}
              </div>
            </div>
          )}

          {/* DOCX preview via Google Docs viewer */}
          {isDocx && (
            <div className="relative w-full h-[75vh]">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/30 pointer-events-none">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading document...</p>
              </div>
              <iframe src={googleDocsUrl} className="w-full h-full border-0 relative z-10" title={file.name} />
            </div>
          )}

          {/* TXT / plain text preview */}
          {isTxt && (
            <div className="w-full h-[75vh] overflow-auto p-6">
              {txtLoading ? (
                <div className="flex items-center justify-center h-full gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <pre className="text-sm font-mono whitespace-pre-wrap break-words text-foreground leading-relaxed">
                  {txtContent}
                </pre>
              )}
            </div>
          )}

          {!canPreview && (
            <div className="flex flex-col items-center gap-4 p-16 text-center">
              {file.type.includes("zip") || file.type.includes("archive")
                ? <FileArchive className="h-16 w-16 text-muted-foreground" />
                : <File className="h-16 w-16 text-muted-foreground" />
              }
              <div>
                <p className="font-medium">Preview not available</p>
                <p className="text-sm text-muted-foreground mt-1">Download to view this file.</p>
              </div>
              {canDownload && (
                <button onClick={() => downloadFile(file.url, file.name)}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  <Download className="h-4 w-4" /> Download File
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
