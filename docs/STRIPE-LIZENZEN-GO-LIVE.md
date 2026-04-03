# Stripe/Lizenzen – Die nächsten 3 Schritte (Go-Live)

**Stand:** 02.04.26  
**Sportwagen-Prinzip:** Eine Quelle (Technik-Plan), eine API (licence-data), Webhook → Supabase. Siehe **SPORTWAGEN-ROADMAP.md** Phase 7.3.

**Ausführlich (Ende-zu-Ende, inkl. SQL-Reihenfolge 007/008/010/009):** **[STRIPE-ANBINDUNG-SCHRITT-FUER-SCHRITT.md](./STRIPE-ANBINDUNG-SCHRITT-FUER-SCHRITT.md)**  
**Lokal:** `npm run verify:stripe-env` · **STRIPE-TEST-LOKAL.md**

**Technische Konstanten (Webhook-URL, Pfade):** eine Datei im Repo: **`api/stripeLicenceChainConstants.js`** – bei Pfad- oder Host-Änderung dort + diese Doku + Tests anpassen.

---

## Verbindliche Kette (bombensicher)

**Reihenfolge nicht vertauschen.** Erst wenn die vorherige Stufe stimmt, liefert die nächste sinnvolle Daten.

| # | Stufe | Erfolg erkennbar an |
|---|--------|---------------------|
| **A** | **Supabase-SQL** einmal ausgeführt (`stripe_lizenzen_SUPABASE_EIN_RUN.sql` oder Migrationen A–D laut STRIPE-ANBINDUNG) | Tabellen `licences`, `payments`, `empfehler_gutschriften` existieren |
| **B** | **Vercel-Env:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY` | `GET /api/licence-data` ohne „Supabase nicht konfiguriert“; Checkout startet |
| **C** | **Stripe-Webhook:** Endpoint-URL = exakt wie in `stripeLicenceChainConstants.js` (`…/api/webhook-stripe`), Event **`checkout.session.completed`** | Nach Testkauf: **Recent deliveries** = HTTP **2xx** |
| **D** | **`STRIPE_WEBHOOK_SECRET`** in Vercel = Signing Secret dieses Endpoints | **C** liefert 2xx, nicht 400 „Signatur ungültig“ |
| **E** | **Redeploy** nach jedem Env-Wechsel (B/D) | Serverless sieht neue Variablen |
| **F** | **Testkauf** (Testmodus, Karte `4242…`) | Zeile in Supabase `licences` + `payments`; **Lizenzen-Seite** „Online gekauft“ > 0; **`/lizenz-erfolg?session_id=…`** zeigt Galerie-/Admin-Link (kurz warten, Retries in der App) |

**Symptom → meistens Ursache**

| Symptom | Zuerst prüfen |
|--------|----------------|
| Lizenzen-Seite: Online-Listen immer **0**, aber kein roter API-Fehler | **C + D + E** (Webhook-Zustellung, Secret, Redeploy) |
| Erfolgsseite: „Lizenz noch nicht gefunden“ bis Timeout | Derselbe Block – Zeile in `licences` fehlt |
| Checkout geht, Stripe zeigt Zahlung ok, Webhook **4xx/5xx** | Vercel-Logs `webhook-stripe`; Supabase-Env; SQL **A** |
| Nur **Pro++** schlägt in der DB fehl | SQL-Schritt **C** (`008` propplus) – siehe STRIPE-ANBINDUNG |
| Webhook doppelt / Race | SQL **D** (`010` unique `stripe_session_id`) |

---

## Vor dem Start: Supabase-Registrierung

**Fazit:** Free Tier ist am Anfang ausreichend und wichtiger Baustein für den Sportwagen. **Vor dem Start** Registrierung auf supabase.com (Free Tier), Projekt anlegen – dann die 3 Schritte unten.

---

## Die nächsten 3 Schritte (nichts vergessen)

| # | Schritt | Wo / Was | Erledigt |
|---|--------|----------|----------|
| **1** | **Supabase: SQL für Lizenzen ausführen** | **Nicht nur eine Datei:** In Reihenfolge **`003_stripe_licences_payments_gutschriften.sql`** (nicht mit `003_add_in_exhibition…` verwechseln), **`007_licences_tenant_id_galerie_url.sql`**, **`008_licences_licence_type_propplus.sql`**, **`010_licences_payments_stripe_session_unique.sql`**. Optional **`009_pilot_short_invites.sql`**. Details: **STRIPE-ANBINDUNG-SCHRITT-FUER-SCHRITT.md**. | [ ] |
| **2** | **Vercel: Umgebungsvariablen eintragen** | In Vercel → Projekt → Settings → Environment Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (aus Supabase Dashboard → Settings → API). Bereits für Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Optional: `VERCEL_URL` wird von Vercel gesetzt. **Danach Redeploy.** | [ ] |
| **3** | **Stripe: Webhook konfigurieren** | Stripe Dashboard → Entwickler → Webhooks → Endpunkt hinzufügen. **URL:** `https://k2-galerie.vercel.app/api/webhook-stripe`. **Events:** mindestens **`checkout.session.completed`**; empfohlen zusätzlich **`customer.subscription.deleted`**. Signing Secret → `STRIPE_WEBHOOK_SECRET` in Vercel → **Redeploy**. | [ ] |

---

## Nach den 3 Schritten

- **Test:** Lizenz online kaufen (z. B. Test-Karte von Stripe) → Webhook wird aufgerufen → Einträge in Supabase (licences, payments, ggf. empfehler_gutschriften).
- **Lizenzen-Seite:** Bereich „Online gekaufte Lizenzen & Abrechnung“ lädt Daten von `GET /api/licence-data`; CSV-Export und „Als PDF drucken“ nutzbar.

---

## Eine Quelle (Sportwagen)

- **Technik & Ablauf:** `docs/ZAHLUNGSSYSTEM-LIZENZEN-TECHNIK-PLAN.md`
- **Preise:** `src/config/licencePricing.ts`
- **API:** `api/create-checkout.js`, `api/webhook-stripe.js`, `api/licence-data.js`
- **Env:** `.env.example` (Stripe + Supabase für API)

**Regel:** Keine zweite Implementierung für dieselbe Aufgabe; bei Änderungen an Zahlung/Lizenzen zuerst Technik-Plan und diese Checkliste prüfen.
