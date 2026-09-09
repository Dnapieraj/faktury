import 'server-only'

/**
 * Verify a request comes from Vercel Cron (or a trusted caller). Vercel sends
 * `Authorization: Bearer $CRON_SECRET`. In local dev without CRON_SECRET the
 * check is skipped so the endpoints can be exercised by hand.
 */
export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  return req.headers.get('authorization') === `Bearer ${secret}`
}
