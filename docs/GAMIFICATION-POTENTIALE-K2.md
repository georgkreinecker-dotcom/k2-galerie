# Gamification – Potenziale in der K2-Galerie-App

**Verbindlich für ök2 (Demo):** Architektur **Kern vs. optional einschaltbare Schicht**, alles ohne Gamification gleich nutzbar – siehe **[GAMIFICATION-OEK2.md](./GAMIFICATION-OEK2.md)**.  
**K2 (echte Galerie):** Gamification **nicht** vorgesehen; Kern unangetastet.

**Stand:** 20.03.26 · **Ausgang (Georg):** Neue Generation braucht **Spaß, klare Ziele, Fortschritt** – nicht kindisch, sondern **smart**. Erster Baustein: **Admin → Eventplanung → Öffentlichkeitsarbeit** (Hero + Meilensteine).

**Begriff:** *Gamification* = Belohnung, Fortschritt, sichtbare Ziele, kleine Triumphe – **ohne** Pflicht zu „spielen“.

---

## Umgesetzt (Start)

| Ort | Was |
|-----|-----|
| **Eventplan → Öffentlichkeitsarbeit** | Hero-Bild (`/img/medienstudio/marketing-oeffentlichkeit-hero.svg`) + **Fortschritt X/4** aus echten Daten (Events, Medienspiegel, Dokumente, Newsletter-Verteiler). |
| **Admin → Presse & Medien** | Dasselbe Hero + **Fortschritt X/4**: Medienkit (Kernangaben), Presse-Story gewählt, Anlass/Datum/Ort, Medienspiegel. |

---

## Weitere Bereiche – Potenzial (zum schrittweisen Prüfen)

| Bereich | Potenzial | Idee (kurz) |
|---------|-----------|-------------|
| **Events (Tab „Events“)** | Mittel | Zeitachse / „Nächstes Event“-Karte, Checkliste vor dem Termin (Location, Text, Bild). |
| **Werke verwalten** | Hoch | Ampel „Katalog vollständig“: fehlende Bilder, fehlende Preise – **ohne** Daten zu löschen. |
| **Galerie gestalten** | Hoch | Schritte 1–4 mit Häkchen (Willkommen, Karte, Galerie, Speichern) – schon teils Handbuch-nah. |
| **Veröffentlichen / Stand** | Mittel | „Alles draußen“-Badge wenn letzter Push = aktueller Stand (nur Hinweis, kein Auto-Reload). |
| **Presse & Medien (Tab)** | ~~Mittel~~ umgesetzt | Wie oben; weitere Verfeinerung nur bei Bedarf (z. B. Kopier-Historie). |
| **Newsletter-Tab** | Niedrig–mittel | Empfänger-Zahl als Erfolgsanzeige, erste Kampagne = Meilenstein. |
| **Kassa / Shop** | Niedrig | Nur wo sinnvoll: „Erste Übungstransaktion“ in Demo – nicht im Echtbetrieb nerven. |
| **VK2 Mitglieder** | Mittel | „Vereinsprofil komplett“ – X von Y Pflichtfeldern (ohne Druck). |
| **Guide / Onboarding** | Hoch | Bereits linear – Fortschrittsbalken verstärken, kleine „Geschafft“-Momente. |
| **Einstellungen / Backup** | Mittel | „Sicherheits-Level“: letztes Backup-Datum sichtbar als grüner Status. |
| **mök2 / Präsentation** | Niedrig | Lesepfade für Piloten, nicht Spiel. |

---

## Regeln (nicht verletzen)

- **Keine** aggressiven Dark Patterns, **kein** Druck durch künstliche Verlustangst.
- **Kein** automatisches Löschen oder Überschreiben von Kundendaten wegen „Quest“.
- **K2 echte Galerie (Kern):** Keine UX-Experimente am K2-Werke-/Galerie-Kern ohne **explizite** Anordnung – **Admin / ök2 / VK2**-Oberflächen sind der natürliche Ort für Gamification.
- **Kontrast:** Auf hellem Admin-Hintergrund nur **dunkle** Texte/Buttons (ui-kontrast-leserbarkeit.mdc).

---

## Verknüpfung

- **ök2 – Leitlinien (abschaltbare Schicht):** **docs/GAMIFICATION-OEK2.md**
- Medienstudio-Roadmap: **docs/MEDIENSTUDIO-EINZIGARTIGKEIT-ROADMAP.md**
- Produkt-Vision: **docs/PRODUKT-VISION.md**
