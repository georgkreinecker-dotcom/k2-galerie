import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { TenantHomepageTemplate } from '../components/TenantHomepageTemplate'
import { K2_YOGA_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'

/** Stabile Ansicht – kein K2-Bild, kein Martina/Georg. */
const MUSTER_BILD =
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=80'

/**
 * Willkommen zur Ansicht: so sähe der Internetauftritt einer Absolventin aus (gleiche Form wie Galerie).
 */
export default function K2YogaWillkommenPage() {
  const willkommenPath = PROJECT_ROUTES['k2-yoga'].willkommen
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()
  const [qrDataUrl, setQrDataUrl] = useState('')
  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${willkommenPath}` : willkommenPath

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
    <div>
      <div
        style={{
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          fontSize: '0.82rem',
          padding: '0.55rem 1rem',
          background: '#f5f3ff',
          color: '#5b21b6',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.65rem 1rem',
          alignItems: 'center',
          borderBottom: '1px solid #ddd6fe',
        }}
      >
        <Link to={K2_YOGA_ROUTE} style={{ color: '#5b21b6', fontWeight: 700, textDecoration: 'none' }}>
          ← K2 YOGA
        </Link>
        <span>Ansicht · so sähe ein Auftritt aus (Muster, nicht echte Person)</span>
      </div>
      <TenantHomepageTemplate
        tenantId="yoga-ansicht"
        title="Yoga bei Anna"
        subtext="Absolventin · Yoga-Akademie Austria"
        intro="Willkommen. Hier findest du nächste Stunden, Ort und Kontakt – derselbe Auftritt wie eine Galerie, mit meinem Namen."
        adminUrl={K2_YOGA_ROUTE}
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
