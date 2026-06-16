import type { MzikEvent } from '../types'
import { EventCard } from './EventCard'

export function EventGrid({ events, inviteOnly = false }: { events: MzikEvent[]; inviteOnly?: boolean }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <EventCard event={event} inviteOnly={inviteOnly} key={event.id} />
      ))}
    </div>
  )
}
