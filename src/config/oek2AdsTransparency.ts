/**
 * ök2 / Google Ads – ehrliche Transparenz (eine Quelle).
 * Kein „gratis testen“ in Werbung, solange kein Stripe-Testabo existiert.
 */
import { AGB_ROUTE, PROJECT_ROUTES } from './navigation'

export const OEK2_ADS_BANNER_TITLE = 'Muster-Demo · Galerie-Software'

export const OEK2_ADS_BANNER_BODY =
  'Musterwerke und Mustertexte – keine echte Galerie, kein Kunsthandel. Anbieter: kgm solution.'

export const LIZENZ_CHECKOUT_HINWEIS =
  'Mit Klick auf „Jetzt bezahlen“ startet das Monatsabo über Stripe – keine separate Gratis-Testlizenz im Online-Checkout.'

export const OEK2_DEMO_PATH = PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
export const OEK2_LIZENZ_KAUFEN_PATH = PROJECT_ROUTES['k2-galerie'].lizenzKaufen
export const OEK2_LIZENZ_PREISE_PATH = PROJECT_ROUTES['k2-galerie'].licences
export const OEK2_AGB_PATH = AGB_ROUTE
