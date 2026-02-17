# Verbesserungen ohne zusätzliche Kosten

**Stand:** 17.02.26  
Alles, was wir ohne neue Abos oder Dienste umgesetzt haben – und was du regelmäßig tun kannst.

---

## Bereits umgesetzt

| Maßnahme | Wo | Nutzen |
|----------|-----|--------|
| **Fehlermeldungen escapen** | `main.tsx` | XSS-Risiko bei Fehlerseite minimiert |
| **Stack nur in Dev** | `main.tsx` | In Produktion keine internen Pfade/Stacks sichtbar |
| **Security-Header** | `vercel.json` | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, **Referrer-Policy** |
| **CORS eingeschränkt** | `supabase/functions/artworks/index.ts` | API nur von k2-galerie.vercel.app + localhost erreichbar, kein `*` |
| **RLS-Doku** | `docs/SUPABASE-RLS-SICHERHEIT.md` | Klarheit, wie du RLS später schärfen kannst |
| **Checkliste** | `docs/SICHERHEIT-STABILITAET-CHECKLISTE.md` | Einsturz- und Einbruch-Punkte im Blick |

---

## Regelmäßig tun (kostet nichts)

1. **`npm audit`**  
   Im Projektordner: `npm audit` (evtl. `npm audit fix`). Kritische/hohe Lücken in Dependencies beheben.

2. **Abhängigkeiten aktualisieren**  
   Vite, React, Supabase-Client etc. in Maßen aktualisieren (`npm update` oder gezielt). Vorher lokal `npm run build` testen.

3. **Supabase RLS prüfen**  
   Wenn du später echte Nutzer/Login nutzt: Policies anpassen (siehe `docs/SUPABASE-RLS-SICHERHEIT.md`).

4. **Neue Origins für CORS**  
   Wenn du eine neue Domain nutzt (z. B. eigene Domain statt vercel.app): in `supabase/functions/artworks/index.ts` bei `ALLOWED_ORIGINS` eintragen.

---

## Skala (nach allen Optimierungen)

Siehe Abschnitt „Wo wir auf der Skala stehen“ in `docs/SICHERHEIT-STABILITAET-CHECKLISTE.md` oder die letzte Bewertung in der Session – **von außen** und **von innen** (1–10).
