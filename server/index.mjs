import { createServer } from 'node:http'
import { existsSync, createReadStream } from 'node:fs'
import { createHash, createHmac, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { createClient } from '@supabase/supabase-js'

const scrypt = promisify(scryptCallback)
const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))
const distDirectory = join(rootDirectory, 'dist')
const port = Number(process.env.API_PORT ?? process.env.PORT ?? 8787)
const tokenSecret = process.env.TOKEN_SECRET ?? 'dev-mzik-ticket-secret-change-before-production'
const adminPassword = process.env.ADMIN_PASSWORD ?? 'mzik-admin-dev'
const tokenIssuer = 'mzik-ticket-api'
const validGenders = new Set(['female', 'male', 'non_binary', 'prefer_not_to_say'])
const isProduction = process.env.NODE_ENV === 'production'

const supabaseProjectId = cleanEnv(process.env.SUPABASE_PROJECT_ID)
const supabaseUrl = cleanEnv(process.env.SUPABASE_URL) || (supabaseProjectId ? `https://${supabaseProjectId}.supabase.co` : '')
const supabaseServiceKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) || cleanEnv(process.env.SUPABASE_SECRET_KEY)
let supabaseClient = null

const event = {
  id: 'evt-triunfo-houseparty',
  slug: 'triunfo-houseparty',
  title: 'Triunfo HouseParty',
  kicker: 'Invite-only party',
  date: '2026-07-10',
  time: '8:00 PM',
  location: 'Triunfo, Maputo',
  venue: 'Private HouseParty Location',
  image: '/mzik-assets/lookbook-05.jpg',
  accent: '#b7ade3',
  status: 'available',
  description:
    'Mzik Off The Record: an invite-only MzikTV house party in Triunfo with limited guest-list access, music, style, and private-room energy.',
  importantInfo: ['Doors open at 8:00 PM.', 'Digital ticket and matching ID required at entry.', 'Invite code is required to unlock a ticket.'],
  ticketTypes: [
    {
      id: 'general',
      name: 'Guest List',
      price: 0,
      description: 'Invite-only entry to Triunfo HouseParty.',
      includes: ['Guest-list access', 'Digital ticket', 'HouseParty entry'],
      available: 86,
    },
    {
      id: 'vip',
      name: 'VIP Guest List',
      price: 0,
      description: 'Priority invite access for selected guests.',
      includes: ['Priority entry', 'VIP guest-list access', 'MzikTV moment'],
      available: 24,
    },
    {
      id: 'premium',
      name: 'Host Access',
      price: 0,
      description: 'Host-approved invite access for the private party.',
      includes: ['Host list confirmation', 'Private-room access', 'Digital QR ticket'],
      available: 8,
    },
  ],
}

const seedGuests = [
  {
    id: 'seed-demo-general',
    fullName: 'Demo Guest',
    gender: 'male',
    accessCode: 'LIVE-258',
    password: 'TRIUNFO10',
    eventSlug: event.slug,
    ticketTypeId: 'general',
    inviteLabel: 'Triunfo HouseParty Guest',
    source: 'seed',
    createdAt: '2026-06-16T00:00:00.000Z',
  },
  {
    id: 'seed-demo-vip',
    fullName: 'VIP Guest',
    gender: 'female',
    accessCode: 'VIP-MZIK',
    password: 'VIP2026',
    eventSlug: event.slug,
    ticketTypeId: 'vip',
    inviteLabel: 'Triunfo VIP Guest List',
    source: 'seed',
    createdAt: '2026-06-16T00:00:00.000Z',
  },
  {
    id: 'seed-demo-host',
    fullName: 'Host Guest',
    gender: 'prefer_not_to_say',
    accessCode: 'PRESS-001',
    password: 'HOSTONLY',
    eventSlug: event.slug,
    ticketTypeId: 'premium',
    inviteLabel: 'Triunfo Host Access',
    source: 'seed',
    createdAt: '2026-06-16T00:00:00.000Z',
  },
]

if (hasSupabaseConfig()) {
  try {
    await ensureSeedGuests()
  } catch (error) {
    console.error('Could not seed demo guests at startup:', error)
  }
} else {
  console.warn('Supabase seed skipped: database configuration is incomplete.')
}

export async function handleRequest(request, response) {
  try {
    if (request.method === 'OPTIONS') {
      writeJson(response, 204, null)
      return
    }

    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)

    if (url.pathname.startsWith('/api/')) {
      await routeApiRequest(request, response, url)
      return
    }

    await serveStaticFile(response, url)
  } catch (error) {
    if (error.isConfigurationError) {
      console.error(error.publicMessage)
    } else {
      console.error(error)
    }
    writeJson(response, error.statusCode ?? 500, { error: error.publicMessage ?? 'Internal server error.' })
  }
}

if (isDirectRun()) {
  createServer(handleRequest).listen(port, '127.0.0.1', () => {
    console.log(`Mzik backend running at http://127.0.0.1:${port}`)
    if (!process.env.ADMIN_PASSWORD) {
      console.log('Dev admin password: mzik-admin-dev')
    }
  })
}

async function routeApiRequest(request, response, url) {
  assertProductionSecrets()

  if (request.method === 'GET' && url.pathname === '/api/health') {
    const database = await getDatabaseHealth()
    writeJson(response, database.ok ? 200 : 503, {
      ok: database.ok,
      service: 'mzik-ticket-api',
      database,
    })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/event') {
    writeJson(response, 200, { event })
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/invites/verify') {
    await verifyInviteRequest(request, response)
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/admin/login') {
    await loginAdminRequest(request, response)
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/guests') {
    await requireAdmin(request)
    const guests = await listGuests()
    writeJson(response, 200, { guests: guests.map(sanitizeGuest) })
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/admin/guests') {
    await requireAdmin(request)
    await createGuestRequest(request, response)
    return
  }

  const guestDeleteMatch = url.pathname.match(/^\/api\/admin\/guests\/([^/]+)$/)
  if (request.method === 'DELETE' && guestDeleteMatch) {
    await requireAdmin(request)
    await deleteGuestRequest(response, guestDeleteMatch[1])
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/checkins') {
    await requireAdmin(request)
    const checkins = await listCheckins()
    writeJson(response, 200, { checkins })
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/checkins') {
    await requireAdmin(request)
    await checkInTicketRequest(request, response)
    return
  }

  writeJson(response, 404, { error: 'API route not found.' })
}

async function verifyInviteRequest(request, response) {
  const body = await readJsonBody(request)
  const fullName = cleanDisplayName(String(body.fullName ?? ''))
  const normalizedName = normalizeGuestName(fullName)
  const gender = String(body.gender ?? '')
  const accessCode = normalizeInviteCode(String(body.inviteCode ?? ''))
  const password = String(body.password ?? '').trim()

  if (!fullName || !gender || !accessCode || !password) {
    writeJson(response, 400, { error: 'Name, gender, invite code, and password are required.' })
    return
  }

  if (fullName.length > 80 || accessCode.length > 24 || password.length > 128 || !validGenders.has(gender)) {
    writeJson(response, 400, { error: 'Invite details are invalid.' })
    return
  }

  const guest = await findGuest({ normalizedName, gender, accessCode })

  if (!guest || !(await verifyPassword(password, guest.passwordHash))) {
    writeJson(response, 401, { error: 'These invite details do not match the guest list.' })
    return
  }

  if (guest.checkedInAt) {
    writeJson(response, 409, { error: 'This guest is already checked in.' })
    return
  }

  const ticket = await issueOrReuseTicket(guest)
  writeJson(response, 200, { order: createOrder(guest, ticket) })
}

async function loginAdminRequest(request, response) {
  const body = await readJsonBody(request)
  const password = String(body.password ?? '')

  if (!timingSafeStringEqual(password, adminPassword)) {
    writeJson(response, 401, { error: 'Invalid admin password.' })
    return
  }

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString()
  const token = signToken({ sub: 'admin', role: 'admin', exp: Math.floor(new Date(expiresAt).getTime() / 1000) })
  writeJson(response, 200, { token, expiresAt })
}

async function createGuestRequest(request, response) {
  const supabase = getSupabase()
  const body = await readJsonBody(request)
  const fullName = cleanDisplayName(String(body.fullName ?? ''))
  const normalizedName = normalizeGuestName(fullName)
  const gender = String(body.gender ?? '')
  const accessCode = normalizeInviteCode(String(body.accessCode ?? ''))
  const password = String(body.password ?? '').trim()
  const ticketTypeId = String(body.ticketTypeId ?? 'general')
  const ticketType = event.ticketTypes.find((candidate) => candidate.id === ticketTypeId)

  if (
    !fullName ||
    fullName.length > 80 ||
    !validGenders.has(gender) ||
    !accessCode ||
    accessCode.length > 24 ||
    password.length < 6 ||
    password.length > 128 ||
    !ticketType
  ) {
    writeJson(response, 400, { error: 'Valid guest name, gender, code, password, and ticket tier are required.' })
    return
  }

  const guestRow = {
    id: `guest-${randomUUID()}`,
    full_name: fullName,
    normalized_name: normalizedName,
    gender,
    access_code: accessCode,
    event_slug: event.slug,
    ticket_type_id: ticketTypeId,
    invite_label: getInviteLabel(ticketTypeId),
    source: 'admin',
    password_hash: await hashPassword(password),
    created_at: new Date().toISOString(),
    checked_in_at: null,
  }

  const { data, error } = await supabase.from('guests').insert(guestRow).select().single()

  if (error) {
    if (error.code === '23505') {
      writeJson(response, 409, { error: 'This guest already has this invite code.' })
      return
    }

    throw databaseError(error)
  }

  writeJson(response, 201, { guest: sanitizeGuest(rowToGuest(data)), temporaryPassword: password })
}

async function deleteGuestRequest(response, guestId) {
  const supabase = getSupabase()
  const { data: guest, error: lookupError } = await supabase.from('guests').select('id, source').eq('id', guestId).maybeSingle()

  if (lookupError) {
    throw databaseError(lookupError)
  }

  if (!guest) {
    writeJson(response, 404, { error: 'Guest not found.' })
    return
  }

  if (guest.source === 'seed') {
    writeJson(response, 403, { error: 'Seed guests cannot be deleted.' })
    return
  }

  // tickets and checkins are removed by the on delete cascade foreign keys.
  const { error: deleteError } = await supabase.from('guests').delete().eq('id', guestId)

  if (deleteError) {
    throw databaseError(deleteError)
  }

  writeJson(response, 200, { ok: true })
}

async function checkInTicketRequest(request, response) {
  const supabase = getSupabase()
  const body = await readJsonBody(request)
  const ticketToken = String(body.ticketToken ?? '').trim()
  const payload = verifySignedToken(ticketToken, 'ticket')

  if (!payload) {
    writeJson(response, 401, { error: 'Ticket token is invalid.' })
    return
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', payload.ticketId)
    .eq('token_hash', hashTicketToken(ticketToken))
    .maybeSingle()

  if (ticketError) {
    throw databaseError(ticketError)
  }

  const guest = ticket ? await findGuestById(ticket.guest_id) : null

  if (!ticket || !guest) {
    writeJson(response, 404, { error: 'Ticket was not found.' })
    return
  }

  if (ticket.checked_in_at || guest.checkedInAt) {
    writeJson(response, 409, {
      error: 'Guest is already checked in.',
      guest: sanitizeGuest(guest),
      checkedInAt: ticket.checked_in_at ?? guest.checkedInAt,
    })
    return
  }

  const checkedInAt = new Date().toISOString()

  const { data: updatedTicket, error: ticketUpdateError } = await supabase
    .from('tickets')
    .update({ checked_in_at: checkedInAt })
    .eq('id', ticket.id)
    .is('checked_in_at', null)
    .select('id')
    .maybeSingle()
  if (ticketUpdateError) {
    throw databaseError(ticketUpdateError)
  }

  if (!updatedTicket) {
    writeJson(response, 409, {
      error: 'Guest is already checked in.',
      guest: sanitizeGuest(guest),
      checkedInAt: ticket.checked_in_at ?? guest.checkedInAt,
    })
    return
  }

  const { error: guestUpdateError } = await supabase.from('guests').update({ checked_in_at: checkedInAt }).eq('id', guest.id)
  if (guestUpdateError) {
    throw databaseError(guestUpdateError)
  }

  const { error: checkinError } = await supabase.from('checkins').insert({
    id: `checkin-${randomUUID()}`,
    ticket_id: ticket.id,
    guest_id: guest.id,
    event_id: event.id,
    checked_in_at: checkedInAt,
  })
  if (checkinError) {
    if (checkinError.code === '23505') {
      writeJson(response, 409, {
        error: 'Guest is already checked in.',
        guest: sanitizeGuest({ ...guest, checkedInAt }),
        checkedInAt,
      })
      return
    }

    throw databaseError(checkinError)
  }

  writeJson(response, 200, {
    ok: true,
    guest: sanitizeGuest({ ...guest, checkedInAt }),
    checkedInAt,
  })
}

async function requireAdmin(request) {
  const authHeader = request.headers.authorization ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : ''
  const payload = verifySignedToken(token, 'admin')

  if (!payload || payload.role !== 'admin') {
    const error = new Error('Unauthorized')
    error.statusCode = 401
    error.publicMessage = 'Admin authorization is required.'
    throw error
  }

  return payload
}

async function listGuests() {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('guests').select('*').order('created_at', { ascending: true })

  if (error) {
    throw databaseError(error)
  }

  return data.map(rowToGuest)
}

async function listCheckins() {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('checkins').select('*').order('checked_in_at', { ascending: false })

  if (error) {
    throw databaseError(error)
  }

  return data.map((row) => ({
    id: row.id,
    ticketId: row.ticket_id,
    guestId: row.guest_id,
    eventId: row.event_id,
    checkedInAt: row.checked_in_at,
  }))
}

async function findGuest({ normalizedName, gender, accessCode }) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('normalized_name', normalizedName)
    .eq('gender', gender)
    .eq('access_code', accessCode)
    .maybeSingle()

  if (error) {
    throw databaseError(error)
  }

  return data ? rowToGuest(data) : null
}

async function findGuestById(guestId) {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('guests').select('*').eq('id', guestId).maybeSingle()

  if (error) {
    throw databaseError(error)
  }

  return data ? rowToGuest(data) : null
}

async function issueOrReuseTicket(guest) {
  const supabase = getSupabase()
  const { data: reusable, error: reusableError } = await supabase
    .from('tickets')
    .select('*')
    .eq('guest_id', guest.id)
    .eq('event_id', event.id)
    .is('checked_in_at', null)
    .eq('token_version', 2)
    .limit(1)
    .maybeSingle()

  if (reusableError) {
    throw databaseError(reusableError)
  }

  if (reusable) {
    const ticketToken = createTicketToken(rowToTicket(reusable))
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ token_hash: hashTicketToken(ticketToken) })
      .eq('id', reusable.id)

    if (updateError) {
      throw databaseError(updateError)
    }

    return { ...rowToTicket(reusable), token: ticketToken }
  }

  const ticket = {
    id: `ticket-${randomUUID()}`,
    guestId: guest.id,
    eventId: event.id,
    issuedAt: new Date().toISOString(),
    checkedInAt: null,
    tokenVersion: 2,
  }
  const ticketToken = createTicketToken(ticket)

  const { error: insertError } = await supabase.from('tickets').insert({
    id: ticket.id,
    guest_id: ticket.guestId,
    event_id: ticket.eventId,
    issued_at: ticket.issuedAt,
    checked_in_at: null,
    token_hash: hashTicketToken(ticketToken),
    token_version: ticket.tokenVersion,
  })

  if (insertError) {
    throw databaseError(insertError)
  }

  return { ...ticket, token: ticketToken }
}

function createTicketToken(ticket) {
  return signToken(
    {
      sub: 'ticket',
      purpose: 'ticket',
      ticketId: ticket.id,
      guestId: ticket.guestId,
      eventId: ticket.eventId,
      iat: Math.floor(new Date(ticket.issuedAt).getTime() / 1000),
      version: 2,
    },
    'ticket',
  )
}

function createOrder(guest, ticket) {
  const ticketType = event.ticketTypes.find((candidate) => candidate.id === guest.ticketTypeId) ?? event.ticketTypes[0]

  return {
    id: ticket.id,
    event,
    items: [
      {
        ticketType,
        quantity: 1,
      },
    ],
    buyer: {
      fullName: guest.fullName,
      email: '',
      phone: '',
    },
    guest: {
      gender: guest.gender,
      accessCode: guest.accessCode,
      inviteLabel: guest.inviteLabel,
    },
    subtotal: 0,
    serviceFee: 0,
    total: 0,
    qrPayload: ticket.token,
    createdAt: ticket.issuedAt,
  }
}

async function ensureSeedGuests() {
  const supabase = getSupabase()
  const rows = []

  for (const seedGuest of seedGuests) {
    rows.push({
      id: seedGuest.id,
      full_name: seedGuest.fullName,
      normalized_name: normalizeGuestName(seedGuest.fullName),
      gender: seedGuest.gender,
      access_code: normalizeInviteCode(seedGuest.accessCode),
      event_slug: seedGuest.eventSlug,
      ticket_type_id: seedGuest.ticketTypeId,
      invite_label: seedGuest.inviteLabel,
      source: 'seed',
      password_hash: await hashPassword(seedGuest.password),
      created_at: seedGuest.createdAt,
      checked_in_at: null,
    })
  }

  // ignoreDuplicates keeps the existing seed rows (and their stable password
  // hashes) untouched, so we only insert seeds that are missing.
  const { error } = await supabase.from('guests').upsert(rows, { onConflict: 'id', ignoreDuplicates: true })

  if (error) {
    throw databaseError(error)
  }
}

async function getDatabaseHealth() {
  const supabase = getSupabase()
  const { error } = await supabase.from('guests').select('id').limit(1)

  if (error) {
    console.error('Supabase health check failed:', error)
    return {
      ok: false,
      table: 'guests',
      error: error.message ?? 'Database check failed.',
    }
  }

  return {
    ok: true,
    table: 'guests',
    reachable: true,
  }
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('base64url')
  const hash = await scrypt(password, salt, 64)
  return `scrypt:${salt}:${Buffer.from(hash).toString('base64url')}`
}

async function verifyPassword(password, storedHash) {
  const [, salt, expectedHash] = String(storedHash).split(':')

  if (!salt || !expectedHash) {
    return false
  }

  const actualHash = await scrypt(password, salt, 64)
  const expected = Buffer.from(expectedHash, 'base64url')

  return expected.length === actualHash.length && timingSafeEqual(expected, actualHash)
}

function signToken(payload, purpose = 'admin') {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const body = {
    iss: tokenIssuer,
    iat: now,
    purpose,
    ...payload,
  }
  const encodedHeader = base64UrlJson(header)
  const encodedBody = base64UrlJson(body)
  const signature = createHmac('sha256', tokenSecret).update(`${encodedHeader}.${encodedBody}`).digest('base64url')

  return `${encodedHeader}.${encodedBody}.${signature}`
}

function verifySignedToken(token, expectedPurpose) {
  const [encodedHeader, encodedBody, signature] = String(token).split('.')

  if (!encodedHeader || !encodedBody || !signature) {
    return null
  }

  const expectedSignature = createHmac('sha256', tokenSecret).update(`${encodedHeader}.${encodedBody}`).digest('base64url')

  if (!timingSafeStringEqual(signature, expectedSignature)) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedBody, 'base64url').toString('utf8'))

    if (payload.iss !== tokenIssuer || payload.purpose !== expectedPurpose) {
      return null
    }

    if (payload.exp && Math.floor(Date.now() / 1000) >= payload.exp) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

function hashTicketToken(token) {
  return createHash('sha256').update(token).digest('base64url')
}

async function readJsonBody(request) {
  let rawBody = ''

  for await (const chunk of request) {
    rawBody += chunk

    if (rawBody.length > 100_000) {
      const error = new Error('Request body is too large.')
      error.statusCode = 413
      error.publicMessage = 'Request body is too large.'
      throw error
    }
  }

  if (!rawBody) {
    return {}
  }

  try {
    return JSON.parse(rawBody)
  } catch {
    const error = new Error('Request body must be valid JSON.')
    error.statusCode = 400
    error.publicMessage = 'Request body must be valid JSON.'
    throw error
  }
}

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  })

  if (payload !== null) {
    response.end(JSON.stringify(payload))
    return
  }

  response.end()
}

async function serveStaticFile(response, url) {
  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname
  const filePath = resolve(join(distDirectory, requestedPath))
  const isInsideDist = filePath === distDirectory || filePath.startsWith(`${distDirectory}${sep}`)
  const safeFilePath = isInsideDist && existsSync(filePath) ? filePath : join(distDirectory, 'index.html')

  if (!existsSync(safeFilePath)) {
    response.writeHead(404, { 'Content-Type': 'text/plain' })
    response.end('Build the frontend first with npm run build.')
    return
  }

  response.writeHead(200, { 'Content-Type': getContentType(safeFilePath) })
  createReadStream(safeFilePath).pipe(response)
}

function getContentType(filePath) {
  const extension = extname(filePath)

  if (extension === '.html') return 'text/html'
  if (extension === '.js') return 'text/javascript'
  if (extension === '.css') return 'text/css'
  if (extension === '.svg') return 'image/svg+xml'
  if (extension === '.png') return 'image/png'
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg'
  if (extension === '.webp') return 'image/webp'

  return 'application/octet-stream'
}

function rowToGuest(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    normalizedName: row.normalized_name,
    gender: row.gender,
    accessCode: row.access_code,
    eventSlug: row.event_slug,
    ticketTypeId: row.ticket_type_id,
    inviteLabel: row.invite_label,
    source: row.source,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    checkedInAt: row.checked_in_at ?? null,
  }
}

function rowToTicket(row) {
  return {
    id: row.id,
    guestId: row.guest_id,
    eventId: row.event_id,
    issuedAt: row.issued_at,
    checkedInAt: row.checked_in_at ?? null,
    tokenVersion: row.token_version,
    tokenHash: row.token_hash,
  }
}

function sanitizeGuest(guest) {
  return {
    id: guest.id,
    fullName: guest.fullName,
    gender: guest.gender,
    accessCode: guest.accessCode,
    eventSlug: guest.eventSlug,
    ticketTypeId: guest.ticketTypeId,
    inviteLabel: guest.inviteLabel,
    source: guest.source,
    createdAt: guest.createdAt,
    checkedInAt: guest.checkedInAt ?? null,
    passwordStatus: 'Set',
  }
}

function getSupabase() {
  if (!hasSupabaseConfig()) {
    throw configurationError(
      'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY in the backend environment.',
    )
  }

  supabaseClient ??= createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return supabaseClient
}

function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseServiceKey)
}

function assertProductionSecrets() {
  if (isProduction && (!cleanEnv(process.env.ADMIN_PASSWORD) || !cleanEnv(process.env.TOKEN_SECRET))) {
    throw configurationError('Production secrets are not configured. Add ADMIN_PASSWORD and TOKEN_SECRET in the backend environment.')
  }
}

function configurationError(publicMessage) {
  const error = new Error(publicMessage)
  error.statusCode = 503
  error.publicMessage = publicMessage
  error.isConfigurationError = true
  return error
}

function databaseError(error) {
  console.error('Supabase error:', error)
  const wrapped = new Error(error?.message ?? 'Database error')
  wrapped.statusCode = 500
  wrapped.publicMessage =
    error?.code === 'PGRST205'
      ? 'The Supabase database tables are not set up yet. Run supabase/schema.sql in the Supabase SQL Editor.'
      : 'A database error occurred.'
  return wrapped
}

function cleanEnv(value) {
  const nextValue = String(value ?? '').trim()

  if (!nextValue || nextValue.includes('replace-with') || nextValue.includes('your-project-ref')) {
    return ''
  }

  return nextValue
}

function normalizeInviteCode(code) {
  return code.trim().toUpperCase().replace(/\s+/g, '-')
}

function normalizeGuestName(name) {
  return cleanDisplayName(name).toLocaleLowerCase()
}

function cleanDisplayName(name) {
  return name.trim().replace(/\s+/g, ' ')
}

function getInviteLabel(ticketTypeId) {
  if (ticketTypeId === 'vip') return 'Triunfo VIP Guest List'
  if (ticketTypeId === 'premium') return 'Triunfo Host Access'
  return 'Triunfo HouseParty Guest'
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function timingSafeStringEqual(left, right) {
  const leftBuffer = Buffer.from(String(left))
  const rightBuffer = Buffer.from(String(right))

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

function isDirectRun() {
  if (!process.argv[1]) {
    return false
  }

  return resolve(process.argv[1]) === fileURLToPath(import.meta.url)
}
