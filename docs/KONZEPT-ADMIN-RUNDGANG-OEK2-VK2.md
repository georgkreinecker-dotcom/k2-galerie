# Konzept: Admin erklären für ök2 und VK2 (kurz + Quellen)

**Stand:** 16.04.26  
**Zweck:** **Praktisch jede Admin-Funktion** für die **Demo-Kontexte ök2 und VK2** so erklärbar machen, dass **Pilot:innen, Lizenzinteressent:innen und Vereins-Admins** sich orientieren – **ohne** die ausführlichen Texte zu duplizieren. Stattdessen: **ein Satz pro Bereich** + **fester Verweis** auf die bestehende Doku (Handbuch, `docs/`, mök2 je nach Thema).

**Parallel-Dokument (öffentliche Galerie):** `docs/KONZEPT-PLATTFORM-RUNDGANG-OEK2-VK2.md` – dort der **Besucher-Rundgang** auf der Galerie-Seite; **dieses Dokument** = **Admin-Arbeitsfläche** (`ScreenshotExportAdmin`, `/admin`).

---

## 1. Ausgangslage

| Thema | Aktuell |
|--------|---------|
| **Admin-Layout** | **Ein** Hub für alle Kontexte: „Was möchtest du heute tun?“ + Kacheln/Tabs – Regel **admin-einheitliches-layout** (K2, ök2, VK2 gleiche Struktur, angepasste Texte). |
| **Erklär-Texte** | Liegen überwiegend im **Benutzerhandbuch** (`public/benutzer-handbuch/`), VK2 zusätzlich **VK2-Handbuch** (`public/vk2-handbuch/`). Technische Tiefen: `docs/` (z. B. Veröffentlichen/Laden, kritische Abläufe). |
| **Lücke** | Kein **durchgängiger „Admin-Rundgang“** wie für die Galerie-Oberfläche geplant – nur Hub, optional **grüner Orientierungs-Balken** (Guide-Flow, ök2/VK2), **Handbuch-Links**. |

**Ziel:** Eine **Quellen-Matrix** („welcher Tab / welche Kachel → ein Satz → welches Kapitel“) und **Phasen** für spätere UI (Sheet, Seitenleiste, Tooltips) – **ohne** jetzt alle Texte in der App zu verdoppeln.

---

## 2. Zielgruppe und Trennung

| Zielgruppe | Fokus |
|------------|--------|
| **ök2** | Demo mit **Musterdaten**; kein K2-Echtbetrieb; Veröffentlichen/Backup nur im **Demo-Sinn**; siehe `06-OEK2-DEMO-LIZENZ.md`. |
| **VK2** | **Verein**, Mitglieder, Stammdaten; Galerie/Katalog/Kassa optional; siehe `05-VK2-VEREINSPLATTFORM.md` (Benutzerhandbuch) und VK2-Handbuch. |
| **Gemeinsam** | Gleiche **Tab-Struktur** wo möglich; **keine Datenvermischung** (ök2 nur `k2-oeffentlich-*` / Muster; VK2 nur `k2-vk2-*`). |

**Nicht-Ziele:** K2 **echte** Galerie nur mit **expliziter** Anordnung erweitern (**k2-echte-galerie-eisernes-gesetz**). Lizenznehmer-Instanz: **kein** ök2/VK2-Admin von außen – unverändert Plattform-Regel.

---

## 3. Admin-Bereiche → Kurz erklärt → Doku (Matrix)

**Technische Tab-Typen** (Auszug aus `ScreenshotExportAdmin.tsx`):  
`werke` | `katalog` | `statistik` | `zertifikat` | `newsletter` | `pressemappe` | `eventplan` | `presse` | `design` | `veroeffentlichen` | `praesentationsmappen` | `einstellungen`

Die **Kacheln im Hub** folgen derselben Logik; Nutzer:innen springen per Tab oder Kachel.

| Bereich | In einem Satz (Orientierung) | Primäre Lesequelle |
|--------|------------------------------|---------------------|
| **Hub / Start** | Zentrale Übersicht „Was möchtest du heute tun?“ – Einstieg ohne alle Tabs zu kennen. | `benutzer-handbuch/03-ADMIN-UEBERBLICK.md` |
| **Werke** | Werke anlegen, bearbeiten, Bilder; Kategorien/Typ je nach Produkt. | `03-ADMIN-UEBERBLICK.md`, `02-GALERIE-GESTALTEN.md` (Werke); VK2: `vk2-handbuch/03-GALERIE-KATALOG-KASSA.md` |
| **Design** | Willkommen, Galerie-Karte, Texte, Farben, Corporate-Design-Linie. | `02-GALERIE-GESTALTEN.md` |
| **Einstellungen** | Stammdaten, Passwort, Backup, Veröffentlichen, Drucker; **VK2:** Verein, Kategorien, Mitglieder-Stammdaten. | `10-EINSTELLUNGEN.md`; VK2: `vk2-handbuch/02-VEREIN-STAMMDATEN-MITGLIEDER.md`, `08-EINSTELLUNGEN.md` |
| **Event- und Medienplanung** | Events, Flyer, Presse, Newsletter, Plakat, Social, Medienspiegel, Verteiler. | `07-EVENTPLANUNG-WERBUNG-OEFFENTLICHKEITSARBEIT.md`; VK2: `vk2-handbuch/06-EVENTPLANUNG-OEFFENTLICHKEITSARBEIT.md` |
| **Presse / Pressemappe / Newsletter** | (Je nach Tab) PR-Texte, Pressemappe, Newsletter-Erstellung – eng mit Eventplanung verzahnt. | Ebd.; `docs/oeffentlichkeitsarbeit/00-INDEX.md` für Vertiefung |
| **Statistik / Werkkatalog** | Verkauf/Lager-Übersicht, Katalog drucken, Exporte; **Kundenadressen** verlinkt. | `11-STATISTIK-WERKKATALOG.md` |
| **Zertifikat** | Echtheitszertifikate pro Werk (Künstler:in aus Kontext). | `11-STATISTIK-WERKKATALOG.md` (Querverweise im Handbuch) |
| **Kassa / Buchhaltung** | Verkauf, Belege, Kassabuch, Buchhaltungsexport; Demo vs. Produktiv. | `08-KASSA-BUCHHALTUNG.md`, `08-KASSA-VERKAUF-BELEGE.md`; VK2: `vk2-handbuch/03-GALERIE-KATALOG-KASSA.md` |
| **Katalog** | Druckbare Listen, Spalten; VK2-spezifische Kataloge möglich. | `11-STATISTIK-WERKKATALOG.md` / VK2-Handbuch |
| **Veröffentlichen** (eigener Tab / Einstellungen) | Stand an Server senden (K2-Produkt); **ök2** andere Regeln (kein „echtes“ K2-Veröffentlichen). | `docs/PROZESS-VEROEFFENTLICHEN-LADEN.md`; `benutzer-handbuch/03-ADMIN-UEBERBLICK.md` |
| **Präsentationsmappen** | Nur **K2** (echte Plattform-Galerie), **nicht** in ök2/VK2-Admin (`showPraesentationsmappenAdmin`). | – für ök2/VK2 **nicht** anbieten |
| **Empfehlungsprogramm** | (falls Lizenz) Link teilen, Konditionen. | `03-ADMIN-UEBERBLICK.md` (Abschnitt „Empfehlungsprogramm“) |

**mök2 / Vertrieb** (nicht Admin-Tab, aber Kontext „Lizenz kaufen“): `MarketingOek2Page`, `/mok2` – AGB, Lizenzen, Argumentation; **kein** Ersatz für Schritt-für-Schritt im Handbuch.

---

## 4. Besonderheiten ök2 vs. VK2 (Kurz)

| Thema | ök2 | VK2 |
|--------|-----|-----|
| **Stammdaten** | Muster-Galerie / Demo-Texte | Verein, Vorstand, **Mitglieder** |
| **Werke** | Musterwerke + eigene Versuche in Demo | Optional Mitglieder-Werke in Galerie |
| **Veröffentlichen / Auto-Save** | Demo-Regeln; kein K2-`gallery-data`-Pflicht für echte K2-Daten | Wie dokumentiert; keine K2-Daten |
| **Handbuch-Knüpfung** | Benutzerhandbuch + `06-OEK2-DEMO-LIZENZ.md` | VK2-Handbuch + `05-VK2-VEREINSPLATTFORM.md` |

---

## 5. Umsetzungsphasen (Vorschlag)

| Phase | Inhalt |
|-------|--------|
| **A** | Dieses Dokument mit Georg **abnehmen**; Matrix bei neuen Tabs **aktualisieren** (eine Quelle). |
| **B** | **Inhalt:** Fehlende „ein Satz“-Zeilen in den **Handbuch-Kapiteln** ergänzen (nicht in der App), damit die Matrix immer stimmt. |
| **C** | **UI (optional):** Admin-„Rundgang“-Shell **gleiche Idee** wie Galerie-Rundgang (Maske, Schritte, Fokus) – **oder** schlank: **Sidebar „Hilfe“** mit Links zu den Kapiteln pro aktivem Tab; **oder** erste Tooltips nur für Hub-Kacheln. |
| **D** | **Tests:** Keine Pflicht für reine Doku; **wenn** UI: Smoke-Test (öffnet Link, richtiger Kontext ök2/VK2). |
| **E** | **K2Team-Handbuch** / **00-INDEX** in `docs/`: Verweis auf dieses Konzept; **kein** Parallel-Text in drei Orten. |

---

## 6. Technik-Optionen (noch nicht festlegen)

- **Variante 1:** Nur **Deep-Links** aus dem Admin („?“ neben Tab) → **Handbuch-Kapitel** in neuem Tab / gleicher Origin.
- **Variante 2:** **Sheet** wie Galerie-Rundgang (gemeinsame Shell mit `KONZEPT-PLATTFORM-RUNDGANG-OEK2-VK2.md`).
- **Variante 3:** **Kurz-HTML** in Panel, Inhalt **per fetch** aus `public/benutzer-handbuch/…` (eine Quelle, keine doppelte Redaktion).

**Sportwagen:** Eine **Variante** wählen, nicht drei parallele Hilfesysteme.

---

## 7. Verknüpfungen

- **Code:** `components/ScreenshotExportAdmin.tsx` (`AdminTabType`, Hub, `showPraesentationsmappenAdmin`)
- **Galerie-Rundgang-Konzept:** `docs/KONZEPT-PLATTFORM-RUNDGANG-OEK2-VK2.md`
- **Ablage:** `docs/` = Projekt-Konzept; **vollständige Nutzer-Texte** = `public/benutzer-handbuch/`, `public/vk2-handbuch/`
- **Regeln:** `admin-einheitliches-layout.mdc`, `k2-oek2-trennung.mdc`, `eiserne-regel-lizenznehmer-kein-oek2-vk2.mdc`

---

**Kurzfassung:** Für **ök2- und VK2-Admin** brauchen wir **keine neue Text-Wüste**, sondern eine **eindeutige Matrix**: Tab/Kachel → **ein Satz** → **bestehendes Handbuch-Kapitel**. Optional später **eine** UI-Hülle (Rundgang, Sidebar oder Tooltips) – parallel zum **Galerie-Rundgang**, aber **Fokus Admin**.
