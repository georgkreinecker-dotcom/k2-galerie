import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { TenantHomepageTemplate } from '../components/TenantHomepageTemplate'
import { K2_YOGA_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'

/** Stabile Ansicht – kein K2-Bild, kein Martina/Georg. */
const MUSTER_BILD =
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=80'

const TEAL = '#0f766e'

const printStyles = `
  @media print {
    .yoga-auftritt-no-print { display: none !important; }
    .yoga-auftritt .galerie-tenant-page > div:first-of-type { display: none !important; }
    .yoga-auftritt .galerie-tenant-page {
      min-height: auto !important;
      max-width: none !important;
      padding: 0 !important;
      background: #fff !important;
      color: #1c1a18 !important;
    }
    .yoga-auftritt header {
      min-height: 52mm !important;
      page-break-inside: avoid;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .yoga-auftritt img {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .yoga-auftritt a[href^="#"],
    .yoga-auftritt a[href*="#willkommen"],
    .yoga-auftritt button { display: none !important; }
    .yoga-auftritt a { color: #0f766e !important; }
    .seitenfuss { display: none; }
    @page { margin: 10mm 12mm 12mm 12mm; size: A4; }
  }
`

/**
 * Willkommen zur Ansicht: so sähe der Internetauftritt einer Absolventin aus.
 */
export default function K2YogaWillkommenPage() {
  const willkommenPath = PROJECT_ROUTES['k2-yoga'].willkommen
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()
  const [qrDataUrl, setQrDataUrl] = useState('')
  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${willkommenPath}` : willkommenPath

  useEffect(() => {
    const prev = document.title
    document.title = 'Yoga bei Anna – Beispiel-Auftritt'
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const targetUrl = buildQrUrlWithBust(shareUrl, qrVersionTs)
    QRCode.toDataURL(targetUrl, { width: 100, margin: 1 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('')
      })
    return () => {
      cancelled = true
    }
  }, [shareUrl, qrVersionTs])

  return (
    <div className="yoga-auftritt">
      <style>{printStyles}</style>
      <div
        className="yoga-auftritt-no-print"
        style={{
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          fontSize: '0.82rem',
          padding: '0.55rem 1rem',
          background: '#f0fdfa',
          color: '#0f766e',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.65rem 1rem',
          alignItems: 'center',
          borderBottom: '1px solid #99f6e4',
        }}
      >
        <Link to={PROJECT_ROUTES['k2-yoga'].praesentationsmappe} style={{ color: TEAL, fontWeight: 700, textDecoration: 'none' }}>
          ← Mappe
        </Link>
        <Link to={K2_YOGA_ROUTE} style={{ color: TEAL, fontWeight: 700, textDecoration: 'none' }}>
          Skizze
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: '0.4rem 0.75rem',
            background: TEAL,
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Als PDF drucken
        </button>
        <span>Muster-Auftritt · nicht eine echte Person</span>
      </div>
      <TenantHomepageTemplate
        tenantId="yoga-ansicht"
        title="Yoga bei Anna"
        subtext="Absolventin · Yoga-Akademie Austria"
        intro="Willkommen. Hier findest du nächste Stunden, Ort und Kontakt – mein Auftritt im Netz."
        adminUrl={PROJECT_ROUTES['k2-yoga'].admin}
        shareUrl={willkommenPath}
        artworks={[]}
        isMusterStart={false}
        welcomeImage={MUSTER_BILD}
        virtualTourImage={MUSTER_BILD}
        virtualTourVideo=""
        galerieCardImage={MUSTER_BILD}
        impressumAddress="Wels, Oberösterreich"
        impressumPhone=""
        impressumEmail=""
        mapsUrl=""
        liveAccent="#0f766e"
        liveBg1="#f4efe8"
        liveBg2="#e8f0ee"
        liveText="#1c1a18"
        liveMuted="#5c5650"
        liveSectionBg="#fffefb"
        hideAdminEntry
        shopUrl="#shop-bereich"
        galleryEnterUrl={`${willkommenPath}#willkommen`}
        galleryHintText="Termine und Kontakt – Angebote kommen dazu, wenn du sie einträgst."
        galleryEnterTitle="Stunden & Angebote"
        galleryEnterButtonLabel="Zur Übersicht →"
        artistSectionTitle="Lehrerin"
        galleryPageTitle="Stunden & Angebote"
        galleryCloseUrl={willkommenPath}
        impressumName="Yoga bei Anna"
        contactName1="Anna"
        openingHours="Kurse nach Vereinbarung"
        events={[
          { id: 'muster-yoga-1', title: 'Hatha · Abend', date: 'Dienstag 18:30' },
          { id: 'muster-yoga-2', title: 'Sanft · Vormittag', date: 'Donnerstag 9:00' },
        ]}
        qrDataUrl={qrDataUrl}
        artistSpotlight={{
          categoryLabel: 'Yoga',
          displayName: 'Anna',
          bio: 'Ausbildung an der Yoga-Akademie Austria. Unterrichte in kleiner Gruppe – klar, ruhig, alltagstauglich.',
          vitaTo: willkommenPath,
        }}
      />
    </div>
  )
}
