// node app/e2e/run.mjs [E1 E2 …]  — runs the journeys at 393 × 852 and prints pass / total for each.
import { journey } from './lib.mjs'
import * as J1 from './journeys.mjs'
import * as J2 from './journeys2.mjs'
import * as Reports from './reports.mjs'
const J = { ...J1, ...J2, ...Reports }

const PERSONA = {
  E1: 'Daniel · first rental, default choices', E2: 'Daniel · different choices', E3: 'Beginner from Home',
  E4: 'Careful renter, back and forth', E5: 'Weekly regular', E6: 'Owner of the Giant Escape 3 · door, next-day return', E6b: 'Owner · Rack S, pooled return', E6c: 'Owner · picks another pickup day', E7: 'Chaos', E7r: 'Chaos · reduced motion',
  ER: 'Daniel · cosmetic scratch report and full demo route', ERstates: 'Report seeds, reload and narrow screens', ERr: 'Report flow · reduced motion',
  ERoffset: 'Report history and the 7:20 delivery slot',
  ERshots: 'Report path screenshots at 393 × 852',
  ERalternate: 'Other report reasons receive the general acknowledgement',
}
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PERSONA).filter((k) => J[k] && k !== 'ERshots')
const out = []
for (const k of want) {
  if (!J[k]) { console.log('no journey', k); process.exitCode = 1; continue }
  out.push(await journey(k, PERSONA[k], J[k], { reduced: k === 'E7r' || k === 'ERr' || k === 'ERoffset' }))
}
console.log('\nSUMMARY ' + out.map((o) => `${o.J} ${o.passed}/${o.total}`).join(' · ') + ` = ${out.reduce((a, o) => a + o.passed, 0)}/${out.reduce((a, o) => a + o.total, 0)}`)
for (const o of out) for (const r of o.R.filter((r) => !r.pass)) console.log('FAIL', o.J, r.step, r.action, '| want', r.expected, '| got', r.actual.slice(0, 140))
if (out.some((o) => o.passed !== o.total)) process.exitCode = 1
