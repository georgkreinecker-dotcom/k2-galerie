# ✅ Edge Function Secrets - Klarstellung

## 🎯 WICHTIG: Secrets NICHT nötig!

Die Warnung sagt: **"Name must not start with the SUPABASE_ prefix"**

Das bedeutet: `SUPABASE_URL` und `SUPABASE_ANON_KEY` werden **automatisch** von Supabase bereitgestellt!

**Du musst sie NICHT als Secrets setzen!**

---

## ✅ Was Supabase automatisch bereitstellt:

- ✅ `SUPABASE_URL` - Automatisch verfügbar
- ✅ `SUPABASE_ANON_KEY` - Automatisch verfügbar
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Automatisch verfügbar
- ✅ `SUPABASE_DB_URL` - Automatisch verfügbar

**Die Edge Function kann diese direkt verwenden!**

---

## 🔍 Problem: Warum funktioniert es nicht?

Wenn die Edge Function trotzdem nicht funktioniert, könnte es sein:

1. **Edge Function nicht korrekt deployed**
2. **Edge Function Code hat Fehler**
3. **App kann Edge Function nicht erreichen**

---

## 🔧 Lösung: Edge Function prüfen

### Schritt 1: Edge Function Logs prüfen

1. **Supabase Dashboard** → **Edge Functions** → **artworks**
2. **Tab:** **Logs**
3. **Werk speichern** in der App
4. **Prüfen:** Kommt ein Request an?

**Falls JA:**
- ✅ Edge Function wird aufgerufen
- Prüfe ob Fehler in Logs

**Falls NEIN:**
- ❌ Edge Function wird nicht aufgerufen
- Problem: App kann Edge Function nicht erreichen

---

### Schritt 2: Edge Function Code prüfen

1. **Supabase Dashboard** → **Edge Functions** → **artworks**
2. **Tab:** **Code**
3. **Prüfe:** Ist der Code korrekt?

**Der Code sollte so aussehen:**

```typescript
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
```

**Diese Werte werden automatisch bereitgestellt!**

---

### Schritt 3: Edge Function testen

1. **Supabase Dashboard** → **Edge Functions** → **artworks**
2. **Tab:** **Test** oder **Invoke**
3. **Test ausführen**
4. **Prüfen:** Funktioniert es?

---

## 📋 Bitte prüfe:

1. **Edge Function Logs:** Kommt Request an? (Ja/Nein)
2. **Edge Function Code:** Ist Code korrekt? (Ja/Nein)
3. **Edge Function Test:** Funktioniert Test? (Ja/Nein)

Mit diesen Infos kann ich gezielt helfen!
