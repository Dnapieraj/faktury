import { z } from 'zod'

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Niepoprawna data')
  .transform((s) => new Date(`${s}T12:00:00`))

export const invoiceItemSchema = z.object({
  name: z.string().trim().min(1, 'Podaj nazwę pozycji').max(300, 'Maksymalnie 300 znaków'),
  quantity: z.coerce
    .number()
    .gt(0, 'Ilość musi być większa od zera')
    .max(1_000_000, 'Za duża ilość'),
  unitPriceNet: z.coerce
    .number()
    .min(0, 'Cena nie może być ujemna')
    .max(100_000_000, 'Za duża kwota'),
  vatRate: z.coerce.number().min(0, 'VAT nie może być ujemny').max(100, 'Maksymalnie 100%'),
})

export type InvoiceItemValues = z.infer<typeof invoiceItemSchema>

const itemsFromJson = z
  .string()
  .transform((raw, ctx): unknown => {
    try {
      return JSON.parse(raw)
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Niepoprawne pozycje faktury' })
      return z.NEVER
    }
  })
  .pipe(invoiceItemSchema.array().min(1, 'Dodaj co najmniej jedną pozycję').max(100))

export const invoiceSchema = z
  .object({
    clientId: z.string().min(1, 'Wybierz klienta'),
    issueDate: dateOnly,
    saleDate: dateOnly,
    dueDate: dateOnly,
    notes: z
      .string()
      .trim()
      .max(2000, 'Maksymalnie 2000 znaków')
      .optional()
      .transform((v) => (v ? v : undefined)),
    items: itemsFromJson,
  })
  .refine((v) => v.dueDate >= v.issueDate, {
    message: 'Termin płatności nie może być wcześniejszy niż data wystawienia',
    path: ['dueDate'],
  })

export type InvoiceInput = z.infer<typeof invoiceSchema>

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Szkic',
  SENT: 'Wysłana',
  PAID: 'Opłacona',
  OVERDUE: 'Zaległa',
}
