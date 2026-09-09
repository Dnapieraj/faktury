import { handlers } from '@/auth'

// PrismaPg driver adapter needs Node APIs.
export const runtime = 'nodejs'

export const { GET, POST } = handlers
