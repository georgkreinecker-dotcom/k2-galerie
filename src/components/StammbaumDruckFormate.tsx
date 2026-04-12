/**
 * K2 Familie – übersichtliche Druck-/PDF-Formate ohne Grafik (Liste, Register).
 * Gliederung: immer Familienzweig-Gruppen (wie Stammbaum-Karten), innerhalb Zweig nach
 * Geschwisterfolge oder Geburtsdatum – keine reine A–Z-Sortierung.
 */

import type { ReactNode } from 'react'
import { Fragment } from 'react'
import type { K2FamiliePerson } from '../types/k2Familie'
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
              </div>
            ))}
          </section>
        )
      })}
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
        Personenblätter nach Familienzweigen – ein Block pro Person, gut lesbar als PDF
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
