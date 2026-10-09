# AI Sports Arena ⚡

A high-performance single-page exhibition app — dark stadium futurism, neon glassmorphism,
and eight playable sports-AI mini-games. Built with **React 18 + Vite 6 + Tailwind CSS 4**.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
```

## What's inside

| Section | Contents |
| --- | --- |
| **Hero** | "Arena Guardian" cybernetic mask with crimson aura, orbit rings, floating tech-stat overlays (99.4% accuracy / 60 FPS / 2 ms), dual CTAs with smooth scroll |
| **A · Play Zone** | 8 games in a tab arcade: **NeuroKeeper 2030** (featured adaptive penalty shootout — mercy system, 3 generations, telegraphed dives, live-aim reading, Hall of Aim, WASD/Space/1-9/P/M keys), Adaptive AI Goalkeeper, Reaction Speed Test, Minimax Tic-Tac-Toe, Aim Trainer, CV Pose Challenge, Gesture RPS, Stamina Clicker |
| **B · Referee Studio** | IN/OUT human call, animated Hawkeye trajectory + camera-cut strip, 40× zoom caliper, millimetre verdict modal vs human accuracy |
| **C · Learn Zone** | Expandable cards: Hawk-Eye multi-cam vision, VAR/semi-auto offside, wearables & injury prediction — each with an SVG diagram |
| **D · Live Arena** | Live leaderboard (mock-populated, live submissions with flash highlight) + QR portal (real scannable QR of the current URL) and floating QR pill |

Every finished game opens the **score uplink modal** (Player Name + Class/Section) and pushes
to the leaderboard. All "AI" runs locally in the browser; SFX are generated with WebAudio
(mute with the 🔊 button or `M` in NeuroKeeper).

## Structure

```
src/
  App.jsx               shell, nav, leaderboard state, score modal, toast, QR generation
  components/           Hero, GamesHub, RefereeStudio, LearnZone, Leaderboard, FloatingQR, ScoreModal, ui.jsx
  components/games/     NeuroKeeper, Goalkeeper, Reaction, TicTacToe, AimTrainer, Pose, RPS, Stamina
  lib/sound.js          zero-asset WebAudio SFX engine
  assets/mask.png       Arena Guardian artwork (hero)
```
