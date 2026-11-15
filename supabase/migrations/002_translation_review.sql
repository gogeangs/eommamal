-- 엄마말 그림책 — translation reviewers.
-- Run after 001_init.sql: SQL Editor → paste → Run.
-- A reviewer can save corrections and review marks for their own languages only; admins for every language.
-- Saves are merged key by key into the published content pack, so two reviewers never overwrite each other.

create table if not exists public.reviewers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  langs text[] not null default '{}'          -- e.g. '{vi}' or '{ru,uz}'
);
alter table public.reviewers enable row level security;
create policy "see own reviewer row" on public.reviewers for select using (user_id = auth.uid());

-- texts: { key: corrected text, or null to go back to the built-in text }
-- marks: { key: { "s": "ok" | "fixed" | "flag", "note": "...", "by": "...", "at": "..." }, or null to clear }
create or replace function public.save_review(lang text, texts jsonb, marks jsonb)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare p jsonb; now_ts timestamptz := now();
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if lang not in ('ru','mn','vi','uz','zh','en') then raise exception 'unknown language'; end if;
  if not exists (select 1 from admins where user_id = auth.uid())
     and not exists (select 1 from reviewers where user_id = auth.uid() and lang = any(langs)) then
    raise exception 'not a reviewer for %', lang;
  end if;

  insert into content_packs (id, pack) values ('main', '{"version":1,"stories":[],"words":[]}'::jsonb)
  on conflict (id) do nothing;
  select pack into p from content_packs where id = 'main' for update;

  p := jsonb_set(p, '{text}', coalesce(p->'text', '{}'::jsonb));
  p := jsonb_set(p, array['text', lang], jsonb_strip_nulls(coalesce(p->'text'->lang, '{}'::jsonb) || coalesce(texts, '{}'::jsonb)));
  p := jsonb_set(p, '{review}', coalesce(p->'review', '{}'::jsonb));
  p := jsonb_set(p, array['review', lang], jsonb_strip_nulls(coalesce(p->'review'->lang, '{}'::jsonb) || coalesce(marks, '{}'::jsonb)));
  p := jsonb_set(p, '{updated}', to_jsonb(now_ts));

  update content_packs set pack = p, updated_at = now_ts, updated_by = auth.uid() where id = 'main';
  return now_ts;
end $$;

revoke all on function public.save_review(text, jsonb, jsonb) from public, anon;
grant execute on function public.save_review(text, jsonb, jsonb) to authenticated;

-- To add a reviewer (after they have signed in once in the app):
--   insert into public.reviewers (user_id, langs) select id, '{vi}' from auth.users where email = 'reviewer@example.com'
--   on conflict (user_id) do update set langs = excluded.langs;
