-- 엄마말 그림책 — Supabase schema.
-- Run once in the Supabase dashboard: SQL Editor → paste → Run.
-- Families sign in with an email code. Every table is locked to the signed-in family (row level security).

-- ---------- families (one per guardian account) ----------
create table if not exists public.families (
  id uuid primary key references auth.users (id) on delete cascade,
  first_use date not null default current_date,   -- start of the 30-day free trial
  created_at timestamptz not null default now()
);

-- ---------- children (profiles) and their learning record ----------
create table if not exists public.children (
  family_id uuid not null references public.families (id) on delete cascade,
  id text not null,                                 -- 'p1', 'p…' (same ids as on the device)
  name text not null default '',
  avatar text not null default 'cat',
  position int not null default 0,
  progress jsonb not null default '{}'::jsonb,      -- the app's Progress object
  updated_at timestamptz not null default now(),
  primary key (family_id, id)
);

-- ---------- stories opened per day (free plan: 2 a day, shared by the family's devices) ----------
create table if not exists public.daily_reads (
  family_id uuid not null references public.families (id) on delete cascade,
  day date not null,
  story_ids text[] not null default '{}',
  primary key (family_id, day)
);

-- ---------- subscription state (written only by the server: RevenueCat webhook) ----------
create table if not exists public.subscriptions (
  family_id uuid primary key references public.families (id) on delete cascade,
  active boolean not null default false,
  expires_at timestamptz,
  source text,                                      -- app_store / play_store / code
  updated_at timestamptz not null default now()
);

-- ---------- content admins and the published content pack ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
create table if not exists public.content_packs (
  id text primary key default 'main',
  pack jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

-- ---------- row level security ----------
alter table public.families enable row level security;
alter table public.children enable row level security;
alter table public.daily_reads enable row level security;
alter table public.subscriptions enable row level security;
alter table public.admins enable row level security;
alter table public.content_packs enable row level security;

create policy "own family" on public.families for select using (id = auth.uid());
create policy "own children" on public.children for all using (family_id = auth.uid()) with check (family_id = auth.uid());
create policy "own reads" on public.daily_reads for all using (family_id = auth.uid()) with check (family_id = auth.uid());
create policy "own subscription" on public.subscriptions for select using (family_id = auth.uid());
create policy "see own admin row" on public.admins for select using (user_id = auth.uid());
create policy "anyone reads content" on public.content_packs for select using (true);
create policy "admins write content" on public.content_packs for insert
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
create policy "admins update content" on public.content_packs for update
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- ---------- functions the app calls ----------

-- Creates the family on first sign-in and keeps the EARLIEST trial start seen on any device.
-- A device can only move the start earlier, never later than today, so the trial cannot be extended.
create or replace function public.ensure_family(local_first date)
returns date language plpgsql security definer set search_path = public as $$
declare d date;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into families (id, first_use) values (auth.uid(), least(coalesce(local_first, current_date), current_date))
  on conflict (id) do update set first_use = least(families.first_use, least(coalesce(local_first, current_date), current_date))
  returning first_use into d;
  return d;
end $$;

-- Adds story ids to today's list (union) and returns the full list.
create or replace function public.mark_reads(read_day date, ids text[])
returns text[] language plpgsql security definer set search_path = public as $$
declare r text[];
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into daily_reads (family_id, day, story_ids) values (auth.uid(), read_day, ids)
  on conflict (family_id, day) do update
    set story_ids = (select array(select distinct unnest(daily_reads.story_ids || excluded.story_ids)))
  returning story_ids into r;
  return r;
end $$;

-- Deletes the signed-in guardian's account and everything stored for the family (required by the app stores).
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.ensure_family(date) from public, anon;
revoke all on function public.mark_reads(date, text[]) from public, anon;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.ensure_family(date) to authenticated;
grant execute on function public.mark_reads(date, text[]) to authenticated;
grant execute on function public.delete_my_account() to authenticated;

-- ---------- storage: pictures uploaded from the content admin screen ----------
insert into storage.buckets (id, name, public) values ('content', 'content', true)
on conflict (id) do nothing;
create policy "admins upload content" on storage.objects for insert to authenticated
  with check (bucket_id = 'content' and exists (select 1 from public.admins a where a.user_id = auth.uid()));
create policy "admins replace content" on storage.objects for update to authenticated
  using (bucket_id = 'content' and exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- To make someone a content admin (after they have signed in once):
--   insert into public.admins (user_id) select id from auth.users where email = 'biz@project30s.co.kr';
