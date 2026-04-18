/**
 * Zwei Katalog-Listen zusammenführen: gleiche id → neuere Version (updatedAt || createdAt).
 */
import type { TestuserKatalogEintrag } from './testuserKatalogStorage'

function entryTimestamp(e: TestuserKatalogEintrag): number {
  const u = e.updatedAt || e.createdAt
  const t = Date.parse(u)
  return Number.isFinite(t) ? t : 0
}

export function mergePilotKatalog(a: TestuserKatalogEintrag[], b: TestuserKatalogEintrag[]): TestuserKatalogEintrag[] {
  const byId = new Map<string, TestuserKatalogEintrag>()
  for (const e of a) {
    byId.set(e.id, e)
  }
  for (const e of b) {
    const o = byId.get(e.id)
    if (!o) {
      byId.set(e.id, e)
    } else {
      byId.set(e.id, entryTimestamp(e) >= entryTimestamp(o) ? e : o)
    }
  }
  return [...byId.values()].sort((x, y) => entryTimestamp(x) - entryTimestamp(y))
}
