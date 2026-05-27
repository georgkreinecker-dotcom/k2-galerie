/**
 * K2 Agentur – Auswertungs-Paket (nach 7 Tagen, Vorlage zum Ausfüllen).
 */
import type { MarketingPaidKanalId, MarketingProduktId } from './marketingKanalP1P2P3'
import { getSchaltPaket } from './k2AgenturLaunchCheckliste'

export function formatAuswertungPaketText(
  produkt: MarketingProduktId,
  kanal: MarketingPaidKanalId,
  ag?: string,
): string | null {
  const s = getSchaltPaket(produkt, kanal, ag)
  if (!s) return null
  const today = new Date()
  const in7 = new Date(today)
  in7.setDate(in7.getDate() + 7)
  const fmt = (d: Date) =>
    d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return [
    '── K2 Agentur · Auswertung (7 Tage) ──',
    `Kampagne: ${s.campaignKey}`,
    `Produkt: ${s.produktLabel} · Kanal: ${s.kanalLabel}`,
    `Zeitraum: ${fmt(today)} – ${fmt(in7)}`,
    '',
    'Im Ads-Konto notieren:',
    'Klicks: ___________',
    'Impressionen: ___________',
    'Kosten (€): ___________',
    'CTR (%): ___________',
    '',
    'Entscheidung (eins ankreuzen):',
    '[ ] Weiterlaufen – Budget gleich',
    '[ ] Budget erhöhen um _____ €/Tag',
    '[ ] Pausieren – Creative/Zielgruppe anpassen',
    '[ ] Stoppen – Kanal beendet',
    '',
    'Notiz:',
    '_______________________________________________',
    '',
    '── Ende Auswertung ──',
  ].join('\n')
}
