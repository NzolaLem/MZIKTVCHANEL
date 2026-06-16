import { Menu, Ticket, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { cn } from '../lib/cn'
import { scrollToInviteSection } from '../lib/inviteNavigation'

const navItems = [
  { label: 'Home', to: '/' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasPassedHero, setHasPassedHero] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const isVisible = !isHome || hasPassedHero || isOpen

  const openInviteAccess = () => {
    setIsOpen(false)

    if (!isHome) {
      navigate('/')
      window.setTimeout(() => scrollToInviteSection(), 80)
      return
    }

    scrollToInviteSection()
  }

  useEffect(() => {
    if (!isHome) {
      return
    }

    const updateVisibility = () => {
      const hero = document.querySelector<HTMLElement>('[data-home-hero]')
      const revealBottom = hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight

      setHasPassedHero(window.scrollY >= revealBottom - 24)
    }

    const frame = window.requestAnimationFrame(updateVisibility)
    window.addEventListener('scroll', updateVisibility, { passive: true })
    window.addEventListener('resize', updateVisibility)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateVisibility)
      window.removeEventListener('resize', updateVisibility)
    }
  }, [isHome])

  return (
    <>
      <header
        className={cn(
          'site-nav fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/92 text-white backdrop-blur transition duration-300',
          isVisible ? 'is-visible translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0',
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link className="flex items-center gap-3" to="/" onClick={() => setIsOpen(false)}>
            <img className="h-9 w-9 object-contain invert" src="/mzik-assets/mzik-logo.png" alt="Mzik" />
            <span className="leading-none">
              <span className="block text-sm font-semibold uppercase">MzikTV</span>
              <span className="block text-[0.7rem] uppercase text-white/52">Tickets</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'nav-link text-sm font-semibold uppercase text-white/62 transition hover:text-white',
                    isActive && 'text-white',
                  )
                }
                key={item.to}
                to={item.to}
              >
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button className="min-h-10 rounded-full px-5 py-2 normal-case" onClick={openInviteAccess} variant="light">
              <Ticket size={18} />
              Access invite
            </Button>
          </div>

          <button
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex h-10 w-10 items-center justify-center border border-white/30 text-white md:hidden"
            onClick={() => setIsOpen((open) => !open)}
            type="button"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isOpen && (
          <div className="border-t border-white/10 bg-black px-4 py-5 text-white md:hidden">
            <nav className="grid gap-2" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <NavLink
                  className="border border-white/18 px-4 py-3 text-sm font-semibold uppercase"
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <Button className="mt-4 w-full" onClick={openInviteAccess} variant="light">
              <Ticket size={18} />
              Access invite
            </Button>
          </div>
        )}
      </header>

      {!isHome && (
        <div aria-hidden className="h-16 bg-black" />
      )}
    </>
  )
}
