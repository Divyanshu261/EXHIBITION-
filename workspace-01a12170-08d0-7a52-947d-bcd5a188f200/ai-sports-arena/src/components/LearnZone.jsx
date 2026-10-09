import { useState } from 'react'
import { SectionHeader } from './ui.jsx'
import { sfx } from '../lib/sound.js'

const CARDS = [
  {
    icon: '🎥',
    title: 'Hawk-Eye & Multi-Camera Vision',
    tag: '3D Trajectory Rendering',
    accent: '#00d4ff',
    bullets: [
      '10 calibrated cameras sample the ball at 340 frames per second from every angle.',
      'Triangulation fuses 2D pixels into a millimetre-accurate 3D flight path.',
      'The rendered arc you see on TV is a physics model fitted to real optical data.',
    ],
    chips: ['340 fps', '10 cams', '±3.6 mm'],
    diagram: (
      <svg viewBox="0 0 220 100" className="w-full">
        <polygon points="30,90 190,90 160,40 60,40" fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.4)" />
        <path d="M40 30 Q 110 -8 168 78" fill="none" stroke="#00d4ff" strokeWidth="2" strokeDasharray="4 3" style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }} />
        <circle cx="168" cy="78" r="4" fill="#e8ff62" />
        {[[20, 20], [110, 8], [200, 20], [12, 70], [208, 70], [110, 96]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 4} y={y - 3} width="8" height="6" rx="1.5" fill="#ff2d55" />
            <line x1={x} y1={y} x2="168" y2="78" stroke="rgba(255,45,85,0.35)" strokeWidth="0.7" />
          </g>
        ))}
        <text x="8" y="12" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="monospace">6× SYNC CAMS → 3D SOLVE</text>
      </svg>
    ),
  },
  {
    icon: '📐',
    title: 'VAR & Offside Automation',
    tag: 'Spatial AI · Limb Tracking',
    accent: '#00ff87',
    bullets: [
      'Semi-automated offside tracks 29 body points per player, 50 times per second.',
      'Spatial AI builds a live 3D mesh of every limb — knees and shoulders decide the line.',
      'The kick-point frame is auto-detected, removing the human "which frame?" argument.',
    ],
    chips: ['29 points', '50 Hz', 'auto kick-point'],
    diagram: (
      <svg viewBox="0 0 220 100" className="w-full">
        <rect x="10" y="10" width="200" height="80" fill="rgba(0,255,135,0.06)" stroke="rgba(0,255,135,0.35)" />
        <line x1="150" y1="10" x2="150" y2="90" stroke="#00d4ff" strokeWidth="1.6" strokeDasharray="5 4" style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }} />
        <line x1="162" y1="10" x2="162" y2="90" stroke="#ff2d55" strokeWidth="1.6" strokeDasharray="5 4" style={{ filter: 'drop-shadow(0 0 4px #ff2d55)' }} />
        <g stroke="#00ff87" strokeWidth="1.4">
          <circle cx="162" cy="42" r="4" fill="#00ff87" />
          <line x1="162" y1="46" x2="162" y2="60" /><line x1="162" y1="60" x2="156" y2="72" /><line x1="162" y1="60" x2="168" y2="72" />
          <line x1="162" y1="50" x2="154" y2="56" /><line x1="162" y1="50" x2="170" y2="56" />
        </g>
        <g stroke="#ffc53d" strokeWidth="1.4">
          <circle cx="146" cy="44" r="4" fill="#ffc53d" />
          <line x1="146" y1="48" x2="146" y2="62" /><line x1="146" y1="62" x2="140" y2="74" /><line x1="146" y1="62" x2="152" y2="74" />
        </g>
        <text x="12" y="22" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="monospace">LIMB MESH · OFFSIDE PLANE</text>
      </svg>
    ),
  },
  {
    icon: '⌚',
    title: 'Smart Wearables & Injury Prediction',
    tag: 'GPS Vests · HRV · Load',
    accent: '#ffc53d',
    bullets: [
      'GPS vests log distance, sprint count and acceleration load every tenth of a second.',
      'Heart-rate variability flags nervous-system fatigue before muscles actually fail.',
      'Models combine both to predict soft-tissue injury risk and auto-adjust training load.',
    ],
    chips: ['10 Hz GPS', 'HRV', 'injury risk ML'],
    diagram: (
      <svg viewBox="0 0 220 100" className="w-full">
        <path d="M85 18 q25 -10 50 0 l6 40 q-26 12 -52 0 z" fill="rgba(255,197,61,0.10)" stroke="#ffc53d" strokeWidth="1.6" />
        <rect x="102" y="26" width="16" height="12" rx="2" fill="#ffc53d" />
        <polyline points="10,78 30,78 38,60 46,92 54,70 62,78 90,78 98,64 106,88 114,74 122,78 210,78" fill="none" stroke="#00ff87" strokeWidth="1.8" style={{ filter: 'drop-shadow(0 0 4px #00ff87)' }} />
        {[150, 165, 180, 195].map((x, i) => (
          <rect key={x} x={x} y={50 - i * 6} width="8" height={20 + i * 6} fill={i > 2 ? '#ff2d55' : '#00d4ff'} opacity="0.85" />
        ))}
        <text x="10" y="14" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="monospace">HRV WAVE · ACUTE LOAD BARS</text>
      </svg>
    ),
  },
]

export default function LearnZone() {
  const [open, setOpen] = useState(0)
  return (
    <section id="learn" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 60%, rgba(255,45,85,0.06), transparent 70%)' }} />
      <div className="relative mx-auto max-w-5xl px-5">
        <SectionHeader kicker="Section C · Learn Zone" title="How The Machine Sees Sport" accent="crimson">
          Three expandable breakdowns of the technology quietly refereeing the modern game.
        </SectionHeader>
        <div className="space-y-4">
          {CARDS.map((c, i) => {
            const isOpen = open === i
            return (
              <div key={c.title} className={`glass overflow-hidden rounded-2xl transition-all duration-300 ${isOpen ? 'border-white/25' : 'border-white/10 hover:border-white/20'}`} style={isOpen ? { boxShadow: `0 0 30px -10px ${c.accent}66` } : undefined}>
                <button className="flex w-full items-center gap-4 px-5 py-5 text-left md:px-7" onClick={() => { sfx.click(); setOpen(isOpen ? -1 : i) }}>
                  <span className="text-2xl md:text-3xl" style={{ filter: `drop-shadow(0 0 10px ${c.accent})` }}>{c.icon}</span>
                  <span className="flex-1">
                    <span className="block font-display text-base md:text-xl font-bold uppercase tracking-wider text-white">{c.title}</span>
                    <span className="block text-xs md:text-sm font-semibold tracking-widest" style={{ color: c.accent }}>{c.tag}</span>
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} style={{ color: c.accent }}>
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </button>
                <div className={`grid transition-all duration-500 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="grid gap-5 border-t border-white/10 px-5 py-5 md:grid-cols-2 md:px-7">
                      <div className="rounded-xl border border-white/10 bg-black/50 p-3">{c.diagram}</div>
                      <div>
                        <ul className="space-y-2.5">
                          {c.bullets.map((b) => (
                            <li key={b} className="flex gap-2.5 text-sm md:text-base font-medium text-white/70">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: c.accent, boxShadow: `0 0 8px ${c.accent}` }} />{b}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {c.chips.map((ch) => (
                            <span key={ch} className="clip-tag border px-3 py-1 font-display text-[10px] tracking-[0.2em] uppercase" style={{ color: c.accent, borderColor: `${c.accent}66`, background: `${c.accent}14` }}>
                              {ch}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
