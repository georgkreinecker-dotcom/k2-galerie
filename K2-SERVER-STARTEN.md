# 🚀 K2 Server starten - EINFACH

## ✅ Einfachste Methode:

### Option 1: Script ausführen
```bash
cd ~/k2Galerie
bash START-K2.sh
```

### Option 2: Doppelklick
- Doppelklick auf `START-K2.sh` im Finder
- Terminal öffnet sich automatisch

### Option 3: Direkt im Terminal
```bash
~/k2Galerie/START-K2.sh
```

---

## 🛑 Server stoppen

Im Terminal: `Ctrl + C`

---

## 🔄 Server neu starten

1. `Ctrl + C` (stoppt Server)
2. `bash START-K2.sh` (startet neu)

**FERTIG!** ✅

---

## 💡 Tipp: Alias erstellen (optional)

Falls du es noch einfacher haben willst, füge das zu `~/.zshrc` oder `~/.bash_profile` hinzu:

```bash
alias k2start='cd ~/k2Galerie && bash START-K2.sh'
```

Dann kannst du einfach `k2start` eingeben!
