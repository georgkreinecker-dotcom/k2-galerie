# 🚀 EINFACHE ANLEITUNG: Terminal + Server automatisch starten

## ✅ SCHRITT 1: Script testen

**1. Terminal öffnen**
- `Cmd + Leertaste` → "Terminal" → Enter

**2. Script ausführen:**
```bash
cd ~/k2Galerie
./scripts/k2-terminal-autostart.sh
```

**3. Was passiert:**
- ✅ Terminal öffnet sich (neues Fenster)
- ✅ Server startet automatisch
- ⏳ Warte 10 Sekunden

**4. Prüfen:**
- Browser öffnen: `http://127.0.0.1:5177/`
- Siehst du K2 Plattform? → ✅ **Funktioniert!**

---

## ✅ SCHRITT 2: Als Login-Item einrichten

### Methode A: Automatisch (empfohlen)

**Im Terminal:**

```bash
cd ~/k2Galerie
./scripts/k2-autostart-einrichten.sh
```

**Was passiert:**
- ✅ Dialog erscheint: "K2 Terminal Autostart wurde eingerichtet!"
- ✅ Fertig!

---

### Methode B: Manuell

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
- Oder: Terminal → `sudo reboot`

**Nach dem Neustart:**
1. ✅ Terminal öffnet sich automatisch
2. ✅ Server startet automatisch im Terminal
3. ⏳ Warte 10 Sekunden
4. ✅ Browser öffnen: `http://127.0.0.1:5177/`

**Siehst du K2 Plattform?** → ✅ **PERFEKT!**

---

## 🛑 Autostart deaktivieren

**Systemeinstellungen** → **Benutzer & Gruppen** → **Login-Items**
- Finde "k2-terminal-autostart.sh"
- Markiere es
- Klicke **"-"** (Minus-Button)

---

## ✅ CHECKLISTE

- [ ] Script getestet → Server startet ✅
- [ ] Login-Item hinzugefügt ✅
- [ ] Mac neu gestartet ✅
- [ ] Terminal öffnet sich automatisch ✅
- [ ] Server startet automatisch ✅
- [ ] Browser zeigt K2 Plattform ✅

---

## 💡 TIPPS

**Terminal minimieren:**
- Terminal kann minimiert werden (Server läuft weiter)
- `Cmd + M` zum Minimieren

**Server stoppen:**
- Terminal öffnen
- `Ctrl + C` drücken

**Server manuell starten (falls nötig):**
```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```

---

## 🆘 FALLS ES NICHT FUNKTIONIERT

**Problem: Script startet nicht**

1. Prüfe ob Script ausführbar ist:
```bash
ls -l ~/k2Galerie/scripts/k2-terminal-autostart.sh
```

Sollte zeigen: `-rwxr-xr-x` (x = ausführbar)

2. Falls nicht ausführbar:
```bash
chmod +x ~/k2Galerie/scripts/k2-terminal-autostart.sh
```

**Problem: Terminal öffnet sich nicht beim Login**

1. Prüfe Login-Items:
   - Systemeinstellungen → Benutzer & Gruppen → Login-Items
   - Ist "k2-terminal-autostart.sh" in der Liste?

2. Teste Script manuell:
```bash
~/k2Galerie/scripts/k2-terminal-autostart.sh
```

Funktioniert das? → Dann ist Login-Item falsch eingerichtet

**Problem: Server startet nicht**

1. Prüfe ob Node.js funktioniert:
```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
node --version
```

2. Starte Server manuell:
```bash
npm run dev
```

Funktioniert das? → Dann ist Script-Problem

---

## ✅ FERTIG!

Ab jetzt startet Terminal + Server automatisch beim Mac-Login! 💚

**Zusammenfassung:**
1. Script testen ✅
2. Login-Item einrichten ✅
3. Mac neu starten ✅
4. Fertig! 💚
