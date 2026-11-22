// config.js — tuning constants, colours and geometry helpers for Meridian Heist.
// Every magic number that shapes how the game feels lives here, so levels.js
// and the entity modules stay free of hard-coded tuning.

export const VIEW_W = 1280;
export const VIEW_H = 800;
export const HUD_H = 64;

// The room's outer border: the playable floor inside these walls.
export const ROOM = { x: 16, y: 80, w: 1248, h: 704 };

export const COLORS = {
  floorA: '#232838',
  floorB: '#1d2231',
  carpet: '#5a1f2e',
  carpetEdge: '#c9a227',
  wall: '#12141d',
  wallTop: '#2c3145',
  wallTrim: '#c9a227',
  gold: '#e8c15a',
  goldDim: '#9a7b2d',
  caseGlass: 'rgba(150, 200, 255, 0.16)',
  caseFrame: '#8a6d2f',
  crate: '#6b4a2b',
  crateEdge: '#8a6238',
  statue: '#7d8598',
  pedestal: '#3a3f52',
  paintingFrame: '#a8842f',
  exit: '#1fae5f',
  exitGlow: 'rgba(31, 174, 95, 0.35)',
  thief: '#14121c',
  thiefTrim: '#8b5cf6',
  guard: '#2b3a67',
  guardTrim: '#d8dee9',
  cone: 'rgba(232, 193, 90, 0.20)',
  coneAlert: 'rgba(235, 64, 52, 0.30)',
  cameraCone: 'rgba(120, 200, 255, 0.16)',
  cameraOff: 'rgba(120, 120, 120, 0.10)',
  smoke: 'rgba(180, 185, 200, 0.55)',
  hudBg: '#0d0f18',
  hudLine: '#c9a227',
  text: '#f2ead8',
  textDim: '#9aa3b8',
  alarmLow: '#37c978',
  alarmMid: '#e8c15a',
  alarmHigh: '#e84034',
};

export const TUNING = {
  thiefRadius: 14,
  thiefSpeed: 205,
  thiefSprint: 305,
  guardPatrolSpeed: 72,
  guardInvestigateSpeed: 118,
  guardChaseSpeed: 132,
  guardVisionRange: 265,
  guardVisionHalfAngle: 0.58, // ~33 degrees each side
  guardHearRadius: 48, // spotted instantly this close
  guardSprintHearRadius: 135, // sprinting this close gives you away
  cameraVisionRange: 305,
  cameraVisionHalfAngle: 0.5,
  alarmSeenPerSecond: 26,
  alarmSeenClosePerSecond: 42,
  alarmCameraPerSecond: 24,
  alarmDecayPerSecond: 5.5,
  alarmGraceSeconds: 1.25,
  alarmDropAfterGrace: 65,
  coinHearRadius: 265,
  coinCount: 3,
  smokeCount: 2,
  smokeRadius: 105,
  smokeSeconds: 6,
  hackCount: 2,
  hackCameraSeconds: 12,
  hackRange: 86,
  coinTossSeconds: 0.35,
  starValue: 5000,
  paintingValue: 500,
  goldValue: 300,
  vaseValue: 200,
  timeBonusBase: 3000,
  timeBonusPerSecond: 9,
  toolBonusPerCoin: 100,
  toolBonusPerSmoke: 150,
  toolBonusPerHack: 150,
};

/** Clamp a number into [lo, hi]. */
export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Euclidean distance between two points. */
export function dist(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Smallest absolute difference between two angles, in radians. */
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

/** Move an angle toward a target angle by at most `step` radians. */
export function turnToward(angle, target, step) {
  let d = target - angle;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  if (Math.abs(d) <= step) return target;
  return angle + Math.sign(d) * step;
}

/** Does the segment (x1,y1)-(x2,y2) touch rectangle r? Liang-Barsky clipping. */
export function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return true;
}

/** Is the line of sight between two points blocked by any solid rectangle? */
export function lineBlocked(x1, y1, x2, y2, solids) {
  for (const s of solids) {
    if (segmentHitsRect(x1, y1, x2, y2, s)) return true;
  }
  return false;
}

/** Does the segment pass through the circle (cx, cy, r)? Used for smoke. */
export function segmentHitsCircle(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return dist(x1, y1, cx, cy) <= r;
  let t = ((cx - x1) * dx + (cy - y1) * dy) / len2;
  t = clamp(t, 0, 1);
  return dist(x1 + t * dx, y1 + t * dy, cx, cy) <= r;
}

/** Is a point inside any smoke cloud? */
export function pointInSmoke(x, y, smokes) {
  for (const s of smokes) {
    if (dist(x, y, s.x, s.y) <= s.r) return true;
  }
  return false;
}

/** Does smoke block the sight line between two points? */
export function smokeBlocks(x1, y1, x2, y2, smokes) {
  for (const s of smokes) {
    if (segmentHitsCircle(x1, y1, x2, y2, s.x, s.y, s.r)) return true;
  }
  return false;
}

/** Does a circle of radius r at (x, y) overlap rectangle s? */
export function circleHitsRect(x, y, r, s) {
  return x + r > s.x && x - r < s.x + s.w && y + r > s.y && y - r < s.y + s.h;
}

/** Does a circle overlap any of the solid rectangles? */
export function circleHitsAny(x, y, r, solids) {
  for (const s of solids) {
    if (circleHitsRect(x, y, r, s)) return true;
  }
  return false;
}

/**
 * Move a circular entity by (dx, dy), sliding along walls: try x first, then y,
 * so a thief hugging a wall keeps moving instead of sticking.
 */
export function moveCircle(entity, dx, dy, solids) {
  const nx = entity.x + dx;
  if (!circleHitsAny(nx, entity.y, entity.r, solids)) entity.x = nx;
  const ny = entity.y + dy;
  if (!circleHitsAny(entity.x, ny, entity.r, solids)) entity.y = ny;
}

/** Format seconds as mm:ss. */
export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
