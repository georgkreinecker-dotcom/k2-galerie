# 📧 Feedback-Vorlage für Cursor: Reopen-Crash Problem

## 📋 Für GitHub Issues (empfohlen)

**Titel:** Frequent "Reopen" crashes on macOS - Memory/Stability Issue

**Labels:** `bug`, `crash`, `performance`, `macos`

---

### Problem Description

Cursor IDE crashes frequently with "Reopen" dialog, especially when working on larger React/TypeScript projects. This happens every 3-5 minutes during active development.

### Steps to Reproduce

1. Open Cursor IDE
2. Work on a React/TypeScript project (e.g., Vite + React)
3. Use Preview mode or work with multiple files
4. After 3-5 minutes, Cursor crashes with "Reopen" dialog

### Expected Behavior

Cursor should remain stable during normal development work without frequent crashes.

### Actual Behavior

- Cursor crashes every 3-5 minutes
- Shows "Reopen" dialog
- Work progress is lost
- Very frustrating workflow interruption

### System Information

- **OS:** macOS (darwin 22.6.0)
- **Cursor Version:** [Your version - check in Cursor → About]
- **RAM Usage:** ~1.8-2.5 GB (measured via Activity Monitor)
- **Project Type:** React + TypeScript + Vite
- **Project Size:** Medium-Large (multiple components, ~12k+ lines)

### Additional Context

- **RAM Analysis:** Cursor uses significantly more RAM than expected (1.8-2.5 GB)
- **Workaround:** Using external browser (Safari/Chrome) instead of Preview mode helps
- **Frequency:** Very frequent (every 3-5 minutes during active development)
- **Impact:** High - makes development workflow very difficult

### Possible Related Issues

- Memory leaks in Preview mode
- High RAM usage causing system instability
- Event listener cleanup issues
- Multiple processes running simultaneously

### Request

Please prioritize stability improvements, especially:
1. Memory leak fixes
2. Better crash recovery
3. More stable Preview mode
4. RAM usage optimization

---

## 📧 Für E-Mail an support@cursor.sh

**Betreff:** Frequent Crashes - Reopen Dialog Issue (macOS)

**Nachricht:**

Hallo Cursor Team,

ich nutze Cursor IDE seit einiger Zeit und bin grundsätzlich sehr zufrieden. Leider gibt es ein gravierendes Stabilitätsproblem, das meine Arbeit stark beeinträchtigt:

**Problem:**
Cursor crasht regelmäßig (alle 3-5 Minuten) mit dem "Reopen"-Dialog, besonders bei größeren React/TypeScript-Projekten.

**Details:**
- **System:** macOS (darwin 22.6.0)
- **Cursor Version:** [Ihre Version]
- **RAM-Verbrauch:** ~1.8-2.5 GB (gemessen via Activity Monitor)
- **Projekt:** React + TypeScript + Vite (mittlere bis große Projekte)
- **Häufigkeit:** Sehr häufig während aktiver Entwicklung

**Workaround:**
Ich arbeite jetzt im externen Browser (Safari/Chrome) statt im Preview-Modus - das hilft, ist aber nicht ideal.

**Bitte:**
Könnten Sie dieses Stabilitätsproblem priorisieren? Es betrifft wahrscheinlich viele Nutzer und macht die Entwicklung sehr schwierig.

Vielen Dank für Ihre Arbeit an Cursor!

Mit freundlichen Grüßen,
[Ihr Name]

---

## 💬 Für Discord (kurz)

**Nachricht:**

Hallo! Ich habe ein Stabilitätsproblem mit Cursor:

- Crashes alle 3-5 Minuten mit "Reopen"-Dialog
- macOS, React/TypeScript Projekt
- RAM-Verbrauch: ~1.8-2.5 GB
- Workaround: Externer Browser hilft

Ist das bekannt? Gibt es Pläne für Fixes?

---

## ✅ Checkliste vor dem Absenden

- [ ] Cursor-Version prüfen (Cursor → About)
- [ ] RAM-Verbrauch nochmal messen (`./check-ram.sh`)
- [ ] Screenshots machen (falls möglich)
- [ ] Konkrete Schritte dokumentieren, die zum Crash führen

---

## 📝 Zusätzliche Informationen (optional)

Falls du noch mehr Details hinzufügen möchtest:

- **Konsole-Logs:** Falls du Fehler in der Konsole siehst
- **Screenshots:** Vom "Reopen"-Dialog
- **Timing:** Wann genau passiert es? (Beim Speichern, beim Öffnen von Dateien, etc.)
- **Projekt-Details:** Größe, Anzahl Dateien, etc.

---

## 🎯 Wichtig

- **Konstruktiv bleiben:** Beschreibe das Problem sachlich
- **Details geben:** Je mehr Details, desto besser können sie helfen
- **Workarounds erwähnen:** Zeigt, dass du proaktiv bist
- **Höflich bleiben:** Entwickler arbeiten hart daran

---

**Viel Erfolg! 💚**
