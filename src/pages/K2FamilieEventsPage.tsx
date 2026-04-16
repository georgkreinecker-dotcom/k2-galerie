/**
 * K2 Familie – Familien-Events (Phase 3.2). Geburtstage, Treffen, Feste.
 * Route: /projects/k2-familie/events
 */

import { useState, useEffect, useMemo } from 'react'
import '../App.css'
import { loadEvents, saveEvents, loadPersonen, loadEinstellungen } from '../utils/familieStorage'
import {
  filterPersonenFuerFamilienEventTeilnehmer,
  sortPersonenFuerFamilienEventTeilnehmer,
  type FamilieTeilnehmerGruppe,
  type FamilieTeilnehmerSortierung,
} from '../utils/familieEventTeilnehmerAuswahl'
import { groupPersonenNachVerwandtschaftFuerEvent } from '../utils/familieEventVerwandtschaftKategorie'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import type { K2FamilieEvent } from '../types/k2Familie'

function generateEventId(): string {
  return 'event-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
}

export default function K2FamilieEventsPage() {
  const { currentTenantId, familieStorageRevision } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const kannOrganisch = capabilities.canEditOrganisches
  const [events, setEvents] = useState<K2FamilieEvent[]>(() => loadEvents(currentTenantId))
  const [personen, setPersonen] = useState(() => loadPersonen(currentTenantId))
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [participantIds, setParticipantIds] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [teilnehmerGruppe, setTeilnehmerGruppe] = useState<FamilieTeilnehmerGruppe>('alle')
  const [teilnehmerSortierung, setTeilnehmerSortierung] = useState<FamilieTeilnehmerSortierung>('name')

  useEffect(() => {
    setEvents(loadEvents(currentTenantId))
    setPersonen(loadPersonen(currentTenantId))
  }, [currentTenantId, familieStorageRevision])

  const ichBinPersonId = useMemo(
    () => loadEinstellungen(currentTenantId).ichBinPersonId,
    [currentTenantId, familieStorageRevision]
  )

  const ichBinPerson = useMemo(
    () => (ichBinPersonId ? personen.find((p) => p.id === ichBinPersonId) : undefined),
    [personen, ichBinPersonId]
  )
  const elternAnzahl = (ichBinPerson?.parentIds ?? []).filter(Boolean).length

  const teilnehmerGefiltert = useMemo(
    () => filterPersonenFuerFamilienEventTeilnehmer(personen, ichBinPersonId, teilnehmerGruppe),
    [personen, ichBinPersonId, teilnehmerGruppe]
  )

  const teilnehmerListe = useMemo(
    () => sortPersonenFuerFamilienEventTeilnehmer(teilnehmerGefiltert, ichBinPersonId, teilnehmerSortierung),
    [teilnehmerGefiltert, ichBinPersonId, teilnehmerSortierung]
  )

  const teilnehmerVerwandtschaftGruppen = useMemo(() => {
    if (teilnehmerSortierung !== 'verwandtschaft') return null
    return groupPersonenNachVerwandtschaftFuerEvent(teilnehmerGefiltert, ichBinPersonId)
  }, [teilnehmerGefiltert, ichBinPersonId, teilnehmerSortierung])

  const getPersonName = (personId: string) => personen.find((p) => p.id === personId)?.name ?? personId

  const openNew = () => {
    if (!kannOrganisch) return
    setEditingId('new')
    setTitle('')
    setDate('')
    setParticipantIds([])
    setNote('')
    setTeilnehmerGruppe('alle')
    setTeilnehmerSortierung('name')
  }
  const openEdit = (e: K2FamilieEvent) => {
    if (!kannOrganisch) return
    setEditingId(e.id)
    setTitle(e.title)
    setDate(e.date)
    setParticipantIds([...e.participantIds])
    setNote(e.note ?? '')
    setTeilnehmerGruppe('alle')
    setTeilnehmerSortierung('name')
  }
  const save = () => {
    if (!kannOrganisch) return
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
    if (!kannOrganisch) return
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
                    <button type="button" className="btn" disabled={!kannOrganisch} onClick={() => openEdit(ev)}>Bearbeiten</button>
                    <button type="button" className="btn-outline danger" disabled={!kannOrganisch} onClick={() => remove(ev.id)}>Löschen</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {editingId ? (
          <div className="card" style={{ padding: '1rem' }}>
            <div className="field"><label className="meta">Titel</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Geburtstag Anna, Familientreffen" disabled={!kannOrganisch} /></div>
            <div className="field" style={{ marginTop: '0.5rem' }}><label className="meta">Datum</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={!kannOrganisch} /></div>
            <div className="field" style={{ marginTop: '0.5rem' }}>
              <label className="meta">Teilnehmer (aus Familie)</label>
              <p className="meta" style={{ margin: '0.25rem 0 0.5rem', lineHeight: 1.45 }}>
                Mütterliche und väterliche Seite richten sich nach der Reihenfolge der Eltern auf deiner Karte: erster Eintrag = mütterliche Seite, zweiter = väterliche – unabhängig von Biologie.
              </p>
              {!ichBinPersonId?.trim() && (
                <p className="meta" style={{ margin: '0 0 0.5rem', color: '#8b4513' }}>
                  Ohne „Das bin ich“ in den Einstellungen sind Filter und Sortierung nach Verwandtschaft eingeschränkt; es werden alle Personen angezeigt.
                </p>
              )}
              {ichBinPersonId && elternAnzahl < 2 && teilnehmerGruppe === 'vaterlich' && (
                <p className="meta" style={{ margin: '0 0 0.5rem', color: '#8b4513' }}>
                  Für die väterliche Seite braucht deine Karte zwei Eltern. Bis dahin siehst du hier alle Personen.
                </p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="meta" style={{ marginRight: '0.25rem' }}>Anzeige:</span>
                {(
                  [
                    { id: 'alle' as const, label: 'Alle' },
                    { id: 'muetterlich' as const, label: 'Mütterliche Seite' },
                    { id: 'vaterlich' as const, label: 'Väterliche Seite' },
                  ] as const
                ).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    className={teilnehmerGruppe === id ? 'btn' : 'btn-outline'}
                    style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                    disabled={!kannOrganisch}
                    onClick={() => setTeilnehmerGruppe(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="meta" style={{ marginRight: '0.25rem' }}>Sortierung:</span>
                {(
                  [
                    { id: 'name' as const, label: 'Nach Namen' },
                    { id: 'verwandtschaft' as const, label: 'Nach Verwandtschaft' },
                  ] as const
                ).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    className={teilnehmerSortierung === id ? 'btn' : 'btn-outline'}
                    style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                    disabled={!kannOrganisch}
                    onClick={() => setTeilnehmerSortierung(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {teilnehmerSortierung === 'verwandtschaft' && (
                <p className="meta" style={{ margin: '0 0 0.5rem', lineHeight: 1.45 }}>
                  Gruppen wie Geschwister, Onkel/Tanten, Cousinen/Cousins, Neffen/Nichten – aus den Kartenbeziehungen; innerhalb jeder Gruppe alphabetisch.
                </p>
              )}
              <div style={{ marginTop: '0.35rem' }}>
                {teilnehmerSortierung === 'verwandtschaft' &&
                teilnehmerVerwandtschaftGruppen &&
                teilnehmerVerwandtschaftGruppen.length > 0 ? (
                  teilnehmerVerwandtschaftGruppen.map((gr) => (
                    <div key={gr.id} style={{ marginBottom: '0.85rem' }}>
                      <div
                        className="meta"
                        style={{
                          fontWeight: 600,
                          color: '#1c1a18',
                          marginBottom: '0.35rem',
                          fontSize: '0.88rem',
                        }}
                      >
                        {gr.titel}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {gr.personen.map((p) => (
                          <label
                            key={p.id}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}
                          >
                            <input
                              type="checkbox"
                              checked={participantIds.includes(p.id)}
                              onChange={() => toggleParticipant(p.id)}
                              disabled={!kannOrganisch}
                            />
                            <span>{p.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {teilnehmerListe.map((p) => (
                      <label key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input type="checkbox" checked={participantIds.includes(p.id)} onChange={() => toggleParticipant(p.id)} disabled={!kannOrganisch} />
                        <span>{p.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {personen.length === 0 && <span className="meta">Zuerst Personen im Stammbaum anlegen.</span>}
                {personen.length > 0 && teilnehmerListe.length === 0 && (
                  <span className="meta">Keine Personen in diesem Filter – andere Anzeige wählen.</span>
                )}
              </div>
            </div>
            <div className="field" style={{ marginTop: '0.5rem' }}><label className="meta">Notiz (optional)</label><textarea value={note} onChange={(e) => setNote(e.target.value)} style={{ minHeight: 60 }} placeholder="Ort, Hinweise …" disabled={!kannOrganisch} /></div>
            <div className="card-actions" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn" disabled={!kannOrganisch} onClick={save}>Speichern</button>
              <button type="button" className="btn-outline" onClick={() => setEditingId(null)}>Abbrechen</button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn" disabled={!kannOrganisch} onClick={openNew}>Event hinzufügen</button>
        )}
      </div>
    </div>
  )
}
