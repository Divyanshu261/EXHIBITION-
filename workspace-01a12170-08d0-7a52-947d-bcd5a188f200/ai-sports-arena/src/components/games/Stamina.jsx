import { useEffect, useRef, useState } from 'react'
import { GameFrame, NeonButton, StatChip } from '../ui.jsx'
import { sfx } from '../../lib/sound.js'

const ROUND = 10
const MACHINE_TPS = 10

export default function Stamina({ onFinish }) {
  const [phase, setPhase] = useState('idle') // idle | run | done
  const [elapsed, setElapsed] = useState(0)
  const [taps, setTaps] = useState(0)
  const stamps = useRef([])
  const ended = useRef(false)
  const iv = useRef(null)

  useEffect(() => () => clearInterval(iv.current), [])

  const buckets = () => {
    const b = Array(10).fill(0)
    const t0 = stamps.current[0] ?? 0
    stamps.current.forEach((t) => {
      const s = Math.min(9, Math.floor((t - t0) / 1000))
      b[s] += 1
    })
    return b
  }

  const start = () => {
    stamps.current = []; setTaps(0); setElapsed(0); ended.current = false
    setPhase('run')
    const t0 = performance.now()
    iv.current = setInterval(() => {
      const e = (performance.now() - t0) / 1000
      setElapsed(e)
      if (e >= ROUND) {
        clearInterval(iv.current)
        setPhase('done')
        if (!ended.current) {
          ended.current = true
          const n = stamps.current.length
          const avg = n / ROUND
          sfx.win()
          setTimeout(() => onFinish({
            game: 'Stamina Clicker',
            display: `${n} taps · ${avg.toFixed(1)} TPS`,
            points: Math.min(100, Math.round(avg * 10)),
          }), 700)
        }
      }
    }, 100)
  }

  const tap = () => {
    if (phase !== 'run') return
    stamps.current.push(performance.now())
    setTaps(stamps.current.length)
    sfx.tap()
  }

  const b = buckets()
  const active = Math.max(1, Math.min(10, Math.ceil(elapsed)))
  const avg = phase === 'idle' ? 0 : taps / Math.max(0.1, Math.min(ROUND, elapsed || 0.1))
  const fatigue = b[0] && b[active - 1] ? b[0] - b[active - 1] : 0
  const maxY = Math.max(12, ...b, MACHINE_TPS)

  return (
    <GameFrame
      title="10-Second Stamina Clicker"
      tag="Fatigue Curve"
      tagAccent="crimson"
      blurb="A sprint finish for your fingertip. Tap fast, watch your output decay second by second — the machine line never tires."
      hud={
        <>
          <StatChip label="Clock" value={`${Math.max(0, ROUND - elapsed).toFixed(1)}s`} accent={elapsed > 7 ? 'crimson' : 'cyber'} />
          <StatChip label="Taps" value={taps} accent="pitch" />
          <StatChip label="TPS" value={avg.toFixed(1)} accent="gold" />
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <button
          onPointerDown={phase === 'run' ? tap : start}
          className={`relative flex aspect-square select-none items-center justify-center rounded-full border-4 font-display text-xl font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${
            phase === 'run'
              ? 'border-crimson bg-gradient-to-b from-crimson/40 to-crimson/10 text-white glow-crimson'
              : 'border-white/20 bg-white/5 text-white/70 hover:border-crimson/60'
          }`}
        >
          <span className="text-center">
            {phase === 'run' ? <>TAP!<span className="block text-xs tracking-widest text-white/60">{taps} taps</span></> :
             phase === 'done' ? <>RUN DONE<span className="block text-xs tracking-widest text-pitch">{taps} taps · {avg.toFixed(1)} TPS</span></> :
             <>START SPRINT<span className="block text-xs tracking-widest text-white/50">10 seconds · max effort</span></>}
          </span>
          {phase === 'run' && (
            <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90">
              <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,45,85,.25)" strokeWidth="3" />
              <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#ff2d55" strokeWidth="3" strokeDasharray={`${(elapsed / ROUND) * 301.6} 301.6`} style={{ filter: 'drop-shadow(0 0 6px #ff2d55)' }} />
            </svg>
          )}
        </button>

        <div className="glass rounded-xl border-white/10 p-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-[10px] tracking-[0.3em] uppercase text-white/50">Live Fatigue Decay Curve</p>
            <div className="flex gap-3 font-display text-[9px] tracking-widest">
              <span className="text-crimson">— YOU</span><span className="text-cyber">-- MACHINE</span>
            </div>
          </div>
          <svg viewBox="0 0 100 46" className="mt-3 w-full">
            {[0, 11.5, 23, 34.5, 46].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,.07)" strokeWidth="0.4" />)}
            <line x1="0" y1={46 - (MACHINE_TPS / maxY) * 44} x2="100" y2={46 - (MACHINE_TPS / maxY) * 44} stroke="#00d4ff" strokeWidth="0.8" strokeDasharray="3 2" />
            <polyline
              fill="none"
              stroke="#ff2d55"
              strokeWidth="1.6"
              style={{ filter: 'drop-shadow(0 0 3px #ff2d55)' }}
              points={b.map((v, i) => `${i * 10 + 5},${46 - (v / maxY) * 44}`).join(' ')}
            />
            {b.map((v, i) => (i < active ? <circle key={i} cx={i * 10 + 5} cy={46 - (v / maxY) * 44} r="1.6" fill="#ff2d55" /> : null))}
          </svg>
          <div className="mt-2 grid grid-cols-10 gap-1 text-center font-mono text-[9px] text-white/40">
            {b.map((v, i) => <span key={i} className={i < active ? 'text-crimson' : ''}>{v || '·'}</span>)}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">
              <p className="font-display text-[9px] tracking-[0.25em] uppercase text-white/50">Peak Sec</p>
              <p className="font-display text-lg font-bold text-pitch">{Math.max(...b, 0)}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">
              <p className="font-display text-[9px] tracking-[0.25em] uppercase text-white/50">Fatigue Δ</p>
              <p className="font-display text-lg font-bold text-crimson">{fatigue > 0 ? `-${fatigue}` : '0'}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2">
              <p className="font-display text-[9px] tracking-[0.25em] uppercase text-white/50">Machine</p>
              <p className="font-display text-lg font-bold text-cyber">{MACHINE_TPS}</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-medium leading-relaxed text-white/45">
            Human motor output decays as phosphocreatine drains — the robotic baseline holds {MACHINE_TPS} taps/sec
            indefinitely. Your curve is the story of your sprint finish.
          </p>
          {phase === 'done' && <NeonButton variant="ghost" onClick={start} className="mt-3 w-full py-2 text-[10px]">Sprint Again</NeonButton>}
        </div>
      </div>
    </GameFrame>
  )
}
