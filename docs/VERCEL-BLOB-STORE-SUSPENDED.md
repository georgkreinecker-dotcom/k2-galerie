# Vercel Blob Store suspended – was tun?

**Fehlermeldung:** `BlobStoreSuspendedError: Vercel Blob: This store has been suspended.`

Der **Vercel Blob Store** ist pausiert. Dann schlagen „An Server senden“, Bild-Upload (Werke 30+) und „Bilder vom Server laden“ fehl.

---

## 1. Im Vercel Dashboard prüfen

1. **https://vercel.com** → einloggen → Projekt **k2-galerie** öffnen.
2. Oben **Storage** (oder im Menü **Storage**) anklicken.
3. **Blob** auswählen – dort siehst du den/die Blob Store(s).
4. **Status** prüfen: Steht dort „Suspended“ oder eine Meldung zu Limits/Billing?

---

## 2. Mögliche Ursachen und Schritte

| Ursache | Was tun |
|--------|---------|
| **Speicherlimit überschritten** (Hobby Plan hat begrenztes Blob-Volumen) | Alte Blobs löschen (z. B. unter `upload/` temporäre Chunks) oder Plan upgraden. |
| **Store von Vercel pausiert** (z. B. nach Inaktivität oder Richtlinie) | Im gleichen Storage-Tab prüfen, ob es einen Button **„Resume“** / „Reaktivieren“ gibt. |
| **Billing / Zahlung** | Vercel Dashboard → Billing prüfen; bei offenen Beträgen oder Karte abgelaufen kann Vercel Storage pausieren. |

---

## 3. Wenn du nichts reaktivieren kannst

- **Vercel Help:** https://vercel.com/help  
- Support anfragen: „My Blob store is suspended, how can I resume it?“ und Projekt-Name (k2-galerie) angeben.

---

## 4. Nach der Reaktivierung

- Einmal **„An Server senden“** am Mac/iPad ausführen → Daten stehen wieder im Blob.
- Am Handy **Stand-Badge tippen** oder **QR neu scannen** → „Bilder vom Server laden“ funktioniert wieder.

---

**Kurz:** Vercel Dashboard → Storage → Blob → Status prüfen → reaktivieren oder Support fragen.
