import { describe, it, expect, beforeEach } from 'vitest'
import { FAMILIE_HUBER_TENANT_ID } from '../data/k2FamilieMusterHuberQuelle'
import { K2_FAMILIE_NUR_MUSTER_SESSION_KEY } from '../utils/familieMusterSession'
import {
  savePersonen,
  saveEinstellungen,
  loadPersonen,
  loadEinstellungen,
} from '../utils/familieStorage'
import { setFamilyPageTexts, getFamilyPageTexts } from '../config/pageTextsFamilie'
import type { K2FamiliePerson } from '../types/k2Familie'

describe('Musterfamilie Huber – Demo-Sitzung nur lesend', () => {
  const p1: K2FamiliePerson = {
    id: 'p1',
    name: 'Test',
    parentIds: [],
    childIds: [],
    partners: [],
    siblingIds: [],
    wahlfamilieIds: [],
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('lehnt savePersonen ab wenn Nur-Muster-Sitzung und Tenant huber', () => {
    sessionStorage.setItem(K2_FAMILIE_NUR_MUSTER_SESSION_KEY, '1')
    expect(savePersonen(FAMILIE_HUBER_TENANT_ID, [p1])).toBe(false)
    expect(loadPersonen(FAMILIE_HUBER_TENANT_ID).length).toBe(0)
  })

  it('erlaubt savePersonen für huber ohne Demo-Sitzung', () => {
    expect(savePersonen(FAMILIE_HUBER_TENANT_ID, [p1])).toBe(true)
    expect(loadPersonen(FAMILIE_HUBER_TENANT_ID).length).toBe(1)
  })

  it('erlaubt savePersonen in Demo-Sitzung für anderen Tenant', () => {
    sessionStorage.setItem(K2_FAMILIE_NUR_MUSTER_SESSION_KEY, '1')
    expect(savePersonen('familie-andere-demo', [p1])).toBe(true)
    expect(loadPersonen('familie-andere-demo').length).toBe(1)
  })

  it('setFamilyPageTexts für huber in Demo-Sitzung: keine Änderung', () => {
    sessionStorage.setItem(K2_FAMILIE_NUR_MUSTER_SESSION_KEY, '1')
    const before = getFamilyPageTexts(FAMILIE_HUBER_TENANT_ID)
    setFamilyPageTexts(FAMILIE_HUBER_TENANT_ID, { welcomeTitle: 'Gehackt' })
    const after = getFamilyPageTexts(FAMILIE_HUBER_TENANT_ID)
    expect(after.welcomeTitle).toBe(before.welcomeTitle)
  })

  it('saveEinstellungen huber + Demo-Sitzung: abgelehnt', () => {
    sessionStorage.setItem(K2_FAMILIE_NUR_MUSTER_SESSION_KEY, '1')
    expect(saveEinstellungen(FAMILIE_HUBER_TENANT_ID, { ichBinPersonId: 'x' })).toBe(false)
    expect(loadEinstellungen(FAMILIE_HUBER_TENANT_ID).ichBinPersonId).toBeUndefined()
  })
})
