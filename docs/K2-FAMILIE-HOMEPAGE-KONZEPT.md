# K2 Familie – Konzept: Fertige Homepage (nutzerorientiert)

**Stand:** 02.03.26  
**Orientierung:** Design und Struktur an **ök2** (öffentliche Demo-Galerie).  
**Ziel:** Einheitliche Struktur, aber jede Familie (Tenant) kann sich frei gestalten → buntes Bild der Familie in fester Struktur.

---

## Grundidee

| Was | Bedeutung |
|-----|-----------|
| **Einheitliche Struktur** | Fester Aufbau wie bei ök2: gleiche Bereiche (z. B. Willkommen, Bild, erste Aktionen, evtl. Kurzüberblick). Jede Familie nutzt dieselbe **Struktur**. |
| **Freie Gestaltung pro Tenant** | Jede Familie (Tenant) kann **eigene Texte, Bilder, evtl. Farben/Themen** setzen. Wie bei K2/ök2: pro Mandant eigene Seitentexte und Seitengestaltung (Willkommensbild, Kartenbild, …). |
| **Ergebnis** | „Buntes Bild der Familie“ – jede Familie sieht anders aus, wirkt persönlich, bleibt aber in derselben festen Struktur (Navigation, Bereiche, Funktionen). |

---

## Orientierung ök2

- **Design:** An der öffentlichen Galerie (ök2) orientieren – Aufbau, Typo, Karten, Willkommensbereich.
- **Gestaltungsmöglichkeiten:** Analog zu dem, was K2/ök2 pro Tenant haben:
  - **Texte:** z. B. Willkommenstitel, Untertitel, Intro-Text, Button-Texte (editierbar pro Familie).
  - **Bilder:** z. B. Willkommensbild, Kartenbild für die Familie (wie `welcomeImage`, `galerieCardImage` bei der Galerie).
  - **Optional später:** Farben/Theme pro Familie (wie bei ök2/K2 Theme-Optionen), wenn gewünscht.

Technisch: Pro Familie (Tenant) eigene Keys, z. B. `k2-familie-{tenantId}-page-texts`, `k2-familie-{tenantId}-page-content` – gleiche Struktur wie `k2-page-texts` / `k2-oeffentlich-page-content-galerie`, nur für Familie und pro tenantId.

---

## Was das für die Umsetzung heißt

1. **Struktur festlegen:** Eine „Fertige Homepage“-Seite für K2 Familie mit festen Bereichen (analog ök2: Willkommen, Bild, erste Aktionen wie „Stammbaum ansehen“, „Events“, „Kalender“). Diese Struktur ist für alle Familien gleich.
2. **Gestaltung pro Tenant:** Pro Familie speicherbare Inhalte – Texte (Titel, Intro, Button-Texte) und Bilder (Willkommensbild, evtl. Familien-Kartenbild). Speicher pro Tenant wie bei Galerie (getPageTexts / getPageContentGalerie pro Mandant).
3. **Admin/ Bearbeitung:** Später: Bearbeitung dieser Texte und Bilder im Familien-Admin (analog Seitengestaltung/Grafiker-Tisch für Galerie), damit jede Familie ihr „buntes“ Gesicht bekommt.

---

## Nächste Schritte (für Roadmap)

- Phase oder Meilenstein „Fertige Homepage K2 Familie“ in der Roadmap verankern.
- Struktur (Layout/Bereiche) definieren – am ök2-Aufbau orientiert.
- Datenmodell: Familie-page-texts, Familie-page-content (pro tenantId), analog zu pageTexts und pageContentGalerie.
- UI: Eine nutzerorientierte Homepage-Route (z. B. erste Seite für Gäste/Nutzer), die aus diesen tenant-spezifischen Daten gefüllt wird; Projekt-Übersicht (aktuelle Liste) bleibt für APf/uns erhalten.

---

**Querverweis:**  
- **Fertige Homepage vs. Projekt-Startseite:** `docs/HOMEPAGE-DEFINITION.md`  
- **Design/Struktur-Vorbild:** ök2 (öffentliche Galerie), Seitengestaltung, `pageTexts`, `pageContentGalerie` pro Tenant.
