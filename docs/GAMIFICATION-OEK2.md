# Gamification – nur ök2 (Demo), verbindliche Leitlinien

**Stand:** 20.03.26 (Phase 4: Env-Schalter) · **Entscheid Georg:** Gamification soll **K2 (echte Galerie) nicht** betreffen. Für **ök2** (öffentliche Demo, `context=oeffentlich` / `musterOnly`) ist sie sinnvoll – aber **nur als zusätzliche Schicht**, die man **theoretisch abschalten** kann, **ohne** dass sich Abläufe oder Erreichbarkeit von Funktionen ändern.

**Sportwagenmodus:** Gilt **für diesen ganzen Bereich** – nicht nur „schöne UI“, sondern: **bestehende Standards** nutzen, **keine** zweiten Wege erfinden (`.cursorrules` Sportwagenmodus, `ein-standard-problem.mdc`). Gamification baut **auf** dem Kern auf, ersetzt ihn nicht.

---

## 1. Geltungsbereich

| Gilt | Gilt nicht |
|------|------------|
| **ök2** – öffentliche Galerie, Demo-Admin, Besucher- und Pilot:innen-Journey | **K2** – echte Galerie Martina & Georg: **keine** Gamification-Pflicht, **keine** UX-Experimente am Kern ohne dezidierte Anordnung (Regel: `k2-echte-galerie-eisernes-gesetz.mdc`) |
| Optional: **VK2** nur, wenn ihr das später **explizit** so beschließt – dann eigener Abschnitt | Gamification **ersetzt** keine kritischen Abläufe (Veröffentlichen, Laden, Backup, Etikett, … siehe `docs/KRITISCHE-ABLAEUFE.md`) |

---

## 2. Kernprinzip: zwei Schichten

**Schicht A – Kern (immer)**  
Buttons, Formulare, Speichern, Tabs, Navigation: **genau so** wie ohne Gamification. Jede Funktion muss **vollständig nutzbar** sein, wenn **kein** Fortschrittsbalken, **kein** Hero, **kein** „X von Y“ sichtbar ist.

**Schicht B – Gamification (optional, einschaltbar)**  
Nur **Anreicherung**: sichtbarer Fortschritt, Meilensteine, ermutigende Labels, kleine Triumphe – **ohne** neue Pflichtklicks und **ohne** andere Buttons zu verstecken oder zu verschieben, die zum Kern gehören.

**Merksatz:** Gamification **dazuschalten** = mehr Hinweise und Freude; **wegschalten** = dieselbe App, nur nüchterner – **derselbe Weg** zum Ziel.

### Vereinheitlichung – ein Erlebnis, keine zwei störenden Schichten (Georg)

**Ziel:** **Nicht** zwei getrennte UI-Elemente, die sich **gegenseitig nerven** (z. B. ein globaler Begleiter **und** parallel ein zweiter Fortschritts-/Gamification-Block ohne Bezug). **Sondern:** **Zusammenwirken** – **ein** klarer Rahmen, in dem **Orientierung (Guide/Onboarding)** und **Status (Meilensteine, X/Y, Häkchen)** **logisch und visuell zusammengehören**.

| Richtig | Vermeiden |
|--------|-----------|
| Ein Begleiter-/Status-Rahmen (z. B. derselbe Dialog-Stil, Fortschritt **im** Begleiter wo sinnvoll) | Zwei konkurrierende Overlays oder zwei „Haupt“-Fortschrittsanzeigen gleichzeitig ohne klare Rollen |
| Tab-/Bereichs-Heroes (X/4) **oder** globaler Guide – **koordiniert**, kein Doppel-Fortschritt für dieselbe Aufgabe | Dieselbe Station zweimal mit unterschiedlichen Zahlen oder Texten führen |
| Guide **ersetzt** Gamification nicht und umgekehrt – sie **ergänzen** sich in **einem** Erlebnisfluss | Parallel zwei „Stimmen“, die den Nutzer in verschiedene Richtungen ziehen |

**Umsetzungsrichtung:** Wo möglich **eine** Steuerungs-/Anzeige-Logik für „was sieht der Nutzer als nächstes“ (Begleitung + Status); bestehende Standards **einbetten** – z. B. **grüner Admin-Balken** (ök2/VK2), **GalerieEntdeckenGuide** (K2-Galerie), Tab-Heroes / Ampeln – **nicht** einen zweiten globalen Overlay-Kanal eröffnen. *(Hinweis: Der frühere globale schwarze `GlobaleGuideBegleitung`-Dialog ist abgeschaltet; der Name taucht in alter Doku noch auf.)* Details: [GAMIFICATION-PLAN-OEK2-PHASEN.md](./GAMIFICATION-PLAN-OEK2-PHASEN.md).

---

## 3. Was „an- und abschaltbar“ technisch bedeutet

- **Konzeptionell:** Kein Feature darf **nur** über einen Gamification-Pfad erreichbar sein (z. B. keine „Quest“ als einziger Einstieg in Presse oder Veröffentlichen).
- **Umsetzung (jetzt):** **`VITE_OEK2_GAMIFICATION_LAYER_B`** – steuert **nur die Darstellung** von Schicht B (Heroes, Fortschritt X/Y, Lesepfade, mök2-Pilot-Hinweis). Werte **`0`**, **`false`**, **`off`**, **`no`** (Groß/Klein, Leerzeichen) → Schicht B **aus**; Variable **leer** oder **jeder andere Wert** → **an** (Standard). Implementierung: `isGamificationLayerBEnabled()` in `src/utils/gamificationLayer.ts`. **Schicht A** (Buttons, Speichern, Tabs, APIs) bleibt unverändert.
- **Geltung Schalter:** **Global** in der gebauten App (alle Kontexte, inkl. K2-Admin bei Presse/Öffentlichkeitsarbeit-Hero) – gedacht für **Notfall / Demo ohne Optik**, nicht als Dauer-„K2 ohne, ök2 mit“.
- **Ausgeschaltet:** Entsprechende UI-Elemente von Schicht B werden nicht gerendert; **keine** Änderung an Datenflüssen, Keys, APIs oder Pflichtvalidierungen.

Alles in Schicht B bleibt so gebaut, dass es **ohne** diese Teile weiter funktioniert; der Schalter macht das für den Betrieb **ohne Code-Revert** möglich (Phase 4: [GAMIFICATION-PLAN-OEK2-PHASEN.md](./GAMIFICATION-PLAN-OEK2-PHASEN.md)).

**Plan B (Georg):** Das „Wegschalten“ von Schicht B ist **kein** normaler Betriebsmodus, sondern nur die **absolute Notlösung**, falls die Darstellung kurzfristig einen Start blockiert. **Marktziel** bleibt: ök2 **mit** Gamification live gehen (Details: [GAMIFICATION-PLAN-OEK2-PHASEN.md](./GAMIFICATION-PLAN-OEK2-PHASEN.md)).

---

## 4. Regeln für neue Gamification in ök2

1. **Keine Funktion verschlechtern:** Speichern, Laden, Merge, Backup, Kontext K2/ök2/VK2 – unberührt lassen.
2. **Kein Druck:** Keine Dark Patterns, keine künstliche Verlustangst.
3. **Kein stilles Löschen** von Nutzerdaten wegen „Quest“ oder Meilenstein (Regel: `niemals-kundendaten-loeschen.mdc`).
4. **Kontrast:** Auf hellem Admin-Hintergrund nur lesbare Farben (`ui-kontrast-leserbarkeit.mdc`).
5. **Ein Standard:** Gleiche Art von Fortschrittsanzeige überall in ök2, wo ihr sie nutzt – nicht pro Tab ein neues Spiel (Sportwagenmodus: `ein-standard-problem.mdc`).
6. **Ein Erlebnis:** Guide/Begleitung und Gamification **vereinheitlicht** – zusammenwirken, nicht zwei getrennte, sich störende Elemente (siehe §2 „Vereinheitlichung“).

---

## 5. Checkliste vor jeder ök2-Gamification-Änderung (Entwicklung / KI)

- [ ] Erreicht man alle bisherigen Aktionen noch mit **denselben** Klicks, wenn Fortschritt/Hero **ausgeblendet** wäre?
- [ ] Wird **irgendein** kritischer Ablauf (siehe KRITISCHE-ABLAEUFE) nur in Schicht B versteckt oder erschwert? → **Nein** erforderlich.
- [ ] Liegt die Änderung **nur** in ök2-Kontext / `musterOnly` / `oeffentlich`-Keys – **nicht** am K2-Kern?
- [ ] Sind Texte und Elemente **optional** (kein Blocker für „nur schnell erledigen“)?
- [ ] **Ein Erlebnis:** Keine **zwei** getrennten, sich störenden Elemente – Guide/Begleitung und Status/Fortschritt **vereinheitlicht** bzw. koordiniert (§2 „Vereinheitlichung“)?

### Phase 1 – Abnahme (20.03.26)

Die umgesetzten Bausteine (siehe [GAMIFICATION-PLAN-OEK2-PHASEN.md](./GAMIFICATION-PLAN-OEK2-PHASEN.md) Baseline + Phase 1 DoD) wurden gegen §4 und §5 geprüft: **nur Schicht B**, **K2-Kern** ohne Gamification-Zwang, **kein** Blockieren kritischer Abläufe, **Vereinheitlichung** (kein schwarzer Global-Guide; Tab-Heroes + grüner Admin-Balken koordiniert). Die **Checkliste oben** bleibt bei **jeder neuen** Gamification-Änderung Pflicht.

### Phase 2 – Abnahme (20.03.26)

**Events** (Unter-Tab im Eventplan), **Newsletter**, **Veröffentlichen** (Stand-Hinweis): nur **ök2/VK2**; nur Anzeige bzw. statischer Hinweis; **kein** Auto-Reload am Veröffentlichen-Tab. Details und DoD: [GAMIFICATION-PLAN-OEK2-PHASEN.md](./GAMIFICATION-PLAN-OEK2-PHASEN.md) Phase 2.

### Phase 3 – Abnahme (20.03.26)

**VK2** Vereinsprofil (X/4, nur Lesen), **Shop** Demo-Kassen-Lesepfad (nur ök2-Admin, nicht VK2), **Backup** Zeitstempel nach Download + Infozeile (drei Wege unverändert), **mök2** Pilot-Hinweis (Lesepfade ≠ Spiel). Details: [GAMIFICATION-PLAN-OEK2-PHASEN.md](./GAMIFICATION-PLAN-OEK2-PHASEN.md) Phase 3.

### Phase 4 – Abnahme (20.03.26)

**Env-Schalter** `VITE_OEK2_GAMIFICATION_LAYER_B`, zentrale Prüfung `isGamificationLayerBEnabled()`, alle Schicht-B-Blöcke im Admin (inkl. Presse/Öffentlichkeitsarbeit), Newsletter, Shop-Demo, mök2 (standalone + embedded). Details: [GAMIFICATION-PLAN-OEK2-PHASEN.md](./GAMIFICATION-PLAN-OEK2-PHASEN.md) Phase 4.

---

## 6. Verknüpfungen

- **Phasenplan (Markt mit Gamification, Vorsicht, Plan B nur Notfall):** [GAMIFICATION-PLAN-OEK2-PHASEN.md](./GAMIFICATION-PLAN-OEK2-PHASEN.md)
- **Ideen & weiterer Potenzial-Katalog (App-weit, historisch „K2“ im Dateinamen):** [GAMIFICATION-POTENTIALE-K2.md](./GAMIFICATION-POTENTIALE-K2.md) – für ök2 gilt **diese** Datei (GAMIFICATION-OEK2) als **verbindliche Architektur**; die Potenzial-Datei bleibt Ideensammlung, nicht Gegenteil zu „abschaltbar“.
- Medienstudio / Ton: [MEDIENSTUDIO-EINZIGARTIGKEIT-ROADMAP.md](./MEDIENSTUDIO-EINZIGARTIGKEIT-ROADMAP.md), [PRODUKT-VISION.md](./PRODUKT-VISION.md)
- Datentrennung ök2: [K2-OEK2-DATENTRENNUNG.md](./K2-OEK2-DATENTRENNUNG.md)

---

## Kurzfassung

**Nur ök2.** Gamification = **Schicht B** über dem **unveränderten Kern**. **Alles muss ohne Schicht B** gleich funktionieren – **an- und abschaltbar**, ohne den Ablauf zu merken. **K2** braucht das nicht; dort kein Druck zur Gamification. **Vereinheitlichung:** Begleitung und Fortschritt **zusammenwirken** – **kein** doppeltes, sich störendes UI.
