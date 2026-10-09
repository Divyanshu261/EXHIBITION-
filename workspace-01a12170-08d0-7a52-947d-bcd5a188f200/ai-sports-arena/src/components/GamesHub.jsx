import { useState } from 'react'
import { SectionHeader } from './ui.jsx'
import { sfx } from '../lib/sound.js'
import NeuroKeeper from './games/NeuroKeeper.jsx'
import Goalkeeper from './games/Goalkeeper.jsx'
import Reaction from './games/Reaction.jsx'
import TicTacToe from './games/TicTacToe.jsx'
import AimTrainer from './games/AimTrainer.jsx'
import Pose from './games/Pose.jsx'
import RPS from './games/RPS.jsx'
import Stamina from './games/Stamina.jsx'

const GAMES = [
  { id: 'neuro', icon: '🧠', name: 'NeuroKeeper 2030', sub: 'Adaptive penalty shootout', C: NeuroKeeper, featured: true },
  { id: 'keeper', icon: '🧤', name: 'AI Goalkeeper', sub: 'Pattern-learning keeper', C: Goalkeeper },
  { id: 'reaction', icon: '⚡', name: 'Reaction Test', sub: 'Olympic sprint start', C: Reaction },
  { id: 'ttt', icon: '♟️', name: 'Tic-Tac-Toe', sub: 'Minimax tactical core', C: TicTacToe },
  { id: 'aim', icon: '🎯', name: 'Aim Trainer', sub: 'Target tracking', C: AimTrainer },
  { id: 'pose', icon: '🤸', name: 'Pose Challenge', sub: 'CV skeleton matching', C: Pose },
  { id: 'rps', icon: '✊', name: 'Gesture RPS', sub: 'Hand-landmark duel', C: RPS },
  { id: 'stamina', icon: '🔋', name: 'Stamina Clicker', sub: '10s fatigue curve', C: Stamina },
]

export default function GamesHub({ onFinish }) {
  const [active, setActive] = useState('neuro')
  const Game = GAMES.find((g) => g.id === active).C

  return (
    <section id="play-zone" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,255,135,0.06), transparent 70%)' }} />
      <div className="relative mx-auto max-w-7xl px-5">
        <SectionHeader kicker="Section A · Play Zone" title="The Arcade" accent="pitch">
          Eight playable sports-AI experiments. Every finished run can be submitted to the live arena leaderboard.
        </SectionHeader>

        {/* tab rail */}
        <div className="log-scroll -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-2">
          {GAMES.map((g) => (
            <button
              key={g.id}
              onClick={() => { sfx.click(); setActive(g.id) }}
              className={`group relative shrink-0 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                active === g.id
                  ? g.featured
                    ? 'border-gold/70 bg-gold/15 glow-crimson'
                    : 'border-pitch/60 bg-pitch/10 glow-pitch'
                  : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{g.icon}</span>
                <span>
                  <span className={`block font-display text-[11px] font-bold uppercase tracking-widest ${active === g.id ? (g.featured ? 'text-gold' : 'text-pitch') : 'text-white/80'}`}>
                    {g.name}
                    {g.featured && <span className="ml-2 rounded border border-gold/50 px-1 py-px text-[8px] tracking-[0.2em] text-gold">FEATURED</span>}
                  </span>
                  <span className="block text-[10px] font-semibold tracking-wider text-white/40">{g.sub}</span>
                </span>
              </span>
            </button>
          ))}
        </div>

        <div key={active} className="animate-rise">
          <Game onFinish={onFinish} />
        </div>
      </div>
    </section>
  )
}
