# ✅ Nächster Schritt: Als Login-Item einrichten

## 🎯 Script funktioniert im Terminal - jetzt einrichten!

Da das Script im Terminal funktioniert, müssen wir es jetzt als **Login-Item** einrichten, damit es beim Mac-Neustart automatisch startet.

---

## ✅ SCHRITT 1: Automatisch einrichten (empfohlen)

**Im Terminal:**

```bash
cd ~/k2Galerie
./scripts/k2-autostart-einrichten.sh
```

**Was passiert:**
- ✅ Dialog erscheint: "K2 Terminal Autostart wurde eingerichtet!"
- ✅ Script ist jetzt als Login-Item eingetragen
- ✅ Fertig!

---

## ✅ SCHRITT 2: Manuell einrichten (falls automatisch nicht funktioniert)

**1. Systemeinstellungen öffnen**
- Apple-Menü (🍎 oben links) → **Systemeinstellungen**

**2. Benutzer & Gruppen**
- Klicke auf **"Benutzer & Gruppen"**

**3. Login-Items**
- Klicke auf Tab **"Login-Items"** (oben)
- Falls gesperrt: 🔒 unten links → Passwort eingeben

**4. Item hinzufügen**
- Klicke auf **"+"** (Plus-Button unten links)
- Im Finder: Navigiere zu `k2Galerie` → `scripts`
- Wähle: **`k2-terminal-autostart.sh`**
- Klicke **"Hinzufügen"**

**5. Fertig!**
- ✅ Du siehst "k2-terminal-autostart.sh" in der Liste

---

## ✅ SCHRITT 3: Testen

**Mac neu starten:**
- Apple-Menü → **Neu starten**

**Nach dem Neustart:**
1. ✅ Terminal öffnet sich automatisch
2. ✅ Server startet automatisch im Terminal
3. ⏳ Warte 10 Sekunden
4. ✅ Browser öffnen: `http://127.0.0.1:5177/`

**Siehst du K2 Plattform?** → ✅ **PERFEKT!**

---

## 💡 Zusammenfassung:

1. ✅ Script getestet → Funktioniert!
2. ⏳ Als Login-Item einrichten (nächster Schritt)
3. ⏳ Mac neu starten zum Testen

---

## 🛑 Falls Login-Item nicht funktioniert:

**Prüfe ob es eingetragen ist:**
- Systemeinstellungen → Benutzer & Gruppen → Login-Items
- Ist "k2-terminal-autostart.sh" in der Liste?

**Falls nicht:**
- Versuche manuelle Methode (Schritt 2)

---

## ✅ Das war's!

Nach dem Einrichten als Login-Item startet alles automatisch beim Mac-Neustart! 💚
