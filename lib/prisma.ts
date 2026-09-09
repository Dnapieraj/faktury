import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/lib/generated/prisma/client'

const log = process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']

const CONNECTION_ERROR =
  /Connection terminated|Server has closed|ECONNRESET|ECONNREFUSED|Closed connection|terminating connection|socket hang up/i

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function createPrismaClient() {
  const base = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      // Neon and the local `prisma dev` server both drop idle connections;
      // recycle proactively and keep the socket warm.
      max: 10,
      idleTimeoutMillis: 60_000,
      keepAlive: true,
    }),
    log: log as ('warn' | 'error')[],
  })

  // Transparently retry a query once or twice when the pool hands back a
  // connection the server already closed (common on serverless Postgres).
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        for (let attempt = 0; ; attempt++) {
          try {
            return await query(args)
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            if (attempt >= 2 || !CONNECTION_ERROR.test(message)) throw error
            await sleep(50 * (attempt + 1))
          }
        }
      },
    },
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
