-- SOS "cases" table.
-- Volunteers themselves live in auth.users (see signup/page.tsx); no separate
-- profiles table is needed because the app never queries volunteer profile data.

create table if not exists public.cases (
    id bigint generated always as identity primary key,
    created_at timestamptz not null default now(),
    author text not null,
    phone text not null,
    detail text not null default '',
    location double precision[] not null,
    medical_emergency boolean not null default false,
    volunteer uuid references auth.users (id) on delete set null,
    completed boolean not null default false,
    constraint cases_location_is_lat_lng_pair check (array_length(location, 1) = 2)
);

create index if not exists cases_completed_idx on public.cases (completed);
create index if not exists cases_volunteer_idx on public.cases (volunteer);

-- Sanity-bound the free-text/anonymous input from src/app/newcase/page.tsx. These limits
-- exist to stop abuse (giant payloads, garbage coordinates) — not to be a strict validator,
-- since rejecting a genuine distress report is far worse than admitting a junk row. `detail`
-- intentionally allows zero length: the "Details" field on the report form is optional
-- (required={false}) and is submitted as "" when left blank, so a minimum length there would
-- reject legitimate emergency reports outright.
do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'cases_author_length' and conrelid = 'public.cases'::regclass
    ) then
        alter table public.cases
            add constraint cases_author_length check (char_length(author) between 1 and 100);
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'cases_detail_length' and conrelid = 'public.cases'::regclass
    ) then
        alter table public.cases
            add constraint cases_detail_length check (char_length(detail) between 0 and 1000);
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'cases_phone_format' and conrelid = 'public.cases'::regclass
    ) then
        -- Permissive international-ish phone shape: digits, optional leading +, spaces,
        -- parens and hyphens, 7-20 characters. Not a strict E.164 validator on purpose.
        alter table public.cases
            add constraint cases_phone_format check (phone ~ '^\+?[0-9 ()\-]{7,20}$');
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'cases_location_within_range' and conrelid = 'public.cases'::regclass
    ) then
        alter table public.cases
            add constraint cases_location_within_range check (
                location[1] between -90 and 90 and location[2] between -180 and 180
            );
    end if;
end $$;

alter table public.cases enable row level security;

-- Start from nothing: Supabase grants broad default privileges to anon/authenticated
-- on new tables, and this table needs tighter, column-level control.
revoke all on public.cases from anon, authenticated;

-- Anyone can report a new case (src/app/newcase/page.tsx has no auth check), but only
-- via these columns, and it can't arrive pre-assigned or pre-completed.
drop policy if exists "anyone can create a case" on public.cases;
create policy "anyone can create a case"
on public.cases
for insert
to anon, authenticated
with check (volunteer is null and completed = false);

grant insert (author, phone, detail, location, medical_emergency) on public.cases to anon;
grant insert (author, phone, detail, location, medical_emergency) on public.cases to authenticated;

-- Anonymous clients must NOT get any row-level SELECT access on the base table at all.
-- Supabase Realtime's `postgres_changes` authorization is driven entirely by row-level
-- policies and ignores column-level grants, so any anon-visible SELECT policy here -
-- however narrow the granted columns - would let an anon realtime subscriber receive
-- full rows (including phone and exact GPS location) for every matching change. The
-- public, unauthenticated home feed (src/app/components/home/activeCases.tsx) is instead
-- served from the `public.cases_public` view below, which never touches base-table RLS
-- for anon and can't be subscribed to via postgres_changes (only base tables publish).
drop policy if exists "public can view open case status" on public.cases;

-- Authenticated volunteers can see full details for open cases, plus their own
-- cases regardless of status (src/app/volunteer/page.tsx).
drop policy if exists "volunteers can view open or own cases" on public.cases;
create policy "volunteers can view open or own cases"
on public.cases
for select
to authenticated
using (completed = false or volunteer = auth.uid());

grant select on public.cases to authenticated;

-- Splitting "claim" from "complete/withdraw" closes a hole where the combined policy's
-- USING clause (volunteer is null or volunteer = auth.uid()) let ANY authenticated user
-- update an unassigned row - including setting completed = true on a case they never
-- claimed, silently hiding it from every volunteer's dashboard (.eq("completed", false)).

-- 1) Claiming: only unassigned cases are targetable, and the only allowed resulting state
--    is "now assigned to me, still open" - a claim can never complete a case in the same
--    statement.
drop policy if exists "volunteers can accept, withdraw, or complete cases" on public.cases;
drop policy if exists "authenticated users can claim an unassigned case" on public.cases;
create policy "authenticated users can claim an unassigned case"
on public.cases
for update
to authenticated
using (volunteer is null)
with check (volunteer = auth.uid() and completed = false);

-- 2) Completing/withdrawing: only the volunteer already assigned to a case may change it,
--    and the only allowed resulting states are "still mine" (e.g. marking it completed via
--    src/app/lib/functions.ts `done`) or "unassigned again" (withdrawing via `withdraw`).
--    They can never hand it off to someone else in this policy.
drop policy if exists "volunteers can complete or withdraw from own case" on public.cases;
create policy "volunteers can complete or withdraw from own case"
on public.cases
for update
to authenticated
using (volunteer = auth.uid())
with check (volunteer = auth.uid() or volunteer is null);

grant update (volunteer, completed) on public.cases to authenticated;

-- Powers the live case list on the volunteer dashboard (postgres_changes subscription).
-- Only `authenticated` has any SELECT-eligible row on public.cases (see policies above),
-- so this publication only ever broadcasts changes to authenticated volunteers - anon
-- clients cannot receive postgres_changes events for this table at all.
do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'cases'
    ) then
        alter publication supabase_realtime add table public.cases;
    end if;
end $$;

-- Public, unauthenticated status feed (src/app/components/home/activeCases.tsx). This view
-- is deliberately NOT `security_invoker`: it must keep working for the `anon` role even
-- though `anon` has zero grants/policies on the base table (see above), so it runs with the
-- privileges of its owner (the migration role, which owns `public.cases` and therefore
-- bypasses that table's RLS, the same way any table owner does unless FORCE ROW LEVEL
-- SECURITY is set - which it isn't here). The view itself is the security boundary: it
-- hard-codes both the column allowlist (never phone/location) and the row filter
-- (open cases only), so widening `public.cases` grants later can't accidentally widen this
-- view's output. Views cannot be added to a realtime publication (only base tables can), so
-- this feed is never eligible for postgres_changes regardless.
create or replace view public.cases_public
with (security_barrier = true) as
select id, author, detail, volunteer
from public.cases
where completed = false;

grant select on public.cases_public to anon, authenticated;
