import { describe, it, expect } from 'vitest'
import { mergePilotKatalog } from '../utils/pilotKatalogMerge'
import type { TestuserKatalogEintrag } from '../utils/testuserKatalogStorage'

function e(partial: Partial<TestuserKatalogEintrag> & Pick<TestuserKatalogEintrag, 'id' | 'name'>): TestuserKatalogEintrag {
  const createdAt = partial.createdAt ?? '2026-01-01T10:00:00.000Z'
  return {
    appName: partial.appName ?? 'App',
    email: partial.email ?? '',
    phone: partial.phone ?? '',
    notiz: partial.notiz ?? '',
    status: partial.status ?? 'bewerbung',
    createdAt,
    updatedAt: partial.updatedAt,
    ...partial,
  }
}

describe('mergePilotKatalog', () => {
  it('vereinigt nach id, neuere updatedAt gewinnt', () => {
    const a = [
      e({
        id: '1',
        name: 'A',
        updatedAt: '2026-01-02T10:00:00.000Z',
        createdAt: '2026-01-01T10:00:00.000Z',
      }),
    ]
    const b = [
      e({
        id: '1',
        name: 'A2',
        updatedAt: '2026-01-03T10:00:00.000Z',
        createdAt: '2026-01-01T10:00:00.000Z',
      }),
    ]
    const m = mergePilotKatalog(a, b)
    expect(m).toHaveLength(1)
    expect(m[0]?.name).toBe('A2')
  })

  it('ohne updatedAt zählt createdAt', () => {
    const a = [e({ id: 'x', name: 'alt', createdAt: '2026-01-01T10:00:00.000Z' })]
    const b = [e({ id: 'x', name: 'neu', createdAt: '2026-02-01T10:00:00.000Z' })]
    expect(mergePilotKatalog(a, b)[0]?.name).toBe('neu')
  })

  it('fügt nur-in-b hinzu', () => {
    const a = [e({ id: 'a', name: '1' })]
    const b = [e({ id: 'b', name: '2' })]
    const m = mergePilotKatalog(a, b)
    expect(m.map((x) => x.id).sort()).toEqual(['a', 'b'])
  })
})
