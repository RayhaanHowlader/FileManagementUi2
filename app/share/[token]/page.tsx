import { connectDB } from "@/lib/mongodb"
import { Share } from "@/lib/models/Share"
import { FileText, Download, Clock, ShieldX } from "lucide-react"

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  await connectDB()
  const share = await Share.findOne({ token })

  if (!share) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Link not found</h1>
          <p className="text-muted-foreground">This share link is invalid or has been removed.</p>
        </div>
      </div>
    )
  }

  if (new Date() > share.expiresAt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold">Link expired</h1>
          <p className="text-muted-foreground">This share link expired on {share.expiresAt.toLocaleDateString()}.</p>
        </div>
      </div>
    )
  }

  const isImage = share.fileType.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(share.fileName)
  const isVideo = share.fileType.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(share.fileName)
  const isPdf = share.fileType === "application/pdf" || share.fileName.toLowerCase().endsWith(".pdf")
  const canDownload = share.permission === "download"

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{share.fileName}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Shared by <span className="font-medium text-foreground">{share.sharedBy}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Expires {share.expiresAt.toLocaleDateString()} · {share.permission === "download" ? "View & Download" : "View only"}
              </p>
            </div>
          </div>

          {canDownload && (
            <a
              href={share.fileUrl}
              download={share.fileName}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download File
            </a>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={share.fileUrl} alt={share.fileName} className="w-full max-h-[70vh] object-contain" />
          )}
          {isVideo && (
            <video src={share.fileUrl} controls className="w-full max-h-[70vh]" />
          )}
          {isPdf && (
            <iframe src={share.fileUrl} className="w-full h-[70vh]" title={share.fileName} />
          )}
          {!isImage && !isVideo && !isPdf && (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="font-medium">{share.fileName}</p>
              <p className="text-sm text-muted-foreground">Preview not available for this file type.</p>
              {canDownload && (
                <a href={share.fileUrl} download={share.fileName}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  <Download className="h-4 w-4" /> Download to view
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
