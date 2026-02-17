# Vor der echten Veröffentlichung – Checkliste

**Alles ist vorbereitet; vor dem Go-Live diese Punkte abhaken.**  
Damit nichts vergessen wird: Diese Datei vor dem Veröffentlichen durchgehen.

---

## 🔒 Sicherheit & Auth

- [ ] **Admin-Auth aktivieren** (wenn Supabase genutzt wird):
  - [ ] In Supabase **Admin-Nutzer anlegen** (E-Mail + Passwort). Anleitung: **docs/ADMIN-AUTH-SETUP.md**
  - [ ] **Migration 002** anwenden (RLS: Schreiben nur für eingeloggte Nutzer). Siehe **docs/ADMIN-AUTH-SETUP.md** Abschnitt 2.
  - [ ] **Test:** /admin aufrufen → Login → Werke speichern/löschen prüfen.
- [ ] **.env / Secrets:** Keine echten Keys im Repo; Vercel/Supabase Umgebungsvariablen gesetzt.
- [ ] **npm audit:** Kritische/hohe Meldungen prüfen und beheben (`npm audit`, ggf. `npm audit fix`).

---

## 📋 Produkt & Recht

- [ ] **AGB / Datenschutz / Impressum** prüfen und aktuell halten (siehe **docs/PRODUKT-LABEL-SICHERHEIT-ROADMAP.md**).
- [ ] **Zahlungen:** Wenn Kartenzahlung angeboten wird: nur über zertifizierten Provider (z. B. Stripe); nie Kartendaten selbst speichern.

---

## 🚀 Deployment & Stand

- [ ] **Lokal bauen:** `npm run build` läuft ohne Fehler.
- [ ] **Push auf Production-Branch** (z. B. main); Vercel-Deployment „Ready“.
- [ ] **Stand prüfen:** Auf Handy/Galerie Build-Badge oder build-info.json – neuer Stand sichtbar nach Update.

---

## 📍 Wo was steht

| Thema | Datei |
|--------|--------|
| Admin-Nutzer anlegen + Migration 002 | **docs/ADMIN-AUTH-SETUP.md** |
| Produkt-Label / Sicherheits-Roadmap | **docs/PRODUKT-LABEL-SICHERHEIT-ROADMAP.md** |
| Sicherheits-Checklisten | **docs/SICHERHEIT-STABILITAET-CHECKLISTE.md** |
| Projekt-Übersicht | **HAUS-INDEX.md** (Root) |

---

*Stand: 17.02.26 – Vor Veröffentlichung diese Checkliste durchgehen und abhaken.*
