'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import Link from 'next/link'
import { useLocale } from '@/components/ui/LocaleProvider'
import LocaleToggle from '@/components/ui/LocaleToggle'
import { landingCopy, type LandingDict, type PhoneCard } from '@/lib/i18n/landing'
import { localizeDigits } from '@/lib/i18n/digits'
import type { Language } from '@/types/cards'

// ── Logo mark ──────────────────────────────────────────────────────────────
function LogoMark({ size = 28, onDark = false }: { size?: number; onDark?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" />
      <path
        d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81"
        stroke={onDark ? '#AEC6D9' : '#0D1B2A'}
        strokeWidth="7.8"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ── Geometric net pattern ──────────────────────────────────────────────────
function GeometricNet({
  id,
  color = '#C9A84C',
  opacity = 0.2,
  size = 64,
}: {
  id: string
  color?: string
  opacity?: number
  size?: number
}) {
  const half = size / 2
  const q1 = size * 0.25
  const q3 = size * 0.75
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id={id} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth="1" strokeOpacity={opacity}>
            <rect x={q1} y={q1} width={half} height={half} />
            <rect
              x={size * 0.353}
              y={size * 0.353}
              width={half}
              height={half}
              transform={`rotate(45 ${half} ${half})`}
              strokeOpacity={opacity * 0.6}
            />
            <path
              d={`M${half} 0L${half} ${q1}M${half} ${q3}L${half} ${size}M0 ${half}L${q1} ${half}M${q3} ${half}L${size} ${half}`}
              strokeOpacity={opacity * 0.65}
            />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

// ── Animated phone card carousel ───────────────────────────────────────────
// Structural metadata (card index + progress %) — identical across languages.
const PHONE_META = [
  { n: '01', pct: 2 },
  { n: '04', pct: 7 },
  { n: '08', pct: 15 },
  { n: '19', pct: 36 },
  { n: '47', pct: 90 },
]

function PhoneCarousel({ cards, skipLabel, nextLabel, locale }: { cards: PhoneCard[]; skipLabel: string; nextLabel: string; locale: Language }) {
  const [idx, setIdx] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIdx(i => (i + 1) % PHONE_META.length)
        setFading(false)
      }, 300)
    }, 2800)
    return () => clearInterval(t)
  }, [])

  const meta = PHONE_META[idx]
  const card = cards[idx]

  return (
    <div className="lp-phone-frame">
      <div className="lp-phone-screen">
        <div className="lp-phone-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <LogoMark size={18} onDark={false} />
            <span className="lp-phone-brand-name">Wuduh</span>
          </div>
          <span className="lp-phone-count">{localizeDigits(meta.n, locale)} / {localizeDigits(52, locale)}</span>
        </div>
        <div className="lp-phone-progress">
          <div className="lp-phone-progress-fill" style={{ width: `${meta.pct}%` }} />
        </div>
        <div className="lp-phone-card-wrap">
          <div
            className="lp-phone-card"
            style={{
              opacity: fading ? 0 : 1,
              transform: fading ? 'translateY(8px)' : 'translateY(0)',
              transition: 'opacity 300ms, transform 300ms',
            }}
          >
            <span className="lp-phone-cat">{card.cat}</span>
            <h3 className="lp-phone-q">{card.q}</h3>
            <p className="lp-phone-help">{card.help}</p>
            <div className="lp-phone-swipe">
              <span className="lp-phone-skip">{skipLabel}</span>
              <span className="lp-phone-next">{nextLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Contact form ───────────────────────────────────────────────────────────
function ContactForm({ c }: { c: LandingDict['contact'] }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? c.form.errorFailed)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : c.form.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="lp-contact-success">
        <div className="lp-contact-success-icon">✓</div>
        <h3 className="lp-contact-success-title">{c.success.title}</h3>
        <p className="lp-contact-success-body">{c.success.body}</p>
      </div>
    )
  }

  return (
    <form className="lp-contact-form" onSubmit={handleSubmit}>
      <div className="lp-contact-field">
        <label className="lp-contact-label" htmlFor="cf-name">{c.form.nameLabel}</label>
        <input
          id="cf-name"
          name="name"
          type="text"
          required
          className="lp-contact-input"
          placeholder={c.form.namePlaceholder}
          value={form.name}
          onChange={handleChange}
        />
      </div>
      <div className="lp-contact-field">
        <label className="lp-contact-label" htmlFor="cf-email">{c.form.emailLabel}</label>
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          className="lp-contact-input"
          placeholder={c.form.emailPlaceholder}
          value={form.email}
          onChange={handleChange}
          dir="ltr"
        />
      </div>
      <div className="lp-contact-field">
        <label className="lp-contact-label" htmlFor="cf-message">{c.form.messageLabel}</label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          className="lp-contact-input lp-contact-textarea"
          placeholder={c.form.messagePlaceholder}
          value={form.message}
          onChange={handleChange}
        />
      </div>
      <button type="submit" className="lp-btn-accent lp-contact-submit" disabled={loading}>
        {loading ? c.form.sending : c.form.submit}
      </button>
      {error && (
        <p style={{ fontSize: 13, color: '#E07060', marginTop: 8 }}>{error}</p>
      )}
    </form>
  )
}

// ── Multi-line heading helper ──────────────────────────────────────────────
function MultiLine({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  )
}

// ── Main landing page ──────────────────────────────────────────────────────
export default function LandingPage() {
  const { locale, dir } = useLocale()
  const t = landingCopy[locale]
  const contactRef = useRef<HTMLElement>(null)

  function scrollToContact(e: React.MouseEvent) {
    e.preventDefault()
    contactRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const heroLines = t.hero.h1Pre.split('\n')

  return (
    <>
      <style>{`
        /* ── NAV ── */
        .lp-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(13,27,42,0.97); backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(174,198,217,0.1);
          padding: 0 40px; height: 60px;
          display: flex; align-items: center; gap: 20px;
        }
        .lp-nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .lp-nav-name {
          font-family: var(--font-display), 'IBM Plex Serif', serif;
          font-weight: 600; font-size: 18px; color: #fff; letter-spacing: -0.01em;
        }
        .lp-nav-links { display: flex; gap: 24px; margin-inline-start: auto; margin-inline-end: 20px; align-items: center; }
        .lp-nav-link {
          font-size: 13px; color: #AEC6D9; text-decoration: none;
          letter-spacing: 0.01em; transition: color 140ms;
        }
        .lp-nav-link:hover { color: #fff; }
        .lp-nav-cta {
          font-size: 13px; font-weight: 500;
          background: #C9A84C; color: #0D1B2A;
          border: none; border-radius: 7px; padding: 8px 18px;
          cursor: pointer; transition: background 140ms; text-decoration: none; display: inline-block;
        }
        .lp-nav-cta:hover { background: #D6BC72; }

        /* ── HERO ── */
        .lp-hero {
          background: #0D1B2A; min-height: 580px;
          display: grid; grid-template-columns: 1fr 1fr;
          align-items: center; padding: 72px 64px;
          position: relative; overflow: hidden; gap: 40px;
        }
        .lp-hero-left { position: relative; z-index: 2; padding-inline-end: 40px; }
        .lp-eyebrow {
          font-family: var(--font-mono), 'IBM Plex Mono', monospace;
          font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
          color: #C9A84C; margin-bottom: 20px;
        }
        .lp-h1 {
          font-family: var(--font-display), 'IBM Plex Serif', serif;
          font-weight: 500; font-size: 46px; line-height: 1.08;
          letter-spacing: -0.025em; color: #fff; margin-bottom: 18px;
        }
        .lp-h1 em { color: #D6BC72; font-style: normal; }
        .lp-hero-sub { font-size: 16px; line-height: 1.65; color: #AEC6D9; max-width: 440px; margin-bottom: 32px; }
        .lp-hero-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .lp-btn-accent {
          display: inline-flex; align-items: center; gap: 8px;
          background: #C9A84C; color: #0D1B2A;
          font-family: var(--font-sans), sans-serif;
          font-size: 15px; font-weight: 600;
          border: none; border-radius: 9px; padding: 13px 26px;
          cursor: pointer; transition: background 140ms, box-shadow 140ms;
          box-shadow: 0 4px 16px rgba(201,168,76,0.25); text-decoration: none;
        }
        .lp-btn-accent:hover { background: #D6BC72; box-shadow: 0 8px 24px rgba(201,168,76,0.35); }
        .lp-btn-accent:disabled { opacity: 0.6; cursor: not-allowed; }
        .lp-btn-ghost-light {
          display: inline-flex; align-items: center; gap: 6px;
          background: transparent; color: #D7E3EC; font-size: 14px;
          border: 1.5px solid rgba(174,198,217,0.3); border-radius: 9px; padding: 12px 22px;
          cursor: pointer; transition: border-color 140ms, color 140ms; text-decoration: none;
        }
        .lp-btn-ghost-light:hover { border-color: rgba(174,198,217,0.6); color: #fff; }
        .lp-hero-proof {
          margin-top: 36px; display: flex; align-items: center; gap: 16px;
          font-family: var(--font-mono), 'IBM Plex Mono', monospace;
          font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
          color: #4D7CA3; flex-wrap: wrap;
        }
        .lp-proof-dot { width: 4px; height: 4px; border-radius: 50%; background: #244C6E; display: inline-block; }
        .lp-hero-right { position: relative; z-index: 2; display: flex; justify-content: center; align-items: center; }

        /* ── PHONE ── */
        .lp-phone-frame {
          width: 268px; background: #F4F6F8; border-radius: 36px; padding: 12px;
          box-shadow: 0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
        }
        .lp-phone-screen { background: #F4F6F8; border-radius: 26px; overflow: hidden; display: flex; flex-direction: column; }
        .lp-phone-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px 8px; background: #fff; border-bottom: 1px solid #E8ECF1;
        }
        .lp-phone-brand-name { font-family: var(--font-display), serif; font-weight: 600; font-size: 14px; color: #0D1B2A; }
        .lp-phone-count { font-family: var(--font-mono), monospace; font-size: 10px; color: #8795A6; letter-spacing: 0.04em; }
        .lp-phone-progress { height: 3px; background: #E8ECF1; margin: 0 16px; border-radius: 99px; overflow: hidden; }
        .lp-phone-progress-fill { height: 100%; background: #C9A84C; border-radius: 99px; transition: width 600ms cubic-bezier(0.22,0.61,0.36,1); }
        .lp-phone-card-wrap { padding: 14px 14px 18px; }
        .lp-phone-card {
          background: #fff; border: 1px solid #D4DBE3; border-radius: 18px;
          box-shadow: 0 4px 12px rgba(13,27,42,0.08);
          padding: 18px 16px 20px; min-height: 188px; display: flex; flex-direction: column;
        }
        .lp-phone-cat {
          font-family: var(--font-mono), monospace; font-size: 9px;
          letter-spacing: 0.1em; text-transform: uppercase; color: #8A6F26;
          margin-bottom: 12px; background: #F6EEDB; padding: 3px 8px;
          border-radius: 99px; display: inline-block; align-self: flex-start;
        }
        .lp-phone-q {
          font-family: var(--font-display), serif; font-size: 16px; line-height: 1.28;
          letter-spacing: -0.01em; color: #0D1B2A; margin-bottom: 10px; font-weight: 500;
        }
        .lp-phone-help { font-size: 11.5px; color: #8795A6; line-height: 1.5; margin-bottom: 14px; flex: 1; }
        .lp-phone-swipe { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid #E8ECF1; }
        .lp-phone-skip { font-size: 10.5px; color: #8795A6; }
        .lp-phone-next { font-size: 10.5px; font-weight: 500; background: #0D1B2A; color: #fff; padding: 5px 12px; border-radius: 6px; }

        /* ── SHARED SECTION STYLES ── */
        .lp-section-inner { max-width: 920px; margin: 0 auto; }
        .lp-section-eyebrow {
          font-family: var(--font-mono), monospace;
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          color: #A6852F; margin-bottom: 14px;
        }
        .lp-section-h2 {
          font-family: var(--font-display), serif; font-weight: 500; font-size: 38px;
          line-height: 1.12; letter-spacing: -0.02em; color: var(--text-primary); margin-bottom: 12px;
        }
        .lp-section-sub { font-size: 16px; color: var(--text-muted); max-width: 520px; line-height: 1.65; margin-bottom: 56px; }

        /* ── HOW IT WORKS ── */
        .lp-how { background: var(--bg-surface); padding: 88px 64px; }
        .lp-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .lp-step { position: relative; padding-top: 4px; }
        .lp-step-num { font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.1em; color: #C9A84C; margin-bottom: 12px; display: block; }
        .lp-step-title { font-family: var(--font-display), serif; font-size: 20px; font-weight: 500; color: var(--text-primary); margin-bottom: 8px; line-height: 1.2; }
        .lp-step-body { font-size: 14px; color: var(--text-muted); line-height: 1.65; }
        .lp-step-divider { position: absolute; top: 28px; inset-inline-end: -20px; width: 40px; height: 1px; background: var(--border-default); }

        /* ── EXPORT ── */
        .lp-export { background: var(--bg-subtle); padding: 88px 64px; border-top: 1px solid var(--border-default); border-bottom: 1px solid var(--border-default); }
        .lp-export-inner { max-width: 920px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .lp-check-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-top: 8px; padding: 0; }
        .lp-check-li { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--text-muted); line-height: 1.5; }
        .lp-check-circle { width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; margin-top: 1px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; background: #F6EEDB; color: #8A6F26; }
        .lp-doc { background: #FAF7F0; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 24px 56px rgba(13,27,42,0.14), 0 4px 12px rgba(13,27,42,0.06); }
        .lp-doc-inner { position: relative; padding: 32px 36px; }
        .lp-doc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #EAE3D2; }
        .lp-doc-brand { display: flex; align-items: center; gap: 8px; }
        .lp-doc-brand-name { font-family: var(--font-display), serif; font-weight: 600; font-size: 13px; color: #0D1B2A; }
        .lp-doc-label { font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: #8795A6; }
        .lp-doc-eyebrow { font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #A6852F; margin-bottom: 6px; }
        .lp-doc-title { font-family: var(--font-display), serif; font-weight: 600; font-size: 20px; line-height: 1.2; letter-spacing: -0.01em; color: #0D1B2A; margin-bottom: 4px; }
        .lp-doc-rule { width: 40px; height: 3px; background: #C9A84C; border-radius: 99px; margin: 14px 0 18px; }
        .lp-doc-section { margin-bottom: 16px; }
        .lp-doc-section-head { font-weight: 600; font-size: 11px; color: #0D1B2A; margin-bottom: 8px; }
        .lp-doc-line { height: 5px; border-radius: 99px; background: #EAE3D2; margin-bottom: 6px; }

        /* ── WHO ── */
        .lp-for { background: var(--bg-surface); padding: 88px 64px; }
        .lp-for-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 52px; }
        .lp-for-card { border: 1px solid var(--border-default); border-radius: 16px; padding: 32px 32px 36px; background: var(--bg-surface); }
        .lp-for-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .lp-for-label { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
        .lp-for-title { font-family: var(--font-display), serif; font-size: 21px; font-weight: 500; color: var(--text-primary); margin-bottom: 12px; line-height: 1.2; }
        .lp-for-body { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin-bottom: 22px; }
        .lp-for-list { list-style: none; display: flex; flex-direction: column; gap: 9px; padding: 0; }
        .lp-for-li { display: flex; align-items: flex-start; gap: 9px; font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; }
        .lp-for-check { width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; margin-top: 1px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }

        /* ── STATS ── */
        .lp-stats { background: #0D1B2A; padding: 72px 64px; position: relative; overflow: hidden; }
        .lp-stats-inner { max-width: 920px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; position: relative; }
        .lp-stat { text-align: center; }
        .lp-stat-num { font-family: var(--font-display), serif; font-size: 52px; font-weight: 500; color: #fff; letter-spacing: -0.03em; line-height: 1; margin-bottom: 10px; }
        .lp-stat-num span { color: #C9A84C; }
        .lp-stat-label { font-size: 14px; color: #7BA0BF; line-height: 1.5; }

        /* ── CTA ── */
        .lp-cta { background: var(--bg-subtle); padding: 88px 64px; border-top: 1px solid var(--border-default); }
        .lp-cta-inner { max-width: 640px; margin: 0 auto; text-align: center; }
        .lp-cta-arabic { font-family: var(--font-arabic), 'IBM Plex Sans Arabic', sans-serif; font-size: 15px; color: var(--text-faint); direction: rtl; margin-bottom: 24px; }
        .lp-cta-h2 { font-family: var(--font-display), serif; font-weight: 500; font-size: 38px; line-height: 1.1; letter-spacing: -0.02em; color: var(--text-primary); margin-bottom: 14px; }
        .lp-cta-sub { font-size: 15px; color: var(--text-muted); margin-bottom: 32px; line-height: 1.65; }
        .lp-cta-disclaimer { font-size: 12px; color: var(--text-faint); margin-top: 14px; }

        /* ── CONTACT ── */
        .lp-contact { background: #0D1B2A; padding: 88px 64px; position: relative; overflow: hidden; }
        .lp-contact-inner { max-width: 920px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; position: relative; }
        .lp-contact-h2 { font-family: var(--font-display), serif; font-weight: 500; font-size: 36px; line-height: 1.12; letter-spacing: -0.02em; color: #fff; margin-bottom: 16px; }
        .lp-contact-body { font-size: 15px; color: #7BA0BF; line-height: 1.7; margin-bottom: 32px; }
        .lp-contact-details { display: flex; flex-direction: column; gap: 16px; }
        .lp-contact-detail { display: flex; align-items: flex-start; gap: 12px; }
        .lp-contact-detail-icon { width: 36px; height: 36px; border-radius: 8px; background: rgba(174,198,217,0.08); border: 1px solid rgba(174,198,217,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .lp-contact-detail-text { display: flex; flex-direction: column; gap: 2px; }
        .lp-contact-detail-label { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #4D7CA3; }
        .lp-contact-detail-value { font-size: 14px; color: #AEC6D9; }
        .lp-contact-detail-value a { color: #C9A84C; text-decoration: none; }
        .lp-contact-detail-value a:hover { color: #D6BC72; }
        .lp-contact-form { display: flex; flex-direction: column; gap: 18px; }
        .lp-contact-field { display: flex; flex-direction: column; gap: 6px; }
        .lp-contact-label { font-size: 13px; font-weight: 500; color: #AEC6D9; }
        .lp-contact-input {
          background: rgba(255,255,255,0.05); border: 1.5px solid rgba(174,198,217,0.18);
          border-radius: 8px; padding: 11px 14px;
          font-family: var(--font-sans), sans-serif; font-size: 14px; color: #fff;
          outline: none; transition: border-color 140ms; width: 100%;
        }
        .lp-contact-input::placeholder { color: rgba(174,198,217,0.35); }
        .lp-contact-input:focus { border-color: rgba(201,168,76,0.55); }
        .lp-contact-textarea { resize: vertical; min-height: 120px; }
        .lp-contact-submit { width: 100%; justify-content: center; margin-top: 4px; }
        .lp-contact-success { text-align: center; padding: 48px 20px; }
        .lp-contact-success-icon { width: 48px; height: 48px; border-radius: 50%; background: rgba(13,148,136,0.15); color: #2EB3A6; font-size: 22px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .lp-contact-success-title { font-family: var(--font-display), serif; font-size: 22px; font-weight: 500; color: #fff; margin-bottom: 8px; }
        .lp-contact-success-body { font-size: 14px; color: #7BA0BF; line-height: 1.65; }

        /* ── FOOTER ── */
        .lp-footer { background: #0A1622; padding: 40px 64px; border-top: 1px solid rgba(174,198,217,0.08); }
        .lp-footer-inner { max-width: 920px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .lp-footer-brand { display: flex; align-items: center; gap: 10px; }
        .lp-footer-brand-name { font-family: var(--font-display), serif; font-weight: 600; font-size: 16px; color: #fff; }
        .lp-footer-arabic { font-family: var(--font-arabic), sans-serif; font-size: 14px; color: #C9A84C; direction: rtl; }
        .lp-footer-links { display: flex; gap: 22px; }
        .lp-footer-link { font-size: 13px; color: #4D7CA3; text-decoration: none; transition: color 140ms; }
        .lp-footer-link:hover { color: #AEC6D9; }
        .lp-footer-copy { font-family: var(--font-mono), monospace; font-size: 11px; color: #244C6E; letter-spacing: 0.04em; }

        /* ── RTL — Arabic typography (cursive script: no letter-spacing / uppercase) ── */
        [dir='rtl'] .lp-h1,
        [dir='rtl'] .lp-phone-q,
        [dir='rtl'] .lp-section-h2,
        [dir='rtl'] .lp-step-title,
        [dir='rtl'] .lp-doc-title,
        [dir='rtl'] .lp-for-title,
        [dir='rtl'] .lp-stat-num,
        [dir='rtl'] .lp-cta-h2,
        [dir='rtl'] .lp-contact-h2,
        [dir='rtl'] .lp-contact-success-title,
        [dir='rtl'] .lp-eyebrow,
        [dir='rtl'] .lp-phone-count,
        [dir='rtl'] .lp-phone-cat,
        [dir='rtl'] .lp-section-eyebrow,
        [dir='rtl'] .lp-step-num,
        [dir='rtl'] .lp-doc-label,
        [dir='rtl'] .lp-doc-eyebrow,
        [dir='rtl'] .lp-for-label,
        [dir='rtl'] .lp-hero-proof,
        [dir='rtl'] .lp-contact-detail-label,
        [dir='rtl'] .lp-footer-copy {
          font-family: var(--font-arabic), 'IBM Plex Sans Arabic', sans-serif;
          letter-spacing: 0;
          text-transform: none;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .lp-nav { padding: 0 20px; }
          .lp-nav-links { display: none; }
          .lp-hero { grid-template-columns: 1fr; padding: 48px 24px; min-height: auto; }
          .lp-hero-left { padding-inline-end: 0; }
          .lp-h1 { font-size: 32px; }
          .lp-hero-right { display: none; }
          .lp-how, .lp-export, .lp-for, .lp-stats, .lp-cta, .lp-contact { padding: 56px 24px; }
          .lp-steps { grid-template-columns: 1fr; gap: 32px; }
          .lp-step-divider { display: none; }
          .lp-export-inner, .lp-for-cards, .lp-contact-inner { grid-template-columns: 1fr; gap: 40px; }
          .lp-stats-inner { grid-template-columns: 1fr; gap: 32px; }
          .lp-section-h2, .lp-cta-h2, .lp-contact-h2 { font-size: 28px; }
          .lp-footer { padding: 32px 24px; }
          .lp-footer-inner { flex-direction: column; align-items: flex-start; gap: 20px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lp-phone-progress-fill { transition: none; }
        }
      `}</style>

      <div dir={dir} lang={locale} className="lp-root">
        {/* ── NAV ── */}
        <nav className="lp-nav">
          <Link href="/" className="lp-nav-brand">
            <LogoMark size={28} onDark />
            <span className="lp-nav-name">Wuduh</span>
          </Link>
          <div className="lp-nav-links">
            <a className="lp-nav-link" href="#how">{t.nav.how}</a>
            <a className="lp-nav-link" href="#for">{t.nav.forAccel}</a>
            <a className="lp-nav-link" href="#contact" onClick={scrollToContact}>{t.nav.contact}</a>
            <Link className="lp-nav-link" href="/login">{t.nav.signIn}</Link>
            <LocaleToggle />
          </div>
          <Link href="/signup" className="lp-nav-cta">{t.nav.cta}</Link>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <GeometricNet id="hero-net" color="#C9A84C" opacity={0.2} size={64} />
          <div className="lp-hero-left">
            <p className="lp-eyebrow">{t.hero.eyebrow}</p>
            <h1 className="lp-h1">
              <MultiLine lines={heroLines} />
              <em>{t.hero.h1Em}</em>
            </h1>
            <p className="lp-hero-sub">{t.hero.sub}</p>
            <div className="lp-hero-actions">
              <Link href="/signup" className="lp-btn-accent">{t.hero.ctaPrimary}</Link>
              <a href="#how" className="lp-btn-ghost-light">{t.hero.ctaGhost}</a>
            </div>
            <div className="lp-hero-proof">
              {t.hero.proof.map((p, i) => (
                <Fragment key={i}>
                  {i > 0 && <span className="lp-proof-dot" />}
                  <span>{p}</span>
                </Fragment>
              ))}
            </div>
          </div>
          <div className="lp-hero-right">
            <PhoneCarousel cards={t.phone.cards} skipLabel={t.phone.skip} nextLabel={t.phone.next} locale={locale} />
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="lp-how" id="how">
          <div className="lp-section-inner">
            <p className="lp-section-eyebrow">{t.how.eyebrow}</p>
            <h2 className="lp-section-h2"><MultiLine lines={t.how.h2} /></h2>
            <p className="lp-section-sub">{t.how.sub}</p>
            <div className="lp-steps">
              {t.how.steps.map((step, i) => (
                <div className="lp-step" key={i}>
                  <span className="lp-step-num">{step.num}</span>
                  <h3 className="lp-step-title">{step.title}</h3>
                  <p className="lp-step-body">{step.body}</p>
                  {i < t.how.steps.length - 1 && <div className="lp-step-divider" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EXPORT PREVIEW ── */}
        <section className="lp-export">
          <div className="lp-export-inner">
            <div>
              <p className="lp-section-eyebrow">{t.exportSec.eyebrow}</p>
              <h2 className="lp-section-h2">{t.exportSec.h2}</h2>
              <p className="lp-section-sub" style={{ marginBottom: 24 }}>{t.exportSec.sub}</p>
              <ul className="lp-check-list">
                {t.exportSec.checks.map(item => (
                  <li key={item} className="lp-check-li">
                    <span className="lp-check-circle">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lp-doc">
              <GeometricNet id="doc-net" color="#0D1B2A" opacity={0.18} size={48} />
              <div className="lp-doc-inner">
                <div className="lp-doc-header">
                  <div className="lp-doc-brand">
                    <LogoMark size={18} onDark={false} />
                    <span className="lp-doc-brand-name">Wuduh</span>
                  </div>
                  <span className="lp-doc-label">{t.exportSec.docLabel}</span>
                </div>
                <div className="lp-doc-eyebrow">{t.exportSec.docByline}</div>
                <div className="lp-doc-title">{t.exportSec.docTitle}</div>
                <div className="lp-doc-rule" />
                {t.exportSec.docSections.map((title, i) => {
                  const lineSets = [[100, 100, 68], [100, 82], [100, 100, 55], [100, 74]]
                  return (
                    <div key={title} className="lp-doc-section">
                      <div className="lp-doc-section-head">{title}</div>
                      {lineSets[i].map((w, j) => (
                        <div key={j} className="lp-doc-line" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── WHO IT'S FOR ── */}
        <section className="lp-for" id="for">
          <div className="lp-section-inner">
            <p className="lp-section-eyebrow">{t.who.eyebrow}</p>
            <h2 className="lp-section-h2"><MultiLine lines={t.who.h2} /></h2>
            <div className="lp-for-cards">
              <div className="lp-for-card">
                <div className="lp-for-icon" style={{ background: '#F6EEDB' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A6F26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <p className="lp-for-label" style={{ color: '#A6852F' }}>{t.who.founders.label}</p>
                <h3 className="lp-for-title">{t.who.founders.title}</h3>
                <p className="lp-for-body">{t.who.founders.body}</p>
                <ul className="lp-for-list">
                  {t.who.founders.list.map(item => (
                    <li key={item} className="lp-for-li">
                      <span className="lp-for-check" style={{ background: '#F6EEDB', color: '#8A6F26' }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lp-for-card" style={{ borderColor: '#A9E0D9' }}>
                <div className="lp-for-icon" style={{ background: '#D8F1EE' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A6E66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <p className="lp-for-label" style={{ color: '#0B8077' }}>{t.who.accelerators.label}</p>
                <h3 className="lp-for-title">{t.who.accelerators.title}</h3>
                <p className="lp-for-body">{t.who.accelerators.body}</p>
                <ul className="lp-for-list">
                  {t.who.accelerators.list.map(item => (
                    <li key={item} className="lp-for-li">
                      <span className="lp-for-check" style={{ background: '#D8F1EE', color: '#0A6E66' }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="lp-stats">
          <GeometricNet id="stats-net" color="#C9A84C" opacity={0.25} size={64} />
          <div className="lp-stats-inner">
            {t.stats.items.map(s => (
              <div key={s.label} className="lp-stat">
                <div className="lp-stat-num">{localizeDigits(s.num, locale)}<span>.</span></div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── EARLY ACCESS CTA ── */}
        <section className="lp-cta" id="cta">
          <div className="lp-cta-inner">
            <p className="lp-cta-arabic">{t.cta.flourish}</p>
            <h2 className="lp-cta-h2">{t.cta.h2}</h2>
            <p className="lp-cta-sub">{t.cta.sub}</p>
            <Link href="/signup" className="lp-btn-accent">{t.cta.button}</Link>
            <p className="lp-cta-disclaimer">{t.cta.disclaimer}</p>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section className="lp-contact" id="contact" ref={contactRef}>
          <GeometricNet id="contact-net" color="#C9A84C" opacity={0.12} size={64} />
          <div className="lp-contact-inner">
            <div>
              <p className="lp-section-eyebrow" style={{ color: '#C9A84C' }}>{t.contact.eyebrow}</p>
              <h2 className="lp-contact-h2">{t.contact.h2}</h2>
              <p className="lp-contact-body">{t.contact.body}</p>
              <div className="lp-contact-details">
                <div className="lp-contact-detail">
                  <div className="lp-contact-detail-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AEC6D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className="lp-contact-detail-text">
                    <span className="lp-contact-detail-label">{t.contact.emailLabel}</span>
                    <span className="lp-contact-detail-value"><a href="mailto:hello@wuduh.site" dir="ltr">hello@wuduh.site</a></span>
                  </div>
                </div>
                <div className="lp-contact-detail">
                  <div className="lp-contact-detail-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AEC6D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="lp-contact-detail-text">
                    <span className="lp-contact-detail-label">{t.contact.basedLabel}</span>
                    <span className="lp-contact-detail-value">{t.contact.basedValue}</span>
                  </div>
                </div>
                <div className="lp-contact-detail">
                  <div className="lp-contact-detail-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AEC6D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="lp-contact-detail-text">
                    <span className="lp-contact-detail-label">{t.contact.responseLabel}</span>
                    <span className="lp-contact-detail-value">{t.contact.responseValue}</span>
                  </div>
                </div>
              </div>
            </div>
            <ContactForm c={t.contact} />
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <div className="lp-footer-inner">
            <div className="lp-footer-brand">
              <LogoMark size={24} onDark />
              <span className="lp-footer-brand-name">Wuduh</span>
              <span className="lp-footer-arabic">وضوح</span>
            </div>
            <div className="lp-footer-links">
              <a className="lp-footer-link" href="#">{t.footer.privacy}</a>
              <a className="lp-footer-link" href="#">{t.footer.terms}</a>
              <a className="lp-footer-link" href="#contact" onClick={scrollToContact}>{t.footer.contact}</a>
              <Link className="lp-footer-link" href="/login">{t.footer.signIn}</Link>
            </div>
            <span className="lp-footer-copy">{t.footer.copy}</span>
          </div>
        </footer>
      </div>
    </>
  )
}
