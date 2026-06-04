import { useMemo, useState, type ReactNode } from 'react'
import type { Order } from '../types'
import { generateOrderId, getOrderTotal, getServiceFee, getSubtotal } from '../lib/pricing'
import { OrderContext, type DraftOrder, type OrderContextValue } from './ticketOrderContext'

export function OrderProvider({ children }: { children: ReactNode }) {
  const [draftOrder, setDraftOrderState] = useState<DraftOrder | null>(null)
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)

  const value = useMemo<OrderContextValue>(
    () => ({
      draftOrder,
      confirmedOrder,
      setDraftOrder: (nextDraftOrder) => {
        setDraftOrderState(nextDraftOrder)
      },
      clearDraftOrder: () => {
        setDraftOrderState(null)
      },
      confirmOrder: (buyer, paymentMethod) => {
        if (!draftOrder) {
          return null
        }

        const subtotal = getSubtotal(draftOrder.items)
        const serviceFee = getServiceFee(subtotal)
        const total = getOrderTotal(subtotal)
        const order: Order = {
          id: generateOrderId(),
          event: draftOrder.event,
          items: draftOrder.items,
          buyer,
          paymentMethod,
          subtotal,
          serviceFee,
          total,
          createdAt: new Date().toISOString(),
        }

        setConfirmedOrder(order)
        setDraftOrderState(null)
        return order
      },
    }),
    [draftOrder, confirmedOrder],
  )

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}
