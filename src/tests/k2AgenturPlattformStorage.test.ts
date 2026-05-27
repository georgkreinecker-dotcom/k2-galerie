import { describe, it, expect, beforeEach } from 'vitest'
import {
  createDefaultK2AgenturPlattformState,
  kanalStorageKey,
  loadK2AgenturPlattform,
  saveK2AgenturPlattform,
  countK2AgenturByStatus,
} from '../utils/k2AgenturPlattformStorage'

const KEY = 'k2-agentur-plattform'

describe('k2AgenturPlattformStorage', () => {
  beforeEach(() => {
    localStorage.removeItem(KEY)
  })

  it('legt 9 Kanäle an', () => {
    const s = createDefaultK2AgenturPlattformState()
    expect(Object.keys(s.kanaele)).toHaveLength(9)
    expect(s.kanaele[kanalStorageKey('p1', 'google')].status).toBe('offen')
    expect(s.version).toBe(2)
    expect(Object.keys(s.globalSchritte).length).toBeGreaterThanOrEqual(3)
  })

  it('speichert und lädt Status', () => {
    const s = createDefaultK2AgenturPlattformState()
    const key = kanalStorageKey('p2', 'meta')
    s.kanaele[key] = { ...s.kanaele[key], status: 'live', budgetEurMonat: '250', kontoEingerichtet: true }
    saveK2AgenturPlattform(s)
    const loaded = loadK2AgenturPlattform()
    expect(loaded.kanaele[key].status).toBe('live')
    expect(loaded.kanaele[key].budgetEurMonat).toBe('250')
    expect(loaded.kanaele[key].kontoEingerichtet).toBe(true)
  })

  it('zählt Status', () => {
    const s = createDefaultK2AgenturPlattformState()
    const keys = Object.keys(s.kanaele)
    s.kanaele[keys[0]] = { ...s.kanaele[keys[0]], status: 'live' }
    s.kanaele[keys[1]] = { ...s.kanaele[keys[1]], status: 'live' }
    const c = countK2AgenturByStatus(s)
    expect(c.live).toBe(2)
    expect(c.offen).toBe(7)
  })
})
