# Einstieg für Informatiker – System überblicken und warten

**Zweck:** Jeder Informatiker soll mit diesem Dokument und den verlinkten Quellen **einsteigen**, das **gesamte System überblicken** und es **wartbar** verstehen können. Alle zentralen Prozesse sind so dokumentiert, dass sie gefunden und gewartet werden können.

**Stand:** 08.03.26

---

## 1. Systemüberblick (was ist was)

| Begriff | Bedeutung |
|--------|-----------|
| **K2 Galerie** | Multi-Tenant-PWA für Galerien (Künstler:innen, Kunstvereine). Produktname: K2 Galerie. |
| **Mandanten** | **K2** (echte Galerie), **ök2** (öffentliche Demo), **VK2** (Vereinsplattform), plus beliebige zukünftige Klienten über **tenantId**. |
| **Tech-Stack** | React, TypeScript, Vite, Tailwind; Backend: Vercel Serverless (api/*.js), Supabase (Lizenzen/Zahlungen), Vercel Blob (gallery-data pro Mandant), Stripe (Checkout/Webhook). |
| **Code-Struktur** | **src/** App (Seiten, Config, Utils), **components/** Admin (ScreenshotExportAdmin), **api/** Serverless (gallery-data, write-gallery-data, delete-tenant-data, cancel-subscription, create-checkout, webhook-stripe). |

**Datenfluss (Kern):** Galerie-Daten (Werke, Stammdaten, Design) pro Mandant in **Vercel Blob** (`gallery-data.json` bzw. `gallery-data-{tenantId}.json`). App lädt/speichert über **api/gallery-data** und **api/write-gallery-data**. Lizenzen und Zahlungen in **Supabase**; Stripe für Checkout und Webhooks.

---

## 2. Zentrale Einstiege (wo anfangen)

| Womit | Wo | Inhalt |
|-------|-----|--------|
| **Erreichter Standard / Startklar** | **docs/PRODUKT-STANDARD-NACH-SPORTWAGEN.md** (Abschnitt „Erreichter Standard“), **docs/LEBENSZYKLUS-QUALITAETSCHECK.md**, **docs/START-NUR-NOCH-OFFEN.md** | Welchen technischen und prozessualen Standard das Produkt hat; Lebenszyklus durchgängig; startklar bis auf Stripe-Go-Live (3 Schritte). **Wichtig für Informatiker:** Hier steht, worauf das System aufbaut. |
| **Projekt-Übersicht (Keller bis Dachboden)** | **HAUS-INDEX.md** (Root) | Wo liegen Skripte, Code, Doku, Handbuch; Schnellfinder. |
| **Alle Projekt-Docs (thematisch)** | **docs/00-INDEX.md** | Jedes Doc mit Stichwort; Plan, K2/ök2, Deployment, Supabase, Crash, etc. |
| **Steuerung / nächste Schritte** | **docs/KOMMANDOZENTRALE.md** | DIALOG-STAND, GRAFIKER-TISCH, Definitionen, Roadmap – Steuerung für Georg und KI. |
| **Struktur & Quellen (verbindlich)** | **docs/STRUKTUR-HANDELN-QUELLEN.md** | Wo AGB, Handbuch, Doku liegen; Regeln (ein Standard pro Problem, Ablage). |
| **Regeln (Cursor/AI und Menschen)** | **.cursor/rules/*.mdc** | Architektur-, Prozess- und Sicherheitsregeln; viele mit `alwaysApply`. |
| **Setup (lokal)** | **docs/SETUP-ANLEITUNG.md**, **README.md** | Supabase, Env, Migrationen, App starten. |

---

## 3. Prozesse – dokumentiert zum Überblicken und Warten

Jeder wichtige Ablauf ist **an einer Stelle** beschrieben und mit Code/Doku verknüpft. So kann ein neuer Informatiker jeden Prozess finden und warten.

| Prozess | Kurzbeschreibung | Wo im Code | Wo in der Doku |
|---------|-------------------|------------|-----------------|
| **Lebenszyklus Klient (Geburt → Leben → Sterben)** | Registrierung/Checkout → tenantId/URL; aktives Nutzen (Laden/Speichern); Kündigung → Blob löschen. | api/create-checkout, api/webhook-stripe, api/cancel-subscription, api/delete-tenant-data; GaleriePage (Laden). | **docs/K2-OEK2-DATENTRENNUNG.md** (Abschnitte Registrierung → URL, Lebenszyklus Sportwagen-Check, Bei Kündigung). |
| **Veröffentlichen / Vom Server laden** | Klient veröffentlicht → write-gallery-data(tenantId) → Blob; Besucher/Gerät lädt → gallery-data?tenantId= → Blob. | api/write-gallery-data.js, api/gallery-data.js; GaleriePage (useEffect Server-Load). | **docs/TENANT-SYNC-DOMAIN.md**, **docs/K2-OEK2-DATENTRENNUNG.md** (Speicher, Automatik). |
| **Stand / QR / Handy aktuell** | Build schreibt Stand; QR mit Server-Stand + Cache-Bust; Handy sieht aktuell nach Neuladen/QR-Scan. | scripts/write-build-info.js, index.html, src/hooks/useServerBuildTimestamp.ts; GaleriePage, PlatformStartPage, MobileConnectPage. | **docs/VERCEL-STAND-HANDY.md**, **.cursor/rules/stand-qr-niemals-zurueck.mdc**, **docs/VERCEL-CHECKLISTE-BEI-KEINEM-STAND.md**. |
| **Lizenzen / Checkout / Zahlung** | Frontend startet Checkout → create-checkout → Stripe; Zahlung erfolgreich → Webhook → Supabase (licences, payments, Gutschriften). | api/create-checkout.js, api/webhook-stripe.js; LicencesPage, Stripe. | **docs/ZAHLUNGSSYSTEM-LIZENZEN-TECHNIK-PLAN.md**, **docs/STRIPE-LIZENZEN-GO-LIVE.md**. |
| **Kündigung (Sterben)** | „Lizenz beenden“ oder Stripe subscription.deleted → Blob des Mandanten löschen (K2 nie). | api/cancel-subscription.js, api/delete-tenant-data.js; webhook-stripe (customer.subscription.deleted); Frontend tenantId mitsenden. | **docs/K2-OEK2-DATENTRENNUNG.md** (Bei Kündigung, Lebenszyklus). |
| **K2 vs. ök2 vs. VK2 (Datentrennung)** | Keine Vermischung: getrennte localStorage-Keys, getrennte Blobs, Kontext aus Route/state. | tenantConfig, GaleriePage (musterOnly), ScreenshotExportAdmin (Kontext), getPageTexts/getPageContentGalerie(tenant). | **docs/K2-OEK2-DATENTRENNUNG.md**, **.cursor/rules/k2-oek2-trennung.mdc**, **docs/K2-OEK2-DATENTRENNUNG.md** Checkliste. |
| **Audit Programmsicherheit / Go-Live** | Feste Prüfrunden mit Ampel + Protokoll, nicht nur Checklisten lesen. | Vercel, Supabase, Stripe, Tests; siehe Ampeltabelle. | **docs/AUDIT-PROZESS-PROGRAMMSICHERHEIT-GO-LIVE.md** (Prozess), **docs/SICHERHEIT-VOR-GO-LIVE.md** (Inhalte). |
| **Sync (Server + lokal mergen)** | Eine Regel: Server = Quelle; Merge über mergeServerWithLocal; keine stillen Überschreibungen mit weniger Werken. | src/utils/syncMerge.ts; GaleriePage, GalerieVorschauPage. | **docs/SYNC-REGEL.md**, **docs/WERKE-SPEICHERUNG-CHECKLISTE.md**. |
| **Build / Deploy** | Nur **main**; Push → Vercel baut; Stand kommt mit Build (write-build-info im Build). | package.json (build), scripts/write-build-info.js, vercel.json. | **docs/DEPLOYMENT-EIN-BRANCH.md**, **docs/VERCEL-STAND-HANDY.md**, **.cursor/rules/vercel-stand-funktioniert.mdc**. |
| **Tests / QS vor Commit** | Vor jedem Commit: Tests + Build grün. Optional Fokus Daten/Trennung: `npm run test:daten`. | npm run test, npm run test:daten, npm run build; src/tests/*. | **docs/QUALITAETSSICHERUNG.md**, **docs/SERVICE-ARBEIT-DATEN-TESTS.md** (Servicarbeit + Test-Audit), **.cursor/rules/qs-standard-vor-commit.mdc**. |
| **Backup / Sicherheit** | Vollbackup (Admin, JSON); Git; Spiegel backupmicro; vor Befüllen/größeren Schritten. **Prominent:** Vollbackup auf backupmicro; Zugriff bei Notfall (Vertrauensperson) dokumentiert. | Admin Einstellungen, scripts/hard-backup-to-backupmicro.sh. | **docs/BACKUP-ZUGANG-NOTFALL.md** (prominent, Notfall-Zugang), **docs/PRAXISTEST-BEFUELLEN-SICHERHEIT.md**, **docs/WARTUNG-PROJEKT.md** § 2, **k2team-handbuch/13-BACKUP-VOLLBACKUP-K2-GALERIE.md**. |
| **Wartung (Intervalle)** | Einmal vor Start; monatlich; quartalsweise; bei Ereignis (Stand Handy, Domain, etc.). | – | **docs/WARTUNG-PROJEKT.md** (vollständiges Wartungsheft). |

---

## 4. Entwicklung: Setup, Build, Test, Deploy

| Schritt | Befehl / Ort | Kurz |
|---------|----------------|------|
| **Abhängigkeiten** | `npm install` | Einmal nach Clone. |
| **App lokal starten** | `npm run dev` | Vite; typisch http://localhost:5177. |
| **Tests** | `npm run test` | Vitest; vor Commit Pflicht (QS). |
| **Build** | `npm run build` | test + write-build-info + tsc + vite build. Vor Push prüfen. |
| **Deploy** | Push auf **main** → Vercel baut automatisch. | Nur main; siehe DEPLOYMENT-EIN-BRANCH. |

**Umgebungsvariablen (Vercel):**  
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (Stripe-Webhook); optional TENANT_DELETE_SECRET (für Kündigungs-API). Vercel Blob: BLOB_READ_WRITE_TOKEN (meist automatisch bei Storage). Siehe **docs/STRIPE-LIZENZEN-GO-LIVE.md**, **docs/WARTUNG-PROJEKT.md** § 1.

---

## 5. Wartung – wer wann was macht

Vollständige Intervalle und Checklisten: **docs/WARTUNG-PROJEKT.md**.

| Intervall | Was | Kurz |
|-----------|-----|------|
| **Einmal vor Start** | Supabase (Migration 003), Vercel Env (Stripe, Supabase), Stripe Webhook, Vollbackup, Passwörter notieren. | **docs/STRIPE-LIZENZEN-GO-LIVE.md**. |
| **Monatlich** | Vercel Deployment prüfen, Stripe/Zahlungen prüfen, Backup/backupmicro prüfen, Zugänge prüfen. | **docs/WARTUNG-PROJEKT.md** § 2. |
| **Quartalsweise** | npm audit, Node-Version, Doku (DIALOG-STAND, Wartungsheft) anpassen. | **docs/WARTUNG-PROJEKT.md** § 3. |
| **Bei Ereignis** | Domain-Wechsel, großes Update (Backup + Tag), Handy alter Stand (Vercel/QR/Cache), Passwort/Key geändert. | **docs/WARTUNG-PROJEKT.md** § 4; VERCEL-STAND-HANDY, PRAXISTEST-BEFUELLEN-SICHERHEIT. |

---

## 6. Wichtige Regeln (für Wartung und Änderungen)

- **Kundendaten nie automatisch löschen** – nur nach expliziter User-Aktion. Regel: **.cursor/rules/niemals-kundendaten-loeschen.mdc**.
- **K2 vs. ök2 vs. VK2 trennen** – keine Vermischung von Keys/Blobs; bei Daten-Änderungen **docs/K2-OEK2-DATENTRENNUNG.md** und Checkliste beachten. Regel: **.cursor/rules/k2-oek2-trennung.mdc**.
- **Ein Standard pro Problemstellung** – gleiche Aufgabe = eine Lösung (z. B. mergeServerWithLocal, runBildUebernehmen, openDocumentInApp). Regel: **.cursor/rules/ein-standard-problem.mdc**.
- **Stand/QR** – QR mit Server-Stand + Cache-Bust; kein automatischer Reload bei „Server neuer“. Regeln: **.cursor/rules/stand-qr-niemals-zurueck.mdc**, **.cursor/rules/code-5-crash-kein-auto-reload.mdc**.
- **Build/QS** – Vor Commit: Tests + Build grün. Regel: **.cursor/rules/qs-standard-vor-commit.mdc**.

---

## 7. Kurzfassung für den ersten Tag

1. **Erreichter Standard:** **docs/PRODUKT-STANDARD-NACH-SPORTWAGEN.md** (Abschnitt „Erreichter Standard / Startklar“) und **docs/LEBENSZYKLUS-QUALITAETSCHECK.md** – welchen Standard wir mit der Lösung erreicht haben; startklar bis auf Stripe-Go-Live.
2. **HAUS-INDEX.md** und **docs/00-INDEX.md** lesen – wo liegt was.
3. **Dieses Dokument** durchgehen – Systemüberblick und Prozess-Tabelle.
4. **docs/STRUKTUR-HANDELN-QUELLEN.md** – verbindliche Quellen und Ablage.
5. **docs/WARTUNG-PROJEKT.md** – Wartungsheft und Intervalle.
6. **docs/K2-OEK2-DATENTRENNUNG.md** – bei allem, was Mandanten/Daten/Blob betrifft.
7. Bei konkreten Themen: **docs/00-INDEX.md** nutzen (Stichwort suchen) und die verlinkte Doku lesen.

**Ziel:** Alle Prozesse sind so dokumentiert, dass jeder Informatiker einsteigen, das System überblicken und warten kann – ohne verstecktes Wissen im Kopf oder im Code.

---

## 8. Ablage und Erweiterung (mit dem Wachstum der Projekte)

**Wo liegt das?**

- **Eine feste Ablage:** **docs/EINSTIEG-INFORMATIKER-SYSTEM-WARTUNG.md** (diese Datei). Kein zweiter Ort für „Einstieg Informatiker“ – alles an einer Stelle.
- **Verweise darauf:** docs/00-INDEX.md (Abschnitt „Einstieg für Informatiker“), HAUS-INDEX.md (Schnellfinder), docs/STRUKTUR-HANDELN-QUELLEN.md (Tabelle „Wo was liegt“). Diese Verweise bleiben; die Inhalte wachsen in **dieser** Datei.

**Wie erweitern wir mit dem Wachstum?**

| Was wächst | Was tun |
|------------|---------|
| **Neues Projekt** (z. B. K2 Familie, weitere Produktlinie) | In **Abschnitt 1 (Systemüberblick)** ergänzen: neues Produkt/Mandant in der Tabelle oder als eigener Absatz; Tech-Stack/Code-Struktur anpassen, wenn sich etwas ändert. In **Abschnitt 3 (Prozesse)** ggf. neue Zeilen (z. B. „K2 Familie – Stammbaum/Daten“) mit Code- und Doku-Verweis. |
| **Neuer Prozess** (neuer Ablauf, neue API, neues Wartungsthema) | In **Abschnitt 3 (Prozesse)** eine **neue Zeile** in der Tabelle: Prozessname, Kurzbeschreibung, wo im Code, wo in der Doku. So bleibt die Tabelle die einzige Übersicht aller Prozesse. |
| **Neue Technik / neuer Dienst** (z. B. neuer Speicher, neues Backend) | **Abschnitt 1** Tech-Stack und Datenfluss anpassen; **Abschnitt 3** ggf. neuen Prozess eintragen; **Abschnitt 4** Env-Variablen ergänzen; **Abschnitt 5** Wartung bei Bedarf (z. B. neuer Dienst in § 2/§ 3). |
| **Neue Wartungsaufgabe** | **Abschnitt 5** und **docs/WARTUNG-PROJEKT.md** anpassen; hier nur Verweis auf WARTUNG-PROJEKT belassen oder kurze Nennung. |

**Regel:** Diese Datei ist der **lebende Einstieg**. Bei jedem neuen Projekt oder zentralen Prozess: EINSTIEG-INFORMATIKER-SYSTEM-WARTUNG.md zuerst erweitern, damit der Überblick mitwächst. Detail-Doku bleibt in den jeweiligen Docs (K2-OEK2-DATENTRENNUNG, WARTUNG-PROJEKT, etc.); hier stehen Verweis und Kurzbeschreibung.
