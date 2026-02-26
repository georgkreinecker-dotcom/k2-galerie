# Vor der echten Veröffentlichung – Checkliste

**Alles ist vorbereitet; vor dem Go-Live diese Punkte abhaken.**  
Damit nichts vergessen wird: Diese Datei vor dem Veröffentlichen durchgehen.

---

## ✅ Erster Durchgang (26.02.26) – Stand für Georg

| Bereich | Status | Hinweis |
|--------|--------|--------|
| **Lokal bauen** | ✅ | `npm run build` läuft durch. |
| **Stand / Badge** | ✅ | build-info.json, QR mit Server-Stand, Inject-Script – Mechanik steht. |
| **AGB / Impressum** | Vorhanden | AGBPage (`/agb`), Impressum in Galerie-Footer; **mit Georg:** Texte aktuell? |
| **Admin-Auth (Supabase)** | Optional | Aktuell: Admin per Galerie-Passwort. Supabase-Login nur wenn ihr DB-Schreibschutz wollt – siehe ADMIN-AUTH-SETUP.md. |
| **npm audit** | Mit Georg prüfen | Einige moderate/high (ajv, axios, minimatch, rollup, electron). `npm audit fix` kann Breaking Changes haben – nicht blind ausführen. |
| **.env / Secrets** | Mit Georg prüfen | Keine Keys im Repo? Vercel/Supabase Env gesetzt? |

**Nächster Schritt:** Mit Georg die Checkboxen unten durchgehen und abhaken; bei npm audit und AGB/Impressum-Inhalten gemeinsam entscheiden.

---

## 🔒 Sicherheit & Auth

- [ ] **Admin-Auth** – aktuell: **Galerie-Passwort** für /admin. Supabase-Login nur wenn gewünscht (dann: ADMIN-AUTH-SETUP.md):
  - [ ] (Optional) In Supabase Admin-Nutzer anlegen, Migration 002, Test.
- [ ] **.env / Secrets:** Keine echten Keys im Repo; Vercel/Supabase Umgebungsvariablen gesetzt. *(Georg: bestätigen)*
- [ ] **npm audit:** Moderate/High prüfen – `npm audit` ausführen; Fix nur nach Prüfung (Breaking Changes möglich). *(Georg: entscheiden)*

---

## 📋 Produkt & Recht

- [ ] **AGB / Datenschutz / Impressum** prüfen und aktuell halten (siehe **docs/PRODUKT-LABEL-SICHERHEIT-ROADMAP.md**). *(Georg: Texte durchsehen)*
- [ ] **Zahlungen:** Wenn Kartenzahlung angeboten wird: nur über zertifizierten Provider (z. B. Stripe). *(Aktuell: keine Kartenzahlung in App = N/A)*

---

## 🚀 Deployment & Stand

- [x] **Lokal bauen:** `npm run build` läuft ohne Fehler.
- [ ] **Push auf Production-Branch** (main); Vercel-Deployment „Ready“. *(Georg: nach Änderungen pushen)*
- [x] **Stand prüfen:** Build-Badge + build-info.json + QR mit Server-Stand – Mechanik steht; auf Handy nach Update prüfen. *(Georg: einmal auf Gerät testen)*

---

## 📍 Wo was steht

| Thema | Datei |
|--------|--------|
| **Praxis-Test: Befüllen + Vollbackup „vor Praxis-Test“** | **docs/PRAXISTEST-BEFUELLEN-SICHERHEIT.md** |
| Admin-Nutzer anlegen + Migration 002 | **docs/ADMIN-AUTH-SETUP.md** |
| Produkt-Label / Sicherheits-Roadmap | **docs/PRODUKT-LABEL-SICHERHEIT-ROADMAP.md** |
| Sicherheits-Checklisten | **docs/SICHERHEIT-STABILITAET-CHECKLISTE.md** |
| Projekt-Übersicht | **HAUS-INDEX.md** (Root) |

---

*Stand: 26.02.26 – Erster Durchgang ergänzt. Mit Georg Checkliste durchgehen und abhaken.*
