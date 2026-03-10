# UAE SOS

This is a Next.js application used for matching users in need with volunteers during emergency situations.

## Setup

1. **Environment variables**
   - `NEXT_PUBLIC_SUPABASE_URL`: your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon key for client
   - Configure Supabase RLS policies so only authenticated volunteers can update `cases` rows.

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development**
   ```bash
   npm run dev
   ```

4. **Lint/build**
   ```bash
   npm run lint
   npm run build
   ```

## Notes

- Form inputs perform basic client-side validation; additional schema checking is recommended (e.g. with `zod`).
- Authentication state is managed via `src/app/lib/auth.ts` (hook with reactive updates).
- Geolocation helpers live in `src/app/lib/location.tsx`.
- Map rendering uses dynamic imports to avoid server-side issues.

