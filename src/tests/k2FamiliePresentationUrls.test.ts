import { describe, it, expect } from 'vitest'
import {
  getK2FamilieMeineFamilieMusterHuberPublicUrl,
  getK2FamilieStammbaumKreineckerPublicUrl,
} from '../config/k2FamiliePresentation'

describe('K2 Familie Präsentationsboard-URLs', () => {
  it('Muster-Huber Meine Familie: t=huber und Live-Reset pm=0, d=0', () => {
    const u = getK2FamilieMeineFamilieMusterHuberPublicUrl()
    expect(u).toContain('t=huber')
    expect(u).toMatch(/[?&]pm=0(&|$)/)
    expect(u).toMatch(/[?&]d=0(&|$)/)
  })

  it('Stammbaum: Live-Reset angehängt (wenn t aus Env)', () => {
    const u = getK2FamilieStammbaumKreineckerPublicUrl()
    expect(u).toMatch(/[?&]pm=0(&|$)/)
    expect(u).toMatch(/[?&]d=0(&|$)/)
  })
})
