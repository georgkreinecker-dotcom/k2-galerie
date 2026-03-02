/**
 * K2 Familie – Familien-Events (Phase 3.2). Geburtstage, Treffen, Feste.
 * Route: /projects/k2-familie/events
 */

import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { loadEvents, saveEvents, loadPersonen } from '../utils/familieStorage'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import type { K2FamilieEvent } from '../types/k2Familie'

function generateEventId(): string {
  return 'event-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
}

export default function K2FamilieEventsPage() {
  const { currentTenantId } = useFamilieTenant()
  const [events, setEvents] = useState<K2FamilieEvent[]>(() => loadEvents(currentTenantId))
  const [personen, setPersonen] = useState(() => loadPersonen(currentTenantId))
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [participantIds, setParticipantIds] = useState<string[]>([])
  const [note, setNote] = useState('')

  useEffect(() => {
    setEvents(loadEvents(currentTenantId))
    setPersonen(loadPersonen(currentTenantId))
  }, [currentTenantId])

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
      if (saveEvents(currentTenantId, next)) {
        setEvents(next)
        setEditingId(null)
      }
    } else if (editingId) {
      const next = events.map((ev) =>
        ev.id === editingId
          ? { ...ev, title: title.trim() || ev.title, date: date || ev.date, participantIds: [...participantIds], note: note.trim() || undefined, updatedAt: now }
          : ev
      )
      if (saveEvents(currentTenantId, next)) {
        setEvents(next)
        setEditingId(null)
      }
    }
  }
  const remove = (eventId: string) => {
    const next = events.filter((e) => e.id !== eventId)
    if (saveEvents(currentTenantId, next, { allowReduce: true })) setEvents(next)
    if (editingId === eventId) setEditingId(null)
  }

  const toggleParticipant = (personId: string) => {
    setParticipantIds((prev) => (prev.includes(personId) ? prev.filter((id) => id !== personId) : [...prev, personId]))
  }

  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page">
        <header>
          <div>
            <Link to={PROJECT_ROUTES['k2-familie'].home} className="meta">← K2 Familie</Link>
            <h1 style={{ marginTop: '0.5rem' }}>Familien-Events</h1>
            <div className="meta">Geburtstage, Treffen, Feste – mit Datum und Teilnehmern aus der Familie.</div>
          </div>
        </header>

        {sortedEvents.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
            {sortedEvents.map((ev, i) => (
              <li key={ev.id} className="card familie-card-enter" style={{ marginBottom: '0.75rem', animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1rem' }}>{ev.title}</h2>
                    <span className="meta" style={{ marginLeft: '0.5rem' }}>{ev.date}</span>
                    {ev.participantIds.length > 0 && (
                      <p className="meta" style={{ margin: '0.35rem 0 0' }}>{ev.participantIds.map((id) => getPersonName(id)).join(', ')}</p>
                    )}
                    {ev.note && <p style={{ margin: '0.25rem 0 0' }}>{ev.note}</p>}
                  </div>
                  <div className="card-actions" style={{ display: 'flex', gap: '0.35rem' }}>
                    <button type="button" className="btn" onClick={() => openEdit(ev)}>Bearbeiten</button>
                    <button type="button" className="btn-outline danger" onClick={() => remove(ev.id)}>Löschen</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {editingId ? (
          <div className="card" style={{ padding: '1rem' }}>
            <div className="field"><label className="meta">Titel</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Geburtstag Anna, Familientreffen" /></div>
            <div className="field" style={{ marginTop: '0.5rem' }}><label className="meta">Datum</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="field" style={{ marginTop: '0.5rem' }}>
              <label className="meta">Teilnehmer (aus Familie)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
                {personen.map((p) => (
                  <label key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={participantIds.includes(p.id)} onChange={() => toggleParticipant(p.id)} />
                    <span>{p.name}</span>
                  </label>
                ))}
                {personen.length === 0 && <span className="meta">Zuerst Personen im Stammbaum anlegen.</span>}
              </div>
            </div>
            <div className="field" style={{ marginTop: '0.5rem' }}><label className="meta">Notiz (optional)</label><textarea value={note} onChange={(e) => setNote(e.target.value)} style={{ minHeight: 60 }} placeholder="Ort, Hinweise …" /></div>
            <div className="card-actions" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn" onClick={save}>Speichern</button>
              <button type="button" className="btn-outline" onClick={() => setEditingId(null)}>Abbrechen</button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn" onClick={openNew}>Event hinzufügen</button>
        )}
      </div>
    </div>
  )
}
