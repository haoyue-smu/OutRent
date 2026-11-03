import { useRef, useState, type FormEvent } from 'react'
import type { HandoverReport } from '../../shell/store'
import { BackButton, Mono } from '../../shell/direction'
import { Icon } from '../../shell/Icon'
import { PhotoAttachThumb, ReasonRow, ReportSentCard } from './pieces'
import { PARTS, REASONS } from './data'

export function ReportForm({ shots, report, onChange, onBack, onSend }: {
  shots: string[]; report: HandoverReport; onChange: (patch: Partial<HandoverReport>) => void; onBack: () => void; onSend: () => void
}) {
  const reasons = useRef<HTMLFieldSetElement>(null)
  const [error, setError] = useState(false)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!report.reason) { setError(true); reasons.current?.querySelector('input')?.focus(); return }
    onSend()
  }
  return <>
    <main className="screen d-screen s11-screen report-screen">
      <div className="bar-top"><BackButton label="Back to the hand-over record" onClick={onBack} /><Mono className="mid">Report a problem</Mono><span /></div>
      <div className="pad"><h1 className="t-h1 s11-h" tabIndex={-1}>What’s wrong?</h1><p className="lede s11-lede">OR-10482 · Trek Marlin 7</p></div>
      <form id="handover-report-form" onSubmit={submit}>
        <fieldset className="report-card report-reasons" ref={reasons} aria-describedby={error ? 'report-reason-error' : undefined}>
          <legend className="sr-only">Reason</legend>
          {REASONS.map((reason) => <ReasonRow key={reason} reason={reason} checked={report.reason === reason} onChange={() => { onChange({ reason }); setError(false) }} />)}
        </fieldset>
        {error && <p id="report-reason-error" className="pad report-error" role="alert">Choose a reason before sending.</p>}
        <div className="pad report-block">
          <h2 className="report-label" id="report-photos">Photos from your hand-over record</h2>
          {shots.length ? <div className="report-thumbs" role="group" aria-labelledby="report-photos">
            {PARTS.filter((p) => shots.includes(p.id)).map((part) => <PhotoAttachThumb key={part.id} part={part} checked={report.photos.includes(part.id)} onChange={() => onChange({ photos: report.photos.includes(part.id) ? report.photos.filter((id) => id !== part.id) : [...report.photos, part.id] })} />)}
          </div> : <><p className="small">No photos taken yet.</p><button className="link" type="button" onClick={onBack}>Take photos in the hand-over record</button></>}
        </div>
        <div className="pad report-block"><label className="report-label" htmlFor="report-details">Details (optional)</label><textarea id="report-details" name="details" autoComplete="off" className="report-field" rows={3} value={report.details} onChange={(e) => onChange({ details: e.target.value })} /></div>
      </form>
    </main>
    <div className="dock"><button type="submit" form="handover-report-form" className="cta s11-save">Send to Timah Cycles</button></div>
  </>
}

export function ReportSent({ report, sentAt, onBack }: { report: HandoverReport; sentAt: string; onBack: () => void }) {
  return <>
    <main className="screen d-screen s11-screen report-screen">
      <div className="bar-top"><BackButton label="Back to the hand-over record" onClick={onBack} /><span /><span /></div>
      <div className="pad"><span className="report-badge" aria-hidden="true"><Icon name="check" /></span><h1 className="t-h1 report-sent-h" tabIndex={-1}>Report sent</h1><p className="lede s11-lede">To Timah Cycles · kept with OR-10482</p></div>
      <ReportSentCard report={report} sentAt={sentAt} />
    </main>
    <div className="dock"><button type="button" className="cta s11-save" onClick={onBack}>Back to the hand-over record</button></div>
  </>
}
