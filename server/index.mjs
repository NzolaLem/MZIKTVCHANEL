import { createServer } from 'node:http'
import { existsSync, createReadStream } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash, createHmac, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { tmpdir } from 'node:os'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))
const isVercelRuntime = process.env.VERCEL === '1'
const dataDirectory = process.env.DATA_DIRECTORY
  ? resolve(process.env.DATA_DIRECTORY)
  : isVercelRuntime
    ? join(tmpdir(), 'mzik-ticket-data')
    : join(rootDirectory, 'server', 'data')
const databasePath = join(dataDirectory, 'db.json')
const distDirectory = join(rootDirectory, 'dist')
const port = Number(process.env.API_PORT ?? process.env.PORT ?? 8787)
const tokenSecret = process.env.TOKEN_SECRET ?? 'dev-mzik-ticket-secret-change-before-production'
const adminPassword = process.env.ADMIN_PASSWORD ?? 'mzik-admin-dev'
const tokenIssuer = 'mzik-ticket-api'
let databaseMutationQueue = Promise.resolve()
const validGenders = new Set(['female', 'male', 'non_binary', 'prefer_not_to_say'])

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

await initializeDatabase()

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
    console.error(error)
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
  if (request.method === 'GET' && url.pathname === '/api/health') {
    writeJson(response, 200, { ok: true, service: 'mzik-ticket-api' })
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
    const database = await readDatabaseForResponse()
    writeJson(response, 200, { guests: database.guests.map(sanitizeGuest) })
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
    const database = await readDatabaseForResponse()
    writeJson(response, 200, { checkins: database.checkins })
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

  const result = await mutateDatabase(async (database) => {
    const guest = database.guests.find(
      (candidate) =>
        candidate.normalizedName === normalizedName && candidate.gender === gender && normalizeInviteCode(candidate.accessCode) === accessCode,
    )

    if (!guest || !(await verifyPassword(password, guest.passwordHash))) {
      return { status: 401, payload: { error: 'These invite details do not match the guest list.' } }
    }

    if (guest.checkedInAt) {
      return { status: 409, payload: { error: 'This guest is already checked in.' } }
    }

    const ticket = issueOrReuseTicket(database, guest)

    return {
      status: 200,
      payload: {
        order: createOrder(guest, ticket),
      },
    }
  })

  writeJson(response, result.status, result.payload)
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

  const result = await mutateDatabase(async (database) => {
    const duplicate = database.guests.some(
      (guest) => guest.normalizedName === normalizedName && normalizeInviteCode(guest.accessCode) === accessCode,
    )

    if (duplicate) {
      return { status: 409, payload: { error: 'This guest already has this invite code.' } }
    }

    const guest = {
      id: `guest-${randomUUID()}`,
      fullName,
      normalizedName,
      gender,
      accessCode,
      eventSlug: event.slug,
      ticketTypeId,
      inviteLabel: getInviteLabel(ticketTypeId),
      source: 'admin',
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
      checkedInAt: null,
    }

    database.guests.push(guest)
    return { status: 201, payload: { guest: sanitizeGuest(guest), temporaryPassword: password } }
  })

  writeJson(response, result.status, result.payload)
}

async function deleteGuestRequest(response, guestId) {
  const result = await mutateDatabase(async (database) => {
    const guest = database.guests.find((candidate) => candidate.id === guestId)

    if (!guest) {
      return { status: 404, payload: { error: 'Guest not found.' } }
    }

    if (guest.source === 'seed') {
      return { status: 403, payload: { error: 'Seed guests cannot be deleted.' } }
    }

    const deletedTicketIds = new Set(database.tickets.filter((ticket) => ticket.guestId === guestId).map((ticket) => ticket.id))
    database.guests = database.guests.filter((candidate) => candidate.id !== guestId)
    database.tickets = database.tickets.filter((ticket) => ticket.guestId !== guestId)
    database.checkins = database.checkins.filter((checkin) => checkin.guestId !== guestId && !deletedTicketIds.has(checkin.ticketId))

    return { status: 200, payload: { ok: true } }
  })

  writeJson(response, result.status, result.payload)
}

async function checkInTicketRequest(request, response) {
  const body = await readJsonBody(request)
  const ticketToken = String(body.ticketToken ?? '').trim()
  const payload = verifySignedToken(ticketToken, 'ticket')

  if (!payload) {
    writeJson(response, 401, { error: 'Ticket token is invalid.' })
    return
  }

  const result = await mutateDatabase(async (database) => {
    const tokenHash = hashTicketToken(ticketToken)
    const ticket = database.tickets.find((candidate) => candidate.id === payload.ticketId && candidate.tokenHash === tokenHash)
    const guest = ticket ? database.guests.find((candidate) => candidate.id === ticket.guestId) : null

    if (!ticket || !guest) {
      return { status: 404, payload: { error: 'Ticket was not found.' } }
    }

    if (ticket.checkedInAt || guest.checkedInAt) {
      return {
        status: 409,
        payload: {
          error: 'Guest is already checked in.',
          guest: sanitizeGuest(guest),
          checkedInAt: ticket.checkedInAt ?? guest.checkedInAt,
        },
      }
    }

    const checkedInAt = new Date().toISOString()
    ticket.checkedInAt = checkedInAt
    guest.checkedInAt = checkedInAt
    database.checkins.push({
      id: `checkin-${randomUUID()}`,
      ticketId: ticket.id,
      guestId: guest.id,
      eventId: event.id,
      checkedInAt,
    })

    return {
      status: 200,
      payload: {
        ok: true,
        guest: sanitizeGuest(guest),
        checkedInAt,
      },
    }
  })

  writeJson(response, result.status, result.payload)
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

function issueOrReuseTicket(database, guest) {
  const reusableTicket = database.tickets.find(
    (candidate) => candidate.guestId === guest.id && candidate.eventId === event.id && !candidate.checkedInAt && candidate.tokenVersion === 2,
  )

  if (reusableTicket) {
    const ticketToken = createTicketToken(reusableTicket)
    reusableTicket.tokenHash = hashTicketToken(ticketToken)

    return {
      ...reusableTicket,
      token: ticketToken,
    }
  }

  const ticketId = `ticket-${randomUUID()}`
  const issuedAt = new Date().toISOString()
  const ticket = {
    id: ticketId,
    guestId: guest.id,
    eventId: event.id,
    issuedAt,
    checkedInAt: null,
    tokenVersion: 2,
  }
  const ticketToken = createTicketToken(ticket)
  const persistedTicket = {
    ...ticket,
    tokenHash: hashTicketToken(ticketToken),
  }

  database.tickets.push(persistedTicket)
  return {
    ...persistedTicket,
    token: ticketToken,
  }
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
    paymentMethod: 'card',
    subtotal: 0,
    serviceFee: 0,
    total: 0,
    qrPayload: ticket.token,
    createdAt: ticket.issuedAt,
  }
}

async function initializeDatabase() {
  await mkdir(dataDirectory, { recursive: true })
  const database = existsSync(databasePath)
    ? await readDatabase()
    : {
        version: 1,
        guests: [],
        tickets: [],
        checkins: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

  for (const seedGuest of seedGuests) {
    if (!database.guests.some((guest) => guest.id === seedGuest.id)) {
      database.guests.push({
        ...omit(seedGuest, ['password']),
        normalizedName: normalizeGuestName(seedGuest.fullName),
        accessCode: normalizeInviteCode(seedGuest.accessCode),
        passwordHash: await hashPassword(seedGuest.password),
        checkedInAt: null,
      })
    }
  }

  await writeDatabase(database)
}

async function readDatabase() {
  try {
    const rawDatabase = await readFile(databasePath, 'utf8')
    return JSON.parse(rawDatabase)
  } catch {
    return {
      version: 1,
      guests: [],
      tickets: [],
      checkins: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}

async function readDatabaseForResponse() {
  await databaseMutationQueue.catch(() => {})
  return readDatabase()
}

async function writeDatabase(database) {
  database.updatedAt = new Date().toISOString()
  await writeFile(databasePath, `${JSON.stringify(database, null, 2)}\n`, 'utf8')
}

async function mutateDatabase(mutator) {
  const nextMutation = databaseMutationQueue.then(async () => {
    const database = await readDatabase()
    const result = await mutator(database)
    await writeDatabase(database)
    return result
  })

  databaseMutationQueue = nextMutation.catch(() => {})
  return nextMutation
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
  const safeFilePath = filePath.startsWith(distDirectory) && existsSync(filePath) ? filePath : join(distDirectory, 'index.html')

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

function omit(object, keys) {
  return Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)))
}

function isDirectRun() {
  if (!process.argv[1]) {
    return false
  }

  return resolve(process.argv[1]) === fileURLToPath(import.meta.url)
}
