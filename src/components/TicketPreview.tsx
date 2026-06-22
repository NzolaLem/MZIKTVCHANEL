import { CalendarDays, Download, MapPin, Ticket } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { toDataURL } from 'qrcode'
import type { Order } from '../types'
import { formatMoney, getTicketCount } from '../lib/pricing'
import { formatEventDate } from '../lib/dates'
import { Button } from './Button'

const qrBlocks = Array.from({ length: 49 }, (_, index) => index)
const filledBlocks = new Set([0, 1, 2, 4, 6, 7, 10, 13, 14, 17, 18, 20, 22, 24, 27, 28, 30, 31, 33, 35, 38, 40, 41, 42, 44, 46, 47, 48])

export function TicketPreview({ order }: { order: Order }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const date = formatEventDate(order.event.date, {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  })
  const isInviteTicket = Boolean(order.guest)

  useEffect(() => {
    let isMounted = true
    const payload = order.qrPayload

    const updateQrCode = async () => {
      if (!payload) {
        if (isMounted) {
          setQrCodeUrl('')
        }
        return
      }

      try {
        const url = await createQrCodeUrl(payload)

        if (isMounted) {
          setQrCodeUrl(url)
        }
      } catch {
        if (isMounted) {
          setQrCodeUrl('')
        }
      }
    }

    void updateQrCode()

    return () => {
      isMounted = false
    }
  }, [order.qrPayload])

  const downloadTicket = async () => {
    const downloadQrCodeUrl = order.qrPayload ? qrCodeUrl || (await createQrCodeUrl(order.qrPayload)) : ''
    const ticketHtml = createTicketHtml({
      date,
      isInviteTicket,
      order,
      qrCodeUrl: downloadQrCodeUrl,
    })
    const blob = new Blob([ticketHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${createSafeFilename(order.event.title)}-${order.id}-ticket.html`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <article className="ticket-preview overflow-hidden border border-black bg-white">
      <div className="grid bg-black p-5 text-white md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase text-white/55">Digital ticket</p>
          <h2 className="mt-2 text-3xl font-semibold uppercase leading-none md:text-5xl">{order.event.title}</h2>
          <Button className="mt-4 w-full md:hidden" onClick={downloadTicket} variant="light">
            <Download size={16} />
            Save ticket
          </Button>
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
            <p className="text-xs font-semibold uppercase text-black/55">{isInviteTicket ? 'Guest' : 'Buyer'}</p>
            <p className="mt-2 text-2xl font-semibold uppercase text-black">{order.buyer.fullName || 'Guest'}</p>
            {order.buyer.email && <p className="mt-1 text-sm text-black/60">{order.buyer.email}</p>}
            {order.guest && <p className="mt-1 text-sm text-black/60">{formatGender(order.guest.gender)}</p>}
          </div>

          {order.guest && (
            <p className="border border-black bg-mzik-lavender/40 px-3 py-2 text-xs font-semibold uppercase leading-5 text-black">
              Non-transferable. QR is single-use and must match the guest name at entry.
            </p>
          )}

          <div className="grid gap-2">
            {order.items.map((item) => (
              <div className="flex justify-between border border-black px-3 py-2 text-sm" key={item.ticketType.id}>
                <span>{item.ticketType.name}</span>
                <span>{item.quantity} / {isInviteTicket ? 'Invite confirmed' : formatMoney(item.ticketType.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid content-start gap-4">
          {qrCodeUrl ? (
            <img
              alt={`QR code for ${order.event.title}`}
              className="ticket-preview-qr aspect-square border border-black bg-white p-3"
              src={qrCodeUrl}
            />
          ) : (
            <div className="ticket-preview-qr grid aspect-square grid-cols-7 gap-1 border border-black bg-white p-3">
              {qrBlocks.map((block) => (
                <span className={filledBlocks.has(block) ? 'bg-black' : 'bg-white'} key={block} />
              ))}
            </div>
          )}
          <p className="text-center text-xs uppercase text-black/50">{qrCodeUrl ? 'Scan at entry' : 'QR placeholder'}</p>
          <Button className="hidden w-full md:inline-flex" onClick={downloadTicket} variant="outline">
            <Download size={16} />
            Download my ticket
          </Button>
        </div>
      </div>
    </article>
  )
}

function createQrCodeUrl(payload: string) {
  return toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 420,
    color: {
      dark: '#000000ff',
      light: '#ffffffff',
    },
  })
}

function formatGender(gender: NonNullable<Order['guest']>['gender']) {
  const labels: Record<NonNullable<Order['guest']>['gender'], string> = {
    female: 'Female',
    male: 'Male',
  }

  return labels[gender]
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
  const displayValue = value.trim() || 'TBA'
  const isLongValue = displayValue.length > 34

  return (
    <div className="min-h-32 border border-black p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase text-black/55">
        {icon}
        {label}
      </p>
      <p className={`mt-3 break-words font-semibold leading-6 text-black ${isLongValue ? 'text-xs md:text-sm' : 'text-base md:text-lg'}`}>
        {displayValue}
      </p>
    </div>
  )
}

function createTicketHtml({
  date,
  isInviteTicket,
  order,
  qrCodeUrl,
}: {
  date: string
  isInviteTicket: boolean
  order: Order
  qrCodeUrl: string
}) {
  const guestLine = order.guest ? formatGender(order.guest.gender) : order.buyer.email
  const lineItems = order.items
    .map(
      (item) =>
        `<div class="line-item"><span>${escapeHtml(item.ticketType.name)}</span><span>${item.quantity} / ${
          isInviteTicket ? 'Invite confirmed' : escapeHtml(formatMoney(item.ticketType.price * item.quantity))
        }</span></div>`,
    )
    .join('')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(order.event.title)} Ticket</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #000; color: #000; font-family: Arial, Helvetica, sans-serif; }
      .ticket { max-width: 1100px; margin: 32px auto; border: 1px solid #000; background: #fff; }
      .header { display: flex; justify-content: space-between; gap: 24px; background: #000; color: #fff; padding: 28px; }
      .kicker, .label { color: rgba(0,0,0,.55); font-size: 12px; font-weight: 700; text-transform: uppercase; }
      .header .kicker { color: rgba(255,255,255,.62); }
      h1 { margin: 8px 0 0; font-size: 48px; line-height: .95; text-transform: uppercase; }
      .body { display: grid; grid-template-columns: 1fr 220px; gap: 28px; padding: 28px; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
      .box { border: 1px solid #000; min-height: 112px; padding: 18px; }
      .value { margin-top: 14px; font-size: 18px; font-weight: 700; overflow-wrap: anywhere; }
      .guest { border-top: 1px solid #000; margin-top: 24px; padding-top: 22px; }
      .guest-name { margin-top: 8px; font-size: 26px; font-weight: 700; text-transform: uppercase; }
      .muted { color: rgba(0,0,0,.62); margin-top: 6px; }
      .notice { border: 1px solid #000; background: #ece8ff; margin-top: 18px; padding: 10px 12px; font-size: 12px; font-weight: 700; line-height: 1.45; text-transform: uppercase; }
      .line-items { display: grid; gap: 8px; margin-top: 20px; }
      .line-item { display: flex; justify-content: space-between; gap: 16px; border: 1px solid #000; padding: 10px 12px; }
      .qr { width: 100%; border: 1px solid #000; padding: 12px; }
      .qr-label { color: rgba(0,0,0,.52); font-size: 12px; margin-top: 12px; text-align: center; text-transform: uppercase; }
      @media print { body { background: #fff; } .ticket { margin: 0; max-width: none; } }
      @media (max-width: 760px) { .body, .grid { grid-template-columns: 1fr; } h1 { font-size: 36px; } }
    </style>
  </head>
  <body>
    <article class="ticket">
      <header class="header">
        <div>
          <p class="kicker">Digital ticket</p>
          <h1>${escapeHtml(order.event.title)}</h1>
        </div>
        <strong>Mzik</strong>
      </header>
      <section class="body">
        <div>
          <div class="grid">
            <div class="box"><p class="label">Date and time</p><p class="value">${escapeHtml(date)} / ${escapeHtml(order.event.time)}</p></div>
            <div class="box"><p class="label">Venue</p><p class="value">${escapeHtml(order.event.venue)}</p></div>
            <div class="box"><p class="label">Tickets</p><p class="value">${getTicketCount(order.items)} ticket(s)</p></div>
            <div class="box"><p class="label">Order ID</p><p class="value">${escapeHtml(order.id)}</p></div>
          </div>
          <div class="guest">
            <p class="label">${isInviteTicket ? 'Guest' : 'Buyer'}</p>
            <p class="guest-name">${escapeHtml(order.buyer.fullName || 'Guest')}</p>
            <p class="muted">${escapeHtml(guestLine || '')}</p>
          </div>
          ${order.guest ? '<p class="notice">Non-transferable. QR is single-use and must match the guest name at entry.</p>' : ''}
          <div class="line-items">${lineItems}</div>
        </div>
        <aside>
          ${qrCodeUrl ? `<img class="qr" src="${qrCodeUrl}" alt="Ticket QR code" />` : ''}
          <p class="qr-label">Scan at entry</p>
        </aside>
      </section>
    </article>
  </body>
</html>`
}

function createSafeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'mzik'
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
