import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset your Wuduh password',
        html: resetPasswordEmailHtml(user.name ?? 'Founder', url),
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Replace callback URL to go to dashboard after verification
      const verifyUrl = new URL(url)
      verifyUrl.searchParams.set('callbackURL', '/dashboard')
      await sendEmail({
        to: user.email,
        subject: 'Verify your Wuduh account',
        html: verificationEmailHtml(user.name ?? 'Founder', verifyUrl.toString()),
      })
    },
    autoSignInAfterVerification: true,
  },
  advanced: {
    cookiePrefix: 'wuduh',
  },
  // Map Better Auth table names to our existing table names
  user: {
    modelName: 'users',
  },
  session: {
    modelName: 'sessions',
  },
  account: {
    modelName: 'accounts',
  },
  verification: {
    modelName: 'verifications',
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? 'https://wuduh.site',
    'https://wuduh.site',
    'http://localhost:3000',
  ],
})

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: 'Wuduh <hello@wuduh.site>',
    to,
    subject,
    html,
  })
  if (error) {
    console.error('[email] Resend failed:', JSON.stringify(error))
    throw new Error(`Resend: ${error.message ?? 'send failed'}`)
  }
  console.log('[email] sent', data?.id, '→', to)
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

function resetPasswordEmailHtml(name: string, url: string) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#0D1B2A;">
      <h1 style="font-size:22px;font-weight:500;margin:0 0 12px;">Reset your password, ${name.split(' ')[0]}.</h1>
      <p style="font-size:15px;color:#647183;line-height:1.7;margin:0 0 28px;">
        We received a request to reset the password on your Wuduh account. Click the button below to choose a new one. This link expires in one hour.
      </p>
      <a href="${url}" style="display:inline-block;background:#C9A84C;color:#0D1B2A;font-size:14px;font-weight:600;padding:12px 28px;border-radius:9px;text-decoration:none;">
        Reset password →
      </a>
      <p style="font-size:12px;color:#B4BFCB;margin-top:32px;">
        If you didn't request a password reset, you can safely ignore this email — your password will stay the same.
      </p>
    </div>
  `
}
