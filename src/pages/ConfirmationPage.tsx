import { CheckCircle2, Home } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Marquee } from '../components/Marquee'
import { TicketPreview } from '../components/TicketPreview'
import { useOrder } from '../context/useOrder'
import { formatMoney, getTicketCount } from '../lib/pricing'

export function ConfirmationPage() {
  const { orderId } = useParams()
  const { confirmedOrder } = useOrder()
  const order = confirmedOrder?.id === orderId ? confirmedOrder : null

  if (!order) {
    return (
      <main className="section-shell bg-white">
        <div className="mx-auto max-w-xl border border-black p-8 text-center">
          <h1 className="text-4xl font-semibold uppercase">Ticket not found</h1>
          <p className="mt-3 text-sm text-black/60">
            This MVP keeps confirmation data in the browser session. Return home and unlock your ticket again.
          </p>
          <Button className="mt-6" to="/" variant="dark">
            Return home
          </Button>
        </div>
      </main>
    )
  }

  return (
    <>
      <Marquee />
      <main className="bg-black text-white">
        <section className="section-shell">
          <div className="mx-auto max-w-5xl text-center">
            <CheckCircle2 className="confirmation-check mx-auto" size={54} />
            <p className="confirmation-kicker mt-5 text-sm font-semibold uppercase text-white/55">
              Purchase confirmed
            </p>
            <h1 className="confirmation-title mt-3 text-5xl font-semibold uppercase leading-[0.9] md:text-8xl">
              You are on the list
            </h1>
            <p className="confirmation-copy mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/68">
              {order.buyer.fullName}, your {getTicketCount(order.items)} ticket(s) for {order.event.title} are confirmed.
              Total paid: {formatMoney(order.total)}.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-5xl">
            <TicketPreview order={order} />
          </div>

          <div className="mt-8 flex justify-center">
            <Button to="/" variant="light">
              <Home size={16} />
              Return home
            </Button>
          </div>
        </section>
      </main>
    </>
  )
}
