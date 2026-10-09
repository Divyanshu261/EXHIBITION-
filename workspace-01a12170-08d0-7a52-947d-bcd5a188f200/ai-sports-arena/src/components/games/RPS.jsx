import { useEffect, useRef, useState } from 'react'
import { GameFrame, NeonButton, StatChip } from '../ui.jsx'
import { sfx } from '../../lib/sound.js'

const P = { wrist:[50,88],palm:[50,62],thumb:[32,60],iM:[42,44],iT:[40,26],mM:[50,42],mT:[50,22],rM:[58,44],rT:[60,26],pM:[64,48],pT:[68,34] }
const GESTURES = {
  paper: P,
  rock: { ...P, thumb:[38,60],iM:[42,52],iT:[44,60],mM:[50,50],mT:[52,58],rM:[58,52],rT:[58,60],pM:[64,56],pT:[62,62] },
  scissors: { ...P, thumb:[36,58],iM:[40,42],iT:[34,22],mM:[56,42],mT:[62,22],rM:[58,52],rT:[58,60],pM:[64,56],pT:[62,62] },
}
const BONES = [['wrist','palm'],['palm','thumb'],['palm','iM'],['iM','iT'],['palm','mM'],['mM','mT'],['palm','rM'],['rM','rT'],['palm','pM'],['pM','pT']]
const KEYS = Object.keys(GESTURES[0] || {})
const COUNTER = { rock: 'paper', paper: 'scissors', scissors: 'rock' }
const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' }
const EMOJI = { rock: '✊', paper: '✋', scissors: '✌️' }
const ROUNDS = 5

function useMorph(target) {
  const [pts, setPts] = useState(target)
  const cur = useRef(target)
  useEffect(() => {
    let raf
    const step = () => {
      let moving = false
      const next = {}
      for (const k of Object.keys(target)) {
        const cx = cur.current[k][0], cy = cur.current[k][1]
        const nx = cx + (target[k][0] - cx) * 0.22
        const ny = cy + (target[k][1] - cy) * 0.22
        if (Math.abs(nx - target[k][0]) > 0.4 || Math.abs(ny - target[k][1]) > 0.4) moving = true
        next[k] = [nx, ny]
      }
      cur.current = next
      setPts(next)
      if (moving) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return pts
}

function Hand({ pts, color, label, conf }) {
  return (
    <div className="scanlines relative aspect-square overflow-hidden rounded-xl border border-white/15 bg-[#07090c]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        {BONES.map(([a, b], i) => (
          <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={color} strokeWidth="1.6" style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
        ))}
        {Object.entries(pts).map(([k, v]) => <circle key={k} cx={v[0]} cy={v[1]} r="2" fill={color} />)}
        <rect x="22" y="14" width="56" height="80" fill="none" stroke={color} strokeWidth="0.6" strokeDasharray="4 3" />
      </svg>
      {label && (
        <div className="absolute left-4 top-3 rounded border px-2 py-0.5 font-display text-[10px] font-bold tracking-widest" style={{ color, borderColor: color, background: 'rgba(0,0,0,.65)' }}>
          {label} {conf ? `· ${(conf).toFixed(1)}%` : ''}
        </div>
      )}
      <div className="absolute bottom-2 left-3 font-mono text-[9px] text-white/40">21 landmarks · mediapipe-hands</div>
    </div>
  )
}

export default function RPS({ onFinish }) {
  const [phase, setPhase] = useState('pick') // pick | scan | reveal
  const [round, setRound] = useState(1)
  const [user, setUser] = useState(null)
  const [ai, setAi] = useState(null)
  const [record, setRecord] = useState({ w: 0, l: 0, d: 0 })
  const [note, setNote] = useState('Show the camera a gesture. The classifier — and the counter-strategy model — are watching.')
  const history = useRef([])
  const ended = useRef(false)
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const userPts = useMorph(user ? GESTURES[user] : GESTURES.paper)
  const aiPts = useMorph(ai ? GESTURES[ai] : GESTURES.rock)

  const choose = (g) => {
    if (phase !== 'pick') return
    setUser(g); setAi(null); setPhase('scan'); sfx.click()
    timers.current.push(setTimeout(() => {
      const counts = { rock: 0.7, paper: 0.7, scissors: 0.7 }
      history.current.forEach((h) => { counts[h] += 1 })
      const total = counts.rock + counts.paper + counts.scissors
      const pred = Object.keys(counts).reduce((a, b) => (counts[a] >= counts[b] ? a : b))
      const conf = (counts[pred] / total) * 100
      const chosen = Math.random() < 0.65 ? COUNTER[pred] : ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)]
      setAi(chosen)
      history.current.push(g)
      const res = g === chosen ? 'd' : BEATS[g] === chosen ? 'w' : 'l'
      setRecord((r) => ({ ...r, [res]: r[res] + 1 }))
      setNote(
        `AI predicted ${pred.toUpperCase()} (${conf.toFixed(0)}%) from your habit map → threw ${chosen.toUpperCase()}. ` +
        (res === 'w' ? 'You beat the model this round.' : res === 'l' ? 'The model countered you.' : 'Mirror round — model recalibrating.')
      )
      res === 'w' ? sfx.win() : res === 'l' ? sfx.lose() : sfx.tick()
      setPhase('reveal')
      timers.current.push(setTimeout(() => {
        if (round >= ROUNDS) {
          if (!ended.current) {
            ended.current = true
            const w = record.w + (res === 'w' ? 1 : 0)
            setTimeout(() => onFinish({ game: 'Gesture RPS', display: `${w}/${ROUNDS} rounds`, points: (w / ROUNDS) * 100 }), 500)
          }
        } else {
          setRound((r) => r + 1); setUser(null); setAi(null); setPhase('pick')
        }
      }, 1900))
    }, 900))
  }

  const reset = () => {
    timers.current.forEach(clearTimeout)
    setPhase('pick'); setRound(1); setUser(null); setAi(null)
    setRecord({ w: 0, l: 0, d: 0 }); history.current = []; ended.current = false
    setNote('Session reset. Habit map wiped.')
  }

  return (
    <GameFrame
      title="Webcam Rock-Paper-Scissors"
      tag="Gesture AI Sim"
      tagAccent="pitch"
      blurb="A simulated hand-landmark classifier duels an opponent model that counts your habits and counters your favourite gesture."
      hud={
        <>
          <StatChip label="Round" value={`${Math.min(round, ROUNDS)}/${ROUNDS}`} accent="cyber" />
          <StatChip label="W-L-T" value={`${record.w}-${record.l}-${record.d}`} accent="pitch" />
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 font-display text-[10px] tracking-[0.3em] uppercase text-pitch">Your Feed · Cam 02</p>
          <Hand pts={userPts} color="#00ff87" label={phase === 'scan' ? 'CLASSIFYING…' : user ? user.toUpperCase() : null} conf={phase === 'reveal' ? 94 + Math.random() * 5 : null} />
        </div>
        <div>
          <p className="mb-2 font-display text-[10px] tracking-[0.3em] uppercase text-crimson">Opponent · Gesture Bot</p>
          <Hand pts={aiPts} color="#ff2d55" label={ai ? ai.toUpperCase() : phase === 'scan' ? 'THINKING…' : '???'} conf={ai ? 91 + Math.random() * 7 : null} />
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-3 text-sm font-medium text-white/70">
        <span className="font-display text-[10px] tracking-[0.3em] uppercase text-cyber">Model Log · </span>{note}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {['rock', 'paper', 'scissors'].map((g) => (
          <NeonButton key={g} variant={g === 'rock' ? 'crimson' : g === 'paper' ? 'pitch' : 'cyber'} disabled={phase !== 'pick'} onClick={() => choose(g)} className="w-full py-4 text-2xl">
            <span className="mr-2">{EMOJI[g]}</span><span className="font-display text-xs tracking-widest">{g.toUpperCase()}</span>
          </NeonButton>
        ))}
      </div>
      {round >= ROUNDS && phase === 'reveal' && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-pitch/40 bg-pitch/10 px-4 py-3">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-pitch">Match complete — {record.w}W / {record.l}L</p>
          <NeonButton variant="ghost" onClick={reset} className="py-2 text-[10px]">Rematch</NeonButton>
        </div>
      )}
    </GameFrame>
  )
}
