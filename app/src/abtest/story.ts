import { PARTS, type Part, type PartId } from '../pages/11-handover-check/pieces'
import shopCrank from '@photos/_abtest/assets/shop-crank.webp'
import shopSaddle from '@photos/_abtest/assets/shop-saddle.webp'
import shopDrive from '@photos/_abtest/assets/shop-drive.webp'
import mineCrank from '@photos/_abtest/assets/mine-crank.webp'
import mineSaddle from '@photos/_abtest/assets/mine-saddle.webp'
import mineDrive from '@photos/_abtest/assets/mine-drive.webp'
import backdrop from '@photos/07-fees-liability/assets/07-direction-backdrop-marlin7.webp'
import layoutA from '@photos/_abtest/assets/layout-a.webp'
import layoutB from '@photos/_abtest/assets/layout-b.webp'

// The fixed story clock and the photos. Nothing on screen uses the real time.

// The Marlin 7 at the trailhead, behind the first and the last screen, as on page 07.
export const BACKDROP = backdrop
// The test's own six photos, made so anyone can read them; the live app keeps its images. Daniel's drivetrain shows the
// chain off and lying on the ground, which the shop's does not. The rings sit on the shop's scratch and scuff.
const OWN: Record<PartId, Partial<Part>> = {
  crank: { shop: shopCrank, mine: mineCrank, shopRing: [55, 52] },
  saddle: { shop: shopSaddle, mine: mineSaddle, shopRing: [15, 39] },
  drive: { shop: shopDrive, mine: mineDrive },
}
export const AB_PARTS: Part[] = PARTS.map((p) => ({ ...p, ...OWN[p.id] }))
export const mineOf = (id: PartId) => AB_PARTS.find((p) => p.id === id)!.mine
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
// Screen 7's pictures: the whole page after the three photos, 390 px wide, with the link outlined. This is their height.
export const LAYOUT_H = 1012
export const LAYOUTS = {
  a: { src: layoutA, caption: 'Link at the top', alt: 'The whole hand-over page, with the report link outlined above the record card' },
  b: { src: layoutB, caption: 'Link at the bottom', alt: 'The whole hand-over page, with the report link outlined below the record card' },
}

// Every photo the test shows, decoded before it is needed, so the 1.0 s preview starts with the picture on screen.
export const preload = () => Promise.allSettled(
  [backdrop, ...AB_PARTS.flatMap((p) => [p.shop, p.mine]), layoutA, layoutB].map((src) => { const i = new Image(); i.src = src; return i.decode() }),
)
// Waits for a photo, but never for long: a slow decode must not stop the participant from going on.
export const decoded = (src: string, limit = 1500) => {
  const i = new Image()
  i.src = src
  return Promise.race([i.decode().catch(() => undefined), new Promise((done) => setTimeout(done, limit))])
}
