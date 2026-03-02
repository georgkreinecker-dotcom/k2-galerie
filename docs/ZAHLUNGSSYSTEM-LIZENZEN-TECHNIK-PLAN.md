# Zahlungssystem Lizenzen – konkreter Technik-Plan

**Stand:** 02.03.26  
**Kontext:** Lizenzen (Basic, Pro, Pro+, VK2) werden **nur im Internet vergeben** – nicht in der Galerie vor Ort. Zahlung wie überall üblich: Kreditkarte, PayPal o. Ä. über einen zertifizierten Anbieter.

---

## 1. Ausgangslage

- **Lizenzen heute:** LicencesPage (mök2) – Lizenz vergeben, Empfehler-ID, Gutschrift (10 %) – alles **lokal** (localStorage), keine echte Zahlung.
- **Vorgabe:** Keine Kartendaten in der App speichern; nur **Zahlungsanbieter** (z. B. Stripe, PayPal). Siehe `docs/PRODUKT-LABEL-SICHERHEIT-ROADMAP.md`.
- **Preise:** Fest in `src/config/licencePricing.ts` (15 / 35 / 45 €, VK2 siehe dort).
- **Empfehlungsprogramm:** Bei jeder **echten** Lizenz-Zahlung → 10 % Gutschrift für Empfehler, 10 % Rabatt für Geworbenen; Abrechnung nachvollziehbar (Audit, Export).

---

## 1a. Welches System: einfachste und kostengünstigste Lösung (inkl. K2 Familie)

**Empfehlung: Stripe** – für unsere App und mit Blick auf ein mögliches **K2-Familie-Projekt** (falls dort später z. B. Premium oder Zusatzfunktionen gegen Entgelt angeboten werden).

| Kriterium | Stripe | PayPal (eigenes Checkout) |
|-----------|--------|---------------------------|
| **Einfachheit** | **Eine** Integration: Karte + PayPal (über Stripe) in einem Checkout, ein Webhook, eine API. Kein zweites System für PayPal. | Zwei Integrationen, wenn du Karte und PayPal willst (PayPal nur für PayPal-Zahlung). |
| **Kosten (Europa, Stand 2024/25)** | **1,5 % + 0,25 €** pro Transaktion (EU-Karten). Bei 35 € Lizenz: ca. 0,78 €. | **2,9 % + 0,35 €** pro Transaktion. Bei 35 €: ca. 1,37 €. Stripe deutlich günstiger. |
| **Gebühren (Fixkosten)** | Keine monatliche Grundgebühr im Standard. | Keine monatliche Grundgebühr. |
| **K2 Galerie + K2 Familie** | **Ein** Stripe-Konto, **eine** technische Anbindung: verschiedene Produkte/Preise (Lizenzen Galerie vs. ggf. Familien-Premium) über dieselbe API/Webhook abbildbar. | Gleich möglich, aber zweite Integration wenn zusätzlich Karte gewünscht. |

**K2 Familie:** Falls ihr später für K2 Familie etwas gegen Entgelt anbietet (z. B. erweiterter Speicher, Premium-Stammbaum, Export), reicht **dasselbe Stripe-Konto**: neue Preise/Produkte anlegen, gleicher Checkout- und Webhook-Flow. Kein zweites Zahlungssystem nötig.

**Fazit:** Stripe = **einfach** (eine Integration für Karte + PayPal), **kostengünstiger** in Europa, und **skalierbar** für K2 Galerie und K2 Familie mit einem System.

---

## 2. Konkreter Technik-Plan (Reihenfolge)

### Phase A: Anbieter & Konto

| Schritt | Was | Details |
|--------|-----|--------|
| A1 | **Zahlungsanbieter wählen** | **Stripe** (empfohlen: Karte + PayPal in einer Integration, günstigere Gebühren, ein System für K2 Galerie und ggf. K2 Familie). Alternativ: reines PayPal-Checkout (einfach, aber teurer und nur PayPal). |
| A2 | **Konto anlegen** | Stripe.com bzw. PayPal Business; Verifizierung (Firma/Person, Bankkonto). |
| A3 | **API-Zugang** | Publishable Key (Frontend) + Secret Key (nur Backend); Webhook-URL für „Zahlung erfolgreich“. Keys **nie** im Frontend, nur in Umgebungsvariablen (Vercel/Supabase). |

---

### Phase B: Backend (Zahlung + Speicher)

| Schritt | Was | Details |
|--------|-----|--------|
| B1 | **Backend-Dienst** | **Vercel Serverless** (API-Routes unter `/api/...`) oder **Supabase Edge Functions**. Beides kann Stripe/PayPal aufrufen und Webhooks empfangen. |
| B2 | **Checkout-Session erstellen** | API-Route z. B. `POST /api/create-checkout` (oder Supabase Function): Eingabe = Lizenztyp (basic/pro/proplus/vk2), E-Mail, optional **Empfehler-ID**. Backend erzeugt bei Stripe eine **Checkout Session** (Betrag aus licencePricing, Metadaten: licenceType, empfehlerId). Antwort = URL zur Zahlungsseite (Redirect). |
| B3 | **Webhook „Zahlung erfolgreich“** | Route z. B. `POST /api/webhook/stripe`: Stripe ruft diese URL auf, wenn Zahlung erfolgreich. Backend: Signatur prüfen → Zahlung in DB speichern (Betrag, Datum, Lizenztyp, Stripe-Payment-ID, Empfehler-ID aus Metadaten) → Lizenz für Kund:in anlegen/aktivieren → **10 % Gutschrift** für Empfehler berechnen und speichern (Abrechnungstabelle). |
| B4 | **Erfolgs-URL** | Nach Bezahlung leitet Stripe zur **Success-URL** (z. B. `/lizenz-erfolg?session_id=...`) – dort Anzeige „Lizenz aktiv“, ggf. E-Mail-Versand vorbereiten (später). |

**Wichtig:** Kartendaten berührt nur Stripe/PayPal; die App speichert nur Transaktions-ID, Betrag, Lizenztyp, Empfehler-ID.

---

### Phase C: Datenbank (persistente Lizenzen & Zahlungen)

| Schritt | Was | Details |
|--------|-----|--------|
| C1 | **Tabelle Lizenzen** | z. B. Supabase: `licences` – id, email, name, licence_type (basic/pro/proplus/vk2), status (active/cancelled), empfehler_id (optional), created_at, stripe_customer_id (optional für Abo). |
| C2 | **Tabelle Zahlungen** | `payments` – id, licence_id, amount_eur, currency, stripe_payment_id (oder paypal_id), paid_at, empfehler_id (aus Checkout-Metadaten). |
| C3 | **Tabelle Gutschriften (Abrechnung)** | `empfehler_gutschriften` – id, empfehler_id, amount_eur, payment_id, licence_id, created_at. (Oder an bestehende Logik in `empfehlerGutschrift.ts` anbinden, sobald Zahlungen aus DB kommen.) |
| C4 | **Migration** | SQL-Migration in Supabase anlegen; RLS so setzen, dass nur berechtigte Nutzer (Admin) Lizenzen/Zahlungen lesen; Frontend darf nur Checkout starten, nicht Zahlungstabellen lesen. |

Heute: LicencesPage schreibt in **localStorage** (`k2-license-grants`). Für echte Zahlung: entweder **nach** erfolgreicher Zahlung Backend schreibt in DB und Frontend liest von dort – oder Übergang: weiter localStorage für „manuell vergeben“, DB nur für „online bezahlt“.

---

### Phase D: Frontend (Checkout-Flow)

| Schritt | Was | Details |
|--------|-----|--------|
| D1 | **Einstieg „Lizenz kaufen“** | Klarer Button/Link (z. B. auf Entdecken, im Guide, auf LicencesPage für Kund:innen): „Basic/Pro/Pro+ jetzt buchen“ → Auswahl Lizenztyp (+ optional Empfehler-ID aus URL `?empfehler=K2-E-XXXXXX` vorausfüllen). |
| D2 | **Checkout starten** | Frontend ruft Backend `POST /api/create-checkout` mit { licenceType, email, name, empfehlerId? }. Backend antwortet mit { url: Stripe-Checkout-URL }. Frontend: `window.location.href = url` (Redirect zu Stripe). |
| D3 | **Seite „Lizenz erworben“** | Erfolgs-URL (z. B. `/lizenz-erfolg`) – Dankeseite, „Deine Lizenz ist aktiv“, Hinweis auf E-Mail (wenn Versand implementiert). Kein Anzeigen von Kartendaten. |

---

### Phase E: Abrechnung & Nachvollziehbarkeit

| Schritt | Was | Details |
|--------|-----|--------|
| E1 | **Bei jeder Zahlung (Webhook)** | Bereits in B3: Zahlung speichern, Gutschrift 10 % für Empfehler berechnen, in `empfehler_gutschriften` (oder Äquivalent) schreiben. |
| E2 | **Export für Buchhaltung** | Admin-Bereich (mök2/Lizenzen oder eigener Tab): „Zahlungen exportieren“ (CSV/PDF) – Zeitraum, Liste Zahlungen + zugehörige Gutschriften. Siehe `docs/ABRECHNUNGSSTRUKTUR-EMPFEHLUNGSPROGRAMM.md`. |
| E3 | **Audit** | Keine Zahlung/Gutschrift „im Dunkeln“ – alles in DB mit Datum, Betrag, Zuordnung. Optional: Log-Tabelle für „Abrechnungslauf ausgeführt am …“. |

---

## 3. Kurz-Übersicht Ablauf (Online nur)

```
Kund:in klickt „Lizenz buchen“ (z. B. Pro 35 €/Monat)
  → Frontend: Lizenztyp + ggf. Empfehler-ID aus Link
  → Frontend ruft Backend: create-checkout
  → Backend: Stripe Checkout Session (35 €, Metadaten: empfehlerId)
  → Redirect zu Stripe → Kund:in zahlt mit Karte/PayPal
  → Stripe sendet Webhook „payment succeeded“ an Backend
  → Backend: Zahlung in DB, Lizenz anlegen, 10 % Gutschrift für Empfehler
  → Redirect zur Success-Seite in der App: „Lizenz aktiv“
```

Lizenzen werden **nur im Internet** abgeschlossen und bezahlt – nicht in der Galerie; Zahlung wie überall üblich (Karte, PayPal) über den gewählten Anbieter.

---

## 4. Was nicht in der App passiert

- **Keine** Erfassung oder Speicherung von Kreditkartennummern, CVV, etc. – das macht ausschließlich Stripe/PayPal (PCI-DSS).
- **Keine** Zahlung „in der Galerie“ für Lizenzen – nur Online-Checkout (Redirect oder eingebettetes Stripe-Element, je nach Anbieter).
- Shop/Kasse (Bar, Karte vor Ort, Überweisung) bleibt für **Verkauf von Kunstwerken** in der Galerie; Lizenzzahlungen laufen getrennt über den Online-Zahlungsanbieter.

---

## 5. Stripe umgesetzt (Stand 02.03.26)

- **Backend (Vercel):** `api/create-checkout.js` (Checkout-Session), `api/webhook-stripe.js` (Webhook: Signaturprüfung → Lizenz + Zahlung + Gutschrift in Supabase).
- **Frontend:** `LizenzKaufenPage` (`/projects/k2-galerie/lizenz-kaufen`), `LizenzErfolgPage` (`/lizenz-erfolg`). Link „Lizenz online kaufen“ auf LicencesPage und im LicenseManager.
- **Datenbank:** Migration `supabase/migrations/003_stripe_licences_payments_gutschriften.sql` – Tabellen `licences`, `payments`, `empfehler_gutschriften`. RLS: nur authentifiziert lesen; Schreiben nur über service_role (Webhook).
- **Umgebungsvariablen (Vercel):** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Optional `VERCEL_URL`. Siehe `.env.example`.
- **Stripe Dashboard:** Webhook-URL: `https://k2-galerie.vercel.app/api/webhook-stripe`, Event `checkout.session.completed`. Signing Secret → `STRIPE_WEBHOOK_SECRET`.

**Noch offen:** Migration in Supabase ausführen (einmalig); Export CSV/PDF für Zahlungen + Gutschriften (Admin).

---

## 5a. Nächste konkrete Schritte (nach Go-Live Stripe)

1. **Stripe-Konto:** Anlegen, Keys in Vercel eintragen, Webhook-URL konfigurieren.
2. **Supabase:** Migration 003 ausführen (Tabellen anlegen); `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in Vercel eintragen.
3. **Export:** CSV/PDF für Zahlungen + Gutschriften (Admin, optional).

---

## 6. Verknüpfung mit bestehender Doku

- **Sicherheit Zahlungen:** `docs/PRODUKT-LABEL-SICHERHEIT-ROADMAP.md` (Priorität 2: nur Provider, nie Karten speichern).
- **Abrechnung Empfehlung:** `docs/ABRECHNUNGSSTRUKTUR-EMPFEHLUNGSPROGRAMM.md`, `docs/EMPFEHLUNGSKONZEPT-EINFACHER-WEG.md` (10 % Rabatt / 10 % Gutschrift).
- **Lizenzpreise:** `src/config/licencePricing.ts` – eine Quelle für Beträge im Checkout.
- **Ök2/Lizenz-Stand:** `docs/OEK2-ANMELDUNG-LIZENZIERUNG-STAND.md` (CTA „Lizenz anfragen“ heute mailto; nach Umsetzung kann „Lizenz buchen“ auf Checkout führen).

---

*Mit diesem Plan ist die technische Umsetzung des Zahlungssystems für Online-Lizenzen klar abgesteckt: Anbieter → Backend (Checkout + Webhook) → DB → Frontend (Redirect + Success) → Abrechnung/Export.*
