/**
 * K2 Familie – Kalender: Monatsraster, Demnächst, Archiv. Events, Momente, Geburtstage, Sterbetage.
 * Route: /projects/k2-familie/kalender
 */

import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { loadEvents, loadMomente, loadPersonen } from '../utils/familieStorage'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { K2FamilieEventKalenderSubnav } from '../components/K2FamilieEventKalenderSubnav'
import {
  buildMonthDayCells,
  isoDateFromParts,
  istGeburtstagAmTag,
  istJahrestagAmIsoDatum,
  lastDayOfMonth,
  todayIsoLocal,
  weekRangeMondaySundayContainingMonthFirst,
} from '../utils/familieKalenderDatum'

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

type KalenderEintrag =
  | { date: string; type: 'event'; title: string; id: string; extra?: string }
  | { date: string; type: 'moment'; title: string; id: string; personId: string; personName: string }
  | { date: string; type: 'geburtstag'; title: string; id: string; personName: string }
  | { date: string; type: 'sterbetag'; title: string; id: string; personName: string }

type DruckZeitraum = 'woche' | 'monat' | 'jahr'

function formatMonthYearLabel(year: number, monthIndex0: number): string {
  return `${MONTHS[monthIndex0]} ${year}`
}

function formatIsoDe(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${Number(d)}.${Number(m)}.${y}`
}

function formatEintragDruckzeile(e: KalenderEintrag): string {
  switch (e.type) {
    case 'event':
      return `Event: ${e.title}${e.extra ? ` (${e.extra})` : ''}`
    case 'moment':
      return `Moment: ${e.title} – ${e.personName}`
    case 'geburtstag':
      return `Geburtstag: ${e.personName}`
    case 'sterbetag':
      return `Sterbetag (Jahrestag): ${e.personName}`
    default:
      return ''
  }
}

export default function K2FamilieKalenderPage() {
  const { currentTenantId, familieStorageRevision } = useFamilieTenant()
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth0, setViewMonth0] = useState(now.getMonth())
  const [druckZeitraum, setDruckZeitraum] = useState<DruckZeitraum>('monat')

  const personen = useMemo(() => loadPersonen(currentTenantId), [currentTenantId, familieStorageRevision])
  const events = useMemo(() => loadEvents(currentTenantId), [currentTenantId, familieStorageRevision])
  const momente = useMemo(() => loadMomente(currentTenantId), [currentTenantId, familieStorageRevision])

  const getPersonName = (personId: string) => personen.find((p) => p.id === personId)?.name ?? personId

  const jahrRecurring = new Date().getFullYear()

  const eintraege = useMemo((): KalenderEintrag[] => {
    const list: KalenderEintrag[] = []
    events.forEach((e) => {
      list.push({
        date: e.date,
        type: 'event',
        title: e.title,
        id: e.id,
        extra: e.participantIds.length > 0 ? e.participantIds.map((id) => getPersonName(id)).join(', ') : undefined,
      })
    })
    momente.forEach((m) => {
      if (m.date) {
        list.push({
          date: m.date,
          type: 'moment',
          title: m.title,
          id: m.id,
          personId: m.personId,
          personName: getPersonName(m.personId),
        })
      }
    })
    personen.forEach((p) => {
      const gd = p.geburtsdatum?.trim()
      if (gd && /^\d{4}-\d{2}-\d{2}$/.test(gd)) {
        const md = gd.slice(5, 10)
        list.push({
          date: `${jahrRecurring}-${md}`,
          type: 'geburtstag',
          title: `Geburtstag ${p.name}`,
          id: `geb-${p.id}`,
          personName: p.name,
        })
      }
      if (p.verstorben && p.verstorbenAm?.trim()) {
        const sd = p.verstorbenAm.trim()
        if (/^\d{4}-\d{2}-\d{2}$/.test(sd)) {
          const md = sd.slice(5, 10)
          list.push({
            date: `${jahrRecurring}-${md}`,
            type: 'sterbetag',
            title: `Sterbetag ${p.name}`,
            id: `stb-${p.id}`,
            personName: p.name,
          })
        }
      }
    })
    list.sort((a, b) => a.date.localeCompare(b.date))
    return list
  }, [events, momente, personen, jahrRecurring])

  const heute = todayIsoLocal()

  const { kommend, archiv } = useMemo(() => {
    const k: KalenderEintrag[] = []
    const a: KalenderEintrag[] = []
    eintraege.forEach((e) => {
      if (e.date >= heute) k.push(e)
      else a.push(e)
    })
    k.sort((x, y) => x.date.localeCompare(y.date))
    a.sort((x, y) => y.date.localeCompare(x.date))
    return { kommend: k, archiv: a }
  }, [eintraege, heute])

  const eintraegeAmTag = useMemo(() => {
    const map = new Map<string, KalenderEintrag[]>()
    eintraege.forEach((e) => {
      if (!map.has(e.date)) map.set(e.date, [])
      map.get(e.date)!.push(e)
    })
    return map
  }, [eintraege])

  const geburtstagsNamenAmTag = useMemo(() => {
    const map = new Map<string, string[]>()
    personen.forEach((p) => {
      if (!p.geburtsdatum) return
      const y = viewYear
      for (let d = 1; d <= 31; d++) {
        if (!istGeburtstagAmTag(p.geburtsdatum, viewMonth0, d)) continue
        const iso = isoDateFromParts(y, viewMonth0, d)
        if (!map.has(iso)) map.set(iso, [])
        map.get(iso)!.push(p.name)
      }
    })
    for (const [, arr] of map) arr.sort((a, b) => a.localeCompare(b, 'de'))
    return map
  }, [personen, viewYear, viewMonth0])

  const sterbetagsNamenAmTag = useMemo(() => {
    const map = new Map<string, string[]>()
    personen.forEach((p) => {
      if (!p.verstorben || !p.verstorbenAm?.trim()) return
      const y = viewYear
      for (let d = 1; d <= 31; d++) {
        if (!istJahrestagAmIsoDatum(p.verstorbenAm, viewMonth0, d)) continue
        const iso = isoDateFromParts(y, viewMonth0, d)
        if (!map.has(iso)) map.set(iso, [])
        map.get(iso)!.push(p.name)
      }
    })
    for (const [, arr] of map) arr.sort((a, b) => a.localeCompare(b, 'de'))
    return map
  }, [personen, viewYear, viewMonth0])

  const druckEintraege = useMemo(() => {
    if (druckZeitraum === 'jahr') {
      const p = `${viewYear}-`
      return eintraege.filter((e) => e.date.startsWith(p)).sort((a, b) => a.date.localeCompare(b.date))
    }
    if (druckZeitraum === 'monat') {
      const pref = `${viewYear}-${String(viewMonth0 + 1).padStart(2, '0')}-`
      return eintraege.filter((e) => e.date.startsWith(pref)).sort((a, b) => a.date.localeCompare(b.date))
    }
    const { start, end } = weekRangeMondaySundayContainingMonthFirst(viewYear, viewMonth0)
    return eintraege.filter((e) => e.date >= start && e.date <= end).sort((a, b) => a.date.localeCompare(b.date))
  }, [eintraege, druckZeitraum, viewYear, viewMonth0])

  const druckTitel = useMemo(() => {
    if (druckZeitraum === 'jahr') return `Kalender ${viewYear}`
    if (druckZeitraum === 'monat') return `Kalender ${MONTHS[viewMonth0]} ${viewYear}`
    const { start, end } = weekRangeMondaySundayContainingMonthFirst(viewYear, viewMonth0)
    return `Kalender Woche ${formatIsoDe(start)} – ${formatIsoDe(end)}`
  }, [druckZeitraum, viewYear, viewMonth0])

  const monthCells = useMemo(() => buildMonthDayCells(viewYear, viewMonth0), [viewYear, viewMonth0])

  const shiftMonth = (delta: number) => {
    setViewMonth0((m) => {
      const d = new Date(viewYear, m + delta, 1)
      setViewYear(d.getFullYear())
      return d.getMonth()
    })
  }

  const handleDrucken = () => {
    window.print()
  }

  const r = PROJECT_ROUTES['k2-familie']

  const renderEintragZeile = (e: KalenderEintrag) => (
    <div
      key={e.type + '-' + e.id + '-' + e.date}
      style={{
        padding: '0.45rem 0',
        borderBottom: '1px solid rgba(13,148,136,0.12)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'baseline',
      }}
    >
      <span className="meta" style={{ minWidth: 100 }}>
        {e.date}
      </span>
      {e.type === 'event' ? (
        <>
          <Link to={r.events} className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.9rem' }}>
            {e.title}
          </Link>
          {e.extra && <span className="meta">({e.extra})</span>}
        </>
      ) : e.type === 'moment' ? (
        <>
          <span>{e.title}</span>
          <span className="meta">– {e.personName}</span>
          <Link to={`${r.personen}/${e.personId}`} className="meta">
            → Person
          </Link>
        </>
      ) : e.type === 'geburtstag' ? (
        <>
          <span>🎂 {e.personName}</span>
          <span className="meta">Geburtstag</span>
          <Link to={r.stammbaum} className="meta">
            → Stammbaum
          </Link>
        </>
      ) : (
        <>
          <span>🕯 {e.personName}</span>
          <span className="meta">Sterbetag</span>
          <Link to={r.gedenkort} className="meta">
            → Gedenkort
          </Link>
        </>
      )}
    </div>
  )

  return (
    <div className="mission-wrapper k2-kal-root">
      <style>{`
        .k2-kal-print-only { display: none; }
        @media print {
          .k2-kal-no-print { display: none !important; }
          .k2-kal-print-only { display: block !important; }
          .k2-kal-root { background: #fff !important; }
        }
      `}</style>

      <div className="viewport k2-familie-page k2-kal-no-print">
        <header>
          <div>
            <h1 style={{ marginTop: '0.5rem' }}>Kalender</h1>
            <div className="meta">
              Monatsübersicht, demnächst und Archiv – Events, Momente, Geburtstage und Sterbetage aus den Karten.
            </div>
          </div>
        </header>

        <K2FamilieEventKalenderSubnav />

        <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <h2 className="meta" style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
            Drucken
          </h2>
          <p className="meta" style={{ margin: '0 0 0.65rem', lineHeight: 1.45 }}>
            Bezug: <strong>angezeigter Monat</strong> (Navigation oben). Woche = Montag–Sonntag um den <strong>1. dieses Monats</strong>.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.65rem' }}>
            {(
              [
                { id: 'woche' as const, label: 'Woche' },
                { id: 'monat' as const, label: 'Monat' },
                { id: 'jahr' as const, label: 'Jahr' },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={druckZeitraum === id ? 'btn' : 'btn-outline'}
                style={{ fontSize: '0.88rem', padding: '0.3rem 0.65rem' }}
                onClick={() => setDruckZeitraum(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" className="btn" onClick={handleDrucken}>
            Drucken / PDF
          </button>
        </div>

        <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button type="button" className="btn-outline" onClick={() => shiftMonth(-1)} aria-label="Vorheriger Monat">
              ←
            </button>
            <h2 style={{ margin: 0, fontSize: '1.05rem', flex: '1 1 auto' }}>{formatMonthYearLabel(viewYear, viewMonth0)}</h2>
            <button type="button" className="btn-outline" onClick={() => shiftMonth(1)} aria-label="Nächster Monat">
              →
            </button>
            <button
              type="button"
              className="btn-outline"
              style={{ fontSize: '0.85rem' }}
              onClick={() => {
                const t = new Date()
                setViewYear(t.getFullYear())
                setViewMonth0(t.getMonth())
              }}
            >
              Heute
            </button>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gap: '2px',
              fontSize: '0.75rem',
              color: '#5c5650',
              marginBottom: '4px',
            }}
          >
            {WOCHENTAGE.map((w) => (
              <div key={w} style={{ textAlign: 'center', fontWeight: 600 }}>
                {w}
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gap: '4px',
            }}
          >
            {monthCells.map((cell, idx) => {
              if (cell == null) {
                return <div key={`pad-${idx}`} />
              }
              const iso = isoDateFromParts(viewYear, viewMonth0, cell)
              const items = eintraegeAmTag.get(iso) ?? []
              const geb = geburtstagsNamenAmTag.get(iso) ?? []
              const stb = sterbetagsNamenAmTag.get(iso) ?? []
              const kernItems = items.filter((i) => i.type === 'event' || i.type === 'moment')
              const isToday = iso === heute
              const count = kernItems.length + geb.length + stb.length
              return (
                <div
                  key={iso}
                  style={{
                    minHeight: 72,
                    border: `1px solid ${isToday ? '#0d9488' : 'rgba(13,148,136,0.2)'}`,
                    borderRadius: 6,
                    padding: '4px',
                    background: isToday ? 'rgba(13,148,136,0.08)' : 'rgba(255,254,251,0.9)',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1c1a18' }}>{cell}</div>
                  {count > 0 && (
                    <div style={{ fontSize: '0.68rem', lineHeight: 1.25, color: '#1c1a18', marginTop: 2 }}>
                      {geb.length > 0 && <div>🎂 {geb.join(', ')}</div>}
                      {stb.length > 0 && <div>🕯 {stb.join(', ')}</div>}
                      {kernItems.slice(0, 3).map((e) => (
                        <div key={e.type + e.id} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {e.type === 'event' ? '📌 ' : '📷 '}
                          {e.title}
                        </div>
                      ))}
                      {kernItems.length > 3 && <div className="meta">+{kernItems.length - 3} …</div>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="card familie-card-enter" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Demnächst</h2>
          {kommend.length === 0 ? (
            <p className="meta" style={{ margin: 0 }}>
              Keine anstehenden Einträge mit Datum.
            </p>
          ) : (
            kommend.slice(0, 40).map(renderEintragZeile)
          )}
        </div>

        <details className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#1c1a18' }}>
            Archiv (Vergangenes){archiv.length > 0 ? ` – ${archiv.length} Einträge` : ''}
          </summary>
          <p className="meta" style={{ margin: '0.5rem 0 0.75rem' }}>
            Ältere Events, Momente, vergangene Geburtstage und Sterbetage (nur Anzeige).
          </p>
          {archiv.length === 0 ? (
            <p className="meta" style={{ margin: 0 }}>
              Noch nichts im Archiv.
            </p>
          ) : (
            archiv.map(renderEintragZeile)
          )}
        </details>

        {eintraege.length > 0 && (
          <details className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#1c1a18' }}>
              Alle Einträge nach Monat (Liste)
            </summary>
            {Array.from(new Set(eintraege.map((e) => e.date.slice(0, 7))))
              .sort()
              .map((monthKey) => {
                const items = eintraege.filter((e) => e.date.startsWith(monthKey))
                return (
                  <div key={monthKey} style={{ marginTop: '0.85rem' }}>
                    <h3 style={{ margin: '0 0 0.35rem', fontSize: '0.95rem' }}>
                      {formatMonthYearLabel(Number(monthKey.slice(0, 4)), Number(monthKey.slice(5, 7)) - 1)}
                    </h3>
                    {items.map(renderEintragZeile)}
                  </div>
                )
              })}
          </details>
        )}

        <p className="meta" style={{ marginTop: '0.5rem' }}>
          <Link to={r.events} className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.9rem' }}>
            Events bearbeiten
          </Link>
          {' · '}
          <Link to={r.stammbaum} className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.9rem' }}>
            Stammbaum
          </Link>
        </p>
      </div>

      <div className="k2-kal-print-only" style={{ padding: '12mm 14mm', fontFamily: 'system-ui, sans-serif', color: '#1c1a18' }}>
        <h1 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem' }}>{druckTitel}</h1>
        <p className="seitenfuss" style={{ fontSize: '0.85rem', margin: '0 0 1rem', color: '#5c5650' }}>
          {druckZeitraum === 'woche' && (
            <>
              Woche (Mo–So) mit dem 1. {MONTHS[viewMonth0]} {viewYear}:{' '}
              {formatIsoDe(weekRangeMondaySundayContainingMonthFirst(viewYear, viewMonth0).start)} bis{' '}
              {formatIsoDe(weekRangeMondaySundayContainingMonthFirst(viewYear, viewMonth0).end)}
            </>
          )}
          {druckZeitraum === 'monat' && (
            <>
              Monat: {MONTHS[viewMonth0]} {viewYear} (1.–{lastDayOfMonth(viewYear, viewMonth0)}.)
            </>
          )}
          {druckZeitraum === 'jahr' && <>Jahr: {viewYear}</>}
        </p>
        {druckEintraege.length === 0 ? (
          <p style={{ margin: 0 }}>Keine Einträge in diesem Zeitraum.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.92rem', lineHeight: 1.55 }}>
            {druckEintraege.map((e) => (
              <li key={`${e.type}-${e.id}-${e.date}`} style={{ marginBottom: '0.35rem' }}>
                <strong>{formatIsoDe(e.date)}</strong> – {formatEintragDruckzeile(e)}
              </li>
            ))}
          </ul>
        )}
        <p style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: '#5c5650' }}>
          K2 Familie – Kalender · Geburtstage und Sterbetage aus den Personenkarten (verstorben, Sterbedatum).
        </p>
      </div>
    </div>
  )
}
