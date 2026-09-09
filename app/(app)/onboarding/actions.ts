'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  name: z.string().trim().min(2, 'Podaj nazwę firmy').max(120, 'Nazwa firmy jest za długa'),
})

export type OnboardingState = { fieldErrors?: Record<string, string[]> }

export async function createCompanyAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const user = await requireUser()

  const parsed = schema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  await prisma.company.upsert({
    where: { userId: user.id },
    update: { name: parsed.data.name },
    create: { userId: user.id, name: parsed.data.name },
  })

  redirect('/dashboard')
}
