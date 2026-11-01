import { useEffect, useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent, type ReactNode, type Ref } from 'react'
import { Icon } from '../shell/Icon'
import { Photo } from '../shell/Photo'
import { BackButton, Mono } from '../shell/direction'
import { RecordPart, ReportRow, type PartId } from '../pages/11-handover-check/pieces'
import type { Variant } from './api'
import { AB_PARTS, AGES, BACKDROP, CAPTION, CYCLING, EVIDENCE_DONE, EVIDENCE_OPEN, FIRST_TAKEN, LAYOUTS, LAYOUT_H, NOTICED, REASONS, RENTED, SENT_FULL, SENT_SHORT, SHOP_TAG, SPOT, TAKEN, mineOf, slotOf } from './story'

// The screens. The app's own copy is as in the flow artifact; what the participant reads outside the app is as in UPDATE 3. No screen reads the store or the router; App.tsx owns the state and the log.

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

// The screens around the task: a paper sheet over a photo, as on page 07. The photo takes at most 40% of the height; the
// sheet takes the rest, with its content at the top and its button at the bottom.
function PhotoSheet({ label, photo = BACKDROP, spot, action, children }: { label: string; photo?: string; spot?: boolean; action?: ReactNode; children: ReactNode }) {
  return (
    <main className="ab-ps" aria-label={label}>
      <div className={`ab-ps-photo${spot ? ' is-spot' : ''}`}><Photo src={photo} alt="" width={390} height={844} first /></div>
      <div className="ab-ps-sheet">
        <div className={`ab-ps-body${action ? '' : ' is-alone'}`}>{children}</div>
        {action}
      </div>
    </main>
  )
}

// ---------- S0 · Welcome ----------
export function Welcome({ onContinue }: { onContinue: () => void }) {
  return (
    <PhotoSheet label="Welcome" action={<button type="button" className="cta" onClick={onContinue}>Continue</button>}>
      <h1 className="t-h1">Thanks for helping us out!</h1>
      <p className="lede">We’re SMU students building OutRent, an app for renting bikes and outdoor gear. You’ll try one screen of it.</p>
      <ul className="ab-facts">
        <li><Icon name="clock" /><span>About 3 minutes</span></li>
        <li><Icon name="camera" /><span>You’ll take a few photos. The camera is a mock-up, your real camera stays off.</span></li>
        <li><Icon name="lock-simple" /><span>We only record taps and timings. Nothing personal.</span></li>
      </ul>
    </PhotoSheet>
  )
}

// ---------- S1 · Scenario: its button is t0 and creates the row ----------
export function Scenario({ onStart, busy, failed }: { onStart: () => void; busy: boolean; failed: boolean }) {
  return (
    <PhotoSheet label="Your scenario" photo={SPOT} spot action={<button type="button" className="cta" disabled={busy} onClick={onStart}>Start</button>}>
      <Mono>Your scenario</Mono>
      <h1 className="t-h1">You’re Daniel</h1>
      <div className="ab-lines">
        <p className="lede">You rented a mountain bike for a Saturday morning ride.</p>
        <p className="lede">The shop just dropped it off here, at the trailhead.</p>
        <p className="lede">There’s a S$150 deposit on your card until you return it.</p>
      </div>
      <div className="ab-task">
        <Mono>Your task</Mono>
        <p className="t-h2">Do the hand‑over check before you ride.</p>
        <p className="t-h2">If anything’s wrong, let the shop know.</p>
      </div>
      {failed && <p className="ab-dock-note" role="alert">We could not reach the server. Check your connection and tap Start again.</p>}
    </PhotoSheet>
  )
}

// ---------- 1 · Hand-over: the only place the variant is read ----------
export function HandoverPage({ variant, shots, sent, linkRef, scrollRef, onTake, onView, onLink, onSave }: {
  variant: Variant; shots: PartId[]; sent: boolean; linkRef: Ref<HTMLButtonElement>; scrollRef: Ref<HTMLElement>
  onTake: (id: PartId) => void; onView: (v: PhotoView, from: HTMLElement) => void; onLink: () => void; onSave: () => void
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
            {AB_PARTS.map((p) => (
              <RecordPart key={p.id} p={{ ...p, shop: slotOf(p.id).shop }} shot={shots.includes(p.id)} when={TAKEN[p.id]} eager mine={slotOf(p.id).mine}
                onTake={(el) => { if (shots.includes(p.id)) onView({ part: p.id, who: 'you' }, el); else onTake(p.id) }}
                shopTag={<>
                  <span className="ab-tag">{SHOP_TAG}</span>
                  <button type="button" className="ab-view" aria-label={`See the shop’s photo of the ${p.name.toLowerCase()} full size`} onClick={(e) => onView({ part: p.id, who: 'shop' }, e.currentTarget)} />
                </>}
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
// The preview stays until "Use photo" is tapped. "Retake" shows the same photo again, with a short fade so the tap is felt.
export function Camera({ part, retakes, onRetake, onUse }: { part: PartId; retakes: number; onRetake: () => void; onUse: () => void }) {
  const use = useRef<HTMLButtonElement>(null)
  useEffect(() => { use.current?.focus({ preventScroll: true }) }, [])
  return (
    <div className="ab-camera" data-log="camera" role="dialog" aria-modal="true" aria-label={CAPTION[part]}>
      <span className="ab-camera-cap">{CAPTION[part]}</span>
      <div key={retakes} className={`ab-camera-photo${retakes ? ' is-again' : ''}${part === 'drive' ? ' is-drive' : ''}`}>
        <Photo src={mineOf(part)} alt={`Your photo of the ${AB_PARTS.find((p) => p.id === part)!.name.toLowerCase()}`} width={390} height={278} first />
      </div>
      <div className="ab-camera-bar">
        <button type="button" data-log="camera-retake" onClick={onRetake}>Retake</button>
        <span className="ab-shutter" aria-hidden="true" />
        <button type="button" className="is-use" ref={use} data-log="camera-use" onClick={onUse}>Use photo</button>
      </div>
    </div>
  )
}

// ---------- A photo full size, from either column, the same in both versions ----------
export type PhotoView = { part: PartId; who: 'shop' | 'you' }
function ViewerFrame({ label, src, alt, caption, tall, onClose }: { label: string; src: string; alt: string; caption: string; tall?: boolean; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => { close.current?.focus({ preventScroll: true }) }, [])
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'Tab') e.preventDefault() // the close button is the only thing to reach
  }
  return (
    <div className={`ab-viewer${tall ? ' is-tall' : ''}`} role="dialog" aria-modal="true" aria-label={label} data-log="viewer-outside" onKeyDown={onKey}
      onClick={(e) => { if (!(e.target as Element).closest('img')) onClose() }}>
      <button type="button" className="ab-viewer-x" ref={close} data-log="viewer-close" aria-label="Close photo"><Icon name="x" /></button>
      <figure>
        <span data-log="viewer-photo"><Photo src={src} alt={alt} width={390} height={tall ? LAYOUT_H : 278} first /></span>
        <figcaption>{caption}</figcaption>
      </figure>
    </div>
  )
}
export function Viewer({ view, onClose }: { view: PhotoView; onClose: () => void }) {
  const p = AB_PARTS.find((x) => x.id === view.part)!, name = p.name.toLowerCase(), mine = view.who === 'you'
  return <ViewerFrame label={`Photo of the ${name}`} src={mine ? mineOf(p.id) : p.shop} alt={mine ? `Your photo of the ${name}` : `The shop’s photo of the ${name}`}
    caption={`${p.name} · ${mine ? `${TAKEN[p.id]} · you` : SHOP_TAG}`} onClose={onClose} />
}
// One of screen 7's pictures, full size: taller than the screen, so it scrolls.
export function LayoutViewer({ version, onClose }: { version: Variant; onClose: () => void }) {
  const l = LAYOUTS[version]
  return <ViewerFrame label={l.caption} src={l.src} alt={l.alt} caption={l.caption} tall onClose={onClose} />
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
            {AB_PARTS.filter((p) => shots.includes(p.id)).map((p) => (
              <button key={p.id} type="button" className="ab-thumb" data-log={`thumb:${p.id}`} aria-pressed={photos.includes(p.id)} aria-label={`Attach your photo of the ${p.name.toLowerCase()}`} onClick={() => onTogglePhoto(p.id)}>
                <Photo src={slotOf(p.id).mine} alt="" width={64} height={48} first />
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

// ---------- Q1 to Q5: one question per screen ----------
function QScreen({ n, title, caption, ready, next = 'Next', onNext, children }: { n: number; title: string; caption?: string; ready: boolean; next?: string; onNext: () => void; children: ReactNode }) {
  const top = useRef<HTMLDivElement>(null)
  useEffect(() => { top.current?.focus({ preventScroll: true }) }, [])
  return (
    <>
      <main className="screen d-screen ab-screen ab-qs" aria-label={`Question ${n} of 5`}>
        <div className="ab-qs-in ab-focus" ref={top} tabIndex={-1}>
          <Mono>{n} of 5</Mono>
          <h1 className="t-h1">{title}</h1>
          {caption && <p className="small">{caption}</p>}
          {children}
        </div>
      </main>
      <div className="dock" data-log={`next-disabled:${n}`}>
        <button type="button" className="cta s11-save ab-main" data-log={`next:${n}`} disabled={!ready} onClick={onNext}>{next}</button>
      </div>
    </>
  )
}
// The app's radio row, one of a few.
const Row = ({ label, on, log, onPick }: { label: string; on: boolean; log: string; onPick: () => void }) => (
  <button type="button" className="opt ab-row" aria-pressed={on} data-log={log} onClick={onPick}><span className="rad" /><b>{label}</b></button>
)
const Rows = ({ label, name, options, value, onPick }: { label: string; name: string; options: string[]; value: string; onPick: (v: string) => void }) => (
  <div className="ab-rows" role="group" aria-label={label}>
    {options.map((o) => <Row key={o} label={o} on={value === o} log={`${name}:${o}`} onPick={() => onPick(o)} />)}
  </div>
)
const Tiles = ({ label, name, value, low, high, onPick }: { label: string; name: string; value: number; low: string; high: string; onPick: (n: number) => void }) => (
  <div>
    <div className="ab-scale" role="group" aria-label={`${label}, 1 is ${low}, 7 is ${high}`}>
      {[1, 2, 3, 4, 5, 6, 7].map((n) => <button key={n} type="button" className="ab-tile" aria-pressed={value === n} data-log={`${name}:${n}`} onClick={() => onPick(n)}>{n}</button>)}
    </div>
    <div className="ab-ends"><span>{low}</span><span>{high}</span></div>
  </div>
)
// One line tall, growing as they type.
function Field({ id, placeholder, value, onChange }: { id: string; placeholder: string; value: string; onChange: (s: string) => void }) {
  const box = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`
  }, [value])
  return <textarea id={id} ref={box} name={id} rows={1} autoComplete="off" className="ab-field ab-grow" aria-label={placeholder} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
}

export function Q1({ value, onPick, onNext }: { value: string; onPick: (v: string) => void; onNext: () => void }) {
  const title = 'Did you notice anything wrong with the bike?'
  return <QScreen n={1} title={title} ready={!!value} onNext={onNext}><Rows label={title} name="noticed" options={NOTICED} value={value} onPick={onPick} /></QScreen>
}
export function Q2({ value, onPick, onNext }: { value: number; onPick: (n: number) => void; onNext: () => void }) {
  const title = 'Overall, how difficult or easy was the task?'
  return <QScreen n={2} title={title} ready={value > 0} onNext={onNext}><Tiles label={title} name="seq" value={value} low="Very difficult" high="Very easy" onPick={onPick} /></QScreen>
}
export function Q3({ ease, not, where, onEase, onNot, onWhere, onNext }: {
  ease: number; not: boolean; where: string; onEase: (n: number) => void; onNot: () => void; onWhere: (s: string) => void; onNext: () => void
}) {
  const title = 'How easy was it to find where to report a problem with the bike?'
  return (
    <QScreen n={3} title={title} ready={ease > 0 || not} onNext={onNext}>
      <Tiles label={title} name="find" value={ease} low="Very hard" high="Very easy" onPick={onEase} />
      <Row label="I didn’t look for it" on={not} log="find:not-looked" onPick={onNot} />
      <Field id="ab-find-where" placeholder="Where did you look first? (optional)" value={where} onChange={onWhere} />
    </QScreen>
  )
}
export function Q4({ left, pick, why, onPick, onView, onWhy, onNext }: {
  left: Variant; pick: Variant | null; why: string; onPick: (v: Variant) => void; onView: (v: Variant, from: HTMLElement) => void; onWhy: (s: string) => void; onNext: () => void
}) {
  const order: Variant[] = left === 'a' ? ['a', 'b'] : ['b', 'a']
  return (
    <QScreen n={4} title="Which layout would you rather use?" caption="Two versions of the page you just used. Tap a picture to see it full size." ready={!!pick} onNext={onNext}>
      <div className="ab-picks" role="group" aria-label="Which layout would you rather use?">
        {order.map((v) => (
          <div key={v} className={`ab-pick${pick === v ? ' is-on' : ''}`} style={{ '--ar': 390 / LAYOUT_H } as CSSProperties}>
            <button type="button" className="ab-pick-img" data-log={`pref-view:${v.toUpperCase()}`} aria-label={`See “${LAYOUTS[v].caption}” full size`} onClick={(e) => onView(v, e.currentTarget)}>
              <Photo src={LAYOUTS[v].src} alt={LAYOUTS[v].alt} width={170} height={Math.round(170 * LAYOUT_H / 390)} first />
            </button>
            <Row label={LAYOUTS[v].caption} on={pick === v} log={`pick:${v.toUpperCase()}`} onPick={() => onPick(v)} />
          </div>
        ))}
      </div>
      <Field id="ab-why" placeholder="Why? (optional)" value={why} onChange={onWhy} />
    </QScreen>
  )
}
export function Q5({ cycling, rented, age, onCycling, onRented, onAge, onFinish }: {
  cycling: string; rented: string; age: string; onCycling: (v: string) => void; onRented: (v: string) => void; onAge: (v: string) => void; onFinish: () => void
}) {
  const group = (label: string, name: string, options: string[], value: string, onPick: (v: string) => void) => (
    <section className="ab-group5">
      <Mono>{label}</Mono>
      <Rows label={label} name={name} options={options} value={value} onPick={onPick} />
    </section>
  )
  return (
    <QScreen n={5} title="About you" caption="So we can describe who took part." ready={!!cycling && !!rented && !!age} next="Finish" onNext={onFinish}>
      {group('How often do you cycle?', 'cycling', CYCLING, cycling, onCycling)}
      {group('Rented sports or outdoor gear before?', 'rented', RENTED, rented, onRented)}
      {group('Your age', 'age', AGES, age, onAge)}
    </QScreen>
  )
}

// ---------- S9 · Thank you ----------
export const Thanks = () => (
  <PhotoSheet label="Thank you">
    <h1 className="t-h1">Done, thank you!</h1>
    <p className="lede">You can close this tab now.</p>
  </PhotoSheet>
)
