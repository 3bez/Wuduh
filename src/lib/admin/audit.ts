import { headers } from 'next/headers'
import { query } from '@/lib/db'
import { getAdminName } from '@/lib/auth/admin'

/**
 * Log an admin action for audit purposes.
 * Call this AFTER the action succeeds — fire-and-forget, never throws.
 */
export async function auditLog(
  action: string,
  targetType: string,
  targetId: string,
  detail?: Record<string, unknown>,
) {
  try {
    const hdrs = await headers()
    const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || hdrs.get('x-real-ip') || null
    const adminName = await getAdminName()
    const fullDetail = { ...detail, ...(adminName ? { admin: adminName } : {}) }
    await query(
      `INSERT INTO admin_audit_log (action, target_type, target_id, detail, ip) VALUES ($1, $2, $3, $4, $5)`,
      [action, targetType, targetId, JSON.stringify(fullDetail), ip],
    )
  } catch {
    // Audit logging should never break the admin action itself
  }
}
