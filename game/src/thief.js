// thief.js — Rook, the thief: movement, sprinting and wall collision.
// The thief is a circle that slides along walls; sprinting is faster but
// loud enough for nearby guards to notice.

import { TUNING, moveCircle } from './config.js';

/** A fresh thief standing at (x, y). */
export function createThief(x, y) {
  return {
    x,
    y,
    r: TUNING.thiefRadius,
    angle: -Math.PI / 2, // facing up the room
    moving: false,
    sprinting: false,
  };
}

/**
 * Move the thief from the held keys. `keys` is a Set of KeyboardEvent.code
 * values. Returns nothing; the thief's position, angle and flags update.
 */
export function updateThief(thief, keys, dt, solids) {
  let mx = 0;
  let my = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) my -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) my += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;

  thief.moving = mx !== 0 || my !== 0;
  thief.sprinting = thief.moving && (keys.has('ShiftLeft') || keys.has('ShiftRight'));
  if (!thief.moving) return;

  const len = Math.sqrt(mx * mx + my * my);
  const speed = thief.sprinting ? TUNING.thiefSprint : TUNING.thiefSpeed;
  const dx = (mx / len) * speed * dt;
  const dy = (my / len) * speed * dt;
  thief.angle = Math.atan2(dy, dx);
  moveCircle(thief, dx, dy, solids);
}
