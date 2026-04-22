import { useLayoutEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getK2FamilieMeineFamilieKreineckerPublicUrl,
  getK2FamilieStammbaumKreineckerPublicUrl,
} from '../config/k2FamiliePresentation'
import { BASE_APP_URL, ENTDECKEN_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'

const s = (path: string) => `${BASE_APP_URL}${path}`

export default function LaunchPraesentationBoardPage() {
  const [params] = useSearchParams()
  const meineFamilieUrl = getK2FamilieMeineFamilieKreineckerPublicUrl()
  const stammbaumUrl = getK2FamilieStammbaumKreineckerPublicUrl()

  useLayoutEffect(() => {
    const go = params.get('go')
    if (go === 'stammbaum-kreinecker' || go === 'stammbaum') {
      window.location.replace(getK2FamilieStammbaumKreineckerPublicUrl())
      return
    }
    if (go === 'meine-familie' || go === 'k2-familie-meine') {
      window.location.replace(getK2FamilieMeineFamilieKreineckerPublicUrl())
    }
  }, [params])

  const hasTenant = Boolean(
    String(
      import.meta.env.VITE_K2_FAMILIE_KREINECKER_STAMMBAUM_TENANT_ID ?? '',
    ).trim(),
  )

  return (
    <div
      className="launch-praesentation-board"
      style={{
        minHeight: '100vh',
        margin: 0,
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        background: `
        radial-gradient(ellipse 120% 80% at 50% -20%, rgba(95, 251, 241, 0.12), transparent 50%),
        radial-gradient(ellipse 80% 50% at 100% 100%, rgba(196, 165, 116, 0.08), transparent 45%),
        linear-gradient(165deg, #0a0e12 0%, #121a22 100%)`,
        color: '#e8f4f7',
        padding: 'clamp(1rem, 4vw, 2.5rem)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <header
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid rgba(95, 251, 241, 0.2)',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(1.35rem, 4vw, 1.85rem)',
              fontWeight: 700,
              letterSpacing: '0.04em',
              margin: '0 0 0.35rem 0',
              background: 'linear-gradient(120deg, #e8f4f7 0%, #5ffbf1 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Präsentationsboard
          </h1>
          <p
            style={{
              fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)',
              color: '#8a9ba8',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Live-Seiten <strong style={{ color: '#c4a574', fontWeight: 600 }}>kgm solution</strong> – ein Klick
            öffnet den Browser. USB oder PC, Internet erforderlich.
          </p>
        </header>

        <nav
          className="grid"
          aria-label="Einstiege"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 'clamp(0.75rem, 2vw, 1.1rem)',
          }}
        >
          <Tile
            href={s(ENTDECKEN_ROUTE)}
            emoji="🚪"
            label="Eingangstor"
            hint="Start für Besucher:innen – Weg wählen, Entdecken"
          />
          <Tile
            href={s('/galerie')}
            emoji="🖼"
            label="K2 Galerie"
            hint="Echte Galerie – Kunst & Keramik"
          />
          <Tile
            href={s('/galerie-oeffentlich')}
            emoji="🌐"
            label="ök2 (Demo)"
            hint="Öffentliche Demo – Muster-Galerie"
          />
          <Tile
            href={s(PROJECT_ROUTES.vk2.galerie)}
            emoji="🤝"
            label="VK2"
            hint="Vereinsplattform – Demo-Galerie"
          />
          <Tile
            href={meineFamilieUrl}
            emoji="👨‍👩‍👧"
            label="K2 Familie"
            hint="Meine Familie – mit Mandant aus Vercel (nicht Muster Huber, wenn t gesetzt)"
          />
          <Tile
            href={stammbaumUrl}
            emoji="🌳"
            label="Stammbaum Kreinecker"
            hint="K2 Familie – interaktiver Stammbaum (Mandant aus Server-Konfiguration)"
            id="stammbaum-kreinecker"
          />
        </nav>

        {!hasTenant && (
          <p
            style={{
              marginTop: '1.25rem',
              fontSize: '0.8rem',
              color: '#8a9ba8',
              lineHeight: 1.5,
            }}
          >
            Hinweis: Ohne dieselbe Variable können die Kacheln K2 Familie und Stammbaum je nach Rechner die
            Musterfamilie Huber zeigen. Wert = nur{' '}
            <code style={{ color: '#5ffbf1' }}>t=…</code> aus der Einladung (z.&nbsp;B. <code style={{ color: '#5ffbf1' }}>familie-…</code>).
          </p>
        )}

        <footer
          style={{
            marginTop: 'clamp(1.75rem, 4vw, 2.5rem)',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#8a9ba8',
            lineHeight: 1.6,
          }}
        >
          <p style={{ margin: '0 0 0.5rem 0' }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
          <p style={{ margin: 0 }}>{PRODUCT_URHEBER_ANWENDUNG}</p>
          <p style={{ marginTop: '0.75rem' }}>
            Online-Version:{' '}
            <a
              href="/launch-praesentation-board"
              style={{ color: '#5ffbf1', textDecoration: 'none' }}
            >
              /launch-praesentation-board
            </a>{' '}
            (nach Deploy)
          </p>
        </footer>
      </div>
    </div>
  )
}

function Tile(p: {
  href: string
  emoji: string
  label: string
  hint: string
  id?: string
}) {
  return (
    <a
      className="tile"
      id={p.id}
      href={p.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textDecoration: 'none',
        color: 'inherit',
        background: 'rgba(18, 28, 38, 0.92)',
        border: '1px solid rgba(95, 251, 241, 0.35)',
        borderRadius: 14,
        padding: '1.15rem 1.2rem 1.2rem',
        minHeight: 118,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span style={{ fontSize: '1.5rem', lineHeight: 1, marginBottom: '0.5rem' }} aria-hidden>
        {p.emoji}
      </span>
      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e8f4f7', margin: '0 0 0.35rem 0' }}>
        {p.label}
      </span>
      <span style={{ fontSize: '0.78rem', color: '#8a9ba8', lineHeight: 1.4 }}>{p.hint}</span>
      <span
        style={{
          marginTop: 'auto',
          paddingTop: '0.65rem',
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#5ffbf1',
        }}
      >
        Öffnen →
      </span>
    </a>
  )
}
