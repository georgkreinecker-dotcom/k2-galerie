# Cmd+Shift+R → nur Text?

## Was passiert

Wenn du **Cmd+Shift+R** drückst und nur **Text** siehst (statt der Galerie), kann das zwei Gründe haben:

---

### 1. Du bist in **Cursor** (Preview / eingebetteter Browser)

In Cursor ist **Cmd+Shift+R** oft **kein** „Seite neu laden“, sondern ein **Editor-Shortcut** (z.B. „Replace in Files“ oder „Run“). Dann öffnet sich ein Textfeld oder eine Textausgabe – deshalb „nur Text“.

**Lösung:**

- Galerie **nicht** in Cursor-Preview testen.
- **Browser** öffnen (Safari oder Chrome) und gehen zu: **`http://localhost:5178/`**
- Dort mit **Cmd+R** oder dem Reload-Button neu laden.
- Für **Hard Refresh** (Cache leeren): Cmd+Shift+R **im Browser** drücken, nicht in Cursor.

---

### 2. Du bist im **Browser** und machst Hard Refresh (Cmd+Shift+R)

Im Browser bedeutet **Cmd+Shift+R** = Hard Refresh (Cache umgehen). Wenn danach **nur Text** angezeigt wird:

- Oft ist die **falsche Version** der Seite deployed (z.B. nur Text/HTML ohne funktionierende App).
- Oder die Seite war vorher aus dem Cache und nach dem Hard Refresh kommt die kaputte Version vom Server.

**Lösung:**

- Zuerst **normales Neuladen** probieren: **Cmd+R** (ohne Shift).
- Wenn es nur bei Cmd+Shift+R passiert: Deployment prüfen (richtiger **`dist`**-Ordner? Siehe `UPLOAD-NUR-TEXTSEITE-FIX.md`).
- Lokal testen: `http://localhost:5178/` im Browser öffnen, dann Cmd+Shift+R – wenn es dort funktioniert, liegt das Problem am Deployment.

---

## Kurz

| Wo du Cmd+Shift+R drückst | Ergebnis „nur Text“ | Was tun |
|---------------------------|---------------------|--------|
| **In Cursor**             | Anderer Shortcut → Textfeld/Log | Im **Browser** testen (localhost:5178), dort Cmd+R oder Cmd+Shift+R |
| **Im Browser**            | Hard Refresh lädt kaputte Version | Cmd+R probieren; Deployment prüfen (nur `dist` hochladen) |

**Empfehlung:** Galerie immer im **externen Browser** testen, nicht in Cursor-Preview.
