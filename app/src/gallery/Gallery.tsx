import { useEffect, useRef, useState, type ReactNode } from 'react'
import tokensCss from '@design/tokens.css?raw'
import { Icon } from '../shell/Icon'
import { Photo } from '../shell/Photo'
import {
  BackButton, Chev, Hairline, LineIcon, MeasuredGrid, Measure, Mono, Sheet, TabBar, TimeSkip, haptic, useSheet, useToast,
} from '../shell/direction'
import { Tape } from '../pages/03-fit-profile/session'
import { Fit } from '../shell/store'
import post from '@photos/01-home/assets/01-direction-02-coach-post.webp'
import '../pages/06-delivery-return/delivery.css'
import '../pages/08-booking-confirmation/booked.css'
import '../pages/03-fit-profile/fit.css'
import './gallery.css'

// The components page: every shared piece of the app, live, from the same CSS and React components the pages use
// (design/tokens.css, design/components.css, shell/direction.tsx and the pages' own done marks). Nothing here is
// redrawn, so the page cannot drift from the app. Colours and type are read from tokens.css itself.

type Tok = { name: string; value: string; group: string }
function readTokens(): Tok[] {
  const out: Tok[] = []
  let group = 'Colour'
  for (const line of tokensCss.split('\n')) {
    const g = line.match(/^\s*\/\*\s*([^*]+?)\s*\*\//)
    if (g && !line.includes('--')) group = g[1].split(':')[0].split('(')[0].trim()
    const m = line.match(/^\s*(--[a-z0-9-]+):\s*([^;]+);/)
    if (m && /^(#|rgba?\()/.test(m[2].trim())) out.push({ name: m[1], value: m[2].trim(), group })
  }
  const seen = new Set<string>()
  return out.filter((t) => (seen.has(t.name) ? false : (seen.add(t.name), true)))
}
const TYPE: { cls: string; label: string; spec: string; text: string }[] = [
  { cls: 'hero-num', label: 'Hero number', spec: '76 / 76 · 600 · −0.055em', text: 'S$150' },
  { cls: 't-h1', label: 'Heading 1', spec: '32 / 36 · 600 · −0.032em', text: 'Delivery and collection' },
  { cls: 't-h2', label: 'Heading 2', spec: '19 / 24 · 600 · −0.015em', text: 'Set to your fit before delivery' },
  { cls: 'lede', label: 'Lede', spec: '15 / 22 · ink-2', text: 'All-in prices: the bike, delivery and collection.' },
  { cls: 'small', label: 'Small', spec: '13 / 18 · ink-2', text: 'Recorded by the shop before your rental.' },
  { cls: 'mono', label: 'Measured label · Geist Mono', spec: '11 / 14 · 500 · 0.08em · uppercase', text: 'Photo 1 of 5 · 12 Oct' },
]

// The pages themselves, opened in a given story state (?seed=), scaled down. Nothing is redrawn.
const MINIS: { page: string; label: string; y: number; seed: object }[] = [
  { page: '11-handover-check', label: '11 · the record folds into a slip', y: 120, seed: { paid: true, now: 79 + 40 / 60, arrived: true, record: { shots: ['crank', 'saddle', 'drive'], marks: ['crank', 'saddle'], saved: true } } },
  { page: '13-weekly-ride', label: '13 · the ring ties the series', y: 0, seed: { paid: true, closed: true, weekly: true, now: 86.1, arrived: true, record: { shots: ['crank', 'saddle', 'drive'], marks: ['crank', 'saddle'], saved: true } } },
  { page: '15-equipment-detail', label: '15 · the forest intake dot', y: 250, seed: { now: 178, storage: { way: 'home', booked: true, hub: true } } },
  { page: '17-hub-pickup', label: '17 · the token on the dial', y: 260, seed: { storage: { way: 'home', booked: true } } },
]
function Mini({ page, label, y, seed }: { page: string; label: string; y: number; seed: object }) {
  const src = `/${page}?seed=${btoa(JSON.stringify(seed))}`
  return (
    <figure className="g-mini">
      <div className="g-mini-ph">
        <iframe title={label} src={src} width={393} height={852} loading="lazy"
          onLoad={(e) => { const d = (e.target as HTMLIFrameElement).contentDocument; window.setTimeout(() => { const sc = d?.querySelector('.frame-stage > .screen'); if (sc) sc.scrollTop = y }, 900) }} />
      </div>
      <figcaption><Mono>{label}</Mono><a className="link" href={src}>Open</a></figcaption>
    </figure>
  )
}

function Sec({ id, title, note, children }: { id: string; title: string; note: ReactNode; children: ReactNode }) {
  return (
    <section className="g-sec" id={id} aria-labelledby={`${id}-h`}>
      <header><h2 className="t-h2" id={`${id}-h`}>{title}</h2><p className="small">{note}</p></header>
      <div className="g-panel">{children}</div>
    </section>
  )
}
function State({ label, children }: { label: string; children: ReactNode }) {
  return <div className="g-state"><Mono>{label}</Mono>{children}</div>
}

export default function Gallery() {
  const toks = readTokens()
  const groups = [...new Set(toks.map((t) => t.group))]
  const [toastNode, toast] = useToast()
  const sheet = useSheet()
  const [skip, setSkip] = useState(0)
  const [chip, setChip] = useState('7:40')
  const [opt, setOpt] = useState(0)
  const [flashKey, setFlashKey] = useState(0)
  const tape1 = useRef<HTMLDivElement>(null)
  const tape2 = useRef<HTMLDivElement>(null)
  const [h, setH] = useState(176)
  const [leg, setLeg] = useState(81)
  const [stampKey, setStampKey] = useState(0)

  useEffect(() => { document.title = 'OutRent components' }, [])
  useEffect(() => {
    const a = tape1.current && Tape(tape1.current, { min: 150, max: 200, value: 176, bands: Fit.chart, onChange: setH })
    const b = tape2.current && Tape(tape2.current, { min: 60, max: 95, value: 81, sub: 0.883, onChange: setLeg })
    return () => { a?.destroy(); b?.destroy() }
  }, [])

  return (
    <div className="gallery-page">
      <div className="gallery">
        <header className="g-head">
          <Mono>OutRent · the fitter’s line · v52</Mono>
          <h1 className="t-h1">Components</h1>
          <p className="lede">Every shared piece of the app as it is now, live and with its states. Built from the same files the app uses: design/tokens.css, design/components.css, the shell’s React components and the pages’ own done marks. Tap anything: it behaves as in the app.</p>
          <nav className="g-toc" aria-label="Sections">
            {['colour', 'type', 'measure', 'buttons', 'bars', 'cards', 'chips', 'tape', 'sheets', 'photos', 'done'].map((s) => <a key={s} href={`#${s}`}>{s}</a>)}
          </nav>
        </header>

        <Sec id="colour" title="Colour" note={<>Paper and ink, one forest green for the primary action and good news only. Read from tokens.css; pages use the names, never the values.</>}>
          {groups.map((g) => (
            <div key={g} className="g-group">
              <Mono>{g}</Mono>
              <div className="swatches">
                {toks.filter((t) => t.group === g).map((t) => (
                  <div key={t.name} className="sw"><i style={{ background: `var(${t.name})` }} /><b>{t.name}</b><span>{t.value}</span></div>
                ))}
              </div>
            </div>
          ))}
        </Sec>

        <Sec id="type" title="Type" note={<>Geist for the interface, Geist Mono for small measured labels. Daniel’s numbers are the largest things on a screen.</>}>
          {TYPE.map((t) => (
            <div key={t.cls} className="g-type"><Mono>{t.label} · {t.spec}</Mono><span className={t.cls}>{t.text}</span></div>
          ))}
        </Sec>

        <Sec id="measure" title="The fitter’s line" note={<>The measured line (a thin line, two ticks, a value), the measured grid (03, 05, 12), hairline rules. A value that changes flashes forest and settles to ink (1.1 s).</>}>
          <State label="Measured line"><div className="g-narrow"><Measure>S$50</Measure></div></State>
          <State label="Measured grid · tap to flash">
            <div className="g-narrow" key={flashKey} onClick={() => setFlashKey((k) => k + 1)}>
              <MeasuredGrid className={flashKey ? 'g-flash' : undefined} items={[{ k: 'Saddle', v: '72', unit: 'cm' }, { k: 'Frame', v: 'M' }, { k: 'Fork sag', v: '25', unit: '%' }, { k: 'Handlebar', v: '+1', unit: 'cm' }]} />
            </div>
          </State>
          <State label="Hairline · ink rule"><div className="g-narrow g-rules"><Hairline /><Hairline ink /></div></State>
        </Sec>

        <Sec id="buttons" title="Buttons" note={<>The primary action is one forest pill (54 px), pressed it scales to 0.97 in 120 ms. Disabled is rule grey and says what is missing. One ghost button for a second action. Links are forest text.</>}>
          <div className="g-row">
            <State label="Default"><button type="button" className="cta" onClick={haptic}>Choose delivery</button></State>
            <State label="Pressed"><button type="button" className="cta is-pressed">Choose delivery</button></State>
            <State label="Disabled"><button type="button" className="cta" disabled>Pick a delivery time</button></State>
            <State label="With icon"><button type="button" className="cta"><Icon name="magnifying-glass" />Search</button></State>
          </div>
          <div className="g-row">
            <State label="Ghost"><div className="g-w240"><button type="button" className="ghostbtn">Back to Home</button></div></State>
            <State label="Ghost pressed"><div className="g-w240"><button type="button" className="ghostbtn is-pressed">Back to Home</button></div></State>
            <State label="Link"><button type="button" className="link">Edit fit</button></State>
          </div>
          <div className="g-row">
            <State label="Back"><BackButton label="Back" onClick={() => toast('Back goes to the page it names.')} /></State>
            <State label="Close"><BackButton label="Close" icon="x" onClick={() => toast('Close leaves the flow.')} /></State>
            <State label="Back on a photo"><div className="g-onphoto"><Photo src={post} alt="" width={120} height={80} /><BackButton label="Back" onPhoto onClick={() => toast('On a photo the button is frosted.')} /></div></State>
            <State label="Icon button"><button type="button" className="ibtn" aria-label="Notifications, 1 unseen"><Icon name="bell" /><span className="dot" aria-hidden="true" /></button></State>
            <State label="Sheet close"><button type="button" className="xbtn" aria-label="Close"><LineIcon name="x" /></button></State>
          </div>
        </Sec>

        <Sec id="bars" title="Top bar, dock, tab bar" note={<>The top bar holds Back and a mono title. The dock keeps the one action at the bottom over a paper fade. The tab bar marks the current tab with a forest tick; switching tabs cross-fades (350 ms).</>}>
          <div className="g-phone">
            <div className="bar-top"><BackButton label="Back" onClick={() => {}} /><Mono className="mid">Fit profile</Mono><span /></div>
            <div className="dock"><button type="button" className="cta" style={{ width: '100%' }}>Save fit</button></div>
          </div>
          <div className="g-phone g-short"><TabBar current="01-home" onToast={toast} /></div>
        </Sec>

        <Sec id="cards" title="White cards and rows" note={<>White only where one object must read as one: a booking, an option. Options are picked like radios: forest border and dot when selected.</>}>
          <div className="g-narrow">
            <button type="button" className="r9"><span className="dt"><b>25</b><span>SAT</span></span><span className="tx"><b>Trek Marlin 7 · size M</b><span>Delivered 7:40 · collected 13:30</span><span className="ok">In 12 h 40 min</span></span><Chev /></button>
            <button type="button" className="r9"><span className="dt is-ghost"><b>28</b><span>OCT</span></span><span className="tx"><b>Giant Escape 3 at the Hub</b><span>Since 28 Oct · S$18 / month</span></span><Chev /></button>
          </div>
          <div className="g-narrow">
            {['Door pickup', 'Rack drop-off · Rack S'].map((t, i) => (
              <button key={t} type="button" className="opt" aria-pressed={opt === i} onClick={() => setOpt(i)}><span className="rad" /><b>{t}</b><span className="pr">{i ? 'S$5' : 'S$10'}</span><span className="s">{i ? 'Leave it at the void deck rack before 7:00.' : 'Daily, 17:00–19:00 only.'}</span></button>
            ))}
            <div className="kv"><b>Shared courier run</b><span className="v">Free</span><span className="s">With 2 days’ notice</span></div>
          </div>
        </Sec>

        <Sec id="chips" title="Time chips" note={<>Three suggested times and Other. Selected is forest; Other is dashed until a time is picked on its wheel; pressed scales to 0.96.</>}>
          <div className="g-narrow">
            <div className="chips6">
              {['7:20', '7:40', '8:00'].map((t) => <button key={t} type="button" className="c6" aria-pressed={chip === t} onClick={() => setChip(t)}>{t}</button>)}
              <button type="button" className="c6 oth">Other</button>
            </div>
            <div className="chips6"><button type="button" className="c6 is-pressed">7:20</button><button type="button" className="c6" aria-pressed>7:40</button><button type="button" className="c6 oth">Other</button><button type="button" className="c6" aria-pressed>7:50</button></div>
            <p className="small">Row 2: pressed, selected, Other before and after a time is picked on its wheel.</p>
          </div>
        </Sec>

        <Sec id="tape" title="The tape (ruler input)" note={<>A scale dragged under a fixed forest needle; arrow keys move it by 1 cm; it settles on the nearest cm (250 ms) and gives a light tick. One scale with bands (height, S / M / L), or two on one tape (inside leg over the saddle it gives).</>}>
          <div className="g-narrow">
            <div className="rd3"><div><Mono>Height</Mono><b>{h}<small>cm</small></b></div><i className="fr-to" aria-hidden="true" /><div className="o"><Mono>Frame</Mono><b>{Fit.frame(h)}</b></div></div>
            <div className="tape" ref={tape1} role="slider" tabIndex={0} aria-label="Height" aria-valuemin={150} aria-valuemax={200} aria-valuenow={h}><svg aria-hidden="true" /><span className="needle" /></div>
            <div className="rd3"><div><Mono>Inside leg</Mono><b>{leg}<small>cm</small></b></div><i className="fr-to" aria-hidden="true" /><div className="o"><Mono>Saddle</Mono><b>{Math.round(Fit.saddleRaw(leg))}<small>cm</small></b></div></div>
            <div className="tape dual" ref={tape2} role="slider" tabIndex={0} aria-label="Inside leg" aria-valuemin={60} aria-valuemax={95} aria-valuenow={leg}><svg aria-hidden="true" /><span className="needle" /></div>
          </div>
        </Sec>

        <Sec id="sheets" title="Sheets, toast, time skip" note={<>A sheet rises over a scrim (450 ms), closes on the scrim, its X or Escape, and gives focus back. A toast says one short thing for 2.2 s. The time skip runs the clock on to the next thing that happens (2.2 s), its days marked on a line.</>}>
          <div className="g-row">
            <button type="button" className="ghostbtn g-w240" onClick={sheet.show}>Open a sheet</button>
            <button type="button" className="ghostbtn g-w240" onClick={() => toast('Profile is not in this demo yet.')}>Show a toast</button>
            <button type="button" className="ghostbtn g-w240" onClick={() => setSkip((k) => k + 1)}>Run a time skip</button>
          </div>
          <div className="g-phone g-tall">
            <div className="pad g-phone-copy"><Mono>Inside the phone</Mono><p className="small">Sheets, the toast and the time skip live inside the 393 px phone, as in the app.</p></div>
            <Sheet sheet={sheet} label="Pay with" title="Pay with" closeLabel="Close">
              <button type="button" className="opt" aria-pressed><span className="rad" /><b>PayNow</b><span /><span className="s">Your default. Pays the S$50 now.</span></button>
              <button type="button" className="opt" aria-pressed={false}><span className="rad" /><b>Visa ending 4821</b><span /><span className="s">Card on file.</span></button>
            </Sheet>
            {toastNode}
            {skip > 0 && <TimeSkip key={skip} from={9.2} to={67} caption="Friday evening. Set to your fit at 17:30, done at 18:10." onDone={() => setSkip(0)} />}
          </div>
        </Sec>

        <Sec id="photos" title="Photos and the stand-in" note={<>Photos are evidence, dated and framed, never wallpaper. Until a photo exists, a hatched plate names it: “Image to come”.</>}>
          <div className="g-row">
            <div className="g-photo"><Photo src={post} alt="Hardtails at the Chestnut trailhead" width={240} height={150} /></div>
            <div className="g-photo"><span className="todo" role="img" aria-label="Photo to come: Blk 325C Sengkang East Way"><span className="mono">Image to come</span><span className="w">Blk 325C Sengkang East Way, your home address</span></span></div>
          </div>
        </Sec>

        <Sec id="done" title="Done marks" note={<>Each page has its own way of saying done: 08 the stamp, 11 the folded slip, 13 the ring, 17 the token on the dial, 15 the forest intake dot. Tap the stamp to land it again (350 ms, power4.in, a light tick).</>}>
          <div className="g-row">
            <State label="08 · Paid stamp">
              <div className="g-stamp" onClick={() => setStampKey((k) => k + 1)}>
                <div key={stampKey} className={`stamp${stampKey ? ' g-land' : ''}`} role="img" aria-label="Paid S$50 on 22 Oct"><span>Paid</span><b>S$50</b><span>22 Oct</span></div>
              </div>
            </State>
          </div>
          <p className="small">The others live in their pages: below, the pages themselves at the moment each says done (the app, opened in that state).</p>
          <div className="g-minis">
            {MINIS.map((m) => <Mini key={m.page} {...m} />)}
          </div>
        </Sec>
      </div>
    </div>
  )
}
