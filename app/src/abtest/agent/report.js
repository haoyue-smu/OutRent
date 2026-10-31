// The numbers behind REPORT.md, from the traces: node src/abtest/agent/report.js pilot-a pilot-b
import fs from 'fs'
const here = (p) => new URL(p, import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const { personas } = JSON.parse(fs.readFileSync(here('./personas/pilot.json'), 'utf8'))
const STOP = new Set(['the', 'this', 'that', 'tap', 'tapping', 'button', 'need', 'will', 'just', 'and', 'for', 'with', 'your', 'you', 'photo', 'now', 'get', 'next'])
const words = (s) => (s ?? '').toLowerCase().match(/[a-z0-9]+/g) ?? []
// Named: the thought shares a word with the control's name. Good enough to sort; the misses are listed for reading by eye.
const named = (e) => {
  const name = words(e.hit?.name)
  if (!name.length) return false
  const t = new Set(words(e.thought))
  return name.some((w) => t.has(w)) && (name.some((w) => t.has(w) && !STOP.has(w)) || name.every((w) => STOP.has(w)))
}
const CHAIN = /chain|hanging|on the (ground|road|floor)|off the|fallen|dangling|loose/i

for (const run of process.argv.slice(2)) {
  const dir = here(`./trace/${run}/`), meta = JSON.parse(fs.readFileSync(`${dir}run.json`, 'utf8'))
  console.log(`\n# ${run} · ${meta.model} · cost $${meta.cost.toFixed(4)}`)
  console.log('| Agent | Var | Viewport | Status | Steps | Injected | Steps to report | Noticed | Sent | Cost |\n|---|---|---|---|---|---|---|---|---|---|')
  let taps = 0, onCtl = 0, nameOk = 0, yes = 0, vision = 0, fields = 0, skipped = 0, mism = 0
  const misses = [], drive = [], texts = [], rows = []
  for (const p of personas) {
    const s = JSON.parse(fs.readFileSync(`${dir}${p.persona_id}.summary.json`, 'utf8'))
    const row = JSON.parse(fs.readFileSync(`${dir}${p.persona_id}.row.json`, 'utf8'))
    const tr = fs.readFileSync(`${dir}${p.persona_id}.jsonl`, 'utf8').trim().split('\n').map((l) => JSON.parse(l))
    rows.push(row)
    let str = '-'
    if (row?.t_damage_visible != null && row?.t_report_tap != null) str = row.events.filter((e) => ['tap', 'scroll'].includes(e.type) && e.t >= row.t_damage_visible && e.t <= row.t_report_tap).length
    console.log(`| ${p.persona_id} | ${s.variant} | ${s.viewport.join('×')} | ${s.status} | ${s.steps} | ${s.injected} | ${str} | ${row?.noticed ?? '-'} | ${row?.report_sent != null ? 'yes' : 'no'} | $${s.cost.toFixed(4)} |`)
    for (const e of tr.filter((x) => x.action?.type === 'tap' && !x.injected)) {
      taps++
      const on = !!e.hit?.control && !e.hit.disabled
      if (on) onCtl++
      const ok = on && named(e)
      if (ok) nameOk++; else misses.push(`${p.persona_id} s${e.step} [${e.screen}] on ${e.hit ? (e.hit.control ?? e.hit.tag) + ': ' + e.hit.name.slice(0, 40) : 'nothing'}${e.hit?.disabled ? ' (disabled)' : ''} — "${e.thought}"`)
    }
    const dv = tr.filter((x) => x.drive_preview && x.thought)
    const sees = dv.some((x) => CHAIN.test(x.thought))
    if (row?.noticed === 'Yes') yes++
    if (row?.noticed === 'Yes' && sees) vision++
    drive.push(`${p.persona_id} (noticed ${row?.noticed ?? '-'}): ${dv.map((x) => `"${x.thought}"`).join(' / ') || 'never reached the preview'}`)
    const typed = { details: row?.report_details_len > 0 ? `(${row.report_details_len} characters, not logged by the site)` : '', find_where: row?.find_where ?? '', preference_why: row?.preference_why ?? '' }
    for (const k of Object.keys(s.skips ?? {})) {
      fields++
      if (!typed[k]) skipped++
      else if (k !== 'details') texts.push(`${p.persona_id} ${k}, note ${s.skips[k] ? 'skip' : 'none'}: "${typed[k]}" (${typed[k].split(/\s+/).length} words)`)
    }
    mism += s.mismatch.length
    for (const m of s.mismatch) console.log(`mismatch ${p.persona_id} ${m.field}: persona ${m.persona}, answered ${m.answered}`)
    if (s.bad_writes.length || s.console_errors.length) console.log(`errors ${p.persona_id}: ${JSON.stringify(s.bad_writes)} ${s.console_errors.slice(0, 2).join(' | ')}`)
  }
  console.log(`\nCheck 1: Yes ${yes}, Yes with the thought ${vision}, of 10`)
  console.log(drive.map((d) => `- ${d}`).join('\n'))
  console.log(`\nCheck 2: ${taps} non-injected taps, on a live control ${onCtl} (${(onCtl / taps * 100).toFixed(1)}%), on the control the thought names ${nameOk} (${(nameOk / taps * 100).toFixed(1)}%), capped ${meta.agents.filter((a) => a.status === 'capped').length}`)
  fs.writeFileSync(`${dir}misses.txt`, misses.join('\n') + '\n')
  console.log(`\nCheck 3: skipped ${skipped} of ${fields} optional fields (${(skipped / fields * 100).toFixed(0)}%), mismatches ${mism}`)
  console.log(texts.map((d) => `- ${d}`).join('\n'))
  const cols = new Set(rows.filter(Boolean).flatMap((r) => Object.keys(r)))
  console.log(`\nCheck 4: columns seen ${[...cols].sort().join(', ')}`)
}
