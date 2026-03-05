# Code 5 – bei Cursor dringend eskalieren

**Zweck:** Das Code-5-Problem (Cursor/Electron-Absturz beim Arbeiten) **bei Cursor als dringend melden**, damit es auf der Agenda ist und nicht nur wir Workarounds bauen.

---

## Wohin melden

- **Cursor Forum:** https://forum.cursor.com (Bug Reports / Issues)
- **Cursor Feedback:** In Cursor: Help → Submit Feedback (oder Feedback-Button)
- **Cursor Support:** falls du einen Support-Kanal hast (z. B. über Account/Pro)

Am besten **Forum + Feedback** – damit es sichtbar und nachverfolgbar ist.

---

## Text zum Kopieren (Englisch – an Cursor senden)

**Subject / Titel:**  
**Urgent: Repeated window crash (Code 5) during normal AI-assisted coding – Preview + file writes**

**Body:**

I'm experiencing repeated "window terminated unexpectedly (reason: crashed, code: 5)" crashes when using Cursor for normal development (React/TypeScript/Vite project). This blocks productive work and forces constant reopens.

**When it happens:**
- Using the built-in Preview (app runs in iframe) while the AI makes code changes or writes files
- After the AI writes multiple files or a long response is rendered
- Often within milliseconds of a single trigger (e.g. one file write → watcher/HMR → crash)

**What I've already tried (workarounds):**
- Closing Preview and running the app only in an external browser (helps a lot but is a workaround)
- Starting Cursor with `--disable-gpu` (recommended in the forum)
- Keeping AI responses short after "reopen", avoiding script runs that write files at the end of each turn
- `files.autoSave: off`, watcherExclude for generated/build folders

**Impact:** I have to reopen many times during a single feature (e.g. 10+ times). The AI cannot detect that a crash occurred, so I have to type "continue" again and again. This is not sustainable.

**Request:** Please treat Code 5 as a high-priority stability issue: either fix the underlying cause (Preview/Electron under load, file watcher + HMR spikes) or clearly document the limitation and recommend the minimal stable setup (e.g. "Preview not recommended for projects that trigger frequent file writes or large UI").

Thank you.

---

## Kurzfassung (für dich)

Wir fordern Cursor auf: Code 5 **priorisiert zu bearbeiten** (Ursache in Preview/Electron/Watcher) oder die **Einschränkung offiziell zu dokumentieren** und eine klare, stabile Empfehlung zu geben. Damit das Thema nicht nur bei uns liegt.

**Nächster Schritt:** Text oben kopieren, im Cursor-Forum (oder Feedback) einreichen – am besten mit Betreff „Urgent“ bzw. „Code 5“.
