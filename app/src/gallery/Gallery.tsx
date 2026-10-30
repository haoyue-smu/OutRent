import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from '../shell/Icon'
import { Photo } from '../shell/Photo'
import {
  BackButton, Chev, Hairline, IC_PATHS, LineIcon, MeasuredGrid, Measure, Mono, Sheet, TabBar, TimeSkip, haptic, useSheet, useToast,
} from '../shell/direction'
import { Tape } from '../pages/03-fit-profile/session'
import { Van } from '../pages/10-delivery-tracking/Tracking'
import { Fit } from '../shell/store'
import { useDragScroll } from '../shell/dragScroll'
import lockup from '@design/brand/outrent-lockup.svg?raw'
import post from '@photos/01-home/assets/01-direction-02-coach-post.webp'
import aisyah from '@photos/01-home/assets/01-direction-aisyah-avatar.webp'
import m7 from '@photos/04-search-results/assets/04-direction-marlin-7.webp'
import bike from '@photos/01-home/assets/01-direction-cat-bikes.webp'
import helmet from '@photos/02-coach-kit/assets/02-direction-kit-helmet.webp'
import {
  ICON_IDS, MOTION, PAIRS, RADII, RADIUS_USE, SHADOWS, SHADOW_USE, SPACES, TOKENS, WRITING,
  colourGroups, contrast, iconUse, lineUse, unfiled, type Row,
} from './data'
import './gallery.css'

// The OutRent style guide (/components). Layer 1 is for anyone: plain words, the main colours, the building blocks,
// live, from the same classes and components the app uses. Layer 2, closed until asked for, is the developer reference:
// every token, read from tokens.css and the pages' own CSS (data.ts), with its use and its contrast.

const VERSION = 'v60 · 31 Oct 2026'
const CONTENTS: [string, string][] = [
  ['colour', 'Colour'], ['type', 'Typography'], ['space', 'Spacing, layout and grid'], ['shape', 'Radii, rules and elevation'],
  ['icons', 'Iconography'], ['components', 'Components'], ['motion', 'Motion'],
]

function Sec({ id, title, intro, children }: { id: string; title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <section className="g-sec" id={id} aria-labelledby={`${id}-h`}>
      <header className="g-sec-h"><h2 id={`${id}-h`}>{title}</h2><p className="lede">{intro}</p></header>
      {children}
    </section>
  )
}
function Sub({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return <div className="g-sub"><h3 className="t-h2">{title}</h3>{note && <p className="small">{note}</p>}{children}</div>
}
// One component: what it is for, what it is not for, its states.
function Comp({ name, yes, no, wide, children }: { name: string; yes: string; no: string; wide?: boolean; children: ReactNode }) {
  return (
    <article className={`g-comp${wide ? ' is-wide' : ''}`} aria-label={name}>
      <header><h4>{name}</h4><dl className="g-usefor"><div><dt>Use it for</dt><dd>{yes}</dd></div><div><dt>Don’t use it for</dt><dd>{no}</dd></div></dl></header>
      <div className="g-spec">{children}</div>
    </article>
  )
}
function St({ label, children }: { label: string; children: ReactNode }) {
  return <div className="g-state"><Mono>{label}</Mono>{children}</div>
}
const Where = ({ w, via }: { w: string[]; via?: string[] }) => <>{w.length ? w.join(', ') : via?.length ? `through ${via.slice(0, 2).join(', ')}` : 'Not used'}</>

// Contrast, with the verdict in words: colour alone never carries it.
function Ratio({ fg, bg, under }: { fg: string; bg: string; under?: string }) {
  const r = contrast(fg, bg, under)
  if (r == null) return <span className="g-na">n/a</span>
  return <span className={`g-ratio ${r >= 4.5 ? 'pass' : 'fail'}`}>{r.toFixed(2)} <b>{r >= 4.5 ? 'Pass' : 'Fail'}</b></span>
}

function ColourTable({ rows }: { rows: Row[] }) {
  return (
    <div className="g-scroll"><table className="g-table">
      <thead><tr><th>Colour</th><th>Token</th><th>Value</th><th>Role</th><th>Where it is used</th><th>Contrast as text</th></tr></thead>
      <tbody>
        {rows.map((r) => {
          const on = PAIRS.filter((p) => p.fg === r.name)
          return (
            <tr key={r.name}>
              <td><i className="g-swatch" style={{ background: `var(${r.name})` }} /></td>
              <td><code>{r.name}</code></td>
              <td className="g-val">{r.value}</td>
              <td>{r.filed?.role}</td>
              <td>{r.filed?.use}<span className="g-pages">Pages: <Where w={r.where} via={r.via} /></span></td>
              <td className="g-contrast">{on.length
                ? on.map((p) => <span key={p.bg}>On {p.on} <Ratio fg={p.fg} bg={p.bg} under={p.under} /></span>)
                : <span className="g-na">— not used as text</span>}</td>
            </tr>
          )
        })}
      </tbody>
    </table></div>
  )
}

// A live type sample that reports its own size, line height, weight and tracking.
function TypeRow({ role, use, children }: { role: string; use: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [spec, setSpec] = useState('')
  useLayoutEffect(() => {
    const el = box.current?.querySelector<HTMLElement>('[data-m]')
    if (!el) return
    const c = getComputedStyle(el), fs = parseFloat(c.fontSize), ls = c.letterSpacing === 'normal' ? 0 : parseFloat(c.letterSpacing)
    setSpec(`${fs} / ${c.lineHeight === 'normal' ? 'auto' : parseFloat(c.lineHeight)} · ${c.fontWeight} · ${ls ? (ls / fs).toFixed(3).replace('0.', '.') + ' em' : '0'}`)
  }, [])
  return (
    <div className="g-type" ref={box}>
      <div className="g-type-k"><b>{role}</b><span className="small">{use}</span><code>{spec}</code></div>
      <div className="g-type-v">{children}</div>
    </div>
  )
}

const seedUrl = (page: string, seed: object) => `/${page}?seed=${btoa(JSON.stringify(seed))}`
const RODE = { paid: true, book: { d: '7:40', c: '13:30' }, arrived: true, record: { shots: ['crank', 'saddle', 'drive'], marks: ['crank', 'saddle'], saved: true } }
function Reference() {
  const [toastNode, toast] = useToast()
  const sheet = useSheet()
  const [skip, setSkip] = useState(0)
  const [chip, setChip] = useState('7:40')
  const [day, setDay] = useState(28)
  const [opt, setOpt] = useState(0)
  const [drawer, setDrawer] = useState<'up' | 'down'>('up')
  const [flashKey, setFlashKey] = useState(0)
  const tape1 = useRef<HTMLDivElement>(null)
  const tape2 = useRef<HTMLDivElement>(null)
  const row = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const shadows = useRef<HTMLDivElement>(null)
  useDragScroll(() => [row.current, rail.current, shadows.current])
  const [h, setH] = useState(176)
  const [leg, setLeg] = useState(81)

  useEffect(() => {
    const a = tape1.current && Tape(tape1.current, { min: 150, max: 200, value: 176, bands: Fit.chart, onChange: setH })
    const b = tape2.current && Tape(tape2.current, { min: 60, max: 95, value: 81, sub: 0.883, onChange: setLeg })
    const r = row.current, c = r?.querySelector<HTMLElement>('[data-t="7:40"]')
    if (r && c) r.scrollLeft = c.offsetLeft - r.clientWidth / 2 + c.offsetWidth / 2
    return () => { a?.destroy(); b?.destroy() }
  }, [])

  const icons = ICON_IDS.map((id) => ({ id, where: iconUse(id) })).filter((i) => i.where.length)
  const lines = Object.keys(IC_PATHS).filter((id) => !ICON_IDS.includes(id) || lineUse(id).length).map((id) => ({ id, where: ICON_IDS.includes(id) ? lineUse(id) : iconUse(id) })).filter((i) => i.where.length)

  return (
    <>
      <p className="g-contrast-rule">Every token, with its value, its use and its pages. Read from the app’s own files.</p>
      <nav className="g-toc" aria-label="Reference contents">
        <ol>{CONTENTS.map(([id, t], i) => <li key={id}><a href={`#${id}`}><span>{String(i + 1).padStart(2, '0')}</span>{t}</a></li>)}</ol>
      </nav>

        <Sec id="colour" title="Colour" intro={<>Every colour of the interface, read from <code>design/tokens.css</code>. Pages use the names, never the values; the check blocks anything else. Where it is used comes from the source of each page. Colours that live only inside photos, maps and drawings are not part of the UI palette.</>}>
          <div className="g-mains">
            <div className="g-main is-paper"><span>Paper</span><code>--paper {TOKENS['--paper']}</code><small>Main · the ground of every page</small></div>
            <div className="g-main is-forest"><span>Forest</span><code>--forest {TOKENS['--forest']}</code><small>Main · the primary action and good news</small></div>
          </div>
          <p className="g-contrast-rule">Contrast is checked against the backgrounds each colour is used on as text; WCAG AA 4.5:1.</p>
          {colourGroups.map((g) => <Sub key={g.title} title={g.title} note={g.note}><ColourTable rows={g.rows} /></Sub>)}
          {unfiled.length > 0 && <Sub title="Not filed yet" note="Colour tokens with no recorded role."><ColourTable rows={unfiled} /></Sub>}
        </Sec>

        <Sec id="type" title="Typography" intro={<>Two families: <b>Geist</b> for the interface, <b>Geist Mono</b> for small measured labels. Sizes are read from the samples themselves: size / line height · weight · tracking.</>}>
          <Sub title="Roles">
            <TypeRow role="Display, hero" use="One figure, the page’s news (12)"><span className="hero-num" data-m>S$150</span></TypeRow>
            <TypeRow role="Display, price" use="The storage price plate (16)"><div className="plate g-plain"><div className="p"><b data-m>S$18</b></div></div></TypeRow>
            <TypeRow role="Display, time" use="The arrival time on the map (10)"><div className="eta2 g-plain"><b data-m>7:40</b></div></TypeRow>
            <TypeRow role="Title, page" use="One per page"><div className="t-h1" data-m>Delivery and collection</div></TypeRow>
            <TypeRow role="Value, reading" use="What a tape reads (03)"><div className="rd3 g-plain"><div><b data-m>176<small>cm</small></b></div></div></TypeRow>
            <TypeRow role="Value, grid" use="The measured grid"><dl className="mgrid g-plain"><div><dd data-m>72<small>cm</small></dd></div></dl></TypeRow>
            <TypeRow role="Title, section" use="A section or a sheet"><div className="t-h2" data-m>Set to your fit before delivery</div></TypeRow>
            <TypeRow role="Action" use="Primary buttons"><button type="button" className="cta" data-m>Choose delivery</button></TypeRow>
            <TypeRow role="Body" use="Running text, ledes"><p className="lede" data-m>All-in prices: the bike, delivery and collection.</p></TypeRow>
            <TypeRow role="Small" use="Second-level text"><p className="small" data-m>Recorded by the shop before your rental, so neither is charged to you.</p></TypeRow>
            <TypeRow role="Mono label" use="Measured labels, always uppercase"><span className="mono" data-m>Photo 1 of 5 · 12 Oct</span></TypeRow>
            <TypeRow role="Mono scale" use="Ticks on a scale"><span className="mono g-monos" data-m>7:00 · Your ride 8:00</span></TypeRow>
          </Sub>
          </Sec>

        <Sec id="space" title="Spacing, layout and grid" intro="One phone, one gutter, a 4 px spacing grid. Designed at 393 × 852 (iPhone 16) and checked at 360 px.">
          <div className="g-layout">
            <div className="g-framefig" aria-hidden="true">
              <span className="f-top">54 top safe area</span>
              <span className="f-gut l">20</span><span className="f-gut r">20</span>
              <span className="f-body">Content column<br />353 px</span>
              <span className="f-dock">Dock · 86<br />10 + 54 + 22</span>
            </div>
            <ul className="g-rules-list">
              <li><b>Frame.</b> 393 × 852. On a computer the phone is drawn, centred on a plain page; at 520 px or narrower the app fills the screen.</li>
              <li><b>Gutter.</b> {TOKENS['--gutter']} each side; cards that bleed sit 12 px in.</li>
              <li><b>Safe areas.</b> On a phone the top (<code>--top-safe</code>) and bottom (<code>--bottom-float</code>, <code>--bottom-tab</code>) follow the device’s insets, so nothing sits under the notch or the home indicator.</li>
              <li><b>Touch.</b> <code>--touch</code> {TOKENS['--touch']} at least, with invisible padding where the drawing is smaller.</li>
              <li><b>Measured grid.</b> Four equal columns between an ink rule and a hairline.</li>
            </ul>
          </div>
          <Sub title="Spacing steps">
            <div className="g-spaces">{SPACES.map((s) => <div key={s.name}><i style={{ width: `var(${s.name})`, height: `var(${s.name})` }} /><code>{s.name}</code><span>{s.value}</span></div>)}</div>
          </Sub>
        </Sec>

        <Sec id="shape" title="Radii, rules and elevation" intro="Soft corners on objects you can pick up, hairlines instead of boxes, shadows only where one thing sits over another.">
          <Sub title="Radii" note="Named radii, then the sizes in use in the pages’ CSS.">
            <div className="g-radii">
              {Object.entries(RADIUS_USE).map(([n, u]) => <div key={n}><i style={{ borderRadius: `var(${n})` }} /><code>{n}</code><span className="g-val">{TOKENS[n]}</span><span className="small">{u}</span></div>)}
            </div>
            <p className="g-legacy">{RADII.filter((r) => !r.value.startsWith('var')).map((r) => <code key={r.value}>{r.value} ({r.where.join(', ')})</code>)}</p>
          </Sub>
          <Sub title="Rules">
            <div className="g-rulesdemo">
              <div><Hairline /><span className="small"><b>Hairline</b> · 1 px <code>--rule</code>. Between rows.</span></div>
              <div><hr className="rule" style={{ borderTopColor: 'var(--rule-2)' }} /><span className="small"><b>Light hairline</b> · 1 px <code>--rule-2</code>. Inside a card.</span></div>
              <div><Hairline ink /><span className="small"><b>Ink rule</b> · 1 px <code>--ink</code>. Opens a measured group.</span></div>
              <div><hr className="rule" style={{ borderTop: '1.5px solid var(--ink)' }} /><span className="small"><b>Heavy ink rule</b> · 1.5 px. Heads a record or a tag.</span></div>
              <div><hr className="rule" style={{ borderTop: '1.5px dashed var(--rule)' }} /><span className="small"><b>Dashed</b> · an option not yet taken, the “Add an item” tile.</span></div>
              <div><hr className="rule" style={{ borderTop: '1.5px dotted var(--ink-3)' }} /><span className="small"><b>Dotted leader</b> · from a charge to its price (07).</span></div>
              <div><Measure>A value</Measure><span className="small"><b>The fitter’s line</b> · two ticks and a value.</span></div>
            </div>
          </Sub>
          <Sub title="Elevation" note="Only where one thing sits over another. Every shadow in use; drag the row for the rest.">
            <div className="g-shadowrow" ref={shadows}>
              {SHADOWS.map((x) => <div key={x.name}><i style={{ boxShadow: `var(${x.name})` }} /><code>{x.name.replace('--shadow-', '')}</code><span>{SHADOW_USE[x.name] ?? ''}</span></div>)}
            </div>
          </Sub>
        </Sec>

        <Sec id="icons" title="Iconography" intro={<>Phosphor, regular weight, from <code>design/icons.svg</code>, plus the prototype’s own line set for what Phosphor has no match for. {icons.length + lines.length} in use, shown at their size with their name.</>}>
          <Sub title="Phosphor">
            <div className="g-icons">{icons.map((i) => <div key={i.id}><Icon name={i.id} /><code>{i.id}</code><span>{i.where.join(', ')}</span></div>)}</div>
          </Sub>
          <Sub title="Line set">
            <div className="g-icons">{lines.map((i) => <div key={i.id}><LineIcon name={i.id} /><code>{i.id}</code><span>{i.where.join(', ')}</span></div>)}</div>
          </Sub>
          <Sub title="Drawn marks" note="Small marks drawn for one job.">
            <div className="g-icons">
              <div><svg viewBox="-10 -10 20 20" className="g-van" aria-hidden="true"><Van tone="mint" /></svg><code>van</code><span>10</span></div>
              <div><Chev /><code>chevron</code><span>Rows</span></div>
              <div><span className="kb need g-kb" aria-hidden="true"><Icon name="plus" /></span><code>not in your gear</code><span>02</span></div>
              <div><span className="kb have g-kb" aria-hidden="true"><Icon name="check" /></span><code>in your gear</code><span>02</span></div>
            </div>
          </Sub>
        </Sec>

        <Sec id="components" title="Components" intro="Each piece live, with its states and what it is for. Tap or tab through them: they behave as in the app. A state missing from a row does not exist for that piece. The done marks are in the style guide above.">
          <Sub title="Buttons">
            <Comp name="Primary pill" yes="The one thing to do next on a page, in the dock." no="Two on a page, or anything that is not the next step.">
              <St label="Default"><button type="button" className="cta" onClick={haptic}>Choose delivery</button></St>
              <St label="Pressed"><button type="button" className="cta is-pressed">Choose delivery</button></St>
              <St label="Disabled, says what is missing"><button type="button" className="cta" disabled>Pick a delivery time</button></St>
              <St label="Focus"><button type="button" className="cta is-focus">Choose delivery</button></St>
              <St label="With icon"><button type="button" className="cta"><Icon name="magnifying-glass" />Search</button></St>
            </Comp>
            <Comp name="Secondary (ghost)" yes="A second way out, next to or after the primary." no="The main action, or more than one on a page.">
              <St label="Default"><span className="g-w"><button type="button" className="ghostbtn">Back to Home</button></span></St>
              <St label="Pressed"><span className="g-w"><button type="button" className="ghostbtn is-pressed">Back to Home</button></span></St>
              <St label="Focus"><span className="g-w"><button type="button" className="ghostbtn is-focus">Back to Home</button></span></St>
            </Comp>
            <Comp name="Text link" yes="A small change or a side step: Change, Edit fit, All posts." no="The next step of a flow.">
              <St label="Default"><button type="button" className="link">Edit fit</button></St>
              <St label="Focus"><button type="button" className="link is-focus">Edit fit</button></St>
            </Comp>
            <Comp name="Back and close" yes="Leaving a page, always naming where in its label; on a photo it turns frosted." no="Going forward, or as the only way to finish a flow.">
              <St label="Back"><BackButton label="Back" onClick={() => toast('Back goes to the page it names.')} /></St>
              <St label="Pressed"><button type="button" className="back is-pressed" aria-label="Back"><Icon name="arrow-left" /></button></St>
              <St label="Focus"><button type="button" className="back is-focus" aria-label="Back"><Icon name="arrow-left" /></button></St>
              <St label="Close"><BackButton label="Close" icon="x" onClick={() => toast('Close leaves the flow.')} /></St>
              <St label="On a photo"><div className="g-onphoto"><Photo src={post} alt="" width={120} height={80} /><BackButton label="Back" onPhoto onClick={() => toast('On a photo the button is frosted.')} /></div></St>
              <St label="Icon button"><button type="button" className="ibtn" aria-label="Notifications, 1 unseen"><Icon name="bell" /><span className="dot" aria-hidden="true" /></button></St>
              <St label="Sheet close"><button type="button" className="xbtn" aria-label="Close"><LineIcon name="x" /></button></St>
            </Comp>
          </Sub>

          <Sub title="Bars">
            <Comp name="Top bar and dock" yes="Back and a mono title on top; the page’s one action at the bottom, over a paper fade." no="A row of actions, or a title that repeats the heading.">
              <div className="g-phone"><div className="bar-top"><BackButton label="Back" onClick={() => {}} /><Mono className="mid">Fit profile</Mono><span /></div><div className="dock"><button type="button" className="cta" style={{ width: '100%' }}>Save fit</button></div></div>
            </Comp>
            <Comp name="Tab bar" yes="The root pages: Home, Bookings, My gear, Profile. The current tab has a forest tick and ink, not just a colour." no="Inside a flow: flow pages have Back instead.">
              <div className="g-phone g-short"><TabBar current="01-home" onToast={toast} /></div>
            </Comp>
          </Sub>

          <Sub title="White cards" note="White only where one object must read as one. These two stand for all of them; the booking and the record are the same card with their own content.">
            <Comp name="Result and post" yes="Result: one thing you can pick, with its status and price (04). Post: something a person wrote (01, 02)." no="A list of facts, or OutRent’s own offers: those are promos.">
              <div className="g-w353"><button type="button" className="res">
                <span className="ph"><Photo src={m7} alt="This Trek Marlin 7 on the Timah Cycles stand" width={333} height={166} /><span className="fitchip"><Icon name="check" />Set to your fit before delivery</span></span>
                <span className="body"><span className="top"><b>Trek Marlin 7 · size M</b><span className="pr">S$50</span><span className="sub">Timah Cycles · shop · <b>4.8</b> (126)</span><span className="al">all in</span></span></span>
              </button></div>
              <div className="g-w353"><button type="button" className="post">
                <span className="who"><span className="av"><Photo src={aisyah} alt="Coach Aisyah" width={36} height={36} className="av-img" /></span><span><b>Coach Aisyah</b><span className="small">Mountain bike coach · posted a kit list</span></span></span>
                <span className="ph"><Photo src={post} alt="Hardtails and helmets at the Chestnut trailhead" width={325} height={203} className="post-img" /><span className="signed1"><span className="seal"><Icon name="check" /></span>Signed up</span></span>
                <span className="post-tx"><span className="h3">First ride at Chestnut</span><span className="small">Sat 25 Oct · 8:00–12:30 · what to rent, what to bring</span></span>
              </button></div>
            </Comp>
          </Sub>

          <Sub title="Chips">
            <Comp name="Time chips" yes="Picking a time from many: one row per leg that scrolls sideways and opens on the suggested time (06). Scroll this one." no="Fewer than four options: use option cards.">
              <div className="g-w353"><div className="chips6 row6" ref={row}>
                {['7:00', '7:20', '7:40', '8:00', '8:20', '8:40', '9:00', '9:20'].map((t) => (t === '7:00'
                  ? <button key={t} type="button" className="c6" data-t={t} disabled>{t}</button>
                  : <button key={t} type="button" className="c6" data-t={t} aria-pressed={chip === t} onClick={() => setChip(t)}>{t}</button>))}
              </div></div>
              <St label="Default"><button type="button" className="c6 g-chip">7:20</button></St>
              <St label="Pressed"><button type="button" className="c6 g-chip is-pressed">7:20</button></St>
              <St label="Selected"><button type="button" className="c6 g-chip" aria-pressed>7:40</button></St>
              <St label="Disabled"><button type="button" className="c6 g-chip" disabled>7:00</button></St>
              <St label="Focus"><button type="button" className="c6 g-chip is-focus">7:20</button></St>
            </Comp>
            <Comp name="Day chips" yes="A day from a week (17)." no="Dates far apart.">
              <div className="g-w353"><div className="days17">
                {[[25, 'SAT'], [26, 'SUN'], [27, 'MON'], [28, 'TUE'], [29, 'WED'], [30, 'THU'], [31, 'FRI']].map(([d, w]) => <button key={d} type="button" className="d17" aria-pressed={day === d} onClick={() => setDay(d as number)}><span>{w}</span><b>{d}</b></button>)}
              </div></div>
            </Comp>
            <Comp name="Label chips" yes="A short choice in a sheet: type, place (14)." no="Filtering a long list.">
              <St label="Default and selected"><div className="chips"><button type="button" aria-pressed={false}>Bike</button><button type="button" aria-pressed>Accessory</button><button type="button" aria-pressed={false}>Helmet</button></div></St>
            </Comp>
          </Sub>

          <Sub title="Scrolling rows" note="One helper, useDragScroll in shell/dragScroll.ts, serves every row that scrolls sideways: the 01 medallions, the 05 photos, the 06 time chips and any added later.">
            <Comp name="Drag to scroll" yes="Any row wider than the screen. With a mouse, press and drag: it follows, then settles on the nearest snap point in 320 ms. Try this one, and the time chips above." no="Up-and-down scrolling, or a value you set: that is the tape. Touch and trackpad never use it: they keep the browser’s own scrolling.">
              <St label="Rest: grab. Dragging: grabbing"><div className="g-photo g-rail"><div className="rail" ref={rail} tabIndex={0} role="region" aria-label="Sample photos, drag or swipe for more">
                {[m7, post, bike, helmet].map((s) => <figure key={s}><Photo src={s} alt="" width={240} height={150} /></figure>)}
              </div></div></St>
              <dl className="g-usefor g-dragrules">
                <div><dt>A drag is not a tap</dt><dd>After more than 6 px the click is dropped: no chip is picked, no photo opens. A plain click still works.</dd></div>
                <div><dt>While dragging</dt><dd>Text is not selected and an image never starts the browser’s own drag.</dd></div>
              </dl>
            </Comp>
          </Sub>

          <Sub title="Measuring">
            <Comp name="The tape (ruler input)" yes="A length: drag the scale under a fixed needle, or use the arrow keys. It settles on the nearest cm with a light tick. One scale with bands, or two on one tape." no="Anything that is not a measurement.">
              <div className="g-w353 g-tapes">
                <div className="rd3"><div><Mono>Height</Mono><b>{h}<small>cm</small></b></div><i className="fr-to" aria-hidden="true" /><div className="o"><Mono>Frame</Mono><b>{Fit.frame(h)}</b></div></div>
                <div className="tape" ref={tape1} role="slider" tabIndex={0} aria-label="Height" aria-valuemin={150} aria-valuemax={200} aria-valuenow={h}><svg aria-hidden="true" /><span className="needle" /></div>
                <div className="rd3"><div><Mono>Inside leg</Mono><b>{leg}<small>cm</small></b></div><i className="fr-to" aria-hidden="true" /><div className="o"><Mono>Saddle</Mono><b>{Math.round(Fit.saddleRaw(leg))}<small>cm</small></b></div></div>
                <div className="tape dual" ref={tape2} role="slider" tabIndex={0} aria-label="Inside leg" aria-valuemin={60} aria-valuemax={95} aria-valuenow={leg}><svg aria-hidden="true" /><span className="needle" /></div>
              </div>
            </Comp>
            <Comp name="Measured line and measured grid" yes="A total measured against its parts; the same four fit values on 03, 05, 08. A changed value flashes forest." no="Plain lists of facts.">
              <div className="g-w353 g-tapes">
                <Measure>S$50</Measure>
                <div key={flashKey}>
                  <MeasuredGrid className={flashKey ? 'g-flash' : undefined} items={[{ k: 'Saddle', v: '72', unit: 'cm' }, { k: 'Frame', v: 'M' }, { k: 'Fork sag', v: '25', unit: '%' }, { k: 'Handlebar', v: '+1', unit: 'cm' }]} />
                </div>
                <button type="button" className="link" onClick={() => setFlashKey((k) => k + 1)}>Change a value</button>
              </div>
            </Comp>
          </Sub>

          <Sub title="Sheets, drawers and messages">
            <Comp name="Sheet" yes="A short choice over the page. The scrim, its X and Escape close it; focus goes in and comes back." no="A whole step of a flow.">
              <div className="g-phone g-tall"><div className="pad g-phone-copy"><button type="button" className="ghostbtn" onClick={sheet.show}>Open the sheet</button></div>
                <Sheet sheet={sheet} label="Pay with" title="Pay with" closeLabel="Close" plainTitle>
                  <button type="button" className="opt" aria-pressed><span className="rad" /><b>PayNow</b><span /><span className="s">Your default. Pays the S$50 now.</span></button>
                  <button type="button" className="opt" aria-pressed={false}><span className="rad" /><b>Visa ending 4821</b><span /><span className="s">Card on file. Pays the S$50 now.</span></button>
                </Sheet>
              </div>
            </Comp>
            <Comp name="The post’s drawer (02)" yes="OutRent’s part on someone else’s content. It pops up on arrival and tucks away when you read." no="OutRent’s own pages: there is nothing to step aside from.">
              <div className="g-phone g-tall2"><button type="button" className="ghostbtn g-toggle" onClick={() => setDrawer((d) => (d === 'up' ? 'down' : 'up'))}>{drawer === 'up' ? 'Tuck it away' : 'Bring it back'}</button>
                <section className={`vsheet is-${drawer}`} aria-label="OutRent, for this ride">
                  <span className="grab" aria-hidden="true"><i /></span>
                  <div className="sh-head"><span className="sh-logo" role="img" aria-label="OutRent" dangerouslySetInnerHTML={{ __html: lockup }} /><Mono>For this ride</Mono></div>
                  <div className="sh-more"><div className="orow"><span className="th"><Photo src={bike} alt="" width={44} height={44} className="bike-img" /></span><span className="tx"><b>Mountain bike</b><span>Rent one, set to your fit and delivered to Chestnut.</span></span></div></div>
                  <button type="button" className="cta">Enter your fit to find a bike</button>
                </section>
              </div>
            </Comp>
            <Comp name="Toast and time skip" yes="A toast says one short thing for 2.2 s. The time skip runs the clock to the next thing that happens, with the days marked." no="Toast: anything you must act on. Skip: real waiting.">
              <div className="g-phone g-mid">
                <div className="pad g-phone-copy g-btns"><button type="button" className="ghostbtn" onClick={() => toast('Profile is not in this demo yet.')}>Show a toast</button><button type="button" className="ghostbtn" onClick={() => setSkip((k) => k + 1)}>Run a time skip</button></div>
                {toastNode}
                {skip > 0 && <TimeSkip key={skip} from={9.2} to={67} caption="Friday evening. Set to your fit at 17:30, done at 18:10." onDone={() => setSkip(0)} />}
              </div>
            </Comp>
          </Sub>

          <Sub title="Photos">
            <Comp name="Photo frame, dated caption, stand-in" yes="Evidence: this exact item, on this date. Until a photo exists, a hatched plate names it." no="Decoration, or a picture with no date where the date matters.">
              <St label="Frame with a status"><div className="g-photo"><Photo src={m7} alt="This Trek Marlin 7" width={240} height={150} /><span className="fitchip"><Icon name="check" />Set to your fit</span></div></St>
              <St label="Quieter status"><div className="g-photo"><Photo src={m7} alt="" width={240} height={150} /><span className="fitchip no">No set-up for your fit</span></div></St>
              <St label="Dated caption"><div className="caption g-plain g-cap"><Mono>Photo 1 of 5 · 12 Oct</Mono><span className="ticks5" aria-hidden="true"><i className="on" /><i /><i /><i /><i /></span></div></St>
              <St label="Image to come"><div className="g-photo"><span className="todo" role="img" aria-label="Photo to come"><span className="mono">Image to come</span><span className="w">Blk 325C Sengkang East Way, your home address</span></span></div></St>
            </Comp>
          </Sub>

          <Sub title="List rows">
            <Comp name="Booking row, option, key and value, kit row" yes="Booking row: a booking on a line. Option: one of a few, picked like a radio, selected with a dot as well as a colour. Key and value: a fact and its price. Kit row: a coach’s item, with one icon if OutRent knows it." no="Options without a dot; rows in a box inside a box.">
              <div className="g-w353 g-rows">
                <button type="button" className="r9"><span className="dt"><b>25</b><span>SAT</span></span><span className="tx"><b>Trek Marlin 7 · size M</b><span>Delivered 7:40 · collected 13:30</span><span className="ok">In 12 h 40 min</span></span><Chev /></button>
                {['Door pickup', 'Rack S drop-off'].map((t, i) => (
                  <button key={t} type="button" className="opt" aria-pressed={opt === i} onClick={() => setOpt(i)}><span className="rad" /><b>{t}</b><span className="pr">{i ? 'S$5' : 'S$10'}</span><span className="s">{i ? 'Leave it at Rack S before 7:00.' : 'Daily, 17:00–19:00 only.'}</span></button>
                ))}
                <div className="kv"><b>Shared courier run</b><span className="v">Free</span><span className="s">With 2 days’ notice</span></div>
                <ul className="kit">
                  <li className="kit-it"><span className="th"><span className="kb need" aria-hidden="true"><Icon name="plus" /></span><Photo src={bike} alt="" width={56} height={56} className="bike-img" /></span><span className="tx"><b>Hardtail mountain bike</b><span>Not in your gear.</span></span></li>
                  <li className="kit-it"><span className="th"><Photo src={helmet} alt="" width={56} height={56} /><span className="kb have" aria-hidden="true"><Icon name="check" /></span></span><span className="tx"><b>Bike helmet</b><span>In your gear.</span></span></li>
                </ul>
              </div>
            </Comp>
          </Sub>
        </Sec>

        <Sec id="motion" title="Motion" intro="Motion is a measurement being taken: lines draw, numbers settle, parts move on a spring. It is used only as feedback, a state change, spatial continuity or an explanation. With reduced motion set on the device, every motion lands on its end state.">
          <Sub title="Tokens" note="Short CSS transitions use these; longer moments are written with GSAP, with the values below.">
            <div className="g-motiontok">
              {['--t-press', '--t-quick', '--t-base', '--t-slow'].map((n) => <div key={n}><code>{n}</code><b>{TOKENS[n]}</b></div>)}
              <div className="wide"><code>--ease</code><b>{TOKENS['--ease']}</b></div>
            </div>
          </Sub>
          <Sub title="Key motions">
            <div className="g-scroll"><table className="g-table">
              <thead><tr><th>Motion</th><th>Where</th><th>How</th><th>What it explains</th><th>Reduced motion</th></tr></thead>
              <tbody>{MOTION.map((m) => <tr key={m.what}><td><b>{m.what}</b></td><td>{m.where}</td><td>{m.how}</td><td>{m.why}</td><td>{m.still}</td></tr>)}</tbody>
            </table></div>
          </Sub>
        </Sec>
    </>
  )
}

// ---------- Layer 1: the style guide, in plain English ----------
const PRINCIPLES = [
  'Two main colours: an off-white background and forest green.',
  'Green means the next thing to tap, or good news.',
  'Colour is never the only signal: a selected option is also filled, a finished step has a tick.',
  'All text is easy to read (contrast at least 4.5:1).',
  'Every button is big enough for a thumb (at least 44 px).',
  'Animation only shows that something changed.',
]
const COLOURS: { name: string; token: string; use: string; shades?: string[]; main?: boolean }[] = [
  { name: 'Off-white', token: '--paper', use: 'The background of every screen.', main: true },
  { name: 'Forest green', token: '--forest', use: 'The next thing to tap, and good news.', shades: ['--forest-2'], main: true },
  { name: 'Ink', token: '--ink', use: 'Headings, numbers and main text.' },
  { name: 'Grey', token: '--ink-2', use: 'Second-level text, small labels and thin lines.', shades: ['--ink-3', '--tick', '--rule', '--rule-2'] },
  { name: 'White', token: '--sheet', use: 'Cards and sheets.' },
  { name: 'Light green', token: '--mint', use: 'Selected items and finished steps.', shades: ['--mint-2', '--glow'] },
  { name: 'Tag paper', token: '--tag-paper', use: 'Only the paper job tag on a booked bike.', shades: ['--tag-paper-1', '--tag-paper-2', '--tag-paper-3', '--tag-label'] },
]
function Swatch({ c }: { c: (typeof COLOURS)[number] }) {
  return (
    <div className={`s-swatch${c.main ? ' is-main' : ''}`}>
      <i style={{ background: `var(${c.token})` }} />
      <span className="s-shades" aria-hidden="true">{c.shades?.map((t) => <i key={t} title={TOKENS[t]} style={{ background: `var(${t})` }} />)}</span>
      <b>{c.name}</b>
      <span className="s-hex">{TOKENS[c.token]}</span>
      <span className="s-use">{c.use}</span>
    </div>
  )
}
// A real sample that reports its own size.
function TextStyle({ name, use, children }: { name: string; use: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState('')
  useLayoutEffect(() => {
    const el = box.current?.querySelector<HTMLElement>('[data-m]')
    if (el) setSize(`${parseFloat(getComputedStyle(el).fontSize)} px`)
  }, [])
  return (
    <div className="s-text" ref={box}>
      <div><b>{name}</b><span>{size}</span><span>{use}</span></div>
      <div className="s-sample">{children}</div>
    </div>
  )
}
// What each icon is called in plain words. A new icon with no entry still shows, under its own file name.
const ICON_NAMES: Record<string, string> = {
  'arrow-left': 'Back', house: 'Home', 'house-fill': 'Home, selected', 'calendar-blank': 'Bookings', backpack: 'My gear', user: 'Profile',
  'map-pin': 'Place', 'map-pin-fill': 'Meeting point', ruler: 'Fit size', 'magnifying-glass': 'Search', x: 'Close', 'caret-right': 'Open', bell: 'Notifications',
  check: 'Done', 'arrow-right': 'Next', 'lock-simple': 'Secure', camera: 'Photo', flag: 'Report a problem', plus: 'Add', arrow: 'Next', pin: 'Place',
  wrench: 'Set-up', coins: 'Money earned', auto: 'Updates by itself', rain: 'Rain',
}
const iconLabel = (id: string) => ICON_NAMES[id] ?? id.replace(/-/g, ' ')
function Block({ title, about, children }: { title: string; about: string; children: ReactNode }) {
  return (
    <article className="s-block">
      <div className="s-block-t"><h3>{title}</h3><p>{about}</p></div>
      <div className="s-block-s">{children}</div>
    </article>
  )
}
const Lab = ({ t, children }: { t: string; children: ReactNode }) => <div className="s-lab"><span>{t}</span>{children}</div>
// A window on the real screen, opened at the moment the mark appears and closed in on the mark.
function Mark({ page, name, focus, zoom, seed }: { page: string; name: string; focus: string; zoom?: number; seed: object }) {
  return (
    <figure className="s-mark">
      <div><iframe title={name} src={seedUrl(page, seed)} width={393} height={852} loading="lazy" tabIndex={-1}
        onLoad={(e) => {
          const f = e.target as HTMLIFrameElement
          window.setTimeout(() => {
            const d = f.contentDocument, el = d?.querySelector(focus), sc = d?.querySelector('.frame-stage > .screen'), box = f.parentElement
            if (!el || !box) return
            // Scrolled by hand: scrollIntoView would also move this page around it.
            if (sc) sc.scrollTop += el.getBoundingClientRect().top - 300
            const r = el.getBoundingClientRect(), W = box.clientWidth, H = box.clientHeight
            const z = zoom ?? Math.min(W / (r.width + 16), H / (r.height + 16), 1)
            f.style.transform = `translate(${W / 2 - (r.left + r.width / 2) * z}px, ${H / 2 - (r.top + r.height / 2) * z}px) scale(${z})`
            f.style.opacity = '1'
          }, 1800)
        }} /></div>
      <figcaption>{name}</figcaption>
    </figure>
  )
}
const SEP = { paid: true, book: { d: '7:40', c: '13:30' } }

function StyleGuide() {
  const [toastNode, toast] = useToast()
  const sheet = useSheet()
  const [chip, setChip] = useState('7:40')
  const [day, setDay] = useState(28)
  const [drawer, setDrawer] = useState<'up' | 'down'>('up')
  const tape = useRef<HTMLDivElement>(null)
  const row = useRef<HTMLDivElement>(null)
  const [h, setH] = useState(176)
  useDragScroll(() => [row.current])
  useEffect(() => {
    const a = tape.current && Tape(tape.current, { min: 150, max: 200, value: 176, bands: Fit.chart, onChange: setH })
    const r = row.current, c = r?.querySelector<HTMLElement>('[data-t="7:40"]')
    if (r && c) r.scrollLeft = c.offsetLeft - r.clientWidth / 2 + c.offsetWidth / 2
    return () => a?.destroy()
  }, [])
  const seen = new Set<string>()
  const allIcons = [
    ...ICON_IDS.filter((id) => iconUse(id).length).map((id) => ({ id, node: <Icon name={id} /> })),
    ...Object.keys(IC_PATHS).filter((id) => (ICON_IDS.includes(id) ? lineUse(id).length : iconUse(id).length)).map((id) => ({ id, node: <LineIcon name={id} /> })),
  ].filter((i) => { const l = iconLabel(i.id); if (seen.has(l)) return false; seen.add(l); return true })

  return (
    <>
      <header className="s-head">
        <span className="g-lockup" role="img" aria-label="OutRent" dangerouslySetInnerHTML={{ __html: lockup }} />
        <h1>OutRent style guide</h1>
        <p>This page shows the colours, text styles, icons and building blocks used across the OutRent app, and the rules that keep every screen consistent. Everything here is taken from the app’s own code, so it always matches the app.</p>
      </header>

      <section className="s-sec" aria-labelledby="s-p"><h2 id="s-p">Principles</h2>
        <ul className="s-principles">{PRINCIPLES.map((p) => <li key={p}>{p}</li>)}</ul>
      </section>

      <section className="s-sec" aria-labelledby="s-c"><h2 id="s-c">Colours</h2>
        <div className="s-colours">{COLOURS.map((c) => <Swatch key={c.token} c={c} />)}</div>
      </section>

      <section className="s-sec" aria-labelledby="s-t"><h2 id="s-t">Text styles</h2>
        <div className="s-texts">
          <TextStyle name="Big number" use="The one figure that matters most on a screen."><span className="hero-num" data-m>S$150</span></TextStyle>
          <TextStyle name="Page title" use="One on each screen."><div className="t-h1" data-m>Delivery and collection</div></TextStyle>
          <TextStyle name="Section title" use="Starts a group on a screen."><div className="t-h2" data-m>Set to your fit before delivery</div></TextStyle>
          <TextStyle name="Body" use="Sentences and descriptions."><p className="lede" data-m>All-in prices: the bike, delivery and collection.</p></TextStyle>
          <TextStyle name="Small label" use="Names a value or a date. Always in capitals."><span className="mono" data-m>Photo 1 of 5 · 12 Oct</span></TextStyle>
        </div>
      </section>

      <section className="s-sec" aria-labelledby="s-i"><h2 id="s-i">Icons</h2>
        <div className="s-icons">{allIcons.map((i) => <div key={i.id}>{i.node}<span>{iconLabel(i.id)}</span></div>)}</div>
      </section>

      <section className="s-sec" aria-labelledby="s-b"><h2 id="s-b">Building blocks</h2>
        <div className="s-blocks">
          <Block title="Buttons" about="The main button is the next step, and there is one on a screen. The others are for a second choice, a small change, or going back.">
            <Lab t="Main"><button type="button" className="cta" onClick={haptic}>Choose delivery</button></Lab>
            <Lab t="Main, pressed"><button type="button" className="cta is-pressed">Choose delivery</button></Lab>
            <Lab t="Main, not ready"><button type="button" className="cta" disabled>Pick a delivery time</button></Lab>
            <Lab t="Secondary"><span className="s-ghost"><button type="button" className="ghostbtn">Back to Home</button></span></Lab>
            <Lab t="Text link"><button type="button" className="link">Edit fit</button></Lab>
            <Lab t="Back"><BackButton label="Back" onClick={() => toast('Back returns to the last screen.')} /></Lab>
          </Block>
          <Block title="Options" about="Tap one to choose it. The chosen one is filled green. A time that cannot be chosen has a dashed edge.">
            <Lab t="Times: slide sideways"><div className="s-w"><div className="chips6 row6" ref={row}>
              {['7:00', '7:20', '7:40', '8:00', '8:20', '8:40', '9:00', '9:20'].map((t) => (t === '7:00'
                ? <button key={t} type="button" className="c6" data-t={t} disabled>{t}</button>
                : <button key={t} type="button" className="c6" data-t={t} aria-pressed={chip === t} onClick={() => setChip(t)}>{t}</button>))}
            </div></div></Lab>
            <Lab t="Days"><div className="s-w"><div className="days17">
              {[[25, 'SAT'], [26, 'SUN'], [27, 'MON'], [28, 'TUE'], [29, 'WED'], [30, 'THU'], [31, 'FRI']].map(([d, w]) => <button key={d} type="button" className="d17" aria-pressed={day === d} onClick={() => setDay(d as number)}><span>{w}</span><b>{d}</b></button>)}
            </div></div></Lab>
          </Block>
          <Block title="Measuring tape and fit values" about="Slide the tape to enter a body measurement. The app turns it into the bike’s settings, always shown as the same four values.">
            <div className="s-w s-stack">
              <div className="rd3"><div><Mono>Height</Mono><b>{h}<small>cm</small></b></div><i className="fr-to" aria-hidden="true" /><div className="o"><Mono>Frame</Mono><b>{Fit.frame(h)}</b></div></div>
              <div className="tape" ref={tape} role="slider" tabIndex={0} aria-label="Height" aria-valuemin={150} aria-valuemax={200} aria-valuenow={h}><svg aria-hidden="true" /><span className="needle" /></div>
            </div>
            <div className="s-w"><MeasuredGrid items={[{ k: 'Saddle', v: '72', unit: 'cm' }, { k: 'Frame', v: 'M' }, { k: 'Fork sag', v: '25', unit: '%' }, { k: 'Handlebar', v: '+1', unit: 'cm' }]} /></div>
          </Block>
          <Block title="Cards" about="A white card holds one thing. A result is something you can choose. A post is something a person wrote.">
            <div className="s-w"><button type="button" className="res">
              <span className="ph"><Photo src={m7} alt="This Trek Marlin 7 on the Timah Cycles stand" width={333} height={166} /><span className="fitchip"><Icon name="check" />Set to your fit before delivery</span></span>
              <span className="body"><span className="top"><b>Trek Marlin 7 · size M</b><span className="pr">S$50</span><span className="sub">Timah Cycles · shop · <b>4.8</b> (126)</span><span className="al">all in</span></span></span>
            </button></div>
            <div className="s-w"><button type="button" className="post">
              <span className="who"><span className="av"><Photo src={aisyah} alt="Coach Aisyah" width={36} height={36} className="av-img" /></span><span><b>Coach Aisyah</b><span className="small">Mountain bike coach · posted a kit list</span></span></span>
              <span className="ph"><Photo src={post} alt="Hardtails and helmets at the Chestnut trailhead" width={325} height={203} className="post-img" /><span className="signed1"><span className="seal"><Icon name="check" /></span>Signed up</span></span>
              <span className="post-tx"><span className="h3">First ride at Chestnut</span><span className="small">Sat 25 Oct · 8:00–12:30 · what to rent, what to bring</span></span>
            </button></div>
          </Block>
          <Block title="Bottom bar and tab bar" about="The bottom bar keeps the main button in reach while you scroll. The tab bar moves between the four main areas of the app.">
            <div className="g-phone s-bar"><div className="dock"><button type="button" className="cta" style={{ width: '100%' }}>Save fit</button></div></div>
            <div className="g-phone s-bar"><TabBar current="01-home" onToast={toast} /></div>
          </Block>
          <Block title="Sheet, drawer and message" about="A sheet rises over the screen for a short choice. A drawer can be pushed out of the way. A message says one short thing, then goes.">
            <div className="g-phone s-over"><div className="pad g-phone-copy g-btns">
              <button type="button" className="ghostbtn" onClick={sheet.show}>Open the sheet</button>
              <button type="button" className="ghostbtn" onClick={() => toast('Profile is not in this demo yet.')}>Show a message</button>
            </div>
              {toastNode}
              <Sheet sheet={sheet} label="Pay with" title="Pay with" closeLabel="Close" plainTitle>
                <button type="button" className="opt" aria-pressed><span className="rad" /><b>PayNow</b><span /><span className="s">Your default. Pays the S$50 now.</span></button>
              </Sheet>
            </div>
            <div className="g-phone s-over"><button type="button" className="ghostbtn g-toggle" onClick={() => setDrawer((d) => (d === 'up' ? 'down' : 'up'))}>{drawer === 'up' ? 'Move the drawer away' : 'Bring it back'}</button>
              <section className={`vsheet is-${drawer}`} aria-label="OutRent, for this ride">
                <span className="grab" aria-hidden="true"><i /></span>
                <div className="sh-head"><span className="sh-logo" role="img" aria-label="OutRent" dangerouslySetInnerHTML={{ __html: lockup }} /><Mono>For this ride</Mono></div>
                <button type="button" className="cta">Enter your fit to find a bike</button>
              </section>
            </div>
          </Block>
          <Block title="Photo with date" about="Photos show the real item. The caption says when the photo was taken. A striped box holds the place of a photo that is still to come.">
            <div className="s-photo">
              <div className="g-photo"><Photo src={m7} alt="This Trek Marlin 7" width={240} height={150} /><span className="fitchip"><Icon name="check" />Set to your fit</span></div>
              <div className="caption g-plain"><Mono>Photo 1 of 5 · 12 Oct</Mono><span className="ticks5" aria-hidden="true"><button type="button" tabIndex={-1} className="on"><i /></button><button type="button" tabIndex={-1}><i /></button><button type="button" tabIndex={-1}><i /></button></span></div>
            </div>
            <div className="g-photo"><span className="todo" role="img" aria-label="Photo to come"><span className="mono">Image to come</span><span className="w">Blk 325C Sengkang East Way, your home address</span></span></div>
          </Block>
          <Block title="Done marks" about="When a task is finished, its screen shows one mark, so the moment is clear. Each kind of task has its own.">
            <div className="s-marks">
              <Mark page="08-booking-confirmation" name="Stamp: paid" focus=".stamp" zoom={1} seed={{ ...SEP, now: 9.2 }} />
              <Mark page="11-handover-check" name="Slip: record saved" focus=".filed" seed={{ ...RODE, now: 79.67 }} />
              <Mark page="13-weekly-ride" name="Ring: weekly ride set up" focus=".tag2 .hole" zoom={0.8} seed={{ ...RODE, closed: true, weekly: true, now: 86.1 }} />
              <Mark page="15-equipment-detail" name="Dot: arrived at the Hub" focus=".idle15" seed={{ now: 178, storage: { way: 'home', booked: true, hub: true } }} />
              <Mark page="17-hub-pickup" name="Token: pickup booked" focus=".dial17" seed={{ storage: { way: 'home', booked: true } }} />
            </div>
          </Block>
        </div>
      </section>

      <section className="s-sec" aria-labelledby="s-w"><h2 id="s-w">Writing</h2>
        <div className="g-scroll"><table className="g-table s-writing">
          <thead><tr><th>Rule</th><th>Write this</th><th>Not this</th></tr></thead>
          <tbody>{WRITING.map((w) => <tr key={w.rule}><td><b>{w.rule}</b></td><td>{w.yes}</td><td className="g-not">{w.no}</td></tr>)}</tbody>
        </table></div>
      </section>
    </>
  )
}

// One page, two layers: the style guide is open; the developer reference mounts only when asked for.
export default function Gallery() {
  const [open, setOpen] = useState(() => location.hash === '#reference')
  useEffect(() => { document.title = 'OutRent style guide' }, [])
  return (
    <div className="gallery-page">
      <div className="gallery">
        <StyleGuide />
        <section className="s-ref" id="reference">
          <button type="button" className="ghostbtn s-ref-t" aria-expanded={open} aria-controls="reference-body" onClick={() => setOpen((o) => !o)}>
            {open ? 'Hide the full reference' : 'Full reference for developers'}<Icon name="caret-right" small className={open ? 's-open' : undefined} />
          </button>
          {open && <div id="reference-body" className="s-ref-b"><Reference /></div>}
        </section>
        <footer className="g-foot"><span className="small">OutRent · version {VERSION} · IS211 Interaction Design and Prototyping, Singapore Management University · team G14T3.</span></footer>
      </div>
    </div>
  )
}
