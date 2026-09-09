import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
    // Only needed locally (direct-connection Postgres). On Neon, Prisma creates
    // the shadow database automatically.
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
})
