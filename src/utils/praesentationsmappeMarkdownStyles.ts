/** Gemeinsame Screen- und Druck-Styles für Präsentationsmappe und Promo-A4-Flyer (.pmv-*). */
export const PRAESENTATIONSMAPPE_MARKDOWN_STYLES = `
    .pmv-wrap { max-width: 52rem; margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 1rem; }
    /* Nur Präsentationsmappe (Vollversion/VK2): Bildschirm ≈ DIN-A4-Breite wie beim Druck; Flyer bleibt ohne .pmv-map-page-root */
    .pmv-map-page-root.pmv-wrap { max-width: none; width: 100%; box-sizing: border-box; }
    @media (min-width: 769px) {
      .pmv-map-page-root .pmv-map-grid {
        background: linear-gradient(180deg, #e8e6e1 0%, #e2e0da 100%);
        padding: 1.75rem 1.75rem 2.5rem;
        border-radius: 12px;
        align-items: start;
        gap: 1.5rem;
        max-width: min(100%, calc(200px + 1.5rem + 210mm + 3.5rem + 2rem));
        margin-inline: auto;
        box-sizing: border-box;
      }
      /* min-width:0: breite Tabellen (z. B. Matrix) dürfen Spalte nicht über A4 aufblasen → horiz. Scroll im Bogen */
      /* Margin um den Bogen = sichtbare „Seitenränder“ wie Word (Grau ringsum) */
      .pmv-map-page-root .pmv-map-grid .pmv-a4-sheet {
        box-sizing: border-box;
        width: min(100%, 210mm);
        max-width: 210mm;
        min-width: 0;
        justify-self: center;
        margin: 1.25rem 1rem 2rem;
        padding: 15mm 18mm;
        background: #fff !important;
        border-radius: 2px;
        box-shadow:
          0 1px 2px rgba(0, 0, 0, 0.06),
          0 4px 12px rgba(28, 26, 24, 0.08),
          0 16px 40px rgba(28, 26, 24, 0.12);
        border: 1px solid #c4c0ba;
        min-height: 0;
        overflow-x: auto;
        position: relative;
      }
      /* Leichter Rand-Schimmer wie Druck-Margins (15mm oben, 18mm seitlich/unten) – ohne gestrichelte Innenlinie */
      .pmv-map-page-root .pmv-map-grid .pmv-a4-sheet::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        box-sizing: border-box;
        background:
          linear-gradient(180deg, rgba(120, 113, 108, 0.07) 0, rgba(120, 113, 108, 0.07) 15mm, transparent 15mm),
          linear-gradient(0deg, rgba(120, 113, 108, 0.07) 0, rgba(120, 113, 108, 0.07) 18mm, transparent 18mm),
          linear-gradient(90deg, rgba(120, 113, 108, 0.055) 0, rgba(120, 113, 108, 0.055) 18mm, transparent 18mm),
          linear-gradient(270deg, rgba(120, 113, 108, 0.055) 0, rgba(120, 113, 108, 0.055) 18mm, transparent 18mm);
      }
      .pmv-map-page-root .pmv-map-grid .pmv-a4-sheet > * {
        position: relative;
        z-index: 2;
      }
      /* Gesamte Mappe: gleiche Blatt-Ränder wie Einzelansicht, Text = Druckkörper (ohne gestrichelte Innenlinie – wie Druck/PDF) */
      .pmv-map-page-root > .pmv-a4-sheet {
        box-sizing: border-box;
        width: min(100%, 210mm);
        max-width: 210mm;
        margin: 1.25rem auto 2.5rem;
        padding: 15mm 18mm;
        position: relative;
        background: #fff !important;
        border: 1px solid #c4c0ba;
        border-radius: 2px;
        box-shadow:
          0 1px 2px rgba(0, 0, 0, 0.06),
          0 4px 12px rgba(28, 26, 24, 0.08),
          0 16px 40px rgba(28, 26, 24, 0.12);
        min-height: 0;
        overflow-x: auto;
      }
      .pmv-map-page-root > .pmv-a4-sheet::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        box-sizing: border-box;
        background:
          linear-gradient(180deg, rgba(120, 113, 108, 0.07) 0, rgba(120, 113, 108, 0.07) 15mm, transparent 15mm),
          linear-gradient(0deg, rgba(120, 113, 108, 0.07) 0, rgba(120, 113, 108, 0.07) 18mm, transparent 18mm),
          linear-gradient(90deg, rgba(120, 113, 108, 0.055) 0, rgba(120, 113, 108, 0.055) 18mm, transparent 18mm),
          linear-gradient(270deg, rgba(120, 113, 108, 0.055) 0, rgba(120, 113, 108, 0.055) 18mm, transparent 18mm);
      }
      .pmv-map-page-root > .pmv-a4-sheet > * {
        position: relative;
        z-index: 2;
      }
      .pmv-map-page-root .pmv-a4-sheet > div:first-child > .pmv-deckblatt-cover:first-child,
      .pmv-map-page-root .pmv-a4-sheet > .pmv-chapter-block:first-child > .pmv-deckblatt-cover:first-child {
        margin: -15mm -18mm 1.25rem -18mm;
        border-radius: 4px 4px 0 0;
      }
    }
    .pmv-wrap .pmv-h1 { font-size: 1.75rem; margin: 1.5rem 0 0.75rem; color: #1c1a18; font-weight: 600; }
    .pmv-wrap .pmv-h2 { font-size: 1.35rem; margin: 1.25rem 0 0.5rem; color: #0d9488; font-weight: 600; }
    .pmv-wrap .pmv-h3 { font-size: 1.15rem; margin: 1rem 0 0.4rem; color: #4b5563; }
    .pmv-wrap .pmv-hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.25rem 0; }
    .pmv-wrap .pmv-blockquote {
      margin: 1rem 0 1.35rem;
      padding: 1rem 1.15rem 1.05rem;
      border-left: 4px solid #0d9488;
      background: linear-gradient(90deg, rgba(20, 184, 166, 0.14) 0%, rgba(255, 255, 255, 0) 72%);
      border-radius: 0 10px 10px 0;
      box-shadow: 0 1px 0 rgba(28, 26, 24, 0.04);
    }
    .pmv-wrap .pmv-blockquote .pmv-p { margin: 0 0 0.55rem; font-size: 1.03rem; line-height: 1.65; }
    .pmv-wrap .pmv-blockquote .pmv-p:last-child { margin-bottom: 0; }
    .pmv-wrap .pmv-p { margin: 0 0 0.6rem; line-height: 1.7; color: #1c1a18; }
    .pmv-wrap .pmv-ul { margin: 0.5rem 0 0.75rem 1.5rem; padding-left: 0.5rem; }
    .pmv-wrap .pmv-li { margin-bottom: 0.35rem; line-height: 1.6; color: #1c1a18; }
    .pmv-wrap .pmv-link { color: #0d9488; text-decoration: underline; }
    .pmv-wrap .pmv-link:hover { color: #0f766e; }
    .pmv-wrap .pmv-img { max-width: 100%; height: auto; border-radius: 8px; }
    /* Leitfaden „So nutzt du diese Mappe“ – volle erste Seite optisch klar (Screen) */
    .pmv-wrap .pmv-leitfaden-page {
      position: relative;
      padding: 0.15rem 0 0.35rem;
      margin: 0 0 0.35rem;
      border-radius: 12px;
      background: linear-gradient(180deg, rgba(236, 253, 245, 0.9) 0%, rgba(255, 255, 255, 0) 48%);
      box-shadow: inset 0 0 0 1px rgba(20, 184, 166, 0.2);
    }
    .pmv-wrap .pmv-leitfaden-page::before {
      content: '';
      display: block;
      height: 6px;
      margin: 0 0 1.15rem;
      border-radius: 4px;
      background: linear-gradient(90deg, #0f766e 0%, #14b8a6 42%, #5eead4 100%);
    }
    .pmv-wrap .pmv-leitfaden-page .pmv-h1 {
      font-size: 1.95rem;
      margin-top: 0;
      margin-bottom: 0.9rem;
      color: #0f766e;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .pmv-wrap .pmv-leitfaden-page .pmv-h2 {
      font-size: 1.22rem;
      margin-top: 1.4rem;
      margin-bottom: 0.45rem;
      padding: 0.4rem 0.65rem 0.4rem 0.75rem;
      border-left: 4px solid #14b8a6;
      background: rgba(20, 184, 166, 0.08);
      border-radius: 0 10px 10px 0;
      color: #134e4a;
    }
    .pmv-wrap .pmv-leitfaden-page .pmv-h2:first-of-type { margin-top: 0.85rem; }
    .pmv-wrap .pmv-leitfaden-page .pmv-h3 { font-size: 1.06rem; color: #374151; }
    .pmv-wrap .pmv-leitfaden-page .pmv-blockquote { margin-bottom: 1rem; }
    .pmv-chapter-block--leitfaden { margin-bottom: 0.75rem; }
    /* Nur Inhaltsverzeichnis (00-INDEX) – kompakt */
    .pmv-wrap .pmv-toc-only-page { padding: 0.2rem 0 0.5rem; }
    .pmv-wrap .pmv-toc-only-page .pmv-h1 { font-size: 1.35rem; margin: 0 0 0.65rem; color: #0f766e; }
    .pmv-wrap .pmv-toc-only-page .pmv-h2 { font-size: 1.05rem; margin: 0.5rem 0 0.35rem; color: #134e4a; }
    .pmv-wrap .pmv-toc-only-page .pmv-p,
    .pmv-wrap .pmv-toc-only-page .pmv-li { font-size: 0.92rem; line-height: 1.45; }
    .pmv-wrap .pmv-toc-only-page .pmv-ul { margin: 0.35rem 0 0.5rem 1.2rem; }
    .pmv-seitenumbruch { margin: 1rem 0; padding: 0.5rem 0; border-top: 1px dashed #d1d5db; }
    .pmv-seitenumbruch-label { font-size: 0.8rem; color: #9ca3af; }
    .pmv-leerzeile { height: 0.75rem; }
    /* Vergleichs-Matrix (≥5 Spalten): lesbar, K2/ök2-Spalte hervorgehoben */
    .pmv-wrap .pmv-table-matrix { margin: 1rem 0 1.25rem; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 12px; border: 1px solid #d6d3d1; background: #fafaf9; box-shadow: 0 2px 8px rgba(28, 26, 24, 0.06); }
    .pmv-wrap .pmv-table-compare { width: 100%; min-width: 36rem; border-collapse: separate; border-spacing: 0; font-size: 0.9375rem; }
    .pmv-wrap .pmv-table-compare thead th { background: #ecfdf5; color: #134e4a; font-weight: 600; text-align: center; padding: 0.65rem 0.5rem; border-bottom: 2px solid #14b8a6; vertical-align: bottom; line-height: 1.35; }
    .pmv-wrap .pmv-table-compare thead th:first-child { text-align: left; min-width: 11rem; max-width: 22rem; }
    .pmv-wrap .pmv-table-compare .pmv-th-highlight { background: linear-gradient(180deg, #0f766e 0%, #0d9488 100%) !important; color: #fff !important; border-bottom-color: #0f766e !important; }
    .pmv-wrap .pmv-table-compare tbody tr:nth-child(even) { background: rgba(255, 255, 255, 0.75); }
    .pmv-wrap .pmv-table-compare tbody tr:hover { background: rgba(20, 184, 166, 0.09); }
    .pmv-wrap .pmv-table-compare tbody td { padding: 0.55rem 0.45rem; border-bottom: 1px solid #e7e5e4; vertical-align: middle; }
    .pmv-wrap .pmv-table-compare .pmv-td-criterion { font-size: 0.9rem; line-height: 1.45; color: #1c1a18; text-align: left; font-weight: 500; padding-left: 0.75rem !important; padding-right: 0.75rem !important; overflow-wrap: break-word; word-wrap: break-word; min-width: 0; hyphens: auto; }
    .pmv-wrap .pmv-table-compare .pmv-td-check { text-align: center; width: 4.25rem; }
    .pmv-wrap .pmv-table-compare .pmv-td-highlight { text-align: center; background: rgba(20, 184, 166, 0.14) !important; font-size: 1.05rem; border-left: 2px solid #14b8a6; }
    .pmv-wrap .pmv-cell-yes { color: #047857; font-weight: 700; }
    .pmv-wrap .pmv-cell-no { color: #a8a29e; font-weight: 600; }
    /* Split-Vergleich (3 Spalten: Thema | Markt fragmentiert | K2/ök2 integriert) */
    .pmv-wrap .pmv-table-split-wrap { margin: 1rem 0 1.25rem; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 12px; border: 1px solid #d6d3d1; background: #fafaf9; box-shadow: 0 2px 10px rgba(28, 26, 24, 0.07); }
    .pmv-wrap .pmv-table-split { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.9375rem; table-layout: fixed; }
    .pmv-wrap .pmv-table-split thead th { font-weight: 600; padding: 0.7rem 0.65rem; vertical-align: bottom; line-height: 1.35; border-bottom: 2px solid #e7e5e4; overflow-wrap: break-word; word-wrap: break-word; min-width: 0; hyphens: auto; }
    .pmv-wrap .pmv-table-split .pmv-th-split-first { text-align: left; width: 18%; background: #f5f5f4; color: #44403c; }
    .pmv-wrap .pmv-table-split .pmv-th-split-market { text-align: left; width: 41%; background: #fef3c7; color: #78350f; border-left: 1px solid #fcd34d; border-right: 1px solid #fcd34d; }
    .pmv-wrap .pmv-table-split .pmv-th-split-k2 { text-align: left; width: 41%; background: linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%); color: #134e4a; border-bottom: 2px solid #14b8a6 !important; }
    .pmv-wrap .pmv-table-split tbody td { padding: 0.55rem 0.65rem; border-bottom: 1px solid #e7e5e4; vertical-align: top; line-height: 1.5; color: #1c1a18; overflow-wrap: break-word; word-wrap: break-word; min-width: 0; hyphens: auto; }
    .pmv-wrap .pmv-table-split tbody tr:nth-child(even) { background: rgba(255, 255, 255, 0.55); }
    .pmv-wrap .pmv-table-split tbody tr:first-child .pmv-td-split-market { background: rgba(254, 243, 199, 0.5); font-weight: 600; }
    .pmv-wrap .pmv-table-split tbody tr:first-child .pmv-td-split-k2 { background: rgba(209, 250, 229, 0.55); font-weight: 600; }
    .pmv-wrap .pmv-table-split .pmv-td-split-label { font-weight: 600; color: #292524; background: #f5f5f4; }
    .pmv-wrap .pmv-table-split .pmv-td-split-market { background: rgba(255, 251, 235, 0.95); }
    .pmv-wrap .pmv-table-split .pmv-td-split-k2 { background: rgba(236, 253, 245, 0.9); border-left: 2px solid #14b8a6; }
    .pmv-wrap .pmv-table:not(.pmv-table-compare):not(.pmv-table-split) th, .pmv-wrap .pmv-table:not(.pmv-table-compare):not(.pmv-table-split) td { padding: 0.4rem 0.5rem; border-bottom: 1px solid #e7e5e4; }
    .pmv-wrap .pmv-table:not(.pmv-table-compare):not(.pmv-table-split) thead th { background: #f5f5f4; color: #1c1a18; font-weight: 600; text-align: left; }
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
      .pmv-wrap .pmv-table-matrix { margin-left: -0.25rem; margin-right: -0.25rem; border-radius: 10px; }
      .pmv-wrap .pmv-table-compare { font-size: 0.875rem; min-width: 32rem; }
      .pmv-wrap .pmv-table-compare .pmv-td-criterion { font-size: 0.8125rem; }
      .pmv-wrap .pmv-table-split { font-size: 0.875rem; table-layout: auto; }
      .pmv-wrap .pmv-table-split .pmv-th-split-first, .pmv-wrap .pmv-table-split .pmv-th-split-market, .pmv-wrap .pmv-table-split .pmv-th-split-k2 { width: auto; }
      .pmv-map-page-root .pmv-map-grid { background: transparent; padding: 0; border-radius: 0; }
      .pmv-map-page-root .pmv-a4-sheet {
        max-width: 100%;
        padding: 1rem !important;
        box-shadow: 0 1px 10px rgba(28, 26, 24, 0.08);
        border-radius: 12px;
      }
      .pmv-map-page-root .pmv-a4-sheet::before,
      .pmv-map-page-root .pmv-a4-sheet::after {
        display: none !important;
        content: none !important;
      }
      .pmv-map-page-root .pmv-a4-sheet > div:first-child > .pmv-deckblatt-cover:first-child,
      .pmv-map-page-root .pmv-a4-sheet > .pmv-chapter-block:first-child > .pmv-deckblatt-cover:first-child {
        margin: -1rem -1rem 1rem -1rem;
        border-radius: 12px 12px 0 0;
      }
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
      .pmv-chapter-block { page-break-before: auto !important; margin-bottom: 0.35em !important; }
      .pmv-chapter-block.pmv-chapter-first { page-break-before: auto !important; }
      .pmv-chapter-block--leitfaden {
        page-break-after: always !important;
        margin-bottom: 0 !important;
      }
      .pmv-chapter-block--toc-only {
        page-break-after: always !important;
        margin-bottom: 0 !important;
      }
      .pmv-wrap .pmv-leitfaden-page {
        page-break-after: always !important;
        page-break-inside: avoid !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        background: #fff !important;
        padding: 10mm 14mm 12mm !important;
        box-sizing: border-box !important;
        min-height: 0 !important;
      }
      .pmv-wrap .pmv-leitfaden-page::before {
        height: 4pt !important;
        margin-bottom: 0.35cm !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .pmv-wrap .pmv-leitfaden-page .pmv-h1 {
        font-size: 18pt !important;
        color: #0f766e !important;
        margin: 0 0 0.3cm !important;
      }
      .pmv-wrap .pmv-leitfaden-page .pmv-h2 {
        font-size: 11.5pt !important;
        margin: 0.32cm 0 0.16cm !important;
        padding: 0.16cm 0.3cm 0.16cm 0.4cm !important;
        border-left-width: 3pt !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .pmv-wrap .pmv-leitfaden-page .pmv-h3 { font-size: 10.5pt !important; }
      .pmv-wrap .pmv-leitfaden-page .pmv-p,
      .pmv-wrap .pmv-leitfaden-page .pmv-blockquote .pmv-p { font-size: 10pt !important; line-height: 1.42 !important; }
      .pmv-wrap .pmv-toc-only-page {
        page-break-after: always !important;
        padding: 6mm 12mm 8mm !important;
        box-sizing: border-box !important;
      }
      .pmv-wrap .pmv-toc-only-page .pmv-h1 { font-size: 14pt !important; margin: 0 0 0.35cm !important; color: #0f766e !important; }
      .pmv-wrap .pmv-toc-only-page .pmv-h2 { font-size: 10pt !important; margin: 0.25cm 0 0.15cm !important; }
      .pmv-wrap .pmv-toc-only-page .pmv-p,
      .pmv-wrap .pmv-toc-only-page .pmv-li { font-size: 8.75pt !important; line-height: 1.32 !important; }
      .pmv-wrap .pmv-toc-only-page .pmv-ul { margin: 0.15cm 0 0.25cm 0.9cm !important; }
      .pmv-no-print { display: none !important; }
      .pmv-wrap .pmv-seitenumbruch .pmv-seitenumbruch-label { display: none !important; }
      .pmv-wrap .pmv-seitenumbruch { page-break-before: always !important; margin: 0 !important; padding: 0 !important; border: none !important; min-height: 0 !important; }
      .pmv-wrap .pmv-h1 { font-size: 11.5pt !important; margin: 0.8em 0 0.3em !important; color: #1c1a18 !important; font-weight: 600 !important; page-break-after: avoid !important; }
      .pmv-wrap .pmv-h2 { font-size: 10.5pt !important; margin: 0.65em 0 0.28em !important; color: #0f766e !important; font-weight: 700 !important; page-break-after: avoid !important; }
      .pmv-wrap .pmv-h3 { font-size: 10pt !important; margin: 0.55em 0 0.22em !important; color: #1c1a18 !important; page-break-after: avoid !important; }
      .pmv-wrap .pmv-p { margin: 0 0 0.42em !important; line-height: 1.38 !important; font-size: 9.75pt !important; color: #1c1a18 !important; text-align: justify !important; hyphens: auto !important; -webkit-hyphens: auto !important; hyphenate-limit-chars: 6 4 2 !important; orphans: 2 !important; widows: 2 !important; }
      .pmv-wrap .pmv-ul { margin: 0.28em 0 0.45em 1.1em !important; padding-left: 0.35em !important; }
      .pmv-wrap .pmv-li { margin-bottom: 0.18em !important; line-height: 1.38 !important; font-size: 9.75pt !important; }
      .pmv-wrap .pmv-hr { margin: 0.6em 0 !important; }
      .pmv-wrap .pmv-blockquote {
        margin: 0.65em 0 0.85em !important;
        padding: 0.65em 0.75em !important;
        border-left-width: 3pt !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        page-break-inside: avoid !important;
      }
      .pmv-wrap .pmv-blockquote .pmv-p { font-size: 10pt !important; line-height: 1.45 !important; margin-bottom: 0.45em !important; }
      .pmv-wrap .pmv-leerzeile { height: 0.25em !important; }
      .pmv-wrap .pmv-img { max-width: 100% !important; height: auto !important; border-radius: 4px; -webkit-print-color-adjust: exact; print-color-adjust: exact; page-break-inside: avoid !important; }
      .pmv-wrap .pmv-p-with-img { page-break-inside: avoid !important; }
      .pmv-wrap .pmv-table-wrap { margin: 0.5em 0 !important; page-break-inside: avoid !important; }
      .pmv-wrap .pmv-table th, .pmv-wrap .pmv-table td { padding: 0.2em 0.4em !important; font-size: 9pt !important; }
      .pmv-wrap .pmv-table-matrix { border: 1px solid #ccc !important; box-shadow: none !important; background: #fff !important; }
      .pmv-wrap .pmv-table-compare thead th { font-size: 8pt !important; padding: 0.25em 0.2em !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .pmv-wrap .pmv-table-compare .pmv-th-highlight { color: #fff !important; background: #0f766e !important; }
      .pmv-wrap .pmv-table-compare .pmv-td-highlight { background: #ecfdf5 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .pmv-wrap .pmv-table-compare .pmv-td-criterion { font-size: 8.5pt !important; }
      .pmv-wrap .pmv-table-compare .pmv-cell-yes { color: #047857 !important; }
      .pmv-wrap .pmv-table-compare .pmv-cell-no { color: #a8a29e !important; }
      .pmv-wrap .pmv-table-split-wrap { border: 1px solid #ccc !important; box-shadow: none !important; background: #fff !important; }
      .pmv-wrap .pmv-table-split thead th { font-size: 8pt !important; padding: 0.3em 0.35em !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .pmv-wrap .pmv-table-split tbody td { font-size: 8.5pt !important; padding: 0.25em 0.35em !important; }
      .pmv-wrap .pmv-table-split .pmv-th-split-market, .pmv-wrap .pmv-table-split .pmv-td-split-market { background: #fffbeb !important; }
      .pmv-wrap .pmv-table-split .pmv-th-split-k2, .pmv-wrap .pmv-table-split .pmv-td-split-k2 { background: #ecfdf5 !important; border-left: 2px solid #0d9488 !important; }
      .pmv-wrap article { padding: 0 0 6mm !important; border: none !important; box-shadow: none !important; }
      .pmv-map-page-root .pmv-map-grid { background: transparent !important; padding: 0 !important; border-radius: 0 !important; max-width: none !important; margin: 0 !important; }
      .pmv-map-page-root .pmv-a4-sheet {
        max-width: none !important;
        width: auto !important;
        min-width: 0 !important;
        justify-self: stretch !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        overflow-x: visible !important;
      }
      .pmv-map-page-root .pmv-a4-sheet::before,
      .pmv-map-page-root .pmv-a4-sheet::after {
        display: none !important;
        content: none !important;
      }
      .pmv-map-page-root .pmv-a4-sheet > div:first-child > .pmv-deckblatt-cover:first-child,
      .pmv-map-page-root .pmv-a4-sheet > .pmv-chapter-block:first-child > .pmv-deckblatt-cover:first-child {
        margin: 0 !important;
        border-radius: 0 !important;
      }
      .pmv-seitenfuss {
        display: flex !important;
        flex-direction: row !important;
        justify-content: space-between !important;
        align-items: center !important;
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        box-sizing: border-box !important;
        min-height: 0 !important;
        padding: 1.5mm 12mm 2mm !important;
        font-size: 7.5pt !important;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
        color: #44403c !important;
        background: #fff !important;
        border-top: 0.5pt solid #d6d3d1 !important;
        line-height: 1.25 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        z-index: 99999 !important;
      }
      .pmv-seitenfuss .pmv-seitenfuss-preview { display: none !important; }
      .pmv-seitenfuss .pmv-seitenfuss-brand {
        display: inline !important;
        font-weight: 600 !important;
        color: #0f766e !important;
        letter-spacing: 0.01em !important;
      }
      .pmv-seitenfuss .pmv-seitenfuss-page::after {
        content: "Seite " counter(page) " / " counter(pages) !important;
        color: #44403c !important;
        font-weight: 500 !important;
      }
      @page { margin: 10mm 12mm 13mm 12mm; size: A4; background: white; }
      html, body { background: #fff !important; color: #1c1a18 !important; }
      .pmv-wrap { background: #fff !important; padding: 0 !important; }
    }
  `
