'use client'

import { useState } from 'react'
import type { CardConfig, Language } from '@/types/cards'
import { localise } from '@/lib/cards/loader'
import { useAutoSave } from '@/hooks/useAutoSave'

interface Props {
  card: CardConfig
  lang: Language
  studyId: string
  initialValue?: string
  onComplete: (value: string) => void
  onSkip: () => void
}

export default function TextCard({ card, lang, studyId, initialValue = '', onComplete, onSkip }: Props) {
  const [value, setValue] = useState(initialValue)
  const { save, saving, lastSaved } = useAutoSave(studyId)
  const content = localise(card, lang)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const maxLen = card.max_length ?? 1000
  const pct = Math.min(100, Math.round((value.length / maxLen) * 100))

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    save({ card_id: card.id, answer: e.target.value, status: 'done' }, 800)
  }

  function handleBlur() {
    if (value.trim()) save({ card_id: card.id, answer: value, status: 'done' })
  }

  async function handleComplete() {
    await save({ card_id: card.id, answer: value, status: 'done' })
    onComplete(value)
  }

  async function handleSkip() {
    await save({ card_id: card.id, answer: value || null, status: 'skipped' })
    onSkip()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} dir={dir}>
      <style>{`
        .tc-textarea:focus { border-color: rgba(201,168,76,0.6) !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.1) !important; outline: none !important; }
        .tc-done:hover:not(:disabled) { background: #132A40 !important; }
        .tc-done:disabled { opacity: 0.55; cursor: not-allowed; }
        .tc-skip:hover:not(:disabled) { color: #36404D !important; background: #F4F6F8 !important; }
      `}</style>

      {/* Example block */}
      {content.example && (
        <div style={{
          background: '#F4F6F8',
          border: '1px solid #E8ECF1',
          borderRadius: 8,
          padding: '10px 14px',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 9,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#8795A6',
            marginBottom: 5,
          }}>
            {lang === 'ar' ? 'مثال' : 'Example'}
          </p>
          <p style={{
            fontSize: 13,
            color: '#4A5666',
            lineHeight: 1.6,
            fontStyle: 'italic',
            fontFamily: lang === 'ar' ? 'var(--font-arabic), sans-serif' : undefined,
            textAlign: dir === 'rtl' ? 'right' : 'left',
          }}>
            {content.example}
          </p>
        </div>
      )}

      {/* Textarea */}
      <div style={{ position: 'relative' }}>
        <textarea
          className="tc-textarea"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          dir={dir}
          rows={6}
          maxLength={maxLen}
          placeholder={lang === 'ar' ? 'اكتب إجابتك هنا…' : 'Write your answer here…'}
          style={{
            width: '100%',
            border: '1.5px solid #D4DBE3',
            borderRadius: 10,
            padding: '13px 16px',
            paddingBottom: 36,
            fontSize: 15,
            color: '#0D1B2A',
            background: '#fff',
            resize: 'none',
            lineHeight: 1.6,
            transition: 'border-color 140ms, box-shadow 140ms',
            fontFamily: lang === 'ar'
              ? 'var(--font-arabic), "IBM Plex Sans Arabic", sans-serif'
              : 'var(--font-sans), "IBM Plex Sans", sans-serif',
            textAlign: dir === 'rtl' ? 'right' : 'left',
          }}
        />
        {/* Character bar */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: dir === 'rtl' ? 'auto' : 14,
          right: dir === 'rtl' ? 14 : 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{ width: 64, height: 3, background: '#E8ECF1', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              borderRadius: 99,
              background: pct > 90 ? '#C0492F' : '#C9A84C',
              transition: 'width 200ms, background 200ms',
            }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 10,
            color: pct > 90 ? '#C0492F' : '#B4BFCB',
          }}>
            {value.length} / {maxLen}
          </span>
        </div>
      </div>

      {/* Save indicator */}
      <div style={{ minHeight: 16 }}>
        <span style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: 11,
          color: saving ? '#C9A84C' : '#B4BFCB',
        }}>
          {saving
            ? (lang === 'ar' ? '· جاري الحفظ…' : '· Saving…')
            : lastSaved
            ? (lang === 'ar' ? '· تم الحفظ' : '· Saved')
            : ''}
        </span>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: 10,
        flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
      }}>
        <button
          className="tc-done"
          onClick={handleComplete}
          disabled={saving}
          style={{
            flex: 1,
            background: '#0D1B2A',
            color: '#EEF3F7',
            border: 'none',
            borderRadius: 9,
            padding: '13px 0',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 140ms',
            fontFamily: 'var(--font-sans), sans-serif',
          }}
        >
          {lang === 'ar' ? 'تم — البطاقة التالية' : 'Done — next card'}
        </button>

        {!card.required && (
          <button
            className="tc-skip"
            onClick={handleSkip}
            disabled={saving}
            style={{
              background: 'transparent',
              border: '1.5px solid #E8ECF1',
              borderRadius: 9,
              padding: '13px 16px',
              fontSize: 13,
              color: '#8795A6',
              cursor: 'pointer',
              transition: 'color 140ms, background 140ms',
              fontFamily: 'var(--font-sans), sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            {lang === 'ar' ? 'تخطّ' : 'Skip for now'}
          </button>
        )}
      </div>
    </div>
  )
}
