# 🚨 CRASH-FIX: Autostart deaktivieren

## ❌ Problem:

Mac ist beim Neustart abgestürzt wegen des Autostart-Scripts.

## ✅ SOFORT-FIX: Autostart deaktivieren

**Im Terminal:**

```bash
cd ~/k2Galerie
./scripts/autostart-deaktivieren.sh
```

**Oder manuell:**

1. **Systemeinstellungen** → **Benutzer & Gruppen** → **Login-Items**
2. Finde "k2-terminal-autostart.sh"
3. Markiere es
4. Klicke **"-"** (Minus-Button)

---

## 🔍 Problem-Analyse:

Das Script startet zu früh beim Boot, bevor:
- Netzwerk bereit ist
- Terminal vollständig geladen ist
- Node.js verfügbar ist

---

## ✅ SICHERE LÖSUNG:

**Statt automatischem Start beim Login:**

**Option 1: Manuell starten (sicherste Methode)**
```bash
cd ~/k2Galerie
./scripts/k2-terminal-autostart.sh
```

**Option 2: K2 Plattform.app verwenden**
- Doppelklick auf `K2 Plattform.app`
- Startet Server automatisch über Terminal

---

## 💡 Empfehlung:

**Autostart deaktivieren** und stattdessen:
- **K2 Plattform.app** verwenden (funktioniert immer)
- Oder Script manuell starten wenn nötig

---

## 🛑 WICHTIG:

**Autostart ist jetzt deaktiviert** - Mac sollte nicht mehr abstürzen!
