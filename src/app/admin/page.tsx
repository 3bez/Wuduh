import { requireAdmin } from '@/lib/auth/admin'
import AdminDashboard from './AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  await requireAdmin()
  return <AdminDashboard />
}
