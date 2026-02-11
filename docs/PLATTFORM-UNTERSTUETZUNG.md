# Plattform-Unterstützung (für breite Vermarktung)

## Übersicht

| Plattform | Browser | PWA („App“-Installation) | Anmerkung |
|-----------|---------|---------------------------|-----------|
| **Windows** | ✅ Edge, Chrome, Firefox | ✅ „App installieren“ / PWA | Kein Mac nötig. |
| **Android** | ✅ Chrome, Firefox, Samsung Internet | ✅ „Zum Home-Bildschirm“ | Touch, Vollbild bereits berücksichtigt. |
| **macOS** | ✅ Safari, Chrome, Firefox | ✅ | Wie bisher. |
| **iOS** | ✅ Safari, Chrome | ✅ „Zum Home-Bildschirm“ | Safe Area, Touch-Targets berücksichtigt. |

Die **Web-App** (nach `npm run build` / Vercel-Deploy) ist plattformneutral und läuft auf allen genannten Systemen im Browser. PWA-Features (Manifest, Service Worker) funktionieren unter Windows und Android wie unter macOS/iOS.

---

## Was bereits plattformneutral ist

- **React + TypeScript + Vite:** Build-Ausgabe ist reines Web; keine Abhängigkeit von Betriebssystem.
- **Mobile-Erkennung:** `iPhone|iPad|iPod|Android` in User-Agent-Checks → Android wird explizit einbezogen.
- **Touch & Layout:** Viewport, Touch-Targets, Vollbild-Lightbox auf Mobile → für Android nutzbar.
- **Hinweise „App schließen“:** Text nennt iPhone/iPad und Android.

---

## Was für Vermarktung zu beachten ist

1. **Keine Mac-Pfade in der Kunden-App**  
   Fest verdrahtete Pfade wie `/Users/georgkreinecker/k2Galerie/...` oder „nur auf Mac“-Logik dürfen nur in **Entwickler-Tools** (z. B. Dev-View, Scripts) vorkommen, nicht in Galerie/Admin für Endkunden.

2. **Veröffentlichen / Deployment**  
   Kunden auf **Windows** oder **Android** sollen ihre Galerie z. B. über Vercel, GitHub oder ein von dir bereitgestelltes Hosting aktualisieren können – ohne lokales Bash-Skript oder Mac. Dafür später: klare Anleitung (z. B. „Über Vercel Dashboard“ oder „GitHub Actions“) oder ein kleines Windows-/Web-Tool.

3. **Electron (optional)**  
   Aktuell: Electron-Build nur für Mac (`electron-builder --mac`). Für eine **Windows-Desktop-App** könnte später `electron-builder --win` ergänzt werden; für die **breite Vermarktung** reicht zunächst Browser + PWA auf Windows und Android.

---

## Kurzfassung

- **Windows und Android** sind als Zielplattformen abgedeckt, sofern die Nutzer die **Web-App im Browser** (oder als PWA) verwenden.
- Für **breite Vermarktung** gilt: Alle produktiven Features müssen ohne Mac aus nutzbar sein; Mac-spezifische Schritte nur in Doku/Tools für dich als Betreiber.
