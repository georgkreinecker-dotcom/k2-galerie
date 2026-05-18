import { describe, it, expect } from 'vitest'
import type { K2FamilieGeschichteEintrag } from '../types/k2Familie'
import {
  canAddGeschichteEintrag,
  canDeleteGeschichteEintrag,
  canEditGeschichteEintrag,
  formatGeschichteZeitpunkt,
  geschichteEintraegeFuerGeschichte,
  personNameById,
} from '../utils/familieGeschichteEintrag'

const eintrag: K2FamilieGeschichteEintrag = {
  id: 'ge-1',
  geschichteId: 'g-1',
  authorPersonId: 'p-a',
  inhalt: 'Text',
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('familieGeschichteEintrag', () => {
  it('canAdd: organisches Recht + ichBinPersonId', () => {
    expect(canAddGeschichteEintrag(true, 'p-a')).toBe(true)
    expect(canAddGeschichteEintrag(true, undefined)).toBe(false)
    expect(canAddGeschichteEintrag(false, 'p-a')).toBe(false)
  })

  it('canEdit/canDelete: Autor:in oder Inhaber:in', () => {
    expect(canEditGeschichteEintrag(eintrag, 'p-a', false)).toBe(true)
    expect(canEditGeschichteEintrag(eintrag, 'p-b', false)).toBe(false)
    expect(canEditGeschichteEintrag(eintrag, 'p-b', true)).toBe(true)
    expect(canDeleteGeschichteEintrag(eintrag, 'p-a', false)).toBe(true)
    expect(canDeleteGeschichteEintrag(eintrag, 'p-b', false)).toBe(false)
  })

  it('personNameById und formatGeschichteZeitpunkt', () => {
    expect(personNameById([{ id: 'p1', name: 'Anna' } as never], 'p1')).toBe('Anna')
    expect(personNameById([], 'p1')).toBe('Unbekannt')
    expect(formatGeschichteZeitpunkt('')).toBe('')
    expect(formatGeschichteZeitpunkt('2026-01-15T10:30:00.000Z')).toContain('2026')
  })

  it('geschichteEintraegeFuerGeschichte: filtert und sortiert nach createdAt', () => {
    const alle: K2FamilieGeschichteEintrag[] = [
      { ...eintrag, id: 'e2', geschichteId: 'g-2' },
      { ...eintrag, id: 'e3', createdAt: '2026-02-01T00:00:00.000Z' },
      { ...eintrag, id: 'e1', createdAt: '2025-12-01T00:00:00.000Z' },
    ]
    const liste = geschichteEintraegeFuerGeschichte(alle, 'g-1')
    expect(liste.map((e) => e.id)).toEqual(['e1', 'e3'])
  })
})
