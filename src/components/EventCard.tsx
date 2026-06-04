import { ArrowRight, CalendarDays, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { MzikEvent } from '../types'
import { Badge } from './Badge'
import { formatMoney, getStartingPrice, getTotalAvailability } from '../lib/pricing'
import { cn } from '../lib/cn'
import { formatEventDate } from '../lib/dates'

const statusLabel = {
  available: 'Available',
  'low-stock': 'Low stock',
  'sold-out': 'Sold out',
}

const statusTone = {
  available: 'light',
  'low-stock': 'tan',
  'sold-out': 'danger',
} as const

export function EventCard({ event, featured = false }: { event: MzikEvent; featured?: boolean }) {
  const date = formatEventDate(event.date, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })

  return (
    <article
      className={cn(
        'group grid border transition duration-300 hover:-translate-y-1',
        featured
          ? 'border-white/18 bg-black text-white hover:shadow-[8px_8px_0_#b7ade3]'
          : 'border-black bg-white hover:shadow-[8px_8px_0_#000]',
      )}
    >
      <Link className="block overflow-hidden" to={`/events/${event.slug}`}>
        <img
          alt={event.title}
          className={
            featured
              ? 'h-[360px] w-full object-cover transition duration-500 group-hover:scale-105 md:h-[430px]'
              : 'h-80 w-full object-cover transition duration-500 group-hover:scale-105'
          }
          src={event.image}
        />
      </Link>
      <div className={cn('grid', featured ? 'gap-4 p-4 md:p-5' : 'gap-5 p-5')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone={statusTone[event.status]}>{statusLabel[event.status]}</Badge>
          <span className={cn('text-xs font-semibold uppercase', featured ? 'text-white/55' : 'text-black/55')}>
            {event.kicker}
          </span>
        </div>
        <div>
          <h3 className={cn('font-semibold uppercase leading-none', featured ? 'text-2xl' : 'text-2xl md:text-3xl')}>
            {event.title}
          </h3>
          <p className={cn('mt-3 text-sm leading-6', featured ? 'text-white/62' : 'text-black/65')}>{event.description}</p>
        </div>
        <div
          className={cn(
            'grid gap-2 border-y py-4 text-sm',
            featured ? 'border-white/18 text-white/72' : 'border-black text-black/75',
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarDays size={17} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={17} />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={17} />
            <span>{event.location}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={cn('text-xs uppercase', featured ? 'text-white/45' : 'text-black/55')}>Starting at</p>
            <p className="text-xl font-semibold">{formatMoney(getStartingPrice(event))}</p>
          </div>
          <div className="text-right">
            <p className={cn('text-xs uppercase', featured ? 'text-white/45' : 'text-black/55')}>Left</p>
            <p className="text-xl font-semibold">{getTotalAvailability(event)}</p>
          </div>
        </div>
        <Link
          className={cn(
            'inline-flex items-center justify-between border px-4 py-3 text-sm font-semibold uppercase transition',
            featured
              ? 'border-white bg-white text-black hover:bg-mzik-lavender'
              : 'border-black bg-black text-white hover:bg-white hover:text-black',
          )}
          to={`/events/${event.slug}`}
        >
          View details
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  )
}
