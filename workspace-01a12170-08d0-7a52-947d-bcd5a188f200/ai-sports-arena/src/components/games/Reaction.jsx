import { useEffect, useRef, useState } from 'react'
import { GameFrame, NeonButton, StatChip } from '../ui.jsx'
import { sfx } from '../../lib/sound.js'

const MAX_ATTEMPTS = 3

function tier(ms) {
  if (ms < 180) return { label: 'Olympic Sprinter', color: '#00ff87' }
  if (ms <= 230) return { label: 'Pro Athlete', color: '#00d4ff' }
  if (ms <= 300) return { label: 'Club Athlete', color: '#ffc53d' }
  return { label: 'Amateur', color: '#ff2d55' }
}

export default function Reaction({ onFinish }) {
  const [phase, setPhase] = useState('idle') // idle | set | go | result | false
  const [times, setTimes] = useState([])
  const [ms, setMs] = useState(null)
  const timer = useRef(null)
  const goAt = useRef(0)
  const ended = useRef(false)

  useEffect(() => () => clearTimeout(timer.current), [])

  const start = () => {
    setMs(null)
    setPhase('set')
    timer.current = setTimeout(() => {
      goAt.current = performance.now()
      setPhase('go')
      sfx.go()
    }, 1400 + Math.random() * 2600)
  }

  const tap = () => {
    if (phase === 'set') {
      clearTimeout(timer.current)
      sfx.buzz()
      setPhase('false')
      return
    }
    if (phase === 'go') {
      const t = Math.round(performance.now() - goAt.current)
      setMs(t)
      const next = [...times, t]
      setTimes(next)
      setPhase('result')
      sfx.lock()
      if (next.length >= MAX_ATTEMPTS && !ended.current) {
        ended.current = true
        const best = Math.min(...next)
        setTimeout(() => onFinish({
          game: 'Reaction Test',
          display: `${best} ms`,
          points: Math.max(5, Math.min(100, Math.round((400 - best) / 3))),
        }), 900)
      }
    }
  }

  const reset = () => { setTimes([]); setMs(null); setPhase('idle'); ended.current = false }
  const best = times.length ? Math.min(...times) : null

  const bg =
    phase === 'set' ? 'bg-[#7a0c1d]' :
    phase === 'go' ? 'bg-[#00c853]' :
    phase === 'false' ? 'bg-[#3d0a12]' : 'bg-panel'

  return (
    <GameFrame
      title="Reaction Speed Test"
      tag="Olympic Sprint Start"
      tagAccent="pitch"
      blurb="Red means hold. Green means explode. False start and the starter's gun buzzes at you."
      hud={
        <>
          <StatChip label="Attempt" value={`${Math.min(times.length + (phase === 'result' ? 0 : 1), MAX_ATTEMPTS)}/${MAX_ATTEMPTS}`} accent="cyber" />
          <StatChip label="Best" value={best ? `${best} ms` : '—'} accent="pitch" />
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <button
          onClick={phase === 'idle' || phase === 'result' || phase === 'false' ? start : tap}
          className={`scanlines relative flex aspect-[16/10] select-none flex-col items-center justify-center overflow-hidden rounded-2xl border-4 transition-colors duration-100 ${bg} ${phase === 'go' ? 'border-pitch glow-pitch' : phase === 'set' ? 'border-crimson glow-crimson' : 'border-white/15'}`}
        >
          {phase === 'idle' && (
            <>
              <p className="font-display text-2xl md:text-4xl font-black uppercase tracking-widest text-white/85">On Your Marks</p>
              <p className="mt-3 text-sm font-semibold tracking-widest text-white/50">TAP TO ARM THE STARTER PISTOL</p>
            </>
          )}
          {phase === 'set' && (
            <>
              <span className="h-4 w-4 rounded-full bg-crimson animate-pulse-dot" />
              <p className="mt-4 font-display text-2xl md:text-4xl font-black uppercase tracking-widest text-white">On Your Marks…</p>
              <p className="mt-3 font-display text-xs tracking-[0.3em] uppercase text-white/70 animate-blink">WAIT FOR GREEN</p>
            </>
          )}
          {phase === 'go' && (
            <p className="font-display text-5xl md:text-7xl font-black uppercase tracking-widest text-black text-glow-pitch">GO!</p>
          )}
          {phase === 'false' && (
            <>
              <p className="font-display text-3xl md:text-5xl font-black uppercase tracking-widest text-crimson text-glow-crimson">FALSE START</p>
              <p className="mt-3 text-sm font-semibold tracking-widest text-white/60">TAP TO RE-ARM</p>
            </>
          )}
          {phase === 'result' && ms !== null && (
            <>
              <p className="font-display text-5xl md:text-7xl font-black text-white" style={{ textShadow: '0 0 24px rgba(0,0,0,.6)' }}>{ms}<span className="text-2xl">ms</span></p>
              <p className="mt-2 font-display text-lg md:text-2xl font-bold uppercase tracking-widest" style={{ color: tier(ms).color }}>
                {tier(ms).label}
              </p>
              <p className="mt-3 font-display text-xs tracking-[0.3em] uppercase text-black/70">
                {times.length < MAX_ATTEMPTS ? 'TAP FOR NEXT ATTEMPT' : 'RUN COMPLETE'}
              </p>
            </>
          )}
        </button>

        {/* comparison graph */}
        <div className="glass rounded-xl border-white/10 p-5">
          <p className="font-display text-[10px] tracking-[0.3em] uppercase text-white/50">Latency Benchmark</p>
          {[
            { label: 'AI Camera Latency', v: 2, color: '#00d4ff' },
            { label: 'Human Reaction Limit', v: 100, color: '#00ff87' },
            { label: 'Your Best', v: best ?? 0, color: '#ff2d55' },
          ].map((row) => (
            <div key={row.label} className="mt-4">
              <div className="flex justify-between text-xs font-bold tracking-widest text-white/65">
                <span>{row.label.toUpperCase()}</span>
                <span style={{ color: row.color }}>{row.v} ms</span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${row.v ? Math.max(3, Math.min(100, (Math.sqrt(row.v) / Math.sqrt(450)) * 100)) : 0}%`,
                    background: row.color,
                    boxShadow: `0 0 12px ${row.color}`,
                  }}
                />
              </div>
            </div>
          ))}
          <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-3 text-sm font-medium text-white/60">
            <p className="font-display text-[10px] tracking-[0.3em] uppercase text-cyber">Tier Table</p>
            <ul className="mt-2 space-y-1 text-xs tracking-wider">
              <li><span className="text-pitch">&lt;180ms</span> — Olympic Sprinter</li>
              <li><span className="text-cyber">180–230ms</span> — Pro Athlete</li>
              <li><span className="text-gold">231–300ms</span> — Club Athlete</li>
              <li><span className="text-crimson">&gt;300ms</span> — Amateur</li>
            </ul>
          </div>
          <div className="mt-4 flex gap-2">
            <NeonButton variant="ghost" onClick={reset} className="flex-1 py-2 text-[10px]">Reset Run</NeonButton>
          </div>
        </div>
      </div>
    </GameFrame>
  )
}
