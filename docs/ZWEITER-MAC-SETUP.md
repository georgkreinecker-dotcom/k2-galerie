# Zweiter Mac als Display & Hilfsrechner einbinden

## 🖥️ Option 1: AirPlay Display (Wireless)

**Auf dem zweiten Mac:**
1. Systemeinstellungen → **Displays**
2. **"AirPlay Display"** aktivieren
3. Option: **"Code erforderlich"** für Sicherheit

**Auf diesem Mac:**
1. AirPlay-Menü in der Menüleiste (oben rechts) öffnen
2. Zweiten Mac auswählen
3. Fertig – er erscheint als zweiter Bildschirm

## 🔌 Option 2: Physische Verbindung (Thunderbolt/USB-C)

1. **Kabel verbinden** (Thunderbolt/USB-C zwischen beiden Macs)
2. Auf diesem Mac: **Systemeinstellungen → Displays**
3. **"Arrangement"** Tab → beide Displays anordnen
4. Option: **"Als erweiterten Desktop verwenden"**

## 📺 Option 3: Screen Sharing (Remote-Zugriff)

**Auf dem zweiten Mac:**
1. Systemeinstellungen → **Freigaben**
2. **"Bildschirmfreigabe"** aktivieren
3. IP-Adresse notieren (z.B. `192.168.1.100`)

**Auf diesem Mac:**
1. Finder → **"Gehe zu"** → **"Mit Server verbinden"**
2. Eingeben: `vnc://[IP-Adresse]` (z.B. `vnc://192.168.1.100`)
3. Verbinden → zweiter Mac erscheint als Fenster

## 💻 Für K2-Projekt: Zweiter Mac als Dev-Server

**Setup auf dem zweiten Mac:**
```bash
# K2 Projekt kopieren
scp -r k2Galerie user@zweiter-mac:~/

# Auf dem zweiten Mac: Dev-Server starten
cd ~/k2Galerie
npm run dev -- --host 0.0.0.0  # Erreichbar von anderen Geräten
```

**Auf diesem Mac:**
- Browser öffnen → `http://[IP-des-zweiten-Macs]:5177/`
- Oder: Mobile-Connect nutzen mit der IP-Adresse

## 🎯 Empfohlene Setup für K2

**Haupt-Mac (dieser):**
- K2 Plattform öffnen
- Control Studio, Mission Control nutzen
- Entwicklung & Verwaltung

**Zweiter Mac:**
- Dev-Server läuft (Port 5177)
- Öffentliche Galerie testen
- Mobile-Connect QR-Codes anzeigen
- Als "Preview"-Bildschirm

## 🔧 Schnell-Setup Script

Führe aus: `./scripts/setup-second-mac.sh`
