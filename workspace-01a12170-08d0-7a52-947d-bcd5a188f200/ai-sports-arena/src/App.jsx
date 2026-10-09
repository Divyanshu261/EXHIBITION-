import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import mask from './assets/mask.png'
import Hero from './components/Hero.jsx'
import GamesHub from './components/GamesHub.jsx'
import RefereeStudio from './components/RefereeStudio.jsx'
import LearnZone from './components/LearnZone.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import FloatingQR from './components/FloatingQR.jsx'
import ScoreModal from './components/ScoreModal.jsx'
import { sfx, toggleMuted, isMuted } from './lib/sound.js'

const MOCK = [
  { id: 'm1', name: 'Aarav Sharma', cls: 'XII-A', game: 'NeuroKeeper 2030', display: '1,450 pts · GEN 3', points: 96, ts: '16:42' },
  { id: 'm2', name: 'Meera Nair', cls: 'XI-B', game: 'Reaction Test', display: '163 ms', points: 93, ts: '16:31' },
  { id: 'm3', name: 'Dev Patel', cls: 'X-A', game: 'Penalty Shootout', display: '5/5 goals', points: 90, ts: '16:12' },
  { id: 'm4', name: 'Ishaan Verma', cls: 'XII-C', game: 'Tic-Tac-Toe', display: 'Won vs Unbeatable AI', points: 88, ts: '15:58' },
  { id: 'm5', name: 'Ananya Rao', cls: 'IX-B', game: 'Aim Trainer', display: '94% precision · 41 hits', points: 86, ts: '15:47' },
  { id: 'm6', name: 'Kabir Singh', cls: 'XI-A', game: 'Stamina Clicker', display: '94 taps · 9.4 TPS', points: 84, ts: '15:30' },
  { id: 'm7', name: 'Sara Khan', cls: 'X-B', game: 'Pose Challenge', display: '91% alignment', points: 81, ts: '15:12' },
  { id: 'm8', name: 'Rohan Gupta', cls: 'VIII-A', game: 'Gesture RPS', display: '4/5 rounds', points: 78, ts: '14:55' },
]

const NAV = [
  { id: 'play-zone', label: 'Play Zone' },
  { id: 'referee', label: 'Referee Studio' },
  { id: 'learn', label: 'Learn Zone' },
  { id: 'leaderboard', label: 'Leaderboard' },
]

export default function App() {
  const [entries, setEntries] = useState(MOCK)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [mute, setMute] = useState(isMuted())

  useEffect(() => {
    QRCode.toDataURL(window.location.href, {
      width: 512,
      margin: 1,
      color: { dark: '#050507ff', light: '#ffffffff' },
    }).then(setQrUrl).catch(() => {})
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2800)
    return () => clearTimeout(t)
  }, [toast])

  const submit = (name, cls) => {
    const e = {
      id: `u${Date.now()}`,
      name,
      cls,
      game: modal.game,
      display: modal.display,
      points: modal.points,
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fresh: true,
    }
    setEntries((prev) => [...prev.map((p) => ({ ...p, fresh: false })), e])
    setModal(null)
    setToast(`⚡ ${name}'s ${modal.game} score is live on the Arena Board`)
    sfx.win()
  }

  return (
    <div className="relative min-h-screen bg-void font-body text-white">
      {/* nav */}
      <nav className="glass-deep fixed inset-x-0 top-0 z-40 border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3">
          <button onClick={() => document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-3">
            <img src={mask} alt="" className="h-9 w-9 rounded-full mix-blend-screen drop-shadow-[0_0_10px_rgba(255,45,85,0.9)]" />
            <span className="font-display text-sm md:text-base font-black uppercase tracking-[0.25em] text-white">
              AI Sports <span className="text-crimson text-glow-crimson">Arena</span>
            </span>
          </button>
          <div className="ml-auto hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => { sfx.click(); document.getElementById(n.id)?.scrollIntoView({ behavior: 'smooth' }) }}
                className="rounded-lg px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 transition hover:bg-white/10 hover:text-cyber"
              >
                {n.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMute(toggleMuted())}
            className="ml-auto rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-display text-[10px] tracking-widest text-white/70 hover:text-white md:ml-2"
          >
            {mute ? '🔇' : '🔊'}
          </button>
          <span className="clip-tag hidden border border-pitch/50 bg-pitch/10 px-3 py-1 font-display text-[10px] tracking-[0.25em] uppercase text-pitch sm:block">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-pitch animate-pulse-dot" />Booth 07
          </span>
        </div>
      </nav>

      <main>
        <Hero />
        <GamesHub onFinish={setModal} />
        <RefereeStudio />
        <LearnZone />
        <Leaderboard entries={entries} qrUrl={qrUrl} />
      </main>

      <footer className="border-t border-white/10 py-10 text-center">
        <p className="font-display text-xs tracking-[0.35em] uppercase text-white/40">AI Sports Arena · Exhibition Build v1.0</p>
        <p className="mt-2 text-sm font-medium text-white/35">
          All AI models — keeper, minimax, gesture & pose nets — run locally in your browser. No cameras were harmed.
        </p>
      </footer>

      <FloatingQR qrUrl={qrUrl} />
      {modal && <ScoreModal req={modal} onSubmit={submit} onClose={() => setModal(null)} />}
      {toast && (
        <div className="glass-deep fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-pop rounded-xl border-pitch/50 px-5 py-3 font-display text-xs tracking-widest text-pitch glow-pitch">
          {toast}
        </div>
      )}
    </div>
  )
}
