import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

// Next.js 16: `middleware` is now `proxy` (nodejs runtime). Route protection is
// driven by the `authorized` callback in auth.config.ts.
const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: [
    // Everything except Next internals, the auth API and static assets.
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
