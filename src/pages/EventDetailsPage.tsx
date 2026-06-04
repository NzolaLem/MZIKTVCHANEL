import { ArrowRight, CalendarDays, Clock, MapPin, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { EventGrid } from '../components/EventGrid'
import { Marquee } from '../components/Marquee'
import { SectionHeader } from '../components/SectionHeader'
import { TicketSelector } from '../components/TicketSelector'
import { getEventBySlug, getRelatedEvents } from '../data/events'
import { formatEventDate } from '../lib/dates'

export function EventDetailsPage() {
  const { slug } = useParams()
  const event = getEventBySlug(slug)

  if (!event) {
    return (
      <main className="section-shell bg-white">
        <div className="border border-black p-8 text-center">
          <h1 className="text-4xl font-semibold uppercase">Event not found</h1>
          <Button className="mt-5" to="/events" variant="dark">
            Back to events
          </Button>
        </div>
      </main>
    )
  }

  const date = formatEventDate(event.date, {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  })
  const relatedEvents = getRelatedEvents(event.id)

  return (
    <>
      <Marquee />
      <main>
        <section className="border-b border-black bg-white">
          <div className="mx-auto grid max-w-[1600px] gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[560px] overflow-hidden bg-black">
              <img alt={event.title} className="h-full min-h-[560px] w-full object-cover opacity-90" src={event.image} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-5 text-white md:p-8">
                <Badge tone="light">{event.kicker}</Badge>
                <h1 className="mt-4 text-5xl font-semibold uppercase leading-[0.88] md:text-8xl">{event.title}</h1>
              </div>
            </div>
            <div className="grid content-between gap-8 p-5 md:p-8 lg:p-10">
              <div>
                <p className="text-sm font-semibold uppercase text-black/55">Event details</p>
                <p className="mt-5 text-lg leading-8 text-black/70">{event.description}</p>
              </div>

              <div className="grid gap-3">
                <Info icon={<CalendarDays size={18} />} label="Date" value={date} />
                <Info icon={<Clock size={18} />} label="Time" value={event.time} />
                <Info icon={<MapPin size={18} />} label="Location" value={`${event.venue}, ${event.location}`} />
              </div>

              <Button to={`/events/${event.slug}/tickets`} variant="dark">
                Buy ticket
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-black text-white">
          <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:py-12 lg:px-10">
            <div className="mb-8 text-center">
              <Badge tone="light">Tickets</Badge>
              <h2 className="mx-auto mt-4 max-w-5xl text-4xl font-extrabold uppercase leading-[0.98] md:text-6xl">
                Ticket prices
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/58">
                Choose General Admission, VIP, or Premium access. The same selector powers checkout on the dedicated
                ticket page.
              </p>
            </div>
            <TicketSelector compact event={event} />
          </div>
        </section>

        <section className="section-shell bg-white">
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="border border-black bg-black p-6 text-white">
              <p className="text-sm font-semibold uppercase text-white/55">Organizer</p>
              <h2 className="mt-4 text-5xl font-semibold uppercase leading-none">MzikTV</h2>
              <p className="mt-5 text-sm leading-6 text-white/70">
                MzikTV is the entertainment layer of the wider Mzik brand, built around fashion, culture, music, and
                filmed live experiences.
              </p>
            </div>
            <div className="grid gap-3">
              <h2 className="text-sm font-semibold uppercase">Important information</h2>
              {event.importantInfo.map((item, index) => (
                <div className="flex gap-3 border border-black p-4" key={`${index}-${item}`}>
                  <ShieldCheck className="mt-0.5 shrink-0" size={18} />
                  <p className="text-sm leading-6 text-black/70">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell bg-mzik-stone">
          <SectionHeader eyebrow="Related" title="More MzikTV events" />
          <EventGrid events={relatedEvents} />
        </section>
      </main>
    </>
  )
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border border-black p-4">
      {icon}
      <div>
        <p className="text-xs font-semibold uppercase text-black/55">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  )
}
