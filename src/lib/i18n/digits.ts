// Convert Western (ASCII) digits to Arabic-Indic digits for display in Arabic UI.
// UI-only helper — never used for parsing or storage.

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

/** Replace 0-9 in a string/number with Arabic-Indic numerals. */
export function toArabicDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, d => ARABIC_DIGITS[Number(d)])
}

/** Apply Arabic-Indic digits only when locale is 'ar'; otherwise pass through. */
export function localizeDigits(input: string | number, locale: 'en' | 'ar'): string {
  return locale === 'ar' ? toArabicDigits(input) : String(input)
}
