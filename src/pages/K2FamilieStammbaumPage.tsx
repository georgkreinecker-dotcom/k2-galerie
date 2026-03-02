/**
 * K2 Familie – Stammbaum (Liste). Phase 2.1.
 * Route: /projects/k2-familie/stammbaum
 */

import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMemo, useEffect, useCallback, useState } from 'react'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { loadPersonen, savePersonen, K2_FAMILIE_DEFAULT_TENANT } from '../utils/familieStorage'
import { getFamilieTenantDisplayName } from '../data/familieHuberMuster'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import type { K2FamiliePerson } from '../types/k2Familie'
import FamilyTreeGraph from '../components/FamilyTreeGraph'

function generateId(): string {
  return 'person-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

type PrintFormat = 'a4' | 'a3' | 'poster'
type PrintFotos = '1' | '0'

export default function K2FamilieStammbaumPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentTenantId, tenantList, setCurrentTenantId, addTenant } = useFamilieTenant()
  const personen = useMemo(() => loadPersonen(currentTenantId), [currentTenantId])

  const druck = searchParams.get('druck') === '1'
  const formatFromUrl = (searchParams.get('format') as PrintFormat) || 'a4'
  const fotosFromUrl = (searchParams.get('fotos') as PrintFotos) || '1'
  const titelFromUrl = searchParams.get('titel') || getFamilieTenantDisplayName(currentTenantId, 'Familie')
  const format = druck ? formatFromUrl : (searchParams.get('format') as PrintFormat) || 'a4'
  const fotos = druck ? fotosFromUrl : (searchParams.get('fotos') as PrintFotos) || '1'
  const titel = druck ? titelFromUrl : (searchParams.get('titel') || getFamilieTenantDisplayName(currentTenantId, 'Familie'))

  const [druckFormat, setDruckFormat] = useState<PrintFormat>(formatFromUrl)
  const [druckFotos, setDruckFotos] = useState<PrintFotos>(fotosFromUrl)
  const [druckTitel, setDruckTitel] = useState(titelFromUrl)

  useEffect(() => {
    if (!druck || personen.length === 0) return
    const t = setTimeout(() => window.print(), 300)
    return () => clearTimeout(t)
  }, [druck, personen.length])

  const handleAfterPrint = useCallback(() => {
    if (druck) setSearchParams({}, { replace: true })
  }, [druck, setSearchParams])

  useEffect(() => {
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [handleAfterPrint])

  const openDruck = (opts: { format: PrintFormat; fotos: PrintFotos; titel?: string }) => {
    const p = new URLSearchParams()
    p.set('druck', '1')
    p.set('format', opts.format)
    p.set('fotos', opts.fotos)
    if (opts.titel?.trim()) p.set('titel', opts.titel.trim())
    setSearchParams(p)
  }

  const printScale = format === 'poster' ? 1.5 : format === 'a3' ? 1.2 : 1

  if (druck && personen.length > 0) {
    return (
      <div className="stammbaum-druck-view">
        <h1 className="stammbaum-druck-titel">{titel}</h1>
        <FamilyTreeGraph
          personen={personen}
          personPathPrefix={PROJECT_ROUTES['k2-familie'].personen}
          printMode
          noPhotos={fotos === '0'}
          scale={printScale}
        />
      </div>
    )
  }

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
          <>
            <div className="card familie-card-enter" style={{ padding: '1rem', overflow: 'hidden' }}>
              <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>Stammbaum</h2>
              <FamilyTreeGraph personen={personen} personPathPrefix={PROJECT_ROUTES['k2-familie'].personen} />
            </div>
            <section className="card familie-card-enter" style={{ padding: '1rem', marginTop: '1rem' }} aria-label="Druckvorlagen">
              <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>Als Plakat drucken</h2>
              <p className="meta" style={{ marginBottom: '1rem' }}>Format und Darstellung wählen, dann Drucken – die Grafik öffnet sich druckoptimiert.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="meta">Format</span>
                  <select
                    id="druck-format"
                    value={druckFormat}
                    onChange={(e) => setDruckFormat(e.target.value as PrintFormat)}
                  >
                    <option value="a4">A4</option>
                    <option value="a3">A3</option>
                    <option value="poster">Poster (größer)</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="meta">Darstellung</span>
                  <select
                    id="druck-fotos"
                    value={druckFotos}
                    onChange={(e) => setDruckFotos(e.target.value as PrintFotos)}
                  >
                    <option value="1">Mit Fotos</option>
                    <option value="0">Nur Namen (sparsam)</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="meta">Titel (optional)</span>
                  <input
                    type="text"
                    id="druck-titel"
                    placeholder={getFamilieTenantDisplayName(currentTenantId, 'Familie')}
                    value={druckTitel}
                    onChange={(e) => setDruckTitel(e.target.value)}
                    style={{ minWidth: 160 }}
                  />
                </label>
                <button type="button" className="btn" onClick={() => openDruck({ format: druckFormat, fotos: druckFotos, titel: druckTitel || undefined })}>
                  Druckvorschau &amp; Drucken
                </button>
              </div>
            </section>
          </>
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
