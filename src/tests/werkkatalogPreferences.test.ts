import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadWerkkatalogPrefs,
  saveWerkkatalogPrefs,
  werkkatalogStorageKey,
  DEFAULT_KATALOG_FILTER,
  DEFAULT_KATALOG_SPALTEN_K2_OEK2,
} from '../utils/werkkatalogPreferences'

describe('werkkatalogPreferences', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('speichert und lädt Filter + Spalten (K2-Key)', () => {
    const key = werkkatalogStorageKey(false, false)
    const filter = { ...DEFAULT_KATALOG_FILTER, status: 'verkauft' as const, suchtext: 'rose' }
    const spalten = ['nummer', 'titel', 'vorschau', 'preis']
    saveWerkkatalogPrefs(key, { filter, spalten })
    const loaded = loadWerkkatalogPrefs(key, { isVk2: false })
    expect(loaded).not.toBeNull()
    expect(loaded!.filter).toEqual(filter)
    expect(loaded!.spalten).toEqual(spalten)
  })

  it('VK2: ungültige Spalten-ID wird verworfen, Fallback wenn leer', () => {
    const key = werkkatalogStorageKey(false, true)
    localStorage.setItem(
      key,
      JSON.stringify({
        v: 1,
        filter: DEFAULT_KATALOG_FILTER,
        spalten: ['nummer', 'ek', 'invalid'],
      }),
    )
    const loaded = loadWerkkatalogPrefs(key, { isVk2: true })
    expect(loaded!.spalten).toEqual(['nummer'])
  })

  it('ungültiges JSON liefert null', () => {
    const key = werkkatalogStorageKey(false, false)
    localStorage.setItem(key, '{')
    expect(loadWerkkatalogPrefs(key, { isVk2: false })).toBeNull()
  })

  it('falsche Version liefert null', () => {
    const key = werkkatalogStorageKey(false, false)
    localStorage.setItem(
      key,
      JSON.stringify({ v: 2, filter: DEFAULT_KATALOG_FILTER, spalten: [...DEFAULT_KATALOG_SPALTEN_K2_OEK2] }),
    )
    expect(loadWerkkatalogPrefs(key, { isVk2: false })).toBeNull()
  })
})
