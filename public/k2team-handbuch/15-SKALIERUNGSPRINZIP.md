# Skalierungsprinzip – absolute Regel

**Stand:** Februar 2026. Gilt für alle Funktionen und Features der K2 Galerie.

---

## Grundsatz

**Jede Funktion muss auf Skalierung ausgelegt sein.** Das K2-Konzept beruht auf diesem Prinzip; ohne es gibt es kein beliebiges Skalieren und keine Grundvoraussetzung für Erfolg.

---

## 1. Skalierung

- **Eine Struktur, viele Instanzen:** Gleiche Architektur (Willkommensseite, Galerie, Admin) für K2 Galerie Kunst&Keramik, Kreinecker (öffentliche Galerie), VK2-Mitglieder, künftige Lizenznehmer. Kein Sonderbau pro Kunde.
- **Kontext/Mandant** steuert nur: welche Daten, welches Design, welche Rechte – nicht einen anderen Ablauf oder eine andere UX.
- **Neue Galerie / neues Mitglied** = neuer Kontext, gleiche Oberfläche und gleicher Ablauf. Keine Ausnahmen, die „nur für einen“ gebaut werden.

---

## 2. Einfach und smart

- Keine Umwege: direkte Wege vom Ziel („Galerie bearbeiten“, „Veröffentlichen“, „Kasse“) zur Erledigung.
- Keine doppelten Eingaben (bereits vorhandene Daten nutzen, Stammdaten übernehmen).
- Klar und minimal: eine Hauptaktion pro Situation.

---

## 3. One-Click-Regel

- **Eine Aufgabe = ein Klick.** Ein Klick „Kasse“ → Kassa ist offen. Ein Klick „Admin“ → Admin ist offen. Keine Zwischenseiten, keine zusätzlichen Klicks für dieselbe Aufgabe.
- Keine „leeren Kilometer“: Buttons führen unmittelbar zum Ziel.
- Erfolgsmeldungen: keine technischen Schritte vorschreiben („einfach OK drücken“), wenn damit die Sache erledigt ist.

---

## 4. K2-Familie: Hausherr bestimmt die Hausregeln (VK2)

**Lektion (19.02.26):** VK2 als eigenständiges Instrument zu bauen führte zu Chaos. Die Hausregeln bestimmt der Hausherr, nicht die Mieter.

- **K2 = Hausherr:** Architektur, Konfiguration, Tenant-Modell, Routen, UI-Patterns, mök2, Handbuch – die K2-Struktur ist die Basis.
- **VK2 = Mieter:** Nutzt dieselbe Struktur. Eigene Daten (`k2-vk2-*`), aber dieselben Patterns wie K2/Kreinecker. Keine parallelen Sonderbauten.
- **Konkret:** VK2 nicht als eigenständiges Produkt mit eigenen Regeln entwickeln. Stattdessen: K2-Struktur erweitern, damit VK2 als weiterer Kontext darauf passt. Keine VK2-Logik, die K2-Patterns umgeht.

**Merksatz:** VK2 entwickelt sich als Erweiterung der K2-Familie – nicht als eigenes Instrument daneben.

---

## Checkliste bei neuen Features

Vor dem Umsetzen prüfen:

- [ ] Ist die Funktion **skalierbar** (Kontext/Mandant, keine Einmal-Logik)?
- [ ] Ist sie **einfach und ohne Umwege**?
- [ ] Erfüllt sie die **One-Click-Regel** (eine Aktion = Ziel erreicht)?

---

## Kurzfassung

**Skalierungsgesetz:** Jede Funktion skalierbar, einfach, smart, ohne Umwege, One-Click. Keine Ausnahme.

---

## Prüfung (Februar 2026)

**Geprüft:** VK2-Mitglieder-Galerien, Willkommensseite (Struktur öffentliche Galerie Kreinecker), Admin nur Tom (hasFullAdmin), Smart Panel, Link „Besuchen Sie meine Galerie“.

**Ergebnis:**

| Bereich | Regel | Status |
|--------|--------|--------|
| Mitglieder-Galerie | Skalierbar (memberId, gleiche Struktur) | ✅ |
| Willkommensseite | Identisch Kreinecker (öffentliche Galerie), nur anderes Design | ✅ |
| hasFullAdmin | Über Daten (Flag), nicht fest verdrahtet | ✅ |
| One-Click | Admin, Galerie betreten = ein Klick | ✅ |
| Smart Panel „Toms Galerie“ | War fest vk2-m-2 | ⚠️ angepasst |

**Anpassung:** Smart Panel verlinkt nicht mehr auf festes memberId. Route `/projects/vk2/vollversion` leitet auf das erste Mitglied mit `hasFullAdmin` um (skalierbar). Label: „Vollversion (mit Admin)“.
