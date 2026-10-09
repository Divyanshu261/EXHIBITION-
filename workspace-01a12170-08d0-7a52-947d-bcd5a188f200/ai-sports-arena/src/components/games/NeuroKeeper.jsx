import { useEffect, useMemo, useRef, useState } from 'react'
import { GameFrame, NeonButton, StatChip } from '../ui.jsx'
import { sfx, toggleMuted, isMuted } from '../../lib/sound.js'

/* ---- NeuroKeeper 2030 · adaptive AI penalty shootout ----
   The keeper is a neural net with your name on it: it memorises your
   favourite side, your favourite spot, your shot sequences — and from
   GEN 3 onward it reads your LIVE aim. Every fail costs MERCY.        */

const ZC = [[18, 20], [50, 20], [82, 20], [18, 48], [50, 48], [82, 48], [18, 76], [50, 76], [82, 76]]
const CORNERS = [0, 2, 6, 8]
const MAX_SHOTS = 15
const HALL_KEY = 'nk2030-hall'

const zoneOf = (p) => (p.y < 36 ? 0 : p.y < 68 ? 1 : 2) * 3 + (p.x < 36 ? 0 : p.x < 66 ? 1 : 2)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const pickWeighted = (w) => {
  const t = w.reduce((a, b) => a + b, 0)
  let r = Math.random() * t
  for (let i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0) return i }
  return w.length - 1
}

function predict(shots, gen, aim) {
  if (!shots.length) return { pt: { x: 50, y: 48 }, tele: null }
  const colC = [0, 0, 0]
  const zoneC = Array(9).fill(0)
  const seq = {}
  shots.forEach((s, i) => {
    colC[s.zone % 3] += 1
    zoneC[s.zone] += 1
    if (i > 0) {
      const p = shots[i - 1].zone
      seq[p] = seq[p] || Array(9).fill(0)
      seq[p][s.zone] += 1
    }
  })
  const prev = shots[shots.length - 1].zone
  let pt
  if (gen === 1) {
    const col = pickWeighted(colC.map((c) => c + 1))
    pt = { x: [18, 50, 82][col] + (Math.random() - 0.5) * 14, y: 48 + (Math.random() - 0.5) * 30 }
  } else {
    const zw = zoneC.map((c, z) => c + 0.5 + (gen >= 2 ? 0.9 * (seq[prev]?.[z] || 0) : 0))
    const zi = pickWeighted(zw)
    const pz = ZC[zi]
    pt = gen === 2
      ? { x: pz[0] + (Math.random() - 0.5) * 10, y: pz[1] + (Math.random() - 0.5) * 10 }
      : { x: 0.45 * pz[0] + 0.55 * aim.x + (Math.random() - 0.5) * 6, y: 0.45 * pz[1] + 0.55 * aim.y + (Math.random() - 0.5) * 6 }
  }
  pt.x = clamp(pt.x, 6, 94); pt.y = clamp(pt.y, 8, 92)
  return { pt, tele: gen >= 2 ? zoneOf(pt) : null }
}

const readHall = () => {
  try { return JSON.parse(localStorage.getItem(HALL_KEY)) || [] } catch { return [] }
}

export default function NeuroKeeper({ onFinish }) {
  const [phase, setPhase] = useState('ready') // ready | flight | over
  const [paused, setPaused] = useState(false)
  const [aim, setAim] = useState({ x: 50, y: 48 })
  const [shots, setShots] = useState([])
  const [score, setScore] = useState(0)
  const [mercy, setMercy] = useState(3)
  const [fx, setFx] = useState(null)
  const [clock, setClock] = useState(0)
  const [overReason, setOverReason] = useState('')
  const [hall, setHall] = useState(readHall)
  const [mute, setMute] = useState(isMuted())
  const readyStart = useRef(performance.now())
  const ended = useRef(false)
  const goalRef = useRef(null)

  const gen = Math.min(3, Math.floor(shots.length / 5) + 1)
  const pred = useMemo(() => predict(shots, gen, aim), [shots, gen, aim])
  const reach = 20 + gen * 2

  // shot clock
  useEffect(() => {
    if (phase !== 'ready' || paused) return
    const iv = setInterval(() => setClock((performance.now() - readyStart.current) / 1000), 100)
    return () => clearInterval(iv)
  }, [phase, paused])

  const end = (reason, finalShots, finalScore) => {
    setPhase('over'); setOverReason(reason)
    const g = Math.min(3, Math.floor(finalShots.length / 5) + 1)
    const entry = { score: finalScore, gen: g, ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    const nextHall = [...readHall(), entry].sort((a, b) => b.score - a.score).slice(0, 5)
    try { localStorage.setItem(HALL_KEY, JSON.stringify(nextHall)) } catch { /* kiosk mode */ }
    setHall(nextHall)
    reason.startsWith('SHUT') ? sfx.lose() : sfx.win()
    if (!ended.current) {
      ended.current = true
      setTimeout(() => onFinish({
        game: 'NeuroKeeper 2030',
        display: `${finalScore} pts · GEN ${g}`,
        points: clamp(Math.round(finalScore / 15), 0, 100),
      }), 1000)
    }
  }

  const shoot = () => {
    if (phase !== 'ready' || paused) return
    const t = (performance.now() - readyStart.current) / 1000
    const ball = { x: aim.x + (Math.random() - 0.5) * 4.4, y: aim.y + (Math.random() - 0.5) * 4.4 }
    const wide = ball.x < 2.5 || ball.x > 97.5 || ball.y < 2.5 || ball.y > 97.5
    const dive = pred.pt
    const saved = !wide && Math.hypot(ball.x - dive.x, (ball.y - dive.y) * 0.62) < reach
    const outcome = wide ? 'miss' : saved ? 'save' : 'goal'
    const z = zoneOf({ x: clamp(ball.x, 3, 97), y: clamp(ball.y, 3, 97) })
    const fast = t < 1.2
    const pts = outcome === 'goal' ? (CORNERS.includes(z) ? 150 : z === 4 ? 80 : 110) + (fast ? 50 : 0) : 0
    const newScore = score + pts
    sfx.kick()
    setTimeout(() => (outcome === 'goal' ? sfx.goal() : sfx.save()), 420)
    setFx({ ball, dive, outcome, pts, fast })
    setPhase('flight')
    setTimeout(() => {
      const nextShots = [...shots, { zone: z, x: ball.x, y: ball.y }]
      setShots(nextShots)
      const m = outcome === 'goal' ? mercy : mercy - 1
      setMercy(m)
      if (outcome === 'goal') setScore(newScore)
      if (m <= 0) end('SHUT OUT — MERCY DEPLETED', nextShots, newScore)
      else if (nextShots.length >= MAX_SHOTS) end('NET BROKEN — YOU SURVIVED ALL 3 GENERATIONS', nextShots, newScore)
      else { setPhase('ready'); setFx(null); readyStart.current = performance.now(); setClock(0) }
    }, 1050)
  }
  const shootRef = useRef(shoot); shootRef.current = shoot
  const aimRef = useRef(aim); aimRef.current = aim
  const phaseRef = useRef(phase); phaseRef.current = phase

  // keyboard: WASD aim · SPACE shoot · 1-9 zone · P pause · M mute
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const k = e.key.toLowerCase()
      if (k === ' ') { e.preventDefault(); shootRef.current(); return }
      if (k === 'p') { setPaused((p) => !p); return }
      if (k === 'm') { setMute(toggleMuted()); return }
      if (k >= '1' && k <= '9') { const z = ZC[+k - 1]; setAim({ x: z[0], y: z[1] }); return }
      const step = 4
      if (k === 'w') setAim((a) => ({ ...a, y: clamp(a.y - step, 4, 96) }))
      if (k === 's') setAim((a) => ({ ...a, y: clamp(a.y + step, 4, 96) }))
      if (k === 'a') setAim((a) => ({ ...a, x: clamp(a.x - step, 4, 96) }))
      if (k === 'd') setAim((a) => ({ ...a, x: clamp(a.x + step, 4, 96) }))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onMove = (e) => {
    if (phaseRef.current !== 'ready') return
    const r = goalRef.current.getBoundingClientRect()
    setAim({ x: clamp(((e.clientX - r.left) / r.width) * 100, 4, 96), y: clamp(((e.clientY - r.top) / r.height) * 100, 4, 96) })
  }

  const reset = () => {
    setPhase('ready'); setShots([]); setScore(0); setMercy(3); setFx(null)
    setAim({ x: 50, y: 48 }); setOverReason(''); setPaused(false)
    readyStart.current = performance.now(); ended.current = false
  }

  const keeperX = phase === 'flight' && fx ? fx.dive.x : 50 + (pred.pt.x - 50) * 0.22
  const keeperRot = phase === 'flight' && fx ? clamp((fx.dive.x - 50) * 1.4, -70, 70) : 0

  return (
    <GameFrame
      title="NeuroKeeper 2030"
      tag="Featured · Adaptive"
      tagAccent="gold"
      blurb="The keeper is a neural net with your name on it. By your third shot it's already leaning where it thinks you'll go — and every miss costs MERCY."
      hud={
        <>
          <StatChip label="GEN" value={`${gen}/3`} accent="gold" />
          <StatChip label="Score" value={score} accent="pitch" />
          <StatChip label="Mercy" value={'◆'.repeat(mercy) + '◇'.repeat(3 - mercy)} accent="crimson" />
          <button onClick={() => setMute(toggleMuted())} className="glass rounded-lg border-white/15 px-3 py-1.5 font-display text-[10px] tracking-widest text-white/70 hover:text-white">
            {mute ? ' MUTED' : '🔊 SOUND'}
          </button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_290px]">
        <div>
          {/* ---------- goal ---------- */}
          <div
            ref={goalRef}
            onMouseMove={onMove}
            onClick={(e) => onMove(e)}
            className="scanlines relative aspect-[16/9] w-full cursor-crosshair overflow-hidden rounded-xl border-2 border-white/25"
            style={{
              background:
                'repeating-linear-gradient(90deg, rgba(255,255,255,0.09) 0 1.5px, transparent 1.5px 22px), repeating-linear-gradient(0deg, rgba(255,255,255,0.09) 0 1.5px, transparent 1.5px 22px), radial-gradient(ellipse at 50% 0%, rgba(255,45,85,0.14), transparent 60%), #050507',
            }}
          >
            {/* zone numbers */}
            {ZC.map((z, i) => (
              <span key={i} className="pointer-events-none absolute font-display text-[10px] text-white/20" style={{ left: `${z[0]}%`, top: `${z[1]}%`, transform: 'translate(-50%,-50%)' }}>{i + 1}</span>
            ))}
            {/* telegraphed dive */}
            {pred.tele !== null && phase === 'ready' && (
              <div className="pointer-events-none absolute border-2 border-dashed border-gold/70" style={{ left: `${ZC[pred.tele][0] - 13}%`, top: `${ZC[pred.tele][1] - 15}%`, width: '26%', height: '30%' }}>
                <span className="absolute -top-5 left-0 font-display text-[9px] tracking-[0.25em] text-gold">PLANNED DIVE</span>
              </div>
            )}
            {/* keeper */}
            <div className="absolute bottom-0 z-10 transition-all duration-500 ease-out" style={{ left: `${keeperX}%`, transform: `translateX(-50%) rotate(${keeperRot}deg)` }}>
              <svg width="64" height="86" viewBox="0 0 74 96" className="drop-shadow-[0_0_16px_rgba(255,45,85,0.9)]">
                <circle cx="37" cy="14" r="10" fill="#ff2d55" />
                <rect x="26" y="26" width="22" height="34" rx="8" fill="#ff2d55" />
                <rect x="6" y="28" width="20" height="9" rx="4.5" fill="#ff2d55" transform="rotate(-30 16 32)" />
                <rect x="48" y="28" width="20" height="9" rx="4.5" fill="#ff2d55" transform="rotate(30 58 32)" />
                <rect x="27" y="58" width="9" height="32" rx="4.5" fill="#c81e3f" />
                <rect x="38" y="58" width="9" height="32" rx="4.5" fill="#c81e3f" />
                <circle cx="37" cy="12" r="3" fill="#00d4ff" opacity="0.9" />
              </svg>
            </div>
            {/* ball */}
            <div
              className="absolute z-20 h-6 w-6 rounded-full transition-all duration-500 ease-in"
              style={{
                left: fx ? `${fx.ball.x}%` : `${aim.x}%`,
                top: fx ? `${fx.ball.y}%` : '104%',
                transform: 'translate(-50%,-50%)',
                background: 'radial-gradient(circle at 35% 30%, #fff, #ccc 60%, #888)',
                boxShadow: '0 0 16px rgba(255,255,255,.8)',
                opacity: phase === 'over' ? 0 : 1,
              }}
            />
            {/* aim crosshair */}
            {phase === 'ready' && (
              <div className="pointer-events-none absolute z-30" style={{ left: `${aim.x}%`, top: `${aim.y}%`, transform: 'translate(-50%,-50%)' }}>
                <svg width="44" height="44" viewBox="0 0 44 44" className="drop-shadow-[0_0_8px_rgba(0,255,135,0.9)]">
                  <circle cx="22" cy="22" r="12" fill="none" stroke="#00ff87" strokeWidth="1.6" />
                  <line x1="22" y1="2" x2="22" y2="14" stroke="#00ff87" strokeWidth="1.6" />
                  <line x1="22" y1="30" x2="22" y2="42" stroke="#00ff87" strokeWidth="1.6" />
                  <line x1="2" y1="22" x2="14" y2="22" stroke="#00ff87" strokeWidth="1.6" />
                  <line x1="30" y1="22" x2="42" y2="22" stroke="#00ff87" strokeWidth="1.6" />
                </svg>
                <span className="absolute left-6 top-6 whitespace-nowrap font-mono text-[9px] text-pitch/90">{clock.toFixed(1)}s</span>
              </div>
            )}
            {/* outcome banner */}
            {fx && phase === 'flight' && (
              <div className="absolute inset-x-0 top-4 z-30 text-center">
                <span className={`font-display text-3xl md:text-4xl font-black uppercase animate-pop ${fx.outcome === 'goal' ? 'text-pitch text-glow-pitch' : 'text-crimson text-glow-crimson'}`}>
                  {fx.outcome === 'goal' ? `GOAL +${fx.pts}` : fx.outcome === 'save' ? 'SAVED — MERCY -1' : 'WIDE — MERCY -1'}
                </span>
                {fx.fast && fx.outcome === 'goal' && <span className="ml-2 font-display text-sm text-gold">⚡ FAST SHOT +50</span>}
              </div>
            )}
            {/* pause / over overlays */}
            {paused && phase === 'ready' && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 font-display text-3xl font-black tracking-[0.4em] text-white/80">PAUSED</div>
            )}
            {phase === 'over' && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-black/80">
                <p className="px-4 text-center font-display text-xl md:text-3xl font-black uppercase tracking-widest text-crimson text-glow-crimson">{overReason}</p>
                <p className="font-display text-lg text-pitch">FINAL SCORE {score}</p>
                <NeonButton variant="pitch" onClick={reset}>New Generation</NeonButton>
              </div>
            )}
          </div>

          {/* ---------- controls ---------- */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <NeonButton variant="pitch" onClick={shoot} disabled={phase !== 'ready' || paused} className="flex-1 py-4">
               Shoot (Space)
            </NeonButton>
            <NeonButton variant="ghost" onClick={() => setPaused((p) => !p)} className="py-4 text-[10px]"> Pause (P)</NeonButton>
            <NeonButton variant="ghost" onClick={reset} className="py-4 text-[10px]">↺ Reset</NeonButton>
          </div>
          <p className="mt-3 text-center text-[11px] font-semibold tracking-widest text-white/40">
            MOVE MOUSE / WASD TO AIM · CLICK OR 1–9 TO PICK A SPOT · SPACE OR SHOOT TO FIRE · CORNERS SCORE MOST · SHOOT IN &lt;1.2s FOR SPEED BONUS
          </p>
        </div>

        {/* ---------- side panel ---------- */}
        <div className="space-y-4">
          <div className="glass rounded-xl border-gold/30 p-4">
            <p className="font-display text-[10px] tracking-[0.3em] uppercase text-gold">Generation Model</p>
            <ul className="mt-2 space-y-2 text-xs font-semibold tracking-wide">
              {[
                ['GEN 1', 'Learns your favourite side.'],
                ['GEN 2', 'Memorises spots + sequences. Telegraphs its planned dive.'],
                ['GEN 3', 'Reads your LIVE aim. Fake it out with keys 1–9.'],
              ].map(([g, d], i) => (
                <li key={g} className={`flex gap-2 rounded-lg border px-3 py-2 ${gen === i + 1 ? 'border-gold/60 bg-gold/10 text-gold' : 'border-white/10 bg-white/5 text-white/50'}`}>
                  <span className="font-display font-black">{g}</span><span>{d}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-white/10 pt-2 text-[11px] font-semibold tracking-widest text-white/45">
              3 MERCY · EVERY FAIL COSTS 1 · 0 MERCY = SHUT OUT · 5 SHOTS = 1 NEW GEN
            </p>
          </div>
          <div className="glass rounded-xl border-white/10 p-4">
            <p className="font-display text-[10px] tracking-[0.3em] uppercase text-cyber">Hall of Aim</p>
            {hall.length === 0 ? (
              <p className="mt-2 text-xs font-semibold tracking-widest text-white/35">NO RECORDS ON FILE — BE THE FIRST</p>
            ) : (
              <ol className="mt-2 space-y-1.5">
                {hall.map((h, i) => (
                  <li key={i} className="flex justify-between rounded border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px]">
                    <span className={i === 0 ? 'text-gold' : 'text-white/70'}>#{i + 1} · {h.score} pts</span>
                    <span className="text-white/40">GEN {h.gen} · {h.ts}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className="glass rounded-xl border-white/10 p-4">
            <p className="font-display text-[10px] tracking-[0.3em] uppercase text-white/50">Shot Memory</p>
            <div className="mt-2 flex min-h-6 flex-wrap gap-1.5">
              {shots.length === 0 && <span className="text-xs text-white/35">Empty tensor. It knows nothing… yet.</span>}
              {shots.map((s, i) => (
                <span key={i} className="rounded border border-crimson/40 bg-crimson/10 px-2 py-0.5 font-mono text-[10px] text-crimson">z{s.zone + 1}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GameFrame>
  )
}
