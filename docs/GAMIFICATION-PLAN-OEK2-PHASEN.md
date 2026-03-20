# Gamification ök2 – Phasenplan (analysiert, umkehrbar)

**Stand:** 20.03.26 · **Geltung:** nur **ök2** (Demo). **Leitlinien:** [GAMIFICATION-OEK2.md](./GAMIFICATION-OEK2.md) · **Ideen-Katalog:** [GAMIFICATION-POTENTIALE-K2.md](./GAMIFICATION-POTENTIALE-K2.md)

**Ziel dieses Plans:** Klare **Reihenfolge**, **Risiko-Stufen** und **Umkehr** (kein großer Knopf ohne Rückweg). Kurz vor Markteintritt: **Phase 0** strikt einhalten.

---

## Bereits umgesetzt (Baseline)

| Ort | Inhalt |
|-----|--------|
| Admin → Eventplan → **Öffentlichkeitsarbeit** | Hero + **Fortschritt X/4** (reale Daten) |
| Admin → **Presse & Medien** | Hero + **Fortschritt X/4** (reale Daten) |

Diese Bausteine **nicht** ohne Grund umbauen; Verfeinerungen nur in späteren Phasen und nur wenn [GAMIFICATION-OEK2.md](./GAMIFICATION-OEK2.md)-Checkliste grün ist.

---

## Phase 0 – bis Markteintritt stabil

| | |
|--|--|
| **Ziel** | **Kein Risiko:** keine neuen Gamification-Features im Code. |
| **Erlaubt** | Bugfixes, Doku, Texte; bestehende X/4 nur reparieren wenn etwas **kaputt** ist. |
| **Verboten** | Neue Tabs/Helden/Fortschritts-UI „nebenbei“; Änderungen an kritischen Abläufen ([KRITISCHE-ABLAEUFE.md](./KRITISCHE-ABLAEUFE.md)). |
| **Umkehr** | Nicht nötig – nichts Neues. |

**Freigabe Phase 1:** erst wenn ihr **bewusst** sagt: Markt / Demo ist stabil genug für kleine UX-Schicht B.

---

## Phase 1 – nach Freigabe: niedrigstes Risiko

**Prinzip:** Nur **Lesen** vorhandener Daten / State → **Anzeige** (Ampel, Häkchen, Balken). **Kein** neuer Speicherpfad, **kein** Filter+`setItem`, **keine** Pflichtklicks.

| Priorität | Bereich | Warum diese Reihenfolge |
|-----------|---------|---------------------------|
| **1** | **Guide / Onboarding** (GlobaleGuideBegleitung, ök2-Einstieg) | Entspricht „**vom ersten Zugang an**“ – größter Orientierungsgewinn, Kern bleibt parallel nutzbar. |
| **2** | **Galerie gestalten** (Schritte / Häkchen aus vorhandenen Keys) | Nutzer sehen „was fehlt noch“, ohne neuen Workflow. |
| **3** | **Werke verwalten** (Ampel nur **Anzeige**: fehlendes Bild/Preis) | Hoher Nutzen in der Demo; technisch nur UI über bestehende Liste – **niemals** automatisch bereinigen oder schreiben. |

**Definition of Done (Phase 1)**  
- [ ] Ohne Schicht B: alle Aktionen wie heute erreichbar.  
- [ ] Nur `musterOnly` / ök2-Admin / öffentliche Keys – **K2-Kern** unberührt.  
- [ ] Kein Auto-Reload, kein Druck-Text ([code-5-crash-kein-auto-reload.mdc](../.cursor/rules/code-5-crash-kein-auto-reload.mdc)).  
- [ ] Kontrast heller Admin-Hintergrund ok ([ui-kontrast-leserbarkeit.mdc](../.cursor/rules/ui-kontrast-leserbarkeit.mdc)).  
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
3. **Stop-Regel:** Wenn Markt oder Support stressen → zurück auf **Phase 0** für Gamification, bis wieder Luft ist.

---

## Kurzfassung

| Phase | Wann | Was |
|-------|------|-----|
| **0** | Jetzt bis stabiler Start | **Kein** neuer Gamification-Code |
| **1** | Nach Freigabe | Guide → Galerie gestalten → Werke-Ampel (**nur Anzeige**) |
| **2** | Wenn Phase 1 gut läuft | Events, Newsletter, Stand-Hinweis (**ohne Auto-Reload**) |
| **3** | Optional | VK2, Demo-Kassa, Backup-Info, mök2 |

**Mut voran – mit Sorgfalt und Rückweg.** 💚
