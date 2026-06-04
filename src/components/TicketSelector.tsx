import { ArrowRight, Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MzikEvent, TicketQuantityMap } from '../types'
import { formatMoney, getTotalAvailability, quantitiesToLineItems } from '../lib/pricing'
import { formatTicketStubDate } from '../lib/dates'
import { useOrder } from '../context/useOrder'
import { Button } from './Button'
import { QuantitySelector } from './QuantitySelector'
import { cn } from '../lib/cn'

export function TicketSelector({
  event,
  compact = false,
  mobileDense = false,
}: {
  event: MzikEvent
  compact?: boolean
  mobileDense?: boolean
}) {
  const navigate = useNavigate()
  const { setDraftOrder } = useOrder()
  const [quantities, setQuantities] = useState<TicketQuantityMap>({})
  const [error, setError] = useState('')

  const items = useMemo(() => quantitiesToLineItems(event, quantities), [event, quantities])
  const isEventSoldOut = event.status === 'sold-out' || getTotalAvailability(event) <= 0
  const ticketStubDate = formatTicketStubDate(event.date)

  const updateQuantity = (ticketTypeId: string, quantity: number) => {
    setError('')
    setQuantities((current) => ({
      ...current,
      [ticketTypeId]: quantity,
    }))
  }

  const continueToCheckout = () => {
    if (isEventSoldOut) {
      setError('This event is sold out.')
      return
    }

    if (items.length === 0) {
      setError('Select at least one ticket to continue.')
      return
    }

    setDraftOrder({ event, items })
    navigate('/checkout')
  }

  return (
    <div className="grid gap-5">
      <div className={cn('grid items-stretch md:grid-cols-2 xl:grid-cols-3', mobileDense ? 'gap-3 sm:gap-4' : 'gap-4')}>
        {event.ticketTypes.map((ticketType) => (
          <TicketPass
            eventLocation={event.location}
            isEventSoldOut={isEventSoldOut}
            isMobileDense={mobileDense}
            key={ticketType.id}
            onAdd={() =>
              updateQuantity(ticketType.id, Math.min(ticketType.available, (quantities[ticketType.id] ?? 0) + 1))
            }
            onCheckout={continueToCheckout}
            onQuantityChange={(quantity) => updateQuantity(ticketType.id, quantity)}
            quantity={quantities[ticketType.id] ?? 0}
            stubDate={ticketStubDate}
            ticketType={ticketType}
          />
        ))}
      </div>

      {error && (
        <p className="border border-mzik-red bg-mzik-red px-4 py-3 text-center text-sm font-semibold text-white">
          {error}
        </p>
      )}

      <div className="hidden justify-center pt-2 text-center md:flex">
        <Button
          className={cn('min-w-56', compact && 'rounded-full')}
          disabled={isEventSoldOut}
          onClick={continueToCheckout}
          variant="light"
        >
          Continue to checkout
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}

function TicketPass({
  ticketType,
  quantity,
  eventLocation,
  stubDate,
  isEventSoldOut,
  isMobileDense,
  onQuantityChange,
  onAdd,
  onCheckout,
}: {
  ticketType: MzikEvent['ticketTypes'][number]
  quantity: number
  eventLocation: string
  stubDate: string
  isEventSoldOut: boolean
  isMobileDense: boolean
  onQuantityChange: (quantity: number) => void
  onAdd: () => void
  onCheckout: () => void
}) {
  const isTicketSoldOut = isEventSoldOut || ticketType.available <= 0

  return (
    <article className={cn('ticket-pass flex h-full flex-col', isMobileDense && 'ticket-pass-mobile-dense')}>
      <div className="ticket-pass-shine" />
      <div className="ticket-pass-top" />
      <div
        className={cn(
          'relative z-10',
          isMobileDense ? 'min-h-[168px] p-3 sm:min-h-[220px] sm:p-4' : 'min-h-[220px] p-4',
        )}
      >
        <p className="ticket-pass-name">{ticketType.name.replace(' / ', ' ')}</p>
        <p
          className={cn(
            'mt-4 font-black leading-none text-white md:text-4xl',
            isMobileDense ? 'text-2xl sm:text-3xl' : 'text-3xl',
          )}
        >
          {formatMoney(ticketType.price)}
        </p>
        <p className="mt-3 min-h-8 text-xs leading-5 text-white/58">{ticketType.description}</p>
        <div className="mt-3 h-7">
          {isTicketSoldOut ? (
            <p className="inline-flex border border-mzik-red px-2.5 py-1 text-[0.68rem] font-semibold uppercase text-mzik-red">
              Sold out
            </p>
          ) : (
            ticketType.available <= 10 && (
              <p className="inline-flex border border-mzik-tan px-2.5 py-1 text-[0.68rem] font-semibold uppercase text-mzik-tan">
                Only {ticketType.available} left
              </p>
            )
          )}
        </div>
      </div>

      <div className="ticket-pass-cut" />

      <div
        className={cn(
          'relative z-10 border-y border-dashed border-white/14',
          isMobileDense ? 'px-3 py-2.5 sm:px-4 sm:py-3' : 'px-4 py-3',
        )}
      >
        <p className="text-sm font-black text-white">Includes:</p>
        <ul className="mt-3 grid gap-2">
          {ticketType.includes.map((item, index) => (
            <li className="flex items-center gap-2 text-xs font-semibold text-white/58" key={`${index}-${item}`}>
              <Check className="text-white/80" size={14} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className={cn('relative z-10 mt-auto grid gap-3', isMobileDense ? 'p-3 sm:p-4' : 'p-4')}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-white/35">Quantity</p>
            <p className="mt-1 text-sm text-white/50">{Math.max(0, ticketType.available)} available</p>
          </div>
          <QuantitySelector
            tone="dark"
            max={Math.max(0, ticketType.available)}
            value={quantity}
            onChange={onQuantityChange}
          />
        </div>
        <button
          className={cn(
            'bg-white px-5 py-2 font-black uppercase text-black transition hover:bg-mzik-lavender disabled:cursor-not-allowed disabled:opacity-35',
            isMobileDense ? 'min-h-9 text-xs sm:min-h-10 sm:text-sm' : 'min-h-10 text-sm',
          )}
          disabled={isTicketSoldOut}
          onClick={onAdd}
          type="button"
        >
          {isTicketSoldOut ? 'Sold out' : 'Add ticket'}
        </button>
        <Button
          className="min-h-9 w-full text-xs md:hidden"
          disabled={isEventSoldOut}
          onClick={onCheckout}
          variant="light"
        >
          Go to checkout
          <ArrowRight size={16} />
        </Button>
      </div>

      <div className="ticket-pass-cut ticket-pass-cut-bottom" />

      <div className={cn('relative z-10', isMobileDense ? 'px-3 pb-3 sm:px-4 sm:pb-4' : 'px-4 pb-4')}>
        <div className="ticket-barcode" aria-hidden />
        <div className="mt-3 flex items-center justify-between text-xs font-black uppercase text-white/28">
          <span>{eventLocation}</span>
          <span>{stubDate}</span>
        </div>
      </div>
    </article>
  )
}
