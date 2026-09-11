import 'server-only'
import { Resend } from 'resend'
// resend's SDK requires this to render `react:` email props into HTML, but only
// declares it as an *optional peer dependency* and loads it dynamically — Vercel's
// serverless function bundler doesn't trace that require, so without a direct,
// statically-visible import here the module is silently missing at runtime.
import '@react-email/render'

const apiKey = process.env.RESEND_API_KEY

export const resend = apiKey ? new Resend(apiKey) : null
export const isEmailEnabled = Boolean(apiKey)

/** Sender identity. Override with EMAIL_FROM once a domain is verified in Resend. */
export const EMAIL_FROM = process.env.EMAIL_FROM || 'Faktury <onboarding@resend.dev>'
