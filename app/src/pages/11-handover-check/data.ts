import type { ReportReason } from '../../shell/store'
import sCrank from '@photos/11-handover-check/assets/11-direction-s-crank.webp'
import sSaddle from '@photos/11-handover-check/assets/11-direction-s-saddle.webp'
import sDrive from '@photos/11-handover-check/assets/11-direction-s-drive.webp'
import rCrank from '@photos/12-rental-summary/assets/12-direction-r-crank.webp'
import rSaddle from '@photos/12-rental-summary/assets/12-direction-r-saddle.webp'

// Adapted from the existing record pieces and report form on origin/abtest. Production photos only.
export type PartId = 'crank' | 'saddle' | 'drive'
export type Part = { id: PartId; name: string; note: string; shop: string; mine: string; shopRing?: [number, number]; short: string }
export const PARTS: Part[] = [
  { id: 'crank', name: 'Crank arm', note: 'Known scratch', shop: sCrank, mine: rCrank, shopRing: [57, 66], short: 'Crank arm · scratch' },
  { id: 'saddle', name: 'Saddle edge', note: 'Known scuff', shop: sSaddle, mine: rSaddle, shopRing: [28, 45], short: 'Saddle · scuff' },
  // Approved photo from origin/ops:inbox/assets/11-mine-drive-scratch.webp; page 12 keeps its return photo.
  { id: 'drive', name: 'Drivetrain', note: 'Part most at risk', shop: sDrive, mine: '/img/11-mine-drive-scratch.webp', short: 'Drivetrain' },
]
export const REASONS: Exclude<ReportReason, ''>[] = ['Wrong item', 'Damaged', 'Not adjusted to my fit', 'Something else']
