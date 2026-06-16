'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function ExportPage() {
  const { studyId } = useParams<{ studyId: string }>()
  const [lang, setLang]       = useState<'en' | 'ar'>('en')
  const [pct, setPct]         = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/studies/${studyId}/info`)
      .then(r => r.json())
      .then(d => {
        setLang(d.language ?? 'en')
        setPct(d.completion_percentage ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [studyId])

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  function handleExport() {
    // Open the rendered HTML in a new tab — browser print dialog fires automatically
    window.open(`/api/studies/${studyId}/export/render`, '_blank')
  }

  if (loading) {
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
              ? `دراستك ${pct}% مكتملة. سيفتح المستند في تبويب جديد — اختر "حفظ كـ PDF" عند الطباعة.`
              : `Your study is ${pct}% complete. The document opens in a new tab — choose "Save as PDF" in the print dialog.`}
          </p>

          {pct < 100 && (
            <div className="bg-warning-100 text-warning-600 text-sm rounded-md px-4 py-3 mb-5">
              {lang === 'ar'
                ? `${100 - pct}% من البطاقات الإلزامية لم تكتمل. ستظهر إشعارات الأقسام الناقصة في PDF.`
                : `${100 - pct}% of mandatory cards are incomplete. Incomplete sections will be flagged in the PDF.`}
            </div>
          )}

          <div className="bg-slate-50 rounded-lg px-4 py-3 mb-5">
            <p className="text-xs font-medium text-slate-500 mb-2">
              {lang === 'ar' ? 'كيف يعمل:' : 'How it works:'}
            </p>
            <ol className="text-xs text-slate-500 space-y-1 list-none">
              <li>{lang === 'ar' ? '١. انقر على الزر أدناه' : '1. Click the button below'}</li>
              <li>{lang === 'ar' ? '٢. يفتح تبويب جديد بدراستك' : '2. A new tab opens with your study'}</li>
              <li>{lang === 'ar' ? '٣. تظهر نافذة الطباعة تلقائياً' : '3. Print dialog opens automatically'}</li>
              <li>{lang === 'ar' ? '٤. اختر "حفظ كـ PDF" كالطابعة' : '4. Choose "Save as PDF" as the printer'}</li>
            </ol>
          </div>

          <button onClick={handleExport} className="w-full btn-accent py-3 text-sm">
            {lang === 'ar' ? 'فتح دراستي للطباعة ↗' : 'Open study for printing ↗'}
          </button>
        </div>

        <div className="mt-6 text-center">
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
