# Mehrsprachigkeit – Grundstein

**Stand:** März 2026  
**Ziel:** App ist vorbereitet auf mehrere Sprachen (DE, EN, FR, …). Aktuell wird nur Deutsch genutzt; die Struktur steht.

---

## Was ist angelegt

### 1. Locale-Konfiguration (`src/config/localeConfig.ts`)

- **SUPPORTED_LOCALES:** Liste der Sprachen (de, en, fr) mit Anzeigenamen.
- **DEFAULT_LOCALE:** `'de'`.
- **getLocale()** / **setLocale():** Aktuelle Sprache lesen/setzen (später z. B. Sprachumschalter in Einstellungen).
- **LOCALE_STORAGE_KEY:** `k2-locale` – Nutzerwahl bleibt erhalten.

### 2. Übersetzungen (`src/i18n/`)

- **strings.de.ts:** Deutsche Texte als Schlüssel → Text (z. B. `medienspiegel.title`, `common.ok`).
- **index.ts:** Funktion **t(key)** – liefert Text für die aktuelle Locale, Fallback Deutsch.

**Nutzung im Code:**

```ts
import { t } from '../i18n'
// ...
<button>{t('common.save')}</button>
```

### 3. Erweiterung auf weitere Sprachen

1. Neue Datei anlegen: **strings.en.ts** (gleiche Keys, englische Texte).
2. In **i18n/index.ts** in `messages` eintragen: `en: stringsEn`.
3. Optional: Sprachumschalter in der App (z. B. Einstellungen) → `setLocale('en')` + Reload oder Context-Update.

---

## Nächste Schritte (wenn Mehrsprachigkeit kommt)

1. **UI schrittweise umstellen:** Feste deutsche Strings durch `t('key')` ersetzen (z. B. zuerst Medienspiegel, dann gemeinsame Buttons).
2. **strings.en.ts** (und ggf. **strings.fr.ts**) mit denselben Keys befüllen.
3. **Sprachwahl** anbieten (Einstellungen oder Header) und `setLocale()` nutzen; bei Bedarf React-Context für Re-Render nach Sprachwechsel.
4. **Tenant/Lizenz:** Optional Sprache pro Mandant (z. B. aus Tenant-Config) statt nur Nutzerwahl.

---

## Kurzfassung

- **Grundstein gelegt:** Locale-Config, t(key), deutsche Strings-Datei, Doku.
- **Aktuell:** Alles läuft weiter auf Deutsch; keine Pflicht, sofort alles umzustellen.
- **Später:** Weitere Sprachdateien + Sprachumschalter → App mehrsprachig nutzbar.
