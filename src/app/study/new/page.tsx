'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ── Logo mark ──────────────────────────────────────────────────────────────
function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" />
      <path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81"
        stroke="#0D1B2A" strokeWidth="7.8" fill="none"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// ── Step indicator ─────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6,
          height: 6,
          borderRadius: 99,
          background: i === current ? '#C9A84C' : i < current ? '#0D9488' : '#D4DBE3',
          transition: 'all 300ms cubic-bezier(0.22,0.61,0.36,1)',
        }} />
      ))}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function NewStudyPage() {
  const router = useRouter()
  const [step, setStep] = useState(0) // 0 = language, 1 = name, 2 = logo
  const [lang, setLang] = useState<'en' | 'ar' | null>(null)
  const [startupName, setStartupName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleLangSelect(l: 'en' | 'ar') {
    setLang(l)
    setTimeout(() => setStep(1), 180)
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      setError('Logo must be under 4 MB.')
      return
    }
    setError(null)
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleLogoDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const synth = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>
    handleLogoChange(synth)
  }

  async function handleCreate() {
    if (!lang || !startupName.trim()) return
    setCreating(true)
    setError(null)

    const supabase = createClient()

    try {
      // 1 — create study row
      const { data: study, error: studyErr } = await supabase
        .from('studies')
        .insert({ user_id: (await supabase.auth.getUser()).data.user!.id, language: lang, startup_name: startupName.trim() })
        .select('id')
        .single()

      if (studyErr || !study) throw new Error(studyErr?.message ?? 'Failed to create study')

      // 2 — upload logo if provided
      if (logoFile) {
        const ext = logoFile.name.split('.').pop() ?? 'png'
        const path = `${study.id}/logo.${ext}`

        const { error: uploadErr } = await supabase.storage
          .from('wuduh-uploads')
          .upload(path, logoFile, { upsert: true, contentType: logoFile.type })

        if (!uploadErr) {
          const { data: pub } = supabase.storage.from('wuduh-uploads').getPublicUrl(path)
          await supabase.from('studies').update({ logo_url: pub.publicUrl }).eq('id', study.id)
        }
      }

      // 3 — go to first card
      router.push(`/study/${study.id}?card=C0`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setCreating(false)
    }
  }

  const isRtl = lang === 'ar'

  return (
    <>
      <style>{`
        .ns-lang-btn { transition: border-color 200ms, background 200ms, box-shadow 200ms; cursor: pointer; }
        .ns-lang-btn:hover:not(.selected) { border-color: #B4BFCB !important; background: #F4F6F8 !important; }
        .ns-back:hover { color: #0D1B2A !important; }
        .ns-input:focus { border-color: rgba(201,168,76,0.7) !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.12) !important; }
        .ns-drop:hover { border-color: #C9A84C !important; background: rgba(201,168,76,0.03) !important; }
        .ns-primary { transition: background 140ms, box-shadow 140ms; }
        .ns-primary:hover:not(:disabled) { background: #132A40 !important; box-shadow: 0 4px 16px rgba(13,27,42,0.2) !important; }
        .ns-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .ns-skip:hover { color: #36404D !important; }
        @keyframes ns-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .ns-step { animation: ns-fade-in 260ms cubic-bezier(0.22,0.61,0.36,1) both; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#F4F6F8', display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ── */}
        <header style={{
          background: '#fff',
          borderBottom: '1px solid #E8ECF1',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <LogoMark />
            <span style={{ fontFamily: 'var(--font-display), serif', fontWeight: 600, fontSize: 18, color: '#0D1B2A', letterSpacing: '-0.01em' }}>
              Wuduh
            </span>
          </Link>
          <StepDots current={step} total={3} />
        </header>

        {/* ── Content ── */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
          <div style={{ width: '100%', maxWidth: 480 }}>

            {/* ── STEP 0 — Language ── */}
            {step === 0 && (
              <div className="ns-step" key="step-lang">
                <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 12 }}>
                  Step 1 of 3
                </p>
                <h1 style={{ fontFamily: 'var(--font-display), serif', fontSize: 28, fontWeight: 500, color: '#0D1B2A', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 8 }}>
                  Choose your language
                </h1>
                <p style={{ fontSize: 14, color: '#647183', lineHeight: 1.6, marginBottom: 32 }}>
                  The entire journey — every question, hint, and your exported document — will follow your choice. You can't change it later.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* English */}
                  <button
                    className={`ns-lang-btn${lang === 'en' ? ' selected' : ''}`}
                    onClick={() => handleLangSelect('en')}
                    style={{
                      background: lang === 'en' ? '#EEF3F7' : '#fff',
                      border: `2px solid ${lang === 'en' ? '#0D1B2A' : '#E8ECF1'}`,
                      borderRadius: 14,
                      padding: '28px 20px',
                      textAlign: 'left',
                      boxShadow: lang === 'en' ? '0 0 0 4px rgba(13,27,42,0.06)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 12, lineHeight: 1 }}>🇬🇧</div>
                    <div style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: '#0D1B2A', marginBottom: 4 }}>English</div>
                    <div style={{ fontSize: 12, color: '#8795A6', lineHeight: 1.5 }}>Left-to-right · Full LTR document export</div>
                    {lang === 'en' && (
                      <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 5, background: '#0D1B2A', color: '#fff', fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 99 }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3" /></svg>
                        Selected
                      </div>
                    )}
                  </button>

                  {/* Arabic */}
                  <button
                    className={`ns-lang-btn${lang === 'ar' ? ' selected' : ''}`}
                    onClick={() => handleLangSelect('ar')}
                    style={{
                      background: lang === 'ar' ? '#EEF3F7' : '#fff',
                      border: `2px solid ${lang === 'ar' ? '#0D1B2A' : '#E8ECF1'}`,
                      borderRadius: 14,
                      padding: '28px 20px',
                      textAlign: 'right',
                      direction: 'rtl',
                      boxShadow: lang === 'ar' ? '0 0 0 4px rgba(13,27,42,0.06)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 12, lineHeight: 1 }}>🇸🇦</div>
                    <div style={{ fontFamily: 'var(--font-arabic), sans-serif', fontSize: 20, fontWeight: 600, color: '#0D1B2A', marginBottom: 4 }}>العربية</div>
                    <div style={{ fontSize: 12, color: '#8795A6', lineHeight: 1.5, direction: 'rtl' }}>من اليمين إلى اليسار · تصدير RTL كامل</div>
                    {lang === 'ar' && (
                      <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 5, background: '#0D1B2A', color: '#fff', fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 99 }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3" /></svg>
                        محدد
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 1 — Startup name ── */}
            {step === 1 && (
              <div className="ns-step" key="step-name" dir={isRtl ? 'rtl' : 'ltr'}>
                <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 12 }}>
                  {isRtl ? 'الخطوة ٢ من ٣' : 'Step 2 of 3'}
                </p>
                <h1 style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif', fontSize: 28, fontWeight: 500, color: '#0D1B2A', letterSpacing: isRtl ? 0 : '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>
                  {isRtl ? 'ما اسم مشروعك؟' : "What's your startup called?"}
                </h1>
                <p style={{ fontSize: 14, color: '#647183', lineHeight: 1.6, marginBottom: 32 }}>
                  {isRtl
                    ? 'هذا سيظهر على صفحة الغلاف في دراسة الجدوى الخاصة بك. يمكنك تغييره لاحقاً.'
                    : "This will appear on the cover page of your feasibility study. You can change it later."}
                </p>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#36404D', marginBottom: 8 }}>
                    {isRtl ? 'اسم الشركة الناشئة' : 'Startup name'}
                  </label>
                  <input
                    className="ns-input"
                    type="text"
                    autoFocus
                    value={startupName}
                    onChange={e => setStartupName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && startupName.trim()) setStep(2) }}
                    placeholder={isRtl ? 'مثال: نقاء' : 'e.g. Clarity'}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      fontSize: 16,
                      fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-sans), sans-serif',
                      color: '#0D1B2A',
                      background: '#fff',
                      border: '1.5px solid #D4DBE3',
                      borderRadius: 10,
                      outline: 'none',
                      transition: 'border-color 140ms, box-shadow 140ms',
                      direction: isRtl ? 'rtl' : 'ltr',
                    }}
                  />
                  <p style={{ fontSize: 12, color: '#8795A6', marginTop: 8 }}>
                    {isRtl ? 'اضغط Enter للمتابعة' : 'Press Enter to continue'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                  <button
                    className="ns-primary"
                    onClick={() => setStep(2)}
                    disabled={!startupName.trim()}
                    style={{
                      flex: 1,
                      background: '#0D1B2A',
                      color: '#EEF3F7',
                      fontSize: 14,
                      fontWeight: 500,
                      border: 'none',
                      borderRadius: 9,
                      padding: '13px 0',
                      cursor: 'pointer',
                    }}
                  >
                    {isRtl ? 'التالي ←' : 'Continue →'}
                  </button>
                  <button
                    onClick={() => setStep(0)}
                    className="ns-back"
                    style={{ background: 'transparent', border: 'none', fontSize: 13, color: '#8795A6', cursor: 'pointer', padding: '0 12px', transition: 'color 140ms' }}
                  >
                    {isRtl ? 'رجوع' : 'Back'}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2 — Logo upload ── */}
            {step === 2 && (
              <div className="ns-step" key="step-logo" dir={isRtl ? 'rtl' : 'ltr'}>
                <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 12 }}>
                  {isRtl ? 'الخطوة ٣ من ٣' : 'Step 3 of 3'}
                </p>
                <h1 style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif', fontSize: 28, fontWeight: 500, color: '#0D1B2A', letterSpacing: isRtl ? 0 : '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>
                  {isRtl ? 'أضف شعار مشروعك' : 'Add your logo'}
                </h1>
                <p style={{ fontSize: 14, color: '#647183', lineHeight: 1.6, marginBottom: 32 }}>
                  {isRtl
                    ? 'سيظهر الشعار على صفحة الغلاف في ملف PDF. هذه الخطوة اختيارية — يمكنك تخطيها والإضافة لاحقاً.'
                    : "Your logo appears on the PDF cover page. This step is optional — skip it and add one later during your study."}
                </p>

                {/* Drop zone */}
                <div
                  className="ns-drop"
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleLogoDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '1.5px dashed #D4DBE3',
                    borderRadius: 14,
                    padding: logoPreview ? '20px' : '40px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#fff',
                    marginBottom: 20,
                    transition: 'border-color 200ms, background 200ms',
                  }}
                >
                  {logoPreview ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {/* Preview */}
                      <div style={{ width: 64, height: 64, borderRadius: 10, border: '1px solid #E8ECF1', background: '#F4F6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoPreview} alt="Logo preview" style={{ width: 52, height: 52, objectFit: 'contain' }} />
                      </div>
                      <div style={{ textAlign: isRtl ? 'right' : 'left', flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#0D1B2A', marginBottom: 3 }}>
                          {logoFile?.name}
                        </p>
                        <p style={{ fontSize: 12, color: '#8795A6' }}>
                          {isRtl ? 'انقر لتغيير الصورة' : 'Click to change'}
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setLogoFile(null); setLogoPreview(null) }}
                        style={{ background: 'none', border: 'none', color: '#8795A6', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                        aria-label="Remove logo"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F4F6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8795A6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#36404D', marginBottom: 5 }}>
                        {isRtl ? 'اسحب الشعار هنا أو انقر للاختيار' : 'Drop your logo here or click to browse'}
                      </p>
                      <p style={{ fontSize: 12, color: '#8795A6' }}>
                        PNG · SVG · JPG &nbsp;·&nbsp; {isRtl ? 'الحد الأقصى 4 ميغابايت' : 'Max 4 MB'}
                      </p>
                    </>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleLogoChange}
                />

                {error && (
                  <div style={{ background: '#F6E0DA', color: '#A53D27', fontSize: 13, borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                  <button
                    className="ns-primary"
                    onClick={handleCreate}
                    disabled={creating}
                    style={{
                      flex: 1,
                      background: '#0D1B2A',
                      color: '#EEF3F7',
                      fontSize: 14,
                      fontWeight: 500,
                      border: 'none',
                      borderRadius: 9,
                      padding: '13px 0',
                      cursor: creating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {creating ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                          <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        {isRtl ? 'جارٍ الإنشاء…' : 'Creating your study…'}
                      </>
                    ) : (
                      isRtl ? '← ابدأ الدراسة' : 'Start your study →'
                    )}
                  </button>

                  <button
                    onClick={() => setStep(1)}
                    className="ns-back"
                    style={{ background: 'transparent', border: 'none', fontSize: 13, color: '#8795A6', cursor: 'pointer', padding: '0 12px', transition: 'color 140ms' }}
                    disabled={creating}
                  >
                    {isRtl ? 'رجوع' : 'Back'}
                  </button>
                </div>

                {/* Skip logo option */}
                {!logoPreview && !creating && (
                  <button
                    className="ns-skip"
                    onClick={handleCreate}
                    style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 14, background: 'none', border: 'none', fontSize: 13, color: '#8795A6', cursor: 'pointer', transition: 'color 140ms' }}
                  >
                    {isRtl ? 'تخطي وابدأ بدون شعار' : 'Skip — start without a logo'}
                  </button>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ── Footer hint ── */}
        <div style={{ textAlign: 'center', padding: '16px 24px 32px', flexShrink: 0 }}>
          <p style={{ fontSize: 12, color: '#B4BFCB' }}>
            {step === 0 && 'Your choice sets the language for every card and your exported document.'}
            {step === 1 && 'There are no wrong answers — only clearer ones.'}
            {step === 2 && 'Your study auto-saves as you go. Come back any time.'}
          </p>
        </div>

      </div>
    </>
  )
}
