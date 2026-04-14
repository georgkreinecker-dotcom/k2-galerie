import { describe, it, expect, beforeEach } from 'vitest'
import {
  createK2FamilieBackup,
  restoreK2FamilieFromBackup,
  applyK2FamilieSessionSnapshotFromBackup,
} from '../utils/autoSave'

describe('K2-Familie-Sicherung', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('createK2FamilieBackup: Session-Snapshot enthält gewählte Familie', () => {
    localStorage.setItem('k2-familie-tenant-list', JSON.stringify(['familie-99']))
    sessionStorage.setItem('k2-familie-current-tenant', 'familie-99')
    const { data } = createK2FamilieBackup()
    expect(data._k2FamilieSessionSnapshot?.['k2-familie-current-tenant']).toBe('familie-99')
    expect(data.kontext).toBe('k2-familie')
  })

  it('restoreK2FamilieFromBackup: schreibt Session-Snapshot zurück', () => {
    sessionStorage.removeItem('k2-familie-current-tenant')
    localStorage.setItem('k2-familie-tenant-list', JSON.stringify(['familie-x']))
    localStorage.setItem('k2-familie-familie-x-personen', '[]')
    const backup = {
      kontext: 'k2-familie',
      exportedAt: new Date().toISOString(),
      version: '1.1',
      label: 'test',
      'k2-familie-tenant-list': ['familie-x'],
      'k2-familie-familie-x-personen': [],
      _k2FamilieSessionSnapshot: { 'k2-familie-current-tenant': 'familie-x' },
    }
    const r = restoreK2FamilieFromBackup(backup as Record<string, unknown>)
    expect(r.ok).toBe(true)
    expect(sessionStorage.getItem('k2-familie-current-tenant')).toBe('familie-x')
  })

  it('applyK2FamilieSessionSnapshotFromBackup: ohne Snapshot kein Fehler', () => {
    applyK2FamilieSessionSnapshotFromBackup({ kontext: 'k2-familie' })
    expect(sessionStorage.getItem('k2-familie-current-tenant')).toBeNull()
  })
})
