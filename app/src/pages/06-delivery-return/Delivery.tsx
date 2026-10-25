import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBack } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { BackButton, Mono, Sheet, haptic, still, useSheet } from '../../shell/direction'
import { PLACES, getState, hm, set, setClock, useStore, type Place } from '../../shell/store'
import { routeFor } from '../../pages'
import spot from '@photos/06-delivery-return/assets/06-direction-handover-spot.webp'
import './delivery.css'

// 06 Delivery and collection · the fitter's line (v52, the v48 page). Where you meet (the hand-over spot as a
// photo, a white "Meet here" pin on the sign), then three suggested times plus Other for each leg, with the ride
// between them, and the bill that starts with the two chosen times.
// Real state: both places (chosen separately) and any time go into the booking and on to every later page.

type Kind = 'd' | 'c'
const CHIPS: Record<Kind, string[]> = { d: ['7:20', '7:40', '8:00'], c: ['13:00', '13:30', '14:30'] }
// Other times, in 10-minute steps: delivery from the first courier slot to the end of the ride, collection after it.
const RANGE: Record<Kind, [number, number]> = { d: [7 + 20 / 60, 12.5], c: [12.5, 20] }
const times = (k: Kind) => { const out: string[] = []; const [a, z] = RANGE[k]; for (let m = Math.round(a * 60); m <= z * 60; m += 10) out.push(`${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`); return out }

export default function Delivery() {
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('05-listing-detail')))
  const book = useStore((s) => s.book)
  const where = useSheet()
  const [draft, setDraft] = useState<{ d: Place; c: Place }>(book.place)
  const [other, setOther] = useState<Kind | null>(null)
  const wheel = useRef<HTMLDivElement>(null)
  const [wheelAt, setWheelAt] = useState('')
  const both = book.d && book.c

  useEffect(() => { setClock(getState().paid ? '19:00' : '9:07') }, [])

  const choose = (k: Kind, t: string) => {
    set((s) => ({ ...s, book: { ...s.book, [k]: t } }))
    haptic()
  }

  // the wheel: the row nearest the middle line is the one picked
  const pick = () => {
    const wh = wheel.current
    if (!wh) return ''
    const rows = [...wh.querySelectorAll<HTMLElement>('.t')], c = wh.scrollTop + 90
    let best = rows[0]
    rows.forEach((r) => { if (Math.abs(r.offsetTop + 22 - c) < Math.abs(best.offsetTop + 22 - c)) best = r })
    const t = best?.textContent ?? ''
    if (t !== wheelAt) setWheelAt(t)
    return t
  }
  const openOther = (k: Kind) => {
    setOther(k)
    const start = book[k] && !CHIPS[k].includes(book[k]!) ? book[k]! : k === 'd' ? '7:50' : '13:10'
    requestAnimationFrame(() => {
      const wh = wheel.current, row = [...(wh?.querySelectorAll<HTMLElement>('.t') ?? [])].find((r) => r.textContent === start)
      if (wh && row) { wh.scrollTop = row.offsetTop - 68; setWheelAt(start) }
      wh?.focus({ preventScroll: true })
    })
  }
  useEffect(() => {
    if (!other) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOther(null) }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [other])
  const confirmTime = () => { const t = pick(); if (other && t) choose(other, t); setOther(null) }
  const scrollTo = (el: HTMLElement) => wheel.current?.scrollTo({ top: el.offsetTop - 68, behavior: still() ? 'auto' : 'smooth' })

  const same = book.place.d === book.place.c
  const late = book.d && hm(book.d) > 8, early = book.c && hm(book.c) < 12.5
  const cta = both ? 'See the fees' : book.d ? 'Pick a collection time' : 'Pick a delivery time'

  const leg = (k: Kind) => {
    const chosenOther = book[k] && !CHIPS[k].includes(book[k]!)
    return (
      <div className="leg6">
        <div className="lh"><Mono>{k === 'd' ? 'Delivery' : 'Collection'}</Mono><span className="dt6">Sat 25 Oct</span></div>
        <div className="chips6">
          {CHIPS[k].map((t) => (
            <button key={t} type="button" className="c6" aria-pressed={book[k] === t} aria-label={`${k === 'd' ? 'Deliver' : 'Collect'} at ${t}`} onClick={() => choose(k, t)}>{t}</button>
          ))}
          <button type="button" className={`c6${chosenOther ? '' : ' oth'}`} aria-pressed={!!chosenOther} aria-label={chosenOther ? `${k === 'd' ? 'Deliver' : 'Collect'} at ${book[k]}, pick another time` : `Pick another ${k === 'd' ? 'delivery' : 'collection'} time`} onClick={() => openOther(k)}>{chosenOther ? book[k] : 'Other'}</button>
        </div>
        {k === 'd' && late && <p className="note6">Arrives after your ride starts at 8:00.</p>}
        {k === 'c' && early && <p className="note6">Collected before your ride ends at 12:30.</p>}
      </div>
    )
  }

  return (
    <>
      <main className="screen d-screen s6-screen">
        <div className="bar-top">
          <BackButton label="Back to the listing" onClick={back} />
          <Mono className="mid">Sat 25 Oct</Mono>
          <span />
        </div>
        <div className="pad">
          <h1 className="t-h1">Delivery and collection</h1>
          <figure className="meet6">
            <div className="ph">
              {book.place.d === 0 ? <>
                <Photo src={spot} alt="The Chestnut trailhead carpark on a Saturday morning, the low wooden park entrance sign at its edge" width={353} height={221} first />
                <span className="spot6" aria-hidden="true" />
                <span className="tag6" aria-hidden="true"><Icon name="map-pin-fill" />Meet here</span>
              </> : (
                <span className="todo" role="img" aria-label="Photo to come: Blk 325C Sengkang East Way"><span className="mono">Image to come</span><span className="w">Blk 325C Sengkang East Way, your home address</span></span>
              )}
            </div>
            <figcaption>
              <span className="tx">
                <b>{PLACES[book.place.d][0]}</b>
                <span>{same
                  ? (book.place.d === 0 ? 'By the park entrance sign. The bike is handed over here both ways.' : 'Your home address. The bike is handed over here both ways.')
                  : `Delivered here. Collected from ${book.place.c === 0 ? 'the Chestnut trailhead carpark, by the park entrance sign' : 'your home address, Blk 325C'}.`}</span>
              </span>
              <button className="link" type="button" onClick={() => { setDraft(book.place); where.show() }}>Change</button>
            </figcaption>
          </figure>
          {leg('d')}
          <div className="ride6n"><i /><span>Your ride with Coach Aisyah · <b>8:00–12:30</b></span><i /></div>
          {leg('c')}
          <dl className="bill6">
            <div className="when"><dt>Delivery</dt><dd className={book.d ? undefined : 'wait'}>{book.d ? `25 Oct · ${book.d}` : 'Pick a time'}</dd></div>
            <div className="when"><dt>Collection</dt><dd className={book.c ? undefined : 'wait'}>{book.c ? `25 Oct · ${book.c}` : 'Pick a time'}</dd></div>
            <div><dt>Trek Marlin 7, 1 day</dt><dd>S$38</dd></div>
            <div><dt>Delivery and collection</dt><dd>S$12</dd></div>
            <div className="tot"><dt>All-in for Sat 25 Oct</dt><dd>S$50</dd></div>
          </dl>
        </div>
      </main>
      <div className="dock"><button type="button" className="cta" style={{ width: '100%' }} disabled={!both} onClick={() => navigate(routeFor('07-fees-liability'))}>{cta}</button></div>

      {/* any other time: a wheel in 10-minute steps */}
      <div className={`sheet6${other ? ' on' : ''}`} aria-hidden={!other} onClick={(e) => { if (e.target === e.currentTarget) setOther(null) }}>
        <div className="sh6" role="dialog" aria-modal="true" aria-label={other === 'c' ? 'Another collection time' : 'Another delivery time'}>
          <span className="grab" aria-hidden="true"><i /></span>
          <div className="lh"><b>{other === 'c' ? 'Another collection time' : 'Another delivery time'}</b><span className="hint">Sat 25 Oct · your ride is 8:00–12:30</span></div>
          <div className="wheel6" ref={wheel} tabIndex={0} role="listbox" aria-label="Times" aria-activedescendant={wheelAt ? `w6-${wheelAt.replace(':', '')}` : undefined} onScroll={pick}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmTime(); return } const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0; if (!d || !wheel.current) return; e.preventDefault(); wheel.current.scrollBy({ top: d * 44 }) }}>
            <div className="padr" />
            {other && times(other).map((t) => (
              <div key={t} id={`w6-${t.replace(':', '')}`} role="option" aria-selected={wheelAt === t} className={`t${wheelAt === t ? ' on' : ''}`} onClick={(e) => scrollTo(e.currentTarget)}>{t}</div>
            ))}
            <div className="padr" />
          </div>
          <button type="button" className="cta" style={{ width: '100%' }} onClick={confirmTime}>Use this time{wheelAt ? ` · ${wheelAt}` : ''}</button>
        </div>
      </div>

      <Sheet sheet={where} label="Where to meet" title="Where to meet" closeLabel="Close, keep the places as they are">
        {(['d', 'c'] as Kind[]).map((k) => (
          <div key={k} className="where6">
            <Mono>{k === 'd' ? 'Delivery' : 'Collection'}</Mono>
            {PLACES.map((p, i) => (
              <button key={p[0]} type="button" className="opt" aria-pressed={draft[k] === i} onClick={() => { setDraft((x) => ({ ...x, [k]: i as Place })); haptic() }}>
                <span className="rad" /><b>{i === 0 ? 'Chestnut trailhead carpark' : 'Your home address'}</b><span /><span className="s">{i === 0 ? 'By the park entrance sign' : PLACES[1][0]}</span>
              </button>
            ))}
          </div>
        ))}
        <button type="button" className="cta" style={{ width: '100%', marginTop: 16 }} onClick={() => { set((s) => ({ ...s, book: { ...s.book, place: draft } })); haptic(); where.hide() }}>Use these places</button>
      </Sheet>
    </>
  )
}
