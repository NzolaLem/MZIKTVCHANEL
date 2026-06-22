import { Readable } from 'node:stream'
import assert from 'node:assert/strict'
import { test } from 'node:test'

process.env.NODE_ENV = 'test'
process.env.ADMIN_PASSWORD = 'test-admin-password'
process.env.TOKEN_SECRET = 'test-token-secret-change-before-production'
process.env.SUPABASE_PROJECT_ID = ''
process.env.SUPABASE_URL = ''
process.env.SUPABASE_SERVICE_ROLE_KEY = ''
process.env.SUPABASE_SECRET_KEY = ''

const { handleRequest } = await import('../server/index.mjs')

test('admin login returns a bearer token for the configured password', async () => {
  const response = await postJson('/api/admin/login', {
    password: 'test-admin-password',
  })

  assert.equal(response.status, 200)
  assert.equal(typeof response.body.token, 'string')
  assert.match(response.body.token, /^[^.]+\.[^.]+\.[^.]+$/)
  assert.equal(typeof response.body.expiresAt, 'string')
})

test('admin login is rate-limited after repeated failures', async () => {
  const headers = { 'x-forwarded-for': '203.0.113.80' }

  for (let index = 0; index < 8; index += 1) {
    const response = await postJson('/api/admin/login', { password: 'wrong-password' }, headers)
    assert.equal(response.status, 401)
  }

  const response = await postJson('/api/admin/login', { password: 'wrong-password' }, headers)

  assert.equal(response.status, 429)
  assert.equal(response.body.error, 'Too many admin login attempts. Try again later.')
  assert.equal(typeof response.body.retryAfterSeconds, 'number')
})

test('invite unlock validates required details before hitting storage', async () => {
  const response = await postJson('/api/invites/verify', {
    fullName: '',
    gender: '',
    password: '',
  })

  assert.equal(response.status, 400)
  assert.equal(response.body.error, 'Name, gender, and password are required.')
})

async function postJson(path, body, extraHeaders = {}) {
  const request = Readable.from([JSON.stringify(body)])
  request.method = 'POST'
  request.url = path
  request.headers = {
    host: 'localhost',
    'content-type': 'application/json',
    ...extraHeaders,
  }
  request.socket = { remoteAddress: '127.0.0.1' }

  const response = createMockResponse()
  await handleRequest(request, response)

  return response.toResult()
}

function createMockResponse() {
  let status = 200
  let headers = {}
  let text = ''

  return {
    writeHead(nextStatus, nextHeaders = {}) {
      status = nextStatus
      headers = nextHeaders
    },
    end(chunk = '') {
      text += String(chunk)
    },
    toResult() {
      return {
        status,
        headers,
        text,
        body: text ? JSON.parse(text) : null,
      }
    },
  }
}
