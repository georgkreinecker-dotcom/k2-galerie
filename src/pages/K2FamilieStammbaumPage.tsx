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
import FamilyTreeGraph from '../components/FamilyTreeGraph'

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
            <div className="meta">Grafik der Familienstruktur – Klick auf eine Person öffnet ihre Seite. Darunter: alle Personen als Kacheln.</div>
          </div>
        </header>

        {personen.length > 0 && (
          <div className="card familie-card-enter" style={{ padding: '1rem', overflow: 'hidden' }}>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>Stammbaum</h2>
            <FamilyTreeGraph personen={personen} personPathPrefix={PROJECT_ROUTES['k2-familie'].personen} />
          </div>
        )}

        {personen.length === 0 && (
          <div className="card familie-card-enter" style={{ animationDelay: '0s' }}>
            <p className="meta" style={{ fontStyle: 'italic', margin: 0 }}>Noch keine Personen. „Person hinzufügen“ drücken.</p>
          </div>
        )}

        <div className="k2-familie-stammbaum-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {personen.map((p, i) => (
            <Link
              key={p.id}
              to={`${PROJECT_ROUTES['k2-familie'].personen}/${p.id}`}
              className="familie-card-enter"
              style={{ textDecoration: 'none', color: 'inherit', animationDelay: `${i * 0.06}s` }}
            >
              <div className="card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                {p.photo ? (
                  <img
                    src={p.photo}
                    alt=""
                    className="person-photo"
                    style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(20,184,166,0.4)' }}
                  />
                ) : (
                  <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(13,148,136,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', border: '3px solid rgba(20,184,166,0.3)' }}>👤</div>
                )}
                <div style={{ width: '100%' }}>
                  <h2 style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.2 }}>{p.name}</h2>
                  {p.shortText && <p className="meta" style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', lineHeight: 1.4 }}>{p.shortText.slice(0, 70)}{p.shortText.length > 70 ? '…' : ''}</p>}
                </div>
                <span className="meta" style={{ fontSize: '0.9rem', opacity: 0.8 }}>→ ansehen</span>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <button type="button" className="btn" onClick={addPerson}>＋ Person hinzufügen</button>
        </div>
      </div>
    </div>
  )
}
