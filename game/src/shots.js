// shots.js — deterministic staged scenes for the screenshots (?shot=1..4).
// Each shot freezes the game clock and places every figure by hand, so the
// same URL always renders the same frame: a real render of the game's own
// code, never a composite.
//
//   1 — title screen, the gallery live behind it
//   2 — mid-heist: Rook near the Star, cones sweeping, alarm at 42%
//   3 — the caught moment: alarm at 100%, SPOTTED warning flashing
//   4 — getaway: the Star secured, Rook at the EXIT, win screen up

/** Place the game in a staged scene and freeze its clock. */
export function applyShot(game, n) {
  game.frozen = true;
  const guards = game.guards;
  const cameras = game.cameras;

  if (n === 1) {
    game.mode = 'title';
    game.time = 1.2;
    game.alarm = 0;
    game.thief.x = game.level.playerStart.x;
    game.thief.y = game.level.playerStart.y;
    game.thief.angle = -Math.PI / 2;
    if (guards[0]) {
      guards[0].x = 500;
      guards[0].y = 320;
      guards[0].angle = 0;
      guards[0].state = 'patrol';
    }
    if (guards[1]) {
      guards[1].x = 1000;
      guards[1].y = 420;
      guards[1].angle = Math.PI / 2;
      guards[1].state = 'patrol';
    }
    return;
  }

  if (n === 2) {
    game.mode = 'playing';
    game.time = 2.0;
    game.alarm = 42;
    game.timer = 47;
    game.toastTimer = 0;
    // Rook crouched just south of the Star's case, one painting already lifted.
    game.thief.x = 640;
    game.thief.y = 540;
    game.thief.angle = -Math.PI / 2;
    game.loot[0].taken = true;
    game.score = 500;
    if (guards[0]) {
      guards[0].x = 480;
      guards[0].y = 430;
      guards[0].angle = 0.35;
      guards[0].state = 'patrol';
      guards[0].alerted = false;
    }
    if (guards[1]) {
      guards[1].x = 900;
      guards[1].y = 470;
      guards[1].angle = Math.PI;
      guards[1].state = 'patrol';
      guards[1].alerted = false;
    }
    if (cameras[0]) cameras[0].phase = 0.6;
    return;
  }

  if (n === 3) {
    game.mode = 'playing';
    game.time = 3.0;
    game.alarm = 100;
    game.graceTimer = 0.9;
    game.timer = 83;
    game.toastTimer = 0;
    // A guard has rounded the corner right onto Rook.
    game.thief.x = 700;
    game.thief.y = 520;
    game.thief.angle = Math.PI;
    if (guards[0]) {
      guards[0].x = 655;
      guards[0].y = 480;
      guards[0].angle = Math.atan2(520 - 480, 700 - 655);
      guards[0].state = 'chase';
      guards[0].alerted = true;
    }
    if (guards[1]) {
      guards[1].x = 940;
      guards[1].y = 600;
      guards[1].angle = Math.PI * 0.75;
      guards[1].state = 'chase';
      guards[1].alerted = true;
    }
    return;
  }

  // Shot 4: the getaway.
  game.mode = 'win';
  game.time = 1.5;
  game.alarm = 18;
  game.timer = 96;
  game.starTaken = true;
  game.thief.x = 640;
  game.thief.y = 746;
  game.thief.angle = Math.PI / 2;
  game.loot[0].taken = true;
  game.loot[1].taken = true;
  game.score = 9206;
  game.lastBreakdown = {
    loot: 1000,
    timeBonus: 2136,
    alarmBonus: 820,
    toolBonus: 250,
    levelScore: 5000 + 1000 + 2136 + 820 + 250,
  };
  if (guards[0]) {
    guards[0].x = 420;
    guards[0].y = 300;
    guards[0].angle = Math.PI;
    guards[0].state = 'patrol';
    guards[0].alerted = false;
  }
  if (guards[1]) {
    guards[1].x = 980;
    guards[1].y = 300;
    guards[1].angle = 0;
    guards[1].state = 'patrol';
    guards[1].alerted = false;
  }
}
