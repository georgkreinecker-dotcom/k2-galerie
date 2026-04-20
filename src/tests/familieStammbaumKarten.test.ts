import { describe, it, expect } from 'vitest'
import type { K2FamiliePerson } from '../types/k2Familie'
import { getFamilienzweigPersonen } from '../utils/familieBeziehungen'
import {
  getFamilieBranchKeyLegacy,
  buildStammbaumKartenState,
  sortPersonenStammbaumKarten,
  buildGrossfamilieStammbaumSektionen,
  buildStammbaumPartnerUnterSektionen,
  buildStammbaumSektionenOhneGrossfamilieElternpaar,
} from '../utils/familieStammbaumKarten'
import { normalizeAndDedupePersonen } from '../utils/familiePersonenNormalize'
import { reconcileParentChildRelations } from '../utils/familieBeziehungen'

function p(
  id: string,
  name: string,
  parentIds: string[],
  opts?: {
    pos?: number
    geb?: string
    partners?: { personId: string; from: string | null; to: string | null }[]
    childIds?: string[]
  }
): K2FamiliePerson {
  return {
    id,
    name,
    parentIds,
    childIds: opts?.childIds ?? [],
    siblingIds: [],
    partners: opts?.partners ?? [],
    wahlfamilieIds: [],
    positionAmongSiblings: opts?.pos,
    geburtsdatum: opts?.geb,
  }
}

describe('familieStammbaumKarten', () => {
  it('Legacy: gleiche parentIds → gleicher Branch-Key', () => {
    const a = p('a', 'A', ['m', 'f'], { pos: 1 })
    const b = p('b', 'B', ['f', 'm'], { pos: 2 })
    expect(getFamilieBranchKeyLegacy(a)).toBe(getFamilieBranchKeyLegacy(b))
  })

  it('ohne ichBin: Sort wie früher (lexikografisch nach Eltern-Key)', () => {
    const liste = [
      p('c3', 'Drittes Kind', ['p1', 'p2'], { pos: 3 }),
      p('c1', 'Erstes Kind', ['p1', 'p2'], { pos: 1 }),
      p('solo', 'Solo', [], { pos: 1 }),
      p('c2', 'Zweites Kind', ['p1', 'p2'], { pos: 2 }),
    ]
    const s = sortPersonenStammbaumKarten(liste).map((x) => x.id)
    expect(s).toEqual(['c1', 'c2', 'c3', 'solo'])
  })

  it('mit ichBin: Geschwisterfamilien nach positionAmongSiblings; Ast 1 zuerst', () => {
    const mutter = p('mutter', 'Mutter', ['gm', 'gv'])
    const vater = p('vater', 'Vater', ['gm', 'gv'])
    const elternKey = ['mutter', 'vater'].sort().join('|')
    const rupert = p('rupert', 'Rupert', ['mutter', 'vater'], {
      pos: 1,
      partners: [{ personId: 'rfrau', from: null, to: null }],
    })
    const martina = p('martina', 'Martina', ['mutter', 'vater'], { pos: 2 })
    const georg = p('georg', 'Georg', ['mutter', 'vater'], { pos: 3 })
    const rupertFrau = p('rfrau', 'Rupert Partnerin', [], {
      pos: 1,
      partners: [{ personId: 'rupert', from: null, to: null }],
    })
    const rupertKind = p('rkind', 'Kind R', ['rupert', 'rfrau'], { pos: 1 })
    const martinaKind = p('mkind', 'Kind M', ['martina', 'x'], { pos: 1 })
    const personen = [mutter, vater, rupert, martina, georg, rupertFrau, rupertKind, martinaKind]
    expect(elternKey).toBe([...georg.parentIds].sort().join('|'))

    const { sortedPersonen, getBranchKey } = buildStammbaumKartenState(personen, 'georg')
    const ids = sortedPersonen.map((x) => x.id)
    expect(ids.indexOf('rupert')).toBeLessThan(ids.indexOf('martina'))
    expect(ids.indexOf('martina')).toBeLessThan(ids.indexOf('georg'))
    expect(getBranchKey(rupert)).toBe(getBranchKey(rupertKind))
    expect(getBranchKey(rupert)).toBe(getBranchKey(rupertFrau))
    expect(getBranchKey(martina)).toBe(getBranchKey(martinaKind))
    expect(getBranchKey(rupert)).not.toBe(getBranchKey(martina))
  })

  it('Partner-Propagation: Partner ohne gemeinsame Eltern am gleichen Ast', () => {
    const a = p('a', 'A', ['p1', 'p2'], { pos: 1 })
    const b = p('b', 'B', [], { partners: [{ personId: 'a', from: null, to: null }] })
    const pList = [a, b]
    const { getBranchKey } = buildStammbaumKartenState(pList, 'a')
    expect(getBranchKey(b)).toBe(getBranchKey(a))
  })

  it('Großfamilie: Geschwister mit nur einem Elternteil auf der Karte zählt als eigener Familienzweig', () => {
    const m = p('m', 'Mutter', ['gm', 'gv'])
    const f = p('f', 'Vater', ['gm', 'gv'])
    const georg = p('georg', 'Georg', ['m', 'f'], { pos: 1 })
    const thomas = p('thomas', 'Thomas', ['m'], { pos: 2 })
    const personen = [m, f, georg, thomas]

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    const klein = sek!.filter((s) => s.key.startsWith('kleinfamilie-'))
    expect(klein.length).toBe(2)
    const keys = new Set(klein.map((s) => s.key))
    expect(keys.has('kleinfamilie-georg')).toBe(true)
    expect(keys.has('kleinfamilie-thomas')).toBe(true)
  })

  it('Großfamilie: je Geschwister ein eigener Familienzweig-Block (z. B. viele Geschwister)', () => {
    const m = p('m', 'Mutter', ['gm', 'gv'])
    const f = p('f', 'Vater', ['gm', 'gv'])
    const thomas = p('thomas', 'Thomas Kreinecker', ['m', 'f'], { pos: 11, geb: '1940-05-01' })
    const clemens = p('clemens', 'Clemens Kreinecker', ['m', 'f'], { pos: 11, geb: '1942-01-01' })
    const georg = p('georg', 'Georg', ['m', 'f'], { pos: 1 })
    const personen = [m, f, clemens, thomas, georg]

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    const klein = sek!.filter((s) => s.key.startsWith('kleinfamilie-'))
    expect(klein.length).toBe(3)
    expect(klein.map((s) => s.key)).toEqual(['kleinfamilie-georg', 'kleinfamilie-thomas', 'kleinfamilie-clemens'])
    expect(klein[0]?.titel).toMatch(/^Familienzweig 1 – Georg/)
    expect(klein[1]?.titel).toMatch(/^Familienzweig 2 – Thomas/)
    expect(klein[2]?.titel).toMatch(/^Familienzweig 3 – Clemens/)
  })

  it('Großfamilie: Familienzweige nach Position unter Geschwistern – Eltern-childIds nicht gegen Position', () => {
    const m = p('m', 'Mutter', ['gm', 'gv'], { childIds: ['georg', 'thomas', 'clemens'] })
    const f = p('f', 'Vater', ['gm', 'gv'], { childIds: ['georg', 'thomas', 'clemens'] })
    const thomas = p('thomas', 'Thomas', ['m', 'f'], { pos: 12 })
    const clemens = p('clemens', 'Clemens', ['m', 'f'], { pos: 11 })
    const georg = p('georg', 'Georg', ['m', 'f'], { pos: 1 })
    const personen = [m, f, clemens, thomas, georg]

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    const klein = sek!.filter((s) => s.key.startsWith('kleinfamilie-'))
    expect(klein.map((s) => s.key)).toEqual(['kleinfamilie-georg', 'kleinfamilie-clemens', 'kleinfamilie-thomas'])
  })

  it('Großfamilie-Sektionen: Eltern zuerst, dann Familienzweige nach Geschwisterstellung', () => {
    const mutter = p('mutter', 'Mutter', ['gm', 'gv'])
    const vater = p('vater', 'Vater', ['gm', 'gv'])
    const rupert = p('rupert', 'Rupert', ['mutter', 'vater'], {
      pos: 1,
      partners: [{ personId: 'rfrau', from: null, to: null }],
    })
    const martina = p('martina', 'Martina', ['mutter', 'vater'], { pos: 2 })
    const georg = p('georg', 'Georg', ['mutter', 'vater'], { pos: 3 })
    const rfrau = p('rfrau', 'R Frau', [], { partners: [{ personId: 'rupert', from: null, to: null }] })
    const gross = p('gross', 'Großmutter', [])
    const personen = [mutter, vater, rupert, martina, georg, rfrau, gross]

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    const keys = sek!.map((s) => s.key)
    expect(keys[0]).toBe('eltern')
    expect(keys.slice(1, -1)).toEqual(['kleinfamilie-rupert', 'kleinfamilie-martina', 'kleinfamilie-georg'])
    expect(keys[keys.length - 1]).toBe('weitere')
    expect(sek!.find((s) => s.key === 'weitere')?.personen.map((x) => x.id)).toContain('gross')
  })

  it('Ohne zwei Eltern auf der Karte: Großfamilie null, Fallback eine strukturierte Sektion', () => {
    const mutter = p('mutter', 'Mutter', ['gm', 'gv'])
    const solo = p('solo', 'Solo', ['mutter'])
    const personen = [mutter, solo]
    expect(buildGrossfamilieStammbaumSektionen(personen, 'solo')).toBeNull()
    const fb = buildStammbaumSektionenOhneGrossfamilieElternpaar(personen, personen, 'solo')
    expect(fb).toHaveLength(1)
    expect(fb[0]?.key).toBe('ohne-elternpaar-struktur')
    expect(fb[0]?.personen.map((x) => x.id)).toContain('solo')
  })

  it('Großfamilie: gemeinsame Eltern nicht in jedem Geschwister-Zweig wiederholen (keine Doppelung zur Eltern-Zeile)', () => {
    const mutter = p('mutter', 'Mutter', ['gm', 'gv'])
    const vater = p('vater', 'Vater', ['gm', 'gv'])
    const rupert = p('rupert', 'Rupert', ['mutter', 'vater'], { pos: 1 })
    const martina = p('martina', 'Martina', ['mutter', 'vater'], { pos: 2 })
    const georg = p('georg', 'Georg', ['mutter', 'vater'], { pos: 3 })
    const personen = [mutter, vater, rupert, martina, georg]

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    for (const s of sek!.filter((x) => x.key.startsWith('kleinfamilie-'))) {
      const ids = s.personen.map((x) => x.id)
      expect(ids).not.toContain('mutter')
      expect(ids).not.toContain('vater')
    }
  })

  it('Halbgeschwister: gleicher Vater, zwei Mütter – Eltern zeigen Partner; alle Familienzweige', () => {
    const sen = p('sen', 'Georg Sen.', ['gv', 'gm'], {
      partners: [
        { personId: 'anna', from: null, to: null },
        { personId: 'mathilde', from: null, to: null },
      ],
    })
    const anna = p('anna', 'Anna Stöbich', [])
    const mathilde = p('mathilde', 'Mathilde Kreinecker', [])
    const rupert = p('rupert', 'Rupert', ['sen', 'anna'], { pos: 1 })
    const georg = p('georg', 'Georg', ['sen', 'mathilde'], { pos: 5 })
    const gv = p('gv', 'Großvater', [])
    const gm = p('gm', 'Großmutter', [])
    const personen: K2FamiliePerson[] = [sen, anna, mathilde, rupert, georg, gv, gm]

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    const eltern = sek!.find((s) => s.key === 'eltern')?.personen.map((x) => x.id) ?? []
    expect(eltern).toContain('anna')
    expect(eltern).toContain('mathilde')
    expect(eltern).toContain('sen')

    const kleinKeys = sek!.filter((s) => s.key.startsWith('kleinfamilie-')).map((s) => s.key)
    expect(kleinKeys).toEqual(['kleinfamilie-rupert', 'kleinfamilie-georg'])

    const { getBranchKey } = buildStammbaumKartenState(personen, 'georg')
    expect(getBranchKey(rupert)).toMatch(/^geschwister-ast:/)
    expect(getBranchKey(georg)).toMatch(/^geschwister-ast:/)
  })

  it('Partner-Unter-Zweige: Kern (Wurzel & Partner) + pro Kind ein Block mit Partnern', () => {
    const m = p('m', 'Mutter', ['gm', 'gv'])
    const f = p('f', 'Vater', ['gm', 'gv'])
    const georg = p('georg', 'Georg', ['m', 'f'], {
      pos: 7,
      partners: [{ personId: 'martina', from: null, to: null }],
      childIds: ['eva', 'lukas'],
    })
    const martina = p('martina', 'Martina', [], { partners: [{ personId: 'georg', from: null, to: null }] })
    const eva = p('eva', 'Eva', ['georg', 'martina'], {
      pos: 1,
      partners: [{ personId: 'michael', from: null, to: null }],
    })
    const michael = p('michael', 'Michael', [], { partners: [{ personId: 'eva', from: null, to: null }] })
    const lukas = p('lukas', 'Lukas', ['georg', 'martina'], {
      pos: 2,
      partners: [{ personId: 'nora', from: null, to: null }],
    })
    const nora = p('nora', 'Nora', [], { partners: [{ personId: 'lukas', from: null, to: null }] })
    const personen = [m, f, georg, martina, eva, michael, lukas, nora]

    const roh = getFamilienzweigPersonen(personen, 'georg')
    const klein = buildStammbaumKartenState(roh, 'georg').sortedPersonen
    const unter = buildStammbaumPartnerUnterSektionen(personen, 'georg', klein)

    const kern = unter.find((u) => u.key.startsWith('kern-'))
    expect(kern?.personen.map((x) => x.id).sort()).toEqual(['georg', 'martina'].sort())

    const evaZweig = unter.find((u) => u.key === 'kind-eva')
    expect(evaZweig?.personen.map((x) => x.id).sort()).toEqual(['eva', 'michael'].sort())

    const lukasZweig = unter.find((u) => u.key === 'kind-lukas')
    expect(lukasZweig?.personen.map((x) => x.id).sort()).toEqual(['lukas', 'nora'].sort())
  })

  it('Unter-Zweige: andere Geschwister nicht in „Weitere im Familienzweig“ (eigener Block oben)', () => {
    const m = p('m', 'Mutter', ['gm', 'gv'])
    const f = p('f', 'Vater', ['gm', 'gv'])
    const rupert = p('rupert', 'Rupert', ['m', 'f'], { pos: 1 })
    const georg = p('georg', 'Georg', ['m', 'f'], { pos: 2 })
    const personen = [m, f, rupert, georg]
    const klein = buildStammbaumKartenState(personen, 'georg').sortedPersonen
    const unter = buildStammbaumPartnerUnterSektionen(personen, 'georg', klein)
    const restIds = unter.find((u) => u.key.startsWith('rest-'))?.personen.map((x) => x.id) ?? []
    expect(restIds).not.toContain('rupert')
  })

  it('Großfamilie: Lef – nach Normalize wie beim Laden (Whitespace in parentIds): eigene Zweige', () => {
    const m = p('m', 'Mutter', ['gm', 'gv'])
    const f = p('f', 'Vater', ['gm', 'gv'])
    const elisabeth = p('elisabeth', 'Elisabeth', ['m', 'f'], {
      pos: 2,
      partners: [{ personId: 'michael', from: null, to: null }],
    })
    const michael = p('michael', 'Michael', [], { partners: [{ personId: 'elisabeth', from: null, to: null }] })
    const philipp = p('philipp', 'Philipp', ['elisabeth', 'michael'], {
      pos: 1,
      partners: [{ personId: 'nora', from: null, to: null }],
    })
    const nora = p('nora', 'Nora', [], { partners: [{ personId: 'philipp', from: null, to: null }] })
    const joshua = p('joshua', 'Joshua', ['michael ', ' elisabeth'])
    const olivia = p('olivia', 'Olivia', ['elisabeth', 'michael'])
    const georg = p('georg', 'Georg', ['m', 'f'], { pos: 3 })
    const roh = [m, f, elisabeth, michael, philipp, nora, joshua, olivia, georg]
    const personen = reconcileParentChildRelations(normalizeAndDedupePersonen(roh))

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    const elisabethSek = sek!.find((s) => s.key === 'kleinfamilie-elisabeth')
    expect(elisabethSek).toBeDefined()
    const unter = elisabethSek!.unterSektionen ?? []
    expect(unter.some((u) => u.key === 'kind-joshua')).toBe(true)
    expect(unter.some((u) => u.key === 'kind-olivia')).toBe(true)
  })

  it('Großfamilie: Lef – Philipp & Nora, Joshua & Olivia mit beiden Eltern: eigene Zweige, nicht Weitere', () => {
    const m = p('m', 'Mutter', ['gm', 'gv'])
    const f = p('f', 'Vater', ['gm', 'gv'])
    const elisabeth = p('elisabeth', 'Elisabeth', ['m', 'f'], {
      pos: 2,
      partners: [{ personId: 'michael', from: null, to: null }],
    })
    const michael = p('michael', 'Michael', [], { partners: [{ personId: 'elisabeth', from: null, to: null }] })
    const philipp = p('philipp', 'Philipp', ['elisabeth', 'michael'], {
      pos: 1,
      partners: [{ personId: 'nora', from: null, to: null }],
    })
    const nora = p('nora', 'Nora', [], { partners: [{ personId: 'philipp', from: null, to: null }] })
    const joshua = p('joshua', 'Joshua', ['michael', 'elisabeth'])
    const olivia = p('olivia', 'Olivia', ['elisabeth', 'michael'])
    const georg = p('georg', 'Georg', ['m', 'f'], { pos: 3 })
    const personen = [m, f, elisabeth, michael, philipp, nora, joshua, olivia, georg]

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    const elisabethSek = sek!.find((s) => s.key === 'kleinfamilie-elisabeth')
    expect(elisabethSek).toBeDefined()
    const unter = elisabethSek!.unterSektionen ?? []
    expect(unter.some((u) => u.key === 'kind-philipp')).toBe(true)
    expect(unter.some((u) => u.key === 'kind-joshua')).toBe(true)
    expect(unter.some((u) => u.key === 'kind-olivia')).toBe(true)
    const restIds = unter.find((u) => u.key === 'rest-elisabeth')?.personen.map((x) => x.id) ?? []
    expect(restIds.includes('joshua')).toBe(false)
    expect(restIds.includes('olivia')).toBe(false)
  })

  it('Großfamilie: nur Vater in parentIds der Kinder – trotzdem eigene Zweige unter Mutter (Kern-Partner)', () => {
    const m = p('m', 'Mutter', ['gm', 'gv'])
    const f = p('f', 'Vater', ['gm', 'gv'])
    const elisabeth = p('elisabeth', 'Elisabeth', ['m', 'f'], {
      pos: 2,
      partners: [{ personId: 'michael', from: null, to: null }],
    })
    const michael = p('michael', 'Michael', [], { partners: [{ personId: 'elisabeth', from: null, to: null }] })
    const joshua = p('joshua', 'Joshua', ['michael'])
    const olivia = p('olivia', 'Olivia', ['michael'])
    const georg = p('georg', 'Georg', ['m', 'f'], { pos: 3 })
    const personen = [m, f, elisabeth, michael, joshua, olivia, georg]

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    const elisabethSek = sek!.find((s) => s.key === 'kleinfamilie-elisabeth')
    expect(elisabethSek).toBeDefined()
    const unter = elisabethSek!.unterSektionen ?? []
    expect(unter.some((u) => u.key === 'kind-joshua')).toBe(true)
    expect(unter.some((u) => u.key === 'kind-olivia')).toBe(true)
    const restIds = unter.find((u) => u.key === 'rest-elisabeth')?.personen.map((x) => x.id) ?? []
    expect(restIds.includes('joshua')).toBe(false)
    expect(restIds.includes('olivia')).toBe(false)
  })

  it('Großfamilie: Kinder unter Geschwister-Ast auch über parentIds (ohne childIds auf Elternkarte)', () => {
    const m = p('m', 'Mutter', ['gm', 'gv'])
    const f = p('f', 'Vater', ['gm', 'gv'])
    const elisabeth = p('elisabeth', 'Elisabeth', ['m', 'f'], {
      pos: 2,
      partners: [{ personId: 'michael', from: null, to: null }],
    })
    const michael = p('michael', 'Michael', [], { partners: [{ personId: 'elisabeth', from: null, to: null }] })
    const joshua = p('joshua', 'Joshua', ['michael', 'elisabeth'])
    const olivia = p('olivia', 'Olivia', ['michael', 'elisabeth'])
    const georg = p('georg', 'Georg', ['m', 'f'], { pos: 3 })
    const personen = [m, f, elisabeth, michael, joshua, olivia, georg]

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    const elisabethSek = sek!.find((s) => s.key === 'kleinfamilie-elisabeth')
    expect(elisabethSek).toBeDefined()
    const unter = elisabethSek!.unterSektionen ?? []
    expect(unter.some((u) => u.key === 'kind-joshua')).toBe(true)
    expect(unter.some((u) => u.key === 'kind-olivia')).toBe(true)
    const restIds = unter.find((u) => u.key === 'rest-elisabeth')?.personen.map((x) => x.id) ?? []
    expect(restIds.includes('joshua')).toBe(false)
    expect(restIds.includes('olivia')).toBe(false)
  })

  it('Organisches Wachstum: Urenkel im Familienzweig und unter demselben Kind-Block, nicht unter Weitere', () => {
    const m = p('m', 'Mutter', ['gm', 'gv'])
    const f = p('f', 'Vater', ['gm', 'gv'])
    const elisabeth = p('elisabeth', 'Elisabeth', ['m', 'f'], {
      pos: 2,
      partners: [{ personId: 'michael', from: null, to: null }],
    })
    const michael = p('michael', 'Michael', [], { partners: [{ personId: 'elisabeth', from: null, to: null }] })
    const joshua = p('joshua', 'Joshua', ['michael', 'elisabeth'])
    const olivia = p('olivia', 'Olivia', ['michael', 'elisabeth'])
    const georg = p('georg', 'Georg', ['m', 'f'], { pos: 3 })
    const emma = p('emma', 'Emma', ['joshua'])
    const personen = [m, f, elisabeth, michael, joshua, olivia, georg, emma]

    /** Enkel/Urenkel hängen am Großfamilie-Ast von „Ich bin“ (Geschwister-Teilbäume), nicht an getFamilienzweigPersonen ohne Geschwisterkreis. */
    expect(getFamilienzweigPersonen(personen, 'georg', { includeSiblingCircle: false }).some((x) => x.id === 'emma')).toBe(
      false
    )

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    /** Großfamilie: gleicher Aufbau für alle Geschwister-Aste – Urenkel z. B. Emma beim Familienzweig der Mutter (Elisabeth), nicht unter Georgs Block. */
    const elisabethSek = sek!.find((s) => s.key === 'kleinfamilie-elisabeth')
    expect(elisabethSek).toBeDefined()
    const unterElisabeth = elisabethSek!.unterSektionen ?? []
    expect(unterElisabeth.some((u) => u.personen.some((p) => p.id === 'emma'))).toBe(true)
    const georgSek = sek!.find((s) => s.key === 'kleinfamilie-georg')
    expect(georgSek).toBeDefined()
    const unterGeorg = georgSek!.unterSektionen ?? []
    expect(unterGeorg.some((u) => u.personen.some((p) => p.id === 'emma'))).toBe(false)
  })

  it('Geschwister-Ast: Kinder mit nicht-Geschwister-Elternteil zuerst in parentIds (Lef) nicht im „Weitere“-Block eines anderen Geschwisters', () => {
    const m = p('m', 'Mutter', ['gm', 'gv'])
    const f = p('f', 'Vater', ['gm', 'gv'])
    const elisabeth = p('elisabeth', 'Elisabeth', ['m', 'f'], {
      pos: 2,
      partners: [{ personId: 'michael', from: null, to: null }],
    })
    const michael = p('michael', 'Michael', [], { partners: [{ personId: 'elisabeth', from: null, to: null }] })
    const joshua = p('joshua', 'Joshua', ['michael', 'elisabeth'])
    const olivia = p('olivia', 'Olivia', ['michael', 'elisabeth'])
    const georg = p('georg', 'Georg', ['m', 'f'], { pos: 3 })
    const personen = [m, f, elisabeth, michael, joshua, olivia, georg]

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    const georgSek = sek!.find((s) => s.key === 'kleinfamilie-georg')
    expect(georgSek).toBeDefined()
    const unter = georgSek!.unterSektionen ?? []
    const restGeorg = unter.find((u) => u.key === 'rest-georg')?.personen.map((x) => x.id) ?? []
    expect(restGeorg.includes('joshua')).toBe(false)
    expect(restGeorg.includes('olivia')).toBe(false)
  })

  it('Familienzweig: Eltern der Kinder sind im gefilterten Satz (Stammbaum-Linien zu beiden Eltern)', () => {
    const partner = p('partner', 'Partner', [])
    const du = p('du', 'Du', [], {
      childIds: ['joshua'],
      partners: [{ personId: 'partner', from: null, to: null }],
    })
    const joshua = p('joshua', 'Joshua', ['du', 'partner'])
    const personen = [du, joshua, partner]
    const zweig = getFamilienzweigPersonen(personen, 'du')
    expect(zweig.map((x) => x.id).sort()).toEqual(['du', 'joshua', 'partner'].sort())
  })

  it('Großfamilie: Kind eines Geschwisters nur über parentIds (ohne childIds auf Eltern) liegt im Familienzweig, nicht unter Weitere', () => {
    const m = p('m', 'Mutter', ['gm', 'gv'])
    const f = p('f', 'Vater', ['gm', 'gv'])
    const peter = p('peter', 'Peter', ['m', 'f'], {
      pos: 2,
      partners: [{ personId: 'elisabeth', from: null, to: null }],
    })
    const elisabeth = p('elisabeth', 'Elisabeth', [], { partners: [{ personId: 'peter', from: null, to: null }] })
    const georg = p('georg', 'Georg', ['m', 'f'], { pos: 3 })
    const joshua = p('joshua', 'Joshua', ['peter', 'elisabeth'])
    const personen = [m, f, peter, elisabeth, georg, joshua]

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    const weitereIds = sek!.find((s) => s.key === 'weitere')?.personen.map((x) => x.id) ?? []
    expect(weitereIds.includes('joshua')).toBe(false)
    const peterZweig = sek!.find((s) => s.key === 'kleinfamilie-peter')
    expect(peterZweig?.personen.map((x) => x.id)).toContain('joshua')
  })

  it('Großfamilie: Partner nur auf einer Karte (Ehefrau/Ehemann) liegt im Familienzweig, nicht unter Weitere', () => {
    const m = p('m', 'Mutter', ['gm', 'gv'])
    const f = p('f', 'Vater', ['gm', 'gv'])
    const rupert = p('rupert', 'Rupert', ['m', 'f'], { pos: 1, partners: [] })
    const georg = p('georg', 'Georg', ['m', 'f'], { pos: 3 })
    const agnes = p('agnes', 'Agnes', [], {
      partners: [{ personId: 'rupert', from: null, to: null }],
    })
    const personen = [m, f, rupert, georg, agnes]

    const sek = buildGrossfamilieStammbaumSektionen(personen, 'georg')
    expect(sek).not.toBeNull()
    const weitereIdsA = sek!.find((s) => s.key === 'weitere')?.personen.map((x) => x.id) ?? []
    expect(weitereIdsA.includes('agnes')).toBe(false)
    const rupertZweig = sek!.find((s) => s.key === 'kleinfamilie-rupert')
    expect(rupertZweig?.personen.map((x) => x.id)).toContain('agnes')
  })
})
