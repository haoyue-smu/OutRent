import { useEffect, useRef, type ReactNode, type Ref } from 'react'
import { Icon } from '../shell/Icon'
import { Photo } from '../shell/Photo'
import { BackButton, Mono } from '../shell/direction'
import { PARTS, RecordPart, ReportRow, type PartId } from '../pages/11-handover-check/pieces'
import type { Variant } from './api'
import { CAPTION, EVIDENCE_DONE, EVIDENCE_OPEN, FIRST_TAKEN, LAYOUTS, NOTICED, REASONS, SENT_FULL, SENT_SHORT, SHOP_TAG, TAKEN, mineOf } from './story'

// The screens, copy as in the flow artifact. No screen reads the store or the router; App.tsx owns the state and the log.

const Kv = ({ k, v }: { k: string; v: ReactNode }) => <div className="ab-kv"><span>{k}</span><span>{v}</span></div>

// A screen's scrolling page. Moves focus to its heading when it opens, so a screen reader starts at the top.
function Page({ children, label, top, scrollRef }: { children: ReactNode; label: string; top: ReactNode; scrollRef?: Ref<HTMLElement> }) {
  const heading = useRef<HTMLDivElement>(null)
  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [])
  return (
    <main className="screen d-screen s11-screen ab-screen" ref={scrollRef} aria-label={label}>
      <div className="bar-top">{top}</div>
      <div ref={heading} tabIndex={-1} className="ab-focus">{children}</div>
    </main>
  )
}
const Bar = ({ eyebrow, onBack, backLabel }: { eyebrow: string; onBack?: () => void; backLabel?: string }) => (
  <>{onBack ? <BackButton label={backLabel ?? 'Back'} onClick={onBack} /> : <span />}<Mono className="mid">{eyebrow}</Mono><span /></>
)

// ---------- 0 · Entry ----------
export function Entry({ onStart, busy, failed }: { onStart: () => void; busy: boolean; failed: boolean }) {
  return (
    <>
      <Page label="Start" top={<Bar eyebrow="OutRent · 3-minute test" />}>
        <div className="pad">
          <h1 className="t-h1 s11-h">Your rental bike just arrived</h1>
          <p className="lede ab-para">You’re Daniel. A Trek Marlin 7 was delivered to the Chestnut trailhead for your Saturday ride. A S$150 deposit is on hold until the bike goes back.</p>
          <p className="lede ab-para">Do what you’d normally do in the app before you ride off. There are no right answers; we’re testing the app, not you.</p>
        </div>
        <div className="ab-card">
          <Kv k="Takes" v="about 3 minutes" />
          <Kv k="Your phone" v="use it as you normally would" />
          <Kv k="Data" v="taps and timings, no names" />
        </div>
      </Page>
      <div className="dock">
        {failed && <p className="ab-dock-note" role="alert">We could not reach the server. Check your connection and tap Start again.</p>}
        <button type="button" className="cta s11-save" data-log="start" disabled={busy} onClick={onStart}>Start</button>
      </div>
    </>
  )
}

// ---------- 1 · Hand-over: the only place the variant is read ----------
export function HandoverPage({ variant, shots, sent, linkRef, scrollRef, onTake, onLink, onSave }: {
  variant: Variant; shots: PartId[]; sent: boolean; linkRef: Ref<HTMLButtonElement>; scrollRef: Ref<HTMLElement>
  onTake: (id: PartId) => void; onLink: () => void; onSave: () => void
}) {
  const left = 3 - shots.length
  const label = left === 3 ? 'Take 3 photos' : left > 0 ? `Take ${left} more photo${left === 1 ? '' : 's'}` : 'Save record'
  const link = (
    <div className="pad ab-link">
      <ReportRow rowRef={linkRef} onClick={onLink} done={sent} second={sent ? `Report sent · ${SENT_SHORT}` : undefined} />
    </div>
  )
  return (
    <>
      <Page label="Hand-over" scrollRef={scrollRef} top={<Bar eyebrow="Hand-over" onBack={() => undefined} />}>
        <div className="pad">
          <h1 className="t-h1 s11-h">Check it before you ride</h1>
          <p className="lede s11-lede">Photograph the same three parts the shop did. What you record here is never charged to you.</p>
        </div>
        {variant === 'a' && link}
        <article className="record" aria-label="Hand-over record, OR-10482">
          <header className="rec-h"><Mono>Hand-over record · OR-10482</Mono></header>
          <div className="cols">
            <div><Mono>Timah Cycles</Mono><b>18 Oct · 16:20</b></div>
            <div><Mono>You</Mono><b>{shots.length ? FIRST_TAKEN : 'Not taken yet'}</b></div>
          </div>
          <div className="parts">
            {PARTS.map((p) => (
              <RecordPart key={p.id} p={p} shot={shots.includes(p.id)} when={TAKEN[p.id]} eager mine={mineOf(p.id)}
                onTake={() => onTake(p.id)}
                shopTag={<span className="ab-tag">{SHOP_TAG}</span>}
                mineTag={<span className="ab-tag">{TAKEN[p.id]} · you</span>} />
            ))}
          </div>
        </article>
        {variant === 'b' && link}
      </Page>
      <div className="dock" data-log="main-disabled">
        <p className="ab-dock-note" hidden={left > 0}>Both records are kept with booking OR-10482</p>
        <button type="button" className="cta s11-save ab-main" data-log="save" disabled={left > 0} onClick={onSave} aria-live="polite">{label}</button>
      </div>
    </>
  )
}

// ---------- 2 · Simulated camera ----------
export function Camera({ part }: { part: PartId }) {
  return (
    <div className="ab-camera" data-log="camera" role="status">
      <span className="ab-camera-cap">{CAPTION[part]}</span>
      <div className="ab-camera-photo">
        <Photo src={mineOf(part)} alt={`Your photo of the ${PARTS.find((p) => p.id === part)!.name.toLowerCase()}`} width={390} height={278} first />
      </div>
      <div className="ab-camera-bar" aria-hidden="true"><span>Retake</span><span className="ab-shutter" /><span>Use photo</span></div>
    </div>
  )
}

// ---------- 4 · Report form ----------
export function ReportForm({ shots, reason, photos, details, onBack, onReason, onTogglePhoto, onDetails, onSend }: {
  shots: PartId[]; reason: string; photos: PartId[]; details: string
  onBack: () => void; onReason: (r: string) => void; onTogglePhoto: (id: PartId) => void; onDetails: (s: string) => void; onSend: () => void
}) {
  return (
    <>
      <Page label="Report a problem" top={<Bar eyebrow="Report a problem" onBack={onBack} backLabel="Back to hand-over" />}>
        <div className="pad"><h1 className="t-h1 s11-h">What’s wrong?</h1></div>
        <div className="ab-card">
          <Kv k="Booking" v="OR-10482 · Trek Marlin 7" />
          <Kv k="Evidence" v={shots.length === 3 ? EVIDENCE_DONE : EVIDENCE_OPEN} />
        </div>
        <fieldset className="ab-card ab-group">
          <legend className="ab-sr">Reason</legend>
          {REASONS.map((r) => (
            <label key={r} className="ab-opt" data-log={`reason:${r}`}>
              <input type="radio" name="reason" checked={reason === r} onChange={() => onReason(r)} />
              <i aria-hidden="true" />{r}
            </label>
          ))}
        </fieldset>
        <div className="pad ab-block">
          <Mono id="ab-photos">Photos from your hand-over record</Mono>
          <div className="ab-thumbs" role="group" aria-labelledby="ab-photos">
            {PARTS.filter((p) => shots.includes(p.id)).map((p) => (
              <button key={p.id} type="button" className="ab-thumb" data-log={`thumb:${p.id}`} aria-pressed={photos.includes(p.id)} aria-label={`Attach your photo of the ${p.name.toLowerCase()}`} onClick={() => onTogglePhoto(p.id)}>
                <Photo src={mineOf(p.id)} alt="" width={64} height={48} first />
              </button>
            ))}
            <button type="button" className="ab-thumb ab-add" data-log="add-photo" aria-label="Add a photo" onClick={() => undefined}><Icon name="plus" /></button>
          </div>
        </div>
        <div className="pad ab-block">
          <label className="ab-label" htmlFor="ab-details">Details (optional)</label>
          <textarea id="ab-details" name="details" autoComplete="off" className="ab-field" rows={3} value={details} onChange={(e) => onDetails(e.target.value)} />
        </div>
      </Page>
      <div className="dock" data-log="send-disabled">
        <button type="button" className="cta s11-save ab-main" data-log="send" disabled={!reason} onClick={onSend}>Send to Timah Cycles</button>
      </div>
    </>
  )
}

// ---------- 5 · Report sent ----------
export function ReportSent({ reason, count, onBack }: { reason: string; count: number; onBack: () => void }) {
  return (
    <>
      <Page label="Report sent" top={<Bar eyebrow="" />}>
        <div className="pad">
          <span className="ab-badge" aria-hidden="true"><Icon name="check" /></span>
          <h1 className="t-h1 s11-h ab-sent-h">Report sent</h1>
          <p className="lede s11-lede">To Timah Cycles · kept with OR-10482</p>
        </div>
        <div className="ab-card">
          <Kv k="Problem" v={reason} />
          <Kv k="Photos" v={count ? `${count} from your record` : 'None'} />
          <Kv k="Sent" v={SENT_FULL} />
          <Kv k="Next" v="Timah Cycles replies in Messages" />
        </div>
      </Page>
      <div className="dock"><button type="button" className="cta s11-save" data-log="back-to-handover" onClick={onBack}>Back to hand-over</button></div>
    </>
  )
}

// ---------- 6 · Three questions ----------
export function Questions({ noticed, seq, seqWhy, openText, onNoticed, onSeq, onSeqWhy, onOpenText, onDone }: {
  noticed: string; seq: number; seqWhy: string; openText: string
  onNoticed: (v: string) => void; onSeq: (n: number) => void; onSeqWhy: (s: string) => void; onOpenText: (s: string) => void; onDone: () => void
}) {
  return (
    <>
      <Page label="3 quick questions" top={<Bar eyebrow="3 quick questions" />}>
        <h1 className="ab-sr">3 quick questions</h1>
        <fieldset className="ab-q">
          <legend className="ab-q-t">1 · Did you notice anything wrong with the bike?</legend>
          <div className="ab-card ab-group ab-inq">
            {NOTICED.map((v) => (
              <label key={v} className="ab-opt" data-log={`noticed:${v}`}>
                <input type="radio" name="noticed" checked={noticed === v} onChange={() => onNoticed(v)} />
                <i aria-hidden="true" />{v}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="ab-q">
          <legend className="ab-q-t">2 · Overall, how easy was it to do what you wanted?</legend>
          <div className="ab-scale">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <label key={n} className="ab-scale-n" data-log={`seq:${n}`}>
                <input type="radio" name="seq" checked={seq === n} onChange={() => onSeq(n)} />
                <span>{n}</span>
              </label>
            ))}
          </div>
          <div className="ab-ends"><span>Very difficult</span><span>Very easy</span></div>
          <label className="ab-label" htmlFor="ab-seq-why">Why did you give this rating? (optional)</label>
          <textarea id="ab-seq-why" name="seq_why" autoComplete="off" className="ab-field" rows={2} value={seqWhy} onChange={(e) => onSeqWhy(e.target.value)} />
        </fieldset>
        <div className="ab-q">
          <label className="ab-q-t" htmlFor="ab-open">3 · If you wanted to tell the shop about a problem, where did you look first? Why?</label>
          <textarea id="ab-open" name="open_text" autoComplete="off" className="ab-field" rows={3} value={openText} onChange={(e) => onOpenText(e.target.value)} />
        </div>
      </Page>
      <div className="dock" data-log="done-disabled"><button type="button" className="cta s11-save ab-main" data-log="done" disabled={!noticed || !seq} onClick={onDone}>Done</button></div>
    </>
  )
}

// ---------- 7 · Pick A or B ----------
export function Preference({ left, pick, why, onPick, onWhy, onFinish }: {
  left: Variant; pick: Variant | null; why: string; onPick: (v: Variant) => void; onWhy: (s: string) => void; onFinish: () => void
}) {
  const order: Variant[] = left === 'a' ? ['a', 'b'] : ['b', 'a']
  return (
    <>
      <Page label="Last one" top={<Bar eyebrow="Last one" />}>
        <h1 className="ab-sr">Last one</h1>
        <fieldset className="ab-q">
          <legend className="ab-q-t">Two layouts of the page you just used. Which would you rather have?</legend>
          <div className="ab-picks">
            {order.map((v) => (
              <label key={v} className="ab-pick" data-log={`pick:${v.toUpperCase()}`}>
                <input type="radio" name="pick" checked={pick === v} onChange={() => onPick(v)} />
                <span className="ab-pick-img"><Photo src={LAYOUTS[v].src} alt={LAYOUTS[v].alt} width={170} height={368} first /></span>
                <span className="ab-pick-cap">{LAYOUTS[v].caption}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="ab-q">
          <label className="ab-label" htmlFor="ab-why">Why?</label>
          <textarea id="ab-why" name="preference_why" autoComplete="off" className="ab-field" rows={3} value={why} onChange={(e) => onWhy(e.target.value)} />
        </div>
      </Page>
      <div className="dock" data-log="finish-disabled"><button type="button" className="cta s11-save ab-main" data-log="finish" disabled={!pick} onClick={onFinish}>Finish</button></div>
    </>
  )
}

export const Thanks = () => <main className="ab-thanks"><p className="lede">Thanks. You can close this page.</p></main>
