export type TicketType = {
  id: string
  name: string
  price: number
  description: string
  includes: string[]
  available: number
}

export type EventStatus = 'available' | 'low-stock' | 'sold-out'

export type MzikEvent = {
  id: string
  slug: string
  title: string
  kicker: string
  date: string
  time: string
  location: string
  venue: string
  image: string
  accent: string
  status: EventStatus
  description: string
  importantInfo: string[]
  ticketTypes: TicketType[]
}

export type TicketQuantityMap = Record<string, number>

export type BuyerDetails = {
  fullName: string
  email: string
  phone: string
  instagram?: string
}

export type GuestGender = 'female' | 'male'

export type TicketLineItem = {
  ticketType: TicketType
  quantity: number
}

export type Order = {
  id: string
  event: MzikEvent
  items: TicketLineItem[]
  buyer: BuyerDetails
  guest?: {
    gender: GuestGender
    inviteLabel: string
  }
  subtotal: number
  serviceFee: number
  total: number
  qrPayload?: string
  createdAt: string
}
