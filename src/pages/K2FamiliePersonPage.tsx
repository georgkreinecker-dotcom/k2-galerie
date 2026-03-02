/**
 * K2 Familie – Personen-Seite. Phase 2.2, 2.3.
 * Route: /projects/k2-familie/personen/:id
 */

import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { PROJECT_ROUTES } from '../config/navigation'
import { loadPersonen, savePersonen, K2_FAMILIE_DEFAULT_TENANT } from '../utils/familieStorage'
import type { K2FamiliePerson } from '../types/k2Familie'

const STYLE = {
  page: { minHeight: '100vh', background: '#1a0f0a', color: '#fff5f0', padding: 'clamp(1.5rem, 4vw, 2.5rem)', maxWidth: 720, margin: '0 auto', fontFamily: 'system-ui, sans-serif' } as const,
  link: { color: '#14b8a6', textDecoration: 'none', fontSize: '0.95rem' },
  h1: { fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', margin: '0 0 0.5rem', color: '#14b8a6' },
  section: { marginTop: '1.5rem', padding: '1rem 0', borderTop: '1px solid rgba(13,148,136,0.3)' },
  label: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.35rem' },
  input: { width: '100%', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(13,148,136,0.4)', borderRadius: 8, color: '#fff5f0', fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box' as const },
  btn: { padding: '0.5rem 1rem', background: 'rgba(13,148,136,0.3)', color: '#14b8a6', border: '1px solid rgba(13,148,136,0.6)', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: '0.5rem' },
}

export default function K2FamiliePersonPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [personen, setPersonen] = useState<K2FamiliePerson[]>(() => loadPersonen(K2_FAMILIE_DEFAULT_TENANT))
  const [edit, setEdit] = useState(false)
  const [name, setName] = useState('')
  const [shortText, setShortText] = useState('')

  useEffect(() => {
    setPersonen(loadPersonen(K2_FAMILIE_DEFAULT_TENANT))
  }, [id])

  const person = personen.find((p) => p.id === id)

  useEffect(() => {
    if (person) {
      setName(person.name)
      setShortText(person.shortText ?? '')
    }
  }, [person])

  const save = () => {
    if (!person) return
    const updated: K2FamiliePerson = {
      ...person,
      name: name.trim() || person.name,
      shortText: shortText.trim() || undefined,
      updatedAt: new Date().toISOString(),
    }
    const next = personen.map((p) => (p.id === id ? updated : p))
    if (savePersonen(K2_FAMILIE_DEFAULT_TENANT, next, { allowReduce: false })) {
      setPersonen(next)
      setEdit(false)
    }
  }

  const getPersonName = (personId: string) => personen.find((p) => p.id === personId)?.name ?? personId

  if (!id) {
    return (
      <div style={STYLE.page}>
        <Link to={PROJECT_ROUTES['k2-familie'].stammbaum} style={STYLE.link}>← Stammbaum</Link>
        <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.7)' }}>Person nicht gefunden.</p>
      </div>
    )
  }

  if (!person) {
    return (
      <div style={STYLE.page}>
        <Link to={PROJECT_ROUTES['k2-familie'].stammbaum} style={STYLE.link}>← Stammbaum</Link>
        <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.7)' }}>Person mit dieser ID nicht gefunden.</p>
      </div>
    )
  }

  return (
    <div style={STYLE.page}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={PROJECT_ROUTES['k2-familie'].stammbaum} style={STYLE.link}>← Stammbaum</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
        {person.photo ? (
          <img src={person.photo} alt="" style={{ width: 120, height: 120, borderRadius: 12, objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 120, height: 120, borderRadius: 12, background: 'rgba(13,148,136,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>👤</div>
        )}
        <div style={{ flex: 1, minWidth: 200 }}>
          {edit ? (
            <>
              <div style={STYLE.label}>Name</div>
              <input value={name} onChange={(e) => setName(e.target.value)} style={STYLE.input} placeholder="Name" />
              <div style={{ ...STYLE.label, marginTop: '0.75rem' }}>Kurztext</div>
              <textarea value={shortText} onChange={(e) => setShortText(e.target.value)} style={{ ...STYLE.input, minHeight: 80 }} placeholder="Kurz beschreiben (optional)" />
              <button type="button" onClick={save} style={STYLE.btn}>Speichern</button>
              <button type="button" onClick={() => { setEdit(false); setName(person.name); setShortText(person.shortText ?? ''); }} style={{ ...STYLE.btn, marginLeft: '0.5rem', background: 'transparent' }}>Abbrechen</button>
            </>
          ) : (
            <>
              <h1 style={STYLE.h1}>{person.name}</h1>
              {person.shortText && <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{person.shortText}</p>}
              <button type="button" onClick={() => setEdit(true)} style={{ ...STYLE.btn, marginTop: '0.75rem' }}>Name & Text bearbeiten</button>
            </>
          )}
        </div>
      </div>

      <section style={STYLE.section}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem', color: '#14b8a6' }}>Beziehungen</h2>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Beziehungen bearbeiten (Phase 2.3) – kommende Version.</p>
        {person.parentIds.length > 0 && <div style={STYLE.label}>Eltern</div>}
        {person.parentIds.map((pid) => (
          <Link key={pid} to={`${PROJECT_ROUTES['k2-familie'].personen}/${pid}`} style={{ ...STYLE.link, display: 'inline-block', marginRight: '0.5rem', marginBottom: '0.25rem' }}>{getPersonName(pid)}</Link>
        ))}
        {person.childIds.length > 0 && <div style={{ ...STYLE.label, marginTop: '0.5rem' }}>Kinder</div>}
        {person.childIds.map((pid) => (
          <Link key={pid} to={`${PROJECT_ROUTES['k2-familie'].personen}/${pid}`} style={{ ...STYLE.link, display: 'inline-block', marginRight: '0.5rem', marginBottom: '0.25rem' }}>{getPersonName(pid)}</Link>
        ))}
        {person.partners.length > 0 && <div style={{ ...STYLE.label, marginTop: '0.5rem' }}>Partner*innen</div>}
        {person.partners.map((pr, i) => (
          <span key={i}>
            <Link to={`${PROJECT_ROUTES['k2-familie'].personen}/${pr.personId}`} style={STYLE.link}>{getPersonName(pr.personId)}</Link>
            {pr.from || pr.to ? ` (${pr.from ?? '?'} – ${pr.to ?? 'heute'})` : ''}
          </span>
        ))}
        {person.siblingIds.length > 0 && <div style={{ ...STYLE.label, marginTop: '0.5rem' }}>Geschwister</div>}
        {person.siblingIds.map((pid) => (
          <Link key={pid} to={`${PROJECT_ROUTES['k2-familie'].personen}/${pid}`} style={{ ...STYLE.link, display: 'inline-block', marginRight: '0.5rem', marginBottom: '0.25rem' }}>{getPersonName(pid)}</Link>
        ))}
        {person.wahlfamilieIds.length > 0 && <div style={{ ...STYLE.label, marginTop: '0.5rem' }}>Wahlfamilie</div>}
        {person.wahlfamilieIds.map((pid) => (
          <Link key={pid} to={`${PROJECT_ROUTES['k2-familie'].personen}/${pid}`} style={{ ...STYLE.link, display: 'inline-block', marginRight: '0.5rem', marginBottom: '0.25rem' }}>{getPersonName(pid)}</Link>
        ))}
        {person.parentIds.length === 0 && person.childIds.length === 0 && person.partners.length === 0 && person.siblingIds.length === 0 && person.wahlfamilieIds.length === 0 && (
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Noch keine Beziehungen eingetragen.</p>
        )}
      </section>

      <section style={STYLE.section}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem', color: '#14b8a6' }}>Meine Momente</h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Phase 3 – Momente (Hochzeit, Geburt, Reise, …) kommen in einer späteren Version.</p>
      </section>
    </div>
  )
}
