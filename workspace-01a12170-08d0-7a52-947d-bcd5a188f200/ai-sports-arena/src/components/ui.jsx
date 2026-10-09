import { sfx } from '../lib/sound.js'

/* Shared neon UI primitives -------------------------------------------- */

export function SectionHeader({ kicker, title, accent = 'crimson', children }) {
  const accents = {
    crimson: 'text-crimson text-glow-crimson border-crimson/40',
    pitch: 'text-pitch text-glow-pitch border-pitch/40',
    cyber: 'text-cyber text-glow-cyber border-cyber/40',
  }
  return (
    <div className="mb-10 md:mb-14">
      <span
        className={`clip-tag inline-block border bg-white/5 px-4 py-1 font-display text-[10px] md:text-xs tracking-[0.35em] uppercase ${accents[accent]}`}
      >
        {kicker}
      </span>
      <h2 className="mt-4 font-display text-3xl md:text-5xl font-black uppercase tracking-wide text-white">
        {title}
      </h2>
      {children && <p className="mt-3 max-w-2xl text-base md:text-lg text-white/60 font-medium">{children}</p>}
    </div>
  )
}

export function StatChip({ label, value, accent = 'cyber', className = '' }) {
  const accents = {
    crimson: 'border-crimson/50 text-crimson glow-crimson',
    pitch: 'border-pitch/50 text-pitch glow-pitch',
    cyber: 'border-cyber/50 text-cyber glow-cyber',
    gold: 'border-gold/50 text-gold',
  }
  return (
    <div className={`glass flex items-center gap-2 rounded-lg border px-3 py-1.5 ${accents[accent]} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot" />
      <span className="font-display text-[9px] md:text-[10px] tracking-[0.22em] uppercase text-white/60">{label}</span>
      <span className="font-display text-xs md:text-sm font-bold">{value}</span>
    </div>
  )
}

export function NeonButton({ children, onClick, variant = 'crimson', className = '', disabled = false, type = 'button' }) {
  const variants = {
    crimson:
      'bg-gradient-to-r from-crimson/90 to-[#ff5c39]/80 text-white border-crimson/60 glow-crimson hover:from-crimson hover:to-[#ff5c39]',
    pitch:
      'bg-gradient-to-r from-pitch/80 to-[#00c2a8]/70 text-black border-pitch/60 glow-pitch hover:from-pitch hover:to-[#00c2a8]',
    cyber:
      'bg-cyber/10 text-cyber border-cyber/60 glow-cyber hover:bg-cyber/20',
    ghost:
      'bg-white/5 text-white/80 border-white/15 hover:bg-white/10',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={() => { if (!disabled) { sfx.click(); onClick?.() } }}
      className={`clip-btn border px-6 py-3 font-display text-xs md:text-sm font-bold uppercase tracking-[0.2em] transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function GameFrame({ title, tag, tagAccent = 'crimson', blurb, hud = null, children }) {
  const accents = {
    crimson: 'text-crimson border-crimson/40 bg-crimson/10',
    pitch: 'text-pitch border-pitch/40 bg-pitch/10',
    cyber: 'text-cyber border-cyber/40 bg-cyber/10',
    gold: 'text-gold border-gold/40 bg-gold/10',
  }
  return (
    <div className="glass-deep relative overflow-hidden rounded-2xl border-white/10">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-5 py-4 md:px-7">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-display text-lg md:text-2xl font-bold uppercase tracking-wider text-white">{title}</h3>
            <span className={`clip-tag border px-2.5 py-0.5 font-display text-[9px] tracking-[0.25em] uppercase ${accents[tagAccent]}`}>
              {tag}
            </span>
          </div>
          <p className="mt-1 max-w-xl text-sm md:text-base text-white/55 font-medium">{blurb}</p>
        </div>
        {hud && <div className="flex flex-wrap items-center gap-2">{hud}</div>}
      </div>
      <div className="p-4 md:p-7">{children}</div>
    </div>
  )
}

export function Meter({ value, accent = '#00ff87', height = 10, marker = null }) {
  return (
    <div className="relative w-full overflow-hidden rounded-full bg-white/8" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-150"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: accent, boxShadow: `0 0 12px ${accent}` }}
      />
      {marker !== null && (
        <div className="absolute top-0 h-full w-0.5 bg-white/70" style={{ left: `${marker}%` }} />
      )}
    </div>
  )
}
