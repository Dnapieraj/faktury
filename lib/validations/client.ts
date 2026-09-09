import { z } from 'zod'
import { isValidNip, normalizeNip } from '@/lib/nip'

/** Turn '' into undefined so optional fields stay clean. */
const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max, `Maksymalnie ${max} znaków`)
    .optional()
    .transform((v) => (v ? v : undefined))

export const clientSchema = z.object({
  name: z.string().trim().min(2, 'Podaj nazwę klienta').max(200, 'Maksymalnie 200 znaków'),
  taxId: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? normalizeNip(v) : undefined))
    .refine((v) => v === undefined || isValidNip(v), 'Niepoprawny NIP'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || z.email().safeParse(v).success, 'Niepoprawny adres e-mail'),
  addressLine: optionalText(200),
  postalCode: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || /^\d{2}-\d{3}$/.test(v), 'Kod pocztowy w formacie 00-000'),
  city: optionalText(120),
  country: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v.toUpperCase() : 'PL')),
  notes: optionalText(2000),
})

export type ClientInput = z.infer<typeof clientSchema>
