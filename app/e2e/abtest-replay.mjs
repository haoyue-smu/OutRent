// Acceptance 4: rebuilds a session from its row alone.  node app/e2e/abtest-replay.mjs rows.json [id …]
import fs from 'fs'
const rows = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const want = process.argv.slice(3).map(Number)
const s = (ms) => (ms == null ? '-' : (ms / 1000).toFixed(2) + ' s')
for (const r of rows.filter((x) => !want.length || want.includes(Number(x.id)))) {
  const ev = [...r.events].sort((a, b) => a.n - b.n)
  console.log(`\nrow ${r.id} · ${r.variant}${r.forced ? ' (forced)' : ''}${r.pilot ? ' (pilot)' : ''} · ${r.device} · ${r.viewport_w}x${r.viewport_h} @${r.dpr}`)
  const screens = []
  for (const e of ev) if (e.type === 'screen' && screens.at(-1)?.[0] !== e.target) screens.push([e.target, e.t])
  console.log('screens  ' + screens.map(([n, t]) => `${n} ${s(t)}`).join(' > '))
  console.log('photos   ' + r.photo_taken.map((p) => `${p.part} ${s(p.t)}`).join(' > '))
  console.log('taps     ' + ev.filter((e) => e.type === 'tap').map((e) => `${e.target} ${s(e.t)}`).join(' > '))
  console.log(`forms    ${ev.filter((e) => e.type === 'form').map((e) => e.target).join(', ') || '-'}`)
  console.log(`scroll   ${ev.filter((e) => e.type === 'scroll').length} events, max y ${r.scroll_depth.at(-1)?.max ?? 0}, back up after photos: ${r.scroll_up_after_photos}`)
  console.log(`link     visible on load: ${r.link_visible_on_load}, in view at damage: ${r.link_in_view_at_damage}, taps before damage: ${r.report_taps_before_damage}`)
  console.log(`damage   ${s(r.t_damage_visible)}, first report tap ${s(r.t_report_tap)}, time to report ${s(r.time_to_report_ms ?? (r.t_report_tap == null ? null : r.t_report_tap - r.t_damage_visible))}`)
  console.log(`report   opened ${s(r.report_opened)}, sent ${s(r.report_sent)}, reason ${r.report_reason ?? '-'}, photos ${JSON.stringify(r.report_photos)}, details length ${r.report_details_len ?? '-'}`)
  console.log(`end      first tap after photos: ${r.first_tap_after_photos}, order: ${r.order}, saved ${s(r.record_saved)}`)
  console.log(`answers  noticed ${r.noticed}, seq ${r.seq}, why "${r.seq_why ?? ''}", looked "${r.open_text ?? ''}", done ${s(r.t_questions_done)}`)
  console.log(`prefer   ${r.preference}, left was ${r.preference_left}, why "${r.preference_why ?? ''}", finish ${s(r.t_finish)}, hidden ${r.hidden.length} events`)
}
