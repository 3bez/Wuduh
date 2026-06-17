'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'

type ExportState = 'idle' | 'generating' | 'done' | 'error'

// Document preview — always uses paper colors (intentionally light regardless of theme)
function DocumentPreview({ name, pct, lang }: { name: string | null; pct: number; lang: 'en' | 'ar' }) {
  const sections = lang === 'ar'
    ? ['المشكلة والفرصة', 'الحل', 'تحليل السوق', 'نموذج الأعمال', 'الفريق']
    : ['Problem & Opportunity', 'Solution', 'Market Analysis', 'Business Model', 'Team']

  return (
    <div style={{ background: '#FAF7F0', borderRadius: 8, boxShadow: '0 12px 32px rgba(13,27,42,0.18), 0 2px 8px rgba(13,27,42,0.08)', overflow: 'hidden', position: 'relative' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.4 }} aria-hidden="true">
        <defs>
          <pattern id="doc-net" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#0D1B2A" strokeWidth="0.5" strokeOpacity="0.15">
              <rect x="8" y="8" width="16" height="16" />
              <rect x="11.3" y="11.3" width="16" height="16" transform="rotate(45 16 16)" strokeOpacity="0.08" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#doc-net)" />
      </svg>
      <div style={{ position: 'relative', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #EAE3D2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 96 96" fill="none">
              <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" />
              <path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81" stroke="#0D1B2A" strokeWidth="7.8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: 'var(--font-display), serif', fontWeight: 600, fontSize: 11, color: '#0D1B2A' }}>Wuduh</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8795A6' }}>
            {lang === 'ar' ? 'دراسة الجدوى' : 'Feasibility Study'}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A6852F', marginBottom: 5 }}>
          {lang === 'ar'
            ? new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })
            : new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </div>
        <div style={{ fontFamily: lang === 'ar' ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif', fontSize: 14, fontWeight: 600, color: '#0D1B2A', lineHeight: 1.3, marginBottom: 4 }}>
          {name ?? (lang === 'ar' ? 'دراسة بدون عنوان' : 'Untitled study')}
        </div>
        <div style={{ width: 28, height: 2.5, background: '#C9A84C', borderRadius: 99, marginBottom: 14 }} />
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: lang === 'ar' ? 'var(--font-arabic), sans-serif' : 'var(--font-sans), sans-serif', fontSize: 8, fontWeight: 600, color: '#0D1B2A', marginBottom: 5 }}>
              {String(i + 1).padStart(2, '0')}  {s}
            </div>
            {[85, 100, 62].slice(0, i === 2 ? 3 : 2).map((w, j) => (
              <div key={j} style={{ height: 4, borderRadius: 99, background: i * 2 + j < Math.round(pct / 12) ? '#D4DBE3' : '#EAE3D2', width: `${w}%`, marginBottom: 3 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ExportPage() {
  const { studyId } = useParams<{ studyId: string }>()
  const [state, setState]     = useState<ExportState>('idle')
  const [url, setUrl]         = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [lang, setLang]       = useState<'en' | 'ar'>('en')
  const [pct, setPct]         = useState(0)
  const [name, setName]       = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/studies/${studyId}/info`)
      .then(r => r.json())
      .then(d => { setLang(d.language ?? 'en'); setPct(d.completion_percentage ?? 0); setName(d.startup_name ?? null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [studyId])

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  async function handleExport() {
    setState('generating'); setError(null)
    try {
      const res  = await fetch(`/api/studies/${studyId}/export`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Generation failed')
      setUrl(data.url); setState('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold-500)" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
          <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }} dir={dir}>
      <style>{`
        .ep-back:hover   { color: var(--text-primary) !important; }
        .ep-primary:hover:not(:disabled) { opacity: 0.85; }
        .ep-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .ep-accent:hover { background: var(--gold-400) !important; }
        .ep-ghost:hover  { background: var(--bg-subtle) !important; }
        @keyframes ep-spin  { to { transform: rotate(360deg); } }
        @keyframes ep-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      {/* Header */}
      <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href={`/study/${studyId}/overview`} className="ep-back"
          style={{ color: 'var(--text-hint)', transition: 'color 140ms', display: 'flex', alignItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={dir === 'rtl' ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </Link>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 96 96" fill="none">
            <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" />
            <path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81" stroke="var(--text-primary)" strokeWidth="7.8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </Link>
        <div style={{ flex: 1 }} />
        <ThemeToggle />
        <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.06em' }}>
          {lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}
        </span>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 40, alignItems: 'start' }}>

          {/* Left panel */}
          <div>
            <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-500)', marginBottom: 12 }}>
              {lang === 'ar' ? 'الخطوة الأخيرة' : 'Final step'}
            </p>
            <h1 style={{ fontFamily: lang === 'ar' ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif', fontSize: 28, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: lang === 'ar' ? 0 : '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>
              {lang === 'ar' ? 'دراستك جاهزة للتصدير' : 'Your study is ready to export'}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 28 }}>
              {lang === 'ar' ? 'سيتم إنشاء ملف PDF احترافي جاهز للمستثمرين من إجاباتك. يستغرق هذا حتى 15 ثانية.' : 'A professional, investor-ready PDF will be generated from your answers. This takes up to 15 seconds.'}
            </p>

            {/* Completion */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {lang === 'ar' ? 'اكتمال الدراسة' : 'Study completion'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 13, color: pct === 100 ? 'var(--teal-500)' : 'var(--gold-500)', fontWeight: 600 }}>
                  {pct}%
                </span>
              </div>
              <div style={{ height: 5, background: 'var(--bg-subtle)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: pct === 100 ? 'var(--teal-500)' : 'var(--gold-500)', transition: 'width 600ms cubic-bezier(0.22,0.61,0.36,1)' }} />
              </div>
              {pct < 100 && (
                <p style={{ fontSize: 12, color: 'var(--warning-500)', marginTop: 10 }}>
                  {lang === 'ar' ? `${100 - pct}% من البطاقات الإلزامية لم تكتمل — ستُعلَّم الأقسام الناقصة في PDF.` : `${100 - pct}% of mandatory cards are incomplete — missing sections will be flagged in the PDF.`}
                </p>
              )}
            </div>

            {/* Checklist */}
            <div style={{ marginBottom: 28 }}>
              {[
                lang === 'ar' ? 'صفحة غلاف احترافية بشعارك واسمك' : 'Professional cover page with your logo and name',
                lang === 'ar' ? '8 أقسام منظمة تتوافق مع توقعات المستثمرين' : '8 structured sections matching investor expectations',
                lang === 'ar' ? 'جداول المنافسين والفريق مُولَّدة تلقائياً' : 'Competitor and team tables rendered automatically',
                lang === 'ar' ? 'RTL عربي أو LTR إنجليزي' : 'English LTR or Arabic RTL — matches your study language',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8, flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1, background: 'var(--success-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="var(--teal-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3" /></svg>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* ── idle ── */}
            {state === 'idle' && (
              <button className="ep-accent" onClick={handleExport} style={{
                width: '100%', background: 'var(--gold-500)', color: '#0D1B2A',
                border: 'none', borderRadius: 10, padding: '15px 0', fontSize: 15, fontWeight: 600,
                cursor: 'pointer', transition: 'background 140ms',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(201,168,76,0.25)', fontFamily: 'var(--font-sans), sans-serif',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {lang === 'ar' ? 'إنشاء PDF' : 'Generate PDF'}
              </button>
            )}

            {/* ── generating ── */}
            {state === 'generating' && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{ position: 'relative', width: 48, height: 48 }}>
                  <svg width="48" height="48" viewBox="0 0 48 48" style={{ position: 'absolute', inset: 0 }}>
                    <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border-default)" strokeWidth="3" />
                    <circle cx="24" cy="24" r="20" fill="none" stroke="var(--gold-500)" strokeWidth="3"
                      strokeDasharray="30 96" strokeLinecap="round"
                      style={{ animation: 'ep-spin 1s linear infinite', transformOrigin: '50% 50%' }} />
                  </svg>
                  <svg width="48" height="48" viewBox="0 0 96 96" style={{ position: 'absolute', inset: 0, padding: 12 }} fill="none">
                    <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" style={{ animation: 'ep-pulse 1.5s ease-in-out infinite' }} />
                    <path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81" stroke="var(--text-primary)" strokeWidth="7.8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: lang === 'ar' ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif', fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 5 }}>
                    {lang === 'ar' ? 'جاري إنشاء PDF…' : 'Generating your PDF…'}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>
                    {lang === 'ar' ? 'يستغرق هذا حتى 15 ثانية' : 'This takes up to 15 seconds'}
                  </p>
                </div>
              </div>
            )}

            {/* ── done ── */}
            {state === 'done' && url && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: 'var(--success-100)', border: '1px solid var(--teal-100)', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="var(--teal-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3" /></svg>
                  </div>
                  <div style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-500)', marginBottom: 1 }}>{lang === 'ar' ? 'PDF جاهز!' : 'PDF ready!'}</p>
                    <p style={{ fontSize: 12, color: 'var(--teal-700)' }}>{lang === 'ar' ? 'الرابط صالح لمدة ساعة واحدة.' : 'Link is valid for 1 hour.'}</p>
                  </div>
                </div>
                <a href={url} target="_blank" rel="noopener noreferrer" className="ep-accent" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--gold-500)', color: '#0D1B2A', border: 'none', borderRadius: 10, padding: '14px 0', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 140ms' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {lang === 'ar' ? 'تنزيل PDF' : 'Download PDF'}
                </a>
                <button onClick={handleExport} className="ep-ghost" style={{ background: 'transparent', border: '1px solid var(--border-default)', borderRadius: 10, padding: '12px 0', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', transition: 'background 140ms', fontFamily: 'var(--font-sans), sans-serif' }}>
                  {lang === 'ar' ? 'إعادة الإنشاء' : 'Regenerate'}
                </button>
              </div>
            )}

            {/* ── error ── */}
            {state === 'error' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: 'var(--danger-100)', border: '1px solid', borderColor: 'rgba(192,73,47,0.2)', borderRadius: 10, padding: '14px 18px' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger-500)', marginBottom: 3 }}>{lang === 'ar' ? 'فشل الإنشاء' : 'Generation failed'}</p>
                  {error && <p style={{ fontSize: 12, color: 'var(--danger-500)', fontFamily: 'var(--font-mono), monospace' }}>{error}</p>}
                </div>
                <button className="ep-primary" onClick={handleExport} style={{ background: 'var(--text-primary)', color: 'var(--bg-page)', border: 'none', borderRadius: 10, padding: '14px 0', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'opacity 140ms', fontFamily: 'var(--font-sans), sans-serif' }}>
                  {lang === 'ar' ? 'المحاولة مرة أخرى' : 'Try again'}
                </button>
              </div>
            )}

            <div style={{ marginTop: 20, textAlign: dir === 'rtl' ? 'right' : 'left' }}>
              <Link href={`/study/${studyId}/overview`} className="ep-back" style={{ fontSize: 13, color: 'var(--text-faint)', textDecoration: 'none', transition: 'color 140ms' }}>
                {lang === 'ar' ? '← العودة إلى نظرة عامة' : '← Back to overview'}
              </Link>
            </div>
          </div>

          {/* Right: document preview — intentionally paper-colored */}
          <div style={{ position: 'sticky', top: 80 }}>
            <DocumentPreview name={name} pct={pct} lang={lang} />
            <p style={{ textAlign: 'center', marginTop: 12, fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.06em', color: 'var(--text-hint)' }}>
              {lang === 'ar' ? 'معاينة — التصدير الفعلي بتنسيق A4' : 'Preview — actual export is A4 format'}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
