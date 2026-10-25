import { SAT, type Place, type State, collectAt, deliverAt, hm, homeNow, isClosed } from './store'

// OR-10482 as it runs on Saturday, derived from what Daniel chose on 06 (09–13 read these).
// MOCK-DATA §4 seeds the stage times for the 7:40 / 13:30 booking only: leaves the shop 35 min before delivery
// (7:05), tracking opens 18 min before (7:22), the deposit is released 35 min after collection (14:05) and the
// weekly ride is set up 2 min after that (14:07, FD-RECURRING). For another slot the same offsets are kept.

export const deliverH = (s: State) => SAT + hm(deliverAt(s))
export const collectH = (s: State) => SAT + hm(collectAt(s))
export const leavesH = (s: State) => deliverH(s) - 35 / 60
export const trackH = (s: State) => deliverH(s) - 18 / 60
export const releaseH = (s: State) => collectH(s) + 35 / 60
export const CANCEL_BY = 48 + 20      // 24 Oct · 20:00, free to cancel until then
export const FIRST_CHARGE = 8 * 24 + 20   // Thu 30 Oct · 20:00
export const NOV1 = SAT + 7 * 24          // Sat 1 Nov, the first weekly ride
export const nextRideH = (s: State) => NOV1 + hm(deliverAt(s))

// Where the rental stands, from what has happened so far.
export type Stage = 'none' | 'booked' | 'onway' | 'here' | 'riding' | 'closed'
export function stage(s: State): Stage {
  if (!s.paid) return 'none'
  if (isClosed(s)) return 'closed'
  if (s.record.saved) return 'riding'
  if (s.arrived) return 'here'
  return s.now >= trackH(s) ? 'onway' : 'booked'
}

// "Now" on Bookings: the off-route clock once something is booked; after the ride, the moment it closed
// (14:05) plus the two minutes FD-RECURRING takes to be set up.
export const bookingsNow = (s: State) => (isClosed(s) ? Math.max(s.now, releaseH(s) + 2 / 60) : homeNow(s))

// The hand-over place in a few words, as the courier and the map say it.
export const spot = (p: Place) => (p === 0 ? 'park entrance sign' : 'Blk 325C')
export const spotWhere = (p: Place) => (p === 0 ? 'the trailhead' : 'Blk 325C')
export const placeFull = (p: Place) => (p === 0 ? 'Chestnut trailhead carpark, by the park entrance sign' : 'Blk 325C Sengkang East Way #11-42')
// Both legs in one line: one place when they match, else each leg with its own.
export const legsLine = (s: State) => {
  const { d, c } = s.book.place
  return d === c ? placeFull(d) : `Delivered to ${placeFull(d)}; collected from ${placeFull(c)}`
}
export const payWith = (s: State) => (s.book.pay === 'PayNow' ? 'PayNow' : 'Visa ···4821')
