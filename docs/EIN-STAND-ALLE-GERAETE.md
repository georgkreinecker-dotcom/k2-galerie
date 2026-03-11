# Ein Stand auf allen Geräten – wenn jedes Gerät andere Bilder hat

**Situation:** Mac, iPad, Handy zeigen unterschiedliche Bilder oder **unterschiedlichen Programmstand** (z. B. Mac 16:53, Mobil 16:36). Du willst **einen** gemeinsamen Stand, ohne etwas zu löschen.

---

## Zuerst: Gleicher Programmstand (Stand-Zeit unten links)

Wenn **Mac** und **Mobil** unterschiedliche Zeiten zeigen (z. B. 16:53 vs. 16:36):

1. **Wo läuft der Mac?**  
   - Wenn du die App **im Browser auf localhost** (z. B. `localhost:5177`) offen hast: Dann ist 16:53 dein **lokaler** Build. Mobil zeigt, was **Vercel** ausliefert (16:36).  
   - **Lösung:** Auf dem Mac **dieselbe** Quelle wie Mobil nutzen: **https://k2-galerie.vercel.app** im Browser öffnen (nicht localhost). Dann zeigt der Mac denselben Stand wie Vercel (z. B. 16:36). Ab dann sind „beide auf Vercel“.

2. **Neuesten Stand auf Vercel haben:**  
   - Code **committen und auf main pushen** → Vercel baut. In Vercel unter Deployments prüfen: neues Deployment **Ready** und **Current**.

3. **Mobil auf neuesten Stand bringen:**  
   - **Stand-Badge tippen:** Unten links auf die angezeigte Zeit (z. B. „Stand: 16.36“) tippen → Seite lädt mit Cache-Bypass neu. Danach sollte die neue Zeit (z. B. 16:53) erscheinen.  
   - **Wenn es noch die alte Zeit zeigt:** QR-Code von der APf (Mission Control) **neu scannen** – der QR enthält Server-Stand + Cache-Bust.  
   - **Oder:** Auf dem Handy im Browser **https://k2-galerie.vercel.app/refresh.html** öffnen → leitet auf die neueste Version weiter.

4. **Favorit/Startseite auf dem Handy:**  
   - Wenn die Galerie als **Favorit** oder **Startseite** gespeichert ist, lädt Safari oft die **alte** URL. Favorit entfernen oder durch die **per aktuellem QR** geöffnete Seite ersetzen. Siehe **docs/VERCEL-STAND-HANDY.md**.

Erst wenn **überall dieselbe Stand-Zeit** steht: Daten-Sync (nächster Abschnitt).

---

## Checkliste: Gleichen Programmstand sicherstellen

**So stellst du sicher, dass Mac und Mobil die gleiche Version haben:**

| Schritt | Was du tust | Wozu |
|--------|-------------|------|
| 1 | **Vercel:** Neues Deployment auslösen (Redeploy oder Push auf main). Warten, bis **Ready** und **Current**. | Es gibt einen eindeutigen neuesten Stand (z. B. 17:12). |
| 2 | **Mac:** Im Cursor-Terminal **`npm run app`** ausführen (öffnet Vercel im Browser). Oder im Browser **https://k2-galerie.vercel.app** öffnen. Nicht localhost nutzen, wenn du denselben Stand wie Handy willst. | Mac lädt dieselbe Version wie Vercel/Handy. Development nur mit **`npm run dev`** (localhost). |
| 3 | **Mobil:** **Stand-Badge** tippen (unten links). Oder: QR von der APf **neu scannen**. Oder: **https://k2-galerie.vercel.app/refresh.html** im Browser öffnen. | Mobil holt die gleiche Version von Vercel, kein alter Cache. |
| 4 | **Prüfen:** Auf **beiden** Geräten unten links die **gleiche** Zeit (z. B. „Stand: 11.03.26 17:12“). | Wenn identisch → gleicher Programmstand. |

**Danach** kannst du Daten-Sync machen (ein Gerät senden, andere laden).

---

## Wo du anfängst (Reihenfolge) – Daten auf einen Stand

### 1. Entscheiden: Welches Gerät ist die „Quelle“?

- Wähle **ein** Gerät, das die **vollständigsten / richtigen** Bilder hat (z. B. das, auf dem du zuletzt die meisten Fotos gemacht oder bearbeitet hast).
- Das wird die **einzige Quelle** – von dort kommt der Stand für alle.

### 2. Auf dem Quell-Gerät: An Server senden

- Auf **genau diesem** Gerät: **Admin** (oder Galerie-Vorschau) → **Einstellungen** → **„An Server senden“** / **„Veröffentlichen“**.
- Warten, bis die Meldung kommt (z. B. „Veröffentlicht … X Werke, Y mit Bild“).
- Damit liegt **ein** Stand mit allen Bild-URLs, die dieses Gerät hat, auf dem Server (Vercel Blob).

### 3. Auf allen anderen Geräten: Aktuellen Stand holen

- **Mac:** Admin oder Galerie-Vorschau → **„Aktuellen Stand holen“** / **„Vom Server laden“**.
- **iPad / Handy:** Ebenfalls **„Aktuellen Stand holen“** (oder „Vom Server laden“).
- **Nicht** auf dem Quell-Gerät nochmal „Aktuellen Stand holen“ direkt nach dem Senden – da ist der Stand schon aktuell.

### 4. Prüfen

- Auf jedem Gerät: Galerie oder Admin öffnen – Werke und Bilder sollten **gleich** sein (der Stand vom Quell-Gerät).
- Wenn auf einem Gerät noch Platzhalter sind: dort **einmal** Stand-Badge tippen oder Seite neu laden (Cache), dann erneut „Aktuellen Stand holen“.

---

## Wichtig

- **Immer zuerst** vom Gerät mit den besten Daten **senden**, **danach** auf den anderen **laden**. Nie umgekehrt (sonst überschreibst du den besseren Stand mit einem unvollständigen).
- **Kein Löschen** – du ersetzt nur den **lokalen** Stand durch den **Server-**Stand. Der Server-Stand ist der, den du in Schritt 2 vom Quell-Gerät geschickt hast.
- Optional: Vor Schritt 2 auf dem Quell-Gerät ein **Backup** machen (Admin → Einstellungen → Backup & Wiederherstellung), falls du später etwas vergleichen willst.

---

## Kurz

1. **Quell-Gerät** wählen (vollständigste Bilder).  
2. **Dort:** „An Server senden“.  
3. **Überall anders:** „Aktuellen Stand holen“.  
4. **Prüfen** – überall derselbe Stand.
