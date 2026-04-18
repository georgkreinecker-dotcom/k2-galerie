import { test, expect } from '@playwright/test'

/**
 * Test-Pilot: Formular → Navigation zu /zettel-pilot mit erwarteten Query-Parametern.
 */
test.describe('Zettel Pilot Formular', () => {
  test('füllt aus, wählt ök2, generiert Laufzettel', async ({ page }) => {
    await page.goto('/zettel-pilot-form')

    await page.getByPlaceholder('z. B. Muna').fill('E2E Pilot Nix')
    await page.getByPlaceholder(/Familie Huber/).fill('E2E App Demo')
    await page.getByRole('radio', { name: /ök2/ }).check()
    await page.getByRole('button', { name: 'Laufzettel generieren' }).click()

    await expect(page).toHaveURL(/\/zettel-pilot\?/)

    const u = new URL(page.url())
    expect(u.searchParams.get('name')).toBe('E2E Pilot Nix')
    expect(u.searchParams.get('appName')).toBe('E2E App Demo')
    expect(u.searchParams.get('type')).toBe('oek2')
    expect(u.searchParams.get('pilotUrl')).toBeTruthy()

    await expect(page.getByText('E2E Pilot Nix')).toBeVisible()
    await expect(page.getByText('E2E App Demo')).toBeVisible()
  })
})
