/**
 * Idempotent: Checkout-Session → Zeilen in licences + payments (+ ggf. Gutschrift).
 * Eine Quelle für webhook-stripe und get-licence-by-session (Heal wenn Webhook fehlte).
 */
import { rowsFromCheckoutSession } from './stripeWebhookLicenceShared.js'
import { seedGalerieLicenceBlobIfMissing } from './licenceBlobSeedShared.js'
import { persistMarketingLicenceConversion } from './marketingAttributionPersist.js'

async function trySeedK2GalerieBlob(rowPack) {
  if (rowPack.productLine !== 'k2_galerie') return
  const tenantId = rowPack.licenceInsert?.tenant_id
  if (!tenantId) return
  try {
    const out = await seedGalerieLicenceBlobIfMissing({
      tenantId,
      customerName: rowPack.licenceInsert?.name || '',
      customerEmail: rowPack.customerEmail || rowPack.licenceInsert?.email || '',
      focusDirection: rowPack.focusDirection,
    })
    if (out.seeded) console.log('persistLicence: gallery blob seeded', tenantId)
  } catch (e) {
    console.error('persistLicence: gallery blob seed error', e)
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {object} session Stripe checkout.session (complete, paid)
 * @param {string} baseUrl
 * @returns {Promise<{ ok: boolean, licenceId?: string, duplicate?: boolean, catchUp?: boolean, error?: string }>}
 */
export async function persistLicenceFromCheckoutSession(supabase, session, baseUrl) {
  const sessionId = session?.id
  if (!sessionId) return { ok: false, error: 'session.id fehlt' }

  const rowPack = rowsFromCheckoutSession(session, baseUrl)

  try {
    const { data: existingLicence } = await supabase
      .from('licences')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    if (existingLicence?.id) {
      const { data: existingPay } = await supabase
        .from('payments')
        .select('id')
        .eq('stripe_session_id', sessionId)
        .maybeSingle()

      if (existingPay?.id) {
        await trySeedK2GalerieBlob(rowPack)
        return { ok: true, licenceId: existingLicence.id, duplicate: true }
      }

      const payRow = rowPack.buildPaymentInsert(existingLicence.id)
      const { data: payment, error: errPayment } = await supabase
        .from('payments')
        .insert(payRow)
        .select('id')
        .single()

      if (errPayment) {
        console.error('persistLicence: payments catch-up failed', errPayment)
        return { ok: false, error: errPayment.message || 'payments catch-up' }
      }

      const gut = rowPack.buildGutschriftInsert(payment.id, existingLicence.id)
      if (gut) {
        const { error: errG } = await supabase.from('empfehler_gutschriften').insert(gut)
        if (errG) console.error('persistLicence: gutschriften catch-up failed', errG)
      }

      await trySeedK2GalerieBlob(rowPack)
      return { ok: true, licenceId: existingLicence.id, catchUp: true }
    }

    const { data: licence, error: errLicence } = await supabase
      .from('licences')
      .insert(rowPack.licenceInsert)
      .select('id')
      .single()

    if (errLicence) {
      if (errLicence.code === '23505') {
        const { data: raced } = await supabase
          .from('licences')
          .select('id')
          .eq('stripe_session_id', sessionId)
          .maybeSingle()
        if (raced?.id) {
          const { data: racedPay } = await supabase
            .from('payments')
            .select('id')
            .eq('stripe_session_id', sessionId)
            .maybeSingle()
          if (racedPay?.id) {
            await trySeedK2GalerieBlob(rowPack)
            return { ok: true, licenceId: raced.id, duplicate: true }
          }
          const payRow = rowPack.buildPaymentInsert(raced.id)
          const { data: payment, error: errPay2 } = await supabase
            .from('payments')
            .insert(payRow)
            .select('id')
            .single()
          if (errPay2) {
            console.error('persistLicence: payments after race failed', errPay2)
            return { ok: false, error: errPay2.message || 'payments after race' }
          }
          const gut = rowPack.buildGutschriftInsert(payment.id, raced.id)
          if (gut) {
            const { error: errG } = await supabase.from('empfehler_gutschriften').insert(gut)
            if (errG) console.error('persistLicence: gutschriften after race failed', errG)
          }
          await trySeedK2GalerieBlob(rowPack)
          return { ok: true, licenceId: raced.id, catchUp: true }
        }
      }
      console.error('persistLicence: licences insert failed', errLicence)
      return { ok: false, error: errLicence.message || 'licences insert' }
    }

    const { data: payment, error: errPayment } = await supabase
      .from('payments')
      .insert(rowPack.buildPaymentInsert(licence.id))
      .select('id')
      .single()

    if (errPayment) {
      console.error('persistLicence: payments insert failed', errPayment)
      return { ok: false, error: errPayment.message || 'payments insert' }
    }

    const gut = rowPack.buildGutschriftInsert(payment.id, licence.id)
    if (gut) {
      const { error: errGutschrift } = await supabase.from('empfehler_gutschriften').insert(gut)
      if (errGutschrift) {
        console.error('persistLicence: empfehler_gutschriften insert failed', errGutschrift)
      }
    }

    await trySeedK2GalerieBlob(rowPack)
    await persistMarketingLicenceConversion(supabase, session, rowPack)
    return { ok: true, licenceId: licence.id }
  } catch (err) {
    console.error('persistLicence:', err)
    return { ok: false, error: err?.message || 'persist failed' }
  }
}
