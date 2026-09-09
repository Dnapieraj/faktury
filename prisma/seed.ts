import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { hashPassword } from '../lib/password'

/**
 * Dev seed. Creates a demo account you can log in with:
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
        },
      },
    },
    include: { company: true },
  })

  console.log(`✓ demo user: ${user.email} (firma: ${user.company?.name})`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
