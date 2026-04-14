import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  buildIdentitaetFingerprint,
  clearGerateVertrauen,
  clearIdentitaetBestaetigt,
  getOrCreateDeviceId,
  loadIdentitaetBestaetigt,
  saveGerateVertrauen,
  setIdentitaetBestaetigt,
  tryRestoreIdentitaetFromGerat,
} from '../utils/familieIdentitaetStorage'

const TID = 'tenant-geraet-test'
const PID = 'person-du'

describe('familieIdentitaetStorage Geräte-Vertrauen', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    clearIdentitaetBestaetigt(TID)
    clearGerateVertrauen(TID)
  })

  it('buildIdentitaetFingerprint ist stabil für gleiche Eingaben', async () => {
    const a = await buildIdentitaetFingerprint(TID, PID, 'dev-1', 'ab12')
    const b = await buildIdentitaetFingerprint(TID, PID, 'dev-1', 'ab12')
    expect(a).toBe(b)
    expect(a.length).toBe(64)
  })

  it('tryRestoreIdentitaetFromGerat setzt Session wenn Fingerabdruck passt', async () => {
    localStorage.setItem('k2-familie-geraet-id', 'festes-geraet-xyz')
    const deviceId = getOrCreateDeviceId()
    expect(deviceId).toBe('festes-geraet-xyz')

    const fp = await buildIdentitaetFingerprint(TID, PID, deviceId, 'ab12')
    localStorage.setItem(
      `k2-familie-identitaet-geraet-v1-${TID}`,
      JSON.stringify({ v: 1, deviceId, personId: PID, fp }),
    )

    expect(loadIdentitaetBestaetigt(TID)).toBeNull()
    const ok = await tryRestoreIdentitaetFromGerat(TID, PID, 'AB12')
    expect(ok).toBe(true)
    expect(loadIdentitaetBestaetigt(TID)).toBe(PID)
  })

  it('tryRestore schlägt fehl bei geändertem Code auf der Karte', async () => {
    localStorage.setItem('k2-familie-geraet-id', 'g2')
    const fp = await buildIdentitaetFingerprint(TID, PID, 'g2', 'ab12')
    localStorage.setItem(
      `k2-familie-identitaet-geraet-v1-${TID}`,
      JSON.stringify({ v: 1, deviceId: 'g2', personId: PID, fp }),
    )
    const ok = await tryRestoreIdentitaetFromGerat(TID, PID, 'XY99')
    expect(ok).toBe(false)
    expect(loadIdentitaetBestaetigt(TID)).toBeNull()
  })

  it('saveGerateVertrauen + tryRestore runden', async () => {
    localStorage.setItem('k2-familie-geraet-id', 'g3')
    await saveGerateVertrauen(TID, PID, '  Cd34  ')
    const ok = await tryRestoreIdentitaetFromGerat(TID, PID, 'cd34')
    expect(ok).toBe(true)
    expect(loadIdentitaetBestaetigt(TID)).toBe(PID)
  })

  it('setIdentitaetBestaetigt nutzt localStorage wenn sessionStorage fehlschlägt', () => {
    const spy = vi.spyOn(sessionStorage, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    try {
      setIdentitaetBestaetigt(TID, PID)
      expect(loadIdentitaetBestaetigt(TID)).toBe(PID)
    } finally {
      spy.mockRestore()
    }
  })
})
