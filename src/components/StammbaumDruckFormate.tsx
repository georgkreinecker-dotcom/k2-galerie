/**
 * K2 Familie – übersichtliche Druck-/PDF-Formate ohne Grafik (Liste, Register).
 * Gliederung: immer Familienzweig-Gruppen (wie Stammbaum-Karten), innerhalb Zweig nach
 * Geschwisterfolge oder Geburtsdatum – keine reine A–Z-Sortierung.
 */

import type { ReactNode } from 'react'
import { Fragment } from 'react'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { FAMILIE_DRUCK_RECHTE_ZEILEN } from '../types/k2FamilieRollen'
import type { K2FamilieKontaktAdresse, K2FamiliePerson } from '../types/k2Familie'
import { normalizeFamilieDatum } from '../utils/familieDatumEingabe'
import { buildStammbaumKartenState } from '../utils/familieStammbaumKarten'
import { familienKatalogSpalteLabel, normalizeFamilieKatalogSpalten } from '../utils/familieKatalogPreferences'
import {
  getGenerations,
  getGenerationsFamilienzweigAbwaertsWurzel,
  getChildIds,
  orderInGeneration,
} from './FamilyTreeGraph'

function byIdMap(personen: K2FamiliePerson[]): Map<string, K2FamiliePerson> {
  return new Map(personen.map((p) => [p.id, p]))
}

function formatGeb(d?: string): string {
  if (!d?.trim()) return '–'
  const m = d.trim().match(/^(\d{4})/)
  return m ? m[1] : d.trim()
}

/** Vollständiges Datum für Katalog/PDF (ISO → TT.MM.JJJJ). */
function formatDatumDruck(d?: string): string {
  if (!d?.trim()) return '–'
  const t = d.trim()
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) return `${m[3]}.${m[2]}.${m[1]}`
  return t
}

function geburtJahr(d?: string): number {
  if (!d?.trim()) return 9999
  const m = d.trim().match(/^(\d{4})/)
  return m ? parseInt(m[1], 10) : 9999
}

function hasKontaktAdresseData(k?: K2FamilieKontaktAdresse): boolean {
  if (!k) return false
  return ['zeile1', 'zeile2', 'plz', 'ort', 'land', 'email', 'telefon'].some((f) => {
    const v = k[f as keyof K2FamilieKontaktAdresse]
    return typeof v === 'string' && v.trim().length > 0
  })
}

/** Adresszeilen für Druck (keine leeren Zeilen). */
function formatAnschriftZeilenDruck(k: K2FamilieKontaktAdresse): string[] {
  const lines: string[] = []
  if (k.zeile1?.trim()) lines.push(k.zeile1.trim())
  if (k.zeile2?.trim()) lines.push(k.zeile2.trim())
  const plzOrt = [k.plz?.trim(), k.ort?.trim()].filter(Boolean).join(' ')
  if (plzOrt) lines.push(plzOrt)
  if (k.land?.trim()) lines.push(k.land.trim())
  return lines
}

/** Kompakt unter der Generations-Zeile: max. 2 Zeilen, gut lesbar. */
function kontaktKompaktZeilen(p: K2FamiliePerson): string[] {
  const k = p.kontaktAdresse
  if (!hasKontaktAdresseData(k)) return []
  const addr = formatAnschriftZeilenDruck(k!)
  const out: string[] = []
  if (addr.length) out.push(addr.join(', '))
  const telMail: string[] = []
  if (k!.email?.trim()) telMail.push(`E-Mail: ${k!.email.trim()}`)
  if (k!.telefon?.trim()) telMail.push(`Tel.: ${k!.telefon.trim()}`)
  if (telMail.length) out.push(telMail.join(' · '))
  return out
}

/** Kurz-ID für Katalog-Spalte (lesbar, eindeutig genug zum Zuordnen). */
function shortKartenId(id: string): string {
  if (id.length <= 14) return id
  return `…${id.slice(-12)}`
}

/** Innerhalb jedes Zweigs: wie im Stammbaum (Geschwisterfolge) oder nach Geburtsjahr. */
export type KatalogSortierung = 'geschwister' | 'geburt'

/** Aufeinanderfolgende Personen mit gleichem Zweig-Schlüssel → eine Gruppe (Reihenfolge wie Karten). */
function groupConsecutiveByBranchKey(
  sorted: K2FamiliePerson[],
  getBranchKey: (p: K2FamiliePerson) => string
): { key: string; personen: K2FamiliePerson[] }[] {
  const groups: { key: string; personen: K2FamiliePerson[] }[] = []
  for (const p of sorted) {
    const k = getBranchKey(p)
    const last = groups[groups.length - 1]
    if (last && last.key === k) last.personen.push(p)
    else groups.push({ key: k, personen: [p] })
  }
  return groups
}

function branchLabelFuerDruck(key: string, map: Map<string, K2FamiliePerson>): string {
  if (key.startsWith('geschwister-ast:')) {
    const id = key.slice('geschwister-ast:'.length)
    const n = map.get(id)?.name?.trim()
    return n ? `Familienzweig · ${n}` : `Familienzweig · ${shortKartenId(id)}`
  }
  if (key.startsWith('root:')) {
    const id = key.slice('root:'.length)
    const n = map.get(id)?.name?.trim()
    return n ? `Stamm · ${n}` : `Stamm · ${shortKartenId(id)}`
  }
  const ids = key.split('|').filter(Boolean)
  if (ids.length >= 2) {
    const n1 = map.get(ids[0]!)?.name ?? '…'
    const n2 = map.get(ids[1]!)?.name ?? '…'
    return `Zweig · Kinder von ${n1} & ${n2}`
  }
  if (ids.length === 1) {
    const n1 = map.get(ids[0]!)?.name ?? '…'
    return `Zweig · ${n1}`
  }
  return `Zweig · ${key}`
}

function sortPersonenInnerhalbZweigGeburt(list: K2FamiliePerson[]): K2FamiliePerson[] {
  return [...list].sort((a, b) => {
    const ya = geburtJahr(a.geburtsdatum)
    const yb = geburtJahr(b.geburtsdatum)
    if (ya !== yb) return ya - yb
    const pa = a.positionAmongSiblings ?? 9999
    const pb = b.positionAmongSiblings ?? 9999
    if (pa !== pb) return pa - pb
    const ga = a.geburtsdatum ?? ''
    const gb = b.geburtsdatum ?? ''
    if (ga !== gb) return ga.localeCompare(gb)
    return a.name.localeCompare(b.name, 'de')
  })
}

type KatalogZweigGruppe = { branchKey: string; branchLabel: string; personen: K2FamiliePerson[] }

function buildKatalogZweigGruppen(
  personen: K2FamiliePerson[],
  ichBinPersonId: string | undefined,
  sort: KatalogSortierung
): KatalogZweigGruppe[] {
  const state = buildStammbaumKartenState(personen, ichBinPersonId)
  const map = byIdMap(personen)
  const groups = groupConsecutiveByBranchKey(state.sortedPersonen, state.getBranchKey)
  return groups.map(({ key, personen: ps }) => ({
    branchKey: key,
    branchLabel: branchLabelFuerDruck(key, map),
    personen: sort === 'geburt' ? sortPersonenInnerhalbZweigGeburt(ps) : ps,
  }))
}

function generationRowsFuerZweig(
  groupPersonen: K2FamiliePerson[],
  allPersonen: K2FamiliePerson[],
  levelMap: Map<string, number>,
  childIds: Map<string, string[]>,
  maxL: number,
  ichBinPersonId?: string,
  ichBinPositionAmongSiblings?: number
): { level: number; persons: K2FamiliePerson[] }[] {
  const inSet = new Set(groupPersonen.map((p) => p.id))
  const map = byIdMap(allPersonen)
  const rows: { level: number; persons: K2FamiliePerson[] }[] = []
  for (let L = 0; L <= maxL; L++) {
    const ids = allPersonen
      .filter((p) => inSet.has(p.id) && levelMap.get(p.id) === L)
      .map((p) => p.id)
    if (!ids.length) continue
    const orderedIds = orderInGeneration(
      allPersonen,
      ids,
      levelMap,
      childIds,
      ichBinPersonId,
      ichBinPositionAmongSiblings
    )
    const ps = orderedIds.map((id) => map.get(id)).filter((p): p is K2FamiliePerson => p != null)
    if (ps.length) rows.push({ level: L, persons: ps })
  }
  return rows
}

function nameList(ids: string[], map: Map<string, K2FamiliePerson>): string {
  const names = ids.map((id) => map.get(id)?.name).filter(Boolean) as string[]
  return names.length ? names.join(', ') : '–'
}

/** Nach Generationen – eine Ebene pro Abschnitt, gut lesbar als PDF. */
export function StammbaumDruckNachGenerationen({
  personen,
  titel,
  ichBinPersonId,
  ichBinPositionAmongSiblings,
}: {
  personen: K2FamiliePerson[]
  titel: string
  ichBinPersonId?: string
  /** Wie in der Grafik: Reihenfolge „Du“ unter Geschwistern (1…N). */
  ichBinPositionAmongSiblings?: number
}) {
  const ichP = ichBinPersonId ? personen.find((p) => p.id === ichBinPersonId) : undefined
  const pars = ichP?.parentIds ?? []
  const alleElternInListe =
    pars.length === 0 || pars.every((pid) => personen.some((p) => p.id === pid))
  const levelMap =
    ichBinPersonId && ichP && !alleElternInListe
      ? getGenerationsFamilienzweigAbwaertsWurzel(personen, ichBinPersonId)
      : getGenerations(personen)
  const childIds = getChildIds(personen)
  const map = byIdMap(personen)
  const maxL = Math.max(0, ...Array.from(levelMap.values()))
  const kartenState = buildStammbaumKartenState(personen, ichBinPersonId)
  const zweigGruppen = groupConsecutiveByBranchKey(kartenState.sortedPersonen, kartenState.getBranchKey)

  return (
    <div className="stammbaum-print-liste stammbaum-print-nach-generationen">
      <h1 className="stammbaum-druck-titel">{titel}</h1>
      <p className="stammbaum-print-untertitel">
        Übersicht nach Familienzweigen und Generationen (ohne Grafik)
      </p>
      {zweigGruppen.map(({ key, personen: gruppe }) => {
        const rows = generationRowsFuerZweig(
          gruppe,
          personen,
          levelMap,
          childIds,
          maxL,
          ichBinPersonId,
          ichBinPositionAmongSiblings
        )
        if (!rows.length) return null
        return (
          <section key={key} className="stammbaum-print-sektion stammbaum-print-sektion-zweig">
            <h2 className="stammbaum-print-h2 stammbaum-print-h2-zweig">{branchLabelFuerDruck(key, map)}</h2>
            {rows.map(({ level, persons: ps }) => (
              <div key={level} className="stammbaum-print-generation-block">
                <h3 className="stammbaum-print-h3">
                  {level === 0 ? 'Wurzel / älteste Ebene' : `Generation / Ebene ${level}`}
                </h3>
                <ul className="stammbaum-print-ul">
                  {ps.map((p) => {
                    const kontaktZeilen = kontaktKompaktZeilen(p)
                    return (
                    <li key={p.id} className="stammbaum-print-li">
                      <strong className="stammbaum-print-name">
                        {p.name}
                        {ichBinPersonId === p.id && <span className="stammbaum-print-du"> (Du)</span>}
                      </strong>
                      {p.maedchenname ? (
                        <span className="stammbaum-print-meta"> · geb. {p.maedchenname}</span>
                      ) : null}
                      {p.geburtsdatum ? (
                        <span className="stammbaum-print-meta"> · {formatGeb(p.geburtsdatum)}</span>
                      ) : null}
                      {p.verstorben ? (
                        <span className="stammbaum-print-meta"> · verstorben</span>
                      ) : null}
                      <div className="stammbaum-print-detail">
                        Eltern: {nameList(p.parentIds, map)}
                        {' · '}
                        Kinder: {nameList(p.childIds, map)}
                        {' · '}
                        Partner: {nameList(p.partners.map((x) => x.personId), map)}
                      </div>
                      {kontaktZeilen.length > 0 ? (
                        <div className="stammbaum-print-kontakt-kompakt-wrap" aria-label="Kontakt">
                          {kontaktZeilen.map((line, i) => (
                            <div key={i} className="stammbaum-print-kontakt-kompakt-line">
                              {line}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}

const MONAT_NAMEN_DE = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const

type GeburtstagEintrag = {
  person: K2FamiliePerson
  iso: string
  monat: number
  tag: number
  jahr: number
}

function parseGeburtstagEintrag(p: K2FamiliePerson): GeburtstagEintrag | null {
  const raw = p.geburtsdatum?.trim()
  if (!raw) return null
  const iso = normalizeFamilieDatum(raw)
  if (!iso) return null
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const jahr = parseInt(m[1], 10)
  const monat = parseInt(m[2], 10)
  const tag = parseInt(m[3], 10)
  if (monat < 1 || monat > 12 || tag < 1 || tag > 31) return null
  return { person: p, iso, monat, tag, jahr }
}

/** Hinweis-Spalte Geburtstagsliste: Todestag aus Stammdaten, sonst Kennzeichnung verstorben. */
function formatGeburtstagslisteHinweis(p: K2FamiliePerson): string {
  const raw = p.verstorbenAm?.trim()
  if (raw) {
    const iso = normalizeFamilieDatum(raw) || raw
    const d = formatDatumDruck(iso)
    return d !== '–' ? `Todestag: ${d}` : '† verstorben'
  }
  if (p.verstorben) return '† verstorben'
  return '–'
}

/**
 * Geburtstagsliste: alle Personen mit vollständigem Geburtsdatum, sortiert nach Kalender (Tag im Jahr).
 * Ohne Tag/Monat: Abschnitt am Ende. Verstorbene mit † gekennzeichnet.
 */
export function StammbaumDruckGeburtstagsliste({
  personen,
  titel,
  ichBinPersonId,
}: {
  personen: K2FamiliePerson[]
  titel: string
  ichBinPersonId?: string
}) {
  const mitDatum: GeburtstagEintrag[] = []
  const ohneDatum: K2FamiliePerson[] = []
  for (const p of personen) {
    const e = parseGeburtstagEintrag(p)
    if (e) mitDatum.push(e)
    else ohneDatum.push(p)
  }
  mitDatum.sort((a, b) => {
    if (a.monat !== b.monat) return a.monat - b.monat
    if (a.tag !== b.tag) return a.tag - b.tag
    return a.person.name.localeCompare(b.person.name, 'de')
  })
  ohneDatum.sort((a, b) => a.name.localeCompare(b.name, 'de'))

  const byMonth = new Map<number, GeburtstagEintrag[]>()
  for (const e of mitDatum) {
    const list = byMonth.get(e.monat) ?? []
    list.push(e)
    byMonth.set(e.monat, list)
  }

  const stand =
    typeof Intl !== 'undefined'
      ? new Intl.DateTimeFormat('de-AT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())
      : new Date().toLocaleString('de-AT')

  return (
    <div className="stammbaum-print-liste stammbaum-print-geburtstagsliste">
      <h1 className="stammbaum-druck-titel">{titel}</h1>
      <p className="stammbaum-print-untertitel">
        Geburtstagsliste · nach Tag im Kalenderjahr sortiert · {mitDatum.length} mit Datum
        {ohneDatum.length > 0 ? ` · ${ohneDatum.length} ohne vollständiges Geburtsdatum` : ''}
      </p>
      <table className="stammbaum-print-table stammbaum-print-geburtstags-table">
        <thead>
          <tr>
            <th className="stammbaum-print-geburtstags-col-datum">Datum (TT.MM.)</th>
            <th className="stammbaum-print-geburtstags-col-name">Name</th>
            <th className="stammbaum-print-geburtstags-col-jahr">Geburtsjahr</th>
            <th className="stammbaum-print-geburtstags-col-hinweis">Hinweis</th>
          </tr>
        </thead>
        <tbody>
          {MONAT_NAMEN_DE.map((monatName, idx) => {
            const monat = idx + 1
            const rows = byMonth.get(monat)
            if (!rows?.length) return null
            return (
              <Fragment key={monat}>
                <tr className="stammbaum-print-geburtstags-monat-row">
                  <td colSpan={4} className="stammbaum-print-geburtstags-monat-head">
                    {monatName}
                  </td>
                </tr>
                {rows.map((e) => (
                  <tr key={e.person.id} className="stammbaum-print-geburtstags-data">
                    <td>
                      {String(e.tag).padStart(2, '0')}.{String(e.monat).padStart(2, '0')}.
                    </td>
                    <td className="stammbaum-print-td-name">
                      <strong>
                        {e.person.name}
                        {ichBinPersonId === e.person.id ? <span className="stammbaum-print-du"> (Du)</span> : null}
                      </strong>
                    </td>
                    <td>{e.jahr}</td>
                    <td className="meta stammbaum-print-geburtstags-hinweis-zelle">
                      {formatGeburtstagslisteHinweis(e.person)}
                    </td>
                  </tr>
                ))}
              </Fragment>
            )
          })}
          {ohneDatum.length > 0 && (
            <>
              <tr className="stammbaum-print-geburtstags-monat-row">
                <td colSpan={4} className="stammbaum-print-geburtstags-monat-head">
                  Ohne vollständiges Geburtsdatum (Tag/Monat nicht eindeutig)
                </td>
              </tr>
              {ohneDatum.map((p) => (
                <tr key={p.id} className="stammbaum-print-geburtstags-data">
                  <td>{p.geburtsdatum?.trim() ? formatDatumDruck(normalizeFamilieDatum(p.geburtsdatum) || p.geburtsdatum) : '–'}</td>
                  <td className="stammbaum-print-td-name">
                    <strong>
                      {p.name}
                      {ichBinPersonId === p.id ? <span className="stammbaum-print-du"> (Du)</span> : null}
                    </strong>
                  </td>
                  <td>{p.geburtsdatum?.trim() ? formatGeb(p.geburtsdatum) : '–'}</td>
                  <td className="meta stammbaum-print-geburtstags-hinweis-zelle">{formatGeburtstagslisteHinweis(p)}</td>
                </tr>
              ))}
            </>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="stammbaum-print-katalog-foot">
              Stand: {stand}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

/** Eine Person pro Karte – am übersichtlichsten für A4-PDF im Hochformat (ohne Grafik). */
export function StammbaumDruckPersonenblaetter({
  personen,
  titel,
  ichBinPersonId,
}: {
  personen: K2FamiliePerson[]
  titel: string
  ichBinPersonId?: string
}) {
  const map = byIdMap(personen)
  const state = buildStammbaumKartenState(personen, ichBinPersonId)
  const zweigGruppen = groupConsecutiveByBranchKey(state.sortedPersonen, state.getBranchKey)

  return (
    <div className="stammbaum-print-liste stammbaum-print-personenblaetter">
      <h1 className="stammbaum-druck-titel">{titel}</h1>
      <p className="stammbaum-print-untertitel">
        Ein Block pro Person: Stammdaten, Beziehungen, unten optional <strong>Anschrift &amp; Kontakt</strong> (nur wenn auf der
        Personenseite eingetragen).
      </p>
      {zweigGruppen.map(({ key, personen: gruppe }) => (
        <section key={key} className="stammbaum-print-zweig-block">
          <h2 className="stammbaum-print-h2 stammbaum-print-h2-zweig">{branchLabelFuerDruck(key, map)}</h2>
          <div className="stammbaum-print-karten-raster">
            {gruppe.map((p) => (
              <article key={p.id} className="stammbaum-print-person-karte">
                <h2 className="stammbaum-print-person-karte-name">
                  {p.name}
                  {ichBinPersonId === p.id ? <span className="stammbaum-print-du"> (Du)</span> : null}
                </h2>
                <dl className="stammbaum-print-person-dl">
                  {p.maedchenname ? (
                    <>
                      <dt>Geburtsname</dt>
                      <dd>{p.maedchenname}</dd>
                    </>
                  ) : null}
                  <dt>Geboren</dt>
                  <dd>{formatGeb(p.geburtsdatum)}</dd>
                  {p.verstorben ? (
                    <>
                      <dt>Hinweis</dt>
                      <dd>als verstorben geführt</dd>
                    </>
                  ) : null}
                  <dt>Eltern</dt>
                  <dd>{nameList(p.parentIds, map)}</dd>
                  <dt>Kinder</dt>
                  <dd>{nameList(p.childIds, map)}</dd>
                  <dt>Partner</dt>
                  <dd>{nameList(p.partners.map((x) => x.personId), map)}</dd>
                  {hasKontaktAdresseData(p.kontaktAdresse) && p.kontaktAdresse ? (
                    <>
                      <dt className="stammbaum-print-dt-kontakt-sektion">Kontakt</dt>
                      <dd className="stammbaum-print-dd-kontakt-block">
                        {formatAnschriftZeilenDruck(p.kontaktAdresse).length > 0 ? (
                          <div className="stammbaum-print-kontakt-adresse">
                            {formatAnschriftZeilenDruck(p.kontaktAdresse).map((z, i) => (
                              <div key={i}>{z}</div>
                            ))}
                          </div>
                        ) : null}
                        {p.kontaktAdresse.email?.trim() ? (
                          <div className="stammbaum-print-kontakt-zeile">
                            <span className="stammbaum-print-kontakt-label">E-Mail</span>
                            <span>{p.kontaktAdresse.email.trim()}</span>
                          </div>
                        ) : null}
                        {p.kontaktAdresse.telefon?.trim() ? (
                          <div className="stammbaum-print-kontakt-zeile">
                            <span className="stammbaum-print-kontakt-label">Telefon</span>
                            <span>{p.kontaktAdresse.telefon.trim()}</span>
                          </div>
                        ) : null}
                      </dd>
                    </>
                  ) : null}
                </dl>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function formatGestorbenSpalte(p: K2FamiliePerson): string {
  if (p.verstorbenAm?.trim()) return formatDatumDruck(p.verstorbenAm)
  if (p.verstorben) return '†'
  return '–'
}

function familienKatalogZelle(
  colId: string,
  p: K2FamiliePerson,
  rowIndex: number,
  map: Map<string, K2FamiliePerson>,
  ichBinPersonId?: string
): ReactNode {
  switch (colId) {
    case 'nr':
      return rowIndex + 1
    case 'id':
      return shortKartenId(p.id)
    case 'name':
      return (
        <>
          {p.name}
          {ichBinPersonId === p.id ? <span className="stammbaum-print-du"> (Du)</span> : null}
        </>
      )
    case 'gebName':
      return p.maedchenname?.trim() ? p.maedchenname : '–'
    case 'geboren':
      return formatDatumDruck(p.geburtsdatum)
    case 'gestorben':
      return formatGestorbenSpalte(p)
    case 'eltern':
      return nameList(p.parentIds, map)
    case 'partner':
      return nameList(
        p.partners.map((x) => x.personId),
        map
      )
    case 'kinder':
      return nameList(p.childIds, map)
    case 'geschwister':
      return nameList(p.siblingIds, map)
    case 'kontakt': {
      const k = p.kontaktAdresse
      if (!hasKontaktAdresseData(k)) return '–'
      const addr = formatAnschriftZeilenDruck(k!)
      return (
        <div className="stammbaum-print-kontakt-katalog-cell">
          {addr.length > 0 ? (
            <div className="stammbaum-print-kontakt-katalog-addr">{addr.join(' · ')}</div>
          ) : null}
          {k!.email?.trim() ? <div className="stammbaum-print-kontakt-katalog-line">E-Mail: {k!.email.trim()}</div> : null}
          {k!.telefon?.trim() ? <div className="stammbaum-print-kontakt-katalog-line">Tel.: {k!.telefon.trim()}</div> : null}
        </div>
      )
    }
    default:
      return '–'
  }
}

function katalogThClass(colId: string): string | undefined {
  if (colId === 'nr') return 'stammbaum-print-katalog-col-nr'
  if (colId === 'id') return 'stammbaum-print-katalog-col-id'
  return undefined
}

function katalogTdClass(colId: string): string | undefined {
  if (colId === 'nr') return 'stammbaum-print-katalog-nr'
  if (colId === 'id') return 'stammbaum-print-katalog-id'
  if (colId === 'name') return 'stammbaum-print-td-name'
  if (colId === 'kontakt') return 'stammbaum-print-katalog-td-kontakt'
  return undefined
}

/** Familien-Katalog: tabellarisches Register wie eine Datenbank-Auszugliste (Sortierung wählbar). */
export function StammbaumDruckRegister({
  personen,
  titel,
  ichBinPersonId,
  sortierung = 'geschwister',
  spalten,
}: {
  personen: K2FamiliePerson[]
  titel: string
  ichBinPersonId?: string
  sortierung?: KatalogSortierung
  /** Gewählte Spalten (Reihenfolge); ohne Angabe = Standard alle Spalten. */
  spalten?: string[]
}) {
  const map = byIdMap(personen)
  const cols = normalizeFamilieKatalogSpalten(spalten)
  const zweigGruppen = buildKatalogZweigGruppen(personen, ichBinPersonId, sortierung)
  const sortLabel =
    sortierung === 'geburt'
      ? 'Familienzweige; innerhalb Zweig nach Geburtsjahr'
      : 'Familienzweige; innerhalb Zweig wie Stammbaum (Geschwisterfolge)'
  const stand =
    typeof Intl !== 'undefined'
      ? new Intl.DateTimeFormat('de-AT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())
      : new Date().toLocaleString('de-AT')

  let zeilenNr = 0

  return (
    <div className="stammbaum-print-liste stammbaum-print-register stammbaum-print-katalog">
      <h1 className="stammbaum-druck-titel">{titel}</h1>
      <p className="stammbaum-print-untertitel">
        Familien-Katalog · Register ohne Grafik · {sortLabel}
      </p>
      <table className="stammbaum-print-table stammbaum-print-katalog-table">
        <caption className="stammbaum-print-katalog-caption">
          {personen.length} Datensätze · nach Familienzweigen gegliedert
        </caption>
        <thead>
          <tr>
            {cols.map((colId) => (
              <th key={colId} className={katalogThClass(colId)}>
                {familienKatalogSpalteLabel(colId)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {zweigGruppen.map((g) => (
            <Fragment key={g.branchKey}>
              <tr className="stammbaum-print-katalog-zweig-row">
                <td colSpan={cols.length} className="stammbaum-print-katalog-zweig-head">
                  {g.branchLabel}
                </td>
              </tr>
              {g.personen.map((p) => {
                const i = zeilenNr++
                const dataClass =
                  i % 2 === 0
                    ? 'stammbaum-print-katalog-data stammbaum-print-katalog-data--even'
                    : 'stammbaum-print-katalog-data stammbaum-print-katalog-data--odd'
                return (
                  <tr key={p.id} className={dataClass}>
                    {cols.map((colId) => (
                      <td key={colId} className={katalogTdClass(colId)}>
                        {familienKatalogZelle(colId, p, i, map, ichBinPersonId)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={cols.length} className="stammbaum-print-katalog-foot">
              Stand: {stand}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

/** Eine Seite: Schreib- und Leserechte für die Familie (PDF/Druck aus dem Stammbaum, ohne Personendaten). */
export function StammbaumDruckSchreibLeserechte({ familienName }: { familienName: string }) {
  const stand =
    typeof Intl !== 'undefined'
      ? new Intl.DateTimeFormat('de-AT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())
      : new Date().toLocaleString('de-AT')

  return (
    <div className="stammbaum-print-liste stammbaum-print-schreib-leserechte">
      <h1 className="stammbaum-druck-titel">{familienName}</h1>
      <p className="stammbaum-print-untertitel">Schreib- und Leserechte · komprimiert (für die Familie)</p>
      <p className="stammbaum-print-meta" style={{ marginTop: '0.35rem', lineHeight: 1.45 }}>
        Gleiche drei Rollen wie in der App (oben wählbar). Zum Ausdrucken oder „Als PDF speichern“ im
        Druckdialog – ohne Personendaten.
      </p>
      <h2 className="stammbaum-print-h2" style={{ marginTop: '0.75rem', marginBottom: '0.35rem' }}>
        Lesen und Schreiben nach Rolle
      </h2>
      <table className="stammbaum-print-table stammbaum-print-rechte-pdf-table">
        <thead>
          <tr>
            <th scope="col">Rolle</th>
            <th scope="col">Lesen</th>
            <th scope="col">Schreiben</th>
          </tr>
        </thead>
        <tbody>
          {FAMILIE_DRUCK_RECHTE_ZEILEN.map((z) => (
            <tr key={z.rolle}>
              <td className="stammbaum-print-td-name">
                <strong>{z.rolle}</strong>
              </td>
              <td>{z.lesen}</td>
              <td>{z.schreiben}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="stammbaum-print-meta" style={{ marginTop: '0.65rem', lineHeight: 1.45 }}>
        <strong>Eigene Karte:</strong> Fotos und Texte auf der eigenen Personenkarte – soweit die Rolle
        Speichern erlaubt. Beziehungen und Stammbaum-Struktur nur mit Inhaber:in.
      </p>
      <p className="stammbaum-print-meta" style={{ marginTop: '0.45rem', lineHeight: 1.45, fontSize: '0.78rem' }}>
        Spätere Erweiterung (z.&nbsp;B. Rechte nach Familienzweig): K2 Familie → Benutzerhandbuch, Kapitel zu
        Rollen &amp; Rechten.
      </p>
      <p className="stammbaum-print-meta stammbaum-print-rechte-fuss" style={{ marginTop: '0.85rem', fontSize: '0.72rem', lineHeight: 1.4 }}>
        {PRODUCT_COPYRIGHT_BRAND_ONLY}
        <br />
        {PRODUCT_URHEBER_ANWENDUNG}
        <br />
        Stand: {stand}
      </p>
    </div>
  )
}
