import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const auth = betterAuth({
  database: {
    type: 'pg',
    pool,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Verify your Wuduh account',
        html: verificationEmailHtml(user.name ?? 'Founder', url),
      })
    },
    autoSignInAfterVerification: true,
  },
  advanced: {
    cookiePrefix: 'wuduh',
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? 'https://wuduh.site'],
})

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'Wuduh <hello@wuduh.site>',
    to,
    subject,
    html,
  })
}

function verificationEmailHtml(name: string, url: string) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#0D1B2A;">
      <h1 style="font-size:22px;font-weight:500;margin:0 0 12px;">Verify your email, ${name.split(' ')[0]}.</h1>
      <p style="font-size:15px;color:#647183;line-height:1.7;margin:0 0 28px;">
        Click the button below to verify your email address and start building your feasibility study.
      </p>
      <a href="${url}" style="display:inline-block;background:#C9A84C;color:#0D1B2A;font-size:14px;font-weight:600;padding:12px 28px;border-radius:9px;text-decoration:none;">
        Verify email →
      </a>
      <p style="font-size:12px;color:#B4BFCB;margin-top:32px;">
        If you didn't create a Wuduh account, you can safely ignore this email.
      </p>
    </div>
  `
}
