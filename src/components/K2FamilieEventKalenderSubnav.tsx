/**
 * K2 Familie – Schnellwechsel Events ↔ Kalender (gleiche Themenzeile).
 */

import { Link, useLocation } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

const r = PROJECT_ROUTES['k2-familie']

export function K2FamilieEventKalenderSubnav() {
  const { pathname } = useLocation()
  const onEvents = pathname === r.events || pathname === r.events + '/'
  const onKalender = pathname === r.kalender || pathname === r.kalender + '/'

  return (
    <div
      className="k2-familie-no-print"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.4rem',
        marginBottom: '1rem',
        alignItems: 'center',
      }}
      role="navigation"
      aria-label="Events und Kalender"
    >
      <Link
        to={r.events}
        className={onEvents ? 'btn' : 'btn-outline'}
        style={{ fontSize: '0.88rem', padding: '0.35rem 0.75rem' }}
      >
        Events verwalten
      </Link>
      <Link
        to={r.kalender}
        className={onKalender ? 'btn' : 'btn-outline'}
        style={{ fontSize: '0.88rem', padding: '0.35rem 0.75rem' }}
      >
        Kalender-Ansicht
      </Link>
    </div>
  )
}
