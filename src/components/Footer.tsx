import { Camera, Music2, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { inviteSectionId } from '../lib/inviteNavigation'

const footerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Access invite', to: `#${inviteSectionId}` },
  { label: 'Mzik store', to: 'https://mzik.store/' },
]

export function Footer() {
  return (
    <footer className="border-t border-black bg-black text-white">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-10">
        <div>
          <div className="flex items-center gap-3">
            <img className="h-12 w-12 invert" src="/mzik-assets/mzik-logo.png" alt="Mzik" />
            <div>
              <p className="text-lg font-semibold uppercase">MzikTV Tickets</p>
              <p className="text-sm uppercase text-white/55">Culture, music, fashion</p>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm leading-6 text-white/70">
            Invite-only ticket access for MzikTV experiences, live sessions, pop-ups, screenings, and fashion-connected
            cultural nights.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase">Quick links</h2>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            {footerLinks.map((link) =>
              link.to.startsWith('http') ? (
                <a className="hover:text-white" href={link.to} key={link.label} rel="noopener noreferrer" target="_blank">
                  {link.label}
                </a>
              ) : link.to.startsWith('#') ? (
                <a className="hover:text-white" href={link.to} key={link.label}>
                  {link.label}
                </a>
              ) : (
                <Link className="hover:text-white" key={link.label} to={link.to}>
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase">Contact</h2>
          <a className="mt-4 block text-sm text-white/70 hover:text-white" href="mailto:tickets@mzik.tv">
            tickets@mzik.tv
          </a>
          <div className="mt-5 flex gap-3">
            <a className="footer-icon" href="https://instagram.com/officialmzik" rel="noopener noreferrer" target="_blank">
              <Camera size={18} />
              <span className="sr-only">Instagram</span>
            </a>
            <a className="footer-icon" href="https://tiktok.com/officialmzik" rel="noopener noreferrer" target="_blank">
              <Music2 size={18} />
              <span className="sr-only">TikTok</span>
            </a>
            <a className="footer-icon" href="https://youtube.com" rel="noopener noreferrer" target="_blank">
              <Play size={18} />
              <span className="sr-only">YouTube</span>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/20 px-4 py-4 text-center text-xs uppercase text-white/50">
        2026 MzikTV Tickets. Invite-only access with backend ticket verification.
      </div>
    </footer>
  )
}
