# Bank, Man!

A personal finance manager built with Next.js and Supabase.

## Prerequisites

- Node.js 20.9 or newer
- npm
- Docker Desktop or another Docker-compatible runtime

## Initial setup

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env.local
```

Start the local Supabase stack:

```bash
npm run db:start
```

Copy the API URL and publishable key printed by Supabase into `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-local-publishable-key
```

Do not commit `.env.local` or credentials from a hosted Supabase project.

## Local development

Start the application:

```bash
npm run dev
```

The local services are available at:

- Application: http://localhost:3000
- Supabase API: http://127.0.0.1:54321
- Supabase Studio: http://127.0.0.1:54323
- Local email viewer: http://127.0.0.1:54324

Stop the Supabase stack with `npm run db:stop`.

## Database workflow

Migrations in `supabase/migrations` are the source of truth for schema changes.
The seed file is `supabase/seed.sql`.

Reset the local database, reapply all migrations, and reload the seed file:

```bash
npm run db:reset
```

This command replaces local database data. It does not target a hosted project.

Lint the application-owned database schema and run the pgTAP suite:

```bash
npm run db:lint
npm run db:test
```

## Verification

Run the automated checks:

```bash
npm run test:run
npm run test:integration
npm run lint
npm run typecheck
npm run format:check
```

`npm run test:integration` requires the local Supabase stack and values in
`.env.local`.

A production build can be checked with `npm run build`.
