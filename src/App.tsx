import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { OrderProvider } from './context/OrderContext'
import { AboutPage } from './pages/AboutPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { EventDetailsPage } from './pages/EventDetailsPage'
import { EventsPage } from './pages/EventsPage'
import { HomePage } from './pages/HomePage'
import { TicketSelectionPage } from './pages/TicketSelectionPage'

function App() {
  const location = useLocation()

  return (
    <OrderProvider>
      <div className="min-h-screen bg-black text-black">
        <ScrollToTop />
        <Navbar />
        <ErrorBoundary resetKey={location.pathname}>
          <Routes>
            <Route element={<HomePage />} path="/" />
            <Route element={<EventsPage />} path="/events" />
            <Route element={<AboutPage />} path="/about" />
            <Route element={<EventDetailsPage />} path="/events/:slug" />
            <Route element={<TicketSelectionPage />} path="/events/:slug/tickets" />
            <Route element={<CheckoutPage />} path="/checkout" />
            <Route element={<ConfirmationPage />} path="/confirmation/:orderId" />
            <Route element={<HomePage />} path="*" />
          </Routes>
        </ErrorBoundary>
        <Footer />
      </div>
    </OrderProvider>
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
