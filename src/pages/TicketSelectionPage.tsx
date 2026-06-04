import { useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Marquee } from '../components/Marquee'
import { TicketSelector } from '../components/TicketSelector'
import { getEventBySlug } from '../data/events'

export function TicketSelectionPage() {
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

  return (
    <>
      <Marquee />
      <main className="bg-black text-white">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:py-12 lg:px-10">
          <div className="mb-8 text-center">
            <Badge tone="light">Ticket selection</Badge>
            <h1 className="mx-auto mt-4 max-w-5xl text-4xl font-extrabold uppercase leading-[0.98] md:text-6xl">
              Ticket prices
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/58">
              Select your access for {event.title}, choose quantity, review fees, and continue to checkout.
            </p>
          </div>
          <TicketSelector event={event} />
        </div>
      </main>
    </>
  )
}
