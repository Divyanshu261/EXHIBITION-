import { useEffect, useRef, useState } from 'react'
import { GameFrame, NeonButton, StatChip } from '../ui.jsx'
import { sfx } from '../../lib/sound.js'

const ROUND = 30 // seconds
const LIFE = 1600 // ms per target

export default function AimTrainer({ onFinish }) {
  const [running, setRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(ROUND)
  const [targets, setTargets] = useState([])
  const [stats, setStats] = useState({ hits: 0, misses: 0, precision: 0, streak: 0, best: 0 })
  const [, setTick] = useState(0)
  const arena = useRef(null)
  const idRef = useRef(0)
  const ended = useRef(false)

  // countdown + expire loop
  useEffect(() => {
    if (!running) return
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) { clearInterval(iv); return 0 }
        return +(t - 0.1).toFixed(1)
      })
      setTick((x) => x + 1)
    }, 100)
    return () => clearInterval(iv)
  }, [running])

  // spawn loop
  useEffect(() => {
    if (!running) return
    const iv = setInterval(() => {
      setTargets((ts) => {
        const alive = ts.filter((t) => performance.now() - t.born < LIFE)
        if (alive.length >= 3) return alive
        return [...alive, { id: idRef.current++, x: 8 + Math.random() * 84, y: 10 + Math.random() * 78, born: performance.now(), r: 34 + Math.random() * 14 }]
      })
    }, 620)
    return () => clearInterval(iv)
  }, [running])

  // end of round
  useEffect(() => {
    if (running && timeLeft === 0 && !ended.current) {
      ended.current = true
      setRunning(false)
      setTargets([])
      const avg = stats.hits ? Math.round(stats.precision / stats.hits) : 0
      sfx.win()
      setTimeout(() => onFinish({ game: 'Aim Trainer', display: `${avg}% precision · ${stats.hits} hits`, points: avg }), 600)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, running])

  const hit = (e, t) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const d = Math.hypot(e.clientX - cx, e.clientY - cy) / (rect.width / 2)
    const prec = Math.max(20, Math.round(100 - d * 100))
    setTargets((ts) => ts.filter((x) => x.id !== t.id))
    setStats((s) => ({
      hits: s.hits + 1,
      misses: s.misses,
      precision: s.precision + prec,
      streak: s.streak + 1,
      best: Math.max(s.best, s.streak + 1),
    }))
    prec > 85 ? sfx.lock() : sfx.click()
  }

  const miss = () => {
    if (!running) return
    setStats((s) => ({ ...s, misses: s.misses + 1, streak: 0 }))
    sfx.buzz()
  }

  const start = () => {
    setStats({ hits: 0, misses: 0, precision: 0, streak: 0, best: 0 })
    setTimeLeft(ROUND); setTargets([]); ended.current = false; setRunning(true)
    sfx.click()
  }

  const now = performance.now()
  const avg = stats.hits ? Math.round(stats.precision / stats.hits) : 0

  return (
    <GameFrame
      title="AI Precision & Aim Trainer"
      tag="Target Tracking"
      tagAccent="gold"
      blurb="Targets bloom and decay like a keeper's reaction window. Click close to the bullseye — precision is measured per hit."
      hud={
        <>
          <StatChip label="Time" value={`${timeLeft.toFixed(1)}s`} accent={timeLeft < 6 ? 'crimson' : 'cyber'} />
          <StatChip label="Hits" value={stats.hits} accent="pitch" />
          <StatChip label="Miss" value={stats.misses} accent="crimson" />
          <StatChip label="Precision" value={`${avg}%`} accent="gold" />
        </>
      }
    >
      <div
        ref={arena}
        onPointerDown={miss}
        className="scanlines grid-bg relative aspect-[16/9] w-full cursor-crosshair overflow-hidden rounded-xl border border-gold/30 bg-black/70"
      >
        {!running && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/60">
            <p className="font-display text-xl md:text-3xl font-black uppercase tracking-widest text-gold text-glow-crimson">
              {timeLeft === 0 ? 'Round Complete' : 'Calibrate Your Aim'}
            </p>
            {timeLeft === 0 && (
              <p className="text-sm font-semibold tracking-widest text-white/70">
                {stats.hits} HITS · {stats.misses} MISSES · {avg}% AVG PRECISION · BEST STREAK {stats.best}
              </p>
            )}
            <NeonButton variant="pitch" onClick={start}>{timeLeft === 0 ? 'Run It Back' : 'Start 30s Round'}</NeonButton>
          </div>
        )}
        {targets.map((t) => {
          const age = (now - t.born) / LIFE
          const scale = Math.max(0.25, 1 - age * 0.75)
          return (
            <button
              key={t.id}
              onPointerDown={(e) => hit(e, t)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: `${t.x}%`, top: `${t.y}%`, width: t.r * 2, height: t.r * 2, transform: `translate(-50%,-50%) scale(${scale})` }}
            >
              <div
                className="h-full w-full rounded-full"
                style={{
                  background: 'radial-gradient(circle, #ffc53d 0 16%, #050507 17% 32%, #ff2d55 33% 49%, #050507 50% 66%, #ff2d55 67% 82%, transparent 83%)',
                  boxShadow: '0 0 18px rgba(255,197,61,0.65)',
                }}
              />
            </button>
          )
        })}
        {running && (
          <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center">
            <span className="glass rounded-full px-4 py-1 font-display text-xs tracking-[0.3em] uppercase text-white/80">
              streak <span className="text-pitch">{stats.streak}</span>
            </span>
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-xs font-semibold tracking-widest text-white/40">
        CLICK EMPTY SPACE = MISS · CLOSER TO BULLSEYE = HIGHER PRECISION SCORE
      </p>
    </GameFrame>
  )
}
