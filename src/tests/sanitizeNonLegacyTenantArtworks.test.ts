import { describe, expect, it } from 'vitest'
import { stripK2ProductionStyleArtworks } from '../utils/k2BulkInfectionGuard'
import {
  LEGACY_TENANTS,
  sanitizeArtworksForNonLegacyTenant,
} from '../../api/sanitizeNonLegacyTenantArtworks.js'

describe('sanitizeArtworksForNonLegacyTenant (API-Schreib-Riegel)', () => {
  it('Legacy-Mandanten: Liste unverändert (inkl. K2-M-…)', () => {
    const artworks = [{ number: 'K2-M-1' }, { number: 'K2-K-2' }]
    expect(sanitizeArtworksForNonLegacyTenant('k2', artworks)).toBe(artworks)
    expect(sanitizeArtworksForNonLegacyTenant('oeffentlich', artworks)).toBe(artworks)
    expect(sanitizeArtworksForNonLegacyTenant('vk2', artworks)).toBe(artworks)
  })

  it('Lizenz-Mandant: entfernt K2-M/G/K/S/O-Produktionsnummern, K2-W- bleibt', () => {
    const input = [
      { number: 'K2-M-100' },
      { number: 'K2-W-5' },
      { id: 'eigen-1', number: 'L-1' },
    ]
    expect(sanitizeArtworksForNonLegacyTenant('galerie-demo', input)).toEqual([
      { number: 'K2-W-5' },
      { id: 'eigen-1', number: 'L-1' },
    ])
  })

  it('nicht-Array / undefined: unverändert zurück', () => {
    expect(sanitizeArtworksForNonLegacyTenant('galerie-demo', undefined)).toBeUndefined()
    // @ts-expect-error Absichtlich falscher Typ
    expect(sanitizeArtworksForNonLegacyTenant('galerie-demo', null)).toBeNull()
  })

  it('LEGACY_TENANTS ist mit write-gallery-data-Pfaden abgestimmt', () => {
    expect(LEGACY_TENANTS).toEqual(['k2', 'oeffentlich', 'vk2'])
  })

  it('Lizenz „Werk anlegen“: Nummer wie M-0001 (ohne K2-Präfix) bleibt durch Client-Strip und Server-Sanitize erhalten', () => {
    const neu = { number: 'M-0001', id: 'M-0001', title: 'Neues Werk' }
    const stripped = stripK2ProductionStyleArtworks([neu])
    expect(stripped).toEqual([neu])
    expect(sanitizeArtworksForNonLegacyTenant('galerie-demo', stripped)).toEqual(stripped)
  })

  it('entfernt K2-Produktionsnummern auch bei Unicode-Bindestrich in der Nummer', () => {
    const u = '\u2011' // non-breaking hyphen
    const infected = { number: `K2${u}M${u}0001` }
    expect(sanitizeArtworksForNonLegacyTenant('galerie-demo', [infected, { number: 'M-0002' }])).toEqual([{ number: 'M-0002' }])
  })
})
