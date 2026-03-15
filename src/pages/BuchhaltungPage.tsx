/**
 * Buchhaltung – alle buchhaltungsrelevanten Dateien in einem Ort.
 * Zeitraum wählen → drucken oder als CSV herunterladen (für Steuerberater versendbar).
 */

import { useState, useMemo } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import {
  getKassabuchMitEingaengen,
  getKassabuchArtLabel,
  exportKassabuchCsv,
  hasKassa,
  hasKassabuchVoll,
  isKassabuchAktiv,
  type KassabuchEintrag,
} from '../utils/kassabuchStorage'

const s = {
  bg: '#f8f7f5',
  card: '#ffffff',
  accent: '#7a3b1e',
  text: '#1c1a17',
  muted: '#7a6f66',
  radius: '14px',
  shadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
}

function getTenant(location: ReturnType<typeof useLocation>): 'k2' | 'oeffentlich' {
  const state = location.state as { fromOeffentlich?: boolean } | null
  if (state?.fromOeffentlich === true) return 'oeffentlich'
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-admin-context') === 'oeffentlich') return 'oeffentlich'
  return 'k2'
}

const ORDERS_KEY: Record<'k2' | 'oeffentlich', string> = {
  k2: 'k2-orders',
  oeffentlich: 'k2-oeffentlich-orders',
}

interface OrderRow {
  id?: string
  orderNumber?: string
  date?: string
  soldAt?: string
  total?: number
  paymentMethod?: string
}

function loadOrders(tenant: 'k2' | 'oeffentlich'): OrderRow[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY[tenant])
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function exportVerkaufeCsv(orders: OrderRow[], fromDate?: string, toDate?: string): string {
  let list = orders
    .filter(o => o && (o.date || o.soldAt))
    .map(o => ({
      ...o,
      datum: ((o.date || o.soldAt || '') as string).slice(0, 10),
    }))
  if (fromDate) list = list.filter(o => o.datum >= fromDate)
  if (toDate) list = list.filter(o => o.datum <= toDate)
  list.sort((a, b) => (a.datum || '').localeCompare(b.datum || ''))
  const header = 'Datum;Bon-Nr.;Betrag;Zahlungsart'
  const rows = list.map(o => {
    const nr = (o.orderNumber || o.id || '').replace(/;/g, ',')
    const betrag = typeof o.total === 'number' ? o.total.toFixed(2) : '0,00'
    const art = o.paymentMethod === 'cash' ? 'Bar' : o.paymentMethod === 'card' ? 'Karte' : o.paymentMethod === 'transfer' ? 'Rechnung' : (o.paymentMethod || '')
    return `${o.datum};${nr};${betrag};${art}`
  })
  return [header, ...rows].join('\n')
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function BuchhaltungPage() {
  const location = useLocation()
  const tenant = getTenant(location)
  const kassaVerfuegbar = hasKassa(tenant)
  const kassabuchVoll = hasKassabuchVoll(tenant)
  const aktiv = isKassabuchAktiv(tenant)

  const [von, setVon] = useState('')
  const [bis, setBis] = useState('')
  const [entries, setEntries] = useState<KassabuchEintrag[]>(() => getKassabuchMitEingaengen(tenant))
  const [orders] = useState<OrderRow[]>(() => loadOrders(tenant))

  const filteredEntries = useMemo(() => {
    let list = kassabuchVoll && aktiv ? entries : entries.filter(e => e.art === 'eingang')
    if (von) list = list.filter(e => e.datum >= von)
    if (bis) list = list.filter(e => e.datum <= bis)
    return list.sort((a, b) => a.datum.localeCompare(b.datum) || 0)
  }, [entries, von, bis, kassabuchVoll, aktiv])

  /** Einfache Summen für den Zeitraum – gute Basis für den Start. */
  const { summeEinnahmen, summeAusgaben, saldo } = useMemo(() => {
    const einnahmen = filteredEntries.filter(e => e.art === 'eingang' || e.art === 'bank_an_kassa').reduce((s, e) => s + e.betrag, 0)
    const ausgaben = filteredEntries.filter(e => ['ausgang', 'bar_privat', 'bar_beleg', 'kassa_an_bank'].includes(e.art)).reduce((s, e) => s + e.betrag, 0)
    return { summeEinnahmen: einnahmen, summeAusgaben: ausgaben, saldo: einnahmen - ausgaben }
  }, [filteredEntries])

  const filteredOrders = useMemo(() => {
    let list = orders.filter(o => o.date || o.soldAt)
    if (von) list = list.filter(o => ((o.date || o.soldAt || '') as string).slice(0, 10) >= von)
    if (bis) list = list.filter(o => ((o.date || o.soldAt || '') as string).slice(0, 10) <= bis)
    return list.sort((a, b) => (b.date || b.soldAt || '').localeCompare(a.date || a.soldAt || ''))
  }, [orders, von, bis])

  const refresh = () => setEntries(getKassabuchMitEingaengen(tenant))

  const handlePrint = () => window.print()

  const handleKassabuchCsv = () => {
    const csv = exportKassabuchCsv(entries, von || undefined, bis || undefined)
    const name = `Kassabuch_${tenant}_${von || 'alle'}_${bis || 'alle'}.csv`
    downloadCsv(csv, name)
  }

  const handleVerkaufeCsv = () => {
    const csv = exportVerkaufeCsv(orders, von || undefined, bis || undefined)
    const name = `Verkaeufe_${tenant}_${von || 'alle'}_${bis || 'alle'}.csv`
    downloadCsv(csv, name)
  }

  /** Zeitraum versenden = beide CSVs nacheinander herunterladen (für E-Mail an Steuerberater). */
  const handleZeitraumVersenden = () => {
    handleKassabuchCsv()
    setTimeout(() => handleVerkaufeCsv(), 300)
  }

  if (!kassaVerfuegbar) {
    return (
      <div style={{ minHeight: '100vh', background: s.bg, padding: '1.5rem' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', paddingTop: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: s.text, marginBottom: '0.5rem' }}>📁 Buchhaltung</h1>
          <p style={{ color: s.muted, marginBottom: '1rem' }}>
            Buchhaltung ist ab der Lizenzstufe <strong>Pro</strong> verfügbar (zusammen mit Kassa).
          </p>
          <Link to={PROJECT_ROUTES['k2-galerie'].lizenzKaufen} style={{ padding: '0.75rem 1.25rem', background: s.accent, color: '#fff', borderRadius: s.radius, textDecoration: 'none', fontWeight: 600 }}>
            Lizenz ansehen
          </Link>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/admin" style={{ fontSize: '0.9rem', color: s.muted, textDecoration: 'none' }}>← Admin</Link>
          </div>
        </div>
      </div>
    )
  }

  const navLinks = (
    <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <Link
        to={PROJECT_ROUTES['k2-galerie'].kassa}
        style={{ color: s.text, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, padding: '0.5rem 0.75rem', background: s.card, border: `1px solid ${s.muted}`, borderRadius: 8 }}
      >
        ← Kassa
      </Link>
      <Link
        to="/admin"
        style={{ color: s.text, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, padding: '0.5rem 0.75rem', background: s.card, border: `1px solid ${s.muted}`, borderRadius: 8 }}
      >
        Admin
      </Link>
    </div>
  )

  return (
    <div
      className="buchhaltung-page"
      style={{ minHeight: '100vh', background: s.bg, padding: '0.75rem', paddingTop: 'max(0.75rem, env(safe-area-inset-top))', boxSizing: 'border-box', overflowX: 'hidden', minWidth: 0 }}
    >
      <div className="buchhaltung-content" style={{ maxWidth: 900, margin: '0 auto', width: '100%', minWidth: 0, paddingLeft: '0.25rem', paddingRight: '0.25rem', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: '1.5rem' }}>{navLinks}</div>

        <h1 style={{ fontSize: '1.5rem', color: s.text, marginBottom: '0.25rem' }}>📁 Buchhaltung</h1>
        <p style={{ color: s.muted, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Alle buchhaltungsrelevanten Daten für einen Zeitraum – drucken oder als CSV herunterladen und an den Steuerberater senden (z. B. per E-Mail).
        </p>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ color: s.muted, fontSize: '0.9rem' }}>Von</label>
          <input type="date" value={von} onChange={e => setVon(e.target.value)} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: `1px solid ${s.muted}` }} />
          <label style={{ color: s.muted, fontSize: '0.9rem' }}>Bis</label>
          <input type="date" value={bis} onChange={e => setBis(e.target.value)} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: `1px solid ${s.muted}` }} />
        </div>

        <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" onClick={refresh} style={{ padding: '0.75rem 1.25rem', background: s.card, color: s.text, border: `1px solid ${s.muted}`, borderRadius: s.radius, cursor: 'pointer' }}>
            Aktualisieren
          </button>
          <button type="button" onClick={handlePrint} style={{ padding: '0.75rem 1.25rem', background: s.card, color: s.text, border: `1px solid ${s.muted}`, borderRadius: s.radius, cursor: 'pointer' }}>
            🖨️ Drucken
          </button>
          <button type="button" onClick={handleKassabuchCsv} style={{ padding: '0.75rem 1.25rem', background: '#1a5f7a', color: '#fff', border: 'none', borderRadius: s.radius, cursor: 'pointer' }}>
            Kassabuch CSV
          </button>
          <button type="button" onClick={handleVerkaufeCsv} style={{ padding: '0.75rem 1.25rem', background: '#2d7a3a', color: '#fff', border: 'none', borderRadius: s.radius, cursor: 'pointer' }}>
            Verkäufe CSV
          </button>
          <button type="button" onClick={handleZeitraumVersenden} style={{ padding: '0.75rem 1.25rem', background: s.accent, color: '#fff', border: 'none', borderRadius: s.radius, cursor: 'pointer', fontWeight: 600 }}>
            Zeitraum herunterladen (beide CSVs)
          </button>
        </div>

        <p style={{ color: s.muted, fontSize: '0.85rem', marginBottom: '1rem' }}>
          Die heruntergeladenen CSV-Dateien können Sie per E-Mail an Ihren Steuerberater senden. Ohne Zeitraum = alle Daten.
        </p>

        {/* Summen für den Zeitraum – einfach, für jeden verständlich */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: s.radius, border: '1px solid #2d7a3a33', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: s.muted, marginBottom: '0.25rem' }}>Einnahmen</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1b5e20' }}>{summeEinnahmen.toFixed(2)} €</div>
          </div>
          <div style={{ background: '#ffebee', padding: '1rem', borderRadius: s.radius, border: '1px solid #c6282833', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: s.muted, marginBottom: '0.25rem' }}>Ausgaben</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#b71c1c' }}>{summeAusgaben.toFixed(2)} €</div>
          </div>
          <div style={{ background: saldo >= 0 ? '#e3f2fd' : '#fff3e0', padding: '1rem', borderRadius: s.radius, border: `1px solid ${saldo >= 0 ? '#1565c033' : '#e6510033'}`, textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: s.muted, marginBottom: '0.25rem' }}>Saldo</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: saldo >= 0 ? '#0d47a1' : '#e65100' }}>{saldo.toFixed(2)} €</div>
          </div>
        </div>

        <div style={{ background: s.card, borderRadius: s.radius, boxShadow: s.shadow, overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', maxWidth: '100%' }}>
          <table className="buchhaltung-table" style={{ width: '100%', minWidth: 320, borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f5f4f2', color: s.text }}>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Datum</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Art</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Betrag</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Verwendungszweck</th>
                <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Beleg</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(e => (
                <tr key={e.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem', color: s.text }}>{e.datum}</td>
                  <td style={{ padding: '0.75rem', color: s.text }}>{getKassabuchArtLabel(e.art)}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: s.text }}>{e.betrag.toFixed(2)} €</td>
                  <td style={{ padding: '0.75rem', color: '#5c5650' }}>{(e.verwendungszweck || '').slice(0, 40)}{(e.verwendungszweck?.length || 0) > 40 ? '…' : ''}</td>
                  <td style={{ padding: '0.75rem', color: s.text }}>
                    {e.belegImage ? <span title="Belegfoto">📷</span> : null}
                    {e.belegQrText ? <span title={e.belegQrText.slice(0, 100)}>📄</span> : null}
                    {!e.belegImage && !e.belegQrText ? '–' : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEntries.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: s.muted }}>
              Keine Buchungen im gewählten Zeitraum. Zeitraum leer lassen = alle Einträge.
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .buchhaltung-page { padding: 0; }
          .buchhaltung-content { max-width: none; }
        }
      `}</style>
    </div>
  )
}
