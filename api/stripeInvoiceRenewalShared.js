/**
 * Stripe invoice.paid – nur Verlängerungen (subscription_cycle), nicht erste Zahlung (die läuft über checkout.session.completed).
 */

import { computeEmpfehlerGutschrift } from './stripeWebhookLicenceShared.js'

/** K2 Familie-Lizenzen haben kein Empfehlungsprogramm (auch nicht bei Verlängerung). */
function licenceIsK2Familie(licence) {
  const t = String(licence?.licence_type || '').trim()
  return t === 'familie_monat' || t === 'familie_jahr'
}

/**
 * @param {import('stripe').Invoice} invoice
 */
export function isSubscriptionRenewalInvoice(invoice) {
  const reason = invoice?.billing_reason
  return reason === 'subscription_cycle'
}

/**
 * @param {import('stripe').Invoice} invoice
 * @param {{ id: string, empfehler_id: string | null, licence_type?: string }} licence
 */
export function buildRenewalPaymentRow(invoice, licence) {
  const amountCents = typeof invoice.amount_paid === 'number' ? invoice.amount_paid : 0
  const amountEur = (amountCents / 100).toFixed(2)
  const empfehler = licenceIsK2Familie(licence) ? null : licence.empfehler_id ?? null
  return {
    licence_id: licence.id,
    amount_cents: amountCents,
    amount_eur: amountEur,
    currency: (invoice.currency || 'eur').toLowerCase(),
    stripe_session_id: invoice.id,
    empfehler_id: empfehler,
  }
}

/**
 * @param {import('stripe').Invoice} invoice
 * @param {{ id: string, empfehler_id: string | null, licence_type?: string }} licence
 * @param {string} paymentId
 */
export function buildRenewalGutschriftInsert(invoice, licence, paymentId) {
  if (licenceIsK2Familie(licence)) return null
  const amountCents = typeof invoice.amount_paid === 'number' ? invoice.amount_paid : 0
  const { cents, eur } = computeEmpfehlerGutschrift(amountCents, licence.empfehler_id)
  if (!licence.empfehler_id || cents <= 0) return null
  return {
    empfehler_id: licence.empfehler_id,
    amount_eur: eur,
    payment_id: paymentId,
    licence_id: licence.id,
  }
}
