import { z } from 'zod'
import { isValidNip, normalizeNip } from '@/lib/nip'
import { isValidIban, normalizeIban } from '@/lib/iban'

const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max, `Maksymalnie ${max} znaków`)
    .optional()
    .transform((v) => (v ? v : undefined))

export const companySchema = z.object({
  name: z.string().trim().min(2, 'Podaj nazwę firmy').max(200, 'Maksymalnie 200 znaków'),
  taxId: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? normalizeNip(v) : undefined))
    .refine((v) => v === undefined || isValidNip(v), 'Niepoprawny NIP'),
  addressLine: optionalText(200),
  postalCode: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || /^\d{2}-\d{3}$/.test(v), 'Kod pocztowy w formacie 00-000'),
  city: optionalText(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || z.email().safeParse(v).success, 'Niepoprawny adres e-mail'),
  phone: optionalText(40),
  iban: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? normalizeIban(v) : undefined))
    .refine((v) => v === undefined || isValidIban(v), 'Niepoprawny numer konta (IBAN)'),
  invoicePrefix: z
    .string()
    .trim()
    .min(1, 'Podaj prefiks')
    .max(10, 'Maksymalnie 10 znaków')
    .regex(/^[A-Za-z0-9/_-]+$/, 'Dozwolone: litery, cyfry, / _ -')
    .transform((v) => v.toUpperCase()),
  paymentTermDays: z.coerce
    .number()
    .int('Podaj liczbę całkowitą')
    .min(0, 'Nie może być ujemne')
    .max(365, 'Maksymalnie 365 dni'),
  defaultVatRate: z.coerce.number().min(0, 'Nie może być ujemne').max(100, 'Maksymalnie 100%'),
})

export type CompanyInput = z.infer<typeof companySchema>
