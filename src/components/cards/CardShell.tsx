'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { CardConfig, Language } from '@/types/cards'
import { localise, getNextCard, getPrevCard, sectionLabel, ALL_CARDS } from '@/lib/cards/loader'
import HintPanel from './HintPanel'
import LangCard from './LangCard'
import TextCard from './TextCard'
import TableCard from './TableCard'
import UploadCard from './UploadCard'

interface Props {
  card: CardConfig
  lang: Language
  studyId: string
  userId: string
  existingAnswer?: unknown
  completionPct: number
}

export default function CardShell({ card, lang, studyId, userId, existingAnswer, completionPct }: Props) {
  const router      = useRouter()
  const content     = localise(card, lang)
  const dir         = lang === 'ar' ? 'rtl' : 'ltr'
  const next        = getNextCard(card.id)
  const prev        = getPrevCard(card.id)

  // Animate in whenever card.id changes — key-based reset via CSS
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    // Small delay so the browser has painted before animating in
    const t = setTimeout(() => setVisible(true), 20)
    return () => clearTimeout(t)
  }, [card.id])

  // Card position
  const cardIndex  = ALL_CARDS.findIndex(c => c.id === card.id)
  const totalCards = ALL_CARDS.length
  const cardNum    = cardIndex + 1

  // Section info
  const isCover     = card.section === 'cover'
  const sectionName = isCover
    ? (lang === 'ar' ? 'الغلاف' : 'Cover')
    : sectionLabel(card.section, lang)

  function goNext() {
    setVisible(false)
    setTimeout(() => {
      if (next) router.push(`/study/${studyId}?card=${next.id}`)
      else router.push(`/study/${studyId}/overview`)
    }, 150)
  }

  function goPrev() {
    if (!prev) return
    setVisible(false)
    setTimeout(() => router.push(`/study/${studyId}?card=${prev.id}`), 150)
  }

  function handleLangComplete(chosenLang: Language) {
    setVisible(false)
    setTimeout(() => {
      router.push(`/study/${studyId}?card=${next?.id ?? 'C1'}&lang=${chosenLang}`)
      router.refresh()
    }, 150)
  }

  return (
    <>
      <style>{`
        @keyframes cs-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cs-wrap {
          opacity: 0;
          transition: opacity 150ms ease-out, transform 150ms ease-out;
        }
        .cs-wrap.visible {
          animation: cs-in 240ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
          opacity: 1;
        }
        .cs-wrap.hidden {
          opacity: 0;
          transform: translateY(-8px);
          transition: opacity 150ms ease-in, transform 150ms ease-in;
        }
        .cs-back:hover { color: #36404D !important; }
        @media (prefers-reduced-motion: reduce) {
          .cs-wrap, .cs-wrap.visible, .cs-wrap.hidden { animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <div
        key={card.id}
        className={`cs-wrap${visible ? ' visible' : ' hidden'}`}
      >
        {/* ── Eyebrow row ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#A6852F',
              background: '#F6EEDB',
              padding: '3px 10px',
              borderRadius: 99,
            }}>
              {sectionName}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#8795A6',
            }}>
              {content.category}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
          }}>
            {!card.required && (
              <span style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 10,
                letterSpacing: '0.06em',
                color: '#8795A6',
                border: '1px solid #D4DBE3',
                padding: '2px 8px',
                borderRadius: 99,
              }}>
                {lang === 'ar' ? 'اختياري' : 'Optional'}
              </span>
            )}
            <span style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 11,
              color: '#B4BFCB',
              letterSpacing: '0.04em',
            }}>
              {String(cardNum).padStart(2, '0')} / {String(totalCards).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* ── Card white box ── */}
        <div style={{
          background: '#fff',
          border: '1px solid #E8ECF1',
          borderRadius: 22,
          boxShadow: '0 4px 24px rgba(13,27,42,0.07), 0 1px 4px rgba(13,27,42,0.04)',
          padding: '32px 32px 28px',
          marginBottom: 16,
        }}>
          {/* Prompt */}
          <h2 style={{
            fontFamily: lang === 'ar'
              ? 'var(--font-arabic), "IBM Plex Sans Arabic", sans-serif'
              : 'var(--font-display), "IBM Plex Serif", serif',
            fontSize: 22,
            fontWeight: 500,
            color: '#0D1B2A',
            letterSpacing: lang === 'ar' ? 0 : '-0.015em',
            lineHeight: 1.3,
            marginBottom: content.helper && card.type !== 'lang' ? 10 : 24,
            textAlign: dir === 'rtl' ? 'right' : 'left',
          }}>
            {content.prompt}
          </h2>

          {/* Helper */}
          {content.helper && card.type !== 'lang' && (
            <p style={{
              fontSize: 14,
              color: '#647183',
              lineHeight: 1.65,
              marginBottom: 24,
              textAlign: dir === 'rtl' ? 'right' : 'left',
              fontFamily: lang === 'ar' ? 'var(--font-arabic), sans-serif' : undefined,
            }}>
              {content.helper}
            </p>
          )}

          {/* ── Input ── */}
          {card.type === 'lang' && (
            <LangCard card={card} studyId={studyId} onComplete={handleLangComplete} />
          )}
          {card.type === 'text' && (
            <TextCard
              card={card}
              lang={lang}
              studyId={studyId}
              initialValue={typeof existingAnswer === 'string' ? existingAnswer : ''}
              onComplete={goNext}
              onSkip={goNext}
            />
          )}
          {card.type === 'table' && (
            <TableCard
              card={card}
              lang={lang}
              studyId={studyId}
              initialRows={Array.isArray(existingAnswer) ? existingAnswer as Record<string, string>[] : undefined}
              onComplete={goNext}
              onSkip={goNext}
            />
          )}
          {card.type === 'upload' && (
            <UploadCard
              card={card}
              lang={lang}
              studyId={studyId}
              userId={userId}
              initialUrl={typeof existingAnswer === 'string' ? existingAnswer : undefined}
              onComplete={goNext}
              onSkip={goNext}
            />
          )}
        </div>

        {/* ── Hint ── */}
        {content.hint && card.type !== 'lang' && (
          <div style={{ marginBottom: 16 }}>
            <HintPanel hint={content.hint} lang={lang} />
          </div>
        )}

        {/* ── Back nav ── */}
        {prev && card.type !== 'lang' && (
          <div style={{ textAlign: dir === 'rtl' ? 'right' : 'left', paddingTop: 4 }}>
            <button
              onClick={goPrev}
              className="cs-back"
              style={{
                background: 'none',
                border: 'none',
                fontSize: 12,
                color: '#B4BFCB',
                cursor: 'pointer',
                padding: 0,
                transition: 'color 140ms',
                fontFamily: 'var(--font-sans), sans-serif',
              }}
            >
              {lang === 'ar' ? '→ السابق' : '← Previous card'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
