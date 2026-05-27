# K2 Agentur – APf-Basisplattform

## Einstieg (Georg)

| Wo | URL |
|----|-----|
| **APf Smart Panel** | Kachel „📡 K2 Agentur“ |
| **Plattform Start** | Kachel „K2 Agentur“ |
| **Direkt** | `/projects/k2-galerie/k2-agentur` (nur mit APf: localhost, `?apf=1`, `?dev=1`) |
| **Texte-Schreibtisch** | Bereich „Agentur & Vermarktung“ → „K2 Agentur – APf“ |

## Was die Plattform kann

- **Tab Checkliste:** Schritt-für-Schritt abhaken (3× einmalige Konten + 8 Schritte pro Kanal)
- **Schalt-Paket kopieren:** Kampagnenname, Ziel-URL, Zielgruppen-Vorschlag – Ziel-URL-Schritt wird abgehakt
- **Anzeigen-Paket kopieren:** Headlines + Beschreibungen aus `tenantConfig` (Zeichenlimits pro Kanal) – Schritt „Anzeige“ wird abgehakt
- **Auswertungs-Paket (7 Tage):** Vorlage kopieren → Kanal-Notizen + Schritt „Auswertung“
- **Creative-Spez kopieren:** Bildmaße + CD-Hinweis (global in der Checkliste)
- **mök2-Lesehinweise:** pro Kanal Links zum passenden mök2-Inhalt (P1/P2/P3)
- **Nächster Kanal:** orangefarbener Hinweis mit empfohlener Schalt-Reihenfolge
- **Ampel-Status übernehmen:** aus Checkliste berechnet (offen / vorbereitet / live)
- **Tab Kanäle:** 9 Kanäle, Budget, Summe Monatsbudgets, Notizen, URLs
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
| UI | `K2AgenturLaunchChecklistePanel.tsx` |

**Nicht automatisierbar ohne Ads-API:** Anzeigen in Google/Meta/LinkedIn anlegen – dafür Checkliste + Schalt-Paket + Links zu den Konten.

## Technik

- Seite: `src/pages/K2AgenturPlattformPage.tsx`
- UI: `src/components/k2Agentur/K2AgenturPlattformWorkplace.tsx`
- Checkliste: `src/components/k2Agentur/K2AgenturLaunchChecklistePanel.tsx`
- Speicher: `src/utils/k2AgenturPlattformStorage.ts`
- Kanal-URLs: `src/config/marketingKanalP1P2P3.ts`
- Schalt-Schritte: `src/config/k2AgenturLaunchCheckliste.ts`

Siehe auch: `docs/MARKETING-KANAL-P1-P2-P3-EINRICHTUNG.md`, `docs/MOK2-VERTIEB-INTERNET-UEBERSICHT.md` (welche mök2-Sektion wofür), `docs/MOK2-VORTEIL-GEGENUEBER-EXTERNER-AGENTUR.md` (warum Plan B statt externer Agentur)
