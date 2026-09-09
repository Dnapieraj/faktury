'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireCompany } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clientSchema } from '@/lib/validations/client'

export type ClientFormState = {
  error?: string
  fieldErrors?: Record<string, string[]>
}

function parseForm(formData: FormData) {
  return clientSchema.safeParse({
    name: formData.get('name'),
    taxId: formData.get('taxId'),
    email: formData.get('email'),
    addressLine: formData.get('addressLine'),
    postalCode: formData.get('postalCode'),
    city: formData.get('city'),
    country: formData.get('country'),
    notes: formData.get('notes'),
  })
}

export async function saveClientAction(
  _prev: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const { user } = await requireCompany()
  const id = (formData.get('id') as string) || null

  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const data = parsed.data

  let clientId: string
  if (id) {
    const existing = await prisma.client.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    })
    if (!existing) return { error: 'Nie znaleziono klienta.' }
    await prisma.client.update({ where: { id }, data })
    clientId = id
  } else {
    const created = await prisma.client.create({ data: { ...data, userId: user.id } })
    clientId = created.id
  }

  revalidatePath('/clients')
  revalidatePath(`/clients/${clientId}`)
  redirect(`/clients/${clientId}?toast=${id ? 'client-updated' : 'client-created'}`)
}

export async function setClientArchivedAction(id: string, archived: boolean) {
  const { user } = await requireCompany()
  const existing = await prisma.client.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  })
  if (!existing) return { error: 'Nie znaleziono klienta.' }

  await prisma.client.update({ where: { id }, data: { archived } })
  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  return { ok: true }
}

export async function deleteClientAction(id: string) {
  const { user } = await requireCompany()
  const client = await prisma.client.findFirst({
    where: { id, userId: user.id },
    select: { _count: { select: { invoices: true, recurringInvoices: true } } },
  })
  if (!client) return { error: 'Nie znaleziono klienta.' }
  if (client._count.invoices > 0 || client._count.recurringInvoices > 0) {
    return {
      error: 'Nie można usunąć klienta powiązanego z fakturami. Zarchiwizuj go zamiast tego.',
    }
  }

  await prisma.client.delete({ where: { id } })
  revalidatePath('/clients')
  redirect('/clients?toast=client-deleted')
}
