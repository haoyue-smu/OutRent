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
export type Role = 'Main' | 'Neutral' | 'Accent' | 'Feedback' | 'Photo overlay' | 'Illustration'
type Filed = { role: Role; use: string; text?: string }   // text: what it is text on, when it is text at all
export const GROUPS: { title: string; note: string; names: Record<string, Filed> }[] = [
  { title: 'The two main colours', note: 'One dominant colour pair: paper for the ground, forest for the one thing to do next and for good news. Everything else is a neutral or an accent to these.', names: {
    '--paper': { role: 'Main', use: 'The ground of every page, the dock', },
    '--forest': { role: 'Main', use: 'Primary buttons, selected states, good news, routes, done marks', text: 'paper, white, mint, the tag' },
  } },
  { title: 'Neutrals', note: 'Ink for what you read, white for one object that must read as one, hairlines instead of boxes.', names: {
    '--ink': { role: 'Neutral', use: 'Headings, values, rules that measure', text: 'paper, white' },
    '--ink-2': { role: 'Neutral', use: 'Second-level text, map labels, disabled button text', text: 'paper, white, rule, the map, the stand-in' },
    '--ink-3': { role: 'Neutral', use: 'Small labels and captions', text: 'paper, white' },
    '--sheet': { role: 'Neutral', use: 'White cards and sheets' },
    '--white': { role: 'Neutral', use: 'Text and marks on forest and on photos', text: 'forest, photo chips' },
    '--tick': { role: 'Neutral', use: 'Scale ticks only, never text' },
    '--rule': { role: 'Neutral', use: 'Hairlines, card edges, disabled button ground' },
    '--rule-2': { role: 'Neutral', use: 'The lightest hairlines inside a card' },
    '--bar-2': { role: 'Neutral', use: 'The second segment of the measured price bar' },
    '--desk': { role: 'Neutral', use: 'The plain page around the phone on a computer' },
    '--tabbar-bg': { role: 'Neutral', use: 'The tab bar, over the page' },
    '--box-face': { role: 'Neutral', use: 'One face of the drawn storage box (15)' },
  } },
  { title: 'Green accents', note: 'Tints of forest. They mark a part being set, a done step or a soft selected state, always with a shape or a word as well.', names: {
    '--forest-2': { role: 'Accent', use: 'The stamp and the deposit figure as they settle' },
    '--mint': { role: 'Accent', use: 'A part being set on the bike, selected chips, confirmation panels' },
    '--mint-2': { role: 'Accent', use: 'A row just pointed at (02)' },
    '--glow': { role: 'Accent', use: 'Done steps on 03, the tick on a photo caption, the first date on the 12 offer' },
    '--forest-halo': { role: 'Accent', use: 'The halo round the current step' },
    '--on-forest-dot': { role: 'Accent', use: 'The notification dot on the forest band' },
  } },
  { title: 'Text and lines on forest', note: 'White at set strengths, so the forest band, the 12 offer and the 17 card keep AA.', names: {
    '--on-forest-ink': { role: 'Neutral', use: 'The greeting line on the band', text: 'forest' },
    '--on-forest-label': { role: 'Neutral', use: 'Mono labels on the band, the struck-out price on 12', text: 'forest' },
    '--on-forest-sub': { role: 'Neutral', use: 'The second line of the signed-up tab (02)', text: 'forest' },
    '--on-forest-body': { role: 'Neutral', use: 'Running text of the 12 offer', text: 'forest' },
    '--on-forest-k': { role: 'Neutral', use: 'Labels on the 17 booked card and the 12 offer', text: 'forest' },
    '--on-forest-dt': { role: 'Neutral', use: 'Row labels on the 17 booked card', text: 'forest' },
    '--on-forest-fill': { role: 'Neutral', use: 'The bell button on the band' },
    '--on-forest-line': { role: 'Neutral', use: 'Its edge' },
    '--on-forest-rule': { role: 'Neutral', use: 'Hairlines on the 17 booked card' },
    '--on-forest-ghost': { role: 'Neutral', use: 'The ghost button’s line on the 12 offer' },
    '--signed-bg': { role: 'Neutral', use: 'The “Signed up” pill on the post photo', },
  } },
  { title: 'The job tag', note: 'One deliberate second accent: the kraft tag a bike shop hangs on a bike (08, 13, the weekly tags). It appears nowhere else.', names: {
    '--tag-paper': { role: 'Accent', use: 'The tag' },
    '--tag-paper-1': { role: 'Accent', use: 'The weekly tags, one week back (13)' },
    '--tag-paper-2': { role: 'Accent', use: 'Two weeks back' },
    '--tag-paper-3': { role: 'Accent', use: 'Three weeks back' },
    '--tag-ink': { role: 'Accent', use: 'Text on the tag', text: 'the tag' },
    '--tag-ink-2': { role: 'Accent', use: 'Second-level text on the tag', text: 'the tag' },
    '--tag-label': { role: 'Accent', use: 'Mono labels on the tag', text: 'the tag' },
    '--tag-rule': { role: 'Accent', use: 'Hairlines on the tag' },
    '--tag-ring': { role: 'Accent', use: 'The metal ring of its hole' },
    '--tag-string': { role: 'Accent', use: 'Its string and the ring on 13' },
    '--tag-grain': { role: 'Accent', use: 'The paper’s grain' },
  } },
  { title: 'Feedback', note: 'Good news is forest, with its word and mark. Waiting uses the progress bar in the button. No error state is drawn on the demo route, so the error colours are defined but not in use.', names: {
    '--on-cta-bar': { role: 'Feedback', use: 'The progress bar inside the Pay button (07)' },
    '--banner-bg': { role: 'Feedback', use: 'The phone’s notification banner (08)' },
    '--error': { role: 'Feedback', use: 'Reserved for true errors', text: 'paper' },
    '--error-tint': { role: 'Feedback', use: 'Reserved, behind an error message' },
  } },
  { title: 'Photo overlays', note: 'Photos are evidence, never wallpaper. These keep a label or a button readable on one, and fill the frame while a photo loads.', names: {
    '--photo-ink': { role: 'Photo overlay', use: 'Behind a result photo while it loads' },
    '--photo-bg': { role: 'Photo overlay', use: 'Behind a page-top photo while it loads' },
    '--deep': { role: 'Photo overlay', use: 'Behind the 07 bike photo' },
    '--photo-shade': { role: 'Photo overlay', use: 'Under a caption at the foot of a photo (15, 16)' },
    '--photo-dim': { role: 'Photo overlay', use: 'Over the 07 bike photo' },
    '--ad-shade': { role: 'Photo overlay', use: 'Under the 12 offer photo' },
    '--scrim-sheet': { role: 'Photo overlay', use: 'The scrim behind every sheet' },
    '--on-photo-bg': { role: 'Photo overlay', use: 'The frosted back button' },
    '--on-photo-border': { role: 'Photo overlay', use: 'Its edge' },
    '--on-photo-ink': { role: 'Photo overlay', use: 'Captions on a photo', text: 'photos' },
    '--on-photo-hint': { role: 'Photo overlay', use: '“Swipe up to review” on 07', text: 'photos' },
    '--on-photo-label': { role: 'Photo overlay', use: 'The dark label beside a circled mark (05)' },
    '--on-photo-chip': { role: 'Photo overlay', use: 'The dark-glass status caption (04)' },
    '--on-photo-dim': { role: 'Photo overlay', use: 'Its quieter text (“No set-up for your fit”)', text: 'its chip' },
    '--flap-line': { role: 'Photo overlay', use: 'The split across a station-board digit (09)' },
    '--sheet-below': { role: 'Photo overlay', use: 'The white below the 07 drawer' },
    '--fade-sheet': { role: 'Photo overlay', use: 'The fade above the 07 dock' },
    '--todo-1': { role: 'Photo overlay', use: 'The “Image to come” stand-in, its hatch' },
    '--todo-2': { role: 'Photo overlay', use: 'The other stripe of the hatch' },
  } },
  { title: 'Map pieces', note: 'A quiet street map (10, 18). Greens are parks; the route and the destination are forest.', names: {
    '--map-ground': { role: 'Illustration', use: 'Ground, 10' },
    '--map-block': { role: 'Illustration', use: 'Buildings, 10' },
    '--map-park': { role: 'Illustration', use: 'Parks, 10' },
    '--map-park-2': { role: 'Illustration', use: 'Parks further off, 10' },
    '--map-tree': { role: 'Illustration', use: 'Trees, 10' },
    '--map-casing': { role: 'Illustration', use: 'Road edges, the north mark, 10' },
    '--map-path': { role: 'Illustration', use: 'Footpaths, 10' },
    '--map-route-todo': { role: 'Illustration', use: 'The route still to run, 10' },
    '--map18-ground': { role: 'Illustration', use: 'Ground, 18' },
    '--map18-park': { role: 'Illustration', use: 'Parks, 18' },
    '--map18-block': { role: 'Illustration', use: 'Buildings, 18' },
    '--map18-casing': { role: 'Illustration', use: 'Road edges, 18' },
    '--map18-full': { role: 'Illustration', use: 'A full rack’s badge edge, 18' },
    '--map18-you': { role: 'Illustration', use: 'The “you” dot, 18' },
    '--map18-you-ink': { role: 'Illustration', use: 'Its label, 18', text: 'the map' },
    '--rain': { role: 'Illustration', use: 'The rain on 18' },
    '--pill18-bg': { role: 'Illustration', use: 'The weather pill on 18' },
  } },
  { title: 'Drawings', note: 'The bike figure (03) and the small drawings on 15 and 17: paper parts, ink lines, forest for the part being set.', names: {
    '--fig-s0': { role: 'Illustration', use: 'Bike: darkest face' },
    '--fig-s1': { role: 'Illustration', use: 'Bike: second face' },
    '--fig-s2': { role: 'Illustration', use: 'Bike: third face' },
    '--fig-s3': { role: 'Illustration', use: 'Bike: lightest face' },
    '--fig-mid': { role: 'Illustration', use: 'Bike: middle lines' },
    '--fig-lo': { role: 'Illustration', use: 'Bike: faint lines' },
    '--fig-faint': { role: 'Illustration', use: 'Bike: faintest lines' },
    '--fig-shadow': { role: 'Illustration', use: 'Bike: ground shadow' },
    '--fig-ghost': { role: 'Illustration', use: 'Bike: the old size, dashed, as it swaps' },
    '--fig-ring-edge': { role: 'Illustration', use: 'Bike: the O-ring’s edge' },
    '--split-rest': { role: 'Illustration', use: 'The other 30% of the rent-out bar (15, 16)' },
    '--dial-win': { role: 'Illustration', use: 'The courier windows on the dial before one is picked (17)' },
  } },
]
// Outside the tokens: the brand files as drawn, and the iPhone frame on a computer.
export const OUTSIDE: { value: string; name: string; role: Role; use: string }[] = [
  { value: '#3E6A5A', name: 'Brand green', role: 'Accent', use: 'The logo mark and the app icon (design/brand, 02 drawer, 08 banner, home-screen icon)' },
  { value: '#2F5246', name: 'Brand green, dark', role: 'Accent', use: 'The logo mark’s second tone (02 drawer, 08 banner)' },
  { value: '#1E2622', name: 'Brand ink', role: 'Neutral', use: 'The wordmark in the logo (02 drawer)' },
  { value: '#E3ECE7', name: 'Brand tint', role: 'Accent', use: 'The sun in the white logo and the icon (01, home-screen icon)' },
  { value: '#0D110F', name: 'Phone body', role: 'Neutral', use: 'The iPhone frame on a computer, its edge in --shadow-phone' },
  { value: '#2A302D', name: 'Phone rim', role: 'Neutral', use: 'Its outer rim' },
]
const FILED = new Set(GROUPS.flatMap((g) => Object.keys(g.names)))
const isColour = (v: string) => /^(#|rgba?\(|linear-gradient|repeating-linear-gradient)/.test(v) && !/^0 /.test(v)
export type Row = { name: string; value: string; filed?: Filed; where: string[]; via: string[] }
const row = (name: string, filed?: Filed): Row => ({ name, value: TOKENS[name] ?? '', filed, where: tokenUse(name), via: viaTokens(name) })
export const colourGroups = GROUPS.map((g) => ({ ...g, rows: Object.entries(g.names).map(([n, f]) => row(n, f)).filter((r) => r.value) }))
const LEGACY = /^--(sage|sage-dark|sage-tint|muted|line|mist|clay|clay-dark|clay-tint|backdrop|glass-bg|glass-border|scrim|on-photo-ring|scene-\d)$/
export const legacy = Object.keys(TOKENS).filter((n) => LEGACY.test(n)).map((n) => row(n))
// A colour token nobody filed: the page shows it in plain sight, and the checks fail on it.
export const unfiled = Object.keys(TOKENS).filter((n) => isColour(TOKENS[n]) && !FILED.has(n) && !LEGACY.test(n) && !n.startsWith('--shadow')).map((n) => row(n))

// Every text colour on the ground it sits on in the app.
export const PAIRS: { fg: string; bg: string; where: string; under?: string; note?: string }[] = [
  { fg: '--ink', bg: '--paper', where: 'Headings and values on every page' },
  { fg: '--ink', bg: '--sheet', where: 'White cards and sheets' },
  { fg: '--ink-2', bg: '--paper', where: 'Ledes, small text' },
  { fg: '--ink-2', bg: '--sheet', where: 'Card text' },
  { fg: '--ink-3', bg: '--paper', where: 'Mono labels, captions' },
  { fg: '--ink-3', bg: '--sheet', where: 'Mono labels on cards' },
  { fg: '--ink-2', bg: '--rule', where: 'A disabled primary button' },
  { fg: '--ink-2', bg: '--rule-2', where: 'The disabled Pay button (07)' },
  { fg: '--forest', bg: '--paper', where: 'Links, good news' },
  { fg: '--forest', bg: '--sheet', where: 'Links and good news on cards' },
  { fg: '--forest', bg: '--mint', where: 'A selected chip, a confirmation' },
  { fg: '--forest', bg: '--mint-2', where: 'A row just pointed at' },
  { fg: '--white', bg: '--forest', where: 'Primary buttons, the band, selected chips' },
  { fg: '--on-forest-ink', bg: '--forest', where: 'The greeting line' },
  { fg: '--on-forest-label', bg: '--forest', where: 'Mono labels on forest' },
  { fg: '--on-forest-sub', bg: '--forest', where: 'The signed-up tab' },
  { fg: '--on-forest-body', bg: '--forest', where: 'The 12 offer' },
  { fg: '--on-forest-k', bg: '--forest', where: 'The 17 booked card' },
  { fg: '--on-forest-dt', bg: '--forest', where: 'The 17 booked card' },
  { fg: '--tag-ink', bg: '--tag-paper', where: 'The job tag' },
  { fg: '--tag-ink-2', bg: '--tag-paper', where: 'The job tag' },
  { fg: '--tag-label', bg: '--tag-paper', where: 'Mono labels on the tag' },
  { fg: '--forest', bg: '--tag-paper', where: 'The Paid stamp' },
  { fg: '--tag-ink-2', bg: '--tag-paper-3', where: 'Dates on the weekly tags' },
  { fg: '--ink-2', bg: '--map-ground', where: 'Map labels, 10' },
  { fg: '--ink-2', bg: '--map-park', where: 'Map labels on a park, 10' },
  { fg: '--ink', bg: '--map-ground', where: 'The shop on the map, 10' },
  { fg: '--forest', bg: '--map-ground', where: 'The destination, 10' },
  { fg: '--ink-2', bg: '--map18-ground', where: 'Map labels, 18' },
  { fg: '--map18-you-ink', bg: '--map18-ground', where: 'The “you” label, 18' },
  { fg: '--ink-2', bg: '--todo-1', where: 'The “Image to come” stand-in' },
  { fg: '--ink', bg: '--on-photo-bg', where: 'The back button on a photo', under: '--photo-bg', note: 'Measured over the dark photo ground' },
  { fg: '--white', bg: '--on-photo-chip', where: 'The status caption on a result photo', under: '--photo-bg', note: 'Measured over the dark photo ground; it varies with the photo' },
  { fg: '--on-photo-dim', bg: '--on-photo-chip', where: '“No set-up for your fit”', under: '--photo-bg', note: 'Measured over the dark photo ground; it varies with the photo' },
  { fg: '--white', bg: '--on-photo-label', where: 'The label beside a circled mark', under: '--photo-bg', note: 'Measured over the dark photo ground; it varies with the photo' },
  { fg: '--white', bg: '--signed-bg', where: 'The “Signed up” pill', under: '--photo-bg', note: 'Measured over the dark photo ground; it varies with the photo' },
  { fg: '--ink', bg: '--banner-bg', where: 'The notification banner' },
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
export const FONT_SIZES = scan(/font-size:\s*([^;}]+)[;}]/g).sort((a, b) => px(b.value) - px(a.value))
export const RADII = scan(/border-radius:\s*([^;}]+)[;}]/g).filter((r) => !r.value.includes(' ')).sort((a, b) => px(a.value) - px(b.value))
export const SHADOWS = Object.keys(TOKENS).filter((n) => n.startsWith('--shadow')).map((n) => row(n))
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
  { what: 'Press', where: 'Buttons, chips', how: '120 ms · scale 0.97 (chips 0.96)', why: 'Feedback: the tap was felt', still: 'No scale; the action still runs' },
  { what: 'Page push', where: 'Every forward step', how: '500 ms · expo.out · slides in from the right', why: 'Space: this page is deeper', still: 'Appears at once' },
  { what: 'Page back', where: 'Every Back', how: '420 ms · power3.out · in from the left with a fade', why: 'Space: you are returning', still: 'Appears at once' },
  { what: 'Tab or paid cross-fade', where: 'Tabs, 07 → 08', how: '350 ms · cross-fade', why: 'State: same level, no direction', still: 'Appears at once' },
  { what: 'Photo morph', where: '04 → 05', how: '620 ms · expo.inOut · clip opens from the photo', why: 'Continuity: the same bike, closer', still: 'Appears at once' },
  { what: 'Time skip', where: '08 → 09, 09 → 10, 11 → 12, 17 → 15', how: '2.2 s · power2.inOut · the clock runs, days marked', why: 'Explains the days that pass in the story', still: 'Skipped; the next page opens' },
  { what: 'Sheet', where: 'Change, Pay with, Add an item, Bring it back', how: '450 ms · slide up with the scrim', why: 'State: a choice over the page', still: 'Appears at once' },
  { what: 'Coach’s drawer', where: '02', how: '550 ms spring on the way up, 380 ms down', why: 'Feedback: OutRent’s part, tucks away when you read the post', still: 'Appears at once' },
  { what: 'The fitting session', where: '03', how: 'Camera 850 ms · power2.inOut; key, dial and post 400–1300 ms; saddle on a spring', why: 'Explains what each number changes on the bike', still: 'Each step shows its end state' },
  { what: 'Tape settle', where: '03', how: '250 ms · power2.out to the nearest cm', why: 'Feedback: the value is whole', still: 'Lands at once' },
  { what: 'Value flash', where: 'Measured grids', how: '1.1 s · forest fading to ink', why: 'Feedback: this number changed', still: 'No flash' },
  { what: 'Scale marker', where: '04', how: '800 ms · power3.out along the scale', why: 'Explains when the bike arrives against your ride', still: 'At its place' },
  { what: 'Van on the map', where: '10', how: '7 s linear; clock runs; camera eases to the van', why: 'Explains where the bike is', still: 'Arrives at once' },
  { what: 'Job tag and stamp', where: '08', how: 'Tag 1.6 s · elastic.out; stamp 350 ms · power4.in', why: 'Done mark: the booking is real', still: 'Tag and stamp in place' },
  { what: 'The slip', where: '11', how: 'Ticks 280 ms apart, fold 600 ms · power3.inOut', why: 'Done mark: the record is filed', still: 'The slip in place' },
  { what: 'The ring', where: '13', how: 'Draws in 500 ms; tags swing 220 ms', why: 'Done mark: one series, not a payment', still: 'The ring in place' },
  { what: 'The dial token', where: '17', how: '1.1 s · power2.inOut round the window', why: 'Done mark: the pickup is booked', still: 'The token at its place' },
  { what: 'The intake dot', where: '15', how: '500 ms · back.out', why: 'Done mark: checked in at the Hub', still: 'The dot in place' },
  { what: 'Station board', where: '09', how: 'Digits roll 500–1200 ms', why: 'Explains the time left', still: 'The digits in place' },
  { what: 'Skeleton of nothing', where: 'Anywhere', how: 'Nothing moves on its own, apart from the waiting pin on 06, the van’s halo on 10 and the rain on 18', why: 'Motion is feedback, never decoration', still: 'All three stop' },
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
