import { describe, it, expect } from 'vitest'
import {
  istJahrestagAmIsoDatum,
  weekRangeMondaySundayContainingMonthFirst,
  lastDayOfMonth,
} from '../utils/familieKalenderDatum'

describe('familieKalenderDatum', () => {
  it('istJahrestagAmIsoDatum: 15.03. erkennen', () => {
    expect(istJahrestagAmIsoDatum('1959-03-15', 2, 15)).toBe(true)
    expect(istJahrestagAmIsoDatum('1959-03-15', 1, 15)).toBe(false)
  })

  it('weekRangeMondaySundayContainingMonthFirst: April 2026 beginnt Di 1.4. → Mo 30.3.–So 5.4.', () => {
    const { start, end } = weekRangeMondaySundayContainingMonthFirst(2026, 3)
    expect(start).toBe('2026-03-30')
    expect(end).toBe('2026-04-05')
  })

  it('lastDayOfMonth', () => {
    expect(lastDayOfMonth(2026, 1)).toBe(28)
    expect(lastDayOfMonth(2024, 1)).toBe(29)
  })
})
