import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PROJECT_ROUTES, PLATFORM_ROUTES } from '../config/navigation'
import '../App.css'
import GaleriePage from './GaleriePage'
import GalerieVorschauPage from './GalerieVorschauPage'
import ShopPage from './ShopPage'
import ControlStudioPage from './ControlStudioPage'
import MissionControlPage from './MissionControlPage'
import ScreenshotExportAdmin from '../../components/ScreenshotExportAdmin'
import ProjectsPage from './ProjectsPage'
import PlatformStartPage from './PlatformStartPage'

type ViewMode = 'mobile' | 'tablet' | 'desktop' | 'split'

type PageSection = 
  | { id: string; name: string; icon: string; scrollTo: string }
  | { id: string; name: string; icon: string; filter: string }
  | { id: string; name: string; icon: string; path: string }

const DevViewPage = ({ defaultPage }: { defaultPage?: string }) => {
  const [searchParams] = useSearchParams()
  const pageFromUrl = searchParams.get('page')
  
  // Auto-Desktop für localhost
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '192.168.0.31' ||
    window.location.hostname === '192.168.0.27'
  )
  
  const [viewMode, setViewMode] = useState<ViewMode>(isLocalhost ? 'desktop' : 'mobile')
  const [currentPage, setCurrentPage] = useState(pageFromUrl || (isLocalhost ? 'galerie' : defaultPage) || 'mission')
  const [mobileZoom, setMobileZoom] = useState(1)
  const [desktopZoom, setDesktopZoom] = useState(1)
  
  // Update currentPage wenn URL-Parameter sich ändert
  useEffect(() => {
    if (pageFromUrl) {
      setCurrentPage(pageFromUrl)
    } else if (isLocalhost && !pageFromUrl) {
      // Auf localhost automatisch Galerie-Seite zeigen
      setCurrentPage('galerie')
    }
  }, [pageFromUrl, isLocalhost])

  // Bereiche der aktuellen Seite für untere Navigationsleiste
  const getPageSections = (): PageSection[] => {
    if (currentPage === 'galerie') {
      // Bereiche der Galerie-Homepage
      return [
        { id: 'willkommen', name: 'Willkommen', icon: '👋', scrollTo: 'willkommen' },
        { id: 'galerie', name: 'Galerie', icon: '🎨', scrollTo: 'galerie-vorschau' },
        { id: 'kunstschaffende', name: 'Künstler', icon: '👨‍🎨', scrollTo: 'kunstschaffende' },
      ]
    }
    if (currentPage === 'galerie-vorschau') {
      // Filter für Galerie-Vorschau
      return [
        { id: 'alle', name: 'Alle', icon: '📋', filter: 'alle' },
        { id: 'malerei', name: 'Malerei', icon: '🖼️', filter: 'malerei' },
        { id: 'keramik', name: 'Keramik', icon: '🏺', filter: 'keramik' },
      ]
    }
    // Standard: Projektseiten
    return [
      { id: 'galerie', name: 'Galerie', icon: '🎨', path: PROJECT_ROUTES['k2-galerie'].galerie },
      { id: 'control', name: 'Control', icon: '🎛️', path: PROJECT_ROUTES['k2-galerie'].controlStudio },
      { id: 'mission', name: 'Mission', icon: '📋', path: PROJECT_ROUTES['k2-galerie'].missionControl },
      { id: 'mobile', name: 'Mobile', icon: '📱', path: PROJECT_ROUTES['k2-galerie'].mobileConnect },
      { id: 'admin', name: 'Admin', icon: '⚙️', path: '/admin' },
    ]
  }

  const pageSections = getPageSections()
  const [galerieFilter, setGalerieFilter] = useState<'alle' | 'malerei' | 'keramik'>('alle')
  const [galerieSection, setGalerieSection] = useState<string>('willkommen')

  const pages = [
    { id: 'galerie', name: 'Galerie', component: GaleriePage },
    { id: 'galerie-vorschau', name: 'Galerie-Vorschau', component: GalerieVorschauPage },
    { id: 'shop', name: 'Shop', component: ShopPage },
    { id: 'control', name: 'Control Studio', component: ControlStudioPage },
    { id: 'mission', name: 'Mission Control', component: MissionControlPage },
    { id: 'admin', name: 'Admin', component: ScreenshotExportAdmin },
    { id: 'projects', name: 'Projekte', component: ProjectsPage },
    { id: 'platform', name: 'Plattform Start', component: PlatformStartPage },
  ]

  const currentPageData = pages.find(p => p.id === currentPage) || pages[0]
  const CurrentComponent = currentPageData.component
  
  // Render-Komponente mit Props für GaleriePage
  const renderComponent = () => {
    if (currentPage === 'galerie') {
      return <GaleriePage scrollToSection={galerieSection} />
    }
    if (currentPage === 'galerie-vorschau') {
      return <GalerieVorschauPage initialFilter={galerieFilter} />
    }
    return <CurrentComponent />
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#1a1a1a', 
      color: '#fff',
      padding: '1rem',
      paddingBottom: '80px', // Platz für untere Navigationsleiste
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Einfache Toolbar */}
      <div style={{
        background: '#2a2a2a',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Ansicht wählen */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {(['mobile', 'tablet', 'desktop', 'split'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '0.5rem 1rem',
                background: viewMode === mode ? '#5ffbf1' : '#444',
                color: viewMode === mode ? '#000' : '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: viewMode === mode ? 'bold' : 'normal'
              }}
            >
              {mode === 'mobile' ? '📱 iPhone' : 
               mode === 'tablet' ? '📱 iPad' : 
               mode === 'desktop' ? '💻 Desktop' : 
               '⚡ Split'}
            </button>
          ))}
          
          {/* Zoom Controls Mobile */}
          {(viewMode === 'mobile' || viewMode === 'split') && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#999' }}>📱 Zoom:</span>
              <button
                onClick={() => setMobileZoom(Math.max(0.5, mobileZoom - 0.1))}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                −
              </button>
              <span style={{ fontSize: '0.85rem', color: '#fff', minWidth: '40px', textAlign: 'center' }}>
                {Math.round(mobileZoom * 100)}%
              </span>
              <button
                onClick={() => setMobileZoom(Math.min(2, mobileZoom + 0.1))}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                +
              </button>
            </div>
          )}
          
          {/* Zoom Controls Desktop */}
          {(viewMode === 'desktop' || viewMode === 'split') && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#999' }}>💻 Zoom:</span>
              <button
                onClick={() => setDesktopZoom(Math.max(0.5, desktopZoom - 0.1))}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                −
              </button>
              <span style={{ fontSize: '0.85rem', color: '#fff', minWidth: '40px', textAlign: 'center' }}>
                {Math.round(desktopZoom * 100)}%
              </span>
              <button
                onClick={() => setDesktopZoom(Math.min(2, desktopZoom + 0.1))}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* Seite wählen */}
        <select
          value={currentPage}
          onChange={(e) => setCurrentPage(e.target.value)}
          style={{
            padding: '0.5rem',
            background: '#444',
            color: '#fff',
            border: '1px solid #666',
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}
        >
          {pages.map(page => (
            <option key={page.id} value={page.id}>{page.name}</option>
          ))}
        </select>

        {/* In neuem Tab öffnen */}
        <Link
          to={PLATFORM_ROUTES.home}
          style={{
            padding: '0.5rem 1rem',
            background: '#b8403a',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}
        >
          ← Mission
        </Link>
        <Link
          to={currentPageData.id === 'galerie' ? PROJECT_ROUTES['k2-galerie'].galerie :
              currentPageData.id === 'galerie-vorschau' ? PROJECT_ROUTES['k2-galerie'].galerieVorschau :
              currentPageData.id === 'shop' ? PROJECT_ROUTES['k2-galerie'].shop :
              currentPageData.id === 'control' ? PROJECT_ROUTES['k2-galerie'].controlStudio :
              currentPageData.id === 'mission' ? PROJECT_ROUTES['k2-galerie'].missionControl :
              currentPageData.id === 'admin' ? '/admin' :
              currentPageData.id === 'projects' ? '/projects' : '/'}
          style={{
            padding: '0.5rem 1rem',
            background: '#33a1ff',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}
          target="_blank"
        >
          ↗️ Vollbild
        </Link>
      </div>

      {/* Ansichten */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: viewMode === 'split' ? '1fr 1fr' : '1fr',
        gap: '1rem'
      }}>
        {/* Mobile/Tablet */}
        {(viewMode === 'mobile' || viewMode === 'tablet' || viewMode === 'split') && (
          <div style={{
            background: '#000',
            padding: '1rem',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ color: '#999', fontSize: '0.8rem', marginBottom: '0.5rem', textAlign: 'center' }}>
              {viewMode === 'split' ? '📱 Mobile' : viewMode === 'mobile' ? '📱 iPhone' : '📱 iPad'}
            </div>
            <div style={{
              width: viewMode === 'split' ? '375px' : viewMode === 'mobile' ? '375px' : '768px',
              height: viewMode === 'split' ? '667px' : viewMode === 'mobile' ? '667px' : '1024px',
              background: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid #333',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}>
              <div style={{ 
                width: '100%',
                height: '100%',
                overflow: 'auto',
                transform: `scale(${mobileZoom})`,
                transformOrigin: 'top center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch'
              }}>
                {renderComponent()}
              </div>
            </div>
          </div>
        )}

        {/* Desktop */}
        {(viewMode === 'desktop' || viewMode === 'split') && (
          <div style={{
            background: '#000',
            padding: '1rem',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ color: '#999', fontSize: '0.8rem', marginBottom: '0.5rem', textAlign: 'center' }}>
              💻 Desktop
            </div>
            <div style={{
              width: viewMode === 'split' ? '1200px' : '100%',
              height: viewMode === 'split' ? '800px' : '800px',
              background: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid #333',
              margin: viewMode === 'split' ? '0' : '0 auto',
              position: 'relative'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                transform: `scale(${desktopZoom})`,
                transformOrigin: 'top center'
              }}>
                {renderComponent()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Untere Navigationsleiste - zeigt Bereiche der aktuellen Seite */}
      {(currentPage === 'galerie' || currentPage === 'galerie-vorschau') && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#2a2a2a',
          borderTop: '1px solid #444',
          padding: '0.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          zIndex: 1000,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.3)'
        }}>
          {pageSections.map(section => {
            const isActive = 'filter' in section ? galerieFilter === section.filter : galerieSection === section.id
            
            return (
              <button
                key={section.id}
                onClick={() => {
                  if ('filter' in section) {
                    setGalerieFilter(section.filter as 'alle' | 'malerei' | 'keramik')
                    if (currentPage !== 'galerie-vorschau') {
                      setCurrentPage('galerie-vorschau')
                    }
                  } else if ('scrollTo' in section) {
                    setGalerieSection(section.id)
                    if (currentPage !== 'galerie') {
                      setCurrentPage('galerie')
                    }
                    // Scroll zu Bereich (wird von GaleriePage gehandhabt)
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  background: isActive ? '#5ffbf1' : '#444',
                  color: isActive ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  minWidth: '60px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{section.icon}</span>
                <span style={{ fontWeight: isActive ? 'bold' : 'normal' }}>{section.name}</span>
              </button>
            )
          })}
        </div>
      )}
      
      {/* Standard-Navigation für andere Seiten */}
      {currentPage !== 'galerie' && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#2a2a2a',
          borderTop: '1px solid #444',
          padding: '0.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          zIndex: 1000,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.3)'
        }}>
          {pageSections.map(section => (
            <Link
              key={section.id}
              to={'path' in section ? section.path : '#'}
              onClick={(e) => {
                e.preventDefault()
                if ('path' in section && section.path) {
                  setCurrentPage(section.id)
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.5rem 0.75rem',
                background: currentPage === section.id ? '#5ffbf1' : '#444',
                color: currentPage === section.id ? '#000' : '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '0.75rem',
                minWidth: '60px',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{section.icon}</span>
              <span style={{ fontWeight: currentPage === section.id ? 'bold' : 'normal' }}>{section.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default DevViewPage
