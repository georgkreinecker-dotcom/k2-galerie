import { describe, expect, it } from 'vitest'
import {
  normalizeGermanSpeechForFamilieMuster,
  stripBoldMarkersForSpeech,
} from '../utils/familieMusterHintSpeech'

describe('familieMusterHintSpeech', () => {
  it('stripBoldMarkersForSpeech entfernt **…**', () => {
    expect(stripBoldMarkersForSpeech('**Events** und **Kalender**')).toBe('Events und Kalender')
  })

  it('normalizeGermanSpeechForFamilieMuster: Event(s) → Termin(e), & → und', () => {
    expect(normalizeGermanSpeechForFamilieMuster('Events und Kalender')).toBe('Termine und Kalender')
    expect(normalizeGermanSpeechForFamilieMuster('Events & Kalender')).toBe('Termine und Kalender')
    expect(normalizeGermanSpeechForFamilieMuster('Events verwalten')).toBe('Termine verwalten')
    expect(normalizeGermanSpeechForFamilieMuster('Event-Übersicht')).toBe('Termin-Übersicht')
    expect(normalizeGermanSpeechForFamilieMuster('Events-Seite')).toBe('Termin-Seite')
    expect(normalizeGermanSpeechForFamilieMuster('Events- oder Kalender-Seite')).toBe('Termin- oder Kalender-Seite')
  })

  it('Event- am Wortanfang nicht durch einzelnes Event-Replacement zerschneiden', () => {
    expect(normalizeGermanSpeechForFamilieMuster('Event-Übersicht bleibt')).toBe('Termin-Übersicht bleibt')
  })
})
