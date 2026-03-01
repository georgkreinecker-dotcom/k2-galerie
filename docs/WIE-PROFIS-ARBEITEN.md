# Wie Profis arbeiten – damit es funktioniert

**Kurz:** Was erfahrene Teams anders machen, damit der Editor stabil bleibt und die Arbeit flüssig läuft.

---

## 1. Kleine Dateien statt Monolithen

- **Pro:** Eine Datei = eine Verantwortung, typisch 200–500 Zeilen. Große Dateien (1000+) werden aufgeteilt.
- **Warum:** Editor und TypeScript müssen bei jedem Speichern die ganze Datei parsen. 17.000 Zeilen = 17.000 Zeilen jedes Mal. Kleine Dateien = weniger Last, weniger Crashes, bessere Performance.
- **Bei uns:** ScreenshotExportAdmin ist gewachsen wie ein Monolith. Jede neue Funktion in eine **eigene Komponente** auslagern (z. B. Bildbereich, Zuschnitt-Button, Modal) entlastet die Riesen-Datei.

## 2. App läuft im Browser, nicht im Editor

- **Pro:** `npm run dev` → App in Chrome/Safari. Im Editor nur Code bearbeiten, kein eingebettetes Preview.
- **Warum:** IDE-Preview (iframe/Electron) ist oft instabil. Getrennt = Editor kann crashen, die App läuft weiter; oder umgekehrt.
- **Bei uns:** Du machst das schon – App auf eigenem Server/Browser. Cursor nur Editor + Terminal + Chat.

## 3. Weniger „immer geladener“ Kontext

- **Pro:** Nur das Nötigste immer im Kontext (z. B. eine kurze Projekt-Regel). Rest nach Bedarf laden („lies Datei X wenn du Feature Y änderst“).
- **Warum:** Riesiger Kontext (z. B. 50+ Regeln bei jeder Anfrage) = mehr Speicher, mehr Latenz, mehr, was schiefgehen kann.
- **Bei uns:** Viele Rules mit `alwaysApply: true`. Sinnvoll: Kern auf 5–10 Regeln reduzieren, Rest in Doku/Index „bei Bedarf lesen“.

## 4. Stabile Toolchain, selten wechseln

- **Pro:** Editor und Build einmal einrichten, dann durcharbeiten. Keine Experimente mitten im Projekt.
- **Warum:** Jeder Wechsel (neues Plugin, neuer Mode) kann neue Absturzquellen einführen.
- **Bei uns:** Wenn Cursor trotz kleiner Dateien und wenig Kontext dauerhaft Code 5 wirft → Wechsel zu VS Code (gleiches Projekt, weniger „alles in einem“) ist ein professioneller Zug.

## 5. Ein Schritt, dann speichern/committen

- **Pro:** Kleine, abgeschlossene Änderungen. Speichern. Kurz testen. Committen. Nächster Schritt.
- **Warum:** Große ungespeicherte Blöcke + Crash = viel verloren. Kleine Schritte = wenig Risiko.
- **Bei uns:** Passt zu „FERTIG = getestet + committed“ und zu DIALOG-STAND (nächster Schritt klar).

---

## Kurzfassung

| Profi-Praxis           | Nutzen                          |
|------------------------|----------------------------------|
| Kleine Dateien/Module  | Weniger Last, weniger Crashes   |
| App im Browser         | Editor-Stabilität getrennt       |
| Weniger Always-On-Kontext | Schneller, weniger Speicher  |
| Stabile Tools          | Weniger Überraschungen          |
| Kleine Schritte        | Weniger Verlust bei Crash       |

**Konkret bei K2:** Zuschnitt und Bildbereich in eigene Komponenten auslagern (bereits begonnen), Regelwerk auf Kern reduzieren, bei anhaltendem Code 5 Wechsel auf VS Code einplanen.

---

## So arbeiten wir bei K2 (verbindlich)

| Nr. | Regel | Konsequenz |
|-----|--------|------------|
| 1 | **Kleine Dateien** | Neue Features in eigene Komponenten (z. B. AdminBildZuschneidenButton). ScreenshotExportAdmin nicht weiter aufblähen. |
| 2 | **App im Browser** | Cursor nur Editor + Terminal + Chat. App immer unter localhost im Browser testen. |
| 3 | **Kleine Schritte** | Eine Sache erledigen → speichern → ggf. testen → committen. Keine Riesen-Blöcke ungespeichert lassen. |
| 4 | **FERTIG = getestet + committed** | Keine Aufgabe „fertig“ nennen ohne Commit (+ Push). DIALOG-STAND mit nächstem Schritt pflegen. |
| 5 | **Bei Code 5** | CODE-5-WAS-GEAENDERT-WURDE.md und CRASH-BEREITS-GEPRUEFT lesen. Nicht dieselben Checks wiederholen. Wenn Cursor dauerhaft instabil: Wechsel zu VS Code einplanen. |

Diese fünf Punkte gelten ab jetzt für jede Session. KI und Georg orientieren sich daran.
