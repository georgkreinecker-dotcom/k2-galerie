# K2TEAM - SICHERHEIT & PRODUKT-LABEL

**Erstellt:** 17. Februar 2026  
**Version:** 1.0  
**Status:** ✅ Dokumentiert und vorbereitet

---

## 🎯 ZIEL

- Verkaufbares Produkt auf ein **sehr gutes Label** bringen: tausende Kunden zufrieden, keine vermeidbaren Probleme.
- **Zahlungen und Vergütungen** sicher halten; bei **Regressansprüchen** nachweisen können, dass genug für Sicherheit getan wurde.
- Alle wichtigen Sicherheits-Infos **dokumentiert und jederzeit abrufbar** (Handbuch, docs, mök2, HAUS-INDEX).

---

## 🔒 WICHTIGE SICHERHEITS-THEMEN

### 1. Admin-Zugang & Auth

- **Vorbereitet:** Echtes Login (Supabase Auth) für /admin – Login-Seite, Session, Token für Schreibzugriffe.
- **Vor Veröffentlichung:** Admin-Nutzer in Supabase anlegen, Migration 002 anwenden (RLS: Schreiben nur für eingeloggte Nutzer).
- **Ohne Supabase:** Kein Login – wie bisher direkt Admin (localStorage/Unlock). Nichts vergessen: Checkliste vor Go-Live durchgehen.

**Details:** `docs/ADMIN-AUTH-SETUP.md`, `docs/VOR-VEROEFFENTLICHUNG.md`

---

### 2. Datenbank (RLS)

- RLS ist **aktiviert**. Lesen (Galerie öffentlich) bleibt für alle; Schreiben (INSERT/UPDATE/DELETE) wird mit Migration 002 auf **nur authentifizierte Nutzer** beschränkt.
- Migration liegt in: `supabase/migrations/002_artworks_rls_authenticated_only.sql` – vor Go-Live anwenden (SQL Editor oder `supabase db push`).

**Details:** `docs/SUPABASE-RLS-SICHERHEIT.md`

---

### 3. Vor Veröffentlichung – Checkliste

Vor dem echten Veröffentlichen **immer** durchgehen:

- [ ] Admin-Auth aktivieren (Nutzer anlegen, Migration 002)
- [ ] .env / Secrets prüfen (keine Keys im Repo)
- [ ] `npm audit` – kritische/hohe Meldungen beheben
- [ ] AGB / Datenschutz / Impressum aktuell
- [ ] `npm run build` erfolgreich, Deployment (z. B. Vercel) Ready

**Vollständige Checkliste:** `docs/VOR-VEROEFFENTLICHUNG.md` – **nicht vergessen.**

---

### 4. Produkt-Label & Regress (Zahlungen, Vergütung)

- Roadmap: Ziele, technische Maßnahmen, Nachweis für Regress („genug getan“).
- Zahlungen: **Nie** Kartendaten selbst speichern; nur zertifizierter Provider (z. B. Stripe).
- Vergütung: Jede Zuordnung nachvollziehbar (Audit-Log, Export für Buchhaltung) – geplant.

**Details:** `docs/PRODUKT-LABEL-SICHERHEIT-ROADMAP.md`

---

### 5. Stabilität & Einbruch (Checklisten)

- **Einsturzsicher:** Error Boundaries, try/catch, Timeouts, keine Auto-Reloads, Admin-Start entlastet.
- **Einbruchsicher:** Secrets nicht im Repo, XSS reduziert (Escape, Stack nur in Dev), CORS eingeschränkt, K2/ök2 getrennt.
- Skala (nach Optimierung): von außen ca. 6–6,5/10, von innen ca. 7,5–8/10.

**Details:** `docs/SICHERHEIT-STABILITAET-CHECKLISTE.md`, `docs/VERBESSERUNGEN-OHNE-MEHRKOSTEN.md`

---

### 6. K2 vs. ök2 – keine Datenvermischung

- Auf ök2-Routen **niemals** K2-Daten (k2-artworks, k2-stammdaten-*) lesen/schreiben.
- ök2 nur in `k2-oeffentlich-*` Keys; Admin-Kontext immer prüfen.

**Details:** `docs/K2-OEK2-DATENTRENNUNG.md`, `.cursor/rules/k2-oek2-trennung.mdc`

---

### 7. Crash-Fixes (nicht zurückdrehen)

- Admin: Kein Safe-Mode-Check und kein Auto-Sync beim Start; verzögertes Laden (3 s Werke, 1,5 s Stammdaten).
- SafeMode: try/catch pro Key; Figma-Origins entfernt (nur K2/localhost).

**Details:** `docs/CRASH-FIXES-STAND-17-02-26.md`

---

## 📍 WO ALLES STECKT (Übersicht)

| Thema | Ort |
|--------|-----|
| **Einstieg / Projekt-Übersicht** | **HAUS-INDEX.md** (Root), **docs/00-INDEX.md** |
| **Vor Veröffentlichung** | docs/VOR-VEROEFFENTLICHUNG.md |
| **Admin-Auth einrichten** | docs/ADMIN-AUTH-SETUP.md |
| **Produkt-Label / Regress** | docs/PRODUKT-LABEL-SICHERHEIT-ROADMAP.md |
| **Checklisten (Einsturz/Einbruch)** | docs/SICHERHEIT-STABILITAET-CHECKLISTE.md |
| **Supabase RLS** | docs/SUPABASE-RLS-SICHERHEIT.md |
| **K2 vs. ök2** | docs/K2-OEK2-DATENTRENNUNG.md |
| **Crash-Fixes** | docs/CRASH-FIXES-STAND-17-02-26.md |
| **mök2 (Marketing ök2)** | Sektion 11 „Sicherheit & Vor Veröffentlichung“ (Verweise auf alle oben) |

---

## 🔄 ANWENDUNG

- **Bei Änderungen an Auth/RLS/Speicher:** Checklisten und RLS-Doku beachten.
- **Vor jedem Go-Live:** VOR-VEROEFFENTLICHUNG.md durchgehen und abhaken.
- **Neue Teammitglieder / AI:** Dieses Kapitel + verlinkte docs als Einstieg für Sicherheit.

---

*Verknüpfung: docs/VOR-VEROEFFENTLICHUNG.md, docs/PRODUKT-LABEL-SICHERHEIT-ROADMAP.md, HAUS-INDEX.md.*
