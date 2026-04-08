import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
})

export async function sendOtpEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"SecureShare" <${process.env.FROM_EMAIL}>`,
    to,
    subject: "Your verification code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="margin-bottom:8px;">Verify your email</h2>
        <p style="color:#6b7280;">Use the code below. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:12px;text-align:center;padding:24px 0;">${otp}</div>
        <p style="color:#9ca3af;font-size:12px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  })
}
