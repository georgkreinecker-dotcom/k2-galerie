/**
 * Formatblatt 4M – Ahnenraster / heiliges Muster.
 * Quelle des Musters: exakter Bildausschnitt der Frontplatte (kein Schema-SVG).
 */

export const AHNENRASTER_MUSTER_SRC =
  '/100-generation/referenzen/ahnenraster-heiliges-muster.png' as const

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
  bedeutung:
    'Das Ahnenraster ist der sichtbare Code auf der Frontplatte von 4M: rechtwinkliges Labyrinth in vier Feldern, Rahmen, darum herum Fischgrät-/Flecht-Textur. Es ist kein Dekor – Zeichen für Ordnung, Zugehörigkeit und Erinnerung.',
  anwendung:
    'Am Objekt sitzt das Muster als eigene Platte im Volumen. Dieses Blatt zeigt das Raster 1:1 aus dem Entwurf – groß genug zum Ritzen, Stempeln oder Übertragen in Ton.',
  bezugDiKurugu:
    'Anker ist die originale Di-Kurugu-Zeremonialaxt (Mbowamb / Mount-Hagen-Hochland, Papua-Neuguinea): Prestige- und Tauschobjekt, oft mit Flechtwerk (2/2-Köper, Zickzack, Rauten). Unser keramisches Ahnenraster übersetzt diese Muster-Idee in vertieftes Labyrinth auf der Platte.',
  wasWirWissen: [
    'Di Kurugu = Zeremonialaxt aus dem Mount-Hagen-Gebiet (u. a. Jimi-/Wahgi-Tal); Steinblatt, Holzschaft, Pflanzenfaser-Flechtung.',
    'Historisch: Status, Brautpreis/Tausch, Clan – nicht Alltagswerkzeug zum Holzhacken.',
    'Im Projekt: Axt als realer Anker (Bruder des Künstlers, 1960er, Clan-Aufnahme); Flechtwerk = Generationen-Wissen / „Code“.',
    'Name „Ahnenraster“ = unsere Bezeichnung für die Labyrinth-Platte an 4M (künstlerische Form, angelehnt an Di-Kurugu-Musterdenken).',
    'Exaktes Rasterbild = Ausschnitt der 4M-Front – verbindliche Vorlage für die Werkstatt.',
  ],
} as const
