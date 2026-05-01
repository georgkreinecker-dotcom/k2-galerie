/**
 * mök2 – Werbefahrplan: eigene Arbeitsfläche (Übersicht + Bearbeitung).
 * Speicher: werbefahrplanMok2Storage (nur APf).
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../../config/navigation'
import {
  loadMok2Werbefahrplan,
  saveMok2Werbefahrplan,
  createEmptyMok2WerbeKampagne,
  type Mok2WerbeKampagne,
} from '../../utils/werbefahrplanMok2Storage'

function formatDeShort(iso: string): string {
  if (!iso?.trim()) return '–'
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function sortByVon(a: Mok2WerbeKampagne, b: Mok2WerbeKampagne): number {
  const av = a.vonISO || ''
  const bv = b.vonISO || ''
  return av.localeCompare(bv)
}

export default function Mok2WerbefahrplanWorkplace() {
  const [werbeKampagnen, setWerbeKampagnen] = useState<Mok2WerbeKampagne[]>(() => loadMok2Werbefahrplan())
  const [werbeFahrplanSavedAt, setWerbeFahrplanSavedAt] = useState<number | null>(null)
  const werbeSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setWerbeKampagnen(loadMok2Werbefahrplan())
  }, [])

  useEffect(() => {
    return () => {
      if (werbeSaveTimerRef.current) clearTimeout(werbeSaveTimerRef.current)
    }
  }, [])

  const updateWerbeKampagne = useCallback((id: string, patch: Partial<Mok2WerbeKampagne>) => {
    setWerbeKampagnen((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }, [])
  const addWerbeKampagne = useCallback(() => {
    setWerbeKampagnen((prev) => [...prev, createEmptyMok2WerbeKampagne()])
  }, [])
  const removeWerbeKampagne = useCallback((id: string) => {
    setWerbeKampagnen((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)))
  }, [])
  const saveWerbeFahrplan = useCallback(() => {
    saveMok2Werbefahrplan(werbeKampagnen)
    setWerbeFahrplanSavedAt(Date.now())
    if (werbeSaveTimerRef.current) clearTimeout(werbeSaveTimerRef.current)
    werbeSaveTimerRef.current = setTimeout(() => setWerbeFahrplanSavedAt(null), 2800)
  }, [werbeKampagnen])

  const sorted = [...werbeKampagnen].sort(sortByVon)

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto' }}>
      <div
        style={{
          marginBottom: '1.35rem',
          padding: '1rem 1.15rem',
          borderRadius: 12,
          border: '1px solid rgba(95,251,241,0.25)',
          background: 'linear-gradient(135deg, rgba(30,22,18,0.92) 0%, rgba(18,26,32,0.88) 100%)',
        }}
      >
        <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.45rem', fontWeight: 700, color: '#fff5f0' }}>
          Werbefahrplan
        </h1>
        <p style={{ margin: '0 0 0.65rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.55 }}>
          Übersicht wie auf der APf: <strong>Zeitraum</strong> und <strong>Aktivitäten</strong> auf einen Blick, darunter bearbeiten. Nur auf diesem Mac gespeichert.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <Link
            to={PROJECT_ROUTES['k2-galerie'].marketingOek2}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 8,
              background: 'rgba(95,251,241,0.12)',
              border: '1px solid rgba(95,251,241,0.35)',
              color: '#5ffbf1',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            ← Marketing ök2 (Langfassung)
          </Link>
          <Link
            to="/mission-control"
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 8,
              background: 'rgba(181,74,30,0.35)',
              border: '1px solid rgba(255,140,66,0.45)',
              color: '#ffdcc4',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Mission Control (Besucherzahlen)
          </Link>
        </div>
      </div>

      <h2 style={{ fontSize: '1.05rem', color: '#5ffbf1', margin: '0 0 0.65rem', fontWeight: 600 }}>
        Übersicht – nach Startdatum
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.75rem',
        }}
      >
        {sorted.map((k) => {
          const lines = k.aktivitaeten.split('\n').map((s) => s.trim()).filter(Boolean)
          const preview = lines.slice(0, 4)
          return (
            <div
              key={k.id}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 10,
                border: '1px solid rgba(95,251,241,0.28)',
                background: 'rgba(15,28,32,0.65)',
                minHeight: 120,
              }}
            >
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff5f0', marginBottom: '0.35rem', lineHeight: 1.3 }}>
                {k.titel?.trim() || 'Ohne Titel'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#86efac', marginBottom: '0.45rem' }}>
                {formatDeShort(k.vonISO)} → {formatDeShort(k.bisISO)}
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1em', fontSize: '0.78rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.45 }}>
                {preview.length ? preview.map((line) => <li key={line}>{line}</li>) : <li style={{ listStyle: 'none', marginLeft: '-1em', opacity: 0.65 }}>Noch keine Aktivitäten</li>}
              </ul>
            </div>
          )
        })}
      </div>

      <h2 style={{ fontSize: '1.05rem', color: '#5ffbf1', margin: '0 0 0.75rem', fontWeight: 600 }}>
        Details bearbeiten
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '0.85rem' }}>
        <button
          type="button"
          onClick={saveWerbeFahrplan}
          style={{
            padding: '0.45rem 0.95rem',
            borderRadius: 8,
            border: '1px solid #b54a1e',
            background: '#b54a1e',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.88rem',
          }}
        >
          Speichern
        </button>
        <button
          type="button"
          onClick={addWerbeKampagne}
          style={{
            padding: '0.45rem 0.95rem',
            borderRadius: 8,
            border: '1px solid rgba(95,251,241,0.45)',
            background: 'rgba(95,251,241,0.12)',
            color: '#5ffbf1',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.88rem',
          }}
        >
          Neue Kampagne
        </button>
        {werbeFahrplanSavedAt ? (
          <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: '#86efac' }}>Gespeichert.</span>
        ) : null}
      </div>

      {werbeKampagnen.map((k) => (
        <div
          key={k.id}
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            borderRadius: 10,
            border: '1px solid rgba(95,251,241,0.28)',
            background: 'rgba(15,28,32,0.55)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>Kampagne</span>
            {werbeKampagnen.length > 1 ? (
              <button
                type="button"
                onClick={() => removeWerbeKampagne(k.id)}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 6,
                  border: '1px solid rgba(248,113,113,0.5)',
                  background: 'rgba(248,113,113,0.12)',
                  color: '#fecaca',
                  cursor: 'pointer',
                }}
              >
                Entfernen
              </button>
            ) : null}
          </div>
          <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: '#5ffbf1' }}>Titel</label>
          <input
            type="text"
            value={k.titel}
            onChange={(e) => updateWerbeKampagne(k.id, { titel: e.target.value })}
            style={{
              width: '100%',
              maxWidth: '42rem',
              marginBottom: '0.75rem',
              padding: '0.45rem 0.55rem',
              borderRadius: 6,
              border: '1px solid #c4c2bd',
              background: '#fffefb',
              color: '#1c1a18',
              fontSize: '0.9rem',
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#5ffbf1' }}>Von</label>
              <input
                type="date"
                value={k.vonISO}
                onChange={(e) => updateWerbeKampagne(k.id, { vonISO: e.target.value })}
                style={{
                  padding: '0.4rem 0.5rem',
                  borderRadius: 6,
                  border: '1px solid #c4c2bd',
                  background: '#fffefb',
                  color: '#1c1a18',
                  fontSize: '0.88rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#5ffbf1' }}>Bis</label>
              <input
                type="date"
                value={k.bisISO}
                onChange={(e) => updateWerbeKampagne(k.id, { bisISO: e.target.value })}
                style={{
                  padding: '0.4rem 0.5rem',
                  borderRadius: 6,
                  border: '1px solid #c4c2bd',
                  background: '#fffefb',
                  color: '#1c1a18',
                  fontSize: '0.88rem',
                }}
              />
            </div>
          </div>
          <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: '#5ffbf1' }}>Aktivitäten (eine Zeile pro Punkt)</label>
          <textarea
            value={k.aktivitaeten}
            onChange={(e) => updateWerbeKampagne(k.id, { aktivitaeten: e.target.value })}
            rows={6}
            style={{
              width: '100%',
              maxWidth: '48rem',
              padding: '0.5rem 0.6rem',
              borderRadius: 6,
              border: '1px solid #c4c2bd',
              background: '#fffefb',
              color: '#1c1a18',
              fontSize: '0.88rem',
              lineHeight: 1.45,
              resize: 'vertical' as const,
            }}
          />
        </div>
      ))}
    </div>
  )
}
