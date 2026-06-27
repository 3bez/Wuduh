// UI copy for the authenticated dashboard shell, in both languages.
// The per-study language badge (EN / عربي) is NOT from here — it reflects each
// study's own chosen language and stays as-is.

import type { Language } from '@/types/cards'

export interface DashboardDict {
  brandWordmark: string
  eyebrow: string
  welcome: (name: string) => string
  founderFallback: string
  subHasStudies: string
  subEmpty: string
  newStudy: string
  // Study card
  statusComplete: string
  statusNotStarted: string
  statusInProgress: string
  updated: (date: string) => string
  progress: string
  review: string
  continue: string
  exportPdf: string
  // New-study card
  newStudyCardTitle: string
  newStudyCardSub: string
  // Empty state
  emptyTitle: string
  emptyBody: string
  emptyStats: { num: string; label: string }[]
  emptyCta: string
  // Shared header controls
  signOut: string
  // Rename
  untitledStudy: string
  renameTooltip: string
}

const en: DashboardDict = {
  brandWordmark: 'وضوح',
  eyebrow: 'Dashboard',
  welcome: name => `Welcome back, ${name}`,
  founderFallback: 'Founder',
  subHasStudies: 'Continue where you left off, or start a new study.',
  subEmpty: "Let's build your first feasibility study.",
  newStudy: 'New study',
  statusComplete: 'Complete',
  statusNotStarted: 'Not started',
  statusInProgress: 'In progress',
  updated: date => `Updated ${date}`,
  progress: 'Progress',
  review: 'Review',
  continue: 'Continue',
  exportPdf: 'Export PDF',
  newStudyCardTitle: 'New study',
  newStudyCardSub: 'Arabic or English',
  emptyTitle: 'Your first study starts here',
  emptyBody:
    "Answer one card at a time. When you're done, Wuduh assembles your answers into a feasibility study you'll be proud to send to investors.",
  emptyStats: [
    { num: '52', label: 'cards' },
    { num: '8', label: 'sections' },
    { num: '2', label: 'languages' },
  ],
  emptyCta: 'Start your first study',
  signOut: 'Sign out',
  untitledStudy: 'Untitled study',
  renameTooltip: 'Click to rename',
}

const ar: DashboardDict = {
  brandWordmark: 'وضوح',
  eyebrow: 'لوحة التحكم',
  welcome: name => `أهلًا بعودتك، ${name}`,
  founderFallback: 'مؤسس',
  subHasStudies: 'واصل من حيث توقفت، أو ابدأ دراسة جديدة.',
  subEmpty: 'لنبنِ أول دراسة جدوى لك.',
  newStudy: 'دراسة جديدة',
  statusComplete: 'مكتملة',
  statusNotStarted: 'لم تبدأ',
  statusInProgress: 'قيد الإنجاز',
  updated: date => `آخر تحديث ${date}`,
  progress: 'التقدّم',
  review: 'مراجعة',
  continue: 'متابعة',
  exportPdf: 'تصدير PDF',
  newStudyCardTitle: 'دراسة جديدة',
  newStudyCardSub: 'عربي أو إنجليزي',
  emptyTitle: 'دراستك الأولى تبدأ من هنا',
  emptyBody:
    'أجب عن بطاقة واحدة كل مرة. وعند الانتهاء، يجمع وضوح إجاباتك في دراسة جدوى تفخر بإرسالها للمستثمرين.',
  emptyStats: [
    { num: '52', label: 'بطاقة' },
    { num: '8', label: 'أقسام' },
    { num: '2', label: 'لغتان' },
  ],
  emptyCta: 'ابدأ دراستك الأولى',
  signOut: 'تسجيل الخروج',
  untitledStudy: 'دراسة بلا عنوان',
  renameTooltip: 'انقر لإعادة التسمية',
}

export const dashboardCopy: Record<Language, DashboardDict> = { en, ar }
