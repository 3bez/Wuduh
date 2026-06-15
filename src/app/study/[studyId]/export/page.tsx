'use client'

// /study/[studyId]/export — export page with real PDF generation

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type State = 'idle' | 'generating' | 'done' | 'error'

export default function ExportPage() {
  const { studyId } = useParams<{ studyId: string }>()
  const router = useRouter()
  const [state, setState]   = useState<State>('idle')
  const [url, setUrl]       = useState<string | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const [lang, setLang]     = useState<'en' | 'ar'>('en')
  const [pct, setPct]       = useState(0)
  const [name, setName]     = useState('')

  // Fetch study info on mount
  useEffect(() => {
    fetch(`/api/studies/${studyId}/info`)
      .then(r => r.json())
      .then(d => {
        setLang(d.language ?? 'en')
        setPct(d.completion_percentage ?? 0)
        setName(d.startup_name ?? '')
      })
      .catch(() => {})
  }, [studyId])

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  async function handleExport() {
    setState('generating')
    setError(null)
    try {
      const res  = await fetch(`/api/studies/${studyId}/export`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Generation failed')
      setUrl(data.url)
      setState('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4" dir={dir}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-semibold text-navy-900 tracking-tight">Wuduh</h1>
          <p className="font-arabic text-base text-slate-500 mt-1">وضوح</p>
        </div>

        <div className="card p-8">
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
                  ? `دراستك ${pct}% مكتملة. سيتضمن PDF تلقائياً إشعاراً للأقسام الناقصة.`
                  : `Your study is ${pct}% complete. The PDF will automatically include a notice for any incomplete sections.`}
              </p>

              {pct < 100 && (
                <div className="bg-warning-100 text-warning-600 text-sm rounded-md px-4 py-3 mb-5">
                  {lang === 'ar'
                    ? `${100 - pct}% من البطاقات الإلزامية لم تكتمل بعد. يمكنك التصدير الآن أو إكمال دراستك أولاً.`
                    : `${100 - pct}% of mandatory cards are not yet complete. You can export now or complete your study first.`}
                </div>
              )}

              <button onClick={handleExport} className="w-full btn-accent py-3 text-sm">
                {lang === 'ar' ? 'إنشاء PDF' : 'Generate PDF'}
              </button>
            </>
          )}

          {state === 'generating' && (
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
                <div className="absolute inset-0 rounded-full border-2 border-t-gold-500 animate-spin" />
              </div>
              <h2 className={cn('font-display text-lg font-semibold text-navy-900 mb-2', lang === 'ar' && 'font-arabic')}>
                {lang === 'ar' ? 'جاري إنشاء PDF…' : 'Generating your PDF…'}
              </h2>
              <p className="text-sm text-slate-500">
                {lang === 'ar' ? 'هذا يستغرق حتى 10 ثوانٍ.' : 'This takes up to 10 seconds.'}
              </p>
            </div>
          )}

          {state === 'done' && url && (
            <>
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className={cn('font-display text-xl font-semibold text-navy-900 mb-2 text-center', lang === 'ar' && 'font-arabic')}>
                {lang === 'ar' ? 'جاهز!' : 'Ready!'}
              </h2>
              <p className={cn('text-sm text-slate-500 mb-6 text-center', lang === 'ar' && 'font-arabic')}>
                {lang === 'ar' ? 'دراستك جاهزة للتنزيل. الرابط صالح لمدة ساعة.' : 'Your study is ready to download. The link is valid for 1 hour.'}
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full btn-accent py-3 text-sm text-center mb-3"
              >
                {lang === 'ar' ? '↓ تنزيل PDF' : '↓ Download PDF'}
              </a>
              <button
                onClick={handleExport}
                className="block w-full btn-ghost py-2.5 text-sm text-center"
              >
                {lang === 'ar' ? 'إعادة الإنشاء' : 'Regenerate'}
              </button>
            </>
          )}

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
              <p className="text-sm text-danger-500 mb-5 text-center">{error}</p>
              <button onClick={handleExport} className="w-full btn-primary py-3 text-sm">
                {lang === 'ar' ? 'المحاولة مرة أخرى' : 'Try again'}
              </button>
            </>
          )}
        </div>

        <div className={cn('mt-6 text-center', lang === 'ar' && 'font-arabic')}>
          <Link
            href={`/study/${studyId}/overview`}
            className="text-sm text-slate-500 hover:text-navy-900 transition-colors"
          >
            {lang === 'ar' ? '← العودة إلى نظرة عامة' : '← Back to overview'}
          </Link>
        </div>
      </div>
    </div>
  )
}
