/**
 * Hub: gesamte Entwicklungsdoku K2 Familie (docs/K2-FAMILIE-*.md). Einstieg APf: Smart Panel (nicht Homepage-Nav).
 */

import { useMemo, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { loadK2FamilieDevDocs } from '../utils/k2FamilieDevDocsBundle'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'

const ACCENT = '#0d9488'
const ACCENT_DARK = '#0f766e'

function renderSimpleMd(text: string): ReactNode {
  const lines = text.split(/\r?\n/)
  const out: React.ReactNode[] = []
  let i = 0
  let k = 0
  const key = () => `md-${k++}`

  while (i < lines.length) {
    const line = lines[i]
    const t = line.trimStart()
    if (t.startsWith('```')) {
      i++
      const code: string[] = []
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i])
        i++
      }
      if (i < lines.length) i++
      out.push(
        <pre
          key={key()}
          style={{
            background: '#1e293b',
            color: '#e2e8f0',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            overflow: 'auto',
            fontSize: '0.82rem',
            lineHeight: 1.45,
            margin: '0.75rem 0',
          }}
        >
          <code>{code.join('\n')}</code>
        </pre>,
      )
      continue
    }
    if (line.startsWith('# ')) {
      out.push(
        <h1 key={key()} style={{ fontSize: '1.35rem', fontWeight: 700, color: ACCENT_DARK, margin: '1.25rem 0 0.5rem' }}>
          {line.slice(2).trim()}
        </h1>,
      )
      i++
      continue
    }
    if (line.startsWith('## ')) {
      out.push(
        <h2 key={key()} style={{ fontSize: '1.12rem', fontWeight: 650, color: ACCENT, margin: '1rem 0 0.4rem' }}>
          {line.slice(3).trim()}
        </h2>,
      )
      i++
      continue
    }
    if (line.startsWith('### ')) {
      out.push(
        <h3 key={key()} style={{ fontSize: '1.02rem', fontWeight: 600, color: '#1c1a18', margin: '0.85rem 0 0.35rem' }}>
          {line.slice(4).trim()}
        </h3>,
      )
      i++
      continue
    }
    if (t.startsWith('- ') || t.startsWith('* ')) {
      const items: string[] = []
      while (i < lines.length) {
        const L = lines[i]
        const u = L.trimStart()
        if (!u.startsWith('- ') && !u.startsWith('* ')) break
        items.push(u.slice(2).trim())
        i++
      }
      out.push(
        <ul key={key()} style={{ margin: '0.5rem 0 0.75rem', paddingLeft: '1.35rem', lineHeight: 1.55 }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '0.25rem' }}>
              {item}
            </li>
          ))}
        </ul>,
      )
      continue
    }
    if (line.trim() === '') {
      i++
      continue
    }
    const para: string[] = [line.trim()]
    i++
    while (i < lines.length) {
      const L = lines[i]
      if (L.trim() === '') break
      if (L.startsWith('#') || L.trimStart().startsWith('- ') || L.trimStart().startsWith('* ') || L.trim().startsWith('```')) break
      para.push(L.trim())
      i++
    }
    out.push(
      <p key={key()} style={{ margin: '0.5rem 0', lineHeight: 1.65, color: '#1c1a18' }}>
        {para.join(' ')}
      </p>,
    )
  }
  return <>{out}</>
}

export default function K2FamilieEntwicklungDokuPage() {
  const docs = useMemo(() => loadK2FamilieDevDocs(), [])
  const [searchParams, setSearchParams] = useSearchParams()
  const docParam = searchParams.get('doc') ?? ''

  const selected = useMemo(() => docs.find((d) => d.file === docParam) ?? null, [docs, docParam])

  const hub = (
    <>
      <header style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', borderRadius: 12, background: `linear-gradient(135deg, ${ACCENT_DARK} 0%, ${ACCENT} 100%)`, color: '#fff' }}>
        <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 700 }}>Doku & Entwicklung – K2 Familie</h1>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem', opacity: 0.95, lineHeight: 1.45 }}>
          Alle technischen und konzeptionellen Dateien aus <code style={{ background: 'rgba(0,0,0,0.2)', padding: '0.1rem 0.35rem', borderRadius: 4 }}>docs/K2-FAMILIE-*.md</code> – ein Einstieg, kein Suchen im Ordner.
        </p>
      </header>

      <section style={{ background: '#fffefb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <p style={{ margin: '0 0 0.75rem', lineHeight: 1.6, color: '#374151' }}>
          <strong>Benutzerhandbuch</strong> für Endnutzer:innen liegt separat unter{' '}
          <Link to={PROJECT_ROUTES['k2-familie'].benutzerHandbuch} style={{ color: ACCENT_DARK, fontWeight: 600 }}>
            Benutzerhandbuch K2 Familie
          </Link>
          . Hier: Roadmap, Datenmodell, Stammbaum-Analysen, Rechte, Supabase, Lehren aus K2 Galerie usw.
        </p>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#6b7280' }}>
          Gesamtindex aller Projekt-Docs: <code style={{ background: '#f3f4f6', padding: '0.1rem 0.35rem', borderRadius: 4 }}>docs/00-INDEX.md</code> im Repository.
        </p>
      </section>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {docs.map((d) => (
          <li key={d.file}>
            <button
              type="button"
              onClick={() => setSearchParams({ doc: d.file })}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: 10,
                border: `1px solid ${ACCENT}44`,
                background: '#fffefb',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
              }}
            >
              <span style={{ fontWeight: 700, color: ACCENT_DARK, display: 'block' }}>{d.title}</span>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{d.file}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )

  const reader = selected ? (
    <>
      <nav style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setSearchParams({})}
          style={{
            padding: '0.45rem 0.9rem',
            background: ACCENT_DARK,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ← Zur Übersicht
        </button>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{selected.file}</span>
      </nav>
      <article
        style={{
          background: '#fffefb',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: '1.25rem 1.5rem 2rem',
          maxWidth: '52rem',
          margin: '0 auto',
        }}
      >
        {renderSimpleMd(selected.content)}
      </article>
      <div className="k2fam-doku-print" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: '0.55rem 1.1rem',
            background: ACCENT_DARK,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          🖨️ Diese Datei drucken
        </button>
      </div>
    </>
  ) : null

  return (
    <div className="k2fam-doku-wrap" style={{ maxWidth: '56rem', margin: '0 auto', padding: '1.5rem 1rem 3rem', color: '#1c1a18', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @media print {
          .k2fam-doku-no-print { display: none !important; }
          .k2fam-doku-wrap { padding: 0 !important; }
        }
      `}</style>

      <nav className="k2fam-doku-no-print" style={{ marginBottom: '1.25rem' }}>
        <Link to={PROJECT_ROUTES['k2-familie'].meineFamilie} style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>
          ← Zurück zu K2 Familie
        </Link>
      </nav>

      {!selected ? hub : reader}

      <footer style={{ marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e5e7eb', fontSize: '0.82rem', color: '#5c5650', lineHeight: 1.5 }}>
        <p style={{ margin: '0 0 0.35rem' }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
        <p style={{ margin: 0 }}>{PRODUCT_URHEBER_ANWENDUNG}</p>
      </footer>
    </div>
  )
}
