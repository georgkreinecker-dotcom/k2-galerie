import { describe, it, expect } from 'vitest'
import {
  getVk2Kunstrichtungen,
  getVk2KategorienVorschlagFuerTyp,
  VK2_STAMMDATEN_DEFAULTS,
  type Vk2Stammdaten,
} from '../config/tenantConfig'

describe('VK2 Vereinstyp & Mitglieder-Kategorien', () => {
  it('ohne eigene Liste und ohne vereinsTyp → Kunstbereiche wie bisher', () => {
    const s: Vk2Stammdaten = { ...VK2_STAMMDATEN_DEFAULTS, mitglieder: [] }
    const cats = getVk2Kunstrichtungen(s)
    expect(cats.map((c) => c.id)).toContain('malerei')
    expect(cats.length).toBe(7)
  })

  it('vereinsTyp sport + leere eigeneKategorien → Sport-Vorschläge', () => {
    const s: Vk2Stammdaten = { ...VK2_STAMMDATEN_DEFAULTS, mitglieder: [], vereinsTyp: 'sport' }
    const cats = getVk2Kunstrichtungen(s)
    expect(cats.map((c) => c.id)).toContain('fussball')
    expect(cats.some((c) => c.id === 'malerei')).toBe(false)
  })

  it('eigeneKategorien gesetzt → Vereinstyp wird ignoriert', () => {
    const s: Vk2Stammdaten = {
      ...VK2_STAMMDATEN_DEFAULTS,
      mitglieder: [],
      vereinsTyp: 'sport',
      eigeneKategorien: [{ id: 'meine-sparte', label: 'Meine Sparte' }],
    }
    expect(getVk2Kunstrichtungen(s)).toEqual([{ id: 'meine-sparte', label: 'Meine Sparte' }])
  })

  it('getVk2KategorienVorschlagFuerTyp(musik) enthält Chor', () => {
    const v = getVk2KategorienVorschlagFuerTyp('musik')
    expect(v.map((x) => x.id)).toContain('chor')
  })
})
