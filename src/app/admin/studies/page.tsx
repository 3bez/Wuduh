import { requireAdmin } from '@/lib/auth/admin'
import StudiesClient from './StudiesClient'

export const dynamic = 'force-dynamic'

export default async function Page() {
  await requireAdmin()
  return <StudiesClient />
}
