import { describe, it, expect } from 'vitest'
import {
  familiePathWithoutHash,
  getK2FamilieLeitGroups,
  isFamilieNavSectionActive,
} from '../config/k2FamilieStructure'
import { PROJECT_ROUTES } from '../config/navigation'

const R = PROJECT_ROUTES['k2-familie']

describe('getK2FamilieLeitGroups', () => {
  it('enthält Gruppe Prospekte & Präsentationsmappen mit K2-Familie-Kurzprospekt', () => {
    const groups = getK2FamilieLeitGroups()
    const prop = groups.find((g) => g.chapterTitle === 'Prospekte & Präsentationsmappen')
    expect(prop).toBeDefined()
    expect(prop?.sections.some((s) => s.to === R.familiePraesentationsmappe)).toBe(true)
  })
})

describe('isFamilieNavSectionActive', () => {
  it('home nur exakt, nicht Unterpfade', () => {
    expect(isFamilieNavSectionActive(R.home, R.home)).toBe(true)
    expect(isFamilieNavSectionActive(`${R.home}/`, R.home)).toBe(true)
    expect(isFamilieNavSectionActive(`${R.home}/uebersicht`, R.home)).toBe(false)
  })

  it('Stammbaum inkl. Personenseiten', () => {
    expect(isFamilieNavSectionActive(R.stammbaum, R.stammbaum)).toBe(true)
    expect(isFamilieNavSectionActive(`${R.home}/personen/p1`, R.stammbaum)).toBe(true)
  })

  it('Benutzerhandbuch externe Route', () => {
    expect(isFamilieNavSectionActive(R.benutzerHandbuch, R.benutzerHandbuch)).toBe(true)
  })

  it('Link mit Hash: aktiv auf gleichem Pfad (Hash wird für Vergleich ignoriert)', () => {
    const to = `${R.uebersicht}#k2-familie-lizenz-bruecke`
    expect(familiePathWithoutHash(to)).toBe(R.uebersicht)
    expect(isFamilieNavSectionActive(R.uebersicht, to)).toBe(true)
    expect(isFamilieNavSectionActive(`${R.uebersicht}/`, to)).toBe(true)
    expect(isFamilieNavSectionActive(R.home, to)).toBe(false)
  })

  it('Link mit Query: Pfad für Aktiv-Vergleich ohne ?t=…', () => {
    const to = `${R.einstieg}?t=huber`
    expect(familiePathWithoutHash(to)).toBe(R.einstieg)
    expect(isFamilieNavSectionActive(R.einstieg, to)).toBe(true)
  })
})
