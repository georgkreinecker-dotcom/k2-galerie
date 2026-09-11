/**
 * Formatblatt 4M – Ahnenraster / heiliges Muster.
 * Foto = exakter Ausschnitt · Geometrie = orthogonale Werkstatt-Zeichnung (aus Foto abgeleitet).
 */

export const AHNENRASTER_MUSTER_SRC =
  '/100-generation/referenzen/ahnenraster-heiliges-muster.png' as const

/** Schwarz/weiß – Schwarz = Stempel bleibt (CNC-Matrize) */
export const AHNENRASTER_GEOMETRIE_SRC =
  '/100-generation/referenzen/ahnenraster-geometrie.png' as const

export const AHNENRASTER_GEOMETRIE_SVG_SRC =
  '/100-generation/referenzen/ahnenraster-geometrie.svg' as const

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
    'Am Objekt sitzt das Muster als eigene Platte. Echtes Muster = Foto. Konstruktion: Foto 1:1 auf 2‑mm‑Raster (Unterlage zum Nachzeichnen). Auto-Vektor trifft das Labyrinth noch nicht – Stege von Hand nachziehen, dann CNC final.',
  bezugDiKurugu:
    'Anker ist die originale Di-Kurugu-Zeremonialaxt (Mbowamb / Mount-Hagen-Hochland, Papua-Neuguinea): Prestige- und Tauschobjekt, oft mit Flechtwerk (2/2-Köper, Zickzack, Rauten). Unser keramisches Ahnenraster übersetzt diese Muster-Idee in vertieftes Labyrinth auf der Platte.',
  wasWirWissen: [
    'Di Kurugu = Zeremonialaxt aus dem Mount-Hagen-Gebiet (u. a. Jimi-/Wahgi-Tal); Steinblatt, Holzschaft, Pflanzenfaser-Flechtung.',
    'Historisch: Status, Brautpreis/Tausch, Clan – nicht Alltagswerkzeug zum Holzhacken.',
    'Im Projekt: Axt als realer Anker (Bruder des Künstlers, 1960er, Clan-Aufnahme); Flechtwerk = Generationen-Wissen / „Code“.',
    'Name „Ahnenraster“ = unsere Bezeichnung für die Labyrinth-Platte an 4M (künstlerische Form, angelehnt an Di-Kurugu-Musterdenken).',
    'Exaktes Rasterfoto + geometrische Zeichnung (orthogonal, Gitter) = verbindliche Vorlage für die Werkstatt.',
  ],
} as const
