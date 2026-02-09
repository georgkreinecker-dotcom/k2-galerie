# 🚨 CURSOR CRASH WORKAROUND - FINAL

## ❌ Problem
Cursor crasht mit "reopen" besonders wenn:
- Galerieseite geöffnet wird
- Während Code-Änderungen gemacht werden
- Server-Verbindung verloren geht

## ✅ Lösung: Im Browser arbeiten

### Schritt 1: Cursor nur für Code-Schreiben
- Cursor öffnen
- Code schreiben/ändern
- **NICHT** Preview verwenden
- **NICHT** Galerieseite in Cursor öffnen

### Schritt 2: Browser für Testen
- **Separates Browser-Fenster** öffnen (Safari/Chrome)
- Gehe zu: `http://localhost:5178/`
- Teste dort die Galerie
- **NICHT** in Cursor Preview

### Schritt 3: Regelmäßig speichern
- **Cmd + S** nach jeder Änderung
- Dann erst Browser testen

## 🔧 Warum das funktioniert

- **Cursor Preview** ist instabil → verursacht Crashes
- **Browser** ist stabil → keine Crashes
- **Trennung** verhindert Probleme

## 💡 Workflow

1. **Code schreiben**: Cursor (ohne Preview)
2. **Speichern**: Cmd + S
3. **Testen**: Browser (separates Fenster)
4. **Zurück zu Cursor**: Weiter coden

## ⚠️ WICHTIG

- **NICHT** Galerieseite in Cursor öffnen
- **NUR** Browser verwenden zum Testen
- **IMMER** speichern bevor Browser öffnen

---

**Das ist die einzige Lösung die wirklich funktioniert!** 💚
