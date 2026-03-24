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

function ZettelKarte({ z, akzent }: { z: Zettel; akzent: string }) {
  const rot = z.rotateDeg ?? 0
  return (
    <Link
      to={z.to}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: '#1c1a18',
        background: 'linear-gradient(180deg, #fffefb 0%, #faf6f0 100%)',
        borderRadius: 12,
        padding: '0.85rem 1rem 1rem',
        boxShadow: '0 4px 14px rgba(28,26,24,0.1), 0 1px 3px rgba(28,26,24,0.06)',
        border: '1px solid rgba(28,26,24,0.08)',
        transform: `rotate(${rot}deg)`,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        minHeight: 88,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `rotate(${rot}deg) translateY(-2px)`
        e.currentTarget.style.boxShadow = '0 8px 22px rgba(28,26,24,0.14)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${rot}deg)`
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(28,26,24,0.1), 0 1px 3px rgba(28,26,24,0.06)'
      }}
    >
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: akzent,
          marginBottom: '0.65rem',
          opacity: 0.92,
        }}
      />
      <div style={{ fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.25, marginBottom: '0.35rem' }}>
        {z.titel}
      </div>
      <div style={{ fontSize: '0.82rem', color: '#5c5650', lineHeight: 1.4 }}>
        {z.zweck}
      </div>
    </Link>
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

        <header style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ margin: '0 0 0.35rem', fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            🪑 Texte-Schreibtisch
          </h1>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#5c5650', maxWidth: 52 * 16 }}>
            Drumherum liegen die Themen-Zonen wie Zettelstapel. In der <strong>Mitte</strong> arbeitest du: reinziehen, schreiben, ablegen, ansehen, versenden – normaler Tagesablauf.
          </p>
        </header>

        <TexteSchreibtischBoard variant="page" />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            alignItems: 'start',
          }}
        >
          {BEREICHE.map((b) => (
            <section
              key={b.id}
              style={{
                borderRadius: 16,
                padding: '1.1rem 1rem 1.25rem',
                background: b.zoneBg,
                border: `1px solid ${b.akzent}22`,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65)',
              }}
            >
              <h2
                style={{
                  margin: '0 0 0.2rem',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#1c1a18',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 999, background: b.akzent, flexShrink: 0 }} aria-hidden />
                {b.titel}
              </h2>
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#5c5650', lineHeight: 1.45 }}>{b.untertitel}</p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {b.zettel.map((z) => (
                  <ZettelKarte key={z.id} z={z} akzent={b.akzent} />
                ))}
              </div>
            </section>
          ))}
        </div>

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
