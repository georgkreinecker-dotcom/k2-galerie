/**
 * Runway-Paket ~2 Min: deutsche Sprechertexte + englische Bild-Prompts pro Szene.
 * Eine Quelle für APf-Seite PromoRunwayPackPage und Doku-Verweise.
 * Runway führt keinen Code aus – Prompts manuell in Gen-3 (Multi-Shot / Auto) einfügen.
 */

export const PROMO_RUNWAY_PACK_VERSION = '2min-v1'

export type PromoRunwayShot = {
  index: number
  titleDe: string
  /** Richtwert für Schnitt / mehrere 10-s-Generierungen */
  secondsSuggested: number
  deVoiceover: string
  enRunwayPrompt: string
  /** Echte App: QuickTime-Route für Parallel-Material (optional) */
  oek2ScreenHint: string
}

/** Acht Szenen à ~15 s ≈ 2 Min gesprochen; Runway ggf. 10-s-Clips ketten */
export const PROMO_RUNWAY_SHOTS: PromoRunwayShot[] = [
  {
    index: 1,
    titleDe: 'Hook – viele Werkzeuge vs. eine Linie',
    secondsSuggested: 15,
    deVoiceover:
      'Viele Anbieter versprechen eine Website, ein Kassensystem und noch ein Tool für Werbung. Am Ende hängen Daten und Abläufe an unterschiedlichen Stellen. Hier geht es um eine Linie – ein System, das zusammenpasst.',
    enRunwayPrompt:
      'Cinematic motion graphics, 16:9, no people, no faces. Cold open: several floating glass tiles and loose UI fragments drift in grey space like disconnected tools. They align and snap into one calm horizontal ribbon of light — one unified system. Soft charcoal and deep blue palette, subtle cyan accent. Smooth easing, professional B2B trailer mood. No readable text, no logos, no watermarks.',
    oek2ScreenHint: 'Kein Screen nötig; abstrakter Einstieg.',
  },
  {
    index: 2,
    titleDe: 'Schaufenster – öffentliche Galerie',
    secondsSuggested: 15,
    deVoiceover:
      'Ein Schaufenster für Ihre Werke: die öffentliche Galerie mit Willkommensbereich und Werken. So sehen Besucherinnen und Besucher klar, was Sie zeigen – ohne technisches Vorwissen.',
    enRunwayPrompt:
      'Elegant minimalist mockup of an art gallery website inside a floating browser window: large calm hero area, grid of framed artwork thumbnails as abstract color blocks, generous whitespace, subtle parallax. Warm gallery lighting on the “screen”, soft shadows. European product design, no photos of real people, no legible text — only blurred UI bars. 16:9, shallow depth of field.',
    oek2ScreenHint: '/projects/k2-galerie/galerie-oeffentlich — kurz scrollen, Willkommen + Werke',
  },
  {
    index: 3,
    titleDe: 'Zentrale – Admin-Hub',
    secondsSuggested: 15,
    deVoiceover:
      'Dazu die Zentrale zum Verwalten: Werke, Gestaltung, Einstellungen — aus einer Oberfläche. Nicht lose gekoppelt, sondern zusammen gedacht, damit Sie sich nicht in fünf Welten verzetteln.',
    enRunwayPrompt:
      'Transition to a modern admin dashboard: rounded cards in a neat grid, soft icons suggesting works, design, settings — no readable labels, only blurred glyphs. Calm hover highlight on one card. Dark UI with restrained teal highlights, glassy depth, 16:9, slow camera push-in, no humans.',
    oek2ScreenHint: '/admin?context=oeffentlich — Hub-Kacheln sichtbar',
  },
  {
    index: 4,
    titleDe: 'Kasse & Belege (Motiv)',
    secondsSuggested: 15,
    deVoiceover:
      'Kasse und Belege gehören dazu: Verkauf und Dokumente sollen an dieselben Stammdaten andocken — keine Insel-Lösung nur für die Kasse.',
    enRunwayPrompt:
      'Short abstract beat: slim silhouette of a point-of-sale counter and a soft receipt paper curl, warm paper tone against cool UI background. Suggests checkout and documents without numbers or readable text. Clean, minimal, same color palette as previous shots, 16:9.',
    oek2ScreenHint: 'Optional: /projects/k2-galerie/kassa oder Shop — nur wenn Kontext stimmt',
  },
  {
    index: 5,
    titleDe: 'Produkt – Lizenz, Mein Weg, Sparten',
    secondsSuggested: 15,
    deVoiceover:
      'Das ist Lizenz-Software für eine Galerie: Ihre Inhalte, Ihre Struktur — mit Mein Weg als Leitidee und Sparten, die Sie zuordenbar halten. Für Künstlerinnen und Künstler und für kleine Galerien.',
    enRunwayPrompt:
      'Abstract visualization of branching paths merging into one clear lane: soft glowing lines on a dark plane, like a gentle “strategy map” or route lines — no words, no map labels. Calm, premium, art-world compatible. Same palette as before, 16:9, slow camera glide.',
    oek2ScreenHint: 'Optional: Präsentationsmappe Vollversion ?context=oeffentlich — USP-Seite',
  },
  {
    index: 6,
    titleDe: 'Demo ök2',
    secondsSuggested: 15,
    deVoiceover:
      'In der öffentlichen Demo sehen Sie, wie Willkommensseite, Galerie und nächste Schritte wirken — ohne Risiko, ohne echte Kundendaten. Ausprobieren, ohne Druck.',
    enRunwayPrompt:
      'Bright, inviting abstract “portal” or doorway of light opening toward a soft gallery interior silhouette — suggests “try the demo” without UI text. Gentle particles, warm highlights, same design language, 16:9, no people.',
    oek2ScreenHint: '/projects/k2-galerie/galerie-oeffentlich — kurz „Entdecken“-Stimmung',
  },
  {
    index: 7,
    titleDe: 'Lizenzen & Kontakt',
    secondsSuggested: 15,
    deVoiceover:
      'Wenn es passt: Lizenzen vergleichen, Kontakt aufnehmen — Sie entscheiden, ob der nächste Schritt für Sie passt. Kein Druck, keine versteckten Pflichten.',
    enRunwayPrompt:
      'Calm closing movement: abstract stack of balanced cards or layers settling into place — suggests plans and choices, no text. Soft spotlight, professional trust-building mood, 16:9, slow settle, no humans.',
    oek2ScreenHint: '/projects/k2-galerie/licences',
  },
  {
    index: 8,
    titleDe: 'Abschluss – Marke',
    secondsSuggested: 15,
    deVoiceover:
      'K2 Galerie — eine Plattform, die mitwächst, wenn Sie es wollen. Professionell, ruhig, auf Dauer gedacht.',
    enRunwayPrompt:
      'Final wide shot: calm empty space in the center with soft vignette — reserved for a title card in editing (do not render tiny AI text). Slow pull-back, gentle bokeh, same palette, end on a quiet frame. 16:9, no logos, no watermarks.',
    oek2ScreenHint: 'Titel „K2 Galerie“ im Schnitt einblenden — nicht im KI-Bild erzwingen',
  },
]

/** Am Stück zum Vorlesen / TTS / Einspuren (~2 Min bei normalem Tempo) */
export const PROMO_RUNWAY_FULL_GERMAN_VOICEOVER = PROMO_RUNWAY_SHOTS.map((s) => s.deVoiceover).join('\n\n')

/**
 * Ein Block für Runway Gen-3 Alpha „Multi-Shot Video“ → Modus **Auto**:
 * ganze Story zusammenhängend; ggf. mehrere Läufe à 10 s und im Schnitt verbinden.
 */

export const PROMO_RUNWAY_COMBINED_AUTO_PROMPT_EN = `Polished B2B software trailer for a licensed gallery platform, 16:9, calm professional motion design, soft charcoal and deep blue palette with restrained cyan accents, no real humans, no faces, no stock photos of people.

Single continuous story in flowing shots (no tiny readable text, no logos, no watermarks in the generated frames — titles will be added in post-production):

1) Floating UI fragments drift apart like disconnected tools; they snap into one horizontal ribbon of light — one unified system.

2) Elegant minimalist art-gallery website mockup in a floating browser window: hero area, grid of artwork thumbnails as abstract color blocks, generous whitespace, subtle parallax, warm gallery lighting.

3) Modern admin dashboard: rounded cards in a grid, soft shadows, one highlighted card — iconography only, blurred glyphs only, no paragraphs.

4) Brief abstract beat: slim point-of-sale counter silhouette and soft receipt paper curl — suggests checkout and documents without numbers or readable text.

5) Abstract branching paths merge into one clear lane — strategy map feeling, no labels.

6) Bright inviting “portal” of light toward a soft gallery interior silhouette — suggests trying a demo, no UI text.

7) Calm abstract layers settling — suggests plans and license choices, no text.

8) Final wide quiet frame with generous empty center space for a title card in editing — slow pull-back, soft bokeh, no logos.

Cinematic camera moves, shallow depth of field, high-end European product aesthetic, not a collage of stock clichés.`
