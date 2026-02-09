# 🖥️ Zweiter Mac verbinden - a-glas Netzwerk

## ✅ Beide Macs im selben Netzwerk (a-glas)

### Schritt 1: Neue IP-Adresse finden

**Auf dem ZWEITEN MAC:**

1. **Systemeinstellungen** → **Netzwerk**
2. Wähle **"Wi‑Fi"** (a-glas)
3. Die IP-Adresse steht rechts daneben
   - Sollte jetzt `192.168.x.x` sein (statt 169.254.x.x)
   - Z.B.: `192.168.0.100` oder `192.168.1.50`

### Schritt 2: Verbinden

**Auf diesem MAC:**

Finder → "Mit Server verbinden" → `vnc://[NEUE-IP-ADRESSE]`

Z.B.: `vnc://192.168.0.100`

---

## 💡 Vorteile WLAN-Verbindung:

✅ Stabiler als USB
✅ Funktioniert über größere Distanz
✅ Beide Macs können sich bewegen
✅ Einfacher einzurichten

---

## ✅ Verbindung starten:

1. Neue IP-Adresse notieren (zweiter Mac)
2. Finder → "Mit Server verbinden"
3. `vnc://[NEUE-IP]` eingeben
4. Verbinden

---

## 🎯 Das sollte jetzt funktionieren!

Beide Macs im selben Netzwerk = Verbindung funktioniert! ✅
