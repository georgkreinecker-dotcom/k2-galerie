# Verbindung prüfen - Schritt für Schritt

## 🔍 Problem: "Kann Verbindung nicht aufbauen"

Das bedeutet: Der Server läuft nicht oder ist nicht erreichbar.

## ✅ Lösung Schritt für Schritt:

### 1. Terminal öffnen

`Cmd + Leertaste` → "Terminal" → Enter

### 2. Zum Projektordner wechseln

```bash
cd ~/k2Galerie
```

**Enter drücken**

### 3. PATH setzen

```bash
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
```

**Enter drücken**

### 4. Server starten

```bash
npm run dev
```

**Enter drücken**

### 5. Warten

Du solltest sehen:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5177/
```

**WICHTIG:** Das Terminal-Fenster muss offen bleiben!

### 6. Browser öffnen

- Safari öffnen
- In Adressleiste: `localhost:5177` eingeben
- Enter drücken

## 🔧 Falls es nicht funktioniert:

**Prüfe im Terminal ob Server läuft:**

Du solltest sehen:
- `VITE v5.x.x ready`
- `Local: http://localhost:5177/`

**Falls Fehler erscheinen:**
- Kopiere die Fehlermeldung hier rein
- Oder mache einen Screenshot (Cmd+Shift+4)

## 💡 Tipp:

Der Server muss **laufen**, bevor du die URL im Browser öffnest!
