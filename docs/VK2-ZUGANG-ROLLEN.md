# VK2: Admin-Zugang und Rollen (gegendert)

**Stand:** 20.02.26

---

## Rollen und Zugriff

- **Vollzugang zum VK2-Admin** haben nur:
  - **Vorsitzende:r / Präsident:in**
  - **Kassier:in**

- **Vereinsmitglieder** (alle anderen) haben einen **beschränkten Admin-Zugang**:
  - Sie können **ihre eigenen persönlichen Daten** bearbeiten.
  - Sie haben Zugang zu den **Mitgliederlisten**, die sie selbst nutzen (z. B. registrierte / nicht registrierte Mitglieder – soweit für ihre Tätigkeit vorgesehen).
  - Kein Zugriff auf Verein/Vorstand/Beirat-Stammdaten, keine Nutzer-Übernahme, keine Einstellungen außer den genannten Ausnahmen.

---

## Formulierungen

Alle sichtbaren Texte und Bezeichnungen im VK2-Bereich sind **gegendert** (geschlechtsneutral), z. B.:

- Vorsitzende:r / Präsident:in  
- Kassier:in  
- Schriftführer:in  
- Beisitzer:in  
- Stellv. Vorsitzende:r (Vize)  
- Vereinsmitglieder, Mitgliederlisten, etc.

---

## Technische Umsetzung (später)

- Rollen-Zuordnung: z. B. Verknüpfung User ↔ Rolle (Vorsitzende:r, Kassier:in, Mitglied).
- Beim Login / Kontext: Prüfung der Rolle; nur bei „Vollzugang“ alle Admin-Bereiche anzeigen; sonst nur „eigene Daten“ + „Mitgliederlisten“.
- Stammdaten-Variante für beschränkten Zugang: Nur eigenes Profil bearbeitbar; Listen nur lesbar oder nach klaren Regeln nutzbar.

Diese Logik ist im Code noch nicht umgesetzt – das Admin-UI zeigt derzeit für alle den vollen Umfang. Die Rollenlogik soll bei der Einführung von Auth/Mandanten-Zuordnung ergänzt werden.
