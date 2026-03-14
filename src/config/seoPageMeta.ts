/**
 * SEO: Seitentitel und Meta-Beschreibung pro Route (für Suchmaschinen).
 * Sichtbarkeit & Werbung – Punkt 1: Technik prüfen.
 * Keine Doppelungen, keine leeren Titel.
 */

export interface PageMeta {
  title: string
  description: string
}

/** Default = Galerie-Seite (K2 Galerie = im Netz aktiv für Google/Besucher). */
const DEFAULT_META: PageMeta = {
  title: 'K2 Galerie – Kunst & Keramik',
  description: 'K2 Galerie – Entdecke die Verbindung von Malerei und Keramik. Werke von Martina und Georg Kreinecker.',
}

/** SEO pro Route: Galerie-Routen = K2 Galerie (im Netz aktiv). Plattform/Rechtliches/Demo = kgm solution. */
const ROUTE_META: { path: string | RegExp; meta: PageMeta }[] = [
  { path: '/willkommen', meta: { title: 'Willkommen – kgm solution', description: 'Willkommen bei kgm solution – K2 Galerie. Galerie ausprobieren, Lizenz anfragen oder online kaufen.' } },
  { path: '/entdecken', meta: { title: 'Entdecken – kgm solution', description: 'kgm solution – Plattform für den gesamten Markt (Ideen, Produkte). Kunstmarkt ist der Einstieg.' } },
  { path: '/agb', meta: { title: 'AGB – kgm solution', description: 'Allgemeine Geschäftsbedingungen von kgm solution – Nutzung, Lizenzen, Vertrag.' } },
  { path: '/galerie', meta: { title: 'Galerie – K2 Galerie', description: 'K2 Galerie – Werke von Martina und Georg Kreinecker. Malerei, Keramik, Grafik und Skulptur.' } },
  { path: '/projects/k2-galerie/galerie', meta: { title: 'Galerie – K2 Galerie', description: 'K2 Galerie – Werke von Martina und Georg Kreinecker. Malerei, Keramik, Grafik und Skulptur.' } },
  { path: '/projects/k2-galerie/galerie-oeffentlich', meta: { title: 'Demo-Galerie – kgm solution', description: 'Fokus gesamter Markt – Ideen und Produkte. Kunstmarkt = Einstieg. ök2 Demo. kgm solution.' } },
  { path: '/projects/k2-galerie/galerie-oeffentlich-vorschau', meta: { title: 'Demo Vorschau – kgm solution', description: 'Vorschau der Demo – Fokus gesamter Markt (Ideen, Produkte). Kunstmarkt = Einstieg. kgm solution.' } },
  { path: '/projects/k2-galerie/galerie-vorschau', meta: { title: 'Galerie Vorschau – K2 Galerie', description: 'Vorschau der K2 Galerie – so sehen Besucher die Werke.' } },
  { path: '/projects/k2-galerie/shop', meta: { title: 'Shop – K2 Galerie', description: 'Shop der K2 Galerie – Kunstwerke und Keramik.' } },
  { path: '/projects/k2-galerie/virtueller-rundgang', meta: { title: 'Virtueller Rundgang – K2 Galerie', description: 'Virtueller Rundgang durch die K2 Galerie.' } },
  { path: '/projects/k2-galerie/vita/martina', meta: { title: 'Vita Martina – K2 Galerie', description: 'Vita und Werdegang von Martina Kreinecker – K2 Galerie Kunst & Keramik.' } },
  { path: '/projects/k2-galerie/vita/georg', meta: { title: 'Vita Georg – K2 Galerie', description: 'Vita und Werdegang von Georg Kreinecker – K2 Galerie Kunst & Keramik.' } },
  { path: /^\/projects\/vk2\/galerie/, meta: { title: 'VK2 Galerie', description: 'Vereinsgalerie VK2 – für alle Vereinstypen. Kunstvereine = Einstieg. Werke und Veranstaltungen.' } },
  { path: '/projects/k2-familie', meta: { title: 'K2 Familie', description: 'K2 Familie – Stammbaum, Momente und Erinnerungen gemeinsam pflegen.' } },
]

function matchPath(pathname: string): PageMeta {
  for (const { path, meta } of ROUTE_META) {
    if (typeof path === 'string') {
      if (pathname === path || pathname.startsWith(path + '/')) return meta
    } else if (path.test(pathname)) {
      return meta
    }
  }
  return DEFAULT_META
}

/**
 * Liefert Titel und Meta-Description für die aktuelle pathname.
 * Für useDocumentHead (App.tsx).
 */
export function getPageMeta(pathname: string): PageMeta {
  return matchPath(pathname)
}

/**
 * Setzt document.title und das Meta-Tag name="description" im DOM.
 * Aufruf z. B. in useEffect bei pathname-Änderung.
 */
export function applyPageMeta(meta: PageMeta): void {
  if (typeof document === 'undefined') return
  document.title = meta.title
  let el = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (!el) {
    el = document.createElement('meta')
    el.name = 'description'
    document.head.appendChild(el)
  }
  el.content = meta.description
}
