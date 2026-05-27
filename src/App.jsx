import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useProfile } from './context/ProfileContext'
import Nav from './components/Nav'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Guides from './pages/Guides'
import GuideDetail from './pages/GuideDetail'
import Explorer from './pages/Explorer'
import MonEspace from './pages/MonEspace'

function AppShell() {
  return (
    <>
      <Routes>
        <Route path="app" element={<Home />} />
        <Route path="app/guides" element={<Guides />} />
        <Route path="app/guide/:id" element={<GuideDetail />} />
        <Route path="app/explorer" element={<Explorer />} />
        <Route path="app/moi" element={<MonEspace />} />
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
      <Route path="onboarding" element={<Onboarding />} />
      <Route path="*" element={profileId ? <AppShell /> : <Navigate to="/onboarding" replace />} />
    </Routes>
  )
}
