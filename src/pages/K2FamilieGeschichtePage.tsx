/**
 * K2 Familie – Zusammenfassende Geschichte ab Zeitpunkt (Events + Momente → redigierbar).
 * Route: /projects/k2-familie/geschichte
 */

import { useState, useEffect, useCallback } from 'react'
import '../App.css'
import { loadGeschichten, saveGeschichten, loadEvents, loadMomente, loadPersonen } from '../utils/familieStorage'
import {
  GESCHICHTE_IDEENBRINGER,
  GESCHICHTE_LEITPLANKEN,
  fuelleGeschichteGeruest,
} from '../config/k2FamilieGeschichteStruktur'
import { buildGeschichteVorschlag } from '../utils/familieGeschichte'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import type { K2FamilieGeschichte } from '../types/k2Familie'
import { K2_FAMILIE_UI as C } from '../config/k2FamilieUiColors'

function generateGeschichteId(): string {
  return 'gesch-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
}

export default function K2FamilieGeschichtePage() {
  const { currentTenantId } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const kannOrganisch = capabilities.canEditOrganisches
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
    if (!kannOrganisch) return
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
    setContent((prev) => {
      const p = prev.trim()
      if (!p) return vorschlag
      return `${p}\n\n## Verlauf – Vorschlag aus Events & Momente\n\n${vorschlag}`
    })
  }

  const geruestEinfuegen = () => {
    const geruest = fuelleGeschichteGeruest(abDatum || new Date().toISOString().slice(0, 10), title)
    setContent((prev) => {
      const p = prev.trim()
      if (!p) return geruest
      return `${geruest}\n\n---\n\n${p}`
    })
  }

  /** Klartext aus Zwischenablage (z. B. Word) – zuverlässig ohne HTML-Rückstände. */
  const handleContentPaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const plain = e.clipboardData.getData('text/plain')
    if (plain === '') return
    e.preventDefault()
    const el = e.currentTarget
    const start = el.selectionStart
    const end = el.selectionEnd
    const insert = plain.replace(/\r\n/g, '\n')
    setContent((prev) => prev.slice(0, start) + insert + prev.slice(end))
    const newPos = start + insert.length
    requestAnimationFrame(() => {
      el.setSelectionRange(newPos, newPos)
    })
  }, [])

  const save = () => {
    if (!kannOrganisch) return
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
    if (!kannOrganisch) return
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
        <p className="meta" style={{ color: C.textSoft, marginBottom: '1rem' }}>
          Ab einem gewählten Zeitpunkt können Events und Momente als redigierbare Geschichte zusammengefasst werden. Struktur und Leitplanken helfen beim Schreiben – das Gerüst ist nur eine Idee, du bestimmst den Text.
        </p>

        <section
          className="card"
          style={{
            marginBottom: '1.25rem',
            padding: '1rem',
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          <h2 style={{ fontSize: '0.95rem', color: C.accent, margin: '0 0 0.6rem' }}>Leitplanken</h2>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', color: C.textSoft, fontSize: '0.88rem', lineHeight: 1.55 }}>
            {GESCHICHTE_LEITPLANKEN.map((l) => (
              <li key={l.titel} style={{ marginBottom: '0.35rem' }}>
                <strong style={{ color: C.text }}>{l.titel}:</strong> {l.text}
              </li>
            ))}
          </ul>
          <h3 style={{ fontSize: '0.88rem', color: C.accent, margin: '0.85rem 0 0.4rem' }}>Ideenbringer</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {GESCHICHTE_IDEENBRINGER.map((block) => (
              <div key={block.kategorie}>
                <span style={{ fontSize: '0.8rem', color: C.text }}>{block.kategorie}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {block.stichworte.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 6,
                        border: `1px solid ${C.border}`,
                        color: C.textSoft,
                        background: 'rgba(255,255,255,0.04)',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {sorted.length > 0 && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', color: C.accent, marginBottom: '0.75rem' }}>Gespeicherte Geschichten</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {sorted.map((g) => (
                <li key={g.id} className="card" style={{ marginBottom: '0.75rem', padding: '0.9rem', borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ color: C.text }}>{g.title || `Geschichte ab ${g.abDatum}`}</strong>
                      <span className="meta" style={{ marginLeft: '0.5rem' }}>ab {g.abDatum}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" className="btn" disabled={!kannOrganisch} onClick={() => openEdit(g)} style={{ background: C.accent }}>Bearbeiten</button>
                      <button type="button" className="btn-outline danger" disabled={!kannOrganisch} onClick={() => remove(g.id)}>Löschen</button>
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
              <label className="meta" style={{ display: 'block', marginBottom: '0.25rem' }}>Ab Datum (Events/Momente ab diesem Tag)</label>
              <input type="date" value={abDatum} onChange={(e) => setAbDatum(e.target.value)} disabled={!kannOrganisch} style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: '0.4rem 0.6rem' }} />
            </div>
            <div className="field" style={{ marginBottom: '0.75rem' }}>
              <label className="meta" style={{ display: 'block', marginBottom: '0.25rem' }}>Titel (optional)</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Unsere Geschichte ab 1990" disabled={!kannOrganisch} style={{ width: '100%', maxWidth: 400, background: 'rgba(0,0,0,0.25)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: '0.4rem 0.6rem' }} />
            </div>
            <div className="field" style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <label className="meta">Inhalt (redigierbar)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button type="button" className="btn-outline" disabled={!kannOrganisch} onClick={geruestEinfuegen} style={{ fontSize: '0.85rem' }}>
                    Struktur-Gerüst einfügen
                  </button>
                  <button
                    type="button"
                    className="btn-outline k2-familie-btn-outline--accent"
                    disabled={!kannOrganisch}
                    onClick={generateVorschlag}
                    style={{ fontSize: '0.85rem' }}
                  >
                    Vorschlag aus Events &amp; Momente
                  </button>
                </div>
              </div>
              <p className="meta" style={{ fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Gerüst = Markdown-Kapitel als Idee. Steht schon Text darin, wird das Gerüst oben angefügt. Der Daten-Vorschlag hängt unter „Verlauf“ an oder füllt ein leeres Feld.
              </p>
              <p className="meta" style={{ fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                Fertigen Text aus Word oder anderer App: hier einfügen (Strg+V / Cmd+V). Es wird <strong style={{ color: C.text }}>Klartext</strong> übernommen – kein Word-Layout; Überschriften z. B. mit <code style={{ fontSize: '0.78rem' }}>## Titel</code> in Markdown.
              </p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handleContentPaste}
                placeholder="Text hier eingeben, aus Word einfügen oder Vorschlag erzeugen …"
                rows={14}
                disabled={!kannOrganisch}
                style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: '0.6rem', fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: 1.5 }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="button" className="btn" disabled={!kannOrganisch} onClick={save} style={{ background: C.accent }}>Speichern</button>
              <button type="button" className="btn-outline" onClick={() => setEditingId(null)}>
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn" disabled={!kannOrganisch} onClick={openNew} style={{ background: C.accent }}>Neue Geschichte anlegen</button>
        )}
      </div>
    </div>
  )
}
