# Tenant-Sync und Domänen-Struktur (K2, ök2, VK2)

## Grundsatz

Alle für K2 implementierten Funktionen (Veröffentlichen, „Bilder vom Server laden“, Sync) gelten **tenantfähig** für alle Mandanten: K2, ök2, VK2. Keine „nur K2“-Ausnahmen ohne technische Notwendigkeit. Die Architektur ist von vornherein so angelegt, dass weitere Mandanten (z. B. Lizenznehmer) ergänzt werden können.

---

## 1. Tenant-Sync (Veröffentlichen / Vom Server laden)

- **Backend:** Pro Mandant ein eigener Blob in Vercel:
  - K2: `gallery-data.json` (Abwärtskompatibilität)
  - ök2: `gallery-data-oeffentlich.json`
  - VK2: `gallery-data-vk2.json`
- **API:** GET und POST akzeptieren `tenantId` (Query bzw. im Body). Ein Aufruf = ein Mandant.
- **Frontend:** „Veröffentlichen“ und „Bilder vom Server laden“ sind für K2, ök2 und VK2 aktiv; der aktive Kontext bestimmt den `tenantId`.
- **VK2:** Hat keine Werke (nur Stammdaten, Events, Dokumente, Design). Payload = Backup-Format (z. B. aus `createVk2Backup()`), Merge/Laden schreibt in `k2-vk2-*`-Keys.

---

## 2. Domänen-Struktur (tenantId-Herkunft)

- **Heute:** `tenantId` kommt aus **Kontext** (URL `?context=oeffentlich` / `context=vk2`, Session, aktiver Tab).
- **Später (Lizenznehmer):** Optional Herkunft aus **URL** (Subdomain oder Pfad), z. B. `publicBaseUrl` pro Mandant in `tenantConfig.ts`. Routing und API sind so gebaut, dass `tenantId` aus einer **einzigen, definierten Quelle** kommt (Kontext oder später URL), nicht hardcodet.
- **Regel:** Nichts so bauen, das „nur k2/oeffentlich/vk2“ fest verdrahtet; überall `tenantId` aus zentraler Quelle nutzen.

---

## 3. Sicherheit (später)

- **Aktuell:** Client sendet `tenantId` mit; für K2/ök2/VK2 (Demo/Betrieb) akzeptabel.
- **Zahlende Mandanten:** Schreibzugriff nur, wenn der Nutzer zu diesem `tenantId` berechtigt ist (Auth + Prüfung). **Regel:** `tenantId` nur aus vertrauenswürdiger Quelle; Schreibzugriff später auth-geprüft.

---

## 4. VK2-Besonderheiten

- VK2 = ein Mandant (ein Verein), ein Blob `gallery-data-vk2.json`. Keine Werke, nur Stammdaten (Verein, Mitglieder), Events, Dokumente, Design, Seitentexte.
- Mehrere Vereine (mehrere VK2-Mandanten) wären später über eigenen `tenantId` pro Verein (z. B. `vk2-verein-xyz`) abbildbar; gleiche API, anderer Blob-Pfad.

---

## Siehe auch

- [STRUKTUR-HANDELN-QUELLEN.md](STRUKTUR-HANDELN-QUELLEN.md)
- [K2-OEK2-DATENTRENNUNG.md](K2-OEK2-DATENTRENNUNG.md)
- [dokumente-kontext-eine-quelle.mdc](../.cursor/rules/dokumente-kontext-eine-quelle.mdc)
