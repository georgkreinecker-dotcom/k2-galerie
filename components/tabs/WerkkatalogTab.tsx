import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { WERBEUNTERLAGEN_STIL } from '../../src/config/marketingWerbelinie'
import {
  getCategoryLabel,
  getEntryTypeLabel,
  ARTWORK_CATEGORIES,
  type EntryTypeId,
  FOCUS_DIRECTIONS,
  getEffectiveDirectionFromWork,
  getCategoriesForDirection,
} from '../../src/config/tenantConfig'
import { isEchteK2Werknummer, resolveArtworkImages } from '../../src/utils/artworksStorage'
import { formatEkAnzeige } from '../../src/utils/artworkEkVk'
import { getShopSoldArtworksKey } from '../../src/utils/shopContextKeys'
import {
  resolveArtistLabelForGalerieStatistik,
  type KuenstlerFallbackNamen,
} from '../../src/utils/artworkArtistDisplay'
import { sortArtworksCategoryBlocksThenNumberAsc } from '../../src/utils/artworkSort'

const s = WERBEUNTERLAGEN_STIL

function escAttr(v: string): string {
  return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function rowKeyArtwork(a: any): string {
  return String(a?.number ?? a?.id ?? '')
}

/** Spalte „Typ“: ök2 = Sparte aus Werk (wie Werke verwalten), sonst entryType-Label. */
function werkKatalogTypZelle(isOeffentlich: boolean, isVk2: boolean, a: { entryType?: string; category?: string }): string {
  if (isOeffentlich && !isVk2) {
    return FOCUS_DIRECTIONS.find((d) => d.id === getEffectiveDirectionFromWork(a))?.label ?? getEntryTypeLabel(a.entryType)
  }
  return getEntryTypeLabel(a.entryType)
}

type WerkkarteCardOpts = {
  galName: string
  datum: string
  isVk2: boolean
  showTypAndCategory: boolean
  showOek2TypRow?: boolean
  isOeffentlich?: boolean
  /** K2/ök2: aufgelöster Künstler:in-Name (wie Statistik). VK2: weglassen → nur `w.artist`. */
  artistDisplay?: string
}

/** Eine Werkkarte (innerer HTML-Block) – gleiches Layout für Einzeldruck und Sammeldruck (Sportwagen: eine Quelle). */
function buildWerkkarteCardHtml(w: any, opts: WerkkarteCardOpts): string {
  const statusColor = w.sold ? '#b91c1c' : w.reserved ? '#d97706' : w.inExhibition ? '#15803d' : '#6b7280'
  const statusLabel = w.sold ? 'Verkauft' : w.reserved ? `🔶 Reserviert${w.reservedFor ? ` – ${w.reservedFor}` : ''}` : w.inExhibition ? 'In Online-Galerie' : 'Nur Lager & Kassa'
  const imgHtml = w.imageUrl ? `<img class="werk-img" src="${escAttr(w.imageUrl)}" alt="${escAttr(w.title || '')}" />` : ''
  const kuenstlerZeile = opts.artistDisplay !== undefined ? opts.artistDisplay : w.artist || ''
  if (opts.isVk2) {
    return `
      <div class="werk-page-inner">
      <div class="header"><h1>${opts.galName}</h1><div class="nr">${w.number || w.id || ''}</div></div>
      ${imgHtml}
      <div class="titel">${w.title || '–'}</div>
      <div class="kuenstler">${escAttr(kuenstlerZeile)}</div>
      <div class="meta">
        ${opts.showTypAndCategory ? `<div class="meta-item"><label>Typ</label><span>${getEntryTypeLabel(w.entryType)}</span></div>` : ''}
        ${w.dimensions ? `<div class="meta-item"><label>Maße</label><span>${w.dimensions}</span></div>` : ''}
        ${w.technik ? `<div class="meta-item"><label>Technik / Material</label><span>${w.technik}</span></div>` : ''}
        ${w.category ? `<div class="meta-item"><label>Kategorie</label><span>${getCategoryLabel(w.category)}</span></div>` : ''}
        ${w.createdAt ? `<div class="meta-item"><label>Erstellt</label><span>${new Date(w.createdAt).toLocaleDateString('de-DE')}</span></div>` : ''}
      </div>
      ${w.description ? `<div class="beschreibung">${w.description}</div>` : ''}
      <div class="footer"><span>${opts.galName}</span><span>Vereinskatalog · ${opts.datum}</span></div>
      </div>`
  }
  return `
      <div class="werk-page-inner">
      <div class="header"><h1>${opts.galName}</h1><div class="nr">${w.number || w.id || ''}</div></div>
      ${imgHtml}
      <div class="titel">${w.title || '–'}</div>
      <div class="kuenstler">${escAttr(kuenstlerZeile)}</div>
      <div class="status-badge" style="background: ${w.sold ? '#fef2f2' : w.reserved ? '#fffbeb' : w.inExhibition ? '#f0fdf4' : '#f9fafb'}; color: ${statusColor}; border-color: ${statusColor}44;">${statusLabel}</div>
      <div class="meta">
        ${opts.showOek2TypRow && opts.isOeffentlich ? `<div class="meta-item"><label>Typ</label><span>${escAttr(werkKatalogTypZelle(true, false, w))}</span></div>` : ''}
        ${w.dimensions ? `<div class="meta-item"><label>Maße</label><span>${w.dimensions}</span></div>` : ''}
        ${w.technik ? `<div class="meta-item"><label>Technik / Material</label><span>${w.technik}</span></div>` : ''}
        ${w.category ? `<div class="meta-item"><label>Kategorie</label><span>${getCategoryLabel(w.category)}</span></div>` : ''}
        <div class="meta-item"><label>EK</label><span>${formatEkAnzeige(w.purchasePrice)}</span></div>
        <div class="meta-item"><label>VK</label><span>${w.price ? `€ ${Number(w.price).toFixed(2)}` : '–'}</span></div>
        ${(w.quantity != null && Number(w.quantity) > 1) ? `<div class="meta-item"><label>Stückzahl</label><span>${w.quantity} Exemplare</span></div>` : ''}
        ${w.createdAt ? `<div class="meta-item"><label>Erstellt</label><span>${new Date(w.createdAt).toLocaleDateString('de-DE')}</span></div>` : ''}
        ${w.soldAt ? `<div class="meta-item"><label>Verkauft am</label><span>${new Date(w.soldAt).toLocaleDateString('de-DE')}</span></div>` : ''}
        ${w.buyer ? `<div class="meta-item"><label>Käufer:in</label><span>${w.buyer}</span></div>` : ''}
        ${w.soldPrice && w.soldPrice !== w.price ? `<div class="meta-item"><label>Verkaufspreis</label><span>€ ${Number(w.soldPrice).toFixed(2)}</span></div>` : ''}
      </div>
      ${w.description ? `<div class="beschreibung">${w.description}</div>` : ''}
      <div class="footer"><span>${opts.galName}</span><span>Werkkarte · ${opts.datum}</span></div>
      </div>`
}

type EchtheitszertifikatOpts = WerkkarteCardOpts & {
  artistDisplay: string
  certDateLong: string
  galCityLine: string
}

/** Zweite Druckseite: Echtheitszertifikat mit großzügigem Unterschriftenfeld für die Künstler:in (eine Quelle mit Werkkarte, A5). */
function buildEchtheitszertifikatHtml(w: any, opts: EchtheitszertifikatOpts): string {
  const imgHtml = w.imageUrl
    ? `<div class="cert-img-wrap"><img class="cert-thumb" src="${escAttr(w.imageUrl)}" alt="" /></div>`
    : ''
  const kat = w.category ? getCategoryLabel(w.category) : ''
  const jahr =
    w.date
      ? new Date(w.date).getFullYear()
      : w.createdAt
        ? new Date(w.createdAt).getFullYear()
        : ''
  const stueck =
    w.quantity != null && Number(w.quantity) > 1
      ? `<div class="cert-row"><span class="cert-k">Auflage / Stückzahl</span><span class="cert-v">${escAttr(String(w.quantity))} Exemplare</span></div>`
      : ''
  const vk2Hint = opts.isVk2
    ? `<p class="cert-lead">Hiermit bestätigt die unterzeichnende Künstlerin / der unterzeichnende Künstler, dass das nachstehend bezeichnete Werk von ihr/ihm stammt.</p>`
    : `<p class="cert-lead">Hiermit bestätigt die unterzeichnende <strong>Künstlerin</strong> / der unterzeichnende <strong>Künstler</strong>, dass das nachstehend bezeichnete Werk in <strong>eigener Schöpfung</strong> entstanden ist und als <strong>Original</strong> ausgegeben wird.</p>`

  return `
      <div class="cert-page-inner">
        <div class="cert-frame">
          <div class="cert-ornament">◆</div>
          <h1 class="cert-h1">Echtheitszertifikat</h1>
          <p class="cert-gal">${escAttr(opts.galName)}${opts.galCityLine ? ` · ${escAttr(opts.galCityLine)}` : ''}</p>
          <div class="cert-rule"></div>
          ${imgHtml}
          ${vk2Hint}
          <div class="cert-facts">
            <div class="cert-row"><span class="cert-k">Werk-Nr.</span><span class="cert-v">${escAttr(String(w.number || w.id || '–'))}</span></div>
            <div class="cert-row"><span class="cert-k">Titel</span><span class="cert-v">${escAttr(String(w.title || '–'))}</span></div>
            <div class="cert-row"><span class="cert-k">Künstler:in</span><span class="cert-v">${escAttr(opts.artistDisplay)}</span></div>
            ${w.technik ? `<div class="cert-row"><span class="cert-k">Technik / Material</span><span class="cert-v">${escAttr(w.technik)}</span></div>` : ''}
            ${w.dimensions ? `<div class="cert-row"><span class="cert-k">Maße</span><span class="cert-v">${escAttr(w.dimensions)}</span></div>` : ''}
            ${kat ? `<div class="cert-row"><span class="cert-k">Kategorie</span><span class="cert-v">${escAttr(kat)}</span></div>` : ''}
            ${jahr ? `<div class="cert-row"><span class="cert-k">Jahr</span><span class="cert-v">${jahr}</span></div>` : ''}
            ${stueck}
          </div>
          <p class="cert-meta">Ausgestellt am <strong>${escAttr(opts.certDateLong)}</strong></p>
          <div class="cert-sig-section">
            <p class="cert-sig-hint">Bitte hier mit fester Hand unterschreiben (Original dokumentiert die Echtheit des Werks).</p>
            <div class="cert-sig-pad">
              <div class="cert-sig-line"></div>
              <div class="cert-sig-label">Unterschrift Künstler:in</div>
            </div>
            <div class="cert-sig-pad cert-sig-pad--small">
              <div class="cert-sig-line cert-sig-line--thin"></div>
              <div class="cert-sig-label">Ort, Datum <span class="cert-opt">(optional)</span></div>
            </div>
          </div>
          <div class="cert-footer-foot">Echtheitszertifikat · ${escAttr(opts.galName)} · ${escAttr(opts.datum)}</div>
        </div>
      </div>`
}

const WERKKARTE_PRINT_STYLES = `
        @media print { @page { size: A5; margin: 10mm; } }
        body { font-family: Georgia, serif; color: #111; margin: 0; padding: 0; }
        .werk-page { page-break-after: always; }
        .werk-page:last-child { page-break-after: auto; }
        .werk-page-inner { padding: 20px; max-width: 148mm; margin: 0 auto; box-sizing: border-box; }
        .header { border-bottom: 3px solid #8b6914; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
        .header h1 { margin: 0; font-size: 14px; color: #8b6914; font-family: Arial, sans-serif; }
        .header .nr { font-size: 22px; font-weight: bold; color: #111; font-family: Arial, sans-serif; }
        .werk-img { width: 100%; max-height: 160px; object-fit: contain; border-radius: 6px; margin-bottom: 14px; background: #f5f0e8; }
        .titel { font-size: 22px; font-weight: bold; margin: 0 0 4px; color: #111; }
        .kuenstler { font-size: 13px; color: #555; margin: 0 0 14px; font-style: italic; }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; font-size: 12px; margin-bottom: 14px; }
        .meta-item label { color: #888; display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1px; }
        .meta-item span { color: #111; font-weight: 500; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-bottom: 14px; border: 1px solid; }
        .beschreibung { font-size: 12px; color: #444; line-height: 1.6; border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 6px; }
        .footer { margin-top: 16px; border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 10px; color: #999; display: flex; justify-content: space-between; }
        /* ─── Echtheitszertifikat (zweite A5-Seite) ─── */
        .cert-page-inner { padding: 14px 18px 18px; max-width: 148mm; margin: 0 auto; box-sizing: border-box; }
        .cert-frame { border: 2px solid #8b6914; border-radius: 4px; padding: 18px 20px 14px; box-sizing: border-box; min-height: 168mm; position: relative; background: linear-gradient(180deg, #fffefb 0%, #faf8f4 100%); }
        .cert-ornament { text-align: center; font-size: 11px; color: #c4a35a; letter-spacing: 0.4em; margin-bottom: 6px; }
        .cert-h1 { margin: 0 0 6px; font-size: 17px; font-weight: 700; text-align: center; letter-spacing: 0.18em; text-transform: uppercase; color: #6b4e0e; font-family: Arial, sans-serif; }
        .cert-gal { margin: 0 0 12px; text-align: center; font-size: 11px; color: #3d3a36; font-style: italic; }
        .cert-rule { height: 1px; background: linear-gradient(90deg, transparent, #c4a35a, transparent); margin: 0 0 12px; }
        .cert-img-wrap { text-align: center; margin-bottom: 12px; }
        .cert-thumb { max-height: 88px; max-width: 100%; object-fit: contain; border-radius: 6px; border: 1px solid #e8dcc8; background: #f5f0e8; }
        .cert-lead { font-size: 11.5px; line-height: 1.55; color: #1c1a18; margin: 0 0 14px; text-align: justify; hyphens: auto; }
        .cert-facts { border: 1px solid #e8dcc8; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px; background: rgba(255,255,255,0.92); }
        .cert-row { display: flex; justify-content: space-between; gap: 12px; font-size: 11px; padding: 4px 0; border-bottom: 1px dotted #c4b8a8; }
        .cert-row:last-child { border-bottom: none; }
        .cert-k { color: #2c2824; flex: 0 0 38%; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
        .cert-v { color: #0f0f0f; font-weight: 600; text-align: right; flex: 1; }
        .cert-meta { font-size: 10.5px; color: #2c2824; margin: 0 0 16px; text-align: center; }
        .cert-sig-section { margin-top: 8px; }
        .cert-sig-hint { font-size: 9.5px; color: #4a4540; margin: 0 0 10px; text-align: center; line-height: 1.4; }
        .cert-sig-pad { margin-bottom: 14px; }
        .cert-sig-pad--small { margin-bottom: 0; }
        .cert-sig-line { height: 0; border: none; border-bottom: 2px solid #2c2c2c; margin: 0 8px 6px; min-width: 200px; }
        .cert-sig-line--thin { border-bottom-width: 1px; border-color: #666; }
        .cert-sig-label { text-align: center; font-size: 10px; color: #2c2824; font-weight: 600; letter-spacing: 0.04em; }
        .cert-opt { font-weight: 400; color: #5c5650; font-size: 9px; }
        .cert-footer-foot { position: absolute; bottom: 10px; left: 20px; right: 20px; text-align: center; font-size: 8.5px; color: #6b6560; }
        @media print { * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`

function openWerkkartePrintWindow(title: string, bodyInner: string): void {
  const pw = window.open('', '_blank')
  if (!pw) {
    alert('Pop-up blockiert – bitte erlauben.')
    return
  }
  const safeTitle = escAttr(title).replace(/</g, '')
  pw.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>${safeTitle}</title>
      <style>${WERKKARTE_PRINT_STYLES}</style></head><body>${bodyInner}
      <script>window.onload=()=>window.print()</script>
      </body></html>`)
  pw.document.close()
}

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
  /** ök2/VK2: Erste Kategorisierung wie in Werke verwalten – Typ + Kategorie (eine Quelle). */
  isOeffentlich?: boolean
  /** VK2: Gleiche Typ-/Kategorie-Filter und Spalte „Typ“ wie ök2 (einmal im VK2 umsetzen, K2 optional später). */
  isVk2?: boolean
  entryTypeFilter?: 'alle' | EntryTypeId
  setEntryTypeFilter?: (v: 'alle' | EntryTypeId) => void
  categoryFilter?: string
  setCategoryFilter?: (v: string) => void
  /** K2/ök2: Künstler aus Stammdaten ableiten wenn `artist` leer (wie Statistik); VK2: nicht setzen. */
  kuenstlerFallback?: KuenstlerFallbackNamen | null
}

const ALLE_SPALTEN = [
  { id: 'nummer', label: 'Nr.' }, { id: 'vorschau', label: 'Bild' }, { id: 'titel', label: 'Titel' },
  { id: 'typ', label: 'Typ' },
  { id: 'kategorie', label: 'Kategorie' }, { id: 'kuenstler', label: 'Künstler:in' },
  { id: 'masse', label: 'Maße' }, { id: 'technik', label: 'Technik/Material' },
  { id: 'beschreibung', label: 'Beschreibung' },
  { id: 'ek', label: 'EK' },
  { id: 'preis', label: 'VK' }, { id: 'status', label: 'Status' },
  { id: 'datum', label: 'Erstellt' }, { id: 'kaeufer', label: 'Käufer:in' },
  { id: 'verkauftam', label: 'Verkauft am' }, { id: 'stueck', label: 'Stück' }, { id: 'standort', label: 'Standort' },
]

/** VK2: Nur Präsentation – keine Verkaufs-Spalten, keine Typ/Kategorie (stehen in Stammdaten/Werkkarten). */
const VK2_SPALTEN_IDS = ['nummer', 'vorschau', 'titel', 'kuenstler', 'masse', 'technik', 'beschreibung', 'datum']

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
  isOeffentlich,
  entryTypeFilter: _entryTypeFilter = 'alle',
  setEntryTypeFilter,
  categoryFilter = 'alle',
  setCategoryFilter,
  isVk2 = false,
  kuenstlerFallback = null,
}: WerkkatalogTabProps) {
  /** Typ-/Kategorie-Filter nur ök2; VK2 = nur Katalog der Mitgliederwerke (Kategorisierung in Stammdaten/Werkkarten). */
  const showTypAndCategory = !!isOeffentlich && !isVk2
  const oek2SparteId =
    showTypAndCategory && Array.isArray(galleryData?.focusDirections) && galleryData.focusDirections[0]
      ? String(galleryData.focusDirections[0])
      : undefined

  // Sold-Status + Reservierung aus separaten Keys holen (K2 / ök2 / VK2 – wie Shop & Werke)
  const enriched = useMemo(() => {
    const soldMap = new Map<string, any>()
    try {
      const soldRaw = localStorage.getItem(getShopSoldArtworksKey(!!isOeffentlich, !!isVk2))
      if (soldRaw) JSON.parse(soldRaw).forEach((s: any) => soldMap.set(s.number, s))
    } catch (_) {}
    const reservedMap = new Map<string, any>()
    try {
      const resRaw = localStorage.getItem('k2-reserved-artworks')
      if (resRaw) JSON.parse(resRaw).forEach((r: any) => reservedMap.set(r.number, r))
    } catch (_) {}
    return allArtworks.map((a: any) => {
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
  }, [allArtworks, isOeffentlich, isVk2])

  const artistFuerDruck = useCallback(
    (work: any) => {
      const direct = String(work?.artist || '').trim()
      if (isVk2) return direct || '–'
      return resolveArtistLabelForGalerieStatistik(work, kuenstlerFallback ?? undefined)
    },
    [isVk2, kuenstlerFallback]
  )

  // Filter anwenden (VK2: keine Verkaufs-/Status-/Preis-/Datumsfilter)
  const filtered = useMemo(
    () =>
      enriched.filter((a: any) => {
        if (showTypAndCategory && oek2SparteId && getEffectiveDirectionFromWork(a) !== oek2SparteId) return false
        if (showTypAndCategory && setCategoryFilter && categoryFilter !== 'alle' && a.category !== categoryFilter) return false
        if (!isOeffentlich && !isVk2 && katalogFilter.kategorie && a.category !== katalogFilter.kategorie) return false
        if (!isVk2) {
          if (katalogFilter.status === 'galerie' && !a.inExhibition) return false
          if (katalogFilter.status === 'verkauft' && !a.sold) return false
          if (katalogFilter.status === 'reserviert' && !a.reserved) return false
          if (katalogFilter.status === 'lager' && (a.inExhibition || a.sold)) return false
        }
        if (
          katalogFilter.artist &&
          !artistFuerDruck(a).toLowerCase().includes(katalogFilter.artist.toLowerCase())
        )
          return false
        if (katalogFilter.suchtext) {
          const q = katalogFilter.suchtext.toLowerCase()
          const hay = `${a.number || ''} ${a.title || ''} ${a.description || ''} ${a.technik || ''} ${a.buyer || ''} ${a.purchasePrice != null ? a.purchasePrice : ''}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        if (!isVk2) {
          const vkNum =
            a.price != null && a.price !== ''
              ? Number(a.price)
              : Number.NaN
          const hasVk = Number.isFinite(vkNum)
          if (katalogFilter.vonPreis && hasVk && vkNum < parseFloat(katalogFilter.vonPreis)) return false
          if (katalogFilter.bisPreis && hasVk && vkNum > parseFloat(katalogFilter.bisPreis)) return false
          if (katalogFilter.vonDatum && a.createdAt && a.createdAt < katalogFilter.vonDatum) return false
          if (katalogFilter.bisDatum && a.createdAt && a.createdAt > katalogFilter.bisDatum + 'T23:59:59') return false
        }
        return true
      }),
    [
      enriched,
      showTypAndCategory,
      oek2SparteId,
      categoryFilter,
      setCategoryFilter,
      katalogFilter.status,
      katalogFilter.kategorie,
      katalogFilter.artist,
      katalogFilter.suchtext,
      katalogFilter.vonPreis,
      katalogFilter.bisPreis,
      katalogFilter.vonDatum,
      katalogFilter.bisDatum,
      isVk2,
      isOeffentlich,
      artistFuerDruck,
    ]
  )

  /** Gleiche Logik wie Galerie-Vorschau „alle Kategorien“: Kategorieblöcke, innerhalb Nummer fortlaufend. */
  const filteredSorted = useMemo(() => sortArtworksCategoryBlocksThenNumberAsc(filtered), [filtered])

  /** Kurz erklären, warum die Katalog-Zahl von „Werke verwalten“ abweichen kann (eigene Filter + persistiert). */
  const katalogEingrenzungHinweis = useMemo(() => {
    if (isVk2) return ''
    const parts: string[] = []
    if (katalogFilter.status === 'galerie') parts.push('nur Werke, die in der Online-Galerie aktiv sind')
    else if (katalogFilter.status === 'verkauft') parts.push('nur verkaufte Werke')
    else if (katalogFilter.status === 'reserviert') parts.push('nur reservierte Werke')
    else if (katalogFilter.status === 'lager') parts.push('nur Lager & Kassa (nicht in der Online-Galerie)')
    if (showTypAndCategory && categoryFilter !== 'alle') {
      parts.push(`Kategorie „${getCategoryLabel(categoryFilter)}“`)
    } else if (!showTypAndCategory && katalogFilter.kategorie) {
      parts.push(`Kategorie „${getCategoryLabel(katalogFilter.kategorie)}“`)
    }
    if (katalogFilter.suchtext.trim()) parts.push('Suchbegriff gesetzt')
    if (katalogFilter.artist.trim()) parts.push('Künstler:in gefiltert')
    if (katalogFilter.vonPreis || katalogFilter.bisPreis) parts.push('Preisbereich eingeschränkt')
    if (katalogFilter.vonDatum || katalogFilter.bisDatum) parts.push('Erstellungsdatum eingeschränkt')
    if (parts.length === 0) return ''
    return `Hier gelten andere Filter als bei „Werke verwalten“: ${parts.join(' · ')}. „Zurücksetzen“ zeigt alle Werke ohne diese Einschränkungen.`
  }, [
    isVk2,
    showTypAndCategory,
    categoryFilter,
    katalogFilter.status,
    katalogFilter.kategorie,
    katalogFilter.suchtext,
    katalogFilter.artist,
    katalogFilter.vonPreis,
    katalogFilter.bisPreis,
    katalogFilter.vonDatum,
    katalogFilter.bisDatum,
  ])

  const [rowsWithImages, setRowsWithImages] = useState<any[]>(filteredSorted)
  useEffect(() => {
    let cancelled = false
    setRowsWithImages(filteredSorted)
    resolveArtworkImages(filteredSorted).then((list) => {
      if (!cancelled) setRowsWithImages(list)
    })
    return () => {
      cancelled = true
    }
  }, [filteredSorted])

  const [selectedForBatchPrint, setSelectedForBatchPrint] = useState<Set<string>>(() => new Set())
  useEffect(() => {
    setSelectedForBatchPrint(new Set())
  }, [filteredSorted])

  const selectableKeys = useMemo(
    () => rowsWithImages.map(rowKeyArtwork).filter((k): k is string => k.length > 0),
    [rowsWithImages]
  )
  const allViewSelected =
    selectableKeys.length > 0 && selectableKeys.every((k) => selectedForBatchPrint.has(k))

  /** VK2: nur Präsentations-Spalten anzeigen (ohne Typ/Kategorie). Fallback wenn keine gewählt. */
  const effectiveSpalten = isVk2
    ? (() => { const v = katalogSpalten.filter((c) => VK2_SPALTEN_IDS.includes(c)); return v.length > 0 ? v : ['nummer', 'titel', 'kuenstler', 'masse', 'technik', 'beschreibung', 'datum'] })()
    : katalogSpalten
  const spaltenFuerAuswahl = isVk2 ? ALLE_SPALTEN.filter((col) => VK2_SPALTEN_IDS.includes(col.id)) : ALLE_SPALTEN

  const druckeKatalog = () => {
    const pw = window.open('', '_blank')
    if (!pw) {
      alert('Pop-up blockiert – bitte erlauben.')
      return
    }
    const galName = galleryData.name || 'K2 Galerie'
    const datum = new Date().toLocaleDateString('de-DE')
    const statusLabel = isVk2
      ? 'Präsentation'
      : katalogFilter.status === 'galerie'
        ? 'In Online-Galerie'
        : katalogFilter.status === 'verkauft'
          ? 'Verkauft'
          : katalogFilter.status === 'lager'
            ? 'Nur Lager & Kassa'
            : 'Alle'
    const cols = isVk2 ? effectiveSpalten : katalogSpalten
    void (async () => {
      const resolvedRows = await resolveArtworkImages(filteredSorted)
      const rows = resolvedRows
        .map((a: any) => {
          const cells = cols
            .map((col) => {
              switch (col) {
                case 'nummer':
                  return `<td>${a.number || a.id || '–'}</td>`
                case 'vorschau':
                  return a.imageUrl
                    ? `<td style="padding:4px"><img src="${escAttr(a.imageUrl)}" alt="" style="max-height:52px;max-width:72px;object-fit:contain;vertical-align:middle" /></td>`
                    : '<td style="padding:4px">–</td>'
                case 'titel':
                  return `<td><strong>${a.title || '–'}</strong></td>`
                case 'typ':
                  return `<td>${werkKatalogTypZelle(!!isOeffentlich, !!isVk2, a)}</td>`
                case 'kategorie':
                  return `<td>${getCategoryLabel(a.category)}</td>`
                case 'kuenstler':
                  return `<td>${escAttr(artistFuerDruck(a))}</td>`
                case 'masse':
                  return `<td>${a.dimensions || '–'}</td>`
                case 'technik':
                  return `<td>${a.technik || '–'}</td>`
                case 'beschreibung':
                  return `<td>${(a.description || '–').toString().slice(0, 200)}${(a.description || '').length > 200 ? '…' : ''}</td>`
                case 'ek':
                  return `<td style="text-align:right">${formatEkAnzeige(a.purchasePrice)}</td>`
                case 'preis':
                  return `<td style="text-align:right">${a.price ? `€ ${Number(a.price).toFixed(2)}` : '–'}</td>`
                case 'status':
                  return `<td>${a.sold ? `<span style="color:#b91c1c;font-weight:700">Verkauft</span>` : a.reserved ? `<span style="color:#d97706;font-weight:700">Reserviert${a.reservedFor ? ' – ' + a.reservedFor : ''}</span>` : a.inExhibition ? '<span style="color:#15803d">Online-Galerie</span>' : 'Lager'}</td>`
                case 'datum':
                  return `<td>${a.createdAt ? new Date(a.createdAt).toLocaleDateString('de-DE') : '–'}</td>`
                case 'kaeufer':
                  return `<td>${a.buyer || '–'}</td>`
                case 'verkauftam':
                  return `<td>${a.soldAt ? new Date(a.soldAt).toLocaleDateString('de-DE') : '–'}</td>`
                case 'stueck':
                  return `<td style="text-align:right;font-weight:${a.quantity > 1 ? 700 : 400}">${a.quantity ?? 1}</td>`
                case 'standort':
                  return `<td>${a.location || '–'}</td>`
                default:
                  return '<td>–</td>'
              }
            })
            .join('')
          return `<tr>${cells}</tr>`
        })
        .join('')
      const colHeaders: Record<string, string> = {
        nummer: 'Nr.',
        vorschau: 'Bild',
        titel: 'Titel',
        typ: 'Typ',
        kategorie: 'Kategorie',
        kuenstler: 'Künstler:in',
        masse: 'Maße',
        technik: 'Technik/Material',
        beschreibung: 'Beschreibung',
        ek: 'EK',
        preis: 'VK',
        status: 'Status',
        datum: 'Erstellt',
        kaeufer: 'Käufer:in',
        verkauftam: 'Verkauft am',
        stueck: 'Stück',
        standort: 'Standort',
      }
      const thead = cols
        .map((c) => {
          const align = c === 'preis' || c === 'ek' || c === 'stueck' ? 'right' : 'left'
          return `<th style="text-align:${align};padding:6px 8px;border-bottom:2px solid #8b6914;white-space:nowrap">${colHeaders[c] || c}</th>`
        })
        .join('')
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
      <div class="meta">Stand: ${datum} · Filter: ${statusLabel} · ${filteredSorted.length} Werke</div>
      <table><thead><tr>${thead}</tr></thead><tbody>${rows}</tbody></table>
      <script>window.onload=()=>window.print()</script>
    </body></html>`)
      pw.document.close()
    })()
  }

  const showOek2TypRow = !!isOeffentlich && !isVk2 && !!galleryData?.focusDirections?.[0]

  const druckeAusgewaehlteWerkkarten = () => {
    if (selectedForBatchPrint.size === 0) {
      alert('Bitte mindestens ein Werk in der Tabelle ankreuzen.')
      return
    }
    const galName = galleryData.name || 'K2 Galerie'
    const datum = new Date().toLocaleDateString('de-DE')
    const picked = rowsWithImages.filter((a) => selectedForBatchPrint.has(rowKeyArtwork(a)))
    void (async () => {
      const resolved = await resolveArtworkImages(picked)
      const body = resolved
        .map(
          (rw) =>
            `<div class="werk-page">${buildWerkkarteCardHtml(rw, {
              galName,
              datum,
              isVk2: !!isVk2,
              showTypAndCategory,
              showOek2TypRow,
              isOeffentlich: !!isOeffentlich,
              ...(!isVk2 ? { artistDisplay: artistFuerDruck(rw) } : {}),
            })}</div>`
        )
        .join('')
      openWerkkartePrintWindow(`Werkkarten (${resolved.length}) – ${galName}`, body)
    })()
  }

  const w = katalogSelectedWork
  const statusColor = w ? (w.sold ? '#b91c1c' : w.reserved ? '#d97706' : w.inExhibition ? '#15803d' : '#6b7280') : '#6b7280'
  const statusLabel = w ? (w.sold ? 'Verkauft' : w.reserved ? `🔶 Reserviert${w.reservedFor ? ` – ${w.reservedFor}` : ''}` : w.inExhibition ? 'In Online-Galerie' : 'Nur Lager & Kassa') : ''

  const druckeWerkkarte = () => {
    if (!w) return
    const galName = galleryData.name || 'K2 Galerie'
    const datum = new Date().toLocaleDateString('de-DE')
    void (async () => {
      const [rw] = await resolveArtworkImages([w])
      const work = rw || w
      const inner = buildWerkkarteCardHtml(work, {
        galName,
        datum,
        isVk2: !!isVk2,
        showTypAndCategory,
        showOek2TypRow,
        isOeffentlich: !!isOeffentlich,
        ...(!isVk2 ? { artistDisplay: artistFuerDruck(work) } : {}),
      })
      openWerkkartePrintWindow(`${work.title || work.number || 'Werk'} – ${galName}`, `<div class="werk-page">${inner}</div>`)
    })()
  }

  const druckeEchtheitszertifikat = () => {
    if (!w) return
    const galName = galleryData.name || 'K2 Galerie'
    const datum = new Date().toLocaleDateString('de-DE')
    const certDateLong = new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
    const galCityLine = String(galleryData?.city || '').trim()
    void (async () => {
      const [rw] = await resolveArtworkImages([w])
      const work = rw || w
      const certInner = buildEchtheitszertifikatHtml(work, {
        galName,
        datum,
        isVk2: !!isVk2,
        showTypAndCategory,
        showOek2TypRow,
        isOeffentlich: !!isOeffentlich,
        artistDisplay: artistFuerDruck(work),
        certDateLong,
        galCityLine,
      })
      openWerkkartePrintWindow(
        `Echtheitszertifikat – ${work.title || work.number || 'Werk'} – ${galName}`,
        `<div class="werk-page">${certInner}</div>`
      )
    })()
  }

  const druckeWerkkarteMitEchtheitszertifikat = () => {
    if (!w) return
    const galName = galleryData.name || 'K2 Galerie'
    const datum = new Date().toLocaleDateString('de-DE')
    const certDateLong = new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
    const galCityLine = String(galleryData?.city || '').trim()
    void (async () => {
      const [rw] = await resolveArtworkImages([w])
      const work = rw || w
      const inner = buildWerkkarteCardHtml(work, {
        galName,
        datum,
        isVk2: !!isVk2,
        showTypAndCategory,
        showOek2TypRow,
        isOeffentlich: !!isOeffentlich,
        ...(!isVk2 ? { artistDisplay: artistFuerDruck(work) } : {}),
      })
      const certInner = buildEchtheitszertifikatHtml(work, {
        galName,
        datum,
        isVk2: !!isVk2,
        showTypAndCategory,
        showOek2TypRow,
        isOeffentlich: !!isOeffentlich,
        artistDisplay: artistFuerDruck(work),
        certDateLong,
        galCityLine,
      })
      openWerkkartePrintWindow(
        `${work.title || work.number || 'Werk'} + Echtheitszertifikat – ${galName}`,
        `<div class="werk-page">${inner}</div><div class="werk-page">${certInner}</div>`
      )
    })()
  }

  return (
    <section style={{ background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: 24, padding: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '2rem' }}>

      {/* VK2: Klarstellung – Katalog nur zur Präsentation der Mitglieder, nicht zum Verkaufen */}
      {isVk2 && (
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: `${s.accent}0c`, border: `1px solid ${s.accent}33`, borderRadius: 12, fontSize: '0.9rem', color: s.text }}>
          <strong>Vereinskatalog</strong> – ausschließlich zur <strong>Präsentation der Mitglieder</strong> und ihrer Werke (jede Sache mit Beschreibung). Nicht zum Verkaufen.
        </div>
      )}

      {/* Filter-Zeile */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.25rem', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 180px' }}>
          <div style={{ fontSize: '0.78rem', color: s.muted, marginBottom: 3 }}>Suche (Nr., Titel, Beschreibung …)</div>
          <input value={katalogFilter.suchtext} onChange={e => setKatalogFilter(f => ({ ...f, suchtext: e.target.value }))}
            placeholder="z. B. M0042 oder Landschaft …"
            style={{ width: '100%', padding: '0.5rem 0.75rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, fontSize: '0.9rem', boxSizing: 'border-box' }} />
        </div>
        {showTypAndCategory && oek2SparteId && (
          <div>
            <div style={{ fontSize: '0.78rem', color: s.muted, marginBottom: 3 }}>Typ</div>
            <div style={{
              padding: '0.5rem 0.75rem',
              background: s.bgElevated,
              border: `1px solid ${s.accent}33`,
              borderRadius: 8,
              color: s.text,
              fontSize: '0.9rem',
              fontWeight: 600,
              minWidth: 140,
            }}>
              {FOCUS_DIRECTIONS.find((d) => d.id === oek2SparteId)?.label ?? oek2SparteId}
            </div>
          </div>
        )}
        {!isVk2 && (
        <div>
          <div style={{ fontSize: '0.78rem', color: s.muted, marginBottom: 3 }}>Kategorie</div>
          {showTypAndCategory && setCategoryFilter ? (
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, fontSize: '0.9rem' }}>
              <option value="alle">Alle</option>
              {getCategoriesForDirection(galleryData?.focusDirections?.[0]).map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          ) : (
            <select value={katalogFilter.kategorie} onChange={e => setKatalogFilter(f => ({ ...f, kategorie: e.target.value }))}
              style={{ padding: '0.5rem 0.75rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, fontSize: '0.9rem' }}>
              <option value="">Alle</option>
              {ARTWORK_CATEGORIES.map((c: any) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          )}
        </div>
        )}
        {!isVk2 && (
          <>
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
          </>
        )}
        <button type="button" onClick={() => {
          setKatalogFilter({ status: 'alle', kategorie: '', artist: '', vonDatum: '', bisDatum: '', vonPreis: '', bisPreis: '', suchtext: '' })
          if (showTypAndCategory && setEntryTypeFilter) setEntryTypeFilter('alle')
          if (showTypAndCategory && setCategoryFilter) setCategoryFilter('alle')
        }}
          style={{ padding: '0.5rem 1rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.muted, fontSize: '0.9rem', cursor: 'pointer', alignSelf: 'flex-end' }}>
          ✕ Zurücksetzen
        </button>
      </div>
      {katalogEingrenzungHinweis ? (
        <p style={{ fontSize: '0.82rem', color: '#5c5650', marginTop: -6, marginBottom: '0.85rem', lineHeight: 1.45, padding: '0.55rem 0.75rem', background: `${s.accent}0f`, borderRadius: 8, border: `1px solid ${s.accent}28` }}>
          {katalogEingrenzungHinweis}
        </p>
      ) : null}
      {showTypAndCategory && (
        <p style={{ fontSize: '0.8rem', color: s.muted, marginTop: -8, marginBottom: '0.75rem', fontWeight: 500 }}>
          Deine Sparte kommt aus den Stammdaten (wie bei „Werke verwalten“). <strong>Kategorie</strong> = Feinzuordnung (z. B. Speise, Getränk, Malerei).
        </p>
      )}

      {/* Spalten-Auswahl + Drucken (VK2: nur Katalog-Spalten, keine Typ/Kategorie) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem', background: s.bgElevated, borderRadius: 10 }}>
        <span style={{ fontSize: '0.82rem', color: s.muted, marginRight: 4 }}>Spalten:</span>
        {spaltenFuerAuswahl.map(col => (
          <label key={col.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: katalogSpalten.includes(col.id) ? s.text : s.muted, cursor: 'pointer' }}>
            <input type="checkbox" checked={katalogSpalten.includes(col.id)}
              onChange={e => {
                if (isVk2) {
                  const base = katalogSpalten.filter((c) => VK2_SPALTEN_IDS.includes(c))
                  setKatalogSpalten(e.target.checked ? [...base, col.id] : base.filter((c) => c !== col.id))
                } else {
                  setKatalogSpalten(prev => e.target.checked ? [...prev, col.id] : prev.filter(c => c !== col.id))
                }
              }}
              style={{ accentColor: s.accent }} />
            {col.label}
          </label>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: s.muted, alignSelf: 'center' }}>{filteredSorted.length} Werke</span>
          <button
            type="button"
            onClick={druckeAusgewaehlteWerkkarten}
            disabled={selectedForBatchPrint.size === 0}
            title={selectedForBatchPrint.size === 0 ? 'Werke in der Tabelle ankreuzen' : `${selectedForBatchPrint.size} Werkkarten drucken`}
            style={{
              padding: '0.5rem 1rem',
              background: selectedForBatchPrint.size === 0 ? s.bgElevated : '#5c3d0e',
              color: selectedForBatchPrint.size === 0 ? s.muted : '#fff',
              border: `1px solid ${s.accent}44`,
              borderRadius: 8,
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: selectedForBatchPrint.size === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            🖨️ Ausgewählte Werkkarten ({selectedForBatchPrint.size})
          </button>
          <button type="button" onClick={druckeKatalog}
            style={{ padding: '0.5rem 1.25rem', background: s.accent, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
            🖨️ Drucken / PDF
          </button>
        </div>
      </div>

      {/* Tabelle */}
      {filteredSorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: s.muted }}>Keine Werke mit diesen Kriterien gefunden.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: s.bgElevated }}>
                <th style={{ padding: '8px 6px', textAlign: 'center', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33`, width: 36, verticalAlign: 'middle' }} title="Alle sichtbaren Werke für Sammeldruck">
                  <input
                    type="checkbox"
                    checked={allViewSelected}
                    onChange={() => {
                      if (allViewSelected) setSelectedForBatchPrint(new Set())
                      else setSelectedForBatchPrint(new Set(selectableKeys))
                    }}
                    style={{ accentColor: s.accent, width: 16, height: 16, cursor: 'pointer' }}
                    aria-label="Alle Werke der Ansicht für Werkkarten-Sammeldruck auswählen"
                  />
                </th>
                {effectiveSpalten.includes('nummer') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33`, whiteSpace: 'nowrap' }}>Nr.</th>}
                {effectiveSpalten.includes('vorschau') && <th style={{ padding: '8px 10px', textAlign: 'center', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33`, whiteSpace: 'nowrap' }}>Bild</th>}
                {effectiveSpalten.includes('titel') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Titel</th>}
                {effectiveSpalten.includes('typ') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Typ</th>}
                {effectiveSpalten.includes('kategorie') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Kategorie</th>}
                {effectiveSpalten.includes('kuenstler') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Künstler:in</th>}
                {effectiveSpalten.includes('masse') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Maße</th>}
                {effectiveSpalten.includes('technik') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Technik</th>}
                {effectiveSpalten.includes('beschreibung') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Beschreibung</th>}
                {effectiveSpalten.includes('ek') && <th style={{ padding: '8px 10px', textAlign: 'right', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33`, whiteSpace: 'nowrap' }}>EK</th>}
                {effectiveSpalten.includes('preis') && <th style={{ padding: '8px 10px', textAlign: 'right', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>VK</th>}
                {effectiveSpalten.includes('status') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Status</th>}
                {effectiveSpalten.includes('datum') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33`, whiteSpace: 'nowrap' }}>Erstellt</th>}
                {effectiveSpalten.includes('kaeufer') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Käufer:in</th>}
                {effectiveSpalten.includes('verkauftam') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33`, whiteSpace: 'nowrap' }}>Verkauft am</th>}
                {effectiveSpalten.includes('stueck') && <th style={{ padding: '8px 10px', textAlign: 'right', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Stück</th>}
                {effectiveSpalten.includes('standort') && <th style={{ padding: '8px 10px', textAlign: 'left', color: s.muted, fontWeight: 600, borderBottom: `2px solid ${s.accent}33` }}>Standort</th>}
              </tr>
            </thead>
            <tbody>
              {rowsWithImages.map((a: any, i: number) => {
                const rk = rowKeyArtwork(a)
                const sel = rk ? selectedForBatchPrint.has(rk) : false
                return (
                <tr key={a.id || a.number || i}
                  onClick={() => setKatalogSelectedWork(a)}
                  style={{ background: i % 2 === 0 ? 'transparent' : `${s.accent}06`, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${s.accent}14`)}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : `${s.accent}06`)}
                >
                  <td
                    style={{ padding: '6px', textAlign: 'center', borderBottom: `1px solid ${s.accent}18`, verticalAlign: 'middle' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {rk ? (
                      <input
                        type="checkbox"
                        checked={sel}
                        onChange={() => {
                          setSelectedForBatchPrint((prev) => {
                            const n = new Set(prev)
                            if (n.has(rk)) n.delete(rk)
                            else n.add(rk)
                            return n
                          })
                        }}
                        style={{ accentColor: s.accent, width: 16, height: 16, cursor: 'pointer' }}
                        aria-label={`Werk ${rk} für Sammeldruck`}
                      />
                    ) : null}
                  </td>
                  {effectiveSpalten.includes('nummer') && <td style={{ padding: '7px 10px', color: s.accent, fontWeight: 700, borderBottom: `1px solid ${s.accent}18`, whiteSpace: 'nowrap' }}>{a.number || a.id || '–'}</td>}
                  {effectiveSpalten.includes('vorschau') && (
                    <td style={{ padding: '4px 6px', borderBottom: `1px solid ${s.accent}18`, textAlign: 'center', verticalAlign: 'middle' }}>
                      {a.imageUrl ? (
                        <img src={a.imageUrl} alt="" style={{ maxHeight: 44, maxWidth: 56, objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', borderRadius: 4, background: s.bgElevated }} />
                      ) : (
                        <span style={{ color: s.muted, fontSize: '0.75rem' }}>–</span>
                      )}
                    </td>
                  )}
                  {effectiveSpalten.includes('titel') && <td style={{ padding: '7px 10px', color: s.text, fontWeight: 600, borderBottom: `1px solid ${s.accent}18` }}>{a.title || '–'}</td>}
                  {effectiveSpalten.includes('typ') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18` }}>{werkKatalogTypZelle(!!isOeffentlich, !!isVk2, a)}</td>}
                  {effectiveSpalten.includes('kategorie') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18` }}>{getCategoryLabel(a.category)}</td>}
                  {effectiveSpalten.includes('kuenstler') && (
                    <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18` }}>{artistFuerDruck(a)}</td>
                  )}
                  {effectiveSpalten.includes('masse') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18`, whiteSpace: 'nowrap' }}>{a.dimensions || '–'}</td>}
                  {effectiveSpalten.includes('technik') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18` }}>{a.technik || '–'}</td>}
                  {effectiveSpalten.includes('beschreibung') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18`, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }} title={a.description || ''}>{(a.description || '–').toString().slice(0, 80)}{(a.description || '').length > 80 ? '…' : ''}</td>}
                  {effectiveSpalten.includes('ek') && <td style={{ padding: '7px 10px', color: s.muted, textAlign: 'right', borderBottom: `1px solid ${s.accent}18`, whiteSpace: 'nowrap' }}>{formatEkAnzeige(a.purchasePrice)}</td>}
                  {effectiveSpalten.includes('preis') && <td style={{ padding: '7px 10px', color: s.text, textAlign: 'right', borderBottom: `1px solid ${s.accent}18`, whiteSpace: 'nowrap' }}>{a.price ? `€ ${Number(a.price).toFixed(2)}` : '–'}</td>}
                  {effectiveSpalten.includes('status') && <td style={{ padding: '7px 10px', borderBottom: `1px solid ${s.accent}18` }} onClick={e => e.stopPropagation()}>
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
                  {effectiveSpalten.includes('datum') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18`, whiteSpace: 'nowrap' }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString('de-DE') : '–'}</td>}
                  {effectiveSpalten.includes('kaeufer') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18` }}>{a.buyer || '–'}</td>}
                  {effectiveSpalten.includes('verkauftam') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18`, whiteSpace: 'nowrap' }}>{a.soldAt ? new Date(a.soldAt).toLocaleDateString('de-DE') : '–'}</td>}
                  {effectiveSpalten.includes('stueck') && <td style={{ padding: '7px 10px', color: s.text, textAlign: 'right', fontWeight: a.quantity > 1 ? 700 : 400, borderBottom: `1px solid ${s.accent}18` }}>{a.quantity ?? 1}</td>}
                  {effectiveSpalten.includes('standort') && <td style={{ padding: '7px 10px', color: s.muted, borderBottom: `1px solid ${s.accent}18` }}>{a.location || '–'}</td>}
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Fehlende Felder Hinweis */}
      {filteredSorted.some((a: any) => !a.dimensions && !a.technik) && (
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
            {!isVk2 && (
              <div style={{ fontSize: '0.95rem', color: s.muted, fontStyle: 'italic', marginBottom: '0.75rem' }}>{artistFuerDruck(w)}</div>
            )}
            {isVk2 && w.artist?.trim() && (
              <div style={{ fontSize: '0.95rem', color: s.muted, fontStyle: 'italic', marginBottom: '0.75rem' }}>{w.artist}</div>
            )}
            {!isVk2 && (
              <div style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 700, background: w.sold ? '#fef2f2' : w.reserved ? '#fffbeb' : w.inExhibition ? '#f0fdf4' : s.bgElevated, color: statusColor, border: `1px solid ${statusColor}55`, marginBottom: '1.25rem' }}>
                {statusLabel}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              {showTypAndCategory && galleryData?.focusDirections?.[0] && (
                <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}>
                  <div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Typ</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: s.text }}>{FOCUS_DIRECTIONS.find((d) => d.id === galleryData.focusDirections[0])?.label ?? galleryData.focusDirections[0]}</div>
                </div>
              )}
              {w.dimensions && <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}><div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Maße</div><div style={{ fontSize: '0.95rem', fontWeight: 600, color: s.text }}>{w.dimensions}</div></div>}
              {w.technik && <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}><div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Technik / Material</div><div style={{ fontSize: '0.95rem', fontWeight: 600, color: s.text }}>{w.technik}</div></div>}
              {!isVk2 && (
                <>
                  <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}>
                    <div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>EK</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: s.text }}>{formatEkAnzeige(w.purchasePrice)}</div>
                  </div>
                  <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}>
                    <div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>VK</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: s.text }}>{w.price ? `€ ${Number(w.price).toFixed(2)}` : '–'}</div>
                  </div>
                </>
              )}
              {w.category && <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}><div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Kategorie</div><div style={{ fontSize: '0.95rem', fontWeight: 600, color: s.text }}>{getCategoryLabel(w.category)}</div></div>}
              {w.createdAt && <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}><div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Erstellt</div><div style={{ fontSize: '0.95rem', fontWeight: 600, color: s.text }}>{new Date(w.createdAt).toLocaleDateString('de-DE')}</div></div>}
              {!isVk2 && w.soldAt && <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}><div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Verkauft am</div><div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#b91c1c' }}>{new Date(w.soldAt).toLocaleDateString('de-DE')}</div></div>}
              {!isVk2 && w.quantity != null && Number(w.quantity) > 1 && <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem' }}><div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Stückzahl</div><div style={{ fontSize: '0.95rem', fontWeight: 700, color: s.text }}>{w.quantity} Exemplare</div></div>}
              {!isVk2 && w.buyer && <div style={{ background: s.bgElevated, borderRadius: 10, padding: '0.6rem 0.85rem', gridColumn: 'span 2' }}><div style={{ fontSize: '0.72rem', color: s.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Käufer:in</div><div style={{ fontSize: '0.95rem', fontWeight: 600, color: s.text }}>{w.buyer}</div></div>}
            </div>
            {w.description && <div style={{ fontSize: '0.9rem', color: s.muted, lineHeight: 1.7, borderTop: `1px solid ${s.accent}22`, paddingTop: '0.85rem', marginBottom: '1.25rem' }}>{w.description}</div>}
            <div style={{ marginBottom: '1rem', padding: '0.75rem 0.9rem', background: `${s.accent}0a`, border: `1px solid ${s.accent}28`, borderRadius: 12 }}>
              <div style={{ fontSize: '0.78rem', color: s.muted, lineHeight: 1.5 }}>
                <strong style={{ color: s.text }}>Echtheitszertifikat</strong> – extra A5-Seite mit festem Rahmen und großem Feld zur <strong>Unterschrift der Künstlerin / des Künstlers</strong>. Druckdialog öffnet sich wie bei der Werkkarte (zweite Seite nur bei „Werkkarte + Zertifikat“).
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'flex-end', alignItems: 'stretch' }}>
              <button type="button" onClick={() => setKatalogSelectedWork(null)}
                style={{ padding: '0.6rem 1.2rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 10, color: s.muted, fontSize: '0.9rem', cursor: 'pointer' }}
                aria-label="Detail schließen">
                OK
              </button>
              <button type="button" onClick={druckeEchtheitszertifikat}
                style={{ padding: '0.6rem 1.1rem', background: s.bgElevated, border: `2px solid ${s.accent}`, borderRadius: 10, color: s.accent, fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                🪪 Nur Echtheitszertifikat
              </button>
              <button type="button" onClick={druckeWerkkarteMitEchtheitszertifikat}
                style={{ padding: '0.6rem 1.1rem', background: '#5c3d0e', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                🖨️ Werkkarte + Zertifikat
              </button>
              <button type="button" onClick={druckeWerkkarte}
                style={{ padding: '0.6rem 1.4rem', background: s.accent, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
                🖨️ Werkkarte drucken
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Vereinskatalog-Vorschau: 5 ausgesuchte Werke der Mitglieder (nur bei VK2, ohne Verkaufshinweise) ─── */}
      {isVk2 && <VereinskatalogVorschau nurPraesentation />}

    </section>
  )
}

function VereinskatalogVorschau({ nurPraesentation = false }: { nurPraesentation?: boolean }) {
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
        {vereinsWerke.map((w: any) => (
          <div key={w.id} style={{ background: s.bgElevated, borderRadius: 12, overflow: 'hidden', border: `1px solid rgba(251,191,36,0.15)` }}>
            <div style={{ aspectRatio: '4/3', background: '#e8e4dc', position: 'relative', overflow: 'hidden' }}>
              {w.imageUrl
                ? <img src={w.imageUrl} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', opacity: 0.4 }}>🖼️</div>
              }
              {!nurPraesentation && (() => {
                const status = w.verkaufsstatus || 'verfuegbar'
                const statusColor = status === 'verkauft' ? '#ef4444' : status === 'reserviert' ? '#f59e0b' : '#22c55e'
                const statusLabel = status === 'verkauft' ? 'Verkauft' : status === 'reserviert' ? 'Reserviert' : 'Verfügbar'
                return (
                  <span style={{ position: 'absolute', top: '0.35rem', right: '0.35rem', padding: '0.1rem 0.4rem', borderRadius: 10, background: 'rgba(255,255,255,0.85)', color: statusColor, fontSize: '0.65rem', fontWeight: 700 }}>
                    {statusLabel}
                  </span>
                )
              })()}
            </div>
            <div style={{ padding: '0.6rem 0.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: s.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.title || '–'}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(180,130,20,0.9)', fontWeight: 600, marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.artist || '–'}</div>
              {(w.technik || w.year) && (
                <div style={{ fontSize: '0.7rem', color: s.muted, marginTop: '0.15rem' }}>{[w.technik, w.year].filter(Boolean).join(' · ')}</div>
              )}
              {w.description && (
                <div style={{ fontSize: '0.72rem', color: s.muted, marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{w.description}</div>
              )}
              {!nurPraesentation && w.price && (
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: s.text, marginTop: '0.3rem' }}>
                  € {Number(w.price).toLocaleString('de-AT')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
