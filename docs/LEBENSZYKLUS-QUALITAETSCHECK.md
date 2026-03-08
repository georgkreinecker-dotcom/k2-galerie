# Lebenszyklus Klient – Qualitätscheck (08.03.26)

**Zweck:** Gründlicher Check des gesamten Ablaufs Geburt → Aktives Leben → Sterben. Nichts soll schiefgehen – daran hängt der Betrieb.

---

## 1. Geburt (Checkout → aktiver Klient)

| Prüfpunkt | Status | Detail |
|-----------|--------|--------|
| tenantId beim Checkout | ✅ | `api/create-checkout.js`: `generateTenantId(email)` (E-Mail-Slug + Zufall), in `metadata.tenantId` der Session |
| Webhook schreibt Lizenz | ✅ | `api/webhook-stripe.js`: `checkout.session.completed` → liest `metadata.tenantId`, `galerieUrl = baseUrl + '/g/' + tenantId`, Insert in `licences` mit `tenant_id`, `galerie_url` |
| Supabase-Spalten | ✅ | Migration 007 (tenant_id, galerie_url) – von Georg 08.03.26 in k2-galerie-test ausgeführt |
| Erfolgsseite lädt Lizenz | ✅ | `get-licence-by-session?session_id=...` → `galerie_url`, `tenant_id`, `admin_url` (mit ?tenantId=) |
| Erfolgsseite zeigt Links | ✅ | LizenzErfolgPage: „Deine Galerie“ (galerie_url), „Galerie bearbeiten (Admin)“ (admin_url) |
| **Race Webhook vs. Erfolgsseite** | ⚠️ behoben | Wenn User sofort nach Redirect die Seite sieht, kann Webhook noch nicht durch sein → „Lizenz noch nicht gefunden“. **Fix:** Retry 2–3× mit Verzögerung (z. B. 1,5 s, 3 s). |
| Route /g/:tenantId | ✅ | GalerieTenantPage lädt `api/gallery-data?tenantId=`, zeigt Galerie oder „Jetzt gestalten“ + Admin-Link |
| Admin mit ?tenantId= | ✅ | TenantContext: dynamicTenantId aus URL; Admin lädt/speichert nur über API, kein localStorage |

---

## 2. Aktives Leben (Nutzen, Veröffentlichen, Laden)

| Prüfpunkt | Status | Detail |
|-----------|--------|--------|
| Lesen | ✅ | `api/gallery-data.js`: tenantId aus Query, getBlobPath(tenantId), K2/oeffentlich/vk2 + sichere Custom-IDs (a-z0-9-, 1–64) |
| Schreiben | ✅ | `api/write-gallery-data.js`: body.tenantId, gleiche getBlobPath-Logik, K2-Schutz (token nur bei k2) |
| Ein Blob pro Mandant | ✅ | gallery-data.json (k2), gallery-data-oeffentlich.json, gallery-data-vk2.json, gallery-data-{tenantId}.json |
| Admin dynamischer Mandant | ✅ | Bei dynamicTenantId: nur API-Laden, Speichern nur über „Veröffentlichen“ → write-gallery-data mit body.tenantId; saveArtworks No-Op |

---

## 3. Sterben (Kündigung)

| Prüfpunkt | Status | Detail |
|-----------|--------|--------|
| „Lizenz beenden“ im Admin | ✅ | ScreenshotExportAdmin: Einstellungen → Lizenz beenden (ök2 + **dynamische Mandanten**); tenantId = dynamicTenantId \|\| oeffentlich \|\| vk2 |
| cancel-subscription API | ✅ | POST body.tenantId → wenn erlaubt (nicht k2) Blob del(); Feedback optional |
| delete-tenant-data API | ✅ | Nur mit TENANT_DELETE_SECRET; K2 wird nie gelöscht (400); sichere tenantIds |
| Stripe subscription.deleted | ✅ | webhook-stripe: metadata.tenantId aus Subscription, ruft delete-tenant-data mit Secret auf. **Hinweis:** Bei aktuell **mode: 'payment'** (Einmalzahlung) gibt es keine Subscription → Event kommt nur bei Abo-Modell. Bei Einmalzahlung: Kündigung nur über „Lizenz beenden“-Button. |
| VK2 „Lizenz beenden“ | ℹ️ | Aktuell nur ök2 + dynamische Mandanten mit Button; VK2 bewusst ohne (Zeile 2041 leitet VK2 von lizenzbeenden weg). Bei Bedarf später ergänzbar. |

---

## 4. Konsistenz & Sicherheit

| Prüfpunkt | Status |
|-----------|--------|
| isSafeTenantId überall gleich | ✅ | a-z0-9-, 1–64 Zeichen in gallery-data, write-gallery-data, delete-tenant-data, cancel-subscription, TenantContext, GalerieTenantPage |
| K2 niemals löschbar | ✅ | delete-tenant-data + cancel-subscription: tenantId === 'k2' → 400 bzw. nicht erlaubt |
| getBlobPath einheitlich | ✅ | k2 → gallery-data.json; oeffentlich/vk2/safe → gallery-data-{id}.json |

---

## 5. Bekannte Abhängigkeiten („von außen“)

- **Supabase:** Migration 007 einmal ausgeführt ✅ (08.03.26).
- **Vercel Env:** STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY für Geburt; **TENANT_DELETE_SECRET** optional für automatische Löschung bei Stripe subscription.deleted (bei Abo-Modell).
- **Stripe:** Webhook-URL auf `/api/webhook-stripe` zeigen; bei **payment** (Einmalzahlung) kein subscription.deleted – Kündigung nur über „Lizenz beenden“.

---

## 6. Durchgeführte Fixes (08.03.26)

1. **Erfolgsseite Retry:** Bei „Lizenz noch nicht gefunden“ 2× Retry nach 1,5 s und 3 s, damit Webhook-Race abgefangen wird.
2. **Lizenz beenden + dynamische Mandanten:** Button „Lizenz beenden“ wird auch bei **dynamicTenantId** angezeigt (nicht nur ök2); beim Aufruf wird `tenantId: tenant.dynamicTenantId || (tenant.isOeffentlich ? 'oeffentlich' : tenant.isVk2 ? 'vk2' : undefined)` an cancel-subscription gesendet, damit auch Lizenzkunden ihren Blob löschen können.

---

**Kurz:** Lebenszyklus ist durchgängig abgedeckt. Kritische Lücken (Erfolgsseite-Retry, Lizenz beenden für dynamische Mandanten) wurden geschlossen.
