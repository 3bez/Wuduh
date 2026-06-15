'use client'

// TableCard — repeatable rows (competitors, team, risks).
// Add up to max_rows. Delete individual rows. Auto-saves on every change.

import { useState, useCallback } from 'react'
import type { CardConfig, Language, TableColumn } from '@/types/cards'
import { localise } from '@/lib/cards/loader'
import { useAutoSave } from '@/hooks/useAutoSave'
import { cn } from '@/lib/utils'

type Row = Record<string, string>

interface Props {
  card: CardConfig
  lang: Language
  studyId: string
  initialRows?: Row[]
  onComplete: (rows: Row[]) => void
  onSkip: () => void
}

function emptyRow(cols: TableColumn[]): Row {
  return Object.fromEntries(cols.map(c => [c.key, '']))
}

export default function TableCard({ card, lang, studyId, initialRows, onComplete, onSkip }: Props) {
  const cols    = card.table_columns ?? []
  const maxRows = card.max_rows ?? 5
  const [rows, setRows] = useState<Row[]>(
    initialRows && initialRows.length > 0 ? initialRows : [emptyRow(cols)]
  )
  const { save, saving, lastSaved } = useAutoSave(studyId)
  const content = localise(card, lang)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const autoSave = useCallback(
    (nextRows: Row[]) => {
      save({ card_id: card.id, answer: nextRows, status: 'done' }, 600)
    },
    [card.id, save]
  )

  function updateCell(rowIdx: number, key: string, value: string) {
    const next = rows.map((r, i) => i === rowIdx ? { ...r, [key]: value } : r)
    setRows(next)
    autoSave(next)
  }

  function addRow() {
    if (rows.length >= maxRows) return
    const next = [...rows, emptyRow(cols)]
    setRows(next)
    autoSave(next)
  }

  function deleteRow(idx: number) {
    const next = rows.filter((_, i) => i !== idx)
    const final = next.length === 0 ? [emptyRow(cols)] : next
    setRows(final)
    autoSave(final)
  }

  async function handleComplete() {
    const filled = rows.filter(r => Object.values(r).some(v => v.trim()))
    await save({ card_id: card.id, answer: filled, status: 'done' })
    onComplete(filled)
  }

  async function handleSkip() {
    await save({ card_id: card.id, answer: null, status: 'skipped' })
    onSkip()
  }

  // Special: likelihood dropdown for risk table
  const isRiskTable = card.id === '8.1'
  const likelihoodOpts = card.likelihood_options?.[lang] ?? []

  return (
    <div className="flex flex-col gap-4" dir={dir}>
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {cols.map(col => (
                <th
                  key={col.key}
                  style={{ width: `${col.width_pct}%` }}
                  className={cn(
                    'px-3 py-2.5 text-xs font-medium text-slate-500 eyebrow',
                    lang === 'ar' ? 'text-right' : 'text-left'
                  )}
                >
                  {col[lang]}
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-slate-100 last:border-0">
                {cols.map(col => (
                  <td key={col.key} className="px-3 py-2 align-top">
                    {isRiskTable && col.key === 'likelihood' ? (
                      <select
                        value={row[col.key] ?? ''}
                        onChange={e => updateCell(rowIdx, col.key, e.target.value)}
                        dir={dir}
                        className={cn(
                          'w-full rounded-md border border-slate-200 px-2 py-1.5',
                          'text-sm text-navy-900 bg-white',
                          'focus:outline-none focus:ring-2 focus:ring-gold-500/40',
                          lang === 'ar' && 'font-arabic'
                        )}
                      >
                        <option value="">—</option>
                        {likelihoodOpts.map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <textarea
                        value={row[col.key] ?? ''}
                        onChange={e => updateCell(rowIdx, col.key, e.target.value)}
                        dir={dir}
                        rows={2}
                        placeholder="—"
                        className={cn(
                          'w-full rounded-md border border-slate-200 px-2 py-1.5',
                          'text-sm text-navy-900 placeholder:text-slate-300 resize-none',
                          'focus:outline-none focus:ring-2 focus:ring-gold-500/40',
                          'transition-colors duration-150',
                          lang === 'ar' && 'font-arabic text-right'
                        )}
                      />
                    )}
                  </td>
                ))}
                <td className="px-2 py-2 align-top">
                  <button
                    onClick={() => deleteRow(rowIdx)}
                    disabled={rows.length === 1}
                    className="w-7 h-7 flex items-center justify-center rounded text-slate-300
                               hover:text-danger-500 hover:bg-danger-100
                               disabled:opacity-0 transition-colors"
                    aria-label="Delete row"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add row */}
      {rows.length < maxRows && (
        <button
          onClick={addRow}
          className={cn(
            'flex items-center gap-2 text-sm text-gold-600 font-medium',
            'hover:text-gold-700 transition-colors w-fit',
            lang === 'ar' && 'flex-row-reverse'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {lang === 'ar' ? 'إضافة صف' : 'Add row'}
        </button>
      )}

      {/* Save status */}
      <span className="text-xs text-slate-400">
        {saving ? (lang === 'ar' ? 'جاري الحفظ…' : 'Saving…') : lastSaved ? (lang === 'ar' ? 'تم الحفظ' : 'Saved') : ''}
      </span>

      {/* Actions */}
      <div className={cn('flex gap-3 mt-2', lang === 'ar' && 'flex-row-reverse')}>
        <button
          onClick={handleComplete}
          disabled={saving}
          className="flex-1 btn-primary py-3 text-sm"
        >
          {lang === 'ar' ? 'تم ← التالي' : 'Done — next card'}
        </button>
        {!card.required && (
          <button onClick={handleSkip} disabled={saving} className="btn-ghost py-3 text-sm px-4">
            {lang === 'ar' ? 'تخطّ' : 'Skip for now'}
          </button>
        )}
      </div>
    </div>
  )
}
