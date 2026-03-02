/**
 * K2 Familie – Familien-Events (Phase 3.2). Geburtstage, Treffen, Feste.
 * Route: /projects/k2-familie/events
 */

import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { PROJECT_ROUTES } from '../config/navigation'
import { loadEvents, saveEvents, loadPersonen, K2_FAMILIE_DEFAULT_TENANT } from '../utils/familieStorage'
import type { K2FamilieEvent } from '../types/k2Familie'

const STYLE = {
  page: { minHeight: '100vh', background: '#1a0f0a', color: '#fff5f0', padding: 'clamp(1.5rem, 4vw, 2.5rem)', maxWidth: 720, margin: '0 auto', fontFamily: 'system-ui, sans-serif' } as const,
  link: { color: '#14b8a6', textDecoration: 'none', fontSize: '0.95rem' },
  h1: { fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', margin: '0 0 0.5rem', color: '#14b8a6' },
  section: { marginTop: '1.5rem', padding: '1rem 0', borderTop: '1px solid rgba(13,148,136,0.3)' },
  label: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.35rem' },
  input: { width: '100%', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(13,148,136,0.4)', borderRadius: 8, color: '#fff5f0', fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box' as const },
  btn: { padding: '0.5rem 1rem', background: 'rgba(13,148,136,0.3)', color: '#14b8a6', border: '1px solid rgba(13,148,136,0.6)', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: '0.5rem' },
}

function generateEventId(): string {
  return 'event-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
}

export default function K2FamilieEventsPage() {
  const [events, setEvents] = useState<K2FamilieEvent[]>(() => loadEvents(K2_FAMILIE_DEFAULT_TENANT))
  const [personen, setPersonen] = useState(() => loadPersonen(K2_FAMILIE_DEFAULT_TENANT))
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [participantIds, setParticipantIds] = useState<string[]>([])
  const [note, setNote] = useState('')

  useEffect(() => {
    setEvents(loadEvents(K2_FAMILIE_DEFAULT_TENANT))
    setPersonen(loadPersonen(K2_FAMILIE_DEFAULT_TENANT))
  }, [])

  const getPersonName = (personId: string) => personen.find((p) => p.id === personId)?.name ?? personId

  const openNew = () => {
    setEditingId('new')
    setTitle('')
    setDate('')
    setParticipantIds([])
    setNote('')
  }
  const openEdit = (e: K2FamilieEvent) => {
    setEditingId(e.id)
    setTitle(e.title)
    setDate(e.date)
    setParticipantIds([...e.participantIds])
    setNote(e.note ?? '')
  }
  const save = () => {
    const now = new Date().toISOString()
    if (editingId === 'new') {
      const neu: K2FamilieEvent = {
        id: generateEventId(),
        title: title.trim() || 'Ohne Titel',
        date: date || new Date().toISOString().slice(0, 10),
        participantIds: [...participantIds],
        note: note.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      }
      const next = [...events, neu]
      if (saveEvents(K2_FAMILIE_DEFAULT_TENANT, next)) {
        setEvents(next)
        setEditingId(null)
      }
    } else if (editingId) {
      const next = events.map((ev) =>
        ev.id === editingId
          ? { ...ev, title: title.trim() || ev.title, date: date || ev.date, participantIds: [...participantIds], note: note.trim() || undefined, updatedAt: now }
          : ev
      )
      if (saveEvents(K2_FAMILIE_DEFAULT_TENANT, next)) {
        setEvents(next)
        setEditingId(null)
      }
    }
  }
  const remove = (eventId: string) => {
    const next = events.filter((e) => e.id !== eventId)
    if (saveEvents(K2_FAMILIE_DEFAULT_TENANT, next, { allowReduce: true })) setEvents(next)
    if (editingId === eventId) setEditingId(null)
  }

  const toggleParticipant = (personId: string) => {
    setParticipantIds((prev) => (prev.includes(personId) ? prev.filter((id) => id !== personId) : [...prev, personId]))
  }

  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div style={STYLE.page}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={PROJECT_ROUTES['k2-familie'].home} style={STYLE.link}>← K2 Familie</Link>
      </div>

      <h1 style={STYLE.h1}>Familien-Events</h1>
      <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
        Geburtstage, Treffen, Feste – mit Datum und Teilnehmern aus der Familie.
      </p>

      {sortedEvents.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
          {sortedEvents.map((ev) => (
            <li key={ev.id} style={{ marginBottom: '0.75rem', padding: '1rem', background: 'rgba(13,148,136,0.1)', borderRadius: 8, border: '1px solid rgba(13,148,136,0.25)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div>
                  <strong style={{ color: '#14b8a6' }}>{ev.title}</strong>
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>{ev.date}</span>
                  {ev.participantIds.length > 0 && (
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                      {ev.participantIds.map((id) => getPersonName(id)).join(', ')}
                    </p>
                  )}
                  {ev.note && <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{ev.note}</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button type="button" onClick={() => openEdit(ev)} style={STYLE.btn}>Bearbeiten</button>
                  <button type="button" onClick={() => remove(ev.id)} style={{ ...STYLE.btn, background: 'rgba(180,0,0,0.2)', color: '#f87171', borderColor: 'rgba(248,113,113,0.5)' }}>Löschen</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingId ? (
        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid rgba(13,148,136,0.3)' }}>
          <div style={STYLE.label}>Titel</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={STYLE.input} placeholder="z. B. Geburtstag Anna, Familientreffen" />
          <div style={{ ...STYLE.label, marginTop: '0.5rem' }}>Datum</div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={STYLE.input} />
          <div style={{ ...STYLE.label, marginTop: '0.5rem' }}>Teilnehmer (aus Familie)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
            {personen.map((p) => (
              <label key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={participantIds.includes(p.id)} onChange={() => toggleParticipant(p.id)} />
                <span>{p.name}</span>
              </label>
            ))}
            {personen.length === 0 && <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Zuerst Personen im Stammbaum anlegen.</span>}
          </div>
          <div style={{ ...STYLE.label, marginTop: '0.5rem' }}>Notiz (optional)</div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} style={{ ...STYLE.input, minHeight: 60 }} placeholder="Ort, Hinweise …" />
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={save} style={STYLE.btn}>Speichern</button>
            <button type="button" onClick={() => setEditingId(null)} style={{ ...STYLE.btn, background: 'transparent' }}>Abbrechen</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={openNew} style={STYLE.btn}>Event hinzufügen</button>
      )}
    </div>
  )
}
