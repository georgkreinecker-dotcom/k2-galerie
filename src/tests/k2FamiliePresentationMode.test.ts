import { describe, it, expect } from 'vitest'
import { applyK2FamiliePresentationFromSearch } from '../hooks/useK2FamiliePresentationMode'

function makeMemoryStore(init: Record<string, string> = {}): Storage {
  const o: Record<string, string> = { ...init }
  return {
    get length() {
      return Object.keys(o).length
    },
    key: (i: number) => Object.keys(o)[i] ?? null,
    getItem: (k: string) => (k in o ? o[k] : null),
    setItem: (k: string, v: string) => {
      o[k] = v
    },
    removeItem: (k: string) => {
      delete o[k]
    },
    clear: () => {
      for (const k of Object.keys(o)) delete o[k]
    },
  } as Storage
}

describe('K2 Familie Präsi / Deckblatt', () => {
  it('d=1 ohne pm: minimal auf dieser URL, kein dauerhaftes Deckblatt-Flag', () => {
    const s = makeMemoryStore()
    const r = applyK2FamiliePresentationFromSearch('?d=1', s)
    expect(r.deckblattMinimal).toBe(true)
    expect(s.getItem('k2-familie-deckblatt-minimal')).toBeNull()
  })

  it('d=1 mit pm: Deckblatt-Flag in Session', () => {
    const s = makeMemoryStore()
    const r = applyK2FamiliePresentationFromSearch('?pm=1&d=1', s)
    expect(r.deckblattMinimal).toBe(true)
    expect(s.getItem('k2-familie-pm')).toBe('1')
    expect(s.getItem('k2-familie-deckblatt-minimal')).toBe('1')
  })

  it('leere URL: verwaistes Deckblatt ohne pm-Sitzung wird entfernt', () => {
    const s = makeMemoryStore({ 'k2-familie-deckblatt-minimal': '1' })
    const r = applyK2FamiliePresentationFromSearch('', s)
    expect(r.deckblattMinimal).toBe(false)
    expect(s.getItem('k2-familie-deckblatt-minimal')).toBeNull()
  })

  it('leere URL: pm + Deckblatt in Session bleibt für Mappe/Navigation', () => {
    const s = makeMemoryStore({
      'k2-familie-pm': '1',
      'k2-familie-deckblatt-minimal': '1',
    })
    const r = applyK2FamiliePresentationFromSearch('', s)
    expect(r.presentationMode).toBe(true)
    expect(r.deckblattMinimal).toBe(true)
  })

  it('?t=huber ohne pm=1: hängen gebliebene Präsi-Session (online/Handy) wird geleert', () => {
    const s = makeMemoryStore({
      'k2-familie-pm': '1',
      'k2-familie-deckblatt-minimal': '1',
    })
    const r = applyK2FamiliePresentationFromSearch('?t=huber&pm=0&d=0', s)
    expect(s.getItem('k2-familie-pm')).toBeNull()
    expect(s.getItem('k2-familie-deckblatt-minimal')).toBeNull()
    expect(r.presentationMode).toBe(false)
    expect(r.deckblattMinimal).toBe(false)
  })
})
