import type { HandoverReport } from '../../shell/store'
import { REPORT } from '../../shell/report'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { Mono } from '../../shell/direction'
import { PARTS, type Part } from './data'
import './handover.css'

// The ring belongs to submitted photo evidence, not to an unsent draft or an unattached photo.
export function ReportPhoto({ part, report, width, height, className = '', alt = '' }: {
  part: Part; report: HandoverReport; width: number; height: number; className?: string; alt?: string
}) {
  const reported = report.sent && report.photos.includes(part.id) && part.id === 'drive'
  return <span className={`report-photo ${className}`} data-report-photo={part.id} data-reported={reported}>
    <Photo src={part.mine} alt={alt} width={width} height={height} />
    {reported && <span className="ring2 on" style={{ left: '34%', top: '52%' }} aria-hidden="true" />}
  </span>
}

export function RecordPart({ p, shot, ticked, when, report, sentShort, onTake }: {
  p: Part; shot: boolean; ticked: boolean; when: string; report: HandoverReport; sentShort: string; onTake: (el: HTMLElement) => void
}) {
  const reported = report.sent && report.photos.includes(p.id) && p.id === 'drive'
  return (
    <section className={`part${ticked ? ' ok' : ''}`} aria-label={p.name}>
      <div className="part-h"><b>{p.name}<span className="tick" aria-hidden="true"><Icon name="check" /></span></b><Mono>{p.note}</Mono></div>
      <div className="pair">
        <figure><div className="ph">
          <Photo src={p.shop} alt={`The shop’s photo of the ${p.name.toLowerCase()}`} width={160} height={114} />
          {p.shopRing && <span className="ring2 on" style={{ left: `${p.shopRing[0]}%`, top: `${p.shopRing[1]}%` }} aria-hidden="true" />}
        </div></figure>
        <figure>
          <button type="button" className={`ph shot${shot ? ' taken' : ''}`} onClick={(e) => onTake(e.currentTarget)}
            aria-label={shot ? `Your photo of the ${p.name.toLowerCase()}, ${when}` : `Take your photo of the ${p.name.toLowerCase()}`}>
            {shot ? <ReportPhoto part={p} report={report} width={160} height={114} className="mine" /> : <span className="cam"><Icon name="camera" /><span>Take photo</span></span>}
            <span className="flash" aria-hidden="true" />
          </button>
          {shot && <figcaption className="photo-date">{when}{reported && <span className="photo-reported">Reported · {sentShort}</span>}</figcaption>}
        </figure>
      </div>
    </section>
  )
}

export function ReasonRow({ reason, checked, onChange, name = 'reason' }: { reason: string; checked: boolean; onChange: () => void; name?: string }) {
  return <label className="report-option"><input type="radio" name={name} value={reason} checked={checked} onChange={onChange} /><i aria-hidden="true" />{reason}</label>
}

export function PhotoAttachThumb({ part, checked, onChange }: { part: Part; checked: boolean; onChange: () => void }) {
  return (
    <label className="report-thumb">
      <input type="checkbox" name="photos" value={part.id} checked={checked} onChange={onChange} aria-label={`Attach ${part.name} photo`} />
      <span className="report-thumb-photo"><Photo src={part.mine} alt="" width={96} height={68} /><span className="report-selected" aria-hidden="true"><Icon name="check" small /></span></span>
      <span>{part.name}</span>
    </label>
  )
}

export function ReportSentCard({ report, sentAt = REPORT.sentAt }: { report: HandoverReport; sentAt?: string }) {
  return (
    <div className="report-card report-sent">
      <dl className="report-facts">
        <div><dt>Reference</dt><dd>{REPORT.reference}</dd></div>
        <div><dt>Problem</dt><dd>{report.reason}</dd></div>
        <div><dt>Photos</dt><dd>{report.photos.length ? `${report.photos.length} from your record` : 'None attached'}</dd></div>
        {report.details && <div><dt>Details</dt><dd>{report.details}</dd></div>}
        <div><dt>Sent</dt><dd>{sentAt}</dd></div>
        <div><dt>Next</dt><dd>Timah Cycles replies to your booking</dd></div>
      </dl>
      {report.photos.length > 0 && <div className="report-evidence" aria-label="Photos attached to the report">
        {PARTS.filter((part) => report.photos.includes(part.id)).map((part) => <figure key={part.id}>
          <ReportPhoto part={part} report={report} width={113} height={81} alt={`${part.name} attached to your report`} />
          <figcaption>{part.name}</figcaption>
        </figure>)}
      </div>}
    </div>
  )
}
