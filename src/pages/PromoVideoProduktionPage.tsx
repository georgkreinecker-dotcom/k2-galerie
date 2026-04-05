/**
 * Promo-Video-Produktion – APf-Werkzeug (nur localhost / ?apf=1 / ?dev=1).
 * Sportwagenmodus: eine Problemstellung = ein Standard (Datenquelle Mappe, Einspielung nur Stammdaten
 * im passenden Kontext) – keine parallelen „vielleicht so“-Wege. Siehe .cursor/rules/ein-standard-problem.mdc.
 * Vorschau-Player: dieselbe URL wie ök2-Stammdaten → Highlight-Video (keine zweite Quelle).
 * Öffentliche Galerie-App: weiterhin nur Links (GalerieSocialLinks), kein Embed auf der Besucher-Seite hier.
 */

import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  ENTDECKEN_ROUTE,
  K2_GALERIE_APF_EINSTIEG,
  PROJECT_ROUTES,
  shouldShowK2GalerieApfProjectHub,
} from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { videoUrlToFeaturedEmbed } from '../utils/featuredVideoEmbed'
import { loadStammdaten } from '../utils/stammdatenStorage'
import { safeExternalHref } from '../utils/socialExternalUrls'

export default function PromoVideoProduktionPage() {
  const [featuredVideoUrl, setFeaturedVideoUrl] = useState('')

  useEffect(() => {
    const read = () => {
      const g = loadStammdaten('oeffentlich', 'gallery') as { socialFeaturedVideoUrl?: string }
      setFeaturedVideoUrl(typeof g?.socialFeaturedVideoUrl === 'string' ? g.socialFeaturedVideoUrl.trim() : '')
    }
    read()
    const onUpdate = () => read()
    window.addEventListener('k2-gallery-stammdaten-updated', onUpdate)
    window.addEventListener('storage', onUpdate)
    return () => {
      window.removeEventListener('k2-gallery-stammdaten-updated', onUpdate)
      window.removeEventListener('storage', onUpdate)
    }
  }, [])

  if (!shouldShowK2GalerieApfProjectHub()) {
    return <Navigate to={ENTDECKEN_ROUTE} replace />
  }

  const mappeVollOek2 = `${PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion}?context=oeffentlich`
  const adminOek2Stammdaten = '/admin?context=oeffentlich&tab=einstellungen'
  const safeVideo = safeExternalHref(featuredVideoUrl)
  const embed = videoUrlToFeaturedEmbed(featuredVideoUrl)

  return (
    <article
      style={{
        maxWidth: '820px',
        margin: 0,
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        background: 'var(--k2-bg-1, #1a0f0a)',
        color: 'var(--k2-text, #fff5f0)',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <header style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(95,251,241,0.25)' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0, color: '#5ffbf1' }}>Promo-Video-Produktion</h1>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)' }}>
          Eigener Arbeitsplatz auf der APf. Unten siehst du das <strong>fertige Highlight-Video</strong>, sobald
          der Link in den <strong>ök2-Stammdaten</strong> steht – dieselbe Quelle wie auf der öffentlichen Galerie,
          keine zweite URL.
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
          <Link to={K2_GALERIE_APF_EINSTIEG} style={{ color: '#5ffbf1', textDecoration: 'none' }}>
            ← Projekt-Start
          </Link>
          {' · '}
          <Link to={PROJECT_ROUTES['k2-galerie'].marketingOek2} style={{ color: '#5ffbf1', textDecoration: 'none' }}>
            ← Marketing ök2 (mök2)
          </Link>
        </p>
      </header>

      <nav
        aria-label="Inhalt"
        style={{
          marginBottom: '1.5rem',
          padding: '0.85rem 1rem',
          background: 'rgba(124,58,237,0.12)',
          borderRadius: '10px',
          border: '1px solid rgba(167,139,250,0.35)',
          fontSize: '0.88rem',
          lineHeight: 1.55,
        }}
      >
        <strong style={{ color: '#e9d5ff', display: 'block', marginBottom: '0.4rem' }}>Inhalt</strong>
        <a href="#promo-vorschau" style={{ color: '#c4b5fd' }}>
          Video-Vorschau (APf)
        </a>
        {' · '}
        <a href="#promo-regeln" style={{ color: '#c4b5fd' }}>
          Regeln &amp; Sportwagenmodus
        </a>
        {' · '}
        <a href="#promo-stimme" style={{ color: '#c4b5fd' }}>
          Stimme &amp; Rolle
        </a>
        {' · '}
        <a href="#promo-datenquelle" style={{ color: '#c4b5fd' }}>
          Datenquelle Mappe
        </a>
        {' · '}
        <a href="#promo-einspielen" style={{ color: '#c4b5fd' }}>
          Einspielen
        </a>
        {' · '}
        <a href="#promo-ablauf" style={{ color: '#c4b5fd' }}>
          Ablauf
        </a>
      </nav>

      <section
        id="promo-vorschau"
        style={{
          marginBottom: '1.75rem',
          padding: '1rem 1.1rem',
          background: 'rgba(34,197,94,0.08)',
          borderRadius: '12px',
          border: '1px solid rgba(34,197,94,0.35)',
        }}
      >
        <h2 style={{ fontSize: '1.15rem', color: '#86efac', margin: '0 0 0.5rem' }}>
          Fertiges Video – Vorschau auf der APf
        </h2>
        <p style={{ margin: '0 0 0.75rem', lineHeight: 1.55, fontSize: '0.9rem', color: 'rgba(255,245,240,0.9)' }}>
          Nach Aufnahme und Schnitt: Link unter{' '}
          <strong>Admin → Einstellungen → Stammdaten Galerie (Kontext ök2) → Highlight-Video</strong>. Hier erscheint
          dieselbe Vorschau (YouTube-Einbettung oder direkte .mp4/.webm-Datei).
        </p>
        {!safeVideo ? (
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,245,240,0.65)' }}>
            Noch kein Link in den Stammdaten –{' '}
            <Link to={adminOek2Stammdaten} style={{ color: '#86efac', fontWeight: 600 }}>
              jetzt eintragen
            </Link>
            .
          </p>
        ) : embed?.kind === 'youtube' ? (
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '100%',
              aspectRatio: '16 / 9',
              background: '#0a0a0a',
              borderRadius: 10,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <iframe
              title="Highlight-Video (ök2 Stammdaten)"
              src={embed.src}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </div>
        ) : embed?.kind === 'direct' ? (
          <video
            controls
            playsInline
            src={embed.src}
            style={{
              width: '100%',
              maxHeight: 'min(70vh, 480px)',
              borderRadius: 10,
              background: '#000',
            }}
          />
        ) : (
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: 'rgba(255,245,240,0.85)' }}>
            Diese URL lässt sich hier nicht direkt einbetten. Zum Ansehen:{' '}
            <a href={safeVideo} target="_blank" rel="noopener noreferrer" style={{ color: '#86efac' }}>
              Video öffnen
            </a>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,245,240,0.55)', marginLeft: '0.35rem' }}>
              (YouTube- oder direkte Video-URL empfohlen)
            </span>
          </p>
        )}
      </section>

      <section
        id="promo-regeln"
        style={{
          marginBottom: '1.75rem',
          padding: '1rem 1.1rem',
          background: 'rgba(251,191,36,0.08)',
          borderRadius: '12px',
          border: '1px solid rgba(251,191,36,0.35)',
        }}
      >
        <h2 style={{ fontSize: '1.15rem', color: '#fcd34d', margin: '0 0 0.5rem' }}>
          Sportwagenmodus &amp; Plattform-Regeln – verbindlich
        </h2>
        <p style={{ margin: '0 0 0.65rem', lineHeight: 1.55, fontSize: '0.9rem', color: 'rgba(255,245,240,0.92)' }}>
          Dieselben Prinzipien wie für <strong>K2</strong>, <strong>ök2</strong> und <strong>VK2</strong> gelten auch hier:{' '}
          <strong>ein Standard pro Problemstellung</strong>, keine zweite stillschweigende Variante, kein „vielleicht
          machen wir es später anders“. Was festgelegt ist (Datenquelle, Einspielweg, Kontext) ist der Weg – nicht
          eine Option unter mehreren.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.6, fontSize: '0.88rem', color: 'rgba(255,245,240,0.88)' }}>
          <li>
            <strong>Kontext-Trennung:</strong> Öffentliche Demo / Links für die ök2-Galerie nur über ök2-Stammdaten
            und <code style={{ fontSize: '0.82em' }}>context=oeffentlich</code> –{' '}
            <strong>keine K2-Echtdaten</strong> in den ök2-Kanal (eiserne Regel Projektweit).
          </li>
          <li>
            <strong>VK2 / K2:</strong> Wenn du für einen anderen Kontext ein Video einspielst, gilt derselbe Weg:{' '}
            Admin im <strong>passenden</strong> Kontext, dieselbe Stammdaten-Logik wie überall – keine Vermischung.
          </li>
          <li>
            <strong>Sportwagenmodus:</strong> Mappe Vollversion = inhaltliche Quelle; fertiges Produkt ={' '}
            <strong>eine</strong> Einspielung in Stammdaten – nicht Player und Link parallel als zwei Wahrheiten.
          </li>
          <li>
            <strong>Kein Experimentiermodus:</strong> Kein nebenbei zweiter Export-Pfad oder „erst mal schnell woanders
            hochladen“ ohne Anpassung der einen Quelle – bei Erweiterung: bestehenden Standard erweitern, nicht
            ersetzen (siehe Regelwerk <code style={{ fontSize: '0.82em' }}>ein-standard-problem.mdc</code>).
          </li>
        </ul>
      </section>

      <section id="promo-stimme" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', color: '#fde68a', margin: '0 0 0.5rem' }}>Stimme &amp; Rolle</h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.6, fontSize: '0.92rem' }}>
          <li>
            <strong>Neutrale Stimme</strong> für Sprecher/TTS – nicht die persönliche Stimme der Galerie.
          </li>
          <li>
            Diese Seite ist der <strong>Arbeits- und Orientierungsort</strong> auf der APf; die{' '}
            <strong>Video-Vorschau</strong> oben nutzt dieselbe Stammdaten-URL wie die öffentliche Galerie
            (Highlight-Video).
          </li>
        </ul>
      </section>

      <section id="promo-datenquelle" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', color: '#fde68a', margin: '0 0 0.5rem' }}>Datenquelle</h2>
        <p style={{ margin: '0 0 0.5rem', lineHeight: 1.55, fontSize: '0.92rem' }}>
          Inhaltliche Basis: <strong>Präsentationsmappe Vollversion</strong> (Markdown unter{' '}
          <code style={{ fontSize: '0.85em' }}>public/praesentationsmappe-vollversion/</code>).
        </p>
        <p style={{ margin: 0 }}>
          <Link to={mappeVollOek2} style={{ color: '#5ffbf1', fontWeight: 600 }}>
            → Präsentationsmappe Vollversion öffnen
          </Link>
          <span style={{ fontSize: '0.82em', color: 'rgba(255,255,255,0.55)', marginLeft: '0.35rem' }}>
            (?context=oeffentlich)
          </span>
        </p>
      </section>

      <section id="promo-einspielen" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', color: '#fde68a', margin: '0 0 0.5rem' }}>Fertiges Produkt einspielen</h2>
        <p style={{ margin: '0 0 0.5rem', lineHeight: 1.55, fontSize: '0.92rem' }}>
          Wenn das Video (z. B. bei YouTube) steht: <strong>Link in den Stammdaten der ök2-Demo</strong> pflegen
          – eine Quelle für Außenkommunikation und Galerie (YouTube / Instagram / Highlight-Video).
        </p>
        <p style={{ margin: 0 }}>
          <Link to={adminOek2Stammdaten} style={{ color: '#5ffbf1', fontWeight: 600 }}>
            → Admin → Einstellungen (Kontext ök2)
          </Link>
        </p>
      </section>

      <section
        id="promo-ablauf"
        style={{
          marginBottom: '2rem',
          padding: '1rem 1.1rem',
          background: 'rgba(95,251,241,0.07)',
          borderRadius: '12px',
          border: '1px solid rgba(95,251,241,0.22)',
        }}
      >
        <h2 style={{ fontSize: '1.05rem', color: '#5ffbf1', margin: '0 0 0.5rem' }}>Ablauf (Orientierung)</h2>
        <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.65, fontSize: '0.88rem' }}>
          <li>Texte und Kernaussagen aus der Mappe übernehmen.</li>
          <li>Storyboard / Kapitel mit neutraler Stimme vorschlagen (TTS oder Sprecher:in).</li>
          <li>Video exportieren, auf YouTube hochladen (oder vergleichbar).</li>
          <li>Öffentlichen Link in Stammdaten ök2 eintragen – Besucher sehen ihn in der Galerie-App.</li>
        </ol>
      </section>

      <footer style={{ marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.12)', fontSize: '0.75rem', color: 'rgba(255,245,240,0.65)', lineHeight: 1.5 }}>
        <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
        <div style={{ marginTop: '0.25rem' }}>{PRODUCT_URHEBER_ANWENDUNG}</div>
      </footer>
    </article>
  )
}
