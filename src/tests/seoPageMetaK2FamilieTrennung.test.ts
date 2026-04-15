import { describe, expect, it } from 'vitest'
import { getPageMeta } from '../config/seoPageMeta'

/**
 * Eiserne Trennung K2 Familie vs. K2 Galerie: SEO-Titel/Description dürfen auf Familien-URLs
 * nie das Galerie-Default-Meta liefern (Regression: fehlender ROUTE_META-Eintrag für /familie).
 */
describe('SEO: K2 Familie vs. K2 Galerie (keine Vermischung)', () => {
  const familiePfade = [
    '/familie',
    '/familie/',
    '/k2-familie-handbuch',
    '/projects/k2-familie',
    '/projects/k2-familie/meine-familie',
    '/projects/k2-familie/handbuch',
  ]

  it.each(familiePfade)('%s: kein Galerie-Default (Trennung)', (pathname) => {
    const m = getPageMeta(pathname)
    expect(m.title).not.toMatch(/K2 Galerie/i)
    expect(m.description).not.toMatch(/Martina und Georg Kreinecker.*Werke/i)
    if (pathname === '/k2-familie-handbuch') {
      expect(m.title).toContain('Benutzerhandbuch')
    } else {
      expect(m.title).toBe('K2 Familie')
    }
  })

  it('/galerie bleibt Galerie-Meta', () => {
    const m = getPageMeta('/galerie')
    expect(m.title).toMatch(/K2 Galerie/)
  })
})
