# Aufräum-Vorschlag (vorsichtig)

**Stand:** 06.03.26  
**Grundsatz:** Nur eindeutige Duplikate bereinigen; alles andere nur vorschlagen, nicht ohne Freigabe löschen.

---

## Bereits erledigt (dieser Lauf)

- **00-INDEX.md:** Doppelter Eintrag **MEHRSPRACHIGKEIT.md** entfernt (war zweimal unter „Produkt & Vision“).

---

## Optional – deine Entscheidung

### 1. reference-screenshots (47 PNG-Dateien)

- **Ort:** `reference-screenshots/` (bereits in .vercelignore, gehen nicht in den Build)
- **Inhalt:** Bildschirmfotos von Feb–März 2026 (z. B. für Bug-Reports, Vergleich)
- **Vorschlag:** Wenn du sie nicht mehr brauchst: Ordner komplett löschen oder nur die letzten 5–10 behalten, Rest löschen. Wenn unsicher: **nichts löschen**.

### 2. Ähnliche Crash-Regeln (.cursor/rules)

- **crash-waehrend-programmieren-niemals.mdc** und **crash-beim-programmieren-vermeiden.mdc** decken dasselbe Thema ab (Code 5, Preview, Cleanup, keine Reloads). Inhalt stark überlappend.
- **Vorschlag:** Optional eine der beiden behalten und die andere in sie zusammenführen (eine Regel, eine Datei). **Nicht** automatisch löschen – Regeln sind verbindlich; bei Unsicherheit beide lassen.

### 3. Docs mit Datum im Namen (historisch)

- **CRASH-INTENSIV-TEST-01-03-26.md** vs. **CRASH-INTENSIV-TEST.md** – evtl. ein Datums-Snapshot, der in die Haupt-Datei integriert werden könnte; danach die Datums-Datei löschbar.
- **SESSION-17-02-26-MOK2-LIZENZEN-REGELN.md** – reine Session-Notiz; wird noch in 00-INDEX geführt. Optional: behalten als Historie oder in DIALOG-STAND/Handbuch einarbeiten und Doc löschen.
- **BERICHT-ISTZUSTAND-SYNC-VERCEL-27-02-26.md** – wird von VERCEL-CHECKLISTE und SYNC-ABLAUF referenziert; **nicht löschen**, solange diese Verweise genutzt werden.

### 4. Status-Docs (FERTIG / COMPLETE)

- **FERTIG-README.md**, **IMPLEMENTATION-COMPLETE.md**, **MOBILE-SYNC-COMPLETE.md** – werden von SETUP-ANLEITUNG, NEXT-STEPS, FERTIG-SUPABASE referenziert. **Nicht löschen** ohne diese Verweise anzupassen.

---

## Was wir bewusst nicht anfassen

- **mök2 / VK2-Inhalte** (Regel mok2-vk2-inhalte-nicht-entfernen.mdc)
- **GELOESTE-BUGS, CRASH-BEREITS-GEPRUEFT, DIALOG-STAND** – zentrale Anker
- **Alle Einträge in 00-INDEX** (außer klare Duplikate) – nichts still aus dem Index streichen
- **Kundendaten / k2-* Keys** – keine „Bereinigung“ in localStorage oder Daten

---

## Nächster Schritt

Wenn du etwas davon umsetzen willst, sag z. B.: „reference-screenshots auf 10 neueste reduzieren“ oder „Crash-Regeln zusammenführen“. Sonst bleibt diese Liste nur als Vorschlag; nichts wird ohne dein OK gelöscht.
