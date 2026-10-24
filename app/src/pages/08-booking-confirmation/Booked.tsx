import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import mark from '@design/brand/outrent-mark.svg?raw'
import { Icon } from '../../shell/Icon'
import { BackButton, Mono, TimeSkip, haptic, still } from '../../shell/direction'
import { routeFor } from '../../pages'
import './booked.css'

// 08 Booking confirmation · the fitter's line. The job tag a bike shop hangs on a bike, swinging in on its
// string and stamped paid; then what happens next, and tracking.
// Source: the Creative Director's prototype "OutRent · direction" (#08), approved 25 Oct 01:40.

const STRING_REST = 'M196 0 C 200 40, 192 70, 196 104'
const STRING_START = 'M196 0 C 196 0, 196 0, 196 0'

export default function Booked() {
  const navigate = useNavigate()
  const root = useRef<HTMLElement>(null)
  const banner = useRef<HTMLDivElement>(null)
  const [skipping, setSkipping] = useState(false)

  // The tag drops in on its string, swings and settles; the paid stamp lands; then the phone's banner drops in and leaves.
  useLayoutEffect(() => {
    if (still() || !root.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.tag', { y: -420, rotation: -18 }, { y: 0, rotation: 0, duration: 1.6, delay: 0.15, ease: 'elastic.out(1, 0.35)' })
      gsap.fromTo('.string path', { attr: { d: STRING_START } }, { attr: { d: STRING_REST }, duration: 0.6, delay: 0.15, ease: 'power2.out' })
      gsap.fromTo('.stamp', { scale: 2.2, opacity: 0, rotation: -30 }, {
        scale: 1, opacity: 0.9, rotation: -14, duration: 0.35, delay: 1.5, ease: 'power4.in',
        onComplete: () => { haptic(); gsap.fromTo('.tag', { x: -2 }, { x: 0, duration: 0.25, ease: 'elastic.out(1.2,0.3)' }) },
      })
      gsap.fromTo('.after08', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, delay: 1.7 })
    }, root)
    const b = banner.current
    const tl = b ? gsap.timeline({ delay: 2.0 }).fromTo(b, { y: -160 }, { y: 0, duration: 0.55, ease: 'back.out(1.4)' }).to(b, { y: -160, duration: 0.4, ease: 'power2.in', delay: 3.2 }) : null
    return () => { ctx.revert(); tl?.kill() }
  }, [])

  return (
    <>
      <main className="screen d-screen s8-screen" ref={root}>
        <div className="bar-top">
          <span />
          <Mono className="mid">Confirmed 22 Oct · 9:12</Mono>
          <BackButton label="Close, back to Home" onClick={() => navigate(routeFor('01-home'))} icon="x" />
        </div>
        <div className="pad">
          <h1 className="t-h1 s8-h">Booked</h1>
          <p className="lede s8-lede">Timah Cycles now has your job tag. It goes on the bike when they set it to you.</p>
        </div>
        <div className="tagstage">
          <svg className="string" viewBox="0 0 393 120" preserveAspectRatio="none" aria-hidden="true"><path d={STRING_REST} /></svg>
          <section className="tag" aria-label="Job tag, booking OR-10482">
            <span className="hole" aria-hidden="true" />
            <div className="tg-top"><Mono>Timah Cycles · job</Mono><Mono>OR-10482</Mono></div>
            <div className="tg-name">Daniel Lim</div>
            <div className="tg-bike">Trek Marlin 7 · size&nbsp;M</div>
            <dl className="tg-set">
              <div><dt className="mono">Saddle</dt><dd>72<small>cm</small></dd></div>
              <div><dt className="mono">Fork sag</dt><dd>25<small>%</small></dd></div>
              <div><dt className="mono">Bars</dt><dd>+1<small>cm</small></dd></div>
            </dl>
            <dl className="tg-go">
              <div><dt className="mono">Deliver</dt><dd>25 Oct · 7:40</dd></div>
              <div><dt className="mono">Collect</dt><dd>25 Oct · 13:30</dd></div>
            </dl>
            <div className="tg-at">Chestnut trailhead carpark, by the park entrance sign</div>
            <div className="stamp" role="img" aria-label="Paid S$50 on 22 Oct"><span>Paid</span><b>S$50</b><span>22 Oct</span></div>
          </section>
        </div>
        <div className="pad after08">
          <p className="small s8-flat">S$150 deposit held, not charged. Free to cancel until <span className="nb">24 Oct · 20:00</span>.</p>
          <div className="nextline"><Mono>Next</Mono><span>Set to your fit on <span className="nb">24 Oct · 17:30</span>. Leaves the shop <span className="nb">25 Oct · 7:05</span>.</span></div>
        </div>
      </main>
      <div className="dock">
        <button type="button" className="cta s8-track" onClick={() => setSkipping(true)}><Icon name="truck" />Track delivery</button>
      </div>
      {/* The phone's own notification, as it would arrive a moment after booking. */}
      <div className="banner" ref={banner} aria-hidden="true">
        <span className="banner-app" dangerouslySetInnerHTML={{ __html: mark }} />
        <div><div className="bh"><b>OutRent</b><span>now</span></div><b>Booking OR-10482 confirmed</b><span>Trek Marlin 7 · 25 Oct · 7:40</span></div>
      </div>
      {/* Tracking (10) and the hand-over (11) are not in this batch: the clock runs on to Saturday's summary. */}
      {skipping && <TimeSkip onDone={() => navigate(routeFor('12-rental-summary'), { state: { from: 'skip', how: 'skip' } })} />}
    </>
  )
}
