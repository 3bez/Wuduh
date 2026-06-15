// Supabase database types — mirrors the schema in BRD Section 4

export type Language = 'en' | 'ar'
export type StudyStatus = 'draft' | 'complete' | 'exported'
export type AnswerStatus = 'done' | 'skipped'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          preferred_language: Language | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          preferred_language?: Language | null
        }
        Update: {
          full_name?: string | null
          preferred_language?: Language | null
          updated_at?: string
        }
      }
      studies: {
        Row: {
          id: string
          user_id: string
          startup_name: string | null
          language: Language
          status: StudyStatus
          logo_url: string | null
          completion_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          startup_name?: string | null
          language: Language
          status?: StudyStatus
          logo_url?: string | null
          completion_percentage?: number
        }
        Update: {
          startup_name?: string | null
          language?: Language
          status?: StudyStatus
          logo_url?: string | null
          completion_percentage?: number
          updated_at?: string
        }
      }
      answers: {
        Row: {
          id: string
          study_id: string
          card_id: string
          answer: unknown
          status: AnswerStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          study_id: string
          card_id: string
          answer?: unknown
          status?: AnswerStatus
        }
        Update: {
          answer?: unknown
          status?: AnswerStatus
          updated_at?: string
        }
      }
      exports: {
        Row: {
          id: string
          study_id: string
          user_id: string
          pdf_url: string | null
          language: Language
          completion_snapshot: number
          created_at: string
        }
        Insert: {
          id?: string
          study_id: string
          user_id: string
          pdf_url?: string | null
          language: Language
          completion_snapshot?: number
        }
        Update: {
          pdf_url?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      language: Language
      study_status: StudyStatus
      answer_status: AnswerStatus
    }
  }
}

// Answer JSONB types
export type AnswerValue = string | TableRow[] | null

export interface TableRow {
  [column: string]: string
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Study   = Database['public']['Tables']['studies']['Row']
export type Answer  = Database['public']['Tables']['answers']['Row']
export type Export  = Database['public']['Tables']['exports']['Row']
