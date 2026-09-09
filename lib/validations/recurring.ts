import { z } from 'zod'
import { invoiceItemSchema } from './invoice'

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Niepoprawna data')
  .transform((s) => new Date(`${s}T12:00:00`))

const itemsFromJson = z
  .string()
  .transform((raw, ctx): unknown => {
    try {
      return JSON.parse(raw)
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Niepoprawne pozycje' })
      return z.NEVER
    }
  })
  .pipe(invoiceItemSchema.array().min(1, 'Dodaj co najmniej jedną pozycję').max(100))

export const recurringSchema = z
  .object({
    clientId: z.string().min(1, 'Wybierz klienta'),
    dayOfMonth: z.coerce
      .number()
      .int('Podaj liczbę całkowitą')
      .min(1, 'Dzień od 1 do 28')
      .max(28, 'Dzień od 1 do 28'),
    paymentTermDays: z.coerce.number().int().min(0, 'Nie może być ujemne').max(365),
    startDate: dateOnly,
    endDate: z
      .string()
      .optional()
      .transform((v) => (v ? new Date(`${v}T12:00:00`) : undefined)),
    notes: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .transform((v) => (v ? v : undefined)),
    items: itemsFromJson,
  })
  .refine((v) => !v.endDate || v.endDate >= v.startDate, {
    message: 'Data zakończenia nie może być wcześniejsza niż początek',
    path: ['endDate'],
  })

export type RecurringInput = z.infer<typeof recurringSchema>
