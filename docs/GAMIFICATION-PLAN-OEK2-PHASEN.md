# Gamification ök2 – Phasenplan (analysiert, umkehrbar)

**Stand:** 20.03.26 · **Geltung:** nur **ök2** (Demo). **Leitlinien:** [GAMIFICATION-OEK2.md](./GAMIFICATION-OEK2.md) · **Ideen-Katalog:** [GAMIFICATION-POTENTIALE-K2.md](./GAMIFICATION-POTENTIALE-K2.md)

**Ziel dieses Plans:** Klare **Reihenfolge**, **Risiko-Stufen** und **Umkehr** (kein großer Knopf ohne Rückweg). **Klarstellung Georg:** Es heißt **nicht** „Stopp“ – ihr macht **weiter**, nur **vorsichtig**. **Zum Markteintritt** soll Gamification in ök2 **schon drin sein** (mindestens die **Baseline** unten; plus was ihr für den Start festlegt). **Plan B ohne sichtbare Gamification** ist nur die **absolute Notlösung**, kein normaler Plan.

**Sportwagenmodus (verbindlich):** Der **gesamte** Weg bis Markt – und danach – läuft im **Sportwagenmodus**: **eine** Problemstellung = **eine** Lösung im Projekt, vorhandene Abläufe und Tabellen in `ein-standard-problem.mdc` / kritische Abläufe **nicht** umgehen oder duplizieren. Gamification ist **Schicht B** auf dem **bestehenden** Kern, kein zweiter Parallel-App-Bau.

**Vereinheitlichung (Georg):** **Keine** zwei getrennten, sich **störenden** UI-Schichten (z. B. unkoordinierter globaler Guide **plus** zweiter Fortschrittskanal). **Ein** durchgängiges Erlebnis: Begleitung und Status (Meilensteine, X/Y) **greifen ineinander** – siehe [GAMIFICATION-OEK2.md](./GAMIFICATION-OEK2.md) §2 „Vereinheitlichung“. Phase 1 (Guide + Ampeln) **so planen**, dass Anzeigen **koordiniert** sind, nicht doppelt.

---

## Vorsicht – aber weiter

| | |
|--|--|
| **Gemeint** | **Vorsicht:** keine unnötigen Risiken kurz vor / beim Markt; kritische Abläufe nicht anfassen; kleine Commits; Checklisten. |
| **Nicht gemeint** | Alles einfrieren oder Gamification „erst später“ als Standard – der **Marktstart** soll mit **Schicht B** (Gamification) erfolgen, soweit vereinbart. |
| **K2** | Echte Galerie unverändert: keine Gamification am Kern ohne Anordnung ([GAMIFICATION-OEK2.md](./GAMIFICATION-OEK2.md)). |

---

## Plan B – absolute Notlösung (ohne sichtbare Gamification)

**Nur** wenn Schicht B einen **Showstopper** liefert (z. B. schwerer Bug, der den Start blockiert) und **kein** schneller Fix möglich ist.

| | |
|--|--|
| **Maßnahme** | Schicht-B-Elemente **ausblenden** (später: ein Flag nur für **Darstellung**) oder **gezielter Revert** der betroffenen Gamification-Commits. |
| **Kern** | **Schicht A** bleibt voll nutzbar – dieselben Buttons, Speichern, Veröffentlichen, Admin ([GAMIFICATION-OEK2.md](./GAMIFICATION-OEK2.md) §2). |
| **Klarstellung** | Plan B ist **kein** regulärer Startmodus und **keine** Absage an Gamification – nur der **Rettungsanker**, damit der Betrieb nicht hängen bleibt. |

---

## Bereits umgesetzt (Baseline)

| Ort | Inhalt |
|-----|--------|
| Admin → Eventplan → **Öffentlichkeitsarbeit** | Hero + **Fortschritt X/4** (reale Daten) |
| Admin → **Presse & Medien** | Hero + **Fortschritt X/4** (reale Daten) |
| Admin → **Design** (Galerie gestalten), nur **ök2/VK2** | Gleiche Bildsprache (Hero-SVG) + **Fortschritt X/4**: Willkommensbild, Galerie-Karte, Virtueller Rundgang (Bild/Video), Texte vs. **Baseline** (`getGaleriePageTextsBaseline`) – nur Lesen/Anzeige |

Diese Bausteine **nicht** ohne Grund umbauen; Verfeinerungen nur in späteren Phasen und nur wenn [GAMIFICATION-OEK2.md](./GAMIFICATION-OEK2.md)-Checkliste grün ist.

---

## Phase 0 – vorsichtig bis zum Markt (kein Stopp)

| | |
|--|--|
| **Ziel** | Marktfähige ök2-Experience **mit** Gamification (Baseline + vereinbarte Bausteine); **ohne** riskante Experimente an Kern und kritischen Abläufen. |
| **Erlaubt** | Gezielte, kleine Erweiterungen von Schicht B in ök2; Bugfixes; Doku; bestehende X/4 stabil halten und verbessern. |
| **Verboten** | „Großer Wurf“ ohne Tests; Änderungen an [KRITISCHE-ABLAEUFE.md](./KRITISCHE-ABLAEUFE.md) nur wenn nötig und separat geprüft. |
| **Notfall** | Wenn nötig: **Plan B** (oben) – nur als **absolute Notlösung**. |

**Übergang Phase 1:** sobald der Marktstart erfolgt ist, können **zusätzliche** Bausteine (siehe Phase 1) **weiter vorsichtig** dazukommen – nicht „erst nach Jahren“, sondern **schrittweise** mit gleicher Sorgfalt.

---

## Phase 1 – zusätzliche Bausteine: niedrigstes Risiko

**Prinzip:** Nur **Lesen** vorhandener Daten / State → **Anzeige** (Ampel, Häkchen, Balken). **Kein** neuer Speicherpfad, **kein** Filter+`setItem`, **keine** Pflichtklicks.

| Priorität | Bereich | Warum diese Reihenfolge |
|-----------|---------|---------------------------|
| **1** | **Guide / Onboarding** (kontextgebunden, kein globaler schwarzer Dialog) | „**Vom ersten Zugang an**“: **Ist-Stand ab 20.03.26** – schwarzer Vollbild-`GlobaleGuideBegleitung` ist **aus** (Stub); Orientierung läuft über **grünen Admin-Balken** (ök2/VK2, `guideFlowAktiv` + `k2-guide-flow` in `k2GuideFlowStorage.ts`), **ohne** zweites Hub-UI. Shop/Kasse ohne diesen Flow; **/mein-bereich** kann den Flow starten. *Hinweis:* Frühere Planzeile „Overlay wieder aktiv / selber Dialog“ bezog sich auf den schwarzen Global-Guide – **veraltet**, Strategie siehe `guide-nahtlos-begleitung.mdc`. |
| **2** | **Galerie gestalten** (Schritte / Häkchen aus vorhandenen Keys) | Nutzer sehen „was fehlt noch“, ohne neuen Workflow. **Umgesetzt:** Design-Tab, ök2/VK2 (`ScreenshotExportAdmin`), siehe Baseline-Tabelle oben. |
| **3** | **Werke verwalten** (Ampel nur **Anzeige**: fehlendes Bild/Preis) | Hoher Nutzen in der Demo; technisch nur UI über bestehende Liste – **niemals** automatisch bereinigen oder schreiben. |

**Definition of Done (Phase 1)**  
- [ ] Ohne Schicht B: alle Aktionen wie heute erreichbar.  
- [ ] Nur `musterOnly` / ök2-Admin / öffentliche Keys – **K2-Kern** unberührt.  
- [ ] Kein Auto-Reload, kein Druck-Text ([code-5-crash-kein-auto-reload.mdc](../.cursor/rules/code-5-crash-kein-auto-reload.mdc)).  
- [ ] Kontrast heller Admin-Hintergrund ok ([ui-kontrast-leserbarkeit.mdc](../.cursor/rules/ui-kontrast-leserbarkeit.mdc)).  
- [ ] **Ein Erlebnis:** Guide/Begleitung und Fortschritt **nicht** als zwei konkurrierende Haupt-Elemente; **Vereinheitlichung** nach [GAMIFICATION-OEK2.md](./GAMIFICATION-OEK2.md) §2.  
- [ ] Ein Baustein = ein PR; bei Problemen **revert** möglich.

---

## Phase 2 – wenn Phase 1 unauffällig läuft

**Prinzip:** Etwas mehr **Führung**, weiterhin **optional** und **ohne** Kern zu verbiegen.

| Priorität | Bereich | Hinweis |
|-----------|---------|---------|
| **1** | **Events** (Tab): Checkliste / „Nächstes Event“-Karte | Nur Hinweise; kein Blockieren von Speichern. |
| **2** | **Newsletter-Tab** | Erfolgsanzeige (z. B. Empfänger-Zahl), kein neuer Versandweg in der App. |
| **3** | **Veröffentlichen / Stand** | Nur **Badge/Hinweis** „Stand passt“ – **kein** automatischer Reload (Regel Stand/QR bleibt). |

**Definition of Done:** wie Phase 1, plus: keine neuen Abhängigkeiten zu Stripe/Lizenzen ohne extra Review.

---

## Phase 3 – optional, nach Erfahrung

| Bereich | Hinweis |
|---------|---------|
| **VK2** „Vereinsprofil komplett“ | Nur nach **expliziter** Entscheidung Georg; eigener Kontext, [GAMIFICATION-OEK2.md](./GAMIFICATION-OEK2.md) §1. |
| **Kassa / Shop (Demo)** | Nur ök2-Übungsszenario, **nicht** K2-Echtbetrieb nerven. |
| **Einstellungen / Backup** | Status „letztes Backup“ als **Info**, kein Ersatz für die drei Backup-Buttons ([KRITISCHE-ABLAEUFE.md](./KRITISCHE-ABLAEUFE.md) §11). |
| **mök2** | Lesepfade für Piloten, **kein** Spiel-Mechanik. |

---

## Umkehr / Sorgfalt (für alle Phasen)

1. **Kleine Commits** pro Baustein – bei Bedarf `git revert` eines Commits.  
2. **Später:** ein Schalter nur für **Darstellung** Schicht B (öff. Config) – bis dahin Code so schreiben, als ob der Schalter schon da wäre (siehe [GAMIFICATION-OEK2.md](./GAMIFICATION-OEK2.md) §3).  
3. **Stressfall:** Zuerst **Bugfix**; **Plan B** (Schicht B aus) nur wenn wirklich **Not** – nicht als Dauerzustand planen.

---

## Kurzfassung

| | Inhalt |
|--|--------|
| **Normal** | Markt mit **Gamification** in ök2 (Baseline + Vereinbartes); **weiter** mit **Vorsicht**. |
| **Plan B** | Nur **absolute Notlösung:** Schicht B aus / Revert – Kern bleibt bedienbar. |
| **Phase 0** | Bis Markt: **vorsichtig** bauen, **nicht** einfrieren. |
| **Phase 1** | Zusätzlich: Guide → Galerie gestalten → Werke-Ampel (**nur Anzeige**) |
| **Phase 2** | Wenn Phase 1 gut läuft: Events, Newsletter, Stand-Hinweis (**ohne Auto-Reload**) |
| **Phase 3** | Optional: VK2, Demo-Kassa, Backup-Info, mök2 |

**Mut voran – mit Sorgfalt, Plan B nur im Notfall.** 💚
