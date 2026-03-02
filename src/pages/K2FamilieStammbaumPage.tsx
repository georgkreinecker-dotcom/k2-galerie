/**
 * K2 Familie – Stammbaum (Liste). Phase 2.1.
 * Route: /projects/k2-familie/stammbaum
 */

import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { loadPersonen, savePersonen, K2_FAMILIE_DEFAULT_TENANT } from '../utils/familieStorage'
import { getFamilieTenantDisplayName } from '../data/familieHuberMuster'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import type { K2FamiliePerson } from '../types/k2Familie'
import { useMemo } from 'react'

function generateId(): string {
  return 'person-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

export default function K2FamilieStammbaumPage() {
  const navigate = useNavigate()
  const { currentTenantId, tenantList, setCurrentTenantId, addTenant } = useFamilieTenant()
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

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page">
        <header>
          <div>
            <div className="familie-toolbar" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Link to={PROJECT_ROUTES['k2-familie'].home} className="meta">← K2 Familie</Link>
              <span className="meta">Familie:</span>
              <select value={currentTenantId} onChange={(e) => setCurrentTenantId(e.target.value)}>
                {tenantList.map((id) => (
                  <option key={id} value={id}>{getFamilieTenantDisplayName(id, 'Standard')}</option>
                ))}
              </select>
              <button type="button" className="btn-outline" onClick={() => addTenant()}>Neue Familie</button>
            </div>
            <h1>Stammbaum</h1>
            <div className="meta">Alle Personen – Klick öffnet die Seite der Person.</div>
          </div>
        </header>

        {personen.length === 0 && (
          <div className="card">
            <p className="meta" style={{ fontStyle: 'italic', margin: 0 }}>Noch keine Personen. „Person hinzufügen“ drücken.</p>
          </div>
        )}

        <div className="grid">
          {personen.map((p) => (
            <Link key={p.id} to={`${PROJECT_ROUTES['k2-familie'].personen}/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {p.photo ? (
                  <img src={p.photo} alt="" className="person-photo" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(13,148,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>👤</div>
                )}
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, fontSize: '1rem' }}>{p.name}</h2>
                  {p.shortText && <p className="meta" style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>{p.shortText.slice(0, 80)}{p.shortText.length > 80 ? '…' : ''}</p>}
                </div>
                <span className="meta">→</span>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button type="button" className="btn" onClick={addPerson}>＋ Person hinzufügen</button>
        </div>
      </div>
    </div>
  )
}
