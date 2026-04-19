import { describe, expect, it } from 'vitest'
import type { K2FamiliePerson } from '../types/k2Familie'
import {
  assignMissingMitgliedsNummern,
  buildMitgliederCodesZweigGruppen,
  ergaenzeMitgliedsNummerAusServerListe,
  findPersonIdByMitgliedsNummer,
  resolvePersonIdFuerPersoenlichenCodeNachMerge,
  mitgliedsNummernImGebrauch,
  normalizeMitgliedsNummerInput,
  persoenlicherCodePasstZuKarte,
  RE_AUTO_MITGLIEDS_NUMMER,
  trimMitgliedsNummerEingabe,
  zieheEindeutigenMitgliedsCode,
} from '../utils/familieMitgliedsNummer'

function p(id: string, mitgliedsNummer?: string): K2FamiliePerson {
  return {
    id,
    name: id,
    parentIds: [],
    childIds: [],
    partners: [],
    siblingIds: [],
    wahlfamilieIds: [],
    mitgliedsNummer,
  }
}

describe('familieMitgliedsNummer', () => {
  it('trimMitgliedsNummerEingabe', () => {
    expect(trimMitgliedsNummerEingabe('  ab12  ')).toBe('AB12')
    expect(trimMitgliedsNummerEingabe('')).toBe('')
  })

  it('normalizeMitgliedsNummerInput: Vollbreite, Zero-Width, Leerzeichen innen', () => {
    expect(normalizeMitgliedsNummerInput('ＡＢ１２')).toBe('AB12')
    expect(normalizeMitgliedsNummerInput('ab\u200b12')).toBe('AB12')
    expect(normalizeMitgliedsNummerInput('ab 12')).toBe('AB12')
  })

  it('normalizeMitgliedsNummerInput: L + kleines l + Ziffern → LI… (i vs l auf dem Bildschirm)', () => {
    expect(normalizeMitgliedsNummerInput('Ll36')).toBe('LI36')
    expect(normalizeMitgliedsNummerInput('LI36')).toBe('LI36')
    expect(normalizeMitgliedsNummerInput('LL36')).toBe('LL36')
  })

  it('normalizeMitgliedsNummerInput: optionaler Bindestrich bei XX12 (Mobil)', () => {
    expect(normalizeMitgliedsNummerInput('AB-12')).toBe('AB12')
    expect(normalizeMitgliedsNummerInput('ab–12')).toBe('AB12')
    expect(normalizeMitgliedsNummerInput('XY99')).toBe('XY99')
    expect(normalizeMitgliedsNummerInput('KF-M-1001')).toBe('KF-M-1001')
  })

  it('findPersonIdByMitgliedsNummer: Treffer, case-insensitive', () => {
    const personen = [p('a', 'KF-M-1001'), p('b', 'x')]
    expect(findPersonIdByMitgliedsNummer(personen, 'kf-m-1001')).toBe('a')
  })

  it('findPersonIdByMitgliedsNummer: leer oder kein Treffer', () => {
    const personen = [p('a', '1')]
    expect(findPersonIdByMitgliedsNummer(personen, '')).toBe(null)
    expect(findPersonIdByMitgliedsNummer(personen, '2')).toBe(null)
  })

  it('ergaenzeMitgliedsNummerAusServerListe: gemergte Kopie ohne Code, Server hat Code (fremdes Gerät)', () => {
    const server = [p('x', 'AB12')]
    const mergedOhneCode = [p('x', undefined)]
    const out = ergaenzeMitgliedsNummerAusServerListe(server, mergedOhneCode)
    expect(findPersonIdByMitgliedsNummer(out, 'ab12')).toBe('x')
  })

  it('Cod-Registrierung: resolvePersonIdFuerPersoenlichenCodeNachMerge = gleiche Trefferlogik wie find (einzige Quelle nach Cloud-Merge)', () => {
    const server = [p('neu', 'ZX77')]
    const merged = ergaenzeMitgliedsNummerAusServerListe(server, [p('neu', undefined)])
    expect(resolvePersonIdFuerPersoenlichenCodeNachMerge(merged, 'zx77')).toBe('neu')
    expect(resolvePersonIdFuerPersoenlichenCodeNachMerge(merged, '')).toBe(null)
  })

  it('ergaenzeMitgliedsNummerAusServerListe: lokaler Code bleibt, kein Überschreiben vom Server', () => {
    const server = [p('x', 'AB12')]
    const merged = [p('x', 'CD34')]
    const out = ergaenzeMitgliedsNummerAusServerListe(server, merged)
    expect(out[0].mitgliedsNummer).toBe('CD34')
  })

  it('persoenlicherCodePasstZuKarte: case-insensitive, trim', () => {
    expect(persoenlicherCodePasstZuKarte('  ab12  ', 'AB12')).toBe(true)
    expect(persoenlicherCodePasstZuKarte('x', 'y')).toBe(false)
    expect(persoenlicherCodePasstZuKarte('', 'AB12')).toBe(false)
  })

  it('mitgliedsNummernImGebrauch: normalisiert', () => {
    const u = mitgliedsNummernImGebrauch([p('a', 'Ab12'), p('b', '  XY99 ')])
    expect(u.has('ab12')).toBe(true)
    expect(u.has('xy99')).toBe(true)
  })

  it('zieheEindeutigenMitgliedsCode: Format und Eindeutigkeit', () => {
    const used = mitgliedsNummernImGebrauch([p('x', 'AA00')])
    const c = zieheEindeutigenMitgliedsCode(used)
    expect(c).toMatch(RE_AUTO_MITGLIEDS_NUMMER)
    expect(c).not.toBe('AA00')
    expect(used.size).toBe(2)
  })

  it('assignMissingMitgliedsNummern: vergibt XX12 (zufällig, eindeutig)', () => {
    const personen = [
      { ...p('root'), name: 'Oma', parentIds: [], childIds: ['c'] },
      { ...p('c'), name: 'Kind', parentIds: ['root'], childIds: [] },
    ]
    const out = assignMissingMitgliedsNummern(personen, 'c')
    const mRoot = out.find((x) => x.id === 'root')?.mitgliedsNummer
    const mKind = out.find((x) => x.id === 'c')?.mitgliedsNummer
    expect(mRoot).toMatch(RE_AUTO_MITGLIEDS_NUMMER)
    expect(mKind).toMatch(RE_AUTO_MITGLIEDS_NUMMER)
    expect(new Set(out.map((x) => x.mitgliedsNummer)).size).toBe(2)
  })

  it('assignMissingMitgliedsNummern: überschreibt keine manuelle Nummer', () => {
    const personen = [p('a', 'MANUAL-1'), p('b')]
    const out = assignMissingMitgliedsNummern(personen, undefined)
    expect(out[0].mitgliedsNummer).toBe('MANUAL-1')
    expect(out[1].mitgliedsNummer).toMatch(RE_AUTO_MITGLIEDS_NUMMER)
  })

  it('assignMissingMitgliedsNummern: verstorbene ohne Nummer bleiben ohne Auto-Code', () => {
    const personen = [{ ...p('tot'), verstorben: true }, p('leb')]
    const out = assignMissingMitgliedsNummern(personen, 'leb')
    expect(out.find((x) => x.id === 'tot')?.mitgliedsNummer).toBeUndefined()
    expect(out.find((x) => x.id === 'leb')?.mitgliedsNummer).toMatch(RE_AUTO_MITGLIEDS_NUMMER)
  })

  it('buildMitgliederCodesZweigGruppen: keine verstorbenen in den Zeilen', () => {
    const personen = [
      { ...p('a'), name: 'Lebt' },
      { ...p('b'), name: 'Tot', verstorben: true },
    ]
    const gruppen = buildMitgliederCodesZweigGruppen(personen, 'a')
    const ids = gruppen.flatMap((g) => g.rows.map((r) => r.id))
    expect(ids).toContain('a')
    expect(ids).not.toContain('b')
  })
})
