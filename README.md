# UAE SOS

A Next.js (App Router) application used to match people in need with nearby
volunteers during emergency situations (e.g. floods/rain events in the UAE).
Anyone can submit a request for help without an account; authenticated
volunteers can see open requests on a live map, claim them, and track them
through to completion.

## Setup

This project uses [bun](https://bun.sh) as its package manager.

1. **Install dependencies**

    ```bash
    bun install
    ```

2. **Environment variables**

    Copy `.env.example` to `.env.local` and fill in your Supabase project
    credentials:

    | Variable | Description |
    | --- | --- |
    | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
    | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The Supabase anon/public API key |

3. **Run the dev server**

    ```bash
    bun run dev
    ```

    The app is served at `http://localhost:3000` with Turbopack.

## Scripts

| Script | Description |
| --- | --- |
| `bun run dev` | Start the Next.js dev server (Turbopack) |
| `bun run build` | Create a production build |
| `bun run start` | Run the production build |
| `bun run lint` | Run ESLint over the project |

## Architecture

- **App Router pages**
  - `/` — public landing page with a summary of currently active,
    unauthenticated-safe case info (`src/app/page.tsx`).
  - `/newcase` — public form for submitting a new SOS case.
  - `/signin`, `/signup` — volunteer authentication (Supabase Auth).
  - `/volunteer` — authenticated volunteer dashboard: live map/list of open
    cases, claiming cases, and tracking your own assigned cases.
- **Data layer**: all case data lives in a single `cases` table in Supabase
  (Postgres). The client (`src/app/supabase.ts`) talks to Supabase directly
  from the browser using the anon key — there is no custom backend API.
- **Realtime**: `src/app/volunteer/page.tsx` subscribes to Postgres changes
  on the `cases` table (`supabase.channel(...).on("postgres_changes", ...)`)
  so volunteers see new/updated cases without refreshing.
- **Maps**: Leaflet (`react-leaflet`) is used for all map rendering. Map
  components live under `src/app/components/map/` and are loaded via
  `next/dynamic` with SSR disabled, since Leaflet depends on `window`.
- **Shared types**: a global ambient `Case` interface (and friends) is
  declared in `src/app/interface.ts` and used across the app without an
  explicit import.
- Form inputs perform basic client-side validation; additional schema
  checking is recommended (e.g. with `zod`).
- Authentication state is managed via `src/app/lib/auth.ts` (hook with
  reactive updates).
- Geolocation helpers live in `src/app/lib/location.tsx`.

## Security / RLS

Case assignment and column exposure are currently only enforced on the
client (e.g. `activeCases.tsx` only selects/renders non-sensitive columns
for the public homepage). **This is not sufficient on its own** — Row Level
Security (RLS) policies must also be enabled and verified in the Supabase
dashboard for the `cases` table, since any client can call the Supabase API
directly with the public anon key.

At minimum, the following policies are recommended:

```sql
alter table public.cases enable row level security;

-- Anyone (including anonymous users) can create a case.
create policy "anon can insert cases"
on public.cases
for insert
to anon, authenticated
with check (true);

-- Anyone can read cases. RLS cannot restrict which *columns* are
-- returned, so the app must keep selecting only non-sensitive columns
-- (id, author, detail, volunteer, ...) on public pages, and a
-- column-restricted view/RPC should be added if untrusted clients ever
-- need to query `cases` outside of the app's own code.
create policy "anyone can read cases"
on public.cases
for select
to anon, authenticated
using (true);

-- Authenticated users may only claim a case (set volunteer) when it is
-- currently unclaimed, or release/keep their own claim.
create policy "volunteers can claim unclaimed cases"
on public.cases
for update
to authenticated
using (volunteer is null or volunteer = auth.uid()::text)
with check (volunteer is null or volunteer = auth.uid()::text);
```

> **Important:** the SQL above is a starting point, not a drop-in
> replacement for a security review. Verify and adjust these policies
> directly in the Supabase dashboard (Database → Policies) against the
> actual `cases` schema, and confirm that `phone` and the precise
> `location` of a case are never exposed to unauthenticated or
> unauthorized clients.
