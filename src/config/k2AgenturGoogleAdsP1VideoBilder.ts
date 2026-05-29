/**
 * P1 · Google Ads – Quellbilder für Video-Generator (Präsentationsmappe + App, ök2-Demo).
 * Dateien liegen unter public/google-ads-p1-video-quellen/
 */

export const K2_AGENTUR_GOOGLE_ADS_P1_VIDEO_BILDER_DRUCK_URL =
  '/texte-schreibtisch/google-ads-p1-bilder-video.html'

export const GOOGLE_ADS_P1_VIDEO_QUELLEN_PFAD = '/google-ads-p1-video-quellen'

export type GoogleAdsP1VideoBild = {
  file: string
  titel: string
  quelle: 'Präsentationsmappe' | 'App'
}

/** 12 Bilder – aus ök2-Demo / Präsentationsmappe (keine K2-Echtwerke). */
export const GOOGLE_ADS_P1_VIDEO_BILDER: readonly GoogleAdsP1VideoBild[] = [
  { file: '01-praesentation-willkommen.jpg', titel: 'Willkommen', quelle: 'Präsentationsmappe' },
  { file: '02-praesentation-galerie-werkkarten.png', titel: 'Galerie mit Werkkarten', quelle: 'Präsentationsmappe' },
  { file: '03-praesentation-galerie-karte.jpg', titel: 'Galerie-Karte', quelle: 'Präsentationsmappe' },
  { file: '04-praesentation-entdecken.jpg', titel: 'Entdecken', quelle: 'Präsentationsmappe' },
  { file: '05-praesentation-virtueller-rundgang.jpg', titel: 'Virtueller Rundgang', quelle: 'Präsentationsmappe' },
  { file: '06-app-admin-start.png', titel: 'Admin – Start', quelle: 'App' },
  { file: '07-app-galerie-gestalten.png', titel: 'Galerie gestalten', quelle: 'App' },
  { file: '08-app-werke-verwalten.png', titel: 'Werke verwalten', quelle: 'App' },
  { file: '09-app-kassa.png', titel: 'Kassa', quelle: 'App' },
  { file: '10-app-lizenz.png', titel: 'Lizenz abschließen', quelle: 'App' },
  { file: '11-app-events-marketing.png', titel: 'Events & Marketing', quelle: 'App' },
  { file: '12-app-einstellungen.png', titel: 'Einstellungen', quelle: 'App' },
] as const
