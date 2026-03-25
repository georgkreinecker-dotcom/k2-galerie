import { describe, it, expect } from 'vitest'
import {
  formatEventDatumZeileKompakt,
  formatEventZeitenBlock,
  formatEventTerminKomplett,
  getEventDaysISO,
} from '../utils/eventTerminFormat'

describe('eventTerminFormat', () => {
  it('getEventDaysISO liefert alle Tage inklusive Endtag', () => {
    expect(getEventDaysISO('2025-04-24', '2025-04-26')).toEqual(['2025-04-24', '2025-04-25', '2025-04-26'])
  })

  it('formatEventDatumZeileKompakt: ein Tag', () => {
    expect(formatEventDatumZeileKompakt('2025-04-24')).toMatch(/24.*April.*2025/)
  })

  it('formatEventZeitenBlock: startTime/endTime', () => {
    expect(
      formatEventZeitenBlock({ date: '2025-04-24', startTime: '18:00', endTime: '21:00' })
    ).toBe('18:00 - 21:00 Uhr')
  })

  it('formatEventTerminKomplett compact: Datum + Zeiten-Label + Tage', () => {
    const s = formatEventTerminKomplett(
      {
        date: '2025-04-24',
        endDate: '2025-04-26',
        dailyTimes: {
          '2025-04-24': { start: '18:00', end: '21:00' },
          '2025-04-25': { start: '14:00', end: '19:00' },
        },
      },
      { mode: 'compact' }
    )
    expect(s).toContain('Zeiten:')
    expect(s).toContain('18:00')
    expect(s).toContain('14:00')
  })
})
