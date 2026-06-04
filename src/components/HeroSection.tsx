import { ArrowRight, CalendarDays, MapPin, Ticket } from 'lucide-react'
import { Button } from './Button'
import { Badge } from './Badge'
import { featuredEvent } from '../data/events'
import { formatMoney, getStartingPrice } from '../lib/pricing'

export function HeroSection() {
  return (
    <section
      className="relative min-h-[calc(100svh-44px)] overflow-hidden border-b border-black bg-black text-white"
      data-home-hero
    >
      <img
        alt="Mzik lookbook streetwear moment beside a red sports car"
        className="absolute inset-0 h-full w-full object-cover object-[58%_center] opacity-85"
        src="/mzik-assets/lookbook-09.jpg"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.68)_36%,rgba(0,0,0,0.22)_72%,rgba(0,0,0,0.72)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.52)_0%,rgba(0,0,0,0.08)_36%,rgba(0,0,0,0.84)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-44px)] max-w-[1600px] flex-col justify-between px-4 py-7 sm:px-6 md:py-9 lg:px-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-4xl font-light uppercase text-white md:text-5xl">MzikTV</p>
            <p className="mt-2 text-xs font-semibold uppercase text-white/68">Tickets / first drop</p>
          </div>
          <div className="hidden md:block">
            <Button className="rounded-full px-4 py-3 text-base normal-case sm:px-7" to="/events" variant="light">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                <Ticket size={22} />
              </span>
              Buy tickets
            </Button>
          </div>
        </div>

        <div className="grid gap-6 py-16 md:grid-cols-[0.78fr_1.22fr] md:items-end md:py-12">
          <div className="max-w-sm">
            <Badge tone="light">{featuredEvent.kicker}</Badge>
            <p className="mt-5 text-base leading-7 text-white/78">{featuredEvent.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to={`/events/${featuredEvent.slug}/tickets`} variant="light">
                Get tickets
                <ArrowRight size={16} />
              </Button>
              <Button to={`/events/${featuredEvent.slug}`} variant="outline">
                View details
              </Button>
            </div>
          </div>

          <div className="md:text-right">
            <h1 className="hero-display text-white">
              Live
              <span className="block text-white/72">Sessions</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm font-semibold uppercase text-white/62 md:ml-auto">
              MzikTV live in Maputo / From {formatMoney(getStartingPrice(featuredEvent))}
            </p>
          </div>
        </div>

        <div className="grid gap-5 border-t border-white/35 pt-6 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <div>
            <p className="hero-meta">18/07</p>
            <p className="mt-2 flex items-center gap-2 text-sm uppercase text-white/62">
              <CalendarDays size={16} />
              19:00
            </p>
          </div>
          <div className="text-left md:text-center">
            <p className="hero-meta">2026</p>
            <p className="mt-2 text-sm uppercase text-white/62">Limited seats available</p>
          </div>
          <div className="md:text-right">
            <p className="hero-meta">Maputo</p>
            <p className="mt-2 flex items-center gap-2 text-sm uppercase text-white/62 md:justify-end">
              <MapPin size={16} />
              {featuredEvent.venue}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
