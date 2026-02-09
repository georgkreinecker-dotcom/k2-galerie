# 🔧 Verbindung fehlgeschlagen - Lösungen

## ⚠️ Problem: Verbindung funktioniert nicht

### Mögliche Ursachen:

1. **Bildschirmfreigabe nicht aktiviert** auf dem zweiten Mac
2. **Firewall blockiert** die Verbindung
3. **VNC-Server läuft nicht** richtig
4. **Netzwerk-Problem**

---

## ✅ Lösung 1: Bildschirmfreigabe prüfen

**Auf dem ZWEITEN MAC:**

1. **Systemeinstellungen** → **Freigaben**
2. Prüfe ob **"Bildschirmfreigabe"** aktiviert ist (Häkchen)
3. Falls nicht → aktivieren
4. Prüfe ob **"Alle Benutzer"** oder **"Nur diese Benutzer"** gewählt ist
5. Falls **"Nur diese Benutzer"** → deinen Benutzer hinzufügen

---

## ✅ Lösung 2: Firewall prüfen

**Auf dem ZWEITEN MAC:**

1. **Systemeinstellungen** → **Sicherheit** → **Firewall**
2. Prüfe ob Firewall aktiviert ist
3. Falls ja:
   - **Firewall-Optionen** klicken
   - Prüfe ob **"Bildschirmfreigabe"** erlaubt ist
   - Falls nicht → hinzufügen
4. Oder: Firewall temporär deaktivieren zum Testen

---

## ✅ Lösung 3: VNC-Server neu starten

**Auf dem ZWEITEN MAC:**

Terminal öffnen:

```bash
sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart -activate -configure -access -on -restart -agent -privs -all
```

Oder manuell:
1. Systemeinstellungen → Freigaben
2. Bildschirmfreigabe deaktivieren
3. Warten 5 Sekunden
4. Bildschirmfreigabe wieder aktivieren

---

## ✅ Lösung 4: Computer-Name statt IP verwenden

**Auf dem ZWEITEN MAC:**

1. Systemeinstellungen → Freigaben
2. Computer-Name notieren (oben steht z.B. "Georgs-Mac")

**Auf diesem MAC:**

Finder → "Mit Server verbinden" → `vnc://[Computer-Name].local`

Z.B.: `vnc://Georgs-Mac.local`

---

## ✅ Lösung 5: WLAN statt USB verwenden

Falls USB nicht funktioniert:

**Auf dem ZWEITEN MAC:**

1. Systemeinstellungen → Netzwerk
2. WLAN-IP-Adresse finden (192.168.x.x)
3. Diese IP verwenden statt 169.254.123.114

**Auf diesem MAC:**

Finder → "Mit Server verbinden" → `vnc://[WLAN-IP]`

---

## 💡 Tipp:

Versuche zuerst Lösung 1 und 2 - das sind die häufigsten Probleme!
