# 🔧 Server-Problem lösen

## ⚠️ Problem: localhost öffnet nicht richtig

### Ursache:
- Mehrere Server-Prozesse laufen gleichzeitig
- Blockieren sich gegenseitig
- Port 5177 ist belegt

---

## ✅ Lösung: Alle Server stoppen und neu starten

### Schritt 1: Alle Server stoppen

**Terminal öffnen:**

```bash
pkill -9 -f "vite|npm.*dev"
```

### Schritt 2: Warten

Warte 5 Sekunden.

### Schritt 3: Server neu starten

```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```

### Schritt 4: Warten

Warte bis du siehst: `Local: http://localhost:5177/`

### Schritt 5: Browser öffnen

```
http://127.0.0.1:5177/
```

---

## 💡 Wichtig:

**Nur EIN Server sollte laufen!**

Falls mehrere laufen → alle stoppen → neu starten.

---

## ✅ Das funktioniert IMMER!
