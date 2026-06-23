'use client'

// ─────────────────────────────────────────────────────────────────────────────
// src/components/cards/TableCard.tsx
//
// Handles all table-type cards. Supports five column behaviours:
//   text          — multiline textarea (default, existing cards 5.1, 7.1, 8.1)
//   number        — single-line numeric input with validation
//   select        — dropdown from column options_en / options_ar
//   prefilled     — static label seeded from options list, not editable
//   auto_calculate— read-only computed cell (e.g. customers × price)
//
// Two row modes:
//   dynamic       — Add row / Delete row buttons (default)
//   fixed_rows    — exact N rows, always present, no add/delete
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react'
import type { CardConfig, Language, TableColumn } from '@/types/cards'
import { localise } from '@/lib/cards/loader'
import { useAutoSave } from '@/hooks/useAutoSave'

// Row values are stored as strings internally for uniform state handling.
// The engine coerces to numbers when it reads them.
type Row = Record<string, string>

interface Props {
  card: CardConfig
  lang: Language
  studyId: string
  initialRows?: Row[]
  studyAnswers?: Record<string, unknown>   // full answers map for auto-calculate
  onComplete: (rows: Row[]) => void
  onSkip: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract a SAR price number from free-text card 4.3 answer */
function extractPrice(raw: unknown): number | null {
  if (!raw || typeof raw !== 'string') return null
  const cleaned = raw.replace(/SAR|ريال|ر\.س/gi, ' ')
  const match = cleaned.match(/[\d,،]+(\.\d+)?/)
  if (!match) return null
  const n = parseFloat(match[0].replace(/[,،]/g, ''))
  return isFinite(n) && n > 0 ? n : null
}

/** Build an empty row — numbers default to '', prefilled cols seeded below */
function emptyRow(cols: TableColumn[]): Row {
  return Object.fromEntries(
    cols.map(c => [c.key, c.default !== undefined ? String(c.default) : ''])
  )
}

/** Build the initial 12 fixed rows for card 4.6 (or any fixed_rows card) */
function buildFixedRows(cols: TableColumn[], count: number, lang: Language): Row[] {
  return Array.from({ length: count }, (_, i) => {
    const row = emptyRow(cols)
    for (const col of cols) {
      if (col.prefilled) {
        const opts = lang === 'ar' ? col.options_ar : col.options_en
        row[col.key] = opts?.[i] ?? String(i + 1)
      }
    }
    return row
  })
}

/** Validate a number cell value — returns error string or null */
function validateNumber(val: string): string | null {
  if (val === '' || val === undefined) return null
  const n = parseFloat(val.replace(/[,،]/g, ''))
  if (!isFinite(n)) return 'Must be a number'
  if (n < 0) return 'Must be ≥ 0'
  return null
}

// ── Cell renderers ────────────────────────────────────────────────────────────

interface CellProps {
  col: TableColumn
  value: string
  lang: Language
  rowIdx: number
  onChange: (key: string, value: string) => void
  pricePerCustomer: number | null
  rowValues: Row
}

function Cell({ col, value, lang, rowIdx, onChange, pricePerCustomer, rowValues }: CellProps) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const fontFamily = lang === 'ar' ? 'var(--font-arabic), sans-serif' : 'var(--font-sans), sans-serif'
  const baseInputStyle: React.CSSProperties = {
    width: '100%', borderRadius: 7, padding: '7px 10px', fontSize: 13,
    transition: 'border-color 140ms, box-shadow 140ms',
    fontFamily, textAlign: dir === 'rtl' ? 'right' : 'left',
  }

  // ── prefilled: static label, not editable ─────────────────────────────────
  if (col.prefilled) {
    return (
      <div style={{
        padding: '7px 10px', fontSize: 13, color: 'var(--text-muted)',
        fontFamily, fontFamily2: lang === 'ar' ? 'var(--font-arabic), sans-serif' : undefined,
      } as React.CSSProperties}>
        {value || (lang === 'ar' ? col.options_ar?.[rowIdx] : col.options_en?.[rowIdx]) || '—'}
      </div>
    )
  }

  // ── auto_calculate: read-only computed value ──────────────────────────────
  if (col.auto_calculate) {
    const customers = parseFloat(rowValues['customers'] || '0') || 0
    const computed  = pricePerCustomer !== null ? (customers * pricePerCustomer) : null
    const display   = computed !== null
      ? `SAR ${computed.toLocaleString('en-SA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
      : (lang === 'ar' ? '— أضف سعرك في 4.3' : '— add price in 4.3')

    return (
      <div style={{
        padding: '7px 10px', fontSize: 13,
        color: computed !== null ? 'var(--teal-700)' : 'var(--text-hint)',
        fontFamily, display: 'flex', alignItems: 'center', gap: 5,
      }}>
        {computed !== null && (
          <span style={{ color: 'var(--teal-500)', fontSize: 10, lineHeight: 1 }} title="Auto-calculated">✦</span>
        )}
        {display}
      </div>
    )
  }

  // ── select: dropdown from column options ──────────────────────────────────
  if (col.type === 'select') {
    const opts = lang === 'ar' ? (col.options_ar ?? []) : (col.options_en ?? [])
    return (
      <select
        value={value}
        onChange={e => onChange(col.key, e.target.value)}
        className="tbl-cell"
        dir={dir}
        style={{ ...baseInputStyle, background: 'var(--bg-input)', border: '1.5px solid var(--border-default)', color: 'var(--text-primary)', cursor: 'pointer' }}
      >
        <option value="">—</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }

  // ── number: single-line numeric input ─────────────────────────────────────
  if (col.type === 'number') {
    const [error, setError] = useState<string | null>(null)
    const placeholder = lang === 'ar' ? (col.placeholder_ar ?? '—') : (col.placeholder_en ?? '—')

    return (
      <div>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={e => { onChange(col.key, e.target.value); setError(null) }}
          onBlur={e => setError(validateNumber(e.target.value))}
          className="tbl-cell"
          dir="ltr"
          style={{ ...baseInputStyle, background: 'var(--bg-input)', border: `1.5px solid ${error ? 'var(--danger-500)' : 'var(--border-default)'}`, color: 'var(--text-primary)' }}
        />
        {error && (
          <p style={{ fontSize: 11, color: 'var(--danger-500)', margin: '3px 0 0 2px', fontFamily }}>{error}</p>
        )}
      </div>
    )
  }

  // ── text (default): multiline textarea ───────────────────────────────────
  const placeholder = lang === 'ar' ? (col.placeholder_ar ?? '—') : (col.placeholder_en ?? '—')
  return (
    <textarea
      value={value}
      onChange={e => onChange(col.key, e.target.value)}
      className="tbl-cell"
      dir={dir}
      rows={2}
      placeholder={placeholder || '—'}
      style={{ ...baseInputStyle, background: 'var(--bg-input)', border: '1.5px solid var(--border-default)', color: 'var(--text-primary)', resize: 'none' }}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TableCard({ card, lang, studyId, initialRows, studyAnswers, onComplete, onSkip }: Props) {
  const cols       = card.table_columns ?? []
  const maxRows    = card.max_rows ?? 5
  const isFixed    = typeof card.fixed_rows === 'number'
  const fixedCount = card.fixed_rows ?? 0
  const dir        = lang === 'ar' ? 'rtl' : 'ltr'
  const content    = localise(card, lang)

  const { save, saving, lastSaved } = useAutoSave(studyId)

  // Price for auto-calculate (card 4.3 answer from studyAnswers)
  const pricePerCustomer = extractPrice(studyAnswers?.['4.3'])

  // ── Initial rows ──────────────────────────────────────────────────────────
  function defaultRows(): Row[] {
    if (initialRows && initialRows.length > 0) {
      // Re-seed prefilled columns in case lang changed
      return initialRows.map((r, i) => {
        const seeded = { ...r }
        for (const col of cols) {
          if (col.prefilled) {
            const opts = lang === 'ar' ? col.options_ar : col.options_en
            seeded[col.key] = opts?.[i] ?? String(i + 1)
          }
        }
        return seeded
      })
    }
    if (isFixed) return buildFixedRows(cols, fixedCount, lang)
    return [emptyRow(cols)]
  }

  const [rows, setRows] = useState<Row[]>(defaultRows)

  // Re-seed prefilled cols if lang prop changes
  useEffect(() => {
    setRows(prev => prev.map((r, i) => {
      const updated = { ...r }
      for (const col of cols) {
        if (col.prefilled) {
          const opts = lang === 'ar' ? col.options_ar : col.options_en
          updated[col.key] = opts?.[i] ?? String(i + 1)
        }
      }
      return updated
    }))
  }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps

  const autoSave = useCallback(
    (nextRows: Row[]) => save({ card_id: card.id, answer: nextRows, status: 'done' }, 600),
    [card.id, save]
  )

  function updateCell(rowIdx: number, key: string, value: string) {
    const next = rows.map((r, i) => i === rowIdx ? { ...r, [key]: value } : r)
    setRows(next)
    autoSave(next)
  }

  function addRow() {
    if (isFixed || rows.length >= maxRows) return
    const next = [...rows, emptyRow(cols)]
    setRows(next); autoSave(next)
  }

  function deleteRow(idx: number) {
    if (isFixed) return
    const next = rows.filter((_, i) => i !== idx)
    const final = next.length === 0 ? [emptyRow(cols)] : next
    setRows(final); autoSave(final)
  }

  async function handleComplete() {
    // For fixed rows, save all rows (including partially filled ones)
    // For dynamic rows, filter to only rows with at least one value
    const toSave = isFixed
      ? rows
      : rows.filter(r => Object.values(r).some(v => String(v).trim()))
    await save({ card_id: card.id, answer: toSave, status: 'done' })
    onComplete(toSave)
  }

  async function handleSkip() {
    await save({ card_id: card.id, answer: null, status: 'skipped' })
    onSkip()
  }

  // Whether the delete button column is shown at all
  const showDeleteCol = !isFixed

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} dir={dir}>
      <style>{`
        .tbl-cell { background: var(--bg-input); border: 1.5px solid var(--border-default); color: var(--text-primary); }
        .tbl-cell:focus { border-color: rgba(201,168,76,0.6) !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.12) !important; outline: none !important; }
        .tbl-del:hover:not(:disabled) { color: var(--danger-500) !important; background: var(--danger-100) !important; }
        .tbl-add:hover { color: var(--gold-700) !important; }
        .tbl-done:hover:not(:disabled) { opacity: 0.85; }
        .tbl-done:disabled { opacity: 0.55; cursor: not-allowed; }
        .tbl-skip:hover:not(:disabled) { color: var(--text-secondary) !important; background: var(--bg-subtle) !important; }
        .tbl-prefilled { color: var(--text-muted); font-size: 13px; padding: 7px 10px; }
      `}</style>

      <div style={{ border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>

          {/* ── Header ── */}
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
              {cols.map(col => (
                <th key={col.key} style={{
                  width: `${col.width_pct}%`, padding: '10px 12px',
                  textAlign: dir === 'rtl' ? 'right' : 'left',
                  fontFamily: 'var(--font-mono), monospace', fontSize: 10,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--text-faint)', fontWeight: 500,
                }}>
                  {col[lang]}
                  {col.auto_calculate && (
                    <span style={{ marginLeft: 4, color: 'var(--teal-500)', fontSize: 9 }} title="Auto-calculated">✦</span>
                  )}
                </th>
              ))}
              {showDeleteCol && <th style={{ width: 36 }} />}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                style={{ borderBottom: rowIdx < rows.length - 1 ? '1px solid var(--border-subtle)' : undefined }}
              >
                {cols.map(col => (
                  <td key={col.key} style={{ padding: '6px 8px', verticalAlign: 'top' }}>
                    <Cell
                      col={col}
                      value={row[col.key] ?? ''}
                      lang={lang}
                      rowIdx={rowIdx}
                      onChange={(key, val) => updateCell(rowIdx, key, val)}
                      pricePerCustomer={pricePerCustomer}
                      rowValues={row}
                    />
                  </td>
                ))}
                {showDeleteCol && (
                  <td style={{ padding: '8px 6px', verticalAlign: 'top' }}>
                    <button
                      className="tbl-del"
                      onClick={() => deleteRow(rowIdx)}
                      disabled={rows.length === 1}
                      aria-label={lang === 'ar' ? 'حذف الصف' : 'Delete row'}
                      style={{
                        width: 28, height: 28, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', borderRadius: 6, border: 'none',
                        background: 'transparent', color: 'var(--border-strong)',
                        cursor: rows.length === 1 ? 'not-allowed' : 'pointer',
                        opacity: rows.length === 1 ? 0 : 1,
                        transition: 'opacity 140ms, color 140ms, background 140ms',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Add row (dynamic mode only) ── */}
      {!isFixed && rows.length < maxRows && (
        <button
          onClick={addRow}
          className="tbl-add"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, color: 'var(--gold-500)', padding: 0,
            transition: 'color 140ms',
            flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
            fontFamily: 'var(--font-sans), sans-serif',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M12 4v16m8-8H4" />
          </svg>
          {lang === 'ar' ? 'إضافة صف' : 'Add row'}
        </button>
      )}

      {/* ── Auto-save status ── */}
      <div style={{ minHeight: 16 }}>
        <span style={{
          fontFamily: 'var(--font-mono), monospace', fontSize: 11,
          color: saving ? 'var(--gold-500)' : 'var(--text-hint)',
        }}>
          {saving
            ? (lang === 'ar' ? '· جاري الحفظ…' : '· Saving…')
            : lastSaved
              ? (lang === 'ar' ? '· تم الحفظ' : '· Saved')
              : ''}
        </span>
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: 10, flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
        <button
          className="tbl-done"
          onClick={handleComplete}
          disabled={saving}
          style={{
            flex: 1, background: 'var(--text-primary)', color: 'var(--bg-page)',
            border: 'none', borderRadius: 9, padding: '13px 0',
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
            transition: 'opacity 140ms', fontFamily: 'var(--font-sans), sans-serif',
          }}
        >
          {lang === 'ar' ? 'تم — البطاقة التالية' : 'Done — next card'}
        </button>

        {!card.required && (
          <button
            className="tbl-skip"
            onClick={handleSkip}
            disabled={saving}
            style={{
              background: 'transparent', border: '1.5px solid var(--border-default)',
              borderRadius: 9, padding: '13px 16px', fontSize: 13,
              color: 'var(--text-faint)', cursor: 'pointer',
              transition: 'color 140ms, background 140ms',
              fontFamily: 'var(--font-sans), sans-serif', whiteSpace: 'nowrap',
            }}
          >
            {lang === 'ar' ? 'تخطّ' : 'Skip for now'}
          </button>
        )}
      </div>
    </div>
  )
}
