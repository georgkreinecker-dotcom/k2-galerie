# L-Produkte: Einfallstore „falsche Anmeldung“ / Lizenz-Zugang (Prüfung)

**Stand:** 10.05.26 · **Kurzbezeichnungen:** LK2 = ök2-Demo, LVK2 = VK2, LFK2 = K2 Familie, K2 = echte Galerie (kein L). Quelle: `docs/KURZBEZEICHNUNGEN-L-LIZENZVERSION.md`.

## Ergebnisüberblick

| Produkt | Lizenz-Stripe? | Risiko geprüft | Maßnahme |
|--------|----------------|----------------|-----------|
| **LK2 (ök2)** | Nein (öffentliche Demo, kein Mandanten-Checkout in dieser Kette) | URL-Manipulation `?context=oeffentlich` auf Lizenznehmer-Host | Bereits: `TenantContext` / Plattform-Hostname (Regel Lizenznehmer). |
| **LVK2 (VK2)** | Ja (Admin: `pro` + `productLine: 'vk2'`) | POST `/api/create-checkout` mit **günstigerem** `licenceType` + `productLine: 'vk2'` → VK2-Zugang zum falschen Preis | **Neu:** `resolveGalleryOrVk2ProductLineForCheckout` – VK2 nur bei **`licenceType === 'pro'`** und `productLine === 'vk2'`. Tests in `stripeLicenceContract.test.ts`. |
| **LFK2 (K2 Familie)** | Ja (`familie_monat` / `familie_jahr`) | Familie landet in K2-Hub / falscher Admin | Bereits: `buildAdminUrlForLicence`, `parseFamilieTenantIdFromGalerieUrl`, `jsonFromDbLicence`, `LizenzErfolgPage` (Hub-Derive), `resolveLizenzErfolgProductLine`, `productLineFromStripeSession`. |
| **K2 Galerie (Lizenz)** | Ja (`basic`…`propplus`) | Falsches `product_line` in API vs. URLs | Bereits: `resolveLizenzErfolgProductLine` / `normalizeProductLineFromApi`; Erfolgsseite korrigiert Hub-Admin bei Familie. |

## Technische Kette (eine Quelle)

- Checkout: `api/createCheckoutShared.js` → Stripe-Metadaten.
- Webhook: `api/stripeWebhookLicenceShared.js` → `rowsFromCheckoutSession`, `buildAdminUrlForLicence`.
- Nachkauf: `api/get-licence-by-session.js` → DB + Stripe-Fallback.
- UI: `src/pages/LizenzErfolgPage.tsx`, `src/utils/publicLinks.ts` (`normalizeLicenseeAdminUrl` für Familie-Pfade), `src/utils/lizenzErfolgCopy.ts`.

## Offene Randfälle (bewusst kurz)

- **LK2:** Kein Stripe-Lizenzprodukt; Pilot-Einladungen wählen Demo-Kontext – kein K2-Stammdaten-Leak (eigenes Regelwerk).
- **Manuelles DB-Fälschen:** Nur Betrieb/Supabase; App kann Metadaten nicht als alleinige Wahrheit gegen widersprüchliche DB-Zeilen immunisieren – Erfolgsseite nutzt bereits URL-/`licence_type`-Anker.

## Verweise

- `docs/ADMIN-QR-LIZENZ-OEK2-ABLAUF.md`, `.cursor/rules/lizenz-anmeldung-stripe-erfolg.mdc`, `docs/GELOESTE-BUGS.md` (VK2/Familie).
