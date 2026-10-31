-- OutRent A/B test · one row per participant. Apply once to the Supabase project outrent-abtest.
-- The anon key can only call ab_start and ab_log. It cannot select, insert, update or delete the table or the view.

create table if not exists public.ab_sessions (
  id bigint generated always as identity primary key,
  token text not null unique default gen_random_uuid()::text,
  block_seq bigint,                       -- position in the block scheme; null for forced rows (see ab_start)
  variant text not null check (variant in ('A', 'B')),
  forced boolean not null default false,
  pilot boolean not null default false,
  t0 bigint not null,                     -- epoch ms at the Start tap; every other time is ms since t0
  created_at timestamptz not null default now(),
  viewport_h integer, viewport_w integer, dpr real,
  device text, user_agent text,
  -- hand-over
  page_open bigint,
  link_visible_on_load boolean,
  link_in_view_at_damage boolean,
  scroll_depth jsonb not null default '[]',
  -- photos
  photo_taken jsonb not null default '[]',
  t_damage_visible bigint,
  -- after the photos
  first_tap_after_photos text,
  scroll_up_after_photos boolean not null default false,
  t_report_tap bigint,
  report_taps_before_damage integer not null default 0,
  -- report
  report_opened bigint,
  report_reason text,
  report_photos jsonb,
  report_details_len integer,
  report_sent bigint,
  -- end of the task
  record_saved bigint,
  "order" text not null default 'neither',
  t_end bigint,
  -- questions
  noticed text, seq integer check (seq between 1 and 7), seq_why text, open_text text,
  t_questions_done bigint,
  -- preference
  preference text, preference_why text, preference_left text,
  t_finish bigint,
  -- away time and the full replay
  hidden jsonb not null default '[]',
  events jsonb not null default '[]',
  photo_views integer not null default 0  -- photos opened full size
);

create unique index if not exists ab_sessions_block on public.ab_sessions (pilot, block_seq) where block_seq is not null;

alter table public.ab_sessions enable row level security;
revoke all on public.ab_sessions from public, anon, authenticated;

-- Derived fields, computed here and not by the client. Same rule: no access for the anon key.
drop view if exists public.ab_results;
create view public.ab_results with (security_invoker = true) as
  select s.*,
    s.t_report_tap - s.t_damage_visible as time_to_report_ms,
    s.report_sent is not null as reported,
    greatest(s.t_finish, s.t_questions_done, s.t_end, (select max((e ->> 't')::bigint) from jsonb_array_elements(s.events) e)) as duration_ms
  from public.ab_sessions s;
revoke all on public.ab_results from public, anon, authenticated;

-- Appends what is not there yet, so a retried write cannot add an event twice.
create or replace function public.ab_merge(old jsonb, incoming jsonb) returns jsonb
language sql immutable set search_path = '' as $$
  select old || coalesce((
    select jsonb_agg(e) from jsonb_array_elements(coalesce(incoming, '[]'::jsonb)) e
    where not old @> jsonb_build_array(e)
  ), '[]'::jsonb)
$$;
revoke all on function public.ab_merge(jsonb, jsonb) from public, anon, authenticated;

-- Creates the row and assigns the version in one transaction.
-- Blocks of two: the odd place in the block scheme is a coin flip, the even place is the opposite of the place before.
-- The place is block_seq and not id, so a forced row never takes a place (it is outside the scheme, and id still counts
-- it). Pilot rows have a scheme of their own, so dropping them cannot leave a real participant without a partner.
-- With no forced or pilot rows, block_seq = id and this is exactly "odd id / even id".
create or replace function public.ab_start(
  p_t0 bigint,
  p_forced text default null,
  p_pilot boolean default false,
  p_viewport_h integer default null,
  p_viewport_w integer default null,
  p_dpr real default null,
  p_device text default null,
  p_user_agent text default null
) returns table (id bigint, variant text, token text)
language plpgsql security definer set search_path = '' as $$
declare
  v_forced text := case upper(coalesce(p_forced, '')) when 'A' then 'A' when 'B' then 'B' end;
  v_seq bigint;
  v_prev text;
  v_variant text;
begin
  if v_forced is not null then
    v_variant := v_forced;
  else
    perform pg_advisory_xact_lock(hashtext('ab_sessions_block'));
    select coalesce(max(s.block_seq), 0) + 1 into v_seq from public.ab_sessions s where s.pilot = coalesce(p_pilot, false);
    if v_seq % 2 = 0 then
      select s.variant into v_prev from public.ab_sessions s where s.pilot = coalesce(p_pilot, false) and s.block_seq = v_seq - 1;
    end if;
    v_variant := case v_prev when 'A' then 'B' when 'B' then 'A' else (case when random() < 0.5 then 'A' else 'B' end) end;
  end if;
  return query
    insert into public.ab_sessions as s (block_seq, variant, forced, pilot, t0, viewport_h, viewport_w, dpr, device, user_agent)
    values (v_seq, v_variant, v_forced is not null, coalesce(p_pilot, false), p_t0, p_viewport_h, p_viewport_w, p_dpr, left(p_device, 80), left(p_user_agent, 400))
    returning s.id, s.variant, s.token;
end
$$;

-- Appends events and sets fields, only on the row that owns the token.
-- The patch: { set: { field: value }, events: [], scroll_depth: [], photo_taken: [], hidden: [] }.
-- Moments that are measured once keep their first value, so a reload or a retry cannot move them.
create or replace function public.ab_log(p_token text, p_patch jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare
  f jsonb := coalesce(p_patch -> 'set', '{}'::jsonb);
begin
  if octet_length(p_patch::text) > 200000 then raise exception 'patch too large' using errcode = '22023'; end if;
  update public.ab_sessions s set
    page_open = coalesce(s.page_open, (f ->> 'page_open')::bigint),
    link_visible_on_load = coalesce(s.link_visible_on_load, (f ->> 'link_visible_on_load')::boolean),
    link_in_view_at_damage = coalesce(s.link_in_view_at_damage, (f ->> 'link_in_view_at_damage')::boolean),
    t_damage_visible = coalesce(s.t_damage_visible, (f ->> 't_damage_visible')::bigint),
    first_tap_after_photos = coalesce(s.first_tap_after_photos, left(f ->> 'first_tap_after_photos', 40)),
    scroll_up_after_photos = s.scroll_up_after_photos or coalesce((f ->> 'scroll_up_after_photos')::boolean, false),
    t_report_tap = coalesce(s.t_report_tap, (f ->> 't_report_tap')::bigint),
    report_taps_before_damage = greatest(s.report_taps_before_damage, coalesce((f ->> 'report_taps_before_damage')::integer, 0)),
    photo_views = greatest(s.photo_views, coalesce((f ->> 'photo_views')::integer, 0)),
    report_opened = coalesce(s.report_opened, (f ->> 'report_opened')::bigint),
    report_reason = coalesce(left(f ->> 'report_reason', 40), s.report_reason),
    report_photos = coalesce(f -> 'report_photos', s.report_photos),
    report_details_len = coalesce((f ->> 'report_details_len')::integer, s.report_details_len),
    report_sent = coalesce(s.report_sent, (f ->> 'report_sent')::bigint),
    record_saved = coalesce(s.record_saved, (f ->> 'record_saved')::bigint),
    "order" = coalesce(left(f ->> 'order', 40), s."order"),
    t_end = coalesce(s.t_end, (f ->> 't_end')::bigint),
    noticed = coalesce(left(f ->> 'noticed', 20), s.noticed),
    seq = coalesce((f ->> 'seq')::integer, s.seq),
    seq_why = coalesce(left(f ->> 'seq_why', 4000), s.seq_why),
    open_text = coalesce(left(f ->> 'open_text', 4000), s.open_text),
    t_questions_done = coalesce(s.t_questions_done, (f ->> 't_questions_done')::bigint),
    preference = coalesce(left(f ->> 'preference', 2), s.preference),
    preference_why = coalesce(left(f ->> 'preference_why', 4000), s.preference_why),
    preference_left = coalesce(s.preference_left, left(f ->> 'preference_left', 2)),
    t_finish = coalesce(s.t_finish, (f ->> 't_finish')::bigint),
    scroll_depth = public.ab_merge(s.scroll_depth, p_patch -> 'scroll_depth'),
    photo_taken = public.ab_merge(s.photo_taken, p_patch -> 'photo_taken'),
    hidden = public.ab_merge(s.hidden, p_patch -> 'hidden'),
    events = public.ab_merge(s.events, p_patch -> 'events')
  where s.token = p_token;
end
$$;

revoke all on function public.ab_start(bigint, text, boolean, integer, integer, real, text, text) from public, anon, authenticated;
revoke all on function public.ab_log(text, jsonb) from public, anon, authenticated;
grant execute on function public.ab_start(bigint, text, boolean, integer, integer, real, text, text) to anon;
grant execute on function public.ab_log(text, jsonb) to anon;
