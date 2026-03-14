/**
 * Prüfung: Typ (Kunstwerk/Produkt/Idee) und Kategorie passen zusammen.
 * MUSTER_ARTWORKS und jede Werkkarte sollen konsistent sein.
 */
import { describe, it, expect } from 'vitest'
import { MUSTER_ARTWORKS, categoryBelongsToEntryType, getCategoriesForEntryType, getEntryTypeLabel, getCategoryLabel, isSubcategoryPlausibleForCategory } from '../config/tenantConfig'

describe('EntryType und Kategorie – Konsistenz', () => {
  it('MUSTER_ARTWORKS: Jedes Werk hat Kategorie, die zum Typ passt', () => {
    for (const artwork of MUSTER_ARTWORKS) {
      const ok = categoryBelongsToEntryType(artwork.category, artwork.entryType)
      expect(ok, `${artwork.number} (${getEntryTypeLabel(artwork.entryType)} + ${getCategoryLabel(artwork.category)}) soll zusammenpassen`).toBe(true)
    }
  })

  it('MUSTER_ARTWORKS: Einzelprüfung M1=Kunstwerk+malerei, P1=Produkt+serie, I1=Idee+konzept', () => {
    const m1 = MUSTER_ARTWORKS.find((a) => a.number === 'M1')
    const p1 = MUSTER_ARTWORKS.find((a) => a.number === 'P1')
    const i1 = MUSTER_ARTWORKS.find((a) => a.number === 'I1')
    expect(m1?.entryType).toBe('artwork')
    expect(m1?.category).toBe('malerei')
    expect(getCategoriesForEntryType('artwork').some((c) => c.id === 'malerei')).toBe(true)
    expect(p1?.entryType).toBe('product')
    expect(p1?.category).toBe('serie')
    expect(getCategoriesForEntryType('product').some((c) => c.id === 'serie')).toBe(true)
    expect(i1?.entryType).toBe('idea')
    expect(i1?.category).toBe('konzept')
    expect(getCategoriesForEntryType('idea').some((c) => c.id === 'konzept')).toBe(true)
  })

  it('categoryBelongsToEntryType: artwork-Kategorie zu product ergibt false', () => {
    expect(categoryBelongsToEntryType('malerei', 'product')).toBe(false)
    expect(categoryBelongsToEntryType('serie', 'artwork')).toBe(false)
    expect(categoryBelongsToEntryType('konzept', 'artwork')).toBe(false)
  })

  describe('isSubcategoryPlausibleForCategory: Unterkategorie (frei) passt zur Kategorie', () => {
    it('Druck/Repro + "Kunst und Kunstschaffenden" ist nicht plausibel', () => {
      expect(isSubcategoryPlausibleForCategory('druck', 'Kunst und Kunstschaffenden')).toBe(false)
      expect(isSubcategoryPlausibleForCategory('serie', 'Kunst und Kunstschaffende')).toBe(false)
    })
    it('Druck/Repro + technische Unterkategorie ist plausibel', () => {
      expect(isSubcategoryPlausibleForCategory('druck', 'Poster')).toBe(true)
      expect(isSubcategoryPlausibleForCategory('druck', 'Reproduktion')).toBe(true)
    })
    it('Leere oder Kunstwerk-Kategorie ignoriert Prüfung', () => {
      expect(isSubcategoryPlausibleForCategory('druck', '')).toBe(true)
      expect(isSubcategoryPlausibleForCategory('malerei', 'Kunst und Kunstschaffenden')).toBe(true)
    })
  })
})
