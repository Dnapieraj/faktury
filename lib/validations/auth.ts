import { z } from 'zod'

export const emailSchema = z.email({ message: 'Podaj poprawny adres e-mail' }).trim().toLowerCase()

export const passwordSchema = z
  .string()
  .min(8, 'Hasło musi mieć co najmniej 8 znaków')
  .max(72, 'Hasło może mieć maksymalnie 72 znaki')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Podaj hasło'),
})

export const registerSchema = z.object({
  companyName: z.string().trim().min(2, 'Podaj nazwę firmy').max(120, 'Nazwa firmy jest za długa'),
  email: emailSchema,
  password: passwordSchema,
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
