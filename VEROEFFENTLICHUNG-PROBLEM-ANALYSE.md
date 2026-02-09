# 🔍 Veröffentlichungsproblem - Systematische Analyse

## ❓ Was genau funktioniert NICHT?

### Frage 1: Was passiert wenn du "Veröffentlichen" klickst?
- [ ] Button wird gedrückt
- [ ] Datei wird geschrieben (gallery-data.json)
- [ ] Git Push funktioniert
- [ ] Vercel deployt automatisch
- [ ] Mobile zeigt neue Daten

### Frage 2: An welcher Stelle hakt es?
- [ ] Datei wird nicht geschrieben
- [ ] Git Push schlägt fehl
- [ ] Vercel deployt nicht
- [ ] Mobile lädt alte Daten (Cache-Problem)
- [ ] Mobile lädt gar keine Daten

---

## 🔍 Aktueller Ablauf (was passieren SOLLTE):

1. **Button klicken** → `publishMobile()` Funktion
2. **Daten sammeln** → Aus localStorage
3. **Datei schreiben** → `/api/write-gallery-data` → `public/gallery-data.json`
4. **Git add** → `git add public/gallery-data.json`
5. **Git commit** → `git commit -m "Update gallery-data.json"`
6. **Git push** → `git push origin main`
7. **Vercel** → Deployt automatisch (1-2 Minuten)
8. **Mobile** → Lädt neue Daten nach QR-Code neu scannen

---

## 🐛 Mögliche Probleme:

### Problem A: Git Push schlägt fehl
**Symptom:** Alert zeigt "Git Push fehlgeschlagen"
**Ursache:** Authentifizierung, Netzwerk, Berechtigungen
**Lösung:** Manuell pushen im Terminal

### Problem B: Vercel deployt nicht automatisch
**Symptom:** Git Push erfolgreich, aber Vercel zeigt kein neues Deployment
**Ursache:** Vercel Webhook nicht aktiviert oder fehlerhaft
**Lösung:** Manuell in Vercel deployen

### Problem C: Mobile Cache
**Symptom:** Mobile zeigt alte Daten trotz neuem Deployment
**Ursache:** Browser-Cache auf Mobile
**Lösung:** Cache-Busting verbessern, QR-Code neu scannen

### Problem D: Datei wird nicht richtig geladen
**Symptom:** Mobile kann gallery-data.json nicht laden
**Ursache:** Falsche URL, CORS, Datei nicht im Build
**Lösung:** URL prüfen, Datei im public Ordner sicherstellen

---

## ✅ Nächste Schritte:

1. **Georg:** Sag mir genau, was passiert wenn du "Veröffentlichen" klickst
2. **Ich:** Analysiere das Problem gezielt
3. **Wir:** Finden die richtige Lösung zusammen

---

## 💡 Einfache Lösung (falls alles zu komplex):

**Manueller Workflow:**
1. Button "Veröffentlichen" → Lädt Datei herunter
2. Datei manuell in `public/` Ordner kopieren
3. Terminal: `git add public/gallery-data.json && git commit -m "Update" && git push`
4. Warte auf Vercel Deployment
5. Mobile: QR-Code neu scannen

Das ist nicht ideal, aber funktioniert GARANTIERT.
