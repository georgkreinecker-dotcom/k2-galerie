import { useLayoutEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getK2FamilieMeineFamilieKreineckerPublicUrl,
  getK2FamilieStammbaumKreineckerPublicUrl,
} from '../config/k2FamiliePresentation'
import { hasKreineckerStammbaumTenantInBuildEnv } from '../data/k2FamilieKreineckerStammbaumQuelle'
import { BASE_APP_URL, ENTDECKEN_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'

const s = (path: string) => `${BASE_APP_URL}${path}`

/** Anker: sichtbarer Hinweis, wenn im Build kein Mandant für Kreinecker gesetzt ist (sonst Huber-Falle). */
const LAUNCH_PRAESENTATION_BOARD_KEIN_KREINECKER_T_ANKER = 'k2-familie-mandant-env' as const

/** Öffentlicher Link mit Kreinecker-Mandant: muss ?t=familie-… haben, sonst zeigt die App oft Muster Huber. */
function publicK2FamilieUrlHasTenantT(absUrl: string): boolean {
  try {
    const u = new URL(absUrl)
    return Boolean(u.searchParams.get('t')?.trim())
  } catch {
    return false
  }
}

export default function LaunchPraesentationBoardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const meineFamilieUrl = getK2FamilieMeineFamilieKreineckerPublicUrl()
  const stammbaumUrl = getK2FamilieStammbaumKreineckerPublicUrl()

  /**
   * ?go= aus Lesezeichen/QR/statischer HTML: nur ersetzen, wenn Ziel-URL `t` hat (Vercel-Env).
   * Ohne `t` nicht auf nackten Stammbaum/Meine Familie – sonst Fallback Huber.
   */
  useLayoutEffect(() => {
    const go = (searchParams.get('go') || '').trim().toLowerCase()
    if (go === 'stammbaum-kreinecker' || go === 'stammbaum') {
      const target = getK2FamilieStammbaumKreineckerPublicUrl()
      if (publicK2FamilieUrlHasTenantT(target)) {
        window.location.replace(target)
      } else {
        /** Kein `t` im Build: nicht auf nackten Stammbaum – Huber. Stattdessen Hinweis-Anker. */
        window.location.replace(
          `${s('/launch-praesentation-board')}#${LAUNCH_PRAESENTATION_BOARD_KEIN_KREINECKER_T_ANKER}`,
        )
      }
    } else if (go === 'meine-familie' || go === 'k2-familie-meine') {
      const target = getK2FamilieMeineFamilieKreineckerPublicUrl()
      if (publicK2FamilieUrlHasTenantT(target)) {
        window.location.replace(target)
      } else {
        window.location.replace(
          `${s('/launch-praesentation-board')}#${LAUNCH_PRAESENTATION_BOARD_KEIN_KREINECKER_T_ANKER}`,
        )
      }
    }
  }, [searchParams, setSearchParams])

  const hasTenant = hasKreineckerStammbaumTenantInBuildEnv()
  const boardMitAnkerOhneT = `${s('/launch-praesentation-board')}#${LAUNCH_PRAESENTATION_BOARD_KEIN_KREINECKER_T_ANKER}`
  /** Ohne gültiges `t` im Build: Kacheln dürfen nicht auf nackten Stammbaum/Meine Familie zeigen. */
  const stammbaumTileHref = hasTenant ? stammbaumUrl : boardMitAnkerOhneT
  const meineFamilieTileHref = hasTenant ? meineFamilieUrl : boardMitAnkerOhneT

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

        {!hasTenant && (
          <div
            id={LAUNCH_PRAESENTATION_BOARD_KEIN_KREINECKER_T_ANKER}
            role="status"
            style={{
              marginBottom: '1.25rem',
              padding: '0.9rem 1rem',
              borderRadius: 12,
              border: '1px solid rgba(220, 120, 80, 0.55)',
              background: 'rgba(40, 24, 18, 0.75)',
              color: '#f0e6e0',
              fontSize: '0.88rem',
              lineHeight: 1.55,
            }}
          >
            <strong style={{ display: 'block', marginBottom: '0.35rem', color: '#ffb59a' }}>
              Mandant für „Kreinecker“ / Stammbaum fehlt im Server-Build
            </strong>
            Ohne <code style={{ color: '#5ffbf1' }}>?t=familie-…</code> in der URL zeigt K2 Familie die{' '}
            <strong>Musterfamilie Huber</strong> – auch wenn die Kachel „Kreinecker“ heißt. In Vercel →
            Environment → <code style={{ color: '#5ffbf1' }}>VITE_K2_FAMILIE_KREINECKER_STAMMBAUM_TENANT_ID</code>{' '}
            (oder <code style={{ color: '#5ffbf1' }}>VITE_K2_FAMILIE_APF_MEINE_FAMILIE_TENANT_ID</code>) auf die
            echte Familien-ID setzen, neu deployen. Dann führen die Kacheln mit dem richtigen Mandanten in die App –{' '}
            <strong>nicht</strong> die Arbeitsplattform; ein zweiter Tab bleibt nur, wenn der Browser „Neues
            Fenster“ für den Link nutzt.
          </div>
        )}

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
            href={meineFamilieTileHref}
            emoji="👨‍👩‍👧"
            label="K2 Familie"
            hint="Meine Familie – mit Mandant aus Vercel (nicht Muster Huber, wenn t gesetzt)"
            id="launch-tile-k2-familie-meine"
            openInNewTab={hasTenant}
          />
          <Tile
            href={stammbaumTileHref}
            emoji="🌳"
            label="Stammbaum Kreinecker"
            hint="K2 Familie – interaktiver Stammbaum (Mandant aus Server-Konfiguration)"
            id="launch-tile-stammbaum-kreinecker"
            openInNewTab={hasTenant}
          />
        </nav>

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
  /** Ohne Mandant im Build: gleicher Tab + Anker, damit kein Leer-Tab und Hinweis sichtbar. */
  openInNewTab?: boolean
}) {
  const openInNewTab = p.openInNewTab !== false
  return (
    <a
      className="tile"
      id={p.id}
      href={p.href}
      {...(openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
