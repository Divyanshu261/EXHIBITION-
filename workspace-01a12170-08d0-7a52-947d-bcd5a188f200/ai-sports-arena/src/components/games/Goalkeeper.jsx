import { useMemo, useRef, useState } from 'react'
import { GameFrame, Meter, NeonButton, StatChip } from '../ui.jsx'
import { sfx } from '../../lib/sound.js'

const SIDES = ['L', 'C', 'R']
const LABEL = { L: 'LEFT', C: 'CENTER', R: 'RIGHT' }
const POS = { L: 16, C: 50, R: 84 }

/* Adaptive model: Laplace-smoothed frequency of the player's shot history */
function model(history) {
  const counts = { L: 0.6, C: 0.6, R: 0.6 }
  history.forEach((h) => { counts[h.side] += 1 })
  const total = counts.L + counts.C + counts.R
  const probs = { L: counts.L / total, C: counts.C / total, R: counts.R / total }
  const pred = SIDES.reduce((a, b) => (probs[a] >= probs[b] ? a : b))
  return { probs, pred, confidence: Math.round(probs[pred] * 100) }
}

export default function Goalkeeper({ onFinish }) {
  const [history, setHistory] = useState([])
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState('aim') // aim | flight | over
  const [fx, setFx] = useState(null) // {shot, dive, saved}
  const ended = useRef(false)

  const { probs, pred, confidence } = useMemo(() => model(history), [history])
  const goals = history.filter((h) => h.goal).length
  const saves = history.length - goals

  const diveSample = (probs) => {
    const r = Math.random()
    if (r < probs.L) return 'L'
    if (r < probs.L + probs.C) return 'C'
    return 'R'
  }

  const shoot = (side) => {
    if (phase !== 'aim') return
    const dive = diveSample(probs)
    const saved = dive === side
    sfx.kick()
    setTimeout(() => (saved ? sfx.save() : sfx.goal()), 420)
    setPhase('flight')
    setFx({ shot: side, dive, saved })
    setTimeout(() => {
      const next = [...history, { side, goal: !saved }]
      setHistory(next)
      if (next.length >= 5) {
        setPhase('over')
        const g = next.filter((h) => h.goal).length
        if (!ended.current) {
          ended.current = true
          setTimeout(() => onFinish({ game: 'Penalty Shootout', display: `${g}/5 goals`, points: g * 20 }), 700)
        }
      } else {
        setRound((r) => r + 1)
        setPhase('aim')
        setFx(null)
      }
    }, 1150)
  }

  const reset = () => { setHistory([]); setRound(1); setPhase('aim'); setFx(null); ended.current = false }

  return (
    <GameFrame
      title="Adaptive AI Goalkeeper"
      tag="Pattern Learning"
      tagAccent="crimson"
      blurb="The keeper is a frequency model. Repeat yourself and it will read you like a paperback."
      hud={
        <>
          <StatChip label="Round" value={`${Math.min(round, 5)}/5`} accent="cyber" />
          <StatChip label="Goals" value={goals} accent="pitch" />
          <StatChip label="Saves" value={saves} accent="crimson" />
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* ------- goal ------- */}
        <div className="relative">
          <div
            className="relative mx-auto aspect-[2/1] w-full max-w-[640px] overflow-hidden rounded-t-[90px] border-4 border-b-0 border-white/70"
            style={{
              background:
                'repeating-linear-gradient(90deg, rgba(255,255,255,0.10) 0 2px, transparent 2px 26px), repeating-linear-gradient(0deg, rgba(255,255,255,0.10) 0 2px, transparent 2px 26px), linear-gradient(180deg, rgba(0,212,255,0.06), rgba(5,5,8,0.9))',
            }}
          >
            {/* keeper */}
            <div
              className="absolute bottom-0 left-1/2 z-10 transition-all duration-500 ease-out"
              style={{
                transform: fx
                  ? `translateX(${(POS[fx.dive] - 50) * 3.4}%) rotate(${fx.dive === 'L' ? -55 : fx.dive === 'R' ? 55 : 0}deg) translateY(${fx.dive === 'C' ? 0 : -6}px)`
                  : `translateX(${(POS[pred] - 50) * 0.5}%)`,
              }}
            >
              <svg width="74" height="96" viewBox="0 0 74 96" className="drop-shadow-[0_0_14px_rgba(255,45,85,0.8)]">
                <circle cx="37" cy="14" r="10" fill="#ff2d55" />
                <rect x="26" y="26" width="22" height="34" rx="8" fill="#ff2d55" />
                <rect x="6" y="28" width="20" height="9" rx="4.5" fill="#ff2d55" transform="rotate(-28 16 32)" />
                <rect x="48" y="28" width="20" height="9" rx="4.5" fill="#ff2d55" transform="rotate(28 58 32)" />
                <rect x="27" y="58" width="9" height="32" rx="4.5" fill="#c81e3f" />
                <rect x="38" y="58" width="9" height="32" rx="4.5" fill="#c81e3f" />
              </svg>
            </div>

            {/* ball */}
            <div
              className="absolute z-20 h-7 w-7 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.9)] transition-all duration-500 ease-in"
              style={{
                left: fx ? `${POS[fx.shot]}%` : '50%',
                bottom: fx ? '52%' : '-4%',
                transform: 'translateX(-50%)',
                opacity: phase === 'aim' ? 0.9 : 1,
              }}
            >
              <div className="h-full w-full rounded-full" style={{ background: 'radial-gradient(circle at 35% 30%, #fff, #bbb 60%, #777)' }} />
            </div>

            {/* result flash */}
            {fx && phase === 'flight' && (
              <div className="absolute inset-x-0 top-6 z-30 text-center">
                <span className={`font-display text-3xl md:text-5xl font-black uppercase animate-pop ${fx.saved ? 'text-crimson text-glow-crimson' : 'text-pitch text-glow-pitch'}`}>
                  {fx.saved ? 'SAVED!' : 'GOAL!'}
                </span>
              </div>
            )}
          </div>

          {/* shot buttons */}
          <div className="mx-auto mt-4 grid max-w-[640px] grid-cols-3 gap-3">
            {SIDES.map((s) => (
              <NeonButton
                key={s}
                variant={s === 'L' ? 'cyber' : s === 'C' ? 'pitch' : 'crimson'}
                disabled={phase !== 'aim'}
                onClick={() => shoot(s)}
                className="w-full py-4"
              >
                Shoot {LABEL[s]}
              </NeonButton>
            ))}
          </div>
        </div>

        {/* ------- AI brain panel ------- */}
        <div className="glass rounded-xl border-white/10 p-4">
          <p className="font-display text-[10px] tracking-[0.3em] uppercase text-white/50">Goalkeeper Neural Readout</p>
          <div className="mt-3 rounded-lg border border-crimson/40 bg-crimson/10 px-3 py-2 font-display text-xs md:text-sm font-bold uppercase tracking-wider text-crimson text-glow-crimson">
            {history.length === 0
              ? 'AI Confidence: 33% — calibrating…'
              : `AI Confidence: ${confidence}% — Predicting ${LABEL[pred]} Shot`}
          </div>
          <div className="mt-4 space-y-2">
            {SIDES.map((s) => (
              <div key={s}>
                <div className="flex justify-between text-[11px] font-bold tracking-widest text-white/60">
                  <span>DIVE {LABEL[s]}</span>
                  <span className="text-cyber">{Math.round(probs[s] * 100)}%</span>
                </div>
                <Meter value={probs[s] * 100} accent={s === pred ? '#ff2d55' : '#00d4ff'} height={6} />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="mb-1 font-display text-[10px] tracking-[0.3em] uppercase text-white/50">Shot History</p>
            <div className="flex min-h-7 flex-wrap gap-1.5">
              {history.length === 0 && <span className="text-xs text-white/35">No shots yet — the model is blind.</span>}
              {history.map((h, i) => (
                <span
                  key={i}
                  className={`rounded border px-2 py-0.5 font-display text-[10px] font-bold tracking-widest ${h.goal ? 'border-pitch/50 text-pitch' : 'border-crimson/50 text-crimson'}`}
                >
                  {LABEL[h.side][0]}·{h.goal ? 'GOAL' : 'SAVE'}
                </span>
              ))}
            </div>
          </div>
          {phase === 'over' && (
            <div className="mt-4 animate-pop rounded-lg border border-pitch/40 bg-pitch/10 p-3 text-center">
              <p className="font-display text-sm font-bold uppercase tracking-widest text-pitch">
                Full time — {goals}/5 beaten the keeper
              </p>
              <NeonButton variant="ghost" onClick={reset} className="mt-2 w-full py-2 text-[10px]">
                Rematch
              </NeonButton>
            </div>
          )}
        </div>
      </div>
    </GameFrame>
  )
}
