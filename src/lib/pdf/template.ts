// PDF template builder — takes study data and produces a complete HTML string
// that Puppeteer renders into a PDF.

import { ALL_CARDS, SECTIONS } from '@/lib/cards/loader'
import type { Language } from '@/types/cards'
import { runProjections, type ProjectionResult } from '@/lib/projections/engine'

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

// Footer rendered by PDFShift on EVERY page (page numbers via {{page}}/{{total}}).
// Pulled out of the page flow so short sections can't spawn blank footer-only pages.
// NOTE: external fonts don't load inside PDFShift footers, so use system fallbacks here.
export function buildPdfFooter(lang: Language, startupName: string): string {
  const isAr = lang === 'ar'
  const dir  = isAr ? 'rtl' : 'ltr'
  const date = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const meta = isAr
    ? `${esc(startupName)} · دراسة جدوى · ${date}`
    : `${esc(startupName)} · Feasibility Study · ${date}`
  const pageLabel = isAr ? 'صفحة {{page}} / {{total}}' : 'Page {{page}} / {{total}}'
  const logoSvg = `<svg width="12" height="12" viewBox="0 0 96 96" fill="none" style="vertical-align:middle"><path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C"/><path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81" stroke="#0D1B2A" stroke-width="7.8" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg>`
  return `<div style="box-sizing:border-box;width:100%;height:100%;direction:${dir};display:flex;align-items:center;justify-content:space-between;padding:6px 56px 0;border-top:1px solid #EAE3D2;font-family:'Courier New',monospace;color:#8795A6;font-size:8px;letter-spacing:0.08em">
  <span style="display:flex;align-items:center;gap:6px;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:11px;color:#0D1B2A;letter-spacing:0">${logoSvg}<span>Wuduh</span></span>
  <span style="text-transform:uppercase">${meta}</span>
  <span>${pageLabel}</span>
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
  return `<div class="qa-block"><div class="content-q">${esc(label)}</div><div class="content-a">${value}</div></div><div class="content-divider"></div>`
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

// ── Projections SVG chart (server-side, no canvas, no client JS) ────────────

const SVG_W    = 560
const SVG_H    = 300
const SVG_PL   = 58   // left padding (Y axis labels)
const SVG_PR   = 12
const SVG_PT   = 12
const SVG_PB   = 30   // bottom padding (X axis labels)
const PLOT_W   = SVG_W - SVG_PL - SVG_PR
const PLOT_H   = SVG_H - SVG_PT - SVG_PB

function pdfFormatSar(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(Math.round(n))
}

function pdfToX(i: number): number {
  return SVG_PL + (i / 11) * PLOT_W
}

function buildProjectionSvg(result: ProjectionResult, lang: Language): string {
  const isAr  = lang === 'ar'
  const { months } = result

  const allVals = [
    ...months.map(m => m.revenue),
    ...months.map(m => m.totalCosts),
    ...(result.initialCash !== null ? months.map(m => m.cashBalance) : []),
    0,
  ]
  const maxVal  = Math.max(...allVals)
  const minVal  = Math.min(...allVals, ...months.map(m => m.cumulativeProfit))
  const ySpan   = (maxVal - minVal) || 1
  const yPadded = ySpan * 1.1
  const yTop    = maxVal + ySpan * 0.05

  function toY(v: number): number {
    return SVG_PT + PLOT_H - ((v - (yTop - yPadded)) / yPadded) * PLOT_H
  }

  const baseY = toY(0)

  function points(vals: number[]): string {
    return vals.map((v, i) => `${pdfToX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ')
  }

  function areaPoints(vals: number[]): string {
    const line = vals.map((v, i) => `${pdfToX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ')
    const last = pdfToX(11).toFixed(1)
    const first = pdfToX(0).toFixed(1)
    return `${line} ${last},${baseY.toFixed(1)} ${first},${baseY.toFixed(1)}`
  }

  // Y axis ticks
  const tickStep = Math.ceil(yPadded / 4 / 1000) * 1000 || 100
  const yTicks: number[] = []
  for (let v = 0; v <= maxVal + tickStep; v += tickStep) yTicks.push(v)
  if (minVal < 0) for (let v = -tickStep; v >= minVal; v -= tickStep) yTicks.push(v)

  const revVals  = months.map(m => m.revenue)
  const costVals = months.map(m => m.totalCosts)
  const cashVals = result.initialCash !== null ? months.map(m => m.cashBalance) : []

  const breakevenIdx = result.breakevenMonth !== null ? result.breakevenMonth - 1 : null

  // X axis — show M1, M3, M6, M9, M12
  const xLabels = [0, 2, 5, 8, 11]

  return `<svg viewBox="0 0 ${SVG_W} ${SVG_H}" width="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pg-rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C9A84C" stop-opacity="0.18"/><stop offset="100%" stop-color="#C9A84C" stop-opacity="0.02"/></linearGradient>
    <linearGradient id="pg-cost" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8795A6" stop-opacity="0.14"/><stop offset="100%" stop-color="#8795A6" stop-opacity="0.01"/></linearGradient>
    <linearGradient id="pg-cash" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0D9488" stop-opacity="0.12"/><stop offset="100%" stop-color="#0D9488" stop-opacity="0.01"/></linearGradient>
  </defs>

  ${yTicks.map(v => {
    const y   = toY(v)
    const isZ = v === 0
    return `<line x1="${SVG_PL}" y1="${y.toFixed(1)}" x2="${SVG_W - SVG_PR}" y2="${y.toFixed(1)}" stroke="${isZ ? '#D4DBE3' : '#EAE3D2'}" stroke-width="${isZ ? 1 : 0.5}" ${isZ ? '' : 'stroke-dasharray="3 3"'}/>
    <text x="${SVG_PL - 5}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" font-size="8" font-family="IBM Plex Mono,monospace" fill="#8795A6">${pdfFormatSar(v)}</text>`
  }).join('')}

  ${cashVals.length ? `<polygon points="${areaPoints(cashVals)}" fill="url(#pg-cash)"/>` : ''}
  <polygon points="${areaPoints(revVals)}"  fill="url(#pg-rev)"/>
  <polygon points="${areaPoints(costVals)}" fill="url(#pg-cost)"/>

  ${cashVals.length ? `<polyline points="${points(cashVals)}" fill="none" stroke="#0D9488" stroke-width="1.5" stroke-dasharray="4 3" stroke-linejoin="round"/>` : ''}
  <polyline points="${points(revVals)}"  fill="none" stroke="#C9A84C" stroke-width="2"   stroke-linejoin="round" stroke-linecap="round"/>
  <polyline points="${points(costVals)}" fill="none" stroke="#8795A6" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>

  ${xLabels.map(i => `<text x="${pdfToX(i).toFixed(1)}" y="${SVG_H - SVG_PB + 12}" text-anchor="middle" font-size="8" font-family="IBM Plex Mono,monospace" fill="#8795A6">${isAr ? `ش${i + 1}` : `M${i + 1}`}</text>`).join('')}

  ${breakevenIdx !== null ? (() => {
    const bx = pdfToX(breakevenIdx)
    const by = toY(months[breakevenIdx].revenue)
    return `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="5" fill="#0D9488"/>
    <circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="9" fill="#0D9488" fill-opacity="0.15"/>
    <text x="${bx.toFixed(1)}" y="${(by - 12).toFixed(1)}" text-anchor="middle" font-size="8" font-family="IBM Plex Mono,monospace" fill="#0A6E66">${isAr ? 'تعادل' : 'B/E'}</text>`
  })() : ''}
</svg>`
}

function renderProjectionsPage(data: StudyData, pageNum: number): string {
  const { language: lang, answers } = data
  const isAr = lang === 'ar'
  const dir  = isAr ? 'rtl' : 'ltr'
  const startupName = rawAnswer(answers, 'C2') || data.startup_name || 'Wuduh'

  // Build the answers map the engine expects (cardId → raw value)
  const rawAnswers: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(answers)) {
    rawAnswers[k] = v.answer
  }

  const result = runProjections(rawAnswers)
  if (!result) return '' // cards not filled — page is omitted silently

  const { mrrMonth12, totalRevenueYear1, grossMarginPct, breakevenMonth,
          runwayMonths, cashRunsOutMonth, flags, dataCompleteness } = result

  function pdfSar(n: number) { return isAr ? `${pdfFormatSar(n)} ر` : `SAR ${pdfFormatSar(n)}` }

  const metrics = [
    { label: isAr ? 'MRR الشهر 12'       : 'MRR month 12',    value: pdfSar(mrrMonth12) },
    { label: isAr ? 'إجمالي إيرادات س1'  : 'Total revenue Y1', value: pdfSar(totalRevenueYear1) },
    { label: isAr ? 'هامش الربح الإجمالي': 'Gross margin',     value: `${grossMarginPct.toFixed(1)}%` },
    { label: isAr ? 'نقطة التعادل'        : 'Breakeven',
      value: breakevenMonth
        ? (isAr ? `الشهر ${breakevenMonth}` : `Month ${breakevenMonth}`)
        : (isAr ? 'لم تُبلغ' : 'Not reached Y1') },
    ...(runwayMonths !== null ? [{
      label: isAr ? 'المسار المالي' : 'Runway',
      value: cashRunsOutMonth
        ? (isAr ? `ينفد الشهر ${cashRunsOutMonth}` : `Runs out M${cashRunsOutMonth}`)
        : (isAr ? `${runwayMonths} شهراً` : `${runwayMonths} months`),
    }] : []),
  ]

  const legendItems = [
    { color: '#C9A84C', dash: false, label: isAr ? 'الإيرادات' : 'Revenue' },
    { color: '#8795A6', dash: false, label: isAr ? 'التكاليف الكلية' : 'Total costs' },
    ...(result.initialCash !== null
      ? [{ color: '#0D9488', dash: true, label: isAr ? 'الرصيد النقدي' : 'Cash balance' }]
      : []),
    ...(breakevenMonth !== null
      ? [{ color: '#0D9488', dash: false, dot: true, label: isAr ? 'نقطة التعادل' : 'Breakeven' }]
      : []),
  ] as { color: string; dash: boolean; dot?: boolean; label: string }[]

  const assumptions = rawAnswers['8.4'] ? String(rawAnswers['8.4']) : null

  const numStr  = isAr ? '04.5 — التوقعات المالية' : '04.5 — Financial Projections'
  const pageLabel = `${esc(startupName)} · ${new Date().getFullYear()}`

  return `
  <div class="page section-page proj-page" dir="${dir}">
    ${patternBg('pn-proj')}
    ${sectionHeader(numStr, isAr ? 'التوقعات المالية — السنة الأولى' : 'Financial Projections — Year 1', pageLabel)}
    <div class="section-body">

      ${dataCompleteness === 'partial' ? `<div class="proj-partial-note">${isAr ? '⚠ بعض بطاقات التوقعات لم تكتمل. الأرقام تقديرية.' : '⚠ Some projection cards are incomplete. Numbers are approximate.'}</div>` : ''}

      <!-- Chart -->
      <div class="proj-chart-wrap">
        ${buildProjectionSvg(result, lang)}
      </div>

      <!-- Legend -->
      <div class="proj-legend">
        ${legendItems.map(item => `
          <div class="proj-legend-item">
            ${item.dot
              ? `<svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="${item.color}"/></svg>`
              : `<svg width="20" height="2" viewBox="0 0 20 2"><line x1="0" y1="1" x2="20" y2="1" stroke="${item.color}" stroke-width="2"${item.dash ? ' stroke-dasharray="4 3"' : ''}/></svg>`
            }
            <span>${esc(item.label)}</span>
          </div>`).join('')}
      </div>

      <!-- Metrics grid -->
      <div class="proj-metrics">
        ${metrics.map(m => `
          <div class="proj-metric">
            <div class="proj-metric-label">${esc(m.label)}</div>
            <div class="proj-metric-value">${esc(m.value)}</div>
          </div>`).join('')}
      </div>

      <!-- Flags -->
      ${flags.length > 0 ? `
        <div class="proj-flags">
          ${flags.map(f => `
            <div class="proj-flag proj-flag-${f.severity}">
              <span class="proj-flag-icon">${f.severity === 'warning' ? '⚠' : 'ℹ'}</span>
              <span>${esc(isAr ? f.messageAr : f.messageEn)}</span>
            </div>`).join('')}
        </div>` : ''}

      <!-- Key assumptions (from card 8.4) -->
      ${assumptions ? `
        <div class="proj-assumptions">
          <div class="content-q">${isAr ? 'الافتراضات الأساسية لهذا التوقع' : 'Key assumptions underlying this projection'}</div>
          <div class="content-a">${esc(assumptions)}</div>
        </div>` : ''}

      <!-- Disclaimer -->
      <p class="proj-disclaimer">${isAr ? 'التوقعات تقديرات المؤسس. النتائج الفعلية قد تختلف.' : 'Projections are founder estimates. Actual results may differ.'}</p>

    </div>
  </div>`
}

function renderRampTable(rows: Record<string, string>[], lang: Language): string {
  if (!rows.length) return ''
  const [h1, h2, h3] = lang === 'ar'
    ? ['الشهر', 'العملاء', 'الإيرادات (ريال)']
    : ['Month', 'Customers', 'Revenue (SAR)']
  const filled = rows.filter(r => r.customers && String(r.customers).trim() !== '')
  if (!filled.length) return ''
  return `<table class="comp-table">
    <thead><tr><th style="width:25%">${h1}</th><th style="width:25%">${h2}</th><th style="width:50%">${h3}</th></tr></thead>
    <tbody>${filled.map(r => `<tr><td>${esc(r.month)}</td><td>${esc(r.customers)}</td><td>${esc(r.revenue_sar)}</td></tr>`).join('')}</tbody>
  </table>`
}

function renderCostTable(rows: Record<string, string>[], lang: Language): string {
  if (!rows.length) return ''
  const [h1, h2, h3] = lang === 'ar'
    ? ['بند التكلفة', 'شهرياً (ريال)', 'يبدأ الشهر']
    : ['Cost item', 'Monthly (SAR)', 'Starts month']
  const filled = rows.filter(r => r.cost_item && String(r.cost_item).trim() !== '')
  if (!filled.length) return ''
  return `<table class="comp-table">
    <thead><tr><th style="width:50%">${h1}</th><th style="width:25%">${h2}</th><th style="width:25%">${h3}</th></tr></thead>
    <tbody>${filled.map(r => `<tr><td>${esc(r.cost_item)}</td><td>${esc(r.monthly_sar)}</td><td>${esc(r.starts_month || '1')}</td></tr>`).join('')}</tbody>
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
    (() => {
      const imageUrl = rawAnswer(answers, '2.8')
      if (!imageUrl) return ''
      const imagePath = imageUrl.split('?')[0]
      const isImage = imageUrl.startsWith('data:image') || /\.(png|jpe?g|webp|svg|gif)$/i.test(imagePath)
      if (isImage) {
        return `<div class="content-q">${lang === 'ar' ? 'صور ونماذج وعروض توضيحية' : 'Visuals, mockups & demos'}</div>
               <div class="s2-visual-wrap"><img src="${imageUrl}" alt="Product visual" class="s2-visual" /></div><div class="content-divider"></div>`
      }
      return qa(lang === 'ar' ? 'صور ونماذج' : 'Visuals & mockups', lang === 'ar' ? 'ملف مرفق' : 'File attached')
    })(),
  ].join(''))

  const s3 = renderSection(data, 's3', 4, [
    qa(lang === 'ar' ? 'العميل المستهدف' : 'Target customer', answer(answers, '3.1')),
    qa(lang === 'ar' ? 'حجم السوق' : 'Market size (TAM / SAM / SOM)', answer(answers, '3.2')),
    qa(lang === 'ar' ? 'الموقع الجغرافي' : 'Geography', answer(answers, '3.3')),
    qa(lang === 'ar' ? 'خصائص العميل' : 'Customer characteristics', answer(answers, '3.4')),
    qa(lang === 'ar' ? 'الشخصية' : 'Persona', answer(answers, '3.5')),
    qa(lang === 'ar' ? 'التحقق' : 'Customer validation', answer(answers, '3.6')),
  ].join(''))

  // ── Projections page (between S4 and S5, only if 4.6 is filled) ──
  const projectionsPage = renderProjectionsPage(data, 6)
  const hasProjections  = projectionsPage !== ''

  // Page numbers shift if projections page exists
  const pn = (base: number) => base + (hasProjections ? 1 : 0)

  const rampRows = tableRows(answers, '4.6')
  const costRows  = tableRows(answers, '4.7')

  const s4 = renderSection(data, 's4', 5, [
    qa(lang === 'ar' ? 'آلية الإيرادات' : 'Revenue mechanism', answer(answers, '4.1')),
    qa(lang === 'ar' ? 'نموذج التسعير' : 'Pricing model', answer(answers, '4.2')),
    qa(lang === 'ar' ? 'السعر للعميل' : 'Price per customer', answer(answers, '4.3')),
    qa(lang === 'ar' ? 'التكاليف' : 'Main costs', answer(answers, '4.4')),
    qa(lang === 'ar' ? 'الإيرادات الحالية' : 'Existing revenue', answer(answers, '4.5')),
    rampRows.length ? `<div class="content-q">${lang === 'ar' ? 'توقعات العملاء — السنة الأولى' : 'Customer ramp — year 1'}</div>` : '',
    renderRampTable(rampRows, lang),
    rampRows.length ? cd : '',
    costRows.length ? `<div class="content-q">${lang === 'ar' ? 'التكاليف الثابتة الشهرية' : 'Monthly fixed costs'}</div>` : '',
    renderCostTable(costRows, lang),
    costRows.length ? cd : '',
    qa(lang === 'ar' ? 'التكلفة المتغيرة لكل عميل' : 'Variable cost per customer', answer(answers, '4.8')),
    qa(lang === 'ar' ? 'المسار المالي' : 'Funding runway', answer(answers, '4.9')),
  ].join(''))

  const s5 = renderSection(data, 's5', pn(6), [
    cq(lang === 'ar' ? 'تحليل المنافسين' : 'Competitor analysis'),
    renderCompetitorTable(compRows, lang),
    compRows.length ? cd : '',
    qa(lang === 'ar' ? 'التموضع في السوق' : 'Market positioning', answer(answers, '5.2')),
    qa(lang === 'ar' ? 'تكاليف التحوّل (الخندق)' : 'Switching costs (moat)', answer(answers, '5.3')),
    qa(lang === 'ar' ? 'الميزة غير العادلة' : 'Unfair advantage', answer(answers, '5.4')),
    qa(lang === 'ar' ? 'لماذا الآن' : 'Why now', answer(answers, '5.5')),
  ].join(''))

  const s6 = renderSection(data, 's6', pn(7), [
    qa(lang === 'ar' ? 'أول 100 عميل' : 'First 100 customers', answer(answers, '6.1')),
    qa(lang === 'ar' ? 'قنوات التسويق' : 'Marketing channels', answer(answers, '6.2')),
    qa(lang === 'ar' ? 'استراتيجية المبيعات' : 'Sales strategy', answer(answers, '6.3')),
    qa(lang === 'ar' ? 'خطة السنة الأولى' : 'Year 1 acquisition plan', answer(answers, '6.4')),
    qa(lang === 'ar' ? 'قوة الدفع' : 'Early traction', answer(answers, '6.5')),
    qa(lang === 'ar' ? 'الشراكات' : 'Partnerships', answer(answers, '6.6')),
  ].join(''))

  const s7 = renderSection(data, 's7', pn(8), [
    cq(lang === 'ar' ? 'الفريق' : 'The team'),
    renderTeamTable(teamRows, lang),
    teamRows.length ? cd : '',
    qa(lang === 'ar' ? 'لماذا هذا الفريق' : 'Why this team', answer(answers, '7.2')),
    qa(lang === 'ar' ? 'المهارات المتوفرة' : 'Skills we have', answer(answers, '7.3')),
    qa(lang === 'ar' ? 'المهارات المفقودة' : 'Skills we need', answer(answers, '7.4')),
    qa(lang === 'ar' ? 'المستشارون' : 'Advisors', answer(answers, '7.5')),
    qa(lang === 'ar' ? 'أول توظيف' : 'First hires', answer(answers, '7.6')),
  ].join(''))

  const s8 = renderSection(data, 's8', pn(9), [
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
*{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;color-adjust:exact}
html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#FAF7F0}
@page{size:A4;margin:0}
:root{
  --navy-900:#0D1B2A;--gold-500:#C9A84C;--gold-600:#A6852F;--gold-700:#8A6F26;
  --gold-100:#F6EEDB;--teal-100:#D8F1EE;--teal-700:#0A6E66;
  --slate-400:#8795A6;--slate-500:#647183;--slate-600:#4A5666;--slate-700:#36404D;
  --navy-300:#7BA0BF;
  --paper:#FAF7F0;--paper-line:#EAE3D2;
  --fd:'IBM Plex Serif',serif;--fs:${bodyFont};--fm:'IBM Plex Mono',monospace;
}
body{font-family:var(--fs);background:var(--paper);margin:0;padding:0}

/* PAGE — flows to natural content height. Sections flow continuously
   (no forced page break between them), which is what prevents a near-full
   section from spilling onto a blank trailing page. The footer is drawn by
   the renderer on every page; only the cover gets its own dedicated page. */
.page{background:var(--paper);width:210mm;position:relative;display:flex;flex-direction:column}
.page-net{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
/* Sections flow continuously, so a near-full section never spawns a blank
   trailing page. Only the cover gets a dedicated page. These rules keep
   individual blocks from splitting awkwardly across a page boundary. */
.qa-block{break-inside:avoid}
.content-q{break-after:avoid}
.section-header{break-inside:avoid;break-after:avoid}
.comp-table thead,.risk-table thead,.comp-table tr,.risk-table tr{break-inside:avoid}

/* COVER — full A4 hero; height accounts for the reserved footer margin so it
   never leaks onto a second page. Title block is centered; meta pinned bottom. */
.cover{display:flex;flex-direction:column;min-height:280mm;page-break-after:always}
.cover-header{background:var(--navy-900);padding:36px 56px 40px;position:relative;overflow:hidden;flex-shrink:0}
.cover-header-net{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0.35}
.cover-header-inner{position:relative;display:flex;align-items:flex-start;justify-content:space-between}
.cover-brand{display:flex;align-items:center;gap:12px}
.cover-brand-name{font-family:var(--fd);font-size:20px;font-weight:600;color:#fff;letter-spacing:-0.01em}
.cover-doc-type{font-family:var(--fm);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--navy-300);margin-top:14px;text-align:${dir === 'rtl' ? 'left' : 'right'}}
.cover-body{padding:44px 56px 48px;flex:1;display:flex;flex-direction:column}
.cover-content{flex:1;display:flex;flex-direction:column;justify-content:center}
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

/* PROJECTIONS PAGE */
.proj-page .section-body{padding:20px 56px 28px}
.proj-chart-wrap{border:1px solid var(--paper-line);border-radius:10px;padding:16px 12px 12px;margin-bottom:12px;background:#fff;break-inside:avoid}
.proj-legend{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px;padding-left:4px}
.proj-legend-item{display:flex;align-items:center;gap:6px;font-family:var(--fm);font-size:9px;letter-spacing:0.06em;text-transform:uppercase;color:var(--slate-400)}
.proj-metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:14px}
.proj-metric{background:var(--gold-100);border-radius:8px;padding:10px 12px}
.proj-metric-label{font-family:var(--fm);font-size:8px;letter-spacing:0.08em;text-transform:uppercase;color:var(--gold-700);margin-bottom:4px}
.proj-metric-value{font-family:var(--fd);font-size:15px;font-weight:500;color:var(--navy-900);letter-spacing:-0.01em}
.proj-flags{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}
.proj-flag{display:flex;align-items:flex-start;gap:7px;font-size:11px;color:var(--slate-600);line-height:1.55;padding:7px 10px;border-radius:6px}
.proj-flag-warning{background:#F8ECCE;color:#7A5A18}
.proj-flag-info{background:#F4F6F8;color:var(--slate-600)}
.proj-flag-icon{flex-shrink:0;font-size:11px}
.proj-assumptions{margin:12px 0 8px}
.proj-disclaimer{font-family:var(--fm);font-size:9px;letter-spacing:0.06em;color:var(--slate-400);margin-top:10px}
.proj-partial-note{font-family:var(--fm);font-size:9px;letter-spacing:0.06em;color:#B4811E;background:#F8ECCE;padding:5px 10px;border-radius:4px;margin-bottom:12px}

/* SOLUTION VISUAL (card 2.8) */
.s2-visual-wrap{margin:8px 0 16px;border:1px solid var(--paper-line);border-radius:8px;overflow:hidden;background:#fff;break-inside:avoid}
.s2-visual{width:100%;max-height:360px;object-fit:contain;display:block}
</style>
</head>
<body>
  ${renderCover(data)}
  ${s1}${s2}${s3}${s4}${projectionsPage}${s5}${s6}${s7}${s8}
</body>
</html>`
}
