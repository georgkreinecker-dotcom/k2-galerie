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
| `src/config/k2AgenturGoogleLokalEferding.ts` | Lokal Eferding: 5 €/Tag, Landing `/galerie`, Kampagnen-Key |
| `src/config/k2AgenturGoogleKeywordsLokalEferding.ts` | Lokal: Keywords Samstag + Gruppen (2 Anzeigengruppen) |
| `src/config/k2AgenturGoogleSitelinksLokalEferding.ts` | Lokal: 6 Sitelinks + 10 Zusatzinfos |
| `src/config/k2AgenturGoogleAnzeigenLokalEferding.ts` | Lokal: Responsive-Search-Texte (2 Gruppen) |
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

### Lokal Eferding (echte K2-Galerie – kein Lizenz-P1)

| Punkt | Wert |
|-------|------|
| Kampagne | `Lokal K2 Galerie Eferding` |
| Budget | **5 €/Tag** |
| Landing | `/galerie` (Martina & Georg, nicht ök2) |
| Key | `eferding-google-2026q2` |
| Geo | Eferding + 35 km |
| Anzeigengruppen | **Samstag & Galerie** + **Gruppen & Termin** |
| Conversion | **Kein** `/lizenz-erfolg` – Ziel = Website-Besuch |

Schalt-Paket: `public/texte-schreibtisch/k2-agentur-lokal-eferding-google.html` · Keywords · Sitelinks · CSV wie P1/P3.


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
| 5 | Google Ads Konto | Einrichtungs-Checkliste 100 % – Sitelinks P1 · P3 · **Lokal Eferding** (Schreibtisch) |
| 6 | Mission Control | **ök2 gesamt** mit Google-Klicks vergleichen (nicht nur Demo-Basis) |

Druckversion: `public/texte-schreibtisch/marketing-kanaele-p1-p2-p3.html#google-conversion`

## Google-Ads-P1 – Check nach Kampagne (ök2, 1000+ Klicks)

| Prüfpunkt | Erwartung | Stand |
|-----------|-----------|--------|
| Besucher ök2 | `GET /api/visit?tenant=oeffentlich` ≈ Klicks (einmal pro Sitzung) | ✅ lief (z. B. ~1244) |
| Attribution-Tabelle | `marketing_attribution_events` in Supabase (Migration **016**) | ✅ nachgezogen; **ältere Landings nicht rekonstruierbar** |
| Steuerzentrale | Mission Control → K2 Agentur → Landings/Conversion pro `p1-google-2026q2` | ab Deploy + neue Besucher |
| Sitelinks | Demo-Galerie + Vorschau + Lizenz-Kaufen messen Landing | ✅ Vorschau + Lizenz-Kaufen ergänzt |
| Checkout | `k=` in Stripe-Metadaten → `conversion_licence` beim Webhook | ✅ serverseitig |
| Google Conversion | `VITE_GOOGLE_ADS_CONVERSION_SEND_TO` in Vercel (Label aus Ads) | manuell prüfen |
| GA4 | `VITE_GA4_MEASUREMENT_ID` optional | optional |

**Merksatz:** Klicks (Google) ≠ Landings (unsere API). Besucherzähler war die zuverlässige Spur während 016 fehlte.

## Tests

`src/tests/marketingKanalP1P2P3.test.ts`
