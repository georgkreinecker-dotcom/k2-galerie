/**
 * Übersicht-Board – Lizenznehmer, Empfehler, Abrechnung, Besucher auf einen Blick.
 * Optik wie K2 Familie: eine Seite, die Spaß macht zu öffnen, Struktur und Daten sofort sichtbar, ein Klick zu den Details.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'
import { PROJECT_ROUTES, PLATFORM_ROUTES, MOK2_ROUTE } from '../config/navigation'

const GRANTS_KEY = 'k2-license-grants'

function loadGrantsCount(): number {
  try {
    const raw = localStorage.getItem(GRANTS_KEY)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return 0
    return parsed.filter((g: unknown) => g && typeof g === 'object' && typeof (g as { id: string }).id === 'string').length
  } catch {
    return 0
  }
}

interface ApiData {
  licences: { id: string; empfehler_id?: string | null }[]
  payments: { amount_eur?: number | string; paid_at?: string }[]
  gutschriften: { empfehler_id: string; amount_eur: number | string }[]
}

const C = {
  text: '#f0f6ff',
  textSoft: 'rgba(255,255,255,0.78)',
  accent: '#14b8a6',
  border: 'rgba(13,148,136,0.35)',
  cardLizenz: 'linear-gradient(135deg, rgba(5,150,105,0.2) 0%, rgba(16,185,129,0.12) 100%)',
  cardEmpfehler: 'linear-gradient(135deg, rgba(234,88,12,0.15) 0%, rgba(251,146,60,0.1) 100%)',
  cardAbrechnung: 'linear-gradient(135deg, rgba(13,148,136,0.2) 0%, rgba(45,212,191,0.12) 100%)',
  cardBesucher: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(129,140,248,0.08) 100%)',
}

export default function UebersichtBoardPage() {
  const [manualCount, setManualCount] = useState(0)
  const [apiData, setApiData] = useState<ApiData | null>(null)
  const [visits, setVisits] = useState<{ k2: number; oeffentlich: number; vk2: number }>({ k2: 0, oeffentlich: 0, vk2: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setManualCount(loadGrantsCount())
    const origin = window.location.origin
    let cancelled = false
    Promise.all([
      fetch(`${origin}/api/licence-data`).then((res) => res.json()),
      fetch(`${origin}/api/visit?tenant=k2`).then((res) => res.json()).then((d) => d.count ?? 0),
      fetch(`${origin}/api/visit?tenant=oeffentlich`).then((res) => res.json()).then((d) => d.count ?? 0),
      fetch(`${origin}/api/visit?tenant=vk2`).then((res) => res.json()).then((d) => d.count ?? 0),
    ]).then(([data, k2, oef, vk2]) => {
      if (cancelled) return
      setApiData({ licences: data.licences ?? [], payments: data.payments ?? [], gutschriften: data.gutschriften ?? [] })
      setVisits({ k2, oeffentlich: oef, vk2 })
    }).catch(() => {
      if (!cancelled) setApiData({ licences: [], payments: [], gutschriften: [] })
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const onlineCount = apiData?.licences?.length ?? 0
  const totalLizenzen = manualCount + onlineCount
  const payments = apiData?.payments ?? []
  const gutschriften = apiData?.gutschriften ?? []
  const empfehlerIds = new Set(gutschriften.map((g) => g.empfehler_id))
  const gutschriftSum = gutschriften.reduce((sum, g) => sum + Number(g.amount_eur || 0), 0)
  const zahlungenSum = payments.reduce((sum, p) => sum + Number(p.amount_eur ?? 0), 0)

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page">
        <header>
          <div>
            <div className="familie-toolbar" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Link to={PLATFORM_ROUTES.projects} className="meta" style={{ color: C.textSoft }}>← Projekte</Link>
              <Link to={PROJECT_ROUTES['k2-galerie'].licences} className="meta" style={{ color: C.textSoft }}>Lizenzen</Link>
            </div>
            <h1>Übersicht</h1>
            <div className="meta">Lizenznehmer, Empfehler, Abrechnung – auf einen Blick. Ein Klick zu den Details.</div>
          </div>
        </header>

        {loading ? (
          <div className="card familie-card-enter" style={{ padding: '2rem', textAlign: 'center', color: C.textSoft }}>
            Lade Daten…
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Kachel: Lizenznehmer */}
            <Link
              to={PROJECT_ROUTES['k2-galerie'].licences}
              className="card familie-card-enter uebersicht-board-card"
              style={{
                animationDelay: '0s',
                background: C.cardLizenz,
                borderColor: 'rgba(16,185,129,0.4)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
              }}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', lineHeight: 1, marginBottom: '0.35rem' }}>
                {totalLizenzen}
              </div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: C.text }}>Lizenznehmer</h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: C.textSoft }}>
                {manualCount > 0 && onlineCount > 0 && `${manualCount} manuell, ${onlineCount} online`}
                {manualCount > 0 && onlineCount === 0 && `${manualCount} manuell vergeben`}
                {manualCount === 0 && onlineCount > 0 && `${onlineCount} online gekauft`}
                {totalLizenzen === 0 && 'Noch keine Lizenzen'}
              </p>
              <span style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.9rem', fontWeight: 600, color: C.accent }}>
                → Alle anzeigen
              </span>
            </Link>

            {/* Kachel: Empfehler */}
            <Link
              to={PROJECT_ROUTES['k2-galerie'].licences}
              className="card familie-card-enter uebersicht-board-card"
              style={{
                animationDelay: '0.08s',
                background: C.cardEmpfehler,
                borderColor: 'rgba(251,146,60,0.4)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
              }}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fb923c', lineHeight: 1, marginBottom: '0.35rem' }}>
                {empfehlerIds.size}
              </div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: C.text }}>Empfehler</h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: C.textSoft }}>
                {gutschriftSum > 0 ? `${gutschriftSum.toFixed(2)} € Gutschriften gesamt` : 'Noch keine Gutschriften'}
              </p>
              <span style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.9rem', fontWeight: 600, color: '#fb923c' }}>
                → Empfehler & Abrechnung
              </span>
            </Link>

            {/* Kachel: Abrechnung */}
            <Link
              to={PROJECT_ROUTES['k2-galerie'].licences}
              className="card familie-card-enter uebersicht-board-card"
              style={{
                animationDelay: '0.16s',
                background: C.cardAbrechnung,
                borderColor: 'rgba(45,212,191,0.4)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
              }}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2dd4bf', lineHeight: 1, marginBottom: '0.35rem' }}>
                {payments.length}
              </div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: C.text }}>Abrechnung</h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: C.textSoft }}>
                {zahlungenSum > 0 ? `${zahlungenSum.toFixed(2)} € Zahlungen` : 'Keine Online-Zahlungen'}
              </p>
              <span style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.9rem', fontWeight: 600, color: C.accent }}>
                → CSV / PDF
              </span>
            </Link>

            {/* Kachel: Besucher (K2 + ök2 + VK2) */}
            <div
              className="card familie-card-enter uebersicht-board-card"
              style={{
                animationDelay: '0.24s',
                background: C.cardBesucher,
                borderColor: 'rgba(129,140,248,0.45)',
              }}
            >
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a5b4fc', lineHeight: 1.2, marginBottom: '0.35rem' }}>
                {visits.k2 + visits.oeffentlich + visits.vk2}
              </div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: C.text }}>Besucher</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: C.textSoft }}>
                K2: {visits.k2} · ök2: {visits.oeffentlich} · VK2: {visits.vk2}
              </p>
              <span style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.8rem', color: C.textSoft }}>
                Pro Session einmal gezählt
              </span>
            </div>
          </div>
        )}

        {/* Fertige Bereiche – alles was startbereit ist, ein Klick */}
        <section style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem', color: C.text }}>Fertige Bereiche</h2>
          <p className="meta" style={{ margin: '0 0 1rem' }}>Alles was fertig ist – ein Klick zum Öffnen.</p>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            <Link to={PROJECT_ROUTES['k2-galerie'].galerie} className="card familie-card-enter" style={{ animationDelay: '0s', padding: '1rem', textDecoration: 'none', color: 'inherit', borderColor: 'rgba(255,140,66,0.4)', background: 'linear-gradient(135deg, rgba(255,140,66,0.15), rgba(230,122,42,0.08))' }}>
              <span style={{ fontSize: '1.25rem' }}>🎨</span>
              <div style={{ fontWeight: 700, marginTop: '0.35rem', color: C.text }}>K2 Galerie</div>
              <div style={{ fontSize: '0.8rem', color: C.textSoft }}>Echte Galerie</div>
            </Link>
            <Link to={PROJECT_ROUTES['k2-galerie'].galerieOeffentlich} className="card familie-card-enter" style={{ animationDelay: '0.05s', padding: '1rem', textDecoration: 'none', color: 'inherit', borderColor: 'rgba(95,251,241,0.4)', background: 'linear-gradient(135deg, rgba(95,251,241,0.12), rgba(60,200,190,0.06))' }}>
              <span style={{ fontSize: '1.25rem' }}>🌐</span>
              <div style={{ fontWeight: 700, marginTop: '0.35rem', color: C.text }}>ök2 Demo</div>
              <div style={{ fontSize: '0.8rem', color: C.textSoft }}>Öffentliche Demo</div>
            </Link>
            <Link to="/projects/vk2/galerie" className="card familie-card-enter" style={{ animationDelay: '0.1s', padding: '1rem', textDecoration: 'none', color: 'inherit', borderColor: 'rgba(251,146,60,0.4)', background: 'linear-gradient(135deg, rgba(230,122,42,0.15), rgba(255,140,66,0.08))' }}>
              <span style={{ fontSize: '1.25rem' }}>🏛️</span>
              <div style={{ fontWeight: 700, marginTop: '0.35rem', color: C.text }}>VK2</div>
              <div style={{ fontSize: '0.8rem', color: C.textSoft }}>Vereinsplattform</div>
            </Link>
            <Link to={MOK2_ROUTE} className="card familie-card-enter" style={{ animationDelay: '0.15s', padding: '1rem', textDecoration: 'none', color: 'inherit', borderColor: 'rgba(251,191,36,0.4)', background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))' }}>
              <span style={{ fontSize: '1.25rem' }}>📋</span>
              <div style={{ fontWeight: 700, marginTop: '0.35rem', color: C.text }}>mök2</div>
              <div style={{ fontSize: '0.8rem', color: C.textSoft }}>Vertrieb & Promotion</div>
            </Link>
            <Link to={PROJECT_ROUTES['k2-galerie'].licences} className="card familie-card-enter" style={{ animationDelay: '0.2s', padding: '1rem', textDecoration: 'none', color: 'inherit', borderColor: 'rgba(16,185,129,0.4)', background: 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(16,185,129,0.08))' }}>
              <span style={{ fontSize: '1.25rem' }}>💼</span>
              <div style={{ fontWeight: 700, marginTop: '0.35rem', color: C.text }}>Lizenzen</div>
              <div style={{ fontSize: '0.8rem', color: C.textSoft }}>Verwalten & Export</div>
            </Link>
            <Link to={PROJECT_ROUTES['k2-galerie'].empfehlungstool} className="card familie-card-enter" style={{ animationDelay: '0.25s', padding: '1rem', textDecoration: 'none', color: 'inherit', borderColor: 'rgba(251,146,60,0.35)', background: 'linear-gradient(135deg, rgba(234,88,12,0.1), rgba(251,146,60,0.06))' }}>
              <span style={{ fontSize: '1.25rem' }}>🤝</span>
              <div style={{ fontWeight: 700, marginTop: '0.35rem', color: C.text }}>Empfehlungstool</div>
              <div style={{ fontSize: '0.8rem', color: C.textSoft }}>ID & Link teilen</div>
            </Link>
          </div>
        </section>

        <p className="meta" style={{ marginTop: '1.5rem' }}>
          Detail-Daten und Export: <Link to={PROJECT_ROUTES['k2-galerie'].licences} style={{ color: C.accent }}>Lizenzen-Seite</Link>.
        </p>
      </div>
    </div>
  )
}
