import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  readEntdeckenHeroPathFromLocalStorage,
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
