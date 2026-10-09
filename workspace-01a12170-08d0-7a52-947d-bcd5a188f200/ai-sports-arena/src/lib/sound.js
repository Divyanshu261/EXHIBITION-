// Tiny WebAudio SFX engine — zero assets, works offline in the booth kiosk.
let muted = false
let ctx = null

export const setMuted = (m) => { muted = m }
export const isMuted = () => muted
export const toggleMuted = () => { muted = !muted; return muted }

export function beep(freq = 440, dur = 0.08, type = 'square', gain = 0.04) {
  if (muted) return
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.value = freq
    o.connect(g)
    g.connect(ctx.destination)
    const t = ctx.currentTime
    g.gain.setValueAtTime(gain, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.start(t)
    o.stop(t + dur)
  } catch {
    /* audio unavailable — stay silent */
  }
}

export const sfx = {
  click: () => beep(660, 0.05, 'square', 0.03),
  hover: () => beep(880, 0.03, 'sine', 0.015),
  kick: () => beep(200, 0.1, 'triangle', 0.07),
  goal: () => { beep(523, 0.1); setTimeout(() => beep(784, 0.1), 90); setTimeout(() => beep(1046, 0.2), 180) },
  save: () => beep(140, 0.16, 'sawtooth', 0.05),
  buzz: () => { beep(110, 0.2, 'sawtooth', 0.06); setTimeout(() => beep(90, 0.25, 'sawtooth', 0.05), 120) },
  go: () => beep(980, 0.14, 'square', 0.05),
  tick: () => beep(1200, 0.03, 'sine', 0.02),
  lock: () => { beep(700, 0.08); setTimeout(() => beep(990, 0.12), 80) },
  win: () => { beep(523, 0.1); setTimeout(() => beep(659, 0.1), 100); setTimeout(() => beep(784, 0.1), 200); setTimeout(() => beep(1046, 0.25), 300) },
  lose: () => { beep(300, 0.15, 'sawtooth', 0.04); setTimeout(() => beep(220, 0.2, 'sawtooth', 0.04), 140) },
  tap: () => beep(500 + Math.random() * 200, 0.03, 'square', 0.02),
}
