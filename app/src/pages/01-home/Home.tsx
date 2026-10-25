import { useEffect, useLayoutEffect, useRef, useState, type DragEvent, type MouseEvent, type PointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import lockup from '@design/brand/outrent-lockup-white.svg?raw'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { Chev, Mono, TabBar, still, useToast } from '../../shell/direction'
import { routeFor } from '../../pages'
import {
  RESTARTED, SAT, clockOf, collectAt, countdown, dateLabel, deliverAt, fitNow, hm, homeNow, isClosed, placeShort, restart, setClock, useStore,
} from '../../shell/store'
import post from '@photos/01-home/assets/01-direction-02-coach-post.webp'
import aisyah from '@photos/01-home/assets/01-direction-aisyah-avatar.webp'
import bikes from '@photos/01-home/assets/01-direction-cat-bikes.webp'
import kayaks from '@photos/01-home/assets/01-direction-cat-kayaks.webp'
import boards from '@photos/01-home/assets/01-direction-cat-paddleboards.webp'
import camping from '@photos/01-home/assets/01-direction-cat-camping.webp'
import storage from '@photos/01-home/assets/01-direction-storage-promo.webp'
import { dayLong, dm, nextDayBack, pickDay, poolBack, wd } from '../../shell/storage'
import './home.css'

// 01 Home · the fitter's line. A docket to fill in: what, to where, when. Below it what is coming up (once
// something is booked), the coach's post, activities to rent for, and two ways to get more from it.
// Source: the Creative Director's prototype v52 (no hash). The "Up next" rows are the app's: they show what has
// happened (booking made, weekly ride set up, the Giant Escape 3 going to or at the Hub), from the story state.

const SEARCH_LATER = 'Search starts from the coach’s post in this demo.'
const FIELDS = [
  { k: 'What', v: 'Bike, kayak, paddleboard, tent' },
  { k: 'To', v: 'Where you’ll use it' },
  { k: 'When', v: 'Pick a day' },
]
const MEDS = [
  { src: bikes, b: 'Cycling', gl: 'Bikes', pos: '40% 50%' },
  { src: kayaks, b: 'Kayaking', gl: 'Kayaks', pos: '50% 70%' },
  { src: boards, b: 'Paddleboarding', gl: 'Boards', pos: '50% 72%' },
  { src: camping, b: 'Camping', gl: 'Tents, mats', pos: '60% 65%' },
]

export default function Home() {
  const navigate = useNavigate()
  const [toastNode, toast] = useToast()
  const root = useRef<HTMLElement>(null)
  const meds = useRef<HTMLDivElement>(null)
  const s = useStore((x) => x)
  const now = homeNow(s)
  const h = now % 24
  const hello = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const closed = isClosed(s)
  const upcoming = s.paid && !closed
  const st = s.storage
  const hasNext = upcoming || (closed && s.weekly) || st.booked
  const f = fitNow(s)

  // Restarted (by /reset or the hold below): say so once.
  useEffect(() => {
    try { if (sessionStorage.getItem(RESTARTED)) { sessionStorage.removeItem(RESTARTED); window.setTimeout(() => toast('Demo restarted'), 400) } } catch { /* storage blocked */ }
  }, [toast])

  // Hidden reset on the logo, with a mouse, a trackpad (tap-to-click too), a finger or a pen (pointer events):
  // either hold it for 3 s (the logo fades to 40% while it counts; lifting, leaving or moving more than 10 px
  // cancels it), or tap it 3 times, each within 1 s of the one before. A single tap does nothing.
  const holdRef = useRef<{ t: number; x: number; y: number; at: number } | null>(null)
  const taps = useRef<{ n: number; last: number }>({ n: 0, last: 0 })
  const [holding, setHolding] = useState(false)
  const cancelHold = () => { if (holdRef.current) { clearTimeout(holdRef.current.t); holdRef.current = null } setHolding(false) }
  useEffect(() => () => { if (holdRef.current) clearTimeout(holdRef.current.t) }, [])
  const hold = {
    onPointerDown: (e: PointerEvent) => {
      if (holdRef.current) clearTimeout(holdRef.current.t)
      holdRef.current = { t: window.setTimeout(restart, 3000), x: e.clientX, y: e.clientY, at: performance.now() }
      setHolding(true)
    },
    onPointerMove: (e: PointerEvent) => { const h = holdRef.current; if (h && Math.hypot(e.clientX - h.x, e.clientY - h.y) > 10) cancelHold() },
    onPointerUp: () => {
      const now = performance.now(), short = holdRef.current && now - holdRef.current.at < 700
      cancelHold()
      if (!short) { taps.current = { n: 0, last: 0 }; return }
      taps.current = { n: now - taps.current.last <= 1000 ? taps.current.n + 1 : 1, last: now }
      if (taps.current.n >= 3) restart()
    },
    onPointerCancel: cancelHold, onPointerLeave: cancelHold,
    onContextMenu: (e: MouseEvent) => e.preventDefault(),
    onDragStart: (e: DragEvent) => e.preventDefault(),
  }

  useEffect(() => { setClock(s.paid || s.now > 67 ? clockOf(now) : '9:01') }, [now, s.paid, s.now])

  // The docket settles, its three lines slide in, the sections below rise in turn.
  useLayoutEffect(() => {
    if (still() || !root.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.docket', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' })
      gsap.fromTo('.docket .f', { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, delay: 0.15, ease: 'power2.out' })
      gsap.fromTo('.sec01', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.25, ease: 'power3.out' })
    }, root)
    return () => ctx.revert()
  }, [])

  // When the activities come into view, each medallion's arc is drawn in turn, like a fitter's line closing round it.
  useEffect(() => {
    const el = meds.current, sc = root.current
    if (!el || !sc || still()) return
    let ctx: gsap.Context | null = null
    const io = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return
      io.disconnect()
      ctx = gsap.context(() => {
        gsap.fromTo('.arc circle', { strokeDashoffset: 239 }, { strokeDashoffset: 0, duration: 0.7, stagger: 0.12, ease: 'power2.inOut' })
        gsap.fromTo('.med', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: 'back.out(1.8)' })
      }, el)
    }, { root: sc, threshold: 0.6 })
    io.observe(el)
    return () => { io.disconnect(); ctx?.revert() }
  }, [])

  const go = (page: string) => navigate(routeFor(page))

  return (
    <>
      <main className="screen d-screen h1-screen" ref={root}>
        <div className="band01">
          <div className="home-top">
            <span className={`lockup${holding ? ' is-holding' : ''}`} role="img" aria-label="OutRent" draggable={false} dangerouslySetInnerHTML={{ __html: lockup }} {...hold} />
            <button type="button" className="ibtn" aria-label="Notifications, 1 unseen" onClick={() => toast('Notifications are not in this demo yet.')}>
              <Icon name="bell" /><span className="dot" aria-hidden="true" />
            </button>
          </div>
          <div className="pad">
            <div className="hello">
              <Mono>{dateLabel(now)}</Mono>
              <h1 className="t-h1">{hello}, Daniel</h1>
              <span className="sub">What are you heading out to do?</span>
            </div>
            <div className="docket" role="search">
              {FIELDS.map((x) => (
                <button key={x.k} type="button" className="f" onClick={() => toast(SEARCH_LATER)}>
                  <Mono>{x.k}</Mono><span className="v">{x.v}</span><Icon name="caret-right" small />
                </button>
              ))}
              <button type="button" className="cta" onClick={() => toast(SEARCH_LATER)}><Icon name="magnifying-glass" />Search</button>
            </div>
            <div className="promise" aria-label="Delivered, set to your fit, collected">
              <Mono>Delivered</Mono><Mono>·</Mono><Mono>Set to your fit</Mono><Mono>·</Mono><Mono>Collected</Mono>
            </div>
          </div>
        </div>

        <div className="pad">
          {hasNext && (
            <section className="sec01">
              <div className="sech"><h2 className="t-h2">Up next</h2><button className="link" type="button" onClick={() => go('09-trips')}>All bookings</button></div>
              <div>
                {upcoming && (
                  <button type="button" className="r9" onClick={() => go('09-trips')}>
                    <span className="dt"><b>25</b><span>SAT</span></span>
                    <span className="tx"><b>Trek Marlin 7 · size {f.frame}</b>
                      <span>{s.arrived ? `At ${placeShort(s.book.place.d)} now` : `Delivered ${deliverAt(s)}`} · collected {collectAt(s)}</span>
                      {!s.arrived && <span className="ok">In {(() => { const c = countdown(now, SAT + hm(deliverAt(s))); return `${c.a} ${c.au} ${c.b} ${c.bu}` })()}</span>}
                    </span>
                    <Chev />
                  </button>
                )}
                {closed && s.weekly && (
                  <button type="button" className="r9" onClick={() => go('09-trips')}>
                    <span className="dt"><b>1</b><span>NOV</span></span>
                    <span className="tx"><b>Every Saturday, from 1 Nov</b><span>Trek Marlin 7 · {deliverAt(s)} to {collectAt(s)} · S$45 a ride</span></span>
                    <Chev />
                  </button>
                )}
                {st.booked && !st.hub && (
                  <button type="button" className="r9" onClick={() => go('15-equipment-detail')}>
                    <span className="dt"><b>{pickDay(s)}</b><span>{wd(pickDay(s)).toUpperCase()}</span></span>
                    <span className="tx"><b>Giant Escape 3 to the Hub</b><span>{st.way === 'home' ? 'Door pickup · 17:00–19:00 · S$10' : 'Rack S drop-off · before 7:00 · S$5'}</span></span>
                    <Chev />
                  </button>
                )}
                {st.hub && (
                  <button type="button" className="r9" onClick={() => go('15-equipment-detail')}>
                    <span className="dt is-ghost"><b>{pickDay(s)}</b><span>OCT</span></span>
                    <span className="tx"><b>Giant Escape 3 at the Hub</b>
                      <span>{st.ret ? (st.ret === 'pool' ? `Coming home ${dayLong(poolBack(s))}, morning` : `Coming home ${dm(nextDayBack(s))} · 17:00–19:00`) : `Since ${dm(pickDay(s))} · S$18 / month${st.rentOn ? ' · available to rent' : ''}`}</span>
                    </span>
                    <Chev />
                  </button>
                )}
              </div>
            </section>
          )}

          <section className="sec01">
            <div className="sech"><h2 className="t-h2">From coaches</h2><button className="link" type="button" onClick={() => toast('More coach posts are not in this demo yet.')}>All posts</button></div>
            <button type="button" className="post" onClick={() => go('02-coach-kit')} aria-label="Open Coach Aisyah’s post: First ride at Chestnut">
              <span className="who">
                <span className="av"><Photo src={aisyah} alt="Coach Aisyah" width={36} height={36} className="av-img" /></span>
                <span><b>Coach Aisyah</b><span className="small">Mountain bike coach · posted a kit list</span></span>
              </span>
              <span className="ph">
                <Photo src={post} alt="Hardtails and helmets lined up at the Chestnut trailhead on a Saturday morning" width={325} height={203} className="post-img" />
                <span className="signed1"><span className="seal"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>{closed ? 'Ridden 25 Oct' : 'Signed up'}</span>
              </span>
              <span className="post-tx"><span className="h3">First ride at Chestnut</span><span className="small">Sat 25 Oct · 8:00–12:30 · what to rent, what to bring</span></span>
            </button>
          </section>

          <section className="sec01">
            <div className="sech"><h2 className="t-h2">Rent gear for</h2><button className="link" type="button" onClick={() => toast('All activities are not in this demo yet.')}>See all</button></div>
            <div className="meds" ref={meds} aria-label="Rent gear for an activity">
              {MEDS.map((m) => (
                <button key={m.b} type="button" className="med" onClick={() => toast('Browsing is not in this demo yet.')}>
                  <span className="disc">
                    <Photo src={m.src} alt="" width={68} height={68} className="med-img" />
                    <svg className="arc" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" /></svg>
                  </span>
                  <b>{m.b}</b><span className="gl">{m.gl}</span>
                </button>
              ))}
              <button type="button" className="med more" onClick={() => toast('More activities are not in this demo yet.')}>
                <span className="disc"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></span>
                <b>More</b><span className="gl">Activities</span>
              </button>
            </div>
          </section>

          <section className="sec01">
            <h2 className="t-h2">Make more of it</h2>
            <div className="promos">
              <button type="button" className="promo multi" onClick={() => toast('Longer rentals are not in this demo yet.')}>
                <span className="tx"><Mono>Rent 3 days or more</Mono><b>10% off the day rate</b><span className="small">On rentals of 3 days or more. Delivery, collection and set-up stay the same.</span></span>
                <span className="sale" aria-label="S$38 a day becomes S$34.20 a day"><span className="off">−10%</span><span className="was">S$38</span><span className="now">S$34.20<small> a day</small></span></span>
              </button>
              <button type="button" className="promo" onClick={() => go('16-storage-options')} aria-label="Make room at home: storage at the OutRent Hub">
                <span className="tx"><Mono>Storage</Mono><b>Make room at home</b><span className="small">Keep a bike at the OutRent Hub from S$18&nbsp;/&nbsp;month.</span></span>
                <span className="ph"><Photo src={storage} alt="A bike stored at the OutRent Hub" width={112} height={112} className="promo-img" /></span>
              </button>
            </div>
          </section>
        </div>
      </main>

      <TabBar current="01-home" onToast={toast} />
      {toastNode}
    </>
  )
}
