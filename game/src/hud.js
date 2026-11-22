// hud.js — the heads-up display and every full-screen overlay:
// the alarm meter, loot and tools, the title screen, pause, caught and
// getaway screens. The HUD is drawn on the canvas so it shows in
// screenshots exactly as the player sees it.

import { COLORS, HUD_H, TUNING, VIEW_W, formatTime } from './config.js';

/** Alarm bar colour: green, through gold, to red. */
function alarmColor(alarm) {
  if (alarm < 40) return COLORS.alarmLow;
  if (alarm < 75) return COLORS.alarmMid;
  return COLORS.alarmHigh;
}

/** The top bar: title, alarm meter, loot, tools, timer, objective. */
export function drawHud(ctx, game) {
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = COLORS.hudLine;
  ctx.fillRect(0, HUD_H - 2, VIEW_W, 2);

  // Title + level.
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 19px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('◆ MERIDIAN HEIST', 16, 26);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '13px sans-serif';
  ctx.fillText(game.level.name, 16, 47);

  // Alarm meter.
  const ax = 330;
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', ax, 24);
  ctx.fillStyle = '#1c2133';
  ctx.fillRect(ax, 30, 230, 16);
  const fillW = (game.alarm / 100) * 230;
  ctx.fillStyle = alarmColor(game.alarm);
  ctx.fillRect(ax, 30, fillW, 16);
  if (game.alarm >= 75) {
    ctx.strokeStyle = Math.floor(game.time * 6) % 2 === 0 ? '#ff5a4d' : '#7a1f18';
    ctx.lineWidth = 2;
    ctx.strokeRect(ax - 1, 29, 232, 18);
  }
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`${Math.floor(game.alarm)}%`, ax + 238, 43);

  // Loot + star status.
  const lx = 640;
  ctx.fillStyle = game.starTaken ? COLORS.gold : COLORS.textDim;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(game.starTaken ? '◆ STAR SECURED' : '◇ STAR ?', lx, 26);
  ctx.fillStyle = COLORS.text;
  ctx.font = '13px sans-serif';
  ctx.fillText(`LOOT $${game.score.toLocaleString('en-US')}`, lx, 47);

  // Tools remaining.
  const tx = 830;
  ctx.fillStyle = COLORS.text;
  ctx.font = '13px sans-serif';
  ctx.fillText(`◉ COIN ×${game.tools.coins}   ☁ SMOKE ×${game.tools.smoke}   ⬡ HACK ×${game.tools.hacks}`, tx, 26);
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText(game.starTaken ? 'OBJECTIVE: Reach the EXIT!' : 'OBJECTIVE: Steal the Meridian Star', tx, 47);

  // Timer + level.
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(formatTime(game.timer), VIEW_W - 16, 26);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '13px sans-serif';
  ctx.fillText(`LEVEL ${game.levelIndex + 1}/3`, VIEW_W - 16, 47);
  ctx.textAlign = 'left';
}

/** A dark veil behind every overlay. */
function veil(ctx, alpha = 0.78) {
  ctx.fillStyle = `rgba(8, 9, 16, ${alpha})`;
  ctx.fillRect(0, 0, VIEW_W, 800);
}

/** Centered title + lines helper. */
function overlayTitle(ctx, title, color, y) {
  ctx.fillStyle = color;
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, VIEW_W / 2, y);
  ctx.textAlign = 'left';
}

function overlayLines(ctx, lines, y, size = 17) {
  ctx.fillStyle = COLORS.text;
  ctx.font = `${size}px sans-serif`;
  ctx.textAlign = 'center';
  for (const line of lines) {
    ctx.fillText(line, VIEW_W / 2, y);
    y += size + 10;
  }
  ctx.textAlign = 'left';
  return y;
}

/** Title / start screen, with the live room behind it. */
export function drawTitle(ctx, game) {
  veil(ctx, 0.62);
  overlayTitle(ctx, 'MERIDIAN HEIST', COLORS.gold, 210);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = 'italic 19px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('One thief. One diamond. One very awake gallery.', VIEW_W / 2, 248);
  ctx.textAlign = 'left';
  const y = overlayLines(ctx, [
    'You are Rook. Slip past the guards, dodge the cameras,',
    'steal the Meridian Star — then reach the green EXIT door.',
    '',
    'WASD / ARROWS — move      SHIFT — sprint (loud!)',
    'CLICK — toss a coin (guards investigate the noise)',
    '2 — smoke bomb      E — hack a camera or a locked door',
    'P — pause      R — restart level',
    '',
    'Vision cones are danger. Crates, statues and cases block sight.',
    'At 100% alarm you get one short chance to break line of sight.',
  ], 300, 17);
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  const blink = Math.floor(game.time * 2) % 2 === 0;
  if (blink) ctx.fillText('— CLICK OR PRESS ENTER TO BEGIN —', VIEW_W / 2, y + 26);
  ctx.textAlign = 'left';
  if (game.bestScore > 0) {
    ctx.fillStyle = COLORS.textDim;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Best getaway so far: $${game.bestScore.toLocaleString('en-US')}`, VIEW_W / 2, y + 58);
    ctx.textAlign = 'left';
  }
}

/** Pause overlay. */
export function drawPaused(ctx, game) {
  veil(ctx, 0.66);
  overlayTitle(ctx, 'PAUSED', COLORS.text, 330);
  overlayLines(ctx, ['The gallery waits. The guards do not — not really.', 'Press P or Esc to keep moving.'], 380);
}

/** Caught overlay. */
export function drawCaught(ctx, game) {
  veil(ctx, 0.72);
  overlayTitle(ctx, 'CAUGHT!', '#ff5a4d', 300);
  overlayLines(ctx, [
    `The alarm hit 100% in ${game.level.name}.`,
    `Loot kept: $${game.score.toLocaleString('en-US')} — the Star stays in its case.`,
    '',
    'Press R to retry the gallery, or Enter to start over.',
  ], 350);
}

/** Level-complete overlay with the score breakdown. */
export function drawWin(ctx, game) {
  veil(ctx, 0.7);
  overlayTitle(ctx, 'GETAWAY CLEAN!', COLORS.exit, 250);
  const b = game.lastBreakdown;
  const y = overlayLines(ctx, [
    `${game.level.name} — cleared in ${formatTime(game.timer)}.`,
    '',
    `Meridian Star ............ $${TUNING.starValue.toLocaleString('en-US')}`,
    `Side loot ................ $${b.loot.toLocaleString('en-US')}`,
    `Time bonus ............... $${b.timeBonus.toLocaleString('en-US')}`,
    `Quiet bonus (low alarm) .. $${b.alarmBonus.toLocaleString('en-US')}`,
    `Tools kept ............... $${b.toolBonus.toLocaleString('en-US')}`,
    '',
    `Level score: $${b.levelScore.toLocaleString('en-US')}   •   Total: $${game.score.toLocaleString('en-US')}`,
  ], 300, 18);
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  const blink = Math.floor(game.time * 2) % 2 === 0;
  if (blink) {
    ctx.fillText(game.levelIndex < 2 ? '— PRESS ENTER FOR THE NEXT GALLERY —' : '— PRESS ENTER FOR THE FINAL SCORE —', VIEW_W / 2, y + 30);
  }
  ctx.textAlign = 'left';
}

/** Final screen after all three galleries. */
export function drawComplete(ctx, game) {
  veil(ctx, 0.78);
  overlayTitle(ctx, 'THE MERIDIAN STAR IS YOURS', COLORS.gold, 280);
  const y = overlayLines(ctx, [
    'Three galleries. Three getaways. One legend.',
    '',
    `Final score: $${game.score.toLocaleString('en-US')}`,
    `Total time: ${formatTime(game.totalTime)}`,
    '',
    'Rook vanishes into the night. The gallery never saw a thing.',
  ], 330, 19);
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  const blink = Math.floor(game.time * 2) % 2 === 0;
  if (blink) ctx.fillText('— PRESS ENTER TO PLAY AGAIN —', VIEW_W / 2, y + 34);
  ctx.textAlign = 'left';
}
