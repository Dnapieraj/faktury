import 'server-only'
import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY

/** Configured Stripe client, or null when keys are not set (local dev without Stripe). */
export const stripe = key ? new Stripe(key, { typescript: true }) : null

export function requireStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe nie jest skonfigurowany. Ustaw STRIPE_SECRET_KEY.')
  }
  return stripe
}

export const isStripeEnabled = Boolean(key)
