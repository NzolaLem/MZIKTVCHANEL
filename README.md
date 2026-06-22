# MZIK TV Guest Access

Invite-only guest access site for the MZIK TV HouseParty. The app includes a public invite unlock flow, QR ticket generation, an admin dashboard, door check-in, and Supabase-backed guest/check-in storage.

## Local Development

1. Install dependencies:

```sh
npm install
```

2. Copy `.env.example` to `.env` and fill in the real values.

3. Verify Supabase:

```sh
npm run db:check
```

4. Start the website and API together:

```sh
npm run dev
```

The website runs on `http://localhost:5173`. The API runs on `http://127.0.0.1:8787`, and Vite proxies `/api` requests to it.

## Vercel Deployment

Import this GitHub repo into Vercel and use the project defaults:

```txt
Build command: npm run build
Output directory: dist
```

Add these Environment Variables in Vercel Project Settings:

```sh
ADMIN_PASSWORD=your-admin-dashboard-password
TOKEN_SECRET=your-long-random-token-secret
SUPABASE_PROJECT_ID=lzepyzvisjkwnytxopmd
SUPABASE_URL=https://lzepyzvisjkwnytxopmd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-supabase-key
```

Do not add the Supabase service-role key as a `VITE_` variable. It must stay server-side only.

After deployment, check:

```txt
https://your-vercel-domain.vercel.app/api/health
```

It should return `ok: true` with the database marked reachable.

## Useful Commands

```sh
npm run build
npm run lint
npm run db:check
npm run dev:api
```

## Database

The production database is Supabase Postgres. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor to create or update the required `guests`, `tickets`, `checkins`, and atomic check-in function.
