import { useState } from 'react'
import { NeonButton } from './ui.jsx'

export default function ScoreModal({ req, onSubmit, onClose }) {
  const [name, setName] = useState('')
  const [cls, setCls] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="glass-deep w-full max-w-md animate-pop rounded-2xl border-pitch/40 p-6 glow-pitch">
        <p className="font-display text-[10px] tracking-[0.35em] uppercase text-pitch">Run Complete · Score Uplink</p>
        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="font-display text-lg font-bold uppercase tracking-wider text-white">{req.game}</p>
          <p className="mt-1 font-display text-3xl font-black text-pitch text-glow-pitch">{req.display}</p>
          <p className="mt-1 text-xs font-semibold tracking-widest text-white/45">ARENA POINTS · {Math.round(req.points)}</p>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block font-display text-[10px] tracking-[0.3em] uppercase text-white/50" htmlFor="pname">Player Name</label>
            <input id="pname" className="field" placeholder="e.g. Aarav Sharma" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} autoFocus />
          </div>
          <div>
            <label className="mb-1 block font-display text-[10px] tracking-[0.3em] uppercase text-white/50" htmlFor="pcls">Class / Section</label>
            <input id="pcls" className="field" placeholder="e.g. XII-A" value={cls} onChange={(e) => setCls(e.target.value)} maxLength={12} />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <NeonButton variant="pitch" disabled={!name.trim()} onClick={() => onSubmit(name.trim(), cls.trim() || '—')} className="flex-1 py-3 text-[11px]">
            ⚡ Submit to Live Board
          </NeonButton>
          <NeonButton variant="ghost" onClick={onClose} className="py-3 text-[11px]">Skip</NeonButton>
        </div>
      </div>
    </div>
  )
}
