// main.js — Meridian Heist: the game loop, the state machine (title,
// playing, paused, caught, win, complete), the alarm, the tools, and the
// score. Everything else is a module with one job; this file wires them
// together and owns the mutable game state.

import { TUNING, VIEW_H, VIEW_W, dist } from './config.js';
import { LEVELS, levelSolids } from './levels.js';
import { createThief, updateThief } from './thief.js';
import { Guard } from './guards.js';
import { SecurityCamera } from './cameras.js';
import { drawWorld } from './render.js';
import { drawCaught, drawComplete, drawHud, drawPaused, drawTitle, drawWin } from './hud.js';
import { initAudio, sfx } from './audio.js';
import { createInput, endFrameInput } from './input.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

/** The whole mutable state of a run. */
const game = {
  mode: 'title', // title | playing | paused | caught | win | complete
  levelIndex: 0,
  level: LEVELS[0],
  thief: createThief(80, 720),
  guards: [],
  cameras: [],
  loot: [],
  solids: [],
  alarm: 0,
  graceTimer: 0,
  graceActive: false,
  alarmTickTimer: 0,
  starTaken: false,
  score: 0,
  scoreAtLevelStart: 0,
  levelLoot: 0,
  totalTime: 0,
  timer: 0,
  tools: { coins: TUNING.coinCount, smoke: TUNING.smokeCount, hacks: TUNING.hackCount },
  coins: [],
  smoke: [],
  time: 0,
  toastTimer: 0,
  toastText: '',
  bestScore: 0,
  lastBreakdown: null,
  frozen: false,
};

try {
  game.bestScore = Number(window.localStorage.getItem('meridian-heist-best') ?? 0) || 0;
} catch {
  game.bestScore = 0;
}

function saveBest() {
  if (game.score <= game.bestScore) return;
  game.bestScore = game.score;
  try {
    window.localStorage.setItem('meridian-heist-best', String(game.bestScore));
  } catch {
    // Best score is decoration; a blocked store must not break the game.
  }
}

/** (Re)build the runtime state for level `index` from its layout. */
function loadLevel(index) {
  game.levelIndex = index;
  game.level = LEVELS[index];
  game.thief = createThief(game.level.playerStart.x, game.level.playerStart.y);
  game.guards = game.level.guards.map((def) => new Guard(def));
  game.cameras = game.level.cameras.map((def) => new SecurityCamera(def));
  game.loot = game.level.loot.map((item) => ({ ...item, taken: false }));
  game.solids = levelSolids(game.level);
  game.alarm = 0;
  game.graceTimer = 0;
  game.graceActive = false;
  game.starTaken = false;
  game.levelLoot = 0;
  game.timer = 0;
  game.tools = { coins: TUNING.coinCount, smoke: TUNING.smokeCount, hacks: TUNING.hackCount };
  game.coins = [];
  game.smoke = [];
  game.toastTimer = 3.2;
  game.toastText = 'OBJECTIVE: Steal the Meridian Star';
  game.scoreAtLevelStart = game.score;
  game.mode = 'playing';
}

/** Start a fresh run from the first gallery. */
function startRun() {
  game.score = 0;
  game.totalTime = 0;
  loadLevel(0);
}

/** Is the thief standing inside the exit doorway? */
function atExit() {
  const ex = game.level.exit;
  return game.thief.x > ex.x - 6 && game.thief.x < ex.x + ex.w + 6
    && game.thief.y > ex.y - 10 && game.thief.y < ex.y + ex.h + 10;
}

/** Toss a coin at the clicked point: guards nearby walk over to look. */
function tossCoin(x, y) {
  if (game.tools.coins <= 0) return;
  game.tools.coins -= 1;
  game.coins.push({ x, y, ring: 8, ttl: 6 });
  sfx.coin();
  for (const guard of game.guards) {
    if (dist(guard.x, guard.y, x, y) <= TUNING.coinHearRadius) guard.hearNoise(x, y);
  }
}

/** Drop a smoke bomb at Rook's feet. */
function dropSmoke() {
  if (game.tools.smoke <= 0) return;
  game.tools.smoke -= 1;
  game.smoke.push({ x: game.thief.x, y: game.thief.y, r: TUNING.smokeRadius, ttl: TUNING.smokeSeconds });
  sfx.smoke();
}

/** Hack the nearest camera or locked door in reach. */
function hackNearest() {
  if (game.tools.hacks <= 0) return;
  let best = null;
  let bestDist = TUNING.hackRange;
  for (const cam of game.cameras) {
    if (cam.disabled) continue;
    const d = dist(game.thief.x, game.thief.y, cam.x, cam.y);
    if (d < bestDist) {
      bestDist = d;
      best = { kind: 'camera', target: cam };
    }
  }
  for (const door of game.level.doors) {
    if (!door.locked) continue;
    const cx = door.x + door.w / 2;
    const cy = door.y + door.h / 2;
    const d = dist(game.thief.x, game.thief.y, cx, cy);
    if (d < bestDist) {
      bestDist = d;
      best = { kind: 'door', target: door };
    }
  }
  if (!best) return;
  game.tools.hacks -= 1;
  if (best.kind === 'camera') {
    best.target.hack();
    game.toastText = 'Camera hacked — dark for 12 seconds';
  } else {
    best.target.locked = false;
    game.solids = levelSolids(game.level);
    game.toastText = 'Vault door hacked open — shortcut clear';
  }
  game.toastTimer = 2.5;
  sfx.hack();
}

/** The getaway: score the level and open the win screen. */
function completeLevel() {
  const timeBonus = Math.max(0, TUNING.timeBonusBase - Math.floor(game.timer) * TUNING.timeBonusPerSecond);
  const alarmBonus = Math.round((100 - game.alarm) * 10);
  const toolBonus = game.tools.coins * TUNING.toolBonusPerCoin
    + game.tools.smoke * TUNING.toolBonusPerSmoke
    + game.tools.hacks * TUNING.toolBonusPerHack;
  const levelScore = TUNING.starValue + game.levelLoot + timeBonus + alarmBonus + toolBonus;
  game.score += timeBonus + alarmBonus + toolBonus;
  game.lastBreakdown = { loot: game.levelLoot, timeBonus, alarmBonus, toolBonus, levelScore };
  game.mode = 'win';
  saveBest();
  sfx.win();
}

/** The alarm caught you: the run's level ends here. */
function getCaught() {
  game.mode = 'caught';
  saveBest();
  sfx.caught();
}

/** One simulation step while playing. */
function updatePlaying(dt, input) {
  game.timer += dt;
  game.totalTime += dt;
  if (game.toastTimer > 0) game.toastTimer -= dt;

  // --- tools ---
  if (input.clickQueued && input.click) tossCoin(input.click.x, input.click.y);
  if (input.pressed.has('Digit2')) dropSmoke();
  if (input.pressed.has('KeyE')) hackNearest();
  if (input.pressed.has('KeyP') || input.pressed.has('Escape')) {
    game.mode = 'paused';
    return;
  }
  if (input.pressed.has('KeyR')) {
    game.score = game.scoreAtLevelStart;
    loadLevel(game.levelIndex);
    return;
  }

  updateThief(game.thief, input.keys, dt, game.solids);

  // --- guards and cameras: who sees Rook? ---
  let anySeen = false;
  let closestSeen = Infinity;
  for (const guard of game.guards) {
    const seen = guard.update(dt, game.time, game.thief, game.solids, game.smoke);
    if (seen) {
      anySeen = true;
      closestSeen = Math.min(closestSeen, dist(guard.x, guard.y, game.thief.x, game.thief.y));
    }
  }
  for (const cam of game.cameras) {
    cam.update(dt, game.time);
    if (cam.seesThief(game.thief, game.solids, game.smoke)) {
      anySeen = true;
      closestSeen = Math.min(closestSeen, dist(cam.x, cam.y, game.thief.x, game.thief.y));
      game.alarm += TUNING.alarmCameraPerSecond * dt;
    }
  }
  if (anySeen) {
    const rate = closestSeen < 140 ? TUNING.alarmSeenClosePerSecond : TUNING.alarmSeenPerSecond;
    game.alarm += rate * dt;
    game.alarmTickTimer -= dt;
    if (game.alarmTickTimer <= 0) {
      sfx.alarmTick();
      game.alarmTickTimer = 0.55;
    }
  } else {
    game.alarm = Math.max(0, game.alarm - TUNING.alarmDecayPerSecond * dt);
  }

  // --- the alarm's grace window: 100% is a warning, not an instant loss ---
  if (game.alarm >= 100) {
    game.alarm = 100;
    if (!game.graceActive) {
      game.graceActive = true;
      game.graceTimer = TUNING.alarmGraceSeconds;
      sfx.spotted();
    }
    game.graceTimer -= dt;
    if (game.graceTimer <= 0) {
      if (anySeen) {
        getCaught();
        return;
      }
      game.alarm = TUNING.alarmDropAfterGrace;
      game.graceActive = false;
      game.graceTimer = 0;
    }
  } else {
    game.graceActive = false;
    game.graceTimer = 0;
  }

  // --- pickups ---
  if (!game.starTaken && dist(game.thief.x, game.thief.y, game.level.star.x, game.level.star.y) < 32) {
    game.starTaken = true;
    game.score += TUNING.starValue;
    game.toastText = 'STAR SECURED! Reach the green EXIT!';
    game.toastTimer = 3.2;
    sfx.star();
  }
  for (const item of game.loot) {
    if (item.taken) continue;
    if (dist(game.thief.x, game.thief.y, item.x, item.y) < 32) {
      item.taken = true;
      const value = item.kind === 'painting' ? TUNING.paintingValue
        : item.kind === 'gold' ? TUNING.goldValue : TUNING.vaseValue;
      game.score += value;
      game.levelLoot += value;
      sfx.pickup();
    }
  }

  // --- coins and smoke age out ---
  for (const coin of game.coins) coin.ring = Math.min(90, coin.ring + 160 * dt);
  game.coins = game.coins.filter((coin) => (coin.ttl -= dt) > 0);
  game.smoke = game.smoke.filter((s) => (s.ttl -= dt) > 0);

  // --- the getaway ---
  if (game.starTaken && atExit()) completeLevel();
}

/** One simulation step in any mode. */
function update(dt, input) {
  if (game.mode === 'title') {
    // The room stays alive behind the title: guards patrol, nobody watches.
    const dummy = { x: -9999, y: -9999, r: 14, sprinting: false };
    for (const guard of game.guards) guard.update(dt, game.time, dummy, game.solids, game.smoke);
    for (const cam of game.cameras) cam.update(dt, game.time);
    if (input.pressed.has('Enter') || input.clickQueued) {
      initAudio();
      sfx.click();
      startRun();
    }
    return;
  }
  if (game.mode === 'playing') {
    updatePlaying(dt, input);
    return;
  }
  if (game.mode === 'paused') {
    if (input.pressed.has('KeyP') || input.pressed.has('Escape') || input.pressed.has('Enter')) {
      game.mode = 'playing';
    }
    return;
  }
  if (game.mode === 'caught') {
    if (input.pressed.has('KeyR') || input.pressed.has('Enter')) {
      initAudio();
      game.score = game.scoreAtLevelStart;
      loadLevel(game.levelIndex);
    }
    return;
  }
  if (game.mode === 'win') {
    if (input.pressed.has('Enter') || input.clickQueued) {
      initAudio();
      if (game.levelIndex < LEVELS.length - 1) loadLevel(game.levelIndex + 1);
      else game.mode = 'complete';
    }
    return;
  }
  if (game.mode === 'complete') {
    if (input.pressed.has('Enter') || input.clickQueued) {
      initAudio();
      startRun();
    }
  }
}

/** Draw the current frame. */
function render() {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawWorld(ctx, game);
  drawHud(ctx, game);
  if (game.mode === 'title') drawTitle(ctx, game);
  else if (game.mode === 'paused') drawPaused(ctx, game);
  else if (game.mode === 'caught') drawCaught(ctx, game);
  else if (game.mode === 'win') drawWin(ctx, game);
  else if (game.mode === 'complete') drawComplete(ctx, game);
}

const input = createInput(canvas);
window.addEventListener('keydown', (event) => {
  if (['Enter', 'Space'].includes(event.code) && game.mode === 'title') initAudio();
});
window.addEventListener('blur', () => {
  if (game.mode === 'playing') game.mode = 'paused';
});

// --- boot: load the first gallery, then stage a screenshot scene if asked ---
loadLevel(0);
game.mode = 'title';
const shot = Number(new URLSearchParams(window.location.search).get('shot') ?? 0);
if (shot >= 1 && shot <= 4) {
  loadLevel(0);
  applyShot(game, shot);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (!game.frozen) {
    game.time += dt;
    update(dt, input);
  }
  render();
  endFrameInput(input);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
