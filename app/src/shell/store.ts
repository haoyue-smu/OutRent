import { useRef, useSyncExternalStore } from 'react'

// What has happened so far in Daniel's story, shared by every page and kept on this device (localStorage):
// closing the tab, a new tab and the home-screen app all continue. Only a reset (/reset, ?reset or the hidden
// hold on the Home logo) starts again. Values come from product/MOCK-DATA.md; the app only records
// which of the seeded choices Daniel made.

export type Place = 0 | 1                    // 0 Chestnut trailhead carpark, 1 Daniel's home address
export type Pay = 'PayNow' | 'Visa'
export type StoreWay = '' | 'home' | 'rack'  // door pickup S$10, or Rack S drop-off S$5
export type Return = '' | 'pool' | 'next'    // shared run Fri 31 Oct free, or next day 30 Oct S$8
export type ReportReason = '' | 'Wrong item' | 'Damaged' | 'Not adjusted to my fit' | 'Something else'
export type HandoverReport = { reason: ReportReason; photos: string[]; details: string; sent: boolean }

export type State = {
  fit: { height: number; leg: number; hasProfile: boolean }
  book: { d: string | null; c: string | null; place: { d: Place; c: Place }; pay: Pay; ack: boolean }
  paid: boolean                              // OR-10482 confirmed, 22 Oct · 9:12
  now: number                                // the story clock: hours from Wed 22 Oct 0:00
  arrived: boolean                           // 10: the bike is at the hand-over spot
  record: { shots: string[]; marks: string[]; saved: boolean }   // 11
  report: HandoverReport                     // 11 draft and submitted report, also shown on 09 and 12
  closed: boolean                            // 12: returned, deposit released
  weekly: boolean                            // 13: every Saturday from 1 Nov
  storage: { way: StoreWay; booked: boolean; hub: boolean; rentOn: boolean; ret: Return; day?: number }   // day: pickup day in Oct (17)
  added: null | { type: string; where: string; name?: string }   // 14: the track pump
  rackLeft: boolean                          // 18: on the rain day the Marlin 7 was left at Rack C instead
}

export const SEED: State = {
  fit: { height: 176, leg: 81, hasProfile: false },
  book: { d: null, c: null, place: { d: 0, c: 0 }, pay: 'PayNow', ack: false },
  paid: false,
  now: 9 + 1 / 60,
  arrived: false,
  record: { shots: [], marks: [], saved: false },
  report: { reason: '', photos: [], details: '', sent: false },
  closed: false,
  weekly: false,
  storage: { way: '', booked: false, hub: false, rentOn: false, ret: '' },
  added: null,
  rackLeft: false,
}

const KEY = 'outrent.state.v52'
// ?seed=<base64 JSON> opens a page in a given story state without saving it (the components page uses it to
// show each page's done mark live, next to the others).
const deep = (a: Record<string, unknown>, b: Record<string, unknown>): Record<string, unknown> => {
  const o = { ...a }
  for (const k in b) o[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) ? deep((a[k] ?? {}) as Record<string, unknown>, b[k] as Record<string, unknown>) : b[k]
  return o
}
const seeded = (() => { try { const q = new URLSearchParams(location.search).get('seed'); return q ? JSON.parse(atob(q)) as Partial<State> : null } catch { return null } })()
// /reset (and /?reset) clears the story before anything reads it, then shows Home at / in the seed state.
const resetLink = (() => {
  try {
    if (location.pathname.replace(/\/+$/, '') !== '/reset' && !new URLSearchParams(location.search).has('reset')) return false
    localStorage.removeItem(KEY); sessionStorage.clear(); sessionStorage.setItem('outrent.restarted', '1')
    history.replaceState(null, '', '/')
    return true
  } catch { return false }
})()
const load = (): State => {
  if (resetLink) return SEED
  if (seeded) return deep(SEED as unknown as Record<string, unknown>, seeded as Record<string, unknown>) as unknown as State
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return deep(SEED as unknown as Record<string, unknown>, JSON.parse(raw)) as unknown as State
  } catch { /* private mode or blocked storage: start from the seed */ }
  return SEED
}

let state: State = load()
const subs = new Set<() => void>()

export function getState() { return state }

// set(s => ({ ...s, paid: true })) or set({ paid: true })
export function set(patch: Partial<State> | ((s: State) => State)) {
  state = typeof patch === 'function' ? patch(state) : { ...state, ...patch }
  if (!seeded) try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* not kept, still works */ }
  subs.forEach((f) => f())
}

// Start the demo again: forget the story and any saved navigation, then open Home fresh (a full load, so every
// page's first-visit intro runs again). Home says "Demo restarted" once.
export const RESTARTED = 'outrent.restarted'
export function restart() {
  try { localStorage.removeItem(KEY); sessionStorage.clear(); sessionStorage.setItem(RESTARTED, '1') } catch { /* storage blocked */ }
  location.replace('/')
}

const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f) } }
// The picked value is kept per state object, so a pick that builds a new object does not re-render forever.
export function useStore<T>(pick: (s: State) => T): T {
  const memo = useRef<{ s: State; v: T } | null>(null)
  return useSyncExternalStore(subscribe, () => {
    if (memo.current?.s !== state) memo.current = { s: state, v: pick(state) }
    return memo.current.v
  })
}

// ---------- values derived from the state (no new data, only the seeded rules) ----------

export const Fit = {
  saddleRaw: (leg: number) => leg * 0.883,
  frame: (h: number) => (h < 165 ? 'S' : h <= 177 ? 'M' : 'L'),
  scale: { S: 0.92, M: 1, L: 1.08 } as Record<string, number>,
  chart: { S: [155, 165], M: [165, 177], L: [177, 188] } as Record<string, [number, number]>,
}
export function fitNow(s: State = state) {
  const { height, leg } = s.fit
  return { height, leg, frame: Fit.frame(height), saddle: Math.round(Fit.saddleRaw(leg)) }
}

export const PLACES: [string, string][] = [
  ['Chestnut trailhead carpark', 'By the park entrance sign'],
  ['Blk 325C Sengkang East Way #11-42', 'Your home address'],
]
export const placeLine = (p: Place) => (p === 0 ? 'Chestnut trailhead carpark, by the park entrance sign' : PLACES[1][0])
export const placeShort = (p: Place) => (p === 0 ? 'the park entrance sign' : 'Blk 325C')

export const hm = (t: string) => { const [h, m] = t.split(':').map(Number); return h + m / 60 }
export const fmtHM = (h: number) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60) % 60).padStart(2, '0')}`

// The seeded booking is 7:40 and 13:30; until Daniel picks, those are what later pages would show.
export const deliverAt = (s: State = state) => s.book.d ?? '7:40'
export const collectAt = (s: State = state) => s.book.c ?? '13:30'
export const payLabel = (p: Pay) => (p === 'PayNow' ? 'PayNow' : 'Visa ending 4821')

// Story clock. 01–08 run on 22 Oct 9:01–9:12 (the booking as it happened). Every page off that route uses
// Fri 24 Oct 19:00 once something is booked, or a later moment once Daniel has moved the story on.
export const FRI = 67, SAT = 72, HUB = 178
export const offRouteNow = (s: State = state) => Math.max(s.now, FRI)
// Home opens in its no-bookings variant on Wed 22 Oct; once anything has happened it is "now" like 09 and 14.
export const homeNow = (s: State = state) => (s.paid || s.now > FRI ? Math.max(s.now, FRI) : s.now)
// The rental is over once the deposit is released (25 Oct · 14:05). A story that has moved past it
// (the storage skip to 29 Oct) counts it as closed too.
export const isClosed = (s: State = state) => s.paid && (s.closed || s.now >= SAT + 14 + 5 / 60)

const DAYS = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export function dayOf(t: number) {
  const i = Math.floor(t / 24), date = 22 + i
  return date <= 31 ? { wd: DAYS[i], d: date, m: 'Oct' } : { wd: DAYS[i], d: date - 31, m: 'Nov' }
}
export const dateLabel = (t: number) => { const x = dayOf(t); return `${x.wd} ${x.d} ${x.m}` }
export const dateTime = (t: number) => { const x = dayOf(t); return `${x.d} ${x.m} · ${fmtHM(t % 24)}` }
export const clockOf = (t: number) => fmtHM(t % 24)

// "12 h 40 min", "6 days 17 h", "7 days 12 h": the house countdown forms.
export function countdown(fromH: number, toH: number) {
  const mins = Math.max(0, Math.round((toH - fromH) * 60))
  const d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60
  return d > 0 ? { a: String(d), au: d === 1 ? 'day' : 'days', b: String(h), bu: 'h' } : { a: String(h), au: 'h', b: String(m).padStart(2, '0'), bu: 'min' }
}

// The status bar clock of the desktop frame (a phone draws its own). Each page sets the time it is at.
let clock = '9:01'
const clockSubs = new Set<() => void>()
export function setClock(t: string) { if (t !== clock) { clock = t; clockSubs.forEach((f) => f()) } }
export function useClockText() {
  return useSyncExternalStore((f) => { clockSubs.add(f); return () => { clockSubs.delete(f) } }, () => clock)
}
