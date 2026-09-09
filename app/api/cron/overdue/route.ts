import { isAuthorizedCron } from '@/lib/cron'
import { runOverdueJob } from '@/lib/jobs/overdue'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const result = await runOverdueJob()
    console.info('[cron/overdue]', result)
    return Response.json({ ok: true, ...result })
  } catch (error) {
    console.error('[cron/overdue] failed', error)
    return Response.json({ ok: false, error: 'Job failed' }, { status: 500 })
  }
}
