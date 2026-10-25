import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useBack } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { BackButton, Mono, Sheet, haptic, still, useSheet } from '../../shell/direction'
import { lock } from '../../shell/PageFrame'
import { deliverAt, getState, payLabel, set, setClock, useStore, type Pay } from '../../shell/store'
import { routeFor } from '../../pages'
import bike from '@photos/07-fees-liability/assets/07-direction-backdrop-marlin7.webp'
import './fees.css'

// 07 Fees & liability · the fitter's line. The bike behind; the bill as a drawer that blurs it as it rises:
// a statement with dotted leaders, the deposit held, the terms in short and ticked by hand.
// v52 (the v4 drawer). The payment method is a real choice (PayNow or Visa ending 4821) and carries on to 08 and 09;
// the tick belongs to this checkout only, so a new booking starts unticked.

const LINES = [['This bike, 1 day', 'S$38'], ['Delivery and collection', 'S$12'], ['Setting it to your fit', 'S$0']]
const IC: Record<Pay, string> = { PayNow: 'PN', Visa: 'VISA' }

export default function Fees() {
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('06-delivery-return')))
  const ack = useStore((s) => s.book.ack)
  const method = useStore((s) => s.book.pay)
  const d = useStore((s) => deliverAt(s))
  const setAck = (v: boolean) => set((s) => ({ ...s, book: { ...s.book, ack: v } }))
  const payWith = useSheet()
  const [paying, setPaying] = useState(false)
  const payBtn = useRef<HTMLButtonElement>(null)
  useEffect(() => { setClock(getState().paid ? '19:00' : '9:09') }, [])
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
    setPaying(true); lock(payBtn.current)
    // paid: OR-10482 is confirmed at 22 Oct · 9:12 with the chosen times, places, fit and method
    const done = () => {
      set((s) => ({ ...s, paid: true, now: 9.2, book: { ...s.book, ack: false }, arrived: false, closed: false, record: { shots: [], marks: [], saved: false } }))
      navigate(routeFor('08-booking-confirmation'), { state: { how: 'fade' } })
    }
    if (still() || !bar.current) { done(); return }
    gsap.fromTo(bar.current, { width: '0%' }, { width: '100%', duration: 0.9, ease: 'power1.inOut', onComplete: done })
  }
  const m = { name: payLabel(method), ic: IC[method] }

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
            <div className="dep2"><Icon name="lock-simple" /><span><b>Plus a S$150 deposit, held on Visa ···4821</b>It is not charged. Released after the return check on 25&nbsp;Oct.</span></div>
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
                <span>I agree to the damage and liability terms.</span>
              </label>
            </section>
            <div className="pm1">
              <span className="pm-ic" aria-hidden="true">{m.ic}</span>
              <span className="pm-tx"><Mono>Pay with</Mono><b>{m.name}</b></span>
              <button type="button" className="link" onClick={payWith.show} aria-label={`Change payment method, now ${m.name}`}>Change</button>
            </div>
          </div>
        </div>
      </main>
      <div className="dock dock07">
        <button type="button" className="cta s7-pay" ref={payBtn} disabled={!ack} onClick={pay} aria-live="polite">
          {paying ? 'Paying…' : ack ? `Pay S$50 with ${m.name}` : 'Tick the terms to pay'}
          <span className="bar" ref={bar} aria-hidden="true" />
        </button>
      </div>
      {terms && <FullTerms onClose={() => setTerms(false)} d={d} />}
      <Sheet sheet={payWith} label="Pay with" title="Pay with" closeLabel="Close, keep the payment method">
        {(['PayNow', 'Visa'] as Pay[]).map((p) => (
          <button key={p} type="button" className="opt" aria-pressed={method === p} onClick={() => { set((s) => ({ ...s, book: { ...s.book, pay: p } })); haptic(); payWith.hide() }}>
            <span className="rad" /><b>{payLabel(p)}</b><span /><span className="s">{p === 'PayNow' ? 'Your default. Pays the S$50 now.' : 'Card on file. Pays the S$50 now.'}</span>
          </button>
        ))}
        <p className="small s7-paynote">The S$150 deposit is held on your card on file, Visa ···4821, either way. It is not charged.</p>
      </Sheet>
    </>
  )
}

// The full damage and liability terms, as a sheet over the page.
function FullTerms({ onClose, d }: { onClose: () => void; d: string }) {
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
        <p>Damage recorded at hand-over is not chargeable. The hand-over record is the shop’s photos of <span className="nb">18 Oct · 16:20</span> and your own photos at <span className="nb">25 Oct · {d}</span>: crank arm, saddle edge and drivetrain.</p>
        <p>New damage is assessed against the S$150 deposit, using that record.</p>
        <h2 className="t-h2">Deposit</h2>
        <p>S$150 is held on your card on file, Visa ···4821, and not charged. It is released after the return check, which happens when the bike is collected.</p>
        <h2 className="t-h2">Cancelling</h2>
        <p>You can cancel free until <span className="nb">24 Oct · 20:00</span>. After that the day rate of S$38 is kept, and the deposit is always released.</p>
        <p>If Timah Cycles cancels, everything is refunded and the deposit hold is released at once.</p>
        <h2 className="t-h2">If you disagree</h2>
        <p>The hand-over record decides. Both you and the shop see the same dated photos.</p>
      </div>
    </div>
  )
}
