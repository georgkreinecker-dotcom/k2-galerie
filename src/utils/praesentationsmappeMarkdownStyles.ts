/** Gemeinsame Screen- und Druck-Styles für Präsentationsmappe und Promo-A4-Flyer (.pmv-*). */
export const PRAESENTATIONSMAPPE_MARKDOWN_STYLES = `
    .pmv-wrap { max-width: 52rem; margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 1rem; }
    .pmv-wrap .pmv-h1 { font-size: 1.75rem; margin: 1.5rem 0 0.75rem; color: #1c1a18; font-weight: 600; }
    .pmv-wrap .pmv-h2 { font-size: 1.35rem; margin: 1.25rem 0 0.5rem; color: #0d9488; font-weight: 600; }
    .pmv-wrap .pmv-h3 { font-size: 1.15rem; margin: 1rem 0 0.4rem; color: #4b5563; }
    .pmv-wrap .pmv-hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.25rem 0; }
    .pmv-wrap .pmv-p { margin: 0 0 0.6rem; line-height: 1.7; color: #1c1a18; }
    .pmv-wrap .pmv-ul { margin: 0.5rem 0 0.75rem 1.5rem; padding-left: 0.5rem; }
    .pmv-wrap .pmv-li { margin-bottom: 0.35rem; line-height: 1.6; color: #1c1a18; }
    .pmv-wrap .pmv-link { color: #0d9488; text-decoration: underline; }
    .pmv-wrap .pmv-link:hover { color: #0f766e; }
    .pmv-wrap .pmv-img { max-width: 100%; height: auto; border-radius: 8px; }
    .pmv-seitenumbruch { margin: 1rem 0; padding: 0.5rem 0; border-top: 1px dashed #d1d5db; }
    .pmv-seitenumbruch-label { font-size: 0.8rem; color: #9ca3af; }
    .pmv-leerzeile { height: 0.75rem; }
    .pmv-seitenfuss { display: none; }
    .pmv-chapter-block { margin-bottom: 2rem; }
    .pmv-chapter-block.pmv-chapter-first { margin-top: 0; }
    .pmv-deckblatt-cover { text-align: center; padding: 0 1.5rem 2.5rem; background: #fff; color: #1c1a18; border-radius: 12px; margin-bottom: 2rem; }
    .pmv-deckblatt-cover .pmv-deckblatt-header { background: linear-gradient(180deg, #0c5c55 0%, #0f766e 100%); color: #fff; padding: 2rem 1rem 2rem; margin: 0 -1.5rem 0; border-radius: 12px 12px 0 0; min-height: 8rem; display: flex; flex-direction: column; justify-content: center; align-items: center; overflow: visible; }
    @media (max-width: 768px) {
      .pmv-wrap { padding-left: 1rem !important; padding-right: 1rem !important; font-size: 16px; }
      .pmv-wrap .pmv-h1 { font-size: 1.5rem; margin: 1.25rem 0 0.6rem; }
      .pmv-wrap .pmv-h2 { font-size: 1.25rem; margin: 1rem 0 0.45rem; }
      .pmv-wrap .pmv-h3 { font-size: 1.1rem; margin: 0.9rem 0 0.35rem; }
      .pmv-wrap .pmv-p { font-size: 1rem; line-height: 1.65; margin-bottom: 0.75rem; }
      .pmv-wrap .pmv-li { font-size: 1rem; line-height: 1.6; margin-bottom: 0.4rem; }
      .pmv-wrap .pmv-ul { margin-left: 1.25rem; padding-left: 0.5rem; }
      .pmv-deckblatt-cover { padding: 0 1rem 2rem; }
      .pmv-deckblatt-cover .pmv-deckblatt-header { padding: 1.5rem 0.75rem 1.5rem; margin: 0 -1rem 0; min-height: 9rem; }
      .pmv-deckblatt-cover .pmv-cover-title { font-size: 1.75rem; }
      .pmv-deckblatt-cover .pmv-cover-copyright { font-size: 0.75rem; }
      .pmv-deckblatt-cover .pmv-cover-slogan1 { font-size: 1rem; }
      .pmv-deckblatt-cover .pmv-cover-slogan2 { font-size: 0.95rem; }
      .pmv-mobile-stack { display: flex !important; flex-direction: column !important; }
      .pmv-mobile-stack .pmv-nav { position: static !important; order: 0; }
      .pmv-mobile-stack .pmv-article { order: 1; padding: 1rem !important; min-height: auto !important; }
      .pmv-scroll-mobile { min-height: 0; overflow: visible !important; }
    }
    .pmv-deckblatt-cover .pmv-cover-title { font-size: 2.5rem; font-weight: 700; margin: 0 0 0.5rem; letter-spacing: 0.02em; color: #fff; }
    .pmv-deckblatt-cover .pmv-cover-slogan1 { font-size: 1.15rem; font-weight: 600; margin: 0 0 0.25rem; color: #fff; opacity: 0.98; }
    .pmv-deckblatt-cover .pmv-cover-slogan2 { font-size: 1rem; margin: 0 0 0.25rem; color: #fff; opacity: 0.95; }
    .pmv-deckblatt-cover .pmv-cover-copyright { font-size: 0.8rem; margin: 0.5rem 0 0; color: #fff; opacity: 0.85; font-weight: 400; }
    .pmv-deckblatt-cover .pmv-cover-img-wrap { margin: 1.5rem auto 0; max-width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
    .pmv-deckblatt-cover .pmv-cover-img { width: 100%; height: auto; display: block; vertical-align: top; }
    @media print {
      .pmv-deckblatt-cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; page-break-after: always !important; padding: 12mm 15mm 15mm !important; background: #fff !important; min-height: 240mm; box-sizing: border-box; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: flex-start !important; }
      .pmv-deckblatt-cover .pmv-deckblatt-header { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: #0c5c55 !important; min-height: auto; padding: 10mm 12mm 12mm !important; margin: -12mm -15mm 12mm -15mm !important; border-radius: 0 !important; }
      .pmv-deckblatt-cover .pmv-cover-title { font-size: 24pt !important; margin-bottom: 0.35em !important; color: #fff !important; font-weight: 700 !important; }
      .pmv-deckblatt-cover .pmv-cover-copyright { font-size: 8pt !important; margin-top: 0.4em !important; color: #fff !important; }
      .pmv-deckblatt-cover .pmv-cover-slogan1 { font-size: 12pt !important; margin-bottom: 0.15em !important; color: #fff !important; font-weight: 600 !important; }
      .pmv-deckblatt-cover .pmv-cover-slogan2 { font-size: 11pt !important; margin-bottom: 0 !important; color: #fff !important; }
      .pmv-deckblatt-cover .pmv-cover-img-wrap { flex: 1; max-width: 95%; min-height: 0; }
      .pmv-deckblatt-cover .pmv-cover-img { max-height: 180mm; width: auto; margin: 0 auto; object-fit: contain; }
      .pmv-chapter-block { page-break-before: auto !important; }
      .pmv-chapter-block.pmv-chapter-first { page-break-before: auto !important; }
      .pmv-no-print { display: none !important; }
      .pmv-wrap .pmv-seitenumbruch .pmv-seitenumbruch-label { display: none !important; }
      .pmv-wrap .pmv-seitenumbruch { page-break-before: always !important; margin: 0 !important; padding: 0 !important; border: none !important; min-height: 0 !important; }
      .pmv-wrap .pmv-h1 { font-size: 12pt !important; margin: 1.2em 0 0.4em !important; color: #1c1a18 !important; font-weight: 600 !important; page-break-after: avoid !important; }
      .pmv-wrap .pmv-h2 { font-size: 11pt !important; margin: 1em 0 0.35em !important; color: #0f766e !important; font-weight: 700 !important; page-break-after: avoid !important; }
      .pmv-wrap .pmv-h3 { font-size: 10pt !important; margin: 0.8em 0 0.3em !important; color: #1c1a18 !important; page-break-after: avoid !important; }
      .pmv-wrap .pmv-p { margin: 0 0 0.5em !important; line-height: 1.45 !important; font-size: 10pt !important; color: #1c1a18 !important; text-align: justify !important; hyphens: auto !important; -webkit-hyphens: auto !important; hyphenate-limit-chars: 6 4 2 !important; orphans: 2 !important; widows: 2 !important; }
      .pmv-wrap .pmv-ul { margin: 0.4em 0 0.6em 1.25em !important; padding-left: 0.4em !important; }
      .pmv-wrap .pmv-li { margin-bottom: 0.25em !important; line-height: 1.45 !important; font-size: 10pt !important; }
      .pmv-wrap .pmv-hr { margin: 0.6em 0 !important; }
      .pmv-wrap .pmv-leerzeile { height: 0.25em !important; }
      .pmv-wrap .pmv-img { max-width: 100% !important; height: auto !important; border-radius: 4px; -webkit-print-color-adjust: exact; print-color-adjust: exact; page-break-inside: avoid !important; }
      .pmv-wrap .pmv-p-with-img { page-break-inside: avoid !important; }
      .pmv-wrap .pmv-table-wrap { margin: 0.5em 0 !important; page-break-inside: avoid !important; }
      .pmv-wrap .pmv-table th, .pmv-wrap .pmv-table td { padding: 0.2em 0.4em !important; font-size: 9pt !important; }
      .pmv-wrap article { padding: 0 0 12mm !important; border: none !important; box-shadow: none !important; }
      .pmv-seitenfuss { display: block !important; position: fixed; bottom: 0; left: 0; right: 0; width: 100%; min-height: 6mm; padding: 2mm 8mm; font-size: 9pt; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000 !important; background: #fff !important; border-top: 1px solid #ccc; line-height: 1.3; -webkit-print-color-adjust: exact; print-color-adjust: exact; z-index: 99999; }
      .pmv-seitenfuss .pmv-seitenfuss-preview { display: none !important; }
      .pmv-seitenfuss::after { content: "Seite " counter(page) " von " counter(pages); color: #000 !important; }
      @page { margin: 15mm 18mm 18mm 18mm; size: A4; background: white; }
      html, body { background: #fff !important; color: #1c1a18 !important; }
      .pmv-wrap { background: #fff !important; padding: 0 !important; }
    }
  `
