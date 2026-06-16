# Mzik Ticket Backend

This backend runs the invite-only guest list flow for Triunfo HouseParty.

## Run locally

```sh
npm run dev:api
npm run dev
```

The API runs on `http://127.0.0.1:8787`. Vite proxies `/api` requests to it during local development.

## Required production env vars

```sh
ADMIN_PASSWORD=replace-with-a-strong-admin-password
TOKEN_SECRET=replace-with-a-long-random-token-secret
API_PORT=8787
```

`ADMIN_PASSWORD` protects the admin dashboard. `TOKEN_SECRET` signs admin sessions and QR ticket tokens.

## Storage

The MVP uses `server/data/db.json`, which is ignored by git. Guest passwords are hashed with `scrypt`; raw guest passwords are only returned once when an admin creates a guest.

For a real deployed party workflow, replace the JSON file with Postgres, Supabase, or another durable database so multiple admins and deployments share the same guest list.

On Vercel, this backend runs through `api/[...path].mjs`. The API routes will work, but Vercel's local filesystem is temporary for serverless functions, so admin-created guests should not be treated as durable production data until a database is attached.

## API routes

`GET /api/health`

Checks that the backend is running.

`GET /api/event`

Returns the Triunfo HouseParty event details.

`POST /api/invites/verify`

Checks `fullName`, `gender`, `inviteCode`, and `password` against the guest list. On success it returns an order with a signed QR payload.

`POST /api/admin/login`

Creates an 8-hour admin bearer token from the admin password.

`GET /api/admin/guests`

Lists sanitized guest records. Requires `Authorization: Bearer <token>`.

`POST /api/admin/guests`

Creates a guest with name, gender, invite code, password, and ticket tier. Requires admin auth.

`DELETE /api/admin/guests/:id`

Deletes an admin-created guest and their issued tickets/check-ins. Seed demo guests cannot be deleted.

`GET /api/admin/checkins`

Lists check-in records. Requires admin auth.

`POST /api/checkins`

Checks in a ticket from its QR token. Requires admin auth and rejects duplicate check-ins.
