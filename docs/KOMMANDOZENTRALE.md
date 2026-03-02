# Kommandozentrale – Steuerung jederzeit

**Zugang:** Georg und KI (Cursor) haben hier jederzeit Zugriff. Von hier aus kann steuernd eingegriffen werden – Fokus setzen, nächste Schritte anstoßen, Definitionen und Konzepte abrufen.

**Datei:** `docs/KOMMANDOZENTRALE.md` (diese Datei). Im Projekt öffnen und bei Bedarf ergänzen oder anpassen.

---

## Sofort-Zugriff (wo steht was)

| Was | Wo | Wofür |
|-----|-----|--------|
| **Wo wir stehen / Nächster Schritt** | `docs/DIALOG-STAND.md` | Nach Absturz, „weiter“, Session-Start – zuerst hier. |
| **Offene Wünsche / Grafiker-Tisch** | `docs/GRAFIKER-TISCH-NOTIZEN.md` | Was noch umzusetzen ist; KI liest beim Session-Start. |
| **Gelöste Bugs** | `docs/GELOESTE-BUGS.md` | Vor Code-Änderungen prüfen – nicht wieder einbauen. |

---

## Definitionen & Konzepte (stimmig bleiben)

| Thema | Wo | Kurz |
|-------|-----|-----|
| **Fertige Homepage vs. Projekt-Startseite** | `docs/HOMEPAGE-DEFINITION.md` | Fertige Homepage = designte Nutzer-Seite (wie K2 Galerie). Projekt-Startseite = aktuelle Übersicht (Liste, Links). |
| **K2 Familie – Fertige Homepage** | `docs/K2-FAMILIE-HOMEPAGE-KONZEPT.md` | Orientierung ök2, einheitliche Struktur, Gestaltung pro Tenant → buntes Bild in fester Struktur. |
| **Skalierung (unendlich nach oben)** | `docs/SKALIERUNG-KONZEPT.md` | Ein Prinzip: eine Struktur, viele Tenants. Skalierung breit + hoch. Raumschiff-Qualität beim Skalieren. |
| **Raumschiff-Qualität** | `docs/K2-FAMILIE-GRUNDBOTSCHAFT.md` (Abschnitt Raumschiff-Anspruch) | Nicht abheben, bevor startklar. Qualität vor Quantität. Gegenseitige Kontrolle. |

---

## Roadmap & Regeln

| Thema | Wo |
|-------|-----|
| **K2 Familie – Phasen** | `docs/K2-FAMILIE-ROADMAP.md` |
| **Struktur Handeln / Quellen** | `docs/STRUKTUR-HANDELN-QUELLEN.md`, `HAUS-INDEX.md` |
| **Regeln (Cursor)** | `.cursor/rules/*.mdc` (alwaysApply), `.cursorrules` |

---

## Steuernd eingreifen – wie?

- **Georg:** Diese Datei oder DIALOG-STAND / GRAFIKER-TISCH öffnen, Fokus oder nächsten Schritt formulieren (oder in die genannten Docs eintragen). Bei „ro“ oder „weiter“ liest die KI DIALOG-STAND und arbeitet am Nächsten Schritt.
- **KI:** Beim Session-Start und bei „weiter“/Absturz zuerst DIALOG-STAND + GRAFIKER-TISCH (+ ggf. GELOESTE-BUGS) lesen. Bei Entscheidungen oder neuen Konzepten die passenden Docs (Definitionen, Skalierung, Raumschiff) beachten und ggf. hier oder in der Kommandozentrale verlinken.
- **Beide:** Kommandozentrale als gemeinsamer Anker – wer hier nachsieht, hat den Überblick und kann steuernd eingreifen.

---

## Haus-Index & Docs-Liste

- **Gesamtübersicht Projekt:** `HAUS-INDEX.md` (Root)
- **Alle Docs mit Kurzbeschreibung:** `docs/00-INDEX.md`

---

*Zuletzt angelegt: 02.03.26. Bei Änderungen an Struktur oder zentralen Docs diese Tabelle ggf. anpassen.*
