import { describe, it, expect, beforeEach } from 'vitest'
import {
  K2_FAMILIE_PWA_LAST_PATH_KEY,
  isAllowedFamilieStoredPath,
  isFamiliePwaHomeOnlyPath,
  readFamiliePwaLastPath,
  resolveFamiliePwaResumeTarget,
  writeFamiliePwaLastPath,
} from '../utils/familiePwaLastPath'

describe('familiePwaLastPath', () => {
  beforeEach(() => {
    localStorage.removeItem(K2_FAMILIE_PWA_LAST_PATH_KEY)
    try {
      sessionStorage.removeItem('k2-familie-einladung-pending')
    } catch {
      /* ignore */
    }
  })

  it('isAllowedFamilieStoredPath: erlaubt Kurz-Home und /projects/k2-familie/*', () => {
    expect(isAllowedFamilieStoredPath('/familie')).toBe(true)
    expect(isAllowedFamilieStoredPath('/projects/k2-familie/stammbaum')).toBe(true)
    expect(isAllowedFamilieStoredPath('/projects/k2-familie/personen/x')).toBe(true)
    expect(isAllowedFamilieStoredPath('/admin')).toBe(false)
    expect(isAllowedFamilieStoredPath('/projects/k2-familie/../admin')).toBe(false)
  })

  it('write + read: speichert Stammbaum', () => {
    writeFamiliePwaLastPath('/projects/k2-familie/stammbaum', '')
    expect(readFamiliePwaLastPath()).toBe('/projects/k2-familie/stammbaum')
  })

  it('resolveFamiliePwaResumeTarget: liefert letzte Route wenn nicht Home', () => {
    writeFamiliePwaLastPath('/projects/k2-familie/stammbaum', '')
    expect(resolveFamiliePwaResumeTarget('')).toBe('/projects/k2-familie/stammbaum')
  })

  it('resolveFamiliePwaResumeTarget: null wenn letzte Route nur Home', () => {
    writeFamiliePwaLastPath('/familie', '')
    expect(resolveFamiliePwaResumeTarget('')).toBe(null)
  })

  it('resolveFamiliePwaResumeTarget: null bei Einladungs-Query', () => {
    writeFamiliePwaLastPath('/projects/k2-familie/stammbaum', '')
    expect(resolveFamiliePwaResumeTarget('?t=huber')).toBe(null)
  })
})
