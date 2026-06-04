import { CalendarDays, Download, MapPin, Ticket } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Order } from '../types'
import { formatMoney, getTicketCount } from '../lib/pricing'
import { formatEventDate } from '../lib/dates'
import { Button } from './Button'

const qrBlocks = Array.from({ length: 49 }, (_, index) => index)
const filledBlocks = new Set([0, 1, 2, 4, 6, 7, 10, 13, 14, 17, 18, 20, 22, 24, 27, 28, 30, 31, 33, 35, 38, 40, 41, 42, 44, 46, 47, 48])

export function TicketPreview({ order }: { order: Order }) {
  const date = formatEventDate(order.event.date, {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  })

  const downloadTicket = () => {
    const ticketText = [
      'MzikTV Tickets',
      `Order: ${order.id}`,
      `Event: ${order.event.title}`,
      `Buyer: ${order.buyer.fullName}`,
      `Quantity: ${getTicketCount(order.items)}`,
      `Total: ${formatMoney(order.total)}`,
      `Venue: ${order.event.venue}`,
      `Date: ${date} ${order.event.time}`,
    ].join('\n')
    const blob = new Blob([ticketText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${order.id}-ticket.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <article className="overflow-hidden border border-black bg-white">
      <div className="grid bg-black p-5 text-white md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase text-white/55">Digital ticket</p>
          <h2 className="mt-2 text-3xl font-semibold uppercase leading-none md:text-5xl">{order.event.title}</h2>
        </div>
        <img className="mt-5 h-14 w-14 invert md:mt-0" src="/mzik-assets/mzik-logo.png" alt="Mzik" />
      </div>

      <div className="grid gap-6 p-5 md:grid-cols-[1fr_190px] md:p-7">
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow icon={<CalendarDays size={18} />} label="Date and time" value={`${date} / ${order.event.time}`} />
            <InfoRow icon={<MapPin size={18} />} label="Venue" value={order.event.venue} />
            <InfoRow icon={<Ticket size={18} />} label="Tickets" value={`${getTicketCount(order.items)} ticket(s)`} />
            <InfoRow label="Order ID" value={order.id} />
          </div>

          <div className="border-t border-black pt-5">
            <p className="text-xs font-semibold uppercase text-black/55">Buyer</p>
            <p className="mt-1 text-xl font-semibold uppercase">{order.buyer.fullName}</p>
            <p className="mt-1 text-sm text-black/60">{order.buyer.email}</p>
          </div>

          <div className="grid gap-2">
            {order.items.map((item) => (
              <div className="flex justify-between border border-black px-3 py-2 text-sm" key={item.ticketType.id}>
                <span>{item.ticketType.name}</span>
                <span>
                  {item.quantity} / {formatMoney(item.ticketType.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid content-start gap-4">
          <div className="grid aspect-square grid-cols-7 gap-1 border border-black bg-white p-3">
            {qrBlocks.map((block) => (
              <span className={filledBlocks.has(block) ? 'bg-black' : 'bg-white'} key={block} />
            ))}
          </div>
          <p className="text-center text-xs uppercase text-black/50">QR placeholder</p>
          <Button className="w-full" onClick={downloadTicket} variant="outline">
            <Download size={16} />
            Download
          </Button>
        </div>
      </div>
    </article>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="border border-black p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase text-black/55">
        {icon}
        {label}
      </p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  )
}
