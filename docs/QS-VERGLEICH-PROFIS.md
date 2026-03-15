# QS-Standard: Wo wir stehen vs. Profi-Standard

**Zweck:** Ehrlicher Vergleich – was haben wir, was haben große Teams zusätzlich? Damit du einschätzen kannst, wie weit wir von „Profi-QS“ entfernt sind.

---

## ✅ Was wir haben (bereits auf gutem Niveau)

| Bereich | Unser Stand | Kommentar |
|--------|-------------|-----------|
| **Tests vor Commit** | ✅ Verbindlich (Regel qs-standard-vor-commit) | Tests + Build vor jedem Push – wie bei Profis |
| **Automatisierte Tests** | ✅ 21 Tests (Vitest): Datentrennung, Bild-Upload, Kundendaten | Wichtige Logik abgesichert |
| **Build muss grün sein** | ✅ `npm run build` = test + tsc + vite build | Kein Push mit kaputtem Build |
| **TypeScript** | ✅ Strict, tsc im Build | Weniger Tippfehler, bessere Wartbarkeit |
| **CI auf GitHub** | ✅ `.github/workflows/tests.yml` | Läuft bei jedem Push auf main: **voller Build** (`npm run build` = test + tsc + vite build) |
| **ESLint** | ✅ Vorhanden (`npm run lint`) | Noch nicht in CI, aber lokal nutzbar |
| **Checkliste vor Go-Live** | ✅ docs/VOR-VEROEFFENTLICHUNG.md | Manuelle Punkte vor Veröffentlichung |
| **Dokumentierte Regeln** | ✅ .cursor/rules, QUALITAETSSICHERUNG.md | Klar, was vor Commit zu tun ist |

---

## 🟡 Was Profis oft zusätzlich haben (wir noch nicht)

| Thema | Was Profis typisch machen | Unser Abstand |
|-------|---------------------------|----------------|
| **CI = voller Build** | CI führt nicht nur Tests, sondern auch `npm run build` (Vite-Build) | ✅ **Erledigt:** CI führt jetzt `npm run build` (test + write-build-info + tsc + vite build). |
| **Lint in CI** | Jeder Push: ESLint läuft, Merge blockiert bei Fehlern | Wir haben `npm run lint`, aber nicht in der GitHub-Action. Mittlerer Aufwand. |
| **Test-Coverage** | „Mindestens X % der Zeilen getestet“, Report bei jedem Run | @vitest/coverage-v8 ist installiert, aber wir nutzen keine Mindest-Coverage. Optional. |
| **E2E-Tests** | Playwright/Cypress: komplette Abläufe im Browser (z. B. „Login → Werk anlegen“) | Haben wir nicht. Größerer Aufwand, lohnt sich bei mehr Nutzern/Features. |
| **Branch Protection** | main: Merge nur wenn CI grün, ggf. Review | GitHub-Einstellung, kein Code. Du kannst das unter Repo → Settings → Branches einrichten. |
| **Staging-Umgebung** | „Test-Version“ vor Production (eigene URL) | Vercel Preview bei PRs möglich; wir nutzen vor allem main → Production. |
| **Automatische Sicherheits-Updates** | Dependabot / npm audit in CI | npm audit manuell in VOR-VEROEFFENTLICHUNG; keine Dependabot-PRs. |

---

## Kurz: Wie weit von den Profis entfernt?

- **Kern-QS (Tests + Build vor Commit):** **auf Profi-Niveau** – verbindliche Regel, konsequent.
- **CI:** **Profi-Niveau** – läuft bei jedem Push mit vollem Build (test + tsc + vite build).
- **Lint in CI, Coverage, E2E, Branch Protection:** **optional / „nice to have“** – typisch bei größeren Teams oder wenn mehrere Personen pushen. Für ein Einzelprojekt mit klarem Ablauf sind sie nicht zwingend.

**Fazit:** Beim Wichtigsten (niemand pusht ohne grüne Tests und grünen Build) sind wir **sehr nah an Profi-Standard**. Der Abstand liegt vor allem in Zusatzthemen (Lint in CI, E2E, Coverage), die du bei Bedarf schrittweise dazunehmen kannst.

---

## Qualitätssicherungsvorschläge (Profi-Perspektive)

Was ein Profi zusätzlich oder als Nächstes umsetzen würde – priorisiert und konkret.

### 1. Kritische Abläufe durch Tests absichern (höchste Priorität)

**Lücke:** Die **VK2-Absicherungen** (Keine K2-Daten in VK2) sind im Code umgesetzt, aber **nicht durch automatisierte Tests** abgedeckt. Bei Refactorings könnte unbemerkt wieder K2 in VK2 landen.

| Vorschlag | Was | Aufwand |
|-----------|-----|--------|
| **VK2 Seitengestaltung – Unit-Tests** | `sanitizePageContentForVk2Publish`: Eingabe mit `/img/k2/` → Ausgabe ohne K2-URLs. `getVk2SafeDisplayImageUrl`: K2-URL → `''`. `mergePageContentGalerieFromServer(serverJson, 'vk2')`: Server enthält K2-URL → wird nicht übernommen. | Klein: 1 Test-Datei, reine Funktionen. |
| **VK2 setPageContentGalerie** | Schreiben mit `welcomeImage: '/img/k2/...'` und `tenantId: 'vk2'` → im Key steht danach **nicht** `/img/k2/` (wird ersetzt). In `datentrennung.test.ts` ergänzbar. | Klein. |
| **createVk2Backup – Payload** | Backup-Objekt enthält `k2-vk2-page-content-galerie` und `k2-vk2-eingangskarten` ohne K2-URLs, wenn vorher welche drin waren. (Mock localStorage, createVk2Backup aufrufen, Ergebnis prüfen.) | Mittel. |

**Regel:** Nach jedem großen Fix an kritischen Abläufen (Veröffentlichen, Laden, Merge, Datentrennung) einen **Flow- oder Unit-Test** dazu anlegen – siehe `.cursor/rules/tests-flow-bei-kritischen-ablaufen.mdc`.

---

### 2. CI um Lint erweitern

| Vorschlag | Was | Aufwand |
|-----------|-----|--------|
| **ESLint in GitHub Action** | In `.github/workflows/tests.yml` vor oder nach `npm run build` einen Step `npm run lint` einbauen. Bei Fehlern: Job rot, Merge/Push blockiert. | Gering. |

---

### 3. Coverage (optional)

| Vorschlag | Was | Aufwand |
|-----------|-----|--------|
| **Coverage-Report** | `vitest run --coverage` in CI oder lokal; keine Mindest-Schwelle, nur Sichtbarkeit: wo fehlen Tests? | Gering (Config in vitest.config.ts). |
| **Mindest-Coverage** | Nur wenn gewollt: z. B. „mind. 80 % für utils/syncMerge.ts, pageContentGalerie.ts“ – CI schlägt sonst fehl. | Mittel, kann zu „Test nur für Coverage“ verleiten. |

---

### 4. E2E / manuelle Szenarien (optional)

| Vorschlag | Was | Aufwand |
|-----------|-----|--------|
| **Dokumentierte Test-Szenarien** | Kurze Checkliste (z. B. in K2-OEK2-DATENTRENNUNG oder FEINSCHLIFF-WEIT-TESTEN): „Nach Änderung an VK2-Veröffentlichen: 1) Design speichern mit VK2-Bild, 2) Veröffentlichen, 3) Anderes Gerät / Inkognito: Laden vom Server, 4) Prüfen: kein K2-Bild sichtbar.“ So kann Georg oder jemand anderes gezielt nachklicken. | Gering (nur Doku). |
| **E2E mit Playwright/Cypress** | Automatisiert: Browser öffnen, Admin öffnen, Design speichern, Veröffentlichen, zweiter Tab laden. | Hoch; lohnt sich bei mehr Nutzern oder vielen Regressionen. |

---

### 5. Reproduzierbarkeit und Doku

| Vorschlag | Was | Aufwand |
|-----------|-----|--------|
| **Regressions-Test nach Bugfix** | Wenn ein Bug in GELOESTE-BUGS eingetragen wird: Prüfen, ob ein Test den Fix absichert. Wenn nein: einen minimalen Test ergänzen („BUG-XXX: … darf nicht wieder vorkommen“). | Pro Bug einmalig, gering. |
| **Kritische Abläufe – eine Seite Doku** | Eine Datei (z. B. docs/KRITISCHE-ABLAEUFE.md) als Master-Liste: welche Abläufe sind kritisch, welche Tests decken sie ab, welche manuellen Checks empfohlen. | Gering, dann bei Änderungen aktuell halten. |

---

**Kurz:** Der größte Profi-Gewinn mit wenig Aufwand: **Tests für VK2-Seitengestaltung und createVk2Backup** (keine K2-Daten in VK2). Danach: **Lint in CI**, dann optional Coverage/Checklisten/E2E.

---

*Stand: 25.02.26 – QS-Standard vor Commit; CI um vollen Build ergänzt. 15.03.26 – Abschnitt „Qualitätssicherungsvorschläge (Profi-Perspektive)“ ergänzt.*
