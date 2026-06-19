// Wuduh database types — self-hosted PostgreSQL (camelCase columns)
// Auth tables are managed by Better Auth.
// Wuduh tables use camelCase column names as created by Better Auth's initializer.

export type Language   = 'en' | 'ar'
export type StudyStatus = 'draft' | 'complete' | 'exported'
export type AnswerStatus = 'done' | 'skipped'

// ── Better Auth tables ─────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  emailVerified: boolean
  name: string | null
  image: string | null
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  updatedAt: string
}

// ── Wuduh tables ───────────────────────────────────────────────────────────

export interface Profile {
  id: string
  fullName: string | null
  preferredLanguage: Language | null
  createdAt: string
  updatedAt: string
}

export interface Study {
  id: string
  userId: string
  startupName: string | null
  language: Language
  status: StudyStatus
  logoUrl: string | null
  completionPercentage: number
  createdAt: string
  updatedAt: string
}

export interface Answer {
  id: string
  studyId: string
  cardId: string
  answer: unknown // JSONB — string, array, or null depending on card type
  status: AnswerStatus
  createdAt: string
  updatedAt: string
}

export interface Export {
  id: string
  studyId: string
  userId: string
  pdfUrl: string | null
  language: Language
  completionSnapshot: number
  createdAt: string
}
