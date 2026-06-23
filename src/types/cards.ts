// Types for wuduh-cards.json — the single source of truth for all card content

export type CardType = 'lang' | 'upload' | 'text' | 'table'
export type Language = 'en' | 'ar'

export interface CardLocalised {
  category: string
  prompt: string
  helper: string
  hint: string
  example: string | null
}

export type ColumnType = 'text' | 'number' | 'select' | 'auto_calculate'

export interface TableColumn {
  key: string
  en: string
  ar: string
  width_pct: number
  // optional extended fields
  type?: ColumnType
  placeholder_en?: string
  placeholder_ar?: string
  options_en?: string[]
  options_ar?: string[]
  prefilled?: boolean
  auto_calculate?: boolean
  formula?: string
  source_card?: string
  default?: number | string
}

export interface UploadConfig {
  accept: string
  max_mb: number
  preview: boolean
  max_files?: number
}

export interface LangOption {
  value: Language
  label_en: string
  label_ar: string
  dir: 'ltr' | 'rtl'
}

export interface CardConfig {
  id: string
  section: string
  order: number
  type: CardType
  required: boolean
  export_visible: boolean
  export_placement?: string
  max_length?: number | null
  en: CardLocalised
  ar: CardLocalised
  // type-specific fields
  options?: LangOption[]            // lang cards
  upload_config?: UploadConfig      // upload cards
  table_columns?: TableColumn[]     // table cards
  max_rows?: number                 // table cards
  fixed_rows?: number               // table cards — fixed row count, no add/delete
  likelihood_options?: { en: string[]; ar: string[] }  // risk table (legacy — use column type:select instead)
}

export interface SectionConfig {
  id: string
  order: number
  en: { label: string }
  ar: { label: string }
}

export interface CardsData {
  _meta: {
    total_cards: number
    mandatory_cards: number
    optional_cards: number
  }
  sections: SectionConfig[]
  cards: CardConfig[]
}
