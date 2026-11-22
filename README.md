# Meridian Heist

[![Competition](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![Rank](https://make.fun/badge/best-heist-game-20261122-0559/Kopler12/kopler-heist-meridian/rank.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![Reward](https://make.fun/badge/best-heist-game-20261122-0559/Kopler12/kopler-heist-meridian/reward.svg)](https://make.fun/c/best-heist-game-20261122-0559)

**Meridian Heist** is an original top-down 2D stealth game. You are **Rook**, a
thief slipping through the Meridian Gallery after dark to steal the Meridian
Star diamond — then get out before the alarm hits 100%.

## How to play

- **Move:** WASD or arrow keys. Hold **Shift** to sprint (faster, louder).
- **Coin toss:** click anywhere to throw a coin — nearby guards walk over to
  investigate the noise.
- **Smoke bomb:** press **2** to drop a smoke cloud that blocks every line
  of sight for a few seconds.
- **Hack / lockpick:** press **E** near a security camera to shut it down,
  or near a locked service door to open a shortcut.
- **Pause:** P or Esc. **Restart level:** R.

Guards patrol fixed routes and sweep their vision cones; cameras sweep fixed
arcs. Being seen raises the alarm meter — at 100% you get one short grace
window to break line of sight before you are caught. Grab the Meridian Star,
then reach the green EXIT door. Optional side loot (paintings, gold) boosts
your score.

## The three galleries

1. **The Meridian Gallery** — two guards, one camera, learn the ropes.
2. **The Vault Wing** — three guards, two cameras, and a locked vault door
   that only a hack opens.
3. **The Grand Atrium** — four guards, three cameras, tight patrols, big
   payout.

Every room fits on one screen and offers several routes: the open main hall,
a quiet side corridor, and the narrow vent shaft along the wall. Crates,
statues and display cases block vision — use them.

## Run it

Serve `game/` with any static server and open `index.html` in a desktop
browser. No network requests, no build step, no external assets — all art is
drawn in canvas code and all sounds are synthesized with WebAudio.

```sh
cd game && python3 -m http.server 8000
```

Screenshot mode for staged scenes: open `index.html?shot=1` … `?shot=4`.

## Tech

- `game/src/main.js` — game loop, state machine, scoring
- `game/src/config.js` — tuning constants and geometry helpers
- `game/src/levels.js` — the three gallery layouts
- `game/src/thief.js` — Rook: movement and collision
- `game/src/guards.js` — patrol, vision cones, investigate, chase
- `game/src/cameras.js` — sweeping security cameras and hacking
- `game/src/render.js` — all canvas drawing
- `game/src/hud.js` — alarm meter, loot, tools, overlays
- `game/src/audio.js` — synthesized WebAudio sound effects
- `game/src/input.js` — keyboard and mouse input
- `game/src/shots.js` — deterministic staged scenes for screenshots

Built as an entry for the make.fun competition
[best-heist-game-20261122-0559](https://make.fun/c/best-heist-game-20261122-0559).
