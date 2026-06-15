// PDF template builder — takes study data and produces a complete HTML string
// that Puppeteer renders into a PDF.

import { ALL_CARDS, SECTIONS } from '@/lib/cards/loader'
import type { Language } from '@/types/cards'

interface AnswerMap {
  [cardId: string]: {
    answer: unknown
    status: 'done' | 'skipped'
  }
}

interface StudyData {
  startup_name: string | null
  founder_name: string | null
  logo_url: string | null
  language: Language
  completion_percentage: number
  answers: AnswerMap
}

function esc(s: unknown): string {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function answer(answers: AnswerMap, cardId: string): string {
  const a = answers[cardId]
  if (!a || a.status === 'skipped' || !a.answer) return ''
  return esc(a.answer)
}

function rawAnswer(answers: AnswerMap, cardId: string): string {
  const a = answers[cardId]
  if (!a || a.status === 'skipped' || !a.answer) return ''
  return String(a.answer)
}

function tableRows(answers: AnswerMap, cardId: string): Record<string, string>[] {
  const a = answers[cardId]
  if (!a || !Array.isArray(a.answer)) return []
  return a.answer as Record<string, string>[]
}

function isSkipped(answers: AnswerMap, cardId: string): boolean {
  const a = answers[cardId]
  return !a || a.status === 'skipped' || !a.answer
}

function skippedMandatoryInSection(answers: AnswerMap, sectionId: string): string[] {
  return ALL_CARDS
    .filter(c => c.section === sectionId && c.required && isSkipped(answers, c.id))
    .map(c => c.id)
}

function disclaimer(lang: Language, cardIds: string[]): string {
  if (cardIds.length === 0) return ''
  const label = lang === 'ar' ? '⚠ قسم غير مكتمل' : '⚠ Incomplete section'
  const text  = lang === 'ar'
    ? `لم تكتمل ${cardIds.length} بطاقة/بطاقات في هذا القسم. تعكس هذه الدراسة إجابات جزئية فقط.`
    : `${cardIds.length} card(s) in this section were not completed. This section reflects partial answers only. Address these gaps before a final investor submission.`
  return `<div class="disclaimer"><div class="disclaimer-label">${esc(label)}</div><div class="disclaimer-text">${esc(text)}</div></div>`
}

function pageFooter(lang: Language, startupName: string, pageNum: number): string {
  const date = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const meta = lang === 'ar'
    ? `${esc(startupName)} · دراسة جدوى · ${date}`
    : `${esc(startupName)} · Feasibility Study · ${date}`
  return `
  <div class="page-footer">
    <div class="pf-brand">
      <svg width="14" height="14" viewBox="0 0 96 96" fill="none">
        <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C"/>
        <path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81" stroke="#0D1B2A" stroke-width="7.8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      </svg>
      <span class="pf-brand-name">Wuduh</span>
    </div>
    <span class="pf-meta">${meta}</span>
    <span class="pf-page">${lang === 'ar' ? `صفحة ${pageNum}` : `Page ${pageNum}`}</span>
  </div>`
}

function sectionHeader(num: string, title: string, label: string): string {
  return `
  <div class="section-header">
    <div><div class="section-num">${esc(num)}</div><div class="section-title">${esc(title)}</div></div>
    <span class="section-page-label">${esc(label)}</span>
  </div>`
}

function qa(label: string, value: string): string {
  if (!value) return ''
  return `<div class="content-q">${esc(label)}</div><div class="content-a">${value}</div><div class="content-divider"></div>`
}

function patternBg(id: string): string {
  return `<svg class="page-net" viewBox="0 0 860 600" preserveAspectRatio="xMidYMid slice">
    <defs><pattern id="${id}" width="64" height="64" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="#0D1B2A" stroke-width="1" stroke-opacity="0.08">
        <rect x="16" y="16" width="32" height="32"/>
        <rect x="22.6" y="22.6" width="32" height="32" transform="rotate(45 32 32)" stroke-opacity="0.05"/>
      </g>
    </pattern></defs>
    <rect width="100%" height="100%" fill="url(#${id})"/>
  </svg>`
}

function renderCover(data: StudyData): string {
  const { language: lang, answers } = data
  const date        = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const startupName = rawAnswer(answers, 'C2') || data.startup_name || (lang === 'ar' ? 'دراسة جدوى' : 'Feasibility Study')
  const founderName = rawAnswer(answers, 'C3') || data.founder_name || '—'
  const stage       = rawAnswer(answers, '2.5') || (lang === 'ar' ? 'مبكرة' : 'Early stage')
  const logoUrl     = rawAnswer(answers, 'C1') || data.logo_url
  const dir         = lang === 'ar' ? 'rtl' : 'ltr'

  const L = {
    byline:    lang === 'ar' ? 'مؤسس · المملكة العربية السعودية' : 'Founder · Saudi Arabia',
    subtitle:  lang === 'ar' ? 'دراسة جدوى منظمة مبنية على بيانات المؤسس وأبحاثه.' : "A structured feasibility study built from the founder's own data and research.",
    startup:   lang === 'ar' ? 'الشركة الناشئة' : 'Startup',
    market:    lang === 'ar' ? 'السوق'          : 'Market',
    marketVal: lang === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia',
    stage:     lang === 'ar' ? 'المرحلة'         : 'Stage',
    by:        lang === 'ar' ? 'أعدّه'           : 'Prepared by',
    date:      lang === 'ar' ? 'التاريخ'          : 'Date',
    lang:      lang === 'ar' ? 'اللغة'           : 'Language',
    langVal:   lang === 'ar' ? 'العربية'         : 'English',
    docType:   lang === 'ar' ? `دراسة جدوى<br>مُعدَّة ${date}` : `Feasibility Study<br>Prepared ${date}`,
    logoPlaceholder: lang === 'ar' ? 'الشعار' : 'Logo',
  }

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="Logo" style="width:76px;height:76px;object-fit:contain;border-radius:10px;display:block;margin-bottom:32px;">`
    : `<div class="cover-logo-slot"><span class="cover-logo-placeholder">${L.logoPlaceholder}</span></div>`

  return `
  <div class="page cover">
    <div class="cover-header">
      <svg class="cover-header-net" viewBox="0 0 860 210" preserveAspectRatio="xMidYMid slice">
        <defs><pattern id="chn" width="64" height="64" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#C9A84C" stroke-width="1" stroke-opacity="0.45">
            <rect x="16" y="16" width="32" height="32"/>
            <rect x="22.6" y="22.6" width="32" height="32" transform="rotate(45 32 32)" stroke-opacity="0.28"/>
            <path d="M32 0L32 16M32 48L32 64M0 32L16 32M48 32L64 32" stroke-opacity="0.3"/>
          </g>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#chn)"/>
      </svg>
      <div class="cover-header-inner">
        <div class="cover-brand">
          <svg width="36" height="36" viewBox="0 0 96 96" fill="none">
            <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C"/>
            <path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81" stroke="#AEC6D9" stroke-width="7.8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
          </svg>
          <span class="cover-brand-name">Wuduh</span>
        </div>
        <div class="cover-doc-type">${L.docType}</div>
      </div>
    </div>

    <div class="cover-body">
      <div class="cover-content">
        ${logoHtml}
        <p class="cover-eyebrow">${esc(founderName)} &middot; ${L.byline}</p>
        <h1 class="cover-title">${esc(startupName)}</h1>
        <p class="cover-subtitle">${L.subtitle}</p>
        <div class="cover-rule"></div>
      </div>
      <div class="cover-meta">
        <div><div class="cover-meta-label">${L.startup}</div><div class="cover-meta-value">${esc(startupName)}</div></div>
        <div><div class="cover-meta-label">${L.market}</div><div class="cover-meta-value">${L.marketVal}</div></div>
        <div><div class="cover-meta-label">${L.stage}</div><div class="cover-meta-value">${esc(stage.substring(0, 40))}</div></div>
        <div><div class="cover-meta-label">${L.by}</div><div class="cover-meta-value">${esc(founderName)}</div></div>
        <div><div class="cover-meta-label">${L.date}</div><div class="cover-meta-value">${esc(date)}</div></div>
        <div><div class="cover-meta-label">${L.lang}</div><div class="cover-meta-value">${L.langVal}</div></div>
      </div>
    </div>

    ${pageFooter(lang, startupName, 1)}
  </div>`
}

function renderSection(data: StudyData, sectionId: string, pageNum: number, content: string): string {
  const { language: lang, answers } = data
  const startupName = rawAnswer(answers, 'C2') || data.startup_name || 'Wuduh'
  const section     = SECTIONS.find(s => s.id === sectionId)
  if (!section) return ''
  const numStr    = `${String(section.order).padStart(2, '0')} — ${section[lang].label}`
  const pageLabel = `${esc(startupName)} · ${new Date().getFullYear()}`
  const skipped   = skippedMandatoryInSection(answers, sectionId)

  return `
  <div class="page section-page">
    ${patternBg('pn' + sectionId)}
    ${sectionHeader(numStr, section[lang].label, pageLabel)}
    <div class="section-body">
      ${content}
      ${disclaimer(lang, skipped)}
    </div>
    ${pageFooter(lang, startupName, pageNum)}
  </div>`
}

function renderCompetitorTable(rows: Record<string, string>[], lang: Language): string {
  if (!rows.length) return ''
  const [h1, h2, h3] = lang === 'ar'
    ? ['المنافس', 'ما يفعلونه جيداً', 'أين يقصّرون']
    : ['Competitor', 'What they do well', 'Where they fall short']
  return `<table class="comp-table">
    <thead><tr><th style="width:22%">${h1}</th><th style="width:38%">${h2}</th><th style="width:40%">${h3}</th></tr></thead>
    <tbody>${rows.map(r => `<tr><td><strong>${esc(r.competitor)}</strong></td><td>${esc(r.strength)}</td><td>${esc(r.weakness)}</td></tr>`).join('')}</tbody>
  </table>`
}

function renderTeamTable(rows: Record<string, string>[], lang: Language): string {
  if (!rows.length) return ''
  const [h1, h2, h3] = lang === 'ar'
    ? ['الاسم', 'الدور', 'الخلفية']
    : ['Name', 'Role', 'Background']
  return `<table class="comp-table">
    <thead><tr><th style="width:25%">${h1}</th><th style="width:25%">${h2}</th><th style="width:50%">${h3}</th></tr></thead>
    <tbody>${rows.map(r => `<tr><td><strong>${esc(r.name)}</strong></td><td>${esc(r.role)}</td><td>${esc(r.background)}</td></tr>`).join('')}</tbody>
  </table>`
}

function renderRiskTable(rows: Record<string, string>[], lang: Language): string {
  if (!rows.length) return ''
  const [h1, h2, h3] = lang === 'ar'
    ? ['الخطر', 'الاحتمالية', 'خطة التخفيف']
    : ['Risk', 'Likelihood', 'Mitigation plan']
  const pill = (l: string) => {
    if (!l) return 'risk-pill risk-med'
    const lo = l.toLowerCase()
    if (['high', 'عالٍ', 'عالي'].includes(lo)) return 'risk-pill risk-high'
    if (['low',  'منخفض'].includes(lo))        return 'risk-pill risk-low'
    return 'risk-pill risk-med'
  }
  return `<table class="risk-table">
    <thead><tr><th style="width:35%">${h1}</th><th style="width:15%">${h2}</th><th style="width:50%">${h3}</th></tr></thead>
    <tbody>${rows.map(r => `<tr><td>${esc(r.risk)}</td><td><span class="${pill(r.likelihood)}">${esc(r.likelihood)}</span></td><td>${esc(r.mitigation)}</td></tr>`).join('')}</tbody>
  </table>`
}

export function buildPdfHtml(data: StudyData): string {
  const { language: lang, answers } = data
  const dir      = lang === 'ar' ? 'rtl' : 'ltr'
  const bodyFont = lang === 'ar' ? `'IBM Plex Sans Arabic','IBM Plex Sans',sans-serif` : `'IBM Plex Sans',sans-serif`
  const fontUrl  = lang === 'ar'
    ? `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap`
    : `https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap`

  const cq = (l: string) => `<div class="content-q">${l}</div>`
  const cd  = `<div class="content-divider"></div>`

  const compRows = tableRows(answers, '5.1')
  const teamRows = tableRows(answers, '7.1')
  const riskRows = tableRows(answers, '8.1')

  const s1 = renderSection(data, 's1', 2, [
    qa(lang === 'ar' ? 'نظرة عامة' : 'Project overview', answer(answers, '1.1')),
    qa(lang === 'ar' ? 'المشكلة'   : 'The problem',      answer(answers, '1.2')),
    qa(lang === 'ar' ? 'من يعاني' : 'Who experiences it', answer(answers, '1.3')),
    qa(lang === 'ar' ? 'الحل اليوم' : 'How they solve it today', answer(answers, '1.4')),
    qa(lang === 'ar' ? 'لماذا تفشل الحلول' : 'Why current solutions fail', answer(answers, '1.5')),
    qa(lang === 'ar' ? 'حجم المشكلة' : 'Scale of the problem', answer(answers, '1.6')),
    qa(lang === 'ar' ? 'ما الذي دفعك' : 'What triggered this', answer(answers, '1.7')),
  ].join(''))

  const s2 = renderSection(data, 's2', 3, [
    qa(lang === 'ar' ? 'الحل في جملة' : 'The solution in one sentence', answer(answers, '2.1')),
    qa(lang === 'ar' ? 'كيف يعمل' : 'How it works', answer(answers, '2.2')),
    qa(lang === 'ar' ? 'ما يجعله مختلفاً' : 'What makes it different', answer(answers, '2.3')),
    qa(lang === 'ar' ? 'عرض القيمة' : 'Core value proposition', answer(answers, '2.4')),
    qa(lang === 'ar' ? 'المرحلة' : 'Stage', answer(answers, '2.5')),
    qa(lang === 'ar' ? 'الميزات الرئيسية' : 'Key features', answer(answers, '2.6')),
    qa(lang === 'ar' ? 'ما لا يفعله' : 'What it does not do', answer(answers, '2.7')),
  ].join(''))

  const s3 = renderSection(data, 's3', 4, [
    qa(lang === 'ar' ? 'العميل المستهدف' : 'Target customer', answer(answers, '3.1')),
    qa(lang === 'ar' ? 'حجم السوق' : 'Market size (TAM / SAM / SOM)', answer(answers, '3.2')),
    qa(lang === 'ar' ? 'الموقع الجغرافي' : 'Geography', answer(answers, '3.3')),
    qa(lang === 'ar' ? 'خصائص العميل' : 'Customer characteristics', answer(answers, '3.4')),
    qa(lang === 'ar' ? 'الشخصية' : 'Persona', answer(answers, '3.5')),
    qa(lang === 'ar' ? 'التحقق' : 'Customer validation', answer(answers, '3.6')),
  ].join(''))

  const s4 = renderSection(data, 's4', 5, [
    qa(lang === 'ar' ? 'آلية الإيرادات' : 'Revenue mechanism', answer(answers, '4.1')),
    qa(lang === 'ar' ? 'نموذج التسعير' : 'Pricing model', answer(answers, '4.2')),
    qa(lang === 'ar' ? 'السعر للعميل' : 'Price per customer', answer(answers, '4.3')),
    qa(lang === 'ar' ? 'التكاليف' : 'Main costs', answer(answers, '4.4')),
    qa(lang === 'ar' ? 'الإيرادات الحالية' : 'Existing revenue', answer(answers, '4.5')),
  ].join(''))

  const s5 = renderSection(data, 's5', 6, [
    cq(lang === 'ar' ? 'تحليل المنافسين' : 'Competitor analysis'),
    renderCompetitorTable(compRows, lang),
    compRows.length ? cd : '',
    qa(lang === 'ar' ? 'الميزة غير العادلة' : 'Unfair advantage', answer(answers, '5.4')),
    qa(lang === 'ar' ? 'لماذا الآن' : 'Why now', answer(answers, '5.5')),
  ].join(''))

  const s6 = renderSection(data, 's6', 7, [
    qa(lang === 'ar' ? 'أول 100 عميل' : 'First 100 customers', answer(answers, '6.1')),
    qa(lang === 'ar' ? 'قنوات التسويق' : 'Marketing channels', answer(answers, '6.2')),
    qa(lang === 'ar' ? 'استراتيجية المبيعات' : 'Sales strategy', answer(answers, '6.3')),
    qa(lang === 'ar' ? 'خطة السنة الأولى' : 'Year 1 acquisition plan', answer(answers, '6.4')),
    qa(lang === 'ar' ? 'قوة الدفع' : 'Early traction', answer(answers, '6.5')),
    qa(lang === 'ar' ? 'الشراكات' : 'Partnerships', answer(answers, '6.6')),
  ].join(''))

  const s7 = renderSection(data, 's7', 8, [
    cq(lang === 'ar' ? 'الفريق' : 'The team'),
    renderTeamTable(teamRows, lang),
    teamRows.length ? cd : '',
    qa(lang === 'ar' ? 'لماذا هذا الفريق' : 'Why this team', answer(answers, '7.2')),
    qa(lang === 'ar' ? 'المهارات المتوفرة' : 'Skills we have', answer(answers, '7.3')),
    qa(lang === 'ar' ? 'المهارات المفقودة' : 'Skills we need', answer(answers, '7.4')),
    qa(lang === 'ar' ? 'المستشارون' : 'Advisors', answer(answers, '7.5')),
    qa(lang === 'ar' ? 'أول توظيف' : 'First hires', answer(answers, '7.6')),
  ].join(''))

  const s8 = renderSection(data, 's8', 9, [
    cq(lang === 'ar' ? 'تقييم المخاطر' : 'Risk assessment'),
    renderRiskTable(riskRows, lang),
    riskRows.length ? cd : '',
    qa(lang === 'ar' ? 'ما الذي قد يقتل هذا' : 'What could kill this in year 1', answer(answers, '8.2')),
    qa(lang === 'ar' ? 'خطة التخفيف' : 'Risk mitigations', answer(answers, '8.3')),
    qa(lang === 'ar' ? 'الافتراضات الأساسية' : 'Key assumptions', answer(answers, '8.4')),
    qa(lang === 'ar' ? 'الرهان الأساسي' : 'The single most important assumption', answer(answers, '8.7')),
    qa(lang === 'ar' ? 'الخطة البديلة' : 'Plan B', answer(answers, '8.5')),
    qa(lang === 'ar' ? 'المخاطر التنظيمية' : 'Regulatory risks', answer(answers, '8.6')),
  ].join(''))

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8">
<title>${esc(rawAnswer(answers, 'C2') || data.startup_name || 'Wuduh')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="${fontUrl}" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --navy-900:#0D1B2A;--gold-500:#C9A84C;--gold-600:#A6852F;--gold-700:#8A6F26;
  --gold-100:#F6EEDB;--teal-100:#D8F1EE;--teal-700:#0A6E66;
  --slate-400:#8795A6;--slate-500:#647183;--slate-600:#4A5666;--slate-700:#36404D;
  --navy-300:#7BA0BF;
  --paper:#FAF7F0;--paper-line:#EAE3D2;
  --fd:'IBM Plex Serif',serif;--fs:${bodyFont};--fm:'IBM Plex Mono',monospace;
}
body{font-family:var(--fs);background:var(--paper);margin:0;padding:0}

/* PAGE */
.page{background:var(--paper);width:210mm;position:relative;overflow:hidden;page-break-after:always}
.page:last-child{page-break-after:auto}
.page-net{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}

/* COVER — fills full A4 height, meta grid pinned to bottom */
.cover{display:flex;flex-direction:column;min-height:297mm}
.cover-header{background:var(--navy-900);padding:36px 56px 40px;position:relative;overflow:hidden;flex-shrink:0}
.cover-header-net{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0.35}
.cover-header-inner{position:relative;display:flex;align-items:flex-start;justify-content:space-between}
.cover-brand{display:flex;align-items:center;gap:12px}
.cover-brand-name{font-family:var(--fd);font-size:20px;font-weight:600;color:#fff;letter-spacing:-0.01em}
.cover-doc-type{font-family:var(--fm);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--navy-300);margin-top:14px;text-align:${dir === 'rtl' ? 'left' : 'right'}}
/* cover-body grows to fill remaining A4 height and spaces content / meta at top / bottom */
.cover-body{padding:44px 56px 48px;flex:1;display:flex;flex-direction:column;justify-content:space-between}
.cover-logo-slot{width:76px;height:76px;border-radius:14px;border:2px dashed var(--paper-line);display:flex;align-items:center;justify-content:center;margin-bottom:32px}
.cover-logo-placeholder{font-family:var(--fm);font-size:9px;letter-spacing:0.08em;text-transform:uppercase;color:var(--slate-400)}
.cover-eyebrow{font-family:var(--fm);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--gold-600);margin-bottom:10px}
.cover-title{font-family:var(--fd);font-size:36px;font-weight:600;line-height:1.12;letter-spacing:-0.02em;color:var(--navy-900);margin-bottom:6px;max-width:520px}
.cover-subtitle{font-family:var(--fd);font-style:italic;font-size:17px;color:var(--slate-500);line-height:1.4;max-width:460px}
.cover-rule{width:56px;height:3px;background:var(--gold-500);border-radius:99px;margin:20px 0 0}
.cover-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding-top:28px;border-top:1px solid var(--paper-line)}
.cover-meta-label{font-family:var(--fm);font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:var(--slate-400);margin-bottom:4px}
.cover-meta-value{font-family:var(--fs);font-size:13px;font-weight:500;color:var(--navy-900)}

/* SECTIONS */
.section-page{border-top:3px solid var(--paper-line)}
.section-header{padding:28px 56px 22px;display:flex;align-items:flex-end;justify-content:space-between;border-bottom:1px solid var(--paper-line)}
.section-num{font-family:var(--fm);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold-600);margin-bottom:6px}
.section-title{font-family:var(--fd);font-size:23px;font-weight:500;letter-spacing:-0.015em;color:var(--navy-900)}
.section-page-label{font-family:var(--fm);font-size:9px;letter-spacing:0.08em;text-transform:uppercase;color:var(--slate-400)}
.section-body{padding:26px 56px 36px}

/* CONTENT */
.content-q{font-family:var(--fm);font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:var(--slate-400);margin-bottom:6px;margin-top:20px}
.content-q:first-child{margin-top:0}
.content-a{font-family:var(--fs);font-size:13.5px;line-height:1.7;color:var(--slate-700)}
.content-divider{height:1px;background:var(--paper-line);margin:20px 0}

/* TABLES */
.comp-table,.risk-table{width:100%;border-collapse:collapse;margin-top:8px}
.comp-table th,.risk-table th{font-family:var(--fm);font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:var(--slate-400);padding:8px 12px;text-align:${dir === 'rtl' ? 'right' : 'left'};border-bottom:1.5px solid var(--navy-900)}
.comp-table td,.risk-table td{font-family:var(--fs);font-size:12.5px;color:var(--slate-700);padding:9px 12px;border-bottom:1px solid var(--paper-line);vertical-align:top;line-height:1.55}
.comp-table tr:last-child td,.risk-table tr:last-child td{border-bottom:none}
.comp-table tr:nth-child(even) td{background:rgba(234,227,210,0.3)}
.risk-pill{font-family:var(--fm);font-size:9px;letter-spacing:0.06em;text-transform:uppercase;padding:2px 8px;border-radius:99px;font-weight:500}
.risk-high{background:#F6E0DA;color:#A53D27}
.risk-med{background:#F8ECCE;color:#B4811E}
.risk-low{background:var(--teal-100);color:var(--teal-700)}

/* DISCLAIMER */
.disclaimer{margin:20px 0 0;padding:13px 18px;border-${dir === 'rtl' ? 'right' : 'left'}:3px solid var(--gold-500);background:var(--gold-100);border-radius:${dir === 'rtl' ? '8px 0 0 8px' : '0 8px 8px 0'}}
.disclaimer-label{font-family:var(--fm);font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold-700);margin-bottom:5px}
.disclaimer-text{font-size:13px;color:var(--slate-600);line-height:1.6}

/* FOOTER */
.page-footer{padding:13px 56px;border-top:1px solid var(--paper-line);display:flex;align-items:center;justify-content:space-between}
.pf-brand{display:flex;align-items:center;gap:7px}
.pf-brand-name{font-family:var(--fd);font-weight:600;font-size:12px;color:var(--navy-900)}
.pf-meta{font-family:var(--fm);font-size:9px;letter-spacing:0.08em;text-transform:uppercase;color:var(--slate-400)}
.pf-page{font-family:var(--fm);font-size:9px;letter-spacing:0.06em;color:var(--slate-400)}
</style>
</head>
<body>
  ${renderCover(data)}
  ${s1}${s2}${s3}${s4}${s5}${s6}${s7}${s8}
</body>
</html>`
}
