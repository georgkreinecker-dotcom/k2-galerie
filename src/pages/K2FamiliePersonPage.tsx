/**
 * K2 Familie – Personen-Seite. Phase 2.2, 2.3.
 * Route: /projects/k2-familie/personen/:id
 */

import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { PROJECT_ROUTES } from '../config/navigation'
import { loadPersonen, savePersonen, loadMomente, saveMomente } from '../utils/familieStorage'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import type { K2FamiliePerson, K2FamilieMoment } from '../types/k2Familie'

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
  const { currentTenantId } = useFamilieTenant()
  const [personen, setPersonen] = useState<K2FamiliePerson[]>(() => loadPersonen(currentTenantId))
  const [momente, setMomente] = useState<K2FamilieMoment[]>(() => loadMomente(currentTenantId))
  const [edit, setEdit] = useState(false)
  const [name, setName] = useState('')
  const [shortText, setShortText] = useState('')
  const [editingMomentId, setEditingMomentId] = useState<string | 'new' | null>(null)
  const [momentTitle, setMomentTitle] = useState('')
  const [momentDate, setMomentDate] = useState('')
  const [momentImage, setMomentImage] = useState('')
  const [momentText, setMomentText] = useState('')

  useEffect(() => {
    setPersonen(loadPersonen(currentTenantId))
    setMomente(loadMomente(currentTenantId))
  }, [id, currentTenantId])

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
    if (savePersonen(currentTenantId, next, { allowReduce: false })) {
      setPersonen(next)
      setEdit(false)
    }
  }

  const getPersonName = (personId: string) => personen.find((p) => p.id === personId)?.name ?? personId
  const otherPersonen = personen.filter((p) => p.id !== id)

  const updateAndSave = (next: K2FamiliePerson[]) => {
    if (savePersonen(currentTenantId, next, { allowReduce: false })) setPersonen(next)
  }

  const addParent = (otherId: string) => {
    if (!id || !person || person.parentIds.includes(otherId)) return
    const other = personen.find((p) => p.id === otherId)
    if (!other) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, parentIds: [...p.parentIds, otherId], updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, childIds: [...p.childIds, thisId], updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }
  const removeParent = (otherId: string) => {
    if (!id || !person) return
    const other = personen.find((p) => p.id === otherId)
    if (!other) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, parentIds: p.parentIds.filter((x) => x !== otherId), updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, childIds: p.childIds.filter((x) => x !== thisId), updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }

  const addChild = (otherId: string) => {
    if (!id || !person || person.childIds.includes(otherId)) return
    const other = personen.find((p) => p.id === otherId)
    if (!other) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, childIds: [...p.childIds, otherId], updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, parentIds: [...p.parentIds, thisId], updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }
  const removeChild = (otherId: string) => {
    if (!id || !person) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, childIds: p.childIds.filter((x) => x !== otherId), updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, parentIds: p.parentIds.filter((x) => x !== thisId), updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }

  const addPartner = (otherId: string) => {
    if (!id || !person || person.partners.some((pr) => pr.personId === otherId)) return
    const other = personen.find((p) => p.id === otherId)
    if (!other) return
    const entry = { personId: otherId, from: null as string | null, to: null as string | null }
    const entryOther = { personId: id, from: null as string | null, to: null as string | null }
    const next = personen.map((p) => {
      if (p.id === id) return { ...p, partners: [...p.partners, entry], updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, partners: [...p.partners, entryOther], updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }
  const removePartner = (otherId: string) => {
    if (!id || !person) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, partners: p.partners.filter((pr) => pr.personId !== otherId), updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, partners: p.partners.filter((pr) => pr.personId !== thisId), updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }

  const addSibling = (otherId: string) => {
    if (!id || !person || person.siblingIds.includes(otherId)) return
    const other = personen.find((p) => p.id === otherId)
    if (!other) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, siblingIds: [...p.siblingIds, otherId], updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, siblingIds: [...p.siblingIds, thisId], updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }
  const removeSibling = (otherId: string) => {
    if (!id || !person) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, siblingIds: p.siblingIds.filter((x) => x !== otherId), updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, siblingIds: p.siblingIds.filter((x) => x !== thisId), updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }

  const addWahlfamilie = (otherId: string) => {
    if (!id || !person || person.wahlfamilieIds.includes(otherId)) return
    const other = personen.find((p) => p.id === otherId)
    if (!other) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, wahlfamilieIds: [...p.wahlfamilieIds, otherId], updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, wahlfamilieIds: [...p.wahlfamilieIds, thisId], updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }
  const removeWahlfamilie = (otherId: string) => {
    if (!id || !person) return
    const thisId = id
    const next = personen.map((p) => {
      if (p.id === thisId) return { ...p, wahlfamilieIds: p.wahlfamilieIds.filter((x) => x !== otherId), updatedAt: new Date().toISOString() }
      if (p.id === otherId) return { ...p, wahlfamilieIds: p.wahlfamilieIds.filter((x) => x !== thisId), updatedAt: new Date().toISOString() }
      return p
    })
    updateAndSave(next)
  }

  const personMomente = id ? momente.filter((m) => m.personId === id) : []
  const openNewMoment = () => {
    setEditingMomentId('new')
    setMomentTitle('')
    setMomentDate('')
    setMomentImage('')
    setMomentText('')
  }
  const openEditMoment = (m: K2FamilieMoment) => {
    setEditingMomentId(m.id)
    setMomentTitle(m.title)
    setMomentDate(m.date ?? '')
    setMomentImage(m.image ?? '')
    setMomentText(m.text ?? '')
  }
  const saveMoment = () => {
    if (!id) return
    const now = new Date().toISOString()
    if (editingMomentId === 'new') {
      const newM: K2FamilieMoment = {
        id: 'moment-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9),
        personId: id,
        title: momentTitle.trim() || 'Ohne Titel',
        date: momentDate.trim() || null,
        image: momentImage.trim() || undefined,
        text: momentText.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      }
      const next = [...momente, newM]
      if (saveMomente(currentTenantId, next)) {
        setMomente(next)
        setEditingMomentId(null)
      }
    } else if (editingMomentId) {
      const next = momente.map((m) =>
        m.id === editingMomentId
          ? {
              ...m,
              title: momentTitle.trim() || m.title,
              date: momentDate.trim() || null,
              image: momentImage.trim() || undefined,
              text: momentText.trim() || undefined,
              updatedAt: now,
            }
          : m
      )
      if (saveMomente(currentTenantId, next)) {
        setMomente(next)
        setEditingMomentId(null)
      }
    }
  }
  const deleteMoment = (momentId: string) => {
    const next = momente.filter((m) => m.id !== momentId)
    if (saveMomente(currentTenantId, next, { allowReduce: true })) setMomente(next)
    if (editingMomentId === momentId) setEditingMomentId(null)
  }

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

        {(() => {
          const sel = { padding: '0.35rem 0.5rem', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(13,148,136,0.4)', borderRadius: 6, color: '#fff5f0', fontSize: '0.9rem', fontFamily: 'inherit' as const }
          const smallBtn = { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.8rem', padding: '0.2rem 0.4rem', fontFamily: 'inherit' }
          const row = (label: string, ids: string[], addFn: (oid: string) => void, removeFn: (oid: string) => void, getIds: () => string[]) => (
            <div key={label} style={{ marginBottom: '1rem' }}>
              <div style={STYLE.label}>{label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                {ids.map((pid) => (
                  <span key={pid} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(13,148,136,0.15)', padding: '0.25rem 0.5rem', borderRadius: 6 }}>
                    <Link to={`${PROJECT_ROUTES['k2-familie'].personen}/${pid}`} style={STYLE.link}>{getPersonName(pid)}</Link>
                    <button type="button" onClick={() => removeFn(pid)} style={smallBtn} title="Entfernen">✕</button>
                  </span>
                ))}
                {otherPersonen.filter((p) => !getIds().includes(p.id)).length > 0 && (
                  <select
                    style={sel}
                    value=""
                    onChange={(e) => { const v = e.target.value; if (v) { addFn(v); e.target.value = ''; } }}
                  >
                    <option value="">+ Hinzufügen</option>
                    {otherPersonen.filter((p) => !getIds().includes(p.id)).map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )
          return (
            <>
              {row('Eltern', person.parentIds, addParent, removeParent, () => person.parentIds)}
              {row('Kinder', person.childIds, addChild, removeChild, () => person.childIds)}
              <div style={{ marginBottom: '1rem' }}>
                <div style={STYLE.label}>Partner*innen</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                  {person.partners.map((pr, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(13,148,136,0.15)', padding: '0.25rem 0.5rem', borderRadius: 6 }}>
                      <Link to={`${PROJECT_ROUTES['k2-familie'].personen}/${pr.personId}`} style={STYLE.link}>{getPersonName(pr.personId)}</Link>
                      {(pr.from || pr.to) && <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>({pr.from ?? '?'} – {pr.to ?? 'heute'})</span>}
                      <button type="button" onClick={() => removePartner(pr.personId)} style={smallBtn} title="Entfernen">✕</button>
                    </span>
                  ))}
                  {otherPersonen.filter((p) => !person.partners.some((pr) => pr.personId === p.id)).length > 0 && (
                    <select
                      style={sel}
                      value=""
                      onChange={(e) => { const v = e.target.value; if (v) { addPartner(v); e.target.value = ''; } }}
                    >
                      <option value="">+ Hinzufügen</option>
                      {otherPersonen.filter((p) => !person.partners.some((pr) => pr.personId === p.id)).map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              {row('Geschwister', person.siblingIds, addSibling, removeSibling, () => person.siblingIds)}
              {row('Wahlfamilie', person.wahlfamilieIds, addWahlfamilie, removeWahlfamilie, () => person.wahlfamilieIds)}
            </>
          )
        })()}
      </section>

      <section style={STYLE.section}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem', color: '#14b8a6' }}>Meine Momente</h2>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>Hochzeit, Geburt, Umzug, Reise, Abschied, Neuanfang – was dir wichtig ist.</p>
        {personMomente.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
            {personMomente.map((m) => (
              <li key={m.id} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'rgba(13,148,136,0.1)', borderRadius: 8, border: '1px solid rgba(13,148,136,0.25)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'flex-start' }}>
                  {m.image && (
                    <img src={m.image} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }} />
                  )}
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <strong style={{ color: '#14b8a6' }}>{m.title}</strong>
                    {m.date && <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>{m.date.slice(0, 10)}</span>}
                    {m.text && <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{m.text}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button type="button" onClick={() => openEditMoment(m)} style={STYLE.btn}>Bearbeiten</button>
                    <button type="button" onClick={() => deleteMoment(m.id)} style={{ ...STYLE.btn, background: 'rgba(180,0,0,0.2)', color: '#f87171', borderColor: 'rgba(248,113,113,0.5)' }}>Löschen</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {editingMomentId ? (
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)' }}>
            <div style={STYLE.label}>Titel</div>
            <input value={momentTitle} onChange={(e) => setMomentTitle(e.target.value)} style={STYLE.input} placeholder="z. B. Hochzeit, Umzug Wien" />
            <div style={{ ...STYLE.label, marginTop: '0.5rem' }}>Datum (optional)</div>
            <input type="date" value={momentDate} onChange={(e) => setMomentDate(e.target.value)} style={STYLE.input} />
            <div style={{ ...STYLE.label, marginTop: '0.5rem' }}>Bild (URL oder einfügen Data-URL, optional)</div>
            <input value={momentImage} onChange={(e) => setMomentImage(e.target.value)} style={STYLE.input} placeholder="https://… oder data:image/…" />
            <div style={{ ...STYLE.label, marginTop: '0.5rem' }}>Text (optional)</div>
            <textarea value={momentText} onChange={(e) => setMomentText(e.target.value)} style={{ ...STYLE.input, minHeight: 80 }} placeholder="Kurze Beschreibung oder Geschichte" />
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={saveMoment} style={STYLE.btn}>Speichern</button>
              <button type="button" onClick={() => setEditingMomentId(null)} style={{ ...STYLE.btn, background: 'transparent' }}>Abbrechen</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={openNewMoment} style={STYLE.btn}>Moment hinzufügen</button>
        )}
      </section>
    </div>
  )
}
