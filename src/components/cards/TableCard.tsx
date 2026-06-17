'use client'

import { useState, useCallback } from 'react'
import type { CardConfig, Language, TableColumn } from '@/types/cards'
import { localise } from '@/lib/cards/loader'
import { useAutoSave } from '@/hooks/useAutoSave'

type Row = Record<string, string>

interface Props {
  card: CardConfig; lang: Language; studyId: string
  initialRows?: Row[]; onComplete: (rows: Row[]) => void; onSkip: () => void
}

function emptyRow(cols: TableColumn[]): Row {
  return Object.fromEntries(cols.map(c => [c.key, '']))
}

export default function TableCard({ card, lang, studyId, initialRows, onComplete, onSkip }: Props) {
  const cols    = card.table_columns ?? []
  const maxRows = card.max_rows ?? 5
  const [rows, setRows] = useState<Row[]>(initialRows && initialRows.length > 0 ? initialRows : [emptyRow(cols)])
  const { save, saving, lastSaved } = useAutoSave(studyId)
  const content = localise(card, lang)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const isRiskTable = card.id === '8.1'
  const likelihoodOpts = card.likelihood_options?.[lang] ?? []

  const autoSave = useCallback((nextRows: Row[]) => save({ card_id: card.id, answer: nextRows, status: 'done' }, 600), [card.id, save])

  function updateCell(rowIdx: number, key: string, value: string) {
    const next = rows.map((r, i) => i === rowIdx ? { ...r, [key]: value } : r)
    setRows(next); autoSave(next)
  }

  function addRow() {
    if (rows.length >= maxRows) return
    const next = [...rows, emptyRow(cols)]; setRows(next); autoSave(next)
  }

  function deleteRow(idx: number) {
    const next = rows.filter((_, i) => i !== idx)
    const final = next.length === 0 ? [emptyRow(cols)] : next
    setRows(final); autoSave(final)
  }

  async function handleComplete() {
    const filled = rows.filter(r => Object.values(r).some(v => v.trim()))
    await save({ card_id: card.id, answer: filled, status: 'done' })
    onComplete(filled)
  }

  async function handleSkip() {
    await save({ card_id: card.id, answer: null, status: 'skipped' }); onSkip()
  }

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
      `}</style>

      <div style={{ border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
              {cols.map(col => (
                <th key={col.key} style={{
                  width: `${col.width_pct}%`, padding: '10px 12px',
                  textAlign: dir === 'rtl' ? 'right' : 'left',
                  fontFamily: 'var(--font-mono), monospace', fontSize: 10,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--text-faint)', fontWeight: 500,
                }}>{col[lang]}</th>
              ))}
              <th style={{ width: 36 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} style={{ borderBottom: rowIdx < rows.length - 1 ? '1px solid var(--border-subtle)' : undefined }}>
                {cols.map(col => (
                  <td key={col.key} style={{ padding: '8px 8px', verticalAlign: 'top' }}>
                    {isRiskTable && col.key === 'likelihood' ? (
                      <select value={row[col.key] ?? ''} onChange={e => updateCell(rowIdx, col.key, e.target.value)} className="tbl-cell" dir={dir} style={{ width: '100%', borderRadius: 7, padding: '8px 10px', fontSize: 13, transition: 'border-color 140ms, box-shadow 140ms', fontFamily: lang === 'ar' ? 'var(--font-arabic), sans-serif' : 'var(--font-sans), sans-serif' }}>
                        <option value="">—</option>
                        {likelihoodOpts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <textarea value={row[col.key] ?? ''} onChange={e => updateCell(rowIdx, col.key, e.target.value)} className="tbl-cell" dir={dir} rows={2} placeholder="—" style={{ width: '100%', borderRadius: 7, padding: '8px 10px', fontSize: 13, resize: 'none', transition: 'border-color 140ms, box-shadow 140ms', fontFamily: lang === 'ar' ? 'var(--font-arabic), sans-serif' : 'var(--font-sans), sans-serif', textAlign: dir === 'rtl' ? 'right' : 'left' }} />
                    )}
                  </td>
                ))}
                <td style={{ padding: '8px 6px', verticalAlign: 'top' }}>
                  <button className="tbl-del" onClick={() => deleteRow(rowIdx)} disabled={rows.length === 1} aria-label="Delete row" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--border-strong)', cursor: rows.length === 1 ? 'not-allowed' : 'pointer', opacity: rows.length === 1 ? 0 : 1, transition: 'opacity 140ms, color 140ms, background 140ms' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length < maxRows && (
        <button onClick={addRow} className="tbl-add" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--gold-500)', padding: 0, transition: 'color 140ms', flexDirection: dir === 'rtl' ? 'row-reverse' : 'row', fontFamily: 'var(--font-sans), sans-serif' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M12 4v16m8-8H4" /></svg>
          {lang === 'ar' ? 'إضافة صف' : 'Add row'}
        </button>
      )}

      <div style={{ minHeight: 16 }}>
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: saving ? 'var(--gold-500)' : 'var(--text-hint)' }}>
          {saving ? (lang === 'ar' ? '· جاري الحفظ…' : '· Saving…') : lastSaved ? (lang === 'ar' ? '· تم الحفظ' : '· Saved') : ''}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
        <button className="tbl-done" onClick={handleComplete} disabled={saving} style={{ flex: 1, background: 'var(--text-primary)', color: 'var(--bg-page)', border: 'none', borderRadius: 9, padding: '13px 0', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'opacity 140ms', fontFamily: 'var(--font-sans), sans-serif' }}>
          {lang === 'ar' ? 'تم — البطاقة التالية' : 'Done — next card'}
        </button>
        {!card.required && (
          <button className="tbl-skip" onClick={handleSkip} disabled={saving} style={{ background: 'transparent', border: '1.5px solid var(--border-default)', borderRadius: 9, padding: '13px 16px', fontSize: 13, color: 'var(--text-faint)', cursor: 'pointer', transition: 'color 140ms, background 140ms', fontFamily: 'var(--font-sans), sans-serif', whiteSpace: 'nowrap' }}>
            {lang === 'ar' ? 'تخطّ' : 'Skip for now'}
          </button>
        )}
      </div>
    </div>
  )
}
