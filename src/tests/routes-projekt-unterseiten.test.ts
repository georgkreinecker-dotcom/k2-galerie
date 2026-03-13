/**
 * Projekt-Unterseiten: Jede in PROJECT_ROUTES definierte Pfad muss in App.tsx als Route existieren.
 * BUG-034: Link öffnet APf statt Unterseite – oft weil neue Unterseite in navigation.ts, aber keine Route in App.tsx.
 */

import { describe, it, expect } from 'vitest'
import { PROJECT_ROUTES } from '../config/navigation'
import * as fs from 'fs'
import * as path from 'path'

const APP_TSX_PATH = path.join(process.cwd(), 'src', 'App.tsx')

describe('Projekt-Unterseiten: Routen in App.tsx (BUG-034)', () => {
  it('Jeder Pfad aus PROJECT_ROUTES[k2-galerie] ist in App.tsx abgedeckt (Route oder dynamische Route)', () => {
    const appContent = fs.readFileSync(APP_TSX_PATH, 'utf8')
    const routes = PROJECT_ROUTES['k2-galerie'] as Record<string, string>
    const pathToKeys = new Map<string, string[]>()
    for (const key of Object.keys(routes)) {
      const pathValue = routes[key]
      if (typeof pathValue !== 'string' || !pathValue.startsWith('/projects/k2-galerie')) continue
      const pathBase = pathValue.split('?')[0]
      if (pathBase === '/projects/k2-galerie') continue
      if (!pathToKeys.has(pathBase)) pathToKeys.set(pathBase, [])
      pathToKeys.get(pathBase)!.push(key)
    }

    const missing: string[] = []
    for (const [pathBase, keys] of pathToKeys) {
      const referencedByPath = appContent.includes(`"${pathBase}"`) || appContent.includes(`'${pathBase}'`)
      const referencedByAnyKey = keys.some(
        (k) => appContent.includes(`['k2-galerie'].${k}`) || appContent.includes(`["k2-galerie"].${k}`)
      )
      const coveredByVitaRoute = pathBase.startsWith('/projects/k2-galerie/vita/') && appContent.includes('vita/:artistId')
      if (!referencedByPath && !referencedByAnyKey && !coveredByVitaRoute) missing.push(`${keys[0]}=${pathBase}`)
    }

    expect(missing).toEqual([])
  })

  it('Generische Route /projects/:projectId steht in App.tsx (für 2-Segment-URLs)', () => {
    const appContent = fs.readFileSync(APP_TSX_PATH, 'utf8')
    expect(appContent).toContain('/projects/:projectId')
  })
})
