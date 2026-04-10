/**
 * K2 Familie – übersichtliche Druck-/PDF-Formate ohne Grafik (Liste, Register).
 */

import type { K2FamiliePerson } from '../types/k2Familie'
import { getGenerations, getChildIds, orderInGeneration } from './FamilyTreeGraph'

function byIdMap(personen: K2FamiliePerson[]): Map<string, K2FamiliePerson> {
  return new Map(personen.map((p) => [p.id, p]))
}

function formatGeb(d?: string): string {
  if (!d?.trim()) return '–'
  const m = d.trim().match(/^(\d{4})/)
  return m ? m[1] : d.trim()
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
  const levelMap = getGenerations(personen)
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

/** Alphabetisches Verzeichnis – Tabelle, ideal für Suche und A4-PDF. */
export function StammbaumDruckRegister({
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
    <div className="stammbaum-print-liste stammbaum-print-register">
      <h1 className="stammbaum-druck-titel">{titel}</h1>
      <p className="stammbaum-print-untertitel">Alphabetisches Verzeichnis (ohne Grafik)</p>
      <table className="stammbaum-print-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Geb.</th>
            <th>Eltern</th>
            <th>Partner</th>
            <th>Kinder</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.id}>
              <td className="stammbaum-print-td-name">
                {p.name}
                {ichBinPersonId === p.id ? <span className="stammbaum-print-du"> (Du)</span> : null}
              </td>
              <td>{formatGeb(p.geburtsdatum)}</td>
              <td>{nameList(p.parentIds, map)}</td>
              <td>{nameList(p.partners.map((x) => x.personId), map)}</td>
              <td>{nameList(p.childIds, map)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
