/**
 * K2 Agentur E2E – Phase 2: Ein Kanal, ein durchgängiger Weg bis live.
 */

import { useMemo, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  K2_AGENTUR_KANAL_LAUNCH_STEPS,
  K2_AGENTUR_PLATTFORM_CONSOLE_URL,
} from '../../config/k2AgenturLaunchCheckliste'
import { formatFertigeAnzeigeText, getAnzeigenPaket } from '../../config/k2AgenturAnzeigenTexte'
import { formatAuswertungPaketText } from '../../config/k2AgenturAuswertungPaket'
import { formatSchaltPaketText, getSchaltPaket } from '../../config/k2AgenturLaunchCheckliste'
import { K2_AGENTUR_KANAL_PRIORITY } from '../../config/k2AgenturKanalPrioritaet'
import { K2_AGENTUR_GOOGLE_ADS_P1_VIDEO_BILDER_DRUCK_URL } from '../../config/k2AgenturGoogleAdsP1VideoBilder'
import { listMarketingKanalUrls } from '../../config/marketingKanalP1P2P3'
import {
  getKanalChecklistProgress,
  kanalStorageKey,
  markAnzeigenPaketKopiert,
  markAuswertungPaketKopiert,
  markPaketKopiert,
  suggestKanalStatusFromChecklist,
  toggleKanalSchritt,
  type K2AgenturPlattformState,
} from '../../utils/k2AgenturPlattformStorage'

type Props = {
  state: K2AgenturPlattformState
  onPersist: (next: K2AgenturPlattformState) => void
  activeKanalKey: string | null
  setActiveKanalKey: (key: string | null) => void
  onCopyFeedback: (msg: string) => void
  copyText: (text: string) => Promise<boolean>
  schaltenFortschritt: { live: number; total: number }
  onAlleKanaeleListe?: () => void
}

export default function K2AgenturSchaltenEndToEndPanel({
  state,
  onPersist,
  activeKanalKey,
  setActiveKanalKey,
  onCopyFeedback,
  copyText,
  schaltenFortschritt,
  onAlleKanaeleListe,
}: Props) {
  const katalog = useMemo(() => listMarketingKanalUrls(), [])
  const orderedKeys = useMemo(
    () => K2_AGENTUR_KANAL_PRIORITY.map((s) => kanalStorageKey(s.produkt, s.kanal)),
    [],
  )

  const activeKey =
    activeKanalKey && state.kanaele[activeKanalKey] ? activeKanalKey : orderedKeys[0] ?? null

  const meta = activeKey ? katalog.find((r) => kanalStorageKey(r.produkt, r.kanal) === activeKey) : null
  const prog = activeKey ? getKanalChecklistProgress(state, activeKey) : { done: 0, total: 8 }
  const fertigeAnzeige = meta ? getAnzeigenPaket(meta.produkt, meta.kanal) : null
  const schalt = meta ? getSchaltPaket(meta.produkt, meta.kanal) : null
  const shortTitle = meta ? `${meta.produkt.toUpperCase()} · ${meta.kanalLabel}` : ''
  const kanalIndex = activeKey ? orderedKeys.indexOf(activeKey) : -1
  const prevKey = kanalIndex > 0 ? orderedKeys[kanalIndex - 1] : null
  const nextKey = kanalIndex >= 0 && kanalIndex < orderedKeys.length - 1 ? orderedKeys[kanalIndex + 1] : null

  const firstOpenStepIndex = K2_AGENTUR_KANAL_LAUNCH_STEPS.findIndex(
    (step) => activeKey && state.kanalSchritte[activeKey]?.[step.id] !== true,
  )
  const currentStepIdx = firstOpenStepIndex === -1 ? K2_AGENTUR_KANAL_LAUNCH_STEPS.length : firstOpenStepIndex

  const handleFertigeAnzeige = async () => {
    if (!meta || !activeKey) return
    const paket = getAnzeigenPaket(meta.produkt, meta.kanal)
    if (!paket) return
    const ok = await copyText(formatFertigeAnzeigeText(paket))
    if (ok) {
      onPersist(markAnzeigenPaketKopiert(state, activeKey))
      onCopyFeedback('✅ Fertige Anzeige kopiert – jetzt im Ads-Konto einfügen')
    } else {
      onCopyFeedback('⚠️ Kopieren fehlgeschlagen')
    }
  }

  const handlePaket = async () => {
    if (!meta || !activeKey) return
    const paket = getSchaltPaket(meta.produkt, meta.kanal)
    if (!paket) return
    const ok = await copyText(formatSchaltPaketText(paket))
    if (ok) onPersist(markPaketKopiert(state, activeKey))
    onCopyFeedback(ok ? '✅ URL + Kampagne kopiert' : '⚠️ Kopieren fehlgeschlagen')
  }

  if (!meta || !activeKey) {
    return (
      <p style={{ color: '#5c5650', fontSize: '0.9rem' }}>
        Kein Kanal gefunden. Bitte zuerst Phase 1 abschließen.
      </p>
    )
  }

  const kanalComplete = prog.done >= prog.total && prog.total > 0

  return (
    <section
      style={{
        padding: '1rem 1.1rem',
        borderRadius: 12,
        border: '2px solid #b54a1e',
        background: '#fffefb',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b54a1e', letterSpacing: '0.04em' }}>
            END-TO-END · PHASE 2
          </div>
          <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#1c1a18' }}>
            {shortTitle}
          </h2>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#5c5650' }}>
            Kanal {kanalIndex + 1} von {orderedKeys.length} · {schaltenFortschritt.live} bereits live
          </p>
        </div>
        <span
          style={{
            padding: '0.35rem 0.65rem',
            borderRadius: 8,
            background: kanalComplete ? '#dcfce7' : '#fef3c7',
            color: kanalComplete ? '#166534' : '#92400e',
            fontWeight: 800,
            fontSize: '0.82rem',
            alignSelf: 'flex-start',
          }}
        >
          {prog.done}/{prog.total} Schritte
        </span>
      </div>

      {/* Timeline – ein Weg von oben nach unten */}
      <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li style={timelineItem(currentStepIdx === 0 && !kanalComplete)}>
          <TimelineNum done={currentStepIdx > 0 || kanalComplete} n={1} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#1c1a18' }}>Anzeige kopieren</strong>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#5c5650' }}>
              Alles für das Ads-Konto in einem Block
            </p>
            <button
              type="button"
              onClick={handleFertigeAnzeige}
              style={{ ...primaryBtn, width: '100%', maxWidth: 400, marginTop: '0.5rem' }}
            >
              📋 Fertige Anzeige kopieren
            </button>
            {meta.produkt === 'p1' && meta.kanal === 'google' && (
              <a
                href={K2_AGENTUR_GOOGLE_ADS_P1_VIDEO_BILDER_DRUCK_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...linkBtn, display: 'inline-block', marginTop: '0.5rem' }}
              >
                🖼️ Bilder für Google-Video (12 Stück)
              </a>
            )}
            {fertigeAnzeige && (
              <details style={{ marginTop: '0.5rem' }}>
                <summary style={{ cursor: 'pointer', fontSize: '0.82rem', color: '#b54a1e', fontWeight: 600 }}>
                  Vorschau
                </summary>
                <pre
                  style={{
                    marginTop: '0.35rem',
                    padding: '0.5rem',
                    fontSize: '0.72rem',
                    background: '#f6f4f0',
                    borderRadius: 6,
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {formatFertigeAnzeigeText(fertigeAnzeige).slice(0, 600)}…
                </pre>
              </details>
            )}
          </div>
        </li>

        <li style={timelineItem(currentStepIdx >= 1 && currentStepIdx <= 5 && !kanalComplete)}>
          <TimelineNum done={currentStepIdx > 5 || kanalComplete} n={2} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#1c1a18' }}>Im Ads-Konto einrichten &amp; abhaken</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.5rem 0' }}>
              <a
                href={K2_AGENTUR_PLATTFORM_CONSOLE_URL[meta.kanal]}
                target="_blank"
                rel="noopener noreferrer"
                style={linkBtn}
              >
                ↗ Ads-Konto öffnen
              </a>
              <button type="button" onClick={handlePaket} style={linkBtn}>
                Nur URL
              </button>
            </div>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {K2_AGENTUR_KANAL_LAUNCH_STEPS.map((step, i) => {
                const checked = state.kanalSchritte[activeKey]?.[step.id] === true
                const isCurrent = i === currentStepIdx && !kanalComplete
                return (
                  <li key={step.id}>
                    <label
                      title={step.hint}
                      style={{
                        display: 'flex',
                        gap: '0.45rem',
                        alignItems: 'center',
                        padding: '0.4rem 0.5rem',
                        borderRadius: 8,
                        border: isCurrent ? '2px solid #b54a1e' : checked ? '1px solid #6ee7b7' : '1px solid transparent',
                        background: checked ? '#ecfdf5' : isCurrent ? '#fff7ed' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onPersist(toggleKanalSchritt(state, activeKey, step.id, e.target.checked))}
                        style={{ width: 18, height: 18 }}
                      />
                      <span style={{ fontSize: '0.86rem', fontWeight: isCurrent ? 700 : 600, color: '#1c1a18' }}>
                        {step.label}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ol>
          </div>
        </li>

        <li style={timelineItem(currentStepIdx === 6 && !kanalComplete)}>
          <TimelineNum done={currentStepIdx > 6 || kanalComplete} n={3} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#1c1a18' }}>Landing testen</strong>
            <a
              href={meta.landingUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...linkBtn, display: 'inline-block', marginTop: '0.45rem' }}
            >
              ↗ Landing im Browser
            </a>
            {schalt && (
              <Link to={schalt.checkoutPath} style={{ ...linkBtn, display: 'inline-block', marginLeft: '0.4rem' }}>
                Checkout
              </Link>
            )}
          </div>
        </li>

        <li style={timelineItem(false)}>
          <TimelineNum done={kanalComplete} n={4} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#1c1a18' }}>Kanal erledigt</strong>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#5c5650' }}>
              Vorschlag Status: <strong>{suggestKanalStatusFromChecklist(state, activeKey)}</strong>
            </p>
          </div>
        </li>
      </ol>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '0.5rem',
          marginTop: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {prevKey ? (
          <button type="button" onClick={() => setActiveKanalKey(prevKey)} style={navBtn}>
            ◀ Vorheriger Kanal
          </button>
        ) : (
          <span />
        )}
        {nextKey ? (
          <button
            type="button"
            onClick={() => setActiveKanalKey(nextKey)}
            style={{ ...primaryBtn, padding: '0.55rem 1rem' }}
          >
            Nächster Kanal ▶
          </button>
        ) : (
          <span style={{ fontSize: '0.88rem', color: '#166534', fontWeight: 700 }}>✅ Alle Kanäle durch</span>
        )}
      </div>

      {onAlleKanaeleListe && (
        <p style={{ margin: '0.85rem 0 0', fontSize: '0.82rem', color: '#5c5650' }}>
          <button type="button" onClick={onAlleKanaeleListe} style={textLinkBtn}>
            Alle 9 Kanäle als Liste (Werkzeuge)
          </button>
        </p>
      )}
    </section>
  )
}

function TimelineNum({ done, n }: { done: boolean; n: number }) {
  return (
    <span
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: done ? '#16a34a' : '#b54a1e',
        color: '#fff',
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {done ? '✓' : n}
    </span>
  )
}

function timelineItem(active: boolean): CSSProperties {
  return {
    display: 'flex',
    gap: '0.75rem',
    padding: '0.75rem 0',
    borderBottom: '1px solid #ebe8e2',
    background: active ? 'rgba(255,247,237,0.5)' : undefined,
    margin: active ? '0 -0.5rem' : undefined,
    paddingLeft: active ? '0.5rem' : undefined,
    paddingRight: active ? '0.5rem' : undefined,
    borderRadius: active ? 8 : undefined,
  }
}

const primaryBtn: CSSProperties = {
  padding: '0.7rem 1rem',
  borderRadius: 10,
  border: 'none',
  background: '#b54a1e',
  color: '#fff',
  fontWeight: 800,
  fontSize: '0.95rem',
  cursor: 'pointer',
}

const linkBtn: CSSProperties = {
  padding: '0.4rem 0.75rem',
  borderRadius: 8,
  border: '1px solid #c4b8a8',
  background: '#fffefb',
  color: '#1c1a18',
  fontWeight: 700,
  fontSize: '0.82rem',
  textDecoration: 'none',
  cursor: 'pointer',
}

const navBtn: CSSProperties = {
  padding: '0.45rem 0.75rem',
  borderRadius: 8,
  border: '1px solid #c4b8a8',
  background: '#f6f4f0',
  color: '#1c1a18',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
}

const textLinkBtn: CSSProperties = {
  border: 'none',
  background: 'none',
  color: '#b54a1e',
  fontWeight: 700,
  fontSize: '0.82rem',
  cursor: 'pointer',
  textDecoration: 'underline',
  padding: 0,
}
