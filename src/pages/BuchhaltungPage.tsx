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
  type KassabuchTenant,
} from '../utils/kassabuchStorage'
import { computeRohertragOek2, type RohertragOek2Artwork } from '../utils/buchhaltungRohertragOek2'
import { computeLagerstandOek2Vorschau } from '../utils/buchhaltungLagerstandOek2'
import { formatEkAnzeige } from '../utils/artworkEkVk'

const s = {
  bg: '#f8f7f5',
  card: '#ffffff',
  accent: '#7a3b1e',
  text: '#1c1a17',
  muted: '#7a6f66',
  radius: '14px',
  shadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
}

function getTenant(location: ReturnType<typeof useLocation>): KassabuchTenant {
  const state = location.state as { fromOeffentlich?: boolean; fromVk2?: boolean } | null
  if (state?.fromVk2 === true) return 'vk2'
  if (state?.fromOeffentlich === true) return 'oeffentlich'
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-admin-context') === 'vk2') return 'vk2'
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-admin-context') === 'oeffentlich') return 'oeffentlich'
  return 'k2'
}

const ORDERS_KEY: Record<KassabuchTenant, string> = {
  k2: 'k2-orders',
  oeffentlich: 'k2-oeffentlich-orders',
  vk2: 'k2-vk2-orders',
}

interface OrderRow {
  id?: string
  orderNumber?: string
  date?: string
  soldAt?: string
  total?: number
  paymentMethod?: string
  items?: Array<{ number?: string; title?: string; price?: number; quantity?: number }>
}

function loadOrders(tenant: KassabuchTenant): OrderRow[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY[tenant])
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function loadOeffentlichArtworksForRohertrag(): unknown[] {
  try {
    const raw = localStorage.getItem('k2-oeffentlich-artworks')
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
  const [orders, setOrders] = useState<OrderRow[]>(() => loadOrders(tenant))
  const [artworksOeffRohertrag, setArtworksOeffRohertrag] = useState<unknown[]>(() =>
    tenant === 'oeffentlich' ? loadOeffentlichArtworksForRohertrag() : []
  )

  const filteredEntries = useMemo(() => {
    let list = kassabuchVoll && aktiv ? entries : entries.filter(e => e.art === 'eingang' || (tenant === 'vk2' && e.art === 'ausgang'))
    if (von) list = list.filter(e => e.datum >= von)
    if (bis) list = list.filter(e => e.datum <= bis)
    return list.sort((a, b) => a.datum.localeCompare(b.datum) || 0)
  }, [entries, von, bis, kassabuchVoll, aktiv, tenant])

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

  const rohertragOek2 = useMemo(() => {
    if (tenant !== 'oeffentlich') return null
    return computeRohertragOek2(filteredOrders, artworksOeffRohertrag as RohertragOek2Artwork[])
  }, [tenant, filteredOrders, artworksOeffRohertrag])

  const lagerstandOek2 = useMemo(() => {
    if (tenant !== 'oeffentlich') return null
    return computeLagerstandOek2Vorschau(artworksOeffRohertrag)
  }, [tenant, artworksOeffRohertrag])

  /** Einträge mit Beleg (Foto oder QR) – für PDF an Steuerberater. Pro++ = vollständige Buchhaltung inkl. Belege. */
  const entriesWithBeleg = useMemo(
    () => filteredEntries.filter(e => e.belegImage || e.belegQrText),
    [filteredEntries]
  )

  const refresh = () => {
    setEntries(getKassabuchMitEingaengen(tenant))
    setOrders(loadOrders(tenant))
    if (tenant === 'oeffentlich') setArtworksOeffRohertrag(loadOeffentlichArtworksForRohertrag())
  }

  const handlePrint = () => window.print()

  /** Belege des Zeitraums in neuem Fenster drucken → Nutzer wählt „Als PDF speichern“. */
  const handleBelegePdf = () => {
    if (entriesWithBeleg.length === 0) return
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const imgSrc = (src: string) => (src.startsWith('data:') || src.startsWith('http') ? src : base + (src.startsWith('/') ? src : '/' + src))
    const title = `Belege Buchhaltung ${von || 'Start'} – ${bis || 'Ende'}`
    const blocks = entriesWithBeleg.map(e => {
      const imgHtml = e.belegImage ? `<img src="${imgSrc(e.belegImage)}" alt="Beleg" style="max-width:100%; max-height:280px; display:block; margin-top:0.5rem;" />` : ''
      const qrHtml = e.belegQrText ? `<pre style="font-size:0.75rem; white-space:pre-wrap; word-break:break-all; margin:0.5rem 0 0 0; padding:0.5rem; background:#f5f4f2; border-radius:6px;">${e.belegQrText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>` : ''
      return `<section style="break-inside:avoid; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid #eee;">
        <div style="font-size:0.9rem;"><strong>${e.datum}</strong> ${getKassabuchArtLabel(e.art)} · ${e.betrag.toFixed(2)} €</div>
        ${e.verwendungszweck ? `<div style="color:#5c5650; font-size:0.85rem;">${(e.verwendungszweck || '').replace(/</g, '&lt;')}</div>` : ''}
        ${imgHtml}
        ${qrHtml}
      </section>`
    }).join('')
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>body{font-family:system-ui,sans-serif;padding:1rem;max-width:800px;margin:0 auto;color:#1c1a17;} h1{font-size:1.25rem;} @media print{body{padding:0;}}</style>
    </head><body><h1>${title}</h1><p style="color:#7a6f66;font-size:0.9rem;">Zum Speichern als PDF: Drucken → „Als PDF speichern“ wählen.</p>${blocks}</body></html>`
    const w = window.open('', '_blank', 'noopener')
    if (w) {
      w.document.write(html)
      w.document.close()
      w.focus()
      w.onload = () => setTimeout(() => w.print(), 300)
    }
  }

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

  const adminLink =
    tenant === 'vk2' ? '/admin?context=vk2' : tenant === 'oeffentlich' ? '/admin?context=oeffentlich' : '/admin'
  const kassaTo = tenant === 'vk2'
    ? { pathname: PROJECT_ROUTES['k2-galerie'].shop, state: { openAsKasse: true, fromVk2: true } }
    : tenant === 'oeffentlich'
      ? { pathname: PROJECT_ROUTES['k2-galerie'].kassa, state: { fromOeffentlich: true } }
      : PROJECT_ROUTES['k2-galerie'].kassa
  const navLinks = (
    <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <Link
        to={kassaTo}
        style={{ color: s.text, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, padding: '0.5rem 0.75rem', background: s.card, border: `1px solid ${s.muted}`, borderRadius: 8 }}
      >
        ← {tenant === 'vk2' ? 'Kasse (Vereinsbetrieb)' : 'Kassa'}
      </Link>
      <Link
        to={adminLink}
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

        <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ color: s.muted, fontSize: '0.9rem' }}>Von</label>
          <input type="date" value={von} onChange={e => setVon(e.target.value)} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: `1px solid ${s.muted}` }} />
          <label style={{ color: s.muted, fontSize: '0.9rem' }}>Bis</label>
          <input type="date" value={bis} onChange={e => setBis(e.target.value)} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: `1px solid ${s.muted}` }} />
        </div>
        <div className="no-print" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: s.muted, fontSize: '0.85rem' }}>Schnellauswahl:</span>
          {[0, 1, 2].map(offset => {
            const y = new Date().getFullYear() - offset
            return (
              <button
                key={y}
                type="button"
                onClick={() => { setVon(`${y}-01-01`); setBis(`${y}-12-31`) }}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', background: s.card, color: s.text, border: `1px solid ${s.muted}`, borderRadius: 6, cursor: 'pointer' }}
              >
                Jahr {y}
              </button>
            )
          })}
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
          <button
            type="button"
            onClick={handleBelegePdf}
            disabled={entriesWithBeleg.length === 0}
            title={entriesWithBeleg.length === 0 ? 'Keine Belege im gewählten Zeitraum' : 'Belege drucken oder als PDF speichern – an Steuerberater sendbar'}
            style={{
              padding: '0.75rem 1.25rem',
              background: entriesWithBeleg.length === 0 ? s.muted : '#5d4037',
              color: '#fff',
              border: 'none',
              borderRadius: s.radius,
              cursor: entriesWithBeleg.length === 0 ? 'default' : 'pointer',
            }}
          >
            📄 Belege als PDF ({entriesWithBeleg.length})
          </button>
        </div>

        <p style={{ color: s.muted, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          Die heruntergeladenen CSV-Dateien kannst du per E-Mail an deinen Steuerberater senden. <strong>Belege als PDF</strong>: öffnet alle Belege (Fotos/QR) des Zeitraums zum Drucken – „Als PDF speichern“ wählen und mitsenden. Ohne Zeitraum = alle Daten.
        </p>
        <p style={{ color: s.muted, fontSize: '0.8rem', marginBottom: '1rem' }}>
          <strong>Vorarbeit hier, Rest beim Steuerberater:</strong> Für UStVA/EO gibst du Daten und Belege an deinen Steuerberater – die aufwändige Vorarbeit erledigst du hier praktisch kostenlos. Buchungsunterlagen und Belege <strong>7 Jahre</strong> aufbewahren (Österreich).
        </p>

        {/* Summen für den Zeitraum – einfach, für jeden verständlich */}
        {rohertragOek2 && (
          <div
            style={{
              background: '#fff8e1',
              border: '1px solid #f9a82544',
              borderRadius: s.radius,
              padding: '1rem 1.1rem',
              marginBottom: '1.25rem',
              boxShadow: s.shadow,
            }}
          >
            <h2 style={{ fontSize: '1.05rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 700 }}>
              Übersicht Rohertrag (Demo-Galerie)
            </h2>
            <p style={{ fontSize: '0.82rem', color: s.muted, margin: '0 0 0.85rem', lineHeight: 1.45 }}>
              Für <strong>Kleingewerbe</strong> zum Überblick: nur Verkäufe mit <strong>Werknummer</strong>. EK kommt aus dem Werk (EK-Feld); leer ={' '}
              <strong>Eigenproduktion</strong> (EK 0). Keine Steuerberatung – Vorlage für dich, Prüfung beim Steuerberater.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div style={{ background: '#e8f5e9', padding: '0.75rem', borderRadius: 10, textAlign: 'center', border: '1px solid #2d7a3a22' }}>
                <div style={{ fontSize: '0.72rem', color: s.muted }}>Verkauf (VK)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1b5e20' }}>{rohertragOek2.verkaufserloes.toFixed(2)} €</div>
              </div>
              <div style={{ background: '#fce4ec', padding: '0.75rem', borderRadius: 10, textAlign: 'center', border: '1px solid #c2185b22' }}>
                <div style={{ fontSize: '0.72rem', color: s.muted }}>Wareneinsatz (EK)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#880e4f' }}>{rohertragOek2.wareneinsatz.toFixed(2)} €</div>
              </div>
              <div
                style={{
                  background: rohertragOek2.rohertrag >= 0 ? '#e3f2fd' : '#fff3e0',
                  padding: '0.75rem',
                  borderRadius: 10,
                  textAlign: 'center',
                  border: `1px solid ${rohertragOek2.rohertrag >= 0 ? '#1565c022' : '#e6510022'}`,
                }}
              >
                <div style={{ fontSize: '0.72rem', color: s.muted }}>Rohertrag</div>
                <div
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: rohertragOek2.rohertrag >= 0 ? '#0d47a1' : '#e65100',
                  }}
                >
                  {rohertragOek2.rohertrag.toFixed(2)} €
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: s.muted, margin: '0.65rem 0 0', lineHeight: 1.4 }}>
              Positionen mit Werknummer: {rohertragOek2.positionenMitWerknummer}
              {rohertragOek2.positionenEigenproduktion > 0
                ? ` · davon ohne EK (Eigenproduktion): ${rohertragOek2.positionenEigenproduktion}`
                : null}
              {rohertragOek2.positionenMitWerknummer === 0 ? ' – im Zeitraum keine Werkverkäufe.' : ''}
            </p>

            {lagerstandOek2 && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid #f9a82555', margin: '1.1rem 0' }} />
                <h3 style={{ fontSize: '0.98rem', color: s.text, margin: '0 0 0.35rem', fontWeight: 700 }}>
                  Vorschau Lagerstand
                </h3>
                <p style={{ fontSize: '0.78rem', color: s.muted, margin: '0 0 0.65rem', lineHeight: 1.45 }}>
                  Aus dem aktuellen Demo-Werkstamm: Stückzahl &gt; 0 (ohne Angabe = 1 Stück). Detail und Filter „Nur Lager &amp; Kassa“ im{' '}
                  <Link to="/admin?context=oeffentlich" style={{ color: s.accent, fontWeight: 600 }}>
                    Admin → Werkkatalog
                  </Link>
                  .
                </p>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: s.text,
                    marginBottom: '0.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem 1rem',
                  }}
                >
                  <span>
                    <strong>{lagerstandOek2.gesamtStueck}</strong> Stück im Lager
                  </span>
                  <span>
                    VK (Lager): <strong>{lagerstandOek2.wertVk.toFixed(2)} €</strong>
                  </span>
                  <span>
                    EK (Lager): <strong>{lagerstandOek2.wertEk.toFixed(2)} €</strong>
                  </span>
                </div>
                {lagerstandOek2.rows.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: s.muted, margin: 0 }}>Keine Stücke mit Stückzahl &gt; 0.</p>
                ) : (
                  <div style={{ overflowX: 'auto', maxHeight: 'min(320px, 50vh)', overflowY: 'auto', borderRadius: 8, border: '1px solid #f9a82533' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ background: '#fffde7', position: 'sticky', top: 0 }}>
                          <th style={{ textAlign: 'left', padding: '0.45rem 0.5rem' }}>Nr.</th>
                          <th style={{ textAlign: 'left', padding: '0.45rem 0.5rem' }}>Titel</th>
                          <th style={{ textAlign: 'right', padding: '0.45rem 0.5rem' }}>Stück</th>
                          <th style={{ textAlign: 'right', padding: '0.45rem 0.5rem' }}>VK</th>
                          <th style={{ textAlign: 'right', padding: '0.45rem 0.5rem' }}>EK</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lagerstandOek2.rows.slice(0, 20).map(row => (
                          <tr key={row.number} style={{ borderTop: '1px solid #eee' }}>
                            <td style={{ padding: '0.4rem 0.5rem', whiteSpace: 'nowrap' }}>{row.number}</td>
                            <td style={{ padding: '0.4rem 0.5rem', color: '#5c5650', maxWidth: 200 }} title={row.title}>
                              {row.title.length > 42 ? `${row.title.slice(0, 40)}…` : row.title || '–'}
                            </td>
                            <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{row.menge}</td>
                            <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{row.vk.toFixed(2)} €</td>
                            <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontSize: '0.76rem' }}>
                              {row.eigenproduktion ? formatEkAnzeige(undefined) : formatEkAnzeige(row.ek)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {lagerstandOek2.rows.length > 20 && (
                      <p style={{ fontSize: '0.72rem', color: s.muted, margin: '0.35rem 0.5rem 0.5rem', padding: 0 }}>
                        … und {lagerstandOek2.rows.length - 20} weitere Zeilen im Werkkatalog.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

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
