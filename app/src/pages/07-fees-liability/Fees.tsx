import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useBack } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { BackButton, Mono, still } from '../../shell/direction'
import { routeFor } from '../../pages'
import bike from '@photos/01-home/assets/01-direction-cat-bikes.webp'
import './fees.css'

// 07 Fees & liability · the fitter's line. The bike behind; the bill as a drawer that blurs it as it rises:
// a statement with dotted leaders, the deposit held, the terms in short and ticked by hand.
// Source: the Creative Director's prototype "OutRent · direction" (#07, v4 drawer), approved 25 Oct 01:40.

const LINES = [['This bike, 1 day', 'S$38'], ['Delivery and collection', 'S$12'], ['Setting it to your fit', 'S$0']]
const METHODS = [{ name: 'PayNow', ic: 'PN' }, { name: 'Visa ·4821', ic: 'VISA' }]

export default function Fees() {
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('06-delivery-return')))
  const [ack, setAck] = useState(false)
  const [method, setMethod] = useState(0)
  const [paying, setPaying] = useState(false)
  const [terms, setTerms] = useState(false)
  const screen = useRef<HTMLElement>(null)
  const img = useRef<HTMLDivElement>(null)
  const dim = useRef<HTMLSpanElement>(null)
  const spacer = useRef<HTMLDivElement>(null)
  const bill = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)

  // Half the screen is the bike; as the bill is pulled up, the bike blurs and darkens behind it.
  useLayoutEffect(() => {
    const sc = screen.current, sp = spacer.current, bl = bill.current
    if (!sc || !sp || !bl) return
    const fit = () => { sp.style.height = Math.round(sc.clientHeight * 0.46) + 'px'; bl.style.minHeight = (sc.clientHeight - 60) + 'px' }
    const onScroll = () => {
      const p = Math.min(1, sc.scrollTop / (sp.offsetHeight - 20))
      const photo = img.current?.querySelector<HTMLElement>('.photo')
      if (photo) photo.style.filter = `blur(${(p * 14).toFixed(1)}px) brightness(${(1 - p * 0.35).toFixed(2)})`
      if (dim.current) dim.current.style.opacity = (0.6 + p * 0.4).toFixed(2)
      const hint = sp.firstElementChild as HTMLElement | null
      if (hint) hint.style.opacity = String(1 - p * 2)
    }
    fit(); onScroll()
    sc.addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', fit)
    // The drawer rises a little on arrival, to show it can be pulled.
    const t = still() ? null : gsap.fromTo(bl, { y: 140 }, { y: 0, duration: 0.8, delay: 0.2, ease: 'back.out(1.3)' })
    return () => { sc.removeEventListener('scroll', onScroll); removeEventListener('resize', fit); t?.kill() }
  }, [])

  const pay = () => {
    if (!ack || paying) return
    setPaying(true)
    const done = () => { navigate(routeFor('08-booking-confirmation'), { state: { how: 'fade' } }) }
    if (still() || !bar.current) { done(); return }
    gsap.fromTo(bar.current, { width: '0%' }, { width: '100%', duration: 0.9, ease: 'power1.inOut', onComplete: done })
  }
  const m = METHODS[method]

  return (
    <>
      <div className="bg07" ref={img} aria-hidden="true">
        <Photo src={bike} alt="" width={393} height={852} />
        <span className="dim07" ref={dim} />
      </div>
      <main className="screen s7-screen" ref={screen}>
        <div className="bar-top">
          <BackButton label="Back to delivery" onClick={back} onPhoto />
          <Mono className="mid s7-title">Fees &amp; liability</Mono>
          <span />
        </div>
        <div className="spacer07" ref={spacer}><Mono>Swipe up to review</Mono></div>
        <div className="bill" ref={bill}>
          <span className="grab07" aria-hidden="true" />
          <div className="bill-in">
            <div className="bill-h">
              <Mono>Trek Marlin 7 · Sat 25 Oct</Mono>
              <h1 className="big"><b className="num">S$50</b><span>today, all in</span></h1>
            </div>
            <dl className="stmt">
              {LINES.map(([k, v]) => <div key={k} className="ln"><dt>{k}</dt><i aria-hidden="true" /><dd className="num">{v}</dd></div>)}
              <p className="small s7-flat">Nothing else is charged.</p>
            </dl>
            <div className="dep2"><Icon name="lock-simple" /><span><b>Plus a S$150 deposit, held</b>It is not charged. It comes back after the return check on 25&nbsp;Oct.</span></div>
            <section className="terms2">
              <h2 className="t-h2">The terms, in short</h2>
              <ul>
                <li><b>Marks already recorded</b><span>Never charged to you.</span></li>
                <li><b>New damage</b><span>Assessed against the deposit, using the hand-over photos.</span></li>
                <li><b>Cancelling</b><span>Free until <span className="nb">24 Oct · 20:00</span>.</span></li>
              </ul>
              <button type="button" className="readall" onClick={() => setTerms(true)}>Read the full terms<Icon name="caret-right" small /></button>
              <label className="ack">
                <input type="checkbox" name="ack" checked={ack} onChange={(e) => setAck(e.target.checked)} />
                <span className="box" aria-hidden="true"><Icon name="check" /></span>
                <span>I have read the damage and liability terms.</span>
              </label>
            </section>
            <div className="pm1">
              <span className="pm-ic" aria-hidden="true">{m.ic}</span>
              <span className="pm-tx"><Mono>Pay with</Mono><b>{m.name}</b></span>
              <button type="button" className="link" onClick={() => setMethod((i) => 1 - i)} aria-label={`Change payment method, now ${m.name}`}>Change</button>
            </div>
          </div>
        </div>
      </main>
      <div className="dock dock07">
        <button type="button" className="cta s7-pay" disabled={!ack} onClick={pay} aria-live="polite">
          {paying ? 'Paying…' : ack ? `Pay S$50 with ${m.name}` : 'Tick the terms to pay'}
          <span className="bar" ref={bar} aria-hidden="true" />
        </button>
      </div>
      {terms && <FullTerms onClose={() => setTerms(false)} />}
    </>
  )
}

// The full damage and liability terms, as a sheet over the page.
function FullTerms({ onClose }: { onClose: () => void }) {
  const el = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  useLayoutEffect(() => {
    el.current?.querySelector<HTMLButtonElement>('.back')?.focus()
    if (!still() && el.current) gsap.fromTo(el.current, { y: 852 }, { y: 0, duration: 0.45, ease: 'expo.out' })
  }, [])
  const close = () => {
    if (closing.current) return
    closing.current = true
    if (still() || !el.current) { onClose(); return }
    gsap.to(el.current, { y: 852, duration: 0.35, ease: 'power3.in', onComplete: onClose })
  }
  return (
    <div className="fullterms" ref={el} role="dialog" aria-modal="true" aria-label="Damage and liability terms" onKeyDown={(e) => { if (e.key === 'Escape') close() }}>
      <div className="ft-head"><Mono>Damage and liability terms</Mono><BackButton label="Close the terms" onClick={close} icon="x" /></div>
      <div className="ft-body">
        <h2 className="t-h2">Damage</h2>
        <p>Damage recorded at hand-over is not chargeable. The hand-over record is the shop’s photos of <span className="nb">18 Oct · 16:20</span> and your own photos at <span className="nb">25 Oct · 7:40</span>: crank arm, saddle edge and drivetrain.</p>
        <p>New damage is assessed against the S$150 deposit, using that record.</p>
        <h2 className="t-h2">Deposit</h2>
        <p>S$150 is held on your payment method and not charged. It is released after the return check, which happens when the bike is collected.</p>
        <h2 className="t-h2">Cancelling</h2>
        <p>You can cancel free until <span className="nb">24 Oct · 20:00</span>. After that the day rate of S$38 is kept, and the deposit is always released.</p>
        <p>If Timah Cycles cancels, everything is refunded and the deposit hold is released at once.</p>
        <h2 className="t-h2">If you disagree</h2>
        <p>The hand-over record decides. Both you and the shop see the same dated photos.</p>
      </div>
    </div>
  )
}
