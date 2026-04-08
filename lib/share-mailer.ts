import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
})

interface ShareEmailOptions {
  to: string
  from: string
  fromName: string
  fileName: string
  shareLink: string
  permission: string
  expiry: string
  message?: string
}

export async function sendShareEmail(opts: ShareEmailOptions) {
  const permLabel = opts.permission === "download" ? "view & download" : "view only"

  await transporter.sendMail({
    from: `"${opts.fromName} via SecureShare" <${process.env.FROM_EMAIL}>`,
    to: opts.to,
    subject: `${opts.fromName} shared a file with you: ${opts.fileName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="margin-bottom:4px;">You received a file</h2>
        <p style="color:#6b7280;margin-top:0;">${opts.fromName} (<a href="mailto:${opts.from}">${opts.from}</a>) shared a file with you.</p>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:24px 0;">
          <p style="margin:0;font-weight:600;font-size:16px;">📄 ${opts.fileName}</p>
          <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Permission: ${permLabel} · Expires in ${opts.expiry}</p>
        </div>

        ${opts.message ? `<p style="color:#374151;font-style:italic;">"${opts.message}"</p>` : ""}

        <a href="${opts.shareLink}"
          style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:8px;">
          Access File
        </a>

        <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
          This link expires in ${opts.expiry}. If you didn't expect this, you can ignore this email.
        </p>
      </div>
    `,
  })
}

export async function sendOtpShareEmail(opts: {
  to: string
  fromName: string
  fileName: string
  otp: string
  expiry: string
  permission: string
}) {
  const permLabel = opts.permission === "download" ? "view & download" : "view only"

  await transporter.sendMail({
    from: `"${opts.fromName} via SecureShare" <${process.env.FROM_EMAIL}>`,
    to: opts.to,
    subject: `${opts.fromName} shared a file with you (OTP Access): ${opts.fileName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="margin-bottom:4px;">You received a file via OTP</h2>
        <p style="color:#6b7280;margin-top:0;">${opts.fromName} shared <strong>${opts.fileName}</strong> with you.</p>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:24px 0;text-align:center;">
          <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Your one-time access code</p>
          <p style="margin:0;font-size:40px;font-weight:700;letter-spacing:12px;color:#111;">${opts.otp}</p>
          <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">Expires in 15 minutes · Permission: ${permLabel}</p>
        </div>

        <p style="color:#374151;font-size:14px;">
          Go to <strong>SecureShare → Files → Receive File</strong> and enter this code to access your file.
        </p>

        <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
          If you didn't expect this, you can ignore this email.
        </p>
      </div>
    `,
  })
}
