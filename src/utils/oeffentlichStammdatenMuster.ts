/**
 * ök2-Demo: Stammdaten auf MUSTER_TEXTE zurücksetzen (ein geteilter Speicher für alle Pilot-Zettel).
 * Genutzt von Repo-Restore und Zettel-Pilot-Entwurf, wenn der Vorname wechselt.
 */
import { DEFAULT_OEK2_FOCUS_DIRECTION_ID, MUSTER_TEXTE } from '../config/tenantConfig'
import { saveStammdaten } from './stammdatenStorage'

/** Session: zuletzt angewendeter ?vorname= für Entwurf – bei Wechsel → Demo-Reset */
export const SESSION_OEK2_ZETTEL_VORNAME_KEY = 'k2-oek2-zettel-vorname'

export function resetOeffentlichStammdatenToMusterDemo(): void {
  const om = MUSTER_TEXTE.martina
  const og = MUSTER_TEXTE.georg
  const oGal = MUSTER_TEXTE.gallery
  const oGalFd = (oGal as { focusDirections?: readonly string[] }).focusDirections
  const oGalFocus = Array.isArray(oGalFd) && oGalFd.length > 0 ? [oGalFd[0]] : [DEFAULT_OEK2_FOCUS_DIRECTION_ID]
  saveStammdaten(
    'oeffentlich',
    'martina',
    { name: om.name, email: om.email, phone: om.phone, website: om.website ?? '', category: 'malerei', bio: '' },
    { merge: false }
  )
  saveStammdaten(
    'oeffentlich',
    'georg',
    { name: og.name, email: og.email, phone: og.phone, website: og.website ?? '', category: 'keramik', bio: '' },
    { merge: false }
  )
  saveStammdaten(
    'oeffentlich',
    'gallery',
    {
      name: 'Galerie Muster',
      address: oGal.address ?? '',
      city: oGal.city ?? '',
      country: oGal.country ?? '',
      phone: oGal.phone ?? '',
      email: oGal.email ?? '',
      website: oGal.website ?? '',
      internetadresse: oGal.internetadresse ?? '',
      openingHours: oGal.openingHours ?? '',
      openingHoursWeek: (oGal as { openingHoursWeek?: Record<string, string> }).openingHoursWeek ?? {},
      bankverbindung: oGal.bankverbindung ?? '',
      gewerbebezeichnung: (oGal as { gewerbebezeichnung?: string }).gewerbebezeichnung ?? 'freie Kunstschaffende',
      welcomeImage: oGal.welcomeImage ?? '',
      virtualTourImage: oGal.virtualTourImage ?? '',
      galerieCardImage: oGal.galerieCardImage ?? '',
      soldArtworksDisplayDays: 30,
      internetShopNotSetUp: true,
      focusDirections: oGalFocus,
      story: (oGal as { story?: string }).story ?? '',
    },
    { merge: false }
  )

  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('k2-oek2-stammdaten-restored'))
    }
  } catch {
    /* ignore */
  }
}
