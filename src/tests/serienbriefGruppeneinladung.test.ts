import { describe, expect, it } from 'vitest'
import {
  parseSemicolonCsv,
  parseKontaktZeilen,
  suggestAnrede,
  csvRowToEmpfaenger,
  buildBriefHtml,
  empfaengerListToCsv,
} from '../utils/serienbriefGruppeneinladung'

describe('serienbriefGruppeneinladung', () => {
  it('parseSemicolonCsv liest Header und Zeilen', () => {
    const csv = `Organisation;Typ;Bezirk;Anrede;Vorname_Nachname;Funktion;Strasse;PLZ;Ort;Email;Telefon;Hinweis
PVÖ OG Test;PVÖ;Eferding;;Max Mustermann;Obmann;Hauptstr. 1;4070;Eferding;a@b.c;;`
    const rows = parseSemicolonCsv(csv)
    expect(rows).toHaveLength(1)
    expect(rows[0].Organisation).toBe('PVÖ OG Test')
    expect(rows[0].PLZ).toBe('4070')
  })

  it('parseKontaktZeilen trennt Obfrau + Name aus Funktion', () => {
    const r = parseKontaktZeilen('Obfrau Gabriele Pamminger', '')
    expect(r.funktion).toBe('Obfrau')
    expect(r.name).toBe('Gabriele Pamminger')
  })

  it('suggestAnrede für Obmann/Obfrau', () => {
    expect(suggestAnrede('', 'Obmann', 'Hans Huber')).toContain('Herr Huber')
    expect(suggestAnrede('', 'Obfrau', 'Anna Maier')).toContain('Frau Maier')
  })

  it('csvRowToEmpfaenger setzt aktiv bei vollständiger Adresse', () => {
    const e = csvRowToEmpfaenger(
      {
        Organisation: 'Verein X',
        Strasse: 'Weg 2',
        PLZ: '4710',
        Ort: 'Stadt',
        Funktion: 'Obmann',
        Vorname_Nachname: 'Karl K',
      },
      0,
    )
    expect(e.aktiv).toBe(true)
    expect(e.organisation).toBe('Verein X')
  })

  it('buildBriefHtml enthält Verein und Galerie-Link', () => {
    const html = buildBriefHtml({
      id: 'x',
      organisation: 'Seniorenbund Grieskirchen',
      typ: 'SB',
      bezirk: 'Grieskirchen',
      anrede: 'Sehr geehrter Herr Test,',
      name: 'Test Name',
      funktion: 'Obmann',
      strasse: 'Kickendorf 38',
      plz: '4710',
      ort: 'Grieskirchen',
      email: '',
      telefon: '',
      hinweis: '',
      aktiv: true,
    })
    expect(html).toContain('Seniorenbund Grieskirchen')
    expect(html).toContain('k2-galerie.vercel.app/galerie')
    expect(html).toContain('Ristorante Antonio')
  })

  it('empfaengerListToCsv roundtrip Header', () => {
    const csv = empfaengerListToCsv([
      {
        id: 'a',
        organisation: 'OG',
        typ: '',
        bezirk: '',
        anrede: 'Sehr geehrte Damen und Herren,',
        name: '',
        funktion: '',
        strasse: '',
        plz: '',
        ort: '',
        email: '',
        telefon: '',
        hinweis: '',
        aktiv: true,
      },
    ])
    expect(csv.split('\n')[0]).toContain('Organisation;Typ')
  })
})
