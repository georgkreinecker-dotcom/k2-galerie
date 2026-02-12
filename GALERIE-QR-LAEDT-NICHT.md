# Galerie lädt nach QR-Scan nicht

## Was geändert wurde

1. **Routen-Reihenfolge:** Die Route `/projects/k2-galerie/galerie` steht jetzt **vor** der parametrischen Route `/projects/:projectId`. So wird die Galerie-Seite beim Aufruf per QR-Code zuverlässig getroffen (wichtig für Mobile).
2. **Ladeanzeige:** In der `index.html` steht im `#root`-Div initial „Laden …“. Bis die App gerendert ist, sieht man damit keinen leeren schwarzen Bildschirm.

## QR-Code-URL prüfen

- **Produktion (Vercel):** z. B. `https://k2-galerie.vercel.app/projects/k2-galerie/galerie`  
  Muss per HTTPS erreichbar sein; auf dem Handy gleiches WLAN oder Mobilnetz.
- **Lokal (gleiches WLAN):** z. B. `http://DEINE-MAC-IP:5178/projects/k2-galerie/galerie`  
  Nur funktionsfähig, wenn Handy und Mac im **gleichen WLAN** sind und der Dev-Server läuft (`npm run dev`).

## Wenn es weiterhin nicht lädt

1. **„Laden …“ bleibt stehen** → JavaScript lädt nicht (Netzwerk, Blockierung, Fehler im Skript). Auf dem Handy: gleiche URL in einem anderen Browser testen; auf dem Mac in den Browser-Entwicklertools (Konsole) nach Fehlern schauen.
2. **Schwarzer/weißer Bildschirm** → App stürzt beim Start ab. Fehlermeldung erscheint, wenn der Fehler nach dem Laden von React geworfen wird („App konnte nicht gestartet werden“ o. Ä.).
3. **Vercel:** Nach einem neuen Deployment 1–2 Minuten warten und QR-Code erneut scannen; ggf. Cache auf dem Handy leeren oder Seite neu laden.

## Nach dem Deployment

Nach `Veröffentlichen` + Git Push: 2–3 Minuten warten, dann auf dem Handy die Galerie-URL neu aufrufen oder den QR-Code erneut scannen (nicht die alte gecachte Version nutzen).
