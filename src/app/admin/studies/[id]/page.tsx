import { requireAdmin } from '@/lib/auth/admin'
import StudyDetailClient from './StudyDetailClient'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  return <StudyDetailClient id={id} />
}
