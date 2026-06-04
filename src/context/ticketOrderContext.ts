import { createContext } from 'react'
import type { BuyerDetails, MzikEvent, Order, PaymentMethod, TicketLineItem } from '../types'

export type DraftOrder = {
  event: MzikEvent
  items: TicketLineItem[]
}

export type OrderContextValue = {
  draftOrder: DraftOrder | null
  confirmedOrder: Order | null
  setDraftOrder: (draftOrder: DraftOrder) => void
  clearDraftOrder: () => void
  confirmOrder: (buyer: BuyerDetails, paymentMethod: PaymentMethod) => Order | null
}

export const OrderContext = createContext<OrderContextValue | undefined>(undefined)
