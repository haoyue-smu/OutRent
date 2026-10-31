import type { PartId } from '../pages/11-handover-check/pieces'
import type { Started, Variant } from './api'

// What survives a reload. The cookie holds the row (30 days, SameSite=Lax); local storage holds where the participant was.
export type Screen = 'handover' | 'report' | 'sent' | 'questions' | 'preference' | 'thanks'
export type Saved = {
  screen: Screen
  shots: PartId[]
  n: number                 // the last event number
  scrolledMax: number
  taps: number              // taps on the link before the damage was visible
  damageAt: number | null
  reportTapped: boolean
  firstTapDone: boolean
  views: number             // photos opened full size
  sent: boolean
  reason: string
  photos: PartId[]
  details: string
  noticed: string
  seq: number
  seqWhy: string
  openText: string
  left: Variant | null
  pick: Variant | null
  why: string
}
export const fresh = (): Saved => ({
  screen: 'handover', shots: [], n: 0, scrolledMax: 0, taps: 0, damageAt: null, reportTapped: false, firstTapDone: false, views: 0, sent: false,
  reason: '', photos: [], details: '', noticed: '', seq: 0, seqWhy: '', openText: '', left: null, pick: null, why: '',
})

const COOKIE = 'outrent_ab'
const DAYS30 = 60 * 60 * 24 * 30
const secure = () => (location.protocol === 'https:' ? '; Secure' : '')

export type Row = Started & { done?: boolean }
export function readRow(): Row | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`))
  if (!m) return null
  try { return JSON.parse(decodeURIComponent(m[1])) as Row } catch { return null }
}
export function writeRow(r: Row) {
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(r))}; Max-Age=${DAYS30}; Path=/; SameSite=Lax${secure()}`
}
export function clearRow() {
  document.cookie = `${COOKIE}=; Max-Age=0; Path=/; SameSite=Lax${secure()}`
}

const key = (token: string) => `outrent_ab_${token}`
export function readSaved(token: string): Saved {
  try { return { ...fresh(), ...JSON.parse(localStorage.getItem(key(token)) ?? '{}') as Partial<Saved> } } catch { return fresh() }
}
export function writeSaved(token: string, s: Saved) {
  try { localStorage.setItem(key(token), JSON.stringify(s)) } catch { /* private mode: a reload starts the hand-over again, on the same row */ }
}

// The URL overrides, for the pilot and the screenshots. ?new=1 starts a new row, and only together with ?v= or ?pilot=1,
// so a real participant's link can never open a second row.
export function readParams() {
  const q = new URLSearchParams(location.search)
  const v = q.get('v')
  const forced: Variant | null = v === 'a' || v === 'b' ? v : null
  const pilot = q.get('pilot') === '1'
  return { forced, pilot, again: q.get('new') === '1' && (forced !== null || pilot) }
}
// ?new=1 works once: it leaves the URL, so a reload stays on the row it opened.
export function dropNew() {
  const u = new URL(location.href)
  u.searchParams.delete('new')
  history.replaceState(null, '', u)
}
