import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import ProjectsPage from './pages/ProjectsPage'
import ProjectStartPage from './pages/ProjectStartPage'
import ControlStudioPage from './pages/ControlStudioPage'
import MissionControlPage from './pages/MissionControlPage'
import MobileConnectPage from './pages/MobileConnectPage'
import GaleriePage from './pages/GaleriePage'
import GalerieVorschauPage from './pages/GalerieVorschauPage'
import ShopPage from './pages/ShopPage'
import VirtuellerRundgangPage from './pages/VirtuellerRundgangPage'
import DialogStandalonePage from './pages/DialogStandalonePage'
import KeyPage from './pages/KeyPage'
import KostenPage from './pages/KostenPage'
import SecondMacPage from './pages/SecondMacPage'
import ScreenshotExportAdmin from '../components/ScreenshotExportAdmin'
import DevViewPage from './pages/DevViewPage'
import { PLATFORM_ROUTES, PROJECT_ROUTES } from './config/navigation'

function App() {
  return (
    <>
    <Routes>
      {/* Root-Route: Galerie als Homepage */}
      <Route path="/" element={<GaleriePage />} />
      
      {/* Plattform-Routen */}
      <Route path="/platform" element={<DevViewPage defaultPage="mission" />} />
      <Route path={PLATFORM_ROUTES.key} element={<KeyPage />} />
      <Route path={PLATFORM_ROUTES.kosten} element={<KostenPage />} />
      <Route path={PLATFORM_ROUTES.dialog} element={<DialogStandalonePage />} />
      <Route path="/platform/second-mac" element={<SecondMacPage />} />
      
      {/* Projekt-Routen */}
      <Route path={PLATFORM_ROUTES.projects} element={<ProjectsPage />} />
      <Route path="/projects/:projectId" element={<ProjectStartPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].galerie} element={<GaleriePage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].galerieVorschau} element={<GalerieVorschauPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].shop} element={<ShopPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].virtuellerRundgang} element={<VirtuellerRundgangPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].controlStudio} element={<ControlStudioPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].missionControl} element={<MissionControlPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].mobileConnect} element={<MobileConnectPage />} />
      
      {/* Legacy-Routen (Redirect für bestehende Links) */}
      <Route path="/key" element={<Navigate to={PLATFORM_ROUTES.key} replace />} />
      <Route path="/kosten" element={<Navigate to={PLATFORM_ROUTES.kosten} replace />} />
      <Route path="/dialog" element={<Navigate to={PLATFORM_ROUTES.dialog} replace />} />
      <Route path="/galerie" element={<GaleriePage />} />
      <Route path="/admin" element={<ScreenshotExportAdmin />} />
      <Route path="/control-studio" element={<Navigate to={PROJECT_ROUTES['k2-galerie'].controlStudio} replace />} />
      <Route path="/mission-control" element={<Navigate to={PROJECT_ROUTES['k2-galerie'].missionControl} replace />} />
      <Route path="/mobile-connect" element={<Navigate to={PROJECT_ROUTES['k2-galerie'].mobileConnect} replace />} />
      
      {/* Dev-Tool für parallele Ansichten */}
      <Route path="/dev-view" element={<DevViewPage />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default App
// Force rebuild
