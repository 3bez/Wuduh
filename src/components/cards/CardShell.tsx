'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CardConfig, Language } from '@/types/cards'
import { localise, getNextCard, getPrevCard, sectionLabel, ALL_CARDS, MANDATORY_CARDS } from '@/lib/cards/loader'
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
  const router  = useRouter()
  const content = localise(card, lang)
  const dir     = lang === 'ar' ? 'rtl' : 'ltr'
  const next    = getNextCard(card.id)
  const prev    = getPrevCard(card.id)
  const [leaving, setLeaving] = useState(false)

  // Card position in the overall sequence
  const cardIndex   = ALL_CARDS.findIndex(c => c.id === card.id)
  const totalCards  = ALL_CARDS.length
  const cardNum     = cardIndex + 1

  // Section info
  const isCover     = card.section === 'cover'
  const sectionName = isCover ? (lang === 'ar' ? 'الغلاف' : 'Cover') : sectionLabel(card.section, lang)

  function navigate(target: string | null) {
    if (!target) return
    setLeaving(true)
    setTimeout(() => {
      router.push(target)
    }, 180)
  }

  function goNext() {
    if (next) navigate(`/study/${studyId}?card=${next.id}`)
    else navigate(`/study/${studyId}/overview`)
  }

  function goPrev() {
    if (prev) navigate(`/study/${studyId}?card=${prev.id}`)
  }

  function handleLangComplete(chosenLang: Language) {
    navigate(`/study/${studyId}?card=${next?.id ?? 'C1'}&lang=${chosenLang}`)
    router.refresh()
  }

  return (
    <>
      <style>{`
        @keyframes card-in  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes card-out { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-10px); } }
        .card-shell-wrap {
          animation: card-in 260ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
        }
        .card-shell-wrap.leaving {
          animation: card-out 180ms ease-in both;
        }
        .cs-back-btn:hover { color: #36404D !important; }
        @media (prefers-reduced-motion: reduce) {
          .card-shell-wrap, .card-shell-wrap.leaving { animation: none !important; }
        }
      `}</style>

      <div className={`card-shell-wrap${leaving ? ' leaving' : ''}`}>

        {/* ── Card position eyebrow ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
            {/* Section pill */}
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
            {/* Category */}
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

          {/* Card counter + optional badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
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

        {/* ── The card itself ── */}
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

          {/* ── Input component ── */}
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

        {/* ── Hint panel — below the card ── */}
        {content.hint && card.type !== 'lang' && (
          <div style={{ marginBottom: 16 }}>
            <HintPanel hint={content.hint} lang={lang} />
          </div>
        )}

        {/* ── Back navigation ── */}
        {prev && card.type !== 'lang' && (
          <div style={{ textAlign: dir === 'rtl' ? 'right' : 'left', paddingTop: 4 }}>
            <button
              onClick={goPrev}
              className="cs-back-btn"
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
