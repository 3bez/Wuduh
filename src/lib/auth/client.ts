import { createAuthClient } from 'better-auth/react'

// In Next.js, NEXT_PUBLIC_* vars are inlined at build time.
// If the build ARG was not supplied, the var is empty string — fall back to production URL.
const baseURL = (process.env.NEXT_PUBLIC_APP_URL || 'https://wuduh.site').replace(/\/$/, '')

export const authClient = createAuthClient({
  baseURL,
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  forgetPassword,
  resetPassword,
  verifyEmail,
} = authClient
