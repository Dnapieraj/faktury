import { expect, type Page } from '@playwright/test'

let seq = 0

/** Register a fresh isolated account and land on the dashboard. */
export async function signUp(page: Page) {
  const email = `e2e+${Date.now()}-${seq++}@example.test`
  const password = 'e2e-password-123'

  await page.goto('/register')
  await page.getByLabel('Nazwa firmy').fill('E2E Testy sp. z o.o.')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Hasło').fill(password)
  await page.getByRole('button', { name: 'Załóż konto' }).click()

  await expect(page).toHaveURL(/\/dashboard/)
  return { email, password }
}
