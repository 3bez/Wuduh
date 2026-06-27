// Bilingual API error messages.
// Usage: apiError('unauthorized', lang) → translated string

import type { Language } from '@/types/cards'

const errors: Record<string, Record<Language, string>> = {
  unauthorized:          { en: 'Unauthorized',                                    ar: 'غير مصرّح' },
  not_found:             { en: 'Not found',                                       ar: 'غير موجود' },
  study_not_found:       { en: 'Study not found',                                 ar: 'الدراسة غير موجودة' },
  failed_create_study:   { en: 'Failed to create study',                          ar: 'تعذّر إنشاء الدراسة' },
  card_status_required:  { en: 'card_id and status are required',                 ar: 'معرّف البطاقة والحالة مطلوبان' },
  pdf_failed:            { en: 'PDF generation failed',                           ar: 'تعذّر إنشاء ملف PDF' },
  no_file:               { en: 'No file provided',                                ar: 'لم يتم تقديم ملف' },
  study_id_required:     { en: 'studyId is required',                             ar: 'معرّف الدراسة مطلوب' },
  upload_failed:         { en: 'Upload failed',                                   ar: 'تعذّر الرفع' },
  // Contact form
  all_fields_required:   { en: 'All fields are required.',                        ar: 'جميع الحقول مطلوبة.' },
  invalid_email:         { en: 'Invalid email address.',                          ar: 'عنوان بريد إلكتروني غير صالح.' },
  message_too_short:     { en: 'Message is too short.',                           ar: 'الرسالة قصيرة جدًا.' },
  email_not_configured:  { en: 'Email service not configured.',                   ar: 'خدمة البريد غير مهيّأة.' },
  send_failed:           { en: 'Failed to send message. Please try again.',       ar: 'تعذّر إرسال الرسالة. الرجاء المحاولة مرة أخرى.' },
}

/** Get a translated error message. Falls back to English if key is unknown. */
export function apiError(key: string, lang: Language = 'en'): string {
  return errors[key]?.[lang] ?? errors[key]?.en ?? key
}

/** Detect language from Accept-Language header. */
export function langFromHeaders(headers: Headers): Language {
  const accept = headers.get('accept-language') ?? ''
  return accept.toLowerCase().includes('ar') ? 'ar' : 'en'
}
