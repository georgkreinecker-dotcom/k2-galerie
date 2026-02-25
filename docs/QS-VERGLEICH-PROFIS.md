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

*Stand: 25.02.26 – QS-Standard vor Commit; CI um vollen Build ergänzt (Tests + Build bei jedem Push).*
