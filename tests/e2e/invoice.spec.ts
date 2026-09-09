import { expect, test } from '@playwright/test'
import { signUp } from './helpers'

test('create a client, issue an invoice, download its PDF', async ({ page }) => {
  await signUp(page)

  // --- client ---
  await page.goto('/clients/new')
  await page.getByLabel('Nazwa').fill('Kontrahent Testowy sp. z o.o.')
  await page.getByLabel('NIP').fill('123-456-32-18')
  await page.getByLabel('E-mail').fill('kontrahent@example.test')
  await page.getByRole('button', { name: 'Dodaj klienta' }).click()
  await expect(page.getByRole('heading', { name: 'Kontrahent Testowy sp. z o.o.' })).toBeVisible()

  // --- invoice ---
  await page.goto('/invoices/new')
  await page.getByLabel('Klient').selectOption({ label: 'Kontrahent Testowy sp. z o.o.' })
  await page.getByLabel('Nazwa pozycji').fill('Usługa programistyczna')
  await page.getByLabel('Ilość').fill('10')
  await page.getByLabel('Cena netto').fill('200')
  await expect(page.getByText(/2[\s ]460,00/).first()).toBeVisible() // 10 * 200 * 1.23
  await page.getByRole('button', { name: 'Zapisz szkic' }).click()

  await expect(page).toHaveURL(/\/invoices\/[a-z0-9]+/)
  await expect(page.getByRole('heading', { name: /FV\/\d{4}\/\d{4}/ })).toBeVisible()
  await expect(page.getByText('Do zapłaty')).toBeVisible()

  // --- pdf ---
  const number =
    (await page.getByRole('heading', { name: /FV\// }).textContent())?.match(
      /FV\/\d{4}\/\d{4}/,
    )?.[0] ?? ''
  const res = await page.request.get(page.url() + '/pdf')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('application/pdf')
  expect(
    Buffer.from(await res.body())
      .subarray(0, 5)
      .toString(),
  ).toBe('%PDF-')
  expect(number).toMatch(/FV\/\d{4}\/\d{4}/)

  // --- list ---
  await page.goto('/invoices')
  await expect(page.getByRole('cell', { name: number })).toBeVisible()
})

test('draft invoice shows in the client detail and can be marked sent', async ({ page }) => {
  await signUp(page)

  await page.goto('/clients/new')
  await page.getByLabel('Nazwa').fill('Klient B')
  await page.getByRole('button', { name: 'Dodaj klienta' }).click()
  await expect(page.getByRole('heading', { name: 'Klient B' })).toBeVisible()

  await page.goto('/invoices/new')
  await page.getByLabel('Klient').selectOption({ label: 'Klient B' })
  await page.getByLabel('Nazwa pozycji').fill('Konsultacja')
  await page.getByLabel('Cena netto').fill('500')
  await page.getByRole('button', { name: 'Zapisz szkic' }).click()
  await expect(page).toHaveURL(/\/invoices\/[a-z0-9]+/)

  await page.getByRole('button', { name: 'Oznacz jako wysłaną' }).click()
  await expect(page.getByText('Wysłana').first()).toBeVisible()
})
