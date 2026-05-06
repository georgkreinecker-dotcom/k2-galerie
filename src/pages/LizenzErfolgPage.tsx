/**
 * Seite nach erfolgreichem Stripe-Checkout (Redirect von Stripe).
 * URL: /lizenz-erfolg?session_id=...
 * Lädt Lizenz/URL per API und zeigt Zugangslinks (Künstler-Galerie oder K2 Familie je product_line) + Admin. Druckbare Lizenzbestätigung.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import '../App.css'
import { PROJECT_ROUTES, ENTDECKEN_ROUTE, K2_GALERIE_APF_EINSTIEG } from '../config/navigation'
import { PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { LicenseeAdminQrPanel } from '../components/LicenseeAdminQrPanel'
import { buildLizenzMusterErfolgLinks } from '../utils/lizenzMusterDemo'
import { rewriteLicenceUrlForCustomerDisplay } from '../utils/publicLinks'
import {
  LIZENZ_ERFOLG_LOADING_NEUTRAL,
  type LizenzProductLine,
  resolveLizenzErfolgProductLine,
  getLizenzErfolgCopy,
} from '../utils/lizenzErfolgCopy'

type LicenceLinks = {
  galerie_url: string | null
  admin_url: string
  name: string
  email: string
  product_line: LizenzProductLine
  tenant_id?: string | null
  licence_type?: string | null
  /** true = Links aus Stripe geholt, DB-Eintrag (Webhook) kann noch folgen */
  from_stripe?: boolean
}

/** Diese API-Fehler sinnlos mit Warte-Retries wiederholen */
const LIZENZ_SESSION_NO_RETRY_ERRORS = new Set(['Sitzung unbekannt', 'Supabase nicht konfiguriert'])

export default function LizenzErfolgPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const musterParam = searchParams.get('muster')
  const musterVorschau = musterParam === '1' && !sessionId
  const [links, setLinks] = useState<LicenceLinks | null>(null)
  const [linksError, setLinksError] = useState<string | null>(null)
  const [linksFetchTick, setLinksFetchTick] = useState(0)
  /** Verhindert, dass eine ältere Fetch-Kette nach „Erneut prüfen“ noch setLinks ausführt. */
  const licenceFetchEpochRef = useRef(0)
  const licenceSessionForLinksRef = useRef<string | null>(null)
  const bestaetigungsDatum = new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const copy = useMemo(
    () => getLizenzErfolgCopy(links?.product_line ?? 'k2_galerie'),
    [links?.product_line],
  )

  /** Vorschau-URLs (*.vercel.app außer Production) → öffentliche App, damit QR nicht auf Vercel-Login zeigt. */
  const linksForUi = useMemo((): LicenceLinks | null => {
    if (!links) return null
    const gRaw = links.galerie_url
    const g = gRaw ? rewriteLicenceUrlForCustomerDisplay(gRaw) : null
    const aRaw = links.admin_url || ''
    const a = rewriteLicenceUrlForCustomerDisplay(aRaw) || aRaw
    return { ...links, galerie_url: g, admin_url: a }
  }, [links])

  /** Muster-Erfolgsseite ohne Stripe: /lizenz-erfolg?muster=1 */
  useEffect(() => {
    if (sessionId) return
    if (musterParam !== '1') return
    const o = typeof window !== 'undefined' ? window.location.origin : ''
    const b = buildLizenzMusterErfolgLinks(o)
    setLinks({
      ...b,
      galerie_url: b.galerie_url ? rewriteLicenceUrlForCustomerDisplay(b.galerie_url) : null,
      admin_url: rewriteLicenceUrlForCustomerDisplay(b.admin_url) || b.admin_url,
    })
    setLinksError(null)
  }, [sessionId, musterParam])

  useEffect(() => {
    if (!sessionId) return
    const epoch = ++licenceFetchEpochRef.current
    const isNewSession = licenceSessionForLinksRef.current !== sessionId
    licenceSessionForLinksRef.current = sessionId
    /** Nur bei neuer Session leeren – sonst „Erneut prüfen“ kurz richtig, dann falsch (Merge fehlt). */
    if (isNewSession) setLinks(null)
    setLinksError(null)
    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    /** Webhook + DB können kurz brauchen; danach liefert die API ggf. Stripe-Fallback */
    const retryAfterMs = [2000, 5000, 10000]
    const load = async (attempt = 0) => {
      try {
        const res = await fetch(`/api/get-licence-by-session?session_id=${encodeURIComponent(sessionId)}`)
        const data = await res.json().catch(() => ({}))
        if (cancelled || licenceFetchEpochRef.current !== epoch) return

        if (!data.error) {
          setLinks((prev) => {
            if (licenceFetchEpochRef.current !== epoch) return prev
            const gIn = data.galerie_url
            const galerie_url =
              gIn != null && String(gIn).trim() !== '' ? String(gIn).trim() : prev?.galerie_url ?? null
            const tIn = data.tenant_id
            const tenant_id =
              tIn != null && String(tIn).trim() !== '' ? String(tIn).trim() : prev?.tenant_id ?? null
            const aIn = data.admin_url
            let admin_url =
              aIn != null && String(aIn).trim() !== '' ? String(aIn).trim() : prev?.admin_url || ''
            if (!admin_url) admin_url = K2_GALERIE_APF_EINSTIEG
            const licence_type = data.licence_type ?? prev?.licence_type ?? null
            const product_line = resolveLizenzErfolgProductLine({
              product_line: data.product_line,
              licence_type,
              galerie_url,
              admin_url,
              tenant_id,
            })
            const name = (data.name && String(data.name).trim()) ? String(data.name) : prev?.name || ''
            const email = (data.email && String(data.email).trim()) ? String(data.email) : prev?.email || ''
            return {
              galerie_url,
              admin_url,
              name,
              email,
              tenant_id,
              licence_type,
              product_line,
              from_stripe: data.from_stripe === true || prev?.from_stripe === true,
            }
          })
          setLinksError(null)
          return
        }

        if (LIZENZ_SESSION_NO_RETRY_ERRORS.has(String(data.error))) {
          if (licenceFetchEpochRef.current !== epoch) return
          setLinksError(data.hint || data.error)
          return
        }

        if (attempt < retryAfterMs.length) {
          retryTimer = setTimeout(() => load(attempt + 1), retryAfterMs[attempt])
          return
        }
        if (licenceFetchEpochRef.current !== epoch) return
        setLinksError(data.hint || data.error)
      } catch {
        if (cancelled || licenceFetchEpochRef.current !== epoch) return
        if (attempt < retryAfterMs.length) {
          retryTimer = setTimeout(() => load(attempt + 1), retryAfterMs[attempt])
          return
        }
        setLinksError('Verbindung fehlgeschlagen.')
      }
    }
    load()
    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [sessionId, linksFetchTick])

  return (
    <main style={{ maxWidth: 480, margin: '3rem auto', padding: '0 1rem', textAlign: 'center' }}>
      <style>{`
        @media print {
          .lizenz-erfolg-no-print { display: none !important; }
          .lizenz-erfolg-print-only { display: block !important; }
          .lizenz-bestaetigung-print { max-width: 100% !important; margin: 0 !important; box-shadow: none !important; border: 1px solid #ccc !important; }
        }
        .lizenz-erfolg-print-only { display: none; }
      `}</style>
      <div className="lizenz-erfolg-no-print" style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
      <h1 className="lizenz-erfolg-no-print" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        {musterVorschau ? 'Lizenz – Mustervorschau' : 'Lizenz erworben'}
      </h1>
      {musterVorschau && (
        <p
          className="lizenz-erfolg-no-print"
          style={{
            fontSize: '0.92rem',
            color: '#b45309',
            background: 'rgba(251,191,36,0.15)',
            border: '1px solid rgba(180,83,9,0.35)',
            borderRadius: 10,
            padding: '0.65rem 0.85rem',
            marginBottom: '1rem',
            textAlign: 'left',
            maxWidth: 420,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <strong>Muster:</strong> Keine echte Zahlung, keine Datenbank-Lizenz. So sieht die Seite nach einem Kauf aus – inkl. Druckvorschau unten. Diese Ansicht ist <strong>kein</strong> Nachweis, dass Stripe, Webhook oder Speicher funktionieren; dafür brauchst du einen <strong>Funktionstest Stripe</strong> (Lizenz kaufen → Stripe-Zahlungsseite → Testkarte → Erfolgsseite mit Session – lokal mit Key oder auf k2-galerie.vercel.app).
        </p>
      )}
      <p className="lizenz-erfolg-no-print" style={{ color: 'var(--k2-muted)', marginBottom: '1rem' }}>
        {musterVorschau
          ? 'Die Links unten sind Beispieladressen (Mandanten-ID muster-lizenz-demo).'
          : 'Vielen Dank für deine Zahlung. Deine Lizenz ist aktiv.'}
      </p>
      {linksError && (
        <div className="lizenz-erfolg-no-print" style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--k2-muted)', marginBottom: '0.65rem' }}>{linksError}</p>
          <button
            type="button"
            className="btn primary-btn"
            style={{ cursor: 'pointer' }}
            onClick={() => setLinksFetchTick((t) => t + 1)}
          >
            Erneut prüfen
          </button>
        </div>
      )}
      {linksForUi && (linksForUi.galerie_url || linksForUi.admin_url) && (
        <div className="lizenz-erfolg-no-print" style={{ marginBottom: '1.5rem', textAlign: 'left', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.65rem' }}>Dein Zugang – ein Klick</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--k2-muted)', marginBottom: '0.75rem', lineHeight: 1.45 }}>
            Das sind <strong>deine</strong> {copy.accessBlurbAfterDeine}
          </p>
          {copy.accessProductNote && (
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--k2-muted)',
                marginBottom: '0.75rem',
                lineHeight: 1.45,
                textAlign: 'left',
              }}
            >
              {copy.accessProductNote}
            </p>
          )}
          {linksForUi.from_stripe && (
            <p
              style={{
                fontSize: '0.78rem',
                color: '#b45309',
                background: 'rgba(251,191,36,0.12)',
                border: '1px solid rgba(180,83,9,0.25)',
                borderRadius: 8,
                padding: '0.5rem 0.65rem',
                marginBottom: '0.75rem',
                lineHeight: 1.4,
                textAlign: 'left',
              }}
            >
              <strong>Hinweis:</strong> Die Adressen stammen direkt von Stripe (die Datenbank war noch leer). Das ist in Ordnung zum Weiterarbeiten; der Eintrag in der Lizenz-Datenbank kann wenige Sekunden später nachkommen.
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.1rem' }}>
            {linksForUi.galerie_url && (
              <a
                href={linksForUi.galerie_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn primary-btn"
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}
              >
                {copy.openPrimaryLabel}
              </a>
            )}
            <a
              href={linksForUi.admin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn primary-btn"
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}
            >
              {copy.adminButtonLabel}
            </a>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--k2-muted)', marginBottom: '0.35rem' }}>Adresse zum Kopieren</p>
          {linksForUi.galerie_url && (
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>
              <a href={linksForUi.galerie_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--k2-accent)', wordBreak: 'break-all' }}>
                {linksForUi.galerie_url}
              </a>
            </p>
          )}
          <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.35rem', marginTop: '0.75rem' }}>Admin-Link</p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            <a href={linksForUi.admin_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--k2-accent)', wordBreak: 'break-all' }}>
              {linksForUi.admin_url}
            </a>
          </p>
          {(/\/admin/i.test(linksForUi.admin_url) || /\/meine-familie/i.test(linksForUi.admin_url)) && (
            <div style={{ marginTop: '1.25rem' }}>
              <LicenseeAdminQrPanel
                registrationComplete
                adminBaseUrl={linksForUi.admin_url}
                accent="#0d9488"
                bgCard="#f8fafc"
                text="#1c1a18"
                muted="#5c5650"
                radius="12px"
                primaryButtonBg="#b54a1e"
                primaryButtonColor="#fff"
                downloadFileName={
                  linksForUi.product_line === 'k2_familie' ? 'admin-qr-k2-familie.png' : 'admin-qr-k2-galerie.png'
                }
                heading="Admin-QR fürs Handy"
                adminIntro={
                  <p style={{ margin: 0 }}>
                    {musterVorschau ? (
                      <>
                        <strong>Mustervorschau:</strong> QR und Link sind nur Beispiele – nach einem echten Kauf erscheinen hier{' '}
                        <strong>deine</strong> Zugangsdaten.
                      </>
                    ) : linksForUi.product_line === 'k2_familie' ? (
                      <>
                        <strong>Admin-Zugang</strong> für K2 Familie. Unten in der{' '}
                        <strong>Lizenzbestätigung zum Drucken</strong> {copy.adminQrBodyUrlsClause}
                      </>
                    ) : (
                      <>
                        Das ist <strong>dein eigener</strong> Admin-Zugang nach dem Lizenzkauf – nicht der QR der ök2-Muster-Demo.
                        Unten in der <strong>Lizenzbestätigung zum Drucken</strong> {copy.adminQrBodyUrlsClause}
                      </>
                    )}
                  </p>
                }
              />
            </div>
          )}
        </div>
      )}
      {sessionId && !links && !linksError && (
        <p className="lizenz-erfolg-no-print" style={{ fontSize: '0.8rem', color: 'var(--k2-muted)', marginBottom: '1.5rem', lineHeight: 1.45 }}>
          {LIZENZ_ERFOLG_LOADING_NEUTRAL}
        </p>
      )}

      {/* Bestätigung zum Ausdrucken – Kunde kann sich das Schreiben von uns drucken */}
      <div
        className="lizenz-bestaetigung-print"
        style={{
          maxWidth: 420,
          margin: '0 auto 1.5rem',
          padding: '1.25rem',
          background: '#fff',
          border: '1px solid var(--k2-accent, #5ffbf1)',
          borderRadius: 12,
          textAlign: 'left',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: 'var(--k2-muted)' }}>{PRODUCT_BRAND_NAME}</p>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 700, color: '#1a1a1a' }}>Lizenzbestätigung</h2>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#333', lineHeight: 1.5 }}>
          Vielen Dank für deinen Lizenzabschluss. Deine Lizenz ist aktiv.
        </p>
        <p style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#555' }}>Datum: {bestaetigungsDatum}</p>
        {musterVorschau && (
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', color: '#92400e', fontWeight: 600 }}>
            MUSTER – keine rechtsgültige Lizenzbestätigung
          </p>
        )}
        {sessionId && (
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', wordBreak: 'break-all' }}>Referenz: {sessionId}</p>
        )}
        {!sessionId && musterVorschau && (
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Referenz: Mustervorschau (keine Stripe-Session)</p>
        )}
        {linksForUi?.galerie_url && (
          <p style={{ margin: '0.75rem 0 0.35rem', fontSize: '0.9rem', color: '#333', lineHeight: 1.45, wordBreak: 'break-all' }}>
            <strong>{copy.visitorUrlPrintLabel}:</strong> {linksForUi.galerie_url}
          </p>
        )}
        {linksForUi?.admin_url && (
          <p style={{ margin: '0.35rem 0 0.35rem', fontSize: '0.9rem', color: '#333', lineHeight: 1.45, wordBreak: 'break-all' }}>
            <strong>{copy.adminButtonLabel}:</strong> {linksForUi.admin_url}
          </p>
        )}
        <p className="lizenz-erfolg-no-print" style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', color: '#444', lineHeight: 1.5 }}>
          {copy.screenAdminQrHint}
        </p>
        <p className="lizenz-erfolg-print-only" style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', color: '#444', lineHeight: 1.5 }}>
          {linksForUi?.admin_url ? (
            <>
              <strong>Admin-Zugang:</strong> Die Adresse „{copy.adminButtonLabel}“ steht oben in diesem Kasten. Vor dem
              Drucken kannst du unter „Admin-QR fürs Handy“ noch einen QR speichern oder den Link kopieren – der QR erscheint
              nicht auf dem Ausdruck.
            </>
          ) : (
            <>
              <strong>Hinweis:</strong> {copy.printMissingUrlsHint} Fehlen sie nach der Zahlung dauerhaft, ist die
              serverseitige Verarbeitung (Webhook) noch nicht eingerichtet – siehe Dokumentation STRIPE-TEST / Webhook in
              Vercel.
            </>
          )}
        </p>
      </div>
      <p className="lizenz-erfolg-no-print" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => window.print()}
          className="btn primary-btn"
          style={{ cursor: 'pointer' }}
        >
          Bestätigung drucken
        </button>
      </p>

      {copy.showOptionalPlatformFooter && (
        <div
          className="lizenz-erfolg-no-print"
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            textAlign: 'left',
            maxWidth: 420,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <p style={{ fontSize: '0.78rem', color: 'var(--k2-muted)', marginBottom: '0.6rem', fontWeight: 600 }}>
            {copy.optionalFooterTitle}
          </p>
          <Link to={PROJECT_ROUTES['k2-galerie'].licences} style={{ color: 'var(--k2-accent)', fontSize: '0.88rem', display: 'block', marginBottom: '0.45rem' }}>
            Lizenzen & Abrechnung (Übersicht kgm) →
          </Link>
          <Link to={ENTDECKEN_ROUTE} style={{ color: 'var(--k2-muted)', fontSize: '0.85rem', display: 'block' }}>
            {copy.entdeckenFooterLabel}
          </Link>
        </div>
      )}
      <footer className="lizenz-erfolg-no-print" style={{ marginTop: '2rem', fontSize: '0.72rem', color: 'var(--k2-muted)', lineHeight: 1.45 }}>
        {PRODUCT_COPYRIGHT_BRAND_ONLY}
        <br />
        {PRODUCT_URHEBER_ANWENDUNG}
      </footer>
    </main>
  )
}
