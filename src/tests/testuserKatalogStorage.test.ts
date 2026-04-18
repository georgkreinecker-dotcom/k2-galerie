/**
 * Testuser-Katalog: Seed (drei Piloten) + registerPilotZettelInKatalog (Upsert).
 */

import { describe, it, expect } from 'vitest'
import {
  ensureTestuserKatalogSeedOnce,
  loadTestuserKatalog,
  registerPilotZettelInKatalog,
} from '../utils/testuserKatalogStorage'

describe('testuserKatalogStorage', () => {
  it('ensureTestuserKatalogSeedOnce legt drei Einträge mit seed-pilot-IDs an', () => {
    expect(loadTestuserKatalog()).toHaveLength(0)
    ensureTestuserKatalogSeedOnce()
    const list = loadTestuserKatalog()
    expect(list).toHaveLength(3)
    expect(list.map((e) => e.id).sort()).toEqual(['seed-pilot-1', 'seed-pilot-2', 'seed-pilot-3'])
    expect(list.every((e) => e.status === 'zugang_gesendet')).toBe(true)
  })

  it('ensureTestuserKatalogSeedOnce ist idempotent', () => {
    ensureTestuserKatalogSeedOnce()
    ensureTestuserKatalogSeedOnce()
    expect(loadTestuserKatalog()).toHaveLength(3)
  })

  it('registerPilotZettelInKatalog fügt Eintrag mit Zugangsblatt hinzu', () => {
    ensureTestuserKatalogSeedOnce()
    registerPilotZettelInKatalog({
      name: 'Anna Test',
      appName: 'Meine Galerie',
      pilotLinie: 'oek2',
      zettelNr: 'P-001',
      zugangsblattRelPath: '/zettel-pilot?x=1',
    })
    const list = loadTestuserKatalog()
    const anna = list.find((e) => e.name === 'Anna Test')
    expect(anna).toBeDefined()
    expect(anna?.zugangsblattUrl).toBe('/zettel-pilot?x=1')
    expect(anna?.pilotRegKey).toBe('P-001|Anna Test|Meine Galerie')
    expect(anna?.status).toBe('zugang_gesendet')
    expect(list).toHaveLength(4)
  })

  it('registerPilotZettelInKatalog aktualisiert bei gleichem pilotRegKey', () => {
    ensureTestuserKatalogSeedOnce()
    registerPilotZettelInKatalog({
      name: 'Bob',
      appName: 'App B',
      pilotLinie: 'vk2',
      zettelNr: 'Z-9',
      zugangsblattRelPath: '/zettel-pilot?a=1',
    })
    registerPilotZettelInKatalog({
      name: 'Bob',
      appName: 'App B',
      pilotLinie: 'vk2',
      zettelNr: 'Z-9',
      zugangsblattRelPath: '/zettel-pilot?a=2',
    })
    const list = loadTestuserKatalog()
    const bobs = list.filter((e) => e.name === 'Bob' && e.appName === 'App B')
    expect(bobs).toHaveLength(1)
    expect(bobs[0]?.zugangsblattUrl).toBe('/zettel-pilot?a=2')
    expect(list.filter((e) => e.name === 'Bob')).toHaveLength(1)
  })
})
