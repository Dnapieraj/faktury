import 'server-only'
import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY

export const resend = apiKey ? new Resend(apiKey) : null
export const isEmailEnabled = Boolean(apiKey)

/** Sender identity. Override with EMAIL_FROM once a domain is verified in Resend. */
export const EMAIL_FROM = process.env.EMAIL_FROM || 'Faktury <onboarding@resend.dev>'
