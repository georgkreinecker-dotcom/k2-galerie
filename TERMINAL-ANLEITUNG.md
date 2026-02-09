# Terminal-Anleitung: K2 starten

## 🎯 Problem: Script passiert nichts

Wenn du ein Script kopierst, musst du es **ausführen**.

## ✅ So funktioniert's:

### Methode 1: Script ausführen

```bash
cd ~/k2Galerie
./scripts/k2-start-einfach.sh
```

**Wichtig:** Der Punkt und Schrägstrich (`./`) sind wichtig!

### Methode 2: Direkt starten

```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```

### Methode 3: Schritt für Schritt

1. **Terminal öffnen**
2. **Eingeben:** `cd ~/k2Galerie`
3. **Enter drücken**
4. **Eingeben:** `export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"`
5. **Enter drücken**
6. **Eingeben:** `npm run dev`
7. **Enter drücken**
8. **Warten** bis du siehst: `Local: http://localhost:5177/`
9. **Browser öffnen:** `http://localhost:5177/`

## 🔍 Prüfen ob es funktioniert:

Nach `npm run dev` solltest du sehen:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5177/
```

Falls du Fehler siehst, kopiere die Fehlermeldung hier rein!
