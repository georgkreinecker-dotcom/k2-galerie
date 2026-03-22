# Kassafunktion & Etiketten – Controlliste (Vollumfang)

**Stand: 01.03.26 – Prüfung ob alle beschriebenen Features umgesetzt sind.**

---

## 1. Kassafunktion & Etiketten (Oberbegriff)

| Anforderung | Umgesetzt | Wo / wie |
|-------------|-----------|----------|
| **Kasse/Shop für Verkauf vor Ort (z. B. iPad/Handy)** | ✅ | ShopPage (`/projects/k2-galerie/shop`) – mit `?openAsKasse=1` als Kasse; Admin-Hub „Kassa“ → öffnet Shop. Mobil nutzbar. |
| **Etikettendruck (z. B. Brother QL)** | ✅ | ScreenshotExportAdmin: Einzeletikett pro Werk, Sammeldruck (Hakerl setzen → „Etiketten drucken“). Brother QL-820MWBc in Einstellungen (Format 29×90,3 mm, 300 DPI). |
| **Werk-Nummer, Titel, QR-Code auf Etikett** | ✅ | `getEtikettBlob` / `getEtikettBlobForArtwork`: Nummer, Titel, Kategorie, Künstler, Preis, Maße, **QR-Code** (Galerie-URL), 300 DPI für Brother. |
| **WLAN-fähig** | ✅ | Brother QL-820MWBc per IP (Einstellungen); optional `k2-print-server.js` / `npm run print-server` für One-Click; iPad/iPhone: Etikett teilen → Brother iPrint & Label; Doku in Einstellungen. |
| **Kundenverwaltung (Kunden-Tab) für Erfassung und Tagesgeschäft** | ✅ | KundenPage (`/projects/k2-galerie/kunden`) + Link „📋 Kundenadressen“ im Admin unter **Statistik/Werkkatalog**; KundenTab (create/update/delete, Suche, Bulk-Import). Control Studio: Tab „Kunden“. |

---

## 2. Einfache Kassa & Lagerhaltung

| Anforderung | Umgesetzt | Wo / wie |
|-------------|-----------|----------|
| **Verkauf erfassen** | ✅ | ShopPage: Warenkorb, Checkout, Zahlungsart; Verkauf → `k2-sold-artworks`, Stückzahl am Werk −1. |
| **Kassenbeleg drucken (Etikett oder A4)** | ✅ | ShopPage nach Verkauf: Dialog „Kassenbon drucken? OK = Etikettendrucker (80mm), Abbrechen = A4“. `printReceiptA4()` für A4; Etikett optional. Bon erneut drucken möglich. |
| **Verkaufs- und Lagerstatistik drucken** | ✅ | StatistikTab: „Verkaufs- & Lagerstatistik“ drucken – Werke gesamt, Bestand, Galerie, Reserviert, Umsatz, Verkaufsliste; Druckfenster A4. |
| **Werkkatalog mit Status Galerie/Lager/Verkauft** | ✅ | WerkkatalogTab: Filter Status (alle, Galerie, Lager, Verkauft, Reserviert); Spalte Status; Buttons „→ Lager“ / „→ Galerie“ (Toggle inExhibition). |
| **Stückzahl** | ✅ | Werk: `quantity`; bei Verkauf −1; Spalte „Stück“ im Katalog; in Statistik berücksichtigt. |
| **Storno** | ✅ | StatistikTab: Button „Stornieren“ bei Verkäufen; `handleStornoVerkauf`: Eintrag aus `k2-sold-artworks` entfernen, Stückzahl +1. |
| **Tagesgeschäft ohne Zusatz-Software** | ✅ | Alles in der App: Shop/Kasse, Beleg, Statistik, Katalog, Kunden, Etiketten – keine externe Kassen-Software nötig. |

---

## 3. Einstiege für Nutzer

- **Kassa (Verkauf + Beleg):** Admin-Hub → „Kassa“ → Shop als Kasse; oder direkt `/projects/k2-galerie/shop?openAsKasse=1`.
- **Verkaufsstatistik (Umsatz, Storno, Drucken):** Admin-Hub → „Verkaufsstatistik“ → StatistikTab.
- **Werkkatalog (Galerie/Lager/Verkauft):** Admin → Werke-Bereich → Werkkatalog (Tab/ Karte).
- **Etiketten:** Pro Werk „Etikett drucken“; Sammeldruck: Hakerl bei Werken → „Etiketten drucken“.
- **Kunden:** Admin → **Statistik/Werkkatalog** → „📋 Kundenadressen“ (Link) → KundenPage; oder Control Studio → Tab Kunden.

---

## Fazit

**Alle genannten Punkte (Kassafunktion & Etiketten, Einfache Kassa & Lagerhaltung) sind im vollen Umfang umgesetzt.** Keine Lücken gefunden.
