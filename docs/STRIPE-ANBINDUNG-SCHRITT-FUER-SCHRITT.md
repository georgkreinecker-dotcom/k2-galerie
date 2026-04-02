# Stripe-Anbindung – Schritt für Schritt (Ende-zu-Ende)

**Stand:** 02.04.26  
**Ziel:** Von „noch nicht verdrahtet“ bis **Testkauf → Webhook → Supabase → Erfolgsseite mit Galerie-Link**.

Der **Code** liegt im Repo (`api/create-checkout`, `api/webhook-stripe`, `api/licence-data`, `api/get-licence-by-session`, Vite-Proxy in `vite.config.ts`). Diese Anleitung ist die **eine Quelle** für das, was **du in Supabase, Vercel und Stripe** einmalig einrichtest.

---

## Kurz-Überblick (3 Blöcke)

| # | Wo | Was |
|---|-----|-----|
| 1 | **Supabase** | SQL-Dateien **in der Reihenfolge** unten ausführen |
| 2 | **Vercel** | Umgebungsvariablen setzen + **Redeploy** |
| 3 | **Stripe** | Webhook-Endpunkt + Events + **Signing Secret** nach Vercel |

---

## 1. Supabase – SQL in dieser Reihenfolge

**Ort:** Supabase Dashboard → **SQL Editor** → jeweils Inhalt der Datei einfügen → **Run**.

**Wichtig:** Im Ordner `supabase/migrations/` gibt es **zwei** Dateien mit Präfix `003_…`. Für **Lizenzen/Stripe** brauchst du **nur** die Stripe-Datei unten als Schritt A – nicht verwechseln mit `003_add_in_exhibition_to_artworks.sql` (andere Tabelle).

| Schritt | Datei im Repo | Zweck |
|--------|----------------|--------|
| **A** | `003_stripe_licences_payments_gutschriften.sql` | Tabellen `licences`, `payments`, `empfehler_gutschriften` + RLS |
| **B** | `007_licences_tenant_id_galerie_url.sql` | Spalten `tenant_id`, `galerie_url` (Erfolgsseite, `/g/…`) |
| **C** | `008_licences_licence_type_propplus.sql` | Lizenztyp **Pro++** (`propplus`) erlaubt |
| **D** (optional) | `009_pilot_short_invites.sql` | Kurz-URLs Testpilot – nur wenn du Pilot-Einladungen nutzt |

Ohne **B** schreibt der Webhook zwar, aber **get-licence-by-session** liefert keine sinnvolle Galerie-URL wie vorgesehen. Ohne **C** schlägt ein Kauf von **Pro++** in der Datenbank fehl.

---

## 2. Vercel – Environment Variables

**Ort:** Vercel → Projekt **k2-galerie** → **Settings** → **Environment Variables** → für **Production** (und ggf. Preview) anlegen:

| Variable | Herkunft |
|----------|-----------|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → **service_role** (geheim, nie im Frontend) |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys → **Secret key** |
| `STRIPE_WEBHOOK_SECRET` | Erst nach Schritt 3 (Webhook anlegen) – **Signing secret** |

**Danach:** **Redeploy** der Production-Deployment (oder „Redeploy“ im letzten Deployment), damit die Functions die neuen Werte sehen.

**Optional (empfohlen wenn Kündigung/Mandanten-Löschung):**

| Variable | Zweck |
|----------|--------|
| `TENANT_DELETE_SECRET` | Gemeinsam mit `api/delete-tenant-data` – siehe `docs/K2-OEK2-DATENTRENNUNG.md` |

---

## 3. Stripe – Webhook

**Ort:** Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**

| Feld | Wert |
|------|------|
| **Endpoint URL** | `https://k2-galerie.vercel.app/api/webhook-stripe` |
| **Events** | Mindestens **`checkout.session.completed`** |
| | Zusätzlich empfohlen: **`customer.subscription.deleted`** (wenn ihr später Abos nutzt / Kündigung → Daten löschen) |

Nach dem Speichern: **Signing secret** kopieren → in Vercel als **`STRIPE_WEBHOOK_SECRET`** eintragen → **nochmals Redeploy**.

---

## 4. Test (Testmodus)

1. In Stripe **Testmodus** bleiben; `STRIPE_SECRET_KEY` beginnt mit `sk_test_`.
2. In der App **Lizenz online kaufen** durchspielen (Test-Karte z. B. `4242 4242 4242 4242`).
3. In **Stripe** → Webhooks → Endpoint → **Recent deliveries**: Erfolg (2xx).
4. In **Supabase** → Table Editor → `licences` / `payments`: neuer Eintrag.
5. **Erfolgsseite** `/lizenz-erfolg?session_id=…`: Daten erscheinen (kurz warten, bis der Webhook durch ist).

**Lokal (`npm run dev`):** Siehe `docs/STRIPE-TEST-LOKAL.md` und `npm run verify:stripe-env`.

---

## 5. Lokale Prüfung der .env

Im **Cursor Terminal** (Projektroot):

```bash
npm run verify:stripe-env
```

Mit Fehlercode bei fehlenden Pflichtvariablen:

```bash
npm run verify:stripe-env -- --strict
```

---

## Eine Quelle (Technik im Repo)

| Thema | Datei |
|--------|--------|
| Kurz „nur noch 3 Schritte“ | `docs/STRIPE-LIZENZEN-GO-LIVE.md` |
| Diese ausführliche Anleitung | **diese Datei** |
| Lokal testen | `docs/STRIPE-TEST-LOKAL.md` |
| Env-Beispiel | `.env.example` |

**Regel:** Keine zweite Zahlungs-Implementierung bauen – Änderungen immer hier und in `docs/ZAHLUNGSSYSTEM-LIZENZEN-TECHNIK-PLAN.md` spiegeln.
