import { useState } from 'react'
import { sfx } from '../lib/sound.js'

export default function FloatingQR({ qrUrl }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="glass-deep w-60 animate-pop rounded-2xl border-cyber/40 p-4 text-center glow-cyber">
          <div className="mx-auto w-fit rounded-lg bg-white p-2 shadow-[0_0_25px_rgba(0,212,255,0.5)]">
            {qrUrl ? <img src={qrUrl} alt="QR code" className="h-32 w-32" /> : <div className="h-32 w-32 animate-pulse bg-slate-200" />}
          </div>
          <p className="mt-3 text-sm font-bold leading-snug tracking-wide text-white">
            Scan to play on your own phone <span className="text-pitch">& avoid queues!</span>
          </p>
          <button onClick={() => { sfx.click(); setOpen(false) }} className="mt-2 font-display text-[10px] tracking-[0.25em] uppercase text-white/40 hover:text-white">
            Close
          </button>
        </div>
      )}
      <button
        onClick={() => { sfx.click(); setOpen((o) => !o) }}
        aria-label="Toggle QR portal"
        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-2xl transition-all active:scale-90 ${open ? 'border-white/40 bg-white/10 text-white' : 'border-cyber bg-cyber/15 text-cyber glow-cyber animate-float'}`}
      >
        {open ? '✕' : '⌗'}
      </button>
    </div>
  )
}
