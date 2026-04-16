/**
 * K2 Familie – Zusammenfassende Geschichte ab Zeitpunkt (Events + Momente → redigierbar).
 * Route: /projects/k2-familie/geschichte
 */

import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import '../App.css'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { loadGeschichten, saveGeschichten, loadEvents, loadMomente, loadPersonen } from '../utils/familieStorage'
import {
  GESCHICHTE_IDEENBRINGER,
  GESCHICHTE_LEITPLANKEN,
  fuelleGeschichteGeruest,
} from '../config/k2FamilieGeschichteStruktur'
import { buildGeschichteVorschlag, isGeschichteInArbeit } from '../utils/familieGeschichte'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import type { K2FamilieGeschichte } from '../types/k2Familie'
import { K2_FAMILIE_UI as C } from '../config/k2FamilieUiColors'

function generateGeschichteId(): string {
  return 'gesch-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
}

/** Druck: Fließtext mit einfachen Markdown-Überschriften (# / ## / ###). */
function renderGeschichteDruckInhalt(text: string): ReactNode {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const out: ReactNode[] = []
  let para: string[] = []
  let k = 0
  const flushPara = () => {
    if (para.length === 0) return
    const content = para.join('\n')
    out.push(
      <p key={`p-${k++}`} style={{ margin: '0 0 0.45rem', whiteSpace: 'pre-wrap', color: '#1c1a18' }}>
        {content}
      </p>
    )
    para = []
  }
  for (const line of lines) {
    const t = line.trim()
    if (t === '') {
      flushPara()
      continue
    }
    if (t.startsWith('### ')) {
      flushPara()
      out.push(
        <h3 key={`h-${k++}`} style={{ fontSize: '11pt', margin: '0.55rem 0 0.2rem', color: '#0f766e', pageBreakAfter: 'avoid' }}>
          {t.slice(4)}
        </h3>
      )
      continue
    }
    if (t.startsWith('## ')) {
      flushPara()
      out.push(
        <h2 key={`h-${k++}`} style={{ fontSize: '12.5pt', margin: '0.75rem 0 0.25rem', color: '#0d9488', pageBreakAfter: 'avoid' }}>
          {t.slice(3)}
        </h2>
      )
      continue
    }
    if (t.startsWith('# ')) {
      flushPara()
      out.push(
        <h1 key={`h-${k++}`} style={{ fontSize: '14pt', margin: '0 0 0.35rem', color: '#0f766e', pageBreakAfter: 'avoid' }}>
          {t.slice(2)}
        </h1>
      )
      continue
    }
    para.push(line)
  }
  flushPara()
  return <>{out}</>
}

/** Einzelblatt oder Sammeldruck aller gespeicherten Geschichten (Register). */
type GeschichtenDruckSnapshot =
  | {
      mode: 'einzel'
      title: string
      abDatum: string
      statusLabel: string
      content: string
    }
  | { mode: 'alle'; items: K2FamilieGeschichte[] }

export default function K2FamilieGeschichtePage() {
  const { currentTenantId } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const kannOrganisch = capabilities.canEditOrganisches
  const kannFertigeLoeschen = capabilities.canDeleteFertigeGeschichte
  const [geschichten, setGeschichten] = useState<K2FamilieGeschichte[]>(() => loadGeschichten(currentTenantId))
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [abDatum, setAbDatum] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  /** Speichern als fertig oder noch in Arbeit (Entwurf). */
  const [saveStatus, setSaveStatus] = useState<'fertig' | 'entwurf'>('entwurf')
  /** Nur während Druckdialog: verstecktes Blatt mit Inhalt (nach afterprint wieder leer). */
  const [druckSnapshot, setDruckSnapshot] = useState<GeschichtenDruckSnapshot | null>(null)

  const refresh = useCallback(() => {
    setGeschichten(loadGeschichten(currentTenantId))
  }, [currentTenantId])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const clear = () => setDruckSnapshot(null)
    window.addEventListener('afterprint', clear)
    return () => window.removeEventListener('afterprint', clear)
  }, [])

  const druckGeschichte = useCallback((g: K2FamilieGeschichte) => {
    setDruckSnapshot({
      mode: 'einzel',
      title: g.title?.trim() || `Geschichte ab ${g.abDatum}`,
      abDatum: g.abDatum,
      statusLabel: isGeschichteInArbeit(g) ? 'In Arbeit' : 'Fertig',
      content: g.content,
    })
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()))
  }, [])

  /** Alle gespeicherten Geschichten (älteste zuerst) – für Archiv / alte Einträge ohne Status mit dabei. */
  const druckAlleAusRegister = useCallback(() => {
    const items = [...geschichten].sort((a, b) => a.abDatum.localeCompare(b.abDatum))
    if (items.length === 0) return
    setDruckSnapshot({ mode: 'alle', items })
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()))
  }, [geschichten])

  const druckAktuellerEditor = useCallback(() => {
    setDruckSnapshot({
      mode: 'einzel',
      title: title.trim() || (abDatum ? `Geschichte ab ${abDatum}` : 'Neue Geschichte'),
      abDatum: abDatum || '—',
      statusLabel: saveStatus === 'entwurf' ? 'In Arbeit' : 'Fertig',
      content,
    })
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()))
  }, [title, abDatum, saveStatus, content])

  const openNew = () => {
    setEditingId('new')
    setAbDatum(new Date().toISOString().slice(0, 10))
    setTitle('')
    setContent('')
    setSaveStatus('entwurf')
  }

  const openEdit = (g: K2FamilieGeschichte) => {
    if (!kannOrganisch) return
    setEditingId(g.id)
    setAbDatum(g.abDatum)
    setTitle(g.title ?? '')
    setContent(g.content)
    setSaveStatus(isGeschichteInArbeit(g) ? 'entwurf' : 'fertig')
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
        status: saveStatus,
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
          ? {
              ...g,
              title: title.trim() || undefined,
              abDatum: abDatum || g.abDatum,
              content: content.trim() || g.content,
              status: saveStatus,
              updatedAt: now,
            }
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
    const g = geschichten.find((x) => x.id === id)
    if (!g) return
    if (!isGeschichteInArbeit(g) && !kannFertigeLoeschen) return
    const next = geschichten.filter((x) => x.id !== id)
    if (saveGeschichten(currentTenantId, next)) {
      setGeschichten(next)
      if (editingId === id) setEditingId(null)
    }
  }

  const markAlsFertig = (id: string) => {
    if (!kannOrganisch) return
    const now = new Date().toISOString()
    const next = geschichten.map((g) => (g.id === id ? { ...g, status: 'fertig' as const, updatedAt: now } : g))
    if (saveGeschichten(currentTenantId, next)) {
      setGeschichten(next)
    }
  }

  const sorted = useMemo(() => [...geschichten].sort((a, b) => b.abDatum.localeCompare(a.abDatum)), [geschichten])
  const fertigListe = useMemo(() => sorted.filter((g) => !isGeschichteInArbeit(g)), [sorted])
  const inArbeitListe = useMemo(() => sorted.filter(isGeschichteInArbeit), [sorted])

  const druckStyles = `
    .k2-familie-geschichte-root {
      position: relative;
    }
    .k2-familie-geschichte-druck-blatt {
      position: absolute;
      left: -9999px;
      top: 0;
      width: 210mm;
      box-sizing: border-box;
      background: #fffefb;
      color: #1c1a18;
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.45;
    }
    @media print {
      .k2-familie-geschichte-no-print {
        display: none !important;
      }
      .k2-familie-geschichte-druck-blatt {
        position: static !important;
        left: auto !important;
        top: auto !important;
        width: auto !important;
        max-width: none !important;
        padding: 6mm 10mm 14mm 10mm !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .k2-familie-geschichte-druck-blatt .geschichte-druck-fuss {
        margin-top: 1.25rem;
        padding-top: 0.5rem;
        border-top: 1px solid #e0ddd8;
        font-size: 8pt;
        color: #5c5650;
      }
      .k2-familie-geschichte-druck-blatt .seitenfuss {
        display: block;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 8pt;
        color: #666;
        padding: 0.2rem 0;
      }
      .k2-familie-geschichte-druck-blatt .seitenfuss::after {
        content: "Seite " counter(page);
      }
      @page {
        margin: 12mm 14mm 10mm 14mm;
        size: A4;
      }
    }
  `

  return (
    <div className="mission-wrapper k2-familie-geschichte-root">
      <style>{druckStyles}</style>
      <div className="geschichte-screen k2-familie-geschichte-no-print">
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
            background: 'rgba(0,0,0,0.22)',
          }}
        >
          <h2 style={{ fontSize: '1.05rem', color: C.accent, margin: '0 0 0.35rem' }}>Register</h2>
          <p className="meta" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Überblick: fertige Geschichten und solche, die noch <strong style={{ color: C.text }}>in Arbeit</strong> sind. Status beim Speichern wählbar; schnell fertig markieren geht bei Entwürfen mit einem Klick.
          </p>
          {kannOrganisch && !kannFertigeLoeschen && fertigListe.length > 0 ? (
            <p
              className="meta"
              style={{
                fontSize: '0.82rem',
                marginBottom: '1rem',
                padding: '0.65rem 0.75rem',
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: 'rgba(251, 191, 36, 0.12)',
                color: C.textSoft,
              }}
            >
              <strong style={{ color: C.text }}>Hinweis:</strong> Fertige Geschichten kann nur die Inhaber:in löschen. Wichtige Texte bei dir sichern – z. B. mit <strong style={{ color: C.text }}>🖨️ Drucken</strong> und im Dialog „Als PDF speichern“.
            </p>
          ) : null}
          {geschichten.length === 0 ? (
            <p className="meta" style={{ margin: 0 }}>
              Noch keine Geschichten – unten <strong style={{ color: C.text }}>Neue Geschichte anlegen</strong>.
            </p>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={druckAlleAusRegister}
                  title="Alle gespeicherten Geschichten chronologisch drucken (älteste zuerst) – inkl. Entwürfe und ältere Einträge"
                >
                  🖨️ Alle Geschichten drucken
                </button>
              </div>
              <h3 style={{ fontSize: '0.92rem', color: C.text, margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#34d399' }}>●</span> Fertig
                <span className="meta" style={{ fontSize: '0.8rem' }}>({fertigListe.length})</span>
              </h3>
              {fertigListe.length === 0 ? (
                <p className="meta" style={{ margin: '0 0 1rem', fontSize: '0.85rem' }}>
                  Noch keine als fertig markiert.
                </p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.1rem' }}>
                  {fertigListe.map((g) => (
                    <li
                      key={g.id}
                      className="card"
                      style={{
                        marginBottom: '0.5rem',
                        padding: '0.75rem 0.85rem',
                        borderRadius: 10,
                        border: `1px solid ${C.border}`,
                        borderLeft: '4px solid #34d399',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <strong style={{ color: C.text }}>{g.title || `Geschichte ab ${g.abDatum}`}</strong>
                          <span className="meta" style={{ marginLeft: '0.5rem' }}>ab {g.abDatum}</span>
                          {g.content.trim() ? (
                            <p className="meta" style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', maxWidth: '100%' }}>
                              {g.content.trim().length > 120 ? `${g.content.trim().slice(0, 120)}…` : g.content.trim()}
                            </p>
                          ) : null}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button type="button" className="btn-outline" onClick={() => druckGeschichte(g)} title="Drucken oder als PDF speichern">
                            🖨️ Drucken
                          </button>
                          <button type="button" className="btn" disabled={!kannOrganisch} onClick={() => openEdit(g)} style={{ background: C.accent, margin: 0 }}>
                            Bearbeiten
                          </button>
                          <button
                            type="button"
                            className="btn-outline danger"
                            disabled={!kannOrganisch || !kannFertigeLoeschen}
                            onClick={() => remove(g.id)}
                            title={!kannFertigeLoeschen ? 'Nur die Inhaber:in kann fertige Geschichten löschen' : undefined}
                          >
                            Löschen
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <h3 style={{ fontSize: '0.92rem', color: C.text, margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#fbbf24' }}>●</span> In Arbeit
                <span className="meta" style={{ fontSize: '0.8rem' }}>({inArbeitListe.length})</span>
              </h3>
              {inArbeitListe.length === 0 ? (
                <p className="meta" style={{ margin: 0, fontSize: '0.85rem' }}>
                  Keine Entwürfe – oder alles ist schon fertig.
                </p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {inArbeitListe.map((g) => (
                    <li
                      key={g.id}
                      className="card"
                      style={{
                        marginBottom: '0.5rem',
                        padding: '0.75rem 0.85rem',
                        borderRadius: 10,
                        border: `1px solid ${C.border}`,
                        borderLeft: '4px solid #f59e0b',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <strong style={{ color: C.text }}>{g.title || `Geschichte ab ${g.abDatum}`}</strong>
                          <span className="meta" style={{ marginLeft: '0.5rem' }}>ab {g.abDatum}</span>
                          {g.content.trim() ? (
                            <p className="meta" style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', maxWidth: '100%' }}>
                              {g.content.trim().length > 120 ? `${g.content.trim().slice(0, 120)}…` : g.content.trim()}
                            </p>
                          ) : (
                            <p className="meta" style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#fbbf24' }}>
                              Noch leer oder nur Notizen – weiter schreiben.
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button type="button" className="btn-outline" onClick={() => druckGeschichte(g)} title="Drucken oder als PDF speichern">
                            🖨️ Drucken
                          </button>
                          <button type="button" className="btn" disabled={!kannOrganisch} onClick={() => openEdit(g)} style={{ background: C.accent, margin: 0 }}>
                            Bearbeiten
                          </button>
                          <button type="button" className="btn-outline danger" disabled={!kannOrganisch} onClick={() => remove(g.id)}>
                            Löschen
                          </button>
                          <button type="button" className="btn-outline" disabled={!kannOrganisch} onClick={() => markAlsFertig(g.id)} title="Ohne Editor zu öffnen">
                            Als fertig
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

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
              <label className="meta" style={{ display: 'block', marginBottom: '0.25rem' }}>Status</label>
              <select
                value={saveStatus}
                onChange={(e) => setSaveStatus(e.target.value as 'fertig' | 'entwurf')}
                disabled={!kannOrganisch}
                style={{
                  maxWidth: 320,
                  background: 'rgba(0,0,0,0.25)',
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  padding: '0.45rem 0.6rem',
                  fontSize: '0.95rem',
                }}
              >
                <option value="entwurf">In Arbeit</option>
                <option value="fertig">Fertig</option>
              </select>
              <p className="meta" style={{ fontSize: '0.78rem', marginTop: '0.35rem', marginBottom: 0 }}>
                „In Arbeit“ erscheint im Register unter dem orangen Punkt; „Fertig“ unter dem grünen.
              </p>
              {saveStatus === 'fertig' && kannOrganisch && !kannFertigeLoeschen ? (
                <p className="meta" style={{ fontSize: '0.76rem', marginTop: '0.4rem', marginBottom: 0, color: '#fbbf24' }}>
                  Fertige Geschichten löschen kann nur die Inhaber:in. Wichtigen Text bei dir sichern – z. B. 🖨️ Drucken → PDF.
                </p>
              ) : null}
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
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn" disabled={!kannOrganisch} onClick={save} style={{ background: C.accent }}>Speichern</button>
              <button type="button" className="btn-outline" onClick={druckAktuellerEditor} title="Aktuellen Text drucken (auch ohne Speichern)">
                🖨️ Drucken
              </button>
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

      {druckSnapshot ? (
        <div className="k2-familie-geschichte-druck-blatt" aria-hidden="true">
          {druckSnapshot.mode === 'einzel' ? (
            <>
              <p style={{ fontSize: '9pt', color: '#5c5650', margin: 0 }}>K2 Familie · Zusammenfassende Geschichte</p>
              <h1 style={{ fontSize: '16pt', margin: '0.35rem 0 0.4rem', color: '#0f766e' }}>{druckSnapshot.title}</h1>
              <p style={{ fontSize: '10pt', color: '#5c5650', margin: '0 0 0.5rem' }}>
                Ab Datum: {druckSnapshot.abDatum} · Status: {druckSnapshot.statusLabel}
              </p>
              <hr style={{ border: 'none', borderTop: '1px solid #e0ddd8', margin: '0.5rem 0 0.75rem' }} />
              <div style={{ fontSize: '10.5pt' }}>
                {druckSnapshot.content.trim() ? renderGeschichteDruckInhalt(druckSnapshot.content) : <p style={{ color: '#5c5650', margin: 0 }}>(Kein Text)</p>}
              </div>
              <div className="geschichte-druck-fuss">
                <p style={{ margin: '0 0 0.2rem' }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
                <p style={{ margin: 0, color: '#666' }}>{PRODUCT_URHEBER_ANWENDUNG}</p>
              </div>
              <div className="seitenfuss" />
            </>
          ) : (
            <>
              <p style={{ fontSize: '9pt', color: '#5c5650', margin: 0 }}>K2 Familie · Zusammenfassende Geschichte</p>
              <h1 style={{ fontSize: '16pt', margin: '0.35rem 0 0.35rem', color: '#0f766e' }}>Alle Geschichten aus dem Register</h1>
              <p style={{ fontSize: '10pt', color: '#5c5650', margin: '0 0 0.75rem' }}>
                {druckSnapshot.items.length} {druckSnapshot.items.length === 1 ? 'Eintrag' : 'Einträge'} · Reihenfolge: älteste zuerst
              </p>
              <hr style={{ border: 'none', borderTop: '1px solid #e0ddd8', margin: '0 0 0.75rem' }} />
              {druckSnapshot.items.map((g, i) => (
                <section
                  key={g.id}
                  style={{
                    pageBreakBefore: i > 0 ? 'always' : 'auto',
                    marginBottom: i < druckSnapshot.items.length - 1 ? '0' : '0.5rem',
                  }}
                >
                  <h2 style={{ fontSize: '14pt', margin: '0 0 0.25rem', color: '#0f766e', pageBreakAfter: 'avoid' }}>
                    {g.title?.trim() || `Geschichte ab ${g.abDatum}`}
                  </h2>
                  <p style={{ fontSize: '10pt', color: '#5c5650', margin: '0 0 0.5rem' }}>
                    Ab Datum: {g.abDatum} · Status: {isGeschichteInArbeit(g) ? 'In Arbeit' : 'Fertig'}
                  </p>
                  <div style={{ fontSize: '10.5pt' }}>
                    {g.content.trim() ? renderGeschichteDruckInhalt(g.content) : <p style={{ color: '#5c5650', margin: 0 }}>(Kein Text)</p>}
                  </div>
                </section>
              ))}
              <div className="geschichte-druck-fuss">
                <p style={{ margin: '0 0 0.2rem' }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
                <p style={{ margin: 0, color: '#666' }}>{PRODUCT_URHEBER_ANWENDUNG}</p>
              </div>
              <div className="seitenfuss" />
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
