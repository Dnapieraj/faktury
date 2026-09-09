import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { hashPassword } from '../lib/password'
import { computeInvoiceTotals, formatInvoiceNumber } from '../lib/invoice'
import { Prisma } from '../lib/generated/prisma/client'
import { addDays } from '../lib/date'

/**
 * Dev seed. Log in with:
 *   e-mail:  demo@faktury.dev
 *   hasło:   demo12345
 */
async function main() {
  const email = 'demo@faktury.dev'

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Konto demo',
      passwordHash: await hashPassword('demo12345'),
      company: {
        create: {
          name: 'Studio Kreatywne Kowalski',
          taxId: '5252248481',
          addressLine: 'ul. Przykładowa 12/3',
          postalCode: '00-001',
          city: 'Warszawa',
          email,
          iban: 'PL61109010140000071219812874',
          paymentTermDays: 14,
        },
      },
    },
    include: { company: true },
  })

  // Fresh demo data each run.
  await prisma.invoice.deleteMany({ where: { userId: user.id } })
  await prisma.client.deleteMany({ where: { userId: user.id } })

  const [acme, nova] = await Promise.all([
    prisma.client.create({
      data: {
        userId: user.id,
        name: 'Acme Polska sp. z o.o.',
        taxId: '1234563218',
        email: 'bok@acme.pl',
        addressLine: 'ul. Fabryczna 8',
        postalCode: '31-553',
        city: 'Kraków',
      },
    }),
    prisma.client.create({
      data: {
        userId: user.id,
        name: 'Nova Media S.A.',
        taxId: '5252248481',
        email: 'faktury@novamedia.pl',
        addressLine: 'al. Jerozolimskie 100',
        postalCode: '00-807',
        city: 'Warszawa',
      },
    }),
  ])

  const drafts: {
    client: typeof acme
    issue: Date
    items: { name: string; quantity: number; unitPriceNet: number; vatRate: number }[]
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
  }[] = [
    {
      client: acme,
      issue: addDays(new Date(), -40),
      status: 'PAID',
      items: [
        { name: 'Projekt strony WWW — etap 1', quantity: 1, unitPriceNet: 8000, vatRate: 23 },
      ],
    },
    {
      client: nova,
      issue: addDays(new Date(), -20),
      status: 'OVERDUE',
      items: [
        { name: 'Warsztat UX (8 h)', quantity: 8, unitPriceNet: 300, vatRate: 23 },
        { name: 'Opieka powdrożeniowa', quantity: 1, unitPriceNet: 600, vatRate: 23 },
      ],
    },
    {
      client: acme,
      issue: addDays(new Date(), -5),
      status: 'SENT',
      items: [{ name: 'Abonament — wrzesień', quantity: 1, unitPriceNet: 1200, vatRate: 23 }],
    },
    {
      client: nova,
      issue: new Date(),
      status: 'DRAFT',
      items: [{ name: 'Audyt dostępności', quantity: 1, unitPriceNet: 2500, vatRate: 23 }],
    },
  ]

  let seq = 0
  for (const d of drafts) {
    seq += 1
    const totals = computeInvoiceTotals(d.items)
    const dueDate = addDays(d.issue, user.company!.paymentTermDays)
    await prisma.invoice.create({
      data: {
        userId: user.id,
        clientId: d.client.id,
        number: formatInvoiceNumber(user.company!.invoicePrefix, d.issue.getFullYear(), seq),
        status: d.status,
        issueDate: d.issue,
        saleDate: d.issue,
        dueDate,
        sentAt: d.status === 'DRAFT' ? null : d.issue,
        paidAt: d.status === 'PAID' ? addDays(d.issue, 3) : null,
        buyerName: d.client.name,
        buyerTaxId: d.client.taxId,
        buyerAddressLine: d.client.addressLine,
        buyerPostalCode: d.client.postalCode,
        buyerCity: d.client.city,
        totalNet: new Prisma.Decimal(totals.totalNet),
        totalVat: new Prisma.Decimal(totals.totalVat),
        totalGross: new Prisma.Decimal(totals.totalGross),
        items: {
          create: totals.lines.map((line, position) => ({
            name: line.name,
            quantity: new Prisma.Decimal(line.quantity),
            unitPriceNet: new Prisma.Decimal(line.unitPriceNet),
            vatRate: new Prisma.Decimal(line.vatRate),
            position,
          })),
        },
      },
    })
  }

  console.log(`✓ demo: ${user.email} — 2 klientów, ${drafts.length} faktur`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
