import { ArrowRight, Camera, Clapperboard, Shirt, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EventCard } from '../components/EventCard'
import { EventGrid } from '../components/EventGrid'
import { HeroSection } from '../components/HeroSection'
import { InfiniteLookbookSection } from '../components/InfiniteLookbookSection'
import { Marquee } from '../components/Marquee'
import { SectionHeader } from '../components/SectionHeader'
import { TicketSelector } from '../components/TicketSelector'
import { events, featuredEvent } from '../data/events'
import { Button } from '../components/Button'

export function HomePage() {
  return (
    <>
      <Marquee />
      <HeroSection />
      <InfiniteLookbookSection />

      <main>
        <section className="bg-black text-white">
          <div className="section-shell">
            <SectionHeader eyebrow="Featured event" title="The next MzikTV drop">
              <span className="text-white/68">
                MzikTV takes the clothing brand into real rooms: performances, pop-ups, screenings, and culture-first
                nights with limited capacity.
              </span>
            </SectionHeader>
            <div className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
              <EventCard event={featuredEvent} featured />
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

            <div className="mt-8 py-8 text-white md:mt-10 md:py-10">
              <div className="mb-8 text-center">
                <p className="mx-auto inline-flex bg-white px-3 py-2 text-xs font-semibold uppercase text-black">
                  Tickets
                </p>
                <h2 className="mx-auto mt-4 max-w-5xl text-4xl font-extrabold uppercase leading-[0.98] md:text-6xl">
                  Ticket prices
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/58">
                  Secure your spot for the next MzikTV drop. Choose your access and continue straight to checkout.
                </p>
              </div>
              <TicketSelector compact event={featuredEvent} mobileDense />
            </div>
          </div>
        </section>

        <section className="section-shell bg-mzik-stone">
          <SectionHeader eyebrow="Browse tickets" title="Upcoming events">
            Mock event data today, clean structure for real backend data tomorrow.
          </SectionHeader>
          <EventGrid events={events.slice(1, 4)} />
          <div className="mt-8 flex justify-center">
            <Button to="/events" variant="outline">
              View all events
              <ArrowRight size={16} />
            </Button>
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
                Each purchase creates a branded digital confirmation, ticket preview, and mock order ID ready for
                future QR verification.
              </p>
            </div>
            <Link className="group grid grid-cols-3 gap-2" to="/events">
              {['lookbook-06.jpg', 'lookbook-07.jpg', 'lookbook-09.jpg'].map((image, index) => (
                <img
                  alt=""
                  className="h-[360px] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  key={image}
                  src={`/mzik-assets/${image}`}
                  style={{ transform: `translateY(${index === 1 ? '-28px' : '0px'})` }}
                />
              ))}
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
