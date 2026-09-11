import { useState, useEffect } from 'react'
import { usePersistentString } from '../hooks/usePersistentState'
import { ProjectNavButton } from '../components/Navigation'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import { getPublicGalerieUrl } from '../utils/publicLinks'
import { K2_GALERIE_APF_EINSTIEG } from '../config/navigation'

const VERCEL_GALERIE_URL = getPublicGalerieUrl('k2', 'galerie')
const VERCEL_APF_URL = `https://k2-galerie.vercel.app${K2_GALERIE_APF_EINSTIEG}`

const MobileConnectPage = () => {
  const [url, setUrl] = usePersistentString('k2-mobile-url')
  const [localGalerieUrl, setLocalGalerieUrl] = useState('')
  const [apfUrl, setApfUrl] = useState(VERCEL_APF_URL)
  const [qrUrl, setQrUrl] = useState('')
  const [localQrUrl, setLocalQrUrl] = useState('')
  const [apfQrUrl, setApfQrUrl] = useState('')

  useEffect(() => {
    if (!url || url === '') setUrl(VERCEL_GALERIE_URL)
  }, [])

  useEffect(() => {
    const hostname = window.location.hostname
    const port = window.location.port || '5177'
    const protocol = window.location.protocol
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      setLocalGalerieUrl(`${protocol}//${hostname}:${port}/galerie`)
      setApfUrl(`${protocol}//${hostname}:${port}${K2_GALERIE_APF_EINSTIEG}`)
    } else {
      const lanIp = '192.168.0.31'
      setLocalGalerieUrl(`http://${lanIp}:${port}/galerie`)
      setApfUrl(VERCEL_APF_URL)
    }
  }, [])

  const { versionTimestamp: qrVersionTs, serverLabel } = useQrVersionTimestamp()
  useEffect(() => {
    if (!url) { setQrUrl(''); return }
    QRCode.toDataURL(buildQrUrlWithBust(url, qrVersionTs), { width: 280, margin: 1 }).then(setQrUrl).catch(() => setQrUrl(''))
  }, [url, qrVersionTs])
  useEffect(() => {
    if (!localGalerieUrl) { setLocalQrUrl(''); return }
    QRCode.toDataURL(buildQrUrlWithBust(localGalerieUrl, qrVersionTs), { width: 200, margin: 1 }).then(setLocalQrUrl).catch(() => setLocalQrUrl(''))
  }, [localGalerieUrl, qrVersionTs])
  useEffect(() => {
    if (!apfUrl) { setApfQrUrl(''); return }
    QRCode.toDataURL(buildQrUrlWithBust(apfUrl, qrVersionTs), { width: 240, margin: 1 }).then(setApfQrUrl).catch(() => setApfQrUrl(''))
  }, [apfUrl, qrVersionTs])

  return (
    <main className="mission-wrapper">
      <div className="viewport">
        <header>
          <div>
            <h1>Handy mit Mac verbinden</h1>
            <div className="meta">Derselbe QR wie damals – feste Vercel-URL. Scan = immer aktuelle Version.</div>
          </div>
          <ProjectNavButton projectId="k2-galerie" />
        </header>

        <div
          className="card mobile-card"
          style={{
            border: '2px solid rgba(34, 197, 94, 0.5)',
            background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.08) 0%, transparent 50%)'
          }}
        >
          <h2 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>📱 Galerie auf dem Handy öffnen</h2>
          <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#a3a3a3' }}>
            Diesen QR mit der Handy-Kamera scannen → Galerie öffnet sich. Nach Änderungen am Mac: <strong>Veröffentlichen + Git Push</strong>, dann auf dem Handy <strong>Seite neu laden</strong> oder QR nochmal scannen.
          </p>
          <label className="field" style={{ marginBottom: '0.75rem' }}>
            URL (Standard: Vercel – funktioniert überall)
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={VERCEL_GALERIE_URL}
            />
          </label>
          {url && !url.includes('vercel.app') && (
            <button
              type="button"
              onClick={() => setUrl(VERCEL_GALERIE_URL)}
              style={{
                marginBottom: '1rem',
                padding: '0.5rem 1rem',
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Auf Vercel wechseln (überall nutzbar)
            </button>
          )}
          <div className="qr-area" style={{ marginTop: '0.5rem' }}>
            {qrUrl ? (
              <>
                <img src={qrUrl} alt="QR Code Galerie" />
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#666', wordBreak: 'break-all', textAlign: 'center' }}>
                  {url}
                </div>
              </>
            ) : (
              <div className="meta">URL eintragen → QR erscheint</div>
            )}
          </div>
        </div>

        <div
          className="card mobile-card"
          style={{
            marginTop: '1rem',
            border: '2px solid rgba(181, 74, 30, 0.45)',
            background: 'linear-gradient(180deg, rgba(181, 74, 30, 0.08) 0%, transparent 50%)'
          }}
        >
          <h2 style={{ color: '#b54a1e', marginBottom: '0.5rem' }}>🖥️ APf auf Handy / iPad</h2>
          <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#5c5650' }}>
            Arbeitsplattform (Smart Panel, 100 Generationen, …) – nicht die Besucher-Galerie.
            {serverLabel ? ` Stand: ${serverLabel}` : ''}
          </p>
          <div className="qr-area" style={{ marginTop: '0.5rem' }}>
            {apfQrUrl ? (
              <>
                <img src={apfQrUrl} alt="QR Code APf" />
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#5c5650', wordBreak: 'break-all', textAlign: 'center' }}>
                  {apfUrl}
                </div>
              </>
            ) : (
              <div className="meta">QR wird geladen …</div>
            )}
          </div>
          <Link
            to={K2_GALERIE_APF_EINSTIEG}
            style={{ display: 'inline-block', marginTop: '0.75rem', color: '#b54a1e', fontSize: '0.95rem', fontWeight: 600 }}
          >
            → APf hier öffnen
          </Link>
        </div>

        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>So geht’s</h3>
          <ol className="steps" style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>QR oben mit dem Handy scannen</li>
            <li>Galerie öffnet sich; optional: „Zum Home-Bildschirm“ für App-Icon</li>
            <li>Nach Änderungen am Mac: Veröffentlichen → Git Push → auf dem Handy neu laden</li>
          </ol>
        </div>

        {localGalerieUrl && (
          <details style={{ marginTop: '1rem' }} className="card mobile-card">
            <summary style={{ cursor: 'pointer', color: '#eab308', fontWeight: '600' }}>
              📶 Nur im gleichen WLAN (z. B. zu Hause)
            </summary>
            <p style={{ margin: '0.5rem 0 0.75rem', fontSize: '0.85rem', color: '#999' }}>
              Wenn Handy und Mac im gleichen WLAN sind – z. B. für Service-QR zum Aufkleben.
            </p>
            <div className="qr-area" style={{ display: 'inline-block', padding: '0.75rem', background: '#fefce8', borderRadius: '12px' }}>
              {localQrUrl && <img src={localQrUrl} alt="QR nur gleiches WLAN" />}
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#854d0e', wordBreak: 'break-all' }}>
              {localGalerieUrl}
            </div>
          </details>
        )}
      </div>
    </main>
  )
}

export default MobileConnectPage
