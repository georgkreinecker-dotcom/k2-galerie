/**
 * K2 Familie – Stammbaum-Grafik (echter Baum mit Generationen und Linien).
 * SVG-basiert: Wurzeln oben, Kinder darunter, Partner verbunden.
 */

import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import type { K2FamiliePerson } from '../types/k2Familie'

const NODE_W = 72
const NODE_H = 56
const ROW_H = 88
const COL_GAP = 24
const PERSON_LINK_PATH = '/projects/k2-familie/personen'

type Point = { x: number; y: number }

function getGenerations(personen: K2FamiliePerson[]): Map<string, number> {
  const byId = new Map(personen.map((p) => [p.id, p]))
  const level = new Map<string, number>()

  function getLevel(id: string): number {
    const cached = level.get(id)
    if (cached !== undefined) return cached
    const p = byId.get(id)
    if (!p || p.parentIds.length === 0) {
      level.set(id, 0)
      return 0
    }
    const parentLevels = p.parentIds.map((pid) => getLevel(pid))
    const L = 1 + Math.max(...parentLevels)
    level.set(id, L)
    return L
  }

  personen.forEach((p) => getLevel(p.id))
  return level
}

function orderInGeneration(
  personen: K2FamiliePerson[],
  ids: string[],
  levelMap: Map<string, number>
): string[] {
  if (ids.length <= 1) return ids
  const byId = new Map(personen.map((p) => [p.id, p]))
  const withParentOrder = ids.map((id) => {
    const p = byId.get(id)!
    const firstParent = p.parentIds[0]
    const parentIndex = firstParent ? ids.indexOf(firstParent) : -1
    return { id, parentIndex }
  })
  withParentOrder.sort((a, b) => a.parentIndex - b.parentIndex || a.id.localeCompare(b.id))
  return withParentOrder.map((x) => x.id)
}

export default function FamilyTreeGraph({
  personen,
  personPathPrefix = PERSON_LINK_PATH,
  noPhotos = false,
  printMode = false,
  scale = 1,
}: {
  personen: K2FamiliePerson[]
  personPathPrefix?: string
  /** Für Druck: nur Namen, keine Fotos (spart Tinte, schlank) */
  noPhotos?: boolean
  /** Druckansicht: keine Klick-Links, druckfreundliche Farben */
  printMode?: boolean
  /** Skalierung (z. B. 1.2 für Poster) */
  scale?: number
}) {
  const { levelMap, rows, width, height, nodePos, connectors, partnerLinks } = useMemo(() => {
    if (personen.length === 0) {
      return { levelMap: new Map<string, number>(), rows: [] as string[][], width: 400, height: 120, nodePos: new Map<string, Point>(), connectors: [] as { from: Point; to: Point }[], partnerLinks: [] as { a: Point; b: Point }[] }
    }

    const levelMap = getGenerations(personen)
    const byId = new Map(personen.map((p) => [p.id, p]))

    const rows: string[][] = []
    const maxLevel = Math.max(...Array.from(levelMap.values()))
    for (let L = 0; L <= maxLevel; L++) {
      const ids = personen.filter((p) => levelMap.get(p.id) === L).map((p) => p.id)
      rows.push(orderInGeneration(personen, ids, levelMap))
    }

    const nodePos = new Map<string, Point>()
    let totalW = 0
    rows.forEach((rowIds) => {
      const rowW = rowIds.length * (NODE_W + COL_GAP) - COL_GAP
      if (rowW > totalW) totalW = rowW
    })
    const width = Math.max(320, totalW + 80)
    const height = rows.length * ROW_H + 40

    rows.forEach((rowIds, rowIndex) => {
      const y = 24 + rowIndex * ROW_H + ROW_H / 2
      const rowW = rowIds.length * (NODE_W + COL_GAP) - COL_GAP
      const startX = (width - rowW) / 2 + (NODE_W + COL_GAP) / 2
      rowIds.forEach((id, i) => {
        nodePos.set(id, { x: startX + i * (NODE_W + COL_GAP), y })
      })
    })

    const connectors: { from: Point; to: Point }[] = []
    const partnerLinks: { a: Point; b: Point }[] = []

    personen.forEach((p) => {
      const pos = nodePos.get(p.id)
      if (!pos || p.parentIds.length === 0) return
      const parents = p.parentIds.map((id) => ({ id, pos: nodePos.get(id) })).filter((x) => x.pos)
      if (parents.length === 0) return
      const midParent: Point = parents.length === 1
        ? parents[0].pos!
        : { x: (parents[0].pos!.x + parents[1].pos!.x) / 2, y: parents[0].pos!.y }
      connectors.push({ from: midParent, to: pos })
    })

    const partnerDone = new Set<string>()
    personen.forEach((p) => {
      p.partners.forEach((pr) => {
        const key = [p.id, pr.personId].sort().join('-')
        if (partnerDone.has(key)) return
        partnerDone.add(key)
        const posA = nodePos.get(p.id)
        const posB = nodePos.get(pr.personId)
        if (posA && posB && levelMap.get(p.id) === levelMap.get(pr.personId)) {
          partnerLinks.push({ a: posA, b: posB })
        }
      })
    })

    return { levelMap, rows, width, height, nodePos, connectors, partnerLinks }
  }, [personen])

  if (personen.length === 0) return null

  const stroke = printMode ? '#0d9488' : 'rgba(20, 184, 166, 0.5)'
  const strokePartner = printMode ? '#0d9488' : 'rgba(20, 184, 166, 0.7)'
  const nodeFill = printMode ? '#f8fafc' : 'rgba(15, 20, 25, 0.9)'
  const nodeStroke = printMode ? '#0d9488' : 'rgba(20, 184, 166, 0.5)'
  const textFill = printMode ? '#1e293b' : 'rgba(255,255,255,0.95)'

  return (
    <div
      className={`family-tree-graph-wrapper ${printMode ? 'family-tree-graph-print' : ''}`}
      style={{ width: '100%', overflow: 'auto', marginBottom: printMode ? 0 : '1.5rem', transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'top center' }}
    >
      <svg
        className="family-tree-graph"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', minHeight: printMode ? 400 : 280, maxHeight: printMode ? 'none' : 520 }}
      >
        <defs>
          <filter id="tree-node-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
          </filter>
          <clipPath id="tree-node-clip">
            <ellipse cx={NODE_W / 2} cy={NODE_H / 2 - 4} rx={NODE_W / 2 - 2} ry={NODE_H / 2 - 8} />
          </clipPath>
        </defs>

        {/* Linien: Partner (horizontal) */}
        <g stroke={strokePartner} strokeWidth="2" fill="none">
          {partnerLinks.map(({ a, b }, i) => (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeDasharray="4 4" />
          ))}
        </g>

        {/* Linien: Eltern → Kinder */}
        <g stroke={stroke} strokeWidth="1.5" fill="none">
          {connectors.map(({ from, to }, i) => (
            <path
              key={i}
              d={`M ${from.x} ${from.y} L ${from.x} ${(from.y + to.y) / 2} L ${to.x} ${(from.y + to.y) / 2} L ${to.x} ${to.y}`}
            />
          ))}
        </g>

        {/* Knoten (Personen) */}
        {personen.map((p) => {
          const pos = nodePos.get(p.id)
          if (!pos) return null
          const to = `${personPathPrefix}/${p.id}`
          const showPhoto = !noPhotos && p.photo
          const initial = p.name.trim().charAt(0).toUpperCase() || '?'
          const nodeContent = (
            <>
              <g filter={printMode ? undefined : 'url(#tree-node-shadow)'}>
                <ellipse
                  cx={NODE_W / 2}
                  cy={NODE_H / 2 - 4}
                  rx={NODE_W / 2 - 2}
                  ry={NODE_H / 2 - 8}
                  fill={nodeFill}
                  stroke={nodeStroke}
                  strokeWidth="2"
                />
                {showPhoto && (
                  <image
                    href={p.photo}
                    x={2}
                    y={2}
                    width={NODE_W - 4}
                    height={NODE_H - 16}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath="url(#tree-node-clip)"
                  />
                )}
                {!showPhoto && (
                  <text
                    x={NODE_W / 2}
                    y={NODE_H / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={printMode ? '#64748b' : 'rgba(255,255,255,0.9)'}
                    fontSize="18"
                  >
                    {printMode ? initial : '👤'}
                  </text>
                )}
              </g>
              <text
                x={NODE_W / 2}
                y={NODE_H - 2}
                textAnchor="middle"
                fill={textFill}
                fontSize="10"
                fontWeight="600"
              >
                {p.name.split(' ')[0]}
              </text>
            </>
          )
          return (
            <g key={p.id} transform={`translate(${pos.x - NODE_W / 2}, ${pos.y - NODE_H / 2})`}>
              {printMode ? <g>{nodeContent}</g> : <Link to={to} style={{ cursor: 'pointer', display: 'block' }}>{nodeContent}</Link>}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
