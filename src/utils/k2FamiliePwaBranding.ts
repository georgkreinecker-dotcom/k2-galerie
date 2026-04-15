/**
 * PWA / „Zum Home-Bildschirm“: Manifest, Icon und Kurztitel je Kontext umschalten,
 * damit K2 Familie nicht dasselbe Symbol wie die K2-Galerie nutzt.
 *
 * Zusätzlich: `public/manifest.json` und `public/manifest-k2-familie.json` haben jeweils ein
 * eigenes Manifest-`id` (k2-galerie-pwa / k2-familie-pwa), damit Browser nicht beide
 * als dieselbe Installation mit Galerie-start_url behandeln.
 *
 * Familie: `start_url` = `/familie` (Kurz-URL, klar getrennt von Galerie `/galerie` und
 * von `/projects/k2-galerie/...`). Die SPA rendert dieselbe Startseite unter `/familie`
 * und unter `/projects/k2-familie/meine-familie` – ohne Redirect, damit Lesezeichen und
 * „Zum Home-Bildschirm“ die kurze Adresse behalten.
 */

/** Kurz-URL für K2 Familie (Manifest start_url, Nav „Meine Familie“). */
export const K2_FAMILIE_APP_SHORT_PATH = '/familie'

const MEINE_FAMILIE_LONG = '/projects/k2-familie/meine-familie'

/** Einstieg „Meine Familie“ – kurze oder lange URL (gleiche Seite). */
export function isK2FamilieMeineFamilieHomePath(pathname: string): boolean {
  const p = (pathname || '/').replace(/\/$/, '') || '/'
  return p === K2_FAMILIE_APP_SHORT_PATH || p === MEINE_FAMILIE_LONG
}

export function isK2FamiliePublicPath(pathname: string): boolean {
  return (
    pathname.startsWith('/projects/k2-familie') ||
    pathname.startsWith('/k2-familie-handbuch') ||
    pathname === '/familie' ||
    pathname === '/familie/'
  )
}

export function applyK2FamiliePwaBranding(pathname: string): void {
  if (typeof document === 'undefined') return
  const familie = isK2FamiliePublicPath(pathname)

  const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
  if (manifestLink) {
    manifestLink.setAttribute('href', familie ? '/manifest-k2-familie.json' : '/manifest.json')
  }

  let apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')
  if (!apple) {
    apple = document.createElement('link')
    apple.rel = 'apple-touch-icon'
    document.head.appendChild(apple)
  }
  apple.href = familie ? '/k2-familie-icon-192.png' : '/icon-192.png'

  let appTitle = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]')
  if (!appTitle) {
    appTitle = document.createElement('meta')
    appTitle.setAttribute('name', 'apple-mobile-web-app-title')
    document.head.appendChild(appTitle)
  }
  appTitle.content = familie ? 'K2 Familie' : 'K2 Galerie'

  let theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!theme) {
    theme = document.createElement('meta')
    theme.setAttribute('name', 'theme-color')
    document.head.appendChild(theme)
  }
  theme.content = familie ? '#b54a1e' : '#1a0f0a'

  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (favicon) {
    favicon.href = familie ? '/k2-familie-icon-192.png' : '/vite.svg'
  }
}
