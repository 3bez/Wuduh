import { requireVerifiedUser } from '@/lib/auth/session'
import { queryOne, query } from '@/lib/db'
import DashboardClient, { type DashboardStudy } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const user = await requireVerifiedUser()

  const profile = await queryOne<{ fullName: string }>(
    'SELECT "fullName" FROM profiles WHERE id = $1',
    [user.id]
  )

  const studies = await query<DashboardStudy>(
    'SELECT * FROM studies WHERE "userId" = $1 ORDER BY "updatedAt" DESC',
    [user.id]
  )

  // Pass the raw first name (or null) — the client applies a locale-aware
  // fallback ("Founder" / "مؤسس") so the greeting matches the chosen UI language.
  const firstName = profile?.fullName?.split(' ')[0] ?? user.name?.split(' ')[0] ?? null

  return <DashboardClient email={user.email} firstName={firstName} studies={studies} />
}
