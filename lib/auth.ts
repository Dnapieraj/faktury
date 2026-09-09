import { redirect } from 'next/navigation'
import { cache } from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/** Current session user, or null. Deduped per request. */
export const getCurrentUser = cache(async () => {
  const session = await auth()
  return session?.user ?? null
})

/** For auth pages: bounce already-logged-in users into the app. */
export async function redirectIfAuthenticated(to = '/dashboard') {
  const user = await getCurrentUser()
  if (user?.id) redirect(to)
}

/** Require a logged-in user; redirect to /login otherwise. */
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user?.id) redirect('/login')
  return user
}

/**
 * Require a logged-in user that has completed company onboarding.
 * Redirects to /onboarding when the company profile is missing.
 */
export async function requireCompany() {
  const user = await requireUser()
  const company = await prisma.company.findUnique({ where: { userId: user.id } })
  if (!company) redirect('/onboarding')
  return { user, company }
}
