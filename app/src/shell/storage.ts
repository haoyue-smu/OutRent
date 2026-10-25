import { type State } from './store'

// The Giant Escape 3's trip to the Hub, from the pickup day Daniel chose on 17 (PO-ANSWERS v1.8, MOCK-DATA §9):
// door pickup any day Sat 25 – Fri 31 Oct, 17:00–19:00; Rack S drop-off on the pooled runs Tue 28 and Fri 31 Oct.
// Tue 28 Oct is the seeded choice, and VS-6 seeds what follows it (intake 28 Oct · 19:45, "now" 29 Oct · 10:00,
// returns Fri 31 Oct pooled or 30 Oct next day). For another day the same offsets are kept: intake that evening,
// the Hub page the next morning, next-day return the day after that, the pooled return on the next Tue or Fri run
// at least 2 days ahead.

const WD = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue']   // 22 Oct is a Wednesday
export const DOOR_DAYS = [25, 26, 27, 28, 29, 30, 31]
export const RACK_DAYS = [28, 31]
const RUNS = [28, 31, 35, 38]                                    // Tue 28, Fri 31 Oct, Tue 4, Fri 7 Nov

export const pickDay = (s: State) => s.storage.day ?? 28
export const wd = (d: number) => WD[(d - 22) % 7]
export const dm = (d: number) => (d <= 31 ? `${d} Oct` : `${d - 31} Nov`)
export const dayLong = (d: number) => `${wd(d)} ${dm(d)}`          // "Tue 28 Oct"
export const hubNow = (s: State) => (pickDay(s) - 22 + 1) * 24 + 10   // the morning after the intake (28 → 29 Oct · 10:00)
export const intakeAt = (s: State) => `${dm(pickDay(s))} · 19:45`
export const nextDayBack = (s: State) => pickDay(s) + 2
export const poolBack = (s: State) => RUNS.find((r) => r >= pickDay(s) + 3) ?? RUNS[RUNS.length - 1]
