# ❌ SQL Fehler lösen - Dateipfad statt Inhalt!

## 🚨 Problem:

Du hast den **Dateipfad** in den SQL Editor eingefügt:
```
supabase/migrations/001_create_artworks_table.sql
```

Das ist **falsch**! Du musst den **INHALT** der Datei kopieren, nicht den Pfad!

---

## ✅ Lösung: Inhalt der Datei kopieren

### Schritt 1: SQL-Datei öffnen

1. **Auf deinem Mac:**
   - Finder öffnen
   - Gehe zu: `/Users/georgkreinecker/k2Galerie`
   - Öffne Ordner: `supabase` → `migrations`
   - Öffne Datei: `001_create_artworks_table.sql`
   - **ODER:** In Cursor: Links in Sidebar → `supabase/migrations/001_create_artworks_table.sql` öffnen

### Schritt 2: Alles markieren und kopieren

1. **In der SQL-Datei:**
   - Markiere **ALLES** (Cmd+A)
   - Kopiere (Cmd+C)
   - Du solltest den SQL-Code sehen (CREATE TABLE, etc.)

### Schritt 3: In SQL Editor einfügen

1. **Zurück zu Supabase Dashboard:**
   - Im SQL Editor: **Alles löschen** (was da steht)
   - Einfügen (Cmd+V)
   - Du solltest jetzt den SQL-Code sehen, nicht den Dateipfad!

### Schritt 4: Ausführen

1. **Klicke:** **"Run"** Button (grün, oben rechts)
   - Oder: Cmd+Enter
   - ✅ Sollte "Success" anzeigen!

---

## 📋 Was du sehen solltest:

**RICHTIG** (SQL-Code):
```sql
-- K2 Galerie: Artworks Tabelle
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT UNIQUE NOT NULL,
  ...
```

**FALSCH** (Dateipfad):
```
supabase/migrations/001_create_artworks_table.sql
```

---

## 💡 Tipp:

**Wenn du die Datei nicht findest:**
- In Cursor: Links in Sidebar → `supabase` → `migrations` → `001_create_artworks_table.sql`
- Im Finder: k2Galerie → supabase → migrations → 001_create_artworks_table.sql

**Dann:** Alles kopieren (Cmd+A, Cmd+C) → In SQL Editor einfügen (Cmd+V) → Run!
