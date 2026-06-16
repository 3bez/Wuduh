'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type State = 'idle' | 'loading-study' | 'rendering' | 'generating' | 'done' | 'error'

export default function ExportPage() {
  const { studyId } = useParams<{ studyId: string }>()
  const [state, setState]   = useState<State>('loading-study')
  const [lang, setLang]     = useState<'en' | 'ar'>('en')
  const [pct, setPct]       = useState(0)
  const [error, setError]   = useState<string | null>(null)
  const iframeRef           = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    fetch(`/api/studies/${studyId}/info`)
      .then(r => r.json())
      .then(d => {
        setLang(d.language ?? 'en')
        setPct(d.completion_percentage ?? 0)
        setState('idle')
      })
      .catch(() => setState('idle'))
  }, [studyId])

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  async function handleExport() {
    setState('generating')
    setError(null)

    try {
      // Step 1: Get the rendered HTML from the server
      setState('rendering')
      const res = await fetch(`/api/studies/${studyId}/export/render`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `Server error ${res.status}`)
      }
      const html = await res.text()

      // Step 2: Load jsPDF and html2canvas dynamically
      setState('generating')
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])

      // Step 3: Render HTML into a hidden iframe to get real DOM
      const iframe = document.createElement('iframe')
      iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;height:1123px;border:none;'
      document.body.appendChild(iframe)

      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve()
        iframe.srcdoc = html
      })

      // Wait for fonts and images to load
      await new Promise(r => setTimeout(r, 2000))

      const iframeDoc = iframe.contentDocument!
      const pages = iframeDoc.querySelectorAll('.page')

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      const A4_WIDTH_MM  = 210
      const A4_HEIGHT_MM = 297
      const SCALE = 2 // retina quality

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement

        const canvas = await html2canvas(page, {
          scale: SCALE,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FAF7F0',
          width: 794,
          windowWidth: 794,
        })

        const imgData = canvas.toDataURL('image/jpeg', 0.95)

        if (i > 0) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM)
      }

      document.body.removeChild(iframe)

      // Step 4: Download the PDF
      const startupName = 'feasibility-study'
      pdf.save(`wuduh-${startupName}-${new Date().getFullYear()}.pdf`)

      setState('done')
    } catch (err) {
      console.error('[export]', err)
      setError(err instanceof Error ? err.message : 'Export failed')
      setState('error')
    }
  }

  if (state === 'loading-study') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-gold-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4" dir={dir}>
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-semibold text-navy-900 tracking-tight">Wuduh</h1>
          <p className="font-arabic text-base text-slate-500 mt-1">وضوح</p>
        </div>

        <div className="card p-8">

          {/* Idle */}
          {state === 'idle' && (
            <>
              <div className="w-14 h-14 bg-gold-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className={cn('font-display text-xl font-semibold text-navy-900 mb-2 text-center', lang === 'ar' && 'font-arabic')}>
                {lang === 'ar' ? 'تصدير دراستك' : 'Export your study'}
              </h2>
              <p className={cn('text-sm text-slate-500 mb-5 text-center leading-relaxed', lang === 'ar' && 'font-arabic')}>
                {lang === 'ar'
                  ? `دراستك ${pct}% مكتملة. سيتم إنشاء PDF احترافي جاهز للمستثمرين.`
                  : `Your study is ${pct}% complete. A professional investor-ready PDF will be generated.`}
              </p>
              {pct < 100 && (
                <div className="bg-warning-100 text-warning-600 text-sm rounded-md px-4 py-3 mb-5">
                  {lang === 'ar'
                    ? `${100 - pct}% من البطاقات الإلزامية لم تكتمل. ستظهر إشعارات في PDF.`
                    : `${100 - pct}% of mandatory cards are incomplete. Sections will be flagged in the PDF.`}
                </div>
              )}
              <button onClick={handleExport} className="w-full btn-accent py-3 text-sm">
                {lang === 'ar' ? 'إنشاء PDF' : 'Generate PDF'}
              </button>
            </>
          )}

          {/* Generating */}
          {(state === 'rendering' || state === 'generating') && (
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
                <div className="absolute inset-0 rounded-full border-2 border-t-gold-500 animate-spin" />
              </div>
              <h2 className={cn('font-display text-lg font-semibold text-navy-900 mb-2', lang === 'ar' && 'font-arabic')}>
                {state === 'rendering'
                  ? (lang === 'ar' ? 'تجهيز المستند…' : 'Preparing document…')
                  : (lang === 'ar' ? 'إنشاء PDF…' : 'Generating PDF…')}
              </h2>
              <p className="text-sm text-slate-500">
                {lang === 'ar' ? 'قد يستغرق هذا 15-30 ثانية' : 'This may take 15–30 seconds'}
              </p>
            </div>
          )}

          {/* Done */}
          {state === 'done' && (
            <>
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-semibold text-navy-900 mb-2 text-center">
                {lang === 'ar' ? 'تم التنزيل!' : 'Downloaded!'}
              </h2>
              <p className="text-sm text-slate-500 mb-6 text-center">
                {lang === 'ar' ? 'تم حفظ PDF في مجلد التنزيلات.' : 'Your PDF has been saved to your downloads folder.'}
              </p>
              <button onClick={handleExport} className="w-full btn-ghost py-2.5 text-sm">
                {lang === 'ar' ? 'إنشاء مرة أخرى' : 'Generate again'}
              </button>
            </>
          )}

          {/* Error */}
          {state === 'error' && (
            <>
              <div className="w-14 h-14 bg-danger-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-semibold text-navy-900 mb-2 text-center">
                {lang === 'ar' ? 'فشل الإنشاء' : 'Generation failed'}
              </h2>
              <p className="text-sm text-danger-500 mb-5 text-center text-xs">{error}</p>
              <button onClick={handleExport} className="w-full btn-primary py-3 text-sm">
                {lang === 'ar' ? 'المحاولة مرة أخرى' : 'Try again'}
              </button>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href={`/study/${studyId}/overview`} className="text-sm text-slate-500 hover:text-navy-900 transition-colors">
            {lang === 'ar' ? '← العودة إلى نظرة عامة' : '← Back to overview'}
          </Link>
        </div>
      </div>
    </div>
  )
}
