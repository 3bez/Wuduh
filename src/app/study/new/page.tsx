'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth/client'
import { useLocale } from '@/components/ui/LocaleProvider'

function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M40 79 L40 51 Q40 37 48 32 Q56 37 56 51 L56 79 Z" fill="#C9A84C" />
      <path d="M27 81 L27 44 Q27 21 48 15 Q69 21 69 44 L69 81"
        stroke="var(--text-primary)" strokeWidth="7.8" fill="none"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6, height: 6, borderRadius: 99,
          background: i === current ? 'var(--gold-500)' : i < current ? 'var(--teal-500)' : 'var(--border-strong)',
          transition: 'all 300ms cubic-bezier(0.22,0.61,0.36,1)',
        }} />
      ))}
    </div>
  )
}

export default function NewStudyPage() {
  const router = useRouter()
  const { locale: siteLocale } = useLocale()
  const [step, setStep]               = useState(0)
  const [lang, setLang]               = useState<'en' | 'ar' | null>(null)
  const [startupName, setStartupName] = useState('')
  const [logoFile, setLogoFile]       = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [creating, setCreating]       = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // The wizard chrome follows the site UI language until the user picks a
  // study language; after the pick it follows the chosen study language.
  // (The study language itself stays an explicit choice — it's permanent.)
  const uiLang = lang ?? siteLocale
  const isRtl = uiLang === 'ar'

  function handleLangSelect(l: 'en' | 'ar') {
    setLang(l); setTimeout(() => setStep(1), 180)
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) { setError(isRtl ? 'يجب أن يكون حجم الشعار أقل من ٤ ميغابايت.' : 'Logo must be under 4 MB.'); return }
    setError(null); setLogoFile(file)
    const reader = new FileReader()
    reader.onload = ev => { if (typeof ev.target?.result === 'string') setLogoPreview(ev.target.result) }
    reader.onerror = () => setError(isRtl ? 'تعذّر قراءة الملف.' : 'Could not read the file.')
    reader.readAsDataURL(file)
  }

  function handleLogoDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    const allowed = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
    if (!file || !allowed.includes(file.type)) return
    handleLogoChange({ target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>)
  }

  async function handleCreate() {
    if (!lang || !startupName.trim()) return
    setCreating(true); setError(null)

    try {
      const session = await authClient.getSession()
      const userId  = session.data?.user?.id
      if (!userId) throw new Error(isRtl ? 'لم يتم تسجيل الدخول.' : 'Not authenticated')

      // Create study via API
      const res = await fetch('/api/studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang, startup_name: startupName.trim() }),
      })
      const study = await res.json()
      if (!res.ok) throw new Error(study.error ?? (isRtl ? 'تعذّر إنشاء الدراسة.' : 'Failed to create study'))

      // Upload logo if provided
      if (logoFile) {
        const formData = new FormData()
        formData.append('file', logoFile)
        formData.append('studyId', study.id)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!uploadRes.ok) {
          console.error('Logo upload failed:', await uploadRes.text().catch(() => 'unknown error'))
        }
      }

      router.push(`/study/${study.id}?card=C0`)
    } catch (err) {
      setError(err instanceof Error ? err.message : (isRtl ? 'حدث خطأ ما. الرجاء المحاولة مرة أخرى.' : 'Something went wrong. Please try again.'))
      setCreating(false)
    }
  }

  return (
    <>
      <style>{`
        .ns-lang-btn { transition: border-color 200ms, background 200ms, box-shadow 200ms; cursor: pointer; background: var(--bg-surface); }
        .ns-lang-btn:hover:not(.selected) { border-color: var(--border-strong) !important; background: var(--bg-subtle) !important; }
        .ns-lang-btn.selected { border-color: var(--text-primary) !important; background: var(--bg-raised) !important; box-shadow: 0 0 0 4px rgba(201,168,76,0.08) !important; }
        .ns-back:hover { color: var(--text-primary) !important; }
        .ns-input { width: 100%; padding: 13px 16px; font-size: 16px; color: var(--text-primary); background: var(--bg-input); border: 1.5px solid var(--border-strong); border-radius: 10px; outline: none; transition: border-color 140ms, box-shadow 140ms; }
        .ns-input::placeholder { color: var(--text-hint); }
        .ns-input:focus { border-color: rgba(201,168,76,0.7) !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.12) !important; }
        .ns-drop { border: 1.5px dashed var(--border-strong); background: var(--bg-surface); transition: border-color 200ms, background 200ms; cursor: pointer; }
        .ns-drop:hover { border-color: var(--gold-500) !important; background: var(--gold-100) !important; }
        .ns-primary { transition: opacity 140ms; }
        .ns-primary:hover:not(:disabled) { opacity: 0.85; }
        .ns-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .ns-skip:hover { color: var(--text-secondary) !important; }
        @keyframes ns-fade-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .ns-step { animation: ns-fade-in 260ms cubic-bezier(0.22,0.61,0.36,1) both; }
        @keyframes ns-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <LogoMark />
            <span style={{ fontFamily: 'var(--font-display), serif', fontWeight: 600, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Wuduh</span>
          </Link>
          <StepDots current={step} total={3} />
        </header>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
          <div style={{ width: '100%', maxWidth: 480 }}>

            {step === 0 && (
              <div className="ns-step" key="step-lang" dir={isRtl ? 'rtl' : 'ltr'}>
                <p style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-mono), monospace', fontSize: 11, letterSpacing: isRtl ? 0 : '0.12em', textTransform: isRtl ? 'none' : 'uppercase', color: 'var(--gold-500)', marginBottom: 12 }}>{isRtl ? 'الخطوة ١ من ٣' : 'Step 1 of 3'}</p>
                <h1 style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif', fontSize: 28, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: isRtl ? 0 : '-0.02em', lineHeight: 1.15, marginBottom: 8 }}>{isRtl ? 'اختر لغتك' : 'Choose your language'}</h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32 }}>{isRtl ? 'سترافق هذه اللغة رحلتك بالكامل — كل سؤال وتلميح، ومستندك المُصدّر. ولا يمكن تغييرها لاحقًا.' : 'The entire journey — every question, hint, and your exported document — will follow your choice. You can’t change it later.'}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <button className={`ns-lang-btn${lang === 'en' ? ' selected' : ''}`} onClick={() => handleLangSelect('en')} style={{ border: `2px solid ${lang === 'en' ? 'var(--text-primary)' : 'var(--border-default)'}`, borderRadius: 14, padding: '28px 20px', textAlign: 'left' }}>
                    <div style={{ fontSize: 28, marginBottom: 12, lineHeight: 1 }}>🇬🇧</div>
                    <div style={{ fontFamily: 'var(--font-display), serif', fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>English</div>
                    <div style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.5 }}>Left-to-right · Full LTR export</div>
                    {lang === 'en' && <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--text-primary)', color: 'var(--bg-page)', fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 99 }}><svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3" /></svg>Selected</div>}
                  </button>
                  <button className={`ns-lang-btn${lang === 'ar' ? ' selected' : ''}`} onClick={() => handleLangSelect('ar')} style={{ border: `2px solid ${lang === 'ar' ? 'var(--text-primary)' : 'var(--border-default)'}`, borderRadius: 14, padding: '28px 20px', textAlign: 'right', direction: 'rtl' }}>
                    <div style={{ fontSize: 28, marginBottom: 12, lineHeight: 1 }}>🇸🇦</div>
                    <div style={{ fontFamily: 'var(--font-arabic), sans-serif', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>العربية</div>
                    <div style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.5, direction: 'rtl' }}>من اليمين إلى اليسار · تصدير RTL كامل</div>
                    {lang === 'ar' && <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--text-primary)', color: 'var(--bg-page)', fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 99 }}><svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3" /></svg>محدد</div>}
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="ns-step" key="step-name" dir={isRtl ? 'rtl' : 'ltr'}>
                <p style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-mono), monospace', fontSize: 11, letterSpacing: isRtl ? 0 : '0.12em', textTransform: isRtl ? 'none' : 'uppercase', color: 'var(--gold-500)', marginBottom: 12 }}>{isRtl ? 'الخطوة ٢ من ٣' : 'Step 2 of 3'}</p>
                <h1 style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif', fontSize: 28, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: isRtl ? 0 : '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>{isRtl ? 'ما اسم مشروعك؟' : "What's your startup called?"}</h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32 }}>{isRtl ? 'هذا سيظهر على صفحة الغلاف في دراسة الجدوى الخاصة بك. يمكنك تغييره لاحقاً.' : 'This will appear on the cover page of your feasibility study. You can change it later.'}</p>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>{isRtl ? 'اسم الشركة الناشئة' : 'Startup name'}</label>
                  <input className="ns-input" type="text" autoFocus value={startupName} onChange={e => setStartupName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && startupName.trim()) setStep(2) }} placeholder={isRtl ? 'مثال: نقاء' : 'e.g. Clarity'} style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-sans), sans-serif', direction: isRtl ? 'rtl' : 'ltr' }} />
                  <p style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 8 }}>{isRtl ? 'اضغط Enter للمتابعة' : 'Press Enter to continue'}</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                  <button className="ns-primary" onClick={() => setStep(2)} disabled={!startupName.trim()} style={{ flex: 1, background: 'var(--text-primary)', color: 'var(--bg-page)', fontSize: 14, fontWeight: 500, border: 'none', borderRadius: 9, padding: '13px 0', cursor: 'pointer', fontFamily: 'var(--font-sans), sans-serif' }}>{isRtl ? 'التالي ←' : 'Continue →'}</button>
                  <button onClick={() => setStep(0)} className="ns-back" style={{ background: 'transparent', border: 'none', fontSize: 13, color: 'var(--text-faint)', cursor: 'pointer', padding: '0 12px', transition: 'color 140ms' }}>{isRtl ? 'رجوع' : 'Back'}</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="ns-step" key="step-logo" dir={isRtl ? 'rtl' : 'ltr'}>
                <p style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-mono), monospace', fontSize: 11, letterSpacing: isRtl ? 0 : '0.12em', textTransform: isRtl ? 'none' : 'uppercase', color: 'var(--gold-500)', marginBottom: 12 }}>{isRtl ? 'الخطوة ٣ من ٣' : 'Step 3 of 3'}</p>
                <h1 style={{ fontFamily: isRtl ? 'var(--font-arabic), sans-serif' : 'var(--font-display), serif', fontSize: 28, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: isRtl ? 0 : '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>{isRtl ? 'أضف شعار مشروعك' : 'Add your logo'}</h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32 }}>{isRtl ? 'سيظهر الشعار على صفحة الغلاف في ملف PDF. هذه الخطوة اختيارية.' : 'Your logo appears on the PDF cover page. This step is optional — skip it and add one later.'}</p>

                <div className="ns-drop" onDragOver={e => e.preventDefault()} onDrop={handleLogoDrop} onClick={() => fileInputRef.current?.click()} style={{ borderRadius: 14, padding: logoPreview ? '20px' : '40px 20px', textAlign: 'center', marginBottom: 20 }}>
                  {logoPreview ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                      <div style={{ width: 64, height: 64, borderRadius: 10, border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoPreview} alt="Logo preview" style={{ width: 52, height: 52, objectFit: 'contain' }} />
                      </div>
                      <div style={{ textAlign: isRtl ? 'right' : 'left', flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3 }}>{logoFile?.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>{isRtl ? 'انقر لتغيير الصورة' : 'Click to change'}</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setLogoFile(null); setLogoPreview(null) }} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', padding: 4, flexShrink: 0 }} aria-label="Remove logo">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>{isRtl ? 'اسحب الشعار هنا أو انقر للاختيار' : 'Drop your logo here or click to browse'}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>PNG · SVG · JPG &nbsp;·&nbsp; {isRtl ? 'الحد الأقصى 4 ميغابايت' : 'Max 4 MB'}</p>
                    </>
                  )}
                </div>

                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" style={{ display: 'none' }} onChange={handleLogoChange} />

                {error && <div style={{ background: 'var(--danger-100)', color: 'var(--danger-500)', fontSize: 13, borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>{error}</div>}

                <div style={{ display: 'flex', gap: 10, flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                  <button className="ns-primary" onClick={handleCreate} disabled={creating} style={{ flex: 1, background: 'var(--text-primary)', color: 'var(--bg-page)', fontSize: 14, fontWeight: 500, border: 'none', borderRadius: 9, padding: '13px 0', cursor: creating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--font-sans), sans-serif' }}>
                    {creating ? (<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'ns-spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>{isRtl ? 'جارٍ الإنشاء…' : 'Creating your study…'}</>) : (isRtl ? '← ابدأ الدراسة' : 'Start your study →')}
                  </button>
                  <button onClick={() => setStep(1)} className="ns-back" disabled={creating} style={{ background: 'transparent', border: 'none', fontSize: 13, color: 'var(--text-faint)', cursor: 'pointer', padding: '0 12px', transition: 'color 140ms' }}>{isRtl ? 'رجوع' : 'Back'}</button>
                </div>

                {!logoPreview && !creating && (
                  <button className="ns-skip" onClick={handleCreate} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 14, background: 'none', border: 'none', fontSize: 13, color: 'var(--text-faint)', cursor: 'pointer', transition: 'color 140ms', fontFamily: 'var(--font-sans), sans-serif' }}>
                    {isRtl ? 'تخطي وابدأ بدون شعار' : 'Skip — start without a logo'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '16px 24px 32px', flexShrink: 0 }}>
          <p style={{ fontSize: 12, color: 'var(--text-hint)' }} dir={isRtl ? 'rtl' : 'ltr'}>
            {step === 0 && (isRtl ? 'اختيارك يحدّد لغة كل بطاقة ومستندك المُصدّر.' : 'Your choice sets the language for every card and your exported document.')}
            {step === 1 && (isRtl ? 'لا توجد إجابات خاطئة — بل إجابات أوضح.' : 'There are no wrong answers — only clearer ones.')}
            {step === 2 && (isRtl ? 'تُحفظ دراستك تلقائيًا أثناء العمل. عُد في أي وقت.' : 'Your study auto-saves as you go. Come back any time.')}
          </p>
        </div>
      </div>
    </>
  )
}
