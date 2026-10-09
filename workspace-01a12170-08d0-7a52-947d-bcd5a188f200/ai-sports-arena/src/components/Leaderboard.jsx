import { SectionHeader, StatChip } from './ui.jsx'

const RANK_STYLE = [
  'border-gold/70 text-gold glow-crimson',
  'border-slate-300/60 text-slate-200',
  'border-amber-600/60 text-amber-500',
]

export default function Leaderboard({ entries, qrUrl }) {
  const sorted = [...entries].sort((a, b) => b.points - a.points)
  return (
    <section id="leaderboard" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 40%, rgba(0,255,135,0.06), transparent 70%)' }} />
      <div className="relative mx-auto max-w-7xl px-5">
        <SectionHeader kicker="Section D · Live Arena" title="Leaderboard & QR Portal" accent="pitch">
          Every submitted run lands here in real time. Skip the booth queue — the whole arena fits in your pocket.
        </SectionHeader>

        <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
          {/* table */}
          <div className="glass-deep overflow-hidden rounded-2xl border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-3">
              <p className="font-display text-xs tracking-[0.3em] uppercase text-pitch text-glow-pitch">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-pitch animate-pulse-dot" />Live Arena Leaderboard
              </p>
              <div className="flex gap-2">
                <StatChip label="Players today" value="214" accent="cyber" />
                <StatChip label="Runs logged" value={String(206 + entries.length)} accent="pitch" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-white/10 font-display text-[10px] tracking-[0.25em] uppercase text-white/45">
                    <th className="px-5 py-3">Rank</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3">Game</th>
                    <th className="px-4 py-3">High Score</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((e, i) => (
                    <tr key={e.id} className={`border-b border-white/5 transition-colors hover:bg-white/5 ${e.fresh ? 'animate-flash' : ''}`}>
                      <td className="px-5 py-3">
                        <span className={`inline-flex h-7 w-9 items-center justify-center rounded border font-display text-xs font-black ${RANK_STYLE[i] ?? 'border-white/15 text-white/60'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold tracking-wide text-white">{e.name}</p>
                        <p className="text-[11px] font-semibold tracking-widest text-white/40">{e.cls}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold tracking-wider text-cyber">{e.game}</td>
                      <td className="px-4 py-3 font-display text-sm font-bold text-pitch">{e.display}</td>
                      <td className="px-4 py-3 font-mono text-xs text-white/50">{e.ts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* QR portal */}
          <div id="qr-portal" className="glass-deep scroll-mt-28 rounded-2xl border-cyber/30 p-6 text-center glow-cyber">
            <p className="font-display text-xs tracking-[0.3em] uppercase text-cyber text-glow-cyber">Queue-Free QR Portal</p>
            <div className="mx-auto mt-4 w-fit rounded-xl bg-white p-3 shadow-[0_0_35px_rgba(0,212,255,0.45)]">
              {qrUrl ? (
                <img src={qrUrl} alt="QR code — open AI Sports Arena on your phone" className="h-44 w-44" />
              ) : (
                <div className="h-44 w-44 animate-pulse rounded bg-slate-200" />
              )}
            </div>
            <p className="mt-4 text-base font-bold tracking-wide text-white">
              Scan to play on your own phone <span className="text-pitch">& avoid queues!</span>
            </p>
            <p className="mt-1 break-all font-mono text-[10px] text-white/40">{typeof window !== 'undefined' ? window.location.href : ''}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-crimson/40 bg-crimson/10 p-2">
                <p className="font-display text-lg font-black text-crimson">14</p>
                <p className="text-[10px] font-bold tracking-widest text-white/50">IN QUEUE</p>
              </div>
              <div className="rounded-lg border border-pitch/40 bg-pitch/10 p-2">
                <p className="font-display text-lg font-black text-pitch">0s</p>
                <p className="text-[10px] font-bold tracking-widest text-white/50">WAIT WITH QR</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
