# K2 Agentur – APf-Basisplattform

## Einstieg (Georg)

| Wo | URL |
|----|-----|
| **APf Smart Panel** | Kachel „📡 K2 Agentur“ |
| **Plattform Start** | Kachel „K2 Agentur“ |
| **Direkt** | `/projects/k2-galerie/k2-agentur` (nur mit APf: localhost, `?apf=1`, `?dev=1`) |
| **Texte-Schreibtisch** | Bereich „Agentur & Vermarktung“ → „K2 Agentur – APf“ |

## Was die Plattform kann

### End-to-End (Hauptweg – eine Seite)

| Phase | Was du tust |
|-------|-------------|
| **① Konten bereit** | Google, Meta, LinkedIn + Creative-Maße einmal abhaken → „Weiter zu Phase 2“ |
| **② Kanal schalten** | **Ein** Kanal in Sportwagen-Reihenfolge: Anzeige kopieren → Ads → Checkliste → Landing → erledigt; Vorheriger/Nächster Kanal |
| **③ Auswerten** | Pro live-Kanal Auswertungs-Vorlage kopieren (7 Tage) |

Oben: **3-Phasen-Leiste** mit Fortschritt und „→ hier“ (empfohlene Phase). Unten eingeklappt: **Werkzeuge** (Kanäle & Budget, alle 9 Checklisten, Strategie, Partner).

Logik: `src/config/k2AgenturEndToEndFlow.ts` · UI: `K2AgenturE2EPhaseStepper`, `K2AgenturVorbereitenPhasePanel`, `K2AgenturSchaltenEndToEndPanel`, `K2AgenturAuswertenPhasePanel`

### Werkzeuge (bei Bedarf)

- **Checkliste:** Schritt-für-Schritt abhaken (3× einmalige Konten + 8 Schritte pro Kanal)
- **Schalt-Paket kopieren:** Kampagnenname, Ziel-URL, Zielgruppen-Vorschlag – Ziel-URL-Schritt wird abgehakt
- **Fertige Anzeige kopieren:** Vorschau + ein Block (Kampagne, URL, 3 Headlines, 2 Beschreibungen, CTA) – direkt ins Ads-Konto; Schritte „Anzeige“ und „Ziel-URL“ werden abgehakt
- **Auswertungs-Paket (7 Tage):** Vorlage kopieren → Kanal-Notizen + Schritt „Auswertung“
- **Creative-Spez kopieren:** Bildmaße + CD-Hinweis (global in der Checkliste)
- **Nächster Kanal:** orangefarbener Hinweis mit empfohlener Schalt-Reihenfolge
- **Ampel-Status übernehmen:** aus Checkliste berechnet (offen / vorbereitet / live)
- **Kanäle & Budget:** 9 Kanäle, Budget, Summe Monatsbudgets, Notizen, URLs (unter Werkzeuge)
- Speicher nur auf diesem Mac: `localStorage` `k2-agentur-plattform`

### Sportwagen-Standard (eine Quelle)

| Problemstellung | Eine Lösung |
|-----------------|-------------|
| Ziel-URLs | `marketingKanalP1P2P3.ts` |
| Schalt-Schritte + Schalt-Paket | `k2AgenturLaunchCheckliste.ts` |
| Anzeigen-Texte | `k2AgenturAnzeigenTexte.ts` |
| Auswertungs-Vorlage | `k2AgenturAuswertungPaket.ts` |
| Creative-Maße | `k2AgenturCreativeSpec.ts` |
| mök2-Lesehinweise | `k2AgenturMok2Lesehinweise.ts` |
| Schalt-Reihenfolge | `k2AgenturKanalPrioritaet.ts` |
| Fortschritt abhaken | `k2AgenturPlattformStorage.ts` |
| E2E-Phasen | `k2AgenturEndToEndFlow.ts` |
| UI Checkliste | `K2AgenturLaunchChecklistePanel.tsx` |
| UI E2E | `K2AgenturPlattformWorkplace.tsx` + Phase-Panels |

**Nicht automatisierbar ohne Ads-API:** Anzeigen in Google/Meta/LinkedIn anlegen – dafür Checkliste + Schalt-Paket + Links zu den Konten.

## Technik

- Seite: `src/pages/K2AgenturPlattformPage.tsx`
- UI: `src/components/k2Agentur/K2AgenturPlattformWorkplace.tsx`
- Checkliste: `src/components/k2Agentur/K2AgenturLaunchChecklistePanel.tsx`
- Speicher: `src/utils/k2AgenturPlattformStorage.ts`
- Kanal-URLs: `src/config/marketingKanalP1P2P3.ts`
- Schalt-Schritte: `src/config/k2AgenturLaunchCheckliste.ts`

Siehe auch: `docs/MARKETING-KANAL-P1-P2-P3-EINRICHTUNG.md`, `docs/MOK2-VERTIEB-INTERNET-UEBERSICHT.md` (welche mök2-Sektion wofür), `docs/MOK2-VORTEIL-GEGENUEBER-EXTERNER-AGENTUR.md` (warum Plan B statt externer Agentur)
