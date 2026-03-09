/**
 * K2 Markt – Flyer-Agent: Ableitung Entwurf aus Produkt-Moment.
 * Ein Template (Struktur), eine Funktion: moment → Flyer-Entwurf.
 * DoD Flyer: Botschaft, Kontakt, Link/QR, Bild (Referenz).
 */

export type ProduktMomentKontakt = {
  name?: string
  email?: string
  phone?: string
}

export type ProduktMoment = {
  id: string
  titel: string
  botschaft: string
  zielgruppe?: string
  kontakt?: ProduktMomentKontakt
  links?: string[]
  medien?: string[]
  kernargumente?: string[]
  gültigVon?: string | null
  gültigBis?: string | null
}

/** Flyer-Entwurf – Struktur für DoD-Prüfung (Kernbotschaft, Kontakt, Link/QR, Bild). */
export type FlyerEntwurf = {
  momentId: string
  title: string
  bodyText: string
  contactText: string
  qrUrl: string
  imageRef: string
  /** Kernargumente als kurze Liste für optionalen Einsatz im Layout */
  kernargumente: string[]
}

/**
 * Leitet aus einem Produkt-Moment einen Flyer-Entwurf ab.
 * Keine KI – reine Ableitung. Ein Template, eine Quelle.
 */
export function momentToFlyerEntwurf(moment: ProduktMoment): FlyerEntwurf {
  const contact = moment.kontakt
  const contactParts: string[] = []
  if (contact?.name) contactParts.push(contact.name)
  if (contact?.email) contactParts.push(contact.email)
  if (contact?.phone) contactParts.push(contact.phone)
  const contactText = contactParts.join(' · ') || '–'

  const qrUrl = moment.links?.[0] ?? ''
  const imageRef = moment.medien?.[0] ?? ''

  return {
    momentId: moment.id,
    title: moment.titel || '–',
    bodyText: moment.botschaft || '–',
    contactText,
    qrUrl,
    imageRef,
    kernargumente: moment.kernargumente ?? [],
  }
}

/** Prüft, ob ein Entwurf die DoD Flyer erfüllt (kein Platzhalter, alle Pflichtelemente). */
export function erfuelltDoDFlyer(entwurf: FlyerEntwurf): { ok: boolean; fehlend: string[] } {
  const fehlend: string[] = []
  const platzhalter = /^\[.*\]$|^–$|^Lorem|^Hier steht/i

  if (!entwurf.bodyText || platzhalter.test(entwurf.bodyText.trim())) fehlend.push('Kernbotschaft')
  if (!entwurf.contactText || platzhalter.test(entwurf.contactText)) fehlend.push('Kontakt')
  if (!entwurf.qrUrl) fehlend.push('Link/QR')
  if (!entwurf.imageRef) fehlend.push('Bild/Visuell')

  return {
    ok: fehlend.length === 0,
    fehlend,
  }
}
