import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES, K2_GALERIE_APF_EINSTIEG } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { TexteSchreibtischBoard } from '../components/TexteSchreibtischBoard'

const R = PROJECT_ROUTES['k2-galerie']

/** Handbuch-Dokument in der APf (Smart Panel rechts) – gleicher Mechanismus wie beim Kompass */
function handbuchApf(docFile: string) {
  return `/projects/k2-galerie?page=handbuch&doc=${encodeURIComponent(docFile)}`
}

type Zettel = {
  id: string
  titel: string
  zweck: string
  to: string
  rotateDeg?: number
}

type Bereich = {
  id: string
  titel: string
  untertitel: string
  akzent: string
  zoneBg: string
  zettel: Zettel[]
}

const BEREICHE: Bereich[] = [
  {
    id: 'eroeffnung',
    titel: 'Eröffnung & Freund:innen',
    untertitel: 'Persönliche Einladung und Erklärung – mehrere Entwürfe liegen nebeneinander, du wählst oder kombinierst.',
    akzent: '#b54a6e',
    zoneBg: 'linear-gradient(145deg, rgba(181,74,110,0.09), rgba(254,243,248,0.95))',
    zettel: [
      {
        id: 'einladung',
        titel: 'Einladung 24.–26.04.',
        zweck: 'Mail & WhatsApp – Hauptentwurf',
        to: R.notizenEinladungEroeffnung24,
        rotateDeg: -0.6,
      },
      {
        id: 'freunde',
        titel: 'Für meine Freunde',
        zweck: 'Lesefassung zum Zeigen / Drucken',
        to: '/freunde-erklaerung.html',
        rotateDeg: 0.4,
      },
      {
        id: 'prospekt',
        titel: 'Prospekt Galerieeröffnung',
        zweck: 'Eine Seite, druckbar',
        to: R.prospektGalerieeroeffnung,
        rotateDeg: -0.3,
      },
      {
        id: 'plakat',
        titel: 'Plakat Galerieeröffnung',
        zweck: 'A3, aus Event & Stammdaten',
        to: R.plakatGalerieeroeffnung,
        rotateDeg: 0.28,
      },
    ],
  },
  {
    id: 'briefe',
    titel: 'Persönliche Briefe',
    untertitel: 'August, Andreas, Softwarestand – eigene Stelle auf dem Tisch.',
    akzent: '#0f766e',
    zoneBg: 'linear-gradient(145deg, rgba(15,118,110,0.08), rgba(240,253,250,0.96))',
    zettel: [
      {
        id: 'august',
        titel: 'Brief an August',
        zweck: 'Persönlicher Vermächtnis-Ton',
        to: R.notizenBriefAugust,
        rotateDeg: 0.5,
      },
      {
        id: 'andreas',
        titel: 'Brief an Andreas',
        zweck: 'Stand zeigen',
        to: R.notizenBriefAndreas,
        rotateDeg: -0.45,
      },
      {
        id: 'softwarestand',
        titel: 'August – Softwarestand',
        zweck: 'Technischer Überblick',
        to: R.notizenAugustSoftwarestand,
        rotateDeg: 0.35,
      },
    ],
  },
  {
    id: 'oeffentlich',
    titel: 'Öffentlichkeit & Mappe',
    untertitel: 'Kampagne, Werbeunterlagen, Presse-Arbeit – Materialien wie auf der anderen Tischhälfte.',
    akzent: '#b45309',
    zoneBg: 'linear-gradient(145deg, rgba(180,83,9,0.07), rgba(255,251,235,0.97))',
    zettel: [
      {
        id: 'kampagne',
        titel: 'Kampagne Marketing-Strategie',
        zweck: 'Auftrag, Strategie, Vorlagen-Ordner',
        to: R.kampagneMarketingStrategie,
        rotateDeg: -0.35,
      },
      {
        id: 'werbung',
        titel: 'Werbeunterlagen',
        zweck: 'Flyer, Mappe, Außenauftritt',
        to: R.werbeunterlagen,
        rotateDeg: 0.55,
      },
      {
        id: 'presse',
        titel: 'Event- und Medienplanung',
        zweck: 'Im Admin – Presse & Medien',
        to: '/admin?tab=presse',
        rotateDeg: -0.2,
      },
      {
        id: 'oeff-arbeit',
        titel: 'Öffentlichkeitsarbeit',
        zweck: 'Eventplan – Öffentlichkeit',
        to: '/admin?tab=eventplan&eventplan=öffentlichkeitsarbeit&openModal=1',
        rotateDeg: 0.3,
      },
    ],
  },
  {
    id: 'register',
    titel: 'Register auf dem Tisch',
    untertitel: 'Kompass und Zentrale Themen – wenn du die tabellarische Übersicht oder das große Bild brauchst.',
    akzent: '#1d4ed8',
    zoneBg: 'linear-gradient(145deg, rgba(29,78,216,0.06), rgba(239,246,255,0.98))',
    zettel: [
      {
        id: 'kompass',
        titel: 'Texte & Briefe Kompass',
        zweck: 'Welcher Text wofür – Handbuch',
        to: handbuchApf('24-TEXTE-BRIEFE-KOMPASS.md'),
        rotateDeg: 0.25,
      },
      {
        id: 'themen',
        titel: 'Zentrale Themen',
        zweck: 'Nutzer:innen – große Linie',
        to: handbuchApf('16-ZENTRALE-THEMEN-FUER-NUTZER.md'),
        rotateDeg: -0.4,
      },
      {
        id: 'notfall',
        titel: 'Notfall-Checkliste',
        zweck: 'Wenn es brennt',
        to: handbuchApf('23-NOTFALL-CHECKLISTE.md'),
        rotateDeg: 0.15,
      },
    ],
  },
]

function zettelDragPayload(z: Zettel): string {
  return `## ${z.titel}\n${z.zweck}\n\n[Öffnen](${z.to})`
}

/** Eine Schublade im Hängeordner: Zettelzahl von außen sichtbar, einklappbar, innen blättern ohne sofort die volle Seite zu öffnen */
function HangeregisterSchublade({ b }: { b: Bereich }) {
  const [eingeklappt, setEingeklappt] = useState(false)
  const [zettelIndex, setZettelIndex] = useState(0)
  const n = b.zettel.length
  const safeIdx = n === 0 ? 0 : Math.min(zettelIndex, n - 1)
  const z = n > 0 ? b.zettel[safeIdx] : null
  const rot = z?.rotateDeg ?? 0

  const goPrev = () => {
    if (n < 2) return
    setZettelIndex((i) => (i <= 0 ? n - 1 : i - 1))
  }
  const goNext = () => {
    if (n < 2) return
    setZettelIndex((i) => (i >= n - 1 ? 0 : i + 1))
  }

  const zettelLabel = n === 1 ? '1 Zettel' : `${n} Zettel`

  return (
    <section
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        borderRadius: '6px 6px 10px 10px',
        padding: '0.5rem 0.65rem 0.85rem',
        background: `linear-gradient(180deg, ${b.akzent}18 0%, ${b.zoneBg} 28%, ${b.zoneBg} 100%)`,
        border: '1px solid rgba(28,26,24,0.22)',
        borderTop: '1px solid rgba(255,255,255,0.22)',
        boxShadow:
          '0 2px 0 rgba(255,255,255,0.15), 0 6px 14px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.35)',
      }}
    >
      <div
        aria-hidden
        style={{
          alignSelf: 'center',
          width: '52%',
          maxWidth: 120,
          height: 9,
          marginBottom: '0.55rem',
          borderRadius: 4,
          background: 'linear-gradient(180deg, #a89a8c 0%, #7a7168 45%, #5c534c 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.2)',
        }}
      />

      <button
        type="button"
        aria-expanded={!eingeklappt}
        onClick={() => setEingeklappt((v) => !v)}
        style={{
          margin: '0 0 0.2rem',
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
          font: 'inherit',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '0.96rem',
            fontWeight: 800,
            color: '#1c1a18',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.35rem',
            lineHeight: 1.3,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: 999, background: b.akzent, flexShrink: 0, marginTop: '0.35rem' }} aria-hidden />
          <span style={{ flex: '1 1 auto', minWidth: 0 }}>{b.titel}</span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#5c5650',
              background: 'rgba(255,254,251,0.75)',
              padding: '0.15rem 0.45rem',
              borderRadius: 999,
              border: '1px solid rgba(28,26,24,0.1)',
              whiteSpace: 'nowrap',
            }}
            title="Anzahl Zettel in dieser Schublade"
          >
            {zettelLabel}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#5c5650', marginLeft: 'auto' }} aria-hidden>
            {eingeklappt ? '▸' : '▾'}
          </span>
        </h3>
      </button>

      <p
        style={{
          margin: '0 0 0.65rem',
          fontSize: '0.72rem',
          color: '#5c5650',
          lineHeight: 1.42,
          ...(eingeklappt
            ? {
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              }
            : {}),
        }}
      >
        {eingeklappt ? `${b.untertitel} · Tippen zum Aufklappen.` : b.untertitel}
      </p>

      {!eingeklappt && z && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.55rem',
            flex: 1,
            borderRadius: 8,
            padding: '0.4rem 0.25rem 0.15rem',
            background: 'rgba(255,254,251,0.45)',
            boxShadow: 'inset 0 1px 4px rgba(28,26,24,0.06)',
          }}
        >
          {n > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                flexWrap: 'wrap',
                marginBottom: '0.1rem',
              }}
            >
              <button
                type="button"
                onClick={goPrev}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 8,
                  border: '1px solid rgba(28,26,24,0.15)',
                  background: '#fffefb',
                  color: '#1c1a18',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                ← Vorheriger Zettel
              </button>
              <span style={{ fontSize: '0.75rem', color: '#5c5650', fontWeight: 600 }}>
                {safeIdx + 1} / {n}
              </span>
              <button
                type="button"
                onClick={goNext}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 8,
                  border: '1px solid rgba(28,26,24,0.15)',
                  background: '#fffefb',
                  color: '#1c1a18',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                Nächster Zettel →
              </button>
            </div>
          )}

          <div
            draggable
            title="Ziehen = in die Mitte legen · unten: Seite wirklich öffnen"
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', zettelDragPayload(z))
              e.dataTransfer.effectAllowed = 'copy'
            }}
            style={{
              textDecoration: 'none',
              color: '#1c1a18',
              background: 'linear-gradient(180deg, #fffefb 0%, #faf6f0 100%)',
              borderRadius: 12,
              padding: '0.85rem 1rem 1rem',
              boxShadow: '0 3px 0 rgba(28,26,24,0.06), 0 6px 16px rgba(28,26,24,0.08)',
              border: '1px solid rgba(28,26,24,0.08)',
              transform: `rotate(${rot}deg)`,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              minHeight: 88,
              cursor: 'grab',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `rotate(${rot}deg) translateY(-2px)`
              e.currentTarget.style.boxShadow = '0 4px 0 rgba(28,26,24,0.05), 0 10px 24px rgba(28,26,24,0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = `rotate(${rot}deg)`
              e.currentTarget.style.boxShadow = '0 3px 0 rgba(28,26,24,0.06), 0 6px 16px rgba(28,26,24,0.08)'
            }}
          >
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: b.akzent,
                marginBottom: '0.65rem',
                opacity: 0.92,
              }}
            />
            <div style={{ fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.25, marginBottom: '0.35rem' }}>{z.titel}</div>
            <div style={{ fontSize: '0.82rem', color: '#5c5650', lineHeight: 1.4 }}>{z.zweck}</div>
          </div>

          <Link
            to={z.to}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '0.55rem 0.75rem',
              borderRadius: 10,
              background: '#b54a1e',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.84rem',
              textDecoration: 'none',
              border: '1px solid rgba(28,26,24,0.12)',
            }}
          >
            Diese Seite öffnen →
          </Link>
        </div>
      )}
    </section>
  )
}

export default function TexteSchreibtischPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(165deg, #e8dcc8 0%, #f0e6d4 35%, #ebe0cf 70%, #e2d3bc 100%)',
        color: '#1c1a18',
        padding: '1.25rem 1rem 2.5rem',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <Link
          to={K2_GALERIE_APF_EINSTIEG}
          style={{
            color: '#5c5650',
            fontSize: '0.88rem',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '0.75rem',
            fontWeight: 600,
          }}
        >
          ← Zur APf
        </Link>

        <header style={{ marginBottom: '1.1rem' }}>
          <h1 style={{ margin: '0 0 0.35rem', fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            🪑 Texte-Schreibtisch
          </h1>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#5c5650', maxWidth: 52 * 16 }}>
            Oben: ein <strong>Hängeordnerkasten</strong> – die Spalten sind <strong>Schubladen</strong> mit Platz für viele Ordner und Zettel. Zieh in die <strong>Mitte</strong> oder klicke. Darunter der Tisch: schreiben, Vorschau, ablegen, versenden.
          </p>
        </header>

        {/* Ein Kasten: Schubladen nebeneinander; innen können später weitere Ordner/Kästen dazukommen */}
        <section
          aria-labelledby="haengeordner-heading"
          style={{
            marginBottom: '1.75rem',
            padding: '1rem 1rem 1.15rem',
            borderRadius: 14,
            background: 'linear-gradient(165deg, #7a6d62 0%, #5a5149 38%, #4a423c 100%)',
            border: '1px solid rgba(20,18,16,0.35)',
            boxShadow: '0 10px 28px rgba(28,22,16,0.28), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}
        >
          <h2
            id="haengeordner-heading"
            style={{
              margin: '0 0 0.35rem',
              fontSize: '1.08rem',
              fontWeight: 800,
              color: '#faf6f0',
              textShadow: '0 1px 1px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span aria-hidden>🗄️</span> Hängeordnerkasten
          </h2>
          <p
            style={{
              margin: '0 0 1rem',
              fontSize: '0.84rem',
              color: 'rgba(250,246,240,0.88)',
              lineHeight: 1.45,
              maxWidth: 62 * 16,
            }}
          >
            Jede Spalte ist eine <strong>Schublade</strong>: an der Front siehst du <strong>wie viele Zettel</strong> drin sind. Auf die Überschrift tippen = einklappen oder aufklappen. Aufgeklappt kannst du <strong>blättern</strong> (Vor/Zurück) und erst mit <strong>„Diese Seite öffnen“</strong> die volle Seite laden – oder den Zettel in die Mitte ziehen.
          </p>

          {/* Innenfach: leichtes „Fach“ hinter den Schubladen */}
          <div
            style={{
              padding: '0.65rem 0.55rem 0.75rem',
              borderRadius: 10,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(35,32,28,0.35) 100%)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '0.65rem',
                alignItems: 'stretch',
              }}
            >
              {BEREICHE.map((b) => (
                <HangeregisterSchublade key={b.id} b={b} />
              ))}
            </div>
          </div>
        </section>

        <TexteSchreibtischBoard variant="page" />

        <p style={{ marginTop: '1.75rem', fontSize: '0.78rem', color: '#5c5650', lineHeight: 1.5 }}>
          Quelle der Zuordnung:{' '}
          <span style={{ fontFamily: 'monospace', fontSize: '0.74rem' }}>k2team-handbuch/24-TEXTE-BRIEFE-KOMPASS.md</span>
        </p>

        <footer style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(28,26,24,0.12)', fontSize: '0.72rem', color: '#5c5650', lineHeight: 1.55 }}>
          <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
          <div>{PRODUCT_URHEBER_ANWENDUNG}</div>
        </footer>
      </div>
    </div>
  )
}
