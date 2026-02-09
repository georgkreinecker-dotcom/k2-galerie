# 🚀 Schritt-für-Schritt: Terminal + Server automatisch starten

## ✅ Schritt 1: Script testen

**Terminal öffnen** (Cmd + Leertaste → "Terminal")

```bash
cd ~/k2Galerie
./scripts/k2-terminal-autostart.sh
```

**Was passiert:**
- Terminal öffnet sich (falls nicht schon offen)
- Server startet automatisch
- Warte 10 Sekunden

**Prüfen ob Server läuft:**
```bash
curl http://127.0.0.1:5177
```

Falls du eine Antwort siehst → ✅ **Funktioniert!**

---

## ✅ Schritt 2: Als Login-Item einrichten

### Option A: Automatisch (empfohlen)

**Im Terminal:**

```bash
cd ~/k2Galerie
./scripts/k2-autostart-einrichten.sh
```

**Was passiert:**
- Script richtet alles automatisch ein
- Du siehst eine Bestätigung

---

### Option B: Manuell

**1. Systemeinstellungen öffnen**
- Apple-Menü → **Systemeinstellungen**
- Oder: Cmd + Leertaste → "Systemeinstellungen"

**2. Benutzer & Gruppen öffnen**
- Klicke auf **"Benutzer & Gruppen"**

**3. Login-Items öffnen**
- Klicke auf Tab **"Login-Items"**
- Falls gesperrt: Klick auf 🔒 unten links → Passwort eingeben

**4. Item hinzufügen**
- Klicke auf **"+"** (Plus-Button)
- Navigiere zu: `/Users/georgkreinecker/k2Galerie/scripts/`
- Wähle: **`k2-terminal-autostart.sh`**
- Klicke auf **"Hinzufügen"**

**5. Fertig!**
- Du siehst jetzt "k2-terminal-autostart.sh" in der Liste
- ✅ **Fertig!**

---

## ✅ Schritt 3: Testen

**Mac neu starten:**
- Apple-Menü → **Neu starten**
- Oder: Terminal → `sudo reboot`

**Nach dem Neustart:**
1. ✅ Terminal öffnet sich automatisch
2. ✅ Server startet automatisch
3. ✅ Warte 10 Sekunden
4. ✅ Browser öffnen: `http://127.0.0.1:5177/`

**Falls Terminal nicht öffnet:**
- Prüfe Login-Items nochmal
- Führe Script manuell aus: `~/k2Galerie/scripts/k2-terminal-autostart.sh`

---

## 🛑 Autostart deaktivieren

**Systemeinstellungen** → **Benutzer & Gruppen** → **Login-Items**
- Finde "k2-terminal-autostart.sh"
- Markiere es
- Klicke auf **"-"** (Minus-Button)

---

## ✅ Checkliste

- [ ] Script getestet → Server startet
- [ ] Login-Item hinzugefügt
- [ ] Mac neu gestartet
- [ ] Terminal öffnet sich automatisch
- [ ] Server startet automatisch
- [ ] Browser zeigt K2 Plattform

---

## 💡 Tipps

**Terminal minimieren:**
- Terminal kann minimiert werden (Server läuft weiter)
- Cmd + M zum Minimieren

**Server stoppen:**
- Terminal öffnen
- `Ctrl + C` drücken

**Server manuell starten:**
```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```

---

## 🆘 Falls es nicht funktioniert

**1. Prüfe ob Script ausführbar ist:**
```bash
ls -l ~/k2Galerie/scripts/k2-terminal-autostart.sh
```

Sollte zeigen: `-rwxr-xr-x` (x = ausführbar)

**2. Falls nicht ausführbar:**
```bash
chmod +x ~/k2Galerie/scripts/k2-terminal-autostart.sh
```

**3. Prüfe Login-Items:**
- Systemeinstellungen → Benutzer & Gruppen → Login-Items
- Ist "k2-terminal-autostart.sh" in der Liste?

**4. Teste Script manuell:**
```bash
~/k2Galerie/scripts/k2-terminal-autostart.sh
```

Funktioniert das? → Dann ist Login-Item falsch eingerichtet

---

## ✅ Das war's!

Ab jetzt startet Terminal + Server automatisch beim Mac-Login! 💚
