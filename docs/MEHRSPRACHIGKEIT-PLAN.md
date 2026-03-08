# Mehrsprachigkeit – Plan (gezielt und mit Struktur)

**Stand:** 08.03.26  
**Zweck:** Klarheit, wo Mehrsprachigkeit gilt, in welcher Reihenfolge wir vorgehen und was noch fehlt. Verknüpfung: docs/MEHRSPRACHIGKEIT.md (Grundstein Technik).

---

## Verbindliche Reihenfolge

**Mehrsprachigkeit ist mitgeplant, kommt aber erst, wenn in Deutsch alles läuft.**

- **Jetzt:** Kommunikations-Struktur auf Deutsch nach Sportwagenmodus ausarbeiten (ein Zweck = ein Dokument, eine Quelle). Siehe docs/KOMMUNIKATION-DOKUMENTE-STRUKTUR.md.
- **Später:** Wenn alle DE-Vorlagen (Presse, Ansprache, Flyer, E-Mails) stehen und genutzt werden: pro Vorlage bei Bedarf zweite Sprachversion (z. B. EN) – gleiche Struktur, eine Quelle pro Sprache. App-UI: strings.en + Sprachumschalter erst nachdem DE-UI konsistent auf t(key) umgestellt ist.

---

## 1. Wo soll Mehrsprachigkeit gelten? (zuerst klären)

| Bereich | Inhalt | Aktuell | Ziel (z. B. DE + EN) |
|--------|--------|--------|------------------------|
| **App-UI** | Buttons, Menüs, Meldungen, Admin, Galerie-Oberfläche | Nur DE (strings.de.ts, Rest fest im Code) | UI-Texte über t(key), zweite Sprache (z. B. EN) optional |
| **Galerie-Inhalte** | Willkommenstext, Vita, Werktitel, Beschreibungen | Pro Mandant/Künstler:in frei wählbar (eine Sprache pro Eintrag) | Optional: Anzeige pro Besucher-Sprache (komplexer) oder weiter eine Sprache pro Galerie |
| **Kommunikation (Presse, Flyer, E-Mails)** | Pressevorlagen, Ansprache, E-Mail-Vorlagen, Flyer-Text | Alles Deutsch | Wo nötig: zweite Version (z. B. EN) als eigenes Dokument oder Abschnitt „English“ |

**Empfehlung zur Priorität:**  
- **App-UI:** Grundstein ist gelegt (localeConfig, i18n, strings.de). Nächster Schritt: weitere Bereiche schrittweise auf t(key) umstellen, dann strings.en.ts befüllen + Sprachumschalter.  
- **Kommunikation:** Zuerst alle Dokumente auf Deutsch fertig und strukturiert (siehe docs/KOMMUNIKATION-DOKUMENTE-STRUKTUR.md). Wo du international kommunizierst (z. B. Presse EN, E-Mail an ausländische Piloten): pro Dokument eine **zweite Sprachversion** anlegen (z. B. „Presseinformation EN“, „Ansprache Künstler EN“) – eine Quelle pro Sprache, keine Mischung in einer Datei.

---

## 2. Technik (App) – was steht, was fehlt

| Schritt | Status | Was konkret |
|--------|--------|-------------|
| Locale-Config, getLocale/setLocale | ✅ | src/config/localeConfig.ts |
| t(key), Fallback DE | ✅ | src/i18n/index.ts, strings.de.ts |
| Erste UI-Bereiche mit t(key) | ✅ | z. B. Medienspiegel |
| Weitere UI-Bereiche auf t(key) umstellen | ⏳ | Schrittweise: gemeinsame Buttons, dann Admin, dann Galerie |
| strings.en.ts (gleiche Keys) | ❌ | Noch nicht angelegt |
| Sprachumschalter (Einstellungen/Header) | ❌ | Noch nicht; nach strings.en |
| Locale pro Mandant (optional) | ❌ | Später, wenn gewünscht |

**Reihenfolge Technik:**  
1. Weitere wichtige UI-Texte in strings.de.ts aufnehmen und im Code durch t(key) ersetzen.  
2. strings.en.ts anlegen, gleiche Keys, englische Texte.  
3. In i18n/index.ts messages.en eintragen.  
4. Sprachumschalter einbauen (setLocale + Reload oder Context).  
5. Optional: Tenant-Config „Sprache“ für Mandanten.

---

## 3. Kommunikation (Dokumente) – Mehrsprachigkeit

**Prinzip:** Eine Quelle pro Sprache. Kein Gemisch in einer Datei (außer kurze zweisprachige Hinweise).

| Dokument / Vorlage | Deutsch | Englisch (oder andere) |
|--------------------|---------|--------------------------|
| Presseinformation | SICHTBARKEIT-PHASE1 §6, MEDIENSTUDIO | Wenn nötig: eigene Vorlage „Presseinformation EN“ oder Abschnitt in MEDIENSTUDIO |
| Ansprache Künstler:in/Verein | Wenn ausgearbeitet: eine DE-Vorlage | Bei Bedarf: gleiche Struktur, EN-Version |
| E-Mail-Vorlagen (nach Kauf, Einladung) | Eine DE-Datei/Sektion | Bei Bedarf: EN-Version |
| Flyer/Handout | Eine DE-Vorlage (druckfertig) | Optional: EN-Version für internationale Messen |

**Was du entscheidest:** Wo brauchst du wirklich eine zweite Sprache? (Regional starten = oft DE reicht; internationale Piloten oder Presse = EN ergänzen.)

---

## 4. Nächste Schritte (zum Abhaken)

**Mehrsprachigkeit App:**  
- [ ] Priorität setzen: Welche Bereiche der App zuerst auf t(key) umstellen? (Vorschlag: common.*, dann ein weiterer Bereich wie Admin-Tabs.)  
- [ ] strings.en.ts anlegen und mit Übersetzungen füllen (gleiche Keys wie strings.de).  
- [ ] Sprachumschalter in der App (Einstellungen oder Header) einbauen.

**Mehrsprachigkeit Kommunikation:**  
- [ ] Kommunikations-Dokumente auf DE fertig ausarbeiten (siehe KOMMUNIKATION-DOKUMENTE-STRUKTUR).  
- [ ] Festlegen: Für welche Vorlagen/Dokumente wird eine zweite Sprache (z. B. EN) gebraucht?  
- [ ] Pro gewünschte Vorlage: zweite Sprachversion als eigene Datei oder klarer Abschnitt anlegen.

---

## 5. Verknüpfungen

| Thema | Datei |
|-------|--------|
| Technik Grundstein | docs/MEHRSPRACHIGKEIT.md |
| Dieser Plan | docs/MEHRSPRACHIGKEIT-PLAN.md |
| Kommunikation Struktur | docs/KOMMUNIKATION-DOKUMENTE-STRUKTUR.md |
| Vision / nächste Schritte | docs/VISION-UMSETZEN-NÄCHSTE-SCHRITTE.md |

**Kurz:** Mehrsprachigkeit ist technisch vorbereitet. Plan: (1) klären, wo DE+EN nötig ist (App vs. Kommunikation), (2) App: strings.en + Umschalter, (3) Kommunikation: DE zuerst fertig, dann pro Vorlage bei Bedarf EN-Version.
