import type { TicketLineItem } from '../types'
import { formatMoney, getServiceFee, getSubtotal, getTicketCount } from '../lib/pricing'

export function OrderSummary({
  eventTitle,
  items,
  paymentMethodLabel,
}: {
  eventTitle: string
  items: TicketLineItem[]
  paymentMethodLabel?: string
}) {
  const subtotal = getSubtotal(items)
  const serviceFee = getServiceFee(subtotal)
  const total = subtotal + serviceFee

  return (
    <aside className="border border-black bg-white p-5">
      <p className="text-xs font-semibold uppercase text-black/55">Order summary</p>
      <h2 className="mt-2 text-2xl font-semibold uppercase leading-none">{eventTitle}</h2>

      <div className="mt-6 grid gap-4">
        {items.length === 0 ? (
          <p className="text-sm text-black/60">No tickets selected yet.</p>
        ) : (
          items.map((item) => (
            <div className="flex items-start justify-between gap-4 border-b border-black/20 pb-3" key={item.ticketType.id}>
              <div>
                <p className="font-semibold uppercase">{item.ticketType.name}</p>
                <p className="text-sm text-black/55">
                  {item.quantity} x {formatMoney(item.ticketType.price)}
                </p>
              </div>
              <p className="font-semibold">{formatMoney(item.ticketType.price * item.quantity)}</p>
            </div>
          ))
        )}
      </div>

      <dl className="mt-5 grid gap-3 text-sm">
        <div className="flex justify-between">
          <dt>Tickets</dt>
          <dd>{getTicketCount(items)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatMoney(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Service fee</dt>
          <dd>{formatMoney(serviceFee)}</dd>
        </div>
        {paymentMethodLabel && (
          <div className="flex justify-between">
            <dt>Payment</dt>
            <dd>{paymentMethodLabel}</dd>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t border-black pt-4 text-xl font-semibold">
          <dt>Total</dt>
          <dd>{formatMoney(total)}</dd>
        </div>
      </dl>
    </aside>
  )
}
