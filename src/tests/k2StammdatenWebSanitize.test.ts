import { describe, it, expect } from 'vitest'
import { sanitizeK2WebsiteField, sanitizeK2ParsedStammdatenRecord } from '../utils/k2StammdatenWebSanitize'

describe('sanitizeK2WebsiteField', () => {
  it('leert blockierte Demo-Domains', () => {
    expect(sanitizeK2WebsiteField('www.k2-galerie.at')).toBe('')
    expect(sanitizeK2WebsiteField('https://www.k2-galerie.at/pfad')).toBe('')
    expect(sanitizeK2WebsiteField('https://kuenstlerin-muster.example')).toBe('')
  })

  it('lässt andere Domains unverändert', () => {
    expect(sanitizeK2WebsiteField('https://example.org/meine-seite')).toBe('https://example.org/meine-seite')
  })

  it('leer bleibt leer', () => {
    expect(sanitizeK2WebsiteField('')).toBe('')
    expect(sanitizeK2WebsiteField(null)).toBe('')
  })
})

describe('sanitizeK2ParsedStammdatenRecord', () => {
  it('setzt changed bei Galerie website/internetadresse', () => {
    const { data, changed } = sanitizeK2ParsedStammdatenRecord('gallery', {
      website: 'https://k2-galerie.at',
      internetadresse: 'www.k2-galerie.at',
    } as Record<string, unknown>)
    expect(changed).toBe(true)
    expect((data as { website: string }).website).toBe('')
    expect((data as { internetadresse: string }).internetadresse).toBe('')
  })
})
