import { isAuthorizedCron } from '@/lib/cron'
import { runRecurringJob } from '@/lib/jobs/recurring'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const result = await runRecurringJob()
    console.info('[cron/recurring]', result)
    return Response.json({ ok: true, ...result })
  } catch (error) {
    console.error('[cron/recurring] failed', error)
    return Response.json({ ok: false, error: 'Job failed' }, { status: 500 })
  }
}
