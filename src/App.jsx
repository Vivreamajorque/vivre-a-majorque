import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useProfile } from './context/ProfileContext'
import Nav from './components/Nav'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Guides from './pages/Guides'
import GuideDetail from './pages/GuideDetail'
import Explorer from './pages/Explorer'
import Annuaire from './pages/Annuaire'
import Boutiques from './pages/Boutiques'
import RessourcesLifestyle from './pages/RessourcesLifestyle'
import Outils from './pages/Outils'
import MonEspace from './pages/MonEspace'
import CoutInstallation from './pages/CoutInstallation'
import Contact from './pages/Contact'
import Medias from './pages/Medias'
import BudgetSimulator from './pages/BudgetSimulator'
import Accompagnements from './pages/Accompagnements'
import CasPratiques from './pages/CasPratiques'
import Actualites from './pages/Actualites'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
import Entreprendre from './pages/Entreprendre'
import AutonomaSimulator from './pages/AutonomaSimulator'
import CalendrierFiscal from './pages/CalendrierFiscal'
import CircuitsMajorque from './pages/CircuitsMajorque'
import MerciVisio from './pages/MerciVisio'
import FamilleInstallation from './pages/FamilleInstallation'
import RetraiteSimulator from './pages/RetraiteSimulator'
import Premium from './pages/Premium'
import Sidebar from './components/Sidebar'
import AmelyIAFloat from './components/AmelyIAFloat'

function AppShell() {
  return (
    <>
      <ScrollToTop />
      {/* Sidebar desktop — cachée sur mobile via CSS */}
      <div className="desktop-sidebar">
        <Sidebar />
      </div>
      {/* Contenu — wrapper desktop centré */}
      <div className="desktop-content">
        <Routes>
          <Route path="app" element={<Home />} />
          <Route path="app/guides" element={<Guides />} />
        <Route path="app/guide/:id" element={<GuideDetail />} />
        <Route path="app/explorer" element={<Explorer />} />
        <Route path="app/explorer/annuaire" element={<Annuaire />} />
        <Route path="app/explorer/boutiques" element={<Boutiques />} />
        <Route path="app/explorer/lifestyle" element={<RessourcesLifestyle />} />
        <Route path="app/explorer/outils" element={<Outils />} />
        <Route path="app/explorer/contact" element={<Contact />} />
        <Route path="app/explorer/medias" element={<Medias />} />
        <Route path="app/moi" element={<MonEspace />} />
        <Route path="app/outils/cout" element={<CoutInstallation />} />
        <Route path="app/outils/budget" element={<BudgetSimulator />} />
        <Route path="app/outils/autonoma" element={<AutonomaSimulator />} />
        <Route path="app/outils/fiscal" element={<CalendrierFiscal />} />
        <Route path="app/actus" element={<Actualites />} />
        <Route path="app/explorer/actus" element={<Actualites />} />
        <Route path="app/explorer/accompagnements" element={<Accompagnements />} />
        <Route path="app/cas-pratiques" element={<CasPratiques />} />
        <Route path="app/explorer/entreprendre" element={<Entreprendre />} />
        <Route path="app/explorer/circuits" element={<CircuitsMajorque />} />
        <Route path="app/merci-visio" element={<MerciVisio />} />
        <Route path="app/famille" element={<FamilleInstallation />} />
        <Route path="app/outils/retraite" element={<RetraiteSimulator />} />
        <Route path="app/premium" element={<Premium />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
      {/* Nav bottom — visible mobile uniquement via CSS */}
      <Nav />
      {/* Assistant Amely — bouton flottant sur toutes les pages */}
      <AmelyIAFloat />
      </div>
    </>
  )
}

export default function App() {
  const { profileId, loaded } = useProfile()

  if (!loaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--lin)' }}>
        <div style={{ fontSize: 32 }}>🌴</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="onboarding" element={profileId ? <Navigate to="/app" replace /> : <Onboarding />} />
      <Route path="*" element={profileId ? <AppShell /> : <Navigate to="/onboarding" replace />} />
    </Routes>
  )
}
