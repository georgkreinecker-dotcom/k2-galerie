# Audit-Prozess: Programmsicherheit & Go-Live

**Zweck:** Ein **fester Ablauf**, wann und wie ihr die Punkte aus **SICHERHEIT-VOR-GO-LIVE** (und eng verwandte Themen) **systematisch prüft**, **bewertet** und **nachweisbar festhaltet**. Nicht „mal irgendwann im Kopf“, sondern **reproduzierbar** für Georg, Informatiker:innen und KI-Sessions.

**Stand:** 22.03.26

**Inhalt:** dieser Prozess · **Detail-Inhalte** der Prüfpunkte · **docs/SICHERHEIT-VOR-GO-LIVE.md**  
**Daten-Schicht / Tests (ergänzend):** **docs/SERVICE-ARBEIT-DATEN-TESTS.md** · `npm run test:daten` · `npm run test`

---

## 1. Wann diesen Audit auslösen (Trigger)

| Situation | Empfehlung |
|-----------|------------|
| **Erster / breiter Marktstart** | Vollständiger Durchlauf aller Zeilen der Ampeltabelle (Priorität 1, dann 2, dann Zahlung). |
| **Vor größerem Release** (API, Auth, Vercel, Supabase) | Mindestens Priorität 1 + Zeile „Zahlung“ wenn Checkout/Webhook berührt wird. |
| **Regelmäßig im Betrieb** | z. B. **quartalsweise:** npm audit, Env-Check stichprobenartig, Backup-Hinweis; **jährlich** oder nach Vorfall: volle Tabelle. |
| **Nach Sicherheitsvorfall / Leak** | Sofort: 1.4 Secrets, 1.1 API-Zugang, ggf. Keys rotieren; danach halber oder voller Audit. |

---

## 2. Ablauf in fünf Schritten (verbindlich)

1. **Vorbereiten**  
   Aktuelle **Ampeltabelle** (Abschnitt 5) öffnen; Datum der letzten Runde lesen.

2. **Technisch prüfen**  
   Pro Zeile: gegen **SICHERHEIT-VOR-GO-LIVE** (und verlinkte Docs) abgleichen – nicht nur „fühlt sich gut an“, sondern **konkret** (Vercel, Supabase, ein Testklick, Log).

3. **Tests (Programm-Logik)**  
   Vor Commit/Push ohnehin: **`npm run test`** und **`npm run build`**.  
   Bei Arbeit an Speicher/Merge/Trennung zusätzlich: **`npm run test:daten`** (ersetzt nicht die volle Suite). Siehe **SERVICE-ARBEIT-DATEN-TESTS**.

4. **Bewerten & eintragen**  
   Pro Zeile **Ampel** setzen, **Datum** und **kurze Bemerkung** (z. B. „Vercel Production geprüft“, „bewusst nicht genutzt: APf eine Tür“).

5. **Abschluss**  
   - **docs/DIALOG-STAND.md:** eine Zeile „Audit Programmsicherheit: Datum, Kurzfazit, ggf. offene 🔴“.  
   - Diese Datei: Abschnitt **6 Letzte Audit-Runde** aktualisieren.

---

## 3. Rollen

| Wer | Was |
|-----|-----|
| **Georg** | Freigabe-Entscheid bei Gelb/Rot; inhaltlich AGB/Datenschutz/Impressum. |
| **Informatiker / KI** | Durchführung Schritte 2–3, Eintrag Ampel + Bemerkungen, technische Wahrheit. |
| **Quelle der Wahrheit für Inhalte** | **SICHERHEIT-VOR-GO-LIVE** (erweitert durch die Tabelle unten); bei Widerspruch zur App **Code + Vercel/Supabase** gewinnen, Doku nachziehen. |

**Hinweis APf:** Projektregeln verlangen **Admin von der APf ohne unnötige zweite Tür** (Galerie-Passwort). **Supabase-Login am Admin** ist in **SICHERHEIT-VOR-GO-LIVE** als Option beschrieben – im Audit **bewusst entscheiden**: entweder 🟡 „nicht aktiv, bewusst“ oder 🟢 „aktiv laut ADMIN-AUTH-SETUP“ – und **Bemerkung** festhalten, damit keine Doppel-Wahrheit entsteht.

---

## 4. Ampel – Bedeutung

| Ampel | Bedeutung |
|-------|-----------|
| **Grün** | Geprüft, Anforderung erfüllt oder „bewusst nicht applicable“ mit Begründung in der Bemerkungsspalte. |
| **Gelb** | Teilweise, Ausnahme, nur Staging, oder Follow-up terminiert – **Risiko dokumentiert**. |
| **Rot** | Offen oder fehlgeschlagen – **kein** breiter Go-Live ohne Plan oder explizite Akzeptanz. |

---

## 5. Ampeltabelle – Programmsicherheit & Go-Live

*Nach jeder Runde **Ampel**, **Datum** (TT.MM.JJ) und **Bemerkung** pflegen. IDs beibehalten für Verweise in DIALOG-STAND.*

| ID | Prüfpunkt | Detail-Quelle | Ampel | Geprüft am | Bemerkung |
|----|-----------|---------------|-------|------------|-----------|
| P1.1 | API „An Server senden“ (Key / Auth) | SICHERHEIT 1.1 | 🟡 | 22.03.26 | Code: `X-API-Key` wenn `VITE_WRITE_GALLERY_API_KEY` gesetzt (`publishGalleryData`, `api/write-gallery-data.js`). **Production:** Vercel `WRITE_GALLERY_API_KEY` + `VITE_WRITE_GALLERY_API_KEY` prüfen; einmal „An Server senden“ gegen Live testen. |
| P1.2 | Admin-Zugang (Supabase-Login optional) | SICHERHEIT 1.2, ADMIN-AUTH-SETUP, Regel APf eine Tür | 🟢 | 22.03.26 | **Bewusst:** eine Tür – `AdminRoute` nur `ScreenshotExportAdmin`, Galerie-Passwort (Regel georg-apf-admin-ohne-huerden). Kein Supabase-E-Mail-Gate auf `/admin`. |
| P1.3 | Supabase RLS, Migration 002 | SICHERHEIT 1.3, SUPABASE-RLS-SICHERHEIT | 🟡 | 22.03.26 | `002_artworks_rls_authenticated_only.sql` liegt im Repo. **Offen:** Bestätigung, dass Migration auf **eurem** Supabase-Projekt angewendet ist. |
| P1.4 | Keine Secrets im Repo; Env Vercel/Supabase vollständig | SICHERHEIT 1.4 | 🟡 | 22.03.26 | Repo ohne produktive Secrets (üblich). **Offen:** Stichprobe Vercel/Supabase Production-Env (nur im Dashboard). |
| P1.5 | npm audit – kritisch/hoch behoben | SICHERHEIT 1.5 | 🟡 | 22.03.26 | `npm audit` (22.03.26): 19 Meldungen (u. a. 1 critical, 14 high, u. a. undici). **Follow-up:** triagieren / `npm audit fix` wo sicher möglich. |
| P1.6 | Security-Header / XSS-Basis (vercel.json, Fehlerseiten) | SICHERHEIT 1.6 | 🟢 | 22.03.26 | `vercel.json`: u. a. `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, `Referrer-Policy`; no-cache für index/build-info/projects. |
| P2.1 | AGB / Datenschutz / Impressum inhaltlich aktuell | SICHERHEIT 2.1, VOR-VEROEFFENTLICHUNG | 🟡 | 22.03.26 | **Georg:** Texte für Live-Betrieb inhaltlich freigeben (kein technischer Check in dieser Session). |
| P2.2 | Datenschutz: Transparenz Speicherorte (lokal, Vercel, Supabase, Stripe) | SICHERHEIT 2.2 | 🟡 | 22.03.26 | **Georg / Redaktion:** Datenschutzerklärung vs. tatsächliche Speicherorte (lokal, Vercel, Supabase, ggf. Stripe) abgleichen. |
| P2.3 | Vollbackup erstellt + Wiederherstellung probiert | SICHERHEIT 2.3, Handbuch Backup | 🟡 | 22.03.26 | **Georg:** Admin → Einstellungen → Vollbackup + **Wiederherstellung einmal testen** (nicht nur Download). |
| PZ | **Zahlung / Lizenzen Go-Live** (wenn Online-Kauf live): Migration 003, Vercel Env, Stripe-Webhook | **STRIPE-LIZENZEN-GO-LIVE**, **START-NUR-NOCH-OFFEN** | 🟡 | 22.03.26 | Wenn Online-Lizenz gewünscht: 3 Schritte (Migration 003, Vercel-Env, Stripe-Webhook) – **Dashboard-Arbeit**, siehe Smart Panel / Ready-to-go. |
| PT | **Tests Daten-Schicht** (bei Storage/Merge/Trennung-Änderungen): `npm run test:daten` + volle `npm run test` grün | **SERVICE-ARBEIT-DATEN-TESTS** | 🟢 | 22.03.26 | **Erstrunde:** `npm run test` → 266 Tests OK (25 Files); `npm run test:daten` → 193 Tests OK (11 Files). KI-Session 22.03.26. |

🟢 = erfüllt oder bewusst so beschlossen · 🟡 = Teil offen / nur Repo ohne Production · 🔴 = nicht erfüllt (hier keine 🔴 gesetzt).

---

## 6. Letzte Audit-Runde (Protokoll)

| Feld | Eintrag |
|------|---------|
| **Datum** | 22.03.26 |
| **Durchgeführt von** | KI-Session (Georg: manuelle Punkte P2.x, P1.1 Live-Test, PZ nach Bedarf) |
| **Umfang** | Erstrunde: Ampel gesetzt, PT + technisch nachvollziehbare P1.x/P1.6 aus Repo + `npm audit`; Production-Dashboard nicht eingeloggt geprüft |
| **Kurzfazit** | 🟢 PT, P1.2, P1.6 · 🟡 Rest (Vercel/Supabase live, npm audit Follow-up, Georg Backup/Recht/Stripe) · Siehe Smart Panel **K2 Ready to go** → Abschnitt „Noch von Georg“ / Anker `#k2-ready-georg` auf K2 Softwareentwicklung |
| **Nächster Termin** | Nach Georgs manuellen Häkchen oder quartalsweise laut Trigger-Tabelle |

---

## 7. Verknüpfungen (Lesereihenfolge für Audits)

1. **SICHERHEIT-VOR-GO-LIVE.md** – ausführliche Beschreibung und Checklisten.  
2. **Diese Datei** – Prozess + Ampeltabelle.  
3. **VOR-VEROEFFENTLICHUNG.md** – Gesamt-Check vor Veröffentlichung.  
4. **SICHERHEIT-STABILITAET-CHECKLISTE.md** – Stabilität / Einbruch-Perspektive.  
5. **SICHERHEIT-LIZENZNEHMER-KEIN-OEK2-VK2.md** + Code – Mandantenisolation.  
6. **SERVICE-ARBEIT-DATEN-TESTS.md** – Test-Audit Datenpfade.

---

## Kurzfassung

**Ein Audit** = Trigger wählen → Schritte 1–5 → Ampeltabelle + Abschnitt 6 pflegen → DIALOG-STAND.  
**Eine Quelle für die inhaltlichen Forderungen** bleibt **SICHERHEIT-VOR-GO-LIVE**; **dieses Dokument** ist die **Spielanleitung und das Protokollbuch**.
