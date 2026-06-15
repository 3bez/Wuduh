'use client'

// StudyProgressBar — global completion bar shown in the card journey header

import { cn } from '@/lib/utils'

interface Props {
  percentage: number
  lang?: 'en' | 'ar'
}

export default function StudyProgressBar({ percentage, lang = 'en' }: Props) {
  return (
    <div className="flex items-center gap-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={cn('font-mono text-xs text-slate-400 tabular-nums', 'min-w-[36px] text-right')}>
        {percentage}%
      </span>
    </div>
  )
}
