/**
 * mök2-Struktur: gruppierte Sektionen für Sidebar und druckbare Kapitelseiten.
 * Eine Änderung hier wirkt in Mok2Layout (Sidebar) und MarketingOek2Page (Kapitel + Druck).
 */

export interface Mok2Section {
  id: string
  label: string
}

export interface Mok2Group {
  /** Titel der Kapitelseite (Druck) und Gruppenüberschrift in der Sidebar */
  chapterTitle: string
  sections: Mok2Section[]
}

export const mok2Groups: Mok2Group[] = [
  {
    chapterTitle: 'Kern – Mein Weg, Sparten & Stärken',
    sections: [
      { id: 'mok2-leitvision-k2-markt', label: 'Leitvision – Mein Weg & sechs Sparten' },
      { id: 'mok2-was-kann-die-app', label: 'Was kann die App? (ök2 | VK2)' },
      { id: 'mok2-produktbeschreibung', label: 'Genaue Produktbeschreibung' },
      { id: 'mok2-portfolio-k2-welt-wert', label: 'Portfolio K2-Welt: Text, Kunden, Wert' },
      { id: 'mok2-prospekt', label: 'K2 Galerie Prospekt' },
      { id: 'mok2-prospekt-galerieeroeffnung', label: 'Prospekt Galerieeröffnung K2' },
      { id: 'mok2-verkauf-map-drei-ebenen', label: 'Präsentationsmappe (Entscheidungshilfe)' },
      { id: 'mok2-1', label: '1. USPs' },
      { id: 'mok2-cd-corporate-design', label: 'Corporate Design – eine Linie' },
      { id: 'mok2-texte-ki-freiheit', label: 'Texte & KI – eigenes Werkzeug' },
      { id: 'mok2-produkt-branchenvergleich', label: 'Produkt- & Branchenvergleich (Vorteile)' },
      { id: 'mok2-2', label: '2. Marktchancen – Stärken' },
      { id: 'mok2-3', label: '3. Marktchancen – Herausforderungen' },
      { id: 'mok2-4', label: '4. Fazit & nächste Schritte' },
      { id: 'mok2-maerkte-kunst-fokus', label: 'Märkte Kunst-Fokus (Feature-Kombination)' },
      { id: 'mok2-maerkte-ohne-kunst', label: 'Chancen ohne Kunst (dieselbe Technik)' },
      { id: 'mok2-sweet-spot', label: 'Positionierung Sweet-Spot (Öffentlichkeitsarbeit)' },
    ],
  },
  {
    chapterTitle: 'Vertrieb – Kanäle, Empfehlung, Werbung',
    sections: [
      { id: 'mok2-sichtbarkeit-werbung', label: 'Sichtbarkeit & Werbung (Suchmaschinen, Verbreitung)' },
      { id: 'mok2-eroeffnung-k2-oek2', label: 'Eröffnung K2 + ök2 + VK2 (Marketinglinie)' },
      { id: 'mok2-muster-werbetyp-eroeffnung', label: 'Muster pro Werbetyp (Eröffnung)' },
      { id: 'mok2-entwuerfe-oeffentlichkeitsarbeit', label: 'Entwürfe Öffentlichkeitsarbeit (Feinschliff)' },
      { id: 'mok2-kanale-2026', label: 'Kanäle 2026' },
      { id: 'mok2-verbesserungen', label: 'Was wir gemeinsam verbessern' },
      { id: 'mok2-5', label: '5. Weitere Ideen & Konzepte' },
      { id: 'mok2-6', label: '6. Empfehlungs-Programm' },
      { id: 'mok2-so-empfiehlst-du', label: 'So empfiehlst du (Kurz-Anleitung)' },
      { id: 'mok2-7', label: '7. Promotion für alle Medien (inkl. Zielgruppe)' },
      { id: 'mok2-8', label: '8. APf-Struktur' },
      { id: 'mok2-9', label: '9. Werbeunterlagen' },
    ],
  },
  {
    chapterTitle: 'Bewertung & Lizenzen',
    sections: [
      { id: 'mok2-10', label: '10. Lizenzen (Konditionen & Vergebung)' },
      { id: 'mok2-10-lizenz-abschliessen', label: 'Lizenz abschließen (Online, Pilot, VK2)' },
      { id: 'mok2-produktbewertung', label: 'Produktbewertung (Kosten | Marktwert)' },
      { id: 'mok2-entwicklerkosten', label: 'Entwicklerkosten (Schätzung)' },
      { id: 'mok2-neubewertung-2026', label: 'Neubewertung (März 2026)' },
      { id: 'mok2-marktwert', label: 'Marktwert (grober Ansatz)' },
      { id: 'mok2-faehigkeiten-mix', label: 'Fähigkeiten-Mix (Fakten)' },
      { id: 'mok2-lizenz-pakete-aussen', label: 'Lizenzpakete (Außensicht)' },
      { id: 'mok2-10c-haupt-neben-lizenz', label: 'Haupt- und Nebenlizenzen (Konzept)' },
      { id: 'mok2-10d-k2-familie-lizenzmodell', label: 'K2 Familie – Lizenz (eigenständig, Doku-Orientierung)' },
      { id: 'mok2-10b-vk2-lizenz', label: 'Lizenzstruktur VK2 (Vereinsplattform)' },
    ],
  },
  {
    chapterTitle: 'Konzepte – Pro+, Leitkünstler, Guide',
    sections: [
      { id: 'mok2-13', label: '13. Werkkatalog & Werkkarte' },
      { id: 'mok2-14', label: '14. 💎 Pro+ & Pro++' },
      { id: 'mok2-15-gruender', label: '15. 🌱 Gründer-Galerie & Leitkünstler' },
      { id: 'mok2-16-leitkuenstler', label: '16. 📋 Leitkünstler:innen – Meine Liste' },
      { id: 'mok2-17-guide-avatar', label: '17. 🎙️ Guide-Avatar Vision (Option A)' },
      { id: 'mok2-18-empfehlung', label: '18. 🤝 Empfehlung – die richtige Sprache' },
    ],
  },
  {
    chapterTitle: 'Technik',
    sections: [
      { id: 'mok2-technikerzettel', label: 'Technikerzettel (für Informatiker)' },
    ],
  },
  {
    chapterTitle: 'Praktisch',
    sections: [
      { id: 'mok2-pilot-zettel', label: 'Pilot-Zettel drucken' },
      { id: 'mok2-pilot-start-michael', label: 'Startanleitung Michael' },
    ],
  },
]

/** Erste Sektion jeder Gruppe – davor kommt beim Druck eine Kapitelseite */
export function getFirstSectionIdPerGroup(): string[] {
  return mok2Groups.map((g) => g.sections[0]?.id).filter(Boolean)
}
