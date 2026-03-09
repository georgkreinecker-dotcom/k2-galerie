# Kreativwerkstatt / K2 Markt – eigenständiges Projekt, Homepage, netzfähig

**K2 Markt** ist ein **alleinstehendes Projekt** (wie K2 Familie), **nicht** mit K2 Galerie verbunden. Einziger Unterschied zu K2 Familie: **Datenquelle ist ök2** (mök2, Muster, Demo) – keine K2-Kundendaten.

---

## Was „Homepage“ bei K2 Markt bedeutet

**Homepage** = die **Art und Weise, wie du manuell arbeiten kannst**: die **Arbeitsoberfläche** (Leitvision, Ablauf 3 Schritte, Studio, Zum Tor). Dort arbeitest du – nicht eine Marketing-Startseite, sondern deine Arbeitsumgebung. Wenn es funktioniert, ist sie **netzfähig** wie ök2 und K2 Familie (überall erreichbar, gleicher Stand).

---

## Wo ist K2 Markt im Netz?

| URL | Bedeutung |
|-----|-----------|
| **https://k2-galerie.vercel.app/projects/k2-markt** | **Homepage** = Arbeitsoberfläche (dort manuell arbeiten) |
| https://k2-galerie.vercel.app/projects/k2-markt/mappe | Mappe (Vision, Architektur, Handbuch) |
| https://k2-galerie.vercel.app/projects/k2-markt/tor | Tor (Entwurf prüfen, Freigabe) |
| **https://k2-galerie.vercel.app/kreativwerkstatt** | Kurze URL → gleiche Seite wie Homepage |

Alte Pfade unter `/projects/k2-galerie/k2-markt*` leiten auf die neuen um (Legacy-Redirects).

---

## Eigenständiges Projekt – Übersicht

| Aspekt | K2 Markt |
|--------|----------|
| **Stellung** | Eigenes Projekt (wie K2 Familie), nicht Teil von K2 Galerie |
| **Datenquelle** | **ök2** (mök2, Musterwerke, Demo-Inhalte) – keine K2-Artworks, keine echten Kundendaten |
| **Homepage** | Arbeitsoberfläche = Ort zum manuellen Arbeiten (Leitvision → Ablauf → Studio → Tor) |
| **Netzfähig** | Ja – wie ök2 und K2 Familie; erreichbar, gleicher Stand überall |
| **Projekte-Seite** | K2 Markt erscheint als eigene Karte (wie K2 Familie, VK2) |

---

## Technik

- **Navigation:** `PROJECT_ROUTES['k2-markt']` mit `home`, `mappe`, `tor` (navigation.ts).
- **Routen:** `/projects/k2-markt`, `/projects/k2-markt/mappe`, `/projects/k2-markt/tor` in App.tsx vor `/projects/:projectId`.
- **Kurze URL:** `KREATIVWERKSTATT_ROUTE = '/kreativwerkstatt'` → gleiche Seite wie `home`.
