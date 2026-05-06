/**
 * Reine Hilfen für webhook-stripe.js – ohne Stripe/Supabase (gut testbar).
 */
import {
  STRIPE_FAMILIE_CHECKOUT_TYPES,
  STRIPE_FAMILIE_LICENCE_PRICE_CENTS,
  STRIPE_CHECKOUT_LICENCE_TYPES,
} from './stripePriceCents.js'

export const WEBHOOK_TENANT_ID_REGEX = /^[a-z0-9-]{1,64}$/

export function normalizeWebhookTenantId(raw) {
  const tenantIdRaw = String(raw || '')
    .trim()
    .toLowerCase()
  if (!tenantIdRaw || !WEBHOOK_TENANT_ID_REGEX.test(tenantIdRaw)) return null
  return tenantIdRaw
}

export function buildGalerieUrl(baseUrl, tenantId) {
  if (!tenantId) return null
  const b = String(baseUrl || '').replace(/\/$/, '')
  if (!b) return null
  return `${b}/g/${tenantId}`
}

/**
 * Aus Checkout-Session: licence_type für DB/Webhook (Galerie vs. K2 Familie).
 * Absicherung wenn Metadaten in Stripe unvollständig ankommen – sonst Fallback „basic“ → falsche Erfolgsseite.
 * @param {object} session Stripe checkout.session
 */
export function resolveCheckoutLicenceType(session) {
  const metadata = session?.metadata || {}
  let lt = String(metadata.licenceType || metadata.licence_type || '').trim()
  if (STRIPE_FAMILIE_CHECKOUT_TYPES.includes(lt)) return lt
  if (STRIPE_CHECKOUT_LICENCE_TYPES.includes(lt)) return lt

  const productLine = String(metadata.productLine || '').trim()
  const tenantNorm = normalizeWebhookTenantId(metadata.tenantId)
  const isFamilieTenant = Boolean(tenantNorm?.startsWith('familie-'))
  const isFamilieProduct = productLine === 'k2_familie' || isFamilieTenant

  if (isFamilieProduct) {
    const fromAmount = inferFamilieLicenceTypeFromAmount(session?.amount_total)
    if (fromAmount) return fromAmount
    return 'familie_jahr'
  }

  if (lt) return lt
  return 'basic'
}

function inferFamilieLicenceTypeFromAmount(amountTotal) {
  const n = typeof amountTotal === 'number' ? amountTotal : Number(amountTotal)
  if (!Number.isFinite(n)) return null
  if (n === STRIPE_FAMILIE_LICENCE_PRICE_CENTS.familie_monat) return 'familie_monat'
  if (n === STRIPE_FAMILIE_LICENCE_PRICE_CENTS.familie_jahr) return 'familie_jahr'
  return null
}

/**
 * @param {number} amountTotal
 * @param {string|null} empfehlerId
 */
export function computeEmpfehlerGutschrift(amountTotal, empfehlerId) {
  const id = (empfehlerId || '').trim()
  if (!id || !amountTotal || amountTotal <= 0) {
    return { cents: 0, eur: '0.00' }
  }
  const cents = Math.round(amountTotal * 0.1)
  return { cents, eur: (cents / 100).toFixed(2) }
}

/**
 * @param {object} session Stripe checkout.session (completed)
 * @param {string} baseUrl z. B. https://k2-galerie.vercel.app
 */
export function rowsFromCheckoutSession(session, baseUrl) {
  const metadata = session?.metadata || {}
  const licenceType = resolveCheckoutLicenceType(session)
  const empfehlerId = (metadata.empfehlerId || '').trim() || null
  const customerName = (metadata.customerName || '').trim() || 'Kunde'
  const tenantId = normalizeWebhookTenantId(metadata.tenantId)
  const amountTotal = session.amount_total ?? 0
  const customerEmail =
    session.customer_email || session.customer_details?.email || ''
  const amountEur = (amountTotal / 100).toFixed(2)
  const { cents: gutschriftCents, eur: gutschriftEur } = computeEmpfehlerGutschrift(
    amountTotal,
    empfehlerId,
  )
  const b = String(baseUrl || '').replace(/\/$/, '')
  const isFamilieLicence = licenceType === 'familie_monat' || licenceType === 'familie_jahr'
  const galerieUrl = isFamilieLicence
    ? b
      ? `${b}/projects/k2-familie/meine-familie`
      : null
    : buildGalerieUrl(baseUrl, tenantId)

  const licenceInsert = {
    email: customerEmail,
    name: customerName,
    licence_type: licenceType,
    status: 'active',
    empfehler_id: empfehlerId,
    stripe_session_id: session.id,
  }
  const subId = typeof session.subscription === 'string' ? session.subscription.trim() : ''
  if (subId) licenceInsert.stripe_subscription_id = subId
  if (tenantId) licenceInsert.tenant_id = tenantId
  if (galerieUrl) licenceInsert.galerie_url = galerieUrl

  const paymentBase = {
    amount_cents: amountTotal,
    amount_eur: amountEur,
    currency: 'eur',
    stripe_session_id: session.id,
    empfehler_id: empfehlerId,
  }

  const buildPaymentInsert = (licenceId) => ({
    ...paymentBase,
    licence_id: licenceId,
  })

  const buildGutschriftInsert = (paymentId, licenceId) => {
    if (!empfehlerId || gutschriftCents <= 0) return null
    return {
      empfehler_id: empfehlerId,
      amount_eur: gutschriftEur,
      payment_id: paymentId,
      licence_id: licenceId,
    }
  }

  return {
    licenceInsert,
    buildPaymentInsert,
    buildGutschriftInsert,
    gutschriftCents,
    licenceType,
    customerEmail,
  }
}
