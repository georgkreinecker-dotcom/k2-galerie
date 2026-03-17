/**
 * K2 Familie – Zusammenfassende Geschichte ab Zeitpunkt (Events + Momente → redigierbar).
 * Route: /projects/k2-familie/geschichte
 */

import { useState, useEffect, useCallback } from 'react'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { loadGeschichten, saveGeschichten, loadEvents, loadMomente, loadPersonen } from '../utils/familieStorage'
import { buildGeschichteVorschlag } from '../utils/familieGeschichte'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import type { K2FamilieGeschichte } from '../types/k2Familie'

const C = { text: '#f0f6ff', textSoft: 'rgba(255,255,255,0.78)', accent: '#14b8a6', border: 'rgba(13,148,136,0.35)' }

function generateGeschichteId(): string {
  return 'gesch-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
}

export default function K2FamilieGeschichtePage() {
  const { currentTenantId } = useFamilieTenant()
  const [geschichten, setGeschichten] = useState<K2FamilieGeschichte[]>(() => loadGeschichten(currentTenantId))
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [abDatum, setAbDatum] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const refresh = useCallback(() => {
    setGeschichten(loadGeschichten(currentTenantId))
  }, [currentTenantId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const openNew = () => {
    setEditingId('new')
    setAbDatum(new Date().toISOString().slice(0, 10))
    setTitle('')
    setContent('')
  }

  const openEdit = (g: K2FamilieGeschichte) => {
    setEditingId(g.id)
    setAbDatum(g.abDatum)
    setTitle(g.title ?? '')
    setContent(g.content)
  }

  const generateVorschlag = () => {
    const events = loadEvents(currentTenantId)
    const momente = loadMomente(currentTenantId)
    const personen = loadPersonen(currentTenantId)
    const vorschlag = buildGeschichteVorschlag(events, momente, personen, abDatum || '0000-00-00')
    setContent(vorschlag)
  }

  const save = () => {
    const now = new Date().toISOString()
    if (editingId === 'new') {
      const neu: K2FamilieGeschichte = {
        id: generateGeschichteId(),
        title: title.trim() || undefined,
        abDatum: abDatum || now.slice(0, 10),
        content: content.trim() || '',
        createdAt: now,
        updatedAt: now,
      }
      const next = [...geschichten, neu]
      if (saveGeschichten(currentTenantId, next)) {
        setGeschichten(next)
        setEditingId(null)
      }
    } else if (editingId) {
      const next = geschichten.map((g) =>
        g.id === editingId
          ? { ...g, title: title.trim() || undefined, abDatum: abDatum || g.abDatum, content: content.trim() || g.content, updatedAt: now }
          : g
      )
      if (saveGeschichten(currentTenantId, next)) {
        setGeschichten(next)
        setEditingId(null)
      }
    }
  }

  const remove = (id: string) => {
    const next = geschichten.filter((g) => g.id !== id)
    if (saveGeschichten(currentTenantId, next)) {
      setGeschichten(next)
      if (editingId === id) setEditingId(null)
    }
  }

  const sorted = [...geschichten].sort((a, b) => b.abDatum.localeCompare(a.abDatum))

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page" style={{ padding: '1rem 1.25rem', maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ marginTop: '0.5rem', color: C.text }}>Zusammenfassende Geschichte</h1>
        <p className="meta" style={{ color: C.textSoft, marginBottom: '1.25rem' }}>
          Ab einem gewählten Zeitpunkt können Events und Momente als redigierbare Geschichte zusammengefasst werden. Vorschlag erzeugen, dann nach Belieben bearbeiten.
        </p>

        {sorted.length > 0 && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', color: C.accent, marginBottom: '0.75rem' }}>Gespeicherte Geschichten</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {sorted.map((g) => (
                <li key={g.id} className="card" style={{ marginBottom: '0.75rem', padding: '0.9rem', borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ color: C.text }}>{g.title || `Geschichte ab ${g.abDatum}`}</strong>
                      <span className="meta" style={{ marginLeft: '0.5rem', color: C.textSoft }}>ab {g.abDatum}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" className="btn" onClick={() => openEdit(g)} style={{ background: C.accent }}>Bearbeiten</button>
                      <button type="button" className="btn-outline danger" onClick={() => remove(g.id)}>Löschen</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {editingId ? (
          <div className="card" style={{ padding: '1.25rem', borderRadius: 16, border: `1px solid ${C.border}` }}>
            <h2 style={{ fontSize: '1rem', color: C.accent, marginBottom: '1rem' }}>{editingId === 'new' ? 'Neue Geschichte' : 'Geschichte bearbeiten'}</h2>
            <div className="field" style={{ marginBottom: '0.75rem' }}>
              <label className="meta" style={{ display: 'block', marginBottom: '0.25rem', color: C.textSoft }}>Ab Datum (Events/Momente ab diesem Tag)</label>
              <input type="date" value={abDatum} onChange={(e) => setAbDatum(e.target.value)} style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: '0.4rem 0.6rem' }} />
            </div>
            <div className="field" style={{ marginBottom: '0.75rem' }}>
              <label className="meta" style={{ display: 'block', marginBottom: '0.25rem', color: C.textSoft }}>Titel (optional)</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Unsere Geschichte ab 1990" style={{ width: '100%', maxWidth: 400, background: 'rgba(0,0,0,0.25)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: '0.4rem 0.6rem' }} />
            </div>
            <div className="field" style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label className="meta" style={{ color: C.textSoft }}>Inhalt (redigierbar)</label>
                <button type="button" className="btn-outline" onClick={generateVorschlag} style={{ borderColor: C.accent, color: C.accent, fontSize: '0.85rem' }}>Vorschlag aus Events &amp; Momente erzeugen</button>
              </div>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Text hier eingeben oder Vorschlag erzeugen …" rows={14} style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: '0.6rem', fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: 1.5 }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="button" className="btn" onClick={save} style={{ background: C.accent }}>Speichern</button>
              <button type="button" className="btn-outline" onClick={() => setEditingId(null)} style={{ borderColor: C.border, color: C.textSoft }}>Abbrechen</button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn" onClick={openNew} style={{ background: C.accent }}>Neue Geschichte anlegen</button>
        )}
      </div>
    </div>
  )
}
