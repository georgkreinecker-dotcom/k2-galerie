# K2 Plattform App sichtbar machen

## 🔍 Problem: App ist nicht sichtbar auf dem Desktop

Die App existiert technisch, aber macOS zeigt sie möglicherweise nicht an.

## ✅ Lösung:

### Methode 1: Finder aktualisieren

1. **Finder öffnen**
2. **Desktop-Ordner öffnen:** `~/Desktop` oder `Cmd+Shift+D`
3. **Ansicht aktualisieren:** `Cmd+R` oder Rechtsklick → "Ansicht aktualisieren"

### Methode 2: App manuell finden

1. **Finder öffnen**
2. **Gehe zu:** `~/Desktop` oder `/Users/georgkreinecker/Desktop`
3. **Suche nach:** `K2 Plattform.app`
4. **Wenn gefunden:** Rechtsklick → "Alias erstellen" → Alias auf Desktop ziehen

### Methode 3: Terminal

```bash
# App öffnen
open ~/Desktop/K2\ Plattform.app

# Oder Finder mit Desktop öffnen
open ~/Desktop/
```

### Methode 4: App neu erstellen

Die App ist im Projektordner: `~/k2Galerie/K2 Plattform.app`

**Manuell kopieren:**
1. Finder → Projektordner (`~/k2Galerie`)
2. `K2 Plattform.app` finden
3. Mit Maus auf Desktop ziehen

## 🎯 Schnelltest:

```bash
# Prüfe ob App existiert
ls -la ~/Desktop/K2\ Plattform.app

# Öffne App direkt
open ~/Desktop/K2\ Plattform.app
```
