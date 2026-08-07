// Verifies every colour token in globals.css: sRGB gamut + WCAG contrast.
// Run: node scripts/check-tokens.mjs
import fs from 'node:fs'

const css = fs.readFileSync(
  new URL('../src/app/globals.css', import.meta.url),
  'utf8',
)

function block(sel) {
  const i = css.indexOf(sel)
  if (i === -1) throw new Error(`selector not found: ${sel}`)
  const s = css.indexOf('{', i)
  const e = css.indexOf('\n}', s)
  const o = {}
  for (const m of css.slice(s, e).matchAll(/(--[\w-]+):\s*([^;]+);/g))
    o[m[1]] = m[2].trim()
  return o
}

function oklchToSrgb(L, C, H) {
  const r = (H * Math.PI) / 180
  const a = C * Math.cos(r)
  const b = C * Math.sin(r)
  const x = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const y = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const z = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * x - 3.3077115913 * y + 0.2309699292 * z,
    -1.2684380046 * x + 2.6097574011 * y - 0.3413193965 * z,
    -0.0041960863 * x - 0.7034186147 * y + 1.707614701 * z,
  ]
}

const inGamut = (c) => c.every((v) => v >= -0.002 && v <= 1.002)
const clamp = (v) => Math.min(1, Math.max(0, v))
const luminance = (c) =>
  0.2126 * clamp(c[0]) + 0.7152 * clamp(c[1]) + 0.0722 * clamp(c[2])
const contrast = (A, B) => {
  const a = luminance(A)
  const b = luminance(B)
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}
const composite = (fg, bg, alpha) =>
  fg.map((c, i) => c * alpha + bg[i] * (1 - alpha))

function parse(value) {
  const m = value.match(
    /oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)%)?\)/,
  )
  if (!m) return null
  return { c: oklchToSrgb(+m[1], +m[2], +m[3]), a: m[4] ? +m[4] / 100 : 1 }
}

const light = block(':root {')
const dark = block(":root[data-theme='dark'] {")
const STATUSES = ['new', 'screening', 'interview', 'offer', 'hired', 'rejected']

let failures = 0
let checks = 0

function check(label, ratio, need) {
  checks++
  if (ratio < need) {
    failures++
    console.log(`  FAIL ${ratio.toFixed(2)} (need ${need})  ${label}`)
  }
}

for (const [theme, vars] of [
  ['light', light],
  ['dark', dark],
]) {
  for (const [k, v] of Object.entries(vars)) {
    const p = parse(v)
    if (p && p.a === 1 && !inGamut(p.c)) {
      failures++
      console.log(`  GAMUT ${theme} ${k}: ${v}`)
    }
  }
}

for (const [theme, vars] of [
  ['light', light],
  ['dark', dark],
]) {
  const T = (n) => parse(vars[n])
  const card = T('--card').c
  const bg = T('--background').c
  const on = (name) => {
    const p = T(name)
    return p.a === 1 ? p.c : composite(p.c, card, p.a)
  }

  check(
    `${theme} foreground/background`,
    contrast(T('--foreground').c, bg),
    4.5,
  )
  check(`${theme} foreground/card`, contrast(T('--foreground').c, card), 4.5)
  check(
    `${theme} muted-foreground/card`,
    contrast(T('--muted-foreground').c, card),
    4.5,
  )
  check(
    `${theme} muted-foreground/muted`,
    contrast(T('--muted-foreground').c, on('--muted')),
    4.5,
  )
  check(
    `${theme} primary-foreground/primary`,
    contrast(T('--primary-foreground').c, T('--primary').c),
    4.5,
  )
  check(
    `${theme} primary-foreground/primary-hover`,
    contrast(T('--primary-foreground').c, T('--primary-hover').c),
    4.5,
  )
  check(`${theme} primary-as-text/card`, contrast(T('--primary').c, card), 4.5)
  check(`${theme} ring/card (UI)`, contrast(T('--ring').c, card), 3)
  check(`${theme} input/card (UI)`, contrast(on('--input'), card), 3)
  check(`${theme} destructive/card`, contrast(T('--destructive').c, card), 4.5)
  // button.tsx / badge.tsx destructive variant: text-destructive on the tint, incl. hover
  check(
    `${theme} destructive/destructive-tint`,
    contrast(T('--destructive').c, on('--destructive-tint')),
    4.5,
  )
  check(
    `${theme} destructive/destructive-tint-hover`,
    contrast(T('--destructive').c, on('--destructive-tint-hover')),
    4.5,
  )
  check(`${theme} success/card`, contrast(T('--success').c, card), 4.5)
  check(
    `${theme} accent-foreground/accent`,
    contrast(T('--accent-foreground').c, on('--accent')),
    4.5,
  )
  check(
    `${theme} secondary-foreground/secondary`,
    contrast(T('--secondary-foreground').c, on('--secondary')),
    4.5,
  )

  for (const s of STATUSES) {
    const tint = on(`--status-${s}`)
    check(
      `${theme} status ${s} text`,
      contrast(T(`--status-${s}-foreground`).c, tint),
      4.5,
    )
    check(
      `${theme} status ${s} dot`,
      contrast(T(`--status-${s}-dot`).c, tint),
      3,
    )
  }
}

// Adjacent funnel steps must stay distinguishable by hue, not just by lightness.
const hueOf = (v) => +v.match(/oklch\([\d.]+\s+[\d.]+\s+([\d.]+)/)[1]
const funnel = ['new', 'screening', 'interview', 'offer', 'hired']
for (let i = 0; i < funnel.length - 1; i++) {
  const a = hueOf(light[`--status-${funnel[i]}-foreground`])
  const b = hueOf(light[`--status-${funnel[i + 1]}-foreground`])
  let d = Math.abs(a - b)
  if (d > 180) d = 360 - d
  checks++
  if (d < 100) {
    failures++
    console.log(
      `  HUE  ${funnel[i]} -> ${funnel[i + 1]} only ${d}° apart (need 100°)`,
    )
  }
}

console.log(
  failures
    ? `\n${failures} problems out of ${checks} checks`
    : `\nAll ${checks} checks passed`,
)
process.exit(failures ? 1 : 0)
