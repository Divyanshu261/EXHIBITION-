import { useEffect, useRef, useState } from 'react'
import { SectionHeader, NeonButton } from './ui.jsx'
import { sfx } from '../lib/sound.js'

export default function RefereeStudio() {
  const [humanCall, setHumanCall] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | tracking | zoom | verdict
  const [verdict, setVerdict] = useState(null)
  const [cam, setCam] = useState(0)
  const [hint, setHint] = useState('')
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const run = () => {
    if (!humanCall) { setHint('Make your human call first — IN or OUT.'); sfx.buzz(); return }
    setHint(''); sfx.click()
    const mm = (Math.round((Math.random() * 34 + 6)) / 10).toFixed(1)
    const isIn = Math.random() < 0.62
    const v = { mm, isIn, x: isIn ? 290.5 : 283.5 }
    setVerdict(v)
    setPhase('tracking')
    let c = 0
    const iv = setInterval(() => { c = (c + 1) % 4; setCam(c) }, 420)
    timers.current.push(setTimeout(() => { clearInterval(iv); sfx.lock(); setPhase('zoom') }, 1900))
    timers.current.push(setTimeout(() => { sfx.win(); setPhase('verdict') }, 3300))
  }

  const reset = () => { setPhase('idle'); setHumanCall(null); setVerdict(null); setHint('') }

  const match = verdict && humanCall && ((humanCall === 'IN') === verdict.isIn)

  return (
    <section id="referee" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 30%, rgba(0,212,255,0.07), transparent 70%)' }} />
      <div className="relative mx-auto max-w-6xl px-5">
        <SectionHeader kicker="Section B · AI Referee Studio" title="In / Out Decision Demo" accent="cyber">
          The human eye sees a blur. Ten cameras at 340 fps see millimetres. Make the call yourself, then let the Hawkeye core argue with you.
        </SectionHeader>

        <div className="glass-deep overflow-hidden rounded-2xl border-white/10">
          {/* player chrome */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/60 px-4 py-2.5">
            <div className="flex items-center gap-3 font-display text-[10px] tracking-[0.25em] uppercase text-white/70">
              <span className="h-2 w-2 rounded-full bg-crimson animate-pulse-dot" /> CAM 07 · Centre Court · Goal-Line Feed
            </div>
            <div className="font-mono text-[11px] text-cyber">
              TC 00:00:{phase === 'idle' ? '00' : '07'}:{phase === 'tracking' ? String(cam * 8 + 4).padStart(2, '0') : '12'} · 340fps
            </div>
          </div>

          {/* screen */}
          <div className="scanlines relative aspect-video bg-[#04120b]">
            <svg viewBox="0 0 400 220" className="absolute inset-0 h-full w-full">
              {/* stadium dark */}
              <rect width="400" height="220" fill="#04120b" />
              <rect y="168" width="400" height="52" fill="#0a3a1f" />
              <rect y="168" width="400" height="3" fill="rgba(255,255,255,.25)" />
              {/* the line */}
              <rect x="286" y="168" width="10" height="52" fill="#f4f7f5" />
              {/* trajectory */}
              <path
                d={`M 30 70 Q 170 -6 ${verdict ? verdict.x : 290} 166`}
                fill="none"
                stroke="#00d4ff"
                strokeWidth="2.4"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={phase === 'idle' ? 100 : 0}
                style={{ transition: 'stroke-dashoffset 1.7s cubic-bezier(.4,0,.7,1)', filter: 'drop-shadow(0 0 6px #00d4ff)' }}
              />
              {/* ball */}
              {(phase === 'zoom' || phase === 'verdict' || phase === 'tracking') && (
                <circle cx={verdict?.x ?? 290} cy="166" r="7" fill="#e8ff62" className={phase === 'tracking' ? 'opacity-40' : 'animate-pop'} style={{ filter: 'drop-shadow(0 0 8px #e8ff62)' }} />
              )}
              {/* contact mark */}
              {phase !== 'idle' && phase !== 'tracking' && (
                <ellipse cx={verdict?.x ?? 290} cy="172" rx="9" ry="3" fill="rgba(232,255,98,.5)" />
              )}
              {/* tracking reticle */}
              {phase === 'tracking' && (
                <g className="animate-blink">
                  <rect x={(verdict?.x ?? 290) - 26} y="140" width="52" height="52" fill="none" stroke="#00ff87" strokeWidth="1.4" strokeDasharray="5 4" />
                  <text x={(verdict?.x ?? 290) - 26} y="134" fill="#00ff87" fontSize="9" fontFamily="monospace">TRACK · CAM {cam + 4}/10</text>
                </g>
              )}
            </svg>

            {/* camera cut strip */}
            {phase === 'tracking' && (
              <div className="absolute bottom-3 left-3 flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`h-10 w-16 rounded border ${cam === i ? 'border-pitch glow-pitch' : 'border-white/20'} bg-black/70 p-1`}>
                    <div className="h-full w-full" style={{ background: `linear-gradient(${40 + i * 30}deg, rgba(0,255,135,.35), rgba(0,0,0,.9))` }} />
                  </div>
                ))}
              </div>
            )}

            {/* zoom overlay */}
            {phase === 'zoom' && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/85">
                <svg viewBox="0 0 200 120" className="h-[80%] animate-pop">
                  <rect width="200" height="120" fill="#0a3a1f" />
                  <rect x="100" width="34" height="120" fill="#f4f7f5" />
                  <circle cx={verdict.isIn ? 106 : 94} cy="60" r="26" fill="#e8ff62" opacity="0.95" style={{ filter: 'drop-shadow(0 0 14px #e8ff62)' }} />
                  <line x1="100" y1="12" x2={verdict.isIn ? 106 : 94} y2="12" stroke="#ff2d55" strokeWidth="1.6" />
                  <line x1="100" y1="8" x2="100" y2="16" stroke="#ff2d55" strokeWidth="1.6" />
                  <line x1={verdict.isIn ? 106 : 94} y1="8" x2={verdict.isIn ? 106 : 94} y2="16" stroke="#ff2d55" strokeWidth="1.6" />
                  <text x="103" y="7" fill="#ff2d55" fontSize="9" fontFamily="monospace">{verdict.mm} mm</text>
                  <text x="8" y="112" fill="rgba(255,255,255,.6)" fontSize="8" fontFamily="monospace">CONTACT POINT · ZOOM 40× · SUB-PIXEL FIT</text>
                </svg>
              </div>
            )}

            {phase === 'idle' && (
              <div className="absolute inset-x-0 bottom-4 text-center font-display text-[11px] tracking-[0.35em] uppercase text-white/40">
                Feed armed — make your call, then run the analysis
              </div>
            )}
          </div>

          {/* controls */}
          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 bg-black/50 px-4 py-4">
            <span className="font-display text-[10px] tracking-[0.3em] uppercase text-white/50">Human Call</span>
            {['IN', 'OUT'].map((c) => (
              <button
                key={c}
                onClick={() => { sfx.click(); setHumanCall(c) }}
                disabled={phase !== 'idle'}
                className={`clip-btn border px-6 py-2.5 font-display text-sm font-black tracking-[0.25em] transition-all disabled:opacity-40 ${
                  humanCall === c
                    ? c === 'IN' ? 'border-pitch bg-pitch/20 text-pitch glow-pitch' : 'border-crimson bg-crimson/20 text-crimson glow-crimson'
                    : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {c}
              </button>
            ))}
            <NeonButton variant="cyber" onClick={run} disabled={phase !== 'idle'} className="ml-auto">
              ◎ Run AI Hawkeye Analysis
            </NeonButton>
            {phase !== 'idle' && <NeonButton variant="ghost" onClick={reset} className="py-2.5 text-[10px]">Reset Feed</NeonButton>}
          </div>
          {hint && <p className="border-t border-crimson/30 bg-crimson/10 px-4 py-2 text-sm font-semibold tracking-wider text-crimson">{hint}</p>}
        </div>
      </div>

      {/* verdict modal */}
      {phase === 'verdict' && verdict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="glass-deep w-full max-w-md animate-pop rounded-2xl border-cyber/40 p-6 glow-cyber">
            <p className="font-display text-[10px] tracking-[0.35em] uppercase text-cyber">Hawkeye Core · Final Verdict</p>
            <p className={`mt-2 font-display text-4xl font-black uppercase tracking-wider ${verdict.isIn ? 'text-pitch text-glow-pitch' : 'text-crimson text-glow-crimson'}`}>
              {verdict.isIn ? 'IN' : 'OUT'} by {verdict.mm}mm
            </p>
            <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-semibold">
              <div className="flex justify-between"><span className="text-white/55">Your human call</span><span className="text-white">{humanCall}</span></div>
              <div className="flex justify-between"><span className="text-white/55">AI verdict</span><span className={verdict.isIn ? 'text-pitch' : 'text-crimson'}>{verdict.isIn ? 'IN' : 'OUT'} ±{verdict.mm}mm</span></div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-white/55">Agreement</span>
                <span className={match ? 'text-pitch' : 'text-crimson'}>{match ? '✓ You called it like a machine' : '✗ The machine disagrees'}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { l: 'Human eye error', v: 92, c: '#ff2d55', t: '±41 mm' },
                { l: 'Hawk-Eye multi-cam', v: 6, c: '#00d4ff', t: '±3.6 mm' },
              ].map((r) => (
                <div key={r.l}>
                  <div className="flex justify-between text-[11px] font-bold tracking-widest text-white/60"><span>{r.l.toUpperCase()}</span><span style={{ color: r.c }}>{r.t}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-white/8"><div className="h-full rounded-full" style={{ width: `${r.v}%`, background: r.c, boxShadow: `0 0 10px ${r.c}` }} /></div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <NeonButton variant="cyber" onClick={reset} className="flex-1 py-2.5 text-[11px]">Run Another Call</NeonButton>
              <NeonButton variant="ghost" onClick={() => setPhase('zoom')} className="flex-1 py-2.5 text-[11px]">Review Zoom</NeonButton>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
