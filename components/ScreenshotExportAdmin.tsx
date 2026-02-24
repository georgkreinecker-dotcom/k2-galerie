import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES, AGB_ROUTE } from '../src/config/navigation'
import ZertifikatTab from './tabs/ZertifikatTab'
import NewsletterTab from './tabs/NewsletterTab'
import PressemappeTab from './tabs/PressemappeTab'
import StatistikTab from './tabs/StatistikTab'
import WerkkatalogTab from './tabs/WerkkatalogTab'

/** Feste Galerie-URL für Etiketten-QR (unabhängig vom Router/WLAN) – gleiche Basis wie Mobile Connect */
const GALERIE_QR_BASE = 'https://k2-galerie.vercel.app/projects/k2-galerie/galerie'
import { MUSTER_TEXTE, MUSTER_ARTWORKS, MUSTER_EVENTS, MUSTER_VITA_MARTINA, MUSTER_VITA_GEORG, K2_STAMMDATEN_DEFAULTS, TENANT_CONFIGS, PRODUCT_BRAND_NAME, getCurrentTenantId, ARTWORK_CATEGORIES, getCategoryLabel, getCategoryPrefixLetter, getOek2DefaultArtworkImage, OEK2_PLACEHOLDER_IMAGE, VK2_KUNSTBEREICHE, VK2_STAMMDATEN_DEFAULTS, REGISTRIERUNG_CONFIG_DEFAULTS, getLizenznummerPraefix, type TenantId, type ArtworkCategoryId, type Vk2Stammdaten, type Vk2Mitglied, type RegistrierungConfig } from '../src/config/tenantConfig'
import { buildVitaDocumentHtml } from '../src/utils/vitaDocument'
import AdminBrandLogo from '../src/components/AdminBrandLogo'
import { getPageTexts, setPageTexts, defaultPageTexts, type PageTextsConfig } from '../src/config/pageTexts'
import { getPageContentGalerie, setPageContentGalerie, type PageContentGalerie } from '../src/config/pageContentGalerie'
import { getWerbeliniePrDocCss, WERBELINIE_FONTS_URL, WERBEUNTERLAGEN_STIL, PROMO_FONTS_URL } from '../src/config/marketingWerbelinie'
import '../src/App.css'

const ADMIN_CONTEXT_KEY = 'k2-admin-context'
/** Session-Key: eingeloggtes VK2-Mitglied (Name) – nur eigenes Profil bearbeitbar */
const VK2_MITGLIED_SESSION_KEY = 'k2-vk2-mitglied-eingeloggt'

/** Gibt den Namen des eingeloggten VK2-Mitglieds zurück, oder null */
function getVk2EingeloggtesM(): string | null {
  try { return sessionStorage.getItem(VK2_MITGLIED_SESSION_KEY) } catch { return null }
}
/** Ist ein Mitglied (nicht Vorstand) eingeloggt? */
function isVk2MitgliedEingeloggt(): boolean {
  return !!getVk2EingeloggtesM()
}

/**
 * Setzt den Admin-Kontext SOFORT synchron aus der URL – muss am Anfang aufgerufen werden.
 * Dadurch ist isOeffentlichAdminContext() von Beginn an korrekt (auch beim useState-Init).
 */
function syncAdminContextFromUrl(): void {
  try {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const ctx = params.get('context')
    if (ctx === 'oeffentlich') {
      sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'oeffentlich')
    } else if (ctx === 'vk2') {
      sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'vk2')
    } else {
      // Kein context-Parameter oder anderer Wert → K2-Admin → alten Kontext löschen
      // (verhindert: nach ök2-Admin-Besuch bleibt 'oeffentlich' im sessionStorage hängen)
      sessionStorage.removeItem(ADMIN_CONTEXT_KEY)
    }
  } catch (_) {}
}

function isOeffentlichAdminContext(): boolean {
  try {
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search)
      if (params.get('context') === 'oeffentlich') return true
      // Wenn ein anderer context explizit gesetzt ist → definitiv nicht ök2
      if (params.get('context') === 'vk2' || params.get('context') === 'k2') return false
    }
    return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(ADMIN_CONTEXT_KEY) === 'oeffentlich'
  } catch {
    return false
  }
}
function isVk2AdminContext(): boolean {
  try {
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search)
      if (params.get('context') === 'vk2') return true
    }
    return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(ADMIN_CONTEXT_KEY) === 'vk2'
  } catch {
    return false
  }
}

// KRITISCH: Getrennte Storage-Keys für K2 vs. ök2 vs. VK2 – niemals Daten vermischen
function getArtworksKey(): string {
  // VK2 hat KEINE Werke – nur Mitglieder in k2-vk2-stammdaten
  return isOeffentlichAdminContext() ? 'k2-oeffentlich-artworks' : 'k2-artworks'
}
function getEventsKey(): string {
  if (isVk2AdminContext()) return 'k2-vk2-events'
  return isOeffentlichAdminContext() ? 'k2-oeffentlich-events' : 'k2-events'
}
function getDocumentsKey(): string {
  if (isVk2AdminContext()) return 'k2-vk2-documents'
  return isOeffentlichAdminContext() ? 'k2-oeffentlich-documents' : 'k2-documents'
}
const KEY_OEF_ADMIN_PASSWORD = 'k2-oeffentlich-admin-password'
const KEY_OEF_ADMIN_EMAIL = 'k2-oeffentlich-admin-email'
const KEY_OEF_ADMIN_PHONE = 'k2-oeffentlich-admin-phone'
/** Design für ök2 (Kundenansicht) – eigener Key, damit Arbeitsansicht = Kundenansicht */
const KEY_OEF_DESIGN = 'k2-oeffentlich-design-settings'
const KEY_VK2_DESIGN = 'k2-vk2-design-settings'
/** Stammdaten in der Muster-Galerie (ök2) – werden nach Lizenz-Erwerb in K2 übernommen */
const KEY_OEF_STAMMDATEN_MARTINA = 'k2-oeffentlich-stammdaten-martina'
/** VK2-Stammdaten: Verein, Vorstand, Beirat, Mitglieder */
const KEY_VK2_STAMMDATEN = 'k2-vk2-stammdaten'

/** QR-Code-Block für Mitglied-Login – erscheint im Voll-Admin bei der Mitgliederliste */
function VK2LoginQrBlock({ s }: { s: { accent: string; text: string; muted: string } }) {
  const [qrDataUrl, setQrDataUrl] = React.useState('')
  const loginUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://k2-galerie.vercel.app'}/vk2-login`
  React.useEffect(() => {
    let cancelled = false
    import('qrcode').then(QRCode => {
      QRCode.default.toDataURL(loginUrl, { width: 120, margin: 1 })
        .then((url: string) => { if (!cancelled) setQrDataUrl(url) })
        .catch(() => {})
    })
    return () => { cancelled = true }
  }, [loginUrl])
  return (
    <div style={{ margin: '0.75rem 0', padding: '0.75rem 1rem', background: `${s.accent}0d`, border: `1px solid ${s.accent}33`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      {qrDataUrl && (
        <img src={qrDataUrl} alt="QR Mitglied-Login" style={{ width: 80, height: 80, borderRadius: 6, background: '#fff', padding: 4, flexShrink: 0 }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: s.text, fontSize: '0.9rem', marginBottom: '0.25rem' }}>🔑 Mitglied-Login QR-Code</div>
        <div style={{ fontSize: '0.8rem', color: s.muted, marginBottom: '0.4rem' }}>
          Diesen QR-Code per WhatsApp an Mitglieder schicken. Scan → Login-Seite → Name wählen → PIN → eigenes Profil.
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <code style={{ fontSize: '0.75rem', color: s.accent, background: `${s.accent}15`, padding: '0.2rem 0.5rem', borderRadius: 4 }}>{loginUrl}</code>
          <button type="button" onClick={() => { try { navigator.clipboard.writeText(loginUrl); alert('Link kopiert ✅') } catch (_) {} }} style={{ padding: '0.25rem 0.6rem', background: `${s.accent}22`, border: `1px solid ${s.accent}44`, borderRadius: 6, color: s.accent, fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>Link kopieren</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(`🔑 Dein Login-Link für deinen Mitglieder-Bereich:\n${loginUrl}\n\nName wählen + PIN eingeben → fertig!`)}`} target="_blank" rel="noopener noreferrer" style={{ padding: '0.25rem 0.6rem', background: '#25d36620', border: '1px solid #25d36644', borderRadius: 6, color: '#25d366', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>💬 Per WhatsApp teilen</a>
        </div>
      </div>
    </div>
  )
}

/** Druckt eine oder mehrere Mitgliedskarten im Kreditkarten-Format (85×54 mm, 3 pro Reihe) */
function printMitgliedskarten(mitglieder: import('../src/config/tenantConfig').Vk2Mitglied[], vereinName: string) {
  const kartenHtml = mitglieder.map(m => {
    const foto = m.mitgliedFotoUrl
      ? `<img src="${m.mitgliedFotoUrl}" alt="" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid #ff8c42;flex-shrink:0;">`
      : `<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#ff8c42,#b54a1e);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">👤</div>`
    const bio = m.bio ? `<div style="font-size:7.5px;color:#8c7060;margin-top:3px;line-height:1.3;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${m.bio}</div>` : ''
    const web = (m.galerieLinkUrl || m.website) ? `<div style="font-size:7px;color:#b54a1e;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${(m.galerieLinkUrl || m.website || '').replace('https://','')}</div>` : ''
    const istVorstand = m.rolle === 'vorstand'
    return `
      <div style="width:85mm;height:54mm;background:linear-gradient(135deg,#1a0f0a 0%,#2d1a14 60%,#3d2419 100%);color:#fff5f0;border-radius:4mm;padding:4mm 5mm;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;page-break-inside:avoid;position:relative;overflow:hidden;">
        <div style="position:absolute;right:-8mm;top:-8mm;width:28mm;height:28mm;border-radius:50%;background:rgba(255,140,66,0.08);"></div>
        <div style="position:absolute;right:2mm;bottom:-4mm;width:16mm;height:16mm;border-radius:50%;background:rgba(255,140,66,0.05);"></div>
        <div style="display:flex;align-items:center;gap:3mm;">
          ${foto}
          <div style="flex:1;overflow:hidden;">
            <div style="font-size:10.5px;font-weight:800;letter-spacing:0.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.name || ''}</div>
            ${m.typ ? `<div style="font-size:8px;color:#ff8c42;font-weight:600;margin-top:1px;">${m.typ}</div>` : ''}
            ${istVorstand ? `<div style="font-size:7px;background:rgba(255,140,66,0.2);color:#ff8c42;border-radius:3px;padding:1px 4px;display:inline-block;margin-top:2px;">👑 Vorstand</div>` : ''}
            ${bio}
          </div>
        </div>
        <div>
          ${web}
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:3mm;border-top:0.5px solid rgba(255,140,66,0.25);padding-top:2mm;">
            <div>
              <div style="font-size:7px;color:rgba(255,200,150,0.5);text-transform:uppercase;letter-spacing:0.1em;">Mitglied</div>
              <div style="font-size:9px;font-weight:700;color:#ff8c42;">${vereinName}</div>
            </div>
            ${m.eintrittsdatum || m.seit ? `<div style="font-size:7px;color:rgba(255,200,150,0.4);">seit ${(m.eintrittsdatum || m.seit || '').slice(0,4)}</div>` : ''}
          </div>
        </div>
      </div>`
  }).join('')

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Mitgliedskarten</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4; margin: 10mm; }
  body { font-family: system-ui, sans-serif; background: #fff; }
  .grid { display: flex; flex-wrap: wrap; gap: 5mm; justify-content: flex-start; }
  .grid > div { break-inside: avoid; }
  .info { font-size: 10px; color: #999; margin-bottom: 6mm; }
  h1 { font-size: 14px; font-weight: 800; margin-bottom: 2mm; }
  @media screen { body { padding: 20px; background: #f5f5f5; } .grid > div { box-shadow: 0 2px 12px rgba(0,0,0,0.3); } }
</style>
</head><body>
  <h1>Mitgliedskarten – ${vereinName}</h1>
  <div class="info">${mitglieder.length} Karte${mitglieder.length !== 1 ? 'n' : ''} · ${new Date().toLocaleDateString('de-AT')}</div>
  <div class="grid">${kartenHtml}</div>
</body></html>`

  const w = window.open('', '_blank')
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 400) }
}
/** Registrierung: Lizenztyp, Vereinsmitglied, Empfehlungsoption (K2/ök2/VK2 getrennt) */
const KEY_REGISTRIERUNG = 'k2-registrierung'
const KEY_OEF_REGISTRIERUNG = 'k2-oeffentlich-registrierung'
const KEY_VK2_REGISTRIERUNG = 'k2-vk2-registrierung'
/** Unsplash-Porträts für Mustermitglieder (Avatar/Bild), w=200&h=200&fit=crop */
const MUSTER_MITGLIEDER_BILDER = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop'
]
/** Werkfotos für Muster-Mitglieder (erscheinen in der Mitgliedergalerie) */
const MUSTER_WERKFOTO_BILDER = [
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=400&h=300&fit=crop'
]
/** User mit vollen Daten aus der Übersicht „Meine User“ – in VK2 als registrierte Mitglieder übernehmbar */
const USER_LISTE_FUER_MITGLIEDER: Vk2Mitglied[] = [
  { name: 'Lisa Muster', email: 'lisa.muster@beispiel.at', lizenz: 'P-2026-1001', typ: 'Malerei', mitgliedFotoUrl: MUSTER_MITGLIEDER_BILDER[0], imageUrl: MUSTER_WERKFOTO_BILDER[0], phone: '+43 664 123 4501', website: 'https://lisa-muster.at', strasse: 'Musterstraße 1', plz: '4020', ort: 'Linz', land: 'Österreich', geburtsdatum: '15.03.1985', eintrittsdatum: '15.01.2026', seit: '15.01.2026' },
  { name: 'Max Kunst', email: 'max@atelier-kunst.at', lizenz: 'VB-2026-1002', typ: 'Keramik', mitgliedFotoUrl: MUSTER_MITGLIEDER_BILDER[1], imageUrl: MUSTER_WERKFOTO_BILDER[1], phone: '+43 676 987 6543', website: 'https://atelier-kunst.at', strasse: 'Kunstgasse 12', plz: '1010', ort: 'Wien', land: 'Österreich', geburtsdatum: '22.07.1978', eintrittsdatum: '22.01.2026', seit: '22.01.2026' },
  { name: 'Anna Galerie', email: 'anna@galerie-anna.at', lizenz: 'B-2026-1003', typ: 'Grafik', mitgliedFotoUrl: MUSTER_MITGLIEDER_BILDER[2], imageUrl: MUSTER_WERKFOTO_BILDER[2], phone: '+43 650 555 1234', website: 'https://galerie-anna.at', strasse: 'Galerieplatz 3', plz: '5020', ort: 'Salzburg', land: 'Österreich', geburtsdatum: '10.11.1990', eintrittsdatum: '28.01.2026', seit: '28.01.2026' },
  { name: 'Kunstverein Musterstadt', email: 'vorstand@kv-musterstadt.at', lizenz: 'VP-2026-1004', typ: 'Skulptur', mitgliedFotoUrl: MUSTER_MITGLIEDER_BILDER[3], imageUrl: MUSTER_WERKFOTO_BILDER[3], phone: '+43 732 771 000', website: 'https://kv-musterstadt.at', strasse: 'Vereinsweg 7', plz: '8010', ort: 'Graz', land: 'Österreich', geburtsdatum: '01.05.1970', eintrittsdatum: '05.02.2026', seit: '05.02.2026' },
  { name: 'Test Nutzer', email: 'test@beispiel.at', lizenz: 'KF-2026-1005', typ: 'Fotografie', mitgliedFotoUrl: MUSTER_MITGLIEDER_BILDER[4], imageUrl: MUSTER_WERKFOTO_BILDER[4], phone: '+43 699 000 9999', website: '', strasse: 'Testweg 99', plz: '6020', ort: 'Innsbruck', land: 'Österreich', geburtsdatum: '20.12.1982', eintrittsdatum: '12.02.2026', seit: '12.02.2026' }
]
const EMPTY_MEMBER_FORM = { name: '', email: '', lizenz: '', typ: '', strasse: '', plz: '', ort: '', land: '', geburtsdatum: '', eintrittsdatum: '', phone: '', website: '', galerieLinkUrl: '', lizenzGalerieUrl: '', bio: '', vita: '', mitgliedFotoUrl: '', imageUrl: '', bankKontoinhaber: '', bankIban: '', bankBic: '', bankName: '', rolle: 'mitglied' as 'vorstand' | 'mitglied', pin: '' }
function memberToForm(m: Vk2Mitglied) {
  return { name: m.name ?? '', email: m.email ?? '', lizenz: m.lizenz ?? '', typ: m.typ ?? '', strasse: m.strasse ?? '', plz: m.plz ?? '', ort: m.ort ?? '', land: m.land ?? '', geburtsdatum: m.geburtsdatum ?? '', eintrittsdatum: m.eintrittsdatum ?? m.seit ?? '', phone: m.phone ?? '', website: m.website ?? '', galerieLinkUrl: m.galerieLinkUrl ?? '', lizenzGalerieUrl: m.lizenzGalerieUrl ?? '', bio: m.bio ?? '', vita: m.vita ?? '', mitgliedFotoUrl: m.mitgliedFotoUrl ?? '', imageUrl: m.imageUrl ?? '', bankKontoinhaber: m.bankKontoinhaber ?? '', bankIban: m.bankIban ?? '', bankBic: m.bankBic ?? '', bankName: m.bankName ?? '', rolle: m.rolle ?? 'mitglied', pin: m.pin ?? '' }
}
/** CSV-Header (versch. Schreibweisen) → Vk2Mitglied-Feld */
const CSV_HEADER_MAP: Record<string, keyof Vk2Mitglied> = {
  name: 'name', namen: 'name', name_name: 'name',
  email: 'email', 'e-mail': 'email', mail: 'email',
  strasse: 'strasse', straße: 'strasse', adresse: 'strasse',
  plz: 'plz', postleitzahl: 'plz',
  ort: 'ort',
  land: 'land',
  geburtsdatum: 'geburtsdatum', geburtstag: 'geburtsdatum',
  eintrittsdatum: 'eintrittsdatum', eintritt: 'eintrittsdatum', seit: 'eintrittsdatum',
  typ: 'typ', kunstrichtung: 'typ', kategorie: 'typ',
  phone: 'phone', telefon: 'phone', tel: 'phone',
  website: 'website', web: 'website',
  lizenz: 'lizenz',
  mitgliedfotourl: 'mitgliedFotoUrl', porträt: 'mitgliedFotoUrl', portrait: 'mitgliedFotoUrl',
  imageurl: 'imageUrl', werkfoto: 'imageUrl', werk: 'imageUrl',
  bankkontoinhaber: 'bankKontoinhaber', kontoinhaber: 'bankKontoinhaber',
  bankiban: 'bankIban', iban: 'bankIban',
  bankbic: 'bankBic', bic: 'bankBic', swift: 'bankBic',
  bankname: 'bankName', bank: 'bankName', kreditinstitut: 'bankName'
}
function parseCsvToMitglieder(csvText: string): Vk2Mitglied[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return []
  const sep = lines[0].includes(';') ? ';' : ','
  const headers = lines[0].split(sep).map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
  const rows = lines.slice(1)
  const result: Vk2Mitglied[] = []
  for (const row of rows) {
    const values = row.split(sep).map(v => v.trim().replace(/^["']|["']$/g, ''))
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = values[i] ?? '' })
    const name = obj['name'] || obj['namen'] || obj['name_name'] || values[0] || ''
    if (!name) continue
    const m: Vk2Mitglied = { name }
    const set = (key: keyof Vk2Mitglied, val: string) => { if (val) (m as any)[key] = val }
    headers.forEach((h, i) => {
      const field = CSV_HEADER_MAP[h] || CSV_HEADER_MAP[h.replace(/_/g, '')]
      if (field && values[i]) set(field, values[i])
    })
    if (m.eintrittsdatum) m.seit = m.eintrittsdatum
    result.push(m)
  }
  return result
}
/** Gibt die Vorstandsrolle für ein Mitglied zurück (Name-Abgleich mit Stammdaten), sonst null. Für Anzeige & Sortierung. */
function getVorstandRole(stammdaten: Vk2Stammdaten, memberName: string): string | null {
  const n = (s: string | undefined) => (s ?? '').trim().toLowerCase()
  const name = n(memberName)
  if (!name) return null
  if (n(stammdaten.vorstand?.name) === name) return 'Vorsitzende:r / Präsident:in'
  if (n(stammdaten.vize?.name) === name) return 'Stellv. Vorsitzende:r'
  if (n(stammdaten.kassier?.name) === name) return 'Kassier:in'
  if (n(stammdaten.schriftfuehrer?.name) === name) return 'Schriftführer:in'
  if (n(stammdaten.beisitzer?.name) === name) return 'Beisitzer:in'
  return null
}
/** Sortierrang für Vorstand (kleiner = zuerst). 0–4 Vorstand, 5 übrige. */
function getVorstandSortKey(stammdaten: Vk2Stammdaten, memberName: string): number {
  const n = (s: string | undefined) => (s ?? '').trim().toLowerCase()
  const name = n(memberName)
  if (!name) return 5
  if (n(stammdaten.vorstand?.name) === name) return 0
  if (n(stammdaten.vize?.name) === name) return 1
  if (n(stammdaten.kassier?.name) === name) return 2
  if (n(stammdaten.schriftfuehrer?.name) === name) return 3
  if (n(stammdaten.beisitzer?.name) === name) return 4
  return 5
}
const KEY_OEF_STAMMDATEN_GEORG = 'k2-oeffentlich-stammdaten-georg'
const KEY_OEF_STAMMDATEN_GALERIE = 'k2-oeffentlich-stammdaten-galerie'
const OEF_DESIGN_DEFAULT = {
  accentColor: '#5a7a6e',
  backgroundColor1: '#f6f4f0',
  backgroundColor2: '#ebe7e0',
  backgroundColor3: '#e0dbd2',
  textColor: '#2d2d2a',
  mutedColor: '#5c5c57',
  cardBg1: 'rgba(255, 255, 255, 0.85)',
  cardBg2: 'rgba(246, 244, 240, 0.9)'
} as const
import { checkLocalStorageSize, cleanupLargeImages, getLocalStorageReport, tryFreeLocalStorageSpace, SPEICHER_VOLL_MELDUNG } from './SafeMode'
import { GalerieAssistent } from '../src/components/GalerieAssistent'
import { startAutoSave, stopAutoSave, setupBeforeUnloadSave, restoreFromBackup, restoreFromBackupFile, hasBackup, getBackupTimestamp, getBackupTimestamps, createK2Backup, createOek2Backup, createVk2Backup, downloadBackupAsFile, restoreK2FromBackup, restoreOek2FromBackup, restoreVk2FromBackup, detectBackupKontext } from '../src/utils/autoSave'
import { sortArtworksNewestFirst } from '../src/utils/artworkSort'
import { urlWithBuildVersion } from '../src/buildInfo.generated'
import { writePngDpi } from 'png-dpi-reader-writer'

// KRITISCH: Importiere Safe Mode Utilities für Crash-Schutz
let safeModeUtils: any = null
try {
  import('../src/utils/safeMode').then(utils => {
    safeModeUtils = utils
  }).catch(() => {
    // Fallback wenn Import fehlschlägt
    safeModeUtils = {
      safeSetState: (isMounted: boolean, setState: any, value: any) => {
        if (isMounted) setState(value)
      },
      isSafeModeActive: () => false
    }
  })
} catch (e) {
  // Ignoriere Import-Fehler
}

// Einfache localStorage-Funktionen für Werke-Verwaltung (Key abhängig von K2 vs. ök2 – K2 wird nie in ök2 überschrieben)
function saveArtworks(artworks: any[]): boolean {
  const key = getArtworksKey()
  const json = JSON.stringify(artworks)
  try {
    // Prüfe Größe
    if (json.length > 10000000) { // Über 10MB = zu groß
      console.error('❌ Daten zu groß für localStorage:', json.length, 'Bytes')
      alert('⚠️ Zu viele Werke! Bitte einige löschen.')
      return false
    }
    
    localStorage.setItem(key, json)
    console.log('✅ Gespeichert:', artworks.length, 'Werke, Größe:', json.length, 'Bytes', key === 'k2-oeffentlich-artworks' ? '(ök2)' : '')
    
    // KRITISCH: Verifiziere Speicherung
    const verify = localStorage.getItem(key)
    if (!verify || verify !== json) {
      console.error('❌ Verifikation fehlgeschlagen!')
      return false
    }
    
    return true
  } catch (error: any) {
    console.error('❌ Fehler beim Speichern:', error)
    
    if (error.name === 'QuotaExceededError') {
      const freed = tryFreeLocalStorageSpace()
      if (freed > 0) {
        try {
          localStorage.setItem(key, json)
          console.log('✅ Nach Speicher-Freigabe gespeichert')
          return true
        } catch (retryErr: any) {
          if (retryErr.name === 'QuotaExceededError') alert('⚠️ ' + SPEICHER_VOLL_MELDUNG)
          else alert('⚠️ Fehler beim Speichern: ' + (retryErr.message || retryErr))
          return false
        }
      }
      alert('⚠️ ' + SPEICHER_VOLL_MELDUNG)
    } else {
      alert('⚠️ Fehler beim Speichern: ' + (error.message || error))
    }
    
    return false
  }
}

function loadArtworks(): any[] {
  // VK2 hat KEINE Werke – nur Mitglieder (in k2-vk2-stammdaten)
  if (isVk2AdminContext()) return []
  try {
    const key = getArtworksKey()
    const stored = localStorage.getItem(key)
    // ök2: Wenn noch keine Daten, Musterwerke als Ausgangsbasis (K2-artworks nie anrühren)
    if (!stored || stored === '[]') {
      if (isOeffentlichAdminContext()) return [...MUSTER_ARTWORKS]
      return []
    }
    // SAFE MODE: Prüfe Größe bevor Parsen
    if (stored.length > 10000000) { // Über 10MB = zu groß
      console.warn('Werke-Daten zu groß, überspringe Laden')
      return []
    }
    let artworks = JSON.parse(stored)
    
    
    // KRITISCH: Im ök2-Kontext nur echte K2-Galerie-Werke entfernen (K2-M-, K2-K-, … bzw. K2-0001), nicht ök2-eigene (K2-W-*)
    if (isOeffentlichAdminContext()) {
      const before = artworks.length
      artworks = artworks.filter((a: any) => {
        const num = a?.number != null ? String(a.number) : ''
        if (!num.startsWith('K2-')) return true // M1, M2, etc. behalten
        if (num.startsWith('K2-W-')) return true // ök2-Demo-Werke behalten
        return false // K2-M-*, K2-K-*, K2-0001 etc. entfernen
      })
      if (artworks.length < before) {
        console.log(`🧹 ök2: ${before - artworks.length} K2-Galerie-Werke entfernt (gehören nicht in Demo)`)
        try {
          localStorage.setItem(key, JSON.stringify(artworks))
        } catch (_) {}
      }
    }

    // VK2 hat keine Artworks – loadArtworks() wird im VK2-Kontext nicht verwendet
    
    // KRITISCH: Behebe automatisch doppelte Nummern beim Laden
    const numberMap = new Map<string, any[]>()
    artworks.forEach((a: any) => {
      if (a.number) {
        if (!numberMap.has(a.number)) {
          numberMap.set(a.number, [])
        }
        numberMap.get(a.number)!.push(a)
      }
    })
    
    let hasDuplicates = false
    const fixedNumbers: string[] = []
    
    numberMap.forEach((duplicates, number) => {
      if (duplicates.length > 1) {
        hasDuplicates = true
        console.warn(`⚠️ Doppelte Nummer gefunden: ${number} (${duplicates.length} Werke)`)
        
        // Sortiere nach createdAt (neuestes zuerst) oder deviceId für bessere Unterscheidung
        duplicates.sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          // Falls gleiches Datum: Sortiere nach deviceId
          if (dateA === dateB) {
            const deviceA = a.deviceId || ''
            const deviceB = b.deviceId || ''
            return deviceB.localeCompare(deviceA)
          }
          return dateB - dateA
        })
        
        // Behalte das erste (neueste), benenne andere um mit eindeutiger Nummer
        // WICHTIG: Beide Werke bleiben erhalten, bekommen aber unterschiedliche Nummern
        for (let i = 1; i < duplicates.length; i++) {
          const duplicate = duplicates[i]
          const prefix = getCategoryPrefixLetter(duplicate.category)
          
          // Extrahiere Basis-Nummer (z.B. "0011" aus "K2-M-0011")
          const baseNumber = number.replace(/K2-[KM]-/, '').replace(/[^0-9]/g, '')
          const baseNum = parseInt(baseNumber) || 1
          
          // Finde nächste freie Nummer mit Suffix (z.B. K2-M-0011-1, K2-M-0011-2)
          let newNumber = ''
          let suffix = 1
          let maxAttempts = 100
          
          while (maxAttempts > 0) {
            const candidate = `K2-${prefix}-${String(baseNum).padStart(4, '0')}-${suffix}`
            const exists = artworks.some((a: any) => {
              // Prüfe ob Nummer bereits verwendet wird (außer vom aktuellen Werk)
              return a.number === candidate && a.id !== duplicate.id && !fixedNumbers.includes(candidate)
            })
            
            if (!exists) {
              newNumber = candidate
              break
            }
            suffix++
            maxAttempts--
          }
          
          // Fallback: Wenn keine Suffix-Nummer gefunden, verwende Timestamp + Device-ID
          if (!newNumber) {
            const deviceId = duplicate.deviceId || 'unknown'
            const deviceHash = deviceId.split('-').pop()?.substring(0, 2) || Math.floor(Math.random() * 100).toString().padStart(2, '0')
            const timestamp = Date.now().toString().slice(-6)
            newNumber = `K2-${prefix}-${timestamp}${deviceHash}`
            console.warn(`⚠️ Fallback-Nummer verwendet: ${newNumber}`)
          }
          
          // Finde und aktualisiere im artworks Array
          const index = artworks.findIndex((a: any) => {
            // Exakte Übereinstimmung finden
            if (a.id === duplicate.id) return true
            if (a.number === duplicate.number && a.createdAt === duplicate.createdAt) {
              // Zusätzliche Prüfung: deviceId falls vorhanden
              if (duplicate.deviceId && a.deviceId) {
                return a.deviceId === duplicate.deviceId
              }
              return true
            }
            return false
          })
          
          if (index !== -1) {
            console.log(`🔄 Automatische Umbenennung: ${number} → ${newNumber}`)
            console.log(`   Werk: ${duplicate.title || 'Unbekannt'}, Device: ${duplicate.deviceId || 'Unbekannt'}, Index: ${index}`)
            artworks[index].number = newNumber
            artworks[index].id = newNumber
            artworks[index].renamedFrom = number // Speichere Original-Nummer für Referenz
            artworks[index].renamedAt = new Date().toISOString()
            fixedNumbers.push(newNumber)
            console.log(`✅ Werk umbenannt:`, artworks[index])
          } else {
            console.error(`❌ Konnte Werk nicht finden für Umbenennung`)
            console.error(`   Gesucht:`, duplicate)
            console.error(`   Verfügbare IDs:`, artworks.map((a: any) => ({ id: a.id, number: a.number, createdAt: a.createdAt })))
          }
        }
      }
    })
    
    // Speichere korrigierte Daten zurück falls Änderungen gemacht wurden
    if (hasDuplicates && fixedNumbers.length > 0) {
      try {
        console.log(`💾 Speichere ${fixedNumbers.length} umbenannte Werke...`)
        const saved = saveArtworks(artworks)
        if (saved) {
          console.log('✅ Doppelte Nummern automatisch behoben und gespeichert')
          console.log(`📝 ${fixedNumbers.length} Werke umbenannt:`, fixedNumbers)
          // Dispatch Event damit UI aktualisiert wird
          window.dispatchEvent(new CustomEvent('artworks-updated'))
          // Zeige Info-Meldung (nur einmal, nicht bei jedem Laden)
          const lastFixTime = localStorage.getItem('k2-duplicate-fix-time')
          const now = Date.now()
          if (!lastFixTime || (now - parseInt(lastFixTime)) > 60000) { // Maximal alle 60 Sekunden
            localStorage.setItem('k2-duplicate-fix-time', now.toString())
            console.log(`ℹ️ ${fixedNumbers.length} Werke wurden automatisch umbenannt um Duplikate zu beheben`)
          }
        } else {
          console.error('❌ Fehler beim Speichern korrigierter Daten')
        }
      } catch (e) {
        console.error('Fehler beim Speichern korrigierter Daten:', e)
      }
    }
    
    return artworks
  } catch (error) {
    console.error('Fehler beim Laden:', error)
    return []
  }
}

// localStorage-Funktionen für Events (Key abhängig von K2 vs. ök2)
function saveEvents(events: any[]): void {
  try {
    localStorage.setItem(getEventsKey(), JSON.stringify(events))
  } catch (error) {
    console.error('Fehler beim Speichern der Events:', error)
  }
}

function loadEvents(): any[] {
  try {
    const key = getEventsKey()
    const stored = localStorage.getItem(key)
    if (!stored || stored === '[]') {
      if (isOeffentlichAdminContext()) return JSON.parse(JSON.stringify(MUSTER_EVENTS))
      return []
    }
    return JSON.parse(stored)
  } catch (error) {
    console.error('Fehler beim Laden der Events:', error)
    return []
  }
}

// Minimale Cleanup-Funktion - komplett vereinfacht um Abstürze zu vermeiden
// Wird nur noch manuell aufgerufen, nicht automatisch
function cleanupUnnecessaryData() {
  // Keine komplexen Operationen mehr - nur minimale Bereinigung
  // Wird nur noch bei Bedarf aufgerufen, nicht automatisch
  try {
    const events = loadEvents()
    if (!Array.isArray(events) || events.length === 0) {
      return // Nichts zu bereinigen
    }
    const cleanedEvents = events.filter((event: any) => event && event.id && event.title)
    if (cleanedEvents.length !== events.length) {
      saveEvents(cleanedEvents)
    }
  } catch (error) {
    // Fehler komplett ignorieren um Abstürze zu vermeiden
  }
}

// Tracking für offene PDF-Fenster - verhindert zu viele gleichzeitige Fenster
let openPDFWindows: Window[] = []
let intervalIds: ReturnType<typeof setInterval>[] = [] // Tracking für alle Intervalle
const MAX_OPEN_WINDOWS = 3

// PDF-Fenster sicher öffnen mit automatischem Cleanup - VERBESSERT gegen Memory Leaks
function openPDFWindowSafely(blob: Blob, title?: string): Window | null {
  // Schließe alte Fenster wenn zu viele offen sind
  if (openPDFWindows.length >= MAX_OPEN_WINDOWS) {
    const oldestWindow = openPDFWindows.shift()
    if (oldestWindow && !oldestWindow.closed) {
      try {
        oldestWindow.close()
      } catch (e) {
        // Ignorieren
      }
    }
  }
  
  // Bereinige geschlossene Fenster aus Array
  openPDFWindows = openPDFWindows.filter(w => w && !w.closed)
  
  try {
    const url = URL.createObjectURL(blob)
    const pdfWindow = window.open(url, '_blank', 'noopener,noreferrer')
    
    if (!pdfWindow) {
      URL.revokeObjectURL(url)
      return null
    }
    
    // Fenster zum Tracking hinzufügen
    openPDFWindows.push(pdfWindow)
    
    // Cleanup: Revoke URL wenn Fenster geschlossen wird
    const cleanup = () => {
      try {
        URL.revokeObjectURL(url)
        const index = openPDFWindows.indexOf(pdfWindow)
        if (index > -1) {
          openPDFWindows.splice(index, 1)
        }
      } catch (e) {
        // Ignorieren
      }
    }
    
    // KEIN Interval mehr - verursacht Crashes alle 3 Minuten!
    // Stattdessen: Cleanup nur wenn Fenster geschlossen wird (via beforeunload)
    const handleBeforeUnload = () => {
      cleanup()
    }
    
    // Cleanup wenn Fenster geschlossen wird
    pdfWindow.addEventListener('beforeunload', handleBeforeUnload)
    
    // Fallback: Cleanup nach 30 Sekunden (nicht 3 Minuten!)
    const timeoutId = setTimeout(() => {
      pdfWindow.removeEventListener('beforeunload', handleBeforeUnload)
      if (!pdfWindow.closed) {
        cleanup()
      }
    }, 30000) // Nur 30 Sekunden - verhindert Memory-Leaks ohne Crashes
    
    return pdfWindow
  } catch (error) {
    console.error('Fehler beim Öffnen des PDF-Fensters:', error)
    return null
  }
}

// Alle Intervalle bereinigen - wird beim Unmount aufgerufen
function cleanupAllIntervals() {
  intervalIds.forEach(id => clearInterval(id))
  intervalIds = []
}

// Alle PDF-Fenster schließen
function closeAllPDFWindows() {
  openPDFWindows.forEach(window => {
    try {
      if (!window.closed) {
        window.close()
      }
    } catch (e) {
      // Ignorieren
    }
  })
  openPDFWindows = []
}

/**
 * Admin-Seite für K2 Galerie Verwaltung
 * Wird angezeigt bei: ?screenshot=admin oder /admin
 */
// Globaler Singleton-Check: Verhindere doppeltes Mounten
let globalAdminInstance: any = null
let globalMountCount = 0

function ScreenshotExportAdmin() {
  // KRITISCH: Kontext sofort aus URL synchronisieren – muss vor jedem useState stehen
  // Dadurch ist isOeffentlichAdminContext() beim ersten useState-Aufruf bereits korrekt
  syncAdminContextFromUrl()

  const navigate = useNavigate()
  const location = useLocation()
  // Singleton-Check: Verhindere doppeltes Mounten - KRITISCH gegen Crashes
  const mountId = React.useRef(`admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  const isMountedRef = React.useRef(true)
  
  React.useEffect(() => {
    globalMountCount++
    isMountedRef.current = true
    
    // Wenn bereits eine Instanz existiert, warnen und frühe Instanz bereinigen
    if (globalAdminInstance && globalAdminInstance !== mountId.current) {
      console.error('❌ KRITISCH: ScreenshotExportAdmin wird doppelt gemountet!', {
        erste: globalAdminInstance,
        zweite: mountId.current,
        count: globalMountCount
      })
      // Bereinige alte Instanz
      cleanupAllIntervals()
      closeAllPDFWindows()
    }
    
    globalAdminInstance = mountId.current
    console.log(`🔧 ScreenshotExportAdmin #${globalMountCount} gemountet:`, mountId.current)
    
    return () => {
      isMountedRef.current = false
      globalMountCount--
      if (globalAdminInstance === mountId.current) {
        globalAdminInstance = null
      }
      console.log(`🔧 ScreenshotExportAdmin unmountet:`, mountId.current, `(Verbleibend: ${globalMountCount})`)
      
      // KRITISCH: Bereinige ALLES bevor Component unmountet
      try {
        // Bereinige alle PDF-Fenster Intervalle
        cleanupAllIntervals()
        // Schließe alle PDF-Fenster
        closeAllPDFWindows()
        
        // Hinweis: Echte Listener werden in den jeweiligen useEffects mit derselben Referenz entfernt.
        // storage/stammdaten-updated werden hier nicht registriert → kein Render-Loop-Risiko.
      } catch (e) {
        console.error('Fehler beim Cleanup:', e)
      }
    }
  }, [])

  // In Admin: Flag entfernen, damit „Zum Shop“ von hier aus zur Kasse führt (nicht Kundenansicht)
  React.useEffect(() => {
    try {
      sessionStorage.removeItem('k2-from-galerie-view')
    } catch (_) {}
  }, [])

  // Guide-Navigation: reagiert auf URL-Änderungen (React Router navigate) – öffnet den richtigen Tab
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(location.search)
      const gt = params.get('guidetab')
      const validTabs = ['werke','katalog','statistik','zertifikat','newsletter','pressemappe','eventplan','design','einstellungen','assistent'] as const
      type AdminTab = typeof validTabs[number]
      if (gt && (validTabs as readonly string[]).includes(gt)) {
        setActiveTab(gt as AdminTab)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch { /* ignore */ }
  }, [location.search])

  // Vorname aus URL – kommt vom Guide (z.B. /admin?context=oeffentlich&vorname=Klein)
  const guideVorname = (() => {
    try { return new URLSearchParams(window.location.search).get('vorname') ?? '' } catch { return '' }
  })()
  const guidePfad = (() => {
    try { return new URLSearchParams(window.location.search).get('pfad') ?? '' } catch { return '' }
  })()
  const guideAssistent = (() => {
    try { return new URLSearchParams(window.location.search).get('assistent') === '1' } catch { return false }
  })()

  // Wenn globaler Guide-Flow aktiv: Banner komplett ausblenden – Dialog führt alleine
  const guideFlowAktiv = (() => {
    try {
      const v = localStorage.getItem('k2-guide-flow')
      if (!v) return false
      const f = JSON.parse(v)
      return f?.aktiv === true
    } catch { return false }
  })()

  // Vom Hub gekommen? → Zurück-Button anzeigen
  const fromHub = (() => {
    try {
      const params = new URLSearchParams(window.location.search)
      return params.get('from') === 'hub' || sessionStorage.getItem('k2-hub-from') === '1'
    } catch { return false }
  })()

  // Klare Admin-Struktur: Werke | Eventplanung | Design | Einstellungen.
  const initialTab = (() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const validTabs = ['werke','katalog','statistik','zertifikat','newsletter','pressemappe','eventplan','design','einstellungen','assistent'] as const
      type AdminTab = typeof validTabs[number]
      // ?tab=... (vom Hub) oder ?guidetab=... (alter Guide)
      const t = params.get('tab') || params.get('guidetab')
      if (t && validTabs.includes(t as AdminTab)) return t as AdminTab
    } catch { /* ignore */ }
    return guideAssistent ? 'assistent' : 'werke'
  })()
  const [activeTab, setActiveTab] = useState<'werke' | 'katalog' | 'statistik' | 'zertifikat' | 'newsletter' | 'pressemappe' | 'eventplan' | 'design' | 'einstellungen' | 'assistent'>(initialTab)
  const [guideBannerClosed, setGuideBannerClosed] = useState(false)
  const [guideBegleiterGeschlossen, setGuideBegleiterGeschlossen] = useState(false)
  const [eventplanSubTab, setEventplanSubTab] = useState<'events' | 'öffentlichkeitsarbeit'>('events')
  const [pastEventsExpanded, setPastEventsExpanded] = useState(false) // kleine Leiste „Vergangenheit“, bei Klick aufklappen
  const [settingsSubTab, setSettingsSubTab] = useState<'stammdaten' | 'registrierung' | 'drucker' | 'sicherheit' | 'lager'>('stammdaten')
  const [designSubTab, setDesignSubTab] = useState<'vorschau' | 'farben'>('vorschau')
  const [designPreviewEdit, setDesignPreviewEdit] = useState<string | null>(null) // z. B. 'p1-title' | 'p2-martinaBio' – alles auf der Seite klickbar
  const [previewContainerWidth, setPreviewContainerWidth] = useState(412) // für bildausfüllende Skalierung
  const [previewFullscreenPage, setPreviewFullscreenPage] = useState<1 | 2>(1) // welche Seite in der Vorschau (immer nur eine)
  const [designPreviewHeightPx, setDesignPreviewHeightPx] = useState(560) // Vorschau-Höhe – per Ziehen anpassbar
  const [designPreviewScale, setDesignPreviewScale] = useState(1) // 1 = 100%, manuell vergrößerbar
  const designPreviewResizeStart = useRef<{ y: number; height: number } | null>(null)
  const previewContainerRef = React.useRef<HTMLDivElement>(null)
  const welcomeImageInputRef = React.useRef<HTMLInputElement>(null)
  const galerieImageInputRef = React.useRef<HTMLInputElement>(null)
  const virtualTourImageInputRef = React.useRef<HTMLInputElement>(null)
  const [backupTimestamps, setBackupTimestamps] = useState<string[]>([])
  const [restoreProgress, setRestoreProgress] = useState<'idle' | 'running' | 'done'>('idle')
  const [backupPanelMinimized, setBackupPanelMinimized] = useState(true)
  const backupFileInputRef = useRef<HTMLInputElement>(null)
  const [adminNewPw, setAdminNewPw] = useState('')
  const [adminNewPwConfirm, setAdminNewPwConfirm] = useState('')
  const [adminContactEmail, setAdminContactEmail] = useState('')
  const [adminContactPhone, setAdminContactPhone] = useState('')
  const [vk2Stammdaten, setVk2Stammdaten] = useState<Vk2Stammdaten>(VK2_STAMMDATEN_DEFAULTS)
  const [registrierungConfig, setRegistrierungConfig] = useState<RegistrierungConfig>(REGISTRIERUNG_CONFIG_DEFAULTS)

  // Werkkatalog – Filter und Ansicht
  const [katalogFilter, setKatalogFilter] = useState<{
    status: 'alle' | 'galerie' | 'verkauft' | 'reserviert' | 'lager'
    kategorie: string
    artist: string
    vonDatum: string
    bisDatum: string
    vonPreis: string
    bisPreis: string
    suchtext: string
  }>({ status: 'alle', kategorie: '', artist: '', vonDatum: '', bisDatum: '', vonPreis: '', bisPreis: '', suchtext: '' })
  const [katalogAnsicht, setKatalogAnsicht] = useState<'tabelle' | 'karten'>('tabelle')
  const [katalogSpalten, setKatalogSpalten] = useState<string[]>(['nummer', 'titel', 'kategorie', 'kuenstler', 'masse', 'technik', 'preis', 'status', 'datum', 'kaeufer'])
  const [katalogSelectedWork, setKatalogSelectedWork] = useState<any>(null)

  // Bei laufender Wiederherstellung automatisch aufklappen, damit der Balkenverlauf sichtbar ist
  useEffect(() => {
    if (restoreProgress !== 'idle') setBackupPanelMinimized(false)
  }, [restoreProgress])

  // Backup-Verlauf laden, wenn du Einstellungen öffnest (kein Auto-Refresh)
  useEffect(() => {
    if (activeTab === 'einstellungen') setBackupTimestamps(getBackupTimestamps())
  }, [activeTab])

  // Vorschau-Container für bildausfüllende Skalierung messen (Design-Tab Vorschau; bei Overlay ref wechselt)
  useEffect(() => {
    if (designSubTab !== 'vorschau') return
    const el = previewContainerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      if (el.offsetWidth > 0) setPreviewContainerWidth(el.offsetWidth)
    })
    ro.observe(el)
    if (el.offsetWidth > 0) setPreviewContainerWidth(el.offsetWidth)
    return () => ro.disconnect()
  }, [designSubTab])

  // Design-Vorschau: Ziehen am unteren Rand zum Vergrößern/Verkleinern (Maus + Touch)
  useEffect(() => {
    const onMove = (clientY: number) => {
      const start = designPreviewResizeStart.current
      if (!start) return
      const delta = clientY - start.y
      setDesignPreviewHeightPx((h) => Math.min(1200, Math.max(320, start.height + delta)))
    }
    const onMouseMove = (e: MouseEvent) => onMove(e.clientY)
    const onTouchMove = (e: TouchEvent) => { if (e.touches.length === 1) onMove(e.touches[0].clientY) }
    const onUp = () => { designPreviewResizeStart.current = null }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onUp)
    }
  }, [])

  // Brother-Etikettengröße parsen (Format "29x90.3" → { width: 29, height: 90.3 })
  const parseLabelSize = (s: string) => {
    const match = (s || '').trim().match(/^(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)$/i)
    if (match) {
      const w = parseFloat(match[1].replace(',', '.'))
      const h = parseFloat(match[2].replace(',', '.'))
      if (w > 0 && h > 0) return { width: w, height: h }
    }
    return { width: 29, height: 90.3 }
  }

  // Mandantenspezifische Drucker-Einstellungen (K2, ök2, Demo – je eigener Drucker + Format)
  const printerStorageKey = (tenantId: TenantId, key: 'ip' | 'type' | 'labelSize' | 'printServerUrl') => {
    const suffix = key === 'ip' ? 'printer-ip' : key === 'type' ? 'printer-type' : key === 'labelSize' ? 'label-size' : 'print-server-url'
    return `k2-${suffix}-${tenantId}`
  }
  const defaultPrinterSettings = () => ({
    ipAddress: '192.168.1.102',
    printerModel: 'Brother QL-820MWBc',
    printerType: 'etikettendrucker' as const,
    labelSize: '29x90,3',
    // Standard: Am Mac localhost; Mobilgeräte und Drucker im LAN 192.168.1.x → Print-Server-URL in diesem Netz.
    printServerUrl: typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3847'
      : 'http://192.168.1.1:3847'
  })
  const loadPrinterSettingsForTenant = (tenantId: TenantId) => {
    try {
      const def = defaultPrinterSettings()
      // Migration: alte Keys ohne Mandant-Suffix (nur für k2) einmal in neue Keys übernehmen
      if (tenantId === 'k2') {
        const newIpKey = printerStorageKey('k2', 'ip')
        if (!localStorage.getItem(newIpKey)) {
          const oldIp = localStorage.getItem('k2-printer-ip')
          if (oldIp) localStorage.setItem(newIpKey, oldIp)
        }
        if (!localStorage.getItem(printerStorageKey('k2', 'type'))) {
          const oldType = localStorage.getItem('k2-printer-type')
          if (oldType) localStorage.setItem(printerStorageKey('k2', 'type'), oldType)
        }
        if (!localStorage.getItem(printerStorageKey('k2', 'labelSize'))) {
          const oldLabel = localStorage.getItem('k2-label-size')
          if (oldLabel) localStorage.setItem(printerStorageKey('k2', 'labelSize'), oldLabel)
        }
        if (!localStorage.getItem(printerStorageKey('k2', 'printServerUrl'))) {
          const oldUrl = localStorage.getItem('k2-print-server-url')
          if (oldUrl) localStorage.setItem(printerStorageKey('k2', 'printServerUrl'), oldUrl)
        }
      }
      const ip = localStorage.getItem(printerStorageKey(tenantId, 'ip'))
      const type = localStorage.getItem(printerStorageKey(tenantId, 'type'))
      const labelSize = localStorage.getItem(printerStorageKey(tenantId, 'labelSize'))
      const printServerUrl = localStorage.getItem(printerStorageKey(tenantId, 'printServerUrl'))
      return {
        ipAddress: ip || def.ipAddress,
        printerModel: def.printerModel,
        printerType: (type || def.printerType) as 'etikettendrucker' | 'standarddrucker',
        labelSize: labelSize || def.labelSize,
        printServerUrl: printServerUrl || def.printServerUrl
      }
    } catch {
      return defaultPrinterSettings()
    }
  }
  const savePrinterSetting = (tenantId: TenantId, key: 'ip' | 'type' | 'labelSize' | 'printServerUrl', value: string) => {
    try {
      localStorage.setItem(printerStorageKey(tenantId, key), value)
    } catch (_) {}
  }

  const [printerSettingsForTenant, setPrinterSettingsForTenant] = useState<TenantId>(() => getCurrentTenantId())
  const [printerSettings, setPrinterSettings] = useState(() => loadPrinterSettingsForTenant(getCurrentTenantId()))

  // Beim Wechsel des Mandanten (Drucker-Tab): Einstellungen für diesen Mandanten laden
  useEffect(() => {
    setPrinterSettings(loadPrinterSettingsForTenant(printerSettingsForTenant))
  }, [printerSettingsForTenant])
  
  // Cleanup beim Mount: Schließe alle Modals (falls durch StrictMode doppelt geöffnet)
  useEffect(() => {
    if (!isMountedRef.current) return
    // Stelle sicher dass alle Modals geschlossen sind
    setShowEventModal(false)
    setShowExportMenu(false)
    setShowDocumentModal(false)
    setShowUploadModal(false)
  }, [])
  
  // KEIN automatischer Safe-Mode-Check mehr beim Öffnen/Reopen (verursacht Fenster-Abstürze).
  // Speicher prüfen/bereinigen nur manuell: Einstellungen → Backup & Wiederherstellung / Export-Menü.
  
  // Seitentexte (bearbeitbare Texte pro Seite) – K2 vs. ök2 vs. VK2 getrennt
  const [pageTexts, setPageTextsState] = useState<PageTextsConfig>(() => {
    const raw = getPageTexts(isOeffentlichAdminContext() ? 'oeffentlich' : isVk2AdminContext() ? 'vk2' : undefined)
    if (isVk2AdminContext()) {
      // VK2: K2-Standardtexte erkennen und mit VK2-Defaults überschreiben
      const K2_HERO = 'K2 Galerie'
      const K2_TAGLINE = 'Kunst & Keramik – Martina und Georg Kreinecker'
      const K2_INTRO = 'Ein Neuanfang mit Leidenschaft'
      const vk2Vereinsname = (() => { try { const s = localStorage.getItem('k2-vk2-stammdaten'); return s ? (JSON.parse(s)?.verein?.name || '') : '' } catch { return '' } })()
      const galerie = raw.galerie ?? {}
      const heroTitle = (!galerie.heroTitle || galerie.heroTitle === K2_HERO) ? (vk2Vereinsname || 'VK2 Vereinsplattform') : galerie.heroTitle
      const welcomeSubtext = (!galerie.welcomeSubtext || galerie.welcomeSubtext === K2_TAGLINE) ? 'Kunstverein' : galerie.welcomeSubtext
      const welcomeIntroText = (!galerie.welcomeIntroText || galerie.welcomeIntroText.startsWith(K2_INTRO)) ? 'Die Mitglieder unseres Vereins – Künstler:innen mit Leidenschaft und Können.' : galerie.welcomeIntroText
      return { ...raw, galerie: { ...galerie, heroTitle, welcomeSubtext, welcomeIntroText } }
    }
    return raw
  })

  // Altes Blau-Theme erkennen → K2-Orange (wie in GaleriePage)
  const K2_ORANGE_DESIGN = {
    accentColor: '#ff8c42',
    backgroundColor1: '#1a0f0a',
    backgroundColor2: '#2d1a14',
    backgroundColor3: '#3d2419',
    textColor: '#fff5f0',
    mutedColor: '#d4a574',
    cardBg1: 'rgba(45, 26, 20, 0.95)',
    cardBg2: 'rgba(26, 15, 10, 0.92)'
  }
  const OLD_BLUE_BG_LIST = ['#0a0e27', '#03040a', '#1a1f3a', '#0d1426', '#111c33', '#0f1419']
  const isOldBlueDesign = (d: Record<string, string>) => OLD_BLUE_BG_LIST.includes((d.backgroundColor1 || '').toLowerCase().trim())

  const getDesignStorageKey = () => isOeffentlichAdminContext() ? KEY_OEF_DESIGN : isVk2AdminContext() ? KEY_VK2_DESIGN : 'k2-design-settings'
  // Design-Einstellungen – aus localStorage; K2: altes Blau → K2-Orange; ök2: eigener Key, Standard = OEF_DESIGN_DEFAULT
  const [designSettings, setDesignSettings] = useState(() => {
    try {
      const key = getDesignStorageKey()
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
      if (stored && stored.length > 0 && stored.length < 50000) {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === 'object' && (parsed.accentColor || parsed.backgroundColor1)) {
          if (!isOeffentlichAdminContext() && !isVk2AdminContext() && isOldBlueDesign(parsed)) {
            try { localStorage.setItem('k2-design-settings', JSON.stringify(K2_ORANGE_DESIGN)) } catch (_) {}
            return K2_ORANGE_DESIGN
          }
          const defaults = isOeffentlichAdminContext() ? OEF_DESIGN_DEFAULT : isVk2AdminContext() ? K2_ORANGE_DESIGN : K2_ORANGE_DESIGN
          return {
            accentColor: parsed.accentColor ?? (defaults as Record<string, string>).accentColor,
            backgroundColor1: parsed.backgroundColor1 ?? (defaults as Record<string, string>).backgroundColor1,
            backgroundColor2: parsed.backgroundColor2 ?? (defaults as Record<string, string>).backgroundColor2,
            backgroundColor3: parsed.backgroundColor3 ?? (defaults as Record<string, string>).backgroundColor3,
            textColor: parsed.textColor ?? (defaults as Record<string, string>).textColor,
            mutedColor: parsed.mutedColor ?? (defaults as Record<string, string>).mutedColor,
            cardBg1: parsed.cardBg1 ?? (defaults as Record<string, string>).cardBg1,
            cardBg2: parsed.cardBg2 ?? (defaults as Record<string, string>).cardBg2
          }
        }
      }
    } catch (_) {}
    return { ...(isOeffentlichAdminContext() ? OEF_DESIGN_DEFAULT : K2_ORANGE_DESIGN) }
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showVitaEditor, setShowVitaEditor] = useState(false)
  /** VK2 Mitglied-Login Modal */
  const [showMitgliedLogin, setShowMitgliedLogin] = useState(false)
  const [mitgliedLoginName, setMitgliedLoginName] = useState('')
  const [mitgliedLoginPin, setMitgliedLoginPin] = useState('')
  const [mitgliedLoginFehler, setMitgliedLoginFehler] = useState('')
  /** Eingeloggtes Mitglied (Name) – nur eigenes Profil */
  const [vk2EingeloggtMitglied, setVk2EingeloggtMitglied] = useState<string | null>(() => getVk2EingeloggtesM())
  const [editingArtwork, setEditingArtwork] = useState<any | null>(null)
  /** VK2: Index in vk2Stammdaten.mitglieder beim Bearbeiten; null = neues Mitglied */
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null)
  /** VK2: Vollständige Mitglieder-Stammdaten im Modal */
  const [memberForm, setMemberForm] = useState<{ name: string; email: string; lizenz: string; typ: string; strasse: string; plz: string; ort: string; land: string; geburtsdatum: string; eintrittsdatum: string; phone: string; website: string; galerieLinkUrl: string; lizenzGalerieUrl: string; bio: string; vita: string; mitgliedFotoUrl: string; imageUrl: string; bankKontoinhaber: string; bankIban: string; bankBic: string; bankName: string; rolle: 'vorstand' | 'mitglied'; pin: string }>({ ...EMPTY_MEMBER_FORM })
  /** VK2: Drag-over für CSV-Import */
  const [csvDragOver, setCsvDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  // Nur im Admin: Foto freistellen (mit Pro-Hintergrund) oder Original unverändert benutzen
  const [photoUseFreistellen, setPhotoUseFreistellen] = useState(true)
  // Hintergrund-Variante bei Freistellung: hell | weiss | warm | kuehl | dunkel
  const [photoBackgroundPreset, setPhotoBackgroundPreset] = useState<'hell' | 'weiss' | 'warm' | 'kuehl' | 'dunkel'>('hell')
  const [artworkTitle, setArtworkTitle] = useState('')
  const [artworkCategory, setArtworkCategory] = useState<string>('malerei')
  const [artworkCeramicSubcategory, setArtworkCeramicSubcategory] = useState<'vase' | 'teller' | 'skulptur' | 'sonstig'>('vase')
  const [artworkCeramicHeight, setArtworkCeramicHeight] = useState<string>('10')
  const [artworkCeramicDiameter, setArtworkCeramicDiameter] = useState<string>('10')
  const [artworkCeramicDescription, setArtworkCeramicDescription] = useState<string>('')
  const [artworkCeramicType, setArtworkCeramicType] = useState<'steingut' | 'steinzeug'>('steingut')
  const [artworkCeramicSurface, setArtworkCeramicSurface] = useState<'engobe' | 'glasur' | 'mischtechnik'>('mischtechnik')
  const [artworkPaintingWidth, setArtworkPaintingWidth] = useState<string>('')
  const [artworkPaintingHeight, setArtworkPaintingHeight] = useState<string>('')
  const [artworkArtist, setArtworkArtist] = useState<string>('')
  const [artworkDescription, setArtworkDescription] = useState('')
  const [artworkTechnik, setArtworkTechnik] = useState<string>('') // z.B. "Acryl auf Leinwand"
  const [artworkDimensions, setArtworkDimensions] = useState<string>('') // z.B. "60×80 cm"
  const [artworkPrice, setArtworkPrice] = useState<string>('')
  // Sichtbarkeit-Einstellungen:
  // - inExhibition: Werke in der Galerie-Vorschau sichtbar (immer true)
  // - inShop: Werke im Online-Shop verfügbar (kann geändert werden)
  const [isInExhibition] = useState(true)
  const [isInShop, setIsInShop] = useState(true)
  const [isImVereinskatalog, setIsImVereinskatalog] = useState(false)
  const [artworkQuantity, setArtworkQuantity] = useState<string>('1')
  const [artworkNumber, setArtworkNumber] = useState<string>('')
  // ök2 Künstler: Schnellversion (wenig Felder) vs. ausführliche Version; alle Kategorien/Beschreibungen frei
  const [artworkFormVariantOek2, setArtworkFormVariantOek2] = useState<'schnell' | 'ausfuehrlich'>('schnell')
  const [artworkCategoryFree, setArtworkCategoryFree] = useState<string>('')
  const [artworkSubcategoryFree, setArtworkSubcategoryFree] = useState<string>('')
  const [artworkDimensionsFree, setArtworkDimensionsFree] = useState<string>('')
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [oneClickPrinting, setOneClickPrinting] = useState(false)
  const [showShareFallbackOverlay, setShowShareFallbackOverlay] = useState(false)
  const [shareFallbackImageUrl, setShareFallbackImageUrl] = useState<string | null>(null)
  const shareFallbackBlobRef = useRef<Blob | null>(null)
  const [printLabelData, setPrintLabelData] = useState<{ url: string; widthMm: number; heightMm: number } | null>(null)
  const [savedArtwork, setSavedArtwork] = useState<any>(null)
  const [isSavingArtwork, setIsSavingArtwork] = useState(false)
  const [selectedForBatchPrint, setSelectedForBatchPrint] = useState<Set<string>>(new Set())
  const [batchPrintUrls, setBatchPrintUrls] = useState<string[] | null>(null)
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [saleInput, setSaleInput] = useState('')
  const [saleMethod, setSaleMethod] = useState<'scan' | 'manual'>('scan')
  const [showReserveModal, setShowReserveModal] = useState(false)
  const [reserveInput, setReserveInput] = useState('')
  const [reserveMethod, setReserveMethod] = useState<'scan' | 'manual'>('scan')
  const [reserveName, setReserveName] = useState('')
  const [allArtworks, setAllArtworks] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('alle')
  const [showCameraView, setShowCameraView] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [documentFilter, setDocumentFilter] = useState<'alle' | 'pr-dokumente' | 'sonstige'>('alle')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  /** ök2: Verkaufte Werke in Galerie anzeigen (Tage) – Speicher: k2-oeffentlich-galerie-settings */
  const [soldArtworksDisplayDaysOek2, setSoldArtworksDisplayDaysOek2] = useState<number>(30)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Eventplan
  const [events, setEvents] = useState<any[]>([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [eventTitle, setEventTitle] = useState('')
  const [eventType, setEventType] = useState<'galerieeröffnung' | 'vernissage' | 'finissage' | 'öffentlichkeitsarbeit' | 'sonstiges'>('galerieeröffnung')
  const [eventDate, setEventDate] = useState('')
  const [eventEndDate, setEventEndDate] = useState('')
  const [eventStartTime, setEventStartTime] = useState('')
  const [eventEndTime, setEventEndTime] = useState('')
  const [eventDailyTimes, setEventDailyTimes] = useState<Record<string, { start: string, end: string }>>({})
  const [eventDescription, setEventDescription] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  
  // Refresh für Öffentlichkeitsarbeit nach „PR-Vorschläge generieren“
  const [prSuggestionsRefresh, setPrSuggestionsRefresh] = useState(0)

  // ESC-Taste zum Schließen des Event-Modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEventModal) {
        setShowEventModal(false)
        setEditingEvent(null)
        setEventTitle('')
        setEventType('galerieeröffnung')
        setEventDate('')
        setEventEndDate('')
        setEventStartTime('')
        setEventEndTime('')
        setEventDailyTimes({})
        setEventDescription('')
        setEventLocation('')
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [showEventModal])

  // Schließe Export-Menü beim Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showExportMenu && !(e.target as HTMLElement).closest('[data-export-menu]')) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExportMenu])

  // Mobile: Viewport beim Öffnen/Schließen des Werk-Modals vergrößern für optimale Eingabestruktur
  useEffect(() => {
    if (typeof document === 'undefined') return
    const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null
    if (!meta) return
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
    const defaultViewport = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
    const zoomedViewport = 'width=device-width, initial-scale=1.35, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
    if (showAddModal && isMobile) {
      meta.setAttribute('content', zoomedViewport)
    } else {
      meta.setAttribute('content', defaultViewport)
    }
    return () => {
      meta.setAttribute('content', defaultViewport)
    }
  }, [showAddModal])

  // Design wird bereits im useState-Initializer aus localStorage gelesen – kein zweites Laden nötig (verhindert Überschreiben von Variante A/B)

  // Seitentexte laden (K2 oder ök2 je nach Kontext)
  useEffect(() => {
    let isMounted = true
    const key = isOeffentlichAdminContext() ? 'k2-oeffentlich-page-texts' : 'k2-page-texts'
    const t = setTimeout(() => {
      if (!isMounted) return
      try {
        const stored = localStorage.getItem(key)
        if (stored && stored.length < 50000) {
          const saved = JSON.parse(stored) as PageTextsConfig
          if (isMounted) setPageTextsState(saved)
        } else if (isOeffentlichAdminContext()) {
          if (isMounted) setPageTextsState(getPageTexts('oeffentlich'))
        }
      } catch (_) {}
    }, 100)
    return () => { isMounted = false; clearTimeout(t) }
  }, [])

  // Design-Entwurf nur in der Design-Tab-Vorschau sichtbar; echte Übernahme erst nach „Speichern“ (kein Auto-Save, kein Anwenden auf document.root)
  const designDraftCssVars = (designSettings && Object.keys(designSettings).length > 0) ? {
    ['--k2-accent' as string]: designSettings.accentColor,
    ['--k2-bg-1' as string]: designSettings.backgroundColor1,
    ['--k2-bg-2' as string]: designSettings.backgroundColor2,
    ['--k2-bg-3' as string]: designSettings.backgroundColor3,
    ['--k2-text' as string]: designSettings.textColor,
    ['--k2-muted' as string]: designSettings.mutedColor,
    ['--k2-card-bg-1' as string]: designSettings.cardBg1,
    ['--k2-card-bg-2' as string]: designSettings.cardBg2,
  } as React.CSSProperties : {}

  // Hex ↔ HSL für stufenlose Schieber (0–360 H, 0–100 S, 0–100 L)
  const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    const s = hex.replace(/^#/, '')
    const r = s.length === 3 ? parseInt(s[0] + s[0], 16) / 255 : parseInt(s.slice(0, 2), 16) / 255
    const g = s.length === 3 ? parseInt(s[1] + s[1], 16) / 255 : parseInt(s.slice(2, 4), 16) / 255
    const b = s.length === 3 ? parseInt(s[2] + s[2], 16) / 255 : parseInt(s.slice(4, 6), 16) / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s2 = 0
    const l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s2 = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      else if (max === g) h = ((b - r) / d + 2) / 6
      else h = ((r - g) / d + 4) / 6
    }
    return { h: Math.round(h * 360), s: Math.round(s2 * 100), l: Math.round(l * 100) }
  }
  const hslToHex = (h: number, s: number, l: number): string => {
    const s2 = s / 100, l2 = l / 100
    const c = (1 - Math.abs(2 * l2 - 1)) * s2
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l2 - c / 2
    let r = 0, g = 0, b = 0
    if (h < 60) { r = c; g = x; b = 0 } else if (h < 120) { r = x; g = c; b = 0 } else if (h < 180) { r = 0; g = c; b = x } else if (h < 240) { r = 0; g = x; b = c } else if (h < 300) { r = x; g = 0; b = c } else { r = c; g = 0; b = x }
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0')
    return '#' + toHex(r) + toHex(g) + toHex(b)
  }

  // Design-Einstellungen speichern
  const handleDesignChange = (key: string, value: string) => {
    setDesignSettings(prev => ({ ...prev, [key]: value }))
  }

  // Vordefinierte Themes (default = Orange)
  const themes = {
    default: {
      accentColor: '#ff8c42',
      backgroundColor1: '#1a0f0a',
      backgroundColor2: '#2d1a14',
      backgroundColor3: '#3d2419',
      textColor: '#fff5f0',
      mutedColor: '#d4a574',
      cardBg1: 'rgba(45, 26, 20, 0.95)',
      cardBg2: 'rgba(26, 15, 10, 0.92)'
    },
    warm: {
      accentColor: '#ff8c42',
      backgroundColor1: '#1a0f0a',
      backgroundColor2: '#2d1a14',
      backgroundColor3: '#3d2419',
      textColor: '#fff5f0',
      mutedColor: '#d4a574',
      cardBg1: 'rgba(45, 26, 20, 0.95)',
      cardBg2: 'rgba(26, 15, 10, 0.92)'
    },
    elegant: {
      accentColor: '#c9a961',
      backgroundColor1: '#0f0e0a',
      backgroundColor2: '#1a1814',
      backgroundColor3: '#25221e',
      textColor: '#f5f3f0',
      mutedColor: '#b8a68a',
      cardBg1: 'rgba(26, 24, 20, 0.95)',
      cardBg2: 'rgba(15, 14, 10, 0.92)'
    },
    modern: {
      accentColor: '#ff8c42',
      backgroundColor1: '#1a0f0a',
      backgroundColor2: '#2d1a14',
      backgroundColor3: '#3d2419',
      textColor: '#fff5f0',
      mutedColor: '#d4a574',
      cardBg1: 'rgba(45, 26, 20, 0.95)',
      cardBg2: 'rgba(26, 15, 10, 0.92)'
    }
  }

  const applyTheme = (themeName: keyof typeof themes) => {
    setDesignSettings(themes[themeName])
  }

  const [designSaveFeedback, setDesignSaveFeedback] = useState<'ok' | null>(null)
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(null)
  const pendingWelcomeFileRef = React.useRef<File | null>(null)

  const DESIGN_VARIANT_KEYS = isOeffentlichAdminContext()
    ? { a: 'k2-oeffentlich-design-variant-a', b: 'k2-oeffentlich-design-variant-b' } as const
    : { a: 'k2-design-variant-a', b: 'k2-design-variant-b' } as const
  const saveDesignVariant = (slot: 'a' | 'b') => {
    try {
      const json = JSON.stringify(designSettings)
      if (json.length >= 50000) { alert('Design zu groß zum Speichern.'); return }
      localStorage.setItem(DESIGN_VARIANT_KEYS[slot], json)
      alert('Variante ' + (slot === 'a' ? 'A' : 'B') + ' gespeichert. Mit „Anwenden“ wieder in den Entwurf laden – erst „Speichern“ übernimmt ins Design.')
    } catch (_) { alert('Speichern fehlgeschlagen.') }
  }
  const loadDesignVariant = (slot: 'a' | 'b') => {
    try {
      const raw = localStorage.getItem(DESIGN_VARIANT_KEYS[slot])
      if (raw && raw.length < 50000) {
        const next = JSON.parse(raw)
        if (next && typeof next === 'object') {
          setDesignSettings(next)
        }
        return
      }
    } catch (_) {}
    alert('Variante ' + (slot === 'a' ? 'A' : 'B') + ' ist noch nicht gespeichert.')
  }

  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedEventForDocument, setSelectedEventForDocument] = useState<string | null>(null)
  const [eventDocumentFile, setEventDocumentFile] = useState<File | null>(null)
  const [eventDocumentName, setEventDocumentName] = useState('')
  const [eventDocumentType, setEventDocumentType] = useState<'flyer' | 'plakat' | 'presseaussendung' | 'sonstiges'>('flyer')
  
  // Stammdaten – bei ök2-Kontext nur Musterdaten (keine Vermischung mit K2); K2 nutzt K2_STAMMDATEN_DEFAULTS
  const [martinaData, setMartinaData] = useState(() =>
    isOeffentlichAdminContext()
      ? { name: MUSTER_TEXTE.martina.name, email: MUSTER_TEXTE.martina.email || '', phone: MUSTER_TEXTE.martina.phone || '', category: 'malerei' as const, bio: MUSTER_TEXTE.artist1Bio, website: MUSTER_TEXTE.martina.website || '', vita: MUSTER_VITA_MARTINA }
      : {
          name: K2_STAMMDATEN_DEFAULTS.martina.name,
          category: 'malerei',
          bio: 'Martina bringt mit ihren Gemälden eine lebendige Vielfalt an Farben und Ausdruckskraft auf die Leinwand. ihre Werke spiegeln Jahre des Lernens, Experimentierens und der Leidenschaft für die Malerei wider.',
          email: K2_STAMMDATEN_DEFAULTS.martina.email,
          phone: K2_STAMMDATEN_DEFAULTS.martina.phone,
          website: K2_STAMMDATEN_DEFAULTS.martina.website || '',
          vita: ''
        }
  )
  const [georgData, setGeorgData] = useState(() =>
    isOeffentlichAdminContext()
      ? { name: MUSTER_TEXTE.georg.name, email: MUSTER_TEXTE.georg.email || '', phone: MUSTER_TEXTE.georg.phone || '', category: 'keramik' as const, bio: MUSTER_TEXTE.artist2Bio, website: MUSTER_TEXTE.georg.website || '', vita: MUSTER_VITA_GEORG }
      : {
          name: K2_STAMMDATEN_DEFAULTS.georg.name,
          category: 'keramik',
          bio: 'Georg verbindet in seiner Keramikarbeit technisches Können mit kreativer Gestaltung. Seine Arbeiten sind geprägt von Präzision und einer Liebe zum Detail, das Ergebnis von jahrzehntelanger Erfahrung.',
          email: K2_STAMMDATEN_DEFAULTS.georg.email,
          phone: K2_STAMMDATEN_DEFAULTS.georg.phone,
          website: K2_STAMMDATEN_DEFAULTS.georg.website || '',
          vita: ''
        }
  )
  const [galleryData, setGalleryData] = useState<any>(() =>
    isOeffentlichAdminContext()
      ? {
          name: 'Galerie Muster',
          subtitle: 'Malerei & Skulptur',
          description: MUSTER_TEXTE.gemeinsamText,
          address: MUSTER_TEXTE.gallery.address,
          city: (MUSTER_TEXTE.gallery as any).city || '',
          country: (MUSTER_TEXTE.gallery as any).country || '',
          phone: (MUSTER_TEXTE.gallery as any).phone || '',
          email: (MUSTER_TEXTE.gallery as any).email || '',
          website: MUSTER_TEXTE.gallery.website || '',
          internetadresse: MUSTER_TEXTE.gallery.internetadresse || '',
          openingHours: (MUSTER_TEXTE.gallery as any).openingHours || '',
          bankverbindung: (MUSTER_TEXTE.gallery as any).bankverbindung || '',
          adminPassword: '',
          soldArtworksDisplayDays: 30,
          welcomeImage: '',
          virtualTourImage: '',
          galerieCardImage: '',
          internetShopNotSetUp: true
        }
      : {
          name: K2_STAMMDATEN_DEFAULTS.gallery.name,
          subtitle: 'Kunst & Keramik',
          description: 'Gemeinsam eröffnen Martina und Georg nach über 20 Jahren kreativer Tätigkeit die K2 Galerie – ein Raum, wo Malerei und Keramik verschmelzen und Kunst zum Leben erwacht.',
          address: K2_STAMMDATEN_DEFAULTS.gallery.address,
          city: K2_STAMMDATEN_DEFAULTS.gallery.city,
          country: K2_STAMMDATEN_DEFAULTS.gallery.country,
          phone: K2_STAMMDATEN_DEFAULTS.gallery.phone,
          email: K2_STAMMDATEN_DEFAULTS.gallery.email,
          website: K2_STAMMDATEN_DEFAULTS.gallery.website,
          internetadresse: K2_STAMMDATEN_DEFAULTS.gallery.internetadresse || K2_STAMMDATEN_DEFAULTS.gallery.website,
          openingHours: K2_STAMMDATEN_DEFAULTS.gallery.openingHours,
          bankverbindung: K2_STAMMDATEN_DEFAULTS.gallery.bankverbindung,
          adminPassword: 'k2Galerie2026',
          soldArtworksDisplayDays: 30,
          welcomeImage: '',
          virtualTourImage: '',
          galerieCardImage: '',
          internetShopNotSetUp: true
        }
  )

  // Seitengestaltung (Willkommensseite & Galerie-Vorschau) – K2 vs. ök2 getrennt
  const [pageContent, setPageContent] = useState<PageContentGalerie>(() => getPageContentGalerie(isOeffentlichAdminContext() ? 'oeffentlich' : isVk2AdminContext() ? 'vk2' : undefined))
  const [videoUploadStatus, setVideoUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [videoUploadMsg, setVideoUploadMsg] = useState('')
  useEffect(() => {
    const pc = getPageContentGalerie(isOeffentlichAdminContext() ? 'oeffentlich' : undefined)
    // Wenn kein Bild im localStorage: aus gallery-data.json nachladen
    if (!pc.welcomeImage && !isOeffentlichAdminContext()) {
      fetch(`/gallery-data.json?_=${Date.now()}`)
        .then(r => r.json())
        .then(data => {
          if (data?.gallery?.welcomeImage) {
            setPageContent(prev => ({
              ...prev,
              welcomeImage: prev.welcomeImage || data.gallery.welcomeImage,
              galerieCardImage: prev.galerieCardImage || data.gallery.galerieCardImage || '',
              virtualTourImage: prev.virtualTourImage || data.gallery.virtualTourImage || '',
            }))
          }
        })
        .catch(() => {})
    } else {
      setPageContent(pc)
    }
  }, [])

  // Design-Vorschau = immer aktuelle gespeicherte Seite anzeigen (keine alten Daten)
  // Beim Wechsel in den Design-Tab: Seitentexte, Seitengestaltung und Design aus Speicher nachladen
  useEffect(() => {
    if (activeTab !== 'design') return
    const tenant = isOeffentlichAdminContext() ? 'oeffentlich' : isVk2AdminContext() ? 'vk2' : undefined
    setPageTextsState(getPageTexts(tenant))
    setPageContent(getPageContentGalerie(tenant))
    try {
      const key = getDesignStorageKey()
      const stored = localStorage.getItem(key)
      if (stored && stored.length > 0 && stored.length < 50000) {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === 'object' && (parsed.accentColor || parsed.backgroundColor1)) {
          const defaults = isOeffentlichAdminContext() ? OEF_DESIGN_DEFAULT : K2_ORANGE_DESIGN
          if (!isOeffentlichAdminContext() && isOldBlueDesign(parsed)) {
            setDesignSettings(K2_ORANGE_DESIGN)
          } else {
            setDesignSettings({
              accentColor: parsed.accentColor ?? (defaults as Record<string, string>).accentColor,
              backgroundColor1: parsed.backgroundColor1 ?? (defaults as Record<string, string>).backgroundColor1,
              backgroundColor2: parsed.backgroundColor2 ?? (defaults as Record<string, string>).backgroundColor2,
              backgroundColor3: parsed.backgroundColor3 ?? (defaults as Record<string, string>).backgroundColor3,
              textColor: parsed.textColor ?? (defaults as Record<string, string>).textColor,
              mutedColor: parsed.mutedColor ?? (defaults as Record<string, string>).mutedColor,
              cardBg1: parsed.cardBg1 ?? (defaults as Record<string, string>).cardBg1,
              cardBg2: parsed.cardBg2 ?? (defaults as Record<string, string>).cardBg2
            })
          }
        }
      }
    } catch (_) {}
  }, [activeTab])

  // URL-Parameter context (oeffentlich / vk2) in sessionStorage übernehmen
  // WICHTIG: Wenn kein context-Parameter → K2-Admin → sessionStorage löschen (verhindert "hängenbleiben" im ök2-Kontext)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const ctx = params.get('context')
      if (ctx === 'oeffentlich') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'oeffentlich')
      else if (ctx === 'vk2') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'vk2')
      else sessionStorage.removeItem(ADMIN_CONTEXT_KEY) // Kein context = K2, alten Kontext löschen
    } catch (_) {}
  }, [])

  // ök2: Lager-Tab nicht verfügbar. VK2: Sicherheit und Lager nicht – auf Stammdaten wechseln
  useEffect(() => {
    if (isOeffentlichAdminContext() && settingsSubTab === 'lager') setSettingsSubTab('stammdaten')
    if (isVk2AdminContext() && (settingsSubTab === 'lager' || settingsSubTab === 'sicherheit')) setSettingsSubTab('stammdaten')
  }, [settingsSubTab])

  // ök2: Verkaufte-Werke-Anzeige (Tage) aus k2-oeffentlich-galerie-settings laden
  useEffect(() => {
    if (!isOeffentlichAdminContext()) return
    try {
      const raw = localStorage.getItem('k2-oeffentlich-galerie-settings')
      if (raw) {
        const o = JSON.parse(raw)
        if (typeof o.soldArtworksDisplayDays === 'number') setSoldArtworksDisplayDaysOek2(o.soldArtworksDisplayDays)
      }
    } catch (_) {}
  }, [])

  // Stammdaten aus localStorage laden – bei ök2-Kontext aus k2-oeffentlich-stammdaten-*; bei VK2 aus k2-vk2-stammdaten
  useEffect(() => {
    if (isOeffentlichAdminContext()) return
    if (isVk2AdminContext()) return // VK2 lädt in separatem Effect
    let isMounted = true
    
    const timeoutId = setTimeout(() => {
      if (!isMounted) return
      
      try {
        // Einmalig: Wenn K2-Stammdaten leer sind, aber der Kunde in der Muster-Galerie schon etwas eingegeben hat → übernehmen
        const k2Martina = localStorage.getItem('k2-stammdaten-martina')
        const oefMartina = localStorage.getItem(KEY_OEF_STAMMDATEN_MARTINA)
        if ((!k2Martina || k2Martina.length < 10) && oefMartina && oefMartina.length > 0) {
          try {
            localStorage.setItem('k2-stammdaten-martina', oefMartina)
            const oefGeorg = localStorage.getItem(KEY_OEF_STAMMDATEN_GEORG)
            const oefGalerie = localStorage.getItem(KEY_OEF_STAMMDATEN_GALERIE)
            if (oefGeorg) localStorage.setItem('k2-stammdaten-georg', oefGeorg)
            if (oefGalerie) localStorage.setItem('k2-stammdaten-galerie', oefGalerie)
          } catch (_) {}
        }
        
        const storedMartina = localStorage.getItem('k2-stammdaten-martina')
        const d = K2_STAMMDATEN_DEFAULTS.martina
        let mergedMartina: any
        if (storedMartina && storedMartina.length < 100000) {
          const parsed = JSON.parse(storedMartina)
          mergedMartina = {
            ...parsed,
            name: (parsed.name && String(parsed.name).trim()) ? parsed.name : d.name,
            email: (parsed.email && String(parsed.email).trim()) ? parsed.email : d.email,
            phone: (parsed.phone && String(parsed.phone).trim()) ? parsed.phone : d.phone,
            website: (parsed.website && String(parsed.website).trim()) ? parsed.website : (d.website || '')
          }
          if (!mergedMartina.vita || typeof mergedMartina.vita !== 'string' || !mergedMartina.vita.trim()) {
            mergedMartina.vita = MUSTER_VITA_MARTINA
          }
        } else {
          mergedMartina = { name: d.name, email: d.email, phone: d.phone, website: d.website || '', category: 'malerei', bio: '', vita: MUSTER_VITA_MARTINA }
        }
        if (isMounted) setMartinaData(mergedMartina)
        // Nur Kontaktfelder reparieren – niemals komplette Stammdaten überschreiben (sonst gehen Adresse, Bio, Bilder verloren)
        if (storedMartina && storedMartina.length < 100000) {
          try {
            const prev = JSON.parse(storedMartina)
            const toWrite = { ...prev, name: mergedMartina.name, email: mergedMartina.email, phone: mergedMartina.phone, website: mergedMartina.website }
            localStorage.setItem('k2-stammdaten-martina', JSON.stringify(toWrite))
          } catch (_) {}
        }
      } catch (error) {
        console.error('Fehler beim Laden von Martina-Daten:', error)
      }
      
      if (!isMounted) return
      
      try {
        const storedGeorg = localStorage.getItem('k2-stammdaten-georg')
        const d = K2_STAMMDATEN_DEFAULTS.georg
        let mergedGeorg: any
        if (storedGeorg && storedGeorg.length < 100000) {
          const parsed = JSON.parse(storedGeorg)
          mergedGeorg = {
            ...parsed,
            name: (parsed.name && String(parsed.name).trim()) ? parsed.name : d.name,
            email: (parsed.email && String(parsed.email).trim()) ? parsed.email : d.email,
            phone: (parsed.phone && String(parsed.phone).trim()) ? parsed.phone : d.phone,
            website: (parsed.website && String(parsed.website).trim()) ? parsed.website : (d.website || '')
          }
          if (!mergedGeorg.vita || typeof mergedGeorg.vita !== 'string' || !mergedGeorg.vita.trim()) {
            mergedGeorg.vita = MUSTER_VITA_GEORG
          }
        } else {
          mergedGeorg = { name: d.name, email: d.email, phone: d.phone, website: d.website || '', category: 'keramik', bio: '', vita: MUSTER_VITA_GEORG }
        }
        if (isMounted) setGeorgData(mergedGeorg)
        if (storedGeorg && storedGeorg.length < 100000) {
          try {
            const prev = JSON.parse(storedGeorg)
            const toWrite = { ...prev, name: mergedGeorg.name, email: mergedGeorg.email, phone: mergedGeorg.phone, website: mergedGeorg.website }
            localStorage.setItem('k2-stammdaten-georg', JSON.stringify(toWrite))
          } catch (_) {}
        }
      } catch (error) {
        console.error('Fehler beim Laden von Georg-Daten:', error)
      }
      
      if (!isMounted) return
      
      try {
        const storedGallery = localStorage.getItem('k2-stammdaten-galerie')
        const g = K2_STAMMDATEN_DEFAULTS.gallery
        let data: any = null
        if (storedGallery) {
          try { data = JSON.parse(storedGallery) } catch (_) {}
        }
        let mergedGallery: any
        if (data && typeof data === 'object') {
          // Bestehende Daten behalten (Adresse, welcomeImage, virtualTourImage, soldArtworksDisplayDays, etc.) – nur leere Kontaktfelder aus Defaults füllen
          mergedGallery = {
            ...data,
            name: (data.name && String(data.name).trim()) ? data.name : g.name,
            phone: (data.phone && String(data.phone).trim()) ? data.phone : g.phone,
            email: (data.email && String(data.email).trim()) ? data.email : g.email,
            address: (data.address != null && String(data.address).trim()) ? data.address : (g.address || data.address),
            city: (data.city != null && String(data.city).trim()) ? data.city : (g.city || data.city),
            country: (data.country != null && String(data.country).trim()) ? data.country : (g.country || data.country),
            website: (data.website != null && String(data.website).trim()) ? data.website : (g.website || data.website || ''),
            internetadresse: (data.internetadresse != null && String(data.internetadresse).trim()) ? data.internetadresse : (data.website || g.internetadresse || ''),
            openingHours: (data.openingHours != null && String(data.openingHours).trim()) ? data.openingHours : (g.openingHours || data.openingHours || ''),
            bankverbindung: (data.bankverbindung != null && String(data.bankverbindung).trim()) ? data.bankverbindung : (g.bankverbindung || data.bankverbindung || ''),
            soldArtworksDisplayDays: typeof data.soldArtworksDisplayDays === 'number' ? data.soldArtworksDisplayDays : 30
          }
        } else {
          mergedGallery = {
            name: g.name,
            address: g.address,
            city: g.city,
            country: g.country,
            phone: g.phone,
            email: g.email,
            website: g.website || '',
            internetadresse: g.internetadresse || '',
            openingHours: g.openingHours || '',
            bankverbindung: g.bankverbindung || '',
            adminPassword: 'k2Galerie2026',
            soldArtworksDisplayDays: 30,
            welcomeImage: '',
            virtualTourImage: '',
            galerieCardImage: '',
            internetShopNotSetUp: data.internetShopNotSetUp !== false
          }
        }
        if (isMounted) setGalleryData(mergedGallery)
        // Nur Kontakt/Name reparieren – niemals welcomeImage, virtualTourImage, Adresse etc. überschreiben
        if (data && typeof data === 'object') {
          try {
            const toWrite = {
              ...data,
              name: mergedGallery.name,
              phone: mergedGallery.phone,
              email: mergedGallery.email,
              address: mergedGallery.address,
              city: mergedGallery.city,
              country: mergedGallery.country,
              website: mergedGallery.website,
              internetadresse: mergedGallery.internetadresse,
              openingHours: mergedGallery.openingHours,
              bankverbindung: mergedGallery.bankverbindung
            }
            localStorage.setItem('k2-stammdaten-galerie', JSON.stringify(toWrite))
          } catch (_) {}
        }
      } catch (error) {
        console.error('Fehler beim Laden der Galerie-Daten:', error)
        if (isMounted) {
          const fallback = { ...K2_STAMMDATEN_DEFAULTS.gallery, adminPassword: 'k2Galerie2026', soldArtworksDisplayDays: 30, welcomeImage: '', virtualTourImage: '', galerieCardImage: '', internetShopNotSetUp: true }
          setGalleryData(fallback)
        }
      }
    }, 1500) // Starke Verzögerung (Crash-Schutz: kein schweres Parsen direkt nach Reopen)
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  // VK2-Stammdaten aus localStorage laden (nur bei VK2-Kontext)
  useEffect(() => {
    if (!isVk2AdminContext()) return
    let isMounted = true
    const t = setTimeout(() => {
      if (!isMounted) return
      try {
        const raw = localStorage.getItem(KEY_VK2_STAMMDATEN)
        if (raw && raw.length < 500000) {
          const parsed = JSON.parse(raw) as Partial<Vk2Stammdaten>
          const parsedMitglieder: Vk2Mitglied[] = Array.isArray(parsed.mitglieder) ? parsed.mitglieder.map((m: any) => typeof m === 'string' ? { name: m, oeffentlichSichtbar: true } : { name: m?.name ?? '', email: m?.email, lizenz: m?.lizenz, typ: m?.typ, mitgliedFotoUrl: m?.mitgliedFotoUrl, imageUrl: m?.imageUrl, phone: m?.phone, website: m?.website, seit: m?.seit, strasse: m?.strasse, plz: m?.plz, ort: m?.ort, land: m?.land, geburtsdatum: m?.geburtsdatum, eintrittsdatum: m?.eintrittsdatum ?? m?.seit, oeffentlichSichtbar: m?.oeffentlichSichtbar !== false, bankKontoinhaber: m?.bankKontoinhaber, bankIban: m?.bankIban, bankBic: m?.bankBic, bankName: m?.bankName }) : []
          const merged: Vk2Stammdaten = {
            verein: { ...VK2_STAMMDATEN_DEFAULTS.verein, ...parsed.verein },
            vorstand: { ...VK2_STAMMDATEN_DEFAULTS.vorstand, ...parsed.vorstand },
            vize: { ...VK2_STAMMDATEN_DEFAULTS.vize, ...parsed.vize },
            kassier: { ...VK2_STAMMDATEN_DEFAULTS.kassier, ...parsed.kassier },
            schriftfuehrer: { ...VK2_STAMMDATEN_DEFAULTS.schriftfuehrer, ...parsed.schriftfuehrer },
            beisitzer: parsed.beisitzer ? { ...VK2_STAMMDATEN_DEFAULTS.beisitzer!, ...parsed.beisitzer } : undefined,
            // Wenn keine Mitglieder gespeichert: Muster-Mitglieder als Fallback
            mitglieder: parsedMitglieder.length > 0 ? parsedMitglieder : USER_LISTE_FUER_MITGLIEDER,
            mitgliederNichtRegistriert: Array.isArray(parsed.mitgliederNichtRegistriert) ? parsed.mitgliederNichtRegistriert : [],
          }
          setVk2Stammdaten(merged)
        } else {
          // Kein gespeicherter Stand → Defaults + Muster-Mitglieder verwenden
          setVk2Stammdaten({ ...VK2_STAMMDATEN_DEFAULTS, mitglieder: USER_LISTE_FUER_MITGLIEDER })
        }
      } catch (_) {
        setVk2Stammdaten({ ...VK2_STAMMDATEN_DEFAULTS, mitglieder: USER_LISTE_FUER_MITGLIEDER })
      }
    }, 300)
    return () => { isMounted = false; clearTimeout(t) }
  }, [])

  // Registrierungs-Config (Lizenztyp, Vereinsmitglied, Empfehlung) aus localStorage laden
  useEffect(() => {
    let isMounted = true
    const t = setTimeout(() => {
      if (!isMounted) return
      try {
        const key = isVk2AdminContext() ? KEY_VK2_REGISTRIERUNG : isOeffentlichAdminContext() ? KEY_OEF_REGISTRIERUNG : KEY_REGISTRIERUNG
        const raw = localStorage.getItem(key)
        if (raw && raw.length < 5000) {
          const parsed = JSON.parse(raw) as Partial<RegistrierungConfig>
          const migrated = { ...REGISTRIERUNG_CONFIG_DEFAULTS, ...parsed }
          if ((parsed as { lizenztyp?: string }).lizenztyp === 'vollversion') migrated.lizenztyp = 'pro'
          setRegistrierungConfig(migrated)
        }
      } catch (_) {}
    }, 200)
    return () => { isMounted = false; clearTimeout(t) }
  }, [])

  const saveRegistrierungConfig = () => {
    let cfg = { ...registrierungConfig }
    const praefix = getLizenznummerPraefix(cfg)
    const match = cfg.lizenznummer?.match(/^(B|P|VB|VP|KF)-(\d{4})-(\d{4})$/)
    const needsNew = !match || match[1] !== praefix
    // Lizenznummer beim ersten Speichern oder bei Präfix-Änderung vom K2-System vergeben
    if (needsNew) {
      cfg = { ...cfg, lizenznummer: `${praefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` }
      setRegistrierungConfig(cfg)
    }
    const key = isVk2AdminContext() ? KEY_VK2_REGISTRIERUNG : isOeffentlichAdminContext() ? KEY_OEF_REGISTRIERUNG : KEY_REGISTRIERUNG
    localStorage.setItem(key, JSON.stringify(cfg))
  }

  /** Speichert alle aktuellen Admin-Daten in localStorage (K2/ök2/VK2-Key), damit „Seiten prüfen“ die neuesten Änderungen anzeigt. Design wird hier nicht mitgeschrieben – nur über „Speichern“ im Design-Tab. */
  const saveAllForVorschau = () => {
    try {
      if (isVk2AdminContext()) {
        localStorage.setItem(KEY_VK2_STAMMDATEN, JSON.stringify(vk2Stammdaten))
      } else if (!isOeffentlichAdminContext()) {
        const martinaStr = JSON.stringify(martinaData)
        const georgStr = JSON.stringify(georgData)
        const galleryStr = JSON.stringify(galleryData)
        if (martinaStr.length < 100000) localStorage.setItem('k2-stammdaten-martina', martinaStr)
        if (georgStr.length < 100000) localStorage.setItem('k2-stammdaten-georg', georgStr)
        if (galleryStr.length < 5000000) localStorage.setItem('k2-stammdaten-galerie', galleryStr)
      }
      // Werke, Events, Dokumente: Kontext-Key (K2 = k2-artworks, ök2 = k2-oeffentlich-artworks)
      const artworksStr = JSON.stringify(allArtworks)
      if (artworksStr.length < 10000000) localStorage.setItem(getArtworksKey(), artworksStr)
      localStorage.setItem(getEventsKey(), JSON.stringify(events))
      localStorage.setItem(getDocumentsKey(), JSON.stringify(documents))
      setPageTexts(pageTexts, isOeffentlichAdminContext() ? 'oeffentlich' : undefined)
      setPageContentGalerie(pageContent, isOeffentlichAdminContext() ? 'oeffentlich' : undefined)
    } catch (e) {
      console.warn('Vorschau-Speichern:', e)
    }
  }

  // Stammdaten speichern - bei ök2-Kontext nicht in echte K2-Daten schreiben; bei VK2 in k2-vk2-stammdaten
  const saveStammdaten = () => {
    return new Promise<void>((resolve, reject) => {
      if (isOeffentlichAdminContext()) {
        alert('Demo-Modus (ök2): Es werden keine echten Daten gespeichert. Wechsle zur K2-Galerie für echte Stammdaten.')
        resolve()
        return
      }
      if (isVk2AdminContext()) {
        try {
          localStorage.setItem(KEY_VK2_STAMMDATEN, JSON.stringify(vk2Stammdaten))
          resolve()
        } catch (e) {
          reject(e)
        }
        return
      }
      const timeoutId = setTimeout(() => {
        reject(new Error('Speichern dauerte zu lange'))
      }, 5000) // Max 5 Sekunden
      
      try {
        // Stammdaten Galerie: Bilder nicht mitschreiben (leben nur in Seitengestaltung k2-page-content-galerie)
        const { welcomeImage: _w, galerieCardImage: _c, virtualTourImage: _v, ...galleryStammdaten } = galleryData
        const galleryToSave = galleryStammdaten as typeof galleryData

        // Prüfe Größe bevor speichern
        const martinaStr = JSON.stringify(martinaData)
        const georgStr = JSON.stringify(georgData)
        const galleryStr = JSON.stringify(galleryToSave)

        if (martinaStr.length > 100000 || georgStr.length > 100000 || galleryStr.length > 5000000) {
          clearTimeout(timeoutId)
          reject(new Error('Daten zu groß zum Speichern'))
          return
        }

        localStorage.setItem('k2-stammdaten-martina', martinaStr)
        localStorage.setItem('k2-stammdaten-georg', georgStr)
        localStorage.setItem('k2-stammdaten-galerie', galleryStr)
        
        clearTimeout(timeoutId)
        resolve()
      } catch (error) {
        clearTimeout(timeoutId)
        reject(error)
      }
    })
  }

  // Mobile Version veröffentlichen - Daten speichern + JSON-Datei erstellen + Vercel öffnen
  const [isDeploying, setIsDeploying] = React.useState(false)
  const [publishErrorMsg, setPublishErrorMsg] = React.useState<string | null>(null)
  const [publishSuccessModal, setPublishSuccessModal] = React.useState<{ size: number; version: number } | null>(null)
  
  // SICHERHEIT: Stelle sicher dass isDeploying nach 60 Sekunden zurückgesetzt wird
  React.useEffect(() => {
    if (isDeploying) {
      const safetyTimeout = setTimeout(() => {
        if (isMountedRef.current) {
          console.warn('⚠️ isDeploying wurde nach 60 Sekunden automatisch zurückgesetzt')
          setIsDeploying(false)
        }
      }, 60000) // 60 Sekunden Safety-Timeout
      
      return () => {
        clearTimeout(safetyTimeout)
        // Kein setState im Cleanup – verhindert Crash/Warning bei Unmount
      }
    }
  }, [isDeploying])
  
  // KEINE automatische Prüfung mehr - verursacht Abstürze!
  // Verwende nur den manuellen "🔍 Vercel-Status" Button
  
  // Manueller Vercel-Check-Button
  const [checkingVercel, setCheckingVercel] = React.useState(false)
  
  // MINIMALE Vercel-Prüfung - MIT TIMEOUT UND CRASH-SCHUTZ (setState nur wenn gemountet)
  const manualCheckVercel = () => {
    if (checkingVercel) return
    
    setCheckingVercel(true)
    
    // Timeout nach 10 Sekunden - verhindert Hänger
    const timeoutId = setTimeout(() => {
      if (!isMountedRef.current) return
      setCheckingVercel(false)
      alert('⚠️ Vercel-Check:\n\nTimeout nach 10 Sekunden\n\nPrüfe manuell: https://vercel.com/dashboard → Projekt k2-galerie')
    }, 10000)
    
    try {
      // Fetch mit Timeout
      const controller = new AbortController()
      const fetchTimeout = setTimeout(() => controller.abort(), 8000) // 8 Sekunden Timeout
      
      fetch('https://k2-galerie.vercel.app/gallery-data.json?t=' + Date.now(), {
        signal: controller.signal
      })
        .then(response => {
          clearTimeout(fetchTimeout)
          clearTimeout(timeoutId)
          if (response.ok) {
            return response.json()
          }
          throw new Error('HTTP ' + response.status)
        })
        .then(data => {
          if (!isMountedRef.current) return
          const exportedAt = data?.exportedAt || 'nicht gefunden'
          alert(`✅ Vercel-Status:\n\nDatei verfügbar\nExportedAt: ${exportedAt}\n\nPrüfe: https://vercel.com/dashboard → k2-galerie`)
        })
        .catch(err => {
          clearTimeout(fetchTimeout)
          clearTimeout(timeoutId)
          if (!isMountedRef.current) return
          if (err.name === 'AbortError') {
            alert('⚠️ Vercel-Check:\n\nTimeout - Anfrage dauerte zu lange\n\nPrüfe: https://vercel.com/dashboard → k2-galerie')
          } else {
            alert('⚠️ Vercel-Check:\n\nDatei nicht verfügbar\n\nPrüfe: https://vercel.com/dashboard → k2-galerie')
          }
        })
        .finally(() => {
          clearTimeout(fetchTimeout)
          clearTimeout(timeoutId)
          if (isMountedRef.current) setCheckingVercel(false)
        })
    } catch (error) {
      clearTimeout(timeoutId)
      if (isMountedRef.current) setCheckingVercel(false)
      alert('⚠️ Vercel-Check Fehler:\n\n' + (error instanceof Error ? error.message : String(error)))
    }
  }
  
  // KEINE automatische Prüfung mehr - verursacht Abstürze!
  // Verwende nur den manuellen "🔍 Vercel-Status" Button
  
  /** Vollbackup (Stammdaten + Werke + Eventplanung + Öffentlichkeitsarbeit) als JSON herunterladen – für Sicherung */
  const downloadFullBackup = () => {
    try {
      const getItemSafe = (key: string, def: any) => {
        try {
          const item = localStorage.getItem(key)
          if (!item || item.length > 1000000) return def
          return JSON.parse(item)
        } catch { return def }
      }
      const eventsForBackup = (Array.isArray(events) && events.length > 0) ? events : (getItemSafe('k2-events', []) || [])
      const documentsForBackup = (Array.isArray(documents) && documents.length > 0) ? documents : (getItemSafe('k2-documents', []) || [])
      const customersForBackup = getItemSafe('k2-customers', []) || []
      let pageContentGalerieRaw: string | undefined
      try {
        const raw = localStorage.getItem('k2-page-content-galerie')
        if (raw && raw.length < 6 * 1024 * 1024) pageContentGalerieRaw = raw
      } catch (_) {}
      const payload = {
        martina: martinaData,
        georg: georgData,
        gallery: galleryData,
        artworks: allArtworks,
        events: eventsForBackup,
        documents: documentsForBackup,
        customers: Array.isArray(customersForBackup) ? customersForBackup : [],
        designSettings: getItemSafe(getDesignStorageKey(), {}),
        pageTexts: getItemSafe('k2-page-texts', null),
        pageContentGalerie: pageContentGalerieRaw,
        exportedAt: new Date().toISOString(),
        backupLabel: 'K2 Vollbackup (Stammdaten, Werke, Eventplanung, Öffentlichkeitsarbeit, Kunden, Seitengestaltung)'
      }
      const json = JSON.stringify(payload, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `k2-vollbackup-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 200)
      const customersCount = Array.isArray(customersForBackup) ? customersForBackup.length : 0
      alert(`✅ Vollbackup heruntergeladen.\n\nEnthält: Stammdaten, ${allArtworks.length} Werke, ${eventsForBackup.length} Events, ${documentsForBackup.length} Dokumente, ${customersCount} Kunden.\n\nDatei lokal aufbewahren – bei Datenverlust kann sie im Admin wieder eingespielt werden.`)
    } catch (e) {
      alert('Fehler beim Erstellen des Backups: ' + (e instanceof Error ? e.message : String(e)))
    }
  }
  
  const publishMobile = () => {
    if (isDeploying) return
    if (isOeffentlichAdminContext()) {
      alert('Veröffentlichen ist nur in der K2-Galerie verfügbar. Wechsle zur K2-Galerie, um die echte Galerie zu veröffentlichen.')
      return
    }
    if (!isMountedRef.current) {
      console.warn('⚠️ publishMobile: Component ist unmounted')
      return
    }
    setIsDeploying(true)
    
    // KOMPLETT NEUE LÖSUNG: Web Worker für JSON.stringify um UI nicht zu blockieren
    const executeExport = () => {
      try {
        // Minimale Datenmenge - nur das Nötigste
        const getItemSafe = (key: string, defaultValue: any) => {
          try {
            const item = localStorage.getItem(key)
            if (!item || item.length > 1000000) return defaultValue // Max 1MB pro Item
            return JSON.parse(item)
          } catch {
            return defaultValue
          }
        }
        
        // SEHR aggressive Begrenzung um Hänger zu vermeiden
        // KRITISCH: Lade ALLE Werke inkl. Mobile-Werke für Synchronisation! Key = Kontext (K2 vs. ök2)
        const artworksKey = getArtworksKey()
        let artworks = getItemSafe(artworksKey, [])
        
        // WICHTIG: Prüfe ob Werke vorhanden sind
        if (!Array.isArray(artworks) || artworks.length === 0) {
          console.warn('⚠️ WARNUNG: Keine Werke gefunden in localStorage!')
          console.log('localStorage', artworksKey + ':', localStorage.getItem(artworksKey)?.substring(0, 200))
          
          // Versuche alternative Methode
          try {
            const stored = localStorage.getItem(artworksKey)
            if (stored) {
              artworks = JSON.parse(stored)
              console.log('✅ Werke geladen via alternative Methode:', artworks.length)
            }
          } catch (e) {
            console.error('❌ Fehler beim Laden der Werke:', e)
          }
        }
        
        // WICHTIG: Prüfe ob Mobile-Werke vorhanden sind und stelle sicher dass sie mit exportiert werden
        const mobileWorks = artworks.filter((a: any) => a.createdOnMobile || a.updatedOnMobile)
        if (mobileWorks.length > 0) {
          console.log(`📱 ${mobileWorks.length} Mobile-Werke werden mit exportiert:`, mobileWorks.map((a: any) => a.number || a.id).join(', '))
        }
        
        // WICHTIG: Export nur wenn irgendwo Werke sind (State oder localStorage)
        const _artworksCheck = getItemSafe(artworksKey, [])
        const hasArtworksInState = Array.isArray(artworks) && artworks.length > 0
        const hasArtworksInStorage = Array.isArray(_artworksCheck) && _artworksCheck.length > 0
        if (!hasArtworksInState && !hasArtworksInStorage) {
          if (isMountedRef.current) setIsDeploying(false)
          alert('⚠️ KEINE WERKE GEFUNDEN!\n\nBitte zuerst Werke speichern bevor veröffentlicht wird.\n\n📋 Prüfe:\n1. Sind Werke in "Werke verwalten" vorhanden?\n2. Werden Werke korrekt gespeichert?\n3. Prüfe Browser-Konsole für Fehler')
          return
        }
        
        // REGEL: Beim Veröffentlichen immer den aktuellen Admin-State verwenden (was du siehst, geht raus).
        // Fallback localStorage, dann Merge – keine halbe Lieferung. Alle geänderten Daten müssen mit.
        const exportedAt = new Date().toISOString()
        const currentVersion = parseInt(localStorage.getItem('k2-data-version') || '0')
        const newVersion = currentVersion + 1
        localStorage.setItem('k2-data-version', newVersion.toString())

        const martinaStored = getItemSafe('k2-stammdaten-martina', {})
        const georgStored = getItemSafe('k2-stammdaten-georg', {})
        const galleryStamm = getItemSafe('k2-stammdaten-galerie', {})
        const oeffentlich = isOeffentlichAdminContext()
        const pageContent = getPageContentGalerie(oeffentlich ? 'oeffentlich' : undefined)
        const eventsStored = getItemSafe(getEventsKey(), []) || []
        const documentsStored = getItemSafe(getDocumentsKey(), []) || []
        const artworksStored = getItemSafe(getArtworksKey(), []) || []
        const designStored = getItemSafe(getDesignStorageKey(), {})
        const pageTextsStored = getItemSafe(oeffentlich ? 'k2-oeffentlich-page-texts' : 'k2-page-texts', null)

        const martinaExport = (martinaData && typeof martinaData === 'object' && Object.keys(martinaData).length > 0) ? { ...martinaStored, ...martinaData } : martinaStored
        const georgExport = (georgData && typeof georgData === 'object' && Object.keys(georgData).length > 0) ? { ...georgStored, ...georgData } : georgStored
        const galleryMerged = { ...galleryStamm, ...(galleryData || {}) }
        const galleryExport = {
          ...galleryMerged,
          // pageContent hat Priorität – dort landen die per Admin hochgeladenen Bilder
          welcomeImage: pageContent.welcomeImage || galleryData?.welcomeImage || galleryStamm.welcomeImage || '',
          galerieCardImage: pageContent.galerieCardImage || galleryData?.galerieCardImage || galleryStamm.galerieCardImage || '',
          virtualTourImage: pageContent.virtualTourImage || galleryData?.virtualTourImage || galleryStamm.virtualTourImage || ''
        }
        const designExport = (designSettings && typeof designSettings === 'object' && Object.keys(designSettings).length > 0) ? designSettings : designStored
        const pageTextsExport = (pageTexts != null && typeof pageTexts === 'object') ? pageTexts : pageTextsStored
        const eventsMerged = Array.isArray(events) && events.length > 0 ? events : eventsStored
        const documentsMerged = Array.isArray(documents) && documents.length > 0 ? documents : documentsStored
        const maxList = 100
        const eventsForExport = Array.isArray(eventsMerged) ? eventsMerged.slice(0, maxList) : []
        const documentsForExport = Array.isArray(documentsMerged) ? documentsMerged.slice(0, maxList) : []
        const artworksState = Array.isArray(artworks) ? artworks : []
        const artworksById = new Map<string, any>()
        artworksStored.forEach((a: any) => { const k = a?.number || a?.id; if (k) artworksById.set(String(k), a) })
        artworksState.forEach((a: any) => { const k = a?.number || a?.id; if (k) artworksById.set(String(k), a) })
        const artworksForExport = sortArtworksNewestFirst(Array.from(artworksById.values()))

        const data = {
          martina: martinaExport,
          georg: georgExport,
          gallery: galleryExport,
          artworks: artworksForExport,
          events: eventsForExport,
          documents: documentsForExport,
          designSettings: designExport,
          pageTexts: pageTextsExport,
          exportedAt: exportedAt,
          version: newVersion,
          buildId: `${Date.now()}-${Math.random().toString(36).substring(7)}`
        }
        
        // WICHTIG: Prüfe nochmal ob Werke im Export vorhanden sind
        if (!data.artworks || data.artworks.length === 0) {
          console.error('❌ FEHLER: Keine Werke im Export-Objekt!', {
            artworksCount: artworks.length,
            dataArtworksCount: data.artworks.length,
            dataKeys: Object.keys(data)
          })
          if (isMountedRef.current) setIsDeploying(false)
          alert('⚠️ FEHLER: Keine Werke im Export!\n\nBitte prüfe Browser-Konsole für Details.')
          return
        }
        
        console.log(`✅ Export vorbereitet: ${data.artworks.length} Werke werden exportiert`)
        
        // JSON.stringify in separatem Frame mit Progress-Check
        const stringifyData = () => {
          try {
            const json = JSON.stringify(data)
            if (json.length > 5000000) { // Max 5MB
              if (isMountedRef.current) setIsDeploying(false)
              alert('⚠️ Daten zu groß. Bitte reduziere die Anzahl der Werke.')
              return
            }
            
            // Versuche direkt in public Ordner zu schreiben über API
            // WICHTIG: Nur EINMAL aufrufen, nicht mehrfach!
            // MIT TIMEOUT-Schutz (30 Sekunden)
            const controller = new AbortController()
            const timeoutId = setTimeout(() => {
              controller.abort()
              if (isMountedRef.current) setIsDeploying(false)
              alert('⚠️ Speichern dauert gerade zu lange.\n\nBitte kurz warten und nochmal auf „Speichern“ klicken.\nFalls es wieder passiert: Bitte dem Assistenten Bescheid geben.')
            }, 30000)
            
            let timeoutCleared = false
            fetch('/api/write-gallery-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: json,
              signal: controller.signal
            })
            .then(response => {
              if (!timeoutCleared) {
                clearTimeout(timeoutId)
                timeoutCleared = true
              }
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
              }
              return response.json()
            })
            .then(result => {
              // Timeout bereits gelöscht
              
              if (result.success) {
                // ANSI-Escape-Codes entfernen (033/034 = Farben aus git-push Script)
                const stripAnsi = (s: string) => String(s)
                  .replace(/\x1b\[[0-9;]*[a-zA-Z]?/g, '')
                  .replace(/[\u001b\u009b]\[[0-9;]*[a-zA-Z]?/g, '')
                  .replace(/\[0?;?3[0-9]m/g, '')  // orphaned ";33m" ";34m" etc
                  .replace(/\r/g, '')
                const gitOutput = stripAnsi(result.git?.output || '')
                const gitError = stripAnsi(result.git?.error || '')
                const gitSuccess = result.git?.success !== false // Default true wenn nicht gesetzt
                const gitExitCode = result.git?.exitCode || 0
                
                console.log('🔍 Git Push Ergebnis:', {
                  gitSuccess,
                  gitExitCode,
                  gitOutputLength: gitOutput.length,
                  gitErrorLength: gitError.length,
                  gitOutputPreview: gitOutput.substring(0, 300),
                  gitErrorPreview: gitError.substring(0, 300),
                  fullResult: result.git
                })
                
                // WICHTIG: Setze isDeploying IMMER auf false, auch bei Fehlern!
                // Das verhindert dass die Seite hängen bleibt
                setIsDeploying(false)
                
                // WICHTIG: Prüfe zuerst ob gitSuccess explizit false ist
                // Das ist die zuverlässigste Quelle
                if (!gitSuccess || gitExitCode !== 0) {
                  // Git push fehlgeschlagen - zeige IMMER Fehlermeldung
                  const gitExitCodeStr = gitExitCode !== 0 ? `\nExit Code: ${gitExitCode}` : ''
                  const gitOutputFull = gitOutput || ''
                  const gitErrorFull = gitError || 'Git Push fehlgeschlagen (keine Details verfügbar)'
                  
                  // Vollständige Fehlermeldung zusammenstellen
                  let fullErrorMsg = gitErrorFull
                  
                  // Zeige Output IMMER wenn vorhanden
                  if (gitOutputFull && gitOutputFull.trim().length > 0) {
                    fullErrorMsg += `\n\n📋 SCRIPT OUTPUT:\n${gitOutputFull.substring(0, 2000)}`
                  }
                  
                  if (gitExitCodeStr) {
                    fullErrorMsg += gitExitCodeStr
                  }
                  
                  console.error('❌ Git Push Fehler Details:', {
                    exitCode: gitExitCode,
                    error: gitErrorFull,
                    output: gitOutputFull,
                    fullResult: result.git,
                    resultSize: result.size,
                    artworksCount: result.artworksCount
                  })
                  
                  // Zeige Fehlermeldung mit Kopier-Button (für Mobile: an Cursor schicken)
                  const msg = `⚠️ Galerie konnte nicht veröffentlicht werden.\n\nBitte nochmal auf Speichern klicken. Falls es wieder nicht klappt: Bitte dem Assistenten Bescheid geben.`
                  setPublishErrorMsg(msg)
                  return
                }
                
                // Prüfe ob git push wirklich erfolgreich war - ZUSÄTZLICHE PRÜFUNG
                // WICHTIG: Prüfe auf verschiedene Erfolgs-Indikatoren
                const hasSuccessMessage = gitOutput.includes('git push erfolgreich') || 
                                         gitOutput.includes('✅✅✅ Git Push erfolgreich') ||
                                         gitOutput.includes('To https://') ||
                                         gitOutput.includes('Enumerating objects') ||
                                         gitOutput.includes('Counting objects') ||
                                         gitOutput.includes('Writing objects') ||
                                         gitOutput.includes('remote:')
                
                const hasError = gitError.includes('GIT PUSH FEHLER') ||
                               gitError.includes('FEHLER') ||
                               gitError.toLowerCase().includes('error') ||
                               gitError.toLowerCase().includes('failed') ||
                               gitError.toLowerCase().includes('authentication') ||
                               gitError.toLowerCase().includes('credential') ||
                               gitError.toLowerCase().includes('denied') ||
                               gitError.toLowerCase().includes('fehlgeschlagen')
                
                // Prüfe ob Fehler vorhanden ist
                if (hasError || (gitError && gitError.trim().length > 0)) {
                  // Fehler gefunden - zeige Fehlermeldung
                  const gitExitCodeStr = gitExitCode !== 0 ? `\nExit Code: ${gitExitCode}` : ''
                  let fullErrorMsg = gitError
                  
                  if (gitOutput && gitOutput.trim().length > 0) {
                    fullErrorMsg += `\n\n📋 SCRIPT OUTPUT:\n${gitOutput.substring(0, 1500)}`
                  }
                  
                  if (gitExitCodeStr) {
                    fullErrorMsg += gitExitCodeStr
                  }
                  
                  console.error('❌ Git Push Fehler erkannt:', {
                    hasError,
                    gitError,
                    gitOutput,
                    exitCode: gitExitCode
                  })
                  
                  const msg = `⚠️ Galerie konnte nicht veröffentlicht werden.\n\nBitte nochmal auf Speichern klicken. Falls es wieder nicht klappt: Bitte dem Assistenten Bescheid geben.`
                  setPublishErrorMsg(msg)
                  return
                }
                
                // Erfolg - zeige Erfolgsmeldung
                if (hasSuccessMessage || gitSuccess) {
                  // WICHTIG: Erhöhe Versionsnummer für Cache-Busting
                  const currentVersion = parseInt(localStorage.getItem('k2-data-version') || '0')
                  const newVersion = currentVersion + 1
                  localStorage.setItem('k2-data-version', newVersion.toString())
                  
                  // Zeige Modal mit Button statt confirm+window.open (Popup-Blocker umgehen)
                  // Nutzer klickt Button → window.open ist direkt user-initiiert → kein Block
                  setPublishSuccessModal({ size: result.size, version: newVersion })
                } else {
                  // Unklarer Status - zeige Warnung
                  console.warn('⚠️ Unklarer Git Push Status:', {
                    gitSuccess,
                    gitExitCode,
                    gitOutput,
                    gitError
                  })
                  
                  const msg = `⚠️ Speichern möglicherweise nicht abgeschlossen.\n\nBitte Seite neu laden und nochmal auf Speichern klicken.`
                  setPublishErrorMsg(msg)
                }
              } else {
                throw new Error(result.error || 'Unbekannter Fehler')
              }
            })
            .catch(error => {
              // WICHTIG: Setze isDeploying IMMER auf false bei Fehlern!
              setIsDeploying(false)
              
              if (!timeoutCleared) {
                clearTimeout(timeoutId)
                timeoutCleared = true
              }
              
              // Prüfe ob es ein Timeout war
              if (error.name === 'AbortError') {
                alert('⚠️ Speichern dauert zu lange.\n\nBitte kurz warten und nochmal auf „Speichern“ klicken.')
                return
              }
              
              // Fallback: Download falls API nicht funktioniert (Server läuft nicht)
              try {
                const blob = new Blob([json], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = 'gallery-data.json'
                link.style.display = 'none'
                document.body.appendChild(link)
                link.click()
                
                // WICHTIG: isDeploying SOFORT zurücksetzen, nicht erst nach Timeout! - NUR wenn gemountet
                if (isMountedRef.current) setIsDeploying(false)
                
                setTimeout(() => {
                  try {
                    document.body.removeChild(link)
                    URL.revokeObjectURL(url)
                  } catch {}
                  alert('⚠️ Automatisches Speichern nicht möglich (Server nicht aktiv).\n\nBitte dem Assistenten Bescheid geben – einmalige Einrichtung nötig.')
                }, 100)
              } catch (downloadError) {
                if (isMountedRef.current) setIsDeploying(false)
                alert('❌ Fehler:\n\nAPI nicht verfügbar UND Download fehlgeschlagen\n\n' + (error instanceof Error ? error.message : String(error)))
              }
            })
            .finally(() => {
              // SICHERHEIT: Stelle sicher dass isDeploying IMMER zurückgesetzt wird - NUR wenn gemountet
              setTimeout(() => {
                if (isMountedRef.current) setIsDeploying(false)
              }, 100)
            })
          } catch (e) {
            if (isMountedRef.current) setIsDeploying(false)
            alert('Fehler: ' + (e instanceof Error ? e.message : String(e)))
          }
        }
        
        // Verwende requestIdleCallback wenn verfügbar, sonst setTimeout
        if (typeof window.requestIdleCallback !== 'undefined') {
          window.requestIdleCallback(stringifyData, { timeout: 5000 })
        } else {
          setTimeout(stringifyData, 100)
        }
      } catch (error) {
        if (isMountedRef.current) setIsDeploying(false)
        alert('Fehler: ' + (error instanceof Error ? error.message : String(error)))
      }
    }
    
    // Starte Export nach kurzer Verzögerung - MIT Cleanup
    const executeTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        executeExport()
      } else {
        if (isMountedRef.current) setIsDeploying(false)
      }
    }, 50)
    
    // SICHERHEIT: Stelle sicher dass isDeploying nach max 60 Sekunden zurückgesetzt wird - MIT Cleanup
    // WICHTIG: Dieser Timeout wird durch den useEffect oben bereits abgedeckt, daher nicht nochmal hier
    
    // Cleanup Timeouts beim Unmount - WICHTIG: publishMobile ist keine useEffect, daher kein return
    // Die Timeouts werden durch isMountedRef.current geschützt
  }

  // Automatisch Künstler basierend auf Kategorie setzen - NUR wenn Kategorie sich ändert
  useEffect(() => {
    let isMounted = true
    // Warte kurz damit Daten geladen sind
    const timeoutId = setTimeout(() => {
      if (!isMounted) return
      try {
        // Prüfe nur wenn Kategorie sich ändert, nicht wenn Artist sich ändert
        // Künstler je nach Kategorie (max 5): Martina = Bilder/Grafik/Sonstiges, Georg = Keramik/Skulptur
        if ((artworkCategory === 'malerei' || artworkCategory === 'grafik' || artworkCategory === 'sonstiges') && martinaData?.name) {
          setArtworkArtist(martinaData.name)
        } else if ((artworkCategory === 'keramik' || artworkCategory === 'skulptur') && georgData?.name) {
          setArtworkArtist(georgData.name)
        }
      } catch (error) {
        // Ignoriere Fehler um Crashes zu vermeiden
        console.warn('Fehler beim Setzen des Künstlers:', error)
      }
    }, 500) // Warte bis Daten geladen sind
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [artworkCategory]) // NUR Kategorie - verhindert Render-Loop!


  // Werke aus localStorage laden – erst 3 s nach Mount (starker Reopen-Crash-Schutz)
  useEffect(() => {
    let isMounted = true
    const t = setTimeout(() => {
      if (!isMounted) return
      try {
        const key = getArtworksKey()
        const stored = localStorage.getItem(key)
        if (stored && stored.length > 10000000) {
          if (isMounted) setAllArtworks([])
          return
        }
        const artworks = loadArtworks()
        if (isMounted && Array.isArray(artworks)) setAllArtworks(artworks)
      } catch (_) {
        if (isMounted) setAllArtworks([])
      }
    }, 3000)
    return () => { isMounted = false; clearTimeout(t) }
  }, [])
  
  // WICHTIG: Event-Listener für Mobile-Updates (damit Mobile-Werke im Admin angezeigt werden)
  useEffect(() => {
    const handleArtworksUpdate = () => {
      console.log('🔄 artworks-updated Event empfangen - lade Werke neu...')
      try {
        const artworks = loadArtworks()
        console.log('📦 Geladene Werke:', artworks.length)
        if (Array.isArray(artworks)) {
          setAllArtworks(artworks)
        }
      } catch (error) {
        console.error('Fehler beim Neuladen der Werke:', error)
      }
    }
    
    window.addEventListener('artworks-updated', handleArtworksUpdate)
    
    return () => {
      window.removeEventListener('artworks-updated', handleArtworksUpdate)
    }
  }, [])
  
  // KEIN Auto-Sync (Supabase / gallery-data.json) mehr beim Admin-Start – verursacht Fenster-Abstürze.
  // Mobile-Werke kommen über artworks-updated Event beim Speichern; Werke werden nur aus localStorage geladen (siehe oben, 2 s Verzögerung).

  // Dokumente aus localStorage laden (Key abhängig von K2 vs. ök2)
  const loadDocuments = () => {
    try {
      const stored = localStorage.getItem(getDocumentsKey())
      if (stored) {
        return JSON.parse(stored)
      }
      return []
    } catch (error) {
      console.error('Fehler beim Laden der Dokumente:', error)
      return []
    }
  }

  // Eindeutiger Name für weiteren Werbematerial-Vorschlag (mehrere pro Zeile)
  const getNextWerbematerialVorschlagName = (
    eventId: string,
    eventTitle: string,
    werbematerialTyp: string,
    baseName: string
  ): string => {
    const existing = loadDocuments().filter(
      (d: any) => d.category === 'pr-dokumente' && d.eventId === eventId && d.werbematerialTyp === werbematerialTyp
    )
    const num = existing.length + 1
    return num === 1 ? `${baseName} – ${eventTitle}` : `${baseName} – ${eventTitle} (Vorschlag ${num})`
  }

  // Dokumente aus localStorage laden - verzögert - mit Cleanup
  useEffect(() => {
    let isMounted = true
    
    const timeoutId = setTimeout(() => {
      if (!isMounted) return
      
      try {
        const docs = loadDocuments()
        if (isMounted) setDocuments(docs)
      } catch (error) {
        console.error('Fehler beim Laden der Dokumente:', error)
        if (isMounted) setDocuments([])
      }
    }, 300)
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId) // Cleanup beim Unmount
    }
  }, [])

  // Events aus localStorage laden - verzögert - mit Cleanup
  useEffect(() => {
    let isMounted = true
    
    const timeoutId = setTimeout(() => {
      if (!isMounted) return
      
      try {
        const loadedEvents = loadEvents()
        if (isMounted) setEvents(loadedEvents)
      } catch (error) {
        console.error('Fehler beim Laden der Events:', error)
        if (isMounted) setEvents([])
      }
    }, 400)
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId) // Cleanup beim Unmount
    }
  }, [])
  
  // AUTO-SAVE: Speichere alle Daten automatisch alle 5 Sekunden - VERHINDERT DATENVERLUST BEI CRASHES
  useEffect(() => {
    let isMounted = true
    
    // Funktion die alle Daten sammelt
    const getAllData = () => ({
      martina: martinaData,
      georg: georgData,
      gallery: galleryData,
      artworks: allArtworks,
      events: events,
      documents: documents,
      designSettings: designSettings,
      pageTexts: pageTexts
    })
    
    // KRITISCH: Auto-Save nur in K2 – in ök2 niemals in K2-Keys schreiben
    if (!isOeffentlichAdminContext()) {
      startAutoSave(getAllData)
      setupBeforeUnloadSave(getAllData)
    }
    
    return () => {
      isMounted = false
      stopAutoSave()
    }
  }, [martinaData, georgData, galleryData, allArtworks, events, documents, designSettings, pageTexts])

  // Event hinzufügen/bearbeiten
  const handleSaveEvent = () => {
    if (!eventTitle || !eventDate) {
      alert('Bitte Titel und Datum eingeben')
      return
    }

    const eventData = {
      id: editingEvent?.id || `event-${Date.now()}`,
      title: eventTitle,
      type: eventType,
      date: eventDate,
      endDate: eventEndDate || eventDate, // Falls kein Enddatum, dann Startdatum verwenden
      startTime: eventStartTime || '',
      endTime: eventEndTime || '',
      dailyTimes: eventDailyTimes || {}, // Tägliche Zeiten für jeden Tag
      description: eventDescription,
      location: eventLocation,
      documents: editingEvent?.documents || [],
      createdAt: editingEvent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    let updatedEvents
    if (editingEvent) {
      updatedEvents = events.map(e => e.id === editingEvent.id ? eventData : e)
    } else {
      updatedEvents = [...events, eventData]
    }

    // Nach Startdatum sortieren
    updatedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setEvents(updatedEvents)
    saveEvents(updatedEvents)
    
    // PR-Vorschläge: Bei Bearbeitung eventTitle in localStorage aktualisieren; bei neuem Event automatisch generieren
    const existingSuggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    const suggestionIndex = existingSuggestions.findIndex((s: any) => s.eventId === eventData.id)
    if (editingEvent && suggestionIndex >= 0) {
      existingSuggestions[suggestionIndex].eventTitle = eventData.title
      existingSuggestions[suggestionIndex].eventId = eventData.id
      localStorage.setItem('k2-pr-suggestions', JSON.stringify(existingSuggestions))
    } else if (!editingEvent) {
      generateAutomaticSuggestions(eventData)
    }
    
    // Zurücksetzen
    setShowEventModal(false)
    setEditingEvent(null)
    setEventTitle('')
    setEventType('galerieeröffnung')
    setEventDate('')
    setEventEndDate('')
    setEventStartTime('')
    setEventEndTime('')
    setEventDailyTimes({})
    setEventDescription('')
    setEventLocation('')
    
    if (editingEvent) {
      alert('✅ Event aktualisiert!')
    } else {
      setEventplanSubTab('öffentlichkeitsarbeit')
      alert('✅ Event angelegt. Unten siehst du die neue Rubrik mit allen Werbe-Werkzeugen – Newsletter, Presse, Social Media, PDF.')
    }
  }

  // Event bearbeiten
  const handleEditEvent = (event: any) => {
    setEditingEvent(event)
    setEventTitle(event.title)
    setEventType(event.type)
    setEventDate(event.date)
    setEventEndDate(event.endDate || event.date)
    setEventStartTime(event.startTime || event.time || '')
    setEventEndTime(event.endTime || '')
    // Konvertiere alte Format (string) zu neuem Format (object mit start/end)
    const dailyTimes = event.dailyTimes || {}
    const convertedDailyTimes: Record<string, { start: string, end: string }> = {}
    Object.keys(dailyTimes).forEach(day => {
      const time = dailyTimes[day]
      if (typeof time === 'string') {
        convertedDailyTimes[day] = { start: time, end: '' }
      } else {
        convertedDailyTimes[day] = { start: time?.start || '', end: time?.end || '' }
      }
    })
    setEventDailyTimes(convertedDailyTimes)
    setEventDescription(event.description || '')
    setEventLocation(event.location || '')
    setShowEventModal(true)
  }

  // Alle Tage zwischen Start- und Enddatum generieren
  const getEventDays = (startDate: string, endDate: string): string[] => {
    if (!startDate) return []
    const end = endDate || startDate
    const days: string[] = []
    const start = new Date(startDate)
    const endDateObj = new Date(end)
    
    for (let d = new Date(start); d <= endDateObj; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().split('T')[0])
    }
    
    return days
  }

  // Automatische Vorschläge für neues Event generieren
  const generateAutomaticSuggestions = (event: any) => {
    // Speichere Vorschläge in localStorage
    const suggestions = {
      eventId: event.id,
      eventTitle: event.title,
      generatedAt: new Date().toISOString(),
      presseaussendung: generatePresseaussendungContent(event),
      socialMedia: generateSocialMediaContent(event),
      flyer: generateFlyerContent(event),
      newsletter: generateNewsletterContent(event),
      plakat: generatePlakatContent(event)
    }
    
    const existingSuggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    existingSuggestions.push(suggestions)
    localStorage.setItem('k2-pr-suggestions', JSON.stringify(existingSuggestions))
  }

  // Hilfsfunktion: Alle Termindaten formatieren
  const formatEventDates = (event: any): string => {
    if (!event || !event.date) {
      return 'Datum folgt'
    }
    try {
      const startDate = new Date(event.date)
      if (isNaN(startDate.getTime())) {
        return 'Datum folgt'
      }
      let endDate = event.endDate ? new Date(event.endDate) : null
      if (endDate && isNaN(endDate.getTime())) {
        // EndDate ist ungültig, ignoriere es
        endDate = null
      }
    
    let dateStr = startDate.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    
    if (endDate && endDate.getTime() !== startDate.getTime()) {
      dateStr += ` - ${endDate.toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}`
    }
    
    // Zeiten hinzufügen
    if (event.dailyTimes && Object.keys(event.dailyTimes).length > 0) {
      // Mehrteiliges Event mit täglichen Zeiten
      const times: string[] = []
      const days = getEventDays(event.date, event.endDate || event.date)
      days.forEach(day => {
        const dayTime = event.dailyTimes[day]
        if (dayTime) {
          const dayDate = new Date(day)
          if (typeof dayTime === 'string') {
            // Altes Format (nur Startzeit)
            times.push(`${dayDate.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}: ${dayTime}`)
          } else if (dayTime.start || dayTime.end) {
            // Neues Format (Start- und Endzeit)
            const timeStr = dayTime.start 
              ? (dayTime.end ? `${dayTime.start} - ${dayTime.end} Uhr` : `${dayTime.start} Uhr`)
              : (dayTime.end ? `bis ${dayTime.end} Uhr` : '')
            if (timeStr) {
              times.push(`${dayDate.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}: ${timeStr}`)
            }
          }
        }
      })
      if (times.length > 0) {
        dateStr += '\n\nZeiten:\n' + times.join('\n')
      }
    } else if (event.startTime) {
      dateStr += `\n🕐 ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''} Uhr`
    }
    
    return dateStr
    } catch (error) {
      console.error('Fehler beim Formatieren der Event-Daten:', error)
      return 'Datum folgt'
    }
  }

  // Content-Generatoren im App-Design-Stil
  const generatePresseaussendungContent = (event: any) => {
    const eventTypeLabels: Record<string, string> = {
      galerieeröffnung: 'Galerieeröffnung',
      vernissage: 'Vernissage',
      finissage: 'Finissage',
      öffentlichkeitsarbeit: 'Öffentlichkeitsarbeit',
      sonstiges: 'Veranstaltung'
    }
    const evType = eventTypeLabels[event.type] || 'Veranstaltung'
    const evDate = formatEventDates(event)
    const ort = event.location || galleryData.address || ''
    const desc = event.description || 'Malerei, Keramik und Skulptur in einem außergewöhnlichen Galerieraum.'
    const mName = martinaData?.name || 'Martina Kreinecker'
    const pName = georgData?.name || 'Georg Kreinecker'
    const mBio = martinaData?.bio || 'Malerei und Grafik – großformatige Arbeiten zwischen Abstraktion und Figuration.'
    const pBio = georgData?.bio || 'Keramik und Skulptur – handgeformte Objekte mit starker plastischer Präsenz.'
    const gName = galleryData.name || 'K2 Galerie'
    const adresse = [galleryData.address, galleryData.city].filter(Boolean).join(', ')
    return {
      title: `PRESSEAUSSENDUNG – ${event.title} | ${gName}`,
      content: [
        `PRESSEAUSSENDUNG`,
        `Zur sofortigen Veröffentlichung`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `${event.title.toUpperCase()}`,
        `${evType} · ${gName}`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        ``,
        `TERMIN:   ${evDate}`,
        `ORT:      ${ort || adresse}`,
        `EINTRITT: frei`,
        ``,
        `───────────────────────────────────────`,
        `ZUR AUSSTELLUNG`,
        `───────────────────────────────────────`,
        ``,
        desc,
        ``,
        `Die ${gName} präsentiert mit dieser ${evType} eine Zusammenschau`,
        `zweier künstlerischer Positionen, die in Dialog miteinander treten.`,
        `${mName} und ${pName} schaffen Werke, die sich gegenseitig`,
        `spiegeln und bereichern – zwischen Fläche und Raum, zwischen`,
        `malerischer Setzung und plastischer Form.`,
        ``,
        `───────────────────────────────────────`,
        `DIE KÜNSTLER:INNEN`,
        `───────────────────────────────────────`,
        ``,
        `${mName.toUpperCase()}`,
        mBio,
        ``,
        `${pName.toUpperCase()}`,
        pBio,
        ``,
        `───────────────────────────────────────`,
        `KONTAKT & BILDMATERIAL`,
        `───────────────────────────────────────`,
        ``,
        `Für Rückfragen, Interviewanfragen und Bildmaterial:`,
        ``,
        galleryData.email ? `E-Mail:  ${galleryData.email}` : '',
        galleryData.phone ? `Telefon: ${galleryData.phone}` : '',
        adresse ? `Adresse: ${adresse}` : '',
        galleryData.openingHours ? `Öffnungszeiten: ${galleryData.openingHours}` : '',
        ``,
        `www.k2-galerie.at`,
        ``,
        `– Ende der Presseaussendung –`,
      ].filter(l => l !== null && l !== undefined).join('\n')
    }
  }

  const generateSocialMediaContent = (event: any) => {
    const hashtagMap: Record<string, string> = {
      galerieeröffnung: '#Galerieeröffnung #Galerieöffnung #Kunsthaus',
      vernissage: '#Vernissage #Ausstellungseröffnung #Kunstausstellung',
      finissage: '#Finissage #LetzteChance #Kunst',
      öffentlichkeitsarbeit: '#Kunst #Galerie #Öffentlichkeitsarbeit',
      sonstiges: '#Kunst #Event #Galerie'
    }
    const typeNameMap: Record<string, string> = {
      galerieeröffnung: 'Galerieeröffnung', vernissage: 'Vernissage',
      finissage: 'Finissage', öffentlichkeitsarbeit: 'Veranstaltung', sonstiges: 'Veranstaltung'
    }
    const datesFormatted = formatEventDates(event)
    const ort = event.location || galleryData.address || ''
    const desc = event.description || 'Wir freuen uns auf deinen Besuch!'
    const mName = martinaData?.name || 'Martina Kreinecker'
    const pName = georgData?.name || 'Georg Kreinecker'
    const gName = galleryData.name || 'K2 Galerie'
    const typeName = typeNameMap[event.type] || 'Veranstaltung'
    const hashtags = hashtagMap[event.type] || '#Kunst #Galerie'
    const baseHashtags = `#K2Galerie #KunstInÖsterreich #Malerei #Keramik`
    return {
      instagram: [
        `✦ ${event.title}`,
        ``,
        `${desc}`,
        ``,
        `📅 ${datesFormatted}`,
        ort ? `📍 ${ort}` : '',
        ``,
        `${mName} trifft ${pName} –`,
        `Malerei, Grafik & Keramik in einem Raum.`,
        ``,
        `Eintritt frei. Wir freuen uns auf euch! 🎨`,
        ``,
        `${hashtags} ${baseHashtags} #Vernissage #Kunstliebe`,
      ].filter(Boolean).join('\n'),
      facebook: [
        `🎨 ${event.title} – ${typeName} in der ${gName}`,
        ``,
        `Wir laden herzlich ein!`,
        ``,
        desc,
        ``,
        `${mName} und ${pName} zeigen neue Werke:`,
        `Malerei, Grafik, Keramik und Skulptur – zwei Handschriften, ein Raum.`,
        ``,
        `📅 ${datesFormatted}`,
        ort ? `📍 ${ort}` : '',
        galleryData.openingHours ? `🕒 ${galleryData.openingHours}` : '',
        ``,
        `Eintritt frei. Bitte meldet euch gerne an:`,
        galleryData.email ? `✉ ${galleryData.email}` : '',
        galleryData.phone ? `☎ ${galleryData.phone}` : '',
        ``,
        `Wir freuen uns auf euren Besuch! 💚`,
      ].filter(Boolean).join('\n'),
      whatsapp: [
        `✦ *${event.title}*`,
        `📅 ${datesFormatted}`,
        ort ? `📍 ${ort}` : '',
        ``,
        desc,
        ``,
        `_${mName} & ${pName} – ${gName}_`,
        galleryData.email ? `✉ ${galleryData.email}` : '',
        `👉 www.k2-galerie.at`,
      ].filter(Boolean).join('\n'),
    }
  }

  const generateFlyerContent = (event: any) => {
    return {
      headline: event.title,
      date: formatEventDates(event),
      location: event.location || galleryData.address || '',
      description: event.description || '',
      type: event.type,
      qrCode: galleryData.website || window.location.origin,
      contact: {
        phone: galleryData.phone || '',
        email: galleryData.email || '',
        address: galleryData.address || ''
      }
    }
  }

  const generateNewsletterContent = (event: any) => {
    const eventTypeNames: Record<string, string> = {
      galerieeröffnung: 'Galerieeröffnung',
      vernissage: 'Vernissage',
      finissage: 'Finissage',
      öffentlichkeitsarbeit: 'Öffentlichkeitsarbeit',
      sonstiges: 'Veranstaltung'
    }
    
    return {
      subject: `Einladung: ${event.title}`,
      greeting: 'Liebe Kunstfreunde,',
      body: `
wir laden dich herzlich ein zu unserer ${eventTypeNames[event.type] || 'Veranstaltung'}!

TERMINDATEN:
📅 ${formatEventDates(event)}

ORT:
📍 ${event.location || galleryData.address || ''}

BESCHREIBUNG:
${event.description || 'Wir freuen uns auf deinen Besuch!'}

KONTAKT:
${galleryData.phone ? `Tel: ${galleryData.phone}` : ''}
${galleryData.email ? `E-Mail: ${galleryData.email}` : ''}
${galleryData.address ? `Adresse: ${galleryData.address}` : ''}
      `.trim()
    }
  }

  const generatePlakatContent = (event: any) => {
    const galleryData = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
    const eventTypeNames: Record<string, string> = {
      galerieeröffnung: 'Galerieeröffnung',
      vernissage: 'Vernissage',
      finissage: 'Finissage',
      öffentlichkeitsarbeit: 'Öffentlichkeitsarbeit',
      sonstiges: 'Veranstaltung'
    }
    
    return {
      title: event.title || 'Event',
      type: eventTypeNames[event.type] || 'Veranstaltung',
      date: formatEventDates(event) || 'Datum folgt',
      location: event.location || galleryData.address || '',
      description: event.description || '',
      qrCode: galleryData.website || window.location.origin,
      contact: {
        phone: galleryData.phone || '',
        email: galleryData.email || '',
        address: galleryData.address || ''
      }
    }
  }

  // Einzelne bearbeitbare PDFs generieren
  // Leichtgewichtige Text-Export Funktionen (statt PDF) - viel weniger Memory-Belastung
  const exportPresseaussendungAsText = (presseaussendung: any, event: any) => {
    const galleryData = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
    const galleryName = galleryData.name || 'K2 Galerie'
    
    const text = `
${'='.repeat(60)}
${galleryName.toUpperCase()}
${'='.repeat(60)}

PRESSEAUSSENDUNG

Event: ${event?.title || 'Nicht angegeben'}
Datum: ${event?.date ? new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Nicht angegeben'}

${galleryData.address ? `Adresse: ${galleryData.address}` : ''}
${galleryData.phone ? `Telefon: ${galleryData.phone}` : ''}
${galleryData.email ? `E-Mail: ${galleryData.email}` : ''}

${'-'.repeat(60)}

TITEL:
${presseaussendung?.title || ''}

${'-'.repeat(60)}

INHALT:
${presseaussendung?.content || ''}

${'='.repeat(60)}
Erstellt: ${new Date().toLocaleString('de-DE')}
${'='.repeat(60)}
    `.trim()
    
    // Kopiere in Zwischenablage (sehr leichtgewichtig)
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Presseaussendung wurde in die Zwischenablage kopiert!\n\nDu kannst sie jetzt in Word, Pages oder einem Texteditor einfügen.')
    }).catch(() => {
      // Fallback: Öffne in neuem Fenster (kleiner Blob, sofort freigegeben)
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const win = window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 500)
      if (win) {
        alert('✅ Text wurde geöffnet. Du kannst ihn kopieren und in Word/Pages einfügen.')
      }
    })
  }

  const exportSocialMediaAsText = (socialMedia: any, event: any) => {
    const text = `
${'='.repeat(60)}
SOCIAL MEDIA POSTS
${'='.repeat(60)}

Event: ${event?.title || 'Nicht angegeben'}

${'-'.repeat(60)}
INSTAGRAM POST:
${'-'.repeat(60)}
${socialMedia?.instagram || ''}

${'-'.repeat(60)}
FACEBOOK POST:
${'-'.repeat(60)}
${socialMedia?.facebook || ''}

${'='.repeat(60)}
Erstellt: ${new Date().toLocaleString('de-DE')}
${'='.repeat(60)}
    `.trim()
    
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Social Media Posts wurden in die Zwischenablage kopiert!')
    }).catch(() => {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const win = window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 500)
    })
  }

  const exportNewsletterAsText = (newsletter: any, event: any) => {
    const text = `
${'='.repeat(60)}
E-MAIL NEWSLETTER
${'='.repeat(60)}

Event: ${event?.title || 'Nicht angegeben'}

${'-'.repeat(60)}
BETREFF:
${newsletter?.subject || ''}

${'-'.repeat(60)}
INHALT:
${newsletter?.body || ''}

${'='.repeat(60)}
Erstellt: ${new Date().toLocaleString('de-DE')}
${'='.repeat(60)}
    `.trim()
    
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Newsletter wurde in die Zwischenablage kopiert!')
    }).catch(() => {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const win = window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 500)
    })
  }

  const generateEditablePresseaussendungPDF = (presseaussendung: any, event: any) => {
    let blob: Blob | null = null // WICHTIG: Außerhalb try-catch definieren
    
    const galleryData = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
    const galleryName = galleryData.name || 'K2 Galerie'
    const galleryAddress = galleryData.address || ''
    const galleryPhone = galleryData.phone || ''
    const galleryEmail = galleryData.email || ''
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Presseaussendung - ${event?.title || 'Event'}</title>
  <link rel="stylesheet" href="${WERBELINIE_FONTS_URL}" />
  <style>${getWerbeliniePrDocCss('k2-pr-doc')}</style>
  <style id="print-page-size">@media print { @page { size: A4; margin: 15mm; } }</style>
</head>
<body class="k2-pr-doc format-a4">
  <div class="no-print">
    <button onclick="goBack(); return false;" class="secondary">← Zurück</button>
    <span style="margin: 0 8px; color: #666;">Format:</span>
    <button onclick="setFormat('a4'); return false;">A4</button>
    <button onclick="setFormat('a3'); return false;">A3 (Plakat)</button>
    <button onclick="setFormat('a5'); return false;">A5</button>
    <button onclick="window.print(); return false;">🖨️ Als PDF drucken</button>
    <button onclick="saveChanges(); return false;">💾 Speichern</button>
    <p>Galerie-Design, druckbar als A4 / A3 / A5. Format wählen, dann drucken.</p>
  </div>

  <div class="page">
    <div class="content">
    <div class="header">
      <h1>${galleryName}</h1>
      <div class="header-info">
        ${galleryAddress ? `<strong>Adresse:</strong> ${galleryAddress}<br>` : ''}
        ${galleryPhone ? `<strong>Telefon:</strong> ${galleryPhone}<br>` : ''}
        ${galleryEmail ? `<strong>E-Mail:</strong> ${galleryEmail}<br>` : ''}
        ${event?.date ? `<strong>Event-Datum:</strong> ${new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}<br>` : ''}
        ${event?.title ? `<strong>Event:</strong> ${event.title}` : ''}
      </div>
    </div>
    
    <h1>Presseaussendung</h1>
    
    <div class="field-group">
      <label>Titel der Presseaussendung</label>
      <input type="text" id="presse-title" value="${(presseaussendung?.title || '').replace(/"/g, '&quot;')}" />
    </div>
    
    <div class="field-group">
      <label>Inhalt der Presseaussendung</label>
      <textarea id="presse-content" rows="30">${(presseaussendung?.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
    </div>
  </div>

  <script>
    function setFormat(f) {
      document.body.className = 'k2-pr-doc format-' + f;
      var p = document.getElementById('print-page-size');
      if (p) p.textContent = '@media print { @page { size: ' + (f === 'a4' ? 'A4' : f === 'a3' ? 'A3' : 'A5') + '; margin: 15mm; } }';
    }
    function goBack() {
      var adminUrl = window.location.origin + '/admin'
      
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(function() {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          // Falls Fehler, navigiere direkt
        }
      }
      
      window.location.href = adminUrl
    }
    
    function saveChanges() {
      var changes = {
        presseaussendung: {
          title: document.getElementById('presse-title').value,
          content: document.getElementById('presse-content').value
        }
      }
      navigator.clipboard.writeText(JSON.stringify(changes, null, 2)).then(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      }).catch(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      })
    }
    
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    var autoCloseTimeout = null
    function handleAfterPrint() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
      setTimeout(function() {
        goBack()
      }, 1000)
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    function cleanup() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      
      // Versuche Fenster zu öffnen - mit besserer Pop-up-Erkennung
      const pdfWindow = window.open(url, '_blank', 'noopener,noreferrer')
      
      // Prüfe ob Fenster wirklich geöffnet wurde (mit kurzer Verzögerung)
      setTimeout(() => {
        if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed === 'undefined') {
          // Pop-up blockiert - öffne als Link ohne Download-Attribut
          URL.revokeObjectURL(url)
          const newUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = newUrl
          link.target = '_blank'
          // KEIN download-Attribut - Browser öffnet Datei statt Download
          document.body.appendChild(link)
          link.click()
          setTimeout(() => {
            document.body.removeChild(link)
            // URL nicht sofort revoken - Browser braucht Zeit zum Laden
            setTimeout(() => URL.revokeObjectURL(newUrl), 2000)
          }, 100)
        } else {
          // Fenster erfolgreich geöffnet - Cleanup später
          pdfWindow.addEventListener('beforeunload', () => {
            URL.revokeObjectURL(url)
          })
        }
      }, 100)
    } catch (error) {
      console.error('Fehler beim Generieren des PDFs:', error)
      alert('Fehler beim Generieren des PDFs. Bitte versuche es erneut.')
      return // WICHTIG: Return wenn Fehler, damit blob nicht verwendet wird
    }
    
    // Speichere auch in Dokumente-Sektion (nur wenn blob erfolgreich erstellt wurde)
    if (blob) {
      const reader = new FileReader()
      const blobToSave: Blob = blob // Explizite Type-Assertion
      reader.onloadend = () => {
        const eid = event?.id || 'unknown'
        const etitle = event?.title || 'Event'
        const documentData = {
          id: `pr-editable-presseaussendung-${eid}-${Date.now()}`,
          name: getNextWerbematerialVorschlagName(eid, etitle, 'presse', 'Presseaussendung (bearbeitbar)'),
          type: 'text/html',
          size: blobToSave.size,
          data: reader.result as string,
          fileName: `presseaussendung-editable-${etitle.replace(/\s+/g, '-').toLowerCase()}.html`,
          uploadedAt: new Date().toISOString(),
          isPDF: false,
          isPlaceholder: false,
          category: 'pr-dokumente',
          eventId: eid,
          eventTitle: etitle,
          werbematerialTyp: 'presse'
        }
        const existingDocs = loadDocuments()
        const updated = [...existingDocs, documentData]
        saveDocuments(updated)
      }
      reader.readAsDataURL(blob)
    }
  }

  const generateEditableSocialMediaPDF = (socialMedia: any, event: any) => {
    const galleryData = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
    const galleryName = galleryData.name || 'K2 Galerie'
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Social Media - ${event?.title || 'Event'}</title>
  <link rel="stylesheet" href="${WERBELINIE_FONTS_URL}" />
  <style>${getWerbeliniePrDocCss('k2-pr-doc')}</style>
  <style id="print-page-size">@media print { @page { size: A4; margin: 15mm; } }</style>
</head>
<body class="k2-pr-doc format-a4">
  <div class="no-print">
    <button onclick="goBack(); return false;" class="secondary">← Zurück</button>
    <span style="margin: 0 8px; color: #666;">Format:</span>
    <button onclick="setFormat('a4'); return false;">A4</button>
    <button onclick="setFormat('a3'); return false;">A3 (Plakat)</button>
    <button onclick="setFormat('a5'); return false;">A5</button>
    <button onclick="window.print(); return false;">🖨️ Als PDF drucken</button>
    <button onclick="saveChanges(); return false;">💾 Speichern</button>
    <p>Galerie-Design, druckbar als A4 / A3 / A5.</p>
  </div>

  <div class="page">
    <div class="content">
    <div class="header">
      <h1>${galleryName}</h1>
      <div class="header-info">
        ${event?.title ? `<strong>Event:</strong> ${event.title}<br>` : ''}
        ${event?.date ? `<strong>Datum:</strong> ${new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}` : ''}
      </div>
    </div>
    
    <h1>Social Media Posts</h1>
    
    <h2>Instagram Post</h2>
    <div class="field-group">
      <label>Instagram Text</label>
      <textarea id="instagram-post" rows="18">${((socialMedia?.instagram || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
    
    <h2>Facebook Post</h2>
    <div class="field-group">
      <label>Facebook Text</label>
      <textarea id="facebook-post" rows="18">${((socialMedia?.facebook || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
    
    <h2>WhatsApp / Kurznachricht</h2>
    <div class="field-group">
      <label>WhatsApp Text (kompakt, mit Emojis)</label>
      <textarea id="whatsapp-post" rows="10">${((socialMedia?.whatsapp || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
    </div>
  </div>

  <script>
    function setFormat(f) {
      document.body.className = 'k2-pr-doc format-' + f;
      var p = document.getElementById('print-page-size');
      if (p) p.textContent = '@media print { @page { size: ' + (f === 'a4' ? 'A4' : f === 'a3' ? 'A3' : 'A5') + '; margin: 15mm; } }';
    }
    function goBack() {
      var adminUrl = window.location.origin + '/admin'
      
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(function() {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          // Falls Fehler, navigiere direkt
        }
      }
      
      window.location.href = adminUrl
    }
    
    function saveChanges() {
      var changes = {
        socialMedia: {
          instagram: document.getElementById('instagram-post').value,
          facebook: document.getElementById('facebook-post').value
        }
      }
      navigator.clipboard.writeText(JSON.stringify(changes, null, 2)).then(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      }).catch(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      })
    }
    
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    var autoCloseTimeout = null
    function handleAfterPrint() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
      setTimeout(function() {
        goBack()
      }, 1000)
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    function cleanup() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      
      // Versuche Fenster zu öffnen - mit besserer Pop-up-Erkennung
      const pdfWindow = window.open(url, '_blank', 'noopener,noreferrer')
      
      // Prüfe ob Fenster wirklich geöffnet wurde (mit kurzer Verzögerung)
      setTimeout(() => {
        if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed === 'undefined') {
          // Pop-up blockiert - öffne als Link ohne Download-Attribut
          URL.revokeObjectURL(url)
          const newUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = newUrl
          link.target = '_blank'
          // KEIN download-Attribut - Browser öffnet Datei statt Download
          document.body.appendChild(link)
          link.click()
          setTimeout(() => {
            document.body.removeChild(link)
            // URL nicht sofort revoken - Browser braucht Zeit zum Laden
            setTimeout(() => URL.revokeObjectURL(newUrl), 2000)
          }, 100)
        } else {
          // Fenster erfolgreich geöffnet - Cleanup später
          pdfWindow.addEventListener('beforeunload', () => {
            URL.revokeObjectURL(url)
          })
        }
      }, 100)
      
      // Speichere auch in Dokumente-Sektion
      const reader = new FileReader()
      reader.onloadend = () => {
        const eid = event?.id || 'unknown'
        const etitle = event?.title || 'Event'
        const documentData = {
          id: `pr-editable-socialmedia-${eid}-${Date.now()}`,
          name: getNextWerbematerialVorschlagName(eid, etitle, 'social', 'Social Media (bearbeitbar)'),
          type: 'text/html',
          size: blob.size,
          data: reader.result as string,
          fileName: `social-media-editable-${etitle.replace(/\s+/g, '-').toLowerCase()}.html`,
          uploadedAt: new Date().toISOString(),
          isPDF: false,
          isPlaceholder: false,
          category: 'pr-dokumente',
          eventId: eid,
          eventTitle: etitle,
          werbematerialTyp: 'social'
        }
        const existingDocs = loadDocuments()
        const updated = [...existingDocs, documentData]
        saveDocuments(updated)
      }
      reader.onerror = () => {
        console.error('Fehler beim Lesen des Blobs')
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Fehler beim Generieren des PDFs:', error)
      alert('Fehler beim Generieren des PDFs. Bitte versuche es erneut.')
    }
  }

  const generateEventFlyerContent = (event: any): { subject?: string; body?: string } => {
    const g = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
    const m = JSON.parse(localStorage.getItem('k2-stammdaten-martina') || '{}')
    const p = JSON.parse(localStorage.getItem('k2-stammdaten-georg') || '{}')
    const gName = g.name || 'K2 Galerie'
    const mName = m.name || 'Martina Kreinecker'
    const pName = p.name || 'Georg Kreinecker'
    const adresse = [g.address, g.city].filter(Boolean).join(', ') || ''
    const eventDate = event?.date ? new Date(event.date).toLocaleDateString('de-AT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + (event?.startTime ? ` · ${event.startTime} Uhr` : ', 18 Uhr') : 'Termin folgt'
    const title = event?.title || 'Vernissage'
    const desc = event?.description || 'Malerei, Keramik und Skulptur in einem außergewöhnlichen Galerieraum.'
    return {
      subject: `✦ ${title} – Event-Flyer | ${gName}`,
      body: [
        `═══════════════════════════════════════`,
        `  ${title.toUpperCase()}`,
        `  ${gName}`,
        `═══════════════════════════════════════`,
        ``,
        `📅  ${eventDate}`,
        adresse ? `📍  ${adresse}` : '',
        ``,
        `───────────────────────────────────────`,
        `ÜBER DIE AUSSTELLUNG`,
        `───────────────────────────────────────`,
        ``,
        desc,
        ``,
        `Die Ausstellung zeigt neue Arbeiten von ${mName} und ${pName} –`,
        `zwei künstlerische Handschriften, die sich in einem gemeinsamen`,
        `Raum begegnen und ergänzen.`,
        ``,
        `───────────────────────────────────────`,
        `DIE KÜNSTLER:INNEN`,
        `───────────────────────────────────────`,
        ``,
        `${mName}`,
        (m.bio || 'Malerei & Grafik – großformatige Arbeiten zwischen Abstraktion und Figuration.'),
        ``,
        `${pName}`,
        (p.bio || 'Keramik & Skulptur – handgeformte Objekte mit starker plastischer Wirkung.'),
        ``,
        `───────────────────────────────────────`,
        `KONTAKT & INFORMATION`,
        `───────────────────────────────────────`,
        ``,
        g.email ? `✉  ${g.email}` : '',
        g.phone ? `☎  ${g.phone}` : '',
        adresse ? `🏛  ${adresse}` : '',
        g.openingHours ? `🕒  Öffnungszeiten: ${g.openingHours}` : '',
        ``,
        `www.k2-galerie.at`,
      ].filter(line => line !== null && line !== undefined).join('\n')
    }
  }

  const generateEmailNewsletterContent = (event: any): { subject?: string; body?: string } => {
    const g = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
    const m = JSON.parse(localStorage.getItem('k2-stammdaten-martina') || '{}')
    const p = JSON.parse(localStorage.getItem('k2-stammdaten-georg') || '{}')
    const gName = g.name || 'K2 Galerie'
    const mName = m.name || 'Martina Kreinecker'
    const pName = p.name || 'Georg Kreinecker'
    const adresse = [g.address, g.city].filter(Boolean).join(', ') || ''
    const eventDate = event?.date ? new Date(event.date).toLocaleDateString('de-AT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + (event?.startTime ? ` · ${event.startTime} Uhr` : ', 18 Uhr') : 'Termin folgt'
    const title = event?.title || 'Vernissage'
    const desc = event?.description || 'Malerei, Keramik und Skulptur in einer einzigartigen Galerieatmosphäre.'
    return {
      subject: `Einladung: ${title} – ${gName}`,
      body: [
        `Liebe Kunstfreundinnen und Kunstfreunde,`,
        ``,
        `wir freuen uns, Sie persönlich zu unserer Veranstaltung einladen zu dürfen:`,
        ``,
        `  ✦  ${title.toUpperCase()}`,
        `  📅  ${eventDate}`,
        adresse ? `  📍  ${adresse}` : '',
        ``,
        `─────────────────────────────────────────`,
        ``,
        desc,
        ``,
        `${mName} und ${pName} zeigen neue Arbeiten, die in den vergangenen`,
        `Monaten entstanden sind. Malerei, Grafik, Keramik und Skulptur –`,
        `jedes Werk trägt eine persönliche Handschrift und lädt zum Innehalten,`,
        `Entdecken und Gespräch ein.`,
        ``,
        `Wir würden uns sehr freuen, Sie an diesem Abend begrüßen zu dürfen.`,
        `Für Getränke und eine herzliche Atmosphäre ist gesorgt.`,
        ``,
        `─────────────────────────────────────────`,
        ``,
        g.openingHours ? `Öffnungszeiten: ${g.openingHours}` : '',
        g.email ? `Anmeldung erwünscht: ${g.email}` : '',
        g.phone ? `Telefon: ${g.phone}` : '',
        ``,
        `Mit herzlichen Grüßen`,
        `${mName} & ${pName}`,
        `${gName}`,
        adresse ? adresse : '',
        ``,
        `www.k2-galerie.at`,
      ].filter(line => line !== null && line !== undefined).join('\n')
    }
  }

  const generateEditableNewsletterPDF = (newsletter: any, event: any) => {
    const galleryData = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
    const galleryName = galleryData.name || 'K2 Galerie'
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Newsletter - ${event?.title || 'Event'}</title>
  <link rel="stylesheet" href="${WERBELINIE_FONTS_URL}" />
  <style>${getWerbeliniePrDocCss('k2-pr-doc')}</style>
  <style id="print-page-size">@media print { @page { size: A4; margin: 15mm; } }</style>
</head>
<body class="k2-pr-doc format-a4">
  <div class="no-print">
    <button onclick="goBack(); return false;" class="secondary">← Zurück</button>
    <span style="margin: 0 8px; color: #666;">Format:</span>
    <button onclick="setFormat('a4'); return false;">A4</button>
    <button onclick="setFormat('a3'); return false;">A3 (Plakat)</button>
    <button onclick="setFormat('a5'); return false;">A5</button>
    <button onclick="window.print(); return false;">🖨️ Als PDF drucken</button>
    <button onclick="saveChanges(); return false;">💾 Speichern</button>
    <p>Galerie-Design, druckbar als A4 / A3 / A5.</p>
  </div>

  <div class="page">
    <div class="content">
    <div class="header">
      <h1>${galleryName}</h1>
      <div class="header-info">
        ${event?.title ? `<strong>Event:</strong> ${event.title}<br>` : ''}
        ${event?.date ? `<strong>Datum:</strong> ${new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}` : ''}
      </div>
    </div>
    
    <h1>E-Mail Newsletter</h1>
    
    <div class="field-group">
      <label>E-Mail Betreff</label>
      <input type="text" id="newsletter-subject" value="${(newsletter?.subject || '').replace(/"/g, '&quot;')}" />
    </div>
    
    <div class="field-group">
      <label>Newsletter Inhalt</label>
      <textarea id="newsletter-body" rows="30">${((newsletter?.body || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
    </div>
  </div>

  <script>
    function setFormat(f) {
      document.body.className = 'k2-pr-doc format-' + f;
      var p = document.getElementById('print-page-size');
      if (p) p.textContent = '@media print { @page { size: ' + (f === 'a4' ? 'A4' : f === 'a3' ? 'A3' : 'A5') + '; margin: 15mm; } }';
    }
    function goBack() {
      var adminUrl = window.location.origin + '/admin'
      
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(function() {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          // Falls Fehler, navigiere direkt
        }
      }
      
      window.location.href = adminUrl
    }
    
    function saveChanges() {
      var changes = {
        newsletter: {
          subject: document.getElementById('newsletter-subject').value,
          body: document.getElementById('newsletter-body').value
        }
      }
      navigator.clipboard.writeText(JSON.stringify(changes, null, 2)).then(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      }).catch(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      })
    }
    
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    var autoCloseTimeout = null
    function handleAfterPrint() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
      setTimeout(function() {
        goBack()
      }, 1000)
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    function cleanup() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const eid = event?.id || 'unknown'
      const etitle = event?.title || 'Event'
      const documentData = {
        id: `pr-editable-newsletter-${eid}-${Date.now()}`,
        name: getNextWerbematerialVorschlagName(eid, etitle, 'newsletter', 'Newsletter (bearbeitbar)'),
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `newsletter-editable-${etitle.replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente',
        eventId: eid,
        eventTitle: etitle,
        werbematerialTyp: 'newsletter'
      }
      const existingDocs = loadDocuments()
      const updated = [...existingDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
  }

  // Bearbeitbare PR-Vorschläge als PDF generieren
  const generateEditablePRSuggestionsPDF = (suggestions: any, event: any) => {
    const galleryData = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
    const galleryName = galleryData.name || 'K2 Galerie'
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PR-Vorschläge - ${suggestions.eventTitle || 'Event'}</title>
  <link rel="stylesheet" href="${WERBELINIE_FONTS_URL}" />
  <style>${getWerbeliniePrDocCss('k2-pr-doc')}</style>
  <style id="print-page-size">@media print { @page { size: A4; margin: 15mm; } }</style>
</head>
<body class="k2-pr-doc format-a4">
  <div class="no-print">
    <button onclick="goBack()" class="secondary">← Zurück</button>
    <span style="margin: 0 8px; color: #666;">Format:</span>
    <button onclick="setFormat('a4'); return false;">A4</button>
    <button onclick="setFormat('a3'); return false;">A3 (Plakat)</button>
    <button onclick="setFormat('a5'); return false;">A5</button>
    <button onclick="window.print()">🖨️ Als PDF drucken</button>
    <button onclick="saveAllChanges()">💾 Alle speichern</button>
    <p>Galerie-Design, druckbar als A4 / A3 / A5.</p>
  </div>

  <!-- Seite 1: Presseaussendung -->
  <div class="page">
    <div class="content">
    <div class="header">
      <h1>${galleryName}</h1>
      <div class="header-info">
        ${suggestions.eventTitle ? `<strong>Event:</strong> ${suggestions.eventTitle}<br>` : ''}
        ${event?.date ? `<strong>Datum:</strong> ${new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}` : ''}
      </div>
    </div>
    
    <h1>Presseaussendung</h1>
    
    <div class="field-group">
      <label>Titel der Presseaussendung</label>
      <input type="text" id="presse-title" value="${(suggestions.presseaussendung?.title || '').replace(/"/g, '&quot;')}" />
    </div>
    
    <div class="field-group">
      <label>Inhalt der Presseaussendung</label>
      <textarea id="presse-content" rows="22">${(suggestions.presseaussendung?.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
    </div>
  </div>

  <!-- Seite 2: Social Media -->
  <div class="page page-break">
    <div class="content">
    <div class="header">
      <h1>${galleryName}</h1>
      <div class="header-info">
        ${suggestions.eventTitle ? `<strong>Event:</strong> ${suggestions.eventTitle}` : ''}
      </div>
    </div>
    
    <h1>Social Media Posts</h1>
    
    <h2>Instagram Post</h2>
    <div class="field-group">
      <label>Instagram Text</label>
      <textarea id="instagram-post" rows="15">${((suggestions.socialMedia?.instagram || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
    
    <h2>Facebook Post</h2>
    <div class="field-group">
      <label>Facebook Text</label>
      <textarea id="facebook-post" rows="15">${((suggestions.socialMedia?.facebook || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
    </div>
  </div>

  <!-- Seite 3: Newsletter -->
  <div class="page page-break">
    <div class="content">
    <div class="header">
      <h1>${galleryName}</h1>
      <div class="header-info">
        ${suggestions.eventTitle ? `<strong>Event:</strong> ${suggestions.eventTitle}` : ''}
      </div>
    </div>
    
    <h1>E-Mail Newsletter</h1>
    
    <div class="field-group">
      <label>E-Mail Betreff</label>
      <input type="text" id="newsletter-subject" value="${(suggestions.newsletter?.subject || '').replace(/"/g, '&quot;')}" />
    </div>
    
    <div class="field-group">
      <label>Newsletter Inhalt</label>
      <textarea id="newsletter-body" rows="22">${((suggestions.newsletter?.body || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>
    </div>
  </div>

  <script>
    function setFormat(f) {
      document.body.className = 'k2-pr-doc format-' + f;
      var p = document.getElementById('print-page-size');
      if (p) p.textContent = '@media print { @page { size: ' + (f === 'a4' ? 'A4' : f === 'a3' ? 'A3' : 'A5') + '; margin: 15mm; } }';
    }
    function goBack() {
      var adminUrl = window.location.origin + '/admin'
      
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(function() {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          // Falls Fehler, navigiere direkt
        }
      }
      
      window.location.href = adminUrl
    }
    
    function saveAllChanges() {
      var changes = {
        presseaussendung: {
          title: document.getElementById('presse-title').value,
          content: document.getElementById('presse-content').value
        },
        socialMedia: {
          instagram: document.getElementById('instagram-post').value,
          facebook: document.getElementById('facebook-post').value
        },
        newsletter: {
          subject: document.getElementById('newsletter-subject').value,
          body: document.getElementById('newsletter-body').value
        }
      }
      
      // Kopiere die Änderungen in die Zwischenablage
      navigator.clipboard.writeText(JSON.stringify(changes, null, 2)).then(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      }).catch(function() {
        var btn = event.target
        btn.textContent = '✅ Gespeichert'
        btn.style.background = '#10b981'
        setTimeout(function() {
          goBack()
        }, 1500)
      })
    }
    
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    var autoCloseTimeout = null
    function handleAfterPrint() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
      setTimeout(function() {
        goBack()
      }, 1000)
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    function cleanup() {
      window.removeEventListener('afterprint', handleAfterPrint)
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const eid = event?.id || 'unknown'
      const etitle = event?.title || suggestions.eventTitle || 'Event'
      const documentData = {
        id: `pr-editable-all-${eid}-${Date.now()}`,
        name: getNextWerbematerialVorschlagName(eid, etitle, 'pr-alle', 'PR-Vorschläge (alle bearbeitbar)'),
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `pr-suggestions-editable-${etitle.replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente',
        eventId: eid,
        eventTitle: etitle,
        werbematerialTyp: 'pr-alle'
      }
      const existingDocs = loadDocuments()
      const updated = [...existingDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
  }

  // Presseaussendung mit Content generieren (Hilfsfunktion)
  const generatePresseaussendungWithContent = (event: any, content: string) => {
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Presseaussendung - ${event.title}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.95), rgba(12, 16, 28, 0.92));
      border-radius: 24px;
      padding: 3rem;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
      border: 1px solid rgba(95, 251, 241, 0.12);
    }
    h1 {
      font-size: 2.5rem;
      color: #5ffbf1;
      margin-bottom: 1rem;
      letter-spacing: 0.05em;
    }
    .header {
      border-bottom: 2px solid rgba(95, 251, 241, 0.2);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .content {
      line-height: 1.8;
      font-size: 1.1rem;
      white-space: pre-wrap;
      color: #b8c5e0;
    }
    .highlight {
      color: #5ffbf1;
      font-weight: 600;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 1rem 0;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 2rem;">
    <button onclick="window.print()">🖨️ Als PDF speichern</button>
    <button onclick="navigator.clipboard.writeText(document.querySelector('.content').textContent)">📋 Text kopieren</button>
  </div>
  
  <div class="container">
    <div class="header">
      <h1>PRESSEAUSSENDUNG</h1>
    </div>
    <div class="content">${content.replace(/\n/g, '<br>')}</div>
  </div>
  <script>
    function goBack() {
      // Einfacher Ansatz: Immer direkt zur Admin-Seite navigieren
      // Prüfe ob Hash-Router verwendet wird
      const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '')
      const adminUrl = baseUrl + '/admin'
      
      console.log('goBack() - adminUrl:', adminUrl)
      console.log('goBack() - window.location:', window.location.href)
      
      // Wenn es ein Pop-up ist, versuche zu schließen
      if (window.opener && !window.opener.closed) {
        try {
          // Navigiere im Opener zur Admin-Seite
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(() => {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          console.log('Fehler beim Schließen des Pop-ups:', e)
          // Falls Fehler, navigiere direkt
        }
      }
      
      // Direkt zur Admin-Seite navigieren
      console.log('Navigiere zu:', adminUrl)
      window.location.href = adminUrl
    }
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    const handleAfterPrint = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
      goBack()
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    const cleanup = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const documentData = {
        id: `pr-presseaussendung-${event.id}-${Date.now()}`,
        name: getNextWerbematerialVorschlagName(event.id, event.title, 'presse', 'Presseaussendung'),
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `presseaussendung-${event.title.replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente',
        eventId: event.id,
        eventTitle: event.title,
        werbematerialTyp: 'presse'
      }
      const existingDocs = loadDocuments()
      const updated = [...existingDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
    
    alert('✅ Presseaussendung generiert!')
  }

  // Presseaussendung generieren (mit App-Design)
  const generatePresseaussendung = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    const event = selectedEvent || events[0]
    
    // Prüfe ob Vorschläge vorhanden sind
    const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
    
    const content = eventSuggestion?.presseaussendung?.content || generatePresseaussendungContent(event).content
    
    generatePresseaussendungWithContent(event, content)
  }

  // Social Media Posts für spezifisches Event generieren
  const generateSocialMediaPostsForEvent = (event: any) => {
    
    // Prüfe ob Vorschläge vorhanden sind
    const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
    
    const socialContent = eventSuggestion?.socialMedia || generateSocialMediaContent(event)
    const instagramPost = socialContent.instagram
    const facebookPost = socialContent.facebook

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Social Media Posts - ${event.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    h1 {
      font-size: 2rem;
      color: #5ffbf1;
      margin-bottom: 2rem;
      text-align: center;
    }
    .post {
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.95), rgba(12, 16, 28, 0.92));
      border: 1px solid rgba(95, 251, 241, 0.12);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
    }
    .platform {
      font-size: 1.5rem;
      font-weight: 600;
      color: #5ffbf1;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .post-content {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1rem 0;
      white-space: pre-wrap;
      font-size: 1.1rem;
      line-height: 1.8;
      color: #b8c5e0;
      font-family: inherit;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 1rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Social Media Posts</h1>
    
    <div class="post">
      <div class="platform">📱 Instagram</div>
      <div class="post-content">${instagramPost.replace(/\n/g, '<br>')}</div>
      <button onclick="navigator.clipboard.writeText(\`${instagramPost.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">📋 Kopieren</button>
    </div>
    
    <div class="post">
      <div class="platform">📘 Facebook</div>
      <div class="post-content">${facebookPost.replace(/\n/g, '<br>')}</div>
      <button onclick="navigator.clipboard.writeText(\`${facebookPost.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">📋 Kopieren</button>
    </div>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const documentData = {
        id: `pr-socialmedia-${event.id}-${Date.now()}`,
        name: getNextWerbematerialVorschlagName(event.id, event.title, 'social', 'Social Media'),
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `social-media-${event.title.replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente',
        eventId: event.id,
        eventTitle: event.title,
        werbematerialTyp: 'social'
      }
      const existingDocs = loadDocuments()
      const updated = [...existingDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
    
    alert('✅ Social Media Posts generiert!')
  }

  // Social Media Posts generieren (mit App-Design) - Fallback
  const generateSocialMediaPosts = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    generateSocialMediaPostsForEvent(selectedEvent || events[0])
  }

  // Event-Flyer für spezifisches Event generieren
  const generateEventFlyerForEvent = (event: any) => {
    
    // Prüfe ob Vorschläge vorhanden sind
    const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
    
    const flyerContent = eventSuggestion?.flyer || generateFlyerContent(event)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(flyerContent.qrCode)}`
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Flyer - ${flyerContent.headline}</title>
  <style>
    @media print {
      body { margin: 0; background: white; }
      .no-print { display: none; }
      .flyer { background: white !important; color: #1a1f3a !important; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .flyer {
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.98), rgba(12, 16, 28, 0.98));
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 3rem;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
      border: 1px solid rgba(95, 251, 241, 0.12);
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    h1 {
      font-size: 3rem;
      margin: 0 0 2rem 0;
      color: #5ffbf1;
      letter-spacing: 0.02em;
      background: linear-gradient(135deg, #5ffbf1 0%, #33a1ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .event-info {
      font-size: 1.3rem;
      margin: 2rem 0;
      line-height: 2;
      color: #b8c5e0;
    }
    .event-info strong {
      color: #5ffbf1;
    }
    .description {
      margin: 2rem 0;
      line-height: 1.8;
      font-size: 1.1rem;
      color: #b8c5e0;
    }
    .qr-code {
      text-align: center;
      margin: 2rem 0;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
    }
    .qr-code img {
      width: 150px;
      height: 150px;
      border-radius: 8px;
    }
    .contact {
      margin-top: auto;
      font-size: 1rem;
      color: #8fa0c9;
      border-top: 1px solid rgba(95, 251, 241, 0.2);
      padding-top: 1.5rem;
    }
    .contact strong {
      color: #5ffbf1;
      font-size: 1.2rem;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 1rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 2rem;">
    <button onclick="window.print()">🖨️ Drucken (A4)</button>
  </div>
  
  <div class="flyer">
    <div>
      <h1>${flyerContent.headline}</h1>
      
      ${flyerContent.type ? `<p style="font-size: 1.2rem; color: #8fa0c9; margin-bottom: 1rem;">${flyerContent.type === 'galerieeröffnung' ? 'Galerieeröffnung' : flyerContent.type === 'vernissage' ? 'Vernissage' : flyerContent.type === 'finissage' ? 'Finissage' : flyerContent.type === 'öffentlichkeitsarbeit' ? 'Öffentlichkeitsarbeit' : 'Veranstaltung'}</p>` : ''}
      
      <div class="event-info">
        <p><strong>📅 Termindaten:</strong></p>
        <p style="white-space: pre-wrap; margin-left: 1rem;">${flyerContent.date.replace(/\n/g, '<br>')}</p>
        
        ${flyerContent.location ? `<p style="margin-top: 1rem;"><strong>📍 Ort:</strong> ${flyerContent.location}</p>` : ''}
      </div>
      
      ${flyerContent.description ? `<div class="description">${flyerContent.description.replace(/\n/g, '<br>')}</div>` : ''}
    </div>
    
    <div class="qr-code">
      <p style="color: #5ffbf1; font-weight: 600; margin-bottom: 1rem;">Besuch uns online:</p>
      <img src="${qrCodeUrl}" alt="QR Code" />
      <p style="font-size: 0.9rem; margin-top: 0.5rem; color: #8fa0c9;">${flyerContent.qrCode}</p>
    </div>
    
    <div class="contact">
      <p><strong>${flyerContent.contact?.address ? flyerContent.contact.address.split(',')[0] : (galleryData.name || 'K2 Galerie')}</strong></p>
      ${flyerContent.contact?.address ? `<p>${flyerContent.contact.address}</p>` : (galleryData.address ? `<p>${galleryData.address}</p>` : '')}
      ${flyerContent.contact?.phone ? `<p>Tel: ${flyerContent.contact.phone}</p>` : (galleryData.phone ? `<p>Tel: ${galleryData.phone}</p>` : '')}
      ${flyerContent.contact?.email ? `<p>E-Mail: ${flyerContent.contact.email}</p>` : (galleryData.email ? `<p>E-Mail: ${galleryData.email}</p>` : '')}
    </div>
  </div>
  <script>
    function goBack() {
      // Einfacher Ansatz: Immer direkt zur Admin-Seite navigieren
      // Prüfe ob Hash-Router verwendet wird
      const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '')
      const adminUrl = baseUrl + '/admin'
      
      console.log('goBack() - adminUrl:', adminUrl)
      console.log('goBack() - window.location:', window.location.href)
      
      // Wenn es ein Pop-up ist, versuche zu schließen
      if (window.opener && !window.opener.closed) {
        try {
          // Navigiere im Opener zur Admin-Seite
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(() => {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          console.log('Fehler beim Schließen des Pop-ups:', e)
          // Falls Fehler, navigiere direkt
        }
      }
      
      // Direkt zur Admin-Seite navigieren
      console.log('Navigiere zu:', adminUrl)
      window.location.href = adminUrl
    }
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    const handleAfterPrint = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
      goBack()
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    const cleanup = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const documentData = {
        id: `pr-flyer-${event.id}-${Date.now()}`,
        name: getNextWerbematerialVorschlagName(event.id, event.title, 'event-flyer', 'Event-Flyer'),
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `flyer-${event.title.replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente',
        eventId: event.id,
        eventTitle: event.title,
        werbematerialTyp: 'event-flyer'
      }
      const existingDocs = loadDocuments()
      const updated = [...existingDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
    
    alert('✅ Flyer generiert! Bitte im Browser drucken.')
  }

  // Event-Flyer generieren (mit App-Design) - Fallback
  const generateEventFlyer = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    generateEventFlyerForEvent(selectedEvent || events[0])
  }

  // E-Mail-Newsletter für spezifisches Event generieren
  const generateEmailNewsletterForEvent = (event: any) => {
    
    // Prüfe ob Vorschläge vorhanden sind
    const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
    const eventSuggestion = suggestions.find((s: any) => s.eventId === event.id)
    
    const newsletterContent = eventSuggestion?.newsletter || generateNewsletterContent(event)
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Newsletter - ${event.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
    }
    .email {
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.95), rgba(12, 16, 28, 0.92));
      border: 1px solid rgba(95, 251, 241, 0.12);
      border-radius: 24px;
      padding: 3rem;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
    }
    h1 {
      font-size: 2.5rem;
      color: #5ffbf1;
      margin-bottom: 1.5rem;
      letter-spacing: 0.02em;
    }
    .greeting {
      font-size: 1.2rem;
      color: #b8c5e0;
      margin-bottom: 1.5rem;
    }
    .event-box {
      background: rgba(95, 251, 241, 0.1);
      border: 1px solid rgba(95, 251, 241, 0.2);
      border-radius: 16px;
      padding: 1.5rem;
      margin: 1.5rem 0;
    }
    .event-box p {
      margin: 0.75rem 0;
      color: #b8c5e0;
      font-size: 1.1rem;
    }
    .event-box strong {
      color: #5ffbf1;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 2rem;
      text-decoration: none;
      border-radius: 12px;
      margin: 1.5rem 0;
      font-weight: 600;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
    }
    .footer {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(95, 251, 241, 0.2);
      font-size: 0.95rem;
      color: #8fa0c9;
    }
    .footer strong {
      color: #5ffbf1;
      font-size: 1.1rem;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 1rem 0.5rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 2rem;">
    <button onclick="navigator.clipboard.writeText(document.querySelector('.email').outerHTML)">📋 HTML kopieren</button>
  </div>
  
  <div class="container">
    <div class="email">
      <h1>${event.title}</h1>
      
      <p class="greeting">${newsletterContent.greeting}</p>
      
      <div class="event-box" style="white-space: pre-wrap;">
        ${newsletterContent.body.replace(/\n/g, '<br>')}
      </div>
      
      <a href="${galleryData.website || window.location.origin}" class="button">Mehr erfahren →</a>
      
      <div class="footer">
        <p><strong>${galleryData.name || 'K2 Galerie'}</strong></p>
        ${galleryData.address ? `<p>${galleryData.address}</p>` : ''}
        ${galleryData.phone ? `<p>Tel: ${galleryData.phone}</p>` : ''}
        ${galleryData.email ? `<p>E-Mail: ${galleryData.email}</p>` : ''}
      </div>
    </div>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const documentData = {
        id: `pr-newsletter-${event.id}-${Date.now()}`,
        name: getNextWerbematerialVorschlagName(event.id, event.title, 'newsletter', 'Newsletter'),
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `newsletter-${event.title.replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente',
        eventId: event.id,
        eventTitle: event.title,
        werbematerialTyp: 'newsletter'
      }
      const existingDocs = loadDocuments()
      const updated = [...existingDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
    
    alert('✅ Newsletter generiert! HTML-Code kann kopiert werden.')
  }

  // E-Mail-Newsletter generieren (mit App-Design) - Fallback
  const generateEmailNewsletter = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    generateEmailNewsletterForEvent(selectedEvent || events[0])
  }

  // Plakat für spezifisches Event generieren
  const generatePlakatForEvent = (event: any) => {
    let blob: Blob | null = null // WICHTIG: Außerhalb try-catch definieren
    
    try {
      console.log('generatePlakatForEvent aufgerufen mit Event:', event)
      
      if (!event) {
        console.error('Kein Event übergeben')
        alert('Fehler: Kein Event ausgewählt')
        return
      }
      
      // IMMER frische Daten aus localStorage laden
      const freshGalleryData = JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}')
      const freshSuggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
      const freshEventSuggestion = freshSuggestions.find((s: any) => s.eventId === event.id)
      
      // Generiere Plakat-Content mit aktuellen Daten
      let plakatContent = freshEventSuggestion?.plakat || generatePlakatContent(event)
      
      // Sicherstellen dass alle Werte vorhanden sind und mit aktuellen Daten aktualisieren
      if (!plakatContent || typeof plakatContent !== 'object') {
        plakatContent = generatePlakatContent(event)
      }
      
      // Aktualisiere mit neuesten Event-Daten
      plakatContent.title = event.title || plakatContent.title || 'Event'
      plakatContent.date = formatEventDates(event) || plakatContent.date || 'Datum folgt'
      plakatContent.location = event.location || plakatContent.location || freshGalleryData.address || ''
      plakatContent.description = event.description || plakatContent.description || ''
      
      // QR-Code: Verwende Website-URL oder Homepage-URL
      const websiteUrl = freshGalleryData.website || window.location.origin
      plakatContent.qrCode = websiteUrl
      
      // Event-Typ aktualisieren
      const eventTypeNames: Record<string, string> = {
        galerieeröffnung: 'Galerieeröffnung',
        vernissage: 'Vernissage',
        finissage: 'Finissage',
        öffentlichkeitsarbeit: 'Öffentlichkeitsarbeit',
        sonstiges: 'Veranstaltung'
      }
      plakatContent.type = eventTypeNames[event.type] || plakatContent.type || 'Veranstaltung'
      
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(plakatContent.qrCode)}`
      
      // Verwende die bereits geladenen frischen Galerie-Daten
      const currentGalleryData = freshGalleryData
      
      console.log('Plakat Content:', plakatContent)
      console.log('Event:', event)
      console.log('QR Code URL:', qrCodeUrl)
      console.log('Aktuelle Galerie-Daten:', currentGalleryData)
    
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Plakat - ${plakatContent.title}</title>
  <style>
    @media print {
      body { margin: 0; background: white !important; }
      .no-print { display: none; }
      .plakat { width: 297mm; height: 420mm; background: white !important; color: #1a1f3a !important; }
      .plakat h1 { color: #1a1f3a !important; }
      .plakat .event-info { color: #333 !important; }
      .plakat .contact { color: #666 !important; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .plakat {
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.98), rgba(12, 16, 28, 0.98));
      width: 297mm;
      min-height: 420mm;
      margin: 0 auto;
      padding: 4rem;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
      border: 1px solid rgba(95, 251, 241, 0.12);
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      font-size: 5rem;
      margin: 0 0 3rem 0;
      color: #5ffbf1;
      text-align: center;
      letter-spacing: 0.02em;
      background: linear-gradient(135deg, #5ffbf1 0%, #33a1ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }
    .event-info {
      font-size: 2rem;
      text-align: center;
      margin: 2rem 0;
      line-height: 2.5;
      color: #b8c5e0;
    }
    .event-info strong {
      color: #5ffbf1;
      font-size: 2.2rem;
    }
    .qr-code {
      text-align: center;
      margin: 3rem 0;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
    }
    .qr-code img {
      width: 250px;
      height: 250px;
      border-radius: 12px;
    }
    .qr-code p {
      font-size: 1.2rem;
      margin-top: 1rem;
      color: #8fa0c9;
    }
    .contact {
      text-align: center;
      font-size: 1.5rem;
      color: #8fa0c9;
      margin-top: auto;
      width: 100%;
      padding-top: 2rem;
      border-top: 2px solid rgba(95, 251, 241, 0.2);
    }
    .contact strong {
      color: #5ffbf1;
      font-size: 1.8rem;
      display: block;
      margin-bottom: 0.5rem;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 1rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 2rem;">
    <button onclick="goBack(); return false;" style="background: #6b7280; margin-right: 8px; cursor: pointer;">← Zurück</button>
    <button onclick="window.print(); return false;">🖨️ Drucken (A3)</button>
  </div>
  
  <div class="plakat">
    <h1>${String(plakatContent.title || 'Event').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h1>
    
    ${plakatContent.type ? `<p style="font-size: 2rem; color: #8fa0c9; margin-bottom: 2rem; text-align: center;">${String(plakatContent.type).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : ''}
    
    <div class="event-info">
      <p><strong>Termindaten:</strong></p>
      <p style="white-space: pre-wrap; font-size: 1.8rem; line-height: 1.6; margin-top: 1rem;">${String(plakatContent.date || 'Datum folgt').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>
      
      ${plakatContent.location ? `<p style="margin-top: 2rem; font-size: 1.6rem;">📍 ${String(plakatContent.location).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : ''}
      
      ${plakatContent.description ? `<p style="margin-top: 2rem; font-size: 1.4rem; line-height: 1.6; color: #b8c5e0;">${String(plakatContent.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>` : ''}
    </div>
    
    <div class="qr-code">
      <img src="${qrCodeUrl}" alt="QR Code" />
      <p>${String(plakatContent.qrCode || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </div>
    
    <div class="contact">
      <p><strong>${String(currentGalleryData.name || 'K2 Galerie').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong></p>
      ${currentGalleryData.address ? `<p>${String(currentGalleryData.address).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : ''}
      ${currentGalleryData.phone ? `<p>${String(currentGalleryData.phone).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : ''}
      ${currentGalleryData.email ? `<p>${String(currentGalleryData.email).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : ''}
    </div>
  </div>
  
  <script>
    function goBack() {
      var adminUrl = window.location.origin + '/admin'
      
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(function() {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          // Falls Fehler, navigiere direkt
        }
      }
      
      window.location.href = adminUrl
    }
  </script>
</body>
</html>
    `
      
      console.log('HTML generiert, Länge:', html.length)

      blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      
      console.log('Plakat HTML generiert, Größe:', blob.size, 'bytes')
      console.log('Plakat URL erstellt:', url.substring(0, 50) + '...')
      
      // Versuche Fenster zu öffnen
      const pdfWindow = window.open(url, '_blank', 'noopener,noreferrer')
      
      if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed === 'undefined') {
        // Pop-up blockiert - öffne als Link ohne Download-Attribut
        console.log('Popup blockiert, verwende Fallback-Link')
        URL.revokeObjectURL(url)
        const newUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = newUrl
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        setTimeout(() => {
          document.body.removeChild(link)
          // URL nicht sofort revoken - Browser braucht Zeit zum Laden
          setTimeout(() => {
            console.log('Revoking fallback URL nach 15 Sekunden')
            URL.revokeObjectURL(newUrl)
          }, 15000)
        }, 100)
      } else {
        // Fenster erfolgreich geöffnet - Cleanup NUR wenn Fenster geschlossen wird
        // WICHTIG: URL nicht sofort revoken, sonst wird Seite weiß!
        console.log('Fenster erfolgreich geöffnet')
        
        // Warte bis Seite geladen ist bevor wir URL revoken
        pdfWindow.addEventListener('load', function() {
          console.log('Plakat-Seite geladen')
        })
        
        pdfWindow.addEventListener('beforeunload', function() {
          console.log('Fenster wird geschlossen, revoke URL')
          URL.revokeObjectURL(url)
        })
        
        // Fallback: Cleanup nach 60 Sekunden (falls beforeunload nicht funktioniert)
        setTimeout(function() {
          if (pdfWindow.closed) {
            console.log('Fenster geschlossen (Timeout), revoke URL')
            URL.revokeObjectURL(url)
          } else {
            console.log('Fenster noch offen nach 60 Sekunden, URL bleibt aktiv')
          }
        }, 60000)
      }
    } catch (error) {
      console.error('Fehler beim Generieren des Plakats:', error)
      alert('Fehler beim Generieren des Plakats: ' + (error instanceof Error ? error.message : String(error)))
      return // WICHTIG: Return wenn Fehler, damit blob nicht verwendet wird
    }
    
    // Speichere auch in Dokumente-Sektion (nur wenn blob erfolgreich erstellt wurde)
    if (blob) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const documentData = {
          id: `pr-plakat-${event.id}-${Date.now()}`,
          name: getNextWerbematerialVorschlagName(event.id, event.title, 'plakat', 'Plakat'),
          type: 'text/html',
          size: blob!.size,
          data: reader.result as string,
          fileName: `plakat-${event.title.replace(/\s+/g, '-').toLowerCase()}.html`,
          uploadedAt: new Date().toISOString(),
          isPDF: false,
          isPlaceholder: false,
          category: 'pr-dokumente',
          eventId: event.id,
          eventTitle: event.title,
          werbematerialTyp: 'plakat'
        }
        const existingDocs = loadDocuments()
        const updated = [...existingDocs, documentData]
        saveDocuments(updated)
      }
      reader.readAsDataURL(blob)
      
      alert('✅ Plakat generiert! Bitte im Browser drucken (A3 Format).')
    }
  }

  // Plakat generieren (mit App-Design) - Fallback
  const generatePlakat = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    generatePlakatForEvent(selectedEvent || events[0])
  }

  // Pressemappe generieren
  const generatePressemappe = () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Pressemappe - ${galleryData.name || 'K2 Galerie'}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 20mm;
      }
      body { 
        margin: 0; 
        background: white !important;
        padding: 0 !important;
      }
      .no-print { display: none !important; }
      .container {
        background: white !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      h1 {
        color: #1a1a1a !important;
        border-bottom: 3px solid #667eea !important;
        padding-bottom: 15px !important;
      }
      h2 {
        color: #333 !important;
        border-bottom: 2px solid #667eea !important;
        padding-bottom: 10px !important;
      }
      h3 {
        color: #555 !important;
      }
      .section {
        background: #f8f9fa !important;
        border: 1px solid #e0e0e0 !important;
        border-radius: 8px !important;
        border-left: 4px solid #667eea !important;
      }
      p {
        color: #333 !important;
      }
      strong {
        color: #1a1a1a !important;
      }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #f5f5f5;
      color: #1a1a1a;
      padding: 2rem;
      min-height: 100vh;
      line-height: 1.7;
    }
    .container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 30mm 25mm;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #667eea;
      font-size: 2.5rem;
      margin-bottom: 20px;
      letter-spacing: -0.02em;
      border-bottom: 3px solid #667eea;
      padding-bottom: 15px;
      font-weight: 700;
    }
    h2 {
      color: #333;
      margin-top: 35px;
      margin-bottom: 20px;
      font-size: 1.6rem;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
      font-weight: 600;
    }
    h3 {
      color: #555;
      margin-top: 20px;
      margin-bottom: 10px;
      font-size: 1.3rem;
      font-weight: 600;
    }
    .section {
      margin: 25px 0;
      padding: 20px 25px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      border-left: 4px solid #667eea;
    }
    p {
      color: #333;
      line-height: 1.8;
      margin: 10px 0;
      font-size: 1.05rem;
    }
    strong {
      color: #1a1a1a;
      font-weight: 600;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      font-family: 'Arial', sans-serif;
      margin: 8px;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
    .no-print {
      background: #f8f9fa;
      border: 2px solid #667eea;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">🖨️ Als PDF speichern</button>
  </div>
  
  <div class="container">
    <h1>PRESSEMAPPE</h1>
    <h2>${galleryData.name || 'K2 Galerie'}</h2>
    
    <div class="section">
      <h2>Galerie-Informationen</h2>
      <p><strong>Name:</strong> ${galleryData.name || 'K2 Galerie'}</p>
      ${galleryData.address ? `<p><strong>Adresse:</strong> ${galleryData.address}</p>` : ''}
      ${galleryData.phone ? `<p><strong>Telefon:</strong> ${galleryData.phone}</p>` : ''}
      ${galleryData.email ? `<p><strong>E-Mail:</strong> ${galleryData.email}</p>` : ''}
      ${galleryData.website ? `<p><strong>Website:</strong> ${galleryData.website}</p>` : ''}
      ${galleryData.openingHours ? `<p><strong>Öffnungszeiten:</strong> ${galleryData.openingHours}</p>` : ''}
    </div>
    
    <div class="section">
      <h2>Künstler</h2>
      <h3>${martinaData.name}</h3>
      <p>${martinaData.bio}</p>
      ${martinaData.email ? `<p>E-Mail: ${martinaData.email}</p>` : ''}
      ${martinaData.phone ? `<p>Telefon: ${martinaData.phone}</p>` : ''}
      
      <h3>${georgData.name}</h3>
      <p>${georgData.bio}</p>
      ${georgData.email ? `<p>E-Mail: ${georgData.email}</p>` : ''}
      ${georgData.phone ? `<p>Telefon: ${georgData.phone}</p>` : ''}
    </div>
    
    <div class="section">
      <h2>Aktuelle Events</h2>
      ${events.slice(0, 5).map(event => `
        <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e0e0e0; border-left: 3px solid #667eea;">
          <h3>${event.title}</h3>
          <p><strong>Datum:</strong> ${new Date(event.date).toLocaleDateString('de-DE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}${event.endDate && event.endDate !== event.date ? ` - ${new Date(event.endDate).toLocaleDateString('de-DE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}` : ''}</p>
          ${event.location ? `<p><strong>Ort:</strong> ${event.location}</p>` : ''}
          ${event.description ? `<p>${event.description}</p>` : ''}
        </div>
      `).join('')}
    </div>
    
    <div class="section">
      <h2>Kontakt für Presseanfragen</h2>
      <p>${galleryData.email || ''}</p>
      <p>${galleryData.phone || ''}</p>
    </div>
  </div>
  <script>
    function goBack() {
      // Einfacher Ansatz: Immer direkt zur Admin-Seite navigieren
      // Prüfe ob Hash-Router verwendet wird
      const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '')
      const adminUrl = baseUrl + '/admin'
      
      console.log('goBack() - adminUrl:', adminUrl)
      console.log('goBack() - window.location:', window.location.href)
      
      // Wenn es ein Pop-up ist, versuche zu schließen
      if (window.opener && !window.opener.closed) {
        try {
          // Navigiere im Opener zur Admin-Seite
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(() => {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          console.log('Fehler beim Schließen des Pop-ups:', e)
          // Falls Fehler, navigiere direkt
        }
      }
      
      // Direkt zur Admin-Seite navigieren
      console.log('Navigiere zu:', adminUrl)
      window.location.href = adminUrl
    }
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    const handleAfterPrint = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
      goBack()
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    const cleanup = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    alert('✅ Pressemappe generiert!')
  }

  // Website-Content generieren
  const generateWebsiteContent = () => {
    const selectedEvent = events.find(e => e.type === 'öffentlichkeitsarbeit' || events.length > 0 ? events[0] : null)
    if (!selectedEvent && events.length === 0) {
      alert('Bitte zuerst ein Event erstellen')
      return
    }
    const event = selectedEvent || events[0]
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Website Content - ${event.title}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 20mm;
      }
      body { 
        margin: 0; 
        background: white !important;
        padding: 0 !important;
      }
      .no-print { display: none !important; }
      .container {
        max-width: 100% !important;
      }
      h1 {
        color: #1a1a1a !important;
        border-bottom: 3px solid #667eea !important;
        padding-bottom: 15px !important;
      }
      h2 {
        color: #333 !important;
        border-bottom: 2px solid #667eea !important;
        padding-bottom: 10px !important;
      }
      .content {
        background: #f8f9fa !important;
        border: 1px solid #e0e0e0 !important;
        border-radius: 8px !important;
        border-left: 4px solid #667eea !important;
        box-shadow: none !important;
      }
      pre {
        background: white !important;
        border: 1px solid #ddd !important;
        color: #1a1a1a !important;
      }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      background: #f5f5f5;
      color: #1a1a1a;
      padding: 2rem;
      min-height: 100vh;
      line-height: 1.7;
    }
    .container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 30mm 25mm;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #667eea;
      font-size: 2.2rem;
      margin-bottom: 30px;
      letter-spacing: -0.02em;
      border-bottom: 3px solid #667eea;
      padding-bottom: 15px;
      font-weight: 700;
    }
    .content {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      padding: 25px;
      margin: 25px 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    h2 {
      color: #333;
      font-size: 1.4rem;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
      font-weight: 600;
    }
    pre {
      background: white;
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 6px;
      overflow-x: auto;
      color: #1a1a1a;
      font-family: 'Courier New', 'Monaco', monospace;
      font-size: 0.9rem;
      line-height: 1.6;
      margin: 15px 0;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      margin: 10px 10px 10px 0;
      font-weight: 600;
      font-size: 1rem;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      font-family: 'Arial', sans-serif;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
    .no-print {
      background: #f8f9fa;
      border: 2px solid #667eea;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">🖨️ Als PDF speichern</button>
  </div>
  
  <div class="container">
    <h1>Website Content für: ${event.title}</h1>
    
    <div class="content">
      <h2>HTML Content</h2>
      <pre id="htmlContent"><section class="event-detail">
  <h2>${event.title}</h2>
  <div class="event-meta">
    <p><strong>Datum:</strong> ${new Date(event.date).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}${event.endDate && event.endDate !== event.date ? ` - ${new Date(event.endDate).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}` : ''}</p>
    ${event.startTime ? `<p><strong>Uhrzeit:</strong> ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''} Uhr</p>` : ''}
    ${event.location ? `<p><strong>Ort:</strong> ${event.location}</p>` : ''}
  </div>
  ${event.description ? `<div class="event-description">${event.description.replace(/\n/g, '<br>')}</div>` : ''}
</section></pre>
      <button onclick="navigator.clipboard.writeText(document.getElementById('htmlContent').textContent)">📋 HTML kopieren</button>
    </div>
    
    <div class="content">
      <h2>Meta Description (SEO)</h2>
      <pre id="metaContent">${event.title} - ${new Date(event.date).toLocaleDateString('de-DE')} bei ${galleryData.name || 'K2 Galerie'}. ${event.description ? event.description.substring(0, 120) : ''}...</pre>
      <button onclick="navigator.clipboard.writeText(document.getElementById('metaContent').textContent)">📋 Meta kopieren</button>
    </div>
  </div>
  <script>
    function goBack() {
      // Einfacher Ansatz: Immer direkt zur Admin-Seite navigieren
      // Prüfe ob Hash-Router verwendet wird
      const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '')
      const adminUrl = baseUrl + '/admin'
      
      console.log('goBack() - adminUrl:', adminUrl)
      console.log('goBack() - window.location:', window.location.href)
      
      // Wenn es ein Pop-up ist, versuche zu schließen
      if (window.opener && !window.opener.closed) {
        try {
          // Navigiere im Opener zur Admin-Seite
          window.opener.location.href = adminUrl
          window.opener.focus()
          setTimeout(() => {
            try {
              window.close()
            } catch (e) {
              // Ignorieren
            }
          }, 100)
          return
        } catch (e) {
          console.log('Fehler beim Schließen des Pop-ups:', e)
          // Falls Fehler, navigiere direkt
        }
      }
      
      // Direkt zur Admin-Seite navigieren
      console.log('Navigiere zu:', adminUrl)
      window.location.href = adminUrl
    }
    // Nach Drucken automatisch zurücknavigieren - mit Cleanup
    const handleAfterPrint = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
      goBack()
    }
    window.addEventListener('afterprint', handleAfterPrint)
    
    // Cleanup beim Schließen - KRITISCH für Crash-Prävention
    const cleanup = () => {
      window.removeEventListener('afterprint', handleAfterPrint)
    }
    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('unload', cleanup)
  </script>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const documentData = {
        id: `pr-website-content-${event.id}-${Date.now()}`,
        name: `Website-Content - ${event.title}`,
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `website-content-${event.title.replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente',
        eventId: event.id,
        eventTitle: event.title
      }
      const existingDocs = loadDocuments()
      const filteredDocs = existingDocs.filter((d: any) => 
        !(d.category === 'pr-dokumente' && d.eventId === event.id && d.name.includes('Website-Content'))
      )
      const updated = [...filteredDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
    
    alert('✅ Website-Content generiert!')
  }

  // Katalog generieren
  const generateKatalog = () => {
    const artworks = loadArtworks()
    if (artworks.length === 0) {
      alert('Bitte zuerst Werke hinzufügen')
      return
    }
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Katalog - ${galleryData.name || 'K2 Galerie'}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 20mm;
      }
      body { 
        margin: 0; 
        background: white !important;
        padding: 0 !important;
      }
      .no-print { display: none !important; }
      .container {
        background: white !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      h1 {
        color: #1a1a1a !important;
        border-bottom: 3px solid #667eea !important;
        padding-bottom: 15px !important;
      }
      h2 {
        color: #333 !important;
      }
      .artwork {
        background: #f8f9fa !important;
        border: 1px solid #e0e0e0 !important;
        border-radius: 8px !important;
        border-left: 4px solid #667eea !important;
        box-shadow: none !important;
        page-break-inside: avoid;
      }
      .artwork-title {
        color: #1a1a1a !important;
      }
      .artwork-info p {
        color: #333 !important;
      }
      .artwork-info strong {
        color: #1a1a1a !important;
      }
      .artwork-image {
        border-color: #ddd !important;
      }
      .footer {
        color: #666 !important;
        border-top-color: #ddd !important;
      }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #f5f5f5;
      color: #1a1a1a;
      padding: 2rem;
      min-height: 100vh;
      line-height: 1.7;
    }
    .container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 30mm 25mm;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #667eea;
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 20px;
      letter-spacing: -0.02em;
      border-bottom: 3px solid #667eea;
      padding-bottom: 15px;
      font-weight: 700;
    }
    h2 {
      color: #333;
      text-align: center;
      font-size: 1.6rem;
      margin-bottom: 30px;
      font-weight: 600;
    }
    .artwork {
      margin: 25px 0;
      padding: 20px;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      display: flex;
      gap: 25px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    .artwork-image {
      width: 180px;
      height: 180px;
      object-fit: cover;
      border-radius: 6px;
      border: 2px solid #ddd;
      flex-shrink: 0;
    }
    .artwork-info {
      flex: 1;
    }
    .artwork-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 15px 0;
      color: #1a1a1a;
    }
    .artwork-info p {
      color: #333;
      margin: 8px 0;
      font-size: 1.05rem;
    }
    .artwork-info strong {
      color: #1a1a1a;
      font-weight: 600;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      font-family: 'Arial', sans-serif;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #666;
      padding-top: 25px;
      border-top: 2px solid #ddd;
      font-size: 1rem;
    }
    .no-print {
      background: #f8f9fa;
      border: 2px solid #667eea;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="no-print" style="text-align: center; margin-bottom: 2rem;">
      <button onclick="window.print()">🖨️ Als PDF speichern</button>
    </div>
    
    <h1>KATALOG</h1>
    <h2>${galleryData.name || 'K2 Galerie'}</h2>
    
    ${artworks.map((artwork: any) => `
    <div class="artwork">
      ${artwork.imageUrl ? `<img src="${artwork.imageUrl}" alt="${artwork.title}" class="artwork-image" />` : ''}
      <div class="artwork-info">
        <div class="artwork-title">${artwork.title}</div>
        <p><strong>Künstler:</strong> ${artwork.artist}</p>
        <p><strong>Kategorie:</strong> ${getCategoryLabel(artwork.category)}</p>
        ${artwork.description ? `<p>${artwork.description}</p>` : ''}
        <p><strong>Preis:</strong> €${artwork.price?.toFixed(2) || '0.00'}</p>
        <p><strong>Nummer:</strong> ${artwork.number || artwork.id}</p>
      </div>
    </div>
  `).join('')}
    
    <div class="footer">
      <p><strong>${galleryData.name || 'K2 Galerie'}</strong></p>
      ${galleryData.address ? `<p>${galleryData.address}</p>` : ''}
      ${galleryData.email ? `<p>${galleryData.email}</p>` : ''}
      ${galleryData.phone ? `<p>${galleryData.phone}</p>` : ''}
    </div>
  </div>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    openPDFWindowSafely(blob, 'Presseaussendung')
    
    // Speichere auch in Dokumente-Sektion
    const reader = new FileReader()
    reader.onloadend = () => {
      const documentData = {
        id: `pr-katalog-${Date.now()}`,
        name: `Katalog - ${galleryData.name || 'K2 Galerie'}`,
        type: 'text/html',
        size: blob.size,
        data: reader.result as string,
        fileName: `katalog-${(galleryData.name || 'k2-galerie').replace(/\s+/g, '-').toLowerCase()}.html`,
        uploadedAt: new Date().toISOString(),
        isPDF: false,
        isPlaceholder: false,
        category: 'pr-dokumente'
      }
      const existingDocs = loadDocuments()
      const filteredDocs = existingDocs.filter((d: any) => 
        !(d.category === 'pr-dokumente' && d.name.includes('Katalog'))
      )
      const updated = [...filteredDocs, documentData]
      saveDocuments(updated)
    }
    reader.readAsDataURL(blob)
    
    alert('✅ Katalog generiert!')
  }

  // Dokument zu Event hinzufügen
  const handleAddEventDocument = async () => {
    if (!eventDocumentFile || !eventDocumentName || !selectedEventForDocument) {
      alert('Bitte Datei und Name auswählen')
      return
    }

    try {
      // Datei zu Data URL konvertieren
      const reader = new FileReader()
      reader.onloadend = () => {
        const documentData = {
          id: `doc-${Date.now()}`,
          name: eventDocumentName,
          type: eventDocumentType,
          fileData: reader.result as string,
          fileName: eventDocumentFile.name,
          fileType: eventDocumentFile.type,
          addedAt: new Date().toISOString()
        }

        const updatedEvents = events.map(event => {
          if (event.id === selectedEventForDocument) {
            return {
              ...event,
              documents: [...(event.documents || []), documentData]
            }
          }
          return event
        })

        setEvents(updatedEvents)
        saveEvents(updatedEvents)
        
        // Zurücksetzen
        setShowDocumentModal(false)
        setSelectedEventForDocument(null)
        setEventDocumentFile(null)
        setEventDocumentName('')
        setEventDocumentType('flyer')
        
        alert('✅ Dokument hinzugefügt!')
      }
      reader.readAsDataURL(eventDocumentFile)
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Dokuments:', error)
      alert('Fehler beim Hinzufügen des Dokuments')
    }
  }

  // Dokument von Event löschen
  const handleDeleteEventDocument = (eventId: string, documentId: string) => {
    if (confirm('Möchtest du dieses Dokument wirklich löschen?')) {
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            documents: (event.documents || []).filter((doc: any) => doc.id !== documentId)
          }
        }
        return event
      })

      setEvents(updatedEvents)
      saveEvents(updatedEvents)
      alert('✅ Dokument gelöscht!')
    }
  }

  // Eintrag aus Liste entfernen (z. B. K2 Flyer / Presse-Einladung aus Anzeige ausblenden)
  const handleHideFromEventList = (eventId: string, docId: string) => {
    const updatedEvents = events.map(event => {
      if (event.id !== eventId) return event
      const hidden = [...(event.hiddenDocIds || []), docId]
      return { ...event, hiddenDocIds: hidden }
    })
    setEvents(updatedEvents)
    saveEvents(updatedEvents)
  }

  // Fertiges Dummy-Dokument zum Absenden: Nutzer-Design + Stammdaten + Foto (wie versprochen).
  const buildReadyToSendDocumentHtml = (docKind: 'einladung' | 'presse', eventTitle: string, eventDate: string): string => {
    const esc = (s: string) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    const d = designSettings || OEF_DESIGN_DEFAULT
    const g = galleryData || { address: MUSTER_TEXTE.gallery.address, city: MUSTER_TEXTE.gallery.city, country: MUSTER_TEXTE.gallery.country, email: MUSTER_TEXTE.gallery.email, phone: MUSTER_TEXTE.gallery.phone, openingHours: MUSTER_TEXTE.gallery.openingHours, name: 'Galerie Muster' }
    const m = martinaData?.name || MUSTER_TEXTE.martina.name
    const p = georgData?.name || MUSTER_TEXTE.georg.name
    const adresse = [g.address, g.city, g.country].filter(Boolean).join(', ') || 'Musterstraße 1, 12345 Musterstadt'
    const imageUrl = (pageContent?.welcomeImage && pageContent.welcomeImage.startsWith('data:')) ? pageContent.welcomeImage : (allArtworks?.[0]?.imageUrl && allArtworks[0].imageUrl.startsWith('data:')) ? allArtworks[0].imageUrl : (pageContent?.welcomeImage || allArtworks?.[0]?.imageUrl || '')
    const accent = d.accentColor || '#5a7a6e'
    const bg = d.backgroundColor1 || '#f6f4f0'
    const text = d.textColor || '#2d2d2a'
    const muted = d.mutedColor || '#5c5c57'
    const imgBlock = imageUrl ? `<div style="margin-bottom:1.5rem;"><img src="${imageUrl.replace(/"/g, '&quot;')}" alt="" style="width:100%; max-width:560px; height:auto; display:block; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.12);" /></div>` : ''
    if (docKind === 'einladung') {
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Einladung zur Vernissage</title><style>body{font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:2rem 1.5rem;line-height:1.65;color:${text};background:${bg}}h1{font-size:1.6rem;border-bottom:3px solid ${accent};padding-bottom:.5rem;margin-top:0}p{margin:.75rem 0}.meta{color:${muted};font-size:.95rem}@media print{body{background:#fff;color:#111}h1{border-color:#333}.meta{color:#555}}</style></head><body>${imgBlock}<h1>Einladung zur Vernissage</h1><p><strong>${esc(g.name || 'Galerie Muster')}</strong> – Malerei, Keramik, Grafik &amp; Skulptur</p><p class="meta">${esc(eventDate)}</p><p>${esc(adresse)}</p><p>Sehr geehrte Damen und Herren,</p><p>wir laden Sie herzlich zur Eröffnung unserer Ausstellung ein. ${esc(m)} und ${esc(p)} präsentieren neue Arbeiten aus allen Sparten: Malerei und Grafik, Keramik und Skulptur. Die Vernissage bietet Gelegenheit, die Künstler:innen kennenzulernen und die Werke in entspannter Atmosphäre zu entdecken.</p><p>Für Getränke und einen kleinen Imbiss ist gesorgt. Wir freuen uns auf Ihren Besuch und anregende Gespräche.</p><p>Um Anmeldung wird gebeten: ${esc(g.email || '')}</p><p class="meta" style="margin-top:2rem;">Öffnungszeiten: ${esc(g.openingHours || '')}</p><p class="meta">Mit freundlichen Grüßen<br>${esc(g.name || 'Galerie Muster')}</p></body></html>`
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Presseinformation</title><style>body{font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:2rem 1.5rem;line-height:1.65;color:${text};background:${bg}}h1{font-size:1.4rem;border-bottom:3px solid ${accent};padding-bottom:.4rem;margin-top:0}p{margin:.6rem 0}.meta{color:${muted};font-size:.9rem}@media print{body{background:#fff;color:#111}h1{border-color:#333}.meta{color:#555}}</style></head><body>${imgBlock}<h1>Presseinformation – Vernissage</h1><p><strong>${esc(g.name || 'Galerie Muster')}</strong> lädt zur Eröffnung der Ausstellung ein.</p><p class="meta">${esc(eventDate)}<br>${esc(adresse)}</p><p>${esc(m)} (Malerei, Grafik) und ${esc(p)} (Keramik, Skulptur) zeigen aktuelle Werke in einer gemeinsamen Schau. Die Ausstellung spannt einen Bogen von großformatigen Bildern über grafische Arbeiten bis zu keramischen Objekten und Skulptur – ein Querschnitt durch das aktuelle Schaffen beider Künstler:innen.</p><p>Die Vernissage am Eröffnungsabend bietet Presse und Gästen die Möglichkeit, die Werke in Anwesenheit der Künstler:innen zu sehen und mit ihnen ins Gespräch zu kommen. Im Anschluss ist die Ausstellung zu den regulären Öffnungszeiten der Galerie zugänglich.</p><p>Für Rückfragen, Bildmaterial oder Interviewwünsche stehen wir gern zur Verfügung.</p><p>Kontakt: ${esc(g.email || '')}${g.phone ? ', ' + esc(g.phone) : ''}</p><p class="meta" style="margin-top:1.5rem;">Öffnungszeiten: ${esc(g.openingHours || '')}</p></body></html>`
  }

  // Dokument öffnen/anschauen (documentUrl = Link zum Projekt-Flyer, z. B. K2 Galerie Flyer). Unterstützt auch data/fileData aus globalem Speicher.
  // Bei Einladung/Presse: Fertiges Dummy-Dokument im Nutzer-Design mit Stammdaten + Foto (zum Absenden bereit).
  const handleViewEventDocument = (document: any, event?: any) => {
    if (document.documentUrl) {
      window.open(document.documentUrl, '_blank')
      return
    }
    const fileType = document.fileType || document.type || ''
    const eventTitle = event?.title || 'Vernissage – Neue Arbeiten'
    const eventDate = (event?.date ? new Date(event.date).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + (event?.startTime ? ', ' + event.startTime + ' Uhr' : ', 18 Uhr') : 'Samstag, 15. März 2026, 18 Uhr')
    const isEinladung = document.name && String(document.name).toLowerCase().includes('einladung')
    const isPresse = document.name && String(document.name).toLowerCase().includes('presse')
    if (isEinladung || isPresse) {
      const html = buildReadyToSendDocumentHtml(isEinladung ? 'einladung' : 'presse', eventTitle, eventDate)
      try {
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const opened = window.open(url, '_blank')
        if (!opened) {
          alert('Pop-up wurde blockiert. Bitte erlaube Fenster für diese Seite, dann erneut auf das Dokument klicken.')
        }
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      } catch (e) {
        const newWindow = window.open()
        if (newWindow) {
          newWindow.document.write(html)
          newWindow.document.close()
        }
      }
      return
    }
    const fileData = document.fileData || document.data
    const newWindow = window.open()
    if (newWindow && fileData) {
      newWindow.document.write(`
        <html>
          <head><title>${(document.name || '').replace(/</g, '&lt;')}</title></head>
          <body style="margin:0; padding:20px; background:#f5f5f5;">
            ${fileType?.includes('pdf')
              ? `<iframe src="${fileData}" style="width:100%; height:100vh; border:none;"></iframe>`
              : fileType?.includes('image')
              ? `<img src="${fileData}" style="max-width:100%; height:auto;" />`
              : fileType?.includes('html')
              ? `<iframe src="${fileData}" style="width:100%; height:100vh; border:none;"></iframe>`
              : `<a href="${fileData}" download="${(document.fileName || document.name || '').replace(/</g, '&lt;')}">Download: ${(document.name || '').replace(/</g, '&lt;')}</a>`
            }
          </body>
        </html>
      `)
    }
  }

  // Vita als Dokument öffnen (gleiches Design wie Einladung/Presse) – für Außenkommunikation, Druck/PDF
  const openVitaDocument = (personId: 'martina' | 'georg') => {
    const person = personId === 'martina' ? martinaData : georgData
    const design = designSettings || OEF_DESIGN_DEFAULT
    const html = buildVitaDocumentHtml(personId, {
      name: person?.name || '',
      email: person?.email,
      phone: person?.phone,
      website: person?.website,
      vita: person?.vita || (personId === 'martina' ? MUSTER_VITA_MARTINA : MUSTER_VITA_GEORG)
    }, {
      accentColor: design.accentColor,
      backgroundColor1: design.backgroundColor1,
      textColor: design.textColor,
      mutedColor: design.mutedColor
    }, galleryData?.name)
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const opened = window.open(url, '_blank')
      if (!opened) alert('Pop-up wurde blockiert. Bitte Fenster erlauben und erneut klicken.')
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (e) {
      const w = window.open()
      if (w) { w.document.write(html); w.document.close() }
    }
  }

  // Werbematerial-Vorschlag aus globalem Dokumentenspeicher löschen
  const handleDeleteWerbematerialDocument = (documentId: string) => {
    if (!confirm('Diesen Vorschlag wirklich löschen?')) return
    const updated = documents.filter((d: any) => d.id !== documentId)
    saveDocuments(updated)
    setDocuments(updated)
    setPrSuggestionsRefresh((r: number) => r + 1)
  }

  // Event löschen
  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Möchtest du dieses Event wirklich löschen?')) {
      const updatedEvents = events.filter(e => e.id !== eventId)
      setEvents(updatedEvents)
      saveEvents(updatedEvents)
      alert('✅ Event gelöscht!')
    }
  }

  // Eröffnungsevent 24.–26. April anlegen (wie gestern angelegt) – Dokumente danach im Event hinzufügen
  const handleCreateEröffnungsevent = () => {
    const location = [galleryData.address, galleryData.city, galleryData.country].filter(Boolean).join(', ') || ''
    const newEvent = {
      id: `event-${Date.now()}`,
      title: 'Eröffnung der K2 Galerie',
      type: 'galerieeröffnung',
      date: '2026-04-24',
      endDate: '2026-04-26',
      startTime: '',
      endTime: '',
      dailyTimes: {} as Record<string, { start: string; end: string }>,
      description: '',
      location,
      documents: [] as any[],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updated = [...events, newEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    setEvents(updated)
    saveEvents(updated)
    alert('✅ Eröffnungsevent 24.–26. April wieder angelegt!\n\nDokumente zu diesem Event: Marketing → Öffentlichkeitsarbeit → Rubrik dieses Events → „Dokument zu dieser Rubrik hinzufügen“. Danach „Veröffentlichen“.')
  }

  // Beispiel: Ateliersbesichtigung bei Paul Weber (vor 1 Woche) mit Einladung + Presse – für Vergangenheit-Demo
  const handleCreateAteliersbesichtigungPaulWeber = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const dateStr = oneWeekAgo.toISOString().slice(0, 10)
    const eventId = `event-atelier-paul-weber-${Date.now()}`
    const newEvent = {
      id: eventId,
      title: 'Ateliersbesichtigung bei Paul Weber',
      type: 'vernissage' as const,
      date: dateStr,
      endDate: dateStr,
      startTime: '14:00',
      endTime: '18:00',
      dailyTimes: {} as Record<string, { start: string; end: string }>,
      description: 'Besichtigung des Ateliers von Paul Weber mit Werken und Gespräch.',
      location: [galleryData.address, galleryData.city, galleryData.country].filter(Boolean).join(', ') || '',
      documents: [
        { id: `${eventId}-einladung`, name: 'Einladung – Ateliersbesichtigung Paul Weber', category: 'pr-dokumente', eventId, werbematerialTyp: 'flyer' },
        { id: `${eventId}-presse`, name: 'Presse – Ateliersbesichtigung Paul Weber', category: 'pr-dokumente', eventId, werbematerialTyp: 'presse' }
      ] as any[],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updated = [...events, newEvent].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setEvents(updated)
    saveEvents(updated)
    alert('✅ Ateliersbesichtigung bei Paul Weber angelegt (Datum vor 1 Woche). Sie erscheint unter „Veranstaltungen der Vergangenheit“ mit Einladung und Presse – anklicken zum Ansehen.')
  }

  // Event-Modal öffnen
  const openEventModal = () => {
    setEditingEvent(null)
    setEventTitle('')
    setEventType('galerieeröffnung')
    setEventDate('')
    setEventEndDate('')
    setEventStartTime('')
    setEventEndTime('')
    setEventDailyTimes({})
    setEventDescription('')
    // Automatisch komplette Adresse aus Stammdaten übernehmen
    setEventLocation([galleryData.address, galleryData.city, galleryData.country].filter(Boolean).join(', ') || '')
    setShowEventModal(true)
  }

  // Komplette Adresse aus Stammdaten (Straße, Ort, Land)
  const fullAddressFromStammdaten = [galleryData.address, galleryData.city, galleryData.country].filter(Boolean).join(', ')

  // Stammdaten in Event-Felder übernehmen
  const applyStammdatenToEvent = () => {
    // Komplette Adresse aus Stammdaten übernehmen (Straße + Ort + Land)
    setEventLocation(fullAddressFromStammdaten || '')
    
    // Kontaktdaten in Beschreibung einfügen (wenn noch keine Beschreibung vorhanden)
    if (!eventDescription) {
      const kontaktInfo: string[] = []
      if (galleryData.phone) kontaktInfo.push(`Tel: ${galleryData.phone}`)
      if (galleryData.email) kontaktInfo.push(`E-Mail: ${galleryData.email}`)
      if (fullAddressFromStammdaten) kontaktInfo.push(`Adresse: ${fullAddressFromStammdaten}`)
      if (galleryData.openingHours) kontaktInfo.push(`Öffnungszeiten: ${galleryData.openingHours}`)
      
      if (kontaktInfo.length > 0) {
        setEventDescription(kontaktInfo.join('\n'))
      }
    }
    
    alert('✅ Stammdaten übernommen (komplette Adresse + ggf. Kontakt in Beschreibung)!')
  }

  // Dokumente speichern (Key abhängig von K2 vs. ök2 – K2-Daten werden in ök2 nie überschrieben)
  const saveDocuments = (docs: any[]) => {
    try {
      localStorage.setItem(getDocumentsKey(), JSON.stringify(docs))
      setDocuments(docs)
    } catch (error: any) {
      console.error('Fehler beim Speichern:', error)
      if (error?.name === 'QuotaExceededError') {
        const freed = tryFreeLocalStorageSpace()
        if (freed > 0) {
          try {
            localStorage.setItem(getDocumentsKey(), JSON.stringify(docs))
            setDocuments(docs)
            return
          } catch (_) {}
        }
        alert('⚠️ ' + SPEICHER_VOLL_MELDUNG)
      } else {
        alert('Fehler beim Speichern. Möglicherweise ist der Speicher voll.')
      }
    }
  }

  // Dokument hochladen
  const handleDocumentUpload = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const base64 = e.target?.result as string
          const newDoc = {
            id: Date.now().toString(),
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64,
            uploadedAt: new Date().toISOString(),
            isPDF: file.type === 'application/pdf'
          }
          const updated = [...documents, newDoc]
          saveDocuments(updated)
          resolve()
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Dokument zu PDF konvertieren
  const convertToPDF = async (doc: any) => {
    if (doc.isPDF) {
      // Bereits PDF - direkt öffnen
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        // Fallback: Download-Link erstellen wenn Pop-up blockiert wird
        if (doc.data) {
          const link = document.createElement('a')
          link.href = doc.data
          link.download = doc.name || `document-${Date.now()}.pdf`
          document.body.appendChild(link)
          link.click()
          setTimeout(() => {
            document.body.removeChild(link)
          }, 100)
          alert('✅ Dokument wurde heruntergeladen!\n\nÖffne die Datei, um sie anzuzeigen.')
        } else {
          alert('⚠️ Pop-up-Blocker verhindert PDF-Öffnung.\n\nBitte erlaube Pop-ups für diese Seite oder öffne das Dokument manuell.')
        }
        return
      }
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${doc.name}</title>
            <style>
              body { margin: 0; padding: 0; }
              iframe { width: 100%; height: 100vh; border: none; }
            </style>
          </head>
          <body>
            <iframe src="${doc.data}"></iframe>
            <script>
              window.onload = () => {
                setTimeout(() => window.print(), 500);
              }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
      return
    }

    // Bild zu PDF konvertieren
    if (doc.type.startsWith('image/')) {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Pop-up-Blocker verhindert PDF-Erstellung.')
        return
      }

      const date = new Date(doc.uploadedAt).toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
      })

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${doc.name} - PDF</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 10mm;
                }
              }
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                text-align: center;
              }
              .header {
                margin-bottom: 20px;
                border-bottom: 2px solid #8b6914;
                padding-bottom: 10px;
              }
              .header h1 {
                margin: 0;
                font-size: 18px;
                color: #8b6914;
              }
              .header p {
                margin: 5px 0 0;
                font-size: 12px;
                color: #666;
              }
              img {
                max-width: 100%;
                max-height: 80vh;
                object-fit: contain;
                margin: 20px 0;
              }
              .footer {
                margin-top: 20px;
                font-size: 10px;
                color: #999;
                border-top: 1px solid #ddd;
                padding-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>K2 GALERIE</h1>
              <p>${doc.name}</p>
              <p>Erstellt am: ${date}</p>
            </div>
            <img src="${doc.data}" alt="${doc.name}" />
            <div class="footer">
              <div>K2 Galerie - Kunst & Keramik</div>
            </div>
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  setTimeout(() => window.close(), 500);
                }, 500);
              }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
      return
    }

    // Andere Formate - versuche als HTML zu rendern
    alert(`Dateiformat "${doc.type}" kann nicht direkt zu PDF konvertiert werden. Bitte konvertiere die Datei manuell zu PDF oder verwende ein Bildformat.`)
  }

  // Dokument löschen
  const deleteDocument = (id: string) => {
    if (confirm('Möchtest du dieses Dokument wirklich löschen?')) {
      const updated = documents.filter(d => d.id !== id)
      saveDocuments(updated)
    }
  }

  // Laufende Nummer generieren - WICHTIG: Finde maximale Nummer aus ALLEN artworks
  // K2: Kategorie-basiert (M/K/G/S/O). ök2: W (Werk). VK2: VK2-M1, VK2-F1 usw. (7 Kunstbereiche)
  const generateArtworkNumber = async (category: string = 'malerei') => {
    const forVk2 = isVk2AdminContext()
    const forOek2 = isOeffentlichAdminContext()
    const letter = getCategoryPrefixLetter(category)
    const categoryPrefix = forVk2 ? `VK2-${letter}` : forOek2 ? 'K2-W-' : `K2-${letter}-`
    const prefix = forOek2 ? 'W' : letter

    // Lade alle artworks (lokal)
    const localArtworks = loadArtworks()
    
    // Versuche auch gallery-data.json zu laden (für Synchronisation ohne Supabase)
    let serverArtworks: any[] = []
    try {
      const response = await fetch('/gallery-data.json?' + Date.now(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        serverArtworks = data.artworks || []
        console.log('📡 Server-Nummern geladen (gallery-data.json):', serverArtworks.length, 'Werke')
      }
    } catch (e) {
      console.log('⚠️ Server-Check fehlgeschlagen, verwende nur lokale Nummer')
    }
    
    // Finde maximale Nummer aus artworks der GLEICHEN Kategorie
    // WICHTIG: Unterstützt auch alte Nummern ohne Präfix
    let maxNumber = 0
    const usedNumbers = new Set<string>()
    
    // ZUERST Server-Nummern prüfen (nur K2/ök2; VK2 nutzt nur lokale k2-vk2-artworks)
    if (!forVk2 && serverArtworks && Array.isArray(serverArtworks)) {
      serverArtworks.forEach((a: any) => {
        if (!a.number) return
        usedNumbers.add(a.number)
        if (a.number.startsWith(categoryPrefix)) {
          const numStr = a.number.replace(categoryPrefix, '').replace(/[^0-9]/g, '')
          const num = parseInt(numStr || '0')
          if (num > maxNumber) maxNumber = num
        } else if (a.number.startsWith('K2-') && !a.number.includes('-K-') && !a.number.includes('-M-') && !a.number.includes('-G-') && !a.number.includes('-S-') && !a.number.includes('-O-') && !a.number.includes('-W-')) {
          const numStr = a.number.replace('K2-', '').replace(/[^0-9]/g, '')
          const num = parseInt(numStr || '0')
          if (num > maxNumber) maxNumber = num
        }
      })
    }
    
    // DANN lokale Nummern prüfen
    localArtworks.forEach((a: any) => {
      if (!a.number) return
      usedNumbers.add(a.number)
      
      // Prüfe ob neue Nummer mit Kategorie-Präfix (K/M oder W für ök2)
      if (a.number.startsWith(categoryPrefix)) {
        const numStr = a.number.replace(categoryPrefix, '').replace(/[^0-9]/g, '')
        const num = parseInt(numStr || '0')
        if (num > maxNumber) {
          maxNumber = num
        }
      } 
      // Prüfe ob alte Nummer ohne K/M/W-Präfix (z.B. "K2-0001")
      else if (a.number.startsWith('K2-') && !a.number.includes('-K-') && !a.number.includes('-M-') && !a.number.includes('-G-') && !a.number.includes('-S-') && !a.number.includes('-O-') && !a.number.includes('-W-')) {
        // Alte Nummer ohne Kategorie-Präfix
        const numStr = a.number.replace('K2-', '').replace(/[^0-9]/g, '')
        const num = parseInt(numStr || '0')
        // Nur zählen wenn Kategorie passt (für Migration)
        if (num > maxNumber) {
          maxNumber = num
        }
      }
    })
    
    // Die nächste Nummer ist maxNumber + 1
    let nextNumber = maxNumber + 1
    const pad = forVk2 ? (n: number) => String(n) : (n: number) => String(n).padStart(4, '0')
    let formattedNumber = `${categoryPrefix}${pad(nextNumber)}`

    // KRITISCH: Prüfe auf Konflikte und erhöhe bis eindeutig
    let attempts = 0
    while (usedNumbers.has(formattedNumber) && attempts < 100) {
      nextNumber++
      formattedNumber = `${categoryPrefix}${pad(nextNumber)}`
      attempts++
    }

    // Falls immer noch Konflikt: Verwende Timestamp + Device-ID für eindeutige Nummer
    if (usedNumbers.has(formattedNumber)) {
      const deviceId = localStorage.getItem('k2-device-id') || `device-${Date.now()}-${Math.random().toString(36).substring(7)}`
      if (!localStorage.getItem('k2-device-id')) {
        localStorage.setItem('k2-device-id', deviceId)
      }
      const timestamp = Date.now().toString().slice(-6)
      const deviceHash = deviceId.split('-').pop()?.substring(0, 2) || Math.floor(Math.random() * 100).toString().padStart(2, '0')
      formattedNumber = `${categoryPrefix}${timestamp}${deviceHash}`
      console.warn('⚠️ Konflikt erkannt - verwende eindeutige Device+Timestamp-Nummer:', formattedNumber)
    }
    
    // Speichere auch in localStorage für Rückwärtskompatibilität (kategorie-spezifisch)
    localStorage.setItem(`k2-last-artwork-number-${prefix}`, String(nextNumber))
    
    console.log('🔢 Neue Nummer generiert:', formattedNumber, '(Kategorie:', category, ', max gefunden:', maxNumber, ', Versuche:', attempts, ')')
    return formattedNumber
  }

  // Artwork-URL für QR (gleiche Basis wie Mobile Connect) – mit Stand für Cache-Busting
  const getArtworkUrlForQR = (artworkId: string): string => {
    let base = ''
    try {
      base = (typeof localStorage !== 'undefined' && localStorage.getItem('k2-mobile-url')) || ''
    } catch (_) {}
    base = (base || GALERIE_QR_BASE).replace(/\?.*$/, '').replace(/#.*$/, '')
    const url = `${base}${base.includes('?') ? '&' : '?'}werk=${encodeURIComponent(artworkId)}`
    return urlWithBuildVersion(url)
  }

  // QR als Data-URL lokal erzeugen (Standalone – funktioniert ohne Internet/WLAN)
  const getQRDataUrl = async (artworkId: string): Promise<string> => {
    const url = getArtworkUrlForQR(artworkId)
    return QRCode.toDataURL(url, { width: 200, margin: 1 })
  }

  // QR-Code URL für Etiketten-Vorschau (API – nur wo Netz; Druck nutzt getQRDataUrl)
  const getQRCodeUrl = (artworkId: string) => {
    const artworkUrl = getArtworkUrlForQR(artworkId)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(artworkUrl)}`
  }

  // QR-Code aus Bild lesen (vereinfacht - würde normalerweise eine Library verwenden)
  const readQRCodeFromImage = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Hier würde normalerweise eine QR-Code-Library verwendet werden
          // Für jetzt: URL aus Bild-URL extrahieren (falls QR-Code eine URL enthält)
          // Oder manuelle Eingabe verwenden
          resolve(null) // Würde QR-Code-Text zurückgeben
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  // Werk als verkauft markieren – Stückzahl automatisch um 1 verringern
  const handleMarkAsSold = (artworkNumber: string) => {
    const soldArtworks = JSON.parse(localStorage.getItem('k2-sold-artworks') || '[]')
    if (!soldArtworks.find((a: any) => a.number === artworkNumber)) {
      soldArtworks.push({
        number: artworkNumber,
        soldAt: new Date().toISOString()
      })
      localStorage.setItem('k2-sold-artworks', JSON.stringify(soldArtworks))
    } else {
      alert(`⚠️ Werk ${artworkNumber} ist bereits als verkauft markiert.`)
      setShowSaleModal(false)
      setSaleInput('')
      setSaleMethod('scan')
      return
    }

    // Stückzahl in Werke-Verwaltung um 1 verringern (gleicher Key wie Admin: K2 bzw. ök2)
    const artworks = loadArtworks()
    const idx = artworks.findIndex((a: any) => (a.number || a.id) === artworkNumber)
    if (idx !== -1) {
      const a = artworks[idx]
      const q = a.quantity != null ? Number(a.quantity) : 1
      if (q > 1) {
        artworks[idx] = { ...a, quantity: q - 1 }
      } else {
        artworks[idx] = { ...a, quantity: 0, inShop: false }
      }
      if (saveArtworks(artworks)) {
        setAllArtworks(loadArtworks())
        window.dispatchEvent(new CustomEvent('artworks-updated'))
      }
    }

    alert(`✅ Werk ${artworkNumber} wurde als verkauft markiert!${idx !== -1 ? ' Stückzahl wurde angepasst.' : ''}`)
    setShowSaleModal(false)
    setSaleInput('')
    setSaleMethod('scan')
  }

  // Werk reservieren / Reservierung aufheben
  const handleMarkAsReserved = (artworkNumber: string, name: string) => {
    const reserved = JSON.parse(localStorage.getItem('k2-reserved-artworks') || '[]')
    const existing = reserved.find((a: any) => a.number === artworkNumber)
    if (existing) {
      // Reservierung aufheben
      const updated = reserved.filter((a: any) => a.number !== artworkNumber)
      localStorage.setItem('k2-reserved-artworks', JSON.stringify(updated))
      alert(`✅ Reservierung für Werk ${artworkNumber} aufgehoben.`)
    } else {
      reserved.push({ number: artworkNumber, reservedAt: new Date().toISOString(), reservedFor: name.trim() })
      localStorage.setItem('k2-reserved-artworks', JSON.stringify(reserved))
      alert(`✅ Werk ${artworkNumber} ist reserviert${name.trim() ? ` für ${name.trim()}` : ''}.`)
    }
    setAllArtworks(loadArtworks())
    window.dispatchEvent(new CustomEvent('artworks-updated'))
    setShowReserveModal(false)
    setReserveInput('')
    setReserveName('')
    setReserveMethod('scan')
  }

  // Datei auswählen (funktioniert für Datei-Upload und Kamera)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      // Sofort als Data URL konvertieren für Preview (nicht Blob URL!)
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        setPreviewUrl(dataUrl) // Data URL statt Blob URL
      }
      reader.readAsDataURL(file)
    }
    // Reset für erneute Nutzung
    e.target.value = ''
  }

  // Kamera öffnen - auf Desktop mit MediaDevices API, auf Mobile/iPad mit capture
  const handleCameraClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Prüfe ob wir auf einem mobilen Gerät oder iPad sind
    const isIPad = /iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isMobile = /iPhone|iPod|Android/i.test(navigator.userAgent) || isIPad
    
    if (isMobile || isIPad) {
      // Auf Mobile/iPad: Verwende capture Attribut
      const input = document.getElementById('camera-input-direct') as HTMLInputElement
      if (input) {
        input.value = ''
        input.click()
      }
      return
    }

    // Auf Desktop: Verwende MediaDevices API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Kamera wird auf diesem Browser nicht unterstützt. Bitte verwende "Datei auswählen".')
      return
    }

    try {
      // Öffne Kamera
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        })
      } catch (envError) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        })
      }
      
      setCameraStream(stream)
      setShowCameraView(true)
      
      // Video-Element verbinden
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(err => {
            console.error('Video play error:', err)
          })
        }
      }, 300)
    } catch (error: any) {
      console.error('Kamera-Fehler:', error)
      let errorMessage = 'Kamera konnte nicht geöffnet werden.'
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Kamera-Zugriff wurde verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Keine Kamera gefunden.'
      }
      alert(errorMessage)
    }
  }

  // Kamera schließen
  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowCameraView(false)
  }

  // Foto aufnehmen
  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context && video.videoWidth > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        // Canvas zu Blob konvertieren
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `kamera-${Date.now()}.jpg`, { type: 'image/jpeg' })
            setSelectedFile(file)
            
            // Preview erstellen
            const reader = new FileReader()
            reader.onloadend = () => {
              setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
            
            // Kamera schließen
            closeCamera()
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])



  // Bild komprimieren - AGRESSIV komprimiert für viele Bilder (wenig Speicher)
  const compressImage = (file: File, maxWidth: number = 600, quality: number = 0.5): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Für mobile: kleinere Größe (800px statt 1200px)
          // Größe reduzieren falls zu groß
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Canvas context nicht verfügbar'))
            return
          }
          
          // Bild zeichnen
          ctx.drawImage(img, 0, 0, width, height)
          
          // Für mobile: niedrigere Qualität (0.65 statt 0.8) = weniger Speicher
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
          resolve(compressedDataUrl)
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Hilfsfunktion: Seiten-Bild via GitHub hochladen (K2-Kontext) + localStorage aktualisieren
  const uploadPageImageToGitHub = async (
    file: File,
    field: 'galerieCardImage' | 'virtualTourImage',
    filename: string
  ) => {
    // K2 und ök2 laden auf GitHub hoch – Base64 wird durch dauerhaften Vercel-Pfad ersetzt
    const subfolder = isOeffentlichAdminContext() ? 'oeffentlich' : 'k2'
    const tenant = isOeffentlichAdminContext() ? 'oeffentlich' : isVk2AdminContext() ? 'vk2' : undefined
    try {
      const { uploadImageToGitHub } = await import('../src/utils/githubImageUpload')
      const url = await uploadImageToGitHub(file, filename, (msg) => console.log(msg), subfolder)
      // Vercel-Pfad im State + localStorage setzen → Base64 weg → kein Speicher-Problem mehr
      const next = { ...pageContent, [field]: url }
      setPageContent(next)
      setPageContentGalerie(next, tenant)
      localStorage.removeItem('k2-last-publish-signature')
      alert('✅ Foto dauerhaft gespeichert!\n\nIn ca. 2 Minuten auf allen Geräten sichtbar.')
    } catch (err) {
      console.warn('GitHub Upload fehlgeschlagen:', err)
      // Kein Alert – Base64 bleibt als Fallback im localStorage
    }
  }

  // Werk speichern
  const handleSaveArtwork = async () => {
    if (isSavingArtwork) return
    setIsSavingArtwork(true)
    const forOek2 = isOeffentlichAdminContext()
    
    if (!editingArtwork && !selectedFile) {
      setIsSavingArtwork(false)
      alert('Bitte ein Bild auswählen')
      return
    }
    
    if (forOek2) {
      if (!artworkTitle || !artworkTitle.trim()) {
        setIsSavingArtwork(false)
        alert('Bitte einen Titel eingeben')
        return
      }
      const priceVal = parseFloat(artworkPrice)
      if (!artworkPrice || isNaN(priceVal) || priceVal < 0) {
        setIsSavingArtwork(false)
        alert('Bitte einen gültigen Preis eingeben (0 oder höher)')
        return
      }
    } else {
      if (artworkCategory === 'keramik') {
        const subcategoryLabels: Record<string, string> = {
          'vase': 'Gefäße - Vasen',
          'teller': 'Schalen - Teller',
          'skulptur': 'Skulptur',
          'sonstig': 'Sonstig'
        }
        setArtworkTitle(subcategoryLabels[artworkCeramicSubcategory] || 'Keramik')
      }
      if (artworkCategory !== 'keramik' && !artworkTitle) {
        setIsSavingArtwork(false)
        alert('Bitte einen Titel eingeben')
        return
      }
      if (!artworkPrice || parseFloat(artworkPrice) <= 0) {
        setIsSavingArtwork(false)
        alert('Bitte einen gültigen Preis eingeben')
        return
      }
      if (artworkCategory === 'keramik') {
        if (artworkCeramicSubcategory === 'vase' || artworkCeramicSubcategory === 'skulptur') {
          const height = parseFloat(artworkCeramicHeight)
          if (!artworkCeramicHeight || height < 10 || height % 5 !== 0) {
            setIsSavingArtwork(false)
            alert('Bitte die Höhe in cm eingeben (mindestens 10cm, nur 5cm Schritte: 10, 15, 20, 25, ...)')
            return
          }
        }
        if (artworkCeramicSubcategory === 'teller') {
          const diameter = parseFloat(artworkCeramicDiameter)
          if (!artworkCeramicDiameter || diameter < 10 || diameter % 5 !== 0) {
            setIsSavingArtwork(false)
            alert('Bitte den Durchmesser in cm eingeben (mindestens 10cm, nur 5cm Schritte: 10, 15, 20, 25, ...)')
            return
          }
        }
        if (artworkCeramicSubcategory === 'sonstig') {
          if (!artworkCeramicDescription || artworkCeramicDescription.trim() === '') {
            setIsSavingArtwork(false)
            alert('Bitte eine Beschreibung eingeben')
            return
          }
        }
      }
    }
    
    const newArtworkNumber = editingArtwork ? (editingArtwork.number || editingArtwork.id) : await generateArtworkNumber(artworkCategory)
    setArtworkNumber(newArtworkNumber)
    
    // Bild komprimieren bevor es gespeichert wird - optimiert für mobile (wenig Speicher)
    try {
      let imageDataUrl: string
      
      if (selectedFile) {
        // Neues Bild: anständig komprimieren, um Datenmenge klein zu halten (max 720px, Qualität 0.6)
        const compressedDataUrl = await compressImage(selectedFile, 720, 0.6)
        
        // Grenze 1.2MB pro Bild (localStorage schonend, viele Werke möglich)
        if (compressedDataUrl.length > 1200000) {
          const moreCompressed = await compressImage(selectedFile, 600, 0.5)
          if (moreCompressed.length > 1200000) {
            setIsSavingArtwork(false)
            alert('Bild ist auch nach Kompression zu groß. Bitte kleineres Bild wählen (max. ~1.2MB nach Kompression).')
            return
          }
          imageDataUrl = moreCompressed
        } else {
          imageDataUrl = compressedDataUrl
        }
        // Option im Admin: Foto freistellen (Pro-Hintergrund) oder Original unverändert
        if (photoUseFreistellen) {
          try {
            const { compositeOnProfessionalBackground } = await import('../src/utils/professionalImageBackground')
            imageDataUrl = await compositeOnProfessionalBackground(imageDataUrl, photoBackgroundPreset)
          } catch (err) {
            console.warn('Freistellung fehlgeschlagen, verwende Original:', err)
            // imageDataUrl bleibt komprimiertes Original
          }
        }
      } else if (editingArtwork && editingArtwork.imageUrl) {
        // Bei Bearbeitung ohne neues Bild: Altes Bild beibehalten
        imageDataUrl = editingArtwork.imageUrl
      } else {
        setIsSavingArtwork(false)
        alert('Bitte ein Bild auswählen')
        return
      }
      
      await saveArtworkData(imageDataUrl, newArtworkNumber)
    } catch (error) {
      console.error('Fehler beim Komprimieren:', error)
      setIsSavingArtwork(false)
      alert('Fehler beim Verarbeiten des Bildes. Bitte versuche es erneut.')
    } finally {
      setIsSavingArtwork(false)
    }
  }

  // Werk-Daten speichern
  const saveArtworkData = async (imageDataUrl: string, newArtworkNumber: string) => {
    const forOek2 = isOeffentlichAdminContext()
    
    let finalTitle = artworkTitle
    if (!forOek2 && artworkCategory === 'keramik') {
      const subcategoryLabels: Record<string, string> = {
        'vase': 'Gefäße - Vasen',
        'teller': 'Schalen - Teller',
        'skulptur': 'Skulptur',
        'sonstig': 'Sonstig'
      }
      finalTitle = subcategoryLabels[artworkCeramicSubcategory] || 'Keramik'
    }
    
    const existingArtworks = loadArtworks()
    const existingWithSameNumber = existingArtworks.find((a: any) => a.number === newArtworkNumber && (!editingArtwork || (a.id !== editingArtwork.id && a.number !== editingArtwork.number)))
    
    let finalArtworkNumber = newArtworkNumber
    if (existingWithSameNumber && !editingArtwork) {
      console.warn('⚠️ Nummer bereits vorhanden:', newArtworkNumber, '- generiere neue Nummer')
      finalArtworkNumber = await generateArtworkNumber(artworkCategory)
    }
    
    const quantityNum = Math.min(99, Math.max(1, parseInt(artworkQuantity, 10) || 1))
    const artworkData: any = {
      id: finalArtworkNumber,
      number: finalArtworkNumber,
      title: (finalTitle || '').trim(),
      category: artworkCategory,
      artist: artworkArtist,
      description: artworkDescription,
      technik: artworkTechnik.trim() || undefined,
      dimensions: artworkDimensions.trim() || undefined,
      price: parseFloat(artworkPrice) || 0,
      quantity: quantityNum,
      inExhibition: isInExhibition,
      inShop: isInShop,
      imVereinskatalog: isImVereinskatalog || false,
      imageUrl: imageDataUrl,
      createdAt: new Date().toISOString(),
      addedToGalleryAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdOnMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      deviceId: localStorage.getItem('k2-device-id') || `device-${Date.now()}-${Math.random().toString(36).substring(7)}`
    }
    
    if (!localStorage.getItem('k2-device-id')) {
      const deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(7)}`
      localStorage.setItem('k2-device-id', deviceId)
      artworkData.deviceId = deviceId
    }
    
    if (forOek2) {
      if (artworkSubcategoryFree.trim()) artworkData.subcategoryFree = artworkSubcategoryFree.trim()
      if (artworkDimensionsFree.trim()) artworkData.dimensionsFree = artworkDimensionsFree.trim()
    }
    
    if (!forOek2 && artworkCategory !== 'keramik') {
      if (artworkPaintingWidth) artworkData.paintingWidth = parseFloat(artworkPaintingWidth)
      if (artworkPaintingHeight) artworkData.paintingHeight = parseFloat(artworkPaintingHeight)
    }
    
    if (!forOek2 && artworkCategory === 'keramik') {
      artworkData.ceramicSubcategory = artworkCeramicSubcategory
      artworkData.ceramicType = artworkCeramicType
      artworkData.ceramicSurface = artworkCeramicSurface
      if (artworkCeramicSubcategory === 'vase' || artworkCeramicSubcategory === 'skulptur') {
        artworkData.ceramicHeight = artworkCeramicHeight ? parseFloat(artworkCeramicHeight) : undefined
      }
      if (artworkCeramicSubcategory === 'teller') {
        artworkData.ceramicDiameter = artworkCeramicDiameter ? parseFloat(artworkCeramicDiameter) : undefined
      }
      if (artworkCeramicSubcategory === 'sonstig') {
        artworkData.ceramicDescription = artworkCeramicDescription || undefined
      }
    }
    
    // Werk in localStorage speichern
    const artworks = loadArtworks()
    
    // KRITISCH: Prüfe auf doppelte Nummern und behebe Konflikte
    const duplicateNumbers = new Map<string, any[]>()
    artworks.forEach((a: any) => {
      if (a.number) {
        if (!duplicateNumbers.has(a.number)) {
          duplicateNumbers.set(a.number, [])
        }
        duplicateNumbers.get(a.number)!.push(a)
      }
    })
    
    // Behebe Konflikte: Behalte das neueste Werk, benenne andere um
    duplicateNumbers.forEach((duplicates, number) => {
      if (duplicates.length > 1) {
        console.warn(`⚠️ Doppelte Nummer gefunden: ${number} (${duplicates.length} Werke)`)
        // Sortiere nach createdAt (neuestes zuerst)
        duplicates.sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
        
        // Behalte das erste (neueste), benenne andere um
        for (let i = 1; i < duplicates.length; i++) {
          const duplicate = duplicates[i]
          const newNumber = `${number}-${i}`
          console.log(`🔄 Umbenennen: ${number} → ${newNumber}`)
          
          // Finde und aktualisiere im artworks Array
          const index = artworks.findIndex((a: any) => 
            a.id === duplicate.id || (a.number === duplicate.number && a.createdAt === duplicate.createdAt)
          )
          if (index !== -1) {
            artworks[index].number = newNumber
            artworks[index].id = newNumber
            if (artworks[index].number === finalArtworkNumber && !editingArtwork) {
              // Falls das aktuelle Werk betroffen ist, aktualisiere auch artworkData
              finalArtworkNumber = newNumber
              artworkData.number = newNumber
              artworkData.id = newNumber
            }
          }
        }
      }
    })
    
    if (editingArtwork) {
      // Bestehendes Werk aktualisieren
      const index = artworks.findIndex((a: any) => 
        (a.id === editingArtwork.id || a.number === editingArtwork.number) ||
        (a.id === editingArtwork.id && a.number === editingArtwork.number)
      )
      if (index !== -1) {
        // Behalte createdAt und addedToGalleryAt wenn vorhanden
        artworkData.createdAt = artworks[index].createdAt || new Date().toISOString()
        artworkData.addedToGalleryAt = artworks[index].addedToGalleryAt || artworks[index].createdAt || artworkData.createdAt
        artworkData.updatedOnMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        artworks[index] = artworkData
      } else {
        // Falls nicht gefunden, als neues Werk hinzufügen
        artworks.push(artworkData)
      }
    } else {
      // Neues Werk hinzufügen - prüfe nochmal ob Nummer eindeutig ist
      const existing = artworks.find((a: any) => a.number === finalArtworkNumber)
      if (existing) {
        // Falls immer noch Konflikt: Verwende Timestamp-basierte Nummer
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
        const prefix = forOek2 ? 'W' : getCategoryPrefixLetter(artworkCategory)
        finalArtworkNumber = `K2-${prefix}-${timestamp}${random}`
        artworkData.number = finalArtworkNumber
        artworkData.id = finalArtworkNumber
        console.warn('⚠️ Letzter Konflikt-Fallback - neue Nummer:', finalArtworkNumber)
      }
      artworks.push(artworkData)
    }
    
    // KRITISCH: Wenn Mobile-Werk gespeichert wird, automatisch Event auslösen für Synchronisation
    if (artworkData.createdOnMobile || artworkData.updatedOnMobile) {
      console.log(`📱 Mobile-Werk gespeichert: ${artworkData.number || artworkData.id} - Event für Synchronisation ausgelöst`)
      // Event auslösen damit andere Geräte das neue Werk erkennen können
      window.dispatchEvent(new CustomEvent('mobile-artwork-saved', { 
        detail: { artwork: artworkData } 
      }))
    }
    
    try {
      const dataToStore = JSON.stringify(artworks)
      
      // Prüfe localStorage-Größe und führe automatisches Cleanup durch
      const currentSize = new Blob([dataToStore]).size
      const maxSize = 3.5 * 1024 * 1024 // 3.5MB Limit (unter 5MB Browser-Limit)
      
      if (currentSize > maxSize) {
        // Automatisches Cleanup: Entferne große Bilder und alte Werke
        console.log(`⚠️ Daten zu groß (${(currentSize / 1024 / 1024).toFixed(2)}MB) - führe Cleanup durch...`)
        
        // 1. Komprimiere große Bilder (entferne sehr große Bilder >500KB)
        const cleanedArtworks = artworks.map((artwork: any) => {
          if (artwork.imageUrl && artwork.imageUrl.length > 500000) { // Über 500KB
            console.log(`🗜️ Entferne sehr großes Bild von Werk ${artwork.number || artwork.id} (${(artwork.imageUrl.length / 1024).toFixed(0)}KB)`)
            return { ...artwork, imageUrl: '' }
          }
          return artwork
        })
        
        // 2. Sortiere nach Datum (neueste zuerst)
        const sortedArtworks = cleanedArtworks.sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
        
        // 3. Behalte nur die 20 neuesten Werke
        let keptArtworks = sortedArtworks.slice(0, 20)
        let keptData = JSON.stringify(keptArtworks)
        let keptSize = new Blob([keptData]).size
        
        // 4. Falls immer noch zu groß: Entferne mehr alte Werke
        if (keptSize > maxSize) {
          keptArtworks = sortedArtworks.slice(0, 15)
          keptData = JSON.stringify(keptArtworks)
          keptSize = new Blob([keptData]).size
          
          if (keptSize > maxSize) {
            // Letzter Versuch: Nur 10 neueste Werke
            keptArtworks = sortedArtworks.slice(0, 10)
            keptData = JSON.stringify(keptArtworks)
            keptSize = new Blob([keptData]).size
            
            if (keptSize > maxSize) {
              alert(`⚠️ localStorage ist voll (${(currentSize / 1024 / 1024).toFixed(2)}MB)!\n\nBitte lösche einige alte Werke manuell oder verwende kleinere Bilder.\n\nAutomatisches Cleanup konnte nicht genug Platz schaffen.`)
              return
            }
          }
        }
        
        const saved = saveArtworks(keptArtworks)
        if (!saved) {
          console.error('❌ Speichern fehlgeschlagen!')
          alert('⚠️ Fehler beim Speichern! Bitte versuche es erneut.')
          return
        }
        
        const removedCount = artworks.length - keptArtworks.length
        if (removedCount > 0) {
          alert(`⚠️ localStorage war zu voll!\n\nDie ältesten ${removedCount} Werke wurden automatisch gelöscht.\n\nBitte verwende kleinere Bilder um Platz zu sparen.`)
        }
      } else {
        const saved = saveArtworks(artworks)
        if (!saved) {
          console.error('❌ Speichern fehlgeschlagen!')
          alert('⚠️ Fehler beim Speichern! Bitte versuche es erneut.')
          return
        }
      }
      
      console.log('✅ Werk gespeichert:', {
        number: artworkData.number,
        title: artworkData.title,
        imageUrlLength: artworkData.imageUrl?.length || 0,
        compressed: true,
        totalArtworks: artworks.length
      })
      
      // KRITISCH: Prüfe ob Werk wirklich gespeichert wurde
      const verifyStored = loadArtworks()
      const isStored = verifyStored.some((a: any) => 
        (a.number && artworkData.number && a.number === artworkData.number) ||
        (a.id && artworkData.id && a.id === artworkData.id)
      )
      
      if (!isStored) {
        console.error('❌ KRITISCH: Werk wurde NICHT gespeichert!', {
          gesucht: artworkData.number || artworkData.id,
          gespeichert: verifyStored.map((a: any) => a.number || a.id),
          anzahl: verifyStored.length
        })
        alert(`⚠️ Fehler: Werk konnte nicht gespeichert werden!\n\nNummer: ${artworkData.number}\nGespeicherte Werke: ${verifyStored.length}\n\nBitte versuche es erneut.`)
        return
      }
      
      console.log('✅ Werk-Verifikation erfolgreich:', {
        nummer: artworkData.number,
        titel: artworkData.title,
        gesamtAnzahl: verifyStored.length,
        alleNummern: verifyStored.map((a: any) => a.number || a.id)
      })
      
      // KRITISCH: Markiere Nummer als verwendet für bessere Synchronisation
      // Speichere Nummer in separatem Index für schnelle Prüfung
      try {
        const numberIndex = JSON.parse(localStorage.getItem('k2-number-index') || '[]')
        if (!numberIndex.includes(artworkData.number)) {
          numberIndex.push(artworkData.number)
          localStorage.setItem('k2-number-index', JSON.stringify(numberIndex))
          console.log('✅ Nummer im Index gespeichert:', artworkData.number)
        }
      } catch (e) {
        console.warn('⚠️ Nummer-Index fehlgeschlagen:', e)
      }
      
      // K2: Werk-Bild automatisch via GitHub hochladen → überall sichtbar
      if (!forOek2 && selectedFile && imageDataUrl) {
        try {
          const { uploadImageToGitHub } = await import('../src/utils/githubImageUpload')
          const safeNumber = (artworkData.number || artworkData.id || 'werk').replace(/[^a-zA-Z0-9-]/g, '-')
          const filename = `werk-${safeNumber}.jpg`
          const url = await uploadImageToGitHub(selectedFile, filename, (msg) => console.log(msg))
          // Werk mit URL statt Base64 aktualisieren
          artworkData.imageUrl = url
          const updatedArtworks = loadArtworks().map((a: any) =>
            (a.id === artworkData.id || a.number === artworkData.number) ? { ...a, imageUrl: url } : a
          )
          saveArtworks(updatedArtworks)
          setAllArtworks(updatedArtworks)
          console.log('✅ Werk-Bild auf GitHub hochgeladen:', url)
        } catch (uploadErr) {
          console.warn('GitHub Upload für Werk fehlgeschlagen (Bild bleibt lokal):', uploadErr)
        }
      }
      
      // KRITISCH: Aktualisiere lokale Liste SOFORT
      const reloaded = loadArtworks()
      console.log('📦 Reloaded artworks:', reloaded.length, 'Nummern:', reloaded.map((a: any) => a.number || a.id))
      
      // Prüfe ob das neue Werk wirklich drin ist
      const containsNewArtwork = reloaded.some((a: any) => 
        (a.number && artworkData.number && a.number === artworkData.number) ||
        (a.id && artworkData.id && a.id === artworkData.id)
      )
      
      if (!containsNewArtwork) {
        console.error('❌ KRITISCH: Neues Werk nicht in reloaded gefunden!')
        alert(`⚠️ Fehler: Werk wurde gespeichert, aber nicht in Liste gefunden!\n\nNummer: ${artworkData.number}\n\nBitte Seite neu laden.`)
        return
      }
      
      console.log('✅ Neues Werk in reloaded gefunden:', artworkData.number)
      
      // KRITISCH: Setze Filter auf 'alle' damit das neue Werk sichtbar ist
      // Oder setze Filter auf die Kategorie des neuen Werks
      if (categoryFilter !== 'alle' && categoryFilter !== artworkData.category) {
        console.log('🔄 Setze Filter auf Kategorie des neuen Werks:', artworkData.category)
        setCategoryFilter(artworkData.category)
      }
      
      // Lösche Such-Query falls vorhanden
      if (searchQuery) {
        setSearchQuery('')
      }
      
      setAllArtworks(reloaded)
      
      // WICHTIG: Kurze Verzögerung damit React State aktualisiert wird
      setTimeout(() => {
        const afterUpdate = loadArtworks()
        const filteredAfterUpdate = afterUpdate.filter((a: any) => {
          if (!a) return false
          if (categoryFilter !== 'alle' && a.category !== categoryFilter) return false
          return true
        })
        console.log('📊 Nach State-Update:', {
          allArtworksState: allArtworks.length,
          localStorage: afterUpdate.length,
          gefiltert: filteredAfterUpdate.length,
          enthaeltNeuesWerk: afterUpdate.some((a: any) => (a.number || a.id) === (artworkData.number || artworkData.id)),
          filter: categoryFilter
        })
      }, 100)
      
      // Gespeichertes Werk für Druck-Modal ZUERST setzen
      setSavedArtwork({
        ...artworkData,
        file: selectedFile // Für QR-Code-Generierung behalten
      })
      
      // Modal schließen und zurücksetzen
      setShowAddModal(false)
      setEditingArtwork(null)
      setSelectedFile(null)
      setPreviewUrl(null)
      setArtworkTitle('')
      setArtworkCategory('malerei')
      setArtworkCeramicSubcategory('vase')
      setArtworkCeramicHeight('')
      setArtworkCeramicDiameter('')
      setArtworkCeramicDescription('')
      setArtworkPaintingWidth('')
      setArtworkPaintingHeight('')
      setArtworkArtist('')
      setArtworkDescription('')
      setArtworkTechnik('')
      setArtworkDimensions('')
      setArtworkPrice('')
      setArtworkQuantity('1')
      setIsInShop(true)
      setIsImVereinskatalog(false)
      
      // Event dispatchen, damit Galerie-Seite sich aktualisiert
      window.dispatchEvent(new CustomEvent('artworks-updated', { 
        detail: { count: reloaded.length, newArtwork: artworkData.number } 
      }))
      
      // WICHTIG: Dispatch Event für automatisches Veröffentlichen
      // DevViewPage hört auf dieses Event und ruft publishMobile() auf
      window.dispatchEvent(new CustomEvent('artwork-saved-needs-publish', { 
        detail: { artworkCount: reloaded.length } 
      }))
      
      // NICHT nochmal setAllArtworks aufrufen - wurde bereits oben gemacht!
      // Die Liste wurde bereits mit reloaded aktualisiert
      
      // Etikett-Druck-Modal immer anbieten (bei neuem Werk und bei Bearbeitung)
      setTimeout(() => {
        setShowPrintModal(true)
      }, 200)
      if (editingArtwork) {
        console.log('✅ Werk aktualisiert – Etikett kann erneut gedruckt werden')
      }
    } catch (error: any) {
      console.error('Fehler beim Speichern:', error)
      if (error?.name === 'QuotaExceededError') {
        tryFreeLocalStorageSpace()
        alert('⚠️ ' + SPEICHER_VOLL_MELDUNG)
      } else {
        alert('Fehler beim Speichern. Bitte versuche es erneut.')
      }
    } finally {
      setIsSavingArtwork(false)
    }
  }

  // One-Click: Etikett direkt an Print-Server senden (kein Druckdialog)
  const handleOneClickPrint = async () => {
    if (!savedArtwork) return
    const tenant = getCurrentTenantId()
    const settings = loadPrinterSettingsForTenant(tenant)
    const url = (settings.printServerUrl || '').trim().replace(/\/$/, '').replace(/\/print\/?$/i, '')
    if (!url) {
      alert('Print-Server URL fehlt. Einstellungen → Drucker → Print-Server URL eintragen (z.B. http://localhost:3847)')
      return
    }
    // Von Vercel (HTTPS) aus: Browser blockiert Anfragen an http:// (Mixed Content). Print-Server muss dann per HTTPS erreichbar sein (z. B. ngrok), oder K2 wird vor Ort per http:// geöffnet.
    setOneClickPrinting(true)
    const timeoutMs = 20000
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout – Server antwortet nicht. One-Click-Anwendung im Projektordner starten?')), timeoutMs)
    )
    try {
      const lm = parseLabelSize(settings.labelSize)
      const blob = await Promise.race([getEtikettBlob(lm.width, lm.height), timeoutPromise])
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => {
          const data = (r.result as string) || ''
          const m = data.match(/^data:[^;]+;base64,(.+)$/)
          resolve(m ? m[1]! : data)
        }
        r.onerror = () => reject(new Error('Bild konnte nicht gelesen werden'))
        r.readAsDataURL(blob)
      })
      const res = await Promise.race([
        fetch(`${url}/print`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            printerIP: settings.ipAddress || '192.168.1.102',
            widthMm: lm.width,
            heightMm: lm.height
          })
        }),
        timeoutPromise
      ])
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || `Fehler ${res.status}`)
      setShowPrintModal(false)
      alert('✅ Etikett gesendet – Brother druckt.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'One-Click-Druck fehlgeschlagen'
      const isIpadOrPhone = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      const isNetworkError = /fetch|network|Failed to fetch/i.test(String(msg))
      const isHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:'
      const isHttpUrl = url.toLowerCase().startsWith('http://')
      let urlHint = ''
      if (isHttps && isHttpUrl && isNetworkError) {
        urlHint = '\n\n📌 Standalone (ohne Mac vor Ort): Von Vercel aus blockiert der Browser Anrufe an http://. Print-Server muss per HTTPS erreichbar sein (z.B. ngrok am Gerät vor Ort). Oder: K2 vor Ort per http:// öffnen (siehe DRUCKER-STANDALONE.md).'
      } else if (isIpadOrPhone) {
        urlHint = '\n\n📱 Auf iPad/Handy: Print-Server URL = IP des Geräts, das den Print-Server läuft (z.B. http://192.168.1.1:3847), alle im gleichen WLAN.'
      } else if (isNetworkError) {
        urlHint = '\n\n💡 Print-Server läuft auf dem Gerät vor Ort? Dort: npm run print-server'
      }
      alert('❌ One-Click-Druck fehlgeschlagen: ' + msg + '\n\nVersucht: ' + url + '/print' + urlHint + '\n\nOne-Click-Anwendung starten (auf dem Gerät, das am gleichen Netz wie Drucker/Tablet ist):\n  npm run print-server\n  oder\n  node scripts/k2-print-server.js')
    } finally {
      setOneClickPrinting(false)
    }
  }

  // Drucken: Fenster SOFORT öffnen (vor await) – sonst blockiert Pop-up-Blocker
  const handlePrint = async () => {
    if (!savedArtwork) return
    const win = window.open('', '_blank', 'width=400,height=500')
    if (!win) {
      alert('Pop-up blockiert. Bitte erlaube Fenster für diese Seite (Adresszeile/Safari) und versuche erneut.')
      return
    }
    win.document.write('<html><body style="margin:0;padding:2rem;font-family:system-ui;text-align:center;">Etikett wird erstellt …</body></html>')
    try {
      const activeTenant = getCurrentTenantId()
      const settings = loadPrinterSettingsForTenant(activeTenant)
      const lm = parseLabelSize(settings.labelSize)
      const blob = await getEtikettBlob(lm.width, lm.height)
      const url = URL.createObjectURL(blob)
      const w = lm.width
      const h = lm.height
      // Pixelmaße = Etikett in mm bei 300 DPI, damit Druck-Engine die Größe nicht falsch interpretiert
      const pw = Math.round(w * (300 / 25.4))
      const ph = Math.round(h * (300 / 25.4))
      win.document.write(`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Etikett ${w}×${h}mm</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
@page { size: ${w}mm ${h}mm; margin: 0; }
html, body { margin: 0; padding: 0; background: #fff; width: ${w}mm; height: ${h}mm; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.etikett-wrap { width: ${w}mm; height: ${h}mm; display: block; overflow: hidden; }
.etikett-wrap img { width: 100%; height: 100%; display: block; object-fit: contain; object-position: center; }
</style></head>
<body><div class="etikett-wrap"><img src="${url}" alt="Etikett" width="${pw}" height="${ph}"></div></body></html>`)
      win.document.close()
      const doPrint = () => {
        win.print()
        win.addEventListener('afterprint', () => {
          win.close()
          URL.revokeObjectURL(url)
        }, { once: true })
      }
      const img = win.document.querySelector('img')
      if (img?.complete) {
        setTimeout(doPrint, 100)
      } else {
        img?.addEventListener('load', () => setTimeout(doPrint, 100), { once: true })
        img?.addEventListener('error', () => { win.close(); URL.revokeObjectURL(url) }, { once: true })
      }
    } catch (e) {
      win.close()
      console.error('Etikett für Druck fehlgeschlagen:', e)
      alert((e as Error)?.message || 'Etikett konnte nicht erzeugt werden. Bitte erneut versuchen.')
    }
  }

  /** Sammeldruck: Alle ausgewählten Werke als Etiketten – über Teilen (funktioniert mit allen Druckern). */
  const handleBatchPrintEtiketten = async () => {
    const ids = Array.from(selectedForBatchPrint)
    if (ids.length === 0) return
    const toPrint = allArtworks.filter((a: any) => {
      const n = a?.number || a?.id
      return n && ids.includes(n)
    })
    if (toPrint.length === 0) return
    const activeTenant = getCurrentTenantId()
    const settings = loadPrinterSettingsForTenant(activeTenant)
    const lm = parseLabelSize(settings.labelSize)
    try {
      // Jedes Werk einzeln über Teilen → Drucker (gleicher Weg wie Einzeletikett)
      for (const artwork of toPrint) {
        const blob = await getEtikettBlobForArtwork(artwork, lm.width, lm.height)
        const file = new File([blob], `etikett-${artwork.number || artwork.id}.png`, { type: 'image/png' })
        if (isMobile) {
          shareFallbackBlobRef.current = blob
          setShareFallbackImageUrl(URL.createObjectURL(blob))
          setShowShareFallbackOverlay(true)
          // Bei mehreren Werken: nacheinander – User schließt Teilen-Dialog und nächstes öffnet sich
          await new Promise(resolve => setTimeout(resolve, 500))
        } else if (typeof navigator !== 'undefined' && navigator.share) {
          try {
            await navigator.share({ title: `Etikett ${artwork.number || artwork.id}`, text: `${artwork.title || ''} – K2 Galerie`, files: [file] })
          } catch (_) {}
        } else {
          const blobUrl = URL.createObjectURL(blob)
          window.open(blobUrl, '_blank')
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
        }
      }
      setSelectedForBatchPrint(new Set())
    } catch (e) {
      console.error('Sammeldruck fehlgeschlagen:', e)
      alert((e as Error)?.message || 'Etiketten konnten nicht erzeugt werden. Bitte erneut versuchen.')
    }
  }

  // Mobil: Etikett als Bild erzeugen und Teilen-Menü öffnen (ein Tipp → Drucker/Brother-App wählen)
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window)

  const closeShareFallbackOverlay = () => {
    if (shareFallbackImageUrl) URL.revokeObjectURL(shareFallbackImageUrl)
    setShareFallbackImageUrl(null)
    shareFallbackBlobRef.current = null
    setShowShareFallbackOverlay(false)
  }

  const canUseShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const handleDownloadEtikettFromOverlay = () => {
    const blob = shareFallbackBlobRef.current
    if (!blob || !savedArtwork) return
    const name = `etikett-${savedArtwork.number}.png`.replace(/[^a-zA-Z0-9._-]/g, '_')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShareFromFallbackOverlay = async () => {
    const blob = shareFallbackBlobRef.current
    if (!blob || !savedArtwork) {
      alert('Etikett-Bild nicht mehr verfügbar. Bitte erneut „Etikett teilen“ im Druck-Modal tippen.')
      return
    }
    if (!canUseShare) {
      handleDownloadEtikettFromOverlay()
      return
    }
    const file = new File([blob], `etikett-${savedArtwork.number}.png`, { type: 'image/png' })
    try {
      await navigator.share({ title: `Etikett ${savedArtwork.number}`, files: [file] })
      closeShareFallbackOverlay()
    } catch (e) {
      const err = e as Error
      if (err?.name === 'AbortError') return
      const msg = err?.message || ''
      alert('Teilen fehlgeschlagen' + (msg ? ': ' + msg : '') + '.\n\nNutze „Etikett herunterladen“ und öffne die Datei in Brother iPrint & Label.')
    }
  }

  /** Erzeugt Etikett als PNG-Bild in exakter Etikettengröße (widthMm x heightMm). Brother 300 DPI = 300/25.4 px/mm. */
  const getEtikettBlob = (widthMm = 29, heightMm = 90.3): Promise<Blob> => {
    if (!savedArtwork) return Promise.reject(new Error('Kein Werk'))
    const pxPerMm = 300 / 25.4  /* Brother QL-820: 300 DPI */
    const w = Math.round(widthMm * pxPerMm)
    const h = Math.round(heightMm * pxPerMm)
    return getQRDataUrl(savedArtwork.number).then((qrDataUrl) => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return Promise.reject(new Error('Canvas fehlgeschlagen'))
      const pad = Math.max(2, w * 0.03)
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = '#8b6914'
      ctx.lineWidth = Math.max(1, w * 0.007)
      ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2)
      ctx.fillStyle = '#8b6914'
      ctx.textAlign = 'center'
      const fs1 = Math.max(8, w * 0.12)
      const fs2 = Math.max(10, w * 0.16)
      const fs3 = Math.max(6, w * 0.1)
      const fs4 = Math.max(5, w * 0.09)
      ctx.font = `bold ${fs1}px Arial,sans-serif`
      ctx.fillText('K2 Galerie', w / 2, h * 0.08)
      ctx.font = `bold ${fs2}px Arial,sans-serif`
      ctx.fillText(savedArtwork.number, w / 2, h * 0.15)
      ctx.fillStyle = '#666'
      ctx.font = `${fs3}px Arial,sans-serif`
      const title = ((savedArtwork.title || '').substring(0, 18)) + ((savedArtwork.title || '').length > 18 ? '…' : '')
      ctx.fillText(title, w / 2, h * 0.21)
      if (savedArtwork.category === 'malerei' && savedArtwork.paintingWidth && savedArtwork.paintingHeight) {
        ctx.font = `${fs4}px Arial,sans-serif`
        ctx.fillText(`${savedArtwork.paintingWidth} × ${savedArtwork.paintingHeight} cm`, w / 2, h * 0.26)
      }
      const qrSize = Math.min(w * 0.75, h * 0.25)
      const qrX = (w - qrSize) / 2
      const qrY = h * 0.55
      return new Promise<Blob>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize)
      ctx.fillStyle = '#999'
      ctx.font = `${fs4}px Arial,sans-serif`
      const artistName = savedArtwork.artist || ''
      const categoryText = getCategoryLabel(savedArtwork.category)
      // Zeilenumbruch wenn Name zu lang (>12 Zeichen)
      if (artistName.length > 12) {
        ctx.fillText(categoryText, w / 2, h - pad - fs4 * 2.2)
        ctx.fillText(artistName, w / 2, h - pad - fs4 * 0.8)
      } else {
        const footer = artistName ? `${categoryText} • ${artistName}` : categoryText
        ctx.fillText(footer, w / 2, h - pad - fs4)
      }
          canvas.toBlob((b) => {
            if (!b) { reject(new Error('Blob fehlgeschlagen')); return }
            b.arrayBuffer().then((ab) => {
              try {
                const withDpi = writePngDpi(ab, 300)
                const slice = withDpi.buffer.slice(withDpi.byteOffset, withDpi.byteOffset + withDpi.byteLength)
                resolve(new Blob([slice as ArrayBuffer], { type: 'image/png' }))
              } catch {
                resolve(b)
              }
            }).catch(() => resolve(b))
          }, 'image/png', 0.95)
        }
        img.onerror = () => reject(new Error('QR-Bild konnte nicht geladen werden.'))
        img.src = qrDataUrl
      })
    })
  }

  /** Etikett für beliebiges Werk (für Sammeldruck). Gleiche Logik wie getEtikettBlob, aber mit übergebenem artwork. */
  const getEtikettBlobForArtwork = (artwork: { number?: string; id?: string; title?: string; category?: string; paintingWidth?: number; paintingHeight?: number; artist?: string }, widthMm = 29, heightMm = 90.3): Promise<Blob> => {
    const num = artwork?.number || artwork?.id
    if (!num) return Promise.reject(new Error('Werk ohne Nummer'))
    const pxPerMm = 300 / 25.4
    const w = Math.round(widthMm * pxPerMm)
    const h = Math.round(heightMm * pxPerMm)
    return getQRDataUrl(num).then((qrDataUrl) => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return Promise.reject(new Error('Canvas fehlgeschlagen'))
      const pad = Math.max(2, w * 0.03)
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = '#8b6914'
      ctx.lineWidth = Math.max(1, w * 0.007)
      ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2)
      ctx.fillStyle = '#8b6914'
      ctx.textAlign = 'center'
      const fs1 = Math.max(8, w * 0.12)
      const fs2 = Math.max(10, w * 0.16)
      const fs3 = Math.max(6, w * 0.1)
      const fs4 = Math.max(5, w * 0.09)
      ctx.font = `bold ${fs1}px Arial,sans-serif`
      ctx.fillText('K2 Galerie', w / 2, h * 0.08)
      ctx.font = `bold ${fs2}px Arial,sans-serif`
      ctx.fillText(num, w / 2, h * 0.15)
      ctx.fillStyle = '#666'
      ctx.font = `${fs3}px Arial,sans-serif`
      const title = ((artwork.title || '').substring(0, 18)) + ((artwork.title || '').length > 18 ? '…' : '')
      ctx.fillText(title, w / 2, h * 0.21)
      if (artwork.category === 'malerei' && artwork.paintingWidth && artwork.paintingHeight) {
        ctx.font = `${fs4}px Arial,sans-serif`
        ctx.fillText(`${artwork.paintingWidth} × ${artwork.paintingHeight} cm`, w / 2, h * 0.26)
      }
      const qrSize = Math.min(w * 0.75, h * 0.25)
      const qrX = (w - qrSize) / 2
      const qrY = h * 0.55
      return new Promise<Blob>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize)
          ctx.fillStyle = '#999'
          ctx.font = `${fs4}px Arial,sans-serif`
          const footer = `${getCategoryLabel(artwork.category || 'malerei')} • ${(artwork.artist || '').substring(0, 15)}`
          ctx.fillText(footer, w / 2, h - pad - fs4)
          canvas.toBlob((b) => {
            if (!b) { reject(new Error('Blob fehlgeschlagen')); return }
            b.arrayBuffer().then((ab) => {
              try {
                const withDpi = writePngDpi(ab, 300)
                const slice = withDpi.buffer.slice(withDpi.byteOffset, withDpi.byteOffset + withDpi.byteLength)
                resolve(new Blob([slice as ArrayBuffer], { type: 'image/png' }))
              } catch {
                resolve(b)
              }
            }).catch(() => resolve(b))
          }, 'image/png', 0.95)
        }
        img.onerror = () => reject(new Error('QR-Bild konnte nicht geladen werden.'))
        img.src = qrDataUrl
      })
    })
  }

  /** Ein Tipp → auf Mobil: Teilen-Sheet (Speichern / iPrint&Label), sonst Download. */
  const handleDownloadEtikettDirect = async () => {
    if (!savedArtwork) return
    try {
      const blob = await getEtikettBlob()
      const name = `etikett-${String(savedArtwork.number).replace(/[^a-zA-Z0-9._-]/g, '_')}.png`
      const file = new File([blob], name, { type: 'image/png' })

      if (isMobile && typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: `Etikett ${savedArtwork.number}`,
            text: `${savedArtwork.title || ''} – K2 Galerie`,
            files: [file]
          })
          setShowPrintModal(false)
        } catch (shareErr: unknown) {
          const err = shareErr as Error
          if (err?.name === 'AbortError') return
          const msg = err?.message || ''
          if (/freigegeben|cannot be shared|Share canceled/i.test(msg)) {
            alert('Teilen wurde abgebrochen oder ist hier nicht möglich.\n\nVersuche: „Etikett in neuem Tab öffnen“ (unten) → im Tab langes Drücken auf das Bild → „Bild speichern“ oder „In Fotos speichern“. Dann in Brother iPrint & Label öffnen.')
          } else {
            alert('Teilen fehlgeschlagen: ' + (msg || 'Unbekannter Fehler') + '.\n\nNutze „Etikett in neuem Tab öffnen“ (unten), dann Bild speichern und in iPrint & Label öffnen.')
          }
        }
        return
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setShowPrintModal(false)
    } catch (e) {
      alert((e as Error)?.message || 'Etikett konnte nicht erzeugt werden. Bitte erneut versuchen.')
    }
  }

  const handleShareLabel = async () => {
    if (!savedArtwork) return
    try {
      const blob = await getEtikettBlob()
      const file = new File([blob], `etikett-${savedArtwork.number}.png`, { type: 'image/png' })
      if (isMobile) {
        shareFallbackBlobRef.current = blob
        setShareFallbackImageUrl(URL.createObjectURL(blob))
        setShowShareFallbackOverlay(true)
        return
      }
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: `Etikett ${savedArtwork.number}`, text: `${savedArtwork.title || ''} – K2 Galerie`, files: [file] })
      } else {
        const blobUrl = URL.createObjectURL(blob)
        const w = window.open(blobUrl, '_blank')
        if (w) w.document.title = `Etikett ${savedArtwork.number}`
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
      }
    } catch (e) {
      if ((e as Error)?.message?.includes('QR')) alert('QR konnte nicht erzeugt werden. Bitte erneut versuchen.')
      else alert((e as Error)?.message || 'Etikett konnte nicht erzeugt werden.')
    }
  }

  // PDF für QR-Code Plakat erstellen (lokal generiert – keine externe API). Optional event für Zuordnung zur Rubrik.
  const printQRCodePlakat = async (event?: any) => {
    const homepageUrl = `${window.location.origin}/projects/k2-galerie/galerie`
    const rundgangUrl = `${window.location.origin}/projects/k2-galerie/virtueller-rundgang`
    const [homepageQRUrl, rundgangQRUrl] = await Promise.all([
      QRCode.toDataURL(homepageUrl, { width: 300, margin: 1 }),
      QRCode.toDataURL(rundgangUrl, { width: 300, margin: 1 })
    ])

    const date = new Date().toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    })

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR-Codes - K2 Galerie</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              color: #1f1f1f !important;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            @media screen {
              body {
                padding: 20px;
                background: #f5f5f5 !important;
              }
            }
            .plakat {
              width: 210mm;
              min-height: 297mm;
              background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%) !important;
              padding: 20mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              position: relative;
              color: #ffffff !important;
            }
            .content {
              position: relative;
              z-index: 1;
              width: 100%;
            }
            .icon {
              font-size: 60px;
              margin-bottom: 20px;
              opacity: 0.8;
            }
            h1 {
              font-size: 48px;
              font-weight: 700;
              margin: 0 0 15px;
              background: linear-gradient(135deg, #ffffff 0%, #b8b8ff 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              letter-spacing: -0.02em;
              line-height: 1.2;
            }
            h2 {
              font-size: 28px;
              font-weight: 600;
              margin: 0 0 10px;
              color: #ffffff;
              letter-spacing: -0.01em;
            }
            .subtitle {
              font-size: 18px;
              color: rgba(255, 255, 255, 0.7);
              margin-bottom: 35px;
              font-weight: 300;
              line-height: 1.5;
            }
            .text-block {
              font-size: 15px;
              color: rgba(255, 255, 255, 0.9);
              line-height: 1.7;
              margin-bottom: 30px;
              max-width: 550px;
              margin-left: auto;
              margin-right: auto;
              text-align: center;
            }
            .text-block strong {
              color: #ffffff;
              font-weight: 600;
            }
            .highlight-box {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 16px;
              padding: 25px;
              margin: 35px 0;
              max-width: 500px;
              margin-left: auto;
              margin-right: auto;
            }
            .highlight-box p {
              margin: 0;
              font-size: 16px;
              color: #ffffff;
              font-weight: 500;
              line-height: 1.8;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 25px;
              margin: 40px 0;
              max-width: 550px;
              margin-left: auto;
              margin-right: auto;
            }
            .qr-container {
              background: rgba(255, 255, 255, 0.95);
              padding: 20px;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            .qr-code {
              width: 100%;
              max-width: 200px;
              height: auto;
              display: block;
              margin: 0 auto;
            }
            .qr-label {
              margin-top: 15px;
              font-size: 16px;
              color: #1f1f1f;
              font-weight: 700;
            }
            .qr-description {
              margin-top: 8px;
              font-size: 13px;
              color: #666;
              line-height: 1.5;
            }
            .footer {
              margin-top: 50px;
              font-size: 13px;
              color: rgba(255, 255, 255, 0.7);
              line-height: 1.6;
            }
            .footer strong {
              color: #ffffff;
            }
          </style>
        </head>
        <body>
          <div class="plakat">
            <div class="content">
              <div class="icon">🏛️</div>
              <h1>K2 GALERIE</h1>
              <h2>Besuch uns online</h2>
              <p class="subtitle">Kunst & Keramik • Jederzeit verfügbar</p>
              
              <div class="text-block">
                <p><strong>Entdecke die K2 Galerie – auch wenn wir geschlossen haben!</strong></p>
                <p>Die K2 Galerie öffnet ihre Türen für dich – jederzeit und überall. Erlebe die aktuellen Werke von Martina und Georg Kreinecker bequem von zu Hause oder unterwegs. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.</p>
              </div>

              <div class="highlight-box">
                <p>🎨 Malerei & Keramik<br>
                📱 Einfach QR-Code scannen<br>
                🌐 Sofort verfügbar, jederzeit</p>
              </div>

              <div class="qr-grid">
                <div class="qr-container">
                  <img src="${homepageQRUrl}" alt="QR-Code für Homepage" class="qr-code" />
                  <div class="qr-label">Homepage</div>
                  <div class="qr-description">Besuch unsere Galerie-Website</div>
                </div>
                <div class="qr-container">
                  <img src="${rundgangQRUrl}" alt="QR-Code für virtuellen Rundgang" class="qr-code" />
                  <div class="qr-label">Virtueller Rundgang</div>
                  <div class="qr-description">Erkunde die Ausstellung</div>
                </div>
              </div>

              <div class="text-block">
                <p><strong>So funktioniert's:</strong></p>
                <p>1. Öffne die Kamera-App auf deinem Smartphone<br>
                2. Scanne einen der QR-Codes<br>
                3. Erkunde unsere Galerie in Ruhe</p>
                <p style="margin-top: 15px;">Lass dich von der Vielfalt unserer Kunstwerke inspirieren und entdecke die einzigartige Verbindung von Malerei und Keramik.</p>
              </div>

              <div class="footer">
                <p><strong>K2 Galerie</strong><br>
                Martina & Georg Kreinecker<br>
                Kunst & Keramik</p>
                <p style="margin-top: 12px;">Erstellt am: ${date}</p>
              </div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              // Zeige PDF an - Nutzer kann dann selbst drucken/speichern
              // Kein automatischer Druck-Dialog mehr
            }
          </script>
        </body>
      </html>
    `

    // Speichere das PDF automatisch im Dokumentenordner
    try {
      // Erstelle ein Blob aus dem HTML
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const reader = new FileReader()
      
      reader.onload = () => {
        try {
          const base64 = reader.result as string
          
          const existingDocs = loadDocuments()
          let doc: any
          if (event?.id) {
            doc = {
              id: `qr-plakat-${event.id}-${Date.now()}`,
              name: getNextWerbematerialVorschlagName(event.id, event.title, 'qr-plakat', 'QR-Code Plakat'),
              type: 'text/html',
              size: blob.size,
              data: base64,
              uploadedAt: new Date().toISOString(),
              isPDF: false,
              isPlaceholder: false,
              category: 'pr-dokumente',
              eventId: event.id,
              eventTitle: event.title,
              werbematerialTyp: 'qr-plakat'
            }
            saveDocuments([...existingDocs, doc])
            setDocuments([...existingDocs, doc])
          } else {
            const existingInvitation = existingDocs.find((d: any) =>
              d.name && d.name.includes('Virtuelle Einladung')
            )
            doc = {
              id: existingInvitation ? existingInvitation.id : `qr-plakat-${Date.now()}`,
              name: `Virtuelle Einladung - QR-Code Plakat (${date}).html`,
              type: 'text/html',
              size: blob.size,
              data: base64,
              uploadedAt: new Date().toISOString(),
              isPDF: false,
              isPlaceholder: false
            }
            const updated = existingInvitation
              ? existingDocs.map((d: any) => d.id === existingInvitation.id ? doc : d)
              : [...existingDocs, doc]
            saveDocuments(updated)
            setDocuments(updated)
          }
          alert(`✅ Virtuelle Einladung wurde im Dokumentenordner gespeichert!\n\nDateiname: ${doc.name}`)
        } catch (error) {
          console.error('Fehler beim Speichern:', error)
          alert('❌ Fehler beim Speichern der virtuellen Einladung')
        }
      }
      
      reader.onerror = () => {
        alert('❌ Fehler beim Lesen der Datei')
      }
      
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Fehler beim Erstellen des Blobs:', error)
      alert('❌ Fehler beim Speichern der virtuellen Einladung')
    }

    // Öffne auch das PDF-Fenster zur Ansicht
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up-Blocker verhindert PDF-Ansicht. Bitte erlaube Pop-ups.')
      return
    }
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // PDF für Werke drucken
  const printPDF = (type: 'galerie' | 'verkauft') => {
    let filteredArtworks = allArtworks
    
    if (type === 'galerie') {
      // Nur Werke die in der Galerie sind
      filteredArtworks = allArtworks.filter((a: any) => a.inExhibition === true)
    } else if (type === 'verkauft') {
      // Nur verkaufte Werke
      try {
        const soldData = localStorage.getItem('k2-sold-artworks')
        if (soldData) {
          const soldArtworks = JSON.parse(soldData)
          const soldNumbers = new Set(soldArtworks.map((a: any) => a.number))
          filteredArtworks = allArtworks.filter((a: any) => soldNumbers.has(a.number))
        } else {
          filteredArtworks = []
        }
      } catch (error) {
        filteredArtworks = []
      }
    }

    if (filteredArtworks.length === 0) {
      alert(`Keine Werke gefunden für "${type === 'galerie' ? 'Galerie' : 'Verkaufte Werke'}"`)
      return
    }

    filteredArtworks = sortArtworksNewestFirst(filteredArtworks)

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up-Blocker verhindert PDF-Erstellung. Bitte erlaube Pop-ups.')
      return
    }

    const title = type === 'galerie' ? 'Werke in der Galerie' : 'Verkaufte Werke'
    const date = new Date().toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    })

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - K2 Galerie</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 15mm;
              }
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 11px;
              line-height: 1.5;
              color: #000;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #8b6914;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #8b6914;
            }
            .header p {
              margin: 5px 0 0;
              font-size: 12px;
              color: #666;
            }
            .artwork-item {
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px solid #ddd;
              page-break-inside: avoid;
            }
            .artwork-item:last-child {
              border-bottom: none;
            }
            .artwork-header {
              display: flex;
              justify-content: space-between;
              align-items: start;
              margin-bottom: 10px;
            }
            .artwork-title {
              font-size: 14px;
              font-weight: bold;
              color: #1f1f1f;
            }
            .artwork-number {
              font-size: 12px;
              font-weight: bold;
              color: #8b6914;
            }
            .artwork-details {
              font-size: 10px;
              color: #666;
              margin-bottom: 8px;
            }
            .artwork-image {
              max-width: 200px;
              max-height: 200px;
              margin: 10px 0;
              border: 1px solid #ddd;
            }
            .artwork-price {
              font-size: 12px;
              font-weight: bold;
              color: #8b6914;
              margin-top: 5px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 9px;
              color: #999;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>K2 GALERIE</h1>
            <p>${title}</p>
            <p>Erstellt am: ${date} • ${filteredArtworks.length} ${filteredArtworks.length === 1 ? 'Werk' : 'Werke'}</p>
          </div>
          
          ${filteredArtworks.map((artwork: any) => `
            <div class="artwork-item">
              <div class="artwork-header">
                <div class="artwork-title">${artwork.title || artwork.number}</div>
                <div class="artwork-number">Seriennummer: ${artwork.number || artwork.id}</div>
              </div>
              <div class="artwork-details">
                ${getCategoryLabel(artwork.category)}
                ${artwork.artist ? ' • ' + artwork.artist : ''}
                ${artwork.description ? '<br/>' + artwork.description : ''}
              </div>
              ${artwork.imageUrl ? `<img src="${artwork.imageUrl}" alt="${artwork.title}" class="artwork-image" />` : ''}
              <div class="artwork-price">Preis: € ${artwork.price ? artwork.price.toFixed(2) : '0.00'}</div>
              ${type === 'verkauft' ? '<div style="color: #2d6a2d; font-weight: bold; margin-top: 5px;">✓ Verkauft</div>' : ''}
            </div>
          `).join('')}
          
          <div class="footer">
            <div>K2 Galerie - Kunst & Keramik</div>
            <div>www.k2-galerie.at</div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 500);
              }, 500);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Cleanup nicht mehr nötig, da wir Data URLs verwenden (keine Blob URLs)

  // Kein body/html-Override mehr – K2-Theme (Orange) aus index.css/index.html gilt für die ganze App

  const s = WERBEUNTERLAGEN_STIL

  // ── VK2 MITGLIED-LOGIN-BEREICH ──
  const isMitgliedRoute = isVk2AdminContext() && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mitglied') === '1'
  // Programmierer-Bypass: ?dev=k2dev2026 → Login-Screen überspringen
  const devBypass = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === 'k2dev2026'

  if (isMitgliedRoute && !vk2EingeloggtMitglied && !devBypass) {
    const mitgliedListe = (vk2Stammdaten.mitglieder || []).filter(m => m.pin)
    return (
      <div style={{ minHeight: '100vh', background: '#0f1c2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '1rem' }}>
        <div style={{ background: '#162032', borderRadius: 20, border: '1px solid rgba(37,99,235,0.3)', padding: 'clamp(1.5rem,5vw,2.5rem)', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔑</div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f0f6ff' }}>Mitglied-Login</h1>
            <p style={{ margin: '0.4rem 0 0', color: 'rgba(160,200,255,0.6)', fontSize: '0.88rem' }}>Eigenes Profil bearbeiten</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: 'rgba(160,200,255,0.8)', fontWeight: 600 }}>Name wählen</label>
              <select
                value={mitgliedLoginName}
                onChange={(e) => { setMitgliedLoginName(e.target.value); setMitgliedLoginFehler('') }}
                style={{ width: '100%', padding: '0.7rem', background: '#1e2f47', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 10, color: '#f0f6ff', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">– Name wählen –</option>
                {mitgliedListe.map(m => (
                  <option key={m.name} value={m.name}>{m.name}{m.typ ? ` · ${m.typ}` : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: 'rgba(160,200,255,0.8)', fontWeight: 600 }}>PIN eingeben</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={mitgliedLoginPin}
                onChange={(e) => { setMitgliedLoginPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setMitgliedLoginFehler('') }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const m = mitgliedListe.find(x => x.name === mitgliedLoginName)
                    if (m && m.pin === mitgliedLoginPin) {
                      try { sessionStorage.setItem(VK2_MITGLIED_SESSION_KEY, m.name) } catch (_) {}
                      setVk2EingeloggtMitglied(m.name)
                      setMitgliedLoginFehler('')
                    } else {
                      setMitgliedLoginFehler('Name oder PIN falsch.')
                    }
                  }
                }}
                placeholder="••••"
                style={{ width: '100%', padding: '0.7rem', background: '#1e2f47', border: `1px solid ${mitgliedLoginFehler ? '#ef4444' : 'rgba(37,99,235,0.4)'}`, borderRadius: 10, color: '#f0f6ff', fontSize: '1.3rem', outline: 'none', letterSpacing: '0.4em', textAlign: 'center' }}
              />
              {mitgliedLoginFehler && <p style={{ margin: '0.3rem 0 0', color: '#ef4444', fontSize: '0.82rem' }}>{mitgliedLoginFehler}</p>}
            </div>

            <button
              type="button"
              disabled={!mitgliedLoginName || mitgliedLoginPin.length < 4}
              onClick={() => {
                const m = mitgliedListe.find(x => x.name === mitgliedLoginName)
                if (m && m.pin === mitgliedLoginPin) {
                  try { sessionStorage.setItem(VK2_MITGLIED_SESSION_KEY, m.name) } catch (_) {}
                  setVk2EingeloggtMitglied(m.name)
                  setMitgliedLoginFehler('')
                } else {
                  setMitgliedLoginFehler('Name oder PIN falsch.')
                }
              }}
              style={{ padding: '0.75rem', background: (!mitgliedLoginName || mitgliedLoginPin.length < 4) ? 'rgba(37,99,235,0.2)' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', border: 'none', borderRadius: 10, color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: (!mitgliedLoginName || mitgliedLoginPin.length < 4) ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
            >
              Einloggen →
            </button>

            <p style={{ margin: 0, textAlign: 'center', fontSize: '0.78rem', color: 'rgba(160,200,255,0.35)' }}>
              PIN vergessen? Den Vereins-Admin fragen.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Bei Bypass: als erstes Vorstandsmitglied einloggen (für Profil-Ansicht)
  const devBypassName = devBypass
    ? ((vk2Stammdaten.mitglieder || []).find(m => m.rolle === 'vorstand')?.name
        || (vk2Stammdaten.mitglieder || [])[0]?.name
        || null)
    : null

  if (isMitgliedRoute && (vk2EingeloggtMitglied || devBypassName)) {
    const aktiverName = vk2EingeloggtMitglied || devBypassName || ''
    const mitglied = (vk2Stammdaten.mitglieder || []).find(m => m.name === aktiverName)
    const mitgliedIdx = (vk2Stammdaten.mitglieder || []).findIndex(m => m.name === aktiverName)
    const istVorstand = mitglied?.rolle === 'vorstand'

    if (istVorstand && !devBypass) {
      // Vorstand → normaler Admin (URL ohne mitglied=1 öffnen)
      window.location.href = '/admin?context=vk2'
      return null
    }

    return (
      <div style={{ minHeight: '100vh', background: '#0f1c2e', color: '#f0f6ff', fontFamily: 'system-ui, sans-serif' }}>
        {/* Header */}
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: '#60a5fa', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Mein Profil</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f0f6ff' }}>
              {aktiverName}
              {devBypass && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: '#b54a1e', color: '#fff', borderRadius: 4, padding: '0.1rem 0.4rem', fontWeight: 700 }}>DEV</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => { try { sessionStorage.removeItem(VK2_MITGLIED_SESSION_KEY) } catch (_) {}; setVk2EingeloggtMitglied(null); window.location.href = '/vk2-login' }}
            style={{ padding: '0.4rem 0.9rem', background: 'transparent', border: '1px solid rgba(160,200,255,0.2)', borderRadius: 8, color: 'rgba(160,200,255,0.5)', fontSize: '0.8rem', cursor: 'pointer' }}
          >{devBypass ? '← Zurück' : 'Abmelden'}</button>
        </div>

        {/* Profil-Formular */}
        <div style={{ padding: 'clamp(1rem,3vw,2rem)', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          {/* Fotos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600 }}>👤 Foto</label>
              {mitglied?.mitgliedFotoUrl ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={mitglied.mitgliedFotoUrl} alt="Foto" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(37,99,235,0.5)', display: 'block' }} />
                  <button type="button" onClick={() => { const neu = [...(vk2Stammdaten.mitglieder||[])]; if (neu[mitgliedIdx]) { neu[mitgliedIdx] = { ...neu[mitgliedIdx], mitgliedFotoUrl: undefined }; setVk2Stammdaten({...vk2Stammdaten, mitglieder:neu}); try{localStorage.setItem(KEY_VK2_STAMMDATEN,JSON.stringify({...vk2Stammdaten,mitglieder:neu}))}catch(_){} }}} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#b54a1e', border: 'none', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', width: '100%', aspectRatio: '1', background: 'rgba(37,99,235,0.08)', border: '2px dashed rgba(37,99,235,0.3)', borderRadius: 12, cursor: 'pointer', color: 'rgba(160,200,255,0.5)', fontSize: '0.8rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '1.8rem' }}>👤</span><span>Foto hinzufügen</span>
                  <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => {
                    const file = e.target.files?.[0]; if (!file) return
                    const reader = new FileReader(); reader.onload = () => { const dataUrl = reader.result as string; const img = new Image(); img.onload = () => { const maxW=400; const scale=img.width>maxW?maxW/img.width:1; const c=document.createElement('canvas'); c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale); const ctx=c.getContext('2d'); const url=ctx?c.toDataURL('image/jpeg',0.6):dataUrl; if(ctx)ctx.drawImage(img,0,0,c.width,c.height); const neu=[...(vk2Stammdaten.mitglieder||[])]; if(neu[mitgliedIdx]){neu[mitgliedIdx]={...neu[mitgliedIdx],mitgliedFotoUrl:url};setVk2Stammdaten({...vk2Stammdaten,mitglieder:neu});try{localStorage.setItem(KEY_VK2_STAMMDATEN,JSON.stringify({...vk2Stammdaten,mitglieder:neu}))}catch(_){}} }; img.src=dataUrl }; reader.readAsDataURL(file)
                  }} />
                </label>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600 }}>🖼️ Werk</label>
              {mitglied?.imageUrl ? (
                <div style={{ position: 'relative' }}>
                  <img src={mitglied.imageUrl} alt="Werk" style={{ width: '100%', aspectRatio: '3/2', objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(37,99,235,0.3)', display: 'block' }} />
                  <button type="button" onClick={() => { const neu=[...(vk2Stammdaten.mitglieder||[])]; if(neu[mitgliedIdx]){neu[mitgliedIdx]={...neu[mitgliedIdx],imageUrl:undefined};setVk2Stammdaten({...vk2Stammdaten,mitglieder:neu});try{localStorage.setItem(KEY_VK2_STAMMDATEN,JSON.stringify({...vk2Stammdaten,mitglieder:neu}))}catch(_){}} }} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: '#b54a1e', border: 'none', color: '#fff', fontSize: '0.8rem', cursor: 'pointer', display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', width: '100%', aspectRatio: '3/2', background: 'rgba(37,99,235,0.08)', border: '2px dashed rgba(37,99,235,0.3)', borderRadius: 12, cursor: 'pointer', color: 'rgba(160,200,255,0.5)', fontSize: '0.8rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '1.8rem' }}>🖼️</span><span>Werk hinzufügen</span>
                  <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => {
                    const file = e.target.files?.[0]; if (!file) return
                    const reader = new FileReader(); reader.onload = () => { const dataUrl = reader.result as string; const img = new Image(); img.onload = () => { const maxW=600; const scale=img.width>maxW?maxW/img.width:1; const c=document.createElement('canvas'); c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale); const ctx=c.getContext('2d'); const url=ctx?c.toDataURL('image/jpeg',0.6):dataUrl; if(ctx)ctx.drawImage(img,0,0,c.width,c.height); const neu=[...(vk2Stammdaten.mitglieder||[])]; if(neu[mitgliedIdx]){neu[mitgliedIdx]={...neu[mitgliedIdx],imageUrl:url};setVk2Stammdaten({...vk2Stammdaten,mitglieder:neu});try{localStorage.setItem(KEY_VK2_STAMMDATEN,JSON.stringify({...vk2Stammdaten,mitglieder:neu}))}catch(_){}} }; img.src=dataUrl }; reader.readAsDataURL(file)
                  }} />
                </label>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600 }}>Kurz-Bio (Karte)</label>
            <textarea
              value={mitglied?.bio || ''}
              onChange={(e) => { const neu=[...(vk2Stammdaten.mitglieder||[])]; if(neu[mitgliedIdx]){neu[mitgliedIdx]={...neu[mitgliedIdx],bio:e.target.value};setVk2Stammdaten({...vk2Stammdaten,mitglieder:neu});try{localStorage.setItem(KEY_VK2_STAMMDATEN,JSON.stringify({...vk2Stammdaten,mitglieder:neu}))}catch(_){}} }}
              placeholder="1–2 Sätze für die öffentliche Mitglieder-Karte ..."
              rows={2}
              style={{ width: '100%', padding: '0.65rem', background: '#1e2f47', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10, color: '#f0f6ff', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Vita */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600 }}>📝 Vita (ausführlich)</label>
            <textarea
              value={mitglied?.vita || ''}
              onChange={(e) => { const neu=[...(vk2Stammdaten.mitglieder||[])]; if(neu[mitgliedIdx]){neu[mitgliedIdx]={...neu[mitgliedIdx],vita:e.target.value};setVk2Stammdaten({...vk2Stammdaten,mitglieder:neu});try{localStorage.setItem(KEY_VK2_STAMMDATEN,JSON.stringify({...vk2Stammdaten,mitglieder:neu}))}catch(_){}} }}
              placeholder={'Ausführlicher Lebenslauf, Ausstellungen, Technik, Inspiration ...'}
              rows={8}
              style={{ width: '100%', padding: '0.65rem', background: '#1e2f47', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10, color: '#f0f6ff', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'Georgia, serif', lineHeight: 1.7 }}
            />
          </div>

          {/* Website */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600 }}>🌐 Homepage / Galerie-Link</label>
            <input
              type="text"
              value={mitglied?.galerieLinkUrl || mitglied?.website || ''}
              onChange={(e) => { const neu=[...(vk2Stammdaten.mitglieder||[])]; if(neu[mitgliedIdx]){neu[mitgliedIdx]={...neu[mitgliedIdx],galerieLinkUrl:e.target.value};setVk2Stammdaten({...vk2Stammdaten,mitglieder:neu});try{localStorage.setItem(KEY_VK2_STAMMDATEN,JSON.stringify({...vk2Stammdaten,mitglieder:neu}))}catch(_){}} }}
              placeholder="https://meine-seite.at"
              style={{ width: '100%', padding: '0.65rem', background: '#1e2f47', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 10, color: '#f0f6ff', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>

          {/* Eigene Karte drucken */}
          {mitglied && (
            <button
              type="button"
              onClick={() => printMitgliedskarten([mitglied], vk2Stammdaten.verein?.name || 'Verein')}
              style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg,#b54a1e,#d4622a)', border: 'none', borderRadius: 10, color: '#fff', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              🖨️ Meine Mitgliedskarte drucken
            </button>
          )}

          <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(160,200,255,0.3)', textAlign: 'center' }}>Änderungen werden sofort gespeichert.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: s.bgDark,
      color: s.text,
      position: 'relative',
      overflowX: 'hidden',
      width: '100%',
      fontFamily: s.fontBody
    }}>
      <link rel="stylesheet" href={PROMO_FONTS_URL} />

      {/* ── Zurück zum Guide-Hub (erscheint wenn man vom /entdecken-Hub kommt) ── */}
      {fromHub && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
          background: 'linear-gradient(135deg, #b54a1e, #ff8c42)',
          padding: '0.5rem 1rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          boxShadow: '0 2px 12px rgba(181,74,30,0.45)',
        }}>
          <button
            type="button"
            onClick={() => {
              try { sessionStorage.removeItem('k2-hub-from') } catch (_) {}
              window.location.href = isVk2AdminContext()
                ? '/entdecken?step=hub&q1=verein'
                : '/entdecken?step=hub'
            }}
            style={{
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '20px', padding: '0.3rem 1rem', color: '#fff',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontFamily: s.fontBody,
            }}>
            ← Zurück zum Guide
          </button>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem' }}>
            Du schaust dir gerade an: <strong style={{ color: '#fff' }}>
              {activeTab === 'werke' ? '🖼️ Meine Werke' :
               activeTab === 'eventplan' ? '🎟️ Events & Ausstellungen' :
               activeTab === 'design' ? '✨ Aussehen & Design' :
               activeTab === 'katalog' ? '📋 Werkkatalog' :
               activeTab === 'statistik' ? '🧾 Kassa & Verkauf' :
               activeTab === 'einstellungen' ? '⚙️ Einstellungen' :
               activeTab}
            </strong>
          </span>
        </div>
      )}

      {/* Dezenter Akzent-Hintergrund – wie Willkommensseite Mustergalerie */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(ellipse 90% 70% at 50% 0%, ${s.accentSoft}, transparent 55%)`,
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      {/* Spacer wenn Zurück-Banner sichtbar ist */}
      {fromHub && <div style={{ height: 44 }} />}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <header style={{
          padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1.5rem, 4vw, 3rem)',
          maxWidth: '1600px',
          margin: '0 auto',
          marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
          borderBottom: `1px solid ${s.accent}18`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {/* Logo + Admin-Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {isOeffentlichAdminContext() ? (
                // ök2: Kein K2-Logo – nur Kontext-Badge damit klar ist wo man ist
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: s.fontHeading, fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: s.accent, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    ök2
                  </span>
                  <span style={{ marginTop: '0.2rem', display: 'block', color: s.muted, fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Muster-Galerie
                  </span>
                </div>
              ) : (
                <AdminBrandLogo title={isVk2AdminContext() ? 'VK2 Vereinsplattform' : undefined} />
              )}
              {!isOeffentlichAdminContext() && (
                <span style={{
                  padding: '0.25rem 0.65rem',
                  background: `${s.accent}18`,
                  border: `1px solid ${s.accent}33`,
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  color: s.accent,
                  fontWeight: 600,
                  letterSpacing: '0.03em'
                }}>
                  ADMIN
                </span>
              )}
            </div>

            {/* Schnell-Aktionen – das was man täglich braucht */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>

              {/* VK2: Zurück zur Vereins-Galerie */}
              {isVk2AdminContext() && (
                <Link
                  to={PROJECT_ROUTES.vk2.galerie}
                  title="Zur Vereins-Galerie"
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: s.bgCard,
                    border: `1px solid ${s.accent}28`,
                    color: s.text,
                    textDecoration: 'none',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${s.accent}66`; e.currentTarget.style.background = s.bgElevated }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${s.accent}28`; e.currentTarget.style.background = s.bgCard }}
                >
                  🏛️
                </Link>
              )}

              {/* Galerie / Mitglieder ansehen */}
              <Link
                to={isVk2AdminContext() ? PROJECT_ROUTES.vk2.galerieVorschau : isOeffentlichAdminContext() ? PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau : PROJECT_ROUTES['k2-galerie'].galerie}
                state={{ fromAdmin: true }}
                style={{
                  padding: '0.5rem 1rem',
                  background: s.bgCard,
                  border: `1px solid ${s.accent}28`,
                  color: s.text,
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${s.accent}66`; e.currentTarget.style.background = s.bgElevated }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${s.accent}28`; e.currentTarget.style.background = s.bgCard }}
              >
                {isVk2AdminContext() ? '👥 Unsere Mitglieder' : '🖼️ Galerie ansehen'}
              </Link>

              {/* Kasse – primäre Aktion, deutlich hervorgehoben */}
              {!isVk2AdminContext() && (
                <Link
                  to={PROJECT_ROUTES['k2-galerie'].shop}
                  state={{ openAsKasse: true, fromOeffentlich: isOeffentlichAdminContext() || undefined }}
                  style={{
                    padding: '0.55rem 1.1rem',
                    background: s.gradientAccent,
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 8px rgba(181,74,30,0.18)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(181,74,30,0.28)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(181,74,30,0.18)' }}
                >
                  💰 Kasse öffnen
                </Link>
              )}

              {/* Reservieren – nur K2, nicht VK2/ök2 */}
              {!isOeffentlichAdminContext() && !isVk2AdminContext() && (
                <button type="button" onClick={() => setShowReserveModal(true)}
                  style={{ padding: '0.5rem 1rem', background: s.bgCard, border: `1px solid #d9770688`, color: '#d97706', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fef3c7' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = s.bgCard }}
                >
                  🔶 Reservieren
                </button>
              )}

              {/* Kundendaten – nur für K2 und ök2, nicht für VK2 (Mitglieder sind in Stammdaten) */}
              {!isVk2AdminContext() && (
                <Link
                  to={PROJECT_ROUTES['k2-galerie'].kunden}
                  style={{
                    padding: '0.5rem 1rem',
                    background: s.bgCard,
                    border: `1px solid ${s.accent}28`,
                    color: s.text,
                    textDecoration: 'none',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${s.accent}66`; e.currentTarget.style.background = s.bgElevated }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${s.accent}28`; e.currentTarget.style.background = s.bgCard }}
                >
                  {isOeffentlichAdminContext() ? '📋 Kontakte' : '👥 Kunden'}
                </Link>
              )}

              {/* Abmelden – klein und zurückhaltend */}
              {!isOeffentlichAdminContext() && (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      sessionStorage.removeItem(ADMIN_CONTEXT_KEY)
                      localStorage.removeItem('k2-admin-unlocked')
                      localStorage.removeItem('k2-admin-unlocked-expiry')
                    } catch (_) {}
                    if (isVk2AdminContext()) navigate(PROJECT_ROUTES.vk2.galerie)
                    else navigate(PROJECT_ROUTES['k2-galerie'].galerie)
                  }}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: 'transparent',
                    border: `1px solid ${s.muted}44`,
                    color: s.muted,
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title="Admin-Login auf diesem Gerät beenden"
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${s.muted}88`; e.currentTarget.style.color = s.text }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${s.muted}44`; e.currentTarget.style.color = s.muted }}
                >
                  Abmelden
                </button>
              )}
            </div>
          </div>
        </header>

        <main style={{
          padding: '0 clamp(1.5rem, 4vw, 3rem)',
          paddingBottom: 'clamp(4rem, 10vw, 6rem)',
          maxWidth: '1600px',
          margin: '0 auto'
        }}>
          {/* Admin-Dashboard: "Was willst du heute tun?" – große Karten statt Tab-Reihe */}
          {activeTab !== 'assistent' && (
          <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)' }}>

            {/* Zurück-Link wenn in einem Bereich */}
            {activeTab !== 'werke' && (
              <button
                type="button"
                onClick={() => setActiveTab('werke')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.muted, fontSize: '0.9rem', padding: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                ← Zurück zur Übersicht
              </button>
            )}

            {/* Haupt-Dashboard: nur wenn kein Bereich aktiv (werke = Startseite) */}
            {activeTab === 'werke' && (
              <div>

                {/* Großer Willkommens-Hub wenn Guide-Flow aktiv */}
                {guideFlowAktiv && isOeffentlichAdminContext() && !guideBannerClosed && (() => {
                  const istVerein = guidePfad === 'gemeinschaft'
                  const akzent = istVerein ? '#1e5cb5' : '#b54a1e'
                  const akzentHell = istVerein ? '#42a4ff' : '#ff8c42'
                  const akzentGrad = istVerein
                    ? 'linear-gradient(135deg, #1e5cb5, #42a4ff)'
                    : 'linear-gradient(135deg, #b54a1e, #ff8c42)'
                  const avatarEmoji = istVerein ? '🏛️' : guidePfad === 'atelier' ? '🏢' : guidePfad === 'entdecker' ? '🌱' : '👨‍🎨'
                  const vornameTitel = guideVorname ? `Willkommen, ${guideVorname}!` : 'Willkommen!'
                  const pfadText = istVerein ? 'Das ist die Zentrale eures Vereins.'
                    : guidePfad === 'atelier' ? 'Dein Atelier ist bereit.'
                    : guidePfad === 'entdecker' ? 'Deine Galerie wartet auf dich.'
                    : 'Das ist deine Galerie-Zentrale.'
                  const galerieUrl = '/projects/k2-galerie/galerie-oeffentlich'

                  // Alle Stationen – Kacheln links + rechts
                  type HubTab = 'werke' | 'eventplan' | 'design' | 'einstellungen' | 'katalog' | 'assistent'
                  const alleStationen: { emoji: string; name: string; beschreibung: string; tab: HubTab }[] = istVerein ? [
                    { emoji: '🖼️', name: 'Werke & Mitglieder', beschreibung: 'Alle Werke aller Mitglieder – Fotos, Preise, Profile.', tab: 'werke' },
                    { emoji: '🎟️', name: 'Events & Ausstellungen', beschreibung: 'Vernissagen planen, Einladungen erstellen, QR-Codes.', tab: 'eventplan' },
                    { emoji: '✨', name: 'Aussehen & Design', beschreibung: 'Farben, Logo, Texte – die Galerie wird euer Gesicht.', tab: 'design' },
                    { emoji: '⚙️', name: 'Einstellungen', beschreibung: 'Vereinsdaten, Kontakt, Mitglieder verwalten.', tab: 'einstellungen' },
                    { emoji: '📋', name: 'Werkkatalog', beschreibung: 'Alle Werke auf einen Blick – filtern, suchen, drucken.', tab: 'katalog' },
                    { emoji: '🚀', name: 'Jetzt starten', beschreibung: 'Daten ausfüllen und die Galerie live schalten.', tab: 'assistent' },
                  ] : [
                    { emoji: '🖼️', name: 'Meine Werke', beschreibung: 'Fotos hochladen, Titel, Preis – ein Klick und es ist live.', tab: 'werke' },
                    { emoji: '🎟️', name: 'Events & Ausstellungen', beschreibung: 'Vernissage planen, Einladungen & QR-Codes erstellen.', tab: 'eventplan' },
                    { emoji: '✨', name: 'Aussehen & Design', beschreibung: 'Farben, Texte, dein Foto – die Galerie wird zu dir.', tab: 'design' },
                    { emoji: '⚙️', name: 'Einstellungen', beschreibung: 'Kontakt, Adresse, Öffnungszeiten – deine Stammdaten.', tab: 'einstellungen' },
                    { emoji: '📋', name: 'Werkkatalog', beschreibung: 'Alle Werke auf einen Blick – filtern, suchen, drucken.', tab: 'katalog' },
                    { emoji: '🚀', name: 'Jetzt starten', beschreibung: 'Daten ausfüllen und deine Galerie live schalten.', tab: 'assistent' },
                  ]

                  // Aktive Station = welcher Tab ist gerade offen
                  const aktivIdx = alleStationen.findIndex(s => s.tab === activeTab)
                  const aktivStation = aktivIdx >= 0 ? alleStationen[aktivIdx] : alleStationen[0]
                  const halbePunkte = Math.ceil(alleStationen.length / 2)
                  const linksStationen = alleStationen.slice(0, halbePunkte)
                  const rechtsStationen = alleStationen.slice(halbePunkte)

                  return (
                    <div style={{ background: `linear-gradient(135deg, ${akzent}10, ${akzent}05)`, border: `1.5px solid ${akzent}30`, borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem', position: 'relative' }}>
                      <button type="button" onClick={() => setGuideBannerClosed(true)} style={{ position: 'absolute', top: '0.9rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: `${akzent}44`, fontSize: '1.2rem', lineHeight: 1, padding: '0.2rem 0.4rem' }} title="Schließen">×</button>

                      {/* Kopfzeile */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.25rem', flexWrap: 'wrap' as const }}>
                        <div style={{ width: 46, height: 46, borderRadius: '50%', background: akzentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0, boxShadow: `0 4px 14px ${akzent}44` }}>
                          {avatarEmoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1c1a18', lineHeight: 1.3 }}>{vornameTitel} {pfadText}</div>
                          <div style={{ fontSize: '0.82rem', color: '#5c5650', marginTop: '0.2rem' }}>
                            {istVerein ? 'Dein Guide führt euch durch alle Bereiche.' : 'Klick auf eine Kachel – dein Guide erklärt sie dir.'}
                          </div>
                        </div>
                        <a href={galerieUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 1rem', background: akzent, color: '#fff', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' as const, boxShadow: `0 3px 10px ${akzent}44` }}>
                          {istVerein ? '👥 Unsere Mitglieder' : '🎨 Galerie ansehen'} →
                        </a>
                      </div>

                      {/* Hub: Kacheln links | aktiver Dialog Mitte | Kacheln rechts */}
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>

                        {/* Kacheln links */}
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem', width: '140px', flexShrink: 0 }}>
                          {linksStationen.map((st, i) => {
                            const istAktiv = activeTab === st.tab
                            return (
                              <button key={st.tab} type="button"
                                onClick={() => { setActiveTab(st.tab); window.scrollTo({ top: 200, behavior: 'smooth' }) }}
                                style={{
                                  padding: '0.65rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                  background: istAktiv ? akzentGrad : '#fff',
                                  border: istAktiv ? 'none' : '1px solid #e8e4de',
                                  borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit',
                                  transition: 'all 0.15s', textAlign: 'left' as const,
                                  boxShadow: istAktiv ? `0 3px 12px ${akzent}44` : '0 1px 3px rgba(0,0,0,0.06)',
                                  color: istAktiv ? '#fff' : '#1c1a18',
                                  fontWeight: istAktiv ? 700 : 400,
                                  position: 'relative' as const,
                                }}>
                                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{st.emoji}</span>
                                <span style={{ fontSize: '0.78rem', lineHeight: 1.3 }}>{st.name}</span>
                                {istAktiv && <span style={{ position: 'absolute', top: 5, right: 7, fontSize: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>●</span>}
                              </button>
                            )
                          })}
                        </div>

                        {/* Aktiver Dialog Mitte */}
                        <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '1.25rem', border: `2px solid ${akzentHell}44`, boxShadow: `0 4px 20px ${akzent}18`, display: 'flex', flexDirection: 'column' as const, gap: '0.75rem', minWidth: 0 }}>
                          {/* Station-Kopf */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: akzentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                              {avatarEmoji}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.6rem', color: akzentHell, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                                {istVerein ? 'Vereins-Guide' : 'Galerie-Guide'}
                              </div>
                              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1c1a18' }}>
                                {aktivStation.emoji} {aktivStation.name}
                              </div>
                            </div>
                          </div>
                          {/* Fortschrittsbalken */}
                          <div style={{ display: 'flex', gap: '0.2rem' }}>
                            {alleStationen.map((st, i) => (
                              <div key={st.tab}
                                onClick={() => { setActiveTab(st.tab); window.scrollTo({ top: 200, behavior: 'smooth' }) }}
                                style={{ flex: 1, height: 4, borderRadius: 2, cursor: 'pointer', transition: 'background 0.2s',
                                  background: i < (aktivIdx >= 0 ? aktivIdx : 0) ? akzent : st.tab === activeTab ? akzentHell : '#e8e4de' }}
                                title={st.name}
                              />
                            ))}
                          </div>
                          {/* Beschreibung */}
                          <div style={{ fontSize: '0.88rem', color: '#5c5650', lineHeight: 1.6, flex: 1 }}>
                            {aktivStation.beschreibung}
                          </div>
                          {/* Aktion */}
                          <button type="button"
                            onClick={() => { setActiveTab(aktivStation.tab); window.scrollTo({ top: 200, behavior: 'smooth' }) }}
                            style={{ width: '100%', padding: '0.8rem', background: akzentGrad, border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit', boxShadow: `0 4px 14px ${akzent}44` }}>
                            {aktivStation.emoji} {aktivStation.name} öffnen →
                          </button>
                        </div>

                        {/* Kacheln rechts */}
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem', width: '140px', flexShrink: 0 }}>
                          {rechtsStationen.map((st) => {
                            const istAktiv = activeTab === st.tab
                            return (
                              <button key={st.tab} type="button"
                                onClick={() => { setActiveTab(st.tab); window.scrollTo({ top: 200, behavior: 'smooth' }) }}
                                style={{
                                  padding: '0.65rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                  background: istAktiv ? akzentGrad : '#fff',
                                  border: istAktiv ? 'none' : '1px solid #e8e4de',
                                  borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit',
                                  transition: 'all 0.15s', textAlign: 'left' as const,
                                  boxShadow: istAktiv ? `0 3px 12px ${akzent}44` : '0 1px 3px rgba(0,0,0,0.06)',
                                  color: istAktiv ? '#fff' : '#1c1a18',
                                  fontWeight: istAktiv ? 700 : 400,
                                  position: 'relative' as const,
                                }}>
                                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{st.emoji}</span>
                                <span style={{ fontSize: '0.78rem', lineHeight: 1.3 }}>{st.name}</span>
                                {istAktiv && <span style={{ position: 'absolute', top: 5, right: 7, fontSize: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>●</span>}
                              </button>
                            )
                          })}
                        </div>

                      </div>
                    </div>
                  )
                })()}

                {/* Guide-Willkommensbanner – nur wenn kein globaler Guide-Flow aktiv */}
                {guideVorname && isOeffentlichAdminContext() && !guideBannerClosed && !guideFlowAktiv && (() => {
                  const istVerein = guidePfad === 'gemeinschaft'
                  type BannerBereich = { emoji: string; name: string; text: string; tab: string }
                  const bereiche: BannerBereich[] = istVerein ? [
                    { emoji: '🏛️', name: 'Gemeinschafts-Galerie', text: 'Alle Werke aller Mitglieder unter einem Dach – jede:r mit eigenem Profil', tab: 'werke' },
                    { emoji: '📋', name: 'Werkkatalog', text: 'Alle Werke des Vereins filtern, suchen, drucken', tab: 'katalog' },
                    { emoji: '🎟️', name: 'Veranstaltungen', text: 'Ausstellungen planen, Einladungen an alle Mitglieder versenden', tab: 'eventplan' },
                    { emoji: '✨', name: 'Aussehen', text: 'Farben, Texte, Foto – eure Mitglieder-Seite nach euren Wünschen', tab: 'design' },
                    { emoji: '⚙️', name: 'Einstellungen', text: 'Vereinsdaten, Kontakt, Mitglieder verwalten', tab: 'einstellungen' },
                  ] : [
                    { emoji: '🎨', name: 'Meine Werke', text: 'Fotos hochladen, Titel, Preis, Beschreibung – deine Galerie füllen', tab: 'werke' },
                    { emoji: '📋', name: 'Werkkatalog', text: 'Alle Werke auf einen Blick – filtern, suchen, drucken', tab: 'katalog' },
                    { emoji: '💰', name: 'Kassa', text: 'Direkt verkaufen – Beleg drucken, Übersicht behalten', tab: 'kassa' },
                    { emoji: '📢', name: 'Veranstaltungen', text: 'Events planen, Einladungen erstellen, Presse informieren', tab: 'eventplan' },
                    { emoji: '✨', name: 'Aussehen', text: 'Farben, Texte, dein Foto – die Galerie wird zu dir', tab: 'design' },
                  ]
                  const galerieUrl = isOeffentlichAdminContext()
                    ? '/projects/k2-galerie/galerie-oeffentlich'
                    : '/projects/k2-galerie/galerie'
                  return (
                    <div style={{ background: 'linear-gradient(135deg, #b54a1e14, #b54a1e08)', border: '1.5px solid #b54a1e33', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.75rem', position: 'relative' }}>
                      <button type="button" onClick={() => setGuideBannerClosed(true)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: '#b54a1e66', fontSize: '1.1rem', lineHeight: 1, padding: '0.2rem 0.4rem' }} title="Schließen">×</button>

                      {/* Kopf + Galerie-Vorschau Button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontSize: '1.3rem', marginBottom: '0.35rem' }}>{istVerein ? '🤝' : '👋'}</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1c1a18' }}>
                            {istVerein
                              ? `Willkommen, ${guideVorname}! Das ist die Zentrale eures Vereins.`
                              : `Willkommen, ${guideVorname}! Das ist deine Galerie-Zentrale.`}
                          </div>
                        </div>
                        <a href={galerieUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.9rem', background: '#b54a1e', color: '#fff', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' as const }}>
                          {istVerein ? '👥 Unsere Mitglieder' : '🎨 Galerie ansehen'} →
                        </a>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#5c5650', lineHeight: 1.55, marginBottom: '1rem' }}>
                        {istVerein
                          ? 'Tippe auf einen Bereich um direkt loszulegen:'
                          : 'Tippe auf einen Bereich um direkt loszulegen:'}
                      </div>

                      {/* Bereichs-Karten – klickbar */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
                        {bereiche.map((b, i) => (
                          <button key={i} type="button"
                            onClick={() => {
                              setGuideBannerClosed(true)
                              if (b.tab === 'kassa') {
                                try { sessionStorage.setItem('k2-admin-context', isOeffentlichAdminContext() ? 'oeffentlich' : 'k2') } catch (_) {}
                                window.location.href = '/projects/k2-galerie/shop?openAsKasse=1'
                              } else {
                                const validTabs = ['werke','katalog','statistik','zertifikat','newsletter','pressemappe','eventplan','design','einstellungen','assistent'] as const
                                type AdminTab = typeof validTabs[number]
                                if (validTabs.includes(b.tab as AdminTab)) {
                                  setActiveTab(b.tab as AdminTab)
                                }
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }
                            }}
                            style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: '10px', padding: '0.65rem 0.8rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#b54a1e66'; e.currentTarget.style.background = '#fdf9f6' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4de'; e.currentTarget.style.background = '#fff' }}
                          >
                            <span style={{ fontSize: '1.25rem', flexShrink: 0, lineHeight: 1.2 }}>{b.emoji}</span>
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1c1a18', marginBottom: '0.2rem' }}>{b.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#5c5650', lineHeight: 1.4 }}>{b.text}</div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Trennlinie */}
                      <div style={{ height: '1px', background: '#b54a1e22', margin: '0.9rem 0' }} />

                      {/* Empfehlungs-Hinweis */}
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🤝</span>
                        <div style={{ fontSize: '0.8rem', color: '#5c5650', lineHeight: 1.5 }}>
                          <span style={{ fontWeight: 700, color: '#1c1a18' }}>Andere Künstler:innen einladen:</span>{' '}
                          Wenn du jemanden kennst der das hier auch braucht – teile einfach deinen persönlichen Link. Beide profitieren: du bekommst deinen nächsten Monat gratis, sie starten mit einem Monat gratis. Kein Verkaufen, einfach teilen.
                        </div>
                      </div>

                      {/* Lizenz-Übersicht */}
                      <div style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: '10px', padding: '0.75rem 0.9rem', marginBottom: '0.9rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1c1a18', marginBottom: '0.55rem' }}>📋 Was du gerade siehst – und was noch wartet:</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.45rem' }}>
                          {[
                            { name: 'Basis', color: '#5c5650', icon: '🔓', text: 'Galerie, Werke, Kassa – sofort, kostenlos testen' },
                            { name: 'Pro', color: '#b54a1e', icon: '⭐', text: 'Werkverzeichnis, Zertifikate, Pressemappe, Events' },
                            { name: istVerein ? 'VK2 Verein' : 'Studio', color: '#1d6b3a', icon: istVerein ? '🏛️' : '🏢', text: istVerein ? 'Mehrere Mitglieder, gemeinsame Verwaltung' : 'Mehrere Künstler:innen, gemeinsame Plattform' },
                          ].map((l, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{l.icon}</span>
                              <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: l.color }}>{l.name}</div>
                                <div style={{ fontSize: '0.7rem', color: '#5c5650', lineHeight: 1.35 }}>{l.text}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: '#b54a1e', fontWeight: 600 }}>
                        👇 Einfach einen Bereich antippen – los geht's!
                      </div>
                    </div>
                  )
                })()}

                {/* Begrüßung + Karten-Grid: nur wenn kein Guide aktiv */}
                {!(guideVorname && isOeffentlichAdminContext() && !guideBannerClosed) && !guideFlowAktiv && (
                <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 2rem)' }}>
                  <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 700, color: s.text, margin: '0 0 0.35rem' }}>
                    Was möchtest du heute tun?
                  </h2>
                  <p style={{ color: s.muted, margin: 0, fontSize: '0.95rem' }}>
                    Wähle einen Bereich – alles ist einen Klick entfernt.
                  </p>
                </div>
                )}

                {/* Karten-Grid: nur ohne Guide */}
                {!(guideVorname && isOeffentlichAdminContext() && !guideBannerClosed) && !guideFlowAktiv && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'clamp(1rem, 2.5vw, 1.5rem)' }}>

                  {/* Werke */}
                  <button type="button" onClick={() => {/* bleibt auf werke, scrollt runter */}} style={{ textAlign: 'left', cursor: 'default', background: s.bgCard, border: `2px solid ${s.accent}33`, borderRadius: '16px', padding: 'clamp(1.25rem, 3vw, 1.75rem)', boxShadow: s.shadow, transition: 'all 0.2s ease' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎨</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: s.text, marginBottom: '0.35rem' }}>
                      {isVk2AdminContext() ? 'Vereinsmitglieder' : 'Meine Werke'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: s.muted, lineHeight: 1.5, marginBottom: '1rem' }}>
                      {isVk2AdminContext() ? 'Mitglieder hinzufügen, bearbeiten, verwalten' : 'Werke hinzufügen, bearbeiten, veröffentlichen'}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: s.accent }}>↓ Direkt hier unten</div>
                  </button>

                  {/* Werkkatalog – nur K2/ök2, nicht VK2 (VK2 hat Mitglieder, keine Werkdatenbank) */}
                  {!isVk2AdminContext() && (
                  <button type="button" onClick={() => setActiveTab('katalog')} style={{ textAlign: 'left', cursor: 'pointer', background: s.bgCard, border: `2px solid ${s.accent}22`, borderRadius: '16px', padding: 'clamp(1.25rem, 3vw, 1.75rem)', boxShadow: s.shadow, transition: 'all 0.2s ease', fontFamily: 'inherit' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${s.accent}66`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${s.accent}22`; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📋</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: s.text, marginBottom: '0.35rem' }}>Werkkatalog</div>
                    <div style={{ fontSize: '0.85rem', color: s.muted, lineHeight: 1.5, marginBottom: '1rem' }}>
                      Alle Werke filtern, suchen, drucken – nach Status, Kategorie, Datum, Preis
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: s.accent }}>Öffnen →</div>
                  </button>
                  )}

                  {/* Statistik – nur K2, nicht VK2/ök2 */}
                  {!isOeffentlichAdminContext() && !isVk2AdminContext() && (
                  <button type="button" onClick={() => setActiveTab('statistik')} style={{ textAlign: 'left', cursor: 'pointer', background: s.bgCard, border: `2px solid ${s.accent}22`, borderRadius: '16px', padding: 'clamp(1.25rem, 3vw, 1.75rem)', boxShadow: s.shadow, transition: 'all 0.2s ease', fontFamily: 'inherit' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${s.accent}66`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${s.accent}22`; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📊</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: s.text, marginBottom: '0.35rem' }}>Verkaufsstatistik</div>
                    <div style={{ fontSize: '0.85rem', color: s.muted, lineHeight: 1.5, marginBottom: '1rem' }}>
                      Umsatz, meistverkaufte Werke, Kategorien, Zeitraum-Auswertung
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: s.accent }}>Öffnen →</div>
                  </button>
                  )}

                  {/* Echtheitszertifikat – nur K2, nicht VK2/ök2 */}
                  {!isOeffentlichAdminContext() && !isVk2AdminContext() && (
                  <button type="button" onClick={() => setActiveTab('zertifikat')} style={{ textAlign: 'left', cursor: 'pointer', background: s.bgCard, border: '2px solid rgba(251,191,36,0.35)', borderRadius: '16px', padding: 'clamp(1.25rem, 3vw, 1.75rem)', boxShadow: s.shadow, transition: 'all 0.2s ease', fontFamily: 'inherit', position: 'relative' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.7)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.35)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ position: 'absolute', top: -10, right: 14, background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', color: '#1a1a00', fontSize: '0.68rem', fontWeight: 800, padding: '2px 9px', borderRadius: 20 }}>💎 PREMIUM</div>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔏</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: s.text, marginBottom: '0.35rem' }}>Echtheitszertifikate</div>
                    <div style={{ fontSize: '0.85rem', color: s.muted, lineHeight: 1.5, marginBottom: '1rem' }}>
                      PDF-Zertifikat pro Werk – mit Foto, Galeriedaten, Unterschrift
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24' }}>Öffnen →</div>
                  </button>
                  )}

                  {/* Newsletter – nur K2, nicht VK2/ök2 */}
                  {!isOeffentlichAdminContext() && !isVk2AdminContext() && (
                  <button type="button" onClick={() => setActiveTab('newsletter')} style={{ textAlign: 'left', cursor: 'pointer', background: s.bgCard, border: '2px solid rgba(251,191,36,0.35)', borderRadius: '16px', padding: 'clamp(1.25rem, 3vw, 1.75rem)', boxShadow: s.shadow, transition: 'all 0.2s ease', fontFamily: 'inherit', position: 'relative' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.7)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.35)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ position: 'absolute', top: -10, right: 14, background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', color: '#1a1a00', fontSize: '0.68rem', fontWeight: 800, padding: '2px 9px', borderRadius: 20 }}>💎 PREMIUM</div>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📬</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: s.text, marginBottom: '0.35rem' }}>Newsletter & Einladungen</div>
                    <div style={{ fontSize: '0.85rem', color: s.muted, lineHeight: 1.5, marginBottom: '1rem' }}>
                      Kontaktliste für Vernissagen, Einladungen und Neuigkeiten
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24' }}>Öffnen →</div>
                  </button>
                  )}

                  {/* Pressemappe – nur K2, nicht VK2/ök2 */}
                  {!isOeffentlichAdminContext() && !isVk2AdminContext() && (
                  <button type="button" onClick={() => setActiveTab('pressemappe')} style={{ textAlign: 'left', cursor: 'pointer', background: s.bgCard, border: '2px solid rgba(251,191,36,0.35)', borderRadius: '16px', padding: 'clamp(1.25rem, 3vw, 1.75rem)', boxShadow: s.shadow, transition: 'all 0.2s ease', fontFamily: 'inherit', position: 'relative' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.7)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.35)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ position: 'absolute', top: -10, right: 14, background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', color: '#1a1a00', fontSize: '0.68rem', fontWeight: 800, padding: '2px 9px', borderRadius: 20 }}>💎 PREMIUM</div>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📰</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: s.text, marginBottom: '0.35rem' }}>Pressemappe</div>
                    <div style={{ fontSize: '0.85rem', color: s.muted, lineHeight: 1.5, marginBottom: '1rem' }}>
                      Automatisch generiertes PDF aus Stammdaten, Vita und ausgewählten Werken
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24' }}>Öffnen →</div>
                  </button>
                  )}

                  {/* Eventplanung */}
                  <button type="button" onClick={() => setActiveTab('eventplan')} style={{ textAlign: 'left', cursor: 'pointer', background: s.bgCard, border: `2px solid ${s.accent}22`, borderRadius: '16px', padding: 'clamp(1.25rem, 3vw, 1.75rem)', boxShadow: s.shadow, transition: 'all 0.2s ease', fontFamily: 'inherit' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${s.accent}66`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${s.accent}22`; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📢</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: s.text, marginBottom: '0.35rem' }}>Veranstaltungen & Werbung</div>
                    <div style={{ fontSize: '0.85rem', color: s.muted, lineHeight: 1.5, marginBottom: '1rem' }}>
                      Events planen, Einladungen und Flyer erstellen, Presse, Social Media
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: s.accent }}>Öffnen →</div>
                  </button>

                  {/* Design */}
                  <button type="button" onClick={() => setActiveTab('design')} style={{ textAlign: 'left', cursor: 'pointer', background: s.bgCard, border: `2px solid ${s.accent}22`, borderRadius: '16px', padding: 'clamp(1.25rem, 3vw, 1.75rem)', boxShadow: s.shadow, transition: 'all 0.2s ease', fontFamily: 'inherit' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${s.accent}66`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${s.accent}22`; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✨</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: s.text, marginBottom: '0.35rem' }}>Aussehen der Galerie</div>
                    <div style={{ fontSize: '0.85rem', color: s.muted, lineHeight: 1.5, marginBottom: '1rem' }}>
                      Nach deinen Wünschen anpassen – Farben, Texte, Bilder, Theme
                    </div>
                    <div style={{ padding: '0.5rem 1rem', background: `linear-gradient(135deg, ${s.accent} 0%, #d96b35 100%)`, color: '#fff', borderRadius: 8, fontSize: '0.9rem', fontWeight: 700 }}>✨ Jetzt gestalten →</div>
                  </button>

                  {/* Einstellungen */}
                  <button type="button" onClick={() => setActiveTab('einstellungen')} style={{ textAlign: 'left', cursor: 'pointer', background: s.bgCard, border: `2px solid ${s.accent}22`, borderRadius: '16px', padding: 'clamp(1.25rem, 3vw, 1.75rem)', boxShadow: s.shadow, transition: 'all 0.2s ease', fontFamily: 'inherit' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${s.accent}66`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${s.accent}22`; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚙️</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: s.text, marginBottom: '0.35rem' }}>Einstellungen</div>
                    <div style={{ fontSize: '0.85rem', color: s.muted, lineHeight: 1.5, marginBottom: '1rem' }}>
                      Meine Daten (Name, Kontakt, Adresse), Drucker, Sicherheit, Backup
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: s.accent }}>Öffnen →</div>
                  </button>

                  {/* Assistent */}
                  <button type="button" onClick={() => setActiveTab('assistent')} style={{ textAlign: 'left', cursor: 'pointer', background: `linear-gradient(135deg, ${s.accent}12, ${s.accent}06)`, border: `2px solid ${s.accent}44`, borderRadius: '16px', padding: 'clamp(1.25rem, 3vw, 1.75rem)', boxShadow: s.shadow, transition: 'all 0.2s ease', fontFamily: 'inherit' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${s.accent}88`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${s.accent}44`; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🤖</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: s.accent, marginBottom: '0.35rem' }}>Schritt-für-Schritt-Hilfe</div>
                    <div style={{ fontSize: '0.85rem', color: s.muted, lineHeight: 1.5, marginBottom: '1rem' }}>
                      Neu hier? Der Assistent führt dich durch die Einrichtung
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: s.accent }}>Öffnen →</div>
                  </button>

                </div>
                )}

                {/* Trennlinie vor Werke-Inhalt */}
                <div style={{ margin: 'clamp(2rem, 5vw, 3rem) 0 clamp(1rem, 3vw, 1.5rem)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, height: 1, background: `${s.accent}22` }} />
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: s.text }}>🎨 {isVk2AdminContext() ? 'Vereinsmitglieder' : 'Meine Werke'}</span>
                  <div style={{ flex: 1, height: 1, background: `${s.accent}22` }} />
                </div>
              </div>
            )}

            {/* Bereichs-Kopf wenn in Eventplan/Design/Einstellungen */}
            {activeTab !== 'werke' && (
              <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 2rem)' }}>
                <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 700, color: s.text, margin: 0 }}>
                  {activeTab === 'katalog' && '📋 Werkkatalog'}
                  {activeTab === 'statistik' && '📊 Verkaufsstatistik'}
                  {activeTab === 'zertifikat' && '🔏 Echtheitszertifikate'}
                  {activeTab === 'newsletter' && '📬 Newsletter & Einladungen'}
                  {activeTab === 'pressemappe' && '📰 Pressemappe'}
                  {activeTab === 'eventplan' && '📢 Veranstaltungen & Werbung'}
                  {activeTab === 'design' && (isVk2AdminContext() ? '✨ Aussehen – nach euren Wünschen anpassen' : '✨ Aussehen der Galerie – nach deinen Wünschen anpassen')}
                  {activeTab === 'einstellungen' && '⚙️ Einstellungen'}
                </h2>
              </div>
            )}

          </div>
          )}

          {/* Galerie-Assistent: neue Kunden Schritt für Schritt zur eigenen Galerie führen */}
          {activeTab === 'assistent' && (
            <GalerieAssistent
              guideName={guideVorname || undefined}
              guidePfad={guidePfad || undefined}
              onGoToStep={(tab, subTab) => {
                setActiveTab(tab)
                if (subTab && tab === 'einstellungen') setSettingsSubTab(subTab as 'stammdaten' | 'registrierung' | 'drucker' | 'sicherheit' | 'lager')
                if (subTab && tab === 'eventplan') setEventplanSubTab(subTab as 'events' | 'öffentlichkeitsarbeit')
              }}
            />
          )}

          {/* ===== VERKAUFSSTATISTIK ===== */}
          {activeTab === 'statistik' && (
            <StatistikTab
              allArtworks={allArtworks}
              onMarkAsReserved={handleMarkAsReserved}
              onRerender={() => setAllArtworks(loadArtworks())}
            />
          )}

          {/* ===== ECHTHEITSZERTIFIKAT ===== */}
          {activeTab === 'zertifikat' && (
            <ZertifikatTab onBack={() => setActiveTab('werke')} />
          )}


          {/* ===== NEWSLETTER & EINLADUNGEN ===== */}
          {activeTab === 'newsletter' && (
            <NewsletterTab onBack={() => setActiveTab('werke')} />
          )}


          {/* ===== PRESSEMAPPE ===== */}
          {activeTab === 'pressemappe' && (
            <PressemappeTab onBack={() => setActiveTab('werke')} />
          )}


          {/* ===== WERKKATALOG ===== */}
          {activeTab === 'katalog' && (
            <WerkkatalogTab
              allArtworks={allArtworks}
              katalogFilter={katalogFilter}
              setKatalogFilter={setKatalogFilter}
              katalogSpalten={katalogSpalten}
              setKatalogSpalten={setKatalogSpalten}
              katalogSelectedWork={katalogSelectedWork}
              setKatalogSelectedWork={setKatalogSelectedWork}
              galleryData={galleryData}
            />
          )}

          {/* Werke verwalten – immer zeigen wenn Tab aktiv */}
          {activeTab === 'werke' && (
            <section style={{
              background: s.bgCard,
              border: `1px solid ${s.accent}22`,
              borderRadius: '24px',
              padding: 'clamp(2rem, 5vw, 3rem)',
              boxShadow: s.shadow,
              marginBottom: 'clamp(2rem, 5vw, 3rem)'
            }}>
              <h2 style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                fontWeight: '700',
                color: s.text,
                marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
                letterSpacing: '-0.01em'
              }}>
                {isVk2AdminContext() ? 'Vereinsmitglieder' : 'Werke verwalten'}
              </h2>
              {isVk2AdminContext() && (
                <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: s.muted }}>
                  <button type="button" onClick={() => { setActiveTab('einstellungen'); setSettingsSubTab('stammdaten') }} style={{ background: 'none', border: 'none', padding: 0, color: s.accent, textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit' }}>Stammdaten (Verein, Vorstand, Mitglieder) bearbeiten → Einstellungen</button>
                </p>
              )}
              {/* Werke-Aktionen: Primär klar, Sekundär zurückhaltend */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'clamp(1.5rem, 4vw, 2rem)' }}>
                {!isVk2AdminContext() && (
                  <button
                    onClick={() => { setEditingArtwork(null); setShowAddModal(true) }}
                    style={{
                      padding: '0.7rem 1.4rem',
                      background: s.gradientAccent,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 8px rgba(181,74,30,0.18)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(181,74,30,0.28)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(181,74,30,0.18)' }}
                  >
                    + Neues Werk
                  </button>
                )}
                {isVk2AdminContext() ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const mitglieder = vk2Stammdaten.mitglieder || []
                          if (mitglieder.length === 0) { alert('Keine Mitglieder vorhanden.'); return }
                          const vereinsName = vk2Stammdaten.verein?.name || 'Verein'
                          const datum = new Date().toLocaleDateString('de-AT')
                          const rows = mitglieder.map((m, i) =>
                            '<tr><td>' + (i+1) + '</td><td>' + (m.name||'') + '</td><td>' + (m.typ||'') +
                            '</td><td>' + (m.email||'') + '</td><td>' + (m.phone||'') +
                            '</td><td>' + (m.seit||m.eintrittsdatum||'') + '</td></tr>'
                          ).join('')
                          const html = ['<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">',
                            '<title>Mitgliederliste</title><style>',
                            'body{font-family:Arial,sans-serif;padding:2cm;color:#111}',
                            'h1{font-size:1.4rem;margin-bottom:0.5rem}',
                            'table{width:100%;border-collapse:collapse;font-size:0.82rem}',
                            'th{background:#333;color:#fff;padding:0.5rem 0.75rem;text-align:left}',
                            'td{padding:0.45rem 0.75rem;border-bottom:1px solid #ddd}',
                            'tr:nth-child(even) td{background:#f9f9f9}',
                            '@media print{button{display:none}}</style></head><body>',
                            '<h1>Vereinsmitglieder – ' + vereinsName + '</h1>',
                            '<p style="font-size:0.8rem;color:#666">Stand: ' + datum + ' | ' + mitglieder.length + ' Mitglieder</p>',
                            '<table><thead><tr><th>#</th><th>Name</th><th>Kunstbereich</th>',
                            '<th>E-Mail</th><th>Telefon</th><th>Mitglied seit</th></tr></thead>',
                            '<tbody>' + rows + '</tbody></table></body></html>'
                          ].join('')
                          const w = window.open('', '_blank')
                          if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 400) }
                        }}
                        style={{ padding: '0.6rem 1.1rem', background: s.bgElevated, color: s.text, border: `1px solid ${s.accent}44`, borderRadius: '10px', fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const }}
                      >
                        🖸️ Mitgliederliste drucken
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const mitglieder = vk2Stammdaten.mitglieder || []
                          if (mitglieder.length === 0) { alert('Keine Mitglieder vorhanden.'); return }
                          const vereinsName = vk2Stammdaten.verein?.name || 'Verein'
                          const datum = new Date().toLocaleDateString('de-AT')
                          const karten = mitglieder.map(m => {
                            const adr = [m.strasse, m.plz && m.ort ? m.plz + ' ' + m.ort : (m.ort || '')].filter(Boolean).join(', ')
                            return '<div class="karte">' +
                              '<div class="name">' + (m.name||'') + '</div>' +
                              (adr ? '<div class="detail">' + adr + '</div>' : '') +
                              (m.email || m.phone ? '<div class="detail">' + (m.email||'') + (m.phone ? ' | '+m.phone : '') + '</div>' : '') +
                              '<div class="detail">' + (m.typ||'') + (m.seit||m.eintrittsdatum ? ' | Mitgl. seit '+(m.seit||m.eintrittsdatum) : '') + '</div></div>'
                          }).join('')
                          const html = ['<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">',
                            '<title>Adressliste</title><style>',
                            'body{font-family:Arial,sans-serif;padding:2cm;color:#111}',
                            'h1{font-size:1.4rem;margin-bottom:0.5rem}',
                            '.karte{border:1px solid #ddd;border-radius:6px;padding:0.65rem 0.9rem;margin-bottom:0.6rem;break-inside:avoid}',
                            '.name{font-weight:700;font-size:0.95rem}.detail{font-size:0.8rem;color:#444;margin-top:0.2rem}',
                            '@media print{button{display:none}}</style></head><body>',
                            '<h1>Adressliste – ' + vereinsName + '</h1>',
                            '<p style="font-size:0.8rem;color:#666">Stand: ' + datum + '</p>',
                            karten, '</body></html>'
                          ].join('')
                          const w = window.open('', '_blank')
                          if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 400) }
                        }}
                        style={{ padding: '0.6rem 1.1rem', background: s.bgElevated, color: s.text, border: `1px solid ${s.accent}44`, borderRadius: '10px', fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const }}
                      >
                        📋 Adressliste drucken
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const mitglieder = vk2Stammdaten.mitglieder || []
                          if (mitglieder.length === 0) { alert('Keine Mitglieder vorhanden.'); return }
                          const header = 'Name;Kunstbereich;E-Mail;Telefon;Adresse;PLZ;Ort;Mitglied seit;Lizenz'
                          const csvRows = mitglieder.map(m =>
                            [m.name,m.typ||'',m.email||'',m.phone||'',m.strasse||'',m.plz||'',m.ort||'',m.seit||m.eintrittsdatum||'',m.lizenz||'']
                              .map(v => '"' + String(v).replace(/"/g, '""') + '"').join(';')
                          )
                          const csv = [header, ...csvRows].join('\n')

                          const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = 'mitglieder-' + new Date().toISOString().slice(0,10) + '.csv'
                          a.style.display = 'none'
                          document.body.appendChild(a)
                          a.click()
                          setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 200)
                        }}
                        style={{ padding: '0.6rem 1.1rem', background: s.bgElevated, color: s.text, border: `1px solid ${s.accent}44`, borderRadius: '10px', fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const }}
                      >
                        📥 CSV-Export
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedForBatchPrint.size > 0) {
                          handleBatchPrintEtiketten()
                        } else {
                          alert('Hakerl bei den Werken setzen („Etikett drucken“), dann auf diesen Button klicken.')
                        }
                      }}
                      style={{
                        padding: '0.7rem 1.2rem',
                        background: selectedForBatchPrint.size > 0 ? s.bgElevated : 'transparent',
                        color: selectedForBatchPrint.size > 0 ? s.text : s.muted,
                        border: `1px solid ${selectedForBatchPrint.size > 0 ? s.accent + '44' : s.muted + '44'}`,
                        borderRadius: '10px',
                        fontSize: '0.88rem',
                        fontWeight: selectedForBatchPrint.size > 0 ? 600 : 400,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${s.accent}66` }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = selectedForBatchPrint.size > 0 ? `${s.accent}44` : `${s.muted}44` }}
                    >
                      🖸️ Etiketten drucken{selectedForBatchPrint.size > 0 ? ` (${selectedForBatchPrint.size} ausgewählt)` : ''}
                    </button>
                    {selectedForBatchPrint.size === 0 && (
                      <span style={{ fontSize: '0.72rem', color: s.muted, paddingLeft: '0.2rem' }}>
                        → Hakerl bei Werken setzen, dann hier drucken
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div style={{
                display: 'flex',
                gap: 'clamp(1rem, 3vw, 1.5rem)',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: 'clamp(2rem, 5vw, 3rem)'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '200px' }}>
                  <span style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1rem)', color: s.muted, whiteSpace: 'nowrap' }}>Suchen</span>
                  <input 
                    type="text" 
                    placeholder={isVk2AdminContext() ? 'Name, E-Mail, Lizenz…' : 'Titel oder Nummer…'} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: s.bgCard,
                      border: `1px solid ${s.accent}33`,
                      borderRadius: s.radius,
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      color: s.text,
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = `${s.accent}88`
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = `${s.accent}33`
                    }}
                  />
                </label>
                {!isVk2AdminContext() && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1rem)', color: s.muted, whiteSpace: 'nowrap' }}>Kategorie</span>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{
                      padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.25rem, 3vw, 1.5rem)',
                      background: s.bgCard,
                      border: `1px solid ${s.accent}33`,
                      borderRadius: s.radius,
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      color: s.text,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="alle" style={{ background: s.bgCard, color: s.text }}>Alle</option>
                    {ARTWORK_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id} style={{ background: s.bgCard, color: s.text }}>{c.label}</option>
                    ))}
                  </select>
                </label>
                )}
              </div>
              {!isVk2AdminContext() && selectedForBatchPrint.size > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  padding: '0.75rem 1rem',
                  background: `${s.accent}15`,
                  border: `1px solid ${s.accent}40`,
                  borderRadius: s.radius,
                  marginBottom: '1rem'
                }}>
                  <span style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1rem)', color: s.text }}>
                    {selectedForBatchPrint.size} Etikett{selectedForBatchPrint.size !== 1 ? 'en' : ''} gesammelt
                  </span>
                  <button
                    type="button"
                    onClick={handleBatchPrintEtiketten}
                    style={{
                      padding: '0.5rem 1rem',
                      background: s.gradientSecondary,
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)'
                    }}
                  >
                    Sammeldruck: {selectedForBatchPrint.size} Etiketten drucken
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedForBatchPrint(new Set())}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: s.bgElevated,
                      border: `1px solid ${s.accent}40`,
                      borderRadius: '8px',
                      color: s.text,
                      cursor: 'pointer',
                      fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)'
                    }}
                  >
                    Abwählen
                  </button>
                </div>
              )}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(200px, 30vw, 280px), 1fr))',
                gap: 'clamp(1rem, 3vw, 1.5rem)'
              }}>
              {(() => {
                /* VK2: Liste der registrierten Mitglieder (Anmeldedaten) mit Bearbeiten – Vorstand zuerst und prominent */
                if (isVk2AdminContext()) {
                  const mitglieder = vk2Stammdaten.mitglieder || []
                  const such = searchQuery.trim().toLowerCase()
                  const gefiltert = such ? mitglieder.filter(m => (m.name?.toLowerCase().includes(such)) || (m.email?.toLowerCase().includes(such)) || (m.lizenz?.toLowerCase().includes(such)) || (m.typ?.toLowerCase().includes(such))) : mitglieder
                  const sorted = [...gefiltert].sort((a, b) => getVorstandSortKey(vk2Stammdaten, a.name) - getVorstandSortKey(vk2Stammdaten, b.name))
                  const vorstandCount = sorted.filter(m => getVorstandRole(vk2Stammdaten, m.name) !== null).length
                  if (sorted.length === 0) {
                    return (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'clamp(3rem, 8vw, 5rem)', background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: '20px', boxShadow: s.shadow }}>
                        <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: s.text }}>
                          {mitglieder.length === 0 ? 'Noch keine Mitglieder vorhanden' : 'Keine Treffer zur Suche'}
                        </p>
                        <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', marginTop: '1rem', color: s.muted }}>
                          {mitglieder.length === 0 ? 'Klicke auf "+ Mitglied hinzufügen" und trage Anmeldedaten (Name, E-Mail, Lizenz, Typ) ein.' : 'Anderen Suchbegriff eingeben oder "+ Mitglied hinzufügen".'}
                        </p>
                      </div>
                    )
                  }
                  return (
                    <>
                      {vorstandCount > 0 && (
                        <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                          <h3 style={{ fontSize: '1rem', color: s.accent, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⭐ Vorstand</h3>
                          <p style={{ fontSize: '0.85rem', color: s.muted, margin: '0.25rem 0 0' }}>Anerkennung für das Engagement – sichtbar in Galerie, Vorschau und hier.</p>
                        </div>
                      )}
                      {sorted.slice(0, vorstandCount).map((m) => {
                    const indexInFull = mitglieder.indexOf(m)
                    const nameNorm = (s: string | undefined) => (s ?? '').trim().toLowerCase()
                    const muster = USER_LISTE_FUER_MITGLIEDER.find(u => nameNorm(u.name) === nameNorm(m.name))
                    const has = (v: string | undefined) => (v ?? '').trim().length > 0
                    const d = muster ? { name: m.name, email: has(m.email) ? m.email : (muster.email ?? '–'), lizenz: has(m.lizenz) ? m.lizenz : (muster.lizenz ?? '–'), typ: has(m.typ) ? m.typ : (muster.typ ?? '–'), mitgliedFotoUrl: m.mitgliedFotoUrl ?? muster.mitgliedFotoUrl, imageUrl: m.imageUrl ?? muster.imageUrl, phone: has(m.phone) ? m.phone : muster.phone, seit: has(m.seit) ? m.seit : muster.seit } : { ...m, mitgliedFotoUrl: m.mitgliedFotoUrl, imageUrl: m.imageUrl, email: m.email || '–', lizenz: m.lizenz || '–', typ: m.typ || '–' }
                    const avatarUrl = d.mitgliedFotoUrl || d.imageUrl
                    const aufKarte = m.oeffentlichSichtbar !== false
                    const vorstandRole = getVorstandRole(vk2Stammdaten, m.name)
                    const isVorstand = vorstandRole !== null
                    return (
                      <div key={indexInFull} style={{ background: isVorstand ? s.accent + '0d' : s.bgCard, border: isVorstand ? `2px solid ${s.accent}` : `1px solid ${s.accent}22`, borderRadius: '20px', padding: 'clamp(1rem, 3vw, 1.5rem)', display: 'flex', flexDirection: 'column', gap: '0.75rem', opacity: aufKarte ? 1 : 0.85, boxShadow: isVorstand ? s.shadow : undefined }}>
                        {isVorstand && <div style={{ fontSize: '0.8rem', fontWeight: 700, color: s.accent, background: s.accent + '22', padding: '0.35rem 0.6rem', borderRadius: '8px', alignSelf: 'flex-start', marginBottom: '0.25rem' }}>⭐ {vorstandRole}</div>}
                        {!aufKarte && <span style={{ fontSize: '0.75rem', color: s.muted, background: s.bgElevated, padding: '0.25rem 0.5rem', borderRadius: 6, alignSelf: 'flex-start' }}>🔒 Nicht auf Karte (gesperrt)</span>}
                        {d.imageUrl ? <img src={d.imageUrl} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: '12px', marginBottom: '0.25rem' }} /> : null}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: s.accent + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: s.accent, flexShrink: 0 }}>👤</div>
                          )}
                          <div style={{ fontWeight: 600, fontSize: isVorstand ? '1.1rem' : '1.05rem', color: s.text }}>{d.name}</div>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: s.muted }}>{d.email || '–'}</div>
                        {d.phone && <div style={{ fontSize: '0.85rem', color: s.text }}>📞 {d.phone}</div>}
                        <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: s.accent }}>{d.lizenz || '–'}</div>
                        <div style={{ fontSize: '0.9rem', color: s.text }}>{d.typ || '–'}</div>
                        {d.seit && <div style={{ fontSize: '0.8rem', color: s.muted }}>Seit {d.seit}</div>}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button type="button" onClick={() => { setEditingMemberIndex(indexInFull); setMemberForm(memberToForm(m)); setShowAddModal(true) }} style={{ padding: '0.5rem 1rem', background: `${s.accent}22`, border: `1px solid ${s.accent}55`, borderRadius: '8px', color: s.accent, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Bearbeiten</button>
                          <button type="button" onClick={() => { const neu = mitglieder.filter((_, j) => j !== indexInFull); setVk2Stammdaten({ ...vk2Stammdaten, mitglieder: neu }); try { localStorage.setItem(KEY_VK2_STAMMDATEN, JSON.stringify({ ...vk2Stammdaten, mitglieder: neu })) } catch (_) {} }} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: s.muted, cursor: 'pointer', fontSize: '1.2rem' }} title="Entfernen">×</button>
                        </div>
                      </div>
                    )
                  })}
                      {vorstandCount > 0 && vorstandCount < sorted.length && (
                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '0.25rem' }}>
                          <h3 style={{ fontSize: '0.95rem', color: s.text, margin: 0 }}>Weitere Mitglieder</h3>
                        </div>
                      )}
                      {sorted.slice(vorstandCount).map((m) => {
                    const indexInFull = mitglieder.indexOf(m)
                    const nameNorm = (s: string | undefined) => (s ?? '').trim().toLowerCase()
                    const muster = USER_LISTE_FUER_MITGLIEDER.find(u => nameNorm(u.name) === nameNorm(m.name))
                    const has = (v: string | undefined) => (v ?? '').trim().length > 0
                    const d = muster ? { name: m.name, email: has(m.email) ? m.email : (muster.email ?? '–'), lizenz: has(m.lizenz) ? m.lizenz : (muster.lizenz ?? '–'), typ: has(m.typ) ? m.typ : (muster.typ ?? '–'), mitgliedFotoUrl: m.mitgliedFotoUrl ?? muster.mitgliedFotoUrl, imageUrl: m.imageUrl ?? muster.imageUrl, phone: has(m.phone) ? m.phone : muster.phone, seit: has(m.seit) ? m.seit : muster.seit } : { ...m, mitgliedFotoUrl: m.mitgliedFotoUrl, imageUrl: m.imageUrl, email: m.email || '–', lizenz: m.lizenz || '–', typ: m.typ || '–' }
                    const avatarUrl = d.mitgliedFotoUrl || d.imageUrl
                    const aufKarte = m.oeffentlichSichtbar !== false
                    return (
                      <div key={indexInFull} style={{ background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: '20px', padding: 'clamp(1rem, 3vw, 1.5rem)', display: 'flex', flexDirection: 'column', gap: '0.75rem', opacity: aufKarte ? 1 : 0.85 }}>
                        {!aufKarte && <span style={{ fontSize: '0.75rem', color: s.muted, background: s.bgElevated, padding: '0.25rem 0.5rem', borderRadius: 6, alignSelf: 'flex-start' }}>🔒 Nicht auf Karte (gesperrt)</span>}
                        {d.imageUrl ? <img src={d.imageUrl} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: '12px', marginBottom: '0.25rem' }} /> : null}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: 48, height: 48, borderRadius: '50%', background: s.accent + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: s.accent, flexShrink: 0 }}>👤</div>}
                          <div style={{ fontWeight: 600, fontSize: '1.05rem', color: s.text }}>{d.name}</div>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: s.muted }}>{d.email || '–'}</div>
                        {d.phone && <div style={{ fontSize: '0.85rem', color: s.text }}>📞 {d.phone}</div>}
                        <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: s.accent }}>{d.lizenz || '–'}</div>
                        <div style={{ fontSize: '0.9rem', color: s.text }}>{d.typ || '–'}</div>
                        {d.seit && <div style={{ fontSize: '0.8rem', color: s.muted }}>Seit {d.seit}</div>}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button type="button" onClick={() => { setEditingMemberIndex(indexInFull); setMemberForm(memberToForm(m)); setShowAddModal(true) }} style={{ padding: '0.5rem 1rem', background: `${s.accent}22`, border: `1px solid ${s.accent}55`, borderRadius: '8px', color: s.accent, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Bearbeiten</button>
                          <button type="button" onClick={() => { const neu = mitglieder.filter((_, j) => j !== indexInFull); setVk2Stammdaten({ ...vk2Stammdaten, mitglieder: neu }); try { localStorage.setItem(KEY_VK2_STAMMDATEN, JSON.stringify({ ...vk2Stammdaten, mitglieder: neu })) } catch (_) {} }} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: s.muted, cursor: 'pointer', fontSize: '1.2rem' }} title="Entfernen">×</button>
                        </div>
                      </div>
                    )
                  })}
                    </>
                  )
                }

                const filtered = sortArtworksNewestFirst(
                  allArtworks.filter((artwork) => {
                    if (!artwork) return false
                    if (categoryFilter !== 'alle' && artwork.category !== categoryFilter) return false
                    if (searchQuery && !artwork.title?.toLowerCase().includes(searchQuery.toLowerCase()) && 
                        !artwork.number?.toLowerCase().includes(searchQuery.toLowerCase())) return false
                    return true
                  })
                )

                if (filtered.length === 0) {
                  return (
                    <div style={{ 
                      gridColumn: '1 / -1', 
                      textAlign: 'center', 
                      padding: 'clamp(3rem, 8vw, 5rem)',
                      background: s.bgCard,
                      border: `1px solid ${s.accent}22`,
                      borderRadius: '20px',
                      boxShadow: s.shadow
                    }}>
                      <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: s.text }}>
                        Noch keine Werke vorhanden
                      </p>
                      <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', marginTop: '1rem', color: s.muted }}>
                        Klicke auf "+ Neues Werk hinzufügen" um ein Werk anzulegen.
                      </p>
                    </div>
                  )
                }

                return filtered.map((artwork) => {
                  const rawSrc = artwork.imageUrl || artwork.previewUrl
                  const isPlaceholder = !rawSrc || (typeof rawSrc === 'string' && rawSrc.startsWith('data:image/svg'))
                  const imageSrc = (isOeffentlichAdminContext() && isPlaceholder) ? getOek2DefaultArtworkImage(artwork.category) : rawSrc
                  return (
                  <div 
                    key={artwork.number || artwork.id} 
                    style={{
                      background: s.bgCard,
                      border: `1px solid ${s.accent}22`,
                      borderRadius: '20px',
                      padding: 'clamp(1rem, 3vw, 1.5rem)',
                      boxShadow: s.shadow,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                      e.currentTarget.style.background = s.bgElevated
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.background = s.bgCard
                    }}
                  >
                    {imageSrc ? (
                      <div style={{ position: 'relative', width: '100%', marginBottom: 'clamp(0.75rem, 2vw, 1rem)' }}>
                        <img 
                          src={imageSrc} 
                          alt={artwork.title || artwork.number}
                          style={{ width: '100%', height: 'clamp(180px, 30vw, 220px)', objectFit: 'cover', borderRadius: '12px' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            if (isOeffentlichAdminContext() && target.src !== OEK2_PLACEHOLDER_IMAGE) {
                              target.src = OEK2_PLACEHOLDER_IMAGE
                              return
                            }
                            target.style.display = 'none'
                            const placeholder = document.createElement('div')
                            placeholder.textContent = '🖼️'
                            placeholder.style.cssText = 'width: 100%; height: clamp(180px, 30vw, 220px); display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); border-radius: 12px; color: rgba(255, 255, 255, 0.3); font-size: clamp(2rem, 5vw, 3rem)'
                            target.parentElement?.insertBefore(placeholder, target)
                          }}
                        />
                        {/* Nummer als Overlay auf dem Bild */}
                        {artwork.number && (
                          <div style={{
                            position: 'absolute',
                            bottom: '0.5rem',
                            right: '0.5rem',
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(4px)',
                            color: '#ffffff',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
                            fontWeight: '600',
                            fontFamily: 'monospace',
                            pointerEvents: 'none',
                            zIndex: 2,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                          }}>
                            {artwork.number}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: 'clamp(180px, 30vw, 220px)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        background: s.bgElevated, 
                        borderRadius: '12px', 
                        marginBottom: 'clamp(0.75rem, 2vw, 1rem)', 
                        color: s.muted,
                        fontSize: 'clamp(2rem, 5vw, 3rem)'
                      }}>
                        🖼️
                      </div>
                    )}
                    <h3 style={{
                      margin: '0 0 0.5rem',
                      fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                      color: s.text,
                      fontWeight: '600'
                    }}>
                      {artwork.title || artwork.number}
                    </h3>
                    <p style={{
                      margin: '0.25rem 0',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      color: s.muted
                    }}>
                      {getCategoryLabel(artwork.category)}
                    </p>
                    {artwork.artist && (
                      <p style={{ 
                        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', 
                        color: s.muted,
                        margin: '0.25rem 0'
                      }}>
                        {artwork.artist}
                      </p>
                    )}
                    {artwork.price && (
                      <p style={{ 
                        fontWeight: '700', 
                        color: s.accent,
                        fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                        margin: '0.5rem 0'
                      }}>
                        € {artwork.price.toFixed(2)}
                      </p>
                    )}
                    {(artwork.quantity && artwork.quantity > 1) && (
                      <p style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: s.muted, margin: '0.25rem 0' }}>
                        Stück: {artwork.quantity}
                      </p>
                    )}
                    <div style={{ 
                      marginTop: '0.75rem', 
                      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', 
                      color: s.muted 
                    }}>
                      {artwork.inExhibition && <span style={{ display: 'block' }}>✓ Ausstellung</span>}
                      {artwork.inShop && <span style={{ display: 'block' }}>✓ Shop</span>}
                      {isVk2AdminContext() && (() => {
                        const katalogAnzahl = allArtworks.filter((a: any) => a.imVereinskatalog).length
                        const istDrin = !!artwork.imVereinskatalog
                        const limitErreicht = !istDrin && katalogAnzahl >= 5
                        return (
                          <button
                            type="button"
                            title={limitErreicht ? 'Limit (5) erreicht – erst anderes Werk abwählen' : (istDrin ? 'Aus Vereinskatalog entfernen' : 'Im Vereinskatalog zeigen')}
                            onClick={() => {
                              if (limitErreicht) return
                              const updated = allArtworks.map((a: any) => a.id === artwork.id ? { ...a, imVereinskatalog: !istDrin } : a)
                              saveArtworks(updated)
                              setAllArtworks(updated)
                            }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem', padding: '0.2rem 0.5rem', background: istDrin ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${istDrin ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.15)'}`, borderRadius: 6, color: istDrin ? '#fbbf24' : 'rgba(255,255,255,0.3)', fontSize: '0.72rem', cursor: limitErreicht ? 'not-allowed' : 'pointer', opacity: limitErreicht ? 0.5 : 1 }}
                          >
                            🏆 {istDrin ? `Katalog ✓ (${katalogAnzahl}/5)` : `Katalog (${katalogAnzahl}/5)`}
                          </button>
                        )
                      })()}
                      {(artwork.addedToGalleryAt || artwork.createdAt) && (
                        <span style={{ display: 'block', color: s.muted, fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>
                          Aufgenommen: {(() => {
                            const d = artwork.addedToGalleryAt || artwork.createdAt
                            if (!d) return ''
                            try {
                              const dt = new Date(d)
                              return dt.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            } catch { return d }
                          })()}
                        </span>
                      )}
                    </div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginTop: 'clamp(0.75rem, 2vw, 1rem)',
                      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                      color: s.muted,
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedForBatchPrint.has(artwork.number || artwork.id || '')}
                        onChange={() => {
                          const num = artwork.number || artwork.id || ''
                          if (!num) return
                          setSelectedForBatchPrint((prev) => {
                            const next = new Set(prev)
                            if (next.has(num)) next.delete(num)
                            else next.add(num)
                            return next
                          })
                        }}
                        style={{ cursor: 'pointer', accentColor: s.accent }}
                      />
                      🖨️ Etikett drucken
                    </label>
                    <div style={{
                      display: 'flex',
                      gap: 'clamp(0.5rem, 2vw, 0.75rem)',
                      marginTop: 'clamp(1rem, 3vw, 1.5rem)'
                    }}>
                      <button 
                        onClick={() => {
                          // Setze editingArtwork State für Bearbeitung
                          setEditingArtwork(artwork)
                          
                          if (isOeffentlichAdminContext()) {
                            setArtworkTitle(artwork.title || '')
                            setArtworkCategory((ARTWORK_CATEGORIES.some((c) => c.id === artwork.category) || VK2_KUNSTBEREICHE.some((c) => c.id === artwork.category)) ? (artwork.category || 'malerei') : 'malerei')
                            setArtworkSubcategoryFree(artwork.subcategoryFree || artwork.ceramicSubcategory || '')
                            setArtworkDimensionsFree(artwork.dimensionsFree || (artwork.paintingWidth && artwork.paintingHeight ? `${artwork.paintingWidth} × ${artwork.paintingHeight} cm` : '') || '')
                            setArtworkArtist(artwork.artist || '')
                            setArtworkDescription(artwork.description || '')
                            setArtworkTechnik(artwork.technik || '')
                            setArtworkDimensions(artwork.dimensions || '')
                            setArtworkPrice(String(artwork.price || ''))
                            setArtworkQuantity(String(artwork.quantity ?? 1))
                            setIsInShop(artwork.inShop !== undefined ? artwork.inShop : true)
                          setIsImVereinskatalog(artwork.imVereinskatalog || false)
                            setArtworkNumber(artwork.number || '')
                            setArtworkFormVariantOek2((artwork.subcategoryFree || artwork.dimensionsFree || artwork.artist) ? 'ausfuehrlich' : 'schnell')
                            if (artwork.imageUrl) setPreviewUrl(artwork.imageUrl)
                            setShowAddModal(true)
                            return
                          }
                          
                          const category = (ARTWORK_CATEGORIES.some((c) => c.id === artwork.category) || VK2_KUNSTBEREICHE.some((c) => c.id === artwork.category)) ? (artwork.category || 'malerei') : 'malerei'
                          setArtworkCategory(category)
                          if (!isVk2AdminContext() && category === 'keramik') {
                            const subcategory = artwork.ceramicSubcategory || 'vase'
                            setArtworkCeramicSubcategory(subcategory as 'vase' | 'teller' | 'skulptur' | 'sonstig')
                            const subcategoryLabels: Record<string, string> = {
                              'vase': 'Gefäße - Vasen',
                              'teller': 'Schalen - Teller',
                              'skulptur': 'Skulptur',
                              'sonstig': 'Sonstig'
                            }
                            setArtworkTitle(subcategoryLabels[subcategory] || 'Keramik')
                            setArtworkCeramicHeight(artwork.ceramicHeight ? String(artwork.ceramicHeight) : '10')
                            setArtworkCeramicDiameter(artwork.ceramicDiameter ? String(artwork.ceramicDiameter) : '10')
                            setArtworkCeramicDescription(artwork.ceramicDescription || '')
                            setArtworkCeramicType(artwork.ceramicType || 'steingut')
                            setArtworkCeramicSurface(artwork.ceramicSurface || 'mischtechnik')
                          } else {
                            setArtworkTitle(artwork.title || '')
                            setArtworkPaintingWidth(artwork.paintingWidth ? String(artwork.paintingWidth) : '')
                            setArtworkPaintingHeight(artwork.paintingHeight ? String(artwork.paintingHeight) : '')
                            setArtworkCeramicSubcategory('vase')
                            setArtworkCeramicHeight('10')
                            setArtworkCeramicDiameter('10')
                            setArtworkCeramicDescription('')
                            setArtworkCeramicType('steingut')
                            setArtworkCeramicSurface('mischtechnik')
                          }
                          setArtworkArtist(artwork.artist || '')
                          setArtworkDescription(artwork.description || '')
                          setArtworkTechnik(artwork.technik || '')
                          setArtworkDimensions(artwork.dimensions || (artwork.paintingWidth && artwork.paintingHeight ? `${artwork.paintingWidth}×${artwork.paintingHeight} cm` : ''))
                          setArtworkPrice(String(artwork.price || ''))
                          setArtworkQuantity(String(artwork.quantity ?? 1))
                          setIsInShop(artwork.inShop !== undefined ? artwork.inShop : true)
                          setIsImVereinskatalog(artwork.imVereinskatalog || false)
                          setArtworkNumber(artwork.number || '')
                          if (artwork.imageUrl) setPreviewUrl(artwork.imageUrl)
                          setShowAddModal(true)
                        }}
                        style={{
                          flex: 1,
                          padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                          background: s.bgElevated,
                          border: `1px solid ${s.accent}40`,
                          borderRadius: '8px',
                          color: s.text,
                          fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${s.accent}18`
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = s.bgElevated
                        }}
                      >
                        Bearbeiten
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm(`Möchtest du "${artwork.title || artwork.number}" wirklich löschen?`)) {
                            const artworks = loadArtworks()
                            const filtered = artworks.filter((a: any) => a.number !== artwork.number && a.id !== artwork.id)
                            const saved = saveArtworks(filtered)
                            if (saved) {
                              window.dispatchEvent(new CustomEvent('artworks-updated'))
                              setAllArtworks(filtered)
                            } else {
                              alert('⚠️ Fehler beim Löschen! Bitte versuche es erneut.')
                            }
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                          background: s.gradientDanger,
                          border: 'none',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(155, 58, 40, 0.25)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(155, 58, 40, 0.35)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(155, 58, 40, 0.25)'
                        }}
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                  )
                })
              })()}
              </div>
            </section>
          )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowUploadModal(false)
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <div style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ marginTop: 0 }}>Dokument hochladen</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Unterstützte Formate: PDF, Bilder (JPG, PNG, etc.), Word-Dokumente
              </p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,image/*,application/pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    try {
                      await handleDocumentUpload(file)
                      alert('✅ Dokument erfolgreich hochgeladen!')
                      setShowUploadModal(false)
                    } catch (error) {
                      console.error('Upload-Fehler:', error)
                      alert('❌ Fehler beim Hochladen. Bitte versuche es erneut.')
                    }
                  }
                }}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Design-Abteilung – Vorschau füllt den Bereich ohne Kopfzeilen; Farben mit Titel */}
        {activeTab === 'design' && (
          <section style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: designSubTab === 'vorschau' ? '0' : 'clamp(2rem, 5vw, 3rem)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)',
            overflow: 'visible'
          }}>
            <div style={designDraftCssVars}>
            {/* Nur bei Farben: Titel + Zurück zur Vorschau */}
            {designSubTab === 'farben' && (
              <>
                {/* Sticky Toolbar im Farben-Tab */}
                <div style={{ position: 'sticky', top: 0, zIndex: 20, background: s.bgDark, borderBottom: `2px solid ${s.accent}33`, padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setDesignSubTab('vorschau')} style={{ padding: '0.5rem 1rem', border: `1px solid ${s.accent}44`, borderRadius: 8, fontSize: '0.95rem', background: s.bgElevated, color: s.text, cursor: 'pointer', fontWeight: 600 }}>← Vorschau</button>
                  <span style={{ fontSize: '0.85rem', color: s.muted, flex: 1 }}>Farben & Theme wählen – Vorschau live · dann Speichern</span>
                  {designSaveFeedback === 'ok' && <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 600 }}>✓ Gespeichert</span>}
                  <button type="button" className="btn-primary" onClick={() => {
                    try {
                      const tenant = isOeffentlichAdminContext() ? 'oeffentlich' : undefined
                      setPageContentGalerie(pageContent, tenant)
                      setPageTexts(pageTexts, tenant)
                      if (designSettings && Object.keys(designSettings).length > 0) {
                        const ds = JSON.stringify(designSettings)
                        if (ds.length < 50000) localStorage.setItem(getDesignStorageKey(), ds)
                      }
                      localStorage.removeItem('k2-last-publish-signature')
                      if (!isOeffentlichAdminContext()) window.dispatchEvent(new CustomEvent('k2-design-saved-publish'))
                      setDesignSaveFeedback('ok')
                      setTimeout(() => setDesignSaveFeedback(null), 4000)
                    } catch (e) {
                      alert('Fehler beim Speichern: ' + (e instanceof Error ? e.message : String(e)))
                    }
                  }} style={{ padding: '0.5rem 1.25rem', fontSize: '0.95rem', fontWeight: 700 }}>💾 Speichern</button>
                </div>
                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '700', color: s.text, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>✨ Farben & Theme</h2>
                <p style={{ color: s.muted, marginBottom: '1.5rem' }}>Galerie-Farben, Hintergrund und Akzent wählen. Ändere Texte direkt in der Vorschau (auf Text klicken).</p>
              </>
            )}

            {/* Vorschau – wie in K2: Seite 1 / Seite 2 / Farben, für K2 und ök2 gleich */}
            {designSubTab === 'vorschau' && (
              <div ref={previewContainerRef} style={{ width: '100%', minHeight: 'calc(100vh - 180px)', background: WERBEUNTERLAGEN_STIL.bgDark, display: 'flex', flexDirection: 'column' }}>
                {/* Design-Toolbar – sticky, immer sichtbar */}
                <div style={{ flexShrink: 0, position: 'sticky', top: 0, zIndex: 20, background: WERBEUNTERLAGEN_STIL.bgDark, borderBottom: `2px solid ${s.accent}33`, padding: '1rem 1.25rem' }}>
                  {/* Titel */}
                  <div style={{ fontWeight: 800, fontSize: '1.4rem', color: s.text, marginBottom: '0.75rem' }}>✨ Deine Galerie gestalten</div>
                  {/* 3-Schritt-Workflow */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Schritt 1 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.06)', border: `1px solid ${s.accent}33`, borderRadius: 10, padding: '0.45rem 1rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: s.accent }}>1</span>
                      <span style={{ fontSize: '0.95rem', color: s.muted }}>Foto / Video reinziehen oder Text anklicken</span>
                      {pageContent.welcomeImage && <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>✓ Foto bereit</span>}
                    </div>
                    <span style={{ color: s.muted, fontSize: '1.2rem' }}>→</span>
                    {/* Schritt 2: Galerie ansehen – erst Bild in localStorage speichern, dann öffnen */}
                    <button type="button" onClick={() => {
                      // Erst alles in localStorage sichern, dann Galerie im gleichen Tab öffnen
                      // (gleicher Tab = localStorage sofort lesbar, neues Foto wird sofort angezeigt)
                      const tenant = isOeffentlichAdminContext() ? 'oeffentlich' : undefined
                      setPageContentGalerie(pageContent, tenant)
                      setPageTexts(pageTexts, tenant)
                      const route = isVk2AdminContext()
                        ? PROJECT_ROUTES.vk2.galerie
                        : isOeffentlichAdminContext()
                        ? PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
                        : PROJECT_ROUTES['k2-galerie'].galerie
                      navigate(route + '?vorschau=1')
                    }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', fontSize: '1rem', fontWeight: 700, background: 'rgba(16,185,129,0.12)', border: '1.5px solid #10b981', borderRadius: 10, color: '#10b981', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>2</span> {isVk2AdminContext() ? '👁 Unsere Mitglieder-Seite ansehen – gefällt es?' : '👁 Galerie ansehen – gefällt es?'}
                    </button>
                    <span style={{ color: s.muted, fontSize: '1.2rem' }}>→</span>
                    {/* Schritt 3: Speichern */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button type="button" onClick={() => setDesignSubTab('farben')} style={{ padding: '0.5rem 1rem', fontSize: '0.95rem', fontWeight: 600, background: `${s.accent}18`, border: `1px solid ${s.accent}66`, borderRadius: 10, color: s.accent, cursor: 'pointer' }}>🎨 Farbe ändern</button>
                      {designSaveFeedback === 'ok'
                        ? <span style={{ fontSize: '1rem', color: '#10b981', fontWeight: 700, padding: '0.5rem 1.1rem', background: 'rgba(16,185,129,0.12)', border: '1.5px solid #10b981', borderRadius: 10 }}>✅ Gespeichert!</span>
                        : <button type="button" className="btn-primary" onClick={async () => {
                            try {
                              const tenant = isOeffentlichAdminContext() ? 'oeffentlich' : undefined
                              setPageContentGalerie(pageContent, tenant)
                              setPageTexts(pageTexts, tenant)
                              if (designSettings && Object.keys(designSettings).length > 0) {
                                const ds = JSON.stringify(designSettings)
                                if (ds.length < 50000) localStorage.setItem(getDesignStorageKey(), ds)
                              }
                              localStorage.removeItem('k2-last-publish-signature')
                              if (!isOeffentlichAdminContext()) window.dispatchEvent(new CustomEvent('k2-design-saved-publish'))
                              setDesignSaveFeedback('ok')
                              setTimeout(() => setDesignSaveFeedback(null), 6000)
                              // Foto auf GitHub hochladen – damit es dauerhaft auf Vercel gespeichert ist
                              // Gilt für K2 UND ök2 – Base64 wird durch Vercel-Pfad ersetzt → kein localStorage-Verlust mehr
                              {
                                const subfolder = isOeffentlichAdminContext() ? 'oeffentlich' : 'k2'
                                const tenantForUpload = isOeffentlichAdminContext() ? 'oeffentlich' : undefined
                                const fileToUpload = pendingWelcomeFileRef.current
                                const base64Image = pageContent.welcomeImage
                                pendingWelcomeFileRef.current = null

                                const doWelcomeUpload = async (uploadFile: File) => {
                                  setImageUploadStatus('⏳ Foto wird dauerhaft gespeichert…')
                                  try {
                                    const { uploadImageToGitHub } = await import('../src/utils/githubImageUpload')
                                    const url = await uploadImageToGitHub(uploadFile, 'willkommen.jpg', () => {}, subfolder)
                                    const next2 = { ...pageContent, welcomeImage: url }
                                    setPageContent(next2)
                                    setPageContentGalerie(next2, tenantForUpload)
                                    setImageUploadStatus('✅ Dauerhaft gespeichert – auf allen Geräten sichtbar')
                                    setTimeout(() => setImageUploadStatus(null), 6000)
                                  } catch (_) {
                                    setImageUploadStatus('⚠️ Nur lokal gespeichert – bitte nochmals speichern')
                                    setTimeout(() => setImageUploadStatus(null), 8000)
                                  }
                                }

                                if (fileToUpload) {
                                  await doWelcomeUpload(fileToUpload)
                                } else if (base64Image && base64Image.startsWith('data:')) {
                                  // Altes Base64-Foto: als Blob konvertieren und hochladen
                                  try {
                                    const res = await fetch(base64Image)
                                    const blob = await res.blob()
                                    const fileFromBase64 = new File([blob], 'willkommen.jpg', { type: blob.type })
                                    await doWelcomeUpload(fileFromBase64)
                                  } catch (_) {
                                    setImageUploadStatus('⚠️ Nur lokal gespeichert – bitte nochmals speichern')
                                    setTimeout(() => setImageUploadStatus(null), 8000)
                                  }
                                }
                              }
                            } catch (e) {
                              alert('Fehler beim Speichern: ' + (e instanceof Error ? e.message : String(e)))
                            }
                          }} style={{ padding: '0.5rem 1.25rem', fontSize: '1rem', fontWeight: 700, borderRadius: 10 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, marginRight: '0.35rem' }}>3</span>💾 Speichern – fertig!
                          </button>
                      }
                    </div>
                    {/* Zoom-Buttons, am Ende */}
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', marginLeft: 'auto' }}>
                      <span style={{ color: 'var(--k2-muted)', fontSize: '0.85rem' }}>Zoom:</span>
                      {([1, 1.25, 1.5, 2] as const).map((sc) => (
                        <button key={sc} type="button" onClick={() => setDesignPreviewScale(sc)} style={{ padding: '0.3rem 0.55rem', fontSize: '0.85rem', background: designPreviewScale === sc ? 'rgba(95,251,241,0.2)' : 'transparent', border: '1px solid ' + (designPreviewScale === sc ? 'var(--k2-accent)' : 'rgba(255,255,255,0.15)'), borderRadius: 6, color: designPreviewScale === sc ? 'var(--k2-accent)' : 'var(--k2-muted)', cursor: 'pointer' }}>{Math.round(sc * 100)}%</button>
                      ))}
                    </div>
                  </div>
                </div>
                <input type="file" accept="image/*" ref={galerieImageInputRef} style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { const img = await compressImage(f, 800, 0.6); const next = { ...pageContent, galerieCardImage: img }; setPageContent(next); setPageContentGalerie(next, isOeffentlichAdminContext() ? 'oeffentlich' : undefined); await uploadPageImageToGitHub(f, 'galerieCardImage', 'galerie-card.jpg') } catch (_) { alert('Fehler beim Bild') } } e.target.value = '' }} />
                <input type="file" accept="image/*" ref={virtualTourImageInputRef} style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { const img = await compressImage(f, 800, 0.6); const next = { ...pageContent, virtualTourImage: img }; setPageContent(next); setPageContentGalerie(next, isOeffentlichAdminContext() ? 'oeffentlich' : undefined); await uploadPageImageToGitHub(f, 'virtualTourImage', 'virtual-tour.jpg') } catch (_) { alert('Fehler beim Bild') } } e.target.value = '' }} />
                {(() => {
                  const tc = isOeffentlichAdminContext() ? TENANT_CONFIGS.oeffentlich : isVk2AdminContext() ? TENANT_CONFIGS.vk2 : TENANT_CONFIGS.k2
                  const galleryName = isVk2AdminContext() ? (vk2Stammdaten.verein?.name || tc.galleryName) : tc.galleryName
                  const tagline = isVk2AdminContext() ? (vk2Stammdaten.vorstand?.name ? `Obfrau/Obmann: ${vk2Stammdaten.vorstand.name}` : tc.tagline) : tc.tagline
                  const welcomeIntroDefault = isVk2AdminContext()
                    ? 'Die Mitglieder unseres Vereins – Künstler:innen mit Leidenschaft und Können.'
                    : (defaultPageTexts.galerie.welcomeIntroText || 'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.')
                  return (
                <>
                {/* Design-Vorschau: manuelle Größe (Ziehen) + Zoom 100%–200% */}
                {(() => {
                  const scale = designPreviewScale
                  const scaledContentMinHeight = Math.ceil(2800 * scale)
                  return (
                <div style={{ overflow: 'auto', width: '100%', flex: '1 1 0', minHeight: 0, maxHeight: `${designPreviewHeightPx}px`, WebkitOverflowScrolling: 'touch' }}>
                <div style={{ width: 412 * scale, minHeight: scaledContentMinHeight, margin: '0 auto', boxSizing: 'border-box', overflow: 'hidden' }}>
                <div style={{ width: 412, transform: `scale(${scale})`, transformOrigin: 'top left', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 0, boxSizing: 'border-box' }}>
                  {previewFullscreenPage === 1 && (
                  <div style={{ width: '100%', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 100%)' }}>
                    {/* Brand linkes oberes Eck – K2/ök2/VK2 */}
                    <div style={{ position: 'absolute', top: 12, left: 14, zIndex: 10 }}>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--k2-text)', letterSpacing: '0.02em', lineHeight: 1.25 }}>{isVk2AdminContext() ? 'VK2 Vereinsplattform' : PRODUCT_BRAND_NAME}</div>
                    </div>
                    <header style={{ padding: '24px 18px 24px', paddingTop: 44, maxWidth: 412, margin: 0 }}>
                      <div style={{ marginBottom: 32 }}>
                        {designPreviewEdit === 'p1-heroTitle' ? (
                          <input autoFocus type="text" value={pageTexts.galerie?.heroTitle ?? defaultPageTexts.galerie.heroTitle ?? galleryName} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, heroTitle: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} onKeyDown={(e) => e.key === 'Enter' && setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.5rem', fontSize: '2rem', fontWeight: '700', color: 'var(--k2-text)', background: 'rgba(0,0,0,0.12)', border: '2px solid var(--k2-accent)', borderRadius: 8 }} placeholder="Großer Titel (z. B. Galeriename)" />
                        ) : (
                          <h1 role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p1-heroTitle')} style={{ margin: 0, fontSize: '2rem', fontWeight: '700', background: 'linear-gradient(135deg, var(--k2-text) 0%, var(--k2-accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em', lineHeight: 1.1, cursor: 'pointer' }} title="Klicken: Großer Titel bearbeiten">{(pageTexts.galerie?.heroTitle ?? defaultPageTexts.galerie.heroTitle)?.trim() || galleryName}</h1>
                        )}
                        {designPreviewEdit === 'p1-tagline' ? (
                          <input autoFocus type="text" value={pageTexts.galerie?.welcomeSubtext ?? tagline} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, welcomeSubtext: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', fontSize: '1rem', color: 'var(--k2-muted)', background: 'rgba(0,0,0,0.12)', border: '2px solid var(--k2-accent)', borderRadius: 8 }} />
                        ) : (
                          <p role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p1-tagline')} style={{ margin: '0.5rem 0 0', color: 'var(--k2-muted)', fontSize: '1rem', fontWeight: '300', letterSpacing: '0.05em', cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.welcomeSubtext ?? defaultPageTexts.galerie.welcomeSubtext) || tagline}</p>
                        )}
                      </div>
                      <section style={{ marginBottom: 40, maxWidth: 412, width: '100%' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '700', lineHeight: 1.2, color: 'var(--k2-text)', letterSpacing: '-0.02em' }}>
                          {designPreviewEdit === 'p1-welcomeHeading' ? (
                            <input autoFocus type="text" value={pageTexts.galerie?.welcomeHeading ?? defaultPageTexts.galerie.welcomeHeading ?? 'Willkommen bei'} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, welcomeHeading: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} onKeyDown={(e) => e.key === 'Enter' && setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.4rem', fontSize: '1.5rem', fontWeight: '700', color: 'var(--k2-text)', background: 'rgba(0,0,0,0.12)', border: '2px solid var(--k2-accent)', borderRadius: 8 }} placeholder="z. B. Willkommen bei" />
                          ) : (
                            <span role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p1-welcomeHeading')} onKeyDown={(e) => e.key === 'Enter' && setDesignPreviewEdit('p1-welcomeHeading')} style={{ cursor: 'pointer' }}>{(pageTexts.galerie?.welcomeHeading ?? defaultPageTexts.galerie.welcomeHeading)?.trim() || 'Willkommen bei'} {(pageTexts.galerie?.heroTitle ?? defaultPageTexts.galerie.heroTitle)?.trim() || galleryName} –</span>
                          )}<br />
                          {designPreviewEdit === 'p1-taglineH2' ? (
                            <textarea autoFocus rows={2} value={pageTexts.galerie?.welcomeSubtext ?? defaultPageTexts.galerie.welcomeSubtext ?? tagline} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, welcomeSubtext: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', marginTop: 4, padding: '0.4rem', fontSize: '1.1rem', color: 'var(--k2-text)', background: 'rgba(0,0,0,0.12)', border: '2px solid var(--k2-accent)', borderRadius: 8, resize: 'vertical', boxSizing: 'border-box' }} />
                          ) : (
                            <span role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p1-taglineH2')} onKeyDown={(e) => e.key === 'Enter' && setDesignPreviewEdit('p1-taglineH2')} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, var(--k2-accent) 0%, #e67a2a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{(pageTexts.galerie?.welcomeSubtext ?? defaultPageTexts.galerie.welcomeSubtext) || tagline}</span>
                          )}
                        </h2>
                        {designPreviewEdit === 'p1-intro' ? (
                          <textarea autoFocus rows={4} value={pageTexts.galerie?.welcomeIntroText ?? defaultPageTexts.galerie.welcomeIntroText ?? ''} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, welcomeIntroText: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.75rem', fontSize: '1.05rem', color: 'var(--k2-text)', lineHeight: 1.6, background: 'rgba(0,0,0,0.08)', border: '2px solid var(--k2-accent)', borderRadius: 12, marginBottom: '1rem', resize: 'vertical', boxSizing: 'border-box' }} placeholder={welcomeIntroDefault} />
                        ) : (
                          <p role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p1-intro')} onKeyDown={(e) => e.key === 'Enter' && setDesignPreviewEdit('p1-intro')} style={{ fontSize: '1.05rem', color: 'var(--k2-text)', lineHeight: 1.6, fontWeight: '300', maxWidth: 340, marginBottom: 24, cursor: 'pointer' }}>{(pageTexts.galerie?.welcomeIntroText ?? defaultPageTexts.galerie.welcomeIntroText)?.trim() || welcomeIntroDefault}</p>
                        )}
                        <label htmlFor="welcome-image-input" style={{ display: 'block', cursor: 'pointer', width: '100%', marginTop: 20, overflow: 'hidden', border: '2px dashed var(--k2-muted)', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                          onDragOver={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = 'var(--k2-accent)' }}
                          onDragLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--k2-muted)' }}
                          onDrop={async (e) => {
                            e.preventDefault()
                            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--k2-muted)'
                            const f = e.dataTransfer.files?.[0]
                            if (f && f.type.startsWith('image/')) {
                              try {
                                const img = await compressImage(f, 800, 0.6)
                                const tenant = isOeffentlichAdminContext() ? 'oeffentlich' : isVk2AdminContext() ? 'vk2' : undefined
                                const next = { ...pageContent, welcomeImage: img }
                                setPageContent(next)
                                setPageContentGalerie(next, tenant)
                                // Datei für späteren Upload beim Speichern merken (K2 + ök2, nicht VK2)
                                if (!isVk2AdminContext()) pendingWelcomeFileRef.current = f
                                setImageUploadStatus('✓ Foto bereit – erst ansehen, dann Speichern')
                                setTimeout(() => setImageUploadStatus(null), 6000)
                              } catch (_) { alert('Fehler beim Bild') }
                            }
                          }}
                        >
                          <input id="welcome-image-input" ref={welcomeImageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                            const f = e.target.files?.[0]
                            if (f) {
                              try {
                                const img = await compressImage(f, 800, 0.6)
                                const next = { ...pageContent, welcomeImage: img }
                                setPageContent(next)
                                setPageContentGalerie(next, isOeffentlichAdminContext() ? 'oeffentlich' : isVk2AdminContext() ? 'vk2' : undefined)
                                // Datei für späteren Upload beim Speichern merken (K2 + ök2, nicht VK2)
                                if (!isVk2AdminContext()) pendingWelcomeFileRef.current = f
                                setImageUploadStatus('✓ Foto bereit – erst ansehen, dann Speichern')
                                setTimeout(() => setImageUploadStatus(null), 6000)
                              } catch (_) { alert('Fehler beim Bild') }
                            }
                            e.target.value = ''
                          }} />
                          {pageContent.welcomeImage ? (
                            <img src={pageContent.welcomeImage} alt="Willkommen" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 480, objectFit: 'cover', boxSizing: 'border-box' }} />
                          ) : (
                            <div style={{ width: '100%', minHeight: 200, background: 'rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--k2-muted)', fontSize: '1rem' }}><span style={{ fontSize: '2rem' }}>📸</span><span>Foto ziehen oder klicken</span></div>
                          )}
                        </label>
                        {imageUploadStatus && (
                          <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: imageUploadStatus.startsWith('✅') ? 'rgba(16,185,129,0.1)' : imageUploadStatus.startsWith('⏳') ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${imageUploadStatus.startsWith('✅') ? '#10b981' : imageUploadStatus.startsWith('⏳') ? '#f59e0b' : '#10b981'}44`, borderRadius: 8, fontSize: '0.88rem', color: imageUploadStatus.startsWith('✅') ? '#10b981' : imageUploadStatus.startsWith('⏳') ? '#d97706' : '#10b981', fontWeight: 500 }}>
                            {imageUploadStatus}
                          </div>
                        )}
                      </section>
                      {/* Aktuelles aus den Eventplanungen – wie auf der echten ersten Seite */}
                      {(() => {
                        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
                        const getEventEnd = (e: any) => { const d = e.endDate ? new Date(e.endDate) : new Date(e.date); d.setHours(23, 59, 59, 999); return d }
                        const upcoming = events.filter((e: any) => e && e.date && getEventEnd(e) >= todayStart).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5)
                        if (upcoming.length === 0) return null
                        const eventHeading = pageTexts.galerie?.eventSectionHeading ?? defaultPageTexts.galerie.eventSectionHeading ?? 'Aktuelles aus den Eventplanungen'
                        const formatDate = (d: string, end?: string) => {
                          if (!d) return ''
                          const start = new Date(d); const endD = end ? new Date(end) : null
                          return endD && endD.getTime() !== start.getTime() ? `${start.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })} – ${endD.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}` : start.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
                        }
                        return (
                          <section style={{ marginTop: 28, padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            {designPreviewEdit === 'p1-eventHeading' ? (
                              <input autoFocus value={pageTexts.galerie?.eventSectionHeading ?? eventHeading} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, eventSectionHeading: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600', color: 'var(--k2-muted)', background: 'rgba(0,0,0,0.12)', border: '2px solid var(--k2-accent)', borderRadius: 6, marginBottom: '0.5rem', boxSizing: 'border-box' }} />
                            ) : (
                              <p role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p1-eventHeading')} style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--k2-muted)', fontWeight: '600', cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.eventSectionHeading ?? eventHeading).trim() || 'Aktuelles aus den Eventplanungen'}</p>
                            )}
                            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--k2-text)', fontSize: '1rem', lineHeight: 1.6 }}>
                              {upcoming.map((ev: any) => (
                                <li key={ev.id || ev.date} style={{ marginBottom: ev.documents?.length ? '0.5rem' : 0 }}>
                                  <strong>{ev.title}</strong>
                                  {ev.date && <span style={{ color: 'var(--k2-muted)', fontWeight: '400' }}> — {formatDate(ev.date, ev.endDate)}</span>}
                                  {ev.documents && ev.documents.length > 0 && (
                                    <ul style={{ margin: '0.25rem 0 0 1rem', paddingLeft: '0.75rem', listStyle: 'none', fontSize: '0.95em' }}>
                                      {ev.documents.map((doc: any) => (
                                        <li key={doc.id || doc.name}>
                                          <button type="button" onClick={() => handleViewEventDocument(doc, ev)} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--k2-accent)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}>📎 {doc.name || doc.fileName || 'Dokument'}</button>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </section>
                        )
                      })()}
                      {/* Die Kunstschaffenden + Eingangshalle – nur K2/ök2, nicht VK2 */}
                      {!isVk2AdminContext() && <><section style={{ marginTop: 32 }}>
                        {designPreviewEdit === 'p2-kunstschaffendeHeading' ? (
                          <input autoFocus value={pageTexts.galerie?.kunstschaffendeHeading ?? defaultPageTexts.galerie.kunstschaffendeHeading ?? ''} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, kunstschaffendeHeading: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.6rem', fontSize: '1.5rem', fontWeight: '700', color: 'var(--k2-text)', background: 'rgba(0,0,0,0.08)', border: '2px solid var(--k2-accent)', borderRadius: 8, marginBottom: 24, textAlign: 'center', boxSizing: 'border-box' }} />
                        ) : (
                          <h3 role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p2-kunstschaffendeHeading')} style={{ fontSize: '1.5rem', marginBottom: 24, fontWeight: '700', color: 'var(--k2-text)', textAlign: 'center', letterSpacing: '-0.02em', cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.kunstschaffendeHeading ?? defaultPageTexts.galerie.kunstschaffendeHeading) || 'Die Kunstschaffenden'}</h3>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                          <div style={{ position: 'relative', background: 'var(--k2-card-bg-1)', border: '1px solid var(--k2-muted)', borderRadius: '16px 16px 8px 16px', padding: 20, overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '60%', background: 'linear-gradient(180deg, var(--k2-accent) 0%, #e67a2a 100%)', borderRadius: '0 4px 4px 0' }} />
                            {designPreviewEdit === 'p2-martinaBio' ? (
                              <textarea autoFocus rows={4} value={pageTexts.galerie?.martinaBio ?? defaultPageTexts.galerie.martinaBio ?? ''} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, martinaBio: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem', color: 'var(--k2-text)', background: 'rgba(0,0,0,0.08)', border: '2px solid var(--k2-accent)', borderRadius: 8, resize: 'vertical', boxSizing: 'border-box' }} />
                            ) : (
                              <p role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p2-martinaBio')} style={{ color: 'var(--k2-text)', fontSize: '0.9rem', margin: 0, lineHeight: 1.7, cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.martinaBio ?? defaultPageTexts.galerie.martinaBio) || 'Kurzbio Künstler:in 1 (z. B. Martina)'}</p>
                            )}
                          </div>
                          <div style={{ position: 'relative', background: 'var(--k2-card-bg-2)', border: '1px solid var(--k2-muted)', borderRadius: '16px 16px 16px 8px', padding: 20, overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, width: 4, height: '60%', background: 'var(--k2-accent)', borderRadius: '4px 0 0 4px' }} />
                            {designPreviewEdit === 'p2-georgBio' ? (
                              <textarea autoFocus rows={4} value={pageTexts.galerie?.georgBio ?? defaultPageTexts.galerie.georgBio ?? ''} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, georgBio: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem', color: 'var(--k2-text)', background: 'rgba(0,0,0,0.08)', border: '2px solid var(--k2-accent)', borderRadius: 8, resize: 'vertical', boxSizing: 'border-box' }} />
                            ) : (
                              <p role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p2-georgBio')} style={{ color: 'var(--k2-text)', fontSize: '0.9rem', margin: 0, lineHeight: 1.7, cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.georgBio ?? defaultPageTexts.galerie.georgBio) || 'Kurzbio Künstler:in 2 (z. B. Georg)'}</p>
                            )}
                          </div>
                        </div>
                        {designPreviewEdit === 'p2-gemeinsamText' ? (
                          <textarea autoFocus rows={2} value={pageTexts.galerie?.gemeinsamText ?? defaultPageTexts.galerie.gemeinsamText ?? ''} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, gemeinsamText: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} placeholder="Leer = wird aus Namen erzeugt" style={{ width: '100%', margin: '0 auto 16px', display: 'block', padding: '0.6rem', fontSize: '1rem', color: 'var(--k2-text)', lineHeight: 1.7, textAlign: 'center', background: 'rgba(0,0,0,0.08)', border: '2px solid var(--k2-accent)', borderRadius: 8, resize: 'vertical', boxSizing: 'border-box' }} />
                        ) : (
                          <p role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p2-gemeinsamText')} style={{ marginTop: 8, fontSize: '1rem', lineHeight: 1.7, color: 'var(--k2-text)', textAlign: 'center', marginBottom: 16, cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.gemeinsamText ?? defaultPageTexts.galerie.gemeinsamText)?.trim() || 'Gemeinsam eröffnen … (leer = automatisch)'}</p>
                        )}
                      </section>
                      {/* Eingangshalle: untere Bilder – wie auf der echten ersten Seite */}
                      <section style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--k2-muted)', marginBottom: 16, textAlign: 'center' }}>Willkommen in der Eingangshalle – wähle deinen Weg:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, alignItems: 'stretch' }}>
                          <div style={{ background: 'var(--k2-card-bg-1)', border: '1px solid var(--k2-muted)', borderRadius: 16, padding: 16, textAlign: 'center' }}>
                            <label htmlFor="galerie-card-image-input-p1" style={{ display: 'block', cursor: 'pointer', width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', marginBottom: 8, background: pageContent.galerieCardImage ? 'transparent' : 'rgba(0,0,0,0.06)', border: '2px dashed var(--k2-accent)', boxSizing: 'border-box', transition: 'opacity 0.2s' }} title="Foto ziehen oder klicken"
                              onDragOver={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
                              onDragLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                              onDrop={async (e) => { e.preventDefault(); e.stopPropagation(); (e.currentTarget as HTMLElement).style.opacity = '1'; const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith('image/')) { try { const img = await compressImage(f, 800, 0.6); const next = { ...pageContent, galerieCardImage: img }; setPageContent(next); setPageContentGalerie(next, isOeffentlichAdminContext() ? 'oeffentlich' : undefined); await uploadPageImageToGitHub(f, 'galerieCardImage', 'galerie-card.jpg') } catch (_) { alert('Fehler beim Bild') } } }}
                            >
                              <input id="galerie-card-image-input-p1" ref={galerieImageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { const img = await compressImage(f, 800, 0.6); const next = { ...pageContent, galerieCardImage: img }; setPageContent(next); setPageContentGalerie(next, isOeffentlichAdminContext() ? 'oeffentlich' : undefined); await uploadPageImageToGitHub(f, 'galerieCardImage', 'galerie-card.jpg') } catch (_) { alert('Fehler beim Bild') } } e.target.value = '' }} />
                              {pageContent.galerieCardImage ? <img src={pageContent.galerieCardImage} alt="In die Galerie" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--k2-muted)', fontSize: '0.9rem', gap: 4 }}><span style={{ fontSize: '1.5rem' }}>📸</span><span>Foto ziehen oder klicken</span></div>}
                            </label>
                            {designPreviewEdit === 'p1-galerieButtonText' ? (
                              <input autoFocus type="text" value={pageTexts.galerie?.galerieButtonText ?? defaultPageTexts.galerie.galerieButtonText ?? 'In die Galerie'} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, galerieButtonText: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} onKeyDown={(e) => e.key === 'Enter' && setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.3rem', fontSize: '1.1rem', fontWeight: '700', color: 'var(--k2-text)', background: 'rgba(0,0,0,0.08)', border: '2px solid var(--k2-accent)', borderRadius: 6, textAlign: 'center', boxSizing: 'border-box' }} />
                            ) : (
                              <h3 role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p1-galerieButtonText')} style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--k2-text)', marginBottom: 4, cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.galerieButtonText ?? defaultPageTexts.galerie.galerieButtonText) || 'In die Galerie'}</h3>
                            )}
                          </div>
                          <div style={{ background: 'var(--k2-card-bg-1)', border: '1px solid var(--k2-muted)', borderRadius: 16, padding: 16, textAlign: 'center' }}>
                            <label htmlFor="virtual-tour-image-input-p1" style={{ display: 'block', cursor: 'pointer', width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', marginBottom: 8, background: pageContent.virtualTourImage ? 'transparent' : 'rgba(0,0,0,0.06)', border: '2px dashed var(--k2-muted)', boxSizing: 'border-box', transition: 'opacity 0.2s' }} title="Foto ziehen oder klicken"
                              onDragOver={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
                              onDragLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                              onDrop={async (e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.opacity = '1'; const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith('image/')) { try { const img = await compressImage(f, 800, 0.6); const next = { ...pageContent, virtualTourImage: img }; setPageContent(next); setPageContentGalerie(next, isOeffentlichAdminContext() ? 'oeffentlich' : undefined); await uploadPageImageToGitHub(f, 'virtualTourImage', 'virtual-tour.jpg') } catch (_) { alert('Fehler beim Bild') } } }}
                            >
                              <input id="virtual-tour-image-input-p1" ref={virtualTourImageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { const img = await compressImage(f, 800, 0.6); const next = { ...pageContent, virtualTourImage: img }; setPageContent(next); setPageContentGalerie(next, isOeffentlichAdminContext() ? 'oeffentlich' : undefined); await uploadPageImageToGitHub(f, 'virtualTourImage', 'virtual-tour.jpg') } catch (_) { alert('Fehler beim Bild') } } e.target.value = '' }} />
                              {pageContent.virtualTourImage ? <img src={pageContent.virtualTourImage} alt="Virtueller Rundgang" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--k2-muted)', fontSize: '0.9rem', gap: 4 }}><span style={{ fontSize: '1.5rem' }}>📸</span><span>Foto ziehen oder klicken</span></div>}
                            </label>
                            {designPreviewEdit === 'p1-virtualTourButtonText' ? (
                              <input autoFocus type="text" value={pageTexts.galerie?.virtualTourButtonText ?? defaultPageTexts.galerie.virtualTourButtonText ?? 'Virtueller Rundgang'} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, virtualTourButtonText: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} onKeyDown={(e) => e.key === 'Enter' && setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.3rem', fontSize: '1.1rem', fontWeight: '700', color: 'var(--k2-text)', background: 'rgba(0,0,0,0.08)', border: '2px solid var(--k2-accent)', borderRadius: 6, textAlign: 'center', boxSizing: 'border-box' }} />
                            ) : (
                              <h3 role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p1-virtualTourButtonText')} style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--k2-text)', marginBottom: 4, cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.virtualTourButtonText ?? defaultPageTexts.galerie.virtualTourButtonText) || 'Virtueller Rundgang'}</h3>
                            )}
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                              <label htmlFor="virtual-tour-video-input-p1" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.9rem', background: 'var(--k2-accent)', color: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                                📹 Video wählen oder aufnehmen
                                <input id="virtual-tour-video-input-p1" type="file" accept="video/*" style={{ display: 'none' }} onChange={async (e) => {
                                  const f = e.target.files?.[0]
                                  if (!f) { e.target.value = ''; return }
                                  if (f.size > 100 * 1024 * 1024) { setVideoUploadMsg('Video ist zu groß (max. 100 MB).'); setVideoUploadStatus('error'); e.target.value = ''; return }
                                  try {
                                    const localUrl = URL.createObjectURL(f)
                                    const tenantId = isOeffentlichAdminContext() ? 'oeffentlich' : undefined
                                    const nextLocal = { ...pageContent, virtualTourVideo: localUrl }
                                    setPageContent(nextLocal)
                                    setPageContentGalerie(nextLocal, tenantId)
                                    if (!isOeffentlichAdminContext()) {
                                      setVideoUploadStatus('uploading')
                                      setVideoUploadMsg('Video wird hochgeladen… Bitte warten.')
                                      try {
                                        const { uploadVideoToGitHub } = await import('../src/utils/githubImageUpload')
                                        const url = await uploadVideoToGitHub(f, 'virtual-tour.mp4', (msg) => setVideoUploadMsg(msg))
                                        const nextVercel = { ...nextLocal, virtualTourVideo: url }
                                        setPageContent(nextVercel)
                                        setPageContentGalerie(nextVercel, undefined)
                                        localStorage.removeItem('k2-last-publish-signature')
                                        setVideoUploadStatus('done')
                                        setVideoUploadMsg('✅ Video hochgeladen – in ca. 2 Min. überall sichtbar.')
                                      } catch {
                                        setVideoUploadStatus('error')
                                        setVideoUploadMsg('Upload fehlgeschlagen – Video nur auf diesem Gerät sichtbar.')
                                      }
                                    } else {
                                      setVideoUploadStatus('done')
                                      setVideoUploadMsg('✅ Video gespeichert.')
                                    }
                                  } catch { setVideoUploadStatus('error'); setVideoUploadMsg('Fehler beim Laden des Videos.') }
                                  e.target.value = ''
                                }} />
                              </label>
                            </div>
                            {videoUploadStatus !== 'idle' && videoUploadMsg && (
                              <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: videoUploadStatus === 'error' ? '#e05c5c' : videoUploadStatus === 'uploading' ? 'var(--k2-accent)' : '#4caf50', textAlign: 'center' }}>
                                {videoUploadStatus === 'uploading' && '⏳ '}{videoUploadMsg}
                              </p>
                            )}
                          </div>
                        </div>
                      </section></>}
                    </header>
                  </div>
                  )}
                  {previewFullscreenPage === 2 && isVk2AdminContext() && (
                  <div style={{ width: '100%', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 100%)', padding: '32px 18px 40px', minHeight: 500 }}>
                    <div style={{ position: 'absolute', top: 12, left: 14, zIndex: 10 }}>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--k2-text)' }}>{galleryName || 'VK2 Vereinsplattform'}</div>
                    </div>
                    <main style={{ marginTop: 24 }}>
                      {/* Mitgliederliste Vorschau */}
                      <section style={{ marginBottom: 28 }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--k2-text)', marginBottom: 12 }}>
                          {pageTexts.galerie?.kunstschaffendeHeading || 'Unsere Mitglieder'}
                        </h3>
                        {(vk2Stammdaten.mitglieder || []).length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {(vk2Stammdaten.mitglieder || []).filter(m => m.oeffentlichSichtbar !== false).slice(0,4).map((m, i) => (
                              <div key={i} style={{ background: 'var(--k2-card-bg-1)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.75rem', fontSize: '0.9rem', color: 'var(--k2-text)' }}>
                                <strong>{m.name}</strong>
                                {m.typ && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--k2-muted)' }}>{m.typ}</p>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: 'var(--k2-muted)', fontSize: '0.9rem' }}>Mitglieder werden in Einstellungen → Stammdaten eingetragen</p>
                        )}
                      </section>
                      {/* Impressum Vorschau */}
                      <section style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--k2-text)', marginBottom: 8 }}>Impressum</h4>
                        <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--k2-text)', fontSize: '0.9rem' }}>{vk2Stammdaten.verein?.name || 'Vereinsname (in Stammdaten eintragen)'}</p>
                        {vk2Stammdaten.verein?.vereinsnummer && <p style={{ margin: '0 0 4px', color: 'var(--k2-muted)', fontSize: '0.82rem' }}>ZVR: {vk2Stammdaten.verein.vereinsnummer}</p>}
                        {vk2Stammdaten.verein?.address && <p style={{ margin: '0 0 4px', color: 'var(--k2-muted)', fontSize: '0.82rem' }}>{[vk2Stammdaten.verein.address, vk2Stammdaten.verein.city].filter(Boolean).join(', ')}</p>}
                        {vk2Stammdaten.vorstand?.name && <p style={{ margin: '0 0 2px', color: 'var(--k2-muted)', fontSize: '0.82rem' }}>Obfrau/Obmann: <span style={{ color: 'var(--k2-text)' }}>{vk2Stammdaten.vorstand.name}</span></p>}
                        {vk2Stammdaten.kassier?.name && <p style={{ margin: '0 0 2px', color: 'var(--k2-muted)', fontSize: '0.82rem' }}>Kassier:in: <span style={{ color: 'var(--k2-text)' }}>{vk2Stammdaten.kassier.name}</span></p>}
                      </section>
                    </main>
                  </div>
                  )}
                  {previewFullscreenPage === 2 && !isVk2AdminContext() && (
                  <div style={{ width: '100%', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, var(--k2-bg-1) 0%, var(--k2-bg-2) 100%)' }}>
                    <div style={{ position: 'absolute', top: 12, left: 14, zIndex: 10 }}>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--k2-text)', letterSpacing: '0.02em', lineHeight: 1.25 }}>{PRODUCT_BRAND_NAME}</div>
                    </div>
                    <main style={{ padding: '24px 18px 40px', maxWidth: 412, margin: 0 }}>
                      <section style={{ marginTop: 36 }}>
                        {designPreviewEdit === 'p2-kunstschaffendeHeading' ? (
                          <input autoFocus value={pageTexts.galerie?.kunstschaffendeHeading ?? defaultPageTexts.galerie.kunstschaffendeHeading ?? ''} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, kunstschaffendeHeading: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.6rem', fontSize: '1.5rem', fontWeight: '700', color: 'var(--k2-text)', background: 'rgba(0,0,0,0.08)', border: '2px solid var(--k2-accent)', borderRadius: 8, marginBottom: 24, textAlign: 'center', boxSizing: 'border-box' }} />
                        ) : (
                          <h3 role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p2-kunstschaffendeHeading')} style={{ fontSize: '1.5rem', marginBottom: 24, fontWeight: '700', color: 'var(--k2-text)', textAlign: 'center', letterSpacing: '-0.02em', cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.kunstschaffendeHeading ?? defaultPageTexts.galerie.kunstschaffendeHeading) || 'Die Kunstschaffenden'}</h3>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                          <div style={{ position: 'relative', background: 'var(--k2-card-bg-1)', backdropFilter: 'blur(20px)', border: '1px solid var(--k2-muted)', borderRadius: '16px 16px 8px 16px', padding: 20, overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '60%', background: 'linear-gradient(180deg, var(--k2-accent) 0%, #e67a2a 100%)', borderRadius: '0 4px 4px 0' }} />
                            {designPreviewEdit === 'p2-martinaBio' ? (
                              <textarea autoFocus rows={4} value={pageTexts.galerie?.martinaBio ?? defaultPageTexts.galerie.martinaBio ?? ''} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, martinaBio: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem', color: 'var(--k2-text)', background: 'rgba(0,0,0,0.08)', border: '2px solid var(--k2-accent)', borderRadius: 8, resize: 'vertical', boxSizing: 'border-box' }} />
                            ) : (
                              <p role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p2-martinaBio')} style={{ color: 'var(--k2-text)', fontSize: '0.9rem', margin: 0, lineHeight: 1.7, cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.martinaBio ?? defaultPageTexts.galerie.martinaBio) || 'Kurzbio Künstler:in 1 (z. B. Martina)'}</p>
                            )}
                          </div>
                          <div style={{ position: 'relative', background: 'var(--k2-card-bg-2)', backdropFilter: 'blur(20px)', border: '1px solid var(--k2-muted)', borderRadius: '16px 16px 16px 8px', padding: 20, overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, width: 4, height: '60%', background: 'var(--k2-accent)', borderRadius: '4px 0 0 4px' }} />
                            {designPreviewEdit === 'p2-georgBio' ? (
                              <textarea autoFocus rows={4} value={pageTexts.galerie?.georgBio ?? defaultPageTexts.galerie.georgBio ?? ''} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, georgBio: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem', color: 'var(--k2-text)', background: 'rgba(0,0,0,0.08)', border: '2px solid var(--k2-accent)', borderRadius: 8, resize: 'vertical', boxSizing: 'border-box' }} />
                            ) : (
                              <p role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p2-georgBio')} style={{ color: 'var(--k2-text)', fontSize: '0.9rem', margin: 0, lineHeight: 1.7, cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.georgBio ?? defaultPageTexts.galerie.georgBio) || 'Kurzbio Künstler:in 2 (z. B. Georg)'}</p>
                            )}
                          </div>
                        </div>
                        {designPreviewEdit === 'p2-gemeinsamText' ? (
                          <textarea autoFocus rows={3} value={pageTexts.galerie?.gemeinsamText ?? defaultPageTexts.galerie.gemeinsamText ?? ''} onChange={(e) => setPageTextsState(prev => ({ ...prev, galerie: { ...defaultPageTexts.galerie, ...prev.galerie, gemeinsamText: e.target.value } }))} onBlur={() => setDesignPreviewEdit(null)} placeholder="Leer = wird aus Namen erzeugt" style={{ width: '100%', margin: '0 auto 28px', display: 'block', padding: '0.6rem', fontSize: '1.05rem', color: 'var(--k2-text)', lineHeight: 1.7, textAlign: 'center', background: 'rgba(0,0,0,0.08)', border: '2px solid var(--k2-accent)', borderRadius: 8, resize: 'vertical', boxSizing: 'border-box' }} />
                        ) : (
                          <p role="button" tabIndex={0} onClick={() => setDesignPreviewEdit('p2-gemeinsamText')} style={{ marginTop: 24, fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--k2-text)', textAlign: 'center', marginLeft: 'auto', marginRight: 'auto', marginBottom: 20, cursor: 'pointer' }} title="Klicken zum Bearbeiten">{(pageTexts.galerie?.gemeinsamText ?? defaultPageTexts.galerie.gemeinsamText) || 'Gemeinsam eröffnen … (leer = automatisch)'}</p>
                        )}
                        {/* Ein Bild: Galerie Innenansicht – klickbar zum Ändern, wie auf der echten Seite */}
                        <div style={{ background: 'var(--k2-card-bg-1)', border: '1px solid var(--k2-muted)', borderRadius: 16, padding: 16, textAlign: 'center', marginBottom: 12 }}>
                          <label htmlFor="galerie-card-image-input-p2" style={{ display: 'block', cursor: 'pointer', width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', marginBottom: 8, background: pageContent.galerieCardImage ? 'transparent' : 'rgba(0,0,0,0.06)', border: '2px dashed var(--k2-accent)', boxSizing: 'border-box', transition: 'opacity 0.2s' }} title="Foto ziehen oder klicken"
                            onDragOver={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
                            onDragLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                            onDrop={async (e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.opacity = '1'; const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith('image/')) { try { const img = await compressImage(f, 800, 0.6); const next = { ...pageContent, galerieCardImage: img }; setPageContent(next); setPageContentGalerie(next, isOeffentlichAdminContext() ? 'oeffentlich' : undefined); await uploadPageImageToGitHub(f, 'galerieCardImage', 'galerie-card.jpg') } catch (_) { alert('Fehler beim Bild') } } }}
                          >
                            <input id="galerie-card-image-input-p2" type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { const img = await compressImage(f, 800, 0.6); const next = { ...pageContent, galerieCardImage: img }; setPageContent(next); setPageContentGalerie(next, isOeffentlichAdminContext() ? 'oeffentlich' : undefined); await uploadPageImageToGitHub(f, 'galerieCardImage', 'galerie-card.jpg') } catch (_) { alert('Fehler beim Bild') } } e.target.value = '' }} />
                            {pageContent.galerieCardImage ? <img src={pageContent.galerieCardImage} alt="Galerie Innenansicht" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--k2-muted)', fontSize: '0.9rem', gap: 4 }}><span style={{ fontSize: '1.5rem' }}>📸</span><span>Foto ziehen oder klicken</span></div>}
                          </label>
                          <p style={{ fontSize: '0.9rem', color: 'var(--k2-accent)', margin: 0, fontWeight: '500' }}>Galerie Innenansicht</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--k2-muted)', margin: '2px 0 0', lineHeight: 1.3 }}>Foto ziehen oder klicken · ein Bild</p>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: 12, textAlign: 'center' }}>Optional: Virtueller Rundgang – Foto oder Video</p>
                        <div style={{ background: 'var(--k2-card-bg-1)', border: '1px solid var(--k2-muted)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                          {/* Video-Vorschau wenn vorhanden */}
                          {pageContent.virtualTourVideo ? (
                            <video src={pageContent.virtualTourVideo} controls style={{ width: '100%', borderRadius: 8, marginBottom: 6 }} />
                          ) : (
                            <label htmlFor="virtual-tour-image-input-p2" style={{ display: 'block', cursor: 'pointer', width: '100%', aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', marginBottom: 6, background: pageContent.virtualTourImage ? 'transparent' : 'rgba(0,0,0,0.06)', border: '2px dashed var(--k2-muted)', boxSizing: 'border-box', transition: 'opacity 0.2s' }} title="Foto ziehen oder klicken"
                              onDragOver={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
                              onDragLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                              onDrop={async (e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.opacity = '1'; const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith('image/')) { try { const img = await compressImage(f, 800, 0.6); const next = { ...pageContent, virtualTourImage: img }; setPageContent(next); setPageContentGalerie(next, isOeffentlichAdminContext() ? 'oeffentlich' : undefined); await uploadPageImageToGitHub(f, 'virtualTourImage', 'virtual-tour.jpg') } catch (_) { alert('Fehler beim Bild') } } }}
                            >
                              <input id="virtual-tour-image-input-p2" type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { const img = await compressImage(f, 800, 0.6); const next = { ...pageContent, virtualTourImage: img }; setPageContent(next); setPageContentGalerie(next, isOeffentlichAdminContext() ? 'oeffentlich' : undefined); await uploadPageImageToGitHub(f, 'virtualTourImage', 'virtual-tour.jpg') } catch (_) { alert('Fehler beim Bild') } } e.target.value = '' }} />
                              {pageContent.virtualTourImage ? <img src={pageContent.virtualTourImage} alt="Virtueller Rundgang" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--k2-muted)', fontSize: '0.85rem', gap: 4 }}><span style={{ fontSize: '1.5rem' }}>📸</span><span>Foto ziehen oder klicken</span></div>}
                            </label>
                          )}
                          <p style={{ fontSize: '0.85rem', color: 'var(--k2-text)', margin: '0 0 8px' }}>Virtueller Rundgang</p>
                          {/* Foto- und Video-Buttons */}
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <label htmlFor="virtual-tour-image-input-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.9rem', background: 'var(--k2-card-bg-2, #e8e4dd)', color: 'var(--k2-text)', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', border: '1px solid var(--k2-muted)' }}>
                              📸 Foto wählen oder aufnehmen
                              <input id="virtual-tour-image-input-btn" type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { const img = await compressImage(f, 800, 0.6); const next = { ...pageContent, virtualTourImage: img }; setPageContent(next); setPageContentGalerie(next, isOeffentlichAdminContext() ? 'oeffentlich' : undefined); await uploadPageImageToGitHub(f, 'virtualTourImage', 'virtual-tour.jpg') } catch (_) { alert('Fehler beim Bild') } } e.target.value = '' }} />
                            </label>
                            <label htmlFor="virtual-tour-video-input" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.9rem', background: 'var(--k2-accent)', color: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                              📹 Video wählen oder aufnehmen
                              <input id="virtual-tour-video-input" type="file" accept="video/*" style={{ display: 'none' }} onChange={async (e) => {
                                const f = e.target.files?.[0]
                                if (!f) { e.target.value = ''; return }
                                if (f.size > 100 * 1024 * 1024) { setVideoUploadMsg('Video ist zu groß (max. 100 MB). Bitte kürzer aufnehmen.'); setVideoUploadStatus('error'); e.target.value = ''; return }
                                try {
                                  const localUrl = URL.createObjectURL(f)
                                  const tenantId = isOeffentlichAdminContext() ? 'oeffentlich' : undefined
                                  // Sofort lokal speichern → sofort im Admin sichtbar
                                  const nextLocal = { ...pageContent, virtualTourVideo: localUrl }
                                  setPageContent(nextLocal)
                                  setPageContentGalerie(nextLocal, tenantId)
                                  if (!isOeffentlichAdminContext()) {
                                    // K2: Video via GitHub hochladen → auf Vercel dauerhaft
                                    setVideoUploadStatus('uploading')
                                    setVideoUploadMsg('Video wird hochgeladen… Bitte warten.')
                                    try {
                                      const { uploadVideoToGitHub } = await import('../src/utils/githubImageUpload')
                                      const url = await uploadVideoToGitHub(f, 'virtual-tour.mp4', (msg) => setVideoUploadMsg(msg))
                                      const nextVercel = { ...nextLocal, virtualTourVideo: url }
                                      setPageContent(nextVercel)
                                      setPageContentGalerie(nextVercel, undefined)
                                      localStorage.removeItem('k2-last-publish-signature')
                                      setVideoUploadStatus('done')
                                      setVideoUploadMsg('✅ Video hochgeladen – in ca. 2 Min. überall sichtbar.')
                                    } catch (uploadErr: any) {
                                      console.warn('Video-Upload fehlgeschlagen:', uploadErr)
                                      setVideoUploadStatus('error')
                                      setVideoUploadMsg('Upload fehlgeschlagen – Video nur auf diesem Gerät sichtbar.')
                                    }
                                  } else {
                                    // ök2: blob-URL reicht für lokale Demo-Vorschau
                                    setVideoUploadStatus('done')
                                    setVideoUploadMsg('✅ Video gespeichert.')
                                  }
                                } catch (_) {
                                  setVideoUploadStatus('error')
                                  setVideoUploadMsg('Fehler beim Laden des Videos.')
                                }
                                e.target.value = ''
                              }} />
                            </label>
                            {pageContent.virtualTourVideo && (
                              <button type="button" onClick={() => { const next = { ...pageContent, virtualTourVideo: '' }; setPageContent(next); setPageContentGalerie(next, isOeffentlichAdminContext() ? 'oeffentlich' : undefined); setVideoUploadStatus('idle'); setVideoUploadMsg('') }} style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid var(--k2-muted)', borderRadius: 8, color: 'var(--k2-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>Video entfernen</button>
                            )}
                          </div>
                          {videoUploadStatus !== 'idle' && videoUploadMsg && (
                            <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: videoUploadStatus === 'error' ? '#e05c5c' : videoUploadStatus === 'uploading' ? 'var(--k2-accent)' : '#4caf50', textAlign: 'center' }}>
                              {videoUploadStatus === 'uploading' && '⏳ '}{videoUploadMsg}
                            </p>
                          )}
                        </div>
                      </section>
                    </main>
                  </div>
                  )}
                </div>
                </div>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onMouseDown={(e) => { e.preventDefault(); designPreviewResizeStart.current = { y: e.clientY, height: designPreviewHeightPx } }}
                  onTouchStart={(e) => { if (e.touches.length === 1) designPreviewResizeStart.current = { y: e.touches[0].clientY, height: designPreviewHeightPx } }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault() }}
                  style={{ height: 20, marginTop: 12, marginBottom: 8, cursor: 'ns-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 8, color: 'var(--k2-muted)', fontSize: '0.8rem', userSelect: 'none', touchAction: 'none' }}
                  title="Nach unten ziehen = Bereich vergrößern, nach oben = verkleinern"
                >
                  ⋮⋮ Ziehen zum Vergrößern / Verkleinern
                </div>
                </div>
                );
                })()}
                </>
                  ); })()}
              </div>
            )}

            {designSubTab === 'farben' && (() => {
              const simpleKeys = ['accentColor', 'backgroundColor1', 'textColor'] as const
              const labels: Record<string, string> = { accentColor: 'Akzentfarbe', backgroundColor1: 'Hintergrund', textColor: 'Textfarbe' }
              return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(1.5rem, 4vw, 2.5rem)', alignItems: 'start' }}>
                  {/* Linke Spalte: einfache Farbwahl */}
                  <div style={{ flex: '1 1 260px', minWidth: 260, maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--k2-accent)', marginBottom: 0 }}>Schnellwahl</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {Object.entries(themes).map(([name, theme]) => (
                        <button key={name} type="button" onClick={() => applyTheme(name as keyof typeof themes)} style={{ padding: '0.75rem 1.25rem', background: `linear-gradient(135deg, ${theme.backgroundColor2}, ${theme.backgroundColor3})`, border: `2px solid ${theme.accentColor}`, borderRadius: 10, color: theme.textColor, cursor: 'pointer', fontSize: '0.9rem' }}>
                          {name === 'default' ? 'Standard' : name === 'warm' ? 'Warm' : name === 'elegant' ? 'Elegant' : 'Modern'}
                        </button>
                      ))}
                    </div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--k2-accent)', marginBottom: 0 }}>Drei Farben anpassen</h3>
                    {simpleKeys.map((key) => {
                      const hex = designSettings[key] || '#ff8c42'
                      const isHex = /^#[0-9A-Fa-f]{3,6}$/.test(hex)
                      const hsl = isHex ? hexToHsl(hex) : { h: 180, s: 80, l: 65 }
                      return (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label style={{ color: 'var(--k2-muted)', fontSize: '0.9rem' }}>{labels[key]}</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="color" value={hex} onChange={(e) => handleDesignChange(key, e.target.value)} style={{ width: 44, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                            <input type="range" min={0} max={360} value={hsl.h} onChange={(e) => handleDesignChange(key, hslToHex(Number(e.target.value), hsl.s, hsl.l))} style={{ flex: 1, accentColor: 'var(--k2-accent)' }} title="Farbton" />
                            <input type="range" min={0} max={100} value={hsl.l} onChange={(e) => handleDesignChange(key, hslToHex(hsl.h, hsl.s, Number(e.target.value)))} style={{ width: 80, accentColor: 'var(--k2-accent)' }} title="Helligkeit" />
                          </div>
                        </div>
                      )
                    })}

                    <button type="button" onClick={() => setDesignSettings({ ...(isOeffentlichAdminContext() ? OEF_DESIGN_DEFAULT : K2_ORANGE_DESIGN) })} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'transparent', border: '1px solid var(--k2-muted)', borderRadius: 8, color: 'var(--k2-muted)', cursor: 'pointer', marginTop: '0.5rem' }}>↩ Zum Originalzustand</button>
                    <h3 style={{ fontSize: '1rem', color: 'var(--k2-accent)', marginBottom: '0.5rem', marginTop: '0.5rem' }}>Varianten</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--k2-muted)', margin: '0 0 0.5rem' }}>Zum Experimentieren: aktuellen Stand als A oder B speichern, später anwenden. Die aktuelle Einstellung gilt – jederzeit änderbar.</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <button type="button" onClick={() => saveDesignVariant('a')} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--k2-accent)', borderRadius: 8, color: 'var(--k2-accent)', cursor: 'pointer' }}>Aktuell als A speichern</button>
                      <button type="button" onClick={() => saveDesignVariant('b')} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--k2-accent)', borderRadius: 8, color: 'var(--k2-accent)', cursor: 'pointer' }}>Aktuell als B speichern</button>
                      <button type="button" onClick={() => loadDesignVariant('a')} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--k2-muted)', borderRadius: 8, color: 'var(--k2-muted)', cursor: 'pointer' }}>Variante A anwenden</button>
                      <button type="button" onClick={() => loadDesignVariant('b')} style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--k2-muted)', borderRadius: 8, color: 'var(--k2-muted)', cursor: 'pointer' }}>Variante B anwenden</button>
                    </div>
                  </div>
                  {/* Rechte Spalte: echte Galerie-Seite in Kundengröße (wie „So sehen Kunden die Galerie“) */}
                  <div style={{ flex: '1 1 280px', minWidth: 280, position: 'sticky', top: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--k2-accent)', marginBottom: '0.75rem' }}>Vorschau (Kundengröße)</h3>
                    <div style={{ overflow: 'auto', maxHeight: 'min(85vh, 640px)', borderRadius: 16, border: '2px solid var(--k2-accent)', background: 'var(--k2-bg-1)' }}>
                      {(() => {
                        const tc = isOeffentlichAdminContext() ? TENANT_CONFIGS.oeffentlich : isVk2AdminContext() ? TENANT_CONFIGS.vk2 : TENANT_CONFIGS.k2
                        const galleryName = isVk2AdminContext() ? (vk2Stammdaten.verein?.name || tc.galleryName) : tc.galleryName
                        const tagline = isVk2AdminContext() ? (vk2Stammdaten.vorstand?.name ? `Obfrau/Obmann: ${vk2Stammdaten.vorstand.name}` : tc.tagline) : tc.tagline
                        const welcomeIntroDefault = isVk2AdminContext()
                          ? 'Die Mitglieder unseres Vereins – Künstler:innen mit Leidenschaft und Können.'
                          : (defaultPageTexts.galerie.welcomeIntroText || 'Ein Neuanfang mit Leidenschaft …')
                        const scale = 1
                        return (
                          <div style={{ width: 412 * scale, overflow: 'hidden', margin: '0 auto' }}>
                            <div style={{ width: 412, transform: `scale(${scale})`, transformOrigin: 'top left', background: 'linear-gradient(135deg, var(--k2-bg-1), var(--k2-bg-2))', padding: '24px 18px 24px', paddingTop: 44 }}>
                              <div style={{ marginBottom: 32 }}>
                                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, background: 'linear-gradient(135deg, #fff, var(--k2-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{(pageTexts.galerie?.heroTitle ?? defaultPageTexts.galerie.heroTitle)?.trim() || galleryName}</h1>
                                <p style={{ margin: '0.5rem 0 0', color: 'var(--k2-muted)', fontSize: '1rem' }}>{(pageTexts.galerie?.welcomeSubtext ?? defaultPageTexts.galerie.welcomeSubtext) || tagline}</p>
                              </div>
                              <section style={{ marginBottom: 24 }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--k2-text)' }}>
                                  {(pageTexts.galerie?.welcomeHeading ?? defaultPageTexts.galerie.welcomeHeading)?.trim() || 'Willkommen bei'} {(pageTexts.galerie?.heroTitle ?? defaultPageTexts.galerie.heroTitle)?.trim() || galleryName} –
                                </h2>
                                <p style={{ margin: '0.25rem 0 0', color: 'var(--k2-muted)', fontSize: '1rem', background: 'linear-gradient(135deg, var(--k2-accent), #e67a2a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{(pageTexts.galerie?.welcomeSubtext ?? defaultPageTexts.galerie.welcomeSubtext) || tagline}</p>
                                <p style={{ fontSize: '1.05rem', color: 'var(--k2-text)', lineHeight: 1.6, marginTop: 12, marginBottom: 16 }}>{(pageTexts.galerie?.welcomeIntroText ?? defaultPageTexts.galerie.welcomeIntroText)?.trim() || welcomeIntroDefault}</p>
                                <div style={{ width: '100%', marginTop: 12, overflow: 'hidden', border: '2px solid var(--k2-accent)', borderRadius: 8 }}>
                                  {pageContent.welcomeImage ? <img src={pageContent.welcomeImage} alt="" style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'cover' }} /> : <div style={{ minHeight: 160, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--k2-muted)' }}>Willkommensbild</div>}
                                </div>
                              </section>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              )
            })()}
            </div>
          </section>
        )}

        {/* Einstellungen */}
        {activeTab === 'einstellungen' && (
          <section style={{
            background: s.bgCard,
            border: `1px solid ${s.accent}22`,
            borderRadius: '24px',
            padding: 'clamp(2rem, 5vw, 3rem)',
            boxShadow: s.shadow,
            marginBottom: 'clamp(2rem, 5vw, 3rem)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: '700',
              color: s.text,
              marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
              letterSpacing: '-0.01em'
            }}>
              ⚙️ Einstellungen
            </h2>

            {/* Musterdaten laden / löschen – nur K2 */}
            {!isOeffentlichAdminContext() && !isVk2AdminContext() && (
            <div style={{ marginBottom: '2rem', padding: '1.25rem', background: 'rgba(95,251,241,0.07)', border: '1px solid rgba(95,251,241,0.25)', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', color: s.accent, marginBottom: '0.5rem' }}>🧪 Musterdaten</h3>
              <p style={{ color: s.muted, fontSize: '0.85rem', marginBottom: '1rem' }}>
                Zum Testen und Ausprobieren: Musterwerke und Musterdaten aus ök2 laden. Eigene Daten werden dabei <strong>nicht gelöscht</strong> – du kannst die Musterdaten jederzeit wieder entfernen.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    // Immer frisch laden: alte Muster raus, neue rein
                    const existing = (() => { try { return JSON.parse(localStorage.getItem('k2-artworks') || '[]') } catch { return [] } })()
                    const ohneAlteMuster = existing.filter((a: any) => !String(a.id || '').startsWith('muster-') && !(a as any)._isMuster)
                    const withMuster = [...MUSTER_ARTWORKS.map(a => ({ ...a, _isMuster: true })), ...ohneAlteMuster]
                    localStorage.setItem('k2-artworks', JSON.stringify(withMuster))
                    // Musterstammdaten nur wenn leer
                    const gallStamm = (() => { try { return JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}') } catch { return {} } })()
                    if (!gallStamm.name) localStorage.setItem('k2-stammdaten-galerie', JSON.stringify({ ...MUSTER_TEXTE.gallery, _isMuster: true }))
                    const martinaStamm = (() => { try { return JSON.parse(localStorage.getItem('k2-stammdaten-martina') || '{}') } catch { return {} } })()
                    if (!martinaStamm.name) localStorage.setItem('k2-stammdaten-martina', JSON.stringify({ ...MUSTER_TEXTE.martina, _isMuster: true }))
                    const georgStamm = (() => { try { return JSON.parse(localStorage.getItem('k2-stammdaten-georg') || '{}') } catch { return {} } })()
                    if (!georgStamm.name) localStorage.setItem('k2-stammdaten-georg', JSON.stringify({ ...MUSTER_TEXTE.georg, _isMuster: true }))
                    // State direkt aktualisieren + Tab wechseln (iframe-sicher, kein Reload)
                    setAllArtworks(withMuster)
                    setActiveTab('werke')
                  }}
                  style={{ padding: '0.65rem 1.25rem', background: s.accent, color: '#1a1d24', border: 'none', borderRadius: 10, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  🧪 Musterdaten laden
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const existing = (() => { try { return JSON.parse(localStorage.getItem('k2-artworks') || '[]') } catch { return [] } })()
                    const ohne = existing.filter((a: any) => !String(a.id || '').startsWith('muster-') && !(a as any)._isMuster)
                    if (ohne.length === existing.length) { alert('Keine Musterdaten gefunden – nichts zu löschen.'); return }
                    localStorage.setItem('k2-artworks', JSON.stringify(ohne))
                    const gallStamm = (() => { try { return JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}') } catch { return {} } })()
                    if ((gallStamm as any)._isMuster) localStorage.removeItem('k2-stammdaten-galerie')
                    const martinaStamm = (() => { try { return JSON.parse(localStorage.getItem('k2-stammdaten-martina') || '{}') } catch { return {} } })()
                    if ((martinaStamm as any)._isMuster) localStorage.removeItem('k2-stammdaten-martina')
                    const georgStamm = (() => { try { return JSON.parse(localStorage.getItem('k2-stammdaten-georg') || '{}') } catch { return {} } })()
                    if ((georgStamm as any)._isMuster) localStorage.removeItem('k2-stammdaten-georg')
                    // State aktualisieren statt Reload (iframe-sicher)
                    setAllArtworks(ohne)
                    alert('✅ Musterdaten entfernt.\n\nEigene Werke und Daten sind unberührt.')
                  }}
                  style={{ padding: '0.65rem 1.25rem', background: 'transparent', color: '#f87171', border: '1px solid #f87171', borderRadius: 10, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  🗑️ Musterdaten löschen
                </button>
              </div>
            </div>
            )}

            {/* Veröffentlichung – nur K2 (ök2 und VK2 brauchen das nicht) */}
            {!isOeffentlichAdminContext() && !isVk2AdminContext() && (
            <div style={{
              marginBottom: '2rem',
              padding: '1.25rem',
              background: `${s.accent}14`,
              border: `1px solid ${s.accent}44`,
              borderRadius: '16px'
            }}>
              <h3 style={{ fontSize: '1.1rem', color: s.accent, marginBottom: '0.5rem' }}>🚀 Veröffentlichung</h3>

              {/* Vor dem Veröffentlichen: Seiten komplett prüfen */}
              <div style={{ marginBottom: '1.25rem', padding: '1rem', background: s.bgElevated, borderRadius: '12px', border: `1px solid ${s.accent}22` }}>
                <h4 style={{ fontSize: '0.95rem', color: s.text, marginBottom: '0.5rem' }}>📋 Vor dem Veröffentlichen: Seiten prüfen</h4>
                <p style={{ color: s.muted, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  Speichert alle Änderungen und zeigt die Seite hier an (kein neuer Tab). Oben erscheint „← Zurück zu Einstellungen“. Wenn alles passt, zurückgehen und unten auf Veröffentlichen klicken.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      saveAllForVorschau()
                      const seite1Route = isVk2AdminContext() ? PROJECT_ROUTES.vk2.galerie : isOeffentlichAdminContext() ? PROJECT_ROUTES['k2-galerie'].galerieOeffentlich : PROJECT_ROUTES['k2-galerie'].galerie
                      requestAnimationFrame(() => { navigate(seite1Route + '?vorschau=1') })
                    }}
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.9rem', background: `${s.accent}20`, border: `1px solid ${s.accent}66`, borderRadius: 8, color: s.accent, fontWeight: 500, cursor: 'pointer' }}
                  >
                    Seite 1 (Willkommen) anzeigen →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      saveAllForVorschau()
                      const vorschauRoute = isVk2AdminContext() ? PROJECT_ROUTES.vk2.galerieVorschau : isOeffentlichAdminContext() ? PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau : PROJECT_ROUTES['k2-galerie'].galerieVorschau
                      requestAnimationFrame(() => { navigate(vorschauRoute + '?vorschau=1') })
                    }}
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.9rem', background: `${s.accent}20`, border: `1px solid ${s.accent}66`, borderRadius: 8, color: s.accent, fontWeight: 500, cursor: 'pointer' }}
                  >
                    Seite 2 (Werke) anzeigen →
                  </button>
                </div>
              </div>

              <p style={{ color: s.muted, fontSize: '0.9rem', marginBottom: '1rem' }}>
                Stammdaten, Werke, Events, Dokumente und Seitentexte auf Vercel pushen. Danach auf allen Geräten aktuell (Seite neu öffnen oder QR-Code neu scannen).
              </p>
              <button 
                onClick={() => {
                  if (allArtworks.length === 0) {
                    alert('ℹ️ Keine Werke zum Veröffentlichen.\n\nFüge zuerst Werke hinzu oder lade sie vom Server.')
                    return
                  }
                  const detail = `${allArtworks.length} Werk(e), Stammdaten, Events, Dokumente, Seitentexte`
                  if (confirm(`🚀 App veröffentlichen?\n\nEs wird die gesamte App aktualisiert:\n• ${detail}\n\nNach dem Push (2–3 Min) sind alle Daten auf allen Geräten aktuell. Seite neu öffnen oder QR-Code neu scannen.`)) {
                    publishMobile()
                  }
                }}
                disabled={isDeploying}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: isDeploying ? s.bgElevated : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: isDeploying ? s.muted : '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isDeploying ? 'not-allowed' : 'pointer',
                  boxShadow: isDeploying ? 'none' : '0 4px 14px rgba(245, 158, 11, 0.4)',
                  opacity: isDeploying ? 0.6 : 1
                }}
              >
                {isDeploying ? '⏳ App wird aktualisiert...' : '🚀 Veröffentlichen'}
              </button>
            </div>
            )}

            {/* Lager (Backup) – nur K2 (ök2 und VK2 brauchen kein Vollbackup) */}
            {settingsSubTab === 'lager' && (
            <div style={{
              marginBottom: '2rem',
              background: `${s.accent}12`,
              border: `1px solid ${s.accent}33`,
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              <button
                type="button"
                onClick={() => setBackupPanelMinimized(!backupPanelMinimized)}
                style={{
                  width: '100%',
                  padding: backupPanelMinimized ? '0.6rem 1rem' : '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: s.accent,
                  fontSize: backupPanelMinimized ? '0.95rem' : '1.1rem',
                  fontWeight: '600',
                  textAlign: 'left'
                }}
              >
                <span>💾 Backup & Wiederherstellung</span>
                <span style={{ opacity: 0.8, fontSize: '0.85rem' }}>{backupPanelMinimized ? '▼ Aufklappen' : '▲ Einklappen'}</span>
              </button>
              {!backupPanelMinimized && (
                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: `1px solid ${s.accent}22` }}>
              {/* Kontext-Badge */}
              <div style={{
                marginTop: '0.75rem',
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                background: `${s.accent}18`,
                borderRadius: '10px',
                border: `1px solid ${s.accent}33`
              }}>
                <div style={{ color: s.accent, fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                  {isVk2AdminContext() ? '🏛️ VK2 Vereins-Backup' : isOeffentlichAdminContext() ? '🎨 ök2 Demo-Backup' : '🖼️ K2 Galerie-Backup'}
                </div>
                <div style={{ color: s.muted, fontSize: '0.85rem' }}>
                  {isVk2AdminContext()
                    ? 'Enthält: Vereins-Stammdaten, Vorstand, alle Mitglieder, Events, Design. Komplett wiederherstellbar.'
                    : isOeffentlichAdminContext()
                    ? 'Enthält: Demo-Stammdaten, Demo-Werke, Demo-Events, Demo-Design. Separat von K2 und VK2.'
                    : 'Enthält: Stammdaten (Martina, Georg, Galerie), alle Werke, Events, Dokumente, Kunden, Design.'}
                </div>
              </div>

              <p style={{ color: s.muted, fontSize: '0.9rem', marginBottom: '1rem' }}>
                Backup auf backupmicro aufbewahren. Bei Systemchaos: Backup-Datei hochladen – alles wird wiederhergestellt.
              </p>

              <input
                ref={backupFileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  setRestoreProgress('running')
                  const reader = new FileReader()
                  reader.onload = () => {
                    try {
                      const raw = reader.result as string
                      const backup = JSON.parse(raw)
                      const kontext = detectBackupKontext(backup)
                      const currentKontext = isVk2AdminContext() ? 'vk2' : isOeffentlichAdminContext() ? 'oeffentlich' : 'k2'
                      if (kontext !== currentKontext && kontext !== 'unbekannt') {
                        const kontextName = kontext === 'vk2' ? 'VK2 Verein' : kontext === 'oeffentlich' ? 'ök2 Demo' : 'K2 Galerie'
                        const currentName = currentKontext === 'vk2' ? 'VK2 Verein' : currentKontext === 'oeffentlich' ? 'ök2 Demo' : 'K2 Galerie'
                        if (!confirm(`⚠️ Diese Backup-Datei gehört zu „${kontextName}“, du bist aber gerade in „${currentName}“.\n\nTrotzdem wiederherstellen?`)) {
                          setRestoreProgress('idle')
                          return
                        }
                      }
                      let ok = false
                      let restored: string[] = []
                      if (kontext === 'vk2') {
                        const r = restoreVk2FromBackup(backup)
                        ok = r.ok; restored = r.restored
                      } else if (kontext === 'oeffentlich') {
                        const r = restoreOek2FromBackup(backup)
                        ok = r.ok; restored = r.restored
                      } else {
                        const r = restoreK2FromBackup(backup)
                        if (r.ok) { ok = true; restored = r.restored }
                        else { ok = restoreFromBackupFile(backup) }
                      }
                      if (!ok) {
                        setRestoreProgress('idle')
                        alert('❌ Die Datei ist kein gültiges Backup (K2, ök2 oder VK2 Backup erwartet).')
                        return
                      }
                      if (restored.length > 0) console.log('💾 Wiederhergestellt:', restored.join(', '))
                      setRestoreProgress('done')
                      setTimeout(() => { if (window.self === window.top) window.location.reload() }, 800)
                    } catch (err) {
                      setRestoreProgress('idle')
                      alert('❌ Datei konnte nicht gelesen werden: ' + (err instanceof Error ? err.message : String(err)))
                    }
                  }
                  reader.onerror = () => {
                    setRestoreProgress('idle')
                    alert('❌ Datei konnte nicht gelesen werden.')
                  }
                  reader.readAsText(file, 'UTF-8')
                }}
              />

              {restoreProgress !== 'idle' && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '10px',
                  border: '1px solid rgba(95, 251, 241, 0.3)'
                }}>
                  <div style={{ color: s.accent, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    {restoreProgress === 'running' ? 'Wiederherstellung läuft…' : 'Fertig. Lade neu…'}
                  </div>
                  <div style={{
                    height: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: restoreProgress === 'done' ? '100%' : undefined,
                      background: 'linear-gradient(90deg, #5ffbf1, #33a1ff)',
                      borderRadius: '4px',
                      transition: restoreProgress === 'done' ? 'width 0.3s ease' : 'none',
                      animation: restoreProgress === 'running' ? 'backup-progress-pulse 1s ease-in-out infinite' : 'none'
                    }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    try {
                      if (isVk2AdminContext()) {
                        const result = createVk2Backup()
                        const m = (() => { try { return JSON.parse(localStorage.getItem('k2-vk2-stammdaten') || '{}') } catch { return {} } })()
                        const mitglieder = Array.isArray(m.mitglieder) ? m.mitglieder.length : 0
                        downloadBackupAsFile(result.data, result.filename)
                        alert(`✅ VK2 Vereins-Backup heruntergeladen.\n\nEnthält: Vereins-Stammdaten, Vorstand, ${mitglieder} Mitglieder, Events, Design.\n\nAuf backupmicro speichern!`)
                      } else if (isOeffentlichAdminContext()) {
                        const result = createOek2Backup()
                        downloadBackupAsFile(result.data, result.filename)
                        alert(`✅ ök2 Demo-Backup heruntergeladen.\n\nEnthält: Demo-Stammdaten, Demo-Werke, Demo-Events, Demo-Design.\n\nAuf backupmicro speichern!`)
                      } else {
                        const result = createK2Backup()
                        downloadBackupAsFile(result.data, result.filename)
                        const artworks = (() => { try { return JSON.parse(localStorage.getItem('k2-artworks') || '[]') } catch { return [] } })()
                        alert(`✅ K2 Galerie-Backup heruntergeladen.\n\nEnthält: Stammdaten, ${Array.isArray(artworks) ? artworks.length : 0} Werke, Events, Dokumente, Design.\n\nAuf backupmicro speichern!`)
                      }
                    } catch (e) {
                      alert('Fehler beim Erstellen des Backups: ' + (e instanceof Error ? e.message : String(e)))
                    }
                  }}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: s.bgElevated,
                    border: `1px solid ${s.accent}33`,
                    borderRadius: '10px',
                    color: s.text,
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  💾 Backup herunterladen
                </button>

                <button
                  type="button"
                  disabled={restoreProgress !== 'idle'}
                  onClick={() => backupFileInputRef.current?.click()}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: s.bgElevated,
                    border: `1px solid ${s.accent}33`,
                    borderRadius: '10px',
                    color: s.text,
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📂 Aus Backup-Datei wiederherstellen
                </button>

                {!isOeffentlichAdminContext() && !isVk2AdminContext() && hasBackup() && (
                  <button
                    disabled={restoreProgress !== 'idle'}
                    onClick={() => {
                      if (!confirm('Alle aktuellen Daten mit dem letzten Auto-Backup überschreiben? Die Seite wird danach neu geladen.')) return
                      setRestoreProgress('running')
                      requestAnimationFrame(() => {
                        const ok = restoreFromBackup()
                        if (!ok) {
                          setRestoreProgress('idle')
                          alert('❌ Kein Backup gefunden oder Fehler.')
                          return
                        }
                        setRestoreProgress('done')
                        setTimeout(() => { if (window.self === window.top) window.location.reload() }, 800)
                      })
                    }}
                    style={{
                      padding: '0.75rem 1.25rem',
                      background: `${s.accent}20`,
                      border: `1px solid ${s.accent}66`,
                      borderRadius: '10px',
                      color: s.accent,
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Aus letztem Auto-Backup wiederherstellen
                    {getBackupTimestamp() && (
                      <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.9, marginTop: '0.2rem' }}>
                        Backup: {new Date(getBackupTimestamp()!).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    )}
                  </button>
                )}

                {!isOeffentlichAdminContext() && !isVk2AdminContext() && !hasBackup() && (
                  <span style={{ color: s.muted, fontSize: '0.9rem' }}>
                    Kein Auto-Backup im Browser. Backup-Datei von backupmicro hochladen.
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const freed = tryFreeLocalStorageSpace()
                    if (freed > 0) {
                      alert(`✅ Speicher freigegeben: ca. ${(freed / 1024).toFixed(0)} KB.\n\nDas lokale Auto-Backup wurde entfernt. Backup-Datei von backupmicro zum Wiederherstellen nutzen.`)
                    } else {
                      alert('Kein lokales Auto-Backup im Speicher (oder bereits gelöscht).')
                    }
                  }}
                  style={{
                    padding: '0.6rem 1rem',
                    background: s.bgElevated,
                    border: `1px solid ${s.accent}33`,
                    borderRadius: '8px',
                    color: s.text,
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  title="Entfernt das im Browser gespeicherte Auto-Backup"
                >
                  🔓 Speicher freigeben
                </button>
              </div>

              {!isOeffentlichAdminContext() && !isVk2AdminContext() && backupTimestamps.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${s.accent}22` }}>
                  <div style={{ fontSize: '0.85rem', color: s.muted, marginBottom: '0.5rem' }}>Auto-Backup Verlauf (neueste zuerst)</div>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '1.25rem',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    fontSize: '0.85rem',
                    color: s.text,
                    lineHeight: '1.5'
                  }}>
                    {backupTimestamps.map((iso, i) => (
                      <li key={iso + i}>
                        {new Date(iso).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'medium' })}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
                </div>
              )}
            </div>
            )}

            {/* PDFs & Speicherdaten – nur K2 und ök2 (VK2 braucht das nicht) */}
            {!isVk2AdminContext() && (
            <div style={{
              marginBottom: '2rem',
              padding: '1.25rem',
              background: s.bgCard,
              border: `1px solid ${s.accent}22`,
              borderRadius: '16px',
              boxShadow: s.shadow
            }}>
              <h3 style={{ fontSize: '1.1rem', color: s.text, marginBottom: '0.5rem' }}>📄 PDFs & Speicherdaten</h3>
              <p style={{ color: s.muted, fontSize: '0.9rem', marginBottom: '1rem' }}>
                PDF-Export (Galerie, verkaufte Werke), Werke-Daten exportieren/importieren, Speicher prüfen, Cleanup.
              </p>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  type="button"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: s.bgElevated,
                    border: `1px solid ${s.accent}40`,
                    color: s.text,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📄 PDFs & Speicherdaten {showExportMenu ? '▲' : '▼'}
                </button>
                {showExportMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    background: s.bgCard,
                    border: `1px solid ${s.accent}33`,
                    borderRadius: '12px',
                    padding: '0.75rem',
                    minWidth: '240px',
                    boxShadow: s.shadow,
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: s.muted, padding: '0.5rem', borderBottom: `1px solid ${s.accent}22` }}>PDFs</div>
                    <button type="button" onClick={() => { printPDF('galerie'); setShowExportMenu(false) }} style={{ padding: '0.6rem 1rem', background: s.bgElevated, border: `1px solid ${s.accent}22`, borderRadius: '8px', color: s.text, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}>📄 Werke in Galerie</button>
                    <button type="button" onClick={() => { printPDF('verkauft'); setShowExportMenu(false) }} style={{ padding: '0.6rem 1rem', background: s.bgElevated, border: `1px solid ${s.accent}22`, borderRadius: '8px', color: s.text, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}>📄 Verkaufte Werke</button>
                    <div style={{ fontSize: '0.8rem', color: s.muted, padding: '0.5rem', borderTop: `1px solid ${s.accent}22`, borderBottom: `1px solid ${s.accent}22` }}>Speicherdaten</div>
                    <button type="button" onClick={() => {
                      try {
                        const artworks = JSON.parse(localStorage.getItem(getArtworksKey()) || '[]')
                        const exportData = { artworks, exportedAt: new Date().toISOString(), version: '1.0' }
                        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${getArtworksKey()}-export-${new Date().toISOString().split('T')[0]}.json`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        setTimeout(() => { try { URL.revokeObjectURL(url) } catch (_) {} }, 1000)
                        alert(`✅ ${artworks.length} Werke exportiert!`)
                      } catch (e) { console.error(e); alert('Fehler beim Export.') }
                      setShowExportMenu(false)
                    }} style={{ padding: '0.6rem 1rem', background: `${s.accent}18`, border: `1px solid ${s.accent}55`, borderRadius: '8px', color: s.accent, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', fontWeight: '600' }}>📤 Daten exportieren</button>
                    <button type="button" onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'application/json'
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = (ev) => {
                          try {
                            const importData = JSON.parse(ev.target?.result as string)
                            if (importData.artworks && Array.isArray(importData.artworks)) {
                              const existing = loadArtworks()
                              const existingIds = new Set(existing.map((a: any) => a.id || a.number))
                              const newArtworks = importData.artworks.filter((a: any) => !existingIds.has(a.id || a.number))
                              if (newArtworks.length === 0) { alert('Keine neuen Werke zum Importieren.'); return }
                              const merged = [...existing, ...newArtworks]
                              if (saveArtworks(merged)) { setAllArtworks(merged); window.dispatchEvent(new CustomEvent('artworks-updated')); alert(`✅ ${newArtworks.length} Werke importiert!`) }
                              else alert('⚠️ Fehler beim Speichern.')
                            } else alert('Ungültiges Format.')
                          } catch (_) { alert('Fehler beim Importieren.') }
                        }
                        reader.readAsText(file)
                      }
                      input.click()
                      setShowExportMenu(false)
                    }} style={{ padding: '0.6rem 1rem', background: `${s.accent}18`, border: `1px solid ${s.accent}55`, borderRadius: '8px', color: s.accent, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', fontWeight: '600' }}>📥 Daten importieren</button>
                    <button type="button" onClick={() => {
                      try {
                        let totalSize = 0
                        for (let key in localStorage) { if (localStorage.hasOwnProperty(key)) totalSize += localStorage[key].length + key.length }
                        alert(`localStorage: ${(totalSize / (1024 * 1024)).toFixed(2)} MB (max. ~5–10 MB)`)
                      } catch (_) { alert('Fehler.') }
                      setShowExportMenu(false)
                    }} style={{ padding: '0.6rem 1rem', background: s.bgElevated, border: `1px solid ${s.accent}22`, borderRadius: '8px', color: s.text, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}>📊 Speicher prüfen</button>
                    <button type="button" onClick={() => {
                      try { cleanupUnnecessaryData(); alert('✅ Cleanup abgeschlossen.') } catch (_) { alert('⚠️ Cleanup mit Fehlern.') }
                      setShowExportMenu(false)
                    }} style={{ padding: '0.6rem 1rem', background: `${s.accent}20`, border: `1px solid ${s.accent}55`, borderRadius: '8px', color: s.accent, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', fontWeight: '600' }}>🧹 Cleanup durchführen</button>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Einstellungen: Karten statt Sub-Tab-Leiste */}
            {!settingsSubTab || settingsSubTab === 'stammdaten' ? null : null /* subtab aktiv = kein Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
              <button type="button" onClick={() => setSettingsSubTab('stammdaten')} style={{ textAlign: 'left', cursor: 'pointer', background: settingsSubTab === 'stammdaten' ? `${s.accent}18` : s.bgElevated, border: `2px solid ${settingsSubTab === 'stammdaten' ? s.accent : s.accent + '22'}`, borderRadius: '12px', padding: '1rem', transition: 'all 0.2s', fontFamily: 'inherit' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.accent }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = settingsSubTab === 'stammdaten' ? s.accent : `${s.accent}22` }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>👥</div>
                <div style={{ fontWeight: 700, color: s.text, fontSize: '0.95rem' }}>Meine Daten</div>
                <div style={{ fontSize: '0.78rem', color: s.muted, marginTop: '0.2rem' }}>Name, Kontakt, Adresse, Öffnungszeiten</div>
              </button>
              <button type="button" onClick={() => setSettingsSubTab('registrierung')} style={{ textAlign: 'left', cursor: 'pointer', background: settingsSubTab === 'registrierung' ? `${s.accent}18` : s.bgElevated, border: `2px solid ${settingsSubTab === 'registrierung' ? s.accent : s.accent + '22'}`, borderRadius: '12px', padding: '1rem', transition: 'all 0.2s', fontFamily: 'inherit' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.accent }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = settingsSubTab === 'registrierung' ? s.accent : `${s.accent}22` }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>📝</div>
                <div style={{ fontWeight: 700, color: s.text, fontSize: '0.95rem' }}>Anmeldung</div>
                <div style={{ fontSize: '0.78rem', color: s.muted, marginTop: '0.2rem' }}>Wie melden sich Nutzer an?</div>
              </button>
              {!isVk2AdminContext() && (
              <button type="button" onClick={() => setSettingsSubTab('sicherheit')} style={{ textAlign: 'left', cursor: 'pointer', background: settingsSubTab === 'sicherheit' ? `${s.accent}18` : s.bgElevated, border: `2px solid ${settingsSubTab === 'sicherheit' ? s.accent : s.accent + '22'}`, borderRadius: '12px', padding: '1rem', transition: 'all 0.2s', fontFamily: 'inherit' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.accent }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = settingsSubTab === 'sicherheit' ? s.accent : `${s.accent}22` }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>🔒</div>
                <div style={{ fontWeight: 700, color: s.text, fontSize: '0.95rem' }}>Passwort & Sicherheit</div>
                <div style={{ fontSize: '0.78rem', color: s.muted, marginTop: '0.2rem' }}>Admin-Passwort ändern</div>
              </button>
              )}
              {!isOeffentlichAdminContext() && !isVk2AdminContext() && (
              <button type="button" onClick={() => setSettingsSubTab('lager')} style={{ textAlign: 'left', cursor: 'pointer', background: settingsSubTab === 'lager' ? `${s.accent}18` : s.bgElevated, border: `2px solid ${settingsSubTab === 'lager' ? s.accent : s.accent + '22'}`, borderRadius: '12px', padding: '1rem', transition: 'all 0.2s', fontFamily: 'inherit' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.accent }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = settingsSubTab === 'lager' ? s.accent : `${s.accent}22` }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>📦</div>
                <div style={{ fontWeight: 700, color: s.text, fontSize: '0.95rem' }}>Backup & Lager</div>
                <div style={{ fontSize: '0.78rem', color: s.muted, marginTop: '0.2rem' }}>Sicherheitskopie, Speicherverwaltung</div>
              </button>
              )}
              <button type="button" onClick={() => setSettingsSubTab('drucker')} style={{ textAlign: 'left', cursor: 'pointer', background: settingsSubTab === 'drucker' ? `${s.accent}18` : s.bgElevated, border: `2px solid ${settingsSubTab === 'drucker' ? s.accent : s.accent + '22'}`, borderRadius: '12px', padding: '1rem', transition: 'all 0.2s', fontFamily: 'inherit' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.accent }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = settingsSubTab === 'drucker' ? s.accent : `${s.accent}22` }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>🖨️</div>
                <div style={{ fontWeight: 700, color: s.text, fontSize: '0.95rem' }}>Drucker</div>
                <div style={{ fontSize: '0.78rem', color: s.muted, marginTop: '0.2rem' }}>
                  {isVk2AdminContext() ? 'Drucken (Standard-Drucker)' : 'Etikettendrucker einrichten'}
                </div>
              </button>
            </div>

            {/* Stammdaten Sub-Tab */}
            {settingsSubTab === 'stammdaten' && (
              <div>
                {isVk2AdminContext() ? (
                  /* VK2: Verein, Vorstand, Beirat, Mitglieder */
                  <div>
                    <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: s.bgCard, border: `1px solid ${s.accent}33`, borderRadius: s.radius, color: s.text, fontSize: '0.9rem' }}>
                      <strong>VK2 Stammdaten:</strong> Verein mit Adresse, Vorstand und Mitgliedern. Alle Felder optional – nur Name ausfüllen wo bekannt.
                    </div>
                    {/* Verein */}
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: '12px' }}>
                      <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: s.text, borderBottom: `1px solid ${s.accent}22`, paddingBottom: '0.5rem' }}>🏛️ Verein</h3>
                      <div className="admin-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Vereinsname</label>
                          <input type="text" value={vk2Stammdaten.verein.name} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, verein: { ...vk2Stammdaten.verein, name: e.target.value } })} placeholder="z. B. Kunstverein Musterstadt" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Vereinsnummer</label>
                          <input type="text" value={vk2Stammdaten.verein.vereinsnummer} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, verein: { ...vk2Stammdaten.verein, vereinsnummer: e.target.value } })} placeholder="z. B. ZVR 1234567" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field" style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.85rem' }}>Adresse (Straße, Hausnummer)</label>
                          <input type="text" value={vk2Stammdaten.verein.address} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, verein: { ...vk2Stammdaten.verein, address: e.target.value } })} placeholder="z. B. Hauptstraße 12" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Ort (PLZ und Ortsname)</label>
                          <input type="text" value={vk2Stammdaten.verein.city} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, verein: { ...vk2Stammdaten.verein, city: e.target.value } })} placeholder="z. B. 1010 Wien" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Land</label>
                          <input type="text" value={vk2Stammdaten.verein.country} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, verein: { ...vk2Stammdaten.verein, country: e.target.value } })} placeholder="z. B. Österreich" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>E-Mail</label>
                          <input type="email" value={vk2Stammdaten.verein.email} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, verein: { ...vk2Stammdaten.verein, email: e.target.value } })} placeholder="info@verein.example" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Website</label>
                          <input type="url" value={vk2Stammdaten.verein.website} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, verein: { ...vk2Stammdaten.verein, website: e.target.value } })} placeholder="https://..." style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                      </div>
                    </div>
                    {/* ── KOMMUNIKATION ── */}
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: '12px' }}>
                      <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: s.text, borderBottom: `1px solid ${s.accent}22`, paddingBottom: '0.5rem' }}>💬 Kommunikation (WhatsApp)</h3>
                      <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: s.muted }}>Diese Links erscheinen auf der Mitglieder-Galerie. Mitglieder können direkt per WhatsApp kommunizieren – am Handy öffnet sich die App, am PC WhatsApp Web.</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: s.muted, fontWeight: 600 }}>
                            📱 WhatsApp-Gruppen-Link
                          </label>
                          <input
                            type="url"
                            value={vk2Stammdaten.kommunikation?.whatsappGruppeLink || ''}
                            onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, kommunikation: { ...vk2Stammdaten.kommunikation, whatsappGruppeLink: e.target.value } })}
                            placeholder="https://chat.whatsapp.com/..."
                            style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, outline: 'none' }}
                          />
                          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: s.muted }}>In WhatsApp: Gruppe → Link einladen → Link kopieren</p>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: s.muted, fontWeight: 600 }}>
                            📞 Vorstand Telefon (für Direkt-Nachricht)
                          </label>
                          <input
                            type="tel"
                            value={vk2Stammdaten.kommunikation?.vorstandTelefon || ''}
                            onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, kommunikation: { ...vk2Stammdaten.kommunikation, vorstandTelefon: e.target.value.replace(/\s/g, '') } })}
                            placeholder="4366412345678 (ohne + oder 0)"
                            style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, outline: 'none' }}
                          />
                          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: s.muted }}>Österreich: 43 + Nummer ohne führende 0 (z.B. 4366412345678)</p>
                        </div>
                      </div>

                      {/* Vorschau */}
                      {(vk2Stammdaten.kommunikation?.whatsappGruppeLink || vk2Stammdaten.kommunikation?.vorstandTelefon) && (
                        <div style={{ padding: '0.6rem 0.75rem', background: '#25d36611', border: '1px solid #25d36644', borderRadius: 8, display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: s.muted }}>Vorschau:</span>
                          {vk2Stammdaten.kommunikation?.whatsappGruppeLink && (
                            <a href={vk2Stammdaten.kommunikation.whatsappGruppeLink} target="_blank" rel="noopener noreferrer" style={{ padding: '0.3rem 0.7rem', background: '#25d366', borderRadius: 20, color: '#fff', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              💬 Gruppe beitreten ↗
                            </a>
                          )}
                          {vk2Stammdaten.kommunikation?.vorstandTelefon && (
                            <a href={`https://wa.me/${vk2Stammdaten.kommunikation.vorstandTelefon}`} target="_blank" rel="noopener noreferrer" style={{ padding: '0.3rem 0.7rem', background: '#25d366', borderRadius: 20, color: '#fff', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              📩 Vorstand schreiben ↗
                            </a>
                          )}
                        </div>
                      )}

                      {/* ── UMFRAGEN ── */}
                      <div style={{ marginTop: '1rem', borderTop: `1px solid ${s.accent}22`, paddingTop: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <span style={{ fontWeight: 700, color: s.text, fontSize: '0.95rem' }}>📊 Umfragen</span>
                            <span style={{ fontSize: '0.8rem', color: s.muted, marginLeft: '0.5rem' }}>Link per WhatsApp teilen – Mitglieder antworten direkt</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const id = `umfrage-${Date.now()}`
                              const neu: import('../src/config/tenantConfig').Vk2Umfrage = { id, frage: '', antworten: ['Ja', 'Nein'], erstelltAm: new Date().toISOString(), aktiv: true }
                              const umfragen = [...(vk2Stammdaten.kommunikation?.umfragen || []), neu]
                              setVk2Stammdaten({ ...vk2Stammdaten, kommunikation: { ...vk2Stammdaten.kommunikation, umfragen } })
                            }}
                            style={{ padding: '0.4rem 0.85rem', background: `${s.accent}22`, border: `1px solid ${s.accent}55`, borderRadius: 8, color: s.accent, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            + Neue Umfrage
                          </button>
                        </div>

                        {(vk2Stammdaten.kommunikation?.umfragen || []).length === 0 && (
                          <p style={{ fontSize: '0.82rem', color: s.muted, fontStyle: 'italic' }}>Noch keine Umfragen. Mit „+ Neue Umfrage" eine erstellen.</p>
                        )}

                        {(vk2Stammdaten.kommunikation?.umfragen || []).map((umfrage, ui) => {
                          const pollUrl = `https://k2-galerie.vercel.app${window.location.pathname.replace('/admin', '') || '/'}vk2-umfrage?id=${umfrage.id}&frage=${encodeURIComponent(umfrage.frage)}&antworten=${encodeURIComponent(umfrage.antworten.join('|'))}`
                          const whatsappText = `📊 *${umfrage.frage}*\n\nBitte abstimmen:\n${umfrage.antworten.map((a, i) => `${['1️⃣','2️⃣','3️⃣','4️⃣'][i] || (i+1)+'.'}  ${a}`).join('\n')}\n\n➡️ ${pollUrl}`
                          const waLink = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`
                          return (
                            <div key={umfrage.id} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: s.bgElevated, border: `1px solid ${s.accent}22`, borderRadius: 10 }}>
                              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                                <input
                                  type="text"
                                  value={umfrage.frage}
                                  onChange={(e) => {
                                    const umfragen = (vk2Stammdaten.kommunikation?.umfragen || []).map((u, i) => i === ui ? { ...u, frage: e.target.value } : u)
                                    setVk2Stammdaten({ ...vk2Stammdaten, kommunikation: { ...vk2Stammdaten.kommunikation, umfragen } })
                                  }}
                                  placeholder="Frage eingeben, z.B. Wann passt die nächste Ausstellung?"
                                  style={{ flex: 1, padding: '0.5rem 0.7rem', background: s.bgCard, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, fontSize: '0.9rem', outline: 'none' }}
                                />
                                <button type="button" title="Umfrage löschen" onClick={() => {
                                  const umfragen = (vk2Stammdaten.kommunikation?.umfragen || []).filter((_, i) => i !== ui)
                                  setVk2Stammdaten({ ...vk2Stammdaten, kommunikation: { ...vk2Stammdaten.kommunikation, umfragen } })
                                }} style={{ padding: '0.5rem 0.6rem', background: 'none', border: `1px solid ${s.accent}22`, borderRadius: 8, color: s.muted, cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>🗑️</button>
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                {umfrage.antworten.map((ant, ai) => (
                                  <div key={ai} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <input
                                      type="text"
                                      value={ant}
                                      onChange={(e) => {
                                        const antworten = umfrage.antworten.map((a, i) => i === ai ? e.target.value : a)
                                        const umfragen = (vk2Stammdaten.kommunikation?.umfragen || []).map((u, i) => i === ui ? { ...u, antworten } : u)
                                        setVk2Stammdaten({ ...vk2Stammdaten, kommunikation: { ...vk2Stammdaten.kommunikation, umfragen } })
                                      }}
                                      placeholder={`Antwort ${ai + 1}`}
                                      style={{ width: 100, padding: '0.3rem 0.5rem', background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: 6, color: s.text, fontSize: '0.85rem', outline: 'none' }}
                                    />
                                    {umfrage.antworten.length > 2 && (
                                      <button type="button" onClick={() => {
                                        const antworten = umfrage.antworten.filter((_, i) => i !== ai)
                                        const umfragen = (vk2Stammdaten.kommunikation?.umfragen || []).map((u, i) => i === ui ? { ...u, antworten } : u)
                                        setVk2Stammdaten({ ...vk2Stammdaten, kommunikation: { ...vk2Stammdaten.kommunikation, umfragen } })
                                      }} style={{ background: 'none', border: 'none', color: s.muted, cursor: 'pointer', fontSize: '0.8rem', padding: '0 2px' }}>×</button>
                                    )}
                                  </div>
                                ))}
                                {umfrage.antworten.length < 4 && (
                                  <button type="button" onClick={() => {
                                    const antworten = [...umfrage.antworten, '']
                                    const umfragen = (vk2Stammdaten.kommunikation?.umfragen || []).map((u, i) => i === ui ? { ...u, antworten } : u)
                                    setVk2Stammdaten({ ...vk2Stammdaten, kommunikation: { ...vk2Stammdaten.kommunikation, umfragen } })
                                  }} style={{ padding: '0.3rem 0.5rem', background: `${s.accent}15`, border: `1px dashed ${s.accent}44`, borderRadius: 6, color: s.accent, fontSize: '0.82rem', cursor: 'pointer' }}>+ Antwort</button>
                                )}
                              </div>
                              {umfrage.frage.trim() && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', background: '#25d366', borderRadius: 20, color: '#fff', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}
                                >
                                  💬 Per WhatsApp teilen ↗
                                </a>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Speichern */}
                      <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => { try { localStorage.setItem(KEY_VK2_STAMMDATEN, JSON.stringify(vk2Stammdaten)) } catch (_) {}; alert('Kommunikations-Einstellungen gespeichert ✅') }}
                          style={{ padding: '0.5rem 1.25rem', background: s.gradientAccent, border: 'none', borderRadius: 8, color: '#fff', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Speichern
                        </button>
                      </div>
                    </div>

                    {/* Vorstand & Beirat – gegendert; Vollzugang nur Vorsitzende:r + Kassier:in (siehe docs/VK2-ZUGANG-ROLLEN.md) */}
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: '12px' }}>
                      <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: s.text, borderBottom: `1px solid ${s.accent}22`, paddingBottom: '0.5rem' }}>👥 Vorstand & Beirat</h3>
                      <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: s.muted }}>Vollzugang zum VK2-Admin haben nur Vorsitzende:r (Präsident:in) und Kassier:in. Vereinsmitglieder haben beschränkten Zugang (nur eigene Daten und Mitgliederlisten).</p>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: s.accent }}>⭐ Wer hier eingetragen ist und zugleich in „Registrierte Mitglieder“ vorkommt (gleicher Name), wird in Galerie, Vorschau und Mitgliederkartei als Vorstand hervorgehoben – Anerkennung sichtbar.</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Vorsitzende:r / Präsident:in</label>
                          <input type="text" value={vk2Stammdaten.vorstand.name} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, vorstand: { name: e.target.value } })} placeholder="Name" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Stellv. Vorsitzende:r</label>
                          <input type="text" value={vk2Stammdaten.vize.name} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, vize: { name: e.target.value } })} placeholder="Name" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Kassier:in</label>
                          <input type="text" value={vk2Stammdaten.kassier.name} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, kassier: { name: e.target.value } })} placeholder="Name" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Schriftführer:in</label>
                          <input type="text" value={vk2Stammdaten.schriftfuehrer.name} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, schriftfuehrer: { name: e.target.value } })} placeholder="Name" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Beisitzer:in (optional)</label>
                          <input type="text" value={vk2Stammdaten.beisitzer?.name || ''} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, beisitzer: { name: e.target.value } })} placeholder="Name" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                      </div>
                    </div>
                    {/* Registrierte Mitglieder – eine Wartung: Profil anlegen, User übernehmen, Bearbeiten (Unsere Mitglieder). */}
                    <div style={{ marginBottom: '1rem', padding: '1rem', background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: '12px' }}>
                      <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: s.text, borderBottom: `1px solid ${s.accent}22`, paddingBottom: '0.5rem' }}>📋 Registrierte Mitglieder</h3>
                      <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: s.muted }}>Profile für die Unsere Mitglieder. <strong>Ab 10 registrierten Mitgliedern</strong> wird der Verein kostenfrei (Pro-Version).</p>
                      <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: s.accent, fontStyle: 'italic' }}>💡 Was du hier siehst (Name, E-Mail, Kunstrichtung, Bild), erscheint auf den Karten in der Unsere Mitglieder – öffentlich sichtbar.</p>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: s.muted }}><strong>Auf Karte:</strong> Hakerl = auf der Karte öffentlich sichtbar. Kein Hakerl = gesperrt, erscheint nicht auf der öffentlichen Karte.</p>
                      <div style={{ marginBottom: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => { setEditingMemberIndex(null); setMemberForm(EMPTY_MEMBER_FORM); setShowAddModal(true) }}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: s.gradientAccent, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                        >
                          + Profil für Unsere Mitglieder anlegen
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const bestehend = vk2Stammdaten.mitglieder || []
                            const namenBereits = new Set(bestehend.map(m => m.name))
                            const neue = USER_LISTE_FUER_MITGLIEDER.filter(u => !namenBereits.has(u.name))
                            setVk2Stammdaten({ ...vk2Stammdaten, mitglieder: [...bestehend, ...neue] })
                          }}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: `${s.accent}22`, border: `1px solid ${s.accent}55`, borderRadius: 8, color: s.accent, fontWeight: 600, cursor: 'pointer' }}
                        >
                          👥 User aus „Meine User“ übernehmen
                        </button>
                        <span style={{ fontSize: '0.8rem', color: s.muted }}>Fügt User mit allen Daten hinzu (ohne Doppel).</span>
                        {/* Export & Druck für Vorstand */}
                        <button
                          type="button"
                          title="Mitgliederliste als CSV exportieren"
                          onClick={() => {
                            const mitglieder = vk2Stammdaten.mitglieder || []
                            const header = 'Name,E-Mail,Typ,Eintrittsdatum,Ort,Telefon,Rolle,PIN'
                            const rows = mitglieder.map(m => [
                              m.name || '',
                              m.email || '',
                              m.typ || '',
                              m.eintrittsdatum || m.seit || '',
                              m.ort || '',
                              m.phone || '',
                              m.rolle || 'mitglied',
                              m.pin || ''
                            ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
                            const csv = [header, ...rows].join('\n')
                            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url; a.download = 'mitgliederliste.csv'; a.click()
                            URL.revokeObjectURL(url)
                          }}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: `${s.accent}22`, border: `1px solid ${s.accent}55`, borderRadius: 8, color: s.accent, fontWeight: 600, cursor: 'pointer' }}
                        >
                          📥 Liste exportieren (CSV)
                        </button>
                        <button
                          type="button"
                          title="Mitgliederliste drucken"
                          onClick={() => {
                            const mitglieder = vk2Stammdaten.mitglieder || []
                            const vereinName = vk2Stammdaten.verein?.name || 'Verein'
                            const rows = mitglieder.map((m, i) => `<tr><td>${i+1}</td><td>${m.name||''}</td><td>${m.email||''}</td><td>${m.typ||''}</td><td>${m.eintrittsdatum||m.seit||''}</td><td>${m.ort||''}</td><td>${m.rolle==='vorstand'?'👑 Vorstand':'Mitglied'}</td></tr>`).join('')
                            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mitgliederliste</title><style>body{font-family:system-ui;padding:2rem}h1{font-size:1.3rem;margin-bottom:0.5rem}table{width:100%;border-collapse:collapse;font-size:0.88rem}th,td{padding:0.4rem 0.6rem;border:1px solid #ccc;text-align:left}th{background:#f0f0f0;font-weight:700}@media print{body{padding:1rem}}</style></head><body><h1>Mitgliederliste – ${vereinName}</h1><p style="margin:0 0 0.75rem;color:#666;font-size:0.82rem">${new Date().toLocaleDateString('de-AT')} · ${mitglieder.length} Mitglieder</p><table><thead><tr><th>#</th><th>Name</th><th>E-Mail</th><th>Kunstrichtung</th><th>Eintritt</th><th>Ort</th><th>Rolle</th></tr></thead><tbody>${rows}</tbody></table></body></html>`
                            const w = window.open('', '_blank')
                            if (w) { w.document.write(html); w.document.close(); w.print() }
                          }}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: `${s.accent}22`, border: `1px solid ${s.accent}55`, borderRadius: 8, color: s.accent, fontWeight: 600, cursor: 'pointer' }}
                        >
                          🖨️ Liste drucken
                        </button>
                        {/* Karten drucken */}
                        <button
                          type="button"
                          title="Alle Mitgliedskarten drucken (Kreditkarten-Format, 3 pro Reihe)"
                          onClick={() => {
                            const mitglieder = (vk2Stammdaten.mitglieder || [])
                              .slice()
                              .sort((a, b) => {
                                if (a.rolle === 'vorstand' && b.rolle !== 'vorstand') return -1
                                if (b.rolle === 'vorstand' && a.rolle !== 'vorstand') return 1
                                return (a.name || '').localeCompare(b.name || '', 'de')
                              })
                            printMitgliedskarten(mitglieder, vk2Stammdaten.verein?.name || 'Verein')
                          }}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: `linear-gradient(135deg,${s.accent}33,${s.accent}22)`, border: `1px solid ${s.accent}66`, borderRadius: 8, color: s.accent, fontWeight: 700, cursor: 'pointer' }}
                        >
                          🪪 Alle Mitgliedskarten drucken
                        </button>
                      </div>

                      {/* QR-Code für Mitglied-Login */}
                      <VK2LoginQrBlock s={s} />

                      {/* CSV-Import: Drag & Drop oder Datei wählen */}
                      <div
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setCsvDragOver(true) }}
                        onDragLeave={() => setCsvDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault(); e.stopPropagation(); setCsvDragOver(false)
                          const file = e.dataTransfer?.files?.[0]
                          if (!file || (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'text/plain')) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            const text = typeof reader.result === 'string' ? reader.result : ''
                            const neu = parseCsvToMitglieder(text)
                            if (neu.length === 0) return
                            const bestehend = vk2Stammdaten.mitglieder || []
                            const byName = new Map(bestehend.map(m => [m.name?.trim().toLowerCase(), m]))
                            neu.forEach(n => {
                              const key = n.name?.trim().toLowerCase()
                              if (byName.has(key)) {
                                const old = byName.get(key)!
                                byName.set(key, { ...old, ...n, mitgliedFotoUrl: old.mitgliedFotoUrl || n.mitgliedFotoUrl, imageUrl: old.imageUrl || n.imageUrl, oeffentlichSichtbar: old.oeffentlichSichtbar })
                              } else byName.set(key, { ...n, oeffentlichSichtbar: n.oeffentlichSichtbar !== false })
                            })
                            const merged = Array.from(byName.values())
                            setVk2Stammdaten({ ...vk2Stammdaten, mitglieder: merged })
                            try { localStorage.setItem(KEY_VK2_STAMMDATEN, JSON.stringify({ ...vk2Stammdaten, mitglieder: merged })) } catch (_) {}
                          }
                          reader.readAsText(file, 'utf-8')
                        }}
                        style={{
                          marginBottom: '0.75rem', padding: '1rem', border: `2px dashed ${csvDragOver ? s.accent : s.accent + '44'}`, borderRadius: 12, background: csvDragOver ? s.accent + '11' : s.bgElevated, textAlign: 'center', cursor: 'pointer'
                        }}
                      >
                        <label style={{ cursor: 'pointer', display: 'block' }}>
                          <input
                            type="file"
                            accept=".csv,.txt,text/csv,text/plain"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              const reader = new FileReader()
                              reader.onload = () => {
                                const text = typeof reader.result === 'string' ? reader.result : ''
                                const neu = parseCsvToMitglieder(text)
                                if (neu.length === 0) return
                                const bestehend = vk2Stammdaten.mitglieder || []
                                const byName = new Map(bestehend.map(m => [m.name?.trim().toLowerCase(), m]))
                                neu.forEach(n => { const key = n.name?.trim().toLowerCase(); if (byName.has(key)) { const old = byName.get(key)!; byName.set(key, { ...old, ...n, mitgliedFotoUrl: old.mitgliedFotoUrl || n.mitgliedFotoUrl, imageUrl: old.imageUrl || n.imageUrl, oeffentlichSichtbar: old.oeffentlichSichtbar }) } else byName.set(key, { ...n, oeffentlichSichtbar: n.oeffentlichSichtbar !== false }) })
                                const merged = Array.from(byName.values())
                                setVk2Stammdaten({ ...vk2Stammdaten, mitglieder: merged })
                                try { localStorage.setItem(KEY_VK2_STAMMDATEN, JSON.stringify({ ...vk2Stammdaten, mitglieder: merged })) } catch (_) {}
                              }
                              reader.readAsText(file, 'utf-8')
                              e.target.value = ''
                            }}
                          />
                          <span style={{ color: s.accent, fontWeight: 600 }}>📂 CSV oder Tabelle importieren</span>
                          <span style={{ color: s.muted, fontSize: '0.9rem' }}> – Datei hierher ziehen (Drag & Drop) oder klicken zum Auswählen</span>
                        </label>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: s.muted }}>Erste Zeile = Kopfzeile (z. B. Name, E-Mail, Straße, PLZ, Ort, Land, Geburtsdatum, Eintrittsdatum, Kunstrichtung, Telefon, Website). Trennzeichen: Komma oder Semikolon.</p>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ borderBottom: `2px solid ${s.accent}44` }}>
                              <th style={{ width: 44, padding: '0.5rem 0.75rem' }}></th>
                              <th style={{ width: 48, padding: '0.5rem 0.75rem', textAlign: 'center', color: s.accent }} title="Hakerl = auf Karte öffentlich sichtbar">Auf Karte</th>
                              <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: s.accent }}>Name</th>
                              <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: s.accent }}>Rolle</th>
                              <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: s.accent }}>E-Mail</th>
                              <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: s.accent }}>Lizenz</th>
                              <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: s.accent }}>Kunstrichtung</th>
                              <th style={{ width: 60 }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {([...(vk2Stammdaten.mitglieder || [])].sort((a, b) => getVorstandSortKey(vk2Stammdaten, a.name) - getVorstandSortKey(vk2Stammdaten, b.name)).map((m, sortedIndex) => {
                              const i = (vk2Stammdaten.mitglieder || []).indexOf(m)
                              const nameNorm = (s: string | undefined) => (s ?? '').trim().toLowerCase()
                              const muster = USER_LISTE_FUER_MITGLIEDER.find(u => nameNorm(u.name) === nameNorm(m.name))
                              const has = (v: string | undefined) => (v ?? '').trim().length > 0
                              const d = muster ? {
                                name: m.name,
                                email: has(m.email) ? m.email : (muster.email ?? '–'),
                                lizenz: has(m.lizenz) ? m.lizenz : (muster.lizenz ?? '–'),
                                typ: has(m.typ) ? m.typ : (muster.typ ?? '–'),
                                mitgliedFotoUrl: m.mitgliedFotoUrl ?? muster.mitgliedFotoUrl,
                                imageUrl: m.imageUrl ?? muster.imageUrl,
                                phone: has(m.phone) ? m.phone : muster.phone,
                                seit: has(m.seit) ? m.seit : muster.seit
                              } : { ...m, mitgliedFotoUrl: m.mitgliedFotoUrl, imageUrl: m.imageUrl, email: m.email || '–', lizenz: m.lizenz || '–', typ: m.typ || '–' }
                              const avatarUrl = d.mitgliedFotoUrl || d.imageUrl
                              const aufKarte = m.oeffentlichSichtbar !== false
                              const vorstandRole = getVorstandRole(vk2Stammdaten, m.name)
                              const toggleAufKarte = () => {
                                const neu = (vk2Stammdaten.mitglieder || []).map((mm, j) => j === i ? { ...mm, oeffentlichSichtbar: !aufKarte } : mm)
                                setVk2Stammdaten({ ...vk2Stammdaten, mitglieder: neu })
                                try { localStorage.setItem(KEY_VK2_STAMMDATEN, JSON.stringify({ ...vk2Stammdaten, mitglieder: neu })) } catch (_) {}
                              }
                              return (
                                <tr key={i} style={{ borderBottom: `1px solid ${s.accent}22`, opacity: aufKarte ? 1 : 0.75, background: vorstandRole ? s.accent + '0a' : undefined }}>
                                <td style={{ padding: '0.5rem 0.75rem', verticalAlign: 'middle' }}>
                                  {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /> : <span style={{ color: s.muted }}>👤</span>}
                                </td>
                                <td style={{ padding: '0.5rem 0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                                  <label style={{ cursor: 'pointer', display: 'inline-block' }} title={aufKarte ? 'Auf Karte sichtbar (öffentlich)' : 'Gesperrt – nicht auf Karte'}>
                                    <input type="checkbox" checked={aufKarte} onChange={toggleAufKarte} style={{ width: 18, height: 18, accentColor: s.accent }} />
                                  </label>
                                </td>
                                <td style={{ padding: '0.5rem 0.75rem', color: s.text, fontWeight: vorstandRole ? 600 : undefined }}>{d.name}</td>
                                <td style={{ padding: '0.5rem 0.75rem' }}>{vorstandRole ? <span style={{ fontSize: '0.8rem', color: s.accent, fontWeight: 600 }}>⭐ {vorstandRole}</span> : <span style={{ color: s.muted }}>–</span>}</td>
                                <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                                  {m.rolle === 'vorstand' ? <span title="Voll-Admin" style={{ fontSize: '0.8rem' }}>👑</span> : m.pin ? <span title={`PIN: ${m.pin}`} style={{ fontSize: '0.8rem', color: s.accent }}>🔑</span> : <span title="Kein PIN vergeben" style={{ fontSize: '0.8rem', color: s.muted }}>–</span>}
                                </td>
                                <td style={{ padding: '0.5rem 0.75rem', color: s.text }}>{d.email}</td>
                                <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', color: s.accent }}>{d.lizenz}</td>
                                <td style={{ padding: '0.5rem 0.75rem', color: s.text }}>{d.typ}</td>
                                <td style={{ padding: '0.5rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                  <button type="button" onClick={() => { setEditingMemberIndex(i); setMemberForm(memberToForm(m)); setShowAddModal(true) }} style={{ padding: '0.35rem 0.6rem', background: `${s.accent}22`, border: `1px solid ${s.accent}55`, borderRadius: 6, color: s.accent, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Bearbeiten</button>
                                  <button type="button" title="Mitgliedskarte drucken" onClick={() => printMitgliedskarten([m], vk2Stammdaten.verein?.name || 'Verein')} style={{ padding: '0.35rem 0.5rem', background: 'none', border: `1px solid ${s.accent}33`, borderRadius: 6, color: s.accent, fontSize: '0.95rem', cursor: 'pointer' }}>🪪</button>
                                  <button type="button" onClick={() => { const neu = (vk2Stammdaten.mitglieder || []).filter((_, j) => j !== i); setVk2Stammdaten({ ...vk2Stammdaten, mitglieder: neu }); try { localStorage.setItem(KEY_VK2_STAMMDATEN, JSON.stringify({ ...vk2Stammdaten, mitglieder: neu })) } catch (_) {} }} style={{ background: 'none', border: 'none', color: s.muted, cursor: 'pointer', fontSize: '1.1rem' }} title="Entfernen">×</button>
                                </td>
                              </tr>
                            ); })) }
                          </tbody>
                        </table>
                        {(vk2Stammdaten.mitglieder?.length ?? 0) === 0 && (
                          <p style={{ padding: '1rem', color: s.muted, fontSize: '0.9rem' }}>Noch keine registrierten Mitglieder. „+ Profil anlegen“ oder „User aus „Meine User“ übernehmen“.</p>
                        )}
                      </div>
                    </div>
                    {/* Nicht registrierte Mitglieder – im System erfasst (Datenschutz) */}
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: '12px' }}>
                      <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: s.text, borderBottom: `1px solid ${s.accent}22`, paddingBottom: '0.5rem' }}>📋 Nicht registrierte Mitglieder</h3>
                      <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: s.muted }}>Mitglieder ohne K2-Account – Aufnahme obliegt dem Verein. Ein Name pro Zeile. <strong>Werden im System erfasst</strong> (Datenschutz/Dokumentation).</p>
                      <textarea
                        value={(vk2Stammdaten.mitgliederNichtRegistriert ?? []).join('\n')}
                        onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, mitgliederNichtRegistriert: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Name ohne K2-Account&#10;…"
                        rows={4}
                        style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: '8px', resize: 'vertical', fontFamily: 'inherit' }}
                      />
                    </div>
                    <button className="btn-primary" onClick={saveStammdaten} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                      💾 Stammdaten speichern
                    </button>
                  </div>
                ) : (
                  <>
                    {isOeffentlichAdminContext() && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        marginBottom: '1rem',
                        background: 'rgba(184, 184, 255, 0.15)',
                        border: '1px solid rgba(184, 184, 255, 0.4)',
                        borderRadius: '8px',
                        color: '#b8b8ff',
                        fontSize: '0.9rem'
                      }}>
                        🔒 Demo-Modus (ök2): Nur Musterdaten – Speichern schreibt keine echten K2-Daten.
                      </div>
                    )}
                <div style={{
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  background: s.bgCard,
                  border: `1px solid ${s.accent}33`,
                  borderRadius: s.radius,
                  color: s.text,
                  fontSize: '0.9rem',
                  lineHeight: 1.5
                }}>
                  <strong>Hinweis:</strong> Die Galerie wird in der Hauptsache von einer Person betrieben. Optional kannst du eine zweite Person anbieten – dazu die erforderlichen Eintragungen bei „Person 2 (optional)“ vornehmen (Name, E-Mail, Telefon; Name ggf. im Design-Tab unter Willkommensseite/Galerie anpassen). Nach dem Speichern erscheint die zweite Person z. B. im Impressum und in der Vita.
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 'clamp(1rem, 2.5vw, 1.5rem)',
                  marginBottom: 'clamp(1rem, 2.5vw, 1.5rem)'
                }}>
                  {/* Person 1 */}
                  <div style={{
                    background: s.bgCard,
                    border: `1px solid ${s.accent}22`,
                    padding: 'clamp(1rem, 2.5vw, 1.25rem)',
                    borderRadius: '16px',
                    boxShadow: s.shadow
                  }}>
                    <h3 style={{
                      marginTop: 0,
                      marginBottom: '0.25rem',
                      fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                      fontWeight: '600',
                      color: s.text,
                      borderBottom: `1px solid ${s.accent}22`,
                      paddingBottom: '0.5rem'
                    }}>
                      👩‍🎨 Person 1 (Hauptansprechpartner)
                    </h3>
                    <p style={{ margin: '0 0 clamp(0.75rem, 2vw, 1rem)', fontSize: '0.8rem', color: s.muted }}>
                      {isOeffentlichAdminContext() ? MUSTER_TEXTE.martina.name : (martinaData.name || 'Name im Design-Tab festlegen')}
                    </p>
                    <div className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: s.text }}>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem', color: s.text }}>E-Mail</label>
                        <input
                          type="email"
                          value={martinaData.email || ''}
                          onChange={(e) => setMartinaData({ ...martinaData, email: e.target.value })}
                          placeholder="martina@k2-galerie.at"
                          style={{ padding: '0.6rem', fontSize: '0.9rem', color: s.text, background: s.bgElevated, border: `1px solid ${s.accent}33` }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem', color: s.text }}>Telefon</label>
                        <input
                          type="tel"
                          value={martinaData.phone || ''}
                          onChange={(e) => setMartinaData({ ...martinaData, phone: e.target.value })}
                          placeholder="+43 ..."
                          style={{ padding: '0.6rem', fontSize: '0.9rem', color: s.text, background: s.bgElevated, border: `1px solid ${s.accent}33` }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem', color: s.text }}>Vita (für Außenkommunikation &amp; Galerie)</label>
                        <textarea
                          value={martinaData.vita || ''}
                          onChange={(e) => setMartinaData({ ...martinaData, vita: e.target.value })}
                          placeholder="Vita-Text (Werdegang, Ausstellungen, Arbeitsweise …)"
                          rows={8}
                          style={{ padding: '0.6rem', fontSize: '0.9rem', color: s.text, background: s.bgElevated, border: `1px solid ${s.accent}33`, width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                        />
                        <button type="button" onClick={() => openVitaDocument('martina')} style={{ marginTop: '0.5rem', padding: '0.4rem 0.75rem', background: s.accent, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
                          📄 Vita als Dokument öffnen
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Person 2 (optional) */}
                  <div style={{
                    background: s.bgCard,
                    border: `1px solid ${s.accent}22`,
                    padding: 'clamp(1rem, 2.5vw, 1.25rem)',
                    borderRadius: '16px',
                    boxShadow: s.shadow
                  }}>
                    <h3 style={{
                      marginTop: 0,
                      marginBottom: '0.25rem',
                      fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                      fontWeight: '600',
                      color: s.text,
                      borderBottom: `1px solid ${s.accent}22`,
                      paddingBottom: '0.5rem'
                    }}>
                      👨‍🎨 Person 2 (optional)
                    </h3>
                    <p style={{ margin: '0 0 clamp(0.75rem, 2vw, 1rem)', fontSize: '0.8rem', color: s.muted }}>
                      {isOeffentlichAdminContext() ? MUSTER_TEXTE.georg.name : (georgData.name || 'Name im Design-Tab festlegen')}
                    </p>
<p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: s.muted }}>
                    Für Anzeige einer zweiten Person: E-Mail und Telefon ausfüllen, dann „Stammdaten speichern“. Name ggf. im Design-Tab anpassen.
                    </p>
                    <div className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: s.text }}>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem', color: s.text }}>E-Mail</label>
                        <input
                          type="email"
                          value={georgData.email || ''}
                          onChange={(e) => setGeorgData({ ...georgData, email: e.target.value })}
                          placeholder="georg@k2-galerie.at"
                          style={{ padding: '0.6rem', fontSize: '0.9rem', color: s.text, background: s.bgElevated, border: `1px solid ${s.accent}33` }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem', color: s.text }}>Telefon</label>
                        <input
                          type="tel"
                          value={georgData.phone || ''}
                          onChange={(e) => setGeorgData({ ...georgData, phone: e.target.value })}
                          placeholder="+43 ..."
                          style={{ padding: '0.6rem', fontSize: '0.9rem', color: s.text, background: s.bgElevated, border: `1px solid ${s.accent}33` }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem', color: s.text }}>Vita (für Außenkommunikation &amp; Galerie)</label>
                        <textarea
                          value={georgData.vita || ''}
                          onChange={(e) => setGeorgData({ ...georgData, vita: e.target.value })}
                          placeholder="Vita-Text (Werdegang, Ausstellungen, Arbeitsweise …)"
                          rows={8}
                          style={{ padding: '0.6rem', fontSize: '0.9rem', color: s.text, background: s.bgElevated, border: `1px solid ${s.accent}33`, width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                        />
                        <button type="button" onClick={() => openVitaDocument('georg')} style={{ marginTop: '0.5rem', padding: '0.4rem 0.75rem', background: s.accent, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
                          📄 Vita als Dokument öffnen
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Galerie */}
                  <div style={{
                    background: s.bgCard,
                    border: `1px solid ${s.accent}22`,
                    padding: 'clamp(1rem, 2.5vw, 1.25rem)',
                    borderRadius: '16px',
                    boxShadow: s.shadow
                  }}>
                    <h3 style={{
                      marginTop: 0,
                      marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
                      fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
                      fontWeight: '600',
                      color: s.text,
                      borderBottom: `1px solid ${s.accent}22`,
                      paddingBottom: '0.5rem'
                    }}>
                      🏛️ Galerie
                    </h3>
                    <div className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: s.text }}>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem', color: s.text }}>Adresse (Straße, Hausnummer)</label>
                        <input
                          type="text"
                          value={galleryData.address || ''}
                          onChange={(e) => setGalleryData({ ...galleryData, address: e.target.value })}
                          placeholder="z. B. Hauptstraße 12"
                          style={{ padding: '0.6rem', fontSize: '0.9rem', color: s.text, background: s.bgElevated, border: `1px solid ${s.accent}33` }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem', color: s.text }}>Ort (PLZ und Ortsname)</label>
                        <input
                          type="text"
                          value={galleryData.city || ''}
                          onChange={(e) => setGalleryData({ ...galleryData, city: e.target.value })}
                          placeholder="z. B. 1010 Wien"
                          style={{ padding: '0.6rem', fontSize: '0.9rem', color: s.text, background: s.bgElevated, border: `1px solid ${s.accent}33` }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem', color: s.text }}>Land</label>
                        <input
                          type="text"
                          value={galleryData.country || ''}
                          onChange={(e) => setGalleryData({ ...galleryData, country: e.target.value })}
                          placeholder="z. B. Österreich"
                          style={{ padding: '0.6rem', fontSize: '0.9rem', color: s.text, background: s.bgElevated, border: `1px solid ${s.accent}33` }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem', color: s.text }}>Telefon</label>
                        <input
                          type="tel"
                          value={galleryData.phone || ''}
                          onChange={(e) => setGalleryData({ ...galleryData, phone: e.target.value })}
                          placeholder="+43 ..."
                          style={{ padding: '0.6rem', fontSize: '0.9rem', color: s.text, background: s.bgElevated, border: `1px solid ${s.accent}33` }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem', color: s.text }}>E-Mail</label>
                        <input
                          type="email"
                          value={galleryData.email || ''}
                          onChange={(e) => setGalleryData({ ...galleryData, email: e.target.value })}
                          placeholder="info@k2-galerie.at"
                          style={{ padding: '0.6rem', fontSize: '0.9rem', color: s.text, background: s.bgElevated, border: `1px solid ${s.accent}33` }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem', color: s.text }}>Website</label>
                        <input
                          type="url"
                          value={galleryData.website || ''}
                          onChange={(e) => {
                            const value = e.target.value.trim()
                            setGalleryData({ 
                              ...galleryData, 
                              website: value
                            })
                          }}
                          placeholder="https://k2-galerie.at"
                          style={{ padding: '0.6rem', fontSize: '0.9rem', color: s.text, background: s.bgElevated, border: `1px solid ${s.accent}33` }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '0.85rem', color: s.text }}>Bankverbindung / IBAN (für Überweisungszwecke, z. B. Shop)</label>
                        <input
                          type="text"
                          value={galleryData.bankverbindung || ''}
                          onChange={(e) => setGalleryData({ ...galleryData, bankverbindung: e.target.value })}
                          placeholder="z. B. AT12 3456 7890 1234 5678, K2 Galerie"
                          style={{ padding: '0.6rem', fontSize: '0.9rem', color: s.text, background: s.bgElevated, border: `1px solid ${s.accent}33` }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: s.text }}>
                          <input
                            type="checkbox"
                            checked={galleryData.internetShopNotSetUp !== false}
                            onChange={(e) => setGalleryData({ ...galleryData, internetShopNotSetUp: e.target.checked })}
                            style={{ width: '18px', height: '18px' }}
                          />
                          Hinweis anzeigen: Galerie besuchen & Termin vereinbaren
                        </label>
                        <small style={{ color: s.muted, fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                          Wenn aktiv: Im Shop erscheint ein freundlicher Hinweis, dass ein Besuch der Galerie und eine Terminvereinbarung sinnvoll sind. Der Shop bleibt voll nutzbar (Bestellung, Zahlung).
                        </small>
                      </div>
                      <small style={{ color: s.muted, fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>
                        Bilder und Texte für Willkommensseite & Galerie findest du im <strong>Design</strong>-Tab in der Vorschau – dort auf Text oder Bild klicken zum Bearbeiten.
                      </small>
                      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: `1px solid ${s.accent}22` }}>
                        <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem', color: s.text }}>📜 AGB (Allgemeine Geschäftsbedingungen)</label>
                        <Link to={AGB_ROUTE} target="_blank" rel="noopener noreferrer" style={{ color: s.accent, textDecoration: 'underline', fontSize: '0.9rem' }}>AGB-Seite im Volltext anzeigen →</Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  <button 
                    className="btn-primary" 
                    onClick={saveStammdaten}
                    style={{
                      padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
                      fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                      width: '100%'
                    }}
                  >
                    💾 Stammdaten speichern
                  </button>
                </div>
                  </>
                )}
              </div>
            )}

            {/* Registrierung Sub-Tab – Lizenznummer + Lizenz/Verein + Stammdaten, keine doppelten Eingaben */}
            {settingsSubTab === 'registrierung' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', color: s.accent, marginBottom: '0.5rem' }}>📝 Registrierung</h3>
                <p style={{ color: s.muted, marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  Grundinfo für zukünftige User. Lizenz und Vereinsmitgliedschaft festlegen – Daten kommen aus Stammdaten, Änderungen werden beim Speichern übernommen.
                </p>
                {/* Lizenznummer – prominent, vom K2-System vergeben; Präfix: B, P, VB, VP, KF=Kostenfrei */}
                <div style={{ padding: '1.25rem', background: s.bgCard, border: `2px solid ${s.accent}66`, borderRadius: '12px', marginBottom: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: s.muted, marginBottom: '0.5rem' }}>Lizenznummer (K2-System)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.accent, letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                    {registrierungConfig.lizenznummer || (
                      <span style={{ color: s.muted, fontSize: '1rem' }}>— wird beim Speichern vergeben —</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: s.muted, marginTop: '0.5rem' }}>
                    Präfix: B=Basis · P=Pro · VB=Verein+50 % · VP=Verein+Bonussystem · KF=Kostenfrei
                  </div>
                </div>
                {/* Lizenztyp & Vereinsmitgliedschaft – für alle Kontexte (K2/ök2/VK2) */}
                <div style={{ padding: '1rem', background: s.bgCard, border: `1px solid ${s.accent}33`, borderRadius: '12px', marginBottom: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: s.text }}>💼 Lizenz & Vereinsmitgliedschaft</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                        <input type="checkbox" checked={registrierungConfig.kostenfrei ?? false} onChange={(e) => setRegistrierungConfig({ ...registrierungConfig, kostenfrei: e.target.checked })} />
                        Kostenlose Lizenz (KF) – vom System vergeben
                      </label>
                    </div>
                    <div style={{ opacity: registrierungConfig.kostenfrei ? 0.6 : 1 }}>
                      <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: s.muted }}>Lizenzversion</label>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                          <input type="radio" checked={registrierungConfig.lizenztyp === 'basis'} onChange={() => setRegistrierungConfig({ ...registrierungConfig, lizenztyp: 'basis' })} />
                          Basis
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                          <input type="radio" checked={registrierungConfig.lizenztyp === 'pro'} onChange={() => setRegistrierungConfig({ ...registrierungConfig, lizenztyp: 'pro' })} />
                          Pro
                        </label>
                      </div>
                      </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: s.muted }}>Vereinsmitglied?</label>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                          <input type="radio" checked={!registrierungConfig.vereinsmitglied} onChange={() => setRegistrierungConfig({ ...registrierungConfig, vereinsmitglied: false, vollpreisFuerEmpfehlung: false })} />
                          Nein
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                          <input type="radio" checked={registrierungConfig.vereinsmitglied} onChange={() => setRegistrierungConfig({ ...registrierungConfig, vereinsmitglied: true })} />
                          Ja
                        </label>
                      </div>
                    </div>
                    {registrierungConfig.vereinsmitglied && (
                      <div style={{ marginLeft: '1rem', paddingLeft: '1rem', borderLeft: `3px solid ${s.accent}66` }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: s.muted }}>Als Vereinsmitglied:</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input type="radio" checked={!registrierungConfig.vollpreisFuerEmpfehlung} onChange={() => setRegistrierungConfig({ ...registrierungConfig, vollpreisFuerEmpfehlung: false })} />
                            50 % Bonus (kein Bonussystem)
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input type="radio" checked={registrierungConfig.vollpreisFuerEmpfehlung} onChange={() => setRegistrierungConfig({ ...registrierungConfig, vollpreisFuerEmpfehlung: true })} />
                            Vollpreis – Bonussystem nutzen
                          </label>
                        </div>
                      </div>
                    )}
                    <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: s.bgElevated, borderRadius: '8px', fontSize: '0.85rem', color: s.muted, border: `1px solid ${s.accent}22` }}>
                      <strong>Regeln:</strong> Registrierte Vereinsmitglieder können untereinander das Bonussystem nicht nutzen. Kostenlose Lizenzen (KF) sind vom Bonussystem ausgeschlossen.
                    </div>
                    </div>
                  </div>
                </div>
                {isVk2AdminContext() ? (
                  /* VK2: Verein, Vorstand, Beirat, Mitglieder – gleiche Daten wie Stammdaten */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: s.text }}>🏛️ Verein</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Vereinsname</label>
                          <input type="text" value={vk2Stammdaten.verein.name} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, verein: { ...vk2Stammdaten.verein, name: e.target.value } })} placeholder="z. B. Kunstverein Musterstadt" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Vereinsnummer</label>
                          <input type="text" value={vk2Stammdaten.verein.vereinsnummer} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, verein: { ...vk2Stammdaten.verein, vereinsnummer: e.target.value } })} placeholder="z. B. ZVR 1234567" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Straße</label>
                          <input type="text" value={vk2Stammdaten.verein.address} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, verein: { ...vk2Stammdaten.verein, address: e.target.value } })} placeholder="Straße, Hausnummer" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Ort (PLZ Ort)</label>
                          <input type="text" value={vk2Stammdaten.verein.city} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, verein: { ...vk2Stammdaten.verein, city: e.target.value } })} placeholder="1010 Wien" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Land</label>
                          <input type="text" value={vk2Stammdaten.verein.country} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, verein: { ...vk2Stammdaten.verein, country: e.target.value } })} placeholder="Österreich" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>E-Mail</label>
                          <input type="email" value={vk2Stammdaten.verein.email} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, verein: { ...vk2Stammdaten.verein, email: e.target.value } })} placeholder="info@verein.example" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Website</label>
                          <input type="url" value={vk2Stammdaten.verein.website} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, verein: { ...vk2Stammdaten.verein, website: e.target.value } })} placeholder="https://..." style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '1rem', background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: s.text }}>👥 Vorstand & Beirat</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                        {(['vorstand', 'vize', 'kassier', 'schriftfuehrer'] as const).map((role) => (
                          <div key={role} className="field">
                            <label style={{ fontSize: '0.85rem' }}>{role === 'vorstand' ? 'Vorsitzende:r / Präsident:in' : role === 'vize' ? 'Stellv. Vorsitzende:r' : role === 'kassier' ? 'Kassier:in' : 'Schriftführer:in'}</label>
                            <input type="text" value={vk2Stammdaten[role].name} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, [role]: { name: e.target.value } })} placeholder="Name" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                          </div>
                        ))}
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Beisitzer:in</label>
                          <input type="text" value={vk2Stammdaten.beisitzer?.name || ''} onChange={(e) => setVk2Stammdaten({ ...vk2Stammdaten, beisitzer: { name: e.target.value } })} placeholder="Name (optional)" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                      </div>
                    </div>
                    <button className="btn-primary" onClick={() => { saveRegistrierungConfig(); saveStammdaten(); }} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', alignSelf: 'flex-start' }}>
                      💾 Speichern (Lizenz + Stammdaten)
                    </button>
                  </div>
                ) : (
                  /* K2/ök2: Galerie + Kontaktpersonen – gleiche Daten wie Stammdaten */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: s.text }}>🏛️ Galerie / Atelier</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Name</label>
                          <input type="text" value={galleryData.name || ''} onChange={(e) => setGalleryData({ ...galleryData, name: e.target.value })} placeholder="Galerie-Name" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Straße</label>
                          <input type="text" value={galleryData.address || ''} onChange={(e) => setGalleryData({ ...galleryData, address: e.target.value })} placeholder="Straße, Hausnummer" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Ort (PLZ Ort)</label>
                          <input type="text" value={galleryData.city || ''} onChange={(e) => setGalleryData({ ...galleryData, city: e.target.value })} placeholder="1010 Wien" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Land</label>
                          <input type="text" value={galleryData.country || ''} onChange={(e) => setGalleryData({ ...galleryData, country: e.target.value })} placeholder="Österreich" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>E-Mail</label>
                          <input type="email" value={galleryData.email || ''} onChange={(e) => setGalleryData({ ...galleryData, email: e.target.value })} placeholder="info@galerie.at" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Telefon</label>
                          <input type="tel" value={galleryData.phone || ''} onChange={(e) => setGalleryData({ ...galleryData, phone: e.target.value })} placeholder="+43 ..." style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Website</label>
                          <input type="url" value={galleryData.website || ''} onChange={(e) => setGalleryData({ ...galleryData, website: e.target.value })} placeholder="https://..." style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '1rem', background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: s.text }}>👤 Kontaktpersonen</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Person 1 (Name)</label>
                          <input type="text" value={martinaData.name || ''} onChange={(e) => setMartinaData({ ...martinaData, name: e.target.value })} placeholder="Name" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Person 1 (E-Mail)</label>
                          <input type="email" value={martinaData.email || ''} onChange={(e) => setMartinaData({ ...martinaData, email: e.target.value })} placeholder="E-Mail" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Person 1 (Telefon)</label>
                          <input type="tel" value={martinaData.phone || ''} onChange={(e) => setMartinaData({ ...martinaData, phone: e.target.value })} placeholder="+43 ..." style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Person 2 (Name)</label>
                          <input type="text" value={georgData.name || ''} onChange={(e) => setGeorgData({ ...georgData, name: e.target.value })} placeholder="Name (optional)" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Person 2 (E-Mail)</label>
                          <input type="email" value={georgData.email || ''} onChange={(e) => setGeorgData({ ...georgData, email: e.target.value })} placeholder="E-Mail" style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem' }}>Person 2 (Telefon)</label>
                          <input type="tel" value={georgData.phone || ''} onChange={(e) => setGeorgData({ ...georgData, phone: e.target.value })} placeholder="+43 ..." style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: s.bgElevated, border: `1px solid ${s.accent}33`, color: s.text }} />
                        </div>
                      </div>
                    </div>
                    <button className="btn-primary" onClick={() => { saveRegistrierungConfig(); saveStammdaten(); }} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', alignSelf: 'flex-start' }}>
                      💾 Speichern (Lizenz + Stammdaten)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sicherheit Sub-Tab – nur K2 und ök2 (VK2 braucht das nicht) */}
            {settingsSubTab === 'sicherheit' && !isVk2AdminContext() && (
              <div>
                <h3 style={{ fontSize: '1.1rem', color: s.accent, marginBottom: '1rem' }}>🔒 Sicherheitsabteilung</h3>
                <p style={{ color: s.muted, marginBottom: '1rem' }}>
                  Admin-Zugang, Passwort-Einstellungen und Zugriffskontrolle. Neue Kunden haben 2 Wochen Testphase ohne Passwort; danach oder für Wiederkehr Passwort setzen.
                </p>
                <div style={{
                  padding: '1rem',
                  background: s.bgElevated,
                  borderRadius: '12px',
                  border: `1px solid ${s.accent}22`,
                  marginBottom: '1rem'
                }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: s.text }}>
                    Verwaltet in Stammdaten (Admin-Passwort). Admin-Login beenden über den Header (👤 Symbol).
                  </p>
                </div>
                {/* Admin-Passwort ändern / setzen (K2: Stammdaten, ök2: eigener Key) */}
                <div style={{ padding: '1rem', background: s.bgCard, borderRadius: '12px', border: `1px solid ${s.accent}33`, marginBottom: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: s.text }}>Admin-Passwort ändern</h4>
                  <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: s.muted }}>Mindestens 6 Zeichen. E-Mail/Telefon optional – für Passwort-Zurücksetzen.</p>
                  <input type="email" value={adminContactEmail} onChange={(e) => setAdminContactEmail(e.target.value)} placeholder="E-Mail (optional)" style={{ width: '100%', padding: '0.6rem 0.9rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, fontSize: '0.9rem', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
                  <input type="tel" value={adminContactPhone} onChange={(e) => setAdminContactPhone(e.target.value)} placeholder="Telefon (optional)" style={{ width: '100%', padding: '0.6rem 0.9rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, fontSize: '0.9rem', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
                  <input type="password" value={adminNewPw} onChange={(e) => setAdminNewPw(e.target.value)} placeholder="Neues Passwort (min. 6 Zeichen)" style={{ width: '100%', padding: '0.6rem 0.9rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, fontSize: '0.9rem', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
                  <input type="password" value={adminNewPwConfirm} onChange={(e) => setAdminNewPwConfirm(e.target.value)} placeholder="Passwort wiederholen" style={{ width: '100%', padding: '0.6rem 0.9rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 8, color: s.text, fontSize: '0.9rem', marginBottom: '0.75rem', boxSizing: 'border-box' }} />
                  <button
                    type="button"
                    onClick={() => {
                      if (adminNewPw.length < 6) { alert('Passwort muss mindestens 6 Zeichen haben.'); return }
                      if (adminNewPw !== adminNewPwConfirm) { alert('Passwort und Wiederholung stimmen nicht überein.'); return }
                      try {
                        if (isOeffentlichAdminContext()) {
                          localStorage.setItem(KEY_OEF_ADMIN_PASSWORD, adminNewPw)
                          if (adminContactEmail.trim()) localStorage.setItem(KEY_OEF_ADMIN_EMAIL, adminContactEmail.trim())
                          if (adminContactPhone.trim()) localStorage.setItem(KEY_OEF_ADMIN_PHONE, adminContactPhone.trim())
                        } else {
                          const galleryStored = localStorage.getItem('k2-stammdaten-galerie')
                          const data = galleryStored ? JSON.parse(galleryStored) : {}
                          data.adminPassword = adminNewPw
                          localStorage.setItem('k2-stammdaten-galerie', JSON.stringify(data))
                        }
                        alert('✅ Passwort wurde gespeichert.')
                        setAdminNewPw('')
                        setAdminNewPwConfirm('')
                      } catch (e) {
                        alert('Speichern fehlgeschlagen.')
                      }
                    }}
                    style={{ padding: '0.5rem 1rem', background: s.gradientAccent, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Passwort speichern
                  </button>
                </div>
              </div>
            )}

            {/* Drucker Sub-Tab */}
            {settingsSubTab === 'drucker' && isVk2AdminContext() && (
              <div>
                <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', fontWeight: '600', color: s.text, marginBottom: '1.5rem' }}>
                  🖨️ Drucken
                </h3>
                <div style={{ background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: '16px', padding: '1.5rem', maxWidth: 560 }}>
                  <p style={{ margin: '0 0 1rem', fontSize: '1rem', color: s.text, fontWeight: 600 }}>Standard-Drucker des Mac/PC</p>
                  <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: s.muted, lineHeight: 1.6 }}>
                    Im Vereinsbereich werden Mitgliederlisten, Adresslisten und Dokumente über den normalen Drucker gedruckt –
                    einfach mit <strong style={{ color: s.text }}>Datei → Drucken</strong> (⌘P) im Browser oder über die jeweiligen Drucken-Buttons.
                  </p>
                  <ul style={{ margin: 0, padding: '0 0 0 1.25rem', fontSize: '0.88rem', color: s.muted, lineHeight: 1.8 }}>
                    <li>Mitgliederliste drucken → Stammdaten → Mitglieder-Tab → „Drucken"</li>
                    <li>Adressliste drucken → gleicher Weg → „Adressliste drucken"</li>
                    <li>Dokumente drucken → Dokumente-Tab → einzeln öffnen und drucken</li>
                  </ul>
                  <p style={{ margin: '1rem 0 0', fontSize: '0.82rem', color: s.muted, fontStyle: 'italic' }}>
                    💡 Etikettendrucker (Brother QL) wird nur im K2-Galerie-Bereich für Kunst-Etiketten benötigt.
                  </p>
                </div>
              </div>
            )}
            {settingsSubTab === 'drucker' && !isVk2AdminContext() && (
              <div>
                <h3 style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                  fontWeight: '600',
                  color: s.text,
                  marginBottom: '1.5rem'
                }}>
                  🖨️ Drucker-Einstellungen
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  {/* Brother QL-820MWBc Einstellungen */}
                  <div style={{
                    background: s.bgCard,
                    border: `1px solid ${s.accent}22`,
                    padding: '1.5rem',
                    borderRadius: '16px',
                    boxShadow: s.shadow
                  }}>
                    <h4 style={{
                      marginTop: 0,
                      marginBottom: '1rem',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: s.text,
                      borderBottom: `1px solid ${s.accent}22`,
                      paddingBottom: '0.75rem'
                    }}>
                      Drucker &amp; Format (pro Mandant)
                    </h4>

                    <div className="field">
                      <label style={{ fontSize: '0.9rem', color: s.muted, marginBottom: '0.5rem', display: 'block' }}>
                        Einstellungen für
                      </label>
                      <select
                        value={printerSettingsForTenant}
                        onChange={(e) => setPrinterSettingsForTenant(e.target.value as TenantId)}
                        style={{
                          padding: '0.75rem',
                          background: s.bgElevated,
                          border: `1px solid ${s.accent}33`,
                          borderRadius: '8px',
                          color: s.text,
                          fontSize: '0.95rem',
                          width: '100%'
                        }}
                      >
                        <option value="k2">K2 Galerie</option>
                        <option value="oeffentlich">ök2 (öffentlich)</option>
                        <option value="demo">Demo</option>
                      </select>
                      <p style={{ fontSize: '0.8rem', color: s.muted, marginTop: '0.5rem', marginBottom: 0 }}>
                        K2, ök2 und Kassabeleg können jeweils eigenen Drucker und Etikettenformat haben.
                      </p>
                    </div>

                    <div className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="field">
                        <label style={{ fontSize: '0.9rem', color: s.muted, marginBottom: '0.5rem', display: 'block' }}>
                          IP-Adresse
                        </label>
                        <input
                          type="text"
                          value={printerSettings.ipAddress}
                          onChange={(e) => {
                            const v = e.target.value
                            setPrinterSettings(prev => ({ ...prev, ipAddress: v }))
                            savePrinterSetting(printerSettingsForTenant, 'ip', v)
                          }}
                          placeholder="192.168.1.102"
                          style={{
                            padding: '0.75rem',
                            background: s.bgElevated,
                            border: `1px solid ${s.accent}33`,
                            borderRadius: '8px',
                            color: s.text,
                            fontSize: '0.95rem',
                            width: '100%'
                          }}
                        />
                        <p style={{ fontSize: '0.8rem', color: s.muted, marginTop: '0.5rem', marginBottom: 0 }}>
                          Aktuelle IP: 192.168.1.102 (auf mobilem Gerät als zweiter Router)
                        </p>
                      </div>

                      <div className="field">
                        <label style={{ fontSize: '0.9rem', color: s.muted, marginBottom: '0.5rem', display: 'block' }}>
                          Drucker-Typ
                        </label>
                        <select
                          value={printerSettings.printerType}
                          onChange={(e) => {
                            const v = e.target.value
                            setPrinterSettings(prev => ({ ...prev, printerType: v as 'etikettendrucker' | 'standarddrucker' }))
                            savePrinterSetting(printerSettingsForTenant, 'type', v)
                          }}
                          style={{
                            padding: '0.75rem',
                            background: s.bgElevated,
                            border: `1px solid ${s.accent}33`,
                            borderRadius: '8px',
                            color: s.text,
                            fontSize: '0.95rem',
                            width: '100%'
                          }}
                        >
                          <option value="etikettendrucker">Etikettendrucker</option>
                          <option value="standarddrucker">Standarddrucker</option>
                        </select>
                      </div>

                      <div className="field">
                        <label style={{ fontSize: '0.9rem', color: s.muted, marginBottom: '0.5rem', display: 'block' }}>
                          Etikettenformat (Brother)
                        </label>
                        <input
                          type="text"
                          value={printerSettings.labelSize}
                          onChange={(e) => {
                            const v = e.target.value
                            setPrinterSettings(prev => ({ ...prev, labelSize: v }))
                            savePrinterSetting(printerSettingsForTenant, 'labelSize', v)
                          }}
                          placeholder="29x90,3"
                          style={{
                            padding: '0.75rem',
                            background: s.bgElevated,
                            border: `1px solid ${s.accent}33`,
                            borderRadius: '8px',
                            color: s.text,
                            fontSize: '0.95rem',
                            width: '100%'
                          }}
                        />
                        <p style={{ fontSize: '0.8rem', color: s.muted, marginTop: '0.5rem', marginBottom: 0 }}>
                          Breite × Höhe in mm (z. B. 29x90,3). Pro Mandant getrennt; Kassabeleg kann anderes Format nutzen.
                        </p>
                      </div>

                      <div className="field">
                        <label style={{ fontSize: '0.9rem', color: s.muted, marginBottom: '0.5rem', display: 'block' }}>
                          Print-Server URL (One-Click-Druck)
                        </label>
                        <input
                          type="text"
                          value={printerSettings.printServerUrl ?? ''}
                          onChange={(e) => {
                            const v = e.target.value.trim()
                            setPrinterSettings(prev => ({ ...prev, printServerUrl: v }))
                            savePrinterSetting(printerSettingsForTenant, 'printServerUrl', v)
                          }}
                          placeholder="Am Mac: http://localhost:3847 — Im mobilen LAN (192.168.1.x): z.B. http://192.168.1.1:3847"
                          style={{
                            padding: '0.75rem',
                            background: s.bgElevated,
                            border: `1px solid ${s.accent}33`,
                            borderRadius: '8px',
                            color: s.text,
                            fontSize: '0.95rem',
                            width: '100%'
                          }}
                        />
                        <p style={{ fontSize: '0.8rem', color: s.muted, marginTop: '0.5rem', marginBottom: 0 }}>
                          Optional. Wenn gesetzt: „One-Click drucken“ im Etikett-Modal. Bei Fehlermeldung: One-Click-Anwendung im Projektordner starten: <code style={{ fontSize: '0.75rem' }}>npm run print-server</code> oder <code style={{ fontSize: '0.75rem' }}>node scripts/k2-print-server.js</code>
                        </p>
                      </div>

                      <div style={{
                        padding: '1rem',
                        background: `${s.accent}12`,
                        border: `1px solid ${s.accent}33`,
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        color: s.muted
                      }}>
                        <strong style={{ color: s.accent }}>ℹ️ Info:</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                          <li>Drucker funktioniert bereits auf IP 192.168.1.102</li>
                          <li>Zweiter Router auf mobilem Gerät installiert</li>
                          <li>Zugriff von Mac, iPad und Handy möglich</li>
                          <li>Einstellungen werden automatisch gespeichert</li>
                          <li><strong>AirPrint aktiv:</strong> Im Druckdialog Brother wählen (Name ggf. „QL-820NWB“ ohne c). Papier: 29×90,3 mm, 100 %.</li>
                        </ul>
                      </div>

                      <details style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: s.bgElevated,
                        border: `1px solid ${s.accent}22`,
                        borderRadius: '12px'
                      }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 600, color: s.accent }}>📖 Druck-Anleitung (AirPrint, iPad, Android, One-Click)</summary>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: s.muted, lineHeight: 1.6 }}>
                          <p style={{ marginTop: 0 }}><strong>Mac:</strong> Brother per IP hinzufügen (Systemeinstellungen → Drucker &amp; Scanner).</p>
                          <p><strong>iPad/iPhone:</strong> 1) Druck über Mac („Für iOS freigeben“) oder 2) Etikett teilen → Brother iPrint &amp; Label App.</p>
                          <p><strong>Android:</strong> Etikett teilen/herunterladen → Brother iPrint &amp; Label App (Play Store).</p>
                          <p><strong>One-Click:</strong> Print-Server starten (<code>npm run print-server</code>), URL hier eintragen.</p>
                          <p style={{ marginBottom: 0 }}>Ausführlich: <code>DRUCKER-AIRPRINT.md</code> im Projektordner.</p>
                        </div>
                      </details>

                      <button
                        onClick={() => {
                          savePrinterSetting(printerSettingsForTenant, 'ip', printerSettings.ipAddress)
                          savePrinterSetting(printerSettingsForTenant, 'type', printerSettings.printerType)
                          savePrinterSetting(printerSettingsForTenant, 'labelSize', printerSettings.labelSize)
                          savePrinterSetting(printerSettingsForTenant, 'printServerUrl', printerSettings.printServerUrl ?? '')
                          alert(`✅ Drucker & Format für ${printerSettingsForTenant === 'k2' ? 'K2' : printerSettingsForTenant === 'oeffentlich' ? 'ök2' : 'Demo'} gespeichert!`)
                        }}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: s.gradientAccent,
                          border: 'none',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          marginTop: '0.5rem'
                        }}
                      >
                        💾 Einstellungen speichern
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Statistiken – jetzt in Kasse-Tab integriert, alter Block deaktiviert */}
        {false && (() => {
          // Echte Statistiken berechnen
          const totalArtworks = allArtworks.length
          const inGalerie = allArtworks.filter((a: any) => a.inExhibition === true).length
          const inShop = allArtworks.filter((a: any) => a.inShop === true).length
          
          // Verkaufte Werke
          let soldCount = 0
          let soldTotal = 0
          try {
            const soldData = localStorage.getItem('k2-sold-artworks')
            if (soldData) {
              const soldArtworks = JSON.parse(soldData as string) as any[]
              soldCount = soldArtworks.length
              // Berechne Gesamtwert der verkauften Werke
              const soldNumbers = new Set<string>(soldArtworks.map((a: any) => a.number).filter((n: unknown): n is string => n != null && n !== ''))
              const soldItems = allArtworks.filter((a: any) => { const n = a.number; if (n == null) return false; return soldNumbers.has(String(n)) })
              soldTotal = soldItems.reduce((sum: number, a: any) => sum + (a.price || 0), 0)
            }
          } catch (error) {
            // Ignoriere Fehler
          }

          // Verkäufe aus Orders
          let ordersCount = 0
          let ordersTotal = 0
          try {
            const ordersData = localStorage.getItem('k2-orders')
            if (ordersData) {
              const orders = JSON.parse(ordersData as string) as any[]
              ordersCount = orders.length
              ordersTotal = orders.reduce((sum: number, o: any) => sum + (Number(o?.total) || 0), 0)
            }
          } catch (error) {
            // Ignoriere Fehler
          }

          // Kategorien (max 5)
          const categoryCounts = ARTWORK_CATEGORIES.map((c) => ({ id: c.id, label: c.label, count: allArtworks.filter((a: any) => a.category === c.id).length }))

          return (
            <section className="admin-section">
              <h2>Statistiken</h2>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🎨</div>
                  <div className="stat-value">{totalArtworks}</div>
                  <div className="stat-label">Werke insgesamt</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏛️</div>
                  <div className="stat-value">{inGalerie}</div>
                  <div className="stat-label">In Galerie</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🛒</div>
                  <div className="stat-value">{inShop}</div>
                  <div className="stat-label">Im Shop</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-value">{soldCount}</div>
                  <div className="stat-label">Verkaufte Werke</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💵</div>
                  <div className="stat-value">€{ordersTotal.toFixed(2)}</div>
                  <div className="stat-label">Umsatz gesamt</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-value">{ordersCount}</div>
                  <div className="stat-label">Bestellungen</div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Kategorien */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginTop: 0, color: '#8b6914' }}>Kategorien</h3>
                  <div style={{ marginTop: '1rem' }}>
                    {categoryCounts.map(({ id, label, count }) => (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>{label}:</span>
                        <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verkäufe */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginTop: 0, color: '#8b6914' }}>Verkäufe</h3>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Verkaufte Werke:</span>
                      <strong>{soldCount}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Gesamtwert:</span>
                      <strong style={{ color: '#2d6a2d' }}>€{soldTotal.toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Bestellungen:</span>
                      <strong>{ordersCount}</strong>
                    </div>
                  </div>
                </div>
              </div>
              {/* Verkaufshistorie */}
              <div style={{ marginTop: '2rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0, color: '#8b6914' }}>Letzte Verkäufe</h3>
                <div style={{ marginTop: '1rem' }}>
                  {(() => {
                    try {
                    const ordersData = localStorage.getItem('k2-orders')
                    if (ordersData) {
                        const orders = JSON.parse(ordersData as string) as any[]
                        const recentOrders = orders.slice().reverse().slice(0, 10)
                        
                        if (recentOrders.length === 0) {
                          return <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>Noch keine Verkäufe</p>
                        }
                        
                        return (
                          <div>
                            {recentOrders.map((order: any, index: number) => (
                              <div key={index} style={{ 
                                padding: '1rem', 
                                background: '#f5f5f5', 
                                borderRadius: '8px', 
                                marginBottom: '0.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div>
                                  <strong>{order.orderNumber}</strong>
                                  <br />
                                  <small style={{ color: '#666' }}>
                                    {new Date(order.date).toLocaleDateString('de-DE', { 
                                      day: '2-digit', 
                                      month: '2-digit', 
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })} • {order.items.length} {order.items.length === 1 ? 'Werk' : 'Werke'}
                                  </small>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <strong style={{ color: '#2d6a2d' }}>€{(Number(order?.total) || 0).toFixed(2)}</strong>
                                  <br />
                                  <small style={{ color: '#666' }}>
                                    {order.paymentMethod === 'cash' ? '💵 Bar' : order.paymentMethod === 'card' ? '💳 Karte' : '🏦 Überweisung'}
                                  </small>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      }
                    } catch (error) {
                      // Ignoriere Fehler
                    }
                    return <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>Noch keine Verkäufe</p>
                  })()}
                </div>
              </div>
            </section>
          )
        })()}

        {/* Marketing (Eventplanung + Außenkommunikation): Events | Dokumente | Öffentlichkeitsarbeit | Flyer etc. */}
        {activeTab === 'eventplan' && (
          <section style={{
            background: s.bgCard,
            border: `1px solid ${s.accent}22`,
            borderRadius: '24px',
            padding: 'clamp(2rem, 5vw, 3rem)',
            boxShadow: s.shadow,
            marginBottom: 'clamp(2rem, 5vw, 3rem)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: '700',
              color: s.text,
              marginBottom: '0.5rem',
              letterSpacing: '-0.01em'
            }}>
              📢 Öffentlichkeitsarbeit & Eventplanung
            </h2>
            <p style={{ color: s.muted, marginBottom: '1.5rem', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
              Außenkommunikation: Eventplanung, Events, Flyer & Werbedokumente. Dokumente sind den Events zugeordnet (je Rubrik).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button type="button" onClick={() => setEventplanSubTab('events')} style={{ textAlign: 'left', cursor: 'pointer', background: eventplanSubTab === 'events' ? `${s.accent}18` : s.bgElevated, border: `2px solid ${eventplanSubTab === 'events' ? s.accent : s.accent + '22'}`, borderRadius: '12px', padding: '1rem 1.25rem', transition: 'all 0.2s', fontFamily: 'inherit' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.accent }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = eventplanSubTab === 'events' ? s.accent : `${s.accent}22` }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>📅</div>
                <div style={{ fontWeight: 700, color: s.text, fontSize: '0.95rem' }}>Veranstaltungen</div>
                <div style={{ fontSize: '0.78rem', color: s.muted, marginTop: '0.2rem' }}>Events anlegen, bearbeiten, Termine verwalten</div>
              </button>
              <button type="button" onClick={() => setEventplanSubTab('öffentlichkeitsarbeit')} style={{ textAlign: 'left', cursor: 'pointer', background: eventplanSubTab === 'öffentlichkeitsarbeit' ? `${s.accent}18` : s.bgElevated, border: `2px solid ${eventplanSubTab === 'öffentlichkeitsarbeit' ? s.accent : s.accent + '22'}`, borderRadius: '12px', padding: '1rem 1.25rem', transition: 'all 0.2s', fontFamily: 'inherit' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.accent }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = eventplanSubTab === 'öffentlichkeitsarbeit' ? s.accent : `${s.accent}22` }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>📢</div>
                <div style={{ fontWeight: 700, color: s.text, fontSize: '0.95rem' }}>Flyer & Werbematerial</div>
                <div style={{ fontSize: '0.78rem', color: s.muted, marginTop: '0.2rem' }}>Einladungen, Flyer, Presse, Social Media – ansehen & drucken</div>
              </button>
            </div>
            {eventplanSubTab === 'events' && (
            <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <button
                onClick={openEventModal}
                style={{
                  padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                  background: s.gradientAccent,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: s.shadow
                }}
              >
                + Event hinzufügen
              </button>
            </div>

            {/* Events Liste */}
            {events.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(3rem, 8vw, 5rem)',
                color: s.muted
              }}>
                <div style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', marginBottom: '1rem' }}>📅</div>
                <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', margin: 0, color: s.text }}>
                  Noch keine Events vorhanden
                </p>
                <p style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', marginTop: '0.5rem', color: s.muted }}>
                  {isOeffentlichAdminContext() ? 'Klicke auf „Event hinzufügen“.' : 'Klicke auf „Event hinzufügen“ oder stelle das Eröffnungsevent 24.–26. April wieder her.'}
                </p>
                {!isOeffentlichAdminContext() && (
                <button
                  type="button"
                  onClick={handleCreateEröffnungsevent}
                  style={{
                    marginTop: '1.5rem',
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
                    background: s.gradientAccent,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: s.shadow
                  }}
                >
                  🎉 Eröffnung 24.–26. April wiederherstellen
                </button>
                )}
              </div>
            ) : (
              (() => {
                const todayStart = new Date()
                todayStart.setHours(0, 0, 0, 0)
                const getEventEnd = (e: any) => {
                  const d = e.endDate ? new Date(e.endDate) : new Date(e.date)
                  d.setHours(23, 59, 59, 999)
                  return d
                }
                const upcomingEvents = events.filter((e: any) => getEventEnd(e) >= todayStart)
                const pastEvents = events.filter((e: any) => getEventEnd(e) < todayStart)
                const eventIcons: Record<string, string> = {
                  galerieeröffnung: '🎉',
                  vernissage: '🍷',
                  finissage: '👋',
                  öffentlichkeitsarbeit: '📢',
                  sonstiges: '📌'
                }
                const eventLabels: Record<string, string> = {
                  galerieeröffnung: 'Galerieeröffnung',
                  vernissage: 'Vernissage',
                  finissage: 'Finissage',
                  öffentlichkeitsarbeit: 'Öffentlichkeitsarbeit',
                  sonstiges: 'Sonstiges'
                }
                const renderEventCard = (event: any) => (
                  <div
                    key={event.id}
                    style={{
                      background: s.bgElevated,
                      border: `1px solid ${s.accent}22`,
                      borderRadius: '16px',
                      padding: 'clamp(1rem, 3vw, 1.5rem)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <div style={{
                          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                          marginBottom: '0.5rem'
                        }}>
                          {eventIcons[event.type] || '📌'}
                        </div>
                        <h3 style={{
                          fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                          fontWeight: '600',
                          color: s.text,
                          margin: '0 0 0.5rem 0'
                        }}>
                          {event.title}
                        </h3>
                        <div style={{
                          fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                          color: s.accent,
                          background: `${s.accent}20`,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          display: 'inline-block',
                          marginBottom: '0.5rem'
                        }}>
                          {eventLabels[event.type] || event.type}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      color: s.muted,
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{ marginBottom: '0.25rem' }}>
                        <strong>📅 Datum:</strong> {
                          event.endDate && event.endDate !== event.date
                            ? `${new Date(event.date).toLocaleDateString('de-DE', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })} - ${new Date(event.endDate).toLocaleDateString('de-DE', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}`
                            : new Date(event.date).toLocaleDateString('de-DE', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                        }
                      </div>
                      {(event.startTime || event.endTime || event.time || (event.dailyTimes && Object.keys(event.dailyTimes).length > 0)) && (
                        <div style={{ marginBottom: '0.25rem' }}>
                          <strong>🕐 Uhrzeit:</strong> {
                            (() => {
                              const startTime = event.startTime || event.time || ''
                              const endTime = event.endTime || ''
                              const isMultiDay = event.endDate && event.endDate !== event.date
                              const hasDailyTimes = event.dailyTimes && Object.keys(event.dailyTimes).length > 0
                              if (hasDailyTimes && isMultiDay) {
                                const days = getEventDays(event.date, event.endDate)
                                return (
                                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {days.map((day: string) => {
                                      const dayTime = event.dailyTimes[day]
                                      if (!dayTime) return null
                                      const dayLabel = new Date(day).toLocaleDateString('de-DE', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short'
                                      })
                                      let timeDisplay = ''
                                      if (typeof dayTime === 'string') {
                                        timeDisplay = dayTime
                                      } else if (dayTime && typeof dayTime === 'object' && 'start' in dayTime && 'end' in dayTime) {
                                        timeDisplay = `${(dayTime as any).start || ''} - ${(dayTime as any).end || ''}`
                                      }
                                      return <div key={day}>{dayLabel}: {timeDisplay}</div>
                                    })}
                                  </div>
                                )
                              }
                              if (isMultiDay) {
                                return startTime && endTime
                                  ? `${startTime} Uhr (${new Date(event.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}) - ${endTime} Uhr (${new Date(event.endDate).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })})`
                                  : startTime
                                  ? `${startTime} Uhr (${new Date(event.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })})`
                                  : ''
                              }
                              return startTime && endTime ? `${startTime} - ${endTime} Uhr` : startTime ? `${startTime} Uhr` : ''
                            })()
                          }
                        </div>
                      )}
                      {event.location && (
                        <div style={{ marginBottom: '0.25rem' }}>
                          <strong>📍 Ort:</strong> {event.location}
                        </div>
                      )}
                      {event.description && (
                        <div style={{ marginTop: '0.75rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                          {event.description}
                        </div>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <button
                        onClick={() => handleEditEvent(event)}
                        style={{
                          flex: 1,
                          minWidth: '120px',
                          padding: '0.75rem',
                          background: 'rgba(102, 126, 234, 0.2)',
                          border: '1px solid rgba(102, 126, 234, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                          fontWeight: '500'
                        }}
                      >
                        ✏️ Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        style={{
                          flex: 1,
                          minWidth: '120px',
                          padding: '0.75rem',
                          background: 'rgba(255, 100, 100, 0.2)',
                          border: '1px solid rgba(255, 100, 100, 0.3)',
                          borderRadius: '8px',
                          color: '#ff6464',
                          cursor: 'pointer',
                          fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                          fontWeight: '500'
                        }}
                      >
                        🗑️ Löschen
                      </button>
                    </div>
                  </div>
                )
                return (
                  <>
                    {upcomingEvents.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', fontWeight: '600', color: s.text, marginBottom: '1rem' }}>
                          📅 Aktuelle und geplante Veranstaltungen
                        </h3>
                        <div style={{
                          display: 'grid',
                          gap: 'clamp(1rem, 3vw, 1.5rem)',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
                        }}>
                          {upcomingEvents.map((event: any) => renderEventCard(event))}
                        </div>
                      </div>
                    )}
                    <div style={{ marginTop: pastEvents.length > 0 || upcomingEvents.length > 0 ? '1.5rem' : '0', borderTop: pastEvents.length > 0 || upcomingEvents.length > 0 ? `1px solid ${s.accent}22` : 'none' }}>
                      <button
                        type="button"
                        onClick={() => setPastEventsExpanded((v) => !v)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          padding: '0.65rem 1rem',
                          marginTop: '0.75rem',
                          background: `${s.accent}12`,
                          border: `1px solid ${s.accent}33`,
                          borderRadius: '10px',
                          color: s.text,
                          fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <span>📁 Veranstaltungen der Vergangenheit{pastEvents.length > 0 ? ` (${pastEvents.length})` : ''}</span>
                        <span style={{ color: s.muted, fontSize: '1.1rem' }}>{pastEventsExpanded ? '▼' : '▶'}</span>
                      </button>
                      {pastEventsExpanded && (
                        <div style={{ paddingTop: '1rem', paddingBottom: '0.5rem' }}>
                          <p style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: s.muted, marginBottom: '1rem', lineHeight: 1.5 }}>
                            Events mit Datum in der Vergangenheit – Bearbeiten, Löschen oder unter „Flyer & Werbedokumente“ die Dokumente ansehen.
                          </p>
                          {pastEvents.length > 0 ? (
                            <div style={{
                              display: 'grid',
                              gap: 'clamp(1rem, 3vw, 1.5rem)',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
                            }}>
                              {pastEvents.map((event: any) => renderEventCard(event))}
                            </div>
                          ) : (
                            <div style={{
                              padding: '1.25rem 1.5rem',
                              background: `${s.accent}0c`,
                              border: `1px dashed ${s.accent}44`,
                              borderRadius: '12px',
                              color: s.muted,
                              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                              lineHeight: 1.5
                            }}>
                              <p style={{ margin: '0 0 1rem 0' }}>
                                Noch keine vergangenen Veranstaltungen. Sobald ein Event vorbei ist, erscheint es hier.
                              </p>
                              {!isOeffentlichAdminContext() && (
                                <button
                                  type="button"
                                  onClick={handleCreateAteliersbesichtigungPaulWeber}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: `${s.accent}22`,
                                    border: `1px solid ${s.accent}66`,
                                    borderRadius: '8px',
                                    color: s.accent,
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'
                                  }}
                                >
                                  📁 Beispiel anlegen: Ateliersbesichtigung bei Paul Weber (vor 1 Woche, mit Einladung und Presse)
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )
              })()
            )}
            </>
            )}
          </section>
        )}

        {/* Event Modal */}
        {showEventModal && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEventModal(false)
                setEditingEvent(null)
                setEventTitle('')
                setEventType('galerieeröffnung')
                setEventDate('')
                setEventEndDate('')
                setEventStartTime('')
                setEventEndTime('')
                setEventDailyTimes({})
                setEventDescription('')
                setEventLocation('')
              }
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderRadius: '24px',
                padding: 'clamp(2rem, 5vw, 3rem)',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginTop: 0,
                  marginBottom: 0
                }}>
                  {editingEvent ? 'Event-Stammblatt: bearbeiten' : 'Event-Stammblatt: neues Event'}
                </h2>
                <button
                  onClick={() => {
                    setShowEventModal(false)
                    setEditingEvent(null)
                    setEventTitle('')
                    setEventType('galerieeröffnung')
                    setEventDate('')
                    setEventEndDate('')
                    setEventStartTime('')
                    setEventEndTime('')
                    setEventDailyTimes({})
                    setEventDescription('')
                    setEventLocation('')
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    lineHeight: 1,
                    opacity: 0.7,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                  ×
                </button>
              </div>
              {!editingEvent && (
                <p style={{
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  color: '#8fa0c9',
                  marginBottom: 'clamp(1rem, 2.5vw, 1.25rem)',
                  lineHeight: 1.5,
                  padding: '0.75rem 1rem',
                  background: 'rgba(95, 251, 241, 0.08)',
                  border: '1px solid rgba(95, 251, 241, 0.2)',
                  borderRadius: '12px'
                }}>
                  💡 <strong>Eckdaten eingeben</strong> – nach dem Speichern erscheint unter <strong>Öffentlichkeitsarbeit</strong> automatisch eine neue Rubrik mit fertigen Werbe-Werkzeugen (Newsletter, Presse, Social Media, PDF).
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="z.B. Eröffnung der K2 Galerie"
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Event-Typ
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  >
                    <option value="galerieeröffnung">🎉 Galerieeröffnung</option>
                    <option value="vernissage">🍷 Vernissage</option>
                    <option value="finissage">👋 Finissage</option>
                    <option value="öffentlichkeitsarbeit">📢 Öffentlichkeitsarbeit</option>
                    <option value="sonstiges">📌 Sonstiges</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#8fa0c9',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      Startdatum *
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#8fa0c9',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      Enddatum (bei mehrtägigem Event)
                    </label>
                    <input
                      type="date"
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                      min={eventDate}
                      style={{
                        width: '100%',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#8fa0c9',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      Startzeit
                    </label>
                    <input
                      type="time"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: '#8fa0c9',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      Endzeit
                    </label>
                    <input
                      type="time"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                      }}
                    />
                  </div>
                </div>

                {/* Anfangs- und Endzeiten pro Tag – Event kann mehrere Tage haben, jeder Tag eigene Zeiten */}
                {eventDate && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(95, 251, 241, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(95, 251, 241, 0.2)'
                  }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.75rem',
                      color: '#5ffbf1',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '600'
                    }}>
                      🕐 Anfangs- und Endzeiten pro Tag (jeder Tag kann unterschiedliche Zeiten haben)
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {getEventDays(eventDate, eventEndDate || eventDate).map((day) => {
                        const dayLabel = new Date(day).toLocaleDateString('de-DE', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })
                        return (
                          <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{
                                minWidth: '100px',
                                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                                color: '#b8c5e0',
                                fontWeight: '500'
                              }}>
                                {dayLabel}:
                              </span>
                              <div style={{ display: 'flex', gap: '0.5rem', flex: 1, alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{
                                    display: 'block',
                                    fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
                                    color: '#8fa0c9',
                                    marginBottom: '0.25rem'
                                  }}>
                                    Start
                                  </label>
                                  <input
                                    type="time"
                                    value={typeof eventDailyTimes[day] === 'string' ? eventDailyTimes[day] : (eventDailyTimes[day]?.start || '')}
                                    onChange={(e) => {
                                      const current = eventDailyTimes[day]
                                      const newValue = typeof current === 'string' 
                                        ? { start: e.target.value, end: '' }
                                        : { ...current, start: e.target.value }
                                      setEventDailyTimes({
                                        ...eventDailyTimes,
                                        [day]: newValue
                                      })
                                    }}
                                    placeholder="Start"
                                    style={{
                                      width: '100%',
                                      padding: 'clamp(0.6rem, 2vw, 0.75rem)',
                                      background: 'rgba(255, 255, 255, 0.1)',
                                      border: '1px solid rgba(255, 255, 255, 0.2)',
                                      borderRadius: '8px',
                                      color: '#ffffff',
                                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                                    }}
                                  />
                                </div>
                                <span style={{ 
                                  color: '#8fa0c9', 
                                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                                  marginTop: '1.5rem'
                                }}>
                                  bis
                                </span>
                                <div style={{ flex: 1 }}>
                                  <label style={{
                                    display: 'block',
                                    fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
                                    color: '#8fa0c9',
                                    marginBottom: '0.25rem'
                                  }}>
                                    Ende
                                  </label>
                                  <input
                                    type="time"
                                    value={typeof eventDailyTimes[day] === 'string' ? '' : (eventDailyTimes[day]?.end || '')}
                                    onChange={(e) => {
                                      const current = eventDailyTimes[day]
                                      const newValue = typeof current === 'string'
                                        ? { start: current, end: e.target.value }
                                        : { ...current, end: e.target.value }
                                      setEventDailyTimes({
                                        ...eventDailyTimes,
                                        [day]: newValue
                                      })
                                    }}
                                    placeholder="Ende"
                                    style={{
                                      width: '100%',
                                      padding: 'clamp(0.6rem, 2vw, 0.75rem)',
                                      background: 'rgba(255, 255, 255, 0.1)',
                                      border: '1px solid rgba(255, 255, 255, 0.2)',
                                      borderRadius: '8px',
                                      color: '#ffffff',
                                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                                    }}
                                  />
                                </div>
                                {(eventDailyTimes[day] && (typeof eventDailyTimes[day] === 'string' || eventDailyTimes[day].start || eventDailyTimes[day].end)) && (
                                  <button
                                    onClick={() => {
                                      const newDailyTimes = { ...eventDailyTimes }
                                      delete newDailyTimes[day]
                                      setEventDailyTimes(newDailyTimes)
                                    }}
                                    style={{
                                      padding: '0.4rem 0.6rem',
                                      background: 'rgba(255, 100, 100, 0.2)',
                                      border: '1px solid rgba(255, 100, 100, 0.3)',
                                      borderRadius: '6px',
                                      color: '#ff6464',
                                      cursor: 'pointer',
                                      fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                                      marginTop: '1.5rem',
                                      height: 'fit-content'
                                    }}
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <button
                      onClick={async () => {
                        if (editingEvent) {
                          // Aktualisiere das Event direkt mit den neuen täglichen Zeiten
                          const updatedEvents = events.map(e => 
                            e.id === editingEvent.id 
                              ? { ...e, dailyTimes: eventDailyTimes }
                              : e
                          )
                          setEvents(updatedEvents)
                          saveEvents(updatedEvents)
                          
                          // Erstelle ein Dokument mit den täglichen Zeiten
                          const days = getEventDays(eventDate, eventEndDate || eventDate)
                          const timesContent = days
                            .filter(day => eventDailyTimes[day] && (typeof eventDailyTimes[day] === 'string' || eventDailyTimes[day].start || eventDailyTimes[day].end))
                            .map(day => {
                              const dayLabel = new Date(day).toLocaleDateString('de-DE', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })
                              const dayTime = eventDailyTimes[day]
                              let timeDisplay = ''
                              if (typeof dayTime === 'string') {
                                timeDisplay = `${dayTime} Uhr`
                              } else if (dayTime.start || dayTime.end) {
                                timeDisplay = dayTime.start 
                                  ? (dayTime.end ? `${dayTime.start} - ${dayTime.end} Uhr` : `${dayTime.start} Uhr`)
                                  : (dayTime.end ? `bis ${dayTime.end} Uhr` : '')
                              }
                              return `<p><strong>${dayLabel}:</strong> ${timeDisplay}</p>`
                            })
                            .join('')
                          
                          if (timesContent) {
                            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Tägliche Zeiten - ${editingEvent.title}</title>
  <style>
    @media print {
      body { margin: 0; background: white !important; }
      .no-print { display: none; }
      .page { background: white !important; color: #1a1f3a !important; border: none !important; box-shadow: none !important; }
      h1 { color: #667eea !important; border-bottom-color: #667eea !important; }
      p { color: #333 !important; }
      strong { color: #667eea !important; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #03040a 0%, #0d1426 55%, #111c33 100%);
      color: #f4f7ff;
      padding: 2rem;
      min-height: 100vh;
    }
    .page {
      max-width: 210mm;
      margin: 0 auto;
      padding: 2rem;
      background: linear-gradient(145deg, rgba(18, 22, 35, 0.95), rgba(12, 16, 28, 0.92));
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
      border: 1px solid rgba(95, 251, 241, 0.12);
      border-radius: 24px;
    }
    h1 {
      font-size: 2rem;
      color: #5ffbf1;
      margin-bottom: 1rem;
      border-bottom: 2px solid rgba(95, 251, 241, 0.3);
      padding-bottom: 0.5rem;
      letter-spacing: 0.02em;
    }
    h2 {
      font-size: 1.3rem;
      color: #5ffbf1;
      margin: 1.5rem 0 1rem;
    }
    p {
      color: #b8c5e0;
      line-height: 1.8;
      margin: 0.75rem 0;
      font-size: 1.1rem;
    }
    strong {
      color: #5ffbf1;
    }
    .no-print {
      text-align: center;
      margin-bottom: 2rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(95, 251, 241, 0.2);
      border-radius: 12px;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin: 0 0.5rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">🖨️ Als PDF drucken</button>
  </div>
  <div class="page">
    <h1>🕐 Tägliche Zeiten</h1>
    <h2>${editingEvent.title}</h2>
    <p style="color: #8fa0c9; margin-bottom: 1.5rem;">
      ${new Date(editingEvent.date).toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}${editingEvent.endDate && editingEvent.endDate !== editingEvent.date ? ` - ${new Date(editingEvent.endDate).toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}` : ''}
    </p>
    ${timesContent}
  </div>
</body>
</html>
                            `
                            
                            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              const documentData = {
                                id: `daily-times-${editingEvent.id}-${Date.now()}`,
                                name: `Tägliche Zeiten - ${editingEvent.title}`,
                                type: 'sonstiges' as const,
                                fileData: reader.result as string,
                                fileName: `tägliche-zeiten-${editingEvent.title.replace(/\s+/g, '-').toLowerCase()}.html`,
                                fileType: 'text/html',
                                addedAt: new Date().toISOString()
                              }
                              
                              const finalEvents = updatedEvents.map(event => {
                                if (event.id === editingEvent.id) {
                                  // Entferne alte "Tägliche Zeiten" Dokumente und füge neues hinzu
                                  const filteredDocs = (event.documents || []).filter((doc: any) => 
                                    !doc.name || !doc.name.includes('Tägliche Zeiten')
                                  )
                                  return {
                                    ...event,
                                    documents: [...filteredDocs, documentData]
                                  }
                                }
                                return event
                              })
                              
                              setEvents(finalEvents)
                              saveEvents(finalEvents)
                              alert('✅ Tägliche Zeiten gespeichert und als Dokument hinzugefügt!')
                            }
                            reader.readAsDataURL(blob)
                          } else {
                            alert('✅ Tägliche Zeiten gespeichert!')
                          }
                        }
                      }}
                      disabled={!editingEvent}
                      style={{
                        marginTop: '1rem',
                        padding: 'clamp(0.75rem, 2vw, 1rem)',
                        background: editingEvent 
                          ? 'linear-gradient(135deg, rgba(95, 251, 241, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: editingEvent
                          ? '1px solid rgba(95, 251, 241, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: editingEvent ? '#5ffbf1' : '#8fa0c9',
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                        fontWeight: '600',
                        cursor: editingEvent ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => {
                        if (editingEvent) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(95, 251, 241, 0.3) 0%, rgba(102, 126, 234, 0.3) 100%)'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (editingEvent) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(95, 251, 241, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      💾 Tägliche Zeiten speichern
                    </button>
                  </div>
                )}

                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <label style={{
                      color: '#8fa0c9',
                      fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                      fontWeight: '500'
                    }}>
                      Ort
                    </label>
                    <button
                      type="button"
                      onClick={applyStammdatenToEvent}
                      style={{
                        padding: '0.4rem 0.75rem',
                        background: 'rgba(95, 251, 241, 0.2)',
                        border: '1px solid rgba(95, 251, 241, 0.3)',
                        borderRadius: '6px',
                        color: '#5ffbf1',
                        cursor: 'pointer',
                        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                        fontWeight: '500'
                      }}
                    >
                      📋 Aus Stammdaten übernehmen
                    </button>
                  </div>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder={fullAddressFromStammdaten || "z.B. Hauptstraße 12, 1010 Wien, Österreich"}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  />
                  {fullAddressFromStammdaten && (
                    <div style={{
                      marginTop: '0.25rem',
                      fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                      color: '#8fa0c9',
                      fontStyle: 'italic'
                    }}>
                      Stammdaten: {fullAddressFromStammdaten}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Beschreibung
                  </label>
                  <textarea
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Weitere Details zum Event..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  <button
                    onClick={handleSaveEvent}
                    style={{
                      flex: 1,
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    {editingEvent ? '✅ Aktualisieren' : '✅ Hinzufügen'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEventModal(false)
                      setEditingEvent(null)
                      setEventTitle('')
                      setEventType('galerieeröffnung')
                      setEventDate('')
                      setEventEndDate('')
                      setEventStartTime('')
                      setEventEndTime('')
                      setEventDailyTimes({})
                      setEventDescription('')
                      setEventLocation('')
                    }}
                    style={{
                      flex: 1,
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dokumente Modal */}
        {showDocumentModal && selectedEventForDocument && (
          <div
            onClick={() => {
              setShowDocumentModal(false)
              setSelectedEventForDocument(null)
              setEventDocumentFile(null)
              setEventDocumentName('')
              setEventDocumentType('flyer')
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              zIndex: 10001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderRadius: '24px',
                padding: 'clamp(2rem, 5vw, 3rem)',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            >
              <h2 style={{
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: '700',
                color: '#ffffff',
                marginTop: 0,
                marginBottom: 'clamp(1.5rem, 4vw, 2rem)'
              }}>
                📎 Dokument hinzufügen
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Dokument-Name *
                  </label>
                  <input
                    type="text"
                    value={eventDocumentName}
                    onChange={(e) => setEventDocumentName(e.target.value)}
                    placeholder="z.B. Flyer Eröffnung"
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Dokument-Typ
                  </label>
                  <select
                    value={eventDocumentType}
                    onChange={(e) => setEventDocumentType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  >
                    <option value="flyer">📄 Flyer</option>
                    <option value="plakat">🖼️ Plakat</option>
                    <option value="presseaussendung">📰 Presseaussendung</option>
                    <option value="sonstiges">📎 Sonstiges</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#8fa0c9',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    fontWeight: '500'
                  }}>
                    Datei auswählen *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setEventDocumentFile(file)
                        if (!eventDocumentName) {
                          setEventDocumentName(file.name.replace(/\.[^/.]+$/, ''))
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                    }}
                  />
                  {eventDocumentFile && (
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                      color: '#5ffbf1'
                    }}>
                      ✓ {eventDocumentFile.name} ({(eventDocumentFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  <button
                    onClick={handleAddEventDocument}
                    style={{
                      flex: 1,
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    ✅ Hinzufügen
                  </button>
                  <button
                    onClick={() => {
                      setShowDocumentModal(false)
                      setSelectedEventForDocument(null)
                      setEventDocumentFile(null)
                      setEventDocumentName('')
                      setEventDocumentType('flyer')
                    }}
                    style={{
                      flex: 1,
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Eventplanung: Öffentlichkeitsarbeit (Marketingabteilung) */}
        {activeTab === 'eventplan' && eventplanSubTab === 'öffentlichkeitsarbeit' && (
          <section style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: 'clamp(2rem, 5vw, 3rem)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: '700',
              color: s.text,
              marginTop: 0,
              marginBottom: '0.75rem',
              letterSpacing: '-0.01em'
            }}>
              📢 Hier sind deine Flyer und Werbedokumente – ansehen, bearbeiten …
            </h2>
            <p style={{
              fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
              color: s.muted,
              marginBottom: '0.75rem',
              lineHeight: 1.55
            }}>
              <strong style={{ color: s.text }}>So geht’s:</strong> Event in der Eventplanung anlegen (Eckdaten) → hier erscheint automatisch eine Rubrik mit allen Werbe-Werkzeugen.
            </p>
            <p style={{
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              color: s.muted,
              marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
              lineHeight: 1.5
            }}>
              Pro Rubrik: Druckversionen (Flyer, Presse-Einladung), eigene Dokumente, PR-Vorschläge (Newsletter, Plakat, Presse, Social Media) – aus deinen Stammdaten erzeugt, direkt nutzbar oder als PDF.
            </p>

            {/* Alle Events: zuerst aktuell/geplant, dann Ordner „Veranstaltungen der Vergangenheit“ (Dokumente als Muster) */}
            {(() => {
              void prSuggestionsRefresh // Re-Render auslösen nach PR-Vorschläge generieren
              const suggestions = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
              const todayStart = new Date()
              todayStart.setHours(0, 0, 0, 0)
              const getEventEnd = (e: any) => {
                const d = e.endDate ? new Date(e.endDate) : new Date(e.date)
                d.setHours(23, 59, 59, 999)
                return d
              }
              const eventsSorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              const upcomingEvents = eventsSorted.filter((e: any) => getEventEnd(e) >= todayStart)
              const pastEvents = eventsSorted.filter((e: any) => getEventEnd(e) < todayStart)

              if (eventsSorted.length > 0) {
                return (
                  <div style={{
                    marginBottom: 'clamp(2rem, 5vw, 3rem)'
                  }}>
                    {/* Aktuelle und geplante Veranstaltungen */}
                    {upcomingEvents.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', fontWeight: '600', color: s.text, marginBottom: '1rem' }}>
                          📅 Aktuelle und geplante Veranstaltungen
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {upcomingEvents.map((event: any) => {
                        const suggestion = suggestions.find((s: any) => s.eventId === event.id)
                        const k2FlyerDoc = event.type === 'galerieeröffnung' ? { id: 'k2-galerie-flyer', name: 'K2 Galerie Flyer (Druckversion)', documentUrl: '/flyer-k2-galerie' } : null
                        const k2PresseDoc = event.type === 'galerieeröffnung' ? { id: 'k2-galerie-presse', name: 'Presse-Einladung (Druckversion)', documentUrl: '/presse-einladung-k2-galerie' } : null
                        const hiddenIds = event.hiddenDocIds || []
                        const docList = [k2FlyerDoc, k2PresseDoc, ...(event.documents || [])].filter(Boolean).filter((d: any) => !hiddenIds.includes(d.id))
                        const prDocsForEvent = (documents || []).filter((d: any) => d.category === 'pr-dokumente' && d.eventId === event.id)
                        const WERBEMATERIAL_TYPEN = ['qr-plakat', 'newsletter', 'plakat', 'event-flyer', 'presse', 'social'] as const
                        const byTyp: Record<string, any[]> = {}
                        WERBEMATERIAL_TYPEN.forEach(t => { byTyp[t] = [] })
                        prDocsForEvent.forEach((d: any) => { if (d.werbematerialTyp && byTyp[d.werbematerialTyp]) byTyp[d.werbematerialTyp].push(d) })
                        const listItemStyle = {
                          padding: '0.5rem 0.75rem',
                          background: s.bgElevated,
                          border: `1px solid ${s.accent}22`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' as const,
                          color: s.text,
                          transition: 'background 0.2s, color 0.2s'
                        }
                        return (
                        <div
                          key={event.id}
                          style={{
                            background: `${s.accent}0c`,
                            border: `1px solid ${s.accent}33`,
                            borderRadius: '16px',
                            padding: 'clamp(1.25rem, 3vw, 1.5rem)',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Rubrik = dieses Event/Projekt – Überschrift mit zugehörigen Dokumenten */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.75rem',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            paddingBottom: '0.75rem',
                            borderBottom: `1px solid ${s.accent}22`
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)', color: s.accent, fontWeight: '600', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                Werbematerial – Dokumente
                              </div>
                              <h3 style={{ fontSize: 'clamp(1.1rem, 2.8vw, 1.35rem)', fontWeight: '600', color: s.text, margin: '0 0 0.4rem 0' }}>
                                {event.title}
                              </h3>
                              <div style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', color: s.muted, display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <span>📅 {new Date(event.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                {event.location && <span>📍 {event.location}</span>}
                                {event.type && <span>🏷️ {event.type === 'galerieeröffnung' ? 'Galerieeröffnung' : event.type === 'vernissage' ? 'Vernissage' : event.type === 'finissage' ? 'Finissage' : event.type === 'öffentlichkeitsarbeit' ? 'Öffentlichkeitsarbeit' : 'Sonstiges'}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => { handleEditEvent(event); setActiveTab('eventplan') }}
                              style={{
                                padding: '0.35rem 0.65rem',
                                background: `${s.accent}20`,
                                border: `1px solid ${s.accent}55`,
                                borderRadius: '6px',
                                color: s.accent,
                                cursor: 'pointer',
                                fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
                                fontWeight: '500',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              ✏️ Event bearbeiten
                            </button>
                          </div>

                          {/* ═══ KÜNSTLER-FREUNDLICHE DOKUMENT-ÜBERSICHT ═══ */}
                          {(() => {
                            // Alle Dokument-Karten definieren
                            const DOKUMENT_KARTEN = [
                              {
                                typ: 'druckversion' as const,
                                icon: '🖨️',
                                titel: 'Druckfertige Dokumente',
                                beschreibung: 'Flyer & Presse-Einladung',
                                docs: docList,
                                onOpen: (doc: any) => handleViewEventDocument(doc, event),
                                onDelete: (doc: any) => {
                                  if (doc.id === 'k2-galerie-flyer' || doc.id === 'k2-galerie-presse') handleHideFromEventList(event.id, doc.id)
                                  else handleDeleteEventDocument(event.id, doc.id)
                                },
                                onErstellen: null as null | (() => void)
                              },
                              {
                                typ: 'qr-plakat' as const,
                                icon: '🏛️',
                                titel: 'QR-Code Plakat',
                                beschreibung: 'Zum Aufhängen – Besucher scannen',
                                docs: byTyp['qr-plakat'] || [],
                                onOpen: (doc: any) => handleViewEventDocument(doc),
                                onDelete: (doc: any) => handleDeleteWerbematerialDocument(doc.id),
                                onErstellen: () => printQRCodePlakat(event)
                              },
                              {
                                typ: 'newsletter' as const,
                                icon: '📧',
                                titel: 'Newsletter',
                                beschreibung: 'E-Mail an Stammkunden',
                                docs: byTyp['newsletter'] || [],
                                onOpen: (doc: any) => handleViewEventDocument(doc),
                                onDelete: (doc: any) => handleDeleteWerbematerialDocument(doc.id),
                                onErstellen: () => {
                                  const ev = events.find((e: any) => e.id === event.id)
                                  if (!ev) return
                                  const evSug = suggestions.find((sg: any) => sg.eventId === event.id)
                                  generateEditableNewsletterPDF(evSug?.newsletter || generateEmailNewsletterContent(ev), ev)
                                }
                              },
                              {
                                typ: 'plakat' as const,
                                icon: '🖼️',
                                titel: 'Plakat',
                                beschreibung: 'A3/A2 für Schaufenster & Wände',
                                docs: byTyp['plakat'] || [],
                                onOpen: (doc: any) => handleViewEventDocument(doc),
                                onDelete: (doc: any) => handleDeleteWerbematerialDocument(doc.id),
                                onErstellen: () => {
                                  const ev = events.find((e: any) => e.id === event.id)
                                  if (ev) generatePlakatForEvent(ev)
                                }
                              },
                              {
                                typ: 'event-flyer' as const,
                                icon: '📄',
                                titel: 'Event-Flyer',
                                beschreibung: 'Handzettel für persönliche Einladung',
                                docs: byTyp['event-flyer'] || [],
                                onOpen: (doc: any) => handleViewEventDocument(doc),
                                onDelete: (doc: any) => handleDeleteWerbematerialDocument(doc.id),
                                onErstellen: () => {
                                  const ev = events.find((e: any) => e.id === event.id)
                                  if (!ev) return
                                  const evSug = suggestions.find((sg: any) => sg.eventId === event.id)
                                  generateEditableNewsletterPDF(evSug?.flyer || generateEventFlyerContent(ev), ev)
                                }
                              },
                              {
                                typ: 'presse' as const,
                                icon: '📰',
                                titel: 'Presseaussendung',
                                beschreibung: 'Für Zeitungen & Medien',
                                docs: byTyp['presse'] || [],
                                onOpen: (doc: any) => handleViewEventDocument(doc),
                                onDelete: (doc: any) => handleDeleteWerbematerialDocument(doc.id),
                                onErstellen: () => {
                                  const ev = events.find((e: any) => e.id === event.id)
                                  if (!ev) return
                                  const evSug = suggestions.find((sg: any) => sg.eventId === event.id)
                                  generateEditablePresseaussendungPDF(evSug?.presseaussendung || generatePresseaussendungContent(ev), ev)
                                }
                              },
                              {
                                typ: 'social' as const,
                                icon: '📱',
                                titel: 'Social Media',
                                beschreibung: 'Instagram, Facebook, WhatsApp',
                                docs: byTyp['social'] || [],
                                onOpen: (doc: any) => handleViewEventDocument(doc),
                                onDelete: (doc: any) => handleDeleteWerbematerialDocument(doc.id),
                                onErstellen: () => {
                                  const ev = events.find((e: any) => e.id === event.id)
                                  if (!ev) return
                                  const evSug = suggestions.find((sg: any) => sg.eventId === event.id)
                                  generateEditableSocialMediaPDF(evSug?.socialMedia || generateSocialMediaContent(ev), ev)
                                }
                              }
                            ]

                            const fertigAnzahl = DOKUMENT_KARTEN.filter(k => k.docs.length > 0).length
                            const gesamtAnzahl = DOKUMENT_KARTEN.length

                            return (
                              <div>
                                {/* STATUS-BALKEN: Auf einen Blick */}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  background: fertigAnzahl === gesamtAnzahl ? 'rgba(34,197,94,0.12)' : `${s.accent}10`,
                                  border: `1px solid ${fertigAnzahl === gesamtAnzahl ? 'rgba(34,197,94,0.4)' : s.accent + '33'}`,
                                  borderRadius: '10px',
                                  padding: '0.75rem 1rem',
                                  marginBottom: '1rem',
                                  flexWrap: 'wrap',
                                  gap: '0.5rem'
                                }}>
                                  <div>
                                    <div style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', fontWeight: '700', color: s.text }}>
                                      {fertigAnzahl === gesamtAnzahl ? '✅ Alle Dokumente bereit!' : `📋 ${fertigAnzahl} von ${gesamtAnzahl} Dokumenten erstellt`}
                                    </div>
                                    <div style={{ fontSize: 'clamp(0.75rem, 1.6vw, 0.82rem)', color: s.muted, marginTop: '0.2rem' }}>
                                      {fertigAnzahl === gesamtAnzahl ? 'Alle Unterlagen für dieses Event sind vorhanden.' : 'Klicke auf einen roten Button um das Dokument sofort zu erstellen.'}
                                    </div>
                                  </div>
                                  {/* Fortschrittsbalken */}
                                  <div style={{ display: 'flex', gap: 4 }}>
                                    {DOKUMENT_KARTEN.map(k => (
                                      <div key={k.typ} style={{ width: 10, height: 10, borderRadius: '50%', background: k.docs.length > 0 ? 'rgba(34,197,94,0.8)' : 'rgba(181,74,30,0.4)', border: `1px solid ${k.docs.length > 0 ? 'rgba(34,197,94,1)' : s.accent}` }} title={k.titel} />
                                    ))}
                                  </div>
                                </div>

                                {/* DOKUMENT-KARTEN: Eine Karte pro Dokument-Typ */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                  {DOKUMENT_KARTEN.map(karte => {
                                    const hatDokumente = karte.docs.length > 0
                                    return (
                                      <div key={karte.typ} style={{
                                        background: hatDokumente ? 'rgba(34,197,94,0.07)' : s.bgElevated,
                                        border: `1.5px solid ${hatDokumente ? 'rgba(34,197,94,0.35)' : s.accent + '22'}`,
                                        borderRadius: '10px',
                                        padding: '0.75rem 1rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                      }}>
                                        {/* Kopfzeile: Icon + Titel + Status */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                            <span style={{ fontSize: '1.2rem' }}>{karte.icon}</span>
                                            <div>
                                              <div style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', fontWeight: '700', color: s.text, lineHeight: 1.2 }}>{karte.titel}</div>
                                              <div style={{ fontSize: 'clamp(0.72rem, 1.5vw, 0.8rem)', color: s.muted }}>{karte.beschreibung}</div>
                                            </div>
                                          </div>
                                          <div style={{
                                            fontSize: 'clamp(0.72rem, 1.5vw, 0.8rem)',
                                            fontWeight: '700',
                                            padding: '0.2rem 0.55rem',
                                            borderRadius: '20px',
                                            background: hatDokumente ? 'rgba(34,197,94,0.15)' : 'rgba(181,74,30,0.12)',
                                            color: hatDokumente ? '#16a34a' : s.accent,
                                            border: `1px solid ${hatDokumente ? 'rgba(34,197,94,0.4)' : s.accent + '44'}`,
                                            whiteSpace: 'nowrap'
                                          }}>
                                            {hatDokumente ? `✅ ${karte.docs.length} vorhanden` : '○ Noch nicht erstellt'}
                                          </div>
                                        </div>

                                        {/* Vorhandene Dokumente anzeigen */}
                                        {hatDokumente && (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', paddingLeft: '0.25rem' }}>
                                            {karte.docs.map((doc: any) => (
                                              <div key={doc.id || doc.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <button
                                                  type="button"
                                                  onClick={() => karte.onOpen(doc)}
                                                  style={{
                                                    flex: 1,
                                                    textAlign: 'left',
                                                    padding: '0.4rem 0.7rem',
                                                    background: '#fff',
                                                    border: '1px solid rgba(34,197,94,0.3)',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: 'clamp(0.82rem, 1.8vw, 0.9rem)',
                                                    color: '#15803d',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem'
                                                  }}
                                                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)' }}
                                                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}
                                                >
                                                  🔍 {doc.name?.length > 45 ? doc.name.slice(0, 42) + '…' : (doc.name || doc.fileName || 'Dokument öffnen')}
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => karte.onDelete(doc)}
                                                  style={{
                                                    padding: '0.4rem 0.6rem',
                                                    background: 'rgba(220,38,38,0.08)',
                                                    border: '1px solid rgba(220,38,38,0.25)',
                                                    borderRadius: '6px',
                                                    color: '#dc2626',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    lineHeight: 1
                                                  }}
                                                  title="Löschen"
                                                >
                                                  ×
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Erstellen-Button */}
                                        {karte.onErstellen && (
                                          <button
                                            type="button"
                                            onClick={karte.onErstellen}
                                            style={{
                                              padding: '0.55rem 1rem',
                                              background: hatDokumente ? s.bgCard : '#b54a1e',
                                              border: `1.5px solid ${hatDokumente ? s.accent + '44' : '#8f3a16'}`,
                                              borderRadius: '8px',
                                              cursor: 'pointer',
                                              fontSize: 'clamp(0.85rem, 2vw, 0.92rem)',
                                              color: hatDokumente ? s.accent : '#ffffff',
                                              fontWeight: '700',
                                              textAlign: 'left',
                                              transition: 'background 0.15s'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = hatDokumente ? `${s.accent}18` : '#d4622a' }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = hatDokumente ? s.bgCard : '#b54a1e' }}
                                          >
                                            {hatDokumente ? `↩ Neu erstellen` : `➕ Jetzt erstellen – sofort fertig`}
                                          </button>
                                        )}
                                        {/* Druckversionen: extra Dokument hinzufügen */}
                                        {karte.typ === 'druckversion' && (
                                          <button
                                            type="button"
                                            onClick={() => { setSelectedEventForDocument(event.id); setShowDocumentModal(true) }}
                                            style={{
                                              padding: '0.4rem 0.75rem',
                                              background: s.bgCard,
                                              border: `1px solid ${s.accent}44`,
                                              borderRadius: '8px',
                                              cursor: 'pointer',
                                              fontSize: 'clamp(0.8rem, 1.8vw, 0.88rem)',
                                              color: s.accent,
                                              fontWeight: '600',
                                              textAlign: 'left'
                                            }}
                                          >
                                            ➕ Weiteres Dokument hinzufügen
                                          </button>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>

                                {/* ALLES ALS PDF – ganz unten */}
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${s.accent}22` }}>
                                  <button
                                    onClick={() => {
                                      const sug = JSON.parse(localStorage.getItem('k2-pr-suggestions') || '[]')
                                      const evSug = sug.find((sg: any) => sg.eventId === event.id)
                                      if (evSug) {
                                        generateEditablePRSuggestionsPDF(evSug, event)
                                      } else {
                                        alert('Keine PR-Vorschläge für dieses Event gefunden.')
                                      }
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '0.6rem 1rem',
                                      background: s.gradientAccent,
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '8px',
                                      fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                                      fontWeight: '700',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    📄 Alle PR-Dokumente auf einen Blick (PDF)
                                  </button>
                                </div>
                              </div>
                            )
                          })()}

                        </div>
                      )
                      })}
                        </div>
                      </div>
                    )}

                    {/* Veranstaltungen der Vergangenheit – kleine Leiste, bei Klick aufklappen */}
                    <div style={{ marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: `1px solid ${s.accent}22` }}>
                      <button
                        type="button"
                        onClick={() => setPastEventsExpanded((v) => !v)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          padding: '0.65rem 1rem',
                          background: `${s.accent}12`,
                          border: `1px solid ${s.accent}33`,
                          borderRadius: '10px',
                          color: s.text,
                          fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <span>📁 Veranstaltungen der Vergangenheit{pastEvents.length > 0 ? ` (${pastEvents.length})` : ''}</span>
                        <span style={{ color: s.muted, fontSize: '1.1rem' }}>{pastEventsExpanded ? '▼' : '▶'}</span>
                      </button>
                      {pastEventsExpanded && (
                        <div style={{ paddingTop: '1rem', paddingBottom: '0.5rem' }}>
                          <p style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: s.muted, marginBottom: '1rem', lineHeight: 1.5 }}>
                            Sobald ein Event vorbei ist, erscheint es hier mit allen Dokumenten – ansehen und als Muster für neue Aktionen nutzen.
                          </p>
                          {pastEvents.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                              {pastEvents.map((event: any) => {
                                const k2FlyerDoc = event.type === 'galerieeröffnung' ? { id: 'k2-galerie-flyer', name: 'K2 Galerie Flyer (Druckversion)', documentUrl: '/flyer-k2-galerie' } : null
                                const k2PresseDoc = event.type === 'galerieeröffnung' ? { id: 'k2-galerie-presse', name: 'Presse-Einladung (Druckversion)', documentUrl: '/presse-einladung-k2-galerie' } : null
                                const hiddenIds = event.hiddenDocIds || []
                                const docList = [k2FlyerDoc, k2PresseDoc, ...(event.documents || [])].filter(Boolean).filter((d: any) => !hiddenIds.includes(d.id))
                                return (
                                  <div
                                    key={event.id}
                                    style={{
                                      background: `${s.accent}08`,
                                      border: `1px solid ${s.accent}22`,
                                      borderRadius: '12px',
                                      padding: 'clamp(1rem, 2.5vw, 1.25rem)',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${s.accent}22` }}>
                                      <h4 style={{ fontSize: 'clamp(1rem, 2.2vw, 1.15rem)', fontWeight: '600', color: s.text, margin: '0 0 0.35rem 0' }}>
                                        {event.title}
                                      </h4>
                                      <div style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', color: s.muted, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <span>📅 {new Date(event.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        {event.type && <span>🏷️ {event.type === 'galerieeröffnung' ? 'Galerieeröffnung' : event.type === 'vernissage' ? 'Vernissage' : event.type === 'finissage' ? 'Finissage' : event.type === 'öffentlichkeitsarbeit' ? 'Öffentlichkeitsarbeit' : 'Sonstiges'}</span>}
                                      </div>
                                    </div>
                                    <div style={{ fontSize: 'clamp(0.75rem, 1.6vw, 0.85rem)', color: s.muted, marginBottom: '0.5rem' }}>
                                      Dokumente (anklicken = ansehen / als Vorlage nutzen):
                                    </div>
                                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                      {docList.map((doc: any) => (
                                        <li
                                          key={doc.id || doc.name}
                                          onClick={() => handleViewEventDocument(doc, event)}
                                          style={{
                                            padding: '0.5rem 0.75rem',
                                            background: s.bgElevated,
                                            border: `1px solid ${s.accent}22`,
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                                            color: doc.documentUrl ? s.accent : s.text,
                                            transition: 'background 0.2s, color 0.2s'
                                          }}
                                          onMouseEnter={(e) => { e.currentTarget.style.background = `${s.accent}18`; e.currentTarget.style.color = s.accent }}
                                          onMouseLeave={(e) => { e.currentTarget.style.background = s.bgElevated; e.currentTarget.style.color = doc.documentUrl ? s.accent : s.text }}
                                        >
                                          {doc.documentUrl ? '🖨️ ' : '📎 '}{doc.name || doc.fileName || 'Dokument'}
                                        </li>
                                      ))}
                                      {docList.length === 0 && (
                                        <li style={{ padding: '0.5rem', color: s.muted, fontSize: '0.9rem' }}>Keine Dokumente zu dieser Veranstaltung.</li>
                                      )}
                                    </ul>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div style={{
                              padding: '1.25rem 1.5rem',
                              background: `${s.accent}0c`,
                              border: `1px dashed ${s.accent}44`,
                              borderRadius: '12px',
                              color: s.muted,
                              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                              lineHeight: 1.5
                            }}>
                              <p style={{ margin: '0 0 1rem 0' }}>
                                Noch keine vergangenen Veranstaltungen. Events mit Datum in der Vergangenheit erscheinen hier automatisch – inkl. aller Flyer und Dokumente zum Ansehen und als Vorlage.
                              </p>
                              <button
                                type="button"
                                onClick={handleCreateAteliersbesichtigungPaulWeber}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: `${s.accent}22`,
                                  border: `1px solid ${s.accent}66`,
                                  borderRadius: '8px',
                                  color: s.accent,
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)'
                                }}
                              >
                                📁 Beispiel anlegen: Ateliersbesichtigung bei Paul Weber (vor 1 Woche, mit Einladung und Presse)
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              }
              return (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: s.muted,
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
                }}>
                  Noch keine Events vorhanden. Erstelle ein Event in der Eventplanung.
                </div>
              )
            })()}

            {/* Leer: Hinweis auf 2-Schritte-Flow */}
            {events.length === 0 && (
              <div style={{
                padding: 'clamp(2rem, 5vw, 3rem)',
                textAlign: 'center',
                background: `${s.accent}0c`,
                border: `1px dashed ${s.accent}44`,
                borderRadius: '16px'
              }}>
                <div style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)', color: s.accent, fontWeight: '600', marginBottom: '0.75rem' }}>
                  💡 Noch keine Rubrik?
                </div>
                <p style={{ color: s.text, fontSize: 'clamp(0.9rem, 2vw, 1rem)', lineHeight: 1.6, marginBottom: '1rem', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                  <strong>Schritt 1:</strong> Gehe zu „Eventplanung“ und klicke auf „Event hinzufügen“. Fülle das Stammblatt (Titel, Datum, Ort, Typ) und speichere.
                </p>
                <p style={{ color: s.muted, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', lineHeight: 1.6 }}>
                  <strong>Schritt 2:</strong> Hier erscheint dann automatisch eine Rubrik mit Newsletter, Presse, Social Media, PDF – sofort einsatzbereit.
                </p>
              </div>
            )}
          </section>
        )}

        </main>
      </div>

      {/* Kamera-Vollbild-Ansicht */}
      {showCameraView && (
        <div 
          onClick={closeCamera}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#000',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              zIndex: 10001
            }}
          >
            <button
              onClick={closeCamera}
              style={{
                padding: '1rem 2rem',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                zIndex: 10002
              }}
            >
              Abbrechen
            </button>
            <button
              onClick={takePicture}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#fff',
                border: '4px solid #333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                zIndex: 10002
              }}
            >
              📸
            </button>
          </div>
          
          {/* X-Button oben rechts */}
          <button
            onClick={closeCamera}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              zIndex: 10002,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      )}


      {/* Modal: Veröffentlichung erfolgreich – Button öffnet Vercel (kein Popup-Block) */}
      {publishSuccessModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99998,
            padding: '1rem'
          }}
          onClick={() => setPublishSuccessModal(null)}
        >
          <div
            style={{
              background: '#1a1d24',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              border: '1px solid rgba(95, 251, 241, 0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem', color: '#22c55e', fontSize: '1.2rem' }}>✅ App aktualisiert</h3>
            {typeof window !== 'undefined' && (() => {
              const ua = navigator.userAgent
              const isMobileUA = /iPhone|iPad|iPod|Android/i.test(ua)
              const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)
              return !isMobileUA && !isTouch && window.innerWidth >= 768
            })() ? (
              <>
                <p style={{ margin: '0 0 0.75rem', color: '#e2e8f0', fontSize: '0.95rem' }}>
                  Stammdaten, Werke, Events, Dokumente und Seitentexte sind veröffentlicht ({((publishSuccessModal.size || 0) / 1024).toFixed(1)} KB). In 2–3 Min auf allen Geräten aktuell.
                </p>
                <p style={{ margin: '0 0 0.5rem', color: 'rgba(255,255,255,0.85)', fontSize: '1rem', fontWeight: '600' }}>
                  Einfach OK drücken.
                </p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                  E-Mail bei Ready/Fehler? → vercel.com/account/notifications (evtl. Spam prüfen)
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: '0 0 0.5rem', color: 'rgba(255,255,255,0.85)', fontSize: '1rem', fontWeight: '600' }}>
                  Fertig. Einfach OK drücken.
                </p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                  E-Mail bei Ready/Fehler? → vercel.com/account/notifications (evtl. Spam prüfen)
                </p>
              </>
            )}
            <p style={{ margin: '0.75rem 0 0', color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>
              Vercel baut in 1–2 Min. E-Mail kommt nur, wenn unter Vercel → Notifications aktiviert.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {typeof window !== 'undefined' && (() => {
                const ua = navigator.userAgent
                const isMobileUA = /iPhone|iPad|iPod|Android/i.test(ua)
                const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)
                return !isMobileUA && !isTouch && window.innerWidth >= 768
              })() && (
                <a
                  href="https://vercel.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Vercel-Dashboard öffnen – siehst ob Deployment läuft oder fertig ist"
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  🚀 Vercel öffnen
                </a>
              )}
              <button
                onClick={() => setPublishSuccessModal(null)}
                style={{
                  padding: '0.6rem 1.2rem',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Fehlermeldung Speichern – einfach, klar, kein Techniker-Jargon */}
      {publishErrorMsg && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99998, padding: '1rem' }}
          onClick={() => setPublishErrorMsg(null)}
        >
          <div
            style={{ background: '#1a1d24', borderRadius: '16px', maxWidth: '400px', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,200,0,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '2rem', textAlign: 'center' }}>⚠️</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', textAlign: 'center' }}>Speichern nicht möglich</div>
            <div style={{ fontSize: '1rem', color: '#e2e8f0', lineHeight: 1.6, textAlign: 'center' }}>
              Bitte nochmal auf <strong>„Speichern“</strong> klicken.<br/>
              Falls es wieder nicht klappt: Dem Assistenten kurz Bescheid geben.
            </div>
            <button
              onClick={() => setPublishErrorMsg(null)}
              style={{ padding: '0.75rem 2rem', background: '#f59e0b', color: '#1a1d24', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'center' }}
            >
              OK
            </button>
          </div>
        </div>
      )}

            {/* Vita-Editor: großes Vollbild-Fenster */}
            {showVitaEditor && (
              <div
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 999999, display: 'flex', alignItems: 'stretch', justifyContent: 'center', padding: '0' }}
                onClick={() => setShowVitaEditor(false)}
              >
                <div
                  style={{ width: '100%', maxWidth: 760, margin: '0 auto', background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', flexDirection: 'column', boxShadow: '0 0 80px rgba(0,0,0,0.8)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div style={{ padding: '1.2rem 1.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f0f6ff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📝 Vita
                        {memberForm.name && <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'rgba(160,200,255,0.6)' }}>– {memberForm.name}</span>}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(160,200,255,0.5)', marginTop: '0.2rem' }}>Ausführlicher Lebenslauf · Text eingeben, einfügen (Strg+V) oder reinziehen</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowVitaEditor(false)}
                        style={{ padding: '0.5rem 1.2rem', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 10, color: '#60a5fa', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        ✓ Übernehmen
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowVitaEditor(false)}
                        style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(160,200,255,0.6)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >×</button>
                    </div>
                  </div>

                  {/* Editor-Bereich */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem 1.5rem 1.5rem', gap: '0.75rem', overflow: 'hidden' }}>

                    {/* Schnell-Vorlagen */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {[
                        { label: '📚 Ausbildung', text: 'Ausbildung:\n' },
                        { label: '🎨 Technik', text: 'Technik & Stil:\n' },
                        { label: '🏆 Ausstellungen', text: 'Ausstellungen:\n' },
                        { label: '💡 Inspiration', text: 'Inspiration:\n' },
                      ].map(v => (
                        <button
                          key={v.label}
                          type="button"
                          onClick={() => setMemberForm(f => ({ ...f, vita: (f.vita ? f.vita + '\n\n' : '') + v.text }))}
                          style={{ padding: '0.3rem 0.7rem', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 20, color: 'rgba(160,200,255,0.8)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 500 }}
                        >{v.label}</button>
                      ))}
                      {memberForm.vita?.trim() && (
                        <button
                          type="button"
                          onClick={() => { if (window.confirm('Vita löschen?')) setMemberForm(f => ({ ...f, vita: '' })) }}
                          style={{ padding: '0.3rem 0.7rem', background: 'rgba(181,74,30,0.12)', border: '1px solid rgba(181,74,30,0.25)', borderRadius: 20, color: 'rgba(255,160,100,0.8)', fontSize: '0.78rem', cursor: 'pointer', marginLeft: 'auto' }}
                        >🗑️ Leeren</button>
                      )}
                    </div>

                    {/* Textarea – drop-Zone */}
                    <textarea
                      value={memberForm.vita}
                      onChange={(e) => setMemberForm(f => ({ ...f, vita: e.target.value }))}
                      placeholder={'Hier die Vita eingeben, einfügen oder reinziehen …\n\nBeispiel:\nGeboren 1975 in Wien. Studium an der Akademie der bildenden Künste.\nSchwerpunkt: Öl auf Leinwand, abstrakte Landschaften.\n\nAusstellungen:\n• 2018 – Galerie am Stubenring, Wien\n• 2021 – Kunstmesse Salzburg\n• 2023 – Gruppenausstellung Linz'}
                      autoFocus
                      onDrop={(e) => {
                        e.preventDefault()
                        const text = e.dataTransfer.getData('text/plain')
                        if (text) setMemberForm(f => ({ ...f, vita: (f.vita ? f.vita + '\n\n' : '') + text }))
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      style={{
                        flex: 1,
                        width: '100%',
                        padding: '1rem 1.2rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(37,99,235,0.25)',
                        borderRadius: 12,
                        color: '#e8f0ff',
                        fontSize: '0.95rem',
                        lineHeight: 1.75,
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        minHeight: 300,
                        caretColor: '#60a5fa',
                      }}
                    />

                    {/* Zeichenzahl */}
                    <div style={{ fontSize: '0.75rem', color: 'rgba(160,200,255,0.35)', textAlign: 'right' }}>
                      {memberForm.vita?.length ?? 0} Zeichen
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Neues Werk hinzufügen - z-index hoch damit es über allem liegt */}
      {showAddModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem'
          }}
          onClick={() => {
            setShowAddModal(false)
            setEditingArtwork(null)
            setEditingMemberIndex(null)
            setMemberForm({ ...EMPTY_MEMBER_FORM })
            setArtworkCategory('malerei')
            setArtworkCeramicSubcategory('vase')
            setArtworkCeramicHeight('10')
            setArtworkCeramicDiameter('10')
            setArtworkCeramicDescription('')
            setArtworkCeramicType('steingut')
            setArtworkCeramicSurface('mischtechnik')
            setArtworkTitle('')
            setArtworkPaintingWidth('')
            setArtworkPaintingHeight('')
            setArtworkArtist('')
            setArtworkDescription('')
            setArtworkTechnik('')
            setArtworkDimensions('')
            setArtworkPrice('')
            setArtworkQuantity('1')
            setSelectedFile(null)
            setPreviewUrl(null)
            setPhotoUseFreistellen(true)
            setPhotoBackgroundPreset('hell')
            setIsInShop(true)
      setIsImVereinskatalog(false)
            setArtworkFormVariantOek2('schnell')
            setArtworkCategoryFree('')
            setArtworkSubcategoryFree('')
            setArtworkDimensionsFree('')
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(18, 22, 35, 0.98) 0%, rgba(12, 16, 28, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(95, 251, 241, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Kompakt */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#ffffff'
              }}>
                {isVk2AdminContext() ? (editingMemberIndex !== null ? 'Profil für Unsere Mitglieder bearbeiten' : 'Profil für Unsere Mitglieder anlegen') : (editingArtwork ? 'Werk bearbeiten' : 'Neues Werk')}
              </h2>
              <button 
                onClick={() => {
                  setShowAddModal(false)
                  setEditingArtwork(null)
                  setEditingMemberIndex(null)
                  setMemberForm({ ...EMPTY_MEMBER_FORM })
                  setArtworkTitle('')
                  setArtworkCategory('malerei')
                  setArtworkCeramicSubcategory('vase')
                  setArtworkCeramicHeight('10')
                  setArtworkCeramicDiameter('10')
                  setArtworkCeramicDescription('')
                  setArtworkPaintingWidth('')
                  setArtworkPaintingHeight('')
                  setArtworkArtist('')
                  setArtworkDescription('')
                  setArtworkPrice('')
                  setArtworkQuantity('1')
                  setSelectedFile(null)
                  setPreviewUrl(null)
                  setPhotoUseFreistellen(true)
                  setPhotoBackgroundPreset('hell')
                  setIsInShop(true)
      setIsImVereinskatalog(false)
                  setArtworkFormVariantOek2('schnell')
                  setArtworkCategoryFree('')
                  setArtworkSubcategoryFree('')
                  setArtworkDimensionsFree('')
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8fa0c9',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#8fa0c9'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Content - Kompakt */}
            <div style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* VK2: Profil-Formular – Foto, Werk, Vita, Name, Kontakt, Bank */}
              {isVk2AdminContext() ? (
                <>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: s.muted }}>Profil für die Mitglieder-Galerie – Foto, Werk und Vita separat bearbeitbar.</p>

                  {/* ── BILDER-BEREICH ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>

                    {/* Porträt-Foto */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: s.accent, fontWeight: 600 }}>
                        👤 Foto <span style={{ fontWeight: 400, color: s.muted, fontSize: '0.8rem' }}>(Porträt-Kreis)</span>
                      </label>
                      {memberForm.mitgliedFotoUrl ? (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <img src={memberForm.mitgliedFotoUrl} alt="Porträt" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${s.accent}66`, display: 'block' }} />
                          <button type="button" onClick={() => setMemberForm(f => ({ ...f, mitgliedFotoUrl: '' }))} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#b54a1e', border: 'none', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
                        </div>
                      ) : (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', width: '100%', aspectRatio: '1', background: `${s.accent}0d`, border: `2px dashed ${s.accent}44`, borderRadius: 12, cursor: 'pointer', color: s.muted, fontSize: '0.8rem', textAlign: 'center', padding: '0.5rem' }}>
                          <span style={{ fontSize: '1.8rem' }}>👤</span>
                          <span>Tippen oder ziehen</span>
                          <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const reader = new FileReader()
                            reader.onload = () => {
                              const dataUrl = reader.result as string
                              const img = new Image()
                              img.onload = () => {
                                const maxW = 400
                                const scale = img.width > maxW ? maxW / img.width : 1
                                const c = document.createElement('canvas')
                                c.width = Math.round(img.width * scale)
                                c.height = Math.round(img.height * scale)
                                const ctx = c.getContext('2d')
                                if (ctx) { ctx.drawImage(img, 0, 0, c.width, c.height); setMemberForm(f => ({ ...f, mitgliedFotoUrl: c.toDataURL('image/jpeg', 0.6) })) }
                                else { setMemberForm(f => ({ ...f, mitgliedFotoUrl: dataUrl })) }
                              }
                              img.src = dataUrl
                            }
                            reader.readAsDataURL(file)
                          }} />
                        </label>
                      )}
                    </div>

                    {/* Werkfoto */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: s.accent, fontWeight: 600 }}>
                        🖼️ Werk <span style={{ fontWeight: 400, color: s.muted, fontSize: '0.8rem' }}>(Karte oben)</span>
                      </label>
                      {memberForm.imageUrl ? (
                        <div style={{ position: 'relative' }}>
                          <img src={memberForm.imageUrl} alt="Werk" style={{ width: '100%', aspectRatio: '3/2', objectFit: 'cover', borderRadius: 10, border: `1px solid ${s.accent}44`, display: 'block' }} />
                          <button type="button" onClick={() => setMemberForm(f => ({ ...f, imageUrl: '' }))} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: '#b54a1e', border: 'none', color: '#fff', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        </div>
                      ) : (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', width: '100%', aspectRatio: '3/2', background: `${s.accent}0d`, border: `2px dashed ${s.accent}44`, borderRadius: 12, cursor: 'pointer', color: s.muted, fontSize: '0.8rem', textAlign: 'center', padding: '0.5rem' }}>
                          <span style={{ fontSize: '1.8rem' }}>🖼️</span>
                          <span>Tippen oder ziehen</span>
                          <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const reader = new FileReader()
                            reader.onload = () => {
                              const dataUrl = reader.result as string
                              const img = new Image()
                              img.onload = () => {
                                const maxW = 600
                                const scale = img.width > maxW ? maxW / img.width : 1
                                const c = document.createElement('canvas')
                                c.width = Math.round(img.width * scale)
                                c.height = Math.round(img.height * scale)
                                const ctx = c.getContext('2d')
                                if (ctx) { ctx.drawImage(img, 0, 0, c.width, c.height); setMemberForm(f => ({ ...f, imageUrl: c.toDataURL('image/jpeg', 0.6) })) }
                                else { setMemberForm(f => ({ ...f, imageUrl: dataUrl })) }
                              }
                              img.src = dataUrl
                            }
                            reader.readAsDataURL(file)
                          }} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* ── VITA-BEREICH ── */}
                  <div style={{ borderTop: `1px solid ${s.accent}22`, paddingTop: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: s.text, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          📝 <span>Vita</span>
                          {memberForm.vita?.trim() && <span style={{ fontSize: '0.72rem', background: `${s.accent}22`, color: s.accent, borderRadius: 20, padding: '0.1rem 0.5rem', fontWeight: 600 }}>✓ vorhanden</span>}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: s.muted, marginTop: '0.15rem' }}>Ausführlicher Lebenslauf – erscheint beim Aufklappen des Profils</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowVitaEditor(true)}
                        style={{ padding: '0.5rem 1.1rem', background: s.gradientAccent, border: 'none', borderRadius: 10, color: '#fff', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0, boxShadow: s.shadow }}
                      >
                        {memberForm.vita?.trim() ? '✏️ Bearbeiten' : '+ Vita schreiben'}
                      </button>
                    </div>
                    {memberForm.vita?.trim() && (
                      <div style={{ background: s.bgElevated, borderRadius: 8, padding: '0.6rem 0.8rem', border: `1px solid ${s.accent}22`, maxHeight: 72, overflow: 'hidden', position: 'relative' }}>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(200,220,255,0.7)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{memberForm.vita}</p>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 28, background: `linear-gradient(transparent, ${s.bgElevated})` }} />
                      </div>
                    )}
                  </div>

                  {/* ── BASIS-DATEN ── */}
                  <div style={{ borderTop: `1px solid ${s.accent}22`, paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ fontSize: '0.85rem', color: s.accent, fontWeight: 600 }}>Basisdaten</div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: s.muted, fontWeight: 600 }}>Name *</label>
                      <input
                        type="text"
                        value={memberForm.name}
                        onChange={(e) => setMemberForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="z.B. Anna Beispiel"
                        style={{ width: '100%', padding: '0.6rem', background: s.bgElevated, border: `1px solid ${s.accent}44`, borderRadius: '8px', color: s.text, fontSize: '0.95rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: s.muted, fontWeight: 600 }}>E-Mail</label>
                      <input
                        type="email"
                        value={memberForm.email}
                        onChange={(e) => setMemberForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="z.B. anna@beispiel.at"
                        style={{ width: '100%', padding: '0.6rem', background: s.bgElevated, border: `1px solid ${s.accent}44`, borderRadius: '8px', color: s.text, fontSize: '0.95rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: s.muted, fontWeight: 600 }}>Kunstrichtung / Kategorie</label>
                      <select
                        value={memberForm.typ}
                        onChange={(e) => setMemberForm(f => ({ ...f, typ: e.target.value }))}
                        style={{ width: '100%', padding: '0.6rem', background: s.bgElevated, border: `1px solid ${s.accent}44`, borderRadius: '8px', color: s.text, fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="">– Bitte wählen –</option>
                        {VK2_KUNSTBEREICHE.map((k) => (
                          <option key={k.id} value={k.label}>{k.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: s.muted, fontWeight: 600 }}>
                        Kurz-Bio <span style={{ fontWeight: 400, color: s.muted }}>(1–2 Sätze für die Karte)</span>
                      </label>
                      <textarea
                        value={memberForm.bio}
                        onChange={(e) => setMemberForm(f => ({ ...f, bio: e.target.value }))}
                        placeholder="Kurze Beschreibung: Schwerpunkte, Stil ..."
                        rows={2}
                        style={{ width: '100%', padding: '0.6rem', background: s.bgElevated, border: `1px solid ${s.accent}44`, borderRadius: '8px', color: s.text, fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: s.muted, fontWeight: 600 }}>Galerie-Link / Website</label>
                      <input
                        type="text"
                        value={memberForm.galerieLinkUrl}
                        onChange={(e) => setMemberForm(f => ({ ...f, galerieLinkUrl: e.target.value }))}
                        placeholder="z.B. https://k2-galerie.vercel.app/galerie oder eigene Website"
                        style={{ width: '100%', padding: '0.6rem', background: s.bgElevated, border: `1px solid ${s.accent}44`, borderRadius: '8px', color: s.text, fontSize: '0.95rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>🏆 Lizenz-Galerie URL (für Vereinskatalog)</label>
                      <input
                        type="text"
                        value={memberForm.lizenzGalerieUrl}
                        onChange={(e) => setMemberForm(f => ({ ...f, lizenzGalerieUrl: e.target.value }))}
                        placeholder="z.B. https://anna-k2.vercel.app"
                        style={{ width: '100%', padding: '0.6rem', background: s.bgElevated, border: '1px solid rgba(251,191,36,0.3)', borderRadius: '8px', color: s.text, fontSize: '0.95rem', outline: 'none' }}
                      />
                      <p style={{ margin: '0.3rem 0 0', fontSize: '0.72rem', color: 'rgba(251,191,36,0.5)' }}>
                        Wenn das Mitglied eine eigene K2-Lizenzgalerie hat – der Katalog holt sich die markierten Werke von dort.
                      </p>
                    </div>
                  </div>

                  {/* ── ZUGANGSBERECHTIGUNG ── */}
                  <div style={{ borderTop: `1px solid ${s.accent}22`, paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', color: s.accent, fontWeight: 600, marginBottom: '0.5rem' }}>🔑 Zugangsberechtigung</div>
                    <p style={{ margin: '0 0 0.6rem', fontSize: '0.8rem', color: s.muted }}>Bestimmt was dieses Mitglied im Admin bearbeiten darf.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {/* Rolle */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: s.muted, fontWeight: 600 }}>Rolle</label>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {(['mitglied', 'vorstand'] as const).map(r => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setMemberForm(f => ({ ...f, rolle: r }))}
                              style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: `1px solid ${memberForm.rolle === r ? s.accent : s.accent + '33'}`, background: memberForm.rolle === r ? `${s.accent}22` : s.bgElevated, color: memberForm.rolle === r ? s.accent : s.muted, fontSize: '0.82rem', fontWeight: memberForm.rolle === r ? 700 : 400, cursor: 'pointer' }}
                            >
                              {r === 'vorstand' ? '👑 Vorstand' : '👤 Mitglied'}
                            </button>
                          ))}
                        </div>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: s.muted }}>
                          {memberForm.rolle === 'vorstand' ? 'Voll-Admin: alles bearbeiten, Liste exportieren' : 'Nur eigenes Profil bearbeiten'}
                        </p>
                      </div>
                      {/* PIN */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: s.muted, fontWeight: 600 }}>PIN (4-stellig)</label>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            value={memberForm.pin}
                            onChange={(e) => setMemberForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                            placeholder="z.B. 1234"
                            style={{ width: '100%', padding: '0.5rem', background: s.bgElevated, border: `1px solid ${s.accent}44`, borderRadius: '6px', color: s.text, fontSize: '1.1rem', outline: 'none', letterSpacing: '0.3em', textAlign: 'center', fontWeight: 700 }}
                          />
                          <button
                            type="button"
                            title="Zufälligen PIN generieren"
                            onClick={() => setMemberForm(f => ({ ...f, pin: String(Math.floor(1000 + Math.random() * 9000)) }))}
                            style={{ padding: '0.5rem 0.6rem', background: s.bgElevated, border: `1px solid ${s.accent}33`, borderRadius: 6, color: s.accent, fontSize: '0.9rem', cursor: 'pointer', flexShrink: 0 }}
                          >🎲</button>
                        </div>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: s.muted }}>Mitglied tippt beim Login: Name wählen → PIN eingeben</p>
                      </div>
                    </div>
                  </div>

                  {/* ── BANKVERBINDUNG ── */}
                  <div style={{ borderTop: `1px solid ${s.accent}22`, paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', color: s.accent, fontWeight: 600, marginBottom: '0.5rem' }}>Bankverbindung (für Bonussystem)</div>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: s.muted }}>Nur für Mitglieder, die am Bonussystem teilnehmen.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: s.muted }}>Kontoinhaber</label>
                        <input type="text" value={memberForm.bankKontoinhaber} onChange={(e) => setMemberForm(f => ({ ...f, bankKontoinhaber: e.target.value }))} placeholder="z.B. Lisa Muster" style={{ width: '100%', padding: '0.5rem', background: s.bgElevated, border: `1px solid ${s.accent}44`, borderRadius: '6px', color: s.text, fontSize: '0.9rem', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: s.muted }}>IBAN</label>
                        <input type="text" value={memberForm.bankIban} onChange={(e) => setMemberForm(f => ({ ...f, bankIban: e.target.value }))} placeholder="z.B. AT61 1904 3002 3457 3201" style={{ width: '100%', padding: '0.5rem', background: s.bgElevated, border: `1px solid ${s.accent}44`, borderRadius: '6px', color: s.text, fontSize: '0.9rem', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: s.muted }}>BIC/SWIFT</label>
                        <input type="text" value={memberForm.bankBic} onChange={(e) => setMemberForm(f => ({ ...f, bankBic: e.target.value }))} placeholder="z.B. RZOOAT2L" style={{ width: '100%', padding: '0.5rem', background: s.bgElevated, border: `1px solid ${s.accent}44`, borderRadius: '6px', color: s.text, fontSize: '0.9rem', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: s.muted }}>Bank / Kreditinstitut</label>
                        <input type="text" value={memberForm.bankName} onChange={(e) => setMemberForm(f => ({ ...f, bankName: e.target.value }))} placeholder="z.B. Raiffeisen Bank" style={{ width: '100%', padding: '0.5rem', background: s.bgElevated, border: `1px solid ${s.accent}44`, borderRadius: '6px', color: s.text, fontSize: '0.9rem', outline: 'none' }} />
                      </div>
                    </div>
                  </div>

                  {/* ── BUTTONS ── */}
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: `1px solid ${s.accent}22` }}>
                    <button
                      type="button"
                      onClick={() => { setShowAddModal(false); setEditingMemberIndex(null); setMemberForm({ ...EMPTY_MEMBER_FORM }) }}
                      style={{ padding: '0.6rem 1.25rem', background: s.bgElevated, border: `1px solid ${s.accent}44`, borderRadius: '8px', color: s.text, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!memberForm.name.trim()) { alert('Bitte Name eintragen.'); return }
                        const mitglieder = [...(vk2Stammdaten.mitglieder || [])]
                        const neu: Vk2Mitglied = { name: memberForm.name.trim(), email: memberForm.email.trim() || undefined, lizenz: memberForm.lizenz.trim() || undefined, typ: memberForm.typ || undefined, bio: memberForm.bio.trim() || undefined, vita: memberForm.vita.trim() || undefined, galerieLinkUrl: memberForm.galerieLinkUrl.trim() || undefined, lizenzGalerieUrl: memberForm.lizenzGalerieUrl.trim() || undefined, website: memberForm.website.trim() || undefined, phone: memberForm.phone.trim() || undefined, strasse: memberForm.strasse.trim() || undefined, plz: memberForm.plz.trim() || undefined, ort: memberForm.ort.trim() || undefined, land: memberForm.land.trim() || undefined, geburtsdatum: memberForm.geburtsdatum.trim() || undefined, eintrittsdatum: memberForm.eintrittsdatum.trim() || undefined, mitgliedFotoUrl: memberForm.mitgliedFotoUrl.trim() || undefined, imageUrl: memberForm.imageUrl.trim() || undefined, bankKontoinhaber: memberForm.bankKontoinhaber.trim() || undefined, bankIban: memberForm.bankIban.trim() || undefined, bankBic: memberForm.bankBic.trim() || undefined, bankName: memberForm.bankName.trim() || undefined, rolle: memberForm.rolle || 'mitglied', pin: memberForm.pin.trim() || undefined, oeffentlichSichtbar: true }
                        if (editingMemberIndex !== null) {
                          mitglieder[editingMemberIndex] = neu
                        } else {
                          mitglieder.push(neu)
                        }
                        setVk2Stammdaten({ ...vk2Stammdaten, mitglieder })
                        try { localStorage.setItem(KEY_VK2_STAMMDATEN, JSON.stringify({ ...vk2Stammdaten, mitglieder })) } catch (_) {}
                        setShowAddModal(false)
                        setEditingMemberIndex(null)
                        setMemberForm({ ...EMPTY_MEMBER_FORM })
                      }}
                      style={{ padding: '0.6rem 1.25rem', background: s.gradientAccent, border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', boxShadow: s.shadow }}
                    >
                      💾 Speichern
                    </button>
                  </div>
                </>
              ) : (
              <>
              {/* Bild-Upload - Sehr kompakt */}
              {previewUrl ? (
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <img 
                    src={previewUrl} 
                    alt="Vorschau" 
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  <button 
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl(null)
                    }}
                    style={{
                      padding: '0.4rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    ✏️ Ändern
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  border: '1px dashed rgba(95, 251, 241, 0.3)'
                }}>
                  <label 
                    htmlFor="file-input-upload" 
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      border: 'none',
                      flex: 1
                    }}
                  >
                    📁 Datei
                  </label>
                  <input
                    id="file-input-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <input
                    id="camera-input-direct"
                    type="file"
                    accept="image/*"
                    capture
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={handleCameraClick}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      flex: 1
                    }}
                  >
                    📸 Kamera
                  </button>
                </div>
              )}

              {/* Option: Foto freistellen oder Original – nur anzeigen wenn Bild gewählt */}
              {previewUrl && (
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  border: '1px solid rgba(95, 251, 241, 0.2)'
                }}>
                  <span style={{ fontSize: '0.8rem', color: '#8fa0c9', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                    Bildverarbeitung
                  </span>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#f4f7ff' }}>
                      <input
                        type="radio"
                        name="photo-option"
                        checked={photoUseFreistellen}
                        onChange={() => setPhotoUseFreistellen(true)}
                      />
                      Foto freistellen (mit Pro-Hintergrund)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#f4f7ff' }}>
                      <input
                        type="radio"
                        name="photo-option"
                        checked={!photoUseFreistellen}
                        onChange={() => setPhotoUseFreistellen(false)}
                      />
                      Original benutzen
                    </label>
                  </div>
                  {photoUseFreistellen && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#8fa0c9', display: 'block', marginBottom: '0.35rem' }}>
                        Hintergrund (wirkt wie im professionellen Studio)
                      </span>
                      <select
                        value={photoBackgroundPreset}
                        onChange={(e) => setPhotoBackgroundPreset(e.target.value as 'hell' | 'weiss' | 'warm' | 'kuehl' | 'dunkel')}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          color: '#f4f7ff',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          minWidth: '140px'
                        }}
                      >
                        <option value="hell">Studio hell (Standard)</option>
                        <option value="weiss">Studio weiß</option>
                        <option value="warm">Studio warm</option>
                        <option value="kuehl">Studio kühl</option>
                        <option value="dunkel">Studio dunkel</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {isOeffentlichAdminContext() ? (
                /* ök2 Künstler: Schnellversion oder Ausführliche Version – bei Änderungsarbeit jederzeit umschaltbar */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button type="button" onClick={() => setArtworkFormVariantOek2('schnell')} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: artworkFormVariantOek2 === 'schnell' ? 'rgba(95, 251, 241, 0.2)' : 'transparent', color: artworkFormVariantOek2 === 'schnell' ? '#5ffbf1' : '#8fa0c9', fontSize: '0.9rem', cursor: 'pointer' }}>Schnellversion (wenig Felder)</button>
                    <button type="button" onClick={() => setArtworkFormVariantOek2('ausfuehrlich')} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: artworkFormVariantOek2 === 'ausfuehrlich' ? 'rgba(95, 251, 241, 0.2)' : 'transparent', color: artworkFormVariantOek2 === 'ausfuehrlich' ? '#5ffbf1' : '#8fa0c9', fontSize: '0.9rem', cursor: 'pointer' }}>Ausführliche Version</button>
                    {editingArtwork && (
                      <span style={{ fontSize: '0.8rem', color: 'rgba(143, 160, 201, 0.9)' }}>Bei Änderung: jederzeit in Ausführlich wechseln.</span>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#8fa0c9', fontWeight: '500' }}>Titel *</label>
                    <input type="text" value={artworkTitle} onChange={(e) => setArtworkTitle(e.target.value)} placeholder="z.B. Frühlingslandschaft" style={{ width: '100%', padding: '0.6rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#8fa0c9', fontWeight: '500' }}>Kategorie *</label>
                    <select value={artworkCategory} onChange={(e) => setArtworkCategory(e.target.value)} style={{ width: '100%', padding: '0.6rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}>
                      {(isVk2AdminContext() ? VK2_KUNSTBEREICHE : ARTWORK_CATEGORIES).map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  {artworkFormVariantOek2 === 'ausfuehrlich' && (
                    <>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#8fa0c9', fontWeight: '500' }}>Unterkategorie (frei)</label>
                        <input type="text" value={artworkSubcategoryFree} onChange={(e) => setArtworkSubcategoryFree(e.target.value)} placeholder="z.B. Ölmalerei, Aquarell, Vasen" style={{ width: '100%', padding: '0.6rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#8fa0c9', fontWeight: '500' }}>Künstler:in</label>
                        <input type="text" value={artworkArtist} onChange={(e) => setArtworkArtist(e.target.value)} placeholder="Name der Künstler:in" style={{ width: '100%', padding: '0.6rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#8fa0c9', fontWeight: '500' }}>Beschreibung (frei)</label>
                        <textarea value={artworkDescription} onChange={(e) => setArtworkDescription(e.target.value)} placeholder="Technik, Material, Entstehung …" rows={3} style={{ width: '100%', padding: '0.6rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#8fa0c9', fontWeight: '500' }}>Maße (frei)</label>
                        <input type="text" value={artworkDimensionsFree} onChange={(e) => setArtworkDimensionsFree(e.target.value)} placeholder="z.B. 40 × 30 cm oder Höhe 25 cm" style={{ width: '100%', padding: '0.6rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }} />
                      </div>
                    </>
                  )}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#8fa0c9', fontWeight: '500' }}>Preis (€) *</label>
                    <input type="number" min="0" step="0.01" value={artworkPrice} onChange={(e) => setArtworkPrice(e.target.value)} placeholder="0.00" style={{ width: '100%', maxWidth: '140px', padding: '0.6rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#8fa0c9', fontWeight: '500' }}>Stückzahl</label>
                    <input type="number" min={1} max={99} value={artworkQuantity} onChange={(e) => setArtworkQuantity(e.target.value)} style={{ width: '100%', maxWidth: '80px', padding: '0.6rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#8fa0c9', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isInShop} onChange={(e) => setIsInShop(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    Im Online-Shop verfügbar
                  </label>
                  {/* Vereinskatalog-Checkbox – nur für VK2-Mitglieder mit Lizenzgalerie */}
                  {isVk2AdminContext() && (() => {
                    const katalogAnzahl = loadArtworks().filter((a: any) => a.imVereinskatalog && (!editingArtwork || a.id !== editingArtwork.id)).length
                    const limitErreicht = !isImVereinskatalog && katalogAnzahl >= 5
                    return (
                      <div style={{ marginTop: '0.25rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: limitErreicht ? 'rgba(255,140,66,0.5)' : '#fbbf24', cursor: limitErreicht ? 'not-allowed' : 'pointer', opacity: limitErreicht ? 0.6 : 1 }}>
                          <input
                            type="checkbox"
                            checked={isImVereinskatalog}
                            disabled={limitErreicht}
                            onChange={(e) => setIsImVereinskatalog(e.target.checked)}
                            style={{ width: '16px', height: '16px', cursor: limitErreicht ? 'not-allowed' : 'pointer', accentColor: '#fbbf24' }}
                          />
                          🏆 Im Vereinskatalog zeigen
                        </label>
                        <div style={{ marginTop: '0.2rem', fontSize: '0.72rem', color: limitErreicht ? '#ff8c42' : 'rgba(255,255,255,0.3)', paddingLeft: '1.5rem' }}>
                          {limitErreicht
                            ? '⚠️ Limit erreicht – erst ein anderes Werk abwählen'
                            : `${katalogAnzahl + (isImVereinskatalog ? 0 : 0)} von max. 5 ausgewählt`}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              ) : (
              <>
              {/* Formular - Kompakt Grid (K2); VK2: immer Titel + Kategorie (7 Kunstbereiche) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: (isVk2AdminContext() || artworkCategory !== 'keramik') ? '1fr 140px' : '140px',
                gap: '0.75rem',
                alignItems: 'start'
              }}>
                {(isVk2AdminContext() || artworkCategory !== 'keramik') && (
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.8rem',
                      color: '#8fa0c9',
                      fontWeight: '500'
                    }}>
                      Titel *
                    </label>
                    <input
                      type="text"
                      value={artworkTitle}
                      onChange={(e) => setArtworkTitle(e.target.value)}
                      placeholder="z.B. Frühlingslandschaft"
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontSize: '0.8rem',
                    color: '#8fa0c9',
                    fontWeight: '500'
                  }}>
                    Kategorie *
                  </label>
                  <select
                    value={artworkCategory}
                    onChange={(e) => {
                      const val = e.target.value
                      setArtworkCategory(val)
                      if (!isVk2AdminContext() && val === 'keramik') {
                        const subcategoryLabels: Record<string, string> = {
                          'vase': 'Gefäße - Vasen',
                          'teller': 'Schalen - Teller',
                          'skulptur': 'Skulptur',
                          'sonstig': 'Sonstig'
                        }
                        setArtworkTitle(subcategoryLabels[artworkCeramicSubcategory] || 'Keramik')
                      } else {
                        setArtworkTitle('')
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {(isVk2AdminContext() ? VK2_KUNSTBEREICHE : ARTWORK_CATEGORIES).map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Keramik-Unterkategorie (nur K2, nicht VK2) */}
              {!isVk2AdminContext() && artworkCategory === 'keramik' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '0.75rem',
                  alignItems: 'start'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.8rem',
                      color: '#8fa0c9',
                      fontWeight: '500'
                    }}>
                      Unterkategorie *
                    </label>
                    <select
                      value={artworkCeramicSubcategory}
                      onChange={(e) => {
                        const newSubcategory = e.target.value as 'vase' | 'teller' | 'skulptur' | 'sonstig'
                        setArtworkCeramicSubcategory(newSubcategory)
                        setArtworkCeramicHeight('10')
                        setArtworkCeramicDiameter('10')
                        setArtworkCeramicDescription('')
                        setArtworkCeramicType('steingut')
                        setArtworkCeramicSurface('mischtechnik')
                        // Setze Titel automatisch auf Unterkategorie-Bezeichnung
                        const subcategoryLabels: Record<string, string> = {
                          'vase': 'Gefäße - Vasen',
                          'teller': 'Schalen - Teller',
                          'skulptur': 'Skulptur',
                          'sonstig': 'Sonstig'
                        }
                        setArtworkTitle(subcategoryLabels[newSubcategory] || 'Keramik')
                      }}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="vase">Gefäße - Vasen</option>
                      <option value="teller">Schalen - Teller</option>
                      <option value="skulptur">Skulptur</option>
                      <option value="sonstig">Sonstig</option>
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.8rem',
                      color: '#8fa0c9',
                      fontWeight: '500'
                    }}>
                      Beschreibung *
                    </label>
                    <select
                      value={artworkCeramicType}
                      onChange={(e) => setArtworkCeramicType(e.target.value as 'steingut' | 'steinzeug')}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="steingut">Steingut (porös, nicht wasserdicht, niedrig gebrannt)</option>
                      <option value="steinzeug">Steinzeug (dicht gebrannt, wasserundurchlässig)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.8rem',
                      color: '#8fa0c9',
                      fontWeight: '500'
                    }}>
                      Oberfläche *
                    </label>
                    <select
                      value={artworkCeramicSurface}
                      onChange={(e) => setArtworkCeramicSurface(e.target.value as 'engobe' | 'glasur' | 'mischtechnik')}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="mischtechnik">Mischtechnik</option>
                      <option value="engobe">Engobe</option>
                      <option value="glasur">Glasur</option>
                    </select>
                  </div>
                </div>
              )}
              {/* Keramik-Maße (nur K2, nicht VK2) */}
              {!isVk2AdminContext() && artworkCategory === 'keramik' && (
                <>
                  {(artworkCeramicSubcategory === 'vase' || artworkCeramicSubcategory === 'skulptur') && (
                    <div style={{ minWidth: '120px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.4rem',
                        fontSize: '0.8rem',
                        color: '#8fa0c9',
                        fontWeight: '500'
                      }}>
                        Höhe (cm) *
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={artworkCeramicHeight || '10'}
                          onChange={(e) => setArtworkCeramicHeight(e.target.value)}
                          style={{
                            width: '100%',
                            height: '6px',
                            borderRadius: '3px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.2rem',
                          flexWrap: 'wrap'
                        }}>
                          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((val) => (
                            <div
                              key={val}
                              style={{
                                flex: '0 0 auto',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '0.2rem 0.3rem',
                                background: artworkCeramicHeight === String(val) 
                                  ? 'rgba(95, 251, 241, 0.3)' 
                                  : 'rgba(255, 255, 255, 0.05)',
                                border: artworkCeramicHeight === String(val)
                                  ? '1px solid rgba(95, 251, 241, 0.5)'
                                  : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                color: artworkCeramicHeight === String(val) ? '#5ffbf1' : '#8fa0c9',
                                fontWeight: artworkCeramicHeight === String(val) ? '600' : '400',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minWidth: '28px'
                              }}
                              onClick={() => setArtworkCeramicHeight(String(val))}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="10"
                            max="100"
                            step="5"
                            value={artworkCeramicHeight || '10'}
                            onChange={(e) => {
                              const val = e.target.value
                              const numVal = parseFloat(val)
                              // Nur 5cm-Schritte erlauben
                              if (val === '' || (numVal >= 10 && numVal <= 100 && numVal % 5 === 0)) {
                                setArtworkCeramicHeight(val)
                              } else if (numVal >= 10 && numVal <= 100) {
                                // Runde auf nächsten 5cm-Schritt
                                const rounded = Math.round(numVal / 5) * 5
                                setArtworkCeramicHeight(String(rounded))
                              }
                            }}
                            style={{
                              width: '70px',
                              padding: '0.4rem',
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '0.85rem'
                            }}
                          />
                          <span style={{ color: '#8fa0c9', fontSize: '0.8rem', fontWeight: '600' }}>{artworkCeramicHeight || '10'} cm</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {artworkCeramicSubcategory === 'teller' && (
                    <div style={{ minWidth: '120px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.4rem',
                        fontSize: '0.8rem',
                        color: '#8fa0c9',
                        fontWeight: '500'
                      }}>
                        Durchmesser (cm) *
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={artworkCeramicDiameter || '10'}
                          onChange={(e) => setArtworkCeramicDiameter(e.target.value)}
                          style={{
                            width: '100%',
                            height: '6px',
                            borderRadius: '3px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.2rem',
                          flexWrap: 'wrap'
                        }}>
                          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((val) => (
                            <div
                              key={val}
                              style={{
                                flex: '0 0 auto',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '0.2rem 0.3rem',
                                background: artworkCeramicDiameter === String(val) 
                                  ? 'rgba(95, 251, 241, 0.3)' 
                                  : 'rgba(255, 255, 255, 0.05)',
                                border: artworkCeramicDiameter === String(val)
                                  ? '1px solid rgba(95, 251, 241, 0.5)'
                                  : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                color: artworkCeramicDiameter === String(val) ? '#5ffbf1' : '#8fa0c9',
                                fontWeight: artworkCeramicDiameter === String(val) ? '600' : '400',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minWidth: '28px'
                              }}
                              onClick={() => setArtworkCeramicDiameter(String(val))}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="10"
                            max="100"
                            step="5"
                            value={artworkCeramicDiameter || '10'}
                            onChange={(e) => {
                              const val = e.target.value
                              const numVal = parseFloat(val)
                              // Nur 5cm-Schritte erlauben
                              if (val === '' || (numVal >= 10 && numVal <= 100 && numVal % 5 === 0)) {
                                setArtworkCeramicDiameter(val)
                              } else if (numVal >= 10 && numVal <= 100) {
                                // Runde auf nächsten 5cm-Schritt
                                const rounded = Math.round(numVal / 5) * 5
                                setArtworkCeramicDiameter(String(rounded))
                              }
                            }}
                            style={{
                              width: '70px',
                              padding: '0.4rem',
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '0.85rem'
                            }}
                          />
                          <span style={{ color: '#8fa0c9', fontSize: '0.8rem', fontWeight: '600' }}>{artworkCeramicDiameter || '10'} cm</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {artworkCeramicSubcategory === 'sonstig' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.4rem',
                        fontSize: '0.8rem',
                        color: '#8fa0c9',
                        fontWeight: '500'
                      }}>
                        Beschreibung *
                      </label>
                      <textarea
                        value={artworkCeramicDescription}
                        onChange={(e) => setArtworkCeramicDescription(e.target.value)}
                        placeholder="Beschreibe das Werk..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.9rem',
                          outline: 'none',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Malerei Bildgröße */}
              {artworkCategory !== 'keramik' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  alignItems: 'start'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.8rem',
                      color: '#8fa0c9',
                      fontWeight: '500'
                    }}>
                      Breite (cm)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={artworkPaintingWidth}
                      onChange={(e) => setArtworkPaintingWidth(e.target.value)}
                      placeholder="z.B. 50"
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.8rem',
                      color: '#8fa0c9',
                      fontWeight: '500'
                    }}>
                      Höhe (cm)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={artworkPaintingHeight}
                      onChange={(e) => setArtworkPaintingHeight(e.target.value)}
                      placeholder="z.B. 70"
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Technik/Material + Maße */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#8fa0c9', fontWeight: '500' }}>
                    Technik / Material
                  </label>
                  <input type="text" value={artworkTechnik} onChange={e => setArtworkTechnik(e.target.value)}
                    placeholder="z.B. Acryl auf Leinwand"
                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#8fa0c9', fontWeight: '500' }}>
                    Maße (z.B. 60×80 cm)
                  </label>
                  <input type="text" value={artworkDimensions} onChange={e => setArtworkDimensions(e.target.value)}
                    placeholder="Breite × Höhe cm"
                    style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Weitere Felder - Kompakt Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px',
                gap: '0.75rem',
                alignItems: 'start'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontSize: '0.8rem',
                    color: '#8fa0c9',
                    fontWeight: '500'
                  }}>
                    Künstler (optional)
                  </label>
                  <input
                    type="text"
                    value={artworkArtist}
                    onChange={(e) => setArtworkArtist(e.target.value)}
                    placeholder={['malerei', 'grafik', 'sonstiges'].includes(artworkCategory) ? 'Martina Kreinecker' : 'Georg Kreinecker'}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontSize: '0.8rem',
                    color: '#8fa0c9',
                    fontWeight: '500'
                  }}>
                    Preis (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={artworkPrice}
                    onChange={(e) => setArtworkPrice(e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontSize: '0.8rem',
                    color: '#8fa0c9',
                    fontWeight: '500'
                  }}>
                    Stückzahl
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={artworkQuantity}
                    onChange={(e) => setArtworkQuantity(e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: '80px',
                      padding: '0.6rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Beschreibung */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.4rem',
                  fontSize: '0.8rem',
                  color: '#8fa0c9',
                  fontWeight: '500'
                }}>
                  Beschreibung (optional)
                </label>
                <textarea
                  value={artworkDescription}
                  onChange={(e) => setArtworkDescription(e.target.value)}
                  placeholder="Optionale Beschreibung..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Shop-Checkbox */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                }}
                >
                  <input
                    type="checkbox"
                    checked={isInShop}
                    onChange={(e) => setIsInShop(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#8fa0c9' }}>
                    Im Online-Shop verfügbar
                  </span>
                </label>
              </div>

              </>
              )}

              {/* Aktionen - Kompakt */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <button 
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingArtwork(null)
                    setArtworkTitle('')
                    setArtworkCategory('malerei')
                    setArtworkCeramicSubcategory('vase')
                    setArtworkCeramicHeight('10')
                    setArtworkCeramicDiameter('10')
                    setArtworkCeramicDescription('')
                    setArtworkPaintingWidth('')
                    setArtworkPaintingHeight('')
                    setArtworkArtist('')
                    setArtworkDescription('')
                    setArtworkPrice('')
                    setArtworkQuantity('1')
                    setSelectedFile(null)
                    setPreviewUrl(null)
                    setIsInShop(true)
      setIsImVereinskatalog(false)
                  }}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Abbrechen
                </button>
                <button 
                  type="button"
                  disabled={isSavingArtwork}
                  onClick={handleSaveArtwork}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: isSavingArtwork ? 'rgba(100, 100, 100, 0.6)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: isSavingArtwork ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    opacity: isSavingArtwork ? 0.9 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isSavingArtwork) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  {isSavingArtwork ? '⏳ Wird gespeichert…' : '💾 Speichern'}
                </button>
              </div>
              </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Druck-Modal – auf Mobil: Buttons zuerst, kurzer Weg (ein Tipp = Download) */}
      {showPrintModal && savedArtwork && (
        <div className="admin-modal-overlay" onClick={() => setShowPrintModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h2>Etikett drucken</h2>
              <button className="admin-modal-close" onClick={() => setShowPrintModal(false)}>×</button>
            </div>
            <div className="admin-modal-content">
              <div style={{ textAlign: 'center', padding: isMobile ? '0.75rem' : '1rem' }}>
                <div style={{ fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 'bold', color: '#8b6914', marginBottom: isMobile ? '0.5rem' : '0.75rem' }}>
                  {savedArtwork.number}
                </div>
                {/* Ein Button – universeller Weg für alle Drucker */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: isMobile ? '1rem' : '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => { handleShareLabel(); setShowPrintModal(false) }}
                    style={{
                      padding: '1.1rem 1.5rem',
                      fontSize: isMobile ? '1.15rem' : '1rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(34,197,94,0.4)',
                      touchAction: 'manipulation'
                    }}
                  >
                    🖨️ Etikett drucken
                  </button>
                  <div style={{ fontSize: '0.82rem', color: '#555', background: '#f8f7f5', borderRadius: 8, padding: '0.6rem 0.75rem', lineHeight: 1.6 }}>
                    <strong>Teilen-Menü öffnet sich</strong> – dann:<br />
                    • <strong>Etikettendrucker</strong> (Brother, Dymo, …) → Drucker-App wählen<br />
                    • <strong>WLAN-Drucker</strong> (AirPrint) → Drucker direkt wählen<br />
                    • <strong>Speichern</strong> → Bild in Foto-App → von dort drucken
                  </div>
                  <button type="button" className="btn-secondary" onClick={() => setShowPrintModal(false)}>
                    Später drucken
                  </button>
                </div>
                {(() => {
                  const printTenant = getCurrentTenantId()
                  const previewSettings = loadPrinterSettingsForTenant(printTenant)
                  const lm = parseLabelSize(previewSettings.labelSize)
                  const scale = isMobile ? 3 : 4
                  const pw = Math.round(lm.width * scale)
                  const ph = Math.round(lm.height * scale)
                  return (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#999', marginBottom: '2px' }}>
                        Vorschau ({previewSettings.labelSize} mm)
                      </div>
                      <div style={{
                        width: pw + 'px',
                        height: ph + 'px',
                        margin: '0 auto',
                        border: '1px solid #8b6914',
                        borderRadius: '4px',
                        padding: '4px',
                        background: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                      }}>
                        <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#8b6914' }}>K2 Galerie</div>
                        <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#8b6914' }}>{savedArtwork.number}</div>
                        <div style={{ fontSize: '6px', color: '#666', textAlign: 'center', wordBreak: 'break-word', maxWidth: '100%' }}>
                          {(savedArtwork.title || '').substring(0, 18)}{(savedArtwork.title || '').length > 18 ? '…' : ''}
                        </div>
                        <div style={{ minWidth: '66px', minHeight: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
                          <img src={getQRCodeUrl(savedArtwork.number)} alt="QR" style={{ width: '66px', height: '66px', display: 'block' }} />
                        </div>
                        <div style={{ fontSize: '6px', color: '#999' }}>
                          {getCategoryLabel(savedArtwork.category)} • {(savedArtwork.artist || '').substring(0, 10)}
                        </div>
                      </div>
                    </div>
                  )
                })()}
                <details style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666', textAlign: 'left' }}>
                  <summary style={{ cursor: 'pointer' }}>Werk-Details</summary>
                  <div style={{ padding: '0.5rem 0', borderTop: '1px solid #eee', marginTop: '0.25rem' }}>
                    <p style={{ margin: '0.25rem 0' }}><strong>Kategorie:</strong> {getCategoryLabel(savedArtwork.category)}</p>
                    <p style={{ margin: '0.25rem 0' }}><strong>Künstler:</strong> {savedArtwork.artist}</p>
                    {savedArtwork.category === 'malerei' && savedArtwork.paintingWidth && savedArtwork.paintingHeight && (
                      <p style={{ margin: '0.25rem 0' }}><strong>Größe:</strong> {savedArtwork.paintingWidth} × {savedArtwork.paintingHeight} cm</p>
                    )}
                    {savedArtwork.category === 'keramik' && (savedArtwork.ceramicHeight || savedArtwork.ceramicDiameter) && (
                      <p style={{ margin: '0.25rem 0' }}>
                        {savedArtwork.ceramicSubcategory === 'teller' ? `Ø ${savedArtwork.ceramicDiameter} cm` : `H ${savedArtwork.ceramicHeight} cm`}
                      </p>
                    )}
                  </div>
                </details>
                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                  AirPrint (QL-820NWBc): „Jetzt drucken“ → Brother wählen (im Dialog ggf. „QL-820NWB“ ohne c). Papier: 29×90,3 mm, 100 %.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Etikett-Druck: ein Bild im Hauptfenster (nur bei Druck sichtbar, index.css @media print) */}
      {printLabelData && typeof document !== 'undefined' && document.body && createPortal(
        <div
          id="k2-print-label"
          style={{
            display: 'none',
            position: 'fixed',
            left: 0,
            top: 0,
            width: `${printLabelData.widthMm}mm`,
            height: `${printLabelData.heightMm}mm`,
            background: '#fff'
          }}
          aria-hidden="true"
        >
          <img
            src={printLabelData.url}
            alt={`Etikett ${savedArtwork?.number || ''}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        </div>,
        document.body
      )}

      {/* Teilen-Fallback Overlay: Bild + „Etikett teilen“ oder „Etikett herunterladen“ (neutral, kein blaues Rahmen) */}
      {showShareFallbackOverlay && shareFallbackImageUrl && savedArtwork && (
        <div className="admin-modal-overlay" onClick={closeShareFallbackOverlay}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <div className="admin-modal-header">
              <h2>{canUseShare ? 'Etikett teilen' : 'Etikett herunterladen'}</h2>
              <button className="admin-modal-close" onClick={closeShareFallbackOverlay}>×</button>
            </div>
            <div className="admin-modal-content" style={{ padding: '1rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#8b6914' }}>Etikett {savedArtwork.number}</p>
              <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, margin: '0.5rem 0' }}>
                <img src={shareFallbackImageUrl} alt="Etikett" style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', border: 'none', outline: 'none' }} />
              </div>
              {canUseShare ? (
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.75rem 0' }}>→ Brother iPrint &amp; Label wählen</p>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.75rem 0' }}>Datei öffnen → Brother iPrint &amp; Label → Drucken</p>
              )}
              <button
                type="button"
                onClick={handleShareFromFallbackOverlay}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                {canUseShare ? '📤 Etikett teilen' : '⬇️ Etikett herunterladen'}
              </button>
              <button type="button" className="btn-secondary" onClick={closeShareFallbackOverlay} style={{ marginTop: '0.5rem' }}>
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verkaufs-Modal */}
      {showSaleModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSaleModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h2>Werk als verkauft markieren</h2>
              <button className="admin-modal-close" onClick={() => setShowSaleModal(false)}>×</button>
            </div>
            <div className="admin-modal-content">
              {/* Methode wählen */}
              <div className="field" style={{ marginBottom: '1.5rem' }}>
                <label>Methode</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    className={saleMethod === 'scan' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setSaleMethod('scan')}
                    style={{ flex: 1 }}
                  >
                    📷 QR-Code scannen
                  </button>
                  <button
                    className={saleMethod === 'manual' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setSaleMethod('manual')}
                    style={{ flex: 1 }}
                  >
                    ⌨️ Seriennummer eingeben
                  </button>
                </div>
              </div>

              {/* QR-Code Scanner */}
              {saleMethod === 'scan' && (
                <div className="scan-area">
                  <div className="upload-placeholder" style={{ padding: '2rem' }}>
                    <div className="upload-icon">📷</div>
                    <p>QR-Code mit Kamera scannen</p>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          // QR-Code aus Bild lesen
                          const qrText = await readQRCodeFromImage(file)
                          if (qrText) {
                            // QR-Code enthält Werk-Nummer oder URL
                            const match = qrText.match(/K2-\d{4}/) || qrText.match(/werk=([^&]+)/)
                            if (match) {
                              const artworkNum = match[1] || match[0]
                              handleMarkAsSold(artworkNum)
                            } else {
                              alert('QR-Code konnte nicht gelesen werden. Bitte Seriennummer manuell eingeben.')
                              setSaleMethod('manual')
                            }
                          } else {
                            // Fallback: Manuelle Eingabe
                            alert('QR-Code-Scan: Bitte Seriennummer manuell eingeben.\n\nFormat: K2-0001')
                            setSaleMethod('manual')
                          }
                        }
                      }}
                      style={{ display: 'none' }}
                      id="qr-scanner-input"
                    />
                    <label htmlFor="qr-scanner-input" className="btn-primary" style={{ marginTop: '1rem', cursor: 'pointer' }}>
                      📷 Kamera öffnen
                    </label>
                    <p className="upload-hint" style={{ marginTop: '1rem' }}>
                      Auf iPhone/iPad: Kamera öffnet sich automatisch
                    </p>
                  </div>
                </div>
              )}

              {/* Seriennummer Eingabe */}
              {saleMethod === 'manual' && (
                <div className="field">
                  <label>Seriennummer eingeben</label>
                  <input
                    type="text"
                    value={saleInput}
                    onChange={(e) => setSaleInput(e.target.value.toUpperCase())}
                    placeholder="z.B. K2-0001"
                    style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.1em' }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && saleInput.trim()) {
                        handleMarkAsSold(saleInput.trim())
                      }
                    }}
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                    Format: K2-0001, K2-0002, etc.
                  </small>
                </div>
              )}

              {/* Aktionen */}
              <div className="admin-modal-actions">
                <button className="btn-secondary" onClick={() => {
                  setShowSaleModal(false)
                  setSaleInput('')
                  setSaleMethod('scan')
                }}>
                  Abbrechen
                </button>
                {saleMethod === 'manual' && saleInput.trim() && (
                  <button className="btn-primary" onClick={() => handleMarkAsSold(saleInput.trim())}>
                    Als verkauft markieren
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservierungs-Modal */}
      {showReserveModal && (
        <div className="admin-modal-overlay" onClick={() => setShowReserveModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h2>🔶 Werk reservieren</h2>
              <button className="admin-modal-close" onClick={() => setShowReserveModal(false)}>×</button>
            </div>
            <div className="admin-modal-content">
              <div className="field" style={{ marginBottom: '1.5rem' }}>
                <label>Methode</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className={reserveMethod === 'scan' ? 'btn-primary' : 'btn-secondary'} onClick={() => setReserveMethod('scan')} style={{ flex: 1 }}>📷 QR-Code scannen</button>
                  <button className={reserveMethod === 'manual' ? 'btn-primary' : 'btn-secondary'} onClick={() => setReserveMethod('manual')} style={{ flex: 1 }}>⌨️ Seriennummer eingeben</button>
                </div>
              </div>

              {reserveMethod === 'scan' && (
                <div className="scan-area">
                  <div className="upload-placeholder" style={{ padding: '2rem' }}>
                    <div className="upload-icon">📷</div>
                    <p>QR-Code mit Kamera scannen</p>
                    <input type="file" accept="image/*" capture="environment"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const qrText = await readQRCodeFromImage(file)
                          if (qrText) {
                            const match = qrText.match(/K2-\d{4}/) || qrText.match(/werk=([^&]+)/)
                            if (match) { handleMarkAsReserved(match[1] || match[0], reserveName) }
                            else { alert('QR-Code nicht lesbar. Bitte manuell eingeben.'); setReserveMethod('manual') }
                          } else { setReserveMethod('manual') }
                        }
                      }}
                      style={{ display: 'none' }} id="qr-reserve-input" />
                    <label htmlFor="qr-reserve-input" className="btn-primary" style={{ marginTop: '1rem', cursor: 'pointer' }}>📷 Kamera öffnen</label>
                  </div>
                </div>
              )}

              {reserveMethod === 'manual' && (
                <div className="field">
                  <label>Seriennummer</label>
                  <input type="text" value={reserveInput} onChange={(e) => setReserveInput(e.target.value.toUpperCase())}
                    placeholder="z.B. K2-0001" style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.1em' }}
                    onKeyPress={(e) => { if (e.key === 'Enter' && reserveInput.trim()) handleMarkAsReserved(reserveInput.trim(), reserveName) }} />
                </div>
              )}

              <div className="field" style={{ marginTop: '1rem' }}>
                <label>Reserviert für (optional)</label>
                <input type="text" value={reserveName} onChange={(e) => setReserveName(e.target.value)}
                  placeholder="Name des Interessenten" />
              </div>

              <div className="admin-modal-actions">
                <button className="btn-secondary" onClick={() => { setShowReserveModal(false); setReserveInput(''); setReserveName(''); setReserveMethod('scan') }}>Abbrechen</button>
                {reserveMethod === 'manual' && reserveInput.trim() && (
                  <button className="btn-primary" style={{ background: '#d97706' }} onClick={() => handleMarkAsReserved(reserveInput.trim(), reserveName)}>
                    🔶 Reservieren
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Nahtloser Guide-Begleiter im Admin ─────────────────────────────── */}
      {/* Erscheint wenn User über Guide-Flow hereinkam – begleitet bis Schritt 1 erledigt */}
      {/* Alter Guide-Begleiter entfernt – Hub-Dialog GlobaleGuideBegleitung übernimmt */}

    </div>
  )
}

// ============================================================================
// EXPORT-BLOCK - KRITISCH: NUR EINMAL EXPORTIEREN!
// ============================================================================
// ⚠️ WICHTIG: Doppelte Exports verursachen Build-Fehler!
// ⚠️ Diese Zeilen NICHT duplizieren oder kopieren!
// ⚠️ Vite Plugin prüft automatisch auf Duplikate beim Build!
// ============================================================================
export default ScreenshotExportAdmin
export { ScreenshotExportAdmin }
// ============================================================================