/**
 * Phase 9.1: Tests für mergeServerWithLocal (Phase 2.1).
 * Regel: Server = Quelle; lokale ohne Server-Eintrag übernommen; Konflikt: Mobile gewinnt, sonst neueres updatedAt.
 */

import { describe, it, expect } from 'vitest'
import { mergeServerWithLocal } from '../utils/syncMerge'

describe('mergeServerWithLocal', () => {

  it('merged startet mit Server-Liste', () => {
    const server = [{ number: '1', title: 'A', updatedAt: '2026-01-01T12:00:00Z' }]
    const local: any[] = []
    const { merged } = mergeServerWithLocal(server, local)
    expect(merged).toHaveLength(1)
    expect(merged[0].number).toBe('1')
  })

  it('lokale Werke ohne Server-Eintrag werden hinzugefügt', () => {
    const server = [{ number: '1', title: 'A' }]
    const local = [
      { number: '1', title: 'A' },
      { number: '2', title: 'Nur lokal' }
    ]
    const { merged } = mergeServerWithLocal(server, local)
    expect(merged).toHaveLength(2)
    expect(merged.map((a: any) => a.number).sort()).toEqual(['1', '2'])
    expect(merged.find((a: any) => a.number === '2')?.title).toBe('Nur lokal')
  })

  it('bei Konflikt gewinnt Mobile-Werk', () => {
    const server = [{ number: '1', title: 'Server', updatedAt: '2026-01-02T12:00:00Z' }]
    const local = [{ number: '1', title: 'Lokal Mobile', updatedAt: '2026-01-01T10:00:00Z', createdOnMobile: true }]
    const { merged } = mergeServerWithLocal(server, local)
    expect(merged).toHaveLength(1)
    expect(merged[0].title).toBe('Lokal Mobile')
  })

  it('bei Konflikt ohne Mobile gewinnt neueres updatedAt', () => {
    const server = [{ number: '1', title: 'Server', updatedAt: '2026-01-01T12:00:00Z' }]
    const local = [{ number: '1', title: 'Lokal neuer', updatedAt: '2026-01-02T12:00:00Z' }]
    const { merged } = mergeServerWithLocal(server, local)
    expect(merged).toHaveLength(1)
    expect(merged[0].title).toBe('Lokal neuer')
  })

  it('bei Konflikt ohne Mobile behält Server wenn Server neuer', () => {
    const server = [{ number: '1', title: 'Server neuer', updatedAt: '2026-01-02T12:00:00Z' }]
    const local = [{ number: '1', title: 'Lokal', updatedAt: '2026-01-01T12:00:00Z' }]
    const { merged } = mergeServerWithLocal(server, local)
    expect(merged).toHaveLength(1)
    expect(merged[0].title).toBe('Server neuer')
  })

  it('toHistory enthält lokale ohne Server die nicht (mobile und sehr neu) sind', () => {
    const server: any[] = []
    const oldDate = new Date(Date.now() - 20 * 60 * 1000).toISOString() // 20 Min
    const local = [
      { number: '1', title: 'Alt', createdAt: oldDate },
      { number: '2', title: 'Mobile sehr neu', createdAt: new Date().toISOString(), createdOnMobile: true }
    ]
    const { toHistory } = mergeServerWithLocal(server, local)
    expect(toHistory.some((a: any) => a.number === '1')).toBe(true)
    expect(toHistory.some((a: any) => a.number === '2')).toBe(false)
  })
})
