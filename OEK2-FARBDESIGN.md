# ök2 – Farbdesign (Wohlbefinden & Verweildauer)

## Optischer Unterschied

- **K2 Galerie** (deine Galerie): Dunkles Theme mit Cyan-Akzent (#5ffbf1), kühle Töne, hoher Kontrast.
- **ök2** (Öffentliche K2 Galerie / Muster): Helles, warmes Theme mit Sage-/Teal-Akzent, gedämpfte Töne.

So ist auf einen Blick erkennbar, ob man in der eigenen K2-Galerie oder in der öffentlichen ök2-Ansicht ist.

## Wissenschaftliche Basis

Das ök2-Farbschema ist an Erkenntnissen aus Farbpsychologie und UX-Studien ausgerichtet, damit Besucher:innen gerne verweilen und sich wohlfühlen:

- **Blau/Grün** wirken beruhigend (parasympathisches Nervensystem).
- **Gedämpfte Töne** (kein Neon) reduzieren Stress und sensorische Überlastung.
- **Warme Off-Whites/Creme** (#f6f4f0, #ebe7e0) wirken einladend und komfortabel.
- **Sanfte Kontraste** schonen die Augen bei längerem Betrachten.
- **Sage/Teal** (#5a7a6e) als Akzent: ruhig, natürlich, vertrauensfördernd.

Quellen u. a.: Studien zu „calming hues“ in öffentlichen Räumen, räumlicher Farbwirkung und Nutzerpräferenz (z. B. Frontiers in Psychology 2020), sowie UX-Farbpsychologie.

## Technik

- **Konfiguration:** `src/config/ok2Theme.ts` (OK2_THEME, getOk2ThemeCssVars).
- **Anwendung:** Routen `galerie-oeffentlich` und `galerie-oeffentlich-vorschau` werden in `App.tsx` mit `Ok2ThemeWrapper` umschlossen, der die CSS-Variablen setzt.
- **K2-Standard:** `:root` in `src/index.css` definiert die K2-Dark-Variablen; Admin-Design-Einstellungen überschreiben sie bei Bedarf.

Die gleichen CSS-Variablen (--k2-bg-1, --k2-text, --k2-accent, …) werden in beiden Kontexten genutzt – einmal mit K2-Werten, einmal mit ök2-Werten.
