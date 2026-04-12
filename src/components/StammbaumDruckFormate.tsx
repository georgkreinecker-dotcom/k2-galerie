/**
 * K2 Familie – übersichtliche Druck-/PDF-Formate ohne Grafik (Liste, Register).
 */

import type { ReactNode } from 'react'
import type { K2FamiliePerson } from '../types/k2Familie'
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

/** Kurz-ID für Katalog-Spalte (lesbar, eindeutig genug zum Zuordnen). */
function shortKartenId(id: string): string {
  if (id.length <= 14) return id
  return `…${id.slice(-12)}`
}

export type KatalogSortierung = 'name' | 'geburt'

function sortPersonenKatalog(list: K2FamiliePerson[], sort: KatalogSortierung): K2FamiliePerson[] {
  const copy = [...list]
  if (sort === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name, 'de'))
    return copy
  }
  copy.sort((a, b) => {
    const ya = geburtJahr(a.geburtsdatum)
    const yb = geburtJahr(b.geburtsdatum)
    if (ya !== yb) return ya - yb
    return a.name.localeCompare(b.name, 'de')
  })
  return copy
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
  const rows: { level: number; persons: K2FamiliePerson[] }[] = []
  for (let L = 0; L <= maxL; L++) {
    const ids = personen.filter((p) => levelMap.get(p.id) === L).map((p) => p.id)
    const orderedIds = orderInGeneration(personen, ids, levelMap, childIds, ichBinPersonId, ichBinPositionAmongSiblings)
    const ps = orderedIds.map((id) => map.get(id)).filter((p): p is K2FamiliePerson => p != null)
    if (ps.length) rows.push({ level: L, persons: ps })
  }

  return (
    <div className="stammbaum-print-liste stammbaum-print-nach-generationen">
      <h1 className="stammbaum-druck-titel">{titel}</h1>
      <p className="stammbaum-print-untertitel">Übersicht nach Generationen (ohne Grafik)</p>
      {rows.map(({ level, persons: ps }) => (
        <section key={level} className="stammbaum-print-sektion">
          <h2 className="stammbaum-print-h2">
            {level === 0 ? 'Wurzel / älteste Ebene' : `Generation / Ebene ${level}`}
          </h2>
          <ul className="stammbaum-print-ul">
            {ps.map((p) => (
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
              </li>
            ))}
          </ul>
        </section>
      ))}
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
  const sorted = [...personen].sort((a, b) => a.name.localeCompare(b.name, 'de'))

  return (
    <div className="stammbaum-print-liste stammbaum-print-personenblaetter">
      <h1 className="stammbaum-druck-titel">{titel}</h1>
      <p className="stammbaum-print-untertitel">Personenblätter – ein Block pro Person, gut lesbar als PDF</p>
      <div className="stammbaum-print-karten-raster">
        {sorted.map((p) => (
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
            </dl>
          </article>
        ))}
      </div>
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
  return undefined
}

/** Familien-Katalog: tabellarisches Register wie eine Datenbank-Auszugliste (Sortierung wählbar). */
export function StammbaumDruckRegister({
  personen,
  titel,
  ichBinPersonId,
  sortierung = 'name',
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
  const sorted = sortPersonenKatalog(personen, sortierung)
  const sortLabel = sortierung === 'geburt' ? 'Geburtsjahr (aufsteigend), dann Name' : 'Name A–Z'
  const stand =
    typeof Intl !== 'undefined'
      ? new Intl.DateTimeFormat('de-AT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())
      : new Date().toLocaleString('de-AT')

  return (
    <div className="stammbaum-print-liste stammbaum-print-register stammbaum-print-katalog">
      <h1 className="stammbaum-druck-titel">{titel}</h1>
      <p className="stammbaum-print-untertitel">
        Familien-Katalog · Register ohne Grafik · Sortierung: {sortLabel}
      </p>
      <table className="stammbaum-print-table stammbaum-print-katalog-table">
        <caption className="stammbaum-print-katalog-caption">
          {sorted.length} Datensätze · Karten aus dem Stammbaum (Familienzweig)
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
          {sorted.map((p, i) => (
            <tr key={p.id}>
              {cols.map((colId) => (
                <td key={colId} className={katalogTdClass(colId)}>
                  {familienKatalogZelle(colId, p, i, map, ichBinPersonId)}
                </td>
              ))}
            </tr>
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
