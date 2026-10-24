import { useLayoutEffect, useRef } from 'react'
import lockup from '@design/brand/outrent-lockup-white.svg?raw'
import { GoTo } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { Photo } from '../../shell/Photo'
import { Mono, still, useToast } from '../../shell/direction'
import { gsap } from 'gsap'
import post from '@photos/01-home/assets/01-direction-02-coach-post.webp'
import aisyah from '@photos/01-home/assets/01-direction-aisyah-avatar.webp'
import bikes from '@photos/01-home/assets/01-direction-cat-bikes.webp'
import kayaks from '@photos/01-home/assets/01-direction-cat-kayaks.webp'
import boards from '@photos/01-home/assets/01-direction-cat-paddleboards.webp'
import camping from '@photos/01-home/assets/01-direction-cat-camping.webp'
import storage from '@photos/01-home/assets/01-direction-storage-promo.webp'
import './home.css'

// 01 Home · the fitter's line. A docket to fill in: what, to where, when. Below it a coach's post,
// the kinds of gear, and two ways to get more from it.
// Source: the Creative Director's prototype "OutRent · direction" (no hash), approved 25 Oct 00:56.
// Category and promo values without MOCK-DATA behind them are gaps (FIXES.md #3-#6): built as drawn, nothing invented.

const SEARCH_LATER = 'Search starts from the coach’s post in this demo.'
const FIELDS = [
  { k: 'What', v: 'Bike, kayak, board, tent' },
  { k: 'To', v: 'Where you’ll use it' },
  { k: 'When', v: 'Pick a day' },
]
const CATS = [
  { src: bikes, alt: 'A mountain bike by a trail marker', label: 'Bikes', pos: '50% 50%' },
  { src: kayaks, alt: 'Two kayaks at a reservoir launch', label: 'Kayaks', pos: '50% 60%' },
  { src: boards, alt: 'A paddleboard on the beach', label: 'Paddleboards', pos: '50% 65%' },
  { src: camping, alt: 'A tent under trees', label: 'Camping', pos: '50% 60%' },
]
const TABS = [
  { label: 'Home', icon: 'house-fill', current: true },
  { label: 'Bookings', icon: 'calendar-blank', toast: 'Bookings is not in this demo yet.' },
  { label: 'My gear', icon: 'backpack', toast: 'My gear is not in this demo yet.' },
  { label: 'Profile', icon: 'user', toast: 'Profile is not in this demo yet.' },
]

export default function Home() {
  const [toastNode, toast] = useToast()
  const root = useRef<HTMLElement>(null)

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

  return (
    <>
      <main className="screen d-screen h1-screen" ref={root}>
        <div className="band01">
          <div className="home-top">
            <span className="lockup" dangerouslySetInnerHTML={{ __html: lockup }} />
            <button type="button" className="ibtn" aria-label="Notifications, 1 unseen" onClick={() => toast('Notifications are not in this demo yet.')}>
              <Icon name="bell" /><span className="dot" aria-hidden="true" />
            </button>
          </div>
          <div className="pad">
            <div className="hello">
              <Mono>Wed 22 Oct</Mono>
              <h1 className="t-h1">Good morning, Daniel</h1>
              <span className="sub">What are you heading out to do?</span>
            </div>
            <div className="docket" role="search">
              {FIELDS.map((f) => (
                <button key={f.k} type="button" className="f" onClick={() => toast(SEARCH_LATER)}>
                  <Mono>{f.k}</Mono><span className="v">{f.v}</span><Icon name="caret-right" small />
                </button>
              ))}
              <button type="button" className="cta" onClick={() => toast(SEARCH_LATER)}><Icon name="magnifying-glass" />Search</button>
            </div>
            <div className="promise" aria-label="Delivered, set to you, collected">
              <Mono>Delivered</Mono><Mono>·</Mono><Mono>Set to you</Mono><Mono>·</Mono><Mono>Collected</Mono>
            </div>
          </div>
        </div>

        <div className="pad">
          <section className="sec01">
            <h2 className="t-h2">This weekend</h2>
            <GoTo page="02-coach-kit" className="post" aria-label="Open Coach Aisyah’s post: First ride at Chestnut">
              <span className="who">
                <span className="av"><Photo src={aisyah} alt="Coach Aisyah" width={36} height={36} className="av-img" /></span>
                <span><b>Coach Aisyah</b><span className="small">Mountain bike coach · posted a kit list</span></span>
              </span>
              <span className="ph"><Photo src={post} alt="Hardtails and helmets lined up at the Chestnut trailhead on a Saturday morning" width={325} height={203} className="post-img" /></span>
              <span className="post-tx"><span className="h3">First ride at Chestnut</span><span className="small">Sat 25 Oct · 8:00–12:30 · what to rent, what to bring</span></span>
            </GoTo>
          </section>

          <section className="sec01">
            <h2 className="t-h2">Rent for your next outing</h2>
            <div className="cats">
              {CATS.map((c) => (
                <button key={c.label} type="button" className="cat" onClick={() => toast('Browsing is not in this demo yet.')}>
                  <span className="ph"><Photo src={c.src} alt={c.alt} width={118} height={118} className="cat-img" /></span>
                  <b>{c.label}</b>
                </button>
              ))}
            </div>
          </section>

          <section className="sec01">
            <h2 className="t-h2">Make more of it</h2>
            <div className="promos">
              <button type="button" className="promo weekly" onClick={() => toast('Weekly rides are set up after a first rental.')}>
                <span className="tx"><Mono>Weekly rides</Mono><b>Same gear every Saturday, 10% less than one-off</b><span className="small">Skip or pause any week.</span></span>
                <span className="weeks5" aria-hidden="true"><span>SAT</span><span>SAT</span><span>SAT</span><span>SAT</span></span>
              </button>
              <button type="button" className="promo" onClick={() => toast('Storage is not in this demo yet.')}>
                <span className="tx"><Mono>Storage</Mono><b>Make room at home</b><span className="small">Keep a bike at the OutRent Hub from S$18&nbsp;/&nbsp;month.</span></span>
                <span className="ph"><Photo src={storage} alt="A bike stored at the OutRent Hub" width={112} height={112} className="promo-img" /></span>
              </button>
            </div>
          </section>
        </div>
      </main>

      <nav className="tabbar01" aria-label="Tabs">
        {TABS.map((t) => (
          <button key={t.label} type="button" aria-current={t.current ? 'page' : undefined} onClick={() => t.toast && toast(t.toast)}>
            <Icon name={t.icon} />{t.label}
          </button>
        ))}
      </nav>
      {toastNode}
    </>
  )
}
