// Plain fetch to OpenRouter. The key comes from the environment or app/.env.local, never from anywhere in git.
import fs from 'fs'

const envFile = new URL('../../../.env.local', import.meta.url)
export function env(name) {
  if (process.env[name]) return process.env[name]
  if (!fs.existsSync(envFile)) return undefined
  return fs.readFileSync(envFile, 'utf8').match(new RegExp(`^${name}=(.*)$`, 'm'))?.[1]?.trim()
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function chat({ model, temperature, seed, messages, maxTokens = 1500 }) {
  const key = env('OPENROUTER_API_KEY')
  if (!key) throw new Error('OPENROUTER_API_KEY is not set')
  let last
  for (let i = 0; i < 6; i++) {
    const at = Date.now()
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, temperature, seed, messages, max_tokens: maxTokens, usage: { include: true }, reasoning: { exclude: true } }),
      })
      const j = await res.json().catch(() => null)
      if (res.ok && j?.choices?.[0]) {
        const u = j.usage ?? {}
        return { text: j.choices[0].message?.content ?? '', latency: Date.now() - at, usage: { in: u.prompt_tokens ?? 0, out: u.completion_tokens ?? 0, cost: u.cost ?? 0 }, provider: j.provider }
      }
      last = `${res.status} ${JSON.stringify(j?.error ?? j).slice(0, 300)}`
      if (res.status >= 400 && res.status < 500 && res.status !== 429 && res.status !== 408) break
    } catch (e) { last = e.message }
    await sleep(2000 * 2 ** i)
  }
  throw new Error(`OpenRouter: ${last}`)
}

export const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
