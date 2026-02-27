import { useMemo, useState, useEffect } from 'react'
import { usePersistentString } from '../hooks/usePersistentState'
import { ProjectNavButton } from '../components/Navigation'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'

const VERCEL_GALERIE_URL = 'https://k2-galerie.vercel.app/projects/k2-galerie/galerie'

const MobileConnectPage = () => {
  const [url, setUrl] = usePersistentString('k2-mobile-url')
  const [localGalerieUrl, setLocalGalerieUrl] = useState('')
  const [devViewUrl, setDevViewUrl] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [localQrUrl, setLocalQrUrl] = useState('')
  const [devViewQrUrl, setDevViewQrUrl] = useState('')

  useEffect(() => {
    if (!url || url === '') setUrl(VERCEL_GALERIE_URL)
  }, [])

  useEffect(() => {
    const hostname = window.location.hostname
    const port = window.location.port || '5177'
    const protocol = window.location.protocol
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      setLocalGalerieUrl(`${protocol}//${hostname}:${port}/projects/k2-galerie/galerie`)
      setDevViewUrl(`${protocol}//${hostname}:${port}/#/dev-view`)
    } else {
      // Am Mac mit localhost: QR muss LAN-IP zeigen (z. B. 192.168.0.31), sonst kann das Handy nicht verbinden
      const lanIp = '192.168.0.31'
      setLocalGalerieUrl(`http://${lanIp}:${port}/projects/k2-galerie/galerie`)
      setDevViewUrl(`http://${lanIp}:${port}/#/dev-view`)
    }
  }, [])

  const { versionTimestamp: qrVersionTs, serverLabel } = useQrVersionTimestamp()
  // QR mit Server-Stand + Cache-Bust – Scan lädt immer aktuelle Version (auch im fremden WLAN)
  useEffect(() => {
    if (!url) { setQrUrl(''); return }
    QRCode.toDataURL(buildQrUrlWithBust(url, qrVersionTs), { width: 280, margin: 1 }).then(setQrUrl).catch(() => setQrUrl(''))
  }, [url, qrVersionTs])
  useEffect(() => {
    if (!localGalerieUrl) { setLocalQrUrl(''); return }
    QRCode.toDataURL(buildQrUrlWithBust(localGalerieUrl, qrVersionTs), { width: 200, margin: 1 }).then(setLocalQrUrl).catch(() => setLocalQrUrl(''))
  }, [localGalerieUrl, qrVersionTs])
  useEffect(() => {
    if (!devViewUrl) { setDevViewQrUrl(''); return }
    QRCode.toDataURL(devViewUrl, { width: 200, margin: 1 }).then(setDevViewQrUrl).catch(() => setDevViewQrUrl(''))
  }, [devViewUrl])

  return (
    <main className="mission-wrapper">
      <div className="viewport">
        <header>
          <div>
            <h1>Handy mit Mac verbinden</h1>
            <div className="meta">Derselbe QR wie damals – feste Vercel-URL, mit aktuellem Stand (Scan = immer aktuelle Version).</div>
          </div>
          <ProjectNavButton projectId="k2-galerie" />
        </header>

        {/* Hauptbereich: der eine QR für normale Nutzung */}
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

        {/* Kurz: 3 Schritte */}
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>So geht’s</h3>
          <ol className="steps" style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>QR oben mit dem Handy scannen</li>
            <li>Galerie öffnet sich; optional: „Zum Home-Bildschirm“ für App-Icon</li>
            <li>Nach Änderungen am Mac: Veröffentlichen → Git Push → auf dem Handy neu laden</li>
          </ol>
        </div>

        {/* Optional: nur gleiches WLAN */}
        {localGalerieUrl && (
          <details style={{ marginTop: '1rem' }} className="card mobile-card">
            <summary style={{ cursor: 'pointer', color: '#eab308', fontWeight: '600' }}>
              📶 Nur im gleichen WLAN (z. B. APf)
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

        {/* Dev-View nur auf Klappbereich */}
        {devViewUrl && (
          <details style={{ marginTop: '1rem' }}
            className="card mobile-card"
          >
            <summary style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#888' }}>
              🔧 Für Entwickler: Dev-View auf Handy öffnen
            </summary>
            <div style={{ marginTop: '0.75rem' }}>
              <div className="qr-area">
                {devViewQrUrl && <img src={devViewQrUrl} alt="Dev-View QR" />}
              </div>
              <Link to="/dev-view" style={{ display: 'inline-block', marginTop: '0.75rem', color: '#5ffbf1', fontSize: '0.9rem' }}>
                → Dev-View am Mac
              </Link>
            </div>
          </details>
        )}
      </div>
    </main>
  )
}

export default MobileConnectPage
