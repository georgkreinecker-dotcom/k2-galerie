# Marketing-Kanäle P1 / P2 / P3 – Einrichtung

## Für Georg (fertige Form)

**Schreibtisch-Seite mit allen 9 Links (druckbar):**

`public/texte-schreibtisch/marketing-kanaele-p1-p2-p3.html`

Im Browser: `https://k2-galerie.vercel.app/texte-schreibtisch/marketing-kanaele-p1-p2-p3.html`

## Eine Quelle im Code

| Datei | Inhalt |
|-------|--------|
| `src/config/marketingKanalP1P2P3.ts` | Landing-Pfade, `buildMarketingKanalUrl`, `listMarketingKanalUrls` |
| `src/config/k2AgenturGoogleKeywordsP1.ts` | P1 Google: 13 Keywords (Priorität) + Negativ-Start · Schalt-Paket |
| `src/config/k2AgenturGoogleSitelinksP1.ts` | P1 Google: 6 Sitelinks + 10 Zusatzinfos (Copy-Paste) |
| `src/config/k2AgenturGoogleSitelinksP3.ts` | P3 Google: 6 Sitelinks + 10 Zusatzinfos (K2 Familie) |
| `src/utils/marketingAttribution.ts` | `k=` / UTM First-Touch, Checkout-Payload |
| `src/utils/marketingAnalytics.ts` | GA4 (`VITE_GA4_MEASUREMENT_ID`) + Google Ads Tag (`AW-18195006153` Pilot, überschreibbar per `VITE_GOOGLE_ADS_ID`) |
| `src/config/googleAdsConfig.ts` | Pilot Conversion-ID Google Ads |
| `src/appBootstrap.tsx` | Attribution + GA4 beim App-Start |

## Landings

| Produkt | Ads-Landing (Musterseite) | Checkout |
|---------|---------------------------|----------|
| P1 | `/projects/k2-galerie/galerie-oeffentlich` (ök2-Demo) | `/projects/k2-galerie/lizenz-kaufen` |
| P2 | `/projects/vk2/galerie` (VK2-Muster) | `/projects/k2-galerie/lizenz-kaufen` |
| P3 | `/projects/k2-familie/meine-familie?t=huber` (Musterfamilie Huber) | `/projects/k2-familie/lizenz-erwerben` |

**Nicht** als Ads-Landing: `/entdecken` (Eingangstor), VK2-Katalog, Familie-Präsentationsmappe.

Kampagnen-Schlüssel: `{produkt}-{kanal}-2026q2` (z. B. `p1-google-2026q2`).

## Vercel (optional GA4)

Environment Variable: `VITE_GA4_MEASUREMENT_ID` = `G-XXXXXXXXXX` (Google Analytics 4).

**Google Ads Conversion-Tag:** `AW-18195006153` ist im Code hinterlegt (`googleAdsConfig.ts`) – **nicht** manuell in `index.html` einfügen. Nach Deploy lädt die App gtag.js automatisch. Conversion-Ziel: `/lizenz-erfolg` (echte Stripe-Session). Optional in Vercel: `VITE_GOOGLE_ADS_CONVERSION_SEND_TO=AW-18195006153/<Label>` aus der Conversion-Aktion in Google Ads.

Ohne GA4-Variable: Attribution und Stripe-Metadaten funktionieren trotzdem; GA4 bleibt aus. Google Ads-Tag läuft mit Pilot-ID.

## Google Ads – Conversion-Ziel (Checkliste)

**Abgleich Klicks vs. Besucher:** Google zählt jeden Klick; die App zählt einmal pro Sitzung nach Galerie-Laden. Mission Control zeigt **ök2 gesamt** = `oeffentlich` + Summe aller `oeffentlich-pilot-*` (API: `GET /api/visit?aggregatePrefix=oeffentlich-pilot`).

| Schritt | Wo | Was |
|--------|-----|-----|
| 1 | Code (fertig) | Tag `AW-18195006153` in `googleAdsConfig.ts` / `marketingAnalytics.ts` |
| 2 | Google Ads → Ziele | Conversion-Aktion **Website**, URL enthält `/lizenz-erfolg` |
| 3 | Vercel Env | `VITE_GOOGLE_ADS_CONVERSION_SEND_TO=AW-18195006153/<Label>` aus Google |
| 4 | Test | Stripe-Testkauf → `/lizenz-erfolg?session_id=…` → Conversion in Google prüfen |
| 5 | Google Ads Konto | Einrichtungs-Checkliste 100 % – Sitelinks P1: `k2-agentur-sitelinks-p1-google.html` · P3: `k2-agentur-sitelinks-p3-google.html` |
| 6 | Mission Control | **ök2 gesamt** mit Google-Klicks vergleichen (nicht nur Demo-Basis) |

Druckversion: `public/texte-schreibtisch/marketing-kanaele-p1-p2-p3.html#google-conversion`

## Tests

`src/tests/marketingKanalP1P2P3.test.ts`
