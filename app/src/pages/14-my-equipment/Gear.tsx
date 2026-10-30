import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { Photo } from '../../shell/Photo'
import { Chev, LineIcon, Mono, Sheet, TabBar, haptic, still, useSheet, useToast } from '../../shell/direction'
import { routeFor } from '../../pages'
import { clockOf, dayOf, offRouteNow, set, setClock, useStore } from '../../shell/store'
import { dayLong, dm, hubNow, pickDay } from '../../shell/storage'
import corridor from '@photos/14-my-equipment/assets/14-direction-15-giant-corridor.webp'
import hubPhoto from '@photos/14-my-equipment/assets/14-direction-15-giant-hub.webp'
import canyon from '@photos/14-my-equipment/assets/14-direction-14-canyon-wall.webp'
import helmet from '@photos/14-my-equipment/assets/14-direction-02-kit-helmet.webp'
import box from '@photos/14-my-equipment/assets/14-direction-14-bike-box.webp'
import './gear.css'

// 14 My gear · the fitter's line. The idle Giant Escape 3 leads as one big photo card (it opens 15); everything
// else is a two-column photo grid ending in a dashed "Add an item" tile. Adding the track pump is real: it is
// kept in the story state, so the count and the grid stay after a reload.
// Source: the Creative Director's prototype v52 (#14). The card follows the story: pickup booked, at the Hub.

const OTHERS = [
  { src: canyon, alt: 'The Canyon Endurace on its wall bracket', b: 'Canyon Endurace', w: 'Road bike', ago: '2 days ago' },
  { src: helmet, alt: 'Daniel’s road helmet', b: 'Road helmet', w: 'Helmet', ago: '2 days ago' },
  { src: box, alt: 'The hard-shell bike box by the front door', b: 'Hard-shell bike box', w: 'Bike box', ago: '1 year ago', old: true },
]
const TYPES = ['Bike', 'Bike box', 'Helmet', 'Accessory']
const PLACES = ['Corridor', 'Hallway', 'Shelf', 'Living-room wall']
const NAME = 'Track pump'

export default function Gear() {
  const navigate = useNavigate()
  const [toastNode, toast] = useToast()
  const root = useRef<HTMLElement>(null)
  const s = useStore((x) => x)
  const st = s.storage
  const hub = st.hub
  const now = hub ? Math.max(s.now, hubNow(s)) : offRouteNow(s)
  const d = dayOf(now)
  const count = 4 + (s.added ? 1 : 0)

  useEffect(() => { setClock(clockOf(now)) }, [now])

  // The lead card settles and its flag slides on; the grid rises in turn.
  useLayoutEffect(() => {
    if (still() || !root.current) return
    const ctx = gsap.context(() => {
      gsap.from('.idlecard', { opacity: 0, y: 16, duration: 0.55, ease: 'power3.out' })
      gsap.fromTo('.idlecard .flag', { x: -12, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, delay: 0.45, ease: 'back.out(2)' })
      gsap.from('.gcard', { opacity: 0, y: 14, duration: 0.45, stagger: 0.07, delay: 0.25, ease: 'power3.out' })
    }, root)
    return () => ctx.revert()
  }, [])

  const sheet = useSheet()
  const [name, setName] = useState('')
  const [typing, setTyping] = useState(false)
  const [touched, setTouched] = useState(false)   // until Daniel taps the field, the typed name keeps its drawn caret
  const [ty, setTy] = useState('')
  const [wh, setWh] = useState('')
  const ready = !!(ty && wh && name.trim())

  // Opening the sheet types the name in, a letter at a time; it stays an ordinary field Daniel can change.
  useEffect(() => {
    if (!sheet.open || name) return
    if (still()) { setName(NAME); return }
    setTyping(true)
    let i = 0, t = 0
    const step = () => { i += 1; setName(NAME.slice(0, i)); if (i < NAME.length) t = window.setTimeout(step, 70); else setTyping(false) }
    t = window.setTimeout(step, 450)
    return () => { clearTimeout(t); setTyping(false) }
  }, [sheet.open]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = () => {
    if (!ready) return
    set({ added: { type: ty, where: wh, name: name.trim() } })
    sheet.hide()
    haptic()
    requestAnimationFrame(() => {
      const c = root.current?.querySelector<HTMLElement>('.gcard.new')
      if (!c) return
      if (!still()) gsap.from(c, { opacity: 0, scale: 0.9, duration: 0.5, delay: 0.3, ease: 'back.out(1.8)' })
      window.setTimeout(() => centerIn(c), 350)
    })
  }

  const added = s.added
  const flag = hub ? `At the OutRent Hub since ${dm(pickDay(s))}` : 'Not used since 24 May'
  const sub = hub ? 'Bike · OutRent Hub, Sungei Kadut · S$18 / month' : 'Bike · blocks the corridor · 175 × 105 × 60 cm'
  const go = hub ? 'See it at the Hub' : st.booked ? `Pickup booked · ${dayLong(pickDay(s))}` : 'Store it or rent it out'

  return (
    <>
      <main className="screen d-screen s14-screen" ref={root}>
        <header className="roothead"><div><Mono>{d.d} {d.m} · {count} items</Mono><h1 className="t-h1">My gear</h1></div></header>
        <div className="pad">
          <button type="button" className="idlecard" onClick={() => navigate(routeFor('15-equipment-detail'))}>
            <span className="ph">
              <Photo src={hub ? hubPhoto : corridor} alt={hub ? 'The Giant Escape 3 on a rack at the OutRent Hub' : 'The Giant Escape 3 in the corridor'} width={353} height={221} first className="ic-img" />
              <span className="flag mono">{flag}</span>
            </span>
            <span className="bd">
              <span className="row"><b>Giant Escape 3, 2021</b><span className="ago">{hub ? '1 day ago' : '5 months ago'}</span></span>
              <span className="small">{sub}</span>
              <span className="go">{go} <Chev /></span>
            </span>
          </button>

          <div className="lbl"><b>Everything else</b><Mono>Last used</Mono></div>
          <div className="ggrid">
            {OTHERS.map((o) => (
              <button key={o.b} type="button" className="gcard" onClick={() => toast('Only the Giant Escape 3 opens in this demo.')}>
                <span className="ph"><Photo src={o.src} alt={o.alt} width={171} height={171} /></span>
                <b>{o.b}</b><span className="w">{o.w}</span><span className={`ago${o.old ? ' old' : ''}`}>{o.ago}</span>
              </button>
            ))}
            {added && (
              <button type="button" className="gcard new" onClick={() => toast(`${added.name ?? NAME} · ${added.type.toLowerCase()}.`)}>
                <span className="ph nophoto"><LineIcon name="camera" /><Mono>No photo yet</Mono></span>
                <b>{added.name ?? NAME}</b><span className="w">{added.type}</span><span className="ago">Not used yet</span>
              </button>
            )}
            <button type="button" className="gcard add" aria-label="Add an item to My gear"
              onClick={() => (added ? toast(`${added.name ?? NAME} is already in My gear.`) : sheet.show())}>
              <span className="ph"><LineIcon name="plus" /></span><b>Add an item</b><span className="w">Name, type, where it lives</span>
            </button>
          </div>
        </div>
      </main>

      <TabBar current="14-my-equipment" onToast={toast} />

      <Sheet sheet={sheet} label="Add an item" title="Add an item" closeLabel="Close, back to My gear">
        <label className="fld">
          <Mono>Name</Mono>
          <span className={`in${typing ? ' typing' : ''}${touched ? '' : ' drawn'}`}>
            {!touched && <span className="mirror" aria-hidden="true">{name}<span className="caret" /></span>}
            <input type="text" name="item-name" value={name} onChange={(e) => setName(e.target.value)} onFocus={() => setTouched(true)} autoComplete="off" enterKeyHint="done" tabIndex={sheet.open ? 0 : -1} />
          </span>
        </label>
        <Chips label="Type" items={TYPES} value={ty} onPick={setTy} />
        <Chips label="Where it lives" items={PLACES} value={wh} onPick={setWh} />
        <p className="small s14-note">Last used: none recorded yet. It updates on its own when the item moves through OutRent.</p>
        <button type="button" className="cta s14-save" disabled={!ready} onClick={save}>{ready ? 'Add to My gear' : 'Choose a type and a place'}</button>
      </Sheet>
      {toastNode}
    </>
  )
}

function Chips({ label, items, value, onPick }: { label: string; items: string[]; value: string; onPick: (v: string) => void }) {
  return (
    <div className="fld" role="group" aria-label={label}>
      <Mono>{label}</Mono>
      <div className="chips">
        {items.map((x) => <button key={x} type="button" aria-pressed={x === value} onClick={() => { onPick(x); haptic() }}>{x}</button>)}
      </div>
    </div>
  )
}

// Scroll only the page's own list, never the phone.
function centerIn(el: HTMLElement) {
  const sc = el.closest<HTMLElement>('.screen'); if (!sc) return
  const r = el.getBoundingClientRect(), b = sc.getBoundingClientRect()
  sc.scrollTo({ top: sc.scrollTop + (r.top + r.height / 2) - (b.top + b.height / 2), behavior: still() ? 'auto' : 'smooth' })
}
