# Konzept: Plattform-Rundgang für ök2 und VK2 (parallel)

**Stand:** 16.04.26  
**Zweck:** Ein gemeinsames **Konzept** und eine **parallele** Produktlinie – **kein** Ersatz für den K2-Familie-Huber-Rundgang, sondern **dieselbe Werkzeug-Idee** wie dort (bewegliche Maske, Schritte, Fokus), **angepasst** an öffentliche Demo (ök2) und Vereins-Demo (VK2).

---

## 1. Ausgangslage (kurz)

| Bereich | Aktuell |
|--------|---------|
| **K2 Familie (Muster Huber)** | Referenz: `FamilieMusterHuberLeitfaden` – Sheet, **Hover** (`data-muster-hint` + Provider), **optional Vorlesen**, **mehrere Routen**, oranges Branding, `LeitfadenSheetInner`. |
| **ök2 Muster-Galerie** | `Oek2GalerieLeitfadenModal` – ähnliche Mechanik (Backdrop durchlässig, Ziehen, Punkte, Fokus), **ohne** Hover-System, **ohne** Audio; Einstieg stark an **Entdecken / guideName / guideVisible** gebunden. |
| **VK2 (Vereins-Galerie)** | **Kein** vergleichbares Rundgang-Sheet; Besucher sehen die Galerie ohne geführte Demo-Schicht. |

**Erkenntnis:** Technisch ist ök2 schon eine „leichtere“ Variante; inhaltlich und in der **Erlebnis-Tiefe** (Hover, einheitliche Einstiege) fehlt die **gemeinsame Plattform-Linie** – und VK2 fehlt **komplett**.

---

## 2. Zielbild (gemeinsam für ök2 + VK2)

### 2.1 Eine Plattform-Architektur, zwei Demos

- **Sportwagen:** **Ein** Rundgang-**Framework** (eine Shell, eine Datenfluss-Logik für Fokus und Session), **zwei** Konfigurationen:
  - **ök2:** „**Künstler:in / Galerie / Lizenz-Demo**“ – Musterdaten nur `oeffentlich`.
  - **VK2:** „**Verein / Mitglieder / Ausstellung**“ – nur VK2-Kontext und VK2-Stammdaten.
- **Parallel entwickeln:** Gleiche Phasen (Shell → Schritte → Einstieg → optional Hover), getrennte Texte, Farben, `sessionStorage`-Keys, `data-*`-Attribute.

### 2.2 Gemeinsame Prinzipien (mit K2 Familie abgestimmt, aber nicht identisch)

| Prinzip | Umsetzung |
|--------|-----------|
| **Maske** | Vollflächiger, **klick-durchlässiger** Backdrop; nur das Sheet fängt Events. |
| **Bedienung** | Ziehen, Größe, Minimieren, Fortschritts-Punkte, Zurück / Weiter / Später / Fertig. |
| **Fokus** | Pro Schritt **sichtbarer** Bereich auf der **echten** Seite (Outline/Scroll) – bestehende Fokus-Hilfen weiterverwenden oder vereinheitlichen. |
| **Audio** | **Standard: aus** für ök2 und VK2 (Plattform-Demos). Optional später **ein** Schalter – nur wenn explizit gewünscht; **nicht** Familie-Texte 1:1 übernehmen. |
| **Hover-Hinweise** | **Optional Phase 2:** Wie Familie – **kurze** Feld-Hinweise beim Überfahren der Oberfläche – aber **eigene** Provider und **eigene** Attribute (`data-oek2-demo-hint`, `data-vk2-demo-hint`), **kein** `data-muster-hint` aus Familie wiederverwenden (Vermischung vermeiden). |

### 2.3 Nicht-Ziele

- **K2 echte Galerie** (Martina & Georg): **kein** neuer Rundgang ohne **explizite** Anordnung (eisernes Gesetz K2-Kern).
- **Keine Datenvermischung:** ök2 nur `k2-oeffentlich-*` / Muster; VK2 nur `k2-vk2-*`; **nie** K2-Stammdaten in Demo-Rundgängen für Erklärtexte, die K2 suggerieren.
- **Lizenznehmer-Instanz:** ök2/VK2-Routen nur auf **Plattform-Host** – unverändert Regel `eiserne-regel-lizenznehmer-kein-oek2-vk2.mdc`.

---

## 3. Architektur-Schichten (Zielbild)

1. **Shell-Komponente** (Name z. B. `PlattformGalerieLeitfadenShell` oder Extrakt aus `LeitfadenSheetInner` + `Oek2GalerieLeitfadenModal`):
   - Layout, Animation, Bounds, Minimieren-Chip, Punkte, Fußzeile.
   - **Theme-Props** oder Varianten: `variant="oek2" | "vk2"` (Farben: ök2 Grün-Ton vs. VK2 an Admin/mök2 anlehnen).

2. **Schritt-Definitionen** (reine Daten + Markdown):
   - `oek2GalerieLeitfadenSteps.ts` (oder beibehalten in Modul, aber klar getrennt).
   - `vk2GalerieLeitfadenSteps.ts` – Schritte z. B. Willkommen, Verein, Mitglieder-Kacheln, Galerie-Eingang, Impressum.

3. **Fokus / HTML-Attribut:**
   - Heute: ök2 eigenes Attribut über `familieLeitfadenFocus` – **Ziel:** eine **kleine** Adapter-Schicht pro Kontext (`oek2` / `vk2`), damit nicht drei parallele Welt-Attribute entstehen.

4. **Einstieg / Sichtbarkeit:**
   - **ök2:** Einheitlich definieren: z. B. Button „Rundgang“, Erstbesuch-Flag, Entdecken – **eine** klare Regel, nicht nur `guideName`.
   - **VK2:** Einstieg nur für **Besucher** (ohne Admin-Herkunft), analog zu ök2-Regeln (`fromAdminTab`, …) – Details in Umsetzungsphase.

5. **Navigation zwischen Seiten (VK2 optional):**
   - Nur wenn nötig: Schritte mit `linkTo` wie Familie – z. B. Galerie ↔ Vorschau. **Nicht** pflichten, wenn alles auf einer Seite fokussierbar ist.

---

## 4. ök2 – Inhaltliche Linie

- **Story:** „So könnte **deine** Galerie aussehen“ – Lizenz, Corporate Design, Werke, Admin ohne Programmieren.
- **Kein** Vereins-Vokabular.
- Texte und Fokus-Keys an **bestehende** Galerie-Sektionen koppeln (bereits angelegt).

---

## 5. VK2 – Inhaltliche Linie

- **Story:** „So präsentiert sich **ein Verein** mit Mitgliedern und Ausstellung“ – nicht Kunst-Galerie-Marketing, sondern **Gemeinschaft + Sichtbarkeit**.
- Schritte typischerweise: Willkommen / Vereinsname, Mitglieder oder Eingangskarten, Weg in die Werke, optional Kassa nur wenn sinnvoll, Impressum.
- **Shop/Kasse:** nur erklären, wenn im Kontext sichtbar – Regeln aus bestehendem VK2-Handbuch beachten.

---

## 6. Umsetzungsphasen (Vorschlag)

| Phase | Inhalt |
|-------|--------|
| **A** | Dieses Dokument mit Georg **abnehmen**; keine Code-Änderung zwingend. |
| **B** | Shell extrahieren oder vereinheitlichen; ök2 auf Shell umstellen **ohne** inhaltliche Regression. |
| **C** | ök2: Einstieg vereinheitlichen; optional Hover-Provider (Phase 2). |
| **D** | VK2: Schritte + Mount in `GaleriePage` bei `vk2 === true`, nur Plattform + nur Besucher-Kontext. |
| **E** | Tests (mindestens: Schritt-Array-Länge, Fokus-Key existiert im DOM) + kurze Handbuch-Zeile in k2team-handbuch oder VK2-Handbuch. |

---

## 7. Verknüpfungen

- **Referenz UX:** `FamilieMusterHuberLeitfaden.tsx`, `FamilieMusterDemoHintContext.tsx`
- **Aktuell ök2:** `Oek2GalerieLeitfadenModal.tsx`, `GaleriePage.tsx` (Mount-Bedingungen)
- **Datentrennung:** `k2-oek2-eisernes-gesetz-keine-daten.mdc`, VK2-Keys
- **Plattform nur:** `eiserne-regel-lizenznehmer-kein-oek2-vk2.mdc`

---

**Kurzfassung:** ök2 und VK2 bekommen **dieselbe Rundgang-Werkzeug-Idee** (Maske + Schritte + Fokus), **parallel** geplant und gebaut, **jeweils eigene** Texte, Keys und Optionalität (Hover/Audio). K2 Familie bleibt die **inhaltsreichere** Referenz für „alles drin“; Plattform-Demos bleiben **bewusst schlanker** und **ohne Audio-Standard**.
