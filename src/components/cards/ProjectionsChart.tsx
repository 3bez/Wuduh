'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/cards/ProjectionsChart.tsx
//
// Live financial projections chart — shown in the study UI below the card
// when the founder has passed section S4 and filled in cards 4.6 + 4.3.
//
// Renders an inline SVG — no charting library, zero bundle size increase.
// The same engine that powers this also runs on the server for PDF export.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react'
import { runProjections, type RawAnswers, type ProjectionResult } from '@/lib/projections/engine'
import type { Language } from '@/types/cards'

interface Props {
  answers: RawAnswers
  lang: Language
}

// ── SVG layout constants ──────────────────────────────────────────────────────
const W        = 600   // viewBox width
const H        = 260   // viewBox height
const PAD_L    = 64    // left axis labels
const PAD_R    = 16
const PAD_T    = 16
const PAD_B    = 36    // bottom axis labels
const PLOT_W   = W - PAD_L - PAD_R
const PLOT_H   = H - PAD_T - PAD_B

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatSar(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(Math.round(n))
}

function sarLabel(n: number, lang: Language): string {
  return lang === 'ar' ? `${formatSar(n)} ر` : `${formatSar(n)}`
}

/** Map a value in [0, max] to a Y coordinate (inverted — higher = lower Y) */
function toY(val: number, max: number): number {
  if (max === 0) return PAD_T + PLOT_H
  return PAD_T + PLOT_H - (val / max) * PLOT_H
}

/** Map a month index [0..11] to an X coordinate */
function toX(i: number): number {
  return PAD_L + (i / 11) * PLOT_W
}

/** Build an SVG path string from an array of [x, y] points (line) */
function linePath(points: [number, number][]): string {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

/** Build a filled area path: line down to baseline, then back */
function areaPath(points: [number, number][], baselineY: number): string {
  if (points.length === 0) return ''
  const line = linePath(points)
  const last = points[points.length - 1]
  const first = points[0]
  return `${line} L${last[0].toFixed(1)},${baselineY.toFixed(1)} L${first[0].toFixed(1)},${baselineY.toFixed(1)} Z`
}

// ── Locked / incomplete state ─────────────────────────────────────────────────

function LockedState({ lang }: { lang: Language }) {
  const isAr = lang === 'ar'
  const dir  = isAr ? 'rtl' : 'ltr'
  return (
    <div dir={dir} style={{
      border: '1px solid var(--border-default)',
      borderRadius: 16,
      padding: '28px 24px',
      background: 'var(--bg-surface)',
      textAlign: isAr ? 'right' : 'left',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexDirection: isAr ? 'row-reverse' : 'row' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold-500)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-700)' }}>
          {isAr ? 'التوقعات المالية' : 'Financial projections'}
        </span>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0, fontFamily: isAr ? 'var(--font-arabic), sans-serif' : undefined }}>
        {isAr
          ? 'أكمل البطاقتين 4.6 (منحدر العملاء) و4.3 (السعر لكل عميل) لرؤية مخطط توقعات السنة الأولى هنا.'
          : 'Complete cards 4.6 (customer ramp) and 4.3 (price per customer) to see your year-1 projections chart here.'}
      </p>
    </div>
  )
}

// ── Flag callout ──────────────────────────────────────────────────────────────

function Flag({ message, severity, lang }: { message: string; severity: 'info' | 'warning'; lang: Language }) {
  const isAr = lang === 'ar'
  const color   = severity === 'warning' ? 'var(--warning-500)' : 'var(--text-faint)'
  const bgColor = severity === 'warning' ? 'var(--warning-100)' : 'var(--bg-subtle)'
  return (
    <div style={{
      background: bgColor, borderRadius: 8, padding: '9px 12px',
      display: 'flex', gap: 8, alignItems: 'flex-start',
      flexDirection: isAr ? 'row-reverse' : 'row',
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">
        {severity === 'warning'
          ? <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>
          : <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
        }
      </svg>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, textAlign: isAr ? 'right' : 'left', fontFamily: isAr ? 'var(--font-arabic), sans-serif' : undefined }}>
        {message}
      </p>
    </div>
  )
}

// ── Metric card ───────────────────────────────────────────────────────────────

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: 'var(--bg-subtle)', borderRadius: 10,
      padding: '14px 16px', flex: 1, minWidth: 0,
    }}>
      <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 3 }}>{sub}</div>
      )}
    </div>
  )
}

// ── Chart SVG ────────────────────────────────────────────────────────────────

function ChartSvg({ result, lang }: { result: ProjectionResult; lang: Language }) {
  const isAr = lang === 'ar'
  const { months } = result

  // Determine scale — always include 0 in range
  const allRevenue  = months.map(m => m.revenue)
  const allCosts    = months.map(m => m.totalCosts)
  const allCash     = result.initialCash !== null ? months.map(m => m.cashBalance) : []
  const maxVal      = Math.max(0, ...allRevenue, ...allCosts, ...allCash)
  const minVal      = Math.min(0, ...months.map(m => m.cumulativeProfit), ...allCash)

  // Y axis spans minVal → maxVal, with a little padding
  const ySpan   = (maxVal - minVal) || 1
  const yPadded = ySpan * 1.08
  const yTop    = maxVal + ySpan * 0.04
  const yToCoord = (v: number) => PAD_T + PLOT_H - ((v - (yTop - yPadded)) / yPadded) * PLOT_H
  const baseY   = yToCoord(0)

  // Build point arrays
  const revPoints:  [number, number][] = months.map((m, i) => [toX(i), yToCoord(m.revenue)])
  const costPoints: [number, number][] = months.map((m, i) => [toX(i), yToCoord(m.totalCosts)])
  const cashPoints: [number, number][] = result.initialCash !== null
    ? months.map((m, i) => [toX(i), yToCoord(m.cashBalance)])
    : []

  // Y axis tick marks (4 ticks including 0)
  const yTicks: number[] = []
  const tickStep = Math.ceil(yPadded / 4 / 1000) * 1000 || 100
  for (let v = 0; v <= yTop; v += tickStep) yTicks.push(v)
  if (minVal < 0) {
    for (let v = -tickStep; v >= minVal; v -= tickStep) yTicks.push(v)
  }

  // X axis labels — every 2 months for space
  const xLabels = months.filter((_, i) => i === 0 || (i + 1) % 2 === 0 || i === 11)

  // Breakeven dot
  const breakevenIdx = result.breakevenMonth !== null ? result.breakevenMonth - 1 : null

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: 'block', overflow: 'visible' }}
      aria-label={isAr ? 'مخطط التوقعات المالية للسنة الأولى' : 'Year-1 financial projections chart'}
      role="img"
    >
      <defs>
        <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold-500)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--gold-500)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="cost-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--text-hint)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--text-hint)" stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="cash-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--teal-500)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--teal-500)" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* ── Grid lines ── */}
      {yTicks.map(v => {
        const y = yToCoord(v)
        const isZero = v === 0
        return (
          <g key={v}>
            <line
              x1={PAD_L} y1={y} x2={W - PAD_R} y2={y}
              stroke={isZero ? 'var(--border-strong)' : 'var(--border-subtle)'}
              strokeWidth={isZero ? 1 : 0.5}
              strokeDasharray={isZero ? undefined : '3 3'}
            />
            <text
              x={PAD_L - 6} y={y + 4}
              textAnchor="end"
              fontSize={9}
              fontFamily="var(--font-mono), monospace"
              fill="var(--text-hint)"
            >
              {sarLabel(v, lang)}
            </text>
          </g>
        )
      })}

      {/* ── Areas ── */}
      {result.initialCash !== null && cashPoints.length > 0 && (
        <path d={areaPath(cashPoints, baseY)} fill="url(#cash-fill)" />
      )}
      <path d={areaPath(revPoints,  baseY)} fill="url(#rev-fill)" />
      <path d={areaPath(costPoints, baseY)} fill="url(#cost-fill)" />

      {/* ── Lines ── */}
      {result.initialCash !== null && cashPoints.length > 0 && (
        <path d={linePath(cashPoints)} fill="none" stroke="var(--teal-500)" strokeWidth="1.5" strokeDasharray="4 3" strokeLinejoin="round" />
      )}
      <path d={linePath(revPoints)}  fill="none" stroke="var(--gold-500)"  strokeWidth="2"   strokeLinejoin="round" strokeLinecap="round" />
      <path d={linePath(costPoints)} fill="none" stroke="var(--text-hint)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* ── X axis labels ── */}
      {xLabels.map((m, i) => {
        const origIdx = months.indexOf(m)
        return (
          <text
            key={m.month}
            x={toX(origIdx)}
            y={H - PAD_B + 14}
            textAnchor="middle"
            fontSize={9}
            fontFamily="var(--font-mono), monospace"
            fill="var(--text-hint)"
          >
            {isAr ? `ش${m.month}` : `M${m.month}`}
          </text>
        )
      })}

      {/* ── Breakeven dot ── */}
      {breakevenIdx !== null && (() => {
        const bx = toX(breakevenIdx)
        const by = yToCoord(months[breakevenIdx].revenue)
        return (
          <g>
            <circle cx={bx} cy={by} r={5} fill="var(--teal-500)" />
            <circle cx={bx} cy={by} r={9} fill="var(--teal-500)" fillOpacity={0.15} />
            <text
              x={bx} y={by - 14}
              textAnchor="middle"
              fontSize={9}
              fontFamily="var(--font-mono), monospace"
              fill="var(--teal-700)"
            >
              {isAr ? 'تعادل' : 'B/E'}
            </text>
          </g>
        )
      })()}
    </svg>
  )
}

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend({ result, lang }: { result: ProjectionResult; lang: Language }) {
  const isAr = lang === 'ar'
  const items = [
    { color: 'var(--gold-500)',  dash: false, label: isAr ? 'الإيرادات' : 'Revenue' },
    { color: 'var(--text-hint)', dash: false, label: isAr ? 'التكاليف الكلية' : 'Total costs' },
    ...(result.initialCash !== null
      ? [{ color: 'var(--teal-500)', dash: true, label: isAr ? 'الرصيد النقدي' : 'Cash balance' }]
      : []),
  ]
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', flexDirection: isAr ? 'row-reverse' : 'row' }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <svg width="20" height="2" viewBox="0 0 20 2" aria-hidden="true">
            <line x1="0" y1="1" x2="20" y2="1" stroke={item.color} strokeWidth="2" strokeDasharray={item.dash ? '4 3' : undefined} />
          </svg>
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.05em' }}>
            {item.label}
          </span>
        </div>
      ))}
      {result.breakevenMonth !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <circle cx="6" cy="6" r="4" fill="var(--teal-500)" />
          </svg>
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.05em' }}>
            {isAr ? 'نقطة التعادل' : 'Breakeven'}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProjectionsChart({ answers, lang }: Props) {
  const isAr = lang === 'ar'
  const dir  = isAr ? 'rtl' : 'ltr'

  const result = useMemo(() => runProjections(answers), [answers])

  if (!result) return <LockedState lang={lang} />

  const {
    mrrMonth12, totalRevenueYear1, grossMarginPct,
    breakevenMonth, runwayMonths, cashRunsOutMonth,
    flags, dataCompleteness,
  } = result

  // Metric display strings
  const mrrLabel = isAr
    ? `${formatSar(mrrMonth12)} ريال`
    : `SAR ${formatSar(mrrMonth12)}`
  const revenueLabel = isAr
    ? `${formatSar(totalRevenueYear1)} ريال`
    : `SAR ${formatSar(totalRevenueYear1)}`
  const marginLabel  = `${grossMarginPct.toFixed(1)}%`
  const beLabel      = breakevenMonth
    ? (isAr ? `الشهر ${breakevenMonth}` : `Month ${breakevenMonth}`)
    : (isAr ? 'لم يُبلغ' : 'Not reached')

  return (
    <div dir={dir} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: isAr ? 'row-reverse' : 'row' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-700)', background: 'var(--gold-100)', padding: '3px 10px', borderRadius: 99 }}>
            {isAr ? 'التوقعات المالية' : 'Financial Projections'}
          </span>
          {dataCompleteness === 'partial' && (
            <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.06em', color: 'var(--text-faint)', border: '1px solid var(--border-strong)', padding: '2px 8px', borderRadius: 99 }}>
              {isAr ? 'جزئي' : 'Partial'}
            </span>
          )}
        </div>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, color: 'var(--text-hint)' }}>
          {isAr ? 'السنة الأولى · 12 شهراً' : 'Year 1 · 12 months'}
        </span>
      </div>

      {/* ── Chart surface ── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        padding: '20px 16px 16px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <ChartSvg result={result} lang={lang} />
        <div style={{ marginTop: 12, paddingLeft: 4 }}>
          <Legend result={result} lang={lang} />
        </div>
      </div>

      {/* ── Metrics row ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Metric
          label={isAr ? 'MRR الشهر 12' : 'MRR month 12'}
          value={mrrLabel}
          sub={isAr ? 'الإيرادات الشهرية المتكررة' : 'Monthly recurring revenue'}
        />
        <Metric
          label={isAr ? 'إجمالي الإيرادات' : 'Total revenue Y1'}
          value={revenueLabel}
        />
        <Metric
          label={isAr ? 'هامش الربح الإجمالي' : 'Gross margin'}
          value={marginLabel}
        />
        <Metric
          label={isAr ? 'نقطة التعادل' : 'Breakeven'}
          value={beLabel}
        />
        {runwayMonths !== null && (
          <Metric
            label={isAr ? 'المسار المالي' : 'Runway'}
            value={isAr ? `${runwayMonths} شهراً` : `${runwayMonths} months`}
            sub={cashRunsOutMonth
              ? (isAr ? `النقد ينفد الشهر ${cashRunsOutMonth}` : `Cash runs out month ${cashRunsOutMonth}`)
              : (isAr ? 'النقد يكفي طوال العام' : 'Cash lasts full year')}
          />
        )}
      </div>

      {/* ── Flags ── */}
      {flags.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {flags.map(f => (
            <Flag
              key={f.type}
              message={isAr ? f.messageAr : f.messageEn}
              severity={f.severity}
              lang={lang}
            />
          ))}
        </div>
      )}

      {/* ── Disclaimer ── */}
      <p style={{ fontSize: 11, color: 'var(--text-hint)', margin: 0, lineHeight: 1.5, textAlign: isAr ? 'right' : 'left', fontFamily: isAr ? 'var(--font-arabic), sans-serif' : undefined }}>
        {isAr
          ? 'التوقعات تقديرات المؤسس. النتائج الفعلية قد تختلف.'
          : 'Projections are founder estimates. Actual results may differ.'}
      </p>
    </div>
  )
}
