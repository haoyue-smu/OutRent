import type { ReactNode, Ref } from 'react'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { Mono } from '../../shell/direction'
import sCrank from '@photos/11-handover-check/assets/11-direction-s-crank.webp'
import sSaddle from '@photos/11-handover-check/assets/11-direction-s-saddle.webp'
import sDrive from '@photos/11-handover-check/assets/11-direction-s-drive.webp'
import rCrank from '@photos/12-rental-summary/assets/12-direction-r-crank.webp'
import rSaddle from '@photos/12-rental-summary/assets/12-direction-r-saddle.webp'
import rDrive from '@photos/12-rental-summary/assets/12-direction-r-drive.webp'
import './handover.css'

// The pieces of 11 that the A/B test site shares with the app: the three parts, one part of the record, the report row.
// They hold no store and no router. Anything that judges a part's condition stays in Handover.tsx and comes in as children.

export type PartId = 'crank' | 'saddle' | 'drive'
export type Part = { id: PartId; name: string; note: string; shop: string; mine: string; shopRing?: [number, number]; mineRing?: [number, number]; mark?: string; short: string }
export const PARTS: Part[] = [
  { id: 'crank', name: 'Crank arm', note: 'Known scratch', shop: sCrank, mine: rCrank, shopRing: [57, 66], mineRing: [50, 61], mark: 'scratch', short: 'Crank arm · scratch' },
  { id: 'saddle', name: 'Saddle edge', note: 'Known scuff', shop: sSaddle, mine: rSaddle, shopRing: [28, 45], mineRing: [68, 50], mark: 'scuff', short: 'Saddle · scuff' },
  { id: 'drive', name: 'Drivetrain', note: 'Part most at risk', shop: sDrive, mine: rDrive, short: 'Drivetrain' },
]

// One part of the record: the shop's photo and Daniel's. The defaults are the live page. The test passes its own photo
// (mine), eager and the two tags. The live page passes the ring on Daniel's photo (mineExtra) and the marking step (children).
export function RecordPart({ p, shot, ticked, when, onTake, mine, eager, shopTag, mineTag, mineExtra, children }: {
  p: Part; shot: boolean; ticked?: boolean; when: string; onTake: (el: HTMLElement) => void
  mine?: string; eager?: boolean; shopTag?: ReactNode; mineTag?: ReactNode; mineExtra?: ReactNode; children?: ReactNode
}) {
  return (
    <section className={`part${ticked ? ' ok' : ''}`} aria-label={p.name}>
      <div className="part-h"><b>{p.name}<span className="tick" aria-hidden="true"><Icon name="check" /></span></b><Mono>{p.note}</Mono></div>
      <div className="pair">
        <figure>
          <div className="ph">
            <Photo src={p.shop} alt={`The shop’s photo of the ${p.name.toLowerCase()}`} width={160} height={114} first={eager} />
            {p.shopRing && <span className="ring2 on" style={{ left: `${p.shopRing[0]}%`, top: `${p.shopRing[1]}%` }} aria-hidden="true" />}
            {shopTag}
          </div>
        </figure>
        <figure>
          <button type="button" className={`ph shot${shot ? ' taken' : ''}`} onClick={(e) => onTake(e.currentTarget)}
            aria-label={shot ? `Your photo of the ${p.name.toLowerCase()}, ${when}` : `Take your photo of the ${p.name.toLowerCase()}`}>
            {shot
              ? <Photo src={mine ?? p.mine} alt="" width={160} height={114} className="mine" first={eager} />
              : <span className="cam"><Icon name="camera" /><span>Take photo</span></span>}
            {mineExtra}
            {shot && mineTag}
            <span className="flash" aria-hidden="true" />
          </button>
        </figure>
      </div>
      {children}
    </section>
  )
}

// The way to report a problem. second replaces its second line; rowRef lets the test measure whether it is on screen.
export function ReportRow({ onClick, second = 'Report a problem before you ride', rowRef, done }: { onClick: () => void; second?: string; rowRef?: Ref<HTMLButtonElement>; done?: boolean }) {
  return (
    <button type="button" className="reportrow" ref={rowRef} aria-disabled={done || undefined} onClick={onClick}>
      <Icon name="flag" />
      <span><b>Something wrong with the bike?</b><span>{second}</span></span>
      <Icon name="caret-right" small />
    </button>
  )
}
