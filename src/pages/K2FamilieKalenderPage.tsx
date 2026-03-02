/**
 * K2 Familie – Kalender/Übersicht (Phase 3.3). Events + Momente nach Datum.
 * Route: /projects/k2-familie/kalender
 */

import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { loadEvents, loadMomente, loadPersonen } from '../utils/familieStorage'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import type { K2FamilieEvent, K2FamilieMoment } from '../types/k2Familie'

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

type KalenderEintrag = { date: string; type: 'event'; title: string; id: string; extra?: string } | { date: string; type: 'moment'; title: string; id: string; personId: string; personName: string }

function formatMonthYear(dateStr: string): string {
  const [y, m] = dateStr.slice(0, 7).split('-').map(Number)
  return `${MONTHS[(m ?? 1) - 1]} ${y ?? ''}`
}

export default function K2FamilieKalenderPage() {
  const { currentTenantId } = useFamilieTenant()
  const personen = useMemo(() => loadPersonen(currentTenantId), [currentTenantId])
  const events = useMemo(() => loadEvents(currentTenantId), [currentTenantId])
  const momente = useMemo(() => loadMomente(currentTenantId), [currentTenantId])

  const getPersonName = (personId: string) => personen.find((p) => p.id === personId)?.name ?? personId

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
    list.sort((a, b) => a.date.localeCompare(b.date))
    return list
  }, [events, momente, personen])

  const byMonth = useMemo(() => {
    const map = new Map<string, KalenderEintrag[]>()
    eintraege.forEach((e) => {
      const key = e.date.slice(0, 7)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    })
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [eintraege])

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page">
        <header>
          <div>
            <Link to={PROJECT_ROUTES['k2-familie'].home} className="meta">← K2 Familie</Link>
            <h1 style={{ marginTop: '0.5rem' }}>Kalender & Übersicht</h1>
            <div className="meta">Alle Events und Momente nach Datum – gebündelt.</div>
          </div>
        </header>

        {eintraege.length === 0 ? (
          <div className="card">
            <p className="meta" style={{ margin: 0, fontStyle: 'italic' }}>Noch keine Einträge mit Datum. Events und Momente (mit Datum) erscheinen hier.</p>
          </div>
        ) : (
          byMonth.map(([monthKey, items]) => (
            <div key={monthKey} className="card" style={{ marginBottom: '1rem' }}>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>{formatMonthYear(monthKey + '-01')}</h2>
              {items.map((e) => (
                <div key={e.type + '-' + e.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(13,148,136,0.15)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'baseline' }}>
                  <span className="meta" style={{ minWidth: 100 }}>{e.date}</span>
                  {e.type === 'event' ? (
                    <>
                      <Link to={PROJECT_ROUTES['k2-familie'].events} className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.9rem' }}>{e.title}</Link>
                      {e.extra && <span className="meta">({e.extra})</span>}
                    </>
                  ) : (
                    <>
                      <span>{e.title}</span>
                      <span className="meta">– {e.personName}</span>
                      <Link to={`${PROJECT_ROUTES['k2-familie'].personen}/${e.personId}`} className="meta">→ Person</Link>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))
        )}

        <p className="meta" style={{ marginTop: '1.5rem' }}>
          <Link to={PROJECT_ROUTES['k2-familie'].events} className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.9rem' }}>Events bearbeiten</Link>
          {' · '}
          <Link to={PROJECT_ROUTES['k2-familie'].stammbaum} className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.9rem' }}>Stammbaum</Link>
        </p>
      </div>
    </div>
  )
}
