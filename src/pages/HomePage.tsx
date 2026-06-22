import { useState } from 'react'
import { Camera, Clapperboard, Shirt, Sparkles } from 'lucide-react'
import { EventCard } from '../components/EventCard'
import { HeroSection } from '../components/HeroSection'
import { InfiniteLookbookSection } from '../components/InfiniteLookbookSection'
import { InviteAccessSection } from '../components/InviteAccessSection'
import { Marquee } from '../components/Marquee'
import { SectionHeader } from '../components/SectionHeader'
import { featuredEvent } from '../data/events'
import { inviteSectionId } from '../lib/inviteNavigation'

const mainWebsiteSectionId = 'main-website'

export function HomePage() {
  const [isMainWebsiteVisible, setIsMainWebsiteVisible] = useState(false)

  const enterMainWebsite = () => {
    setIsMainWebsiteVisible(true)

    window.setTimeout(() => {
      document.getElementById(mainWebsiteSectionId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 0)
  }

  return (
    <>
      <main className="bg-black text-white">
        <section className="min-h-screen border-b border-white/10 bg-black">
          <div className="section-shell flex min-h-screen flex-col justify-center">
            <div className="mb-8 text-center">
              <p className="mx-auto inline-flex bg-white px-3 py-2 text-xs font-semibold uppercase text-black">
                Invite only
              </p>
              <h1 className="mx-auto mt-4 max-w-6xl text-5xl font-extrabold uppercase leading-[0.92] md:text-7xl lg:text-8xl">
                Guest list access
              </h1>
              <p className="mx-auto mt-4 inline-flex border border-white/22 px-4 py-2 text-sm font-semibold uppercase text-white/72">
                Mzik Off The Record
              </p>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/58">
                Enter your guest details and party password to unlock your ticket immediately.
              </p>
            </div>
            <InviteAccessSection onContinue={enterMainWebsite} />
          </div>
        </section>
      </main>

      {isMainWebsiteVisible && (
        <div id={mainWebsiteSectionId}>
          <Marquee />
          <HeroSection />
          <InfiniteLookbookSection />

          <main>
            <section className="bg-black text-white">
              <div className="section-shell">
            <SectionHeader eyebrow="Featured event" title="Triunfo HouseParty">
              <span className="text-white/68">
                Mzik Off The Record: an invite-only night in Triunfo with private guest-list access and limited capacity.
              </span>
            </SectionHeader>
            <div className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
              <EventCard event={featuredEvent} featured inviteOnly />
              <div className="grid border border-white/18 bg-black p-5 text-white md:p-6 lg:p-7">
                <div>
                  <p className="text-xs font-semibold uppercase text-white/55">What is MzikTV?</p>
                  <h2 className="mt-4 text-4xl font-semibold uppercase leading-[0.9] md:text-6xl">
                    Fashion energy, live on camera.
                  </h2>
                </div>
                <div className="mt-6 grid gap-3">
                  {[
                    {
                      icon: <Clapperboard size={20} />,
                      title: 'Live sessions',
                      text: 'Filmed performances, interviews, and culture segments with a limited audience.',
                    },
                    {
                      icon: <Shirt size={20} />,
                      title: 'Drop moments',
                      text: 'Events connected to product releases, styling, and the Mzik streetwear community.',
                    },
                    {
                      icon: <Camera size={20} />,
                      title: 'Real visuals',
                      text: 'Lookbook-inspired event pages that feel editorial instead of generic ticket software.',
                    },
                  ].map((item) => (
                    <article className="border border-white/22 p-3.5" key={item.title}>
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <h3 className="text-sm font-semibold uppercase">{item.title}</h3>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/65">{item.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
            </section>

            <section className="section-shell overflow-hidden bg-black text-white">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold uppercase text-white/55">
                <Sparkles size={16} />
                Built for culture
              </p>
              <h2 className="mt-5 text-5xl font-semibold uppercase leading-[0.9] md:text-7xl">
                Not just entry. A moment.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-6 text-white/70">
                Each invite creates a branded digital ticket, guest confirmation, and QR code ready for future
                verification at the door.
              </p>
            </div>
            <a className="group grid grid-cols-3 gap-2" href={`#${inviteSectionId}`}>
              {['lookbook-06.jpg', 'lookbook-07.jpg', 'lookbook-09.jpg'].map((image, index) => (
                <img
                  alt=""
                  className="h-[360px] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  key={image}
                  src={`/mzik-assets/${image}`}
                  style={{ transform: `translateY(${index === 1 ? '-28px' : '0px'})` }}
                />
              ))}
            </a>
          </div>
            </section>
          </main>
        </div>
      )}
    </>
  )
}
