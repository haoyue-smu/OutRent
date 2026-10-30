import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import lockup from '@design/brand/outrent-lockup.svg?raw'
import { useBack } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { BackButton, Mono, still } from '../../shell/direction'
import { deliverAt, fitNow, placeShort, setClock, useStore } from '../../shell/store'
import { routeFor } from '../../pages'
import aisyah from '@photos/01-home/assets/01-direction-aisyah-avatar.webp'
import post from '@photos/01-home/assets/01-direction-02-coach-post.webp'
import bike from '@photos/01-home/assets/01-direction-cat-bikes.webp'
import helmet from '@photos/02-coach-kit/assets/02-direction-kit-helmet.webp'
import shoes from '@photos/02-coach-kit/assets/02-direction-kit-shoes.webp'
import bottles from '@photos/02-coach-kit/assets/02-direction-kit-bottles.webp'
import sunscreen from '@photos/02-coach-kit/assets/02-direction-kit-sunscreen.webp'
import pedals from '@photos/02-coach-kit/assets/02-direction-kit-clipless-pedals.webp'
import './kit.css'

// 02 Coach's post · the fitter's line (v60). Her photo, her note, her plain list, every row the same height. The app
// adds a forest tab above the post (Daniel has signed up for the ride), one icon on the thumbnail of each item it
// knows (a "+" on the bike, not in his gear, which opens the drawer; a tick on the helmet, in his gear) with a key
// line under the caption, and one drawer that offers only the bike.
// Once the bike is booked the drawer says so and leads to Bookings instead of the search.

type Item = { src: string; alt: string; name: string; note?: string; have?: boolean }
const KIT: Item[] = [
  { src: helmet, alt: 'A black mountain-bike helmet', name: 'Bike helmet', note: 'Any bike helmet. A road helmet is fine.', have: true },
  { src: shoes, alt: 'Grey running shoes', name: 'Sports shoes', note: 'Your regular running shoes.' },
  { src: bottles, alt: 'Two water bottles', name: '2 water bottles' },
  { src: sunscreen, alt: 'A tube of sunscreen', name: 'Sunscreen' },
]
type Sheet = 'hidden' | 'up' | 'down'

export default function CoachKit() {
  const navigate = useNavigate()
  const back = useBack(() => navigate(routeFor('01-home')))
  const s = useStore((x) => x)
  const [sheet, setSheet] = useState<Sheet>('hidden')
  const [ping, setPing] = useState(false)
  const screen = useRef<HTMLElement>(null)
  const need = useRef<HTMLLIElement>(null)
  const y0 = useRef<number | null>(null)
  const f = fitNow(s)

  useEffect(() => { setClock(s.paid ? '19:00' : '9:02') }, [s.paid])
  // The drawer pops up a moment after the post appears, like a notification.
  useEffect(() => {
    const t = window.setTimeout(() => setSheet('up'), still() ? 0 : 650)
    return () => clearTimeout(t)
  }, [])

  // Tapping the hardtail centres it in the page's own list (never scrollIntoView) and brings the drawer back.
  const showNeed = () => {
    const sc = screen.current, el = need.current
    if (sc && el) {
      const r = el.getBoundingClientRect(), b = sc.getBoundingClientRect()
      sc.scrollTo({ top: sc.scrollTop + (r.top + r.height / 2) - (b.top + b.height / 2), behavior: still() ? 'auto' : 'smooth' })
    }
    setSheet('up')
    setPing(true)
    window.setTimeout(() => setPing(false), 900)
  }
  // Touching the post tucks the drawer away; its head brings it back.
  const onPost = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.need-bike')) return
    if (sheet === 'up') setSheet('down')
  }
  const onDown = (e: PointerEvent) => { if (!(e.target as HTMLElement).closest('.cta')) y0.current = e.clientY }
  const onUp = (e: PointerEvent) => {
    if (y0.current == null) return
    const d = e.clientY - y0.current
    y0.current = null
    if (d < -20) setSheet('up')
    else if (d > 20) setSheet('down')
  }
  const rent = () => {
    if (s.paid) { navigate(routeFor('09-trips')); return }
    navigate(routeFor(s.fit.hasProfile ? '04-search-results' : '03-fit-profile'), { state: { from: 'post' } })
  }
  const cta = s.paid ? 'See it in Bookings' : s.fit.hasProfile ? 'See mountain bikes for Sat 25 Oct' : 'Enter your fit to find a bike'

  return (
    <>
      <main className="screen d-screen s2-screen" ref={screen}>
        <div className="bar-top">
          <BackButton label="Back to Home" onClick={back} />
          <Mono className="mid">Post</Mono>
          <span />
        </div>
        <div className="signed2" role="note">
          <span className="seal" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          <span className="sx"><b>You have signed up for this ride</b><span>Sat 25 Oct · 8:00 · Chestnut Nature Park</span></span>
        </div>
        <article className="cpost" onClick={onPost}>
          <header className="author">
            <span className="av"><Photo src={aisyah} alt="Coach Aisyah" width={40} height={40} className="av-img" /></span>
            <div><b>Coach Aisyah</b><span className="small">Mountain bike coach</span></div>
          </header>
          <div className="cpost-ph"><Photo src={post} alt="Hardtails and helmets lined up at the Chestnut trailhead on a Saturday morning" width={369} height={277} first className="post-img" /></div>
          <div className="cpost-body">
            <h1 className="t-h1">First ride at Chestnut</h1>
            <div className="event">
              <span><Icon name="calendar-blank" />Sat 25 Oct · 8:00–12:30</span>
              <span><Icon name="map-pin" />Chestnut Nature Park</span>
            </div>
            <p className="cap">First time on the trails? Join my beginner ride this Saturday. Here’s what to bring.</p>
            <p className="key2"><span className="kb need" aria-hidden="true"><Icon name="plus" /></span>Not in your gear<span className="kb have" aria-hidden="true"><Icon name="check" /></span>In your gear</p>
            <ul className="kit" aria-label="What to bring">
              <li ref={need} className={`kit-it need-bike${ping ? ' ping' : ''}`} onClick={showNeed}>
                <span className="th">
                  <button type="button" className="kb need" aria-label="You don’t have one. See how to rent one" onClick={(e) => { e.stopPropagation(); showNeed() }}><Icon name="plus" /></button>
                  <Photo src={bike} alt="A hardtail mountain bike" width={56} height={56} className="bike-img" />
                </span>
                <span className="tx"><b>Hardtail mountain bike</b><span>A mountain bike with suspension at the front only. Get one in your size.</span></span>
              </li>
              {KIT.map((k) => (
                <li key={k.name} className="kit-it">
                  <span className="th"><Photo src={k.src} alt={k.alt} width={56} height={56} />{k.have && <span className="kb have" role="img" aria-label="You have one, in My gear"><Icon name="check" /></span>}</span>
                  <span className="tx"><b>{k.name}</b>{k.note && <span>{k.note}</span>}</span>
                </li>
              ))}
            </ul>
            <div className="kit-skip">
              <Mono>Not needed</Mono>
              <ul className="kit">
                <li className="kit-it is-skip">
                  <span className="th"><Photo src={pedals} alt="A clipless pedal beside a cycling shoe with a cleat" width={56} height={56} /></span>
                  <span className="tx"><b>Clipless pedals</b><span>Pedals that lock onto special shoes. Leave them for later rides.</span></span>
                </li>
              </ul>
            </div>
          </div>
        </article>
      </main>

      <section className={`vsheet is-${sheet}`} aria-label="OutRent, for this ride" onPointerDown={onDown} onPointerUp={onUp}>
        <button type="button" className="grab" aria-label={sheet === 'down' ? 'Show OutRent’s part' : 'Tuck it away'} onClick={() => setSheet((x) => (x === 'down' ? 'up' : 'down'))}><i /></button>
        <button type="button" className="sh-head" onClick={() => setSheet('up')}>
          <span className="sh-logo" role="img" aria-label="OutRent" dangerouslySetInnerHTML={{ __html: lockup }} /><Mono>For this ride</Mono>
        </button>
        <div className="sh-more">
          <div className="orow">
            <span className="th"><Photo src={bike} alt="" width={44} height={44} className="bike-img" /></span>
            {s.paid
              ? <span className="tx"><b>Trek Marlin 7 · size {f.frame}</b><span>Booked · OR-10482 · delivered 25 Oct · {deliverAt(s)} at {placeShort(s.book.place.d)}.</span></span>
              : <span className="tx"><b>Mountain bike</b><span>Rent one, set to your fit and delivered to Chestnut.</span></span>}
          </div>
        </div>
        <button type="button" className="cta" onClick={rent}>{cta}</button>
      </section>
    </>
  )
}
