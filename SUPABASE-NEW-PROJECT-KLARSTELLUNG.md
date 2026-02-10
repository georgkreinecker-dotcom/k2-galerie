# ✅ Supabase: Neues Projekt erstellen - Klarstellung

## 💡 Wichtig: Pricing Plan kommt automatisch!

**Das ist normal!** Supabase zeigt das Pricing Plan **nicht** beim Erstellen - es ist automatisch auf **"Free"** wenn du in einer Free-Organisation bist.

---

## 📋 Schritt-für-Schritt: Neues Projekt erstellen

### Schritt 1: Projekt-Details ausfüllen

1. **Im Supabase Dashboard:**
   - Klicke **"New Project"** (oben rechts)
   - Du siehst das Formular

2. **Ausfüllen:**
   - **Name:** `k2-galerie-test` (oder ähnlich)
   - **Database Password:** 
     - Wähle ein sicheres Passwort
     - **WICHTIG:** Notiere dir das Passwort!
   - **Region:** `Frankfurt` (oder nächstgelegene)
   - **Organization:** `georgkreinecker-dotcom's Org` (sollte automatisch ausgewählt sein)

3. **WICHTIG:** 
   - ✅ **KEIN** "Pricing Plan" Feld sichtbar? → **Das ist normal!**
   - ✅ Wenn du in einer Free-Organisation bist → Projekt wird automatisch kostenlos
   - ✅ Pricing Plan wird erst **nach** dem Erstellen angezeigt (oder ist automatisch Free)

---

### Schritt 2: Projekt erstellen

1. **Klicke:** **"Create new project"** (grüner Button unten rechts)

2. **Warte:**
   - Projekt wird erstellt (2-3 Minuten)
   - Du siehst einen Fortschrittsbalken

3. **Nach dem Erstellen:**
   - Projekt öffnet sich automatisch
   - Oder: Du siehst es in deiner Projekte-Liste
   - ✅ Projekt ist **automatisch kostenlos** (Free Plan)

---

### Schritt 3: Prüfen ob Projekt kostenlos ist

1. **Im Projekt-Dashboard:**
   - Links: **Settings** (Zahnrad)
   - Klicke: **"General"** oder **"Billing"**
   - Du solltest sehen: **"Free Plan"** oder **"Free Tier"**
   - ✅ Bestätigt: Projekt ist kostenlos!

---

## ⚠️ Falls Fehler kommt:

**"Cannot create free project - limit reached":**
→ Du musst zuerst ein bestehendes Projekt löschen/pausieren
→ Siehe: `SUPABASE-LIMIT-LOESEN.md`

**"Services restricted":**
→ Das betrifft die Organisation, nicht das neue Projekt
→ Neues Projekt sollte trotzdem funktionieren (hat eigenes Kontingent)

---

## ✅ Nach erfolgreichem Erstellen:

Dann folgen die normalen Setup-Schritte:

1. **API-Keys kopieren** (Settings → API)
2. **.env ausfüllen** (URL + Key)
3. **Migration ausführen** (SQL Editor)
4. **Edge Function deployen** (Edge Functions)
5. **Vercel Environment-Variablen** setzen

Siehe: `KOSTENLOS-TESTEN-ANLEITUNG.md`

---

## 💡 Zusammenfassung:

- ✅ **KEIN** Pricing Plan Feld beim Erstellen? → **Normal!**
- ✅ Projekt wird automatisch kostenlos (Free Plan)
- ✅ Einfach Name, Passwort, Region ausfüllen
- ✅ "Create new project" klicken
- ✅ Warten 2-3 Minuten
- ✅ Fertig!
