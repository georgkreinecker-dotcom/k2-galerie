# Vision umsetzen – was als Nächstes (zum Abhaken)

**Stand:** 08.03.26  
**Zweck:** Eine Seite: Vision (1.000 / 10.000 / 100.000 Lizenzen) – **was konkret als Nächstes** zu tun ist. Zum Abhaken, ohne Suchen.

**Vision & Plan:** docs/MARKTDURCHDRINGUNG-PLAN-EFERDING-WELT.md (Ziel, Meilensteine M1–M5).

---

## M1 – Technik startklar (Blockade für ersten Online-Verkauf)

| # | Schritt | Wo / Was | Erledigt |
|---|--------|----------|----------|
| 1 | **Supabase: Migration 003** | Tabellen `licences`, `payments`, `empfehler_gutschriften` anlegen. **Datei:** `supabase/migrations/003_stripe_licences_payments_gutschriften.sql`. **Ort:** Supabase Dashboard → SQL Editor → Inhalt einfügen, ausführen. | [ ] |
| 2 | **Vercel: Umgebungsvariablen** | Vercel → Projekt → Settings → Environment Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` eintragen. (Supabase-Werte aus Supabase Dashboard → Settings → API.) | [ ] |
| 3 | **Stripe: Webhook** | Stripe Dashboard → Entwickler → Webhooks → Endpunkt hinzufügen. **URL:** `https://k2-galerie.vercel.app/api/webhook-stripe`. **Event:** `checkout.session.completed`. Signing Secret kopieren → als `STRIPE_WEBHOOK_SECRET` in Vercel. | [ ] |

**Test nach M1:** Lizenz „online kaufen“ (z. B. Test-Karte) → Zahlung → Erfolgsseite mit Galerie-URL; Eintrag in Supabase-Tabelle `licences`.

**Detail:** docs/STRIPE-LIZENZEN-GO-LIVE.md

---

## M2 – Erste sichtbare Aktion Eferding (mindestens eines)

| # | Aktion | Wo / Was | Erledigt |
|---|--------|----------|----------|
| 1 | **Presseinfo (regional)** | Vorlage ausfüllen (Datum, Galeriename, Ort). Adressen: docs/MEDIENVERTEILER-EROEFFNUNG.md. Versand an OÖN, MeinBezirk, Tips, ORF OÖ. Vorlage: docs/SICHTBARKEIT-PHASE1-VORLAGEN.md §6 bzw. mök2 → Sichtbarkeit & Werbung. | [ ] |
| 2 | **QR / Flyer in Eferding** | QR aus APf (Mission Control / Galerie) auf Flyer, Visitenkarte oder in der Galerie ausstellen. Führt auf Willkommensseite oder Galerie. URLs: mök2 → Links & QR. | [ ] |
| 3 | **Erste gezielte Ansprache** | z. B. einen Kunstverein, Künstler:innen aus dem Umkreis, Galerien ansprechen – mit Link zur Demo/Willkommensseite. | [ ] |

**Danach:** M3 (erste Lizenz/Pilot aus Region) → M4 (regional ausweiten) → M5 (keine geografische Begrenzung).

---

## Optional – Vermarktung einmal einrichten (läuft dann automatisch)

| # | Was | Wo | Erledigt |
|---|-----|-----|----------|
| 1 | Google Business Profile | business.google.com – Eintrag mit Name, Adresse, Website-Link, 1–3 Fotos, Kurzbeschreibung (Werbelinie). Vorlage: docs/SICHTBARKEIT-PHASE1-VORLAGEN.md §2. | [ ] |
| 2 | Social Bio + Link | Instagram/Facebook Bio: Werbelinie + Link in Bio → willkommen. Vorlage: SICHTBARKEIT-PHASE1 §3. | [ ] |
| 3 | Google Search Console + Sitemap | search.google.com/search-console – Eigenschaft k2-galerie.vercel.app, Sitemap `sitemap.xml` eintragen. Vorlage: SICHTBARKEIT-PHASE1 §1. | [ ] |

**Quelle:** docs/VERMARKTUNGSSTRATEGIE-AUTOMATISIERT-SPORTWAGENMODUS.md (alle Kanäle ohne große Kosten).

---

## Kurz

- **Blockade für ersten Verkauf:** Nur M1 (3 Schritte Stripe). Alles andere steht.
- **Nach M1:** M2 setzen (eine Presseinfo oder QR/Flyer oder erste Ansprache) → dann M3, M4, M5 im Takt mit der Vision (1.000 / 10.000 / 100.000).
