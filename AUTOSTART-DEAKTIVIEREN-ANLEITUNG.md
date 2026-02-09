# 🛑 Autostart deaktivieren - Schritt für Schritt

## ✅ SCHRITT 1: Systemeinstellungen öffnen

**Methode 1:**
- Klicke auf das **Apple-Menü** (🍎 oben links)
- Klicke auf **"Systemeinstellungen"**

**Methode 2:**
- `Cmd + Leertaste` drücken
- "Systemeinstellungen" eingeben
- Enter drücken

---

## ✅ SCHRITT 2: Benutzer & Gruppen öffnen

- In den Systemeinstellungen findest du **"Benutzer & Gruppen"**
- Klicke darauf

---

## ✅ SCHRITT 3: Login-Items öffnen

- Oben siehst du mehrere Tabs (Allgemein, Passwörter, Login-Items, etc.)
- Klicke auf den Tab **"Login-Items"**

**Falls gesperrt:**
- Unten links siehst du ein **🔒 Schloss-Symbol**
- Klicke darauf
- Gib dein Passwort ein
- Klicke "Entsperren"

---

## ✅ SCHRITT 4: Login-Item finden und entfernen

**Suche nach:**
- `k2-terminal-autostart.sh`
- Oder: `K2 Terminal Autostart`

**Entfernen:**
1. **Markiere** das Item (einmal klicken)
2. Klicke auf den **"-"** Button (Minus-Button unten links)
3. **Fertig!**

---

## ✅ SCHRITT 5: Prüfen

- Das Item sollte jetzt **nicht mehr** in der Liste sein
- ✅ **Fertig!**

---

## 📸 Visuelle Hilfe:

**So sieht es aus:**

```
Systemeinstellungen
  └── Benutzer & Gruppen
      └── Tab: Login-Items
          └── Liste mit Items
              └── [k2-terminal-autostart.sh] ← Markieren
                  └── [-] Button ← Klicken zum Entfernen
```

---

## ✅ Das war's!

Ab jetzt startet Terminal + Server **NICHT mehr** automatisch beim Login.

**Mac sollte nicht mehr abstürzen!** 💚
