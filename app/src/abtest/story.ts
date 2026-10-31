import { PARTS, type PartId } from '../pages/11-handover-check/pieces'
import driveBent from '@photos/_abtest/assets/11-mine-drive-bent.webp'
import backdrop from '@photos/07-fees-liability/assets/07-direction-backdrop-marlin7.webp'
import layoutA from '@photos/_abtest/assets/layout-a.webp'
import layoutB from '@photos/_abtest/assets/layout-b.webp'

// The fixed story clock and the photos. Nothing on screen uses the real time.

// The Marlin 7 at the trailhead, behind the first and the last screen, as on page 07.
export const BACKDROP = backdrop
// Daniel's drivetrain is the damaged photo: the cage bent into the spokes, not in the shop's photo.
export const mineOf = (id: PartId) => (id === 'drive' ? driveBent : PARTS.find((p) => p.id === id)!.mine)
export const TAKEN: Record<PartId, string> = { crank: '25 Oct · 7:40', saddle: '25 Oct · 7:40', drive: '25 Oct · 7:41' }
export const CAPTION: Record<PartId, string> = { crank: 'CRANK ARM · 25 OCT · 7:40', saddle: 'SADDLE EDGE · 25 OCT · 7:40', drive: 'DRIVETRAIN · 25 OCT · 7:41' }
export const SHOP_TAG = '18 Oct · Timah'
export const FIRST_TAKEN = '25 Oct · 7:40'
export const EVIDENCE_DONE = 'Hand-over record, 25 Oct · 7:41'
export const EVIDENCE_OPEN = 'Hand-over record, in progress'
export const SENT_SHORT = '7:46'
export const SENT_FULL = '25 Oct · 7:46'
export const REASONS = ['Wrong item', 'Damaged', 'Not adjusted to my fit', 'Something else']
export const NOTICED = ['Yes', 'No', 'Not sure']
export const LAYOUTS = {
  a: { src: layoutA, caption: 'Link at the top', alt: 'The hand-over page with the report link above the record card' },
  b: { src: layoutB, caption: 'Link at the bottom', alt: 'The hand-over page with the report link below the record card' },
}

// Every photo the test shows, decoded before it is needed, so the 1.0 s preview starts with the picture on screen.
export const preload = () => Promise.allSettled(
  [backdrop, ...PARTS.flatMap((p) => [p.shop, mineOf(p.id)]), layoutA, layoutB].map((src) => { const i = new Image(); i.src = src; return i.decode() }),
)
// Waits for a photo, but never for long: a slow decode must not stop the participant from going on.
export const decoded = (src: string, limit = 1500) => {
  const i = new Image()
  i.src = src
  return Promise.race([i.decode().catch(() => undefined), new Promise((done) => setTimeout(done, limit))])
}
