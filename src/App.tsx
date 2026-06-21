import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { useScrollReveal } from './hooks/useScrollReveal'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { HomePage } from './pages/HomePage'

function App() {
  const location = useLocation()
  useScrollReveal(location.pathname)

  return (
    <div className="min-h-screen bg-black text-black">
      <ScrollToTop />
      <Navbar />
      <ErrorBoundary resetKey={location.pathname}>
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<AdminDashboardPage />} path="/admin" />
          <Route element={<Navigate replace to="/" />} path="/events" />
          <Route element={<Navigate replace to="/" />} path="/about" />
          <Route element={<Navigate replace to="/" />} path="/events/:slug" />
          <Route element={<Navigate replace to="/" />} path="/events/:slug/tickets" />
          <Route element={<HomePage />} path="*" />
        </Routes>
      </ErrorBoundary>
      <Footer />
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default App
