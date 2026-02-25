import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

/** Basis-URL für Notizen (public/notizen-georg wird von Vercel ausgeliefert) */
const NOTIZEN_BASE = '/notizen-georg'

const sections = [
  {
    id: 'diverses',
    title: '📁 Diverses',
    desc: 'Briefe an Freunde, Gedanken über Gott und die Welt',
    items: [
      { label: 'Brief an August', href: `${NOTIZEN_BASE}/diverses/brief-an-august.md` },
    ],
  },
]

export default function NotizenPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1b2e 0%, #16213e 100%)',
      color: '#e9d5ff',
      padding: '2rem 1.5rem',
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Link
          to={PROJECT_ROUTES['k2-galerie'].home}
          style={{ color: 'rgba(233,213,255,0.7)', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}
        >
          ← Zurück zur APf
        </Link>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
          📝 Georgs Notizen
        </h1>
        <p style={{ margin: '0 0 2rem', fontSize: '0.95rem', color: 'rgba(233,213,255,0.8)' }}>
          Briefe, Gedanken, Vermächtnis – alles in verschiedenen Ordnern.
        </p>
        {sections.map(sec => (
          <section key={sec.id} style={{ marginBottom: '2rem' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 600, color: '#c4b5fd' }}>
              {sec.title}
            </h2>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'rgba(233,213,255,0.65)' }}>
              {sec.desc}
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', listStyle: 'disc' }}>
              {sec.items.map(item => (
                <li key={item.label} style={{ marginBottom: '0.5rem' }}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#a78bfa', textDecoration: 'underline' }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'rgba(233,213,255,0.5)' }}>
          Quelle im Projekt: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '0.1rem 0.35rem', borderRadius: 4 }}>docs/notizen-georg/</code>
        </p>
      </div>
    </div>
  )
}
