'use client'

import type { CardConfig, Language } from '@/types/cards'
import { useAutoSave } from '@/hooks/useAutoSave'

interface Props { card: CardConfig; studyId: string; onComplete: (lang: Language) => void }

export default function LangCard({ card, studyId, onComplete }: Props) {
  const { save, saving } = useAutoSave(studyId)

  async function choose(lang: Language) {
    await save({ card_id: card.id, answer: lang, status: 'done' })
    onComplete(lang)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
      <style>{`.lc-btn { transition: border-color 200ms, background 200ms, box-shadow 200ms; cursor: pointer; } .lc-btn:hover:not(:disabled) { border-color: var(--gold-500) !important; background: var(--gold-100) !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.1) !important; } .lc-btn:disabled { opacity:0.55; cursor:not-allowed; }`}</style>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 4 }}>
        {card.en.helper}
      </p>
      {card.options?.map(opt => (
        <button key={opt.value} onClick={() => choose(opt.value as Language)} disabled={saving} dir={opt.dir} className="lc-btn" style={{
          width: '100%', padding: '20px 24px', borderRadius: 12,
          border: '1.5px solid var(--border-default)', background: 'var(--bg-input)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexDirection: opt.dir === 'rtl' ? 'row-reverse' : 'row',
        }}>
          <div style={{ textAlign: opt.dir === 'rtl' ? 'right' : 'left' }}>
            <div style={{
              fontFamily: opt.dir === 'rtl' ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif',
              fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3,
            }}>{opt.label_en}</div>
            <div style={{ fontFamily: 'var(--font-arabic), sans-serif', fontSize: 14, color: 'var(--text-faint)', direction: 'rtl' }}>{opt.label_ar}</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--border-strong)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d={opt.dir === 'rtl' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
          </svg>
        </button>
      ))}
    </div>
  )
}
