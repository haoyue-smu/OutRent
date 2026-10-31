// Samples the seven dimensions (spec §4) with a fixed seed, asks the model to write each self-description.
//   node src/abtest/agent/personas.js pilot    writes personas/pilot.json
// MODEL, SEED and an existing file: an existing file is never overwritten, so both runs use the same people.
import fs from 'fs'
import { chat, rng } from './openrouter.js'
import { assertClean, hasForbidden } from './prompt.js'

const RUN = process.argv[2] ?? 'pilot'
const MODEL = process.env.MODEL ?? 'qwen/qwen3-vl-30b-a3b-instruct'
const SEED = +(process.env.SEED ?? 20261101)
const out = new URL(`./personas/${RUN}.json`, import.meta.url)
if (fs.existsSync(out)) throw new Error(`${out.pathname} exists already`)

const draw = (...pairs) => pairs.flatMap(([v, n]) => Array(n).fill(v))
const DIMS = {
  age_band: draw(['18 to 24', 4], ['25 to 34', 4], ['35 to 44', 2]),
  cycling: draw(['Never', 3], ['A few times a year', 4], ['Monthly or more', 3]),
  rented_before: draw(['Yes', 5], ['No', 5]),
  reading: draw(['reads everything, scrolls', 5], ['skims, heads for the main button', 5]),
  deposit: draw(['worried about losing S$150', 6], ['not bothered', 4]),
  time: draw(['ride starts at 8:00, in a hurry', 5], ['relaxed', 5]),
  skip_rate: draw([0.3, 3], [0.5, 4], [0.7, 3]),
}
const R = rng(SEED)
const shuffle = (a) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [x[i], x[j]] = [x[j], x[i]] } return x }
const cols = Object.fromEntries(Object.entries(DIMS).map(([k, v]) => [k, shuffle(v)]))
const HEIGHTS = [667, 780, 844, 852, 896, 932]

const personas = []
let cost = 0
for (let i = 0; i < 10; i++) {
  const p = { persona_id: `p${String(i + 1).padStart(2, '0')}`, seed: SEED + i + 1 }
  for (const k of Object.keys(cols)) p[k] = cols[k][i]
  p.viewport_h = HEIGHTS[Math.floor(R() * HEIGHTS.length)]
  p.variant = i % 2 ? 'b' : 'a'
  const ask = assertClean(`Write a first-person self-description of a person living in Singapore who might rent sports equipment. 120 to 160 words, plain prose, one paragraph, no heading. Include their name (not Daniel), their occupation and their phone habits, and work in these facts:
- age band: ${p.age_band}
- how often they cycle: ${p.cycling}
- rented sports or outdoor gear before: ${p.rented_before}
- on a phone screen: ${p.reading}
- about a S$150 card deposit on a rental: ${p.deposit}
- today: ${p.time}
Do not imitate Singlish. Keep to everyday life: no mention of apps they are testing, research or studies.`, 'persona request')
  for (let tries = 0; tries < 6; tries++) {
    const r = await chat({ model: MODEL, temperature: 0.8, seed: p.seed + tries, messages: [{ role: 'user', content: ask }] })
    cost += r.usage.cost
    const text = r.text.replace(/<think>[\s\S]*?<\/think>/g, '').trim(), words = text.split(/\s+/).length
    if (hasForbidden(text)) continue
    if (!p.text || Math.abs(words - 140) < Math.abs(p.words - 140)) { p.text = text; p.words = words }
    if (words >= 120 && words <= 160) break
  }
  if (!p.text) throw new Error(`No usable text for ${p.persona_id}`)
  personas.push(p)
  console.log(p.persona_id, p.words, 'words')
}
fs.mkdirSync(new URL('./personas/', import.meta.url), { recursive: true })
fs.writeFileSync(out, JSON.stringify({ run: RUN, seed: SEED, model: MODEL, cost, personas }, null, 2) + '\n')
console.log(`cost $${cost.toFixed(5)}`)
