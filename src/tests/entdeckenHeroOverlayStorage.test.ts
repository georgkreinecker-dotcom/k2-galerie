import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  readEntdeckenHeroPathFromLocalStorage,
  normalizeHeroImageUrlForOverlayMatch,
} from '../utils/entdeckenHeroOverlayStorage'

const KEY = 'k2-page-content-entdecken'

describe('entdeckenHeroOverlayStorage – Hero-Pfad aus localStorage', () => {
  beforeEach(() => {
    localStorage.removeItem(KEY)
  })
  afterEach(() => {
    localStorage.removeItem(KEY)
  })

  it('liefert Standard-Pfad wenn nichts gespeichert', () => {
    expect(readEntdeckenHeroPathFromLocalStorage()).toBe('/img/oeffentlich/entdecken-hero.jpg')
  })

  it('liest heroImageUrl aus k2-page-content-entdecken', () => {
    localStorage.setItem(KEY, JSON.stringify({ heroImageUrl: '/img/k2/tor-test.jpg' }))
    expect(readEntdeckenHeroPathFromLocalStorage()).toBe('/img/k2/tor-test.jpg')
  })

  it('trimmt und fällt bei leerem heroImageUrl auf Standard zurück', () => {
    localStorage.setItem(KEY, JSON.stringify({ heroImageUrl: '   ' }))
    expect(readEntdeckenHeroPathFromLocalStorage()).toBe('/img/oeffentlich/entdecken-hero.jpg')
  })
})

describe('normalizeHeroImageUrlForOverlayMatch', () => {
  it('behält stabilen Versionsparameter v', () => {
    expect(normalizeHeroImageUrlForOverlayMatch('/img/x.jpg?v=123')).toBe('/img/x.jpg?v=123')
  })
  it('lässt Pfad ohne Query unverändert', () => {
    expect(normalizeHeroImageUrlForOverlayMatch('/img/x.jpg')).toBe('/img/x.jpg')
  })
  it('normiert absolute URL auf pathname + v (gleicher Abgleich wie bei /img/...)', () => {
    expect(normalizeHeroImageUrlForOverlayMatch('https://k2-galerie.vercel.app/img/k2/tor.jpg?v=9')).toBe(
      '/img/k2/tor.jpg?v=9'
    )
    expect(normalizeHeroImageUrlForOverlayMatch('/img/k2/tor.jpg')).toBe('/img/k2/tor.jpg')
  })
  it('ignoriert fluechtigen _-Parameter', () => {
    expect(normalizeHeroImageUrlForOverlayMatch('/img/k2/tor.jpg?v=9&_=123')).toBe('/img/k2/tor.jpg?v=9')
  })
})
