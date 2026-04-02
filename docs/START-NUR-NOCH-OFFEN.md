# Start – Nur noch das offen, alles andere ist vorbereitet

**Stand:** 02.03.26  
**Zweck:** Eine Stelle: Was ist die **minimale, notwendige** Restriktion vor dem Start – und was ist **bereits startbereit**. Nichts anderes blockiert.

---

## ✅ Startbereit (keine weiteren Restriktionen)

| Bereich | Status |
|--------|--------|
| **Einstieg /willkommen** | Zeigt WillkommenPage mit „Galerie ausprobieren“, „Lizenz anfragen“, „Lizenz online kaufen“. Kein Redirect mehr. |
| **Entdecken /entdecken** | 3-Fragen-Flow, Hub, CTA „Lizenz anfragen“ (Guide + Entdecken). |
| **Lizenzen (Stripe)** | Checkout, Webhook, DB-Migration (Datei da), API licence-data, Export CSV/PDF – **Code fertig.** Nur die 3 Schritte unten (Env + Migration + Webhook) fehlen. |
| **Galerie / Shop / Admin** | Lauffähig. K2, ök2, VK2 getrennt. Stand/QR-Mechanik steht. |
| **Preise** | Eine Quelle `licencePricing.ts`; überall einheitlich. |
| **Build / Deployment** | `npm run build` läuft; Push auf main → Vercel. |

**Es gibt keine weiteren technischen Sperren oder „coming soon“-Blocker für Nutzer.**

---

## 🔶 Nur noch das offen (notwendige Restriktionen)

Das sind die **einzigen** Punkte, die vor „Start“ noch erledigt werden – bewusst minimal.

### 1. Stripe/Lizenzen Go-Live (wenn du Online-Lizenzkauf nutzen willst)

| # | Was | Wo |
|---|-----|-----|
| 1 | Supabase: SQL für Lizenzen in Reihenfolge | Siehe **docs/STRIPE-ANBINDUNG-SCHRITT-FUER-SCHRITT.md** (`003_stripe_…`, `007_…`, `008_…`, **`010_…` eindeutige Session**; nicht die andere `003_add_in_exhibition…` verwechseln) |
| 2 | Vercel: Env eintragen (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET) | Vercel → Projekt → Settings → Environment Variables |
| 3 | Stripe: Webhook anlegen (URL, Event checkout.session.completed, Secret in Vercel) | Stripe Dashboard → Webhooks |

**Detail-Checkliste:** docs/STRIPE-LIZENZEN-GO-LIVE.md  
**Supabase – wozu, Kosten, Wartung:** docs/SUPABASE-WOZU-KOSTEN-WARTUNG.md  

**Ohne diese 3 Schritte:** Lizenz „online kaufen“ führt zu Stripe, aber nach Zahlung werden keine Lizenzen in der DB gespeichert (Webhook schreibt nicht). Alles andere (Galerie, Willkommen, manuelle Lizenzvergabe) funktioniert.

---

### 2. Optional (keine Start-Blockade)

| Punkt | Bedeutung |
|-------|-----------|
| **AGB / Impressum / Datenschutz** | Texte mit Georg prüfen (VOR-VEROEFFENTLICHUNG). Blockiert Start nicht. |
| **npm audit** | Moderate/High prüfen – nur nach Absprache fixen. Blockiert Start nicht. |
| **Admin-Auth** | Aktuell Galerie-Passwort. Supabase-Login nur wenn gewünscht (ADMIN-AUTH-SETUP). |

---

## Was bewusst bleibt (keine Restriktion, sondern gewollt)

- **Admin:** Zugang nur mit Galerie-Passwort (oder später Supabase) – gewollt.
- **K2 vs. ök2 vs. VK2:** Getrennte Daten/Keys – gewollt, keine „Öffnung“.

---

## Kurzfassung

- **Startbereit:** Alles außer den 3 Stripe-Schritten und den optionalen Prüfpunkten.
- **Notwendig offen:** Nur die 3 Schritte in STRIPE-LIZENZEN-GO-LIVE (wenn Online-Lizenzkauf von Tag 1 an genutzt werden soll).
- **Eine Quelle für „was noch offen“:** Diese Datei (+ STRIPE-LIZENZEN-GO-LIVE für die 3 Schritte).
