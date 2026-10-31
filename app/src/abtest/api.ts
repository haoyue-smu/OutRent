// The test's own small server client: the two database functions and a write queue. No Supabase library, so the live
// app's dependencies stay as they are. The keys come from app/.env.local, which git ignores.
const URL_ = (import.meta.env.VITE_ABTEST_SUPABASE_URL ?? '') as string
const KEY = (import.meta.env.VITE_ABTEST_SUPABASE_ANON ?? '') as string
const rpc = (name: string) => `${URL_}/rest/v1/rpc/${name}`
const headers = { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}` }

export type Variant = 'a' | 'b'
export type Started = { id: number; variant: Variant; token: string; t0: number }

export type StartInfo = { t0: number; forced: Variant | null; pilot: boolean; viewport_h: number; viewport_w: number; dpr: number; device: string; user_agent: string }
export async function startRow(i: StartInfo): Promise<Started> {
  const res = await fetch(rpc('ab_start'), {
    method: 'POST', headers,
    body: JSON.stringify({ p_t0: i.t0, p_forced: i.forced, p_pilot: i.pilot, p_viewport_h: i.viewport_h, p_viewport_w: i.viewport_w, p_dpr: i.dpr, p_device: i.device, p_user_agent: i.user_agent }),
  })
  if (!res.ok) throw new Error(`ab_start ${res.status}`)
  const [row] = await res.json() as { id: number; variant: 'A' | 'B'; token: string }[]
  return { id: row.id, variant: row.variant === 'A' ? 'a' : 'b', token: row.token, t0: i.t0 }
}

export type LogEvent = { n: number; t: number; type: string; screen: string; target?: string; data?: unknown }
type Patch = { set: Record<string, unknown>; events: LogEvent[]; scroll_depth: unknown[]; photo_taken: unknown[]; hidden: unknown[] }
const empty = (): Patch => ({ set: {}, events: [], scroll_depth: [], photo_taken: [], hidden: [] })
const isEmpty = (p: Patch) => !Object.keys(p.set).length && !p.events.length && !p.scroll_depth.length && !p.photo_taken.length && !p.hidden.length

// Writes go out as the participant goes, within half a second, one at a time. A failed write goes back in the queue and
// the server ignores anything it already has. On pagehide what is left goes out at once, so a dropout still leaves a row.
const WAIT = 400, RETRY = 2000
export function makeQueue(token: string) {
  let next = empty()
  let timer = 0
  let busy = false
  const merge = (a: Patch, b: Patch): Patch => ({
    set: { ...b.set, ...a.set }, events: [...b.events, ...a.events], scroll_depth: [...b.scroll_depth, ...a.scroll_depth],
    photo_taken: [...b.photo_taken, ...a.photo_taken], hidden: [...b.hidden, ...a.hidden],
  })
  const schedule = (ms: number) => { if (!timer) timer = window.setTimeout(flush, ms) }
  async function flush() {
    timer = 0
    if (busy || isEmpty(next)) return
    busy = true
    const sending = next
    next = empty()
    let retry = false
    try {
      const res = await fetch(rpc('ab_log'), { method: 'POST', headers, keepalive: true, body: JSON.stringify({ p_token: token, p_patch: sending }) })
      retry = res.status >= 500
    } catch { retry = true }
    if (retry) next = merge(next, sending)
    busy = false
    if (!isEmpty(next)) schedule(retry ? RETRY : WAIT)
  }
  return {
    push(p: Partial<Patch>) {
      next = merge({ ...empty(), ...p }, next)
      schedule(WAIT)
    },
    // The last write as the page goes. Not sendBeacon: it always sends credentials, and a JSON body needs a preflight,
    // which a gateway answering Access-Control-Allow-Origin: * refuses, so the write would be lost. A keepalive fetch
    // outlives the page the same way, and can carry the headers without credentials.
    beacon() {
      if (isEmpty(next)) return
      const sending = next
      next = empty()
      fetch(rpc('ab_log'), { method: 'POST', headers, keepalive: true, credentials: 'omit', body: JSON.stringify({ p_token: token, p_patch: sending }) })
        .catch(() => { next = merge(next, sending); schedule(RETRY) })
    },
  }
}
export type Queue = ReturnType<typeof makeQueue>

export function deviceName(ua = navigator.userAgent) {
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Other'
  const browser = /SamsungBrowser/.test(ua) ? 'Samsung' : /EdgA?\/|EdgiOS/.test(ua) ? 'Edge' : /FxiOS|Firefox/.test(ua) ? 'Firefox' : /CriOS|Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : 'Other'
  return `${os} · ${browser}`
}
