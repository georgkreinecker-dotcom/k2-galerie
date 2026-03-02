/**
 * K2 Familie – Stammbaum (Liste). Phase 2.1.
 * Route: /projects/k2-familie/stammbaum
 */

import { Link, useNavigate } from 'react-router-dom'
import { PROJECT_ROUTES, PLATFORM_ROUTES } from '../config/navigation'
import { loadPersonen, savePersonen, K2_FAMILIE_DEFAULT_TENANT } from '../utils/familieStorage'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import type { K2FamiliePerson } from '../types/k2Familie'
import { useMemo } from 'react'

const STYLE = {
  page: { minHeight: '100vh', background: '#1a0f0a', color: '#fff5f0', padding: 'clamp(1.5rem, 4vw, 2.5rem)', maxWidth: 720, margin: '0 auto', fontFamily: 'system-ui, sans-serif' } as const,
  link: { color: '#14b8a6', textDecoration: 'none', fontSize: '0.95rem' },
  h1: { fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', margin: '0 0 1rem', color: '#14b8a6' },
  card: { background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.4)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' },
  btn: { padding: '0.75rem 1.25rem', background: 'rgba(13,148,136,0.3)', color: '#14b8a6', border: '1px solid rgba(13,148,136,0.6)', borderRadius: 10, fontWeight: 600, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit' },
}

function generateId(): string {
  return 'person-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

export default function K2FamilieStammbaumPage() {
  const navigate = useNavigate()
  const { currentTenantId } = useFamilieTenant()
  const personen = useMemo(() => loadPersonen(currentTenantId), [currentTenantId])

  const addPerson = () => {
    const neu: K2FamiliePerson = {
      id: generateId(),
      name: 'Neue Person',
      parentIds: [],
      childIds: [],
      partners: [],
      siblingIds: [],
      wahlfamilieIds: [],
    }
    const next = [...personen, neu]
    if (!savePersonen(currentTenantId, next, { allowReduce: false })) return
    navigate(`${PROJECT_ROUTES['k2-familie'].personen}/${neu.id}`)
  }

  const { tenantList, setCurrentTenantId, addTenant } = useFamilieTenant()

  return (
    <div style={STYLE.page}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
        <Link to={PROJECT_ROUTES['k2-familie'].home} style={STYLE.link}>← K2 Familie</Link>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Familie:</span>
        <select value={currentTenantId} onChange={(e) => setCurrentTenantId(e.target.value)} style={{ padding: '0.3rem 0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(13,148,136,0.5)', borderRadius: 6, color: '#fff5f0', fontSize: '0.85rem' }}>
          {tenantList.map((id) => (
            <option key={id} value={id}>{id === K2_FAMILIE_DEFAULT_TENANT ? 'Standard' : id}</option>
          ))}
        </select>
        <button type="button" onClick={() => addTenant()} style={{ padding: '0.3rem 0.6rem', background: 'rgba(13,148,136,0.2)', color: '#14b8a6', border: '1px solid rgba(13,148,136,0.45)', borderRadius: 6, fontSize: '0.85rem', cursor: 'pointer' }}>Neue Familie</button>
      </div>

      <h1 style={STYLE.h1}>Stammbaum</h1>
      <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
        Alle Personen – Klick öffnet die Seite der Person.
      </p>

      {personen.length === 0 && (
        <p style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
          Noch keine Personen. „Person hinzufügen“ drücken.
        </p>
      )}

      {personen.map((p) => (
        <Link
          key={p.id}
          to={`${PROJECT_ROUTES['k2-familie'].personen}/${p.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div style={STYLE.card}>
            {p.photo ? (
              <img src={p.photo} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(13,148,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>👤</div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#fff5f0' }}>{p.name}</div>
              {p.shortText && <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', marginTop: '0.25rem' }}>{p.shortText.slice(0, 80)}{p.shortText.length > 80 ? '…' : ''}</div>}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>→</span>
          </div>
        </Link>
      ))}

      <button type="button" onClick={addPerson} style={{ ...STYLE.btn, marginTop: '1rem' }}>
        ＋ Person hinzufügen
      </button>
    </div>
  )
}
