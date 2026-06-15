import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a date as "15 Jun 2026" */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

/** Calculate completion percentage from mandatory cards answered vs total mandatory */
export function calcCompletion(done: number, total: number): number {
  if (total === 0) return 0
  return Math.round((done / total) * 100)
}
