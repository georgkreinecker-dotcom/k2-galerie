/**
 * K2 Agentur – APf-Arbeitsplattform (Kanäle P1/P2/P3 verwalten).
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { K2_GALERIE_APF_EINSTIEG, PROJECT_ROUTES } from '../../config/navigation'
import { listMarketingKanalUrls, type MarketingProduktId } from '../../config/marketingKanalP1P2P3'
import {
  countK2AgenturByStatus,
  getGlobalChecklistProgress,
  kanalStorageKey,
  loadK2AgenturPlattform,
  markPaketKopiert,
  saveK2AgenturPlattform,
  sumBudgetEurMonat,
  type K2AgenturKanalStatus,
  type K2AgenturPlattformState,
} from '../../utils/k2AgenturPlattformStorage'
import { formatSchaltPaketText, getSchaltPaket } from '../../config/k2AgenturLaunchCheckliste'
import { getNextRecommendedKanal } from '../../config/k2AgenturKanalPrioritaet'
import K2AgenturLaunchChecklistePanel from './K2AgenturLaunchChecklistePanel'
import K2AgenturSteuerzentralePanel from './K2AgenturSteuerzentralePanel'

const R = PROJECT_ROUTES['k2-galerie']

const STATUS_LABEL: Record<K2AgenturKanalStatus, string> = {
  offen: '○ Noch offen',
  vorbereitet: '◐ Vorbereitet',
  live: '● Live',
  pausiert: '⏸ Pausiert',
}

const STATUS_COLOR: Record<K2AgenturKanalStatus, { bg: string; border: string; text: string }> = {
  offen: { bg: '#fef2f2', border: '#dc2626', text: '#991b1b' },
  vorbereitet: { bg: '#fff7ed', border: '#ea580c', text: '#9a3412' },
  live: { bg: '#ecfdf5', border: '#16a34a', text: '#166534' },
  pausiert: { bg: '#f5f5f4', border: '#78716c', text: '#44403c' },
}

const PRODUKT_FILTER: Array<{ id: 'alle' | MarketingProduktId; label: string }> = [
  { id: 'alle', label: 'Alle' },
  { id: 'p1', label: 'P1 Galerie' },
  { id: 'p2', label: 'P2 VK2' },
  { id: 'p3', label: 'P3 Familie' },
]

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}

export default function K2AgenturPlattformWorkplace() {
  const [state, setState] = useState<K2AgenturPlattformState>(() => loadK2AgenturPlattform())
  const [filter, setFilter] = useState<'alle' | MarketingProduktId>('alle')
  const [view, setView] = useState<'kanaele' | 'checkliste'>('checkliste')
  const [openChecklistKanal, setOpenChecklistKanal] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [copyHint, setCopyHint] = useState<string | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const katalog = useMemo(() => listMarketingKanalUrls(), [])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  const persist = useCallback((next: K2AgenturPlattformState) => {
    setState(next)
    saveK2AgenturPlattform(next)
    setSavedAt(Date.now())
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => setSavedAt(null), 2500)
  }, [])

  const patchKanal = useCallback(
    (key: string, patch: Partial<K2AgenturPlattformState['kanaele'][string]>) => {
      setState((prev) => {
        const row = prev.kanaele[key]
        if (!row) return prev
        const next = {
          ...prev,
          kanaele: { ...prev.kanaele, [key]: { ...row, ...patch } },
        }
        saveK2AgenturPlattform(next)
        setSavedAt(Date.now())
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(() => setSavedAt(null), 2500)
        return next
      })
    },
    [],
  )

  const counts = countK2AgenturByStatus(state)
  const globalProg = getGlobalChecklistProgress(state)
  const budgetSum = sumBudgetEurMonat(state)
  const nextKanal = getNextRecommendedKanal(state)
  const rows = katalog.filter((r) => filter === 'alle' || r.produkt === filter)

  const handleCopy = async (url: string, label: string, kanalKey?: string) => {
    const ok = await copyText(url)
    if (kanalKey && ok) {
      const next = markPaketKopiert(state, kanalKey)
      setState(next)
      saveK2AgenturPlattform(next)
      setSavedAt(Date.now())
    }
    setCopyHint(
      ok
        ? kanalKey
          ? `✅ ${label} – Schalt-Paket/URL kopiert, Checkliste aktualisiert`
          : `✅ ${label} – Link kopiert`
        : `⚠️ Kopieren fehlgeschlagen – Link markieren`,
    )
    setTimeout(() => setCopyHint(null), 2800)
  }

  const handleCopyPaket = async (produkt: MarketingProduktId, kanal: (typeof katalog)[0]['kanal'], label: string) => {
    const key = kanalStorageKey(produkt, kanal)
    const paket = getSchaltPaket(produkt, kanal)
    if (!paket) return
    const ok = await copyText(formatSchaltPaketText(paket))
    if (ok) {
      const next = markPaketKopiert(state, key)
      persist(next)
    }
    setCopyHint(ok ? `✅ ${label} – Schalt-Paket kopiert` : `⚠️ Kopieren fehlgeschlagen`)
    setTimeout(() => setCopyHint(null), 2800)
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 0 2.5rem' }}>
      <header
        style={{
          marginBottom: '1.25rem',
          padding: '1.1rem 1.2rem',
          borderRadius: 12,
          border: '1px solid #d4c8b8',
          background: 'linear-gradient(145deg, #fffefb 0%, #f6f4f0 100%)',
        }}
      >
        <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.5rem', fontWeight: 700, color: '#1c1a18' }}>
          K2 Agentur
        </h1>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.92rem', color: '#5c5650', lineHeight: 1.55, maxWidth: 720 }}>
          Unsere <strong>eigene Internet-Agentur</strong> auf der APf – Plan B ohne Fixhonorar. Tab{' '}
          <strong>Checkliste</strong>: Schritt für Schritt abhaken + Schalt-Paket kopieren. Tab <strong>Kanäle</strong>:
          Status, Budget, URLs. Einmal-Konten: {globalProg.done}/{globalProg.total} erledigt.
          {budgetSum > 0 && (
            <>
              {' '}
              · Summe Monatsbudgets: <strong>{budgetSum} €</strong>
            </>
          )}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
          <Link
            to={K2_GALERIE_APF_EINSTIEG}
            style={linkBtnStyle('#f6f4f0', '#b54a1e', '#b54a1e')}
          >
            ← APf
          </Link>
          <a
            href="/texte-schreibtisch/marketing-kanaele-p1-p2-p3.html"
            target="_blank"
            rel="noopener noreferrer"
            style={linkBtnStyle('#fffefb', '#0d9488', '#0d9488')}
          >
            📄 Alle 9 Links (Druck)
          </a>
          <Link to={R.werbefahrplan} style={linkBtnStyle('#fffefb', '#1c1a18', '#c4b8a8')}>
            Werbefahrplan
          </Link>
          <Link to={R.marketingOek2} style={linkBtnStyle('#fffefb', '#1c1a18', '#c4b8a8')}>
            mök2
          </Link>
          <Link to="/mission-control" style={linkBtnStyle('#fffefb', '#1c1a18', '#c4b8a8')}>
            Mission Control
          </Link>
          {savedAt != null && (
            <span style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>✅ Gespeichert</span>
          )}
          {copyHint && (
            <span style={{ fontSize: '0.82rem', color: '#1d4ed8', fontWeight: 600 }}>{copyHint}</span>
          )}
        </div>
      </header>

      {nextKanal && (
        <section
          style={{
            marginBottom: '1rem',
            padding: '0.85rem 1rem',
            borderRadius: 12,
            border: '2px solid #b54a1e',
            background: '#fff7ed',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.65rem',
            alignItems: 'center',
          }}
        >
          <span style={{ flex: 1, fontSize: '0.9rem', color: '#1c1a18', lineHeight: 1.45 }}>
            <strong>Nächster Kanal (Reihenfolge):</strong> {nextKanal.produktLabel} · {nextKanal.kanalLabel} –{' '}
            {nextKanal.progressDone}/{nextKanal.progressTotal} Schritte erledigt
          </span>
          <button
            type="button"
            onClick={() => {
              setView('checkliste')
              setOpenChecklistKanal(nextKanal.key)
            }}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 8,
              border: 'none',
              background: '#b54a1e',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            → Zur Checkliste
          </button>
        </section>
      )}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.65rem',
          marginBottom: '1.25rem',
        }}
      >
        {(['offen', 'vorbereitet', 'live', 'pausiert'] as K2AgenturKanalStatus[]).map((s) => {
          const c = STATUS_COLOR[s]
          return (
            <div
              key={s}
              style={{
                padding: '0.65rem 0.75rem',
                borderRadius: 10,
                border: `2px solid ${c.border}`,
                background: c.bg,
              }}
            >
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: c.text }}>{counts[s]}</div>
              <div style={{ fontSize: '0.78rem', color: c.text, fontWeight: 600 }}>{STATUS_LABEL[s]}</div>
            </div>
          )
        })}
      </section>

      <div style={{ marginBottom: '1.25rem' }}>
        <K2AgenturSteuerzentralePanel state={state} onPatchKanal={patchKanal} mode="pilot" />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setView('checkliste')}
          style={viewTabStyle(view === 'checkliste')}
        >
          ✅ Checkliste &amp; Schalt-Paket
        </button>
        <button type="button" onClick={() => setView('kanaele')} style={viewTabStyle(view === 'kanaele')}>
          📡 Kanäle-Übersicht
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
        {PRODUKT_FILTER.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setFilter(p.id)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 8,
              border: filter === p.id ? '2px solid #b54a1e' : '1px solid #c4b8a8',
              background: filter === p.id ? '#b54a1e' : '#fffefb',
              color: filter === p.id ? '#fff' : '#1c1a18',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {view === 'checkliste' ? (
        <K2AgenturLaunchChecklistePanel
          state={state}
          onPersist={persist}
          filter={filter}
          onCopyFeedback={setCopyHint}
          copyText={copyText}
          openKanal={openChecklistKanal}
          setOpenKanal={setOpenChecklistKanal}
        />
      ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {rows.map((meta) => {
          const key = kanalStorageKey(meta.produkt, meta.kanal)
          const row = state.kanaele[key]
          if (!row) return null
          const sc = STATUS_COLOR[row.status]
          return (
            <article
              key={key}
              style={{
                padding: '1rem 1.05rem',
                borderRadius: 12,
                border: `1px solid ${sc.border}`,
                background: '#fffefb',
                boxShadow: '0 1px 3px rgba(28,26,24,0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginBottom: '0.65rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#5c5650', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {meta.produkt.toUpperCase()} · {meta.kanalLabel}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1c1a18' }}>{meta.produktLabel}</div>
                  <div style={{ fontSize: '0.8rem', color: '#5c5650', marginTop: '0.2rem' }}>
                    Kampagne: <code style={{ fontSize: '0.78rem' }}>{meta.campaignKey}</code>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'flex-start' }}>
                  <select
                    value={row.status}
                    onChange={(e) =>
                      patchKanal(key, { status: e.target.value as K2AgenturKanalStatus })
                    }
                    style={{
                      padding: '0.35rem 0.5rem',
                      borderRadius: 8,
                      border: `1px solid ${sc.border}`,
                      background: sc.bg,
                      color: sc.text,
                      fontWeight: 600,
                      fontSize: '0.85rem',
                    }}
                  >
                    {(Object.keys(STATUS_LABEL) as K2AgenturKanalStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.82rem',
                      color: '#1c1a18',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={row.kontoEingerichtet}
                      onChange={(e) => patchKanal(key, { kontoEingerichtet: e.target.checked })}
                    />
                    Konto OK
                  </label>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.65rem',
                  marginBottom: '0.65rem',
                }}
              >
                <label style={fieldLabel}>
                  Budget €/Monat (Test)
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="z. B. 200"
                    value={row.budgetEurMonat}
                    onChange={(e) => patchKanal(key, { budgetEurMonat: e.target.value })}
                    style={fieldInput}
                  />
                </label>
                <label style={fieldLabel}>
                  Notizen
                  <input
                    type="text"
                    placeholder="Creatives, Agentur-Kontakt, …"
                    value={row.notizen}
                    onChange={(e) => patchKanal(key, { notizen: e.target.value })}
                    style={fieldInput}
                  />
                </label>
              </div>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: '#5c5650',
                  wordBreak: 'break-all',
                  marginBottom: '0.55rem',
                  padding: '0.45rem 0.55rem',
                  background: '#f6f4f0',
                  borderRadius: 6,
                }}
              >
                {meta.landingUrl}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                <button
                  type="button"
                  onClick={() => handleCopyPaket(meta.produkt, meta.kanal, meta.kanalLabel)}
                  style={primaryBtn}
                >
                  📦 Schalt-Paket kopieren
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(meta.landingUrl, meta.kanalLabel, key)}
                  style={secondaryBtn}
                >
                  📋 Nur URL
                </button>
                <a
                  href={meta.landingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...primaryBtn, textDecoration: 'none', display: 'inline-block' }}
                >
                  ↗ Landing testen
                </a>
                <a
                  href={meta.checkoutPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...linkBtnStyle('#fffefb', '#5c5650', '#c4b8a8'), textDecoration: 'none' }}
                >
                  Checkout-Pfad
                </a>
              </div>
            </article>
          )
        })}
      </div>
      )}

      <section
        style={{
          marginTop: '1.5rem',
          padding: '1rem 1.1rem',
          borderRadius: 12,
          border: '1px solid #d4c8b8',
          background: '#fffefb',
        }}
      >
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: '#1c1a18' }}>Allgemeine Notizen</h2>
        <textarea
          value={state.allgemeinNotizen}
          onChange={(e) => persist({ ...state, allgemeinNotizen: e.target.value.slice(0, 8000) })}
          rows={4}
          placeholder="Agentur-Kontakte, Budget-Gesamt, nächste Schritte …"
          style={{
            width: '100%',
            padding: '0.55rem 0.65rem',
            borderRadius: 8,
            border: '1px solid #c4b8a8',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            color: '#1c1a18',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </section>

      <section
        style={{
          marginTop: '1.25rem',
          padding: '0.85rem 1rem',
          borderRadius: 10,
          border: '1px solid #bae6fd',
          background: '#f0f9ff',
          fontSize: '0.88rem',
          color: '#1c1a18',
          lineHeight: 1.55,
        }}
      >
        <strong>Technik (Joe):</strong> Attribution und Stripe-Metadaten laufen mit. Optional in Vercel:{' '}
        <code>VITE_GA4_MEASUREMENT_ID=G-…</code> für Google Analytics 4.
      </section>
    </div>
  )
}

const fieldLabel: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#5c5650',
}

const fieldInput: CSSProperties = {
  padding: '0.4rem 0.55rem',
  borderRadius: 8,
  border: '1px solid #c4b8a8',
  fontSize: '0.88rem',
  color: '#1c1a18',
  background: '#fffefb',
}

const primaryBtn: CSSProperties = {
  padding: '0.45rem 0.85rem',
  borderRadius: 8,
  border: 'none',
  background: '#b54a1e',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
}

const secondaryBtn: CSSProperties = {
  padding: '0.45rem 0.85rem',
  borderRadius: 8,
  border: '1px solid #c4b8a8',
  background: '#fffefb',
  color: '#1c1a18',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
}

function viewTabStyle(active: boolean): CSSProperties {
  return {
    padding: '0.5rem 0.9rem',
    borderRadius: 8,
    border: active ? '2px solid #0d9488' : '1px solid #c4b8a8',
    background: active ? '#0d9488' : '#fffefb',
    color: active ? '#fff' : '#1c1a18',
    fontWeight: 700,
    fontSize: '0.88rem',
    cursor: 'pointer',
  }
}

function linkBtnStyle(bg: string, color: string, border: string): CSSProperties {
  return {
    padding: '0.35rem 0.7rem',
    borderRadius: 8,
    background: bg,
    border: `1px solid ${border}`,
    color,
    textDecoration: 'none',
    fontSize: '0.84rem',
    fontWeight: 600,
  }
}
