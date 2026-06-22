import type { GuestGender, Order } from '../types'

export type RegisteredGuest = {
  id: string
  fullName: string
  gender: GuestGender
  eventSlug: string
  ticketTypeId: string
  inviteLabel: string
  source: 'seed' | 'admin'
  createdAt: string
  checkedInAt: string | null
  passwordStatus: string
}

export type CheckinRecord = {
  id: string
  ticketId: string
  guestId: string
  eventId: string
  checkedInAt: string
}

export type CheckinResult = {
  ok: true
  guest: RegisteredGuest
  checkedInAt: string
}

export type AdminGuestInput = {
  fullName: string
  gender: GuestGender
  password: string
  ticketTypeId: string
}

export type InviteCredentialInput = {
  fullName: string
  gender: GuestGender
  password: string
}

export type BulkAdminGuestInput = {
  fullName: string
  gender: GuestGender
  password?: string
  ticketTypeId: string
}

export type BulkGuestCredential = {
  fullName: string
  gender: GuestGender
  ticketTypeId: string
  temporaryPassword: string
}

export type SkippedGuestImport = {
  fullName: string
  reason: string
}

export type BulkGuestImportResult = {
  guests: RegisteredGuest[]
  credentials: BulkGuestCredential[]
  skipped: SkippedGuestImport[]
}

export type AdminSession = {
  token: string
  expiresAt: string
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function normalizeGuestName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

export function generateGuestPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const cryptoApi = globalThis.crypto
  const values = new Uint32Array(8)

  if (cryptoApi?.getRandomValues) {
    cryptoApi.getRandomValues(values)
  } else {
    for (let index = 0; index < values.length; index += 1) {
      values[index] = Math.floor(Math.random() * alphabet.length)
    }
  }

  return Array.from(values, (value) => alphabet[value % alphabet.length]).join('')
}

export async function verifyGuestInvite(credentials: InviteCredentialInput) {
  try {
    const data = await apiRequest<{ order: Order }>('/api/invites/verify', {
      method: 'POST',
      body: credentials,
    })

    return {
      ok: true as const,
      order: data.order,
    }
  } catch (error) {
    return {
      ok: false as const,
      error: getErrorMessage(error),
    }
  }
}

export async function loginAdmin(password: string) {
  return apiRequest<AdminSession>('/api/admin/login', {
    method: 'POST',
    body: { password },
  })
}

export async function getGuestList(token: string) {
  const data = await apiRequest<{ guests: RegisteredGuest[] }>('/api/admin/guests', {
    token,
  })

  return data.guests
}

export async function getCheckinList(token: string) {
  const data = await apiRequest<{ checkins: CheckinRecord[] }>('/api/admin/checkins', {
    token,
  })

  return data.checkins
}

export async function checkInTicket(ticketToken: string, token: string) {
  return apiRequest<CheckinResult>('/api/checkins', {
    method: 'POST',
    token,
    body: { ticketToken },
  })
}

export async function saveAdminGuest(input: AdminGuestInput, token: string) {
  return apiRequest<{ guest: RegisteredGuest; temporaryPassword: string }>('/api/admin/guests', {
    method: 'POST',
    token,
    body: {
      ...input,
      fullName: input.fullName.trim().replace(/\s+/g, ' '),
      password: input.password.trim(),
    },
  })
}

export async function saveAdminGuests(guests: BulkAdminGuestInput[], token: string) {
  return apiRequest<BulkGuestImportResult>('/api/admin/guests/bulk', {
    method: 'POST',
    token,
    body: {
      guests: guests.map((guest) => ({
        ...guest,
        fullName: guest.fullName.trim().replace(/\s+/g, ' '),
        password: guest.password?.trim(),
      })),
    },
  })
}

export async function deleteAdminGuest(guestId: string, token: string) {
  await apiRequest<{ ok: true }>(`/api/admin/guests/${guestId}`, {
    method: 'DELETE',
    token,
  })
}

async function apiRequest<ResponseBody>(
  path: string,
  options: {
    body?: unknown
    method?: 'GET' | 'POST' | 'DELETE'
    token?: string
  } = {},
): Promise<ResponseBody> {
  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const text = await response.text()
  let data: { error?: string } = {}

  if (text) {
    try {
      data = JSON.parse(text) as { error?: string }
    } catch {
      if (!response.ok) {
        throw new ApiError(`The API returned an unexpected response with status ${response.status}.`, response.status)
      }

      throw new Error('The API returned an unexpected response.')
    }
  }

  if (!response.ok) {
    throw new ApiError(data.error || `Request failed with status ${response.status}.`, response.status)
  }

  return data as ResponseBody
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong.'
}
