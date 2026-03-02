# Supabase – wozu, Vorteile, Kosten, Wartung

**Stand:** 02.03.26  
**Zweck:** Klarheit für Georg: Wofür brauchen wir Supabase im Projekt, was bringt es, was kostet es, wie viel Wartung kommt dazu?

---

## Wofür brauchen wir Supabase (bei uns konkret)?

Im **K2-Galerie-Projekt** wird Supabase aktuell an **zwei Stellen** erwähnt – nur eine davon ist für den **Lizenzen-Start** zwingend:

| Nutzung | Wo | Pflicht für Start? |
|--------|-----|---------------------|
| **Lizenzen & Zahlungen (Stripe)** | Webhook speichert nach Kauf in Supabase-Tabellen (`licences`, `payments`, `empfehler_gutschriften`). Lizenzen-Seite liest darüber (Export CSV/PDF). | **Ja**, wenn du „Lizenz online kaufen“ mit Speicherung und Abrechnung nutzen willst. |
| **Werke (Artworks) / Admin-Auth** | Im Code gibt es optional Supabase für Werke-Sync und früher Admin-Login. **Aktuell:** Galerie nutzt localStorage + gallery-data.json; Admin per Galerie-Passwort. | **Nein.** Du brauchst Supabase nicht für die Galerie oder den Admin-Einstieg. |

**Kurz:** Supabase brauchst du **nur für die Lizenzen-/Zahlungs-Datenbank**. Dort legt der Stripe-Webhook ab: wer hat welche Lizenz gekauft, welche Zahlung, welche Empfehler-Gutschrift. Ohne Supabase: Keine zentrale Tabelle in deiner Hand – du müsstest alles aus dem Stripe-Dashboard auswerten (umständlich, kein CSV/PDF aus einer eigenen Abrechnung).

---

## Was bringt Supabase dafür (Vorteile)?

- **Eine zentrale Ablage** für gekaufte Lizenzen, Zahlungen und Gutschriften – unabhängig von Stripe (Stripe bleibt Zahlungsabwickler, die „Buchführung“ liegt bei dir).
- **Lizenzen-Seite in der App:** „Online gekaufte Lizenzen & Abrechnung“ mit Tabellen, „Daten neu laden“, **CSV-Export** und **Als PDF drucken** – alles aus einer Quelle.
- **Empfehler-Gutschriften** automatisch pro Zahlung gespeichert – für Abrechnung und Empfehlungsprogramm.
- **Kein eigener Server:** Supabase hostet die Datenbank; du führst einmal die Migration aus und trägst URL + Key in Vercel ein. Backups und Verfügbarkeit liegen bei Supabase.

---

## Kosten

| Plan | Kosten | Für uns relevant |
|------|--------|-------------------|
| **Free** | **0 €/Monat** | Reicht für Lizenzen/Zahlungen: kleine Tabellen (licences, payments, empfehler_gutschriften), kaum Speicher. Limit z. B. 500 MB Datenbank, 2 Projekte. |
| **Pro** | ca. 10–25 USD/Monat | Nur nötig, wenn du mehr DB-Speicher, tägliche Backups oder mehr Projekte brauchst. |

**Empfehlung:** Mit Free starten. Für reine Lizenzen-/Zahlungs-Tabellen reicht das lange.

---

## Wartungsaufwand (Supabase allein)

| Aufgabe | Wie oft | Aufwand |
|---------|---------|---------|
| **Migration 003 ausführen** | **Einmal** beim Go-Live | 5–10 Min: SQL in Supabase Dashboard einfügen, ausführen. |
| **Env in Vercel** (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) | **Einmal** (evtl. bei neuem Projekt) | 2 Min. |
| **Supabase Dashboard** | Gelegentlich (z. B. prüfen ob Tabellen da sind, Backups im Paid-Plan) | Kein Muss; nur bei Problemen oder Abrechnung prüfen. |
| **Updates / Sicherheitspatches** | Von Supabase bereitgestellt (gehostete DB) | **Kein eigener Wartungsaufwand** – du wartest keine Server. |

**Fazit:** Supabase ist **kein laufender großer Wartungsaufwand**. Einmal einrichten, danach läuft es. Der Wartungsaufwand fürs **gesamte Projekt** (Vercel, Stripe, npm, Backup, Doku) ist separat – siehe **docs/WARTUNG-PROJEKT.md**.

---

## Alternative: Ohne Supabase starten

Wenn du Supabase (noch) nicht nutzen willst:

- **„Lizenz online kaufen“** führt weiterhin zu Stripe – Kunden zahlen.
- **Nach der Zahlung** wird **nichts** in deiner App gespeichert (Webhook kann nicht schreiben).
- **Lizenzen-Seite:** Bereich „Online gekaufte Lizenzen“ bleibt leer; du siehst die Käufe nur im **Stripe-Dashboard** (manuell auswerten, keine CSV/PDF aus der App).
- **Empfehler-Gutschriften** müsstest du manuell aus Stripe ableiten.

**Wenn du später doch Supabase nutzen willst:** Migration 003 ausführen, Env setzen, Webhook läuft – dann füllen sich die Tabellen ab dem nächsten Kauf.

---

## Fazit (verbindlich)

- **Free Tier ist am Anfang sicher ausreichend** und ein wichtiger Baustein für den Sportwagen (eine Quelle Lizenzen/Zahlungen, Abrechnung in der App).
- **Vor dem Start:** Supabase-Registrierung durchführen, dann die 3 Schritte (Migration 003, Vercel Env, Stripe Webhook) wie in **docs/STRIPE-LIZENZEN-GO-LIVE.md**.

---

## Kurzfassung

| Frage | Antwort |
|-------|---------|
| **Wozu?** | Nur für Lizenzen/Zahlungen: Webhook schreibt Käufe in eine DB; Lizenzen-Seite + Export nutzen das. |
| **Vorteile?** | Zentrale Ablage, CSV/PDF-Abrechnung, Empfehler-Gutschriften automatisch, kein eigener Server. |
| **Kosten?** | Free Tier (0 €) reicht für den Start; Paid ab ca. 10–25 USD/Monat bei Bedarf. |
| **Wartung?** | Einmal Migration + Env; danach kaum – gehostete DB, keine Server-Wartung von dir. |

Ausführlicher Wartungsaufwand **gesamtes Projekt:** **docs/WARTUNG-PROJEKT.md** (Wartungsheft).
