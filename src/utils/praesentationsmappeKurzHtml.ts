import QRCode from 'qrcode'
import { BASE_APP_URL, PROJECT_ROUTES } from '../config/navigation'
import { BUILD_TIMESTAMP } from '../buildInfo.generated'
import {
  PRODUCT_COPYRIGHT,
  PRODUCT_LIZENZ_ANFRAGE_EMAIL,
  PRODUCT_WERBESLOGAN,
  PRODUCT_WERBESLOGAN_2,
  K2_STAMMDATEN_DEFAULTS,
  MUSTER_TEXTE,
  TENANT_CONFIGS,
} from '../config/tenantConfig'
import { loadStammdaten } from './stammdatenStorage'
import { buildQrUrlWithBust } from '../hooks/useServerBuildTimestamp'

export type PraesentationsmappeKurzVariant = 'k2' | 'oeffentlich'

function escapeHtml(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Für Admin-Werbemittel (QR-Plakat, …) – gleicher Stand wie Galerie-QR. */
export async function fetchQrVersionTs(): Promise<number> {
  try {
    const r = await fetch('/api/build-info', { cache: 'no-store' })
    if (r.ok) {
      const j = await r.json()
      if (typeof j?.timestamp === 'number') return j.timestamp
    }
  } catch {
    /* ignore */
  }
  try {
    const r = await fetch('https://k2-galerie.vercel.app/api/build-info', { cache: 'no-store' })
    if (r.ok) {
      const j = await r.json()
      if (typeof j?.timestamp === 'number') return j.timestamp
    }
  } catch {
    /* ignore */
  }
  return BUILD_TIMESTAMP
}

/** HTML für Präsentationsmappe Kurz (1 Seite) – Daten wie auf PraesentationsmappePage. */
export function buildPraesentationsmappeKurzHtmlDocument(opts: {
  variant: PraesentationsmappeKurzVariant
  qrVersionTs: number
  qrOek2DataUrl: string
  qrVk2DataUrl: string
}): string {
  const isOeffentlich = opts.variant === 'oeffentlich'
  const oek2Path = PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
  const oek2Url = BASE_APP_URL + oek2Path
  const vk2Url = BASE_APP_URL + '/projects/vk2'
  const willkommenUrl = BASE_APP_URL + '/willkommen'

  const bustOek2 = buildQrUrlWithBust(oek2Url, opts.qrVersionTs)
  const bustVk2 = buildQrUrlWithBust(vk2Url, opts.qrVersionTs)
  const bustWillkommen = buildQrUrlWithBust(willkommenUrl, opts.qrVersionTs)

  let coverTitle: string
  let impressumHtml: string

  if (isOeffentlich) {
    const g = MUSTER_TEXTE.gallery
    coverTitle = escapeHtml(g.firmenname || TENANT_CONFIGS.oeffentlich.galleryName)
    impressumHtml = `<p><strong>Impressum</strong><br/>Medieninhaber: K2 Galerie · Demo (ök2) – nur Mustertexte, keine K2-Stammdaten.<br/>Kontakt: <a href="mailto:${escapeHtml(MUSTER_TEXTE.gallery.email)}">${escapeHtml(MUSTER_TEXTE.gallery.email)}</a><br/>${escapeHtml(String(PRODUCT_COPYRIGHT))}</p>`
  } else {
    const g =
      typeof window !== 'undefined'
        ? (loadStammdaten('k2', 'gallery') as Record<string, string | undefined>)
        : undefined
    const gAny = g as { name?: string; firmenname?: string } | undefined
    const galleryName = (
      gAny?.name ||
      gAny?.firmenname ||
      K2_STAMMDATEN_DEFAULTS.gallery.name ||
      ''
    ).replace(/&/g, ' & ')
    coverTitle = escapeHtml(galleryName || 'K2 Galerie')
    impressumHtml = `<p><strong>Impressum</strong><br/>Medieninhaber &amp; Herausgeber: K2 Galerie · Design und Entwicklung: kgm solution (G. Kreinecker).<br/>Kontakt: <a href="mailto:${escapeHtml(PRODUCT_LIZENZ_ANFRAGE_EMAIL)}">${escapeHtml(PRODUCT_LIZENZ_ANFRAGE_EMAIL)}</a><br/>${escapeHtml(PRODUCT_COPYRIGHT)}</p>`
  }

  const lead =
    'Für die Kunst gedacht, für den Markt gemacht. Ateliers, Galerien, Kunstvereine. Windows, Android, macOS, iOS · Browser &amp; PWA. Lizenzen: Basic, Pro, Pro+, Pro++, VK2.'

  const s1 = escapeHtml(PRODUCT_WERBESLOGAN)
  const s2 = escapeHtml(PRODUCT_WERBESLOGAN_2)

  return `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"/><title>Präsentationsmappe Kurz</title>
<style>body{font-family:system-ui,sans-serif;max-width:560px;margin:2rem auto;padding:1rem;line-height:1.5;color:#1c1a18;background:#faf8f5}.cover{background:#0c5c55;color:#fff;padding:2rem;border-radius:12px;text-align:center;margin-bottom:1.5rem}.cover h1{margin:0;font-size:1.75rem}.qr{display:flex;flex-wrap:wrap;gap:1rem;margin-top:1rem;padding-top:1rem;border-top:1px solid rgba(13,148,136,0.3)}.qr img{width:110px;height:110px}</style></head><body>
<div class="cover"><h1>${coverTitle}</h1><p><strong>${s1}</strong></p><p>${s2}</p><p style="font-size:0.75rem;opacity:0.9">© kgm solution</p></div>
<p>${lead}</p>
<div class="qr">
<div>${opts.qrOek2DataUrl ? `<img src="${opts.qrOek2DataUrl}" alt=""/>` : ''}<div><strong>ök2 – Demo-Galerie</strong><br/><a href="${escapeHtml(bustOek2)}">${escapeHtml(bustOek2)}</a><br/><span style="font-size:0.85rem">Willkommen: <a href="${escapeHtml(bustWillkommen)}">${escapeHtml(bustWillkommen)}</a></span></div></div>
<div>${opts.qrVk2DataUrl ? `<img src="${opts.qrVk2DataUrl}" alt=""/>` : ''}<div><strong>VK2 – Vereinsplattform</strong><br/><a href="${escapeHtml(bustVk2)}">${escapeHtml(bustVk2)}</a></div></div>
</div>
${impressumHtml}
</body></html>`
}

/** QR erzeugen, HTML bauen – für Admin „Jetzt erstellen“. */
export async function generatePraesentationsmappeKurzHtmlDocument(variant: PraesentationsmappeKurzVariant): Promise<string> {
  const qrVersionTs = await fetchQrVersionTs()
  const oek2Url = BASE_APP_URL + PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
  const vk2Url = BASE_APP_URL + '/projects/vk2'
  const [qrOek2, qrVk2] = await Promise.all([
    QRCode.toDataURL(buildQrUrlWithBust(oek2Url, qrVersionTs), { width: 110, margin: 1 }),
    QRCode.toDataURL(buildQrUrlWithBust(vk2Url, qrVersionTs), { width: 110, margin: 1 }),
  ])
  return buildPraesentationsmappeKurzHtmlDocument({
    variant,
    qrVersionTs,
    qrOek2DataUrl: qrOek2,
    qrVk2DataUrl: qrVk2,
  })
}
