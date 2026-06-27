'use client'

import type { CardConfig, Language, Sector } from '@/types/cards'
import { useAutoSave } from '@/hooks/useAutoSave'

interface Props {
  card: CardConfig
  lang: Language
  studyId: string
  onComplete: (sector: Sector) => void
}

export default function SectorCard({ card, lang, studyId, onComplete }: Props) {
  const { save, saving } = useAutoSave(studyId)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  async function choose(sector: Sector) {
    await save({ card_id: card.id, answer: sector, status: 'done' })
    // Also persist sector on the study row
    await fetch(`/api/studies/${studyId}/sector`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sector }),
    })
    onComplete(sector)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
      <style>{`.sc-btn { transition: border-color 200ms, background 200ms, box-shadow 200ms; cursor: pointer; } .sc-btn:hover:not(:disabled) { border-color: var(--gold-500) !important; background: var(--gold-100) !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.1) !important; } .sc-btn:disabled { opacity:0.55; cursor:not-allowed; }`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {card.sector_options?.map(opt => (
          <button key={opt.value} onClick={() => choose(opt.value)} disabled={saving} className="sc-btn" dir={dir} style={{
            padding: '24px 20px', borderRadius: 14,
            border: '1.5px solid var(--border-default)', background: 'var(--bg-input)', cursor: 'pointer',
            textAlign: dir === 'rtl' ? 'right' : 'left',
          }}>
            {opt.icon && <div style={{ fontSize: 28, marginBottom: 10, lineHeight: 1 }}>{opt.icon}</div>}
            <div style={{
              fontFamily: lang === 'ar' ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif',
              fontSize: 17, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3,
            }}>
              {lang === 'ar' ? opt.label_ar : opt.label_en}
            </div>
            {lang !== 'ar' && (
              <div style={{ fontFamily: 'var(--font-arabic), sans-serif', fontSize: 13, color: 'var(--text-faint)', direction: 'rtl' }}>{opt.label_ar}</div>
            )}
            {lang === 'ar' && (
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>{opt.label_en}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
