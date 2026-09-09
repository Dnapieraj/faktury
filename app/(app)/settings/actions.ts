'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { companySchema } from '@/lib/validations/company'

export type CompanyFormState = {
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function updateCompanyAction(
  _prev: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const user = await requireUser()

  const parsed = companySchema.safeParse({
    name: formData.get('name'),
    taxId: formData.get('taxId'),
    addressLine: formData.get('addressLine'),
    postalCode: formData.get('postalCode'),
    city: formData.get('city'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    iban: formData.get('iban'),
    invoicePrefix: formData.get('invoicePrefix'),
    paymentTermDays: formData.get('paymentTermDays'),
    defaultVatRate: formData.get('defaultVatRate'),
  })
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  await prisma.company.upsert({
    where: { userId: user.id },
    update: parsed.data,
    create: { ...parsed.data, userId: user.id },
  })

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  redirect('/settings?toast=settings-saved')
}
