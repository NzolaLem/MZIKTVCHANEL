import type { MzikEvent, TicketLineItem, TicketQuantityMap } from '../types'

export const currencyFormatter = new Intl.NumberFormat('en-MZ', {
  style: 'currency',
  currency: 'MZN',
  maximumFractionDigits: 0,
})

export function formatMoney(value: number) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0).replace('MZN', 'MT')
}

export function getStartingPrice(event: MzikEvent) {
  if (event.ticketTypes.length === 0) {
    return 0
  }

  return Math.min(...event.ticketTypes.map((ticketType) => ticketType.price))
}

export function getTotalAvailability(event: MzikEvent) {
  return event.ticketTypes.reduce((total, ticketType) => total + Math.max(0, ticketType.available), 0)
}

export function quantitiesToLineItems(event: MzikEvent, quantities: TicketQuantityMap): TicketLineItem[] {
  return event.ticketTypes
    .map((ticketType) => {
      const maxAvailable = Math.max(0, ticketType.available)
      const requestedQuantity = quantities[ticketType.id] ?? 0

      return {
        ticketType,
        quantity: Math.min(maxAvailable, Math.max(0, requestedQuantity)),
      }
    })
    .filter((item) => item.quantity > 0)
}

export function getSubtotal(items: TicketLineItem[]) {
  return items.reduce((total, item) => total + item.ticketType.price * item.quantity, 0)
}

export function getServiceFee(subtotal: number) {
  if (subtotal <= 0) {
    return 0
  }

  return Math.round(subtotal * 0.06)
}

export function getOrderTotal(subtotal: number) {
  return subtotal + getServiceFee(subtotal)
}

export function getTicketCount(items: TicketLineItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export function generateOrderId() {
  const cryptoApi = globalThis.crypto

  if (cryptoApi?.randomUUID) {
    return `MZIK-2026-${cryptoApi.randomUUID().toUpperCase()}`
  }

  if (cryptoApi?.getRandomValues) {
    const values = new Uint32Array(4)
    cryptoApi.getRandomValues(values)
    return `MZIK-2026-${Array.from(values, (value) => value.toString(16).padStart(8, '0')).join('').toUpperCase()}`
  }

  return `MZIK-2026-${Date.now().toString(36).toUpperCase()}`
}
