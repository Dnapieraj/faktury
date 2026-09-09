'use server'

import { AuthError } from 'next-auth'
import { unstable_rethrow } from 'next/navigation'
import { signIn } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { loginSchema, registerSchema } from '@/lib/validations/auth'

export type AuthFormState = {
  error?: string
  fieldErrors?: Record<string, string[]>
}

const GENERIC_LOGIN_ERROR = 'Nieprawidłowy e-mail lub hasło.'

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const callbackUrl = (formData.get('callbackUrl') as string) || '/dashboard'

  try {
    await signIn('credentials', { ...parsed.data, redirectTo: callbackUrl })
  } catch (error) {
    unstable_rethrow(error)
    if (error instanceof AuthError) return { error: GENERIC_LOGIN_ERROR }
    throw error
  }
  return {}
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    companyName: formData.get('companyName'),
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { companyName, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) {
    return { fieldErrors: { email: ['Konto z tym adresem już istnieje.'] } }
  }

  const passwordHash = await hashPassword(password)
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      company: { create: { name: companyName } },
    },
  })

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' })
  } catch (error) {
    unstable_rethrow(error)
    if (error instanceof AuthError) return { error: GENERIC_LOGIN_ERROR }
    throw error
  }
  return {}
}

export async function signInWithGoogle(callbackUrl?: string) {
  await signIn('google', { redirectTo: callbackUrl || '/dashboard' })
}
