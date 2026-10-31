-- OutRent A/B test · UPDATE 7: the new questions. Paste once into the Supabase SQL editor of outrent-abtest, BEFORE any real participant.
-- Until it runs, ab_log ignores these fields: the picked answers survive only in the events, and the typed find_where is lost.
-- It also does migration-2's work if that was never pasted, so it is safe to run either way.

alter table public.ab_sessions
  add column if not exists photo_views integer not null default 0,
  add column if not exists find_ease integer check (find_ease between 1 and 7),
  add column if not exists find_not_looked boolean,
  add column if not exists find_where text,
  add column if not exists cycling text,
  add column if not exists rented_before text,
  add column if not exists age_band text,
  add column if not exists t_q1_done bigint,
  add column if not exists t_q2_done bigint,
  add column if not exists t_q3_done bigint,
  add column if not exists t_q4_done bigint,
  add column if not exists t_q5_done bigint;

-- ab_results lists the table's columns as they were when it was made, so it has to be made again to show the new ones.
drop view if exists public.ab_results;
create view public.ab_results with (security_invoker = true) as
  select s.*,
    s.t_report_tap - s.t_damage_visible as time_to_report_ms,
    s.report_sent is not null as reported,
    greatest(s.t_finish, s.t_questions_done, s.t_end, (select max((e ->> 't')::bigint) from jsonb_array_elements(s.events) e)) as duration_ms
  from public.ab_sessions s;
revoke all on public.ab_results from public, anon, authenticated;

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
    -- "I didn't look for it" clears a tile picked first, so a null in the patch counts here.
    find_ease = case when f ? 'find_ease' then (f ->> 'find_ease')::integer else s.find_ease end,
    find_not_looked = coalesce((f ->> 'find_not_looked')::boolean, s.find_not_looked),
    find_where = coalesce(left(f ->> 'find_where', 4000), s.find_where),
    cycling = coalesce(left(f ->> 'cycling', 40), s.cycling),
    rented_before = coalesce(left(f ->> 'rented_before', 20), s.rented_before),
    age_band = coalesce(left(f ->> 'age_band', 40), s.age_band),
    t_q1_done = coalesce(s.t_q1_done, (f ->> 't_q1_done')::bigint),
    t_q2_done = coalesce(s.t_q2_done, (f ->> 't_q2_done')::bigint),
    t_q3_done = coalesce(s.t_q3_done, (f ->> 't_q3_done')::bigint),
    t_q4_done = coalesce(s.t_q4_done, (f ->> 't_q4_done')::bigint),
    t_q5_done = coalesce(s.t_q5_done, (f ->> 't_q5_done')::bigint),
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

revoke all on function public.ab_log(text, jsonb) from public, anon, authenticated;
grant execute on function public.ab_log(text, jsonb) to anon;
