/**
 * Runway-Paket ~2 Min – APf: deutsche Sprechertexte + englische Bild-Prompts zum Kopieren.
 * Nur localhost / ?apf=1 / ?dev=1 (siehe shouldShowK2GalerieApfProjectHub).
 */

import { useCallback, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  ENTDECKEN_ROUTE,
  PROJECT_ROUTES,
  shouldShowK2GalerieApfProjectHub,
} from '../config/navigation'
import {
  PROMO_RUNWAY_COMBINED_AUTO_PROMPT_EN,
  PROMO_RUNWAY_FULL_GERMAN_VOICEOVER,
  PROMO_RUNWAY_PACK_VERSION,
  PROMO_RUNWAY_SHOTS,
} from '../config/promoRunwayPack2min'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export default function PromoRunwayPackPage() {
  const [copyHint, setCopyHint] = useState<string | null>(null)

  const onCopy = useCallback(async (label: string, text: string) => {
    const ok = await copyToClipboard(text)
    setCopyHint(ok ? `Kopiert: ${label}` : 'Kopieren fehlgeschlagen (Browser-Berechtigung?)')
    window.setTimeout(() => setCopyHint(null), 2500)
  }, [])

  if (!shouldShowK2GalerieApfProjectHub()) {
    return <Navigate to={ENTDECKEN_ROUTE} replace />
  }

  const promoVideo = PROJECT_ROUTES['k2-galerie'].promoVideoProduktion

  return (
    <article
      style={{
        maxWidth: '860px',
        margin: 0,
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        background: 'var(--k2-bg-1, #1a0f0a)',
        color: 'var(--k2-text, #fff5f0)',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1.55,
      }}
    >
      <header style={{ marginBottom: '1.75rem' }}>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', opacity: 0.85 }}>
          <Link to={promoVideo} style={{ color: '#5ffbf1' }}>
            ← Promo-Video-Produktion
          </Link>
        </p>
        <h1 style={{ margin: '0 0 0.35rem', fontSize: 'clamp(1.35rem, 3vw, 1.75rem)' }}>
          Runway-Paket ~2 Minuten
        </h1>
        <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9 }}>
          Version {PROMO_RUNWAY_PACK_VERSION} · Acht Szenen à ~15 s · Deutsche Texte + englische Runway-Prompts
        </p>
      </header>

      {copyHint && (
        <p
          role="status"
          style={{
            margin: '0 0 1rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 8,
            background: 'rgba(95, 251, 241, 0.12)',
            border: '1px solid rgba(95, 251, 241, 0.35)',
            fontSize: '0.9rem',
          }}
        >
          {copyHint}
        </p>
      )}

      <section style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem', color: '#5ffbf1' }}>
          So nutzt du es in Runway
        </h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.95rem', opacity: 0.95 }}>
          <li>
            <strong>Gen-3 Alpha Multi-Shot Video</strong>: Modus <strong>Auto</strong> → unten „Kombinierter Auto-Prompt“
            kopieren.
          </li>
          <li>
            Oder <strong>pro Szene</strong>: jeweils englischen Prompt kopieren; bei 10-s-Clips mehrere Läufe und im Schnitt
            verbinden.
          </li>
          <li>
            <strong>Echte Screens</strong> parallel: QuickTime ök2 auf den angegebenen Routen – siehe „Screen-Hinweis“
            pro Szene.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#5ffbf1' }}>Gesamter deutscher Sprechertext</h2>
          <button
            type="button"
            onClick={() => onCopy('Gesamter Sprechertext', PROMO_RUNWAY_FULL_GERMAN_VOICEOVER)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 8,
              border: '1px solid #b54a1e',
              background: '#b54a1e',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Kopieren
          </button>
        </div>
        <pre
          style={{
            margin: 0,
            padding: '0.85rem 1rem',
            borderRadius: 8,
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.12)',
            fontSize: '0.88rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {PROMO_RUNWAY_FULL_GERMAN_VOICEOVER}
        </pre>
      </section>

      <section style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#5ffbf1' }}>Kombinierter Auto-Prompt (englisch)</h2>
          <button
            type="button"
            onClick={() => onCopy('Auto-Prompt EN', PROMO_RUNWAY_COMBINED_AUTO_PROMPT_EN)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 8,
              border: '1px solid #b54a1e',
              background: '#b54a1e',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Kopieren
          </button>
        </div>
        <pre
          style={{
            margin: 0,
            padding: '0.85rem 1rem',
            borderRadius: 8,
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.12)',
            fontSize: '0.8rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '320px',
            overflow: 'auto',
          }}
        >
          {PROMO_RUNWAY_COMBINED_AUTO_PROMPT_EN}
        </pre>
      </section>

      <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem', color: '#5ffbf1' }}>Szenen</h2>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {PROMO_RUNWAY_SHOTS.map((shot) => (
          <li
            key={shot.index}
            style={{
              marginBottom: '1.35rem',
              padding: '1rem 1.1rem',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '1rem' }}>
                {shot.index}. {shot.titleDe}
              </strong>
              <span style={{ fontSize: '0.8rem', opacity: 0.75 }}>~{shot.secondsSuggested} s</span>
            </div>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.95rem' }}>{shot.deVoiceover}</p>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.82rem', opacity: 0.8 }}>
              <strong>Screen-Hinweis:</strong> {shot.oek2ScreenHint}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.65rem' }}>
              <button
                type="button"
                onClick={() => onCopy(`Szene ${shot.index} DE`, shot.deVoiceover)}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.25)',
                  background: 'transparent',
                  color: '#fff5f0',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                Sprechertext kopieren
              </button>
              <button
                type="button"
                onClick={() => onCopy(`Szene ${shot.index} EN Prompt`, shot.enRunwayPrompt)}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: 8,
                  border: '1px solid #b54a1e',
                  background: '#b54a1e',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                Runway-Prompt kopieren
              </button>
            </div>
            <pre
              style={{
                margin: '0.65rem 0 0',
                padding: '0.65rem 0.75rem',
                borderRadius: 8,
                background: 'rgba(0,0,0,0.3)',
                fontSize: '0.78rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '180px',
                overflow: 'auto',
              }}
            >
              {shot.enRunwayPrompt}
            </pre>
          </li>
        ))}
      </ol>

      <footer
        style={{
          marginTop: '2.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          fontSize: '0.82rem',
          opacity: 0.88,
        }}
      >
        <p style={{ margin: '0 0 0.35rem' }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
        <p style={{ margin: 0 }}>{PRODUCT_URHEBER_ANWENDUNG}</p>
      </footer>
    </article>
  )
}
