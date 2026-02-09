# 🔍 Debug: Weißes Fenster

## Problem
Du siehst nur ein weißes Fenster statt der App.

## ✅ Lösung Schritt für Schritt:

### 1. Browser-Konsole öffnen

**Safari:**
- Entwicklermenü aktivieren: Einstellungen → Erweitert → "Menü "Entwickler" in der Menüleiste anzeigen"
- Dann: Entwickler → JavaScript-Konsole anzeigen

**Chrome:**
- Cmd + Option + J (oder Rechtsklick → Untersuchen → Console)

### 2. Fehler prüfen

In der Konsole solltest du sehen:
- ✅ `✅ App erfolgreich gerendert` = Alles OK
- ❌ Rote Fehlermeldungen = Problem gefunden

### 3. Häufige Probleme:

#### Problem A: JavaScript-Fehler
**Symptom:** Rote Fehler in der Konsole
**Lösung:** Fehlermeldung kopieren und hier einfügen

#### Problem B: Route nicht gefunden
**Symptom:** Keine Fehler, aber weißes Fenster
**Lösung:** Versuche direkt:
- `http://localhost:5178/galerie-home`
- `http://localhost:5178/admin`

#### Problem C: CSS nicht geladen
**Symptom:** Seite lädt, aber alles weiß
**Lösung:** Hard Reload: Cmd + Shift + R

### 4. Schnell-Test:

Öffne diese URL direkt:
```
http://localhost:5178/admin
```

Wenn das funktioniert, ist das Routing das Problem.

---

## 📋 Was du mir sagen solltest:

1. **Was siehst du in der Browser-Konsole?** (Fehler?)
2. **Funktioniert `/admin`?**
3. **Funktioniert `/galerie-home`?**

Dann kann ich gezielt helfen! 💚
