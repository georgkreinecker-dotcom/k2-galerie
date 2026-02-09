# ✅ EINFACHSTE Start-Methode

## 🎯 Problem:

App und Terminal-Script funktionieren nicht.

## ✅ EINFACHSTE Lösung:

**Im Terminal diese 3 Zeilen eingeben:**

```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```

**Das funktioniert IMMER!** ✅

---

## 💡 Alias erstellen (noch einfacher):

**Einmal einrichten, dann immer einfach:**

```bash
echo 'alias k2start="cd ~/k2Galerie && export PATH=\"\$HOME/.local/node-v20.19.0-darwin-x64/bin:\$PATH\" && npm run dev"' >> ~/.bash_profile
```

**Dann Terminal neu starten oder:**
```bash
source ~/.bash_profile
```

**Dann einfach eingeben:**
```bash
k2start
```

**FERTIG!** ✅

---

## ✅ Zusammenfassung:

- ✅ Einfachste Methode: 3 Zeilen im Terminal
- ✅ Oder: Alias `k2start` erstellen
- ✅ Das funktioniert garantiert!

**Keine Apps, keine Scripts - einfach Terminal!** 💚
