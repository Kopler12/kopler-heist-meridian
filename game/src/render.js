// render.js — every pixel of Meridian Heist is drawn here in canvas code:
// the night gallery's marble floor, gold-trimmed walls, display cases,
// crates and statues, the guards and their sweeping vision cones, the
// cameras, the loot, and Rook the thief. No image files anywhere.

import { COLORS, ROOM, VIEW_W } from './config.js';

/** Fill a vision cone: a translucent sector from (x, y) along `angle`. */
function drawCone(ctx, cone, fill) {
  ctx.beginPath();
  ctx.moveTo(cone.x, cone.y);
  ctx.arc(cone.x, cone.y, cone.range, cone.angle - cone.half, cone.angle + cone.half);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  // A faint rim so the cone's edge reads at a glance.
  ctx.strokeStyle = fill.replace(/[\d.]+\)$/, '0.55)');
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/** The glowing Meridian Star diamond, pulsing gently. */
function drawStar(ctx, x, y, time, collected) {
  if (collected) return;
  const pulse = 1 + Math.sin(time * 3) * 0.08;
  const r = 20 * pulse;
  const glow = ctx.createRadialGradient(x, y, 2, x, y, 62);
  glow.addColorStop(0, 'rgba(232, 193, 90, 0.55)');
  glow.addColorStop(1, 'rgba(232, 193, 90, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r * 0.72, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r * 0.72, y);
  ctx.closePath();
  ctx.fillStyle = '#fdf3c4';
  ctx.fill();
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - r * 0.72, y);
  ctx.lineTo(x + r * 0.72, y);
  ctx.moveTo(x, y - r);
  ctx.lineTo(x, y + r);
  ctx.strokeStyle = 'rgba(154, 123, 45, 0.8)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

/** A side-loot item: painting, gold bars or a vase. */
function drawLoot(ctx, item, time) {
  if (item.taken) return;
  const bob = Math.sin(time * 2 + item.x) * 2;
  if (item.kind === 'painting') {
    ctx.fillStyle = COLORS.paintingFrame;
    ctx.fillRect(item.x - 26, item.y - 20 + bob, 52, 40);
    ctx.fillStyle = '#274b63';
    ctx.fillRect(item.x - 21, item.y - 15 + bob, 42, 30);
    ctx.fillStyle = '#c96f3b';
    ctx.beginPath();
    ctx.arc(item.x - 6, item.y + 2 + bob, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8c15a';
    ctx.beginPath();
    ctx.arc(item.x + 10, item.y - 6 + bob, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.kind === 'gold') {
    ctx.fillStyle = 'rgba(232, 193, 90, 0.25)';
    ctx.beginPath();
    ctx.arc(item.x, item.y + bob, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(item.x - 16, item.y - 6 + bob, 32, 12);
    ctx.fillStyle = '#f7e08a';
    ctx.fillRect(item.x - 16, item.y - 6 + bob, 32, 4);
    ctx.strokeStyle = COLORS.goldDim;
    ctx.lineWidth = 1;
    ctx.strokeRect(item.x - 16, item.y - 6 + bob, 32, 12);
  } else {
    // vase
    ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.beginPath();
    ctx.arc(item.x, item.y + bob, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7c5cd6';
    ctx.beginPath();
    ctx.moveTo(item.x - 7, item.y - 14 + bob);
    ctx.lineTo(item.x + 7, item.y - 14 + bob);
    ctx.lineTo(item.x + 11, item.y + 4 + bob);
    ctx.lineTo(item.x + 6, item.y + 14 + bob);
    ctx.lineTo(item.x - 6, item.y + 14 + bob);
    ctx.lineTo(item.x - 11, item.y + 4 + bob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b79cff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

/** One piece of cover: crate, statue or pedestal. */
function drawCover(ctx, c) {
  if (c.kind === 'crate') {
    ctx.fillStyle = COLORS.crate;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = COLORS.crateEdge;
    ctx.lineWidth = 3;
    ctx.strokeRect(c.x + 2, c.y + 2, c.w - 4, c.h - 4);
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x + c.w, c.y + c.h);
    ctx.moveTo(c.x + c.w, c.y);
    ctx.lineTo(c.x, c.y + c.h);
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (c.kind === 'statue') {
    ctx.fillStyle = COLORS.pedestal;
    ctx.fillRect(c.x + 6, c.y + c.h - 18, c.w - 12, 18);
    ctx.fillStyle = COLORS.statue;
    ctx.beginPath();
    ctx.arc(c.x + c.w / 2, c.y + 22, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(c.x + c.w / 2 - 13, c.y + 34, 26, c.h - 50);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.arc(c.x + c.w / 2 - 5, c.y + 17, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // pedestal / display plinth
    ctx.fillStyle = COLORS.pedestal;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = '#4a5068';
    ctx.fillRect(c.x, c.y, c.w, 8);
    ctx.strokeStyle = '#232838';
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
  }
}

/** A guard: navy uniform, cap, facing tick, and a "!" when alerted. */
function drawGuard(ctx, guard) {
  const g = guard;
  ctx.beginPath();
  ctx.arc(g.x, g.y + 3, g.r + 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.guard;
  ctx.fill();
  ctx.strokeStyle = COLORS.guardTrim;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Cap brim in the facing direction.
  const fx = Math.cos(g.angle);
  const fy = Math.sin(g.angle);
  ctx.beginPath();
  ctx.arc(g.x + fx * 8, g.y + fy * 8, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#1c2745';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(g.x + fx * g.r, g.y + fy * g.r);
  ctx.lineTo(g.x + fx * (g.r + 8), g.y + fy * (g.r + 8));
  ctx.strokeStyle = '#f2ead8';
  ctx.lineWidth = 3;
  ctx.stroke();
  if (g.alerted) {
    ctx.fillStyle = '#ff5a4d';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', g.x, g.y - g.r - 8);
  }
}

/** A wall-mounted camera: bracket, housing, lens. */
function drawCamera(ctx, cam) {
  ctx.save();
  ctx.translate(cam.x, cam.y);
  ctx.rotate(cam.angle);
  ctx.fillStyle = cam.disabled ? '#555a66' : '#2c3145';
  ctx.fillRect(-4, -6, 22, 12);
  ctx.beginPath();
  ctx.arc(20, 0, 5, 0, Math.PI * 2);
  ctx.fillStyle = cam.disabled ? '#333' : '#7fd4ff';
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cam.x, cam.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#12141d';
  ctx.fill();
  if (cam.disabled) {
    ctx.strokeStyle = '#ff5a4d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cam.x - 7, cam.y - 7);
    ctx.lineTo(cam.x + 7, cam.y + 7);
    ctx.moveTo(cam.x + 7, cam.y - 7);
    ctx.lineTo(cam.x - 7, cam.y + 7);
    ctx.stroke();
  }
}

/** Rook the thief: dark hooded figure with a violet trim. */
function drawThief(ctx, thief, time) {
  const t = thief;
  const bob = t.moving ? Math.sin(time * 12) * 1.5 : 0;
  ctx.beginPath();
  ctx.arc(t.x, t.y + 3, t.r + 2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(t.x, t.y + bob, t.r, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.thief;
  ctx.fill();
  ctx.strokeStyle = COLORS.thiefTrim;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // Hood point in the facing direction.
  const fx = Math.cos(t.angle);
  const fy = Math.sin(t.angle);
  ctx.beginPath();
  ctx.moveTo(t.x + fx * 6 - fy * 7, t.y + fy * 6 + fx * 7 + bob);
  ctx.lineTo(t.x + fx * (t.r + 7), t.y + fy * (t.r + 7) + bob);
  ctx.lineTo(t.x + fx * 6 + fy * 7, t.y + fy * 6 - fx * 7 + bob);
  ctx.closePath();
  ctx.fillStyle = COLORS.thiefTrim;
  ctx.fill();
  // Eyes.
  ctx.fillStyle = '#f2ead8';
  ctx.beginPath();
  ctx.arc(t.x + fx * 5 - fy * 4, t.y + fy * 5 + fx * 4 + bob, 1.8, 0, Math.PI * 2);
  ctx.arc(t.x + fx * 5 + fy * 4, t.y + fy * 5 - fx * 4 + bob, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

/** Draw the whole room and everything in it (HUD is drawn separately). */
export function drawWorld(ctx, game) {
  const level = game.level;
  const time = game.time;

  // --- floor: checkerboard marble tiles ---
  for (let ty = 0; ty < 11; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? COLORS.floorA : COLORS.floorB;
      ctx.fillRect(ROOM.x + tx * 62.4, ROOM.y + ty * 64, 62.4, 64);
    }
  }
  // Gold carpet runner from the entrance toward the star.
  ctx.fillStyle = COLORS.carpet;
  ctx.fillRect(560, ROOM.y, 160, ROOM.h);
  ctx.strokeStyle = COLORS.carpetEdge;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(563, ROOM.y);
  ctx.lineTo(563, ROOM.y + ROOM.h);
  ctx.moveTo(717, ROOM.y);
  ctx.lineTo(717, ROOM.y + ROOM.h);
  ctx.stroke();

  // --- vent shaft: a grated strip, the quiet route ---
  const v = level.vent;
  ctx.fillStyle = '#10121c';
  ctx.fillRect(v.x, v.y, v.w, v.h);
  ctx.strokeStyle = '#3a3f52';
  ctx.lineWidth = 2;
  ctx.strokeRect(v.x, v.y, v.w, v.h);
  ctx.strokeStyle = '#2c3145';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const vertical = v.w < v.h;
  const steps = Math.floor((vertical ? v.h : v.w) / 14);
  for (let i = 1; i < steps; i++) {
    if (vertical) {
      ctx.moveTo(v.x, v.y + i * 14);
      ctx.lineTo(v.x + v.w, v.y + i * 14);
    } else {
      ctx.moveTo(v.x + i * 14, v.y);
      ctx.lineTo(v.x + i * 14, v.y + v.h);
    }
  }
  ctx.stroke();

  // --- walls ---
  for (const w of level.walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = COLORS.wallTop;
    if (w.h <= 18) ctx.fillRect(w.x, w.y, w.w, 4);
    else ctx.fillRect(w.x, w.y, 4, w.h);
  }
  // Gold trim around the room's inner edge.
  ctx.strokeStyle = COLORS.wallTrim;
  ctx.lineWidth = 2;
  ctx.strokeRect(ROOM.x - 2, ROOM.y - 2, ROOM.w + 4, ROOM.h + 4);

  // --- locked / open service doors ---
  for (const door of level.doors) {
    ctx.fillStyle = door.locked ? '#4a2f16' : '#1f3d2b';
    ctx.fillRect(door.x, door.y, door.w, door.h);
    ctx.strokeStyle = door.locked ? '#e8c15a' : '#37c978';
    ctx.lineWidth = 2;
    ctx.strokeRect(door.x, door.y, door.w, door.h);
    if (door.locked) {
      ctx.fillStyle = COLORS.gold;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(door.x + door.w / 2, door.y + door.h / 2);
      ctx.rotate(Math.PI / 2);
      ctx.fillText('LOCKED · E TO HACK', 0, 4);
      ctx.restore();
    }
  }

  // --- the star's display case ---
  const sc = level.starCase;
  ctx.fillStyle = COLORS.caseFrame;
  ctx.fillRect(sc.x - 4, sc.y - 4, sc.w + 8, sc.h + 8);
  ctx.fillStyle = COLORS.caseGlass;
  ctx.fillRect(sc.x, sc.y, sc.w, sc.h);
  ctx.strokeStyle = 'rgba(200, 220, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(sc.x, sc.y, sc.w, sc.h);
  ctx.fillStyle = '#8a6d2f';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MERIDIAN STAR', sc.x + sc.w / 2, sc.y + sc.h - 8);

  // --- cover pieces ---
  for (const c of level.cover) drawCover(ctx, c);

  // --- side loot ---
  for (const item of game.loot) drawLoot(ctx, item, time);

  // --- the star ---
  drawStar(ctx, level.star.x, level.star.y, time, game.starTaken);

  // --- exit door ---
  const ex = level.exit;
  const exitGlow = game.starTaken ? 0.5 + Math.sin(time * 4) * 0.2 : 0.18;
  ctx.fillStyle = `rgba(31, 174, 95, ${exitGlow})`;
  ctx.fillRect(ex.x - 14, ex.y - 10, ex.w + 28, ex.h + 14);
  ctx.fillStyle = COLORS.exit;
  ctx.fillRect(ex.x, ex.y, ex.w, ex.h);
  ctx.fillStyle = '#0b2e1a';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(game.starTaken ? 'EXIT — GO!' : 'EXIT', ex.x + ex.w / 2, ex.y + 19);

  // --- vision cones (under the figures, over the floor) ---
  for (const cam of game.cameras) {
    const cone = cam.cone();
    drawCone(ctx, cone, cone.disabled ? COLORS.cameraOff : COLORS.cameraCone);
  }
  for (const guard of game.guards) {
    const cone = guard.cone();
    drawCone(ctx, cone, cone.alerted ? COLORS.coneAlert : COLORS.cone);
  }

  // --- figures ---
  for (const cam of game.cameras) drawCamera(ctx, cam);
  for (const guard of game.guards) drawGuard(ctx, guard);
  drawThief(ctx, game.thief, time);

  // --- tossed coins (with a landing ring) ---
  for (const coin of game.coins) {
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.gold;
    ctx.fill();
    ctx.strokeStyle = COLORS.goldDim;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (coin.ring > 0) {
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.ring, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232, 193, 90, ${Math.max(0, 1 - coin.ring / 90)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // --- smoke clouds ---
  for (const s of game.smoke) {
    const grad = ctx.createRadialGradient(s.x, s.y, 4, s.x, s.y, s.r);
    grad.addColorStop(0, 'rgba(190, 195, 210, 0.75)');
    grad.addColorStop(1, 'rgba(190, 195, 210, 0.05)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- "SPOTTED" grace warning ---
  if (game.mode === 'playing' && game.alarm >= 100 && game.graceTimer > 0) {
    const flash = Math.floor(time * 8) % 2 === 0;
    if (flash) {
      ctx.fillStyle = 'rgba(232, 64, 52, 0.9)';
      ctx.font = 'bold 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPOTTED! BREAK LINE OF SIGHT!', VIEW_W / 2, 150);
    }
  }

  // --- objective toast at level start ---
  if (game.mode === 'playing' && game.toastTimer > 0) {
    ctx.globalAlpha = Math.min(1, game.toastTimer);
    ctx.fillStyle = 'rgba(13, 15, 24, 0.85)';
    ctx.fillRect(VIEW_W / 2 - 260, 96, 520, 44);
    ctx.strokeStyle = COLORS.hudLine;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(VIEW_W / 2 - 260, 96, 520, 44);
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(game.toastText, VIEW_W / 2, 124);
    ctx.globalAlpha = 1;
  }
}
