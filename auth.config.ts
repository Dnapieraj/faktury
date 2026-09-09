import type { NextAuthConfig } from 'next-auth'

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/clients',
  '/invoices',
  '/recurring',
  '/settings',
  '/onboarding',
]

/**
 * Base config shared by the app and the proxy (middleware). Kept free of the
 * Prisma adapter, bcrypt and other Node-only deps so the proxy bundle stays
 * small — those live in `auth.ts`.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const isProtected = PROTECTED_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
      )
      return isProtected ? Boolean(auth?.user) : true
    },
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
} satisfies NextAuthConfig
