# 🌐 Domain-Setup für k2-galerie.at

## ✅ Schritt 1: Domain bei Vercel hinzufügen

1. **Gehe zu deinem Vercel-Projekt**
   - Nach dem Deployment siehst du dein Projekt im Dashboard
   - Oder: [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Klicke auf dein Projekt** (k2-galerie oder ähnlich)

3. **Gehe zu "Settings"** (oben rechts)

4. **Klicke auf "Domains"** (linke Sidebar)

5. **Füge deine Domain hinzu:**
   - Trage ein: `k2-galerie.at`
   - Klicke "Add"

6. **Vercel zeigt dir jetzt DNS-Einstellungen** 📋
   - Kopiere diese Einstellungen (sie sehen so aus):
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

---

## ✅ Schritt 2: DNS bei deinem Domain-Provider setzen

### Wo hast du die Domain gekauft?

**Häufige Domain-Provider:**
- **IONOS** (1&1)
- **Strato**
- **HostEurope**
- **Namecheap**
- **GoDaddy**
- **Andere**

### So findest du deinen Domain-Provider:

1. **Prüfe deine E-Mails** - Suche nach "Domain-Registrierung" oder "k2-galerie.at"
2. **Oder:** Gehe zu [whois.net](https://www.whois.net) und suche nach `k2-galerie.at`

---

## ✅ Schritt 3: DNS-Einträge bei deinem Provider setzen

### Beispiel-Anleitung (IONOS):

1. **Logge dich bei IONOS ein**
2. **Gehe zu:** Domains & SSL → k2-galerie.at → DNS-Verwaltung
3. **Füge die DNS-Einträge hinzu:**
   - **A-Record:**
     - Name: `@` oder leer lassen
     - Wert: `76.76.21.21` (oder was Vercel dir zeigt)
     - TTL: 3600
   
   - **CNAME-Record:**
     - Name: `www`
     - Wert: `cname.vercel-dns.com` (oder was Vercel dir zeigt)
     - TTL: 3600

4. **Speichere die Änderungen**

### Beispiel-Anleitung (Strato):

1. **Logge dich bei Strato ein**
2. **Gehe zu:** Domains → k2-galerie.at → DNS-Einstellungen
3. **Füge die DNS-Einträge hinzu** (wie oben)

### Beispiel-Anleitung (HostEurope):

1. **Logge dich bei HostEurope ein**
2. **Gehe zu:** Domain-Verwaltung → k2-galerie.at → DNS
3. **Füge die DNS-Einträge hinzu** (wie oben)

---

## ⏱️ Schritt 4: Warten auf DNS-Propagierung

**DNS-Änderungen brauchen Zeit:**
- ⚡ **Schnell:** 5-15 Minuten
- 🕐 **Normal:** 1-2 Stunden
- 🐌 **Langsam:** Bis zu 24 Stunden

**Du kannst prüfen, ob es funktioniert:**
- Gehe zu [whatsmydns.net](https://www.whatsmydns.net)
- Suche nach `k2-galerie.at`
- Prüfe, ob die A-Records auf `76.76.21.21` zeigen

---

## ✅ Schritt 5: SSL-Zertifikat (automatisch!)

**Vercel erstellt automatisch ein SSL-Zertifikat:**
- ✅ HTTPS funktioniert automatisch
- ✅ Keine zusätzliche Konfiguration nötig
- ✅ Wird innerhalb weniger Minuten aktiviert

---

## 🎯 Schritt 6: Website-URL in Stammdaten setzen

**Nachdem die Domain funktioniert:**

1. **Gehe zu deiner Website:** `https://k2-galerie.at`
2. **Klicke auf den Admin-Button** (oben rechts)
3. **Gib das Passwort ein:** `k2Galerie2026`
4. **Gehe zu "Stammdaten"**
5. **Setze die Website-URL auf:** `https://k2-galerie.at`
6. **Speichere**

**Alle QR-Codes aktualisieren sich automatisch!** 💚

---

## 🆘 Hilfe bei Problemen

### Domain zeigt noch nicht auf Vercel?

1. **Prüfe DNS-Einträge:** [whatsmydns.net](https://www.whatsmydns.net)
2. **Warte länger** - DNS kann bis zu 24h brauchen
3. **Prüfe bei Vercel:** Settings → Domains → Status
4. **Kontaktiere deinen Domain-Provider** falls nötig

### SSL-Zertifikat funktioniert nicht?

- **Warte 5-10 Minuten** nach DNS-Propagierung
- Vercel erstellt SSL automatisch
- Falls nach 1 Stunde noch nicht aktiv: Vercel Support kontaktieren

---

## ✅ Checkliste

- [ ] Domain bei Vercel hinzugefügt
- [ ] DNS-Einträge bei Domain-Provider gesetzt
- [ ] Auf DNS-Propagierung gewartet (1-2 Stunden)
- [ ] Website unter `https://k2-galerie.at` erreichbar
- [ ] Website-URL in Stammdaten gesetzt
- [ ] QR-Codes funktionieren

**Fertig! Deine Galerie ist jetzt online!** 🎉💚
