# Marketing-Kanäle P1 / P2 / P3 – Einrichtung

## Für Georg (fertige Form)

**Schreibtisch-Seite mit allen 9 Links (druckbar):**

`public/texte-schreibtisch/marketing-kanaele-p1-p2-p3.html`

Im Browser: `https://k2-galerie.vercel.app/texte-schreibtisch/marketing-kanaele-p1-p2-p3.html`

## Eine Quelle im Code

| Datei | Inhalt |
|-------|--------|
| `src/config/marketingKanalP1P2P3.ts` | Landing-Pfade, `buildMarketingKanalUrl`, `listMarketingKanalUrls` |
| `src/utils/marketingAttribution.ts` | `k=` / UTM First-Touch, Checkout-Payload |
| `src/utils/marketingAnalytics.ts` | GA4 wenn `VITE_GA4_MEASUREMENT_ID` gesetzt |
| `src/appBootstrap.tsx` | Attribution + GA4 beim App-Start |

## Landings

| Produkt | Ads-Landing | Checkout |
|---------|-------------|----------|
| P1 | `/entdecken` | `/projects/k2-galerie/lizenz-kaufen` |
| P2 | `/projects/vk2/galerie` | `/projects/k2-galerie/lizenz-kaufen` |
| P3 | `/projects/k2-familie/praesentationsmappe-kunde` | `/projects/k2-familie/lizenz-erwerben` |

Kampagnen-Schlüssel: `{produkt}-{kanal}-2026q2` (z. B. `p1-google-2026q2`).

## Vercel (optional GA4)

Environment Variable: `VITE_GA4_MEASUREMENT_ID` = `G-XXXXXXXXXX` (Google Analytics 4).

Ohne Variable: Attribution und Stripe-Metadaten funktionieren trotzdem; GA4 bleibt aus.

## Tests

`src/tests/marketingKanalP1P2P3.test.ts`
