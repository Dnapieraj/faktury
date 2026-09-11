/** Google OAuth only lights up once both credentials are configured. */
export function isGoogleEnabled() {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)
}
