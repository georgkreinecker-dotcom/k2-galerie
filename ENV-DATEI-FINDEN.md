# 📁 .env Datei finden und öffnen

## 📍 Wo ist die .env Datei?

Die `.env` Datei liegt **im Hauptordner** deines Projekts:

```
/Users/georgkreinecker/k2Galerie/.env
```

Oder einfacher:
```
k2Galerie → .env
```

---

## 🔍 So findest du sie:

### Methode 1: Im Finder

1. **Finder öffnen** (Cmd+Space → "Finder")
2. **Gehe zu:** `/Users/georgkreinecker/k2Galerie`
   - Oder: Cmd+Shift+G → Pfad eingeben
3. **Wichtig:** `.env` Dateien sind **versteckt** (beginnen mit Punkt)
4. **Im Finder:** Cmd+Shift+. (Punkt) drücken → zeigt versteckte Dateien
5. **Suche:** `.env` Datei
6. **Doppelklick** → öffnet in TextEditor

---

### Methode 2: In Cursor (empfohlen)

1. **Cursor öffnen** (falls nicht offen)
2. **File** → **Open Folder** → Wähle `k2Galerie`
3. **Links in der Sidebar:** Suche nach `.env`
   - Falls nicht sichtbar: Cmd+Shift+. (Punkt) drücken
4. **Klicke auf `.env`** → öffnet im Editor

---

### Methode 3: Terminal

1. **Terminal öffnen** (Cmd+Space → "Terminal")
2. **Befehl eingeben:**
   ```bash
   cd ~/k2Galerie
   open -a TextEdit .env
   ```
   Oder mit Cursor:
   ```bash
   cd ~/k2Galerie
   cursor .env
   ```

---

## ✏️ .env Datei ausfüllen

Die Datei sollte so aussehen:

```bash
# Supabase Configuration
# Kopiere diese Datei zu .env und fülle die Werte aus

# Supabase Project URL (aus Dashboard → Settings → API)
VITE_SUPABASE_URL=https://dein-projekt.supabase.co

# Supabase Anon Key (aus Dashboard → Settings → API)
VITE_SUPABASE_ANON_KEY=dein-anon-key-hier

# WICHTIG: .env ist in .gitignore - niemals committen!
```

**Ersetze:**
- `https://dein-projekt.supabase.co` → Deine Project URL aus Supabase
- `dein-anon-key-hier` → Dein anon key aus Supabase

**Dann speichern:** Cmd+S

---

## 🆘 Falls .env nicht existiert:

Die Datei sollte bereits existieren. Falls nicht:

1. **Erstelle neue Datei:** `.env` (im Hauptordner)
2. **Füge diesen Inhalt ein:**

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key-hier
```

3. **Speichern**

---

## 💡 Tipp:

**Am einfachsten:** In Cursor öffnen
- Cursor → File → Open Folder → k2Galerie
- Links: `.env` Datei suchen
- Klicken → öffnet im Editor
- URL und Key eintragen
- Speichern (Cmd+S)
