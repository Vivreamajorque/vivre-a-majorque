import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useProfile } from './context/ProfileContext'
import Nav from './components/Nav'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Guides from './pages/Guides'
import GuideDetail from './pages/GuideDetail'
import Explorer from './pages/Explorer'
import Annuaire from './pages/Annuaire'
import Boutiques from './pages/Boutiques'
import Outils from './pages/Outils'
import MonEspace from './pages/MonEspace'
import CoutInstallation from './pages/CoutInstallation'
import Contact from './pages/Contact'
import Medias from './pages/Medias'
import BudgetSimulator from './pages/BudgetSimulator'
import Accompagnements from './pages/Accompagnements'
import Actualites from './pages/Actualites'

function AppShell() {
  return (
    <>
      <Routes>
        <Route path="app" element={<Home />} />
        <Route path="app/guides" element={<Guides />} />
        <Route path="app/guide/:id" element={<GuideDetail />} />
        <Route path="app/explorer" element={<Explorer />} />
        <Route path="app/explorer/annuaire" element={<Annuaire />} />
        <Route path="app/explorer/boutiques" element={<Boutiques />} />
        <Route path="app/explorer/outils" element={<Outils />} />
        <Route path="app/explorer/contact" element={<Contact />} />
        <Route path="app/explorer/medias" element={<Medias />} />
        <Route path="app/moi" element={<MonEspace />} />
        <Route path="app/outils/cout" element={<CoutInstallation />} />
        <Route path="app/outils/budget" element={<BudgetSimulator />} />
        <Route path="app/actus" element={<Actualites />} />
        <Route path="app/explorer/actus" element={<Actualites />} />
        <Route path="app/explorer/accompagnements" element={<Accompagnements />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
      <Nav />
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
