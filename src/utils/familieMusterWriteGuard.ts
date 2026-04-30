/**
 * K2 Familie: In der Demo-Sitzung (Willkommen ohne Einladung, ?t=huber-Umschau)
 * darf die Musterfamilie Huber nicht von Besuchern persistiert verändert werden.
 * Ausnahme: kanonischer Seed (`seedFamilieHuber`) mit skipMusterDemoGuard.
 */

import { FAMILIE_HUBER_TENANT_ID } from '../data/k2FamilieMusterHuberQuelle'
import { isFamilieNurMusterSession } from './familieMusterSession'

export function isFamilieMusterHuberDemoReadOnly(tenantId: string): boolean {
  return isFamilieNurMusterSession() && tenantId === FAMILIE_HUBER_TENANT_ID
}
