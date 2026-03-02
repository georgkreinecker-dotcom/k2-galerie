/**
 * K2 Familie – Kalender/Übersicht (Phase 3.3). Events + Momente nach Datum.
 * Route: /projects/k2-familie/kalender
 */

import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { PROJECT_ROUTES } from '../config/navigation'
import { loadEvents, loadMomente, loadPersonen } from '../utils/familieStorage'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import type { K2FamilieEvent, K2FamilieMoment } from '../types/k2Familie'

const STYLE = {
  page: { minHeight: '100vh', background: '#1a0f0a', color: '#fff5f0', padding: 'clamp(1.5rem, 4vw, 2.5rem)', maxWidth: 720, margin: '0 auto', fontFamily: 'system-ui, sans-serif' } as const,
  link: { color: '#14b8a6', textDecoration: 'none', fontSize: '0.95rem' },
  h1: { fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', margin: '0 0 0.5rem', color: '#14b8a6' },
  monthBlock: { marginBottom: '1.5rem' },
  monthTitle: { fontSize: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', paddingBottom: '0.25rem', borderBottom: '1px solid rgba(13,148,136,0.3)' },
  row: { padding: '0.5rem 0', borderBottom: '1px solid rgba(13,148,136,0.15)', display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem', alignItems: 'baseline' },
  date: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', minWidth: 100 },
  label: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginLeft: '0.25rem' },
}

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
    <div style={STYLE.page}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={PROJECT_ROUTES['k2-familie'].home} style={STYLE.link}>← K2 Familie</Link>
      </div>

      <h1 style={STYLE.h1}>Kalender & Übersicht</h1>
      <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
        Alle Events und Momente nach Datum – gebündelt.
      </p>

      {eintraege.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
          Noch keine Einträge mit Datum. Events und Momente (mit Datum) erscheinen hier.
        </p>
      ) : (
        byMonth.map(([monthKey, items]) => (
          <div key={monthKey} style={STYLE.monthBlock}>
            <div style={STYLE.monthTitle}>{formatMonthYear(monthKey + '-01')}</div>
            {items.map((e) => (
              <div key={e.type + '-' + e.id} style={STYLE.row}>
                <span style={STYLE.date}>{e.date}</span>
                {e.type === 'event' ? (
                  <>
                    <Link to={PROJECT_ROUTES['k2-familie'].events} style={STYLE.link}>{e.title}</Link>
                    {e.extra && <span style={STYLE.label}>({e.extra})</span>}
                  </>
                ) : (
                  <>
                    <span style={{ color: '#fff5f0' }}>{e.title}</span>
                    <span style={STYLE.label}>– {e.personName}</span>
                    <Link to={`${PROJECT_ROUTES['k2-familie'].personen}/${e.personId}`} style={{ ...STYLE.link, fontSize: '0.85rem' }}>→ Person</Link>
                  </>
                )}
              </div>
            ))}
          </div>
        ))
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
        <Link to={PROJECT_ROUTES['k2-familie'].events} style={STYLE.link}>Events bearbeiten</Link>
        {' · '}
        <Link to={PROJECT_ROUTES['k2-familie'].stammbaum} style={STYLE.link}>Stammbaum</Link>
      </p>
    </div>
  )
}
