# Sicherheit vor Go-Live (4–6 Wochen)

**Ziel:** In 4–6 Wochen online – Systemsicherheit zuerst, dann Userdaten.  
**Priorität 1:** System (kein Einbruch, keine Manipulation von außen).  
**Priorität 2:** Userdaten (Datenschutz, AGB, Speicherung, Backup).

**Audit-Prozess (wann prüfen, Ampel, Protokoll):** **docs/AUDIT-PROZESS-PROGRAMMSICHERHEIT-GO-LIVE.md** – dort festgelegter Ablauf und die **Ampeltabelle** zu allen Punkten unten (inkl. Stripe-Go-Live und Test-Fokus).

---

## Priorität 1: Systemsicherheit

### 1.1 API „An Server senden“ absichern

**Problem:** `/api/write-gallery-data` ist derzeit ohne Prüfung – jeder könnte theoretisch POST senden und Galerie-Daten überschreiben.

**Lösung (umgesetzt):**
- **Option A – API-Key (schnell):** In Vercel unter **Settings → Environment Variables** setzen:
  - `WRITE_GALLERY_API_KEY` = langer Zufallswert (z. B. 32 Zeichen).
  - In der App (Build) denselben Wert als `VITE_WRITE_GALLERY_API_KEY` setzen (z. B. in Vercel für Production).
  - Dann akzeptiert die API nur noch Requests mit Header `X-API-Key: <dieser Wert>`.
- **Hinweis:** Der Key steht im Frontend-Build (wer die App analysiert, kann ihn sehen). Er schützt vor zufälligen/unkontrollierten Aufrufen; für maximale Sicherheit siehe Option B.
- **Option B – Supabase Auth (stark):** Admin-Login mit Supabase aktivieren; beim „An Server senden“ JWT mitschicken; API prüft JWT. Dafür: Admin-Auth wie in **1.2** aktivieren und in der API JWT-Prüfung einbauen (Doku in diesem Doc).

**Checkliste:**
- [ ] `WRITE_GALLERY_API_KEY` in Vercel gesetzt (Production).
- [ ] `VITE_WRITE_GALLERY_API_KEY` in Vercel für Build gesetzt (gleicher Wert wie oben).
- [ ] Einmal „An Server senden“ aus der App testen – muss funktionieren.

---

### 1.2 Admin-Zugang: echtes Login (Supabase Auth)

**Umgesetzt:** Wenn Supabase konfiguriert ist (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`), zeigt `/admin` zuerst eine **Login-Seite** (E-Mail + Passwort). Nur nach erfolgreicher Anmeldung erscheint der Admin; oben erscheint „Abmelden“. Ohne Supabase-Konfiguration bleibt alles wie bisher (nur Galerie-Passwort).

**Vor Go-Live (du musst noch):**
1. **Supabase Dashboard** → Authentication → Users → **Admin-Nutzer anlegen** (E-Mail + Passwort).
2. **Migration 002 anwenden:** `supabase/migrations/002_artworks_rls_authenticated_only.sql` im Supabase SQL Editor ausführen. Dann dürfen nur noch eingeloggte Nutzer in die Datenbank schreiben.
3. **In Vercel (oder .env):** `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` setzen, damit die App Supabase nutzt und das Login-Gate aktiv ist.

**Checkliste:**
- [ ] Admin-User in Supabase angelegt.
- [ ] Migration 002 ausgeführt (RLS: Schreiben nur authentifiziert).
- [ ] VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in Vercel/.env gesetzt (dann ist Admin nur nach Login erreichbar).

---

### 1.3 Supabase RLS (Datenbank)

- RLS ist aktiviert; Policies sind vorbereitet.
- **Vor Go-Live:** Migration 002 anwenden (siehe 1.2), damit Schreibzugriffe nur mit gültigem Auth-Token möglich sind.
- **Doku:** `docs/SUPABASE-RLS-SICHERHEIT.md`.

**Checkliste:**
- [ ] Migration 002 angewendet.

---

### 1.4 Keine Secrets im Repo / Umgebungsvariablen

- `.env` steht in `.gitignore`; keine Passwörter oder API-Keys im Quellcode.
- **Vor Go-Live:** In Vercel und (wenn genutzt) Supabase alle nötigen Variablen setzen: z. B. `GITHUB_TOKEN`, `WRITE_GALLERY_API_KEY`, `VITE_WRITE_GALLERY_API_KEY`, Supabase URL/Anon-Key. Keine echten Secrets in Repo committen.

**Checkliste:**
- [ ] Alle benötigten Env-Variablen in Vercel/Supabase gesetzt; keine Secrets im Repo.

---

### 1.5 Abhängigkeiten (npm audit)

- Bekannte Schwachstellen in Dependencies sind ein klassisches Einfallstor.
- **Regelmäßig:** `npm audit` ausführen; **kritische** und **hohe** Meldungen vor Go-Live beheben. Moderate nach Prüfung (Breaking Changes möglich).

**Checkliste:**
- [ ] `npm audit` durchgeführt; kritische/hohe Issues behoben.

---

### 1.6 Security-Header und XSS

- Bereits umgesetzt: `vercel.json` setzt X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy.
- Fehlerseiten: Ausgabe wird escaped (XSS-Risiko reduziert); Stack nur in Dev.
- **Vor Go-Live:** Keine Änderung nötig; nicht zurückschrauben.

---

## Priorität 2: Userdaten

### 2.1 AGB / Datenschutz / Impressum

- AGB-Seite und rechtliche Texte sind vorhanden; Inhalte müssen für den Live-Betrieb aktuell sein.
- **Checkliste:** AGB, Datenschutz, Impressum inhaltlich prüfen und anpassen (Verantwortlicher, Kontakt, Speicherdauer, Zweck).

---

### 2.2 Was wird gespeichert (Transparenz)

- Galerie-Daten (Werke, Stammdaten, Events, Dokumente) je nach Kontext in localStorage und auf Vercel Blob / GitHub.
- Keine Kreditkarten in der App; Zahlungen nur über zertifizierte Provider (z. B. Stripe).
- **Checkliste:** In Datenschutztext festhalten: welche Daten wo gespeichert werden (lokal, Vercel, Supabase, Stripe), wie lange, wofür.

---

### 2.3 Backup und Wiederherstellung

- Vollbackup (Admin → Einstellungen) und Spiegelung auf backupmicro sind vorgesehen.
- **Checkliste:** Einmal vor Go-Live Vollbackup anlegen und Wiederherstellung getestet; Prozess in Handbuch/Doku festhalten.

---

## Zeitplan (4–6 Wochen)

| Woche | Fokus | Konkret |
|-------|--------|--------|
| 1–2 | System 1.1 + 1.4 + 1.5 | API-Key setzen und testen; Env prüfen; npm audit |
| 2–3 | System 1.2 + 1.3 | Admin-Auth (Supabase), Migration 002 |
| 3–4 | System prüfen | Alle Punkte Priorität 1 abhaken, einmal Durchlauf |
| 4–5 | Userdaten 2.1 + 2.2 | AGB/Datenschutz/Impressum finalisieren |
| 5–6 | Userdaten 2.3 + Freigabe | Backup testen, letzte Checks, Go-Live |

---

## Wo was steht

| Thema | Datei |
|--------|--------|
| Admin-Auth einrichten | `docs/ADMIN-AUTH-SETUP.md` |
| RLS und Supabase | `docs/SUPABASE-RLS-SICHERHEIT.md` |
| Checkliste vor Veröffentlichung | `docs/VOR-VEROEFFENTLICHUNG.md` |
| Einsturz/Einbruch-Checkliste | `docs/SICHERHEIT-STABILITAET-CHECKLISTE.md` |
| Produkt-Label / Regress | `docs/PRODUKT-LABEL-SICHERHEIT-ROADMAP.md` |

---

*Stand: März 2026 – Für Go-Live in 4–6 Wochen: zuerst Systemsicherheit, dann Userdaten.*
