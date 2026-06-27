import { requireAdmin } from '@/lib/auth/admin'
import UsersClient from './UsersClient'

export const dynamic = 'force-dynamic'

export default async function Page() {
  await requireAdmin()
  return <UsersClient />
}
