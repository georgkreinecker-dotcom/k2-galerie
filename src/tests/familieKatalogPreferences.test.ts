import { describe, it, expect, beforeEach } from 'vitest'
import {
  DEFAULT_FAMILIE_KATALOG_SPALTEN,
  familienKatalogPrefsStorageKey,
  loadFamilienKatalogSpalten,
  normalizeFamilieKatalogSpalten,
  saveFamilienKatalogSpalten,
} from '../utils/familieKatalogPreferences'

describe('familieKatalogPreferences', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('normalize: leer oder ohne name → Default mit name', () => {
    expect(normalizeFamilieKatalogSpalten([])).toEqual(DEFAULT_FAMILIE_KATALOG_SPALTEN)
    expect(normalizeFamilieKatalogSpalten(['id', 'geboren'])).toContain('name')
    expect(normalizeFamilieKatalogSpalten(['id', 'geboren'])[0]).toBe('name')
  })

  it('speichert und lädt Spalten pro Tenant', () => {
    const tid = 'test-tenant'
    const key = familienKatalogPrefsStorageKey(tid)
    const spalten = ['name', 'nr', 'geboren', 'eltern']
    saveFamilienKatalogSpalten(tid, spalten)
    expect(JSON.parse(localStorage.getItem(key) || '{}').spalten).toEqual(normalizeFamilieKatalogSpalten(spalten))
    expect(loadFamilienKatalogSpalten(tid)).toEqual(normalizeFamilieKatalogSpalten(spalten))
  })

  it('falsche Version → Default', () => {
    const tid = 'x'
    localStorage.setItem(familienKatalogPrefsStorageKey(tid), JSON.stringify({ v: 2, spalten: ['name'] }))
    expect(loadFamilienKatalogSpalten(tid)).toEqual(DEFAULT_FAMILIE_KATALOG_SPALTEN)
  })
})
