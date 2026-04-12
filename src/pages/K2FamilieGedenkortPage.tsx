/**
 * K2 Familie – Gedenkort „Die uns vorausgegangen sind“ (Phase 5).
 * Zeigt verstorbene Personen + Gaben (Blume, Kerze, Text, Foto) mit Sichtbarkeit privat/öffentlich.
 * Route: /projects/k2-familie/gedenkort
 * Siehe docs/K2-FAMILIE-GEDENKORT.md
 */

import { Link } from 'react-router-dom'
import { useMemo, useState, useCallback, useEffect } from 'react'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { loadPersonen, loadGaben, saveGaben } from '../utils/familieStorage'
import { getAktuellesPersonenFoto } from '../utils/familiePersonFotos'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import type { K2FamilieGabe } from '../types/k2Familie'

const GEDENKORT_USER_KEY = 'k2-familie-gedenkort-user-id'

function getOrCreateGedenkortUserId(): string {
  let id = sessionStorage.getItem(GEDENKORT_USER_KEY)
  if (!id) {
    id = 'g-' + Date.now() + '-' + Math.random().toString(36).slice(2, 11)
    sessionStorage.setItem(GEDENKORT_USER_KEY, id)
  }
  return id
}

function gabeLabel(type: K2FamilieGabe['type']): string {
  switch (type) {
    case 'blume': return 'Blume'
    case 'kerze': return 'Kerze'
    case 'text': return 'Text'
    case 'foto': return 'Foto'
    default: return type
  }
}

function gabeIcon(type: K2FamilieGabe['type']): string {
  switch (type) {
    case 'blume': return '🌸'
    case 'kerze': return '🕯️'
    case 'text': return '💬'
    case 'foto': return '📷'
    default: return '•'
  }
}

const C = {
  text: 'rgba(255,255,255,0.92)',
  textSoft: 'rgba(255,255,255,0.6)',
  accent: '#14b8a6',
  border: 'rgba(13,148,136,0.35)',
}

export default function K2FamilieGedenkortPage() {
  const { currentTenantId } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const kannOrganisch = capabilities.canEditOrganisches
  const myUserId = useMemo(() => getOrCreateGedenkortUserId(), [])
  const personen = useMemo(() => loadPersonen(currentTenantId), [currentTenantId])
  const verstorbene = useMemo(
    () => personen.filter((p) => p.verstorben === true),
    [personen]
  )
  const [gaben, setGaben] = useState<K2FamilieGabe[]>(() => loadGaben(currentTenantId))
  useEffect(() => {
    setGaben(loadGaben(currentTenantId))
  }, [currentTenantId])
  const [modal, setModal] = useState<{ personId: string; personName: string; type: K2FamilieGabe['type'] } | null>(null)
  const [content, setContent] = useState('')
  const [sichtbarkeit, setSichtbarkeit] = useState<'privat' | 'oeffentlich'>('oeffentlich')
  const [oeffentlichName, setOeffentlichName] = useState('')

  const gabenFuerPerson = useCallback((personId: string) => {
    return gaben.filter((g) => g.personId === personId && (g.sichtbarkeit === 'oeffentlich' || (g.sichtbarkeit === 'privat' && g.createdBy === myUserId)))
  }, [gaben, myUserId])

  const addGabe = () => {
    if (!modal || !kannOrganisch) return
    const now = new Date().toISOString()
    const neu: K2FamilieGabe = {
      id: 'gabe-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9),
      personId: modal.personId,
      type: modal.type,
      content: content.trim() || undefined,
      createdBy: sichtbarkeit === 'privat' ? myUserId : (oeffentlichName.trim() || undefined),
      createdAt: now,
      sichtbarkeit,
    }
    const next = [...gaben, neu]
    if (saveGaben(currentTenantId, next)) {
      setGaben(next)
      setModal(null)
      setContent('')
      setOeffentlichName('')
      setSichtbarkeit('oeffentlich')
    }
  }

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page">
        <header>
          <div>
            <h1 style={{ marginTop: '0.5rem' }}>Gedenkort</h1>
            <p className="meta" style={{ marginTop: '0.35rem' }}>
              Die uns vorausgegangen sind – ein Ort der Erinnerung. Leise und würdig.
            </p>
          </div>
        </header>

        {verstorbene.length === 0 ? (
          <div className="card" style={{ padding: '1.5rem', borderLeft: `4px solid ${C.border}` }}>
            <p style={{ margin: 0, color: C.textSoft }}>
              Noch keine verstorbenen Personen angelegt. Im Stammbaum kannst du bei einer Person „verstorben“ setzen; dann erscheint sie hier.
            </p>
            <Link to={PROJECT_ROUTES['k2-familie'].stammbaum} className="btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
              → Stammbaum
            </Link>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {verstorbene.map((p) => {
              const personGaben = gabenFuerPerson(p.id)
              const fotoAktuell = getAktuellesPersonenFoto(p)
              return (
                <li key={p.id} className="card" style={{ marginBottom: '1rem', borderLeft: `4px solid ${C.accent}` }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    {fotoAktuell && (
                      <img
                        src={fotoAktuell}
                        alt=""
                        style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h2 style={{ margin: 0, fontSize: '1.1rem', color: C.text }}>{p.name}</h2>
                      {p.verstorbenAm && (
                        <span className="meta" style={{ display: 'block', marginTop: '0.25rem' }}>
                          † {p.verstorbenAm}
                        </span>
                      )}
                      {p.shortText && (
                        <p className="meta" style={{ marginTop: '0.5rem' }}>{p.shortText}</p>
                      )}
                      <Link
                        to={`${PROJECT_ROUTES['k2-familie'].personen}/${p.id}`}
                        className="meta"
                        style={{ display: 'inline-block', marginTop: '0.5rem', color: C.accent }}
                      >
                        → Person im Stammbaum
                      </Link>
                    </div>
                  </div>

                  {personGaben.length > 0 && (
                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: `1px solid ${C.border}` }}>
                      <p className="meta" style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}>Hinterlassen:</p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {personGaben.map((g) => (
                          <li key={g.id} style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: C.textSoft }}>
                            <span style={{ marginRight: '0.35rem' }}>{gabeIcon(g.type)}</span>
                            {g.sichtbarkeit === 'privat' ? (
                              <span className="meta">Persönlicher Eintrag</span>
                            ) : (
                              <span>von {g.createdBy || 'Anonym'}</span>
                            )}
                            {g.content && <span> – {g.content}</span>}
                            {g.imageUrl && <span> 📷</span>}
                            <span className="meta" style={{ marginLeft: '0.35rem' }}>{g.createdAt.slice(0, 10)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {(['blume', 'kerze', 'text', 'foto'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        className="btn-outline"
                        disabled={!kannOrganisch}
                        title={!kannOrganisch ? 'Nur Inhaber:in und Bearbeiter:in können Gaben hinterlegen.' : undefined}
                        onClick={() => {
                        if (!kannOrganisch) return
                        setContent('')
                        setSichtbarkeit('oeffentlich')
                        setOeffentlichName('')
                        setModal({ personId: p.id, personName: p.name, type })
                      }}
                        style={{ fontSize: '0.85rem', padding: '0.35rem 0.6rem' }}
                      >
                        {gabeIcon(type)} {gabeLabel(type)} hinterlassen
                      </button>
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {modal && (
          <div className="card" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100, minWidth: 280, maxWidth: 420, padding: '1.25rem', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>{gabeIcon(modal.type)} {gabeLabel(modal.type)} – {modal.personName}</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Optional: kurzer Text"
              rows={3}
              style={{ width: '100%', marginBottom: '0.75rem', resize: 'vertical' }}
            />
            <div style={{ marginBottom: '0.75rem' }}>
              <label className="meta" style={{ display: 'block', marginBottom: '0.35rem' }}>Sichtbarkeit</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <input type="radio" name="sichtbarkeit" checked={sichtbarkeit === 'privat'} onChange={() => setSichtbarkeit('privat')} disabled={!kannOrganisch} />
                <span>Nur für mich sichtbar (persönlicher Eintrag)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" name="sichtbarkeit" checked={sichtbarkeit === 'oeffentlich'} onChange={() => setSichtbarkeit('oeffentlich')} disabled={!kannOrganisch} />
                <span>Für die Familie sichtbar</span>
              </label>
            </div>
            {sichtbarkeit === 'oeffentlich' && (
              <div style={{ marginBottom: '0.75rem' }}>
                <label className="meta" style={{ display: 'block', marginBottom: '0.25rem' }}>Name (optional, sonst „Anonym“)</label>
                <input type="text" value={oeffentlichName} onChange={(e) => setOeffentlichName(e.target.value)} placeholder="Anonym" disabled={!kannOrganisch} style={{ width: '100%' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-outline" onClick={() => { setModal(null); setContent(''); setOeffentlichName(''); setSichtbarkeit('oeffentlich'); }}>Abbrechen</button>
              <button type="button" className="btn" disabled={!kannOrganisch} onClick={addGabe}>Hinterlassen</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
