# Dialog-Stand

| Feld | Inhalt |
|------|--------|
| **Datum** | 23.02.26 |
| **Thema** | VK2 Willkommensseite: 3 Bugs behoben |
| **Was zuletzt** | VK2 Vorschau-Seite: K2-Werke haben Mitglieder überschrieben (2 useEffects ohne vk2-Schutz). `if (vk2) return` in beiden Lade-useEffects von GalerieVorschauPage.tsx eingefügt. Commit 1225f2d Push ✅ |
| **Nächster Schritt** | VK2-Mitglieder-Seite testen: /projects/vk2/galerie-vorschau – sollte jetzt 6 Mitglieder (Kunstverein Muster) zeigen, keine K2-Werke mehr. |
| **Wo nachlesen** | `src/pages/GalerieVorschauPage.tsx` – Zeile 800: `if (vk2) return () => {}`, Zeile 1296: `if (musterOnly || vk2) return` |
