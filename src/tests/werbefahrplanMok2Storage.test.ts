import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadMok2Werbefahrplan,
  saveMok2Werbefahrplan,
  MOK2_WERBEFAHRPLAN_DEFAULT,
  type Mok2WerbeKampagne,
} from '../utils/werbefahrplanMok2Storage'

const KEY = 'k2-mok2-werbefahrplan'

describe('werbefahrplanMok2Storage', () => {
  beforeEach(() => {
    localStorage.removeItem(KEY)
  })

  it('liefert Default wenn leer', () => {
    const rows = loadMok2Werbefahrplan()
    expect(rows.length).toBe(1)
    expect(rows[0].titel).toBe(MOK2_WERBEFAHRPLAN_DEFAULT[0].titel)
    expect(rows[0].vonISO).toBe('2026-05-15')
    expect(rows[0].bisISO).toBe('2026-06-15')
    expect(rows[0].aktivitaeten).toContain('Inserate')
  })

  it('speichert und lädt zurück', () => {
    const custom: Mok2WerbeKampagne[] = [
      { id: 'a', titel: 'Test', vonISO: '2026-01-01', bisISO: '2026-01-31', aktivitaeten: 'x' },
    ]
    saveMok2Werbefahrplan(custom)
    expect(loadMok2Werbefahrplan()).toEqual(custom)
  })
})
