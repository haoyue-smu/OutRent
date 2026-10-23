import { useState, type ReactNode } from 'react'
import lockup from '@design/brand/outrent-lockup.svg?raw'
import { GoTo } from '../../shell/Link'
import { Icon } from '../../shell/Icon'
import { TabBar } from '../../shell/TabBar'
import { Photo } from '../../shell/Photo'
import heroTrail from '@photos/01-home/assets/01-home-hero-trail.webp'
import bike from '@photos/01-home/assets/01-home-bike.webp'
import coachAisyah from '@photos/01-home/assets/01-home-coach-aisyah.webp'
import trailheadUnload from '@photos/01-home/assets/01-home-trailhead-unload.webp'
import coachGroup from '@photos/01-home/assets/01-home-coach-group.webp'
import timahCycles from '@photos/01-home/assets/01-home-timah-cycles.webp'
import './home.css'

// Which frame of the board to show. Change this one value to see each state.
//   'default'               E0-1 · default, Home selected (a booking tomorrow, 1 unseen notification)
//   'no-bookings'           E0-1 · no bookings
//   'notifications-unseen'  E9-4 · with unseen      'notifications-all-seen'  E9-4 · all seen     'notifications-empty'  E9-4 · empty
//   'messages-unread'       E9-2 · list with unread 'messages-all-read'       E9-2 · list all read 'messages-empty'       E9-2 · empty list
type Frame =
  | 'default' | 'no-bookings'
  | 'notifications-unseen' | 'notifications-all-seen' | 'notifications-empty'
  | 'messages-unread' | 'messages-all-read' | 'messages-empty'
const FRAME = 'default' as Frame

// ---------- mock data (MOCK-DATA v1.2, mock clock Fri 24 Oct 19:00) ----------
type Notice = { id: string; icon: string; text: string; when: string; page: string; unseen: boolean }
type Thread = { id: string; name: string; preview: string; about: string; when: string; photo: string; alt: string; page: string; unread: boolean }

const NOTICES: Notice[] = [
  { id: 'idle', icon: 'warehouse', text: 'Giant Escape 3 · not used since 24 May', when: 'Mon 19 Oct, 10:00', page: '14-my-equipment', unseen: true },
  { id: 'message', icon: 'chat-circle', text: 'New message from Timah Cycles', when: 'Thu 22 Oct, 17:22', page: '10-delivery-tracking', unseen: false },
  { id: 'confirmed', icon: 'check-circle', text: 'Booking OR-10482 confirmed', when: 'Thu 22 Oct, 09:12', page: '08-booking-confirmation', unseen: false },
]
const THREADS: Thread[] = [
  { id: 'timah', name: 'Timah Cycles', preview: 'Flat pedals are fitted. Clipless available on request.', about: 'Shop · about OR-10482', when: 'Thu 17:22', photo: timahCycles, alt: 'Timah Cycles shopfront, Bukit Timah', page: '10-delivery-tracking', unread: false },
]

const isNotices = FRAME.startsWith('notifications')
const isMessages = FRAME.startsWith('messages')
const hasBooking = FRAME !== 'no-bookings'
const startNotices = FRAME === 'notifications-empty' || FRAME === 'no-bookings' ? []
  : NOTICES.map((n) => (FRAME === 'notifications-all-seen' ? { ...n, unseen: false } : n))
const startThreads = FRAME === 'messages-empty' || FRAME === 'no-bookings' ? []
  : THREADS.map((t) => ({ ...t, unread: FRAME === 'messages-unread' }))

type View = 'home' | 'notifications' | 'messages'

export default function Home() {
  const [view, setView] = useState<View>(isNotices ? 'notifications' : isMessages ? 'messages' : 'home')
  const [notices, setNotices] = useState(startNotices)
  const [threads] = useState(startThreads)

  // Leaving the notification centre marks everything in it as seen.
  const backFromNotices = () => {
    setNotices((all) => all.map((n) => ({ ...n, unseen: false })))
    setView('home')
  }

  if (view === 'notifications') return <Notifications notices={notices} onBack={backFromNotices} />
  if (view === 'messages') return <Messages threads={threads} onBack={() => setView('home')} />

  const unseen = notices.filter((n) => n.unseen).length
  return (
    <>
      <main className="screen" key="home">
        <div className={`photo-top home-top${hasBooking ? '' : ' is-short'}`}>
          {hasBooking
            ? <Photo src={heroTrail} alt="Chestnut Nature Park trail in morning light" />
            : <Photo src={trailheadUnload} alt="Rider unloading a bike at a trailhead" />}
          <div className="float-top">
            <h1 className="chip glass home-brand" dangerouslySetInnerHTML={{ __html: lockup }} />
            <div className="home-actions">
              <button type="button" className="icon-btn glass" aria-label="Messages" onClick={() => setView('messages')}>
                <Icon name="chat-circle" />
              </button>
              <button
                type="button"
                className="icon-btn glass has-badge"
                aria-label={unseen ? `Notifications, ${unseen} unseen` : 'Notifications'}
                onClick={() => setView('notifications')}
              >
                <Icon name="bell" />
                {unseen > 0 && <span className="p-badge" aria-hidden="true">{unseen}</span>}
              </button>
            </div>
          </div>
          {hasBooking && (
            <div className="home-for">
              <span className="chip glass"><Icon name="calendar-blank" small />For Coach Aisyah's Saturday ride</span>
            </div>
          )}
        </div>

        {hasBooking ? <WithBooking /> : <NoBookings />}
      </main>
      <TabBar current="01-home" />
    </>
  )
}

function SearchField({ big }: { big?: boolean }) {
  return (
    <GoTo page="04-search-results" className={`field home-search${big ? ' is-big' : ''}`}>
      <Icon name="magnifying-glass" />
      <span className="home-stack">
        <span className="t-callout home-strong">Search gear</span>
        <span className="t-foot">What · where · when</span>
      </span>
    </GoTo>
  )
}

function StorageRow() {
  return (
    <GoTo page="16-storage-options" className="row">
      <span className="thumb"><Icon name="warehouse" /></span>
      <span className="body">
        <span className="meta">Storage · S$18 / month per bike</span>
        <span className="name">Store a bike at the Hub</span>
      </span>
      <Icon name="caret-right" small className="home-chev" />
    </GoTo>
  )
}

function WithBooking() {
  return (
    <div className="sheet home-sheet">
      <GoTo page="10-delivery-tracking" className="card home-booking">
        <div className="p-hero">
          <span className="k">Delivery in</span>
          <span className="t-display">12<span className="unit"> h </span>40<span className="unit"> min</span></span>
          <span className="sub">Tomorrow, Sat 25 Oct · 7:40</span>
        </div>
        <hr className="divider" />
        <span className="home-item">
          <Photo src={bike} alt="This Trek Marlin 7, side view" className="home-thumb" />
          <span className="home-stack">
            <span className="t-callout home-strong">Trek Marlin 7 · size M</span>
            <span className="t-foot">Chestnut trailhead carpark</span>
          </span>
          <Icon name="caret-right" small className="home-chev" />
        </span>
      </GoTo>
      <SearchField />
      <div className="home-rows">
        <GoTo page="02-coach-kit" className="row">
          <span className="thumb"><Photo src={coachAisyah} alt="Coach Aisyah, portrait" /></span>
          <span className="body">
            <span className="meta">Kit list by Coach Aisyah</span>
            <span className="name">First ride at Chestnut</span>
          </span>
          <Icon name="caret-right" small className="home-chev" />
        </GoTo>
        <hr className="divider" />
        <StorageRow />
      </div>
    </div>
  )
}

function NoBookings() {
  return (
    <div className="sheet home-sheet is-new">
      <div className="home-intro">
        <h2 className="t-large">Rent outdoor gear</h2>
        <span className="t-callout">Delivered to the trail, adjusted to your fit</span>
      </div>
      <SearchField big />
      <section className="home-section">
        <div className="home-section-head"><h2 className="t-title">Start here</h2></div>
        <GoTo page="02-coach-kit" className="card home-kit">
          <Photo src={coachGroup} alt="Coach Aisyah with her Saturday group" className="home-thumb" />
          <span className="home-stack">
            <span className="t-foot">Kit list by Coach Aisyah</span>
            <span className="t-callout home-strong">First ride at Chestnut</span>
            <span className="t-foot">What to rent, what to bring</span>
          </span>
          <Icon name="caret-right" small className="home-chev" />
        </GoTo>
      </section>
      <div className="home-rows"><StorageRow /></div>
    </div>
  )
}

// ---------- E9-4 notification centre and E9-2 conversations ----------
function ListPage({ title, sub, onBack, children }: { title: string; sub?: string; onBack: () => void; children: ReactNode }) {
  return (
    <main className="screen" key={title}>
      <div className="topbar">
        <button type="button" className="icon-btn" aria-label="Back" onClick={onBack}><Icon name="arrow-left" /></button>
        <span className="name" />
        <span />
      </div>
      <div className="home-list-page">
        <div className="home-intro">
          <h1 className="t-large">{title}</h1>
          {sub && <span className="t-callout">{sub}</span>}
        </div>
        {children}
      </div>
    </main>
  )
}

function Empty({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="home-empty">
      <span className="home-empty-icon"><Icon name={icon} /></span>
      <h2 className="t-title">{title}</h2>
      <p className="t-foot">{text}</p>
    </div>
  )
}

function NoticeRow({ n }: { n: Notice }) {
  return (
    <GoTo page={n.page} className="home-entry">
      <span className={`home-tile${n.unseen ? ' is-new' : ''}`}><Icon name={n.icon} /></span>
      <span className="home-stack">
        <span className={`t-callout${n.unseen ? ' home-strong' : ''}`}>{n.text}</span>
        <span className="t-foot num">{n.when}</span>
      </span>
      {n.unseen && <span className="p-dot" role="img" aria-label="Unseen" />}
    </GoTo>
  )
}

function Notifications({ notices, onBack }: { notices: Notice[]; onBack: () => void }) {
  const fresh = notices.filter((n) => n.unseen)
  const earlier = notices.filter((n) => !n.unseen)
  return (
    <ListPage title="Notifications" onBack={onBack}>
      {notices.length === 0 ? (
        <Empty icon="bell" title="No notifications" text="Bookings, deliveries, messages and idle gear show here" />
      ) : (
        <>
          {fresh.length > 0 && (
            <section className="home-section">
              <div className="home-section-head"><h2 className="t-title">New</h2><span className="t-foot">{fresh.length} unseen</span></div>
              <div className="card home-list">{fresh.map((n) => <NoticeRow key={n.id} n={n} />)}</div>
            </section>
          )}
          <section className="home-section">
            <div className="home-section-head"><h2 className="t-title">{fresh.length ? 'Earlier' : 'All seen'}</h2></div>
            <div className="card home-list">{earlier.map((n) => <NoticeRow key={n.id} n={n} />)}</div>
          </section>
        </>
      )}
    </ListPage>
  )
}

function Messages({ threads, onBack }: { threads: Thread[]; onBack: () => void }) {
  const unread = threads.filter((t) => t.unread).length
  const sub = threads.length === 0 ? undefined : unread ? `${unread} unread` : 'All read'
  return (
    <ListPage title="Messages" sub={sub} onBack={onBack}>
      {threads.length === 0 ? (
        <Empty icon="chat-circle" title="No messages yet" text="A listing or a booking opens a thread with its supplier" />
      ) : (
        <div className="card home-list">
          {threads.map((t) => (
            <GoTo key={t.id} page={t.page} className="home-entry is-thread">
              <Photo src={t.photo} alt={t.alt} className="home-avatar" />
              <span className="home-stack">
                <span className="t-callout home-strong">{t.name}</span>
                <span className={`t-foot home-preview${t.unread ? ' is-unread' : ''}`}>{t.preview}</span>
                <span className="t-foot">{t.about}</span>
              </span>
              <span className="home-when">
                <span className={`t-foot num${t.unread ? ' is-unread' : ''}`}>{t.when}</span>
                {t.unread && <span className="p-dot" role="img" aria-label="Unread" />}
              </span>
            </GoTo>
          ))}
        </div>
      )}
    </ListPage>
  )
}
