# Stripe-Lizenz lokal testen (Dev-Server)

## Kurz

0. **Optional:** Im Cursor Terminal `npm run verify:stripe-env` – zeigt, ob `STRIPE_SECRET_KEY` und ggf. Supabase-Keys in `.env` / `.env.local` gesetzt sind (ohne Werte auszugeben).
1. **Stripe Dashboard (Testmodus):** Geheimer Schlüssel `sk_test_…` kopieren.
2. **`.env` im Projektroot:** `STRIPE_SECRET_KEY=sk_test_…` eintragen (ohne Anführungszeichen, keine Leerzeichen um `=`).
3. **Dev-Server neu starten** (Cursor-Terminal: beenden, dann `npm run dev`).
4. **Lizenz kaufen:** [Lizenz-Kauf-Seite](/projects/k2-galerie/lizenz-kaufen) – Karte **4242 4242 4242 4242**, beliebiges zukünftiges Ablaufdatum, CVC **123**.

Der Vite-Dev-Server bedient **`POST /api/create-checkout`** mit derselben Logik wie `api/create-checkout.js` auf Vercel (gemeinsamer Code: `api/createCheckoutShared.js`).

## Erfolgsseite (`/lizenz-erfolg`)

Nach der Zahlung leitet Stripe auf **deine lokale URL** zurück (z. B. `http://localhost:5177/lizenz-erfolg?session_id=…`).  
Die App ruft **`/api/get-licence-by-session`** auf. Lokal gibt es dafür **keinen** eigenen Handler – die Lizenzzeile entsteht erst, wenn der **Webhook** `checkout.session.completed` die API **`webhook-stripe`** auf **Vercel** erreicht und Supabase beschreibt.

**Optional:** In `.env` zusätzlich setzen:

```bash
STRIPE_PROXY_GET_LICENCE_ORIGIN=https://k2-galerie.vercel.app
```

Dann leitet der Dev-Server **GET** `/api/get-licence-by-session` an Production weiter. Das liefert Daten nur, wenn derselbe **Test-Checkout** bei Stripe den **Vercel-Webhook** ausgelöst hat (Stripe Webhook-URL muss auf Vercel zeigen, Testmodus).

**Zuverlässigster kompletter Test:** Kauf direkt auf **https://k2-galerie.vercel.app** (gleiche Testkarte), dann sind Checkout, Webhook und Erfolgsseite eine Kette.

## Abbrechen (Cancel)

Die Cancel-URL zeigt auf **`/projects/k2-galerie/lizenz-kaufen`** (lokal und auf Vercel).

## Preise

Zent in `api/createCheckoutShared.js` müssen mit `src/config/licencePricing.ts` übereinstimmen – bei Preisänderung **beide** anpassen.
