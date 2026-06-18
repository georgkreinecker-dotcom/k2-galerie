/**
 * Lizenz online kaufen – User wählt Produkt per Klick, dann Zahlung (Stripe).
 * Design wie ök2/Willkommensseite: klare Kartenauswahl, danach Formular → Stripe Checkout.
 */
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import '../App.css'
import { LIZENZPREISE, LIZENZ_PUBLIC_OFFER_LINE } from '../config/licencePricing'
import { LIZENZ_CHECKOUT_HINWEIS } from '../config/oek2AdsTransparency'
import {
  AGB_ROUTE,
  OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE,
  PROJECT_ROUTES,
} from '../config/navigation'
import { PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { isValidEmpfehlerIdFormat } from '../utils/empfehlerId'
import { WERBEUNTERLAGEN_STIL, PROMO_FONTS_URL } from '../config/marketingWerbelinie'
import { openCheckoutOrPaymentUrl } from '../utils/openCheckoutOrPaymentUrl'
import { getMarketingAttributionForCheckout, reportMarketingAttributionLanding } from '../utils/marketingAttribution'
import { DEFAULT_OEK2_FOCUS_DIRECTION_ID, FOCUS_DIRECTIONS, type FocusDirectionId } from '../config/tenantConfig'

const LICENCE_OPTIONS = [
  { id: 'basic' as const, ...LIZENZPREISE.basic },
  { id: 'pro' as const, ...LIZENZPREISE.pro },
]

export default function LizenzKaufenPage() {
  const [searchParams] = useSearchParams()
  const empfehlerFromUrl = searchParams.get('empfehler')?.trim() || ''

  const [licenceType, setLicenceType] = useState<'basic' | 'pro'>('pro')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [empfehlerId, setEmpfehlerId] = useState(empfehlerFromUrl)
  const [focusDirection, setFocusDirection] = useState<FocusDirectionId>(DEFAULT_OEK2_FOCUS_DIRECTION_ID)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** true = Stripe-Checkout wurde in neuem Tab geöffnet (z. B. Cursor-Vorschau/iframe) */
  const [checkoutStripeOpenedNewTab, setCheckoutStripeOpenedNewTab] = useState(false)
  const [agbAccepted, setAgbAccepted] = useState(false)

  useEffect(() => {
    if (empfehlerFromUrl && isValidEmpfehlerIdFormat(empfehlerFromUrl)) setEmpfehlerId(empfehlerFromUrl)
  }, [empfehlerFromUrl])

  /** P1-Sitelink Landing – Attribution messen (k= bleibt ohnehin in localStorage). */
  useEffect(() => {
    reportMarketingAttributionLanding({
      surface: 'oeffentlich',
      tenantVisitKey: 'oeffentlich',
      sessionDedupeKey: 'lizenz-kaufen-p1',
      search: searchParams.toString() ? `?${searchParams.toString()}` : '',
    })
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCheckoutStripeOpenedNewTab(false)
    if (!email.trim() || !name.trim()) {
      setError('Bitte E-Mail und Name angeben.')
      return
    }
    if (!agbAccepted) {
      setError('Bitte die AGB lesen und bestätigen.')
      return
    }
    setLoading(true)
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      const res = await fetch(`${base}/api/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenceType,
          email: email.trim(),
          name: name.trim(),
          focusDirection,
          ...(empfehlerId.trim() && isValidEmpfehlerIdFormat(empfehlerId) ? { empfehlerId: empfehlerId.trim() } : {}),
          marketingAttribution: getMarketingAttributionForCheckout(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const parts = [data?.error, data?.hint].filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
        setError(parts.length > 0 ? parts.join('\n\n') : 'Checkout konnte nicht gestartet werden.')
        setLoading(false)
        return
      }
      if (data?.url) {
        const how = openCheckoutOrPaymentUrl(data.url)
        if (how === 'new_tab') {
          setLoading(false)
          setCheckoutStripeOpenedNewTab(true)
          return
        }
        if (how === 'popup_blocked') {
          setLoading(false)
          setError(
            `Der Browser hat das neue Fenster blockiert. Bitte Pop-ups für diese Seite erlauben – oder diese Adresse im Browser öffnen:\n\n${data.url}`,
          )
          return
        }
        if (how === 'blocked') {
          setLoading(false)
          setError('Die Zahlungs-Adresse ist ungültig. Bitte später erneut versuchen.')
          return
        }
        return
      }
      setError('Keine Zahlungs-URL erhalten.')
    } catch (err) {
      setError('Verbindungsfehler. Bitte später erneut versuchen.')
    }
    setLoading(false)
  }

  const accent = '#ff8c42'
  const accentDeep = '#b54a1e'
  const bgLight = '#f6f0e8'
  const bgCard = '#fffefb'
  const text = '#2a1f14'
  const muted = '#7a6a58'
  const fontHeading = WERBEUNTERLAGEN_STIL.fontHeading
  const fontBody = WERBEUNTERLAGEN_STIL.fontBody

  return (
    <div style={{ background: bgLight, minHeight: '100vh', fontFamily: fontBody, color: text }}>
      <link rel="stylesheet" href={PROMO_FONTS_URL} />
      <main style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(2rem, 5vw, 3rem) 1rem' }}>
        <h1 style={{ fontFamily: fontHeading, fontSize: 'clamp(1.5rem, 4vw, 1.85rem)', fontWeight: 700, color: text, marginBottom: '0.35rem' }}>
          Lizenz auswählen & bezahlen
        </h1>
        <p style={{ color: muted, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          <strong>{PRODUCT_BRAND_NAME}</strong> · Galerie-Software · {LIZENZ_PUBLIC_OFFER_LINE}
        </p>
        <p
          style={{
            color: text,
            fontSize: '0.88rem',
            marginBottom: '1.25rem',
            lineHeight: 1.55,
            padding: '0.65rem 0.85rem',
            background: '#fff8f0',
            border: '1px solid rgba(181,74,30,0.35)',
            borderRadius: 10,
          }}
        >
          {LIZENZ_CHECKOUT_HINWEIS}{' '}
          <Link to={AGB_ROUTE} style={{ color: accentDeep, fontWeight: 600 }}>
            AGB
          </Link>
        </p>
        <p style={{ color: muted, fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          Produkt anklicken – Name und E-Mail eintragen – Zahlung per Karte (Stripe). Nach dem Kauf ist deine Lizenz aktiv.
        </p>
        {/* 1. Produkt per Klick auswählen */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: text, marginBottom: '0.6rem' }}>Lizenz wählen</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {LICENCE_OPTIONS.map((opt) => {
              const selected = licenceType === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLicenceType(opt.id)}
                  style={{
                    padding: '1rem 0.75rem',
                    background: selected ? `${accent}14` : bgCard,
                    border: selected ? `2px solid ${accent}` : '1px solid rgba(181,74,30,0.25)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontFamily: fontBody,
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    color: text,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{opt.name}</div>
                  <div style={{ fontSize: '0.9rem', color: accent, fontWeight: 600 }}>{opt.price}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Kontaktdaten + optional Empfehler */}
        <form onSubmit={handleSubmit} style={{ background: bgCard, border: `1px solid ${accent}44`, borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: muted }}>Wofür nutzt du deine Galerie? *</label>
            <div style={{ display: 'grid', gap: '0.45rem' }}>
              {FOCUS_DIRECTIONS.map((direction) => {
                const selected = focusDirection === direction.id
                return (
                  <label
                    key={direction.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      padding: '0.55rem 0.7rem',
                      border: selected ? `2px solid ${accent}` : `1px solid ${accent}33`,
                      borderRadius: 10,
                      background: selected ? `${accent}12` : bgLight,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: text,
                    }}
                  >
                    <input
                      type="radio"
                      name="focusDirection"
                      checked={selected}
                      onChange={() => setFocusDirection(direction.id)}
                      style={{ accentColor: accentDeep }}
                    />
                    {direction.label}
                  </label>
                )
              })}
            </div>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: muted, lineHeight: 1.4 }}>
              Diese Sparte erscheint nach dem Kauf in deinen Stammdaten und steuert Typen und Kategorien.
            </p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: muted }}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dein Name"
              required
              style={{ width: '100%', padding: '0.75rem 1rem', border: `1px solid ${accent}44`, borderRadius: '10px', fontFamily: fontBody, fontSize: '1rem', background: bgLight, color: text, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: muted }}>E-Mail *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Mail"
              required
              style={{ width: '100%', padding: '0.75rem 1rem', border: `1px solid ${accent}44`, borderRadius: '10px', fontFamily: fontBody, fontSize: '1rem', background: bgLight, color: text, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: muted }}>Empfehler-ID (optional) – 10 % Rabatt</label>
            <input
              type="text"
              value={empfehlerId}
              onChange={(e) => setEmpfehlerId(e.target.value)}
              placeholder="z. B. K2-E-XXXXXX"
              style={{ width: '100%', padding: '0.75rem 1rem', border: `1px solid ${accent}44`, borderRadius: '10px', fontFamily: fontBody, fontSize: '1rem', background: bgLight, color: text, boxSizing: 'border-box' }}
            />
            {empfehlerId && !isValidEmpfehlerIdFormat(empfehlerId) && (
              <p style={{ fontSize: '0.8rem', color: muted, marginTop: '0.25rem' }}>Format: K2-E- und 6 Zeichen</p>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.55rem',
                fontSize: '0.88rem',
                lineHeight: 1.45,
                cursor: 'pointer',
                color: text,
              }}
            >
              <input
                type="checkbox"
                checked={agbAccepted}
                onChange={(e) => setAgbAccepted(e.target.checked)}
                style={{ marginTop: '0.2rem', width: '1.05rem', height: '1.05rem', flexShrink: 0 }}
              />
              <span>
                Ich habe die{' '}
                <Link to={AGB_ROUTE} style={{ color: accentDeep, fontWeight: 700 }}>
                  Allgemeinen Geschäftsbedingungen
                </Link>{' '}
                gelesen und akzeptiere sie. *
              </span>
            </label>
          </div>

          {checkoutStripeOpenedNewTab && (
            <p
              style={{
                color: '#166534',
                fontSize: '0.9rem',
                margin: '0 0 1rem',
                lineHeight: 1.5,
                padding: '0.65rem 0.85rem',
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(22,101,52,0.35)',
                borderRadius: 10,
              }}
            >
              <strong>Neuer Tab:</strong> Die Stripe-Zahlungsseite wurde geöffnet – dort mit Testkarte weitermachen. (In der Cursor-Vorschau öffnet sich der Checkout bewusst im Browser-Tab.)
            </p>
          )}
          {error && (
            <p style={{ color: '#c53030', fontSize: '0.9rem', margin: '0 0 1rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !agbAccepted}
            style={{
              width: '100%',
              padding: '1rem 1rem',
              background: loading || !agbAccepted ? muted : `linear-gradient(135deg, ${accent} 0%, ${accentDeep} 100%)`,
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: loading || !agbAccepted ? 'not-allowed' : 'pointer',
              fontFamily: fontBody,
              fontSize: '1.05rem',
            }}
          >
            {loading ? 'Wird weitergeleitet …' : 'Jetzt bezahlen (Karte/Stripe) →'}
          </button>
        </form>

        <p style={{ fontSize: '0.85rem', color: muted, marginTop: '1.25rem', lineHeight: 1.55 }}>
          <Link to={OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE} style={{ color: accent, fontWeight: 600 }}>
            ← Entdecken
          </Link>
          {' · '}
          <Link to={PROJECT_ROUTES['k2-galerie'].galerieOeffentlich} style={{ color: accent, fontWeight: 600 }}>
            Demo-Galerie
          </Link>
          {' · '}
          <Link to={AGB_ROUTE} style={{ color: accent, fontWeight: 600 }}>
            AGB
          </Link>
        </p>

        <footer
          style={{
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(181,74,30,0.2)',
            fontSize: '0.72rem',
            color: muted,
            lineHeight: 1.5,
          }}
        >
          <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
          <div style={{ marginTop: '0.35rem' }}>{PRODUCT_URHEBER_ANWENDUNG}</div>
        </footer>
      </main>
    </div>
  )
}
