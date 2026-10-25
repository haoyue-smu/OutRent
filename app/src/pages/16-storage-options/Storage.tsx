import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { Photo } from '../../shell/Photo'
import { Icon } from '../../shell/Icon'
import { useBack } from '../../shell/Link'
import { BackButton, LineIcon, Mono, Sheet, haptic, still, useSheet } from '../../shell/direction'
import { routeFor } from '../../pages'
import { clockOf, offRouteNow, set, setClock, useStore } from '../../shell/store'
import { dayLong, hubNow, pickDay } from '../../shell/storage'
import hubPhoto from '@photos/16-storage-options/assets/16-direction-16-hub.webp'
import './storage.css'

// 16 Storage at the OutRent Hub · the fitter's line. The Hub, its one price as a plate, what is included, and
// "There and back" as one vertical route: home, two ways there, the Hub, two ways back, home again. Rent-out is a
// real opt-in from here (terms, tick); once on, 16 says so and 15 at the Hub shows the bike available.
// Source: the Creative Director's prototype v52 (#16). Opened from 15 ("Store it at the Hub") or 01's storage card.

export default function Storage() {
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('15-equipment-detail')))
  const root = useRef<HTMLElement>(null)
  const s = useStore((x) => x)
  const st = s.storage
  const on = st.rentOn
  const now = st.hub ? Math.max(s.now, hubNow(s)) : offRouteNow(s)

  useEffect(() => { setClock(clockOf(now)) }, [now])

  useLayoutEffect(() => {
    if (still() || !root.current) return
    const ctx = gsap.context(() => {
      gsap.from('.plate, .incl li', { opacity: 0, y: 12, duration: 0.45, stagger: 0.07, delay: 0.15, ease: 'power3.out' })
    }, root)
    return () => ctx.revert()
  }, [])

  const sheet = useSheet()
  const [ack, setAck] = useState(false)
  useEffect(() => { if (sheet.open) setAck(false) }, [sheet.open])
  const turn = (v: boolean) => {
    set((x) => ({ ...x, storage: { ...x.storage, rentOn: v } }))
    sheet.hide(); haptic()
  }

  const dock = st.hub
    ? { label: 'See it at the Hub', to: '15-equipment-detail' }
    : st.booked ? { label: `See the pickup · ${dayLong(pickDay(s))}`, to: '17-hub-pickup' } : { label: 'Send the Giant Escape 3', to: '17-hub-pickup' }

  return (
    <>
      <main className="screen d-screen s16-screen" ref={root}>
        <div className="photo-top top16">
          <Photo src={hubPhoto} alt="Bikes on racks inside the OutRent Hub, the roller door open to daylight" width={393} height={320} first className="p16" />
          <span className="shade" />
          <BackButton label="Back" onClick={back} onPhoto />
          <div className="cap"><Mono>OutRent Hub · Sungei Kadut</Mono></div>
        </div>
        <div className="over pad">
          <h1 className="t-h1">Make room at home</h1>
          <p className="lede s16-lede">The Hub keeps a bike, checks it in, and looks after it until you want it back.</p>
          <div className="plate"><div className="p"><b>S$18</b><span>/ month</span></div><div className="r">per bike</div></div>
          <ul className="incl">
            <li><LineIcon name="camera" /><span><b>Intake record</b>Dated photos and its condition the day it arrives</span></li>
            <li><LineIcon name="wrench" /><span><b>Basic upkeep</b>While it is stored</span></li>
            <li className={on ? 'on' : undefined}><LineIcon name="coins" /><span><b>{on ? 'Rent-out is on' : 'It can earn rent'}</b><span>{on ? 'From the day its intake record is done. You keep 70%.' : 'Only if you opt in. You keep 70%.'}</span></span></li>
          </ul>

          <div className="lbl"><b>There and back</b><Mono>Both ways, before you send it</Mono></div>
          <ol className="route16">
            <li className="stop"><i /><div><b>Home</b><span>Blk 325C Sengkang East Way</span></div></li>
            <li className="leg"><Mono>Getting it there · pick one</Mono>
              <div className="fare"><span><b>Door pickup</b><span>Daily, 17:00–19:00</span></span><em>S$10</em></div>
              <div className="fare"><span><b>Rack drop-off</b><span>Rack S, 60 m away · shared courier run, Tue and Fri mornings</span></span><em>S$5</em></div>
            </li>
            <li className="stop hub"><i /><div><b>OutRent Hub</b><span>Sungei Kadut · checked in, kept, looked after</span></div><em>S$18<small> / month</small></em></li>
            <li className="leg"><Mono>Getting it back · when you want it</Mono>
              <div className="fare"><span><b>Shared courier run</b><span>With 2 days’ notice</span></span><em>Free</em></div>
              <div className="fare"><span><b>Next day, to your door</b><span>To your home address</span></span><em>S$8</em></div>
            </li>
            <li className="stop again2"><i /><div><b>Home again</b><span>Blk 325C Sengkang East Way</span></div></li>
          </ol>
          <button type="button" className="termslink" onClick={sheet.show}>{on ? 'Rent-out terms · on' : 'Rent it out while stored'}<LineIcon name="arrow" /></button>
        </div>
      </main>
      <div className="dock"><button type="button" className="cta s16-go" onClick={() => navigate(routeFor(dock.to))}>{dock.label}</button></div>

      <Sheet sheet={sheet} label="Rent it out while stored" title="Rent it out while stored" closeLabel="Close, back to storage" className="s16-sheet">
        <div className="split">
          <div className="bar"><span style={{ flex: 70 }} /><span className="b" style={{ flex: 30 }} /></div>
          <div className="lg"><div><b>S$8.40</b><span>You keep 70%, per day rented</span></div><div><b>S$12 / day</b><span>Suggested rate</span></div></div>
        </div>
        <div className="terms18 s16-terms">
          <div><LineIcon name="check" /><span>It is offered for rent only once it is at the Hub and its intake record is done.</span></div>
          <div><LineIcon name="check" /><span>Its condition is <b>re-checked after every rental</b> against the intake record.</span></div>
          <div><LineIcon name="check" /><span>You can stop renting it out at any time.</span></div>
        </div>
        {on ? (
          <>
            <p className="rt16on"><LineIcon name="check" />Rent-out is on for the Giant Escape 3.</p>
            <button type="button" className="ghostbtn s16-off" onClick={() => turn(false)} tabIndex={sheet.open ? 0 : -1}>Turn rent-out off</button>
          </>
        ) : (
          <>
            <label className="ack s16-ack">
              <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} tabIndex={sheet.open ? 0 : -1} />
              <span className="box" aria-hidden="true"><Icon name="check" /></span>
              <span>I agree to the rent-out terms.</span>
            </label>
            <button type="button" className="cta s16-on" disabled={!ack} onClick={() => turn(true)}>{ack ? 'Rent it out from the Hub' : 'Tick the terms to rent it out'}</button>
            <button type="button" className="link" onClick={sheet.hide}>Not now, back to storage</button>
          </>
        )}
      </Sheet>
    </>
  )
}
