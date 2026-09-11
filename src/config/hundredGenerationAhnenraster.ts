/**
 * Formatblatt 4M – Ahnenraster / heiliges Muster.
 * Foto = exakter Ausschnitt · Geometrie = orthogonale Werkstatt-Zeichnung (aus Foto abgeleitet).
 */

export const AHNENRASTER_MUSTER_SRC =
  '/100-generation/referenzen/ahnenraster-heiliges-muster.png' as const

/** Linienzeichnung: durchgehende Stege + Stopps (orange) · CNC erst nach Freigabe */
export const AHNENRASTER_GEOMETRIE_SRC =
  '/100-generation/referenzen/ahnenraster-geometrie-linien.png' as const

export const AHNENRASTER_GEOMETRIE_SVG_SRC =
  '/100-generation/referenzen/ahnenraster-geometrie-linien.svg' as const

/** Foto | Zeichnung nebeneinander zur Kontrolle */
export const AHNENRASTER_LINIEN_VERGLEICH_SRC =
  '/100-generation/referenzen/ahnenraster-linien-vergleich.png' as const

export const AHNENRASTER_BLATT = {
  id: 'ahnenraster-formatblatt',
  modellId: 'code-ahnen-mythos' as const,
  title: '4M · Ahnenraster',
  subtitle: 'heiliges Muster',
  kicker: '100 Generationen · Formatblatt Werkstatt',
  /** Geschätzte Maße der Frontplatte am Objekt (cm) */
  panelHoeheCm: 22,
  panelBreiteCm: 14,
  musterSrc: AHNENRASTER_MUSTER_SRC,
  geometrieSrc: AHNENRASTER_GEOMETRIE_SRC,
  bedeutung:
    'Das Ahnenraster ist der sichtbare Code auf der Frontplatte von 4M: rechtwinkliges Labyrinth in vier Feldern, Rahmen, darum herum Fischgrät-/Flecht-Textur. Es ist kein Dekor – Zeichen für Ordnung, Zugehörigkeit und Erinnerung.',
  anwendung:
    'Am Objekt sitzt das Muster als eigene Platte. Foto = Kontrolle. Zeichnung = durchgehende Linien und Stopps. CNC pausiert, bis die Zeichnung freigegeben ist.',
  bezugDiKurugu:
    'Anker ist die originale Di-Kurugu-Zeremonialaxt (Mbowamb / Mount-Hagen-Hochland, Papua-Neuguinea): Prestige- und Tauschobjekt, oft mit Flechtwerk (2/2-Köper, Zickzack, Rauten). Unser keramisches Ahnenraster übersetzt diese Muster-Idee in vertieftes Labyrinth auf der Platte.',
  wasWirWissen: [
    'Di Kurugu = Zeremonialaxt aus dem Mount-Hagen-Gebiet (u. a. Jimi-/Wahgi-Tal); Steinblatt, Holzschaft, Pflanzenfaser-Flechtung.',
    'Historisch: Status, Brautpreis/Tausch, Clan – nicht Alltagswerkzeug zum Holzhacken.',
    'Im Projekt: Axt als realer Anker (Bruder des Künstlers, 1960er, Clan-Aufnahme); Flechtwerk = Generationen-Wissen / „Code“.',
    'Name „Ahnenraster“ = unsere Bezeichnung für die Labyrinth-Platte an 4M (künstlerische Form, angelehnt an Di-Kurugu-Musterdenken).',
    'Linienzeichnung (durchgehende Linien + Stopps) + Foto-Vergleich = Vorlage zur Prüfung; CNC erst nach Freigabe.',
  ],
} as const
