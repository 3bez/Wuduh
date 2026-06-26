import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth/admin'
import { query, queryOne } from '@/lib/db'
import { ALL_CARDS } from '@/lib/cards/loader'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const CARD_LABEL = new Map<string, string>(
    ALL_CARDS.map(c => [c.id, c.en?.category || c.en?.prompt || c.id])
  )

  const [
    overview,
    byStatus,
    studiesByLang,
    exportsByLang,
    daily,
    skipped,
    recentUsers,
    recentExports,
  ] = await Promise.all([
    queryOne<Record<string, unknown>>(`
      SELECT
        (SELECT count(*) FROM users)                                                  AS total_users,
        (SELECT count(*) FROM users WHERE "emailVerified")                            AS verified_users,
        (SELECT count(*) FROM users WHERE "createdAt" > now() - interval '7 days')    AS users_7d,
        (SELECT count(*) FROM users WHERE "createdAt" > now() - interval '30 days')   AS users_30d,
        (SELECT count(*) FROM studies)                                                AS total_studies,
        (SELECT count(*) FROM studies WHERE "completionPercentage" = 100)             AS completed_studies,
        (SELECT coalesce(round(avg("completionPercentage")), 0) FROM studies)         AS avg_completion,
        (SELECT count(*) FROM exports)                                                AS total_exports,
        (SELECT count(*) FROM exports WHERE "createdAt" > now() - interval '30 days') AS exports_30d,
        (SELECT count(*) FROM sessions WHERE "expiresAt" > now())                     AS active_sessions,
        (SELECT count(DISTINCT "userId") FROM studies)                                AS users_with_study,
        (SELECT count(DISTINCT "userId") FROM exports)                                AS users_with_export
    `),
    query(`SELECT status, count(*)::int AS n FROM studies GROUP BY status`),
    query(`SELECT language, count(*)::int AS n FROM studies GROUP BY language`),
    query(`SELECT language, count(*)::int AS n FROM exports GROUP BY language`),
    query(`
      WITH days AS (
        SELECT generate_series(
          date_trunc('day', now()) - interval '13 days',
          date_trunc('day', now()),
          interval '1 day'
        ) AS day
      )
      SELECT
        to_char(d.day, 'YYYY-MM-DD') AS day,
        to_char(d.day, 'DD Mon')     AS label,
        (SELECT count(*) FROM users   u WHERE date_trunc('day', u."createdAt") = d.day)::int AS signups,
        (SELECT count(*) FROM studies s WHERE date_trunc('day', s."createdAt") = d.day)::int AS studies,
        (SELECT count(*) FROM exports e WHERE date_trunc('day', e."createdAt") = d.day)::int AS exports
      FROM days d
      ORDER BY d.day
    `),
    query<{ cardId: string; skipped: number; total: number }>(`
      SELECT "cardId",
        count(*) FILTER (WHERE status = 'skipped')::int AS skipped,
        count(*)::int AS total
      FROM answers
      GROUP BY "cardId"
      HAVING count(*) FILTER (WHERE status = 'skipped') > 0
      ORDER BY skipped DESC, total DESC
      LIMIT 12
    `),
    query(`
      SELECT u.id, u.email, u."emailVerified", u.name, u."createdAt",
        (SELECT count(*) FROM studies s WHERE s."userId" = u.id)::int AS studies,
        (SELECT count(*) FROM exports e WHERE e."userId" = u.id)::int AS exports
      FROM users u
      ORDER BY u."createdAt" DESC
      LIMIT 12
    `),
    query(`
      SELECT e.id, e.language, e."completionSnapshot", e."createdAt",
        s."startupName", u.email
      FROM exports e
      LEFT JOIN studies s ON s.id = e."studyId"
      LEFT JOIN users u   ON u.id = e."userId"
      ORDER BY e."createdAt" DESC
      LIMIT 12
    `),
  ])

  const skippedCards = skipped.map(c => ({ ...c, label: CARD_LABEL.get(c.cardId) ?? c.cardId }))

  return NextResponse.json({
    overview, byStatus, studiesByLang, exportsByLang, daily, skippedCards, recentUsers, recentExports,
  })
}
