# Struktur für unser Handeln – Quellen (verbindlich)

**Gilt für alle:** K2, ök2, VK2, Tom (VK2-Mitglied). Wir arbeiten nicht mit unterschiedlichen Regeln pro Kontext – dieselbe Struktur für alle.

Damit alle Informationen **jederzeit aktuell und hier verfügbar** sind, gilt diese Struktur. Sie wird von der AI (Cursor) und vom Team eingehalten.

---

## Wo was liegt

| Was | Wo | Wofür |
|-----|-----|--------|
| **Kommandozentrale (Steuerung)** | **docs/KOMMANDOZENTRALE.md** | Georg und KI: Zugriff jederzeit, Überblick, steuernd eingreifen. Sofort-Zugriff DIALOG-STAND, GRAFIKER-TISCH, Definitionen, Konzepte, Roadmap. |
| **AGB (Allgemeine Geschäftsbedingungen)** | **mök2** (Marketing ök2). In der App: Route `/agb`, Seite `src/pages/AGBPage.tsx`. Links und Rechtliches auf der Marketing-ök2-Seite (`MarketingOek2Page.tsx`). | Rechtliches, Vertrieb, Willkommensseite (AGB-Bestätigung). |
| **Handbuch (alle wichtigen Sachen)** | **k2team-handbuch/** – Inhaltsverzeichnis `00-INDEX.md`. Spiegel in `public/k2team-handbuch/` für die App. | Backup, Sicherheit, Skalierung, Team-Grundlagen, Arbeitsgewohnheiten – alles Wichtige für Zusammenarbeit und Betrieb. |
| **Projekt-Doku (technisch)** | **docs/** – Liste `docs/00-INDEX.md`. | K2/ök2, Vercel, Supabase, Crash, Deployment. |
| **Projekt-Übersicht** | **HAUS-INDEX.md** (Root). | Schnellfinder: wo liegt was (Keller bis Dachboden). Enthält den Abschnitt „Struktur für unser Handeln“. |
| **Tenant-Context (K2 \| ök2 \| VK2)** | **.cursor/rules/k2-oek2-trennung.mdc**, **docs/K2-OEK2-DATENTRENNUNG.md**, `src/config/tenantConfig.ts`. | Eine Stelle: Kontext steuert Keys und Anzeige; keine vergessene Stelle. |
| **Sync-Regel (Merge Server + lokal)** | **docs/SYNC-REGEL.md**, `src/utils/syncMerge.ts`. | Eine Funktion `mergeServerWithLocal`; alle Aufrufer nutzen sie. |
| **Produkt-Standard (nach Sportwagen)** | **docs/PRODUKT-STANDARD-NACH-SPORTWAGEN.md**. | Erreichter Standard: Architektur, Sicherheit, Tests, Doku & Prozess; eine feste Stelle für „worauf das Produkt aufbaut“. |

---

## Regel

- **AGB** leben in **mök2** (Vertriebs-/Recht-Kontext), nicht „irgendwo im Code“. Für **K2, ök2, VK2, Tom** gleich.
- **Handbuch** = zentrale Ablage für **alle wichtigen Abläufe und Entscheidungen** – für alle Kontexte dieselbe.
- **Keine getrennten Regeln:** Was für K2 gilt, gilt auch für ök2, VK2 und Tom.
- **Profi statt Dilettant – Rad nicht zweimal erfinden:** Was andere schon erfunden haben, nicht neu bauen. Normen kennen, Komponenten zukaufen, Kompetenzen auslagern, am Markt beste Lösungen nutzen. Vor dem Bauen: „Gibt es das schon?“ Regel: **.cursor/rules/profi-statt-dilettant-rad-nicht-zweimal.mdc**.
- **Ein Standard pro Problemstellung:** Gleiche Aufgabe = eine Lösung, keine verschiedenen Wege pro Fall. Verschiedene Standards sind automatische Fehlerquellen (wie im Maschinenbau). Regel: **.cursor/rules/ein-standard-problem.mdc**.
- **Verbindlich = zuverlässig:** Was als verbindlicher Befehl oder Weg dargestellt wird, muss funktionieren – man muss sich darauf verlassen können, nicht darauf hoffen. Regel: **.cursor/rules/verbindlich-zuverlaessig-nicht-hoffnung.mdc**.
- **Ziel vor Anstrengung:** Ohne richtiges Ziel kann hundertmal „richtig machen“ trotzdem falsch sein. Immer wieder das Ziel vor Augen – nicht Anstrengung verdoppeln, wenn das Ziel aus den Augen ist. Regel: **.cursor/rules/ziel-vor-anstrengung.mdc**.
- **Schritt für Schritt – konsequent:** Ein Schritt fertig, dann der nächste. Nicht springen, nicht halb machen. Roadmap Phase für Phase. Regel: **.cursor/rules/schritt-fuer-schritt-konsequent.mdc**.
- **Pflichtregel vor Fix prüfen:** Bei wiederkehrenden Themen (Crash, Reopen, Missetäter, „hatten wir schon“) zuerst bestehende Pflichtregeln in .cursorrules und .cursor/rules prüfen; Nutzer-Regel verbindlich umsetzen, keine „Ausnahme“ statt Regel. Analyse: **docs/ANALYSE-FEHLER-MISSETAETER-REOPEN.md**. Regel: **.cursor/rules/pflichtregel-vor-fix-pruefen.mdc**.
- Bei Fragen „wo steht X?“ oder „wie machen wir Y?“: zuerst **k2team-handbuch/00-INDEX.md**, **mök2** (AGB, Marketing ök2), **docs/00-INDEX.md**, **HAUS-INDEX.md** prüfen.
- Neue wichtige Infos: in der passenden Quelle (mök2, Handbuch, docs) eintragen, damit sie **hier immer aktuell zur Verfügung stehen**.

---

## Siehe auch

- **HAUS-INDEX.md** (Root) – Projekt-Übersicht, Schnellfinder
- **.cursor/rules/struktur-handeln-quellen.mdc** – Regel für Cursor/AI, diese Quellen zu nutzen
- **.cursor/rules/profi-statt-dilettant-rad-nicht-zweimal.mdc** – Profi-Denken: Rad nicht zweimal erfinden, zukaufen/normen/auslagern
- **.cursor/rules/ein-standard-problem.mdc** – Ein Standard pro Problemstellung (keine verschiedenen Wege für dieselbe Aufgabe)
- **.cursor/rules/verbindlich-zuverlaessig-nicht-hoffnung.mdc** – Verbindliche Anforderungen/Befehle müssen zuverlässig funktionieren (nicht „hoffen“, sondern „sich darauf verlassen können“)
- **.cursor/rules/ziel-vor-anstrengung.mdc** – Ziel vor Anstrengung; ohne richtiges Ziel kann hundertmal richtig machen trotzdem falsch sein (Grundregel, DNA)
- **.cursor/rules/schritt-fuer-schritt-konsequent.mdc** – Schritt für Schritt, konsequent bleiben; nicht springen, nicht halb machen (DNA)
- **.cursor/rules/build-skripte-nur-schreiben-wenn-geaendert.mdc** – Build-Skripte schreiben nur bei Änderung → weniger Cursor-Reopen (Erfahrung 28.02.26)
- **.cursor/rules/pflichtregel-vor-fix-pruefen.mdc** – Vor Fix zu wiederkehrenden Themen bestehende Pflichtregeln prüfen; Regel verbindlich umsetzen (Analyse: docs/ANALYSE-FEHLER-MISSETAETER-REOPEN.md)
- **.cursor/rules/team-hebel-unternehmer-persoenlichkeit-ki.mdc** – Team-Hebel (Unternehmer + Persönlichkeit + KI), Regelwerk und Vermächtnis für maximale Lernkurve
- **docs/WIR-PROZESS.md** – Abschnitt „Team-Hebel und Lernkurve“ im Vermächtnis
- **docs/MOK2-EIGENER-BEREICH.md** – mök2 als eigener Bereich
