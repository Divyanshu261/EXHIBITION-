import mask from '../assets/mask.png'
import { NeonButton, StatChip } from './ui.jsx'

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function Hero() {
  return (
    <header id="top" className="scanlines relative flex min-h-screen items-center overflow-hidden pt-24 pb-16">
      {/* radial stadium light + pitch grid */}
      <div className="grid-bg absolute inset-0 opacity-70" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 68% 45%, rgba(255,45,85,0.22), transparent 65%), radial-gradient(ellipse 40% 35% at 20% 20%, rgba(0,212,255,0.10), transparent 70%), radial-gradient(ellipse 45% 40% at 85% 85%, rgba(0,255,135,0.07), transparent 70%)',
        }}
      />
      {/* floodlight beams */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[520px] w-40 rotate-[24deg] bg-gradient-to-b from-white/8 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute -top-40 right-1/4 h-[520px] w-40 rotate-[-24deg] bg-gradient-to-b from-white/8 to-transparent blur-2xl" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
        {/* ---------------- copy ---------------- */}
        <div className="animate-rise text-center lg:text-left">
          <div className="mb-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <span className="clip-tag border border-crimson/50 bg-crimson/10 px-4 py-1 font-display text-[10px] tracking-[0.3em] uppercase text-crimson text-glow-crimson">
              Interactive Exhibition · Booth 07
            </span>
            <span className="clip-tag border border-pitch/40 bg-pitch/10 px-4 py-1 font-display text-[10px] tracking-[0.3em] uppercase text-pitch">
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-pitch animate-pulse-dot" /> Live
            </span>
          </div>

          <h1 className="font-display text-4xl font-black uppercase leading-[1.08] tracking-wide text-white sm:text-5xl xl:text-6xl">
            AI Sports{' '}
            <span className="bg-gradient-to-r from-crimson via-[#ff6a3d] to-crimson bg-clip-text text-transparent text-glow-crimson">
              Arena
            </span>
            <span className="mt-3 block text-lg font-bold normal-case tracking-normal text-white/85 sm:text-xl xl:text-2xl">
              — Where Human Athleticism Meets{' '}
              <span className="text-cyber text-glow-cyber">Machine Intelligence</span>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg font-medium leading-relaxed text-white/60 lg:mx-0">
            Compete against adaptive algorithms, test your reaction times, and explore how computer
            vision is revolutionizing modern athletics.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <NeonButton variant="crimson" onClick={() => scrollTo('play-zone')} className="px-8 py-4">
              ▶ Enter Play Zone
            </NeonButton>
            <NeonButton variant="cyber" onClick={() => scrollTo('leaderboard')} className="px-8 py-4">
              ⌗ Scan QR to Play on Mobile
            </NeonButton>
          </div>

          <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
            <StatChip label="AI Decision Accuracy" value="99.4%" accent="pitch" />
            <StatChip label="FPS" value="60" accent="cyber" />
            <StatChip label="Latency" value="2ms" accent="crimson" />
          </div>
        </div>

        {/* ---------------- mascot ---------------- */}
        <div className="relative mx-auto w-full max-w-[420px] lg:max-w-[560px]">
          {/* crimson aura */}
          <div className="absolute inset-0 scale-110 rounded-full bg-crimson/30 blur-[90px] animate-flicker" />
          <div className="absolute inset-8 rounded-full bg-[#ff2d55]/25 blur-[60px]" />
          {/* orbit rings */}
          <div className="absolute inset-2 rounded-full border border-dashed border-crimson/30 animate-spin-slow" />
          <div className="absolute inset-10 rounded-full border border-cyber/20 animate-spin-slower" />

          <img
            src={mask}
            alt="Arena Guardian — AI referee mascot"
            className="relative z-10 w-full animate-float mix-blend-screen drop-shadow-[0_0_35px_rgba(255,45,85,0.55)] select-none"
            draggable={false}
          />

          {/* glowing tech stat overlays */}
          <div className="absolute -left-2 top-[16%] z-20 animate-rise sm:-left-8">
            <StatChip label="Vision Lock" value="ACTIVE" accent="pitch" />
          </div>
          <div className="absolute -right-2 top-[38%] z-20 animate-rise sm:-right-6" style={{ animationDelay: '0.15s' }}>
            <StatChip label="AI Decision Accuracy" value="99.4%" accent="crimson" />
          </div>
          <div className="absolute -left-2 bottom-[24%] z-20 animate-rise sm:-left-10" style={{ animationDelay: '0.3s' }}>
            <StatChip label="FPS" value="60" accent="cyber" />
          </div>
          <div className="absolute -right-2 bottom-[8%] z-20 animate-rise sm:-right-4" style={{ animationDelay: '0.45s' }}>
            <StatChip label="Latency" value="2ms" accent="gold" />
          </div>

          <p className="relative z-10 mt-2 text-center font-display text-[10px] tracking-[0.4em] uppercase text-crimson/80 text-glow-crimson">
            Arena Guardian · AI Referee Mascot
          </p>
        </div>
      </div>

      {/* scroll cue */}
      <button
        onClick={() => scrollTo('play-zone')}
        className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-white/40 transition hover:text-crimson"
        aria-label="Scroll to play zone"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="animate-bounce">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </header>
  )
}
