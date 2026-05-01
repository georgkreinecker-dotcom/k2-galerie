/**
 * Kurz-Ansicht auf der langen mök2-Marketing-Seite + gleicher Anker fürs PDF-Druck.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../../config/navigation'
import {
  loadMok2Werbefahrplan,
  MOK2_WERBEFAHRPLAN_UPDATED_EVENT,
  type Mok2WerbeKampagne,
} from '../../utils/werbefahrplanMok2Storage'

function formatDeShort(iso: string): string {
  if (!iso?.trim()) return '–'
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function Mok2WerbefahrplanTeaser() {
  const [rows, setRows] = useState<Mok2WerbeKampagne[]>(() => loadMok2Werbefahrplan())

  useEffect(() => {
    const reload = () => setRows(loadMok2Werbefahrplan())
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'k2-mok2-werbefahrplan') reload()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener(MOK2_WERBEFAHRPLAN_UPDATED_EVENT, reload)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(MOK2_WERBEFAHRPLAN_UPDATED_EVENT, reload)
    }
  }, [])

  const workplace = PROJECT_ROUTES['k2-galerie'].werbefahrplan

  return (
    <>
      <p style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.55 }}>
        Für die <strong>Arbeitsfläche</strong> mit Karten-Übersicht und Editor:{' '}
        <Link to={workplace} style={{ color: '#5ffbf1', fontWeight: 700 }}>
          Werbefahrplan öffnen →
        </Link>
        {' '}(gleicher Speicher). Zum Abgleich mit Besucherzahlen{' '}
        <Link to="/mission-control" style={{ color: '#5ffbf1', fontWeight: 600 }}>
          Mission Control
        </Link>
        .
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.6rem',
          marginBottom: '0.75rem',
        }}
      >
        {rows.map((k) => (
          <div
            key={k.id}
            style={{
              padding: '0.65rem 0.75rem',
              borderRadius: 8,
              border: '1px solid rgba(95,251,241,0.22)',
              background: 'rgba(15,28,32,0.45)',
              fontSize: '0.82rem',
            }}
          >
            <div style={{ fontWeight: 600, color: '#fff5f0', marginBottom: '0.25rem' }}>{k.titel?.trim() || 'Ohne Titel'}</div>
            <div style={{ color: '#86efac', fontSize: '0.78rem' }}>
              {formatDeShort(k.vonISO)} – {formatDeShort(k.bisISO)}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
