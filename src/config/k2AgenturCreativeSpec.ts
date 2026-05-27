/**
 * K2 Agentur – Creative-Spezifikationen (Maße + CD-Hinweis, eine Quelle).
 */
import { PRODUCT_POSITIONING_SWEET_SPOT } from './tenantConfig'
import { PROJECT_ROUTES } from './navigation'

export function formatCreativeSpecText(): string {
  return [
    '── K2 Agentur · Creative-Spez ──',
    '',
    'Corporate Design: mök2 → Corporate Design – eine Linie',
    'Werbeunterlagen: /projects/k2-galerie/werbeunterlagen',
    `Positionierung: ${PRODUCT_POSITIONING_SWEET_SPOT}`,
    '',
    'Bildformate (empfohlen):',
    '· Meta / Feed: 1080 × 1080 px (quadratisch)',
    '· Google Display: 1200 × 628 px (Landscape) oder responsive Set',
    '· LinkedIn: 1200 × 627 px (Single Image)',
    '',
    'Texte: Anzeigen-Paket in K2 Agentur kopieren (Headlines + Descriptions).',
    'Farben: wie Galerie gestalten / Willkommensbild – eine Linie.',
    '',
    `Werbeunterlagen öffnen: ${PROJECT_ROUTES['k2-galerie'].werbeunterlagen}`,
    '── Ende Creative-Spez ──',
  ].join('\n')
}
