# Sicherheit: Lizenznehmer – kein Zugriff auf ök2/VK2 (100 % abgesichert)

## Grundsatz

**Erst durch die Lizenzerteilung erhält der Nutzer einen Clone der App, den er verwenden kann – aber niemals Zugriff auf die ök2- oder VK2-Struktur.** Das ist 100 % abgesichert. Auch Hackerangriffe von Userseite werden durch eiserne Regeln verhindert.

---

## 1. Wer hat Zugriff worauf?

| Instanz | Hostnamen (Beispiele) | ök2 (Demo) | VK2 (Vereinsplattform) | K2 / eigene Galerie |
|--------|------------------------|------------|------------------------|----------------------|
| **Plattform (kgm)** | localhost, k2-galerie.vercel.app, kgm.at | ✅ | ✅ | ✅ |
| **Lizenznehmer (Clone)** | Eigene Domain/Subdomain nach Lizenz | ❌ | ❌ | ✅ (nur eigene) |

- **ök2** = öffentliche Demo-Galerie (Musterwerke, Demo für Piloten/Lizenzinteressenten).
- **VK2** = Vereinsplattform (Mitglieder, Katalog, Admin mit PIN).
- Beide sind **nur auf der Plattform-Instanz** erreichbar. Auf einer Lizenznehmer-Instanz existieren die Routen und der Kontext „oeffentlich“/„vk2“ nicht.

---

## 2. Technische Absicherung

### 2.1 Plattform-Instanz-Erkennung

- **Quelle:** `src/config/tenantConfig.ts`  
  `PLATFORM_HOSTNAMES` = Liste der Hostnamen, auf denen die volle Plattform läuft (z. B. localhost, k2-galerie.vercel.app, kgm.at).  
  `isPlatformInstance()` = true nur, wenn `window.location.hostname` in dieser Liste ist.

- **Lizenznehmer-Deployment:** Wenn die App unter einer anderen Domain/Subdomain läuft (z. B. nach Lizenz eigener QR/URL), ist es keine Plattform-Instanz → ök2/VK2 sind nicht verfügbar.

### 2.2 TenantContext (Kontext niemals erzwingbar)

- **Datei:** `src/context/TenantContext.tsx`
- **Regel:** Wenn `!isPlatformInstance()`:
  - `deriveTenantId`: URL-Parameter `?context=oeffentlich` und `?context=vk2` werden **ignoriert** → Ergebnis immer `'k2'`.
  - `syncStorageFromUrl`: Es wird **nie** `'oeffentlich'` oder `'vk2'` in sessionStorage geschrieben; falls bereits vorhanden, wird auf `'k2'` zurückgesetzt.
  - `getTenantFromStorage`: Gibt auf Nicht-Plattform immer `'k2'` zurück.

- **Folge:** Auch bei direkter URL-Eingabe (z. B. `/admin?context=oeffentlich`) oder Manipulation der Parameter erhält ein Lizenznehmer nie den Kontext ök2 oder VK2.

### 2.3 Routen-Guard (ök2/VK2 nur auf Plattform)

- **Komponente:** `src/components/PlatformOnlyRoute.tsx`
- **Verwendung:** Alle Routen zu ök2 (galerie-oeffentlich, galerie-oeffentlich-vorschau) und zu VK2 (alle `/projects/vk2/*`, VK2-Login) sind mit `<PlatformOnlyRoute>` gewrappt.
- **Verhalten:** Wenn `!isPlatformInstance()`, Redirect auf Start (`/`). Es werden keine ök2-/VK2-Seiten gerendert, keine Daten geladen.

### 2.4 Sichere Mandanten-ID aus URL (tenantId)

- **Bereits umgesetzt:** `getDynamicTenantIdFromUrl` in TenantContext akzeptiert nur `a-z0-9-`, 1–64 Zeichen. Die Werte `k2`, `oeffentlich`, `vk2` sind ausgeschlossen → kein Umgehen über `?tenantId=oeffentlich`.

---

## 3. Hacker-Abwehr (von Userseite)

- **URL/Parameter:** Kontext für ök2/VK2 wird nur auf der Plattform-Instanz aus der URL übernommen. Auf jeder anderen Instanz: keine Wirkung.
- **Kein eval() / keine dynamische Code-Ausführung** aus User-Eingaben (Projekt-Standard).
- **Eingabevalidierung:** Wo User-Daten in Speicher oder API gehen – Länge, Zeichensatz, keine Skript-Injection. Bei neuen Formularen/Parametern prüfen.
- **localStorage:** Auf Lizenznehmer-Instanz wird der Kontext nie `oeffentlich` oder `vk2` → Schreibzugriffe in Keys wie `k2-oeffentlich-*` oder `k2-vk2-*` erfolgen nicht aus dem normalen Ablauf (TenantContext liefert nur K2 bzw. dynamischen Mandanten).

---

## 4. Neue Hostnamen für die Plattform

Wenn die Plattform unter einem weiteren Hostnamen betrieben wird, diesen in `PLATFORM_HOSTNAMES` in `src/config/tenantConfig.ts` aufnehmen. Nur diese Hostnamen haben Zugriff auf ök2 und VK2.

---

## 5. Verknüpfung

- **Eiserne Regel:** .cursor/rules/eiserne-regel-lizenznehmer-kein-oek2-vk2.mdc  
- **Besucher-Sperre (Eingaben):** .cursor/rules/eiserne-regel-besucher-keine-eingaben.mdc, docs/SICHERHEIT-BESUCHER-KEINE-EINGABEN.md  
- **K2/ök2 Datentrennung:** .cursor/rules/k2-oek2-eisernes-gesetz-keine-daten.mdc  
