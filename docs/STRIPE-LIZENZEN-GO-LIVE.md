# Stripe/Lizenzen – Die nächsten 3 Schritte (Go-Live)

**Stand:** 02.03.26  
**Sportwagen-Prinzip:** Eine Quelle (Technik-Plan), eine API (licence-data), Webhook → Supabase. Siehe **SPORTWAGEN-ROADMAP.md** Phase 7.3.

---

## Die nächsten 3 Schritte (nichts vergessen)

| # | Schritt | Wo / Was | Erledigt |
|---|--------|----------|----------|
| **1** | **Supabase: Migration 003 ausführen** | Tabellen `licences`, `payments`, `empfehler_gutschriften` anlegen. **Datei:** `supabase/migrations/003_stripe_licences_payments_gutschriften.sql`. **Ort:** Supabase Dashboard → SQL Editor (Inhalt der Datei einfügen und ausführen) oder Supabase CLI. | [ ] |
| **2** | **Vercel: Umgebungsvariablen eintragen** | In Vercel → Projekt → Settings → Environment Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (aus Supabase Dashboard → Settings → API). Bereits für Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Optional: `VERCEL_URL` wird von Vercel gesetzt. | [ ] |
| **3** | **Stripe: Webhook konfigurieren** | Stripe Dashboard → Entwickler → Webhooks → Endpunkt hinzufügen. **URL:** `https://k2-galerie.vercel.app/api/webhook-stripe`. **Event:** `checkout.session.completed`. Signing Secret kopieren und als `STRIPE_WEBHOOK_SECRET` in Vercel eintragen (falls noch nicht). | [ ] |

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
