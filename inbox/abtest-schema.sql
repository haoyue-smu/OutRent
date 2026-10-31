-- OutRent A/B test · database setup (Supabase project outrent-abtest)
-- One row per participant. The public (anon) key cannot read or change the table directly:
-- the site only calls ab_start() and ab_log(). Results are read with the service role
-- (dashboard, SQL editor or CSV export of the view ab_results).

create extension if not exists pgcrypto;

create table if not exists public.ab_sessions (
  id          bigint generated always as identity primary key,
  token       uuid    not null default gen_random_uuid() unique,
  variant     text    not null check (variant in ('a','b')),
  forced      boolean not null default false,
  pilot       boolean not null default false,
  block_pos   int,              -- position among non-forced rows (0,1,2,…); pairs are (0,1), (2,3), …
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  data        jsonb   not null default '{}'::jsonb,   -- summary fields sent by the site
  events      jsonb   not null default '[]'::jsonb    -- append-only event log
);

alter table public.ab_sessions enable row level security;
-- no policies: anon and authenticated get nothing directly
revoke all on public.ab_sessions from anon, authenticated;

-- ab_start: creates the row and assigns the variant in one transaction.
-- Blocks of two: the first of each pair gets a coin flip, the second the opposite.
-- Forced rows (?v=a / ?v=b) take the forced variant and stay outside the pairs.
create or replace function public.ab_start(p_forced text default null, p_pilot boolean default false, p_data jsonb default '{}'::jsonb)
returns table (id bigint, variant text, token uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_variant text;
  v_pos int;
  v_prev text;
  v_row public.ab_sessions;
begin
  if p_forced is not null and p_forced not in ('a','b') then
    raise exception 'bad forced variant';
  end if;
  if pg_column_size(p_data) > 8192 then
    raise exception 'data too large';
  end if;

  perform pg_advisory_xact_lock(4211);   -- serialise assignment

  if p_forced is not null then
    v_variant := p_forced;
    v_pos := null;
  else
    select count(*) into v_pos from public.ab_sessions s where not s.forced;
    if v_pos % 2 = 0 then
      v_variant := case when random() < 0.5 then 'a' else 'b' end;
    else
      select s.variant into v_prev from public.ab_sessions s
       where not s.forced and s.block_pos = v_pos - 1;
      v_variant := case when v_prev = 'a' then 'b' else 'a' end;
    end if;
  end if;

  insert into public.ab_sessions (variant, forced, pilot, block_pos, data)
  values (v_variant, p_forced is not null, coalesce(p_pilot, false), v_pos,
          coalesce(p_data, '{}'::jsonb) - array['id','token','variant','forced','pilot','block_pos'])
  returning * into v_row;

  return query select v_row.id, v_row.variant, v_row.token;
end;
$$;

-- ab_log: merges summary fields and appends events, only on the row that owns the token.
create or replace function public.ab_log(p_token uuid, p_data jsonb default '{}'::jsonb, p_events jsonb default '[]'::jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if jsonb_typeof(coalesce(p_events, '[]'::jsonb)) <> 'array' then
    raise exception 'events must be an array';
  end if;
  if pg_column_size(p_data) + pg_column_size(p_events) > 65536 then
    raise exception 'payload too large';
  end if;

  update public.ab_sessions s
     set data = s.data || (coalesce(p_data, '{}'::jsonb) - array['id','token','variant','forced','pilot','block_pos']),
         events = case when jsonb_array_length(s.events) < 20000
                       then s.events || coalesce(p_events, '[]'::jsonb) else s.events end,
         updated_at = now()
   where s.token = p_token;

  if not found then
    raise exception 'unknown token';
  end if;
end;
$$;

revoke all on function public.ab_start(text, boolean, jsonb) from public;
revoke all on function public.ab_log(uuid, jsonb, jsonb) from public;
grant execute on function public.ab_start(text, boolean, jsonb) to anon;
grant execute on function public.ab_log(uuid, jsonb, jsonb) to anon;

-- ab_results: one flat row per participant, for analysis and CSV export. Not readable by anon.
create or replace view public.ab_results with (security_invoker = true) as
select
  id, variant, forced, pilot, block_pos, created_at, updated_at,
  (data->>'t0')::bigint                       as t0,
  (data->>'viewport_h')::int                  as viewport_h,
  (data->>'viewport_w')::int                  as viewport_w,
  (data->>'dpr')::numeric                     as dpr,
  data->>'device'                             as device,
  data->>'user_agent'                         as user_agent,
  (data->>'page_open')::int                   as page_open,
  (data->>'link_visible_on_load')::boolean    as link_visible_on_load,
  (data->>'link_in_view_at_damage')::boolean  as link_in_view_at_damage,
  data->'photo_taken'                         as photo_taken,
  (data->>'t_damage_visible')::int            as t_damage_visible,
  data->>'first_tap_after_photos'             as first_tap_after_photos,
  (data->>'scroll_up_after_photos')::boolean  as scroll_up_after_photos,
  (data->>'t_report_tap')::int                as t_report_tap,
  (data->>'report_taps_before_damage')::int   as report_taps_before_damage,
  (data->>'report_opened')::int               as report_opened,
  data->>'report_reason'                      as report_reason,
  data->'report_photos'                       as report_photos,
  (data->>'report_details_len')::int          as report_details_len,
  (data->>'report_sent')::int                 as report_sent,
  (data->>'record_saved')::int                as record_saved,
  data->>'order'                              as action_order,
  (data->>'t_end')::int                       as t_end,
  data->>'noticed'                            as noticed,
  (data->>'seq')::int                         as seq,
  data->>'seq_why'                            as seq_why,
  data->>'open_text'                          as open_text,
  (data->>'t_questions_done')::int            as t_questions_done,
  data->>'preference'                         as preference,
  data->>'preference_why'                     as preference_why,
  data->>'preference_left'                    as preference_left,
  (data->>'t_finish')::int                    as t_finish,
  -- derived
  (data->>'t_report_tap')::int - (data->>'t_damage_visible')::int  as time_to_report_ms,
  (data->>'report_sent') is not null                                as reported,
  coalesce((data->>'t_finish')::int, (data->>'t_end')::int)         as duration_ms,
  (select max((e->'data'->>'away_ms')::int) from jsonb_array_elements(events) e
    where e->>'type' = 'show')                                      as longest_away_ms,
  (select max((e->'data'->>'max_y')::int) from jsonb_array_elements(events) e
    where e->>'type' = 'scroll')                                    as max_scroll_y,
  jsonb_array_length(events)                                        as n_events
from public.ab_sessions;

revoke all on public.ab_results from anon, authenticated;
