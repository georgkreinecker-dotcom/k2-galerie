# 🔍 Browser-Konsole richtig öffnen

## ⚠️ WICHTIG: Nicht Google suchen!

Die Console-Befehle sind **nicht** für Google-Suche!
Sie sind für die **Browser-Konsole** (Entwicklertools)!

---

## 📋 Schritt-für-Schritt: Browser-Konsole öffnen

### Schritt 1: App im Browser öffnen

1. **Öffne deine App:** 
   - Lokal: `http://localhost:5177`
   - Oder: Deine Vercel-URL

2. **App sollte sichtbar sein** (Galerie-Vorschau oder Admin)

---

### Schritt 2: Entwicklertools öffnen

**Mac:**
- **Cmd + Option + I** (I wie "Inspect")
- Oder: **Cmd + Option + J** (J wie "JavaScript Console")

**Windows:**
- **F12**
- Oder: **Ctrl + Shift + I**

---

### Schritt 3: Was du sehen solltest

Nach dem Öffnen siehst du:
- **Unten oder rechts:** Ein Panel mit Tabs
- **Tab "Console"** → Hier sind die Logs!
- **Tab "Elements"** → HTML-Code
- **Tab "Network"** → Netzwerk-Requests

**Wichtig:** Du musst auf **"Console"** Tab klicken!

---

### Schritt 4: Console-Befehle eingeben

1. **Klicke auf "Console" Tab**
2. **Unten siehst du:** Ein Eingabefeld mit `>` Zeichen
3. **Tippe ein:**

```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
```

4. **Enter drücken**
5. **Du solltest sehen:** Die URL wird ausgegeben

---

## 💡 Falls es nicht funktioniert:

**Problem:** Konsole öffnet sich nicht?
- **Lösung:** Versuche andere Tastenkombination
- **Mac:** Cmd+Option+I oder Cmd+Option+J
- **Windows:** F12 oder Ctrl+Shift+I

**Problem:** Siehst du kein Console-Tab?
- **Lösung:** Entwicklertools-Panel ist vielleicht minimiert
- **Lösung:** Klicke auf "Console" Tab oben im Panel

**Problem:** Eingabefeld nicht sichtbar?
- **Lösung:** Scroll nach unten im Console-Panel
- **Lösung:** Oder: Klicke in das Console-Panel

---

## 📋 Alternative: .env Datei prüfen

Falls Browser-Konsole zu kompliziert ist, prüfe einfach die `.env` Datei:

**Wo ist die .env Datei?**
- Im Projektordner: `/Users/georgkreinecker/k2Galerie/.env`
- In Cursor: Links in Sidebar → `.env` suchen

**Was sollte drin stehen?**

```bash
VITE_SUPABASE_URL=https://sjqyeqnibwyxtwzcqklj.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_fa6tMCbi4g40m9XiyVUpBA__tpyb9h4
```

**Prüfen:**
- Sind beide Zeilen ausgefüllt?
- Beginnt URL mit `https://`?
- Ist Key lang (beginnt mit `sb_publishable_`)?

---

## 🎯 Einfachste Methode:

**Statt Browser-Konsole:** Öffne einfach die `.env` Datei in Cursor und prüfe ob sie ausgefüllt ist!
