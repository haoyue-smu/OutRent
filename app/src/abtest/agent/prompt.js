// The runner's own prompt text. The task itself is never here: the agent reads it from the site's scenario screen (spec §3).
const FORBIDDEN = ['damage', 'bent', 'derailleur', 'chain', 'report', 'link', 'problem']

export function assertClean(text, where) {
  const low = text.toLowerCase()
  const hit = FORBIDDEN.filter((w) => low.includes(w))
  if (hit.length) throw new Error(`Forbidden word(s) ${hit.join(', ')} in ${where}`)
  return text
}
export const hasForbidden = (text) => FORBIDDEN.some((w) => text.toLowerCase().includes(w))

// Traits as attention habits that decide the next action, not adjectives (spec §5a).
export const HABITS = {
  reading: {
    'reads everything, scrolls': 'I read every line on a screen and scroll to the end of it before I decide what to tap.',
    'skims, heads for the main button': 'I read the headline and the buttons, then go for the main button. I rarely scroll back up.',
  },
  deposit: {
    'worried about losing S$150': 'S$150 is real money to me, so I slow down at anything that could cost me some of it.',
    'not bothered': 'I assume a deposit simply comes back, so it does not change what I look at.',
  },
  time: {
    'ride starts at 8:00, in a hurry': 'My ride starts at 8:00, so at each screen I take the quickest way forward.',
    relaxed: 'I have the whole morning, so I take each screen at its own pace.',
  },
}

// Placeholders in the right style until the human pilot's real answers exist (spec §5a).
const EXAMPLES = ['thumb reaches it easier', 'top of the page i think', 'saw it straight away']

export function systemPrompt(p, coords = 'pixels') {
  const where = coords === 'grid'
    ? 'x and y are on a 0 to 1000 grid laid over the screenshot: 0,0 is its top left corner and 1000,1000 its bottom right, whatever its size. Aim at the middle of what you tap'
    : 'x and y are pixels in the screenshot, from its top left corner, at the middle of what you tap'
  return assertClean(`${p.text}

Facts about you, which you answer truthfully if asked:
- Age: ${p.age_band}
- How often you cycle: ${p.cycling}
- Rented sports or outdoor gear before: ${p.rented_before}

How you use your phone:
- ${HABITS.reading[p.reading]}
- ${HABITS.deposit[p.deposit]}
- ${HABITS.time[p.time]}

Rules:
- You are using your own phone. You act on what you see. One action at a time.
- Think the way this person would, in one or two short sentences, then act.
- When you type: at most 15 words, phone style, fragments fine, lowercase fine, no full explanations, do not start with "because". Examples of the style: ${EXAMPLES.map((e) => `"${e}"`).join(', ')}.
- Do not imitate Singlish.
- Do not comment on how the screens are built unless a question asks.

Each turn you get a screenshot of your phone. Reply with one JSON object and nothing else:
{"thought": "<one or two sentences, first person>", "action": <one action>}
The actions are:
{"type": "tap", "x": <number>, "y": <number>}   ${where}
{"type": "scroll", "direction": "up" or "down", "amount": "small" or "large"}
{"type": "type", "text": "<text>"}   only after tapping a text box
{"type": "done"}   only when the screen says you can stop`, 'system prompt')
}

export function stepMessage({ w, h, coords = 'pixels', history, skip, note }) {
  const lines = [coords === 'grid' ? 'The screenshot is what you see now.' : `Your phone screen is ${w} × ${h} pixels. The screenshot is what you see now.`]
  if (history.length) lines.push('What you just did, oldest first:', ...history.map((s) => `- ${s.thought ?? ''} ${JSON.stringify(s.action)}${s.result ? ` (${s.result})` : ''}`))
  if (note) lines.push(note)
  if (skip) lines.push('The optional text box on this screen: you feel like skipping this one.')
  return { own: lines.filter((l) => !l.startsWith('- ')).join('\n'), text: lines.join('\n') }
}

// The model's reply as an object, or null when it cannot be read.
export function parseReply(raw) {
  if (!raw) return null
  const s = raw.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/```(?:json)?/g, '')
  const a = s.indexOf('{'), b = s.lastIndexOf('}')
  if (a < 0 || b <= a) return null
  try {
    const j = JSON.parse(s.slice(a, b + 1)), t = j.action?.type
    if (t === 'tap' && Number.isFinite(+j.action.x) && Number.isFinite(+j.action.y)) return j
    if (t === 'scroll' && ['up', 'down'].includes(j.action.direction)) return j
    if (t === 'type' && typeof j.action.text === 'string') return j
    if (t === 'done') return j
    return null
  } catch { return null }
}
