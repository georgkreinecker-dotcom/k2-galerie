/**
 * Server-seitige Marketing-Attribution (conversion_licence nach Stripe-Checkout).
 * Eine Quelle für webhook-stripe und persistLicenceFromCheckoutSession.
 */

const CAMPAIGN_RE = /^[a-zA-Z0-9_-]{1,128}$/
const TENANT_RE = /^[a-z0-9-]{1,64}$/

export function marketingSurfaceFromProductLine(productLine) {
  if (productLine === 'k2_familie') return 'k2_familie'
  if (productLine === 'vk2') return 'vk2'
  return 'oeffentlich'
}

export function normalizeMarketingCampaignKey(raw) {
  const s = typeof raw === 'string' ? raw.trim() : ''
  if (!s || !CAMPAIGN_RE.test(s)) return null
  return s
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {object} session Stripe checkout.session
 * @param {{ productLine?: string, licenceInsert?: { tenant_id?: string } }} rowPack
 */
export async function persistMarketingLicenceConversion(supabase, session, rowPack) {
  if (!supabase || !session?.id) return
  const metadata = session.metadata || {}
  const campaign_key = normalizeMarketingCampaignKey(metadata.campaign_key || metadata.utm_campaign)
  const surface = marketingSurfaceFromProductLine(rowPack?.productLine)
  let tenant_visit_key =
    typeof rowPack?.licenceInsert?.tenant_id === 'string'
      ? rowPack.licenceInsert.tenant_id.trim().toLowerCase()
      : ''
  if (!tenant_visit_key) {
    tenant_visit_key = surface === 'oeffentlich' ? 'oeffentlich' : surface
  }
  if (!TENANT_RE.test(tenant_visit_key)) return

  const visitor_anon_id = `lic-${String(session.id).slice(0, 56)}`
  const row = {
    visitor_anon_id,
    surface,
    tenant_visit_key,
    event_kind: 'conversion_licence',
    campaign_key,
    referrer_host: null,
    path: '/lizenz-erfolg',
  }

  const { error } = await supabase.from('marketing_attribution_events').insert(row)
  if (error) {
    console.warn('persistMarketingLicenceConversion:', error.message)
  }
}
