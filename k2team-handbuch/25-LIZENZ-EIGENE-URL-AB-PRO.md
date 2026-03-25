# 25. Lizenz: Eigene URL ab Pro (Custom Domain)

**Ziel:** Ab **Pro** hat ein Lizenznehmer **seine eigene öffentliche URL** (eigene Domain oder Subdomain). Diese URL ist die **eine Adresse**, die man auf Flyer/QR/Google/Visitenkarte druckt.

---

## Was bedeutet „eigene URL“ konkret?

- **Eigene URL** = die feste Internet-Adresse der Galerie dieses Lizenznehmers, z. B. `https://galerie-mueller.at` oder `https://mueller.k2-galerie.app`
- Besucher sehen dort **nur diese Galerie** (keine APf, kein ök2, kein VK2).

---

## Was macht „Veröffentlichen“ – und was nicht?

- **Veröffentlichen** in der App heißt: Inhalte (Texte/Bilder/Werke) werden in den **Server-Stand dieser Instanz** geschrieben.
- **Veröffentlichen erzeugt keine neue URL.**  
  Eine URL entsteht erst durch **Deployment + Domain**.

Merksatz:
> **URL = Deployment/Domain.**  
> **Veröffentlichen = Inhalt auf diese URL.**

---

## Wie wird die Lizenz-Galerie im Netz sichtbar? (Ablauf)

### 1) Instanz/Deployment anlegen

- Für den Lizenznehmer gibt es eine **eigene Instanz** (Clone/Projekt) – getrennt von der Plattform.
- Diese Instanz wird im Internet gehostet (z. B. Vercel).

### 2) Domain/Subdomain verbinden

- Domain beim Provider: DNS-Eintrag auf das Hosting (z. B. Vercel).
- Hosting: Domain in den Projekt-Einstellungen hinterlegen (Custom Domain).

### 3) Basis-URL in der Instanz setzen (wichtig für QR/Links)

Damit QR-Codes, gedruckte Links und Werbemittel automatisch auf die richtige Domain zeigen, braucht die Instanz eine **Basis-URL**.

- In der Instanz (Vercel Environment) `VITE_APP_BASE_URL` auf die eigene Domain setzen, z. B.:
  - `https://galerie-mueller.at`

---

## Was passiert danach im Alltag?

- Der Lizenznehmer arbeitet im Admin, klickt **Veröffentlichen**.
- Besucher öffnen die **eigene URL**.
- Nach dem Deployment ist alles online; die Inhalte werden über die bestehenden Publish/Load-Abläufe synchron.

---

## Sicherheit (Kurz)

- Lizenznehmer-Instanzen sind **keine Plattform-Instanz** → ök2/VK2 sind dort gesperrt.
- Das ist eine eiserne Regel (siehe: `docs/SICHERHEIT-LIZENZNEHMER-KEIN-OEK2-VK2.md`).

