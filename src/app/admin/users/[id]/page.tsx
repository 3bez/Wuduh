import { requireAdmin } from '@/lib/auth/admin'
import UserDetailClient from './UserDetailClient'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  return <UserDetailClient id={id} />
}
