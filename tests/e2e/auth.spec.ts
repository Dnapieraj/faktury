import { expect, test } from '@playwright/test'
import { signUp } from './helpers'

test('landing page loads with CTAs', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Załóż konto' }).first()).toBeVisible()
})

test('protected routes redirect to login when signed out', async ({ page }) => {
  await page.goto('/invoices')
  await expect(page).toHaveURL(/\/login\?callbackUrl=/)
})

test('sign up, sign out, sign back in', async ({ page }) => {
  const { email, password } = await signUp(page)
  await expect(page.getByRole('heading', { name: /Cześć/ })).toBeVisible()

  await page.getByRole('button', { name: 'Wyloguj' }).click()
  await expect(page).toHaveURL(/\/$/)

  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Hasło').fill(password)
  await page.getByRole('button', { name: 'Zaloguj się' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
})

test('login rejects a wrong password', async ({ page }) => {
  const { email } = await signUp(page)
  await page.getByRole('button', { name: 'Wyloguj' }).click()
  await expect(page).toHaveURL(/\/$/)

  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Hasło').fill('totally-wrong')
  await page.getByRole('button', { name: 'Zaloguj się' }).click()

  await expect(page.getByText(/Nieprawidłowy e-mail lub hasło/)).toBeVisible()
})
