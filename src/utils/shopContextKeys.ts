/**
 * Shop/Kassa – kontexteigene localStorage-Keys (Datensicherheit).
 * K2, ök2 und VK2 haben getrennte Keys für Bestellungen und Verkaufslisten.
 * Siehe: docs/DATENSICHERHEIT-ABSICHERUNG.md, .cursor/rules/schutzmechanismen-alle-bereiche-keine-ausnahmen.mdc
 */

import { pilotScopeVk2Key } from './vk2StorageKeys'

export function getShopOrdersKey(fromOeffentlich: boolean, fromVk2: boolean): string {
  if (fromVk2) return pilotScopeVk2Key('k2-vk2-orders')
  if (fromOeffentlich) return 'k2-oeffentlich-orders'
  return 'k2-orders'
}

export function getShopSoldArtworksKey(fromOeffentlich: boolean, fromVk2: boolean): string {
  if (fromVk2) return pilotScopeVk2Key('k2-vk2-sold-artworks')
  if (fromOeffentlich) return 'k2-oeffentlich-sold-artworks'
  return 'k2-sold-artworks'
}

export function getShopStorageKeys(fromOeffentlich: boolean, fromVk2: boolean): { ordersKey: string; soldArtworksKey: string } {
  return {
    ordersKey: getShopOrdersKey(fromOeffentlich, fromVk2),
    soldArtworksKey: getShopSoldArtworksKey(fromOeffentlich, fromVk2),
  }
}
