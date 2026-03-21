import React from 'react'
import { WERBEUNTERLAGEN_STIL } from '../../src/config/marketingWerbelinie'
import { getCategoryLabel } from '../../src/config/tenantConfig'
import {
  resolveArtistLabelForGalerieStatistik,
  type KuenstlerFallbackNamen,
} from '../../src/utils/artworkArtistDisplay'

const s = WERBEUNTERLAGEN_STIL

interface StatistikTabProps {
  allArtworks: any[]
  onMarkAsReserved: (number: string, reservedFor: string) => void
  onRerender: () => void
  /** Verkauf stornieren: Eintrag entfernen, Stückzahl +1. Optional (z. B. ök2 ohne Storno). */
  onStorno?: (number: string) => void
  /** K2/ök2: wenn `artist` leer, wie im Admin aus Kategorie/Werknummer zuordnen (VK2: weglassen). */
  kuenstlerFallback?: KuenstlerFallbackNamen | null
  /** Min/Max/Ø Preisspanne + Ø-Kachel + Druckzeile nur ök2 (Demo); K2/VK2 ohne. */
  showPreisspanneVerkauf?: boolean
}

export default function StatistikTab({
  allArtworks,
  onMarkAsReserved,
  onRerender,
  onStorno,
  kuenstlerFallback,
  showPreisspanneVerkauf = false,
}: StatistikTabProps) {
  let soldEntries: any[] = []
  try { soldEntries = JSON.parse(localStorage.getItem('k2-sold-artworks') || '[]') } catch (_) {}
  let reservedEntries: any[] = []
  try { reservedEntries = JSON.parse(localStorage.getItem('k2-reserved-artworks') || '[]') } catch (_) {}

  const soldNumbers = new Set(soldEntries.map((e: any) => e.number))
  const soldWerke = allArtworks.filter((a: any) => soldNumbers.has(a.number || a.id))
  const gesamtWerke = allArtworks.length
  const inGalerie = allArtworks.filter((a: any) => a.inExhibition).length
  const reserviert = reservedEntries.length

  const umsatzGesamt = soldEntries.reduce((sum: number, e: any) => {
    const werk = allArtworks.find((a: any) => (a.number || a.id) === e.number)
    return sum + (e.soldPrice || werk?.price || 0)
  }, 0)

  const katMap: Record<string, { count: number; umsatz: number }> = {}
  soldWerke.forEach((a: any) => {
    const kat = getCategoryLabel(a.category)
    const soldEntry = soldEntries.find((e: any) => e.number === (a.number || a.id))
    const preis = soldEntry?.soldPrice || a.price || 0
    if (!katMap[kat]) katMap[kat] = { count: 0, umsatz: 0 }
    katMap[kat].count++
    katMap[kat].umsatz += preis
  })
  const katSorted = Object.entries(katMap).sort((a, b) => b[1].umsatz - a[1].umsatz)

  const letzteFuenf = [...soldEntries]
    .sort((a, b) => (b.soldAt || '').localeCompare(a.soldAt || ''))
    .slice(0, 5)
    .map((e: any) => ({ ...e, werk: allArtworks.find((a: any) => (a.number || a.id) === e.number) }))

  const alleVerkaufe = [...soldEntries]
    .sort((a, b) => (b.soldAt || '').localeCompare(a.soldAt || ''))
    .map((e: any) => {
      const werk = allArtworks.find((a: any) => (a.number || a.id) === e.number)
      const preis = e.soldPrice ?? werk?.price ?? 0
      return { ...e, werk, preis }
    })

  const lagerBestand = gesamtWerke - soldWerke.length // Noch im Bestand (nicht verkauft)

  // Wert der Galerie / Bestand: alle angelegten Werke, die noch nicht verkauft sind (Preis × Stückzahl).
  // „In Galerie“ = nur Sichtbarkeit im Netz – für den Lagerwert irrelevant.
  const bestandsWerkeFuerWert = allArtworks.filter((a: any) => !soldNumbers.has(a.number || a.id))
  const stueckzahlProWerk = (a: any) => Math.max(1, Math.floor(Number(a.quantity)) || 1)
  const wertProWerk = (a: any) => (Number(a.price) || 0) * stueckzahlProWerk(a)
  const galerieWert = bestandsWerkeFuerWert.reduce((sum: number, a: any) => sum + wertProWerk(a), 0)
  const galerieNachKuenstler: Record<string, { count: number; wert: number }> = {}
  bestandsWerkeFuerWert.forEach((a: any) => {
    const name = resolveArtistLabelForGalerieStatistik(a, kuenstlerFallback ?? undefined)
    if (!galerieNachKuenstler[name]) galerieNachKuenstler[name] = { count: 0, wert: 0 }
    galerieNachKuenstler[name].count += stueckzahlProWerk(a)
    galerieNachKuenstler[name].wert += wertProWerk(a)
  })
  const galerieNachKategorie: Record<string, { count: number; wert: number }> = {}
  bestandsWerkeFuerWert.forEach((a: any) => {
    const katRaw = getCategoryLabel(a.category)
    const kat = (katRaw && String(katRaw).trim()) || 'Ohne Kategorie'
    if (!galerieNachKategorie[kat]) galerieNachKategorie[kat] = { count: 0, wert: 0 }
    galerieNachKategorie[kat].count += stueckzahlProWerk(a)
    galerieNachKategorie[kat].wert += wertProWerk(a)
  })
  const galerieKuenstlerSorted = Object.entries(galerieNachKuenstler).sort((a, b) => b[1].wert - a[1].wert)
  const galerieKategorieSorted = Object.entries(galerieNachKategorie).sort((a, b) => b[1].wert - a[1].wert)

  const umsatzHeute = alleVerkaufe
    .filter((e: any) => e.soldAt && new Date(e.soldAt).toDateString() === new Date().toDateString())
    .reduce((sum: number, e: any) => sum + (e.preis || 0), 0)

  const exportVerkaufeCsv = () => {
    const header = 'Datum;Nr.;Titel;Preis (€)'
    const rows = alleVerkaufe.map((e: any) => {
      const datum = e.soldAt ? new Date(e.soldAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''
      const titel = (e.werk?.title || e.number || '').replace(/"/g, '""')
      return `${datum};${e.number || ''};"${titel}";${(e.preis || 0).toFixed(2)}`
    })
    const summe = alleVerkaufe.reduce((s: number, e: any) => s + (e.preis || 0), 0)
    const csv = [header, ...rows, '', `;Gesamtumsatz;${summe.toFixed(2)}`].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `verkaufsliste-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const printVerkaufsUndLagerstatistik = () => {
    const summe = alleVerkaufe.reduce((s: number, e: any) => s + (e.preis || 0), 0)
    const preiseVerkauf = alleVerkaufe.map((e: any) => e.preis || 0).filter((p: number) => p > 0)
    const preisDurchForPrint = preiseVerkauf.length ? preiseVerkauf.reduce((a: number, b: number) => a + b, 0) / preiseVerkauf.length : 0
    const lagerBlock = `
      <h2 style="font-size:1.1rem;margin:0 0 0.5rem">📦 Lagerstatistik</h2>
      <table style="width:auto;border-collapse:collapse;font-size:0.9rem;margin-bottom:1.5rem">
        <tr><td style="padding:0.35rem 1rem 0.35rem 0">Werke gesamt</td><td style="padding:0.35rem 0;font-weight:700">${gesamtWerke}</td></tr>
        <tr><td style="padding:0.35rem 1rem 0.35rem 0">Verkaufte Werke</td><td style="padding:0.35rem 0;font-weight:700">${soldWerke.length}</td></tr>
        <tr><td style="padding:0.35rem 1rem 0.35rem 0">Im Bestand (Lager)</td><td style="padding:0.35rem 0;font-weight:700">${lagerBestand}</td></tr>
        <tr><td style="padding:0.35rem 1rem 0.35rem 0">In Galerie</td><td style="padding:0.35rem 0;font-weight:700">${inGalerie}</td></tr>
        <tr><td style="padding:0.35rem 1rem 0.35rem 0">Reserviert</td><td style="padding:0.35rem 0;font-weight:700">${reserviert}</td></tr>
        <tr><td style="padding:0.35rem 1rem 0.35rem 0">Gesamtumsatz</td><td style="padding:0.35rem 0;font-weight:700">€ ${summe.toFixed(2)}</td></tr>
        ${showPreisspanneVerkauf && preiseVerkauf.length > 0 ? `<tr><td style="padding:0.35rem 1rem 0.35rem 0">Ø Verkaufspreis</td><td style="padding:0.35rem 0;font-weight:700">€ ${preisDurchForPrint.toFixed(2)}</td></tr>` : ''}
      </table>`
    const rows = alleVerkaufe.map((e: any, i: number) => {
      const datum = e.soldAt ? new Date(e.soldAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '–'
      const titel = e.werk?.title || e.number || '–'
      const preis = (e.preis || 0).toFixed(2)
      return `<tr><td>${i + 1}</td><td>${datum}</td><td>${e.number || '–'}</td><td>${titel}</td><td style="text-align:right">€ ${preis}</td></tr>`
    }).join('')
    const verkaufsBlock = alleVerkaufe.length === 0
      ? '<h2 style="font-size:1.1rem;margin:0 0 0.5rem">📋 Verkaufsliste</h2><p style="color:#666;margin:0">Keine Verkäufe erfasst.</p>'
      : `<h2 style="font-size:1.1rem;margin:0 0 0.5rem">📋 Verkaufsliste</h2><p class="meta">${new Date().toLocaleDateString('de-DE')} · ${alleVerkaufe.length} Verkauf/Verkäufe · Summe € ${summe.toFixed(2)}</p><table><thead><tr><th>#</th><th>Datum</th><th>Nr.</th><th>Titel</th><th style="text-align:right">Preis</th></tr></thead><tbody>${rows}</tbody></table><p class="summe">Gesamtumsatz: € ${summe.toFixed(2)}</p>`
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Verkaufs- und Lagerstatistik</title><style>body{font-family:system-ui,sans-serif;padding:1.5rem;max-width:900px;margin:0 auto}h1{font-size:1.35rem;margin-bottom:0.75rem}table{width:100%;border-collapse:collapse;font-size:0.9rem}th,td{padding:0.5rem 0.75rem;border:1px solid #ddd;text-align:left}th{background:#f5f5f5;font-weight:700}.summe{font-weight:700;font-size:1rem;margin-top:0.75rem}.meta{color:#666;font-size:0.85rem;margin-bottom:0.75rem}@media print{body{padding:0.5rem}}</style></head><body><h1>Verkaufs- und Lagerstatistik</h1><p style="color:#666;font-size:0.85rem;margin-bottom:1rem">Stand: ${new Date().toLocaleDateString('de-DE')}</p>${lagerBlock}${verkaufsBlock}</body></html>`
    const w = window.open('', '_blank')
    if (w) {
      try { w.focus() } catch (_) {}
      w.document.write(html)
      w.document.close()
      setTimeout(() => w.print(), 300)
    }
  }

  const preise = soldWerke.map((a: any) => a.price || 0).filter((p: number) => p > 0)
  const preisMin = preise.length ? Math.min(...preise) : 0
  const preisMax = preise.length ? Math.max(...preise) : 0
  const preisDurch = preise.length ? preise.reduce((a: number, b: number) => a + b, 0) / preise.length : 0

  const kachelStyle = { background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: 16, padding: '1.25rem', boxShadow: s.shadow }

  let anfragen: any[] = []
  try { anfragen = JSON.parse(localStorage.getItem('k2-anfragen') || '[]') } catch (_) {}
  const neueAnfragen = anfragen.filter((a: any) => a.status === 'neu')

  const markAnfrageGelesen = (id: string) => {
    try {
      const all = JSON.parse(localStorage.getItem('k2-anfragen') || '[]')
      const idx = all.findIndex((x: any) => x.id === id)
      if (idx !== -1) { all[idx] = { ...all[idx], status: 'gelesen' }; localStorage.setItem('k2-anfragen', JSON.stringify(all)) }
    } catch (_) {}
    onRerender()
  }

  const deleteAnfrage = (id: string) => {
    try {
      const all = JSON.parse(localStorage.getItem('k2-anfragen') || '[]')
      localStorage.setItem('k2-anfragen', JSON.stringify(all.filter((x: any) => x.id !== id)))
    } catch (_) {}
    onRerender()
  }

  return (
    <section style={{ background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: 24, padding: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '2rem' }}>

      {/* Kennzahlen-Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ ...kachelStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: s.accent }}>{soldWerke.length}</div>
          <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4 }}>Verkaufte Werke</div>
        </div>
        <div style={{ ...kachelStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d' }}>€ {umsatzGesamt.toFixed(0)}</div>
          <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4 }}>Gesamtumsatz</div>
        </div>
        <div style={{ ...kachelStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: s.text }}>{gesamtWerke}</div>
          <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4 }}>Werke gesamt</div>
        </div>
        <div style={{ ...kachelStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb' }}>{inGalerie}</div>
          <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4 }}>In Galerie</div>
        </div>
        <div style={{ ...kachelStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706' }}>{reserviert}</div>
          <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4 }}>Reserviert</div>
        </div>
        <div style={{ ...kachelStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: umsatzHeute > 0 ? '#15803d' : s.muted }}>€ {umsatzHeute.toFixed(0)}</div>
          <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4 }}>Umsatz heute</div>
        </div>
        <div style={{ ...kachelStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: galerieWert > 0 ? '#16a34a' : s.muted }}>€ {galerieWert.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4 }}>Wert der Galerie</div>
        </div>
        {showPreisspanneVerkauf && preise.length > 0 && (
          <div style={{ ...kachelStyle, textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.text }}>€ {preisDurch.toFixed(0)}</div>
            <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4 }}>Ø Verkaufspreis</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

        {/* Nach Kategorie */}
        <div style={kachelStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: '0 0 1rem' }}>📂 Umsatz nach Kategorie</h3>
          {katSorted.length === 0 ? (
            <div style={{ color: s.muted, fontSize: '0.9rem' }}>Noch keine Verkäufe</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {katSorted.map(([kat, data]) => {
                const pct = umsatzGesamt > 0 ? (data.umsatz / umsatzGesamt) * 100 : 0
                return (
                  <div key={kat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 4 }}>
                      <span style={{ color: s.text, fontWeight: 600 }}>{kat}</span>
                      <span style={{ color: s.muted }}>{data.count}× · € {data.umsatz.toFixed(0)}</span>
                    </div>
                    <div style={{ height: 8, background: s.bgElevated, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${s.accent}, #d96b35)`, borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Wert der Galerie – nach Künstler */}
        <div style={kachelStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: '0 0 0.35rem' }}>🖼️ Wert der Galerie – nach Künstler</h3>
          <p style={{ fontSize: '0.78rem', color: s.muted, margin: '0 0 1rem', lineHeight: 1.3 }}>Bestand: alle nicht verkauften Werke · <strong>Stk.</strong> = Stückzahl (mehrere Stück pro Werk werden addiert)</p>
          {galerieKuenstlerSorted.length === 0 ? (
            <div style={{ color: s.muted, fontSize: '0.9rem' }}>Keine Werke im Bestand</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {galerieKuenstlerSorted.map(([name, data]) => {
                const pct = galerieWert > 0 ? (data.wert / galerieWert) * 100 : 0
                return (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 4 }}>
                      <span style={{ color: s.text, fontWeight: 600 }}>{name}</span>
                      <span style={{ color: s.muted }}>{data.count} Stk. · € {data.wert.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </div>
                    <div style={{ height: 8, background: s.bgElevated, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #16a34a, #22c55e)', borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Wert der Galerie – nach Artikel (Kategorie) */}
        <div style={kachelStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: '0 0 0.35rem' }}>📂 Wert der Galerie – nach Artikel</h3>
          <p style={{ fontSize: '0.78rem', color: s.muted, margin: '0 0 1rem', lineHeight: 1.3 }}>Bestand: alle nicht verkauften Werke · <strong>Stk.</strong> = Stückzahl · ohne Kategorie → „Ohne Kategorie“ (nicht als Bilder gewertet)</p>
          {galerieKategorieSorted.length === 0 ? (
            <div style={{ color: s.muted, fontSize: '0.9rem' }}>Keine Werke im Bestand</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {galerieKategorieSorted.map(([kat, data]) => {
                const pct = galerieWert > 0 ? (data.wert / galerieWert) * 100 : 0
                return (
                  <div key={kat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 4 }}>
                      <span style={{ color: s.text, fontWeight: 600 }}>{kat}</span>
                      <span style={{ color: s.muted }}>{data.count} Stk. · € {data.wert.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </div>
                    <div style={{ height: 8, background: s.bgElevated, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #16a34a, #22c55e)', borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Letzte Verkäufe */}
        <div style={kachelStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: '0 0 1rem' }}>🕐 Letzte Verkäufe</h3>
          {letzteFuenf.length === 0 ? (
            <div style={{ color: s.muted, fontSize: '0.9rem' }}>Noch keine Verkäufe</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {letzteFuenf.map((e: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: i < letzteFuenf.length - 1 ? `1px solid ${s.accent}18` : 'none' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: s.text }}>{e.werk?.title || e.number}</div>
                    <div style={{ fontSize: '0.78rem', color: s.muted }}>{e.soldAt ? new Date(e.soldAt).toLocaleDateString('de-DE') : '–'} · {e.number}</div>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#15803d' }}>
                    € {(e.soldPrice || e.werk?.price || 0).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preisspanne – nur ök2 */}
        {showPreisspanneVerkauf && preise.length > 0 && (
          <div style={kachelStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: '0 0 1rem' }}>💰 Preisspanne (verkaufte Werke)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.text }}>€ {preisMin.toFixed(0)}</div>
                <div style={{ fontSize: '0.78rem', color: s.muted }}>Minimum</div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.accent }}>€ {preisDurch.toFixed(0)}</div>
                <div style={{ fontSize: '0.78rem', color: s.muted }}>Durchschnitt</div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.text }}>€ {preisMax.toFixed(0)}</div>
                <div style={{ fontSize: '0.78rem', color: s.muted }}>Maximum</div>
              </div>
            </div>
          </div>
        )}

        {/* Reservierungen */}
        {reservedEntries.length > 0 && (
          <div style={kachelStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: '0 0 1rem' }}>🔶 Reservierungen</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {reservedEntries.map((e: any, i: number) => {
                const werk = allArtworks.find((a: any) => (a.number || a.id) === e.number)
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: i < reservedEntries.length - 1 ? `1px solid ${s.accent}18` : 'none' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: s.text }}>{werk?.title || e.number}</div>
                      <div style={{ fontSize: '0.78rem', color: s.muted }}>{e.reservedFor ? `für ${e.reservedFor} · ` : ''}{e.reservedAt ? new Date(e.reservedAt).toLocaleDateString('de-DE') : ''}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onMarkAsReserved(e.number, '')}
                      style={{ padding: '0.3rem 0.6rem', background: 'none', border: `1px solid ${s.muted}44`, borderRadius: 6, color: s.muted, fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      Aufheben
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Verkaufsliste – alle Umsätze ansehen & drucken */}
        <div style={{ ...kachelStyle, gridColumn: '1 / -1', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: 0 }}>📋 Verkaufsliste</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={printVerkaufsUndLagerstatistik}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: s.gradientAccent, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', boxShadow: s.shadow }}
              >
                🖨️ Verkaufs- & Lagerstatistik drucken
              </button>
              {alleVerkaufe.length > 0 && (
                <button
                  type="button"
                  onClick={exportVerkaufeCsv}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: s.bgElevated, border: `1px solid ${s.accent}44`, borderRadius: 8, color: s.text, fontWeight: 600, cursor: 'pointer' }}
                >
                  📥 CSV exportieren
                </button>
              )}
            </div>
          </div>
          {alleVerkaufe.length === 0 ? (
            <div style={{ color: s.muted, fontSize: '0.9rem' }}>Noch keine Verkäufe. Verkäufe aus der Kassa erscheinen hier.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${s.accent}44` }}>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: s.muted, fontWeight: 600 }}>#</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: s.muted, fontWeight: 600 }}>Datum</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: s.muted, fontWeight: 600 }}>Nr.</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: s.muted, fontWeight: 600 }}>Titel</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: s.muted, fontWeight: 600 }}>Preis</th>
                    {onStorno && <th style={{ padding: '0.5rem 0.75rem', color: s.muted, fontWeight: 600 }}>Aktion</th>}
                  </tr>
                </thead>
                <tbody>
                  {alleVerkaufe.map((e: any, i: number) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${s.accent}18` }}>
                      <td style={{ padding: '0.5rem 0.75rem', color: s.text }}>{i + 1}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: s.text }}>{e.soldAt ? new Date(e.soldAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '–'}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: s.text }}>{e.number || '–'}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: s.text }}>{e.werk?.title || '–'}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#15803d' }}>€ {(e.preis || 0).toFixed(2)}</td>
                      {onStorno && (
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Verkauf von „${e.werk?.title || e.number}“ (Nr. ${e.number}) stornieren? Das Werk gilt wieder als verfügbar.`)) {
                                onStorno(e.number)
                                onRerender()
                              }
                            }}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: 'transparent', border: `1px solid ${s.muted}`, borderRadius: 6, color: s.muted, cursor: 'pointer' }}
                          >
                            Stornieren
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', fontWeight: 700, color: s.text }}>Gesamtumsatz: € {alleVerkaufe.reduce((sum: number, e: any) => sum + (e.preis || 0), 0).toFixed(2)}</div>
            </div>
          )}
        </div>

        {/* Anfragen-Inbox */}
        {anfragen.length > 0 && (
          <div style={{ ...kachelStyle, gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: 0 }}>
                ✉️ Anfragen
                {neueAnfragen.length > 0 && <span style={{ marginLeft: 8, background: '#ef4444', color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: '0.78rem', fontWeight: 700 }}>{neueAnfragen.length} neu</span>}
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {anfragen.map((a: any, i: number) => (
                <div key={a.id || i} style={{ padding: '0.75rem', background: a.status === 'neu' ? `${s.accent}10` : s.bgElevated, borderRadius: 10, border: a.status === 'neu' ? `1px solid ${s.accent}44` : `1px solid ${s.accent}18` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: s.text, fontSize: '0.9rem' }}>{a.name} <span style={{ color: s.muted, fontWeight: 400 }}>– {a.email}</span></div>
                      <div style={{ fontSize: '0.82rem', color: s.accent, marginTop: 2 }}>Werk: {a.artworkTitle || a.artworkNumber}{a.artworkPrice ? ` · € ${Number(a.artworkPrice).toFixed(0)}` : ''}</div>
                      {a.nachricht && <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4, fontStyle: 'italic' }}>„{a.nachricht}"</div>}
                      <div style={{ fontSize: '0.75rem', color: s.muted, marginTop: 4 }}>{a.createdAt ? new Date(a.createdAt).toLocaleString('de-DE') : ''}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      {a.status === 'neu' && (
                        <button
                          type="button"
                          onClick={() => markAnfrageGelesen(a.id)}
                          style={{ padding: '0.3rem 0.6rem', background: s.accent, color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          ✓ Gelesen
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteAnfrage(a.id)}
                        style={{ padding: '0.3rem 0.6rem', background: 'none', border: `1px solid ${s.muted}44`, borderRadius: 6, color: s.muted, fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </section>
  )
}
