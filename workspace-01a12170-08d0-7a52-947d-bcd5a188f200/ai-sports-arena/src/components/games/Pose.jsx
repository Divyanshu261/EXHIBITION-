import { useEffect, useRef, useState } from 'react'
import { GameFrame, Meter, NeonButton, StatChip } from '../ui.jsx'
import { sfx } from '../../lib/sound.js'

const J = ['nose','neck','lSho','rSho','lElb','rElb','lWri','rWri','lHip','rHip','lKne','rKne','lAnk','rAnk']
const BONES = [['nose','neck'],['neck','lSho'],['neck','rSho'],['lSho','lElb'],['lElb','lWri'],['rSho','rElb'],['rElb','rWri'],['lSho','lHip'],['rSho','rHip'],['lHip','rHip'],['lHip','lKne'],['lKne','lAnk'],['rHip','rKne'],['rKne','rAnk']]

const STANDING = { nose:[50,14],neck:[50,26],lSho:[40,30],rSho:[60,30],lElb:[36,44],rElb:[64,44],lWri:[34,56],rWri:[66,56],lHip:[44,58],rHip:[56,58],lKne:[43,76],rKne:[57,76],lAnk:[42,94],rAnk:[58,94] }
const STANCES = [
  {
    name: '100m Sprint Start',
    tip: 'Crouch low, hands tracking the ground line, coiled rear leg.',
    pts: { nose:[62,38],neck:[56,46],lSho:[50,50],rSho:[62,50],lElb:[46,62],rElb:[66,62],lWri:[44,74],rWri:[68,74],lHip:[40,58],rHip:[50,58],lKne:[30,74],rKne:[44,78],lAnk:[26,90],rAnk:[40,92] },
  },
  {
    name: 'Cricket Batting Stance',
    tip: 'Side-on shoulders, soft elbows, hands stacked over the crease.',
    pts: { nose:[44,14],neck:[46,26],lSho:[40,30],rSho:[52,30],lElb:[34,42],rElb:[58,40],lWri:[36,52],rWri:[60,50],lHip:[42,58],rHip:[52,58],lKne:[40,76],rKne:[54,76],lAnk:[38,94],rAnk:[56,94] },
  },
  {
    name: 'Keeper Dive / Tree Balance',
    tip: 'Full extension — arms overhead, drive knee stacked over the ankle.',
    pts: { nose:[50,12],neck:[50,24],lSho:[42,28],rSho:[58,28],lElb:[36,18],rElb:[64,18],lWri:[48,8],rWri:[52,8],lHip:[46,56],rHip:[54,56],lKne:[44,74],rKne:[62,66],lAnk:[43,92],rAnk:[50,74] },
  },
]
const LOCK_AT = 92
const clone = (p) => Object.fromEntries(J.map((j) => [j, [...p[j]]]))

export default function Pose({ onFinish }) {
  const [stanceIdx, setStanceIdx] = useState(0)
  const [pts, setPts] = useState(() => clone(STANDING))
  const [align, setAlign] = useState(0)
  const [banked, setBanked] = useState([])
  const [phase, setPhase] = useState('play')
  const cur = useRef(clone(STANDING))
  const hold = useRef(false)
  const lockSince = useRef(null)
  const idx = useRef(0)
  const bank = useRef([])
  const ended = useRef(false)

  useEffect(() => {
    let raf
    const step = () => {
      const target = STANCES[idx.current].pts
      const dest = hold.current ? target : STANDING
      const k = hold.current ? 0.055 : 0.03
      const noise = hold.current ? 1.5 : 0.6
      let sum = 0
      for (const j of J) {
        const c = cur.current[j]
        c[0] += (dest[j][0] - c[0]) * k + (Math.random() - 0.5) * noise
        c[1] += (dest[j][1] - c[1]) * k + (Math.random() - 0.5) * noise
        sum += Math.hypot(target[j][0] - c[0], target[j][1] - c[1])
      }
      const a = Math.max(0, Math.min(100, 100 - (sum / J.length) * 2.1))
      setAlign(a)
      setPts(clone(cur.current))
      if (hold.current && a >= LOCK_AT) {
        lockSince.current = lockSince.current ?? performance.now()
        if (performance.now() - lockSince.current > 350) {
          lockSince.current = null
          bank.current = [...bank.current, Math.round(a)]
          setBanked(bank.current)
          sfx.lock()
          if (bank.current.length >= STANCES.length) {
            if (!ended.current) {
              ended.current = true
              const avg = Math.round(bank.current.reduce((x, y) => x + y, 0) / bank.current.length)
              setPhase('done')
              setTimeout(() => onFinish({ game: 'Pose Challenge', display: `${avg}% alignment`, points: avg }), 700)
            }
          } else {
            idx.current += 1
            setStanceIdx(idx.current)
            cur.current = clone(STANDING)
          }
        }
      } else lockSince.current = null
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reset = () => {
    cur.current = clone(STANDING); idx.current = 0; bank.current = []
    setStanceIdx(0); setBanked([]); setAlign(0); setPhase('play'); ended.current = false
  }

  const target = STANCES[stanceIdx].pts
  const xs = J.map((j) => pts[j][0]); const ys = J.map((j) => pts[j][1])
  const bx = Math.min(...xs) - 6, by = Math.min(...ys) - 6
  const bw = Math.max(...xs) - Math.min(...xs) + 12, bh = Math.max(...ys) - Math.min(...ys) + 12

  const Skeleton = ({ p, color, dashed = false }) => (
    <g>
      {BONES.map(([a, b], i) => (
        <line key={i} x1={p[a][0]} y1={p[a][1]} x2={p[b][0]} y2={p[b][1]} stroke={color} strokeWidth={dashed ? 0.7 : 1.4} strokeDasharray={dashed ? '2 2' : undefined} style={dashed ? undefined : { filter: `drop-shadow(0 0 2px ${color})` }} />
      ))}
      {J.map((j) => (
        <circle key={j} cx={p[j][0]} cy={p[j][1]} r={dashed ? 0.9 : 1.5} fill={color} opacity={dashed ? 0.55 : 1} />
      ))}
    </g>
  )

  return (
    <GameFrame
      title="CV Pose Challenge"
      tag="MediaPipe Mockup"
      tagAccent="cyber"
      blurb="A simulated webcam stream with 14-point skeletal tracking. Hold the MATCH button to drive your skeleton onto the ghost pose."
      hud={
        <>
          <StatChip label="Stance" value={`${Math.min(stanceIdx + 1, 3)}/3`} accent="cyber" />
          <StatChip label="Alignment" value={`${Math.round(align)}%`} accent={align >= LOCK_AT ? 'pitch' : 'gold'} />
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* webcam mock */}
        <div className="scanlines relative aspect-[4/3] overflow-hidden rounded-xl border border-cyber/40 bg-[#07090c] glow-cyber">
          <div className="absolute inset-0 animate-flicker" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,212,255,0.10), transparent 70%)' }} />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <Skeleton p={target} color="#00d4ff" dashed />
            <Skeleton p={pts} color="#00ff87" />
            <rect x={bx} y={by} width={bw} height={bh} fill="none" stroke="#00ff87" strokeWidth="0.5" strokeDasharray="3 2" />
          </svg>
          <div className="absolute left-3 top-3 flex items-center gap-2 font-display text-[10px] tracking-[0.25em] uppercase text-white/80">
            <span className="h-2 w-2 rounded-full bg-crimson animate-pulse-dot" /> CAM 01 · POSE NET
          </div>
          <div className="absolute right-3 top-3 rounded border border-pitch/50 bg-black/60 px-2 py-0.5 font-display text-[10px] tracking-widest text-pitch">
            PERSON · 0.98
          </div>
          <div className="absolute bottom-3 left-3 rounded border border-cyber/40 bg-black/60 px-2 py-0.5 font-mono text-[10px] text-cyber">
            33 landmarks · 60 fps · gpu: fp16
          </div>
          <div className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-cyber/10 to-transparent animate-scan" />
          {phase === 'done' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/75">
              <p className="font-display text-2xl font-black uppercase tracking-widest text-pitch text-glow-pitch">Session Captured</p>
              <p className="text-sm font-semibold tracking-widest text-white/70">AVG ALIGNMENT {Math.round(banked.reduce((a, b) => a + b, 0) / banked.length)}%</p>
              <NeonButton variant="ghost" onClick={reset} className="py-2 text-[10px]">New Session</NeonButton>
            </div>
          )}
        </div>

        {/* control panel */}
        <div className="flex flex-col gap-4">
          <div className="glass rounded-xl border-white/10 p-4">
            <p className="font-display text-[10px] tracking-[0.3em] uppercase text-white/50">Current Prompt</p>
            <p className="mt-1 font-display text-xl font-bold uppercase tracking-wider text-cyber text-glow-cyber">{STANCES[stanceIdx].name}</p>
            <p className="mt-1 text-sm font-medium text-white/55">{STANCES[stanceIdx].tip}</p>
          </div>
          <div className="glass rounded-xl border-white/10 p-4">
            <div className="flex justify-between font-display text-[10px] tracking-[0.3em] uppercase text-white/50">
              <span>Alignment Accuracy</span><span className={align >= LOCK_AT ? 'text-pitch' : 'text-white/70'}>{Math.round(align)}%</span>
            </div>
            <div className="mt-2"><Meter value={align} accent={align >= LOCK_AT ? '#00ff87' : '#00d4ff'} marker={LOCK_AT} height={12} /></div>
            <p className="mt-2 text-xs font-semibold tracking-widest text-white/45">HOLD UNTIL THE METER CROSSES THE {LOCK_AT}% LOCK MARK</p>
          </div>
          <button
            onPointerDown={() => { hold.current = true; sfx.tick() }}
            onPointerUp={() => { hold.current = false }}
            onPointerLeave={() => { hold.current = false }}
            className="clip-btn select-none border border-pitch/60 bg-pitch/15 py-5 font-display text-sm font-black uppercase tracking-[0.3em] text-pitch glow-pitch transition active:scale-95 active:bg-pitch/30"
          >
            ◎ Hold to Match Pose
          </button>
          <div className="flex gap-2">
            {banked.map((b, i) => (
              <span key={i} className="flex-1 rounded border border-pitch/40 bg-pitch/10 py-1 text-center font-display text-xs font-bold text-pitch">{b}%</span>
            ))}
            {Array.from({ length: 3 - banked.length }).map((_, i) => (
              <span key={`e${i}`} className="flex-1 rounded border border-white/10 py-1 text-center font-display text-xs text-white/25">—</span>
            ))}
          </div>
        </div>
      </div>
    </GameFrame>
  )
}
