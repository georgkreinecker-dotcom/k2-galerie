# Hilfe bei aufgebrauchtem OpenAI API-Konto

## Was ist passiert?

Die wiederholten Abstürze und fehlgeschlagenen Versuche haben wahrscheinlich viele unnötige API-Aufrufe verursacht, die dein OpenAI-Konto aufgebraucht haben.

## Sofort-Maßnahmen

### 1. OpenAI-Konto aufladen

**Schritte:**
1. Gehe zu: https://platform.openai.com/account/billing
2. Klicke auf "Add payment method" oder "Add credits"
3. Füge eine Zahlungsmethode hinzu (Kreditkarte, PayPal, etc.)
4. Setze ein **Usage Limit** (z.B. $10/Monat), um unerwartete Kosten zu vermeiden

### 2. Aktuelle Nutzung prüfen

**Schritte:**
1. Gehe zu: https://platform.openai.com/usage
2. Sieh dir an:
   - Wie viele Tokens wurden verwendet?
   - Welche Modelle wurden verwendet?
   - Wann wurden die meisten Aufrufe gemacht?

### 3. API-Key prüfen

**In der K2 Galerie:**
- Gehe zu: `/key` (API-Key Seite)
- Oder: Control Studio → KI-Agent → OpenAI API-Key
- Prüfe ob der Key noch gültig ist

## Kosten reduzieren

### 1. Günstigeres Modell verwenden

**Aktuell:** `gpt-4o-mini` (bereits günstig)
- Input: $0.15 pro 1M Tokens
- Output: $0.60 pro 1M Tokens

**Noch günstiger:** `gpt-3.5-turbo` (falls verfügbar)
- Input: $0.50 pro 1M Tokens
- Output: $1.50 pro 1M Tokens

**⚠️ WICHTIG:** `gpt-4o-mini` ist bereits das günstigste moderne Modell!

### 2. Usage Limits setzen

**In OpenAI Dashboard:**
1. Gehe zu: https://platform.openai.com/account/limits
2. Setze **Hard Limits**:
   - Monthly spending limit: z.B. $10 oder $20
   - Rate limits: z.B. 100 Requests/Minute

### 3. API-Aufrufe optimieren

**Was wir bereits gemacht haben:**
- ✅ Timeouts für alle API-Aufrufe (verhindert hängende Requests)
- ✅ AbortController (bricht fehlgeschlagene Anfragen ab)
- ✅ Keine automatischen Polling-Schleifen mehr

**Was du tun kannst:**
- Verwende den KI-Dialog sparsam
- Vermeide sehr lange Konversationen (jede Nachricht kostet Tokens)
- Nutze den Control Studio nur wenn nötig

## Kostenüberwachung

### In der K2 Galerie

**Kosten-Seite anzeigen:**
1. Gehe zu: `/kosten` (Kosten-Seite)
2. Sieh dir an:
   - Geschätzte Kosten basierend auf lokaler Nutzung
   - Token-Verbrauch
   - Kosten-Schätzung in USD

**⚠️ WICHTIG:** Die Anzeige in der App ist nur eine Schätzung!
**Echte Kosten siehst du bei:** https://platform.openai.com/usage

### Regelmäßig prüfen

**Empfehlung:**
- Einmal pro Woche: https://platform.openai.com/usage prüfen
- Bei ungewöhnlich hohen Kosten: Sofort Limits setzen

## Was hat die Kosten verursacht?

**Hauptursachen:**
1. **Automatische Polling-Schleifen** (bereits behoben)
   - Alle 2 Sekunden für bis zu 3 Minuten
   - Viele unnötige API-Aufrufe

2. **Fehlgeschlagene Requests ohne Timeout** (bereits behoben)
   - Hängende Anfragen wurden wiederholt
   - Keine Abbruch-Mechanismen

3. **Wiederholte Debug-Versuche** (bereits behoben)
   - Jeder Absturz führte zu neuen Versuchen
   - Keine Fehlerbehandlung

**Jetzt behoben:**
- ✅ Alle Requests haben Timeouts
- ✅ AbortController für alle Anfragen
- ✅ Keine automatischen Hintergrund-Prozesse
- ✅ Bessere Fehlerbehandlung

## Nächste Schritte

1. **Konto aufladen:**
   - https://platform.openai.com/account/billing
   - Setze ein Usage Limit!

2. **Nutzung prüfen:**
   - https://platform.openai.com/usage
   - Sieh dir an, was die meisten Kosten verursacht hat

3. **Limits setzen:**
   - https://platform.openai.com/account/limits
   - Hard Limits für monatliche Ausgaben

4. **Weiterarbeiten:**
   - Die App sollte jetzt stabiler sein
   - Weniger unnötige API-Aufrufe
   - Bessere Fehlerbehandlung

## Alternative: Lokale KI-Modelle

**Falls OpenAI zu teuer wird:**
- **Ollama** (lokal, kostenlos)
- **LM Studio** (lokal, kostenlos)
- **Anthropic Claude** (andere API, ähnliche Preise)

**Aber:** Diese sind nicht in die K2 Galerie integriert und würden Code-Änderungen erfordern.

## Zusammenfassung

**Sofort tun:**
1. ✅ Konto aufladen: https://platform.openai.com/account/billing
2. ✅ Limits setzen: https://platform.openai.com/account/limits
3. ✅ Nutzung prüfen: https://platform.openai.com/usage

**Langfristig:**
- Die App ist jetzt stabiler → weniger unnötige API-Aufrufe
- Timeouts verhindern hängende Requests
- Bessere Fehlerbehandlung verhindert wiederholte Versuche

**Wichtig:** Setze immer ein Usage Limit, um unerwartete Kosten zu vermeiden!
