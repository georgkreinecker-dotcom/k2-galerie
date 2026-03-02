# Wartungsheft – K2 Galerie

**Stand:** 02.03.26  
**Zweck:** Notwendige Wartung mit festen Intervallen – sauber vorbereitet, abhakbar. Kein Rätselraten, wann was fällig ist.

---

## Intervall-Übersicht

| Intervall | Was | Wo (unten) |
|-----------|-----|------------|
| **Einmal vor Start** | Supabase, Stripe, Backup, Env | § 1 |
| **Monatlich** | Vercel, Stripe, Backup, Zugang | § 2 |
| **Quartalsweise** | npm, Sicherheit, Dependencies | § 3 |
| **Bei Ereignis** | Domain-Wechsel, großes Update, Stand Handy | § 4 |

---

## § 1 Einmalig vor Start

Vor dem Go-Live diese Punkte erledigen. Danach keine Wiederholung (außer bei neuem Projekt/Reset).

- [ ] **Supabase:** Registrierung auf supabase.com (Free Tier). Projekt anlegen.
- [ ] **Supabase Migration 003:** Inhalt von `supabase/migrations/003_stripe_licences_payments_gutschriften.sql` im Supabase Dashboard → SQL Editor einfügen und ausführen.
- [ ] **Vercel Env:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` eintragen (Settings → Environment Variables).
- [ ] **Stripe Webhook:** Im Stripe Dashboard Endpunkt anlegen (URL: `https://k2-galerie.vercel.app/api/webhook-stripe`, Event: `checkout.session.completed`). Signing Secret als `STRIPE_WEBHOOK_SECRET` in Vercel.
- [ ] **Vollbackup:** Einmal App-Vollbackup (Admin → Einstellungen), Git-Tag z. B. `vor-start-YYYY-MM-DD`, Spiegelung backupmicro (siehe docs/PRAXISTEST-BEFUELLEN-SICHERHEIT.md).
- [ ] **Passwörter/Keys:** Galerie-Passwort und Zugänge sicher notieren; keine Keys im Repo.

**Detail-Checkliste Stripe/Supabase:** docs/STRIPE-LIZENZEN-GO-LIVE.md.

---

## § 2 Monatlich

Einmal pro Monat (z. B. erster Werktag) – kurzer Durchgang.

- [ ] **Vercel:** Letztes Deployment „Ready“? Build ohne Fehler? (Dashboard prüfen oder nach letztem Push schon erledigt.)
- [ ] **Stripe:** Zahlungen im Dashboard sichtbar, keine Fehlermeldungen oder fehlgeschlagenen Webhooks.
- [ ] **Backup:** Spiegelung backupmicro aktuell? Bei Bedarf: „Vollbackup herunterladen“ (Admin) oder Skript `scripts/hard-backup-to-backupmicro.sh`.
- [ ] **Zugang:** Galerie-Passwort und wichtige Logins noch gültig? Keine Änderung nötig (Domain, Kündigung)?

**Dauer:** ca. 5–10 Minuten.

---

## § 3 Quartalsweise

Alle drei Monate (z. B. Januar, April, Juli, Oktober) – technische Wartung.

- [ ] **npm audit:** Im Projektordner `npm audit` ausführen. Moderate/High mit Georg besprechen; **nicht** blind `npm audit fix` (Breaking Changes möglich).
- [ ] **Node-Version:** Prüfen ob Vercel/Node noch unterstützt wird (nur bei Ablauf/Warnung handeln).
- [ ] **Doku:** DIALOG-STAND, START-NUR-NOCH-OFFEN, Wartungsheft – Einträge noch sinnvoll? Bei Bedarf anpassen.

**Delegation:** npm/Node-Checks kann AI/Entwickler vorbereiten; Georg entscheidet über Updates.

---

## § 4 Bei Ereignis (nicht nach Kalender)

Diese Punkte nur ausführen, wenn das Ereignis eintritt.

| Ereignis | Aktion | Wo nachlesen |
|----------|--------|----------------|
| **Domain-Wechsel** (z. B. eigene Domain statt vercel.app) | Stripe Webhook-URL anpassen; ggf. CORS/Env in API prüfen. | STRIPE-LIZENZEN-GO-LIVE, Vercel Domains |
| **Großes Update / Befüllen / neues Feature** | Vorher: Vollbackup, Git-Tag (z. B. `vor-xyz-YYYY-MM-DD`), backupmicro spiegeln. | PRAXISTEST-BEFUELLEN-SICHERHEIT |
| **Handy zeigt alten Stand** | Stand-Badge tippen oder QR neu scannen; ggf. build-info.json prüfen, Vercel „Current“. | VERCEL-STAND-HANDY, VERCEL-CHECKLISTE-BEI-KEINEM-STAND |
| **Passwort/Key verloren oder geändert** | Neues Passwort in App setzen; Keys in Vercel/Supabase/Stripe aktualisieren. | ADMIN-AUTH-SETUP (falls Supabase-Auth) |
| **Sicherheitsmeldung (npm, Vercel, Stripe)** | Prüfen, mit Georg besprechen, gezielt beheben. | SICHERHEIT-STABILITAET-CHECKLISTE |

---

## Verweise

| Thema | Datei |
|-------|--------|
| Supabase – wozu, Kosten, Fazit Free Tier | docs/SUPABASE-WOZU-KOSTEN-WARTUNG.md |
| Stripe/Lizenzen – 3 Schritte Go-Live | docs/STRIPE-LIZENZEN-GO-LIVE.md |
| Stand / QR / Handy aktuell | docs/VERCEL-STAND-HANDY.md, docs/VERCEL-CHECKLISTE-BEI-KEINEM-STAND.md |
| Backup vor Befüllen / Vollbackup | docs/PRAXISTEST-BEFUELLEN-SICHERHEIT.md |
| Checkliste vor Veröffentlichung | docs/VOR-VEROEFFENTLICHUNG.md |
| Sicherheit/Stabilität | docs/SICHERHEIT-STABILITAET-CHECKLISTE.md |

---

## Kurzfassung

- **§ 1 Einmal vor Start:** Supabase-Registrierung + Migration + Vercel Env + Stripe Webhook + Vollbackup + Passwörter.
- **§ 2 Monatlich:** Vercel Ready, Stripe ok, Backup backupmicro, Zugang ok.
- **§ 3 Quartalsweise:** npm audit, Node/Doku prüfen.
- **§ 4 Bei Ereignis:** Domain-Wechsel, großes Update, Stand Handy, Passwort/Key, Sicherheitsmeldung.

Dieses Wartungsheft bei Bedarf erweitern (z. B. weitere Intervalle oder Produkte wie K2 Familie).
