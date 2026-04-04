/**
 * Eigenständiger A4-Flyer „Promo – Essenz“ (ök2 / K2 Galerie Vertrieb).
 * Inhalt: public/oek2-flyer-promo-a4/PROMO-A4-ESSENZ.md — nicht Teil der Präsentationsmappe.
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { renderMarkdown } from '../utils/praesentationsmappeMarkdown'
import { PRAESENTATIONSMAPPE_MARKDOWN_STYLES } from '../utils/praesentationsmappeMarkdownStyles'

const MD_URL = '/oek2-flyer-promo-a4/PROMO-A4-ESSENZ.md'
const ASSET_BASE = '/oek2-flyer-promo-a4'

export default function FlyerOek2PromoA4Page() {
  const navigate = useNavigate()
  const [raw, setRaw] = useState('')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const mappe = PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion
  const internalDocHref = (path: string) => `${mappe}?doc=${encodeURIComponent(path)}`

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErr(null)
    fetch(MD_URL)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.text()
      })
      .then((t) => {
        if (!cancelled) setRaw(t)
      })
      .catch(() => {
        if (!cancelled) setErr('Flyer konnte nicht geladen werden.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="pmv-wrap" lang="de" style={{ padding: '1.5rem 1rem', background: '#fffefb', minHeight: '100vh', color: '#1c1a18' }}>
      <style>{PRAESENTATIONSMAPPE_MARKDOWN_STYLES}</style>

      <header className="pmv-no-print" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1c1a18', fontWeight: 600 }}>📄 Promo A4 – Essenz</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#6b7280' }}>
            Eine Seite zum Mitnehmen; Links führen in die Präsentationsmappe (USPs, Prospekt, Für wen).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{ padding: '0.5rem 1rem', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
          >
            🖨️ Drucken
          </button>
          <button
            type="button"
            onClick={() => navigate(mappe)}
            style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#1c1a18', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Zur Präsentationsmappe
          </button>
          <button
            type="button"
            onClick={() => navigate(PROJECT_ROUTES['k2-galerie'].marketingOek2)}
            style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#1c1a18', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            ← Marketing ök2
          </button>
        </div>
      </header>

      <article style={{ background: '#fff', padding: '1.5rem 2rem', borderRadius: 12, border: '1px solid #e5e7eb', minHeight: 200 }}>
        {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Lade Flyer…</div>}
        {err && <div style={{ textAlign: 'center', padding: '2rem', color: '#b91c1c' }}>{err}</div>}
        {!loading && !err && raw && (
          <div>{renderMarkdown(raw, { assetBase: ASSET_BASE, internalDocHref, keyPrefix: 'flyer-a4' })}</div>
        )}
      </article>

      <div className="pmv-seitenfuss pmv-wrap" aria-hidden>
        <span className="pmv-seitenfuss-preview">Promo A4 · (Seitenzahlen beim Drucken)</span>
      </div>
    </div>
  )
}
