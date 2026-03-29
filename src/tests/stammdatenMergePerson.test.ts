/**
 * Stammdaten Person-Merge: Auto-Save-Race darf Martinas/Georgs gespeicherte Kontaktdaten
 * nicht mit Repo-Defaults überschreiben (BUG: gleicher Default-Telefon-String für beide).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mergeStammdatenPerson, buildK2PersonStateForAdmin } from '../utils/stammdatenStorage'

const defaults = {
  name: 'Martina Kreinecker',
  email: 'martina@x.at',
  phone: '0664 1046337',
  website: '',
}

describe('mergeStammdatenPerson – geschützte Skalare', () => {
  it('behält gespeichertes Telefon wenn Incoming nur den Repo-Default liefert', () => {
    const incoming = {
      name: 'Martina Kreinecker',
      email: 'martina@x.at',
      phone: '0664 1046337',
      category: 'malerei',
    }
    const existing = { name: 'Martina Kreinecker', email: 'martina@x.at', phone: '+43 999 111111' }
    const out = mergeStammdatenPerson(incoming, existing, defaults)
    expect(out.phone).toBe('+43 999 111111')
  })

  it('übernimmt bewusste Änderung wenn Incoming vom Default abweicht', () => {
    const incoming = { phone: '+43 777 222222' }
    const existing = { phone: '+43 999 111111' }
    const out = mergeStammdatenPerson(incoming, existing, defaults)
    expect(out.phone).toBe('+43 777 222222')
  })
})

describe('buildK2PersonStateForAdmin', () => {
  beforeEach(() => {
    try {
      localStorage.removeItem('k2-stammdaten-martina')
      localStorage.removeItem('k2-stammdaten-georg')
    } catch {
      /* ignore */
    }
  })

  it('liest Martinas Telefon direkt aus k2-stammdaten-martina', () => {
    localStorage.setItem(
      'k2-stammdaten-martina',
      JSON.stringify({ name: 'Martina K.', email: 'm@test.at', phone: '+43 111 ONLY-M' }),
    )
    const s = buildK2PersonStateForAdmin('martina')
    expect(s.phone).toBe('+43 111 ONLY-M')
  })
})
