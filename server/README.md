# Mzik Ticket Backend

This backend runs the invite-only guest list flow for Triunfo HouseParty.

## One-time Supabase setup

1. In the Supabase dashboard open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](../supabase/schema.sql), and **Run** it. This creates the
   `guests`, `tickets`, and `checkins` tables.
2. Copy `.env.example` to `.env` and fill in the values (see below).

## Run locally

```sh
npm run db:check
npm run dev
```

`npm run dev` starts both the API and the Vite website. The API runs on
`http://127.0.0.1:8787`, and Vite proxies `/api` requests to it during local development.
`npm run db:check`, `npm run dev`, and `npm run dev:api` load `.env` automatically.

## Required env vars

```sh
ADMIN_PASSWORD=replace-with-a-strong-admin-password
TOKEN_SECRET=replace-with-a-long-random-token-secret
API_PORT=8787
SUPABASE_PROJECT_ID=lzepyzvisjkwnytxopmd
SUPABASE_URL=https://lzepyzvisjkwnytxopmd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace-with-your-server-only-key
```

- `ADMIN_PASSWORD` protects the admin dashboard.
- `TOKEN_SECRET` signs admin sessions and QR ticket tokens.
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` come from the Supabase dashboard
  (Project Settings → Data API / API Keys). The server-only key is a secret —
  it is only ever used server-side and must never be exposed to the browser or
  prefixed with `VITE_`.

On Vercel, set these same variables in **Project Settings → Environment Variables**.

## Storage

Guests, tickets, and check-ins are stored in Supabase (Postgres). Guest passwords are hashed
with `scrypt`; raw guest passwords are only returned once when an admin creates a guest. The
three demo "seed" guests are upserted on startup so the table is never empty.

Row Level Security is enabled on all tables with no policies, so the public/anon key cannot
read guest data — only the server's service-role key (which bypasses RLS) can.

On Vercel, this backend runs through `api/[...path].mjs`. Because all state now lives in
Supabase, admin-created guests persist across deployments and serverless cold starts.

## API routes

`GET /api/health`

Checks that the backend is running and can reach the `guests` table in Supabase.

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
