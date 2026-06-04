import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EventGrid } from '../components/EventGrid'
import { Marquee } from '../components/Marquee'
import { SectionHeader } from '../components/SectionHeader'
import { TicketSelector } from '../components/TicketSelector'
import { cn } from '../lib/cn'
import { events } from '../data/events'

export function EventsPage() {
  const [query, setQuery] = useState('')
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? '')

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return events
    }

    return events.filter((event) =>
      [event.title, event.location, event.venue, event.kicker].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    )
  }, [query])

  const selectedEvent = filteredEvents.find((event) => event.id === selectedEventId) ?? filteredEvents[0]

  return (
    <>
      <Marquee />
      <main>
        <section className="section-shell bg-mzik-stone">
          <SectionHeader eyebrow="Events" title="Choose your MzikTV night">
            Browse upcoming MzikTV events, check availability, and move into ticket selection in one flow.
          </SectionHeader>

          <label className="mb-8 flex max-w-xl items-center gap-3 border border-black bg-white px-4 py-3">
            <Search size={18} />
            <span className="sr-only">Search events</span>
            <input
              className="h-8 flex-1 bg-transparent text-base outline-none placeholder:text-black/35"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search events, venues, locations"
              value={query}
            />
          </label>

          {filteredEvents.length > 0 ? (
            <EventGrid events={filteredEvents} />
          ) : (
            <div className="border border-black bg-white p-8 text-center">
              <p className="font-semibold uppercase">No events found</p>
              <p className="mt-2 text-sm text-black/60">Try another search term.</p>
            </div>
          )}
        </section>

        {selectedEvent && (
          <section className="bg-black text-white">
            <div className="section-shell">
              <div className="mb-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                <div>
                  <p className="inline-flex bg-white px-3 py-2 text-xs font-semibold uppercase text-black">
                    Instant checkout
                  </p>
                  <h2 className="mt-4 text-4xl font-extrabold uppercase leading-[0.98] md:text-6xl">Ticket prices</h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/58">
                    Select an event, choose your access, review the order summary, and continue to checkout.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {filteredEvents.map((event) => {
                    const isSelected = event.id === selectedEvent.id

                    return (
                      <button
                        className={cn(
                          'border px-3 py-2 text-xs font-semibold uppercase transition',
                          isSelected
                            ? 'border-white bg-white text-black'
                            : 'border-white/24 text-white/62 hover:border-white hover:text-white',
                        )}
                        key={event.id}
                        onClick={() => setSelectedEventId(event.id)}
                        type="button"
                      >
                        {event.title}
                      </button>
                    )
                  })}
                </div>
              </div>

              <TicketSelector compact event={selectedEvent} />
            </div>
          </section>
        )}
      </main>
    </>
  )
}
