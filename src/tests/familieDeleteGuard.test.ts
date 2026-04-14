import { describe, it, expect, beforeEach } from 'vitest'
import { getK2FamilieEinstellungenKey, getK2FamiliePersonenKey, type K2FamiliePerson } from '../types/k2Familie'
import { deletePersonWithCleanup, saveEinstellungen } from '../utils/familieStorage'

describe('deletePersonWithCleanup – Löschen sperren (Inhaber:in)', () => {
  const tenantId = 'familie-test-guard'
  const keyP = getK2FamiliePersonenKey(tenantId)
  const keyE = getK2FamilieEinstellungenKey(tenantId)

  const p1: K2FamiliePerson = {
    id: 'p1',
    name: 'Eins',
    parentIds: [],
    childIds: [],
    partners: [],
    siblingIds: [],
    wahlfamilieIds: [],
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(keyP, JSON.stringify([p1]))
    localStorage.setItem(keyE, JSON.stringify({ stammbaumPersonenLoeschenGesperrt: true }))
  })

  it('lehnt Löschen ab wenn stammbaumPersonenLoeschenGesperrt', () => {
    expect(deletePersonWithCleanup(tenantId, 'p1')).toBe(false)
    const raw = localStorage.getItem(keyP)
    expect(raw).toBeTruthy()
    const list = JSON.parse(raw || '[]') as K2FamiliePerson[]
    expect(list.some((p) => p.id === 'p1')).toBe(true)
  })

  it('erlaubt Löschen wenn Flag aus', () => {
    saveEinstellungen(tenantId, { stammbaumPersonenLoeschenGesperrt: false })
    expect(deletePersonWithCleanup(tenantId, 'p1')).toBe(true)
    const list = JSON.parse(localStorage.getItem(keyP) || '[]') as K2FamiliePerson[]
    expect(list.some((p) => p.id === 'p1')).toBe(false)
  })
})
