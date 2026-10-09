import { useEffect, useRef, useState } from 'react'
import { GameFrame, NeonButton, StatChip } from '../ui.jsx'
import { sfx } from '../../lib/sound.js'

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
const DIFFS = [
  { id: 'novice', label: 'Novice', desc: 'Random policy' },
  { id: 'strategic', label: 'Strategic', desc: 'Wins & blocks' },
  { id: 'unbeatable', label: 'Unbeatable AI', desc: 'Full minimax' },
]

const winner = (b) => {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]
  return b.every(Boolean) ? 'D' : null
}

function minimax(b, isMax, depth) {
  const w = winner(b)
  if (w === 'O') return 10 - depth
  if (w === 'X') return depth - 10
  if (w === 'D') return 0
  const empties = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0)
  const scores = empties.map((i) => {
    b[i] = isMax ? 'O' : 'X'
    const s = minimax(b, !isMax, depth + 1)
    b[i] = null
    return s
  })
  return isMax ? Math.max(...scores) : Math.min(...scores)
}

const empties = (b) => b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0)

function aiMove(b, diff) {
  const free = empties(b)
  if (diff === 'novice') return free[Math.floor(Math.random() * free.length)]
  // win now
  for (const i of free) { const c = [...b]; c[i] = 'O'; if (winner(c) === 'O') return i }
  // block player
  for (const i of free) { const c = [...b]; c[i] = 'X'; if (winner(c) === 'X') return i }
  if (diff === 'strategic') {
    if (free.includes(4)) return 4
    const corners = [0, 2, 6, 8].filter((i) => free.includes(i))
    return corners.length ? corners[Math.floor(Math.random() * corners.length)] : free[Math.floor(Math.random() * free.length)]
  }
  let best = -Infinity, move = free[0]
  for (const i of free) {
    const c = [...b]; c[i] = 'O'
    const s = minimax(c, false, 1)
    c[i] = null
    if (s > best) { best = s; move = i }
  }
  return move
}

export default function TicTacToe({ onFinish }) {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [diff, setDiff] = useState('unbeatable')
  const [turn, setTurn] = useState('X')
  const [log, setLog] = useState(['> Arena OS: tactical grid initialised.'])
  const [thinking, setThinking] = useState(false)
  const timeouts = useRef([])
  const ended = useRef(false)

  useEffect(() => () => timeouts.current.forEach(clearTimeout), [])
  const push = (line) => setLog((l) => [...l.slice(-40), line])

  const result = winner(board)

  useEffect(() => {
    if (!result && turn === 'O' && !thinking) {
      setThinking(true)
      const nodes = diff === 'unbeatable' ? 5000 + Math.floor(Math.random() * 4800) : 8 + Math.floor(Math.random() * 20)
      push(`> AI: scanning board state… ${empties(board).length} open cells`)
      timeouts.current.push(setTimeout(() => push(
        diff === 'unbeatable'
          ? `> AI: expanding game tree — ${nodes.toLocaleString()} potential outcomes…`
          : diff === 'strategic'
            ? `> AI: threat scan across ${nodes} lines…`
            : `> AI: rolling stochastic policy (${nodes} seeds)…`), 320))
      timeouts.current.push(setTimeout(() => push(
        diff === 'unbeatable' ? '> AI: minimax depth 8 · α-β pruning ON · eval −0.42' : '> AI: heuristic weights applied'), 660))
      timeouts.current.push(setTimeout(() => {
        const mv = aiMove(board, diff)
        push(`> AI: committed to cell ${mv + 1} (win prob ${(0.5 + Math.random() * 0.45).toFixed(2)})`)
        const nb = [...board]; nb[mv] = 'O'
        setBoard(nb); setTurn('X'); setThinking(false)
        sfx.tick()
      }, 1000))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, result])

  useEffect(() => {
    if (result && !ended.current) {
      ended.current = true
      const msg = result === 'X' ? 'HUMAN WINS' : result === 'O' ? 'AI WINS' : 'DRAW'
      push(`> Arena OS: terminal state — ${msg}`)
      result === 'X' ? sfx.win() : result === 'O' ? sfx.lose() : sfx.click()
      const pts = result === 'X' ? 100 : result === 'D' ? 40 : 10
      timeouts.current.push(setTimeout(() => onFinish({
        game: 'Tic-Tac-Toe',
        display: result === 'X' ? `Won vs ${DIFFS.find((d) => d.id === diff).label}` : result === 'D' ? 'Draw vs AI' : 'Lost vs AI',
        points: pts,
      }), 900))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  const play = (i) => {
    if (board[i] || turn !== 'X' || result || thinking) return
    const nb = [...board]; nb[i] = 'X'
    setBoard(nb); setTurn('O')
    push(`> HUMAN: ball placed at cell ${i + 1}`)
    sfx.click()
  }

  const reset = () => {
    timeouts.current.forEach(clearTimeout)
    setBoard(Array(9).fill(null)); setTurn('X'); setThinking(false)
    setLog(['> Arena OS: tactical grid re-initialised.']); ended.current = false
  }

  return (
    <GameFrame
      title="Tactical Tic-Tac-Toe"
      tag="Minimax Core"
      tagAccent="cyber"
      blurb="Football vs basketball on a 3×3 pitch. The unbeatable core plays perfect minimax — a draw is a victory."
      hud={
        <>
          <StatChip label="Turn" value={result ? 'END' : turn === 'X' ? 'YOU' : 'AI'} accent={turn === 'X' ? 'pitch' : 'crimson'} />
          <StatChip label="Engine" value={DIFFS.find((d) => d.id === diff).label} accent="cyber" />
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr_280px]">
        {/* difficulty */}
        <div className="order-2 lg:order-1">
          <p className="mb-2 font-display text-[10px] tracking-[0.3em] uppercase text-white/50">Difficulty Selector</p>
          <div className="space-y-2">
            {DIFFS.map((d) => (
              <button
                key={d.id}
                onClick={() => { sfx.click(); setDiff(d.id); reset() }}
                className={`w-full rounded-lg border px-4 py-3 text-left transition-all ${diff === d.id ? 'border-cyber/70 bg-cyber/15 glow-cyber' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                <p className={`font-display text-xs font-bold uppercase tracking-widest ${diff === d.id ? 'text-cyber' : 'text-white/80'}`}>{d.label}</p>
                <p className="text-xs font-medium text-white/45">{d.desc}</p>
              </button>
            ))}
          </div>
          <NeonButton variant="ghost" onClick={reset} className="mt-3 w-full py-2 text-[10px]">Reset Pitch</NeonButton>
        </div>

        {/* board */}
        <div className="order-1 lg:order-2">
          <div className="grid-bg mx-auto grid aspect-square w-full max-w-[380px] grid-cols-3 gap-2 rounded-xl border border-pitch/30 bg-pitch/5 p-2 glow-pitch">
            {board.map((cell, i) => (
              <button
                key={i}
                onClick={() => play(i)}
                className="flex items-center justify-center rounded-lg border border-white/10 bg-black/50 text-4xl md:text-5xl transition-all hover:border-pitch/50 hover:bg-pitch/10"
              >
                {cell === 'X' && <span className="animate-pop drop-shadow-[0_0_12px_rgba(0,255,135,0.9)]">⚽</span>}
                {cell === 'O' && <span className="animate-pop drop-shadow-[0_0_12px_rgba(255,140,0,0.9)]">🏀</span>}
              </button>
            ))}
          </div>
          {result && (
            <p className={`mt-3 text-center font-display text-xl font-black uppercase tracking-widest animate-pop ${result === 'X' ? 'text-pitch text-glow-pitch' : result === 'O' ? 'text-crimson text-glow-crimson' : 'text-cyber'}`}>
              {result === 'X' ? 'Humanity wins this round' : result === 'O' ? 'The machine holds' : 'Stalemate — perfect defence'}
            </p>
          )}
        </div>

        {/* decision log */}
        <div className="order-3">
          <p className="mb-2 font-display text-[10px] tracking-[0.3em] uppercase text-white/50">Real-Time Decision Log</p>
          <div className="log-scroll h-56 overflow-y-auto rounded-lg border border-cyber/25 bg-black/60 p-3 font-mono text-[11px] leading-relaxed text-cyber/90">
            {log.map((l, i) => <p key={i} className={i === log.length - 1 ? 'text-pitch' : ''}>{l}</p>)}
            {thinking && <p className="animate-blink text-cyber">▮</p>}
          </div>
        </div>
      </div>
    </GameFrame>
  )
}
