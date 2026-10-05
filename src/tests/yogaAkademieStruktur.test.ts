import { describe, expect, it } from 'vitest'
import {
  YOGA_AKADEMIE_EINLADUNGEN,
  YOGA_AKADEMIE_HUB_LINKS,
  YOGA_AKADEMIE_HUB_RECHTS,
  YOGA_AKADEMIE_LEHRGAENGE,
  YOGA_AKADEMIE_STAMMDATEN,
  YOGA_AKADEMIE_TEILNEHMER,
} from '../config/yogaAkademieStruktur'

describe('Yoga-Akademie-Arbeitsfläche – Kundentext ohne K2', () => {
  it('Hub-Tabs wie Absolvent:in: Lehrgänge, Gestalten, Einstellungen / Listen, Termine', () => {
    expect(YOGA_AKADEMIE_HUB_LINKS.map((k) => k.tab)).toEqual(['werke', 'design', 'einstellungen'])
    expect(YOGA_AKADEMIE_HUB_RECHTS.map((k) => k.tab)).toEqual(['statistik', 'eventplan'])
  })

  it('enthält kein K2 und keine Galerie-Marke', () => {
    const blob = [
      ...YOGA_AKADEMIE_HUB_LINKS.flatMap((k) => [k.name, k.beschreibung]),
      ...YOGA_AKADEMIE_HUB_RECHTS.flatMap((k) => [k.name, k.beschreibung]),
      ...YOGA_AKADEMIE_LEHRGAENGE.flatMap((l) => [l.title, l.note, l.status]),
      ...YOGA_AKADEMIE_TEILNEHMER.flatMap((t) => [t.name, t.lehrgang, t.status]),
      ...YOGA_AKADEMIE_EINLADUNGEN.flatMap((e) => [e.title, e.note]),
      YOGA_AKADEMIE_STAMMDATEN.name,
      YOGA_AKADEMIE_STAMMDATEN.ort,
      YOGA_AKADEMIE_STAMMDATEN.kontakt,
    ].join(' ')
    expect(blob).not.toMatch(/k2/i)
    expect(blob).not.toMatch(/galerie/i)
  })
})
