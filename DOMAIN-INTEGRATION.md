# Domain-Integration für K2 Galerie

## 📋 Domain: k2-galerie.at

Die Domain **k2-galerie.at** ist bereits im Code als Standard hinterlegt und kann einfach integriert werden.

## 🚀 Integration-Schritte

### 1. Domain registrieren
- Domain bei einem österreichischen Provider registrieren (z.B. nic.at, World4You, etc.)
- Domain: **k2-galerie.at** oder **www.k2-galerie.at**

### 2. Hosting einrichten

#### Option A: Statisches Hosting (empfohlen)
**Anbieter:**
- **Vercel** (kostenlos, einfach)
- **Netlify** (kostenlos, einfach)
- **GitHub Pages** (kostenlos)
- **Cloudflare Pages** (kostenlos)

**Schritte:**
1. Build erstellen: `npm run build`
2. `dist`-Ordner auf Hosting hochladen
3. Domain im Hosting-Dashboard verbinden

#### Option B: VPS/Server
- Node.js Server mit Vite
- Nginx als Reverse Proxy
- SSL-Zertifikat (Let's Encrypt)

### 3. DNS-Einstellungen

Bei deinem Domain-Provider:
- **A-Record**: `@` → IP-Adresse deines Hostings
- **CNAME**: `www` → `k2-galerie.at` (oder IP)

### 4. Code-Anpassungen

Die Domain ist bereits im Code integriert:
- ✅ Standard-Website: `www.k2-galerie.at` (in Stammdaten)
- ✅ QR-Codes verwenden automatisch `window.location.origin`
- ✅ Alle Links sind relativ und funktionieren mit jeder Domain

### 5. Nach Deployment

Nach dem Hosting-Setup:
1. **Stammdaten aktualisieren**: Im Admin-Bereich die Website-URL auf `https://k2-galerie.at` setzen
2. **QR-Codes**: Werden automatisch mit der neuen Domain generiert
3. **SSL**: Sicherstellen, dass HTTPS aktiviert ist

## 🔧 Build für Production

```bash
# Build erstellen
npm run build

# Der dist-Ordner enthält alle Dateien für das Hosting
```

## 📱 PWA-Konfiguration

Die App ist bereits als PWA konfiguriert:
- `manifest.json` vorhanden
- Service Worker ready
- Funktioniert offline

## ✅ Checkliste

- [ ] Domain registriert
- [ ] Hosting eingerichtet
- [ ] DNS konfiguriert
- [ ] SSL-Zertifikat aktiviert
- [ ] Build deployed
- [ ] Website-URL in Stammdaten aktualisiert
- [ ] QR-Codes getestet

## 💡 Empfehlung: Vercel (einfachste Lösung)

1. **Account erstellen** auf vercel.com
2. **GitHub Repository verbinden** (oder manuell hochladen)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Domain hinzufügen**: `k2-galerie.at`
6. **DNS-Einstellungen** von Vercel übernehmen
7. **Fertig!** 🎉

Die App läuft dann automatisch mit HTTPS und ist weltweit verfügbar.
