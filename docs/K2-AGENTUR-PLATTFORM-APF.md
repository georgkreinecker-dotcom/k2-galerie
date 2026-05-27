# K2 Agentur – APf-Basisplattform

## Einstieg (Georg)

| Wo | URL |
|----|-----|
| **APf Smart Panel** | Kachel „📡 K2 Agentur“ |
| **Plattform Start** | Kachel „K2 Agentur“ |
| **Direkt** | `/projects/k2-galerie/k2-agentur` (nur mit APf: localhost, `?apf=1`, `?dev=1`) |
| **Texte-Schreibtisch** | Bereich „Agentur & Vermarktung“ → „K2 Agentur – APf“ |

## Was die Plattform kann

- **9 Kanäle** (P1/P2/P3 × Google/Meta/LinkedIn) mit Ampel-Status: offen, vorbereitet, live, pausiert
- **Ziel-URL kopieren** – dieselben Links wie `marketingKanalP1P2P3.ts`
- **Budget & Notizen** pro Kanal – nur auf diesem Mac (localStorage `k2-agentur-plattform`)
- Verknüpfung zu Werbefahrplan, mök2, Druck-PDF der URLs

## Technik

- Seite: `src/pages/K2AgenturPlattformPage.tsx`
- UI: `src/components/k2Agentur/K2AgenturPlattformWorkplace.tsx`
- Speicher: `src/utils/k2AgenturPlattformStorage.ts`
- Kanal-URLs: `src/config/marketingKanalP1P2P3.ts`

Siehe auch: `docs/MARKETING-KANAL-P1-P2-P3-EINRICHTUNG.md`
