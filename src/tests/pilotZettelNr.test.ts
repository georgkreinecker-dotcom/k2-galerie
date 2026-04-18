import { describe, it, expect } from 'vitest'
import {
  getNextPilotZettelNr,
  PILOT_ZETTEL_NR_KEY,
  PILOT_ZETTEL_NR_MIN_NEXT,
  setLastPilotZettelNr,
} from '../utils/pilotZettelNr'

describe('pilotZettelNr', () => {
  it('ohne gespeicherten Stand: nächste Nummer ist mindestens 10', () => {
    localStorage.removeItem(PILOT_ZETTEL_NR_KEY)
    expect(getNextPilotZettelNr()).toBe('10')
  })

  it('nach letzter Nummer 10: nächste ist 11', () => {
    localStorage.setItem(PILOT_ZETTEL_NR_KEY, '10')
    expect(getNextPilotZettelNr()).toBe('11')
  })

  it('alter Stand unter 10: nächste wird auf mindestens 10 angehoben', () => {
    localStorage.setItem(PILOT_ZETTEL_NR_KEY, '3')
    expect(getNextPilotZettelNr()).toBe('10')
  })

  it('setLastPilotZettelNr: speichert für Folgeaufruf', () => {
    localStorage.setItem(PILOT_ZETTEL_NR_KEY, '12')
    setLastPilotZettelNr('12')
    expect(getNextPilotZettelNr()).toBe('13')
  })
})
