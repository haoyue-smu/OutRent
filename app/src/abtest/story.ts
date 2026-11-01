import { PARTS, type Part, type PartId } from '../pages/11-handover-check/pieces'
import shopCrank from '@photos/_abtest/assets/shop-crank.webp'
import shopSaddle from '@photos/_abtest/assets/shop-saddle.webp'
import shopDrive from '@photos/_abtest/assets/shop-drive-v2.webp'
import mineCrank from '@photos/_abtest/assets/mine-crank.webp'
import mineSaddle from '@photos/_abtest/assets/mine-saddle.webp'
import mineDrive from '@photos/_abtest/assets/mine-drive-v2.webp'
import shopDriveSlot from '@photos/_abtest/assets/shop-drive-v2-slot.webp'
import mineDriveSlot from '@photos/_abtest/assets/mine-drive-v2-slot.webp'
import backdrop from '@photos/07-fees-liability/assets/07-direction-backdrop-marlin7.webp'
import spot from '@photos/06-delivery-return/assets/06-direction-handover-spot.webp'
import layoutA from '@photos/_abtest/assets/layout-a.webp'
import layoutB from '@photos/_abtest/assets/layout-b.webp'

// The fixed story clock and the photos. Nothing on screen uses the real time.

// The Marlin 7 at the trailhead, behind the welcome and the thank-you, as on page 07; the trailhead carpark behind the scenario.
export const BACKDROP = backdrop
export const SPOT = spot
// The test's own six photos, made so anyone can read them; the live app keeps its images. Daniel's drivetrain shows the
// chain off, in a heap on the ground, which the shop's does not; that pair is portrait 3:4, the others 7:5. The rings sit on
// the shop's scratch and scuff.
const OWN: Record<PartId, Partial<Part>> = {
  crank: { shop: shopCrank, mine: mineCrank, shopRing: [55, 52] },
  saddle: { shop: shopSaddle, mine: mineSaddle, shopRing: [15, 39] },
  drive: { shop: shopDrive, mine: mineDrive },
}
export const AB_PARTS: Part[] = PARTS.map((p) => ({ ...p, ...OWN[p.id] }))
export const mineOf = (id: PartId) => AB_PARTS.find((p) => p.id === id)!.mine
// What the record card and the report thumbnails show. The drivetrain's 7:5 crops were made by hand, so both keep the chain in
// the slot; its full portrait photos stay for the preview and the viewer.
export const slotOf = (id: PartId) => (id === 'drive' ? { shop: shopDriveSlot, mine: mineDriveSlot } : { shop: AB_PARTS.find((p) => p.id === id)!.shop, mine: mineOf(id) })
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
export const CYCLING = ['Never', 'A few times a year', 'Monthly or more']
export const RENTED = ['Yes', 'No']
export const AGES = ['18 to 24', '25 to 34', '35 to 44', '45 or older', 'Prefer not to say']
// Screen 7's pictures: the whole page after the three photos, 390 px wide, with the link outlined. This is their height.
export const LAYOUT_H = 1012
export const LAYOUTS = {
  a: { src: layoutA, caption: 'Report link at the top', alt: 'The whole hand-over page, with the report link outlined above the record card' },
  b: { src: layoutB, caption: 'Report link at the bottom', alt: 'The whole hand-over page, with the report link outlined below the record card' },
}

// Every photo the test shows, decoded before it is needed, so the 1.0 s preview starts with the picture on screen.
export const preload = () => Promise.allSettled(
  [backdrop, spot, ...AB_PARTS.flatMap((p) => [p.shop, p.mine]), shopDriveSlot, mineDriveSlot, layoutA, layoutB].map((src) => { const i = new Image(); i.src = src; return i.decode() }),
)
// Waits for a photo, but never for long: a slow decode must not stop the participant from going on.
export const decoded = (src: string, limit = 1500) => {
  const i = new Image()
  i.src = src
  return Promise.race([i.decode().catch(() => undefined), new Promise((done) => setTimeout(done, limit))])
}
