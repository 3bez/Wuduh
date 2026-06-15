import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Study } from '@/types/database'
import LogoutButton from '@/components/ui/LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch the founder's studies
  const { data: studies } = await supabase
    .from('studies')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Founder'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-semibold text-navy-900">Wuduh</span>
            <span className="font-arabic text-sm text-slate-400">وضوح</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:block">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-container mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="eyebrow mb-2">Dashboard</p>
          <h1 className="font-display text-2xl font-semibold text-navy-900">
            Welcome back, {firstName}
          </h1>
          <p className="text-slate-500 mt-1">
            {studies && studies.length > 0
              ? 'Continue where you left off, or start a new study.'
              : "Let's build your first feasibility study."}
          </p>
        </div>

        {/* Studies grid */}
        {studies && studies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {studies.map(study => (
              <StudyCard key={study.id} study={study} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}

        {/* New study CTA */}
        <a
          href="/study/new"
          className="inline-flex items-center gap-2 btn-primary"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New study
        </a>
      </main>
    </div>
  )
}

function StudyCard({ study }: { study: Study }) {
  const pct = study.completion_percentage ?? 0

  return (
    <div className="card p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
          {study.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={study.logo_url} alt="Logo" className="w-8 h-8 object-contain rounded" />
          ) : (
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )}
        </div>
        <span className={`eyebrow text-2xs px-2 py-0.5 rounded-full ${
          study.language === 'ar' ? 'bg-teal-100 text-teal-700' : 'bg-navy-50 text-navy-500'
        }`}>
          {study.language === 'ar' ? 'عربي' : 'EN'}
        </span>
      </div>

      <h3 className="font-medium text-navy-900 mb-1 truncate">
        {study.startup_name ?? 'Untitled study'}
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        Updated {formatDate(study.updated_at)}
      </p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500">Progress</span>
          <span className="font-mono text-xs text-slate-500">{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={`/study/${study.id}`}
          className="flex-1 text-center text-sm font-medium text-navy-900 bg-navy-50 hover:bg-navy-100 rounded-md py-2 transition-colors"
        >
          Continue
        </a>
        <a
          href={`/study/${study.id}/export`}
          className="flex-1 text-center text-sm font-medium text-gold-700 bg-gold-100 hover:bg-gold-200 rounded-md py-2 transition-colors"
        >
          Export PDF
        </a>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card p-12 text-center mb-8">
      <div className="w-14 h-14 bg-navy-50 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="font-display text-lg font-semibold text-navy-900 mb-1">
        No studies yet
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto">
        Your first feasibility study is one click away. Answer cards, export a document investors will take seriously.
      </p>
    </div>
  )
}
