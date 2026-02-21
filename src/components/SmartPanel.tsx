import { useState, useRef } from 'react'
import { PROJECT_ROUTES, MOK2_ROUTE } from '../config/navigation'

/** VK2 immer per Voll-Navigation öffnen – verhindert, dass K2/Router-Zustand bleibt */
const VK2_GALERIE_URL = '/projects/vk2/galerie'

const PANEL_ORDER_KEY = 'smartpanel-reihenfolge'

type PanelItem = {
  id: string
  label: string
  page: string
  url: string
  color: string
  border: string
  direct?: boolean  // true = immer per window.location.href, nie über onNavigate
}

const DEFAULT_ITEMS: PanelItem[] = [
  { id: 'k2', label: '🎨 K2 Galerie Kunst&Keramik', page: 'galerie', url: PROJECT_ROUTES['k2-galerie'].galerie, color: 'linear-gradient(135deg, rgba(255,140,66,0.2), rgba(230,122,42,0.15))', border: 'rgba(255,140,66,0.4)' },
  { id: 'oek2', label: '🌐 Öffentliche Galerie K2', page: 'galerie-oeffentlich', url: PROJECT_ROUTES['k2-galerie'].galerieOeffentlich, color: 'linear-gradient(135deg, rgba(95,251,241,0.12), rgba(60,200,190,0.08))', border: 'rgba(95,251,241,0.3)' },
  { id: 'vk2', label: '🎨 VK2 Vereinsplattform', page: 'vk2', url: VK2_GALERIE_URL, color: 'linear-gradient(135deg, rgba(230,122,42,0.2), rgba(255,140,66,0.15))', border: 'rgba(255,140,66,0.4)' },
  { id: 'mok2', label: '📋 mök2 – Vertrieb & Promotion', page: 'mok2', url: MOK2_ROUTE, color: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.08))', border: 'rgba(251,191,36,0.3)' },
  { id: 'handbuch', label: '🧠 Handbuch', page: 'handbuch', url: '/k2team-handbuch', color: 'rgba(95,251,241,0.08)', border: 'rgba(95,251,241,0.2)', direct: true },
]

function loadOrder(): string[] {
  try {
    const saved = localStorage.getItem(PANEL_ORDER_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return DEFAULT_ITEMS.map(i => i.id)
}

function saveOrder(order: string[]) {
  try { localStorage.setItem(PANEL_ORDER_KEY, JSON.stringify(order)) } catch { /* ignore */ }
}

/** Deine To-dos – Vermarktung & Strategie (zum Abarbeiten). Links führen direkt zur Stelle. */
const MEINE_TODOS = [
  { text: 'Kooperation in mök2 „Kanäle 2026“ eintragen (Name/Ziel)', href: `${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-kanale-2026` },
  { text: 'Lizenz-Pakete (Basic/Pro/VK2) für Außen sichtbar prüfen', href: `${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-lizenz-pakete-aussen` },
  { text: 'Trust: AGB-Link, Datenschutz, Support prüfen', href: PROJECT_ROUTES['k2-galerie'].marketingOek2 },
  { text: 'Quartal: Kanäle 2026 in mök2 prüfen und anpassen', href: `${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-kanale-2026` },
  { text: 'Optional: Eine Kooperation anvisieren (Erstgespräch/Pilot)', href: `${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-kanale-2026` },
  { text: 'Optional: Kurz-Anleitung „So empfiehlst du“ nutzen', href: `${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-6` },
]

// Smart Panel (SP) – K2-Balken & Schnellzugriff (schlank, mök2-Links nur in mök2)

interface SmartPanelProps {
  currentPage?: string
  onNavigate?: (page: string) => void
}

export default function SmartPanel({ currentPage, onNavigate }: SmartPanelProps) {
  // Im APf-Kontext: Seite im Frame wechseln. Außerhalb: normale Navigation.
  const nav = (page: string, url: string) => {
    if (onNavigate) {
      onNavigate(page)
    } else {
      window.location.href = url
    }
  }

  // Sortierbare Hauptbuttons
  const [itemOrder, setItemOrder] = useState<string[]>(loadOrder)
  const [editMode, setEditMode] = useState(false)
  const dragId = useRef<string | null>(null)
  const dragOverId = useRef<string | null>(null)

  const sortedItems = itemOrder
    .map(id => DEFAULT_ITEMS.find(i => i.id === id))
    .filter(Boolean) as PanelItem[]

  const handleDragStart = (id: string) => { dragId.current = id }
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    dragOverId.current = id
  }
  const handleDrop = () => {
    if (!dragId.current || !dragOverId.current || dragId.current === dragOverId.current) return
    const newOrder = [...itemOrder]
    const fromIdx = newOrder.indexOf(dragId.current)
    const toIdx = newOrder.indexOf(dragOverId.current)
    newOrder.splice(fromIdx, 1)
    newOrder.splice(toIdx, 0, dragId.current)
    setItemOrder(newOrder)
    saveOrder(newOrder)
    dragId.current = null
    dragOverId.current = null
  }

  // Nur noch besondere Aktionen die nicht in den Hauptbuttons sind
  const extraActions = [
    {
      label: '📌 Zentrale Themen',
      action: () => nav('handbuch', '/k2team-handbuch?doc=16-ZENTRALE-THEMEN-FUER-NUTZER.md'),
      hint: 'Was Nutzer wissen sollten – Übersicht',
      highlight: true
    },
  ]

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      gap: '1rem',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(95, 251, 241, 0.2)',
        paddingBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#5ffbf1' }}>
            Smart Panel
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#8fa0c9' }}>
          Schnellzugriff
        </p>
      </div>

      {/* Sortierbare Hauptbuttons – wie iPhone: Bearbeiten → Ziehen */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>
            {editMode ? '↕ Ziehen zum Verschieben' : ''}
          </span>
          <button
            type="button"
            onClick={() => setEditMode(m => !m)}
            style={{ fontSize: '0.72rem', color: editMode ? '#5ffbf1' : 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem 0.3rem', fontFamily: 'inherit' }}
          >{editMode ? '✅ Fertig' : '✏️ Anordnen'}</button>
        </div>

        {sortedItems.map(item => (
          <div
            key={item.id}
            draggable={editMode}
            onDragStart={() => handleDragStart(item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDrop={handleDrop}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 1 }}
          >
            {editMode && (
              <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)', cursor: 'grab', userSelect: 'none', flexShrink: 0 }}>☰</span>
            )}
            <button
              type="button"
              onClick={() => { if (editMode) return; if (item.direct) window.location.href = item.url; else nav(item.page, item.url) }}
              style={{
                flex: 1,
                padding: '0.85rem 1rem',
                background: item.color,
                border: `1px solid ${item.border}`,
                borderRadius: '8px',
                color: item.id === 'oek2' || item.id === 'admin' || item.id === 'handbuch' ? '#5ffbf1' : item.id === 'mok2' ? '#fbbf24' : '#ff8c42',
                fontWeight: 600,
                fontSize: '0.95rem',
                textAlign: 'center',
                cursor: editMode ? 'grab' : 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </button>
          </div>
        ))}

      </div>

      {/* Deine To-dos – Vermarktung & Strategie */}
      <div>
        <h4 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '0.9rem',
          color: '#fbbf24',
          fontWeight: 600
        }}>
          📋 Deine To-dos
        </h4>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#8fa0c9' }}>
          Vermarktung & Strategie – Klick führt zur Stelle
        </p>
        <ul style={{ margin: 0, paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {MEINE_TODOS.map((todo, i) => (
            <li key={i} style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>
              <a
                href={todo.href}
                style={{ color: '#fbbf24', textDecoration: 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
                onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
              >
                {todo.text}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* APf-Navigation – Mission Control, Projekte, Zentrale Themen */}
      <div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }`}</style>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {extraActions.map((action, i) => {
            const isHighlighted = action.highlight
            return (
              <button
                key={i}
                onClick={action.action}
                style={{
                  padding: '0.6rem 0.75rem',
                  background: isHighlighted ? 'rgba(34,197,94,0.15)' : 'rgba(95,251,241,0.08)',
                  border: `1px solid ${isHighlighted ? 'rgba(34,197,94,0.4)' : 'rgba(95,251,241,0.15)'}`,
                  borderRadius: '6px',
                  color: isHighlighted ? '#86efac' : '#5ffbf1',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'inherit',
                  animation: isHighlighted ? 'pulse 2s infinite' : 'none'
                }}
                title={action.hint}
              >
                <span>{action.label}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>→</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
