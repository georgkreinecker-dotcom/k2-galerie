/**
 * PWA / „Zum Home-Bildschirm“: Manifest, Icon und Kurztitel je Kontext umschalten,
 * damit K2 Familie und APf nicht dasselbe Symbol wie die K2-Galerie nutzen.
 *
 * Manifest-`id`s:
 * - Galerie: `k2-galerie-pwa` → `manifest.json` (start_url /galerie)
 * - Familie: `k2-familie-pwa` → `manifest-k2-familie.json` (start_url /familie)
 * - APf: `k2-apf-pwa` → `manifest-apf.json` (start_url /dev-view)
 *
 * Familie: `start_url` = volle Vercel-URL auf `/familie` (iOS zuverlässiger).
 * APf: volle URL auf `/dev-view`. Install nur von diesen Pfaden (boot-manifest.js + hier).
 * Letzte Unterroute Familie: `familiePwaLastPath.ts` + `K2FamilieLayout`.
 */

import { isApfPwaPath } from './apfPwaBranding'

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

type PwaBrand = 'familie' | 'apf' | 'galerie'

function resolvePwaBrand(pathname: string): PwaBrand {
  if (isK2FamiliePublicPath(pathname)) return 'familie'
  if (isApfPwaPath(pathname)) return 'apf'
  return 'galerie'
}

export function applyK2FamiliePwaBranding(pathname: string): void {
  if (typeof document === 'undefined') return
  const brand = resolvePwaBrand(pathname)

  const manifestHref =
    brand === 'familie'
      ? '/manifest-k2-familie.json'
      : brand === 'apf'
        ? '/manifest-apf.json'
        : '/manifest.json'

  const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
  if (manifestLink) {
    manifestLink.setAttribute('href', manifestHref)
  }

  let apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')
  if (!apple) {
    apple = document.createElement('link')
    apple.rel = 'apple-touch-icon'
    document.head.appendChild(apple)
  }
  apple.href =
    brand === 'familie'
      ? '/k2-familie-icon-192.png'
      : brand === 'apf'
        ? '/apf-icon-192.png'
        : '/icon-192.png'

  let appTitle = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]')
  if (!appTitle) {
    appTitle = document.createElement('meta')
    appTitle.setAttribute('name', 'apple-mobile-web-app-title')
    document.head.appendChild(appTitle)
  }
  appTitle.content = brand === 'familie' ? 'K2 Familie' : brand === 'apf' ? 'APf' : 'K2 Galerie'

  let theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!theme) {
    theme = document.createElement('meta')
    theme.setAttribute('name', 'theme-color')
    document.head.appendChild(theme)
  }
  theme.content = brand === 'familie' ? '#b54a1e' : brand === 'apf' ? '#0d1b2a' : '#1a0f0a'

  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (favicon) {
    favicon.href =
      brand === 'familie'
        ? '/k2-familie-icon-192.png'
        : brand === 'apf'
          ? '/apf-icon-192.png'
          : '/vite.svg'
  }
}
