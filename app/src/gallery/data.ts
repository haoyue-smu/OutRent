import tokensCss from '@design/tokens.css?raw'
import componentsCss from '@design/components.css?raw'
import iconsSvg from '@design/icons.svg?raw'

// The design library reads the app itself, so it cannot drift: every token from tokens.css, where each one is used
// from the source of every page, contrast computed from the real values. What a person must say (a colour's role,
// a motion's reason, the wording rules) is written here; a new colour with no role shows up as "Not filed yet".

const sources = import.meta.glob(['../pages/**/*.css', '../pages/**/*.tsx', '../shell/*.tsx', '../shell/*.css'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const pageOf = (path: string) => { const m = path.match(/pages\/(\d\d)-/); return m ? m[1] : 'shell' }
export const SOURCES: { where: string; text: string }[] = [
  ...Object.entries(sources).map(([p, text]) => ({ where: pageOf(p), text })),
  { where: 'shared', text: componentsCss },
]
const order = (a: string, b: string) => (a === b ? 0 : /\d/.test(a[0]) && /\d/.test(b[0]) ? a.localeCompare(b) : /\d/.test(a[0]) ? -1 : 1)
export const usedIn = (needle: string | RegExp) => [...new Set(SOURCES.filter((s) => (typeof needle === 'string' ? s.text.includes(needle) : needle.test(s.text))).map((s) => s.where))].sort(order)

// ---------- tokens ----------
export const TOKENS: Record<string, string> = {}
for (const m of tokensCss.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) if (!(m[1] in TOKENS)) TOKENS[m[1]] = m[2].trim()
const tokenUse = (name: string) => usedIn(new RegExp(`var\\(${name}[,)]`))
// a token other tokens are built from (a shadow on --forest, say) counts as used through them
const viaTokens = (name: string) => Object.entries(TOKENS).filter(([n, v]) => n !== name && v.includes(`var(${name})`) && tokenUse(n).length).map(([n]) => n)

// ---------- contrast ----------
export type RGBA = [number, number, number, number]
const parse = (v: string): RGBA | null => {
  const r = v.trim().match(/^var\((--[a-z0-9-]+)\)$/)
  if (r) return parse(TOKENS[r[1]] ?? '')
  const h = v.match(/^#([0-9a-fA-F]{6})$/)
  if (h) return [parseInt(h[1].slice(0, 2), 16), parseInt(h[1].slice(2, 4), 16), parseInt(h[1].slice(4, 6), 16), 1]
  const m = v.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/)
  return m ? [+m[1], +m[2], +m[3], m[4] ? +m[4] : 1] : null
}
const over = (f: RGBA, b: RGBA): RGBA => [f[0] * f[3] + b[0] * (1 - f[3]), f[1] * f[3] + b[1] * (1 - f[3]), f[2] * f[3] + b[2] * (1 - f[3]), 1]
const lum = (c: RGBA) => { const f = (v: number) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]) }
const ratioOf = (a: RGBA, b: RGBA) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
export function contrast(fg: string, bg: string, under = '--paper'): number | null {
  const u = parse(TOKENS[under] ?? under), f = parse(TOKENS[fg] ?? fg), b0 = parse(TOKENS[bg] ?? bg)
  if (!u || !f || !b0) return null
  const b = b0[3] < 1 ? over(b0, u) : b0
  return ratioOf(f[3] < 1 ? over(f, b) : f, b)
}

// ---------- colour, by role ----------
export type Role = 'Main' | 'Neutral' | 'Accent' | 'Feedback'
type Filed = { role: Role; use: string }
export const GROUPS: { title: string; note: string; names: Record<string, Filed> }[] = [
  { title: 'The two main colours', note: 'One dominant pair: paper for the ground, forest for the one thing to do next and for good news. Everything else is a neutral or an accent to these.', names: {
    '--paper': { role: 'Main', use: 'The ground of every page, the dock' },
    '--forest': { role: 'Main', use: 'Primary buttons, selected states, good news, routes, done marks' },
  } },
  { title: 'Neutrals', note: 'Ink for what you read, white for one object that must read as one, hairlines instead of boxes.', names: {
    '--ink': { role: 'Neutral', use: 'Headings, values, rules that measure' },
    '--ink-2': { role: 'Neutral', use: 'Second-level text, disabled button text' },
    '--ink-3': { role: 'Neutral', use: 'Small labels and captions' },
    '--sheet': { role: 'Neutral', use: 'White cards and sheets' },
    '--white': { role: 'Neutral', use: 'Text and marks on forest' },
    '--tick': { role: 'Neutral', use: 'Scale ticks' },
    '--rule': { role: 'Neutral', use: 'Hairlines, card edges, disabled button ground' },
    '--rule-2': { role: 'Neutral', use: 'The lightest hairlines inside a card' },
    '--bar-2': { role: 'Neutral', use: 'The second segment of the measured price bar' },
    '--desk': { role: 'Neutral', use: 'The plain page around the phone on a computer' },
    '--tabbar-bg': { role: 'Neutral', use: 'The tab bar, over the page' },
    '--scrim-sheet': { role: 'Neutral', use: 'The scrim behind every sheet' },
  } },
  { title: 'Accents', note: 'Three families, always with a shape or a word as well: tints of forest for a part being set or a done step; white at set strengths, so text on forest keeps AA; and the kraft of the job tag a bike shop hangs on a bike (08, 13), which appears nowhere else.', names: {
    '--forest-2': { role: 'Accent', use: 'The stamp and the deposit figure as they settle' },
    '--mint': { role: 'Accent', use: 'A part being set on the bike, selected chips, confirmation panels' },
    '--mint-2': { role: 'Accent', use: 'A row just pointed at (02)' },
    '--glow': { role: 'Accent', use: 'Done steps on 03, the tick on a photo caption, the first date on the 12 offer' },
    '--forest-halo': { role: 'Accent', use: 'The halo round the current step' },
    '--on-forest-dot': { role: 'Accent', use: 'The notification dot on the forest band' },
    '--on-forest-ink': { role: 'Accent', use: 'The greeting line on the band' },
    '--on-forest-label': { role: 'Accent', use: 'Mono labels on the band, the struck-out price on 12' },
    '--on-forest-sub': { role: 'Accent', use: 'The second line of the signed-up tab (02)' },
    '--on-forest-body': { role: 'Accent', use: 'Running text of the 12 offer' },
    '--on-forest-k': { role: 'Accent', use: 'Labels on the 17 booked card and the 12 offer' },
    '--on-forest-dt': { role: 'Accent', use: 'Row labels on the 17 booked card' },
    '--on-forest-fill': { role: 'Accent', use: 'The bell button on the band' },
    '--on-forest-line': { role: 'Accent', use: 'Its edge' },
    '--on-forest-rule': { role: 'Accent', use: 'Hairlines on the 17 booked card' },
    '--on-forest-ghost': { role: 'Accent', use: 'The ghost button’s line on the 12 offer' },
    '--signed-bg': { role: 'Accent', use: 'The “Signed up” pill on the post photo' },
    '--tag-paper': { role: 'Accent', use: 'The tag' },
    '--tag-paper-1': { role: 'Accent', use: 'The weekly tags, one week back (13)' },
    '--tag-paper-2': { role: 'Accent', use: 'Two weeks back' },
    '--tag-paper-3': { role: 'Accent', use: 'Three weeks back' },
    '--tag-ink': { role: 'Accent', use: 'Text on the tag' },
    '--tag-ink-2': { role: 'Accent', use: 'Second-level text on the tag' },
    '--tag-label': { role: 'Accent', use: 'Mono labels on the tag' },
    '--tag-rule': { role: 'Accent', use: 'Hairlines on the tag' },
    '--tag-ring': { role: 'Accent', use: 'The metal ring of its hole' },
    '--tag-string': { role: 'Accent', use: 'Its string and the ring on 13' },
    '--tag-grain': { role: 'Accent', use: 'The paper’s grain' },
  } },
  { title: 'Feedback', note: 'Good news is forest, with its word and mark. Waiting uses the progress bar in the button.', names: {
    '--on-cta-bar': { role: 'Feedback', use: 'The progress bar inside the Pay button (07)' },
    '--banner-bg': { role: 'Feedback', use: 'The phone’s notification banner (08)' },
  } },
]
const FILED = new Set(GROUPS.flatMap((g) => Object.keys(g.names)))
const isColour = (v: string) => /^(#|rgba?\(|linear-gradient|repeating-linear-gradient)/.test(v) && !/^0 /.test(v)
export type Row = { name: string; value: string; filed?: Filed; where: string[]; via: string[] }
const row = (name: string, filed?: Filed): Row => ({ name, value: TOKENS[name] ?? '', filed, where: tokenUse(name), via: viaTokens(name) })
export const colourGroups = GROUPS.map((g) => ({ ...g, rows: Object.entries(g.names).map(([n, f]) => row(n, f)).filter((r) => r.value) }))
// Not the UI palette: colours drawn into photos, maps and illustrations, and the older pages' names.
const NOT_UI = /^--(sage|sage-dark|sage-tint|muted|line|mist|clay|clay-dark|clay-tint|backdrop|glass-bg|glass-border|scrim|scene-\d|photo-.*|deep|ad-shade|on-photo-.*|flap-line|sheet-below|fade-sheet|todo-\d|map.*|rain|pill18-bg|fig-.*|split-rest|dial-win|box-face|error.*)$/
// A UI colour token nobody filed: the page shows it in plain sight.
export const unfiled = Object.keys(TOKENS).filter((n) => isColour(TOKENS[n]) && !FILED.has(n) && !NOT_UI.test(n) && !n.startsWith('--shadow')).map((n) => row(n))

// Every text colour on the grounds it sits on in the app. The colour tables read their contrast from here.
export const PAIRS: { fg: string; bg: string; on: string; under?: string }[] = [
  { fg: '--ink', bg: '--paper', on: 'paper' },
  { fg: '--ink', bg: '--sheet', on: 'white' },
  { fg: '--ink', bg: '--banner-bg', on: 'the banner' },
  { fg: '--ink-2', bg: '--paper', on: 'paper' },
  { fg: '--ink-2', bg: '--sheet', on: 'white' },
  { fg: '--ink-2', bg: '--rule', on: 'a disabled button' },
  { fg: '--ink-2', bg: '--rule-2', on: 'the disabled Pay button' },
  { fg: '--ink-3', bg: '--paper', on: 'paper' },
  { fg: '--ink-3', bg: '--sheet', on: 'white' },
  { fg: '--forest', bg: '--paper', on: 'paper' },
  { fg: '--forest', bg: '--sheet', on: 'white' },
  { fg: '--forest', bg: '--mint', on: 'mint' },
  { fg: '--forest', bg: '--mint-2', on: 'pale mint' },
  { fg: '--forest', bg: '--tag-paper', on: 'the tag' },
  { fg: '--white', bg: '--forest', on: 'forest' },
  { fg: '--white', bg: '--signed-bg', on: 'the Signed up pill', under: '--photo-bg' },
  { fg: '--on-forest-ink', bg: '--forest', on: 'forest' },
  { fg: '--on-forest-label', bg: '--forest', on: 'forest' },
  { fg: '--on-forest-sub', bg: '--forest', on: 'forest' },
  { fg: '--on-forest-body', bg: '--forest', on: 'forest' },
  { fg: '--on-forest-k', bg: '--forest', on: 'forest' },
  { fg: '--on-forest-dt', bg: '--forest', on: 'forest' },
  { fg: '--tag-ink', bg: '--tag-paper', on: 'the tag' },
  { fg: '--tag-ink-2', bg: '--tag-paper', on: 'the tag' },
  { fg: '--tag-ink-2', bg: '--tag-paper-3', on: 'the oldest tag' },
  { fg: '--tag-label', bg: '--tag-paper', on: 'the tag' },
]

// ---------- what the CSS really uses ----------
const cssOnly = SOURCES.filter((s) => s.where === 'shared' || /\{[^}]*:[^}]*\}/.test(s.text))
function scan(prop: RegExp) {
  const out = new Map<string, Set<string>>()
  for (const s of cssOnly) for (const m of s.text.matchAll(prop)) {
    const v = m[1].trim()
    if (/[{}<>'"`$]/.test(v)) continue
    if (!out.has(v)) out.set(v, new Set())
    out.get(v)!.add(s.where)
  }
  return [...out.entries()].map(([value, w]) => ({ value, where: [...w].sort(order) }))
}
const px = (v: string) => { const m = v.match(/var\((--[a-z0-9-]+)\)/); const t = m ? TOKENS[m[1]] ?? '' : v; return parseFloat(t) || 0 }
export const RADII = scan(/border-radius:\s*([^;}]+)[;}]/g).filter((r) => !r.value.includes(' ')).sort((a, b) => px(a.value) - px(b.value))
export const SHADOWS = Object.keys(TOKENS).filter((n) => n.startsWith('--shadow')).map((n) => row(n)).filter((r) => r.where.length || r.via.length)
export const SPACES = ['--s-1', '--s-2', '--s-3', '--s-4', '--s-5', '--s-6', '--s-8', '--s-10'].map((n) => ({ name: n, value: TOKENS[n] }))
export const RADIUS_USE: Record<string, string> = {
  '--r-bar': 'The measured price bar', '--r-tick': 'Small photo captions', '--r-chip': 'The price cut, small flags', '--r-thumb': 'Thumbnails in a drawer',
  '--r-inset': 'A photo inside a card (04)', '--r-lens': 'The marks’ lenses, option cards', '--r-tile': 'Rows, the fit block, promos', '--r-sheet-s': 'Result, post and docket cards',
  '--r-card': 'Booking and record cards', '--r-sheet': 'Sheets and drawers', '--r-pill': 'Buttons, chips, rings, dots', '--r-phone': 'The iPhone frame on a computer',
}
export const SHADOW_USE: Record<string, string> = {
  '--shadow-sheet': 'A white row resting on paper', '--shadow-card': 'A result you can pick up (04), the post (02)', '--shadow-lift': 'The docket on the forest band', '--shadow-photo-card': 'A booking or photo card (09, 14)',
  '--shadow-record': 'The hand-over record (11), the intake record (15)', '--shadow-drawer': 'The 07 drawer over the photo', '--shadow-drawer-soft': 'The 10 and 18 drawers over the map', '--shadow-vsheet': 'The 02 drawer over the post',
  '--shadow-sheetx': 'Sheets over a page', '--shadow-cta': 'The Pay button floating over the 07 sheet', '--shadow-tag': 'The job tag on its string (08)', '--shadow-tag-front': 'The front weekly tag (13)', '--shadow-tag-hole': 'The tag’s ring',
  '--shadow-banner': 'The notification banner', '--shadow-ring': 'White rings on photos', '--shadow-ring-strong': 'The marks on the hand-over photos', '--shadow-photo-edge': 'The overlapping photos in the slip (11)',
  '--shadow-spot': 'The “Meet here” point on a photo (06)', '--shadow-tag6': 'The “Meet here” pin', '--shadow-off': 'The −10% price cut (01)', '--shadow-kb-need': 'The “+” on a thumbnail (02)', '--shadow-now': 'The current step on a progress line',
  '--shadow-pill': 'The weather pill (18)', '--shadow-phone': 'The iPhone frame on a computer',
}

// ---------- icons ----------
export const ICON_IDS = [...iconsSvg.matchAll(/id="i-([a-z0-9-]+)"/g)].map((m) => m[1])
const tsx = SOURCES.filter((s) => !s.text.includes('{ ') || true)
export const iconUse = (id: string) => [...new Set(tsx.filter((s) => new RegExp(`['"\`]${id}['"\`]`).test(s.text)).map((s) => s.where))].sort(order)

export const lineUse = (id: string) => [...new Set(SOURCES.filter((s) => new RegExp(`LineIcon[^>]*name=["'{]*${id}[^a-z-]`).test(s.text)).map((s) => s.where))].sort(order)

// ---------- motion ----------
export const MOTION: { what: string; where: string; how: string; why: string; still: string }[] = [
  { what: 'Page change', where: 'Every step, Back, tabs', how: 'Push 500 ms · expo.out; Back 420 ms · power3.out; tabs cross-fade 350 ms', why: 'Space: deeper, returning, or the same level', still: 'Appears at once' },
  { what: 'Sheet', where: 'Change, Pay with, Add an item', how: '450 ms · slides up with the scrim', why: 'State: a choice over the page', still: 'Appears at once' },
  { what: 'Time skip', where: '08 → 09, 09 → 10, 11 → 12, 17 → 15', how: '2.2 s · power2.inOut · the clock runs, days marked', why: 'Explains the days that pass in the story', still: 'Skipped; the next page opens' },
  { what: 'Done mark', where: '08, 11, 13, 15, 17', how: '350 ms to 1.6 s, one per page: stamp, slip, ring, dot, token', why: 'Feedback: this page’s job is finished', still: 'The mark in place' },
  { what: 'Fit set-up', where: '03', how: 'Camera 850 ms · power2.inOut; key, dial and post 400–1300 ms; saddle on a spring', why: 'Explains what each number changes on the bike', still: 'Each step shows its end state' },
]

// ---------- writing ----------
export const WRITING: { rule: string; yes: string; no: string }[] = [
  { rule: 'No “we”. The app does not speak as a person; only a person speaks as one.', yes: 'Timah Cycles now has your job tag.', no: 'We’ve passed your details to the shop!' },
  { rule: 'Labels over sentences.', yes: 'Pay with · PayNow', no: 'You have chosen to pay using PayNow.' },
  { rule: 'Say when it happens.', yes: 'Released after the return check on 25 Oct.', no: 'Your deposit will be returned soon.' },
  { rule: 'Money says what it is.', yes: 'S$50 today, all in · S$150 deposit, held on Visa ···4821', no: 'Total: S$200' },
  { rule: 'One date form: short date, middle dot, time, no leading zero. A date alone may keep its weekday.', yes: '25 Oct · 7:40 · Sat 25 Oct', no: '25/10 07:40 · Saturday, October 25th' },
  { rule: 'A button says what it does next, and a disabled one says what is missing.', yes: 'Pick a delivery time → See the fees', no: 'Continue' },
  { rule: 'Numbers carry their unit.', yes: 'S$38 / day · 72 cm', no: '38 · 72' },
  { rule: 'What is not built says so plainly.', yes: 'Profile is not in this demo yet.', no: 'Coming soon!' },
]
