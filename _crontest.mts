import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Prisma } from './lib/generated/prisma/client'
const url = "postgresql://neondb_owner:npg_UWV3xZz1MnyC@ep-weathered-dream-b1ujagad-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })

const user = await prisma.user.findUnique({ where: { email: 'demo@faktury.dev' } })
if (!user) throw new Error('brak usera demo')

// --- test 1: fatkura SENT z terminem w przeszłości ---
const client = await prisma.client.create({
  data: { userId: user.id, name: 'CRON TEST Sp. z o.o.', email: 'crontest@example.com' },
})
const inv = await prisma.invoice.create({
  data: {
    userId: user.id,
    clientId: client.id,
    number: 'CRONTEST/0001',
    status: 'SENT',
    issueDate: new Date('2026-08-01'),
    saleDate: new Date('2026-08-01'),
    dueDate: new Date('2026-08-15'), // dawno minęło
    sentAt: new Date('2026-08-01'),
    buyerName: client.name,
    totalNet: new Prisma.Decimal(100),
    totalVat: new Prisma.Decimal(23),
    totalGross: new Prisma.Decimal(123),
    items: { create: [{ name: 'Test', quantity: new Prisma.Decimal(1), unitPriceNet: new Prisma.Decimal(100), vatRate: new Prisma.Decimal(23), position: 0 }] },
  },
})
console.log('TEST1_INVOICE_ID:', inv.id, 'CLIENT_ID:', client.id)

// --- test 2: przestaw szablon cykliczny na "do wystawienia teraz" ---
const rec = await prisma.recurringInvoice.findFirst({ where: { userId: user.id, status: 'ACTIVE' } })
if (rec) {
  console.log('TEST2_RECURRING_ID:', rec.id, 'oryginalny nextRunAt:', rec.nextRunAt.toISOString(), 'lastRunAt:', rec.lastRunAt?.toISOString() ?? null)
  await prisma.recurringInvoice.update({ where: { id: rec.id }, data: { nextRunAt: new Date('2026-01-01') } })
} else {
  console.log('TEST2: brak aktywnego szablonu cyklicznego')
}

await prisma.$disconnect()
