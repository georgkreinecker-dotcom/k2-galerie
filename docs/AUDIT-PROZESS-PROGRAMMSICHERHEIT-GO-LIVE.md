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
| P1.1 | API „An Server senden“ (Key / Auth) | SICHERHEIT 1.1 | ⬜ | | |
| P1.2 | Admin-Zugang (Supabase-Login optional) | SICHERHEIT 1.2, ADMIN-AUTH-SETUP, Regel APf eine Tür | ⬜ | | |
| P1.3 | Supabase RLS, Migration 002 | SICHERHEIT 1.3, SUPABASE-RLS-SICHERHEIT | ⬜ | | |
| P1.4 | Keine Secrets im Repo; Env Vercel/Supabase vollständig | SICHERHEIT 1.4 | ⬜ | | |
| P1.5 | npm audit – kritisch/hoch behoben | SICHERHEIT 1.5 | ⬜ | | |
| P1.6 | Security-Header / XSS-Basis (vercel.json, Fehlerseiten) | SICHERHEIT 1.6 | ⬜ | | |
| P2.1 | AGB / Datenschutz / Impressum inhaltlich aktuell | SICHERHEIT 2.1, VOR-VEROEFFENTLICHUNG | ⬜ | | |
| P2.2 | Datenschutz: Transparenz Speicherorte (lokal, Vercel, Supabase, Stripe) | SICHERHEIT 2.2 | ⬜ | | |
| P2.3 | Vollbackup erstellt + Wiederherstellung probiert | SICHERHEIT 2.3, Handbuch Backup | ⬜ | | |
| PZ | **Zahlung / Lizenzen Go-Live** (wenn Online-Kauf live): Migration 003, Vercel Env, Stripe-Webhook | **STRIPE-LIZENZEN-GO-LIVE**, **START-NUR-NOCH-OFFEN** | ⬜ | | |
| PT | **Tests Daten-Schicht** (bei Storage/Merge/Trennung-Änderungen): `npm run test:daten` + volle `npm run test` grün | **SERVICE-ARBEIT-DATEN-TESTS** | ⬜ | | |

⬜ = beim ersten Durchlauf durch 🟢 / 🟡 / 🔴 ersetzen (oder Textfarbe in Markdown: Grün/Gelb/Rot schreiben wenn Emojis in Druck stören).

---

## 6. Letzte Audit-Runde (Protokoll)

| Feld | Eintrag |
|------|---------|
| **Datum** | _TT.MM.JJ_ |
| **Durchgeführt von** | _Name / KI-Session_ |
| **Umfang** | _Voll / Teilaudit (welche IDs)_ |
| **Kurzfazit** | _z. B. „P1.1 rot – Key fehlt“_ |
| **Nächster Termin** | _optional_ |

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
