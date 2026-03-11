import React, { useMemo } from 'react'
import { WERBEUNTERLAGEN_STIL } from '../../src/config/marketingWerbelinie'
import { getCategoryLabel, ARTWORK_CATEGORIES } from '../../src/config/tenantConfig'
import { isEchteK2Werknummer } from '../../src/utils/artworksStorage'

const s = WERBEUNTERLAGEN_STIL

interface KatalogFilter {
  status: 'alle' | 'galerie' | 'verkauft' | 'reserviert' | 'lager'
  kategorie: string
  artist: string
  vonDatum: string
  bisDatum: string
  vonPreis: string
  bisPreis: string
  suchtext: string
}

interface WerkkatalogTabProps {
  allArtworks: any[]
  katalogFilter: KatalogFilter
  setKatalogFilter: React.Dispatch<React.SetStateAction<KatalogFilter>>
  katalogSpalten: string[]
  setKatalogSpalten: React.Dispatch<React.SetStateAction<string[]>>
  katalogSelectedWork: any
  setKatalogSelectedWork: (w: any) => void
  galleryData: any
  /** Schnell umschalten: In Galerie ↔ Lager (nur bei nicht verkauften Werken). Optional. */
  onToggleInExhibition?: (artwork: any) => void
}

const ALLE_SPALTEN = [
  { id: 'nummer', label: 'Nr.' }, { id: 'titel', label: 'Titel' },
  { id: 'kategorie', label: 'Kategorie' }, { id: 'kuenstler', label: 'Künstler:in' },
  { id: 'masse', label: 'Maße' }, { id: 'technik', label: 'Technik/Material' },
  { id: 'preis', label: 'Preis' }, { id: 'status', label: 'Status' },
  { id: 'datum', label: 'Erstellt' }, { id: 'kaeufer', label: 'Käufer:in' },
  { id: 'verkauftam', label: 'Verkauft am' }, { id: 'stueck', label: 'Stück' }, { id: 'standort', label: 'Standort' },
]

export default function WerkkatalogTab({
  allArtworks,
  katalogFilter,
  setKatalogFilter,
  katalogSpalten,
  setKatalogSpalten,
  katalogSelectedWork,
  setKatalogSelectedWork,
  galleryData,
  onToggleInExhibition,
}: WerkkatalogTabProps) {
  // Sold-Status + Reservierung aus separaten Keys holen
  const soldMap = new Map<string, any>()
  try {
    const soldRaw = localStorage.getItem('k2-sold-artworks')
    if (soldRaw) JSON.parse(soldRaw).forEach((s: any) => soldMap.set(s.number, s))
  } catch (_) {}
  const reservedMap = new Map<string, any>()
  try {
    const resRaw = localStorage.getItem('k2-reserved-artworks')
    if (resRaw) JSON.parse(resRaw).forEach((r: any) => reservedMap.set(r.number, r))
  } catch (_) {}

  // Werke anreichern
  const enriched = allArtworks.map((a: any) => {
    const soldEntry = soldMap.get(a.number || a.id)
    const resEntry = reservedMap.get(a.number || a.id)
    return {
      ...a,
      sold: !!soldEntry,
      soldAt: soldEntry?.soldAt || '',
      soldPrice: soldEntry?.soldPrice || a.price,
      buyer: soldEntry?.buyer || '',
      reserved: !!resEntry,
      reservedFor: resEntry?.reservedFor || '',
      reservedAt: resEntry?.reservedAt || '',
    }
  })

  // Filter anwenden
  const filtered = enriched.filter((a: any) => {
    if (katalogFilter.status === 'galerie' && !a.inExhibition) return false
    if (katalogFilter.status === 'verkauft' && !a.sold) return false
    if (katalogFilter.status === 'reserviert' && !a.reserved) return false
    if (katalogFilter.status === 'lager' && (a.inExhibition || a.sold)) return false
    if (katalogFilter.kategorie && a.category !== katalogFilter.kategorie) return false
    if (katalogFilter.artist && !(a.artist || '').toLowerCase().includes(katalogFilter.artist.toLowerCase())) return false
    if (katalogFilter.suchtext) {
      const q = katalogFilter.suchtext.toLowerCase()
      const hay = `${a.number || ''} ${a.title || ''} ${a.description || ''} ${a.technik || ''} ${a.buyer || ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (katalogFilter.vonPreis && a.price < parseFloat(katalogFilter.vonPreis)) return false
    if (katalogFilter.bisPreis && a.price > parseFloat(katalogFilter.bisPreis)) return false
    if (katalogFilter.vonDatum && a.createdAt && a.createdAt < katalogFilter.vonDatum) return false
    if (katalogFilter.bisDatum && a.createdAt && a.createdAt > katalogFilter.bisDatum + 'T23:59:59') return false
    return true
  })

  const druckeKatalog = () => {
    const pw = window.open('', '_blank')
    if (!pw) { alert('Pop-up blockiert – bitte erlauben.'); return }
    const galName = galleryData.name || 'K2 Galerie'
    const datum = new Date().toLocaleDateString('de-DE')
    const statusLabel = katalogFilter.status === 'galerie' ? 'In Online-Galerie' : katalogFilter.status === 'verkauft' ? 'Verkauft' : katalogFilter.status === 'lager' ? 'Nur Lager & Kassa' : 'Alle'
    const cols = katalogSpalten
    const rows = filtered.map((a: any) => {
      const cells = cols.map(col => {
        switch (col) {
          case 'nummer': return `<td>${a.number || a.id || '–'}</td>`
          case 'titel': return `<td><strong>${a.title || '–'}</strong></td>`
          case 'kategorie': return `<td>${getCategoryLabel(a.category)}</td>`
          case 'kuenstler': return `<td>${a.artist || '–'}</td>`
          case 'masse': return `<td>${a.dimensions || '–'}</td>`
          case 'technik': return `<td>${a.technik || '–'}</td>`
          case 'preis': return `<td style="text-align:right">${a.price ? `€ ${Number(a.price).toFixed(2)}` : '–'}</td>`
          case 'status': return `<td>${a.sold ? `<span style="color:#b91c1c;font-weight:700">Verkauft</span>` : a.reserved ? `<span style="color:#d97706;font-weight:700">Reserviert${a.reservedFor ? ' – ' + a.reservedFor : ''}</span>` : a.inExhibition ? '<span style="color:#15803d">Online-Galerie</span>' : 'Lager'}</td>`
          case 'datum': return `<td>${a.createdAt ? new Date(a.createdAt).toLocaleDateString('de-DE') : '–'}</td>`
          case 'kaeufer': return `<td>${a.buyer || '–'}</td>`
          case 'verkauftam': return `<td>${a.soldAt ? new Date(a.soldAt).toLocaleDateString('de-DE') : '–'}</td>`
          case 'stueck': return `<td style="text-align:right;font-weight:${a.quantity > 1 ? 700 : 400}">${a.quantity ?? 1}</td>`
          case 'standort': return `<td>${a.location || '–'}</td>`
          default: return '<td>–</td>'
        }
      }).join('')
      return `<tr>${cells}</tr>`
    }).join('')
    const colHeaders: Record<string, string> = {
      nummer: 'Nr.', titel: 'Titel', kategorie: 'Kategorie', kuenstler: 'Künstler:in',
      masse: 'Maße', technik: 'Technik/Material', preis: 'Preis', status: 'Status',
      datum: 'Erstellt', kaeufer: 'Käufer:in', verkauftam: 'Verkauft am', stueck: 'Stück', standort: 'Standort'
    }
    const thead = cols.map(c => `<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #8b6914;white-space:nowrap">${colHeaders[c] || c}</th>`).join('')
    pw.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Werkkatalog – ${galName}</title>
      <style>
        @media print { @page { size: A4 landscape; margin: 12mm; } }
        body { font-family: Arial, sans-serif; font-size: 10px; color: #111; }
        h1 { font-size: 18px; color: #8b6914; margin: 0 0 4px; }
        .meta { font-size: 11px; color: #666; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f9f3e8; color: #5c3d0e; }
        tr:nth-child(even) td { background: #fafafa; }
        td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
      </style></head><body>
      <h1>📋 Werkkatalog – ${galName}</h1>
      <div class="meta">Stand: ${datum} · Filter: ${statusLabel} · ${filtered.length} Werke</div>
      <table><thead><tr>${thead}</tr></thead><tbody>${rows}</tbody></table>
      <script>window.onload=()=>window.print()</script>
    </body></html>`)
    pw.document.close()
  }

  const w = katalogSelectedWork
  const statusColor = w ? (w.sold ? '#b91c1c' : w.reserved ? '#d97706' : w.inExhibition ? '#15803d' : '#6b7280') : '#6b7280'
  const statusLabel = w ? (w.sold ? 'Verkauft' : w.reserved ? `🔶 Reserviert${w.reservedFor ? ` – ${w.reservedFor}` : ''}` : w.inExhibition ? 'In Online-Galerie' : 'Nur Lager & Kassa') : ''

  const druckeWerkkarte = () => {
    if (!w) return
    const pw = window.open('', '_blank')
    if (!pw) { alert('Pop-up blockiert – bitte erlauben.'); return }
    const galName = galleryData.name || 'K2 Galerie'
    const datum = new Date().toLocaleDateString('de-DE')
    pw.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Werkkarte – ${w.number || w.id}</title>
      <style>
        @media print { @page { size: A5; margin: 10mm; } }
        body { font-family: Georgia, serif; color: #111; margin: 0; padding: 20px; max-width: 148mm; }
        .header { border-bottom: 3px solid #8b6914; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
        .header h1 { margin: 0; font-size: 14px; color: #8b6914; font-family: Arial, sans-serif; }
        .header .nr { font-size: 22px; font-weight: bold; color: #111; font-family: Arial, sans-serif; }
        .werk-img { width: 100%; max-height: 160px; object-fit: contain; border-radius: 6px; margin-bottom: 14px; background: #f5f0e8; }
        .titel { font-size: 22px; font-weight: bold; margin: 0 0 4px; color: #111; }
        .kuenstler { font-size: 13px; color: #555; margin: 0 0 14px; font-style: italic; }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; font-size: 12px; margin-bottom: 14px; }
        .meta-item label { color: #888; display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1px; }
        .meta-item span { color: #111; font-weight: 500; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: ${w.sold ? '#fef2f2' : w.reserved ? '#fffbeb' : w.inExhibition ? '#f0fdf4' : '#f9fafb'}; color: ${statusColor}; border: 1px solid ${statusColor}44; margin-bottom: 14px; }
        .beschreibung { font-size: 12px; color: #444; line-height: 1.6; border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 6px; }
        .footer { margin-top: 16px; border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 10px; color: #999; display: flex; justify-content: space-between; }
      </style></head><body>
      <div class="header">
        <h1>${galName}</h1>
        <div class="nr">${w.number || w.id || ''}</div>
      </div>
      ${w.imageUrl ? `<img class="werk-img" src="${w.imageUrl}" alt="${w.title || ''}" />` : ''}
      <div class="titel">${w.title || '–'}</div>
      <div class="kuenstler">${w.artist || ''}</div>
      <div class="status-badge">${statusLabel}</div>
      <div class="meta">
        ${w.dimensions ? `<div class="meta-item"><label>Maße</label><span>${w.dimensions}</span></div>` : ''}
        ${w.technik ? `<div class="meta-item"><label>Technik / Material</label><span>${w.technik}</span></div>` : ''}
        ${w.category ? `<div class="meta-item"><label>Kategorie</label><span>${getCategoryLabel(w.category)}</span></div>` : ''}
        ${w.price ? `<div class="meta-item"><label>Preis</label><span>€ ${Number(w.price).toFixed(2)}</span></div>` : ''}
        ${(w.quantity != null && Number(w.quantity) > 1) ? `<div class="meta-item"><label>Stückzahl</label><span>${w.quantity} Exemplare</span></div>` : ''}
        ${w.createdAt ? `<div class="meta-item"><label>Erstellt</label><span>${new Date(w.createdAt).toLocaleDateString('de-DE')}</span></div>` : ''}
        ${w.soldAt ? `<div class="meta-item"><label>Verkauft am</label><span>${new Date(w.soldAt).toLocaleDateString('de-DE')}</span></div>` : ''}
        ${w.buyer ? `<div class="meta-item"><label>Käufer:in</label><span>${w.buyer}</span></div>` : ''}
        ${w.soldPrice && w.soldPrice !== w.price ? `<div class="meta-item"><label>Verkaufspreis</label><span>€ ${Number(w.soldPrice).toFixed(2)}</span></div>` : ''}
      </div>
      ${w.description ? `<div class="beschreibung">${w.description}</div>` : ''}
      <div class="footer"><span>${galName}</span><span>Werkkarte · ${datum}</span></div>
      <script>window.onload=()=>window.print()</script>
    </body></html>`)
    pw.document.close()
  }

  return (
    <section style={{ background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: 24, padding: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '2rem' }}>

      {/* Filter-Zeile */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.25rem', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 180px' }}>
          <div style={{ fontSize: '0.78rem', color: s.muted, marginBottom: 3 }}>Suche (Nr., Titel, Beschreibung …)</div>
          <input value={katalogFilter.suchtext} onChange={e => setKatalogFilter(f => ({ ...f, suchtext: e.target.value }))}
            placeholder="z. B. M0042 oder Landschaft …"
            style={{ width: '100%', padding: '0.5rem 0.75rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, fontSize: '0.9rem', boxSizing: 'border-box' }} />
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: s.muted, marginBottom: 3 }}>Status</div>
          <select value={katalogFilter.status} onChange={e => setKatalogFilter(f => ({ ...f, status: e.target.value as any }))}
            style={{ padding: '0.5rem 0.75rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, fontSize: '0.9rem' }}>
            <option value="alle">Alle</option>
            <option value="galerie">In Online-Galerie</option>
            <option value="verkauft">Verkauft</option>
            <option value="reserviert">🔶 Reserviert</option>
            <option value="lager">Nur Lager & Kassa</option>
          </select>
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: s.muted, marginBottom: 3 }}>Kategorie</div>
          <select value={katalogFilter.kategorie} onChange={e => setKatalogFilter(f => ({ ...f, kategorie: e.target.value }))}
            style={{ padding: '0.5rem 0.75rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, fontSize: '0.9rem' }}>
            <option value="">Alle</option>
            {ARTWORK_CATEGORIES.map((c: any) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: s.muted, marginBottom: 3 }}>Preis von</div>
          <input type="number" value={katalogFilter.vonPreis} onChange={e => setKatalogFilter(f => ({ ...f, vonPreis: e.target.value }))}
            placeholder="€" style={{ width: 80, padding: '0.5rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, fontSize: '0.9rem' }} />
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: s.muted, marginBottom: 3 }}>bis</div>
          <input type="number" value={katalogFilter.bisPreis} onChange={e => setKatalogFilter(f => ({ ...f, bisPreis: e.target.value }))}
            placeholder="€" style={{ width: 80, padding: '0.5rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, fontSize: '0.9rem' }} />
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: s.muted, marginBottom: 3 }}>Erstellt von</div>
          <input type="date" value={katalogFilter.vonDatum} onChange={e => setKatalogFilter(f => ({ ...f, vonDatum: e.target.value }))}
            style={{ padding: '0.5rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, fontSize: '0.9rem' }} />
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: s.muted, marginBottom: 3 }}>bis</div>
          <input type="date" value={katalogFilter.bisDatum} onChange={e => setKatalogFilter(f => ({ ...f, bisDatum: e.target.value }))}
            style={{ padding: '0.5rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, fontSize: '0.9rem' }} />
        </div>
        <button type="button" onClick={() => setKatalogFilter({ status: 'alle', kategorie: '', artist: '', vonDatum: '', bisDatum: '', vonPreis: '', bisPreis: '', suchtext: '' })}
          style={{ padding: '0.5rem 1rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.muted, fontSize: '0.9rem', cursor: 'pointer', alignSelf: 'flex-end' }}>
          ✕ Zurücksetzen
        </button>
      </div>

      {/* Spalten-Auswahl + Drucken */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem', background: s.bgElevated, borderRadius: 10 }}>
        <span style={{ fontSize: '0.82rem', color: s.muted, marginRight: 4 }}>Spalten:</span>
        {ALLE_SPALTEN.map(col => (
          <label key={col.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: katalogSpalten.includes(col.id) ? s.text : s.muted, cursor: 'pointer' }}>
            <input type="checkbox" checked={katalogSpalten.includes(col.id)}
              onChange={e => setKatalogSpalten(prev => e.target.checked ? [...prev, col.id] : prev.filter(c => c !== col.id))}
              style={{ accentColor: s.accent }} />
            {col.label}
          </label>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: s.muted, alignSelf: 'center' }}>{filtered.length} Werke</span>
          <button type="button" onClick={druckeKatalog}
            style={{ padding: '0.5rem 1.25rem', background: s.accent, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
            🖨️ Drucken / PDF
          </button>
        </div>
      </div>

      {/* Tabelle */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: s.muted }}>Keine Werke mit diesen Kriterien gefunden.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: s.bgElevated }}>
                {katalogSpalten.includes('nummer') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33`, whiteSpace: 'nowrap' }}>Nr.</th>}
                {katalogSpalten.includes('titel') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Titel</th>}
                {katalogSpalten.includes('kategorie') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Kategorie</th>}
                {katalogSpalten.includes('kuenstler') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Künstler:in</th>}
                {katalogSpalten.includes('masse') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Maße</th>}
                {katalogSpalten.includes('technik') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Technik</th>}
                {katalogSpalten.includes('preis') && <th style={{ padding: '8px 10px', textAlign: 'right', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Preis</th>}
                {katalogSpalten.includes('status') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Status</th>}
                {katalogSpalten.includes('datum') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33`, whiteSpace: 'nowrap' }}>Erstellt</th>}
                {katalogSpalten.includes('kaeufer') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Käufer:in</th>}
                {katalogSpalten.includes('verkauftam') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33`, whiteSpace: 'nowrap' }}>Verkauft am</th>}
                {katalogSpalten.includes('stueck') && <th style={{ padding: '8px 10px', textAlign: 'right', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Stück</th>}
                {katalogSpalten.includes('standort') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Standort</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a: any, i: number) => (
                <tr key={a.id || a.number || i}
                  onClick={() => setKatalogSelectedWork(a)}
                  style={{ background: i % 2 === 0 ? 'transparent' : `${s.accent}06`, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${s.accent}14`)}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : `${s.accent}06`)}
                >
                  {katalogSpalten.includes('nummer') && <td style={{ padding: '7px 10px', color: s.accent, fontWeight: 700, borderBottom: `1px solid ${s.accent}18`, whiteSpace: 'nowrap' }}>{a.number || a.id || '–'}</td>}
                  {katalogSpalten.includes('titel') && <td style={{ padding: '7px 10px', color: s.text, fontWeight: 600, borderBottom: `1px solid ${s.accent}18` }}>{a.title || '–'}</td>}
                  {katalogSpalten.includes('kategorie') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18` }}>{getCategoryLabel(a.category)}</td>}
                  {katalogSpalten.includes('kuenstler') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18` }}>{a.artist || '–'}</td>}
                  {katalogSpalten.includes('masse') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18`, whiteSpace: 'nowrap' }}>{a.dimensions || '–'}</td>}
                  {katalogSpalten.includes('technik') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18` }}>{a.technik || '–'}</td>}
                  {katalogSpalten.includes('preis') && <td style={{ padding: '7px 10px', color: s.text, textAlign: 'right', borderBottom: `1px solid ${s.accent}18`, whiteSpace: 'nowrap' }}>{a.price ? `€ ${Number(a.price).toFixed(2)}` : '–'}</td>}
                  {katalogSpalten.includes('status') && <td style={{ padding: '7px 10px', borderBottom: `1px solid ${s.accent}18` }} onClick={e => e.stopPropagation()}>
                    {a.sold ? <span style={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.82rem' }}>● Verkauft</span>
                      : a.reserved ? <span style={{ color: '#d97706', fontWeight: 700, fontSize: '0.82rem' }} title={a.reservedFor ? `Reserviert für ${a.reservedFor}` : ''}>🔶 Reserviert{a.reservedFor ? ` – ${a.reservedFor}` : ''}</span>
                      : onToggleInExhibition ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: a.inExhibition ? '#15803d' : s.muted, fontSize: '0.82rem', fontWeight: 600 }} title={a.inExhibition ? 'In Online-Galerie sichtbar' : 'Nur Lager & Kassa (nicht in Online-Galerie)'}>{a.inExhibition ? '● Online-Galerie' : '○ Nur Lager/Kassa'}</span>
                          <button
                            type="button"
                            onClick={() => onToggleInExhibition(a)}
                            title={a.inExhibition ? 'Aus Online-Galerie → nur Lager & Kassa' : 'In Online-Galerie anzeigen'}
                            style={{
                              padding: '2px 6px',
                              fontSize: '0.75rem',
                              border: `1px solid ${s.accent}44`,
                              borderRadius: 4,
                              background: s.bgElevated,
                              color: s.accent,
                              cursor: 'pointer',
                            }}
                          >
                            {a.inExhibition ? '→ Nur Lager/Kassa' : '→ Online-Galerie'}
                          </button>
                        </span>
                        ) : a.inExhibition ? <span style={{ color: '#15803d', fontWeight: 600, fontSize: '0.82rem' }}>● Online-Galerie</span>
                        : <span style={{ color: s.muted, fontSize: '0.82rem' }}>○ Nur Lager/Kassa</span>}
                  </td>}
                  {katalogSpalten.includes('datum') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18`, whiteSpace: 'nowrap' }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString('de-DE') : '–'}</td>}
                  {katalogSpalten.includes('kaeufer') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18` }}>{a.buyer || '–'}</td>}
                  {katalogSpalten.includes('verkauftam') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18`, whiteSpace: 'nowrap' }}>{a.soldAt ? new Date(a.soldAt).toLocaleDateString('de-DE') : '–'}</td>}
                  {katalogSpalten.includes('stueck') && <td style={{ padding: '7px 10px', color: s.text, textAlign: 'right', fontWeight: a.quantity > 1 ? 700 : 400, borderBottom: `1px solid ${s.accent}18` }}>{a.quantity ?? 1}</td>}
                  {katalogSpalten.includes('standort') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18` }}>{a.location || '–'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fehlende Felder Hinweis */}
      {filtered.some((a: any) => !a.dimensions && !a.technik) && (
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: `${s.accent}10`, border: `1px solid ${s.accent}33`, borderRadius: 8, fontSize: '0.85rem', color: s.muted }}>
          💡 Tipp: Maße und Technik/Material kannst du beim Bearbeiten eines Werks eintragen – danach erscheinen sie hier und im Ausdruck.
        </div>
      )}

      {/* Werkkarte Modal */}
      {w && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setKatalogSelectedWork(null) }}>
          <div style={{ background: s.bgCard, borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,0.35)', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.82rem', color: s.muted, marginBottom: 2 }}>{galleryData.name || 'K2 Galerie'}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.accent }}>{w.number || w.id || ''}</div>
              </div>
              <button type="button" onClick={() => setKatalogSelectedWork(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: s.muted, cursor: 'pointer', lineHeight: 1, padding: '0.25rem' }}>✕</button>
            </div>
            {w.imageUrl && (
              <div style={{ marginBottom: '1.25rem', borderRadius: 12, overflow: 'hidden', background: s.bgElevated, display: 'flex', justifyContent: 'center' }}>
                <img src={w.imageUrl} alt={w.title || ''} style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain' }} />
              </div>
            )}
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: s.text, marginBottom: 4 }}>{w.title || '–'}</div>
            {w.artist && <div style={{ fontSize: '0.95rem', color: s.muted, fontStyle: 'italic', marginBottom: '0.75rem' }}>{w.artist}</div>}
            <div style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 700, background: w.sold ? '#fef2f2' : w.reserved ? '#fffbeb' : w.inExhibition ? '#f0fdf4' : s.bgElevated, color: statusColor, border: `1px solid ${statusColor}55`, marginBottom: '1.25rem' }}>
              {statusLabel}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              {w.dimensions && <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}><div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Maße</div><div style={{ fontSize: '0.95rem', fontWeight: 600, color: s.text }}>{w.dimensions}</div></div>}
              {w.technik && <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}><div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Technik / Material</div><div style={{ fontSize: '0.95rem', fontWeight: 600, color: s.text }}>{w.technik}</div></div>}
              {w.price ? <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}><div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Preis</div><div style={{ fontSize: '0.95rem', fontWeight: 600, color: s.text }}>€ {Number(w.price).toFixed(2)}</div></div> : null}
              {w.category && <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}><div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Kategorie</div><div style={{ fontSize: '0.95rem', fontWeight: 600, color: s.text }}>{getCategoryLabel(w.category)}</div></div>}
              {w.createdAt && <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}><div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Erstellt</div><div style={{ fontSize: '0.95rem', fontWeight: 600, color: s.text }}>{new Date(w.createdAt).toLocaleDateString('de-DE')}</div></div>}
              {w.soldAt && <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}><div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Verkauft am</div><div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#b91c1c' }}>{new Date(w.soldAt).toLocaleDateString('de-DE')}</div></div>}
              {w.quantity != null && Number(w.quantity) > 1 && <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}><div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Stückzahl</div><div style={{ fontSize: '0.95rem', fontWeight: 700, color: s.text }}>{w.quantity} Exemplare</div></div>}
              {w.buyer && <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem', gridColumn: 'span 2' }}><div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Käufer:in</div><div style={{ fontSize: '0.95rem', fontWeight: 600, color: s.text }}>{w.buyer}</div></div>}
            </div>
            {w.description && <div style={{ fontSize: '0.9rem', color: s.muted, lineHeight: 1.7, borderTop: `1px solid ${s.accent}22`, paddingTop: '0.85rem', marginBottom: '1.25rem' }}>{w.description}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setKatalogSelectedWork(null)}
                style={{ padding: '0.6rem 1.2rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 10, color: s.muted, fontSize: '0.9rem', cursor: 'pointer' }}>
                Schließen
              </button>
              <button type="button" onClick={druckeWerkkarte}
                style={{ padding: '0.6rem 1.4rem', background: s.accent, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
                🖨️ Werkkarte drucken
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Vereinskatalog-Vorschau: 5 ausgesuchte Werke der Mitglieder ─── */}
      <VereinskatalogVorschau />

    </section>
  )
}

function VereinskatalogVorschau() {
  // VK2-Datentrennung: Nur k2-vk2-artworks-* lesen; echte K2-Nummern (0030, K2-K-0030) nicht anzeigen.
  const vereinsWerke = useMemo(() => {
    const result: any[] = []
    try {
      Object.keys(localStorage).filter(k => k.startsWith('k2-vk2-artworks-')).forEach(key => {
        const raw = localStorage.getItem(key) || ''
        if (!raw) return
        const all: any[] = JSON.parse(raw)
        all.filter(a => a?.imVereinskatalog && !isEchteK2Werknummer(String(a?.number ?? a?.id ?? ''))).forEach(a => result.push(a))
      })
    } catch (_) {}
    return result.slice(0, 5)
  }, [])

  if (vereinsWerke.length === 0) return null

  const s = WERBEUNTERLAGEN_STIL

  return (
    <div style={{ marginTop: '2.5rem', borderTop: `2px solid rgba(251,191,36,0.2)`, paddingTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '1.3rem' }}>🏆</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: s.text }}>5 ausgesuchte Werke unserer Mitglieder</div>
          <div style={{ fontSize: '0.78rem', color: s.muted, marginTop: '0.1rem' }}>Vereinskatalog – von Lizenzmitgliedern freigegebene Werke</div>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'rgba(251,191,36,0.7)', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', padding: '0.2rem 0.6rem', borderRadius: 20 }}>
          {vereinsWerke.length} von max. 5
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 180px), 1fr))', gap: '0.75rem' }}>
        {vereinsWerke.map((w: any) => {
          const status = w.verkaufsstatus || 'verfuegbar'
          const statusColor = status === 'verkauft' ? '#ef4444' : status === 'reserviert' ? '#f59e0b' : '#22c55e'
          const statusLabel = status === 'verkauft' ? 'Verkauft' : status === 'reserviert' ? 'Reserviert' : 'Verfügbar'
          return (
            <div key={w.id} style={{ background: s.bgElevated, borderRadius: 12, overflow: 'hidden', border: `1px solid rgba(251,191,36,0.15)` }}>
              {/* Bild */}
              <div style={{ aspectRatio: '4/3', background: '#e8e4dc', position: 'relative', overflow: 'hidden' }}>
                {w.imageUrl
                  ? <img src={w.imageUrl} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', opacity: 0.4 }}>🖼️</div>
                }
                <span style={{ position: 'absolute', top: '0.35rem', right: '0.35rem', padding: '0.1rem 0.4rem', borderRadius: 10, background: 'rgba(255,255,255,0.85)', color: statusColor, fontSize: '0.65rem', fontWeight: 700 }}>
                  {statusLabel}
                </span>
              </div>
              {/* Info */}
              <div style={{ padding: '0.6rem 0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: s.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.title || '–'}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(180,130,20,0.9)', fontWeight: 600, marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.artist || '–'}</div>
                {(w.technik || w.year) && (
                  <div style={{ fontSize: '0.7rem', color: s.muted, marginTop: '0.15rem' }}>{[w.technik, w.year].filter(Boolean).join(' · ')}</div>
                )}
                {w.price && (
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: status === 'verkauft' ? s.muted : s.text, marginTop: '0.3rem' }}>
                    € {Number(w.price).toLocaleString('de-AT')}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
