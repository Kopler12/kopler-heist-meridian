// levels.js — the three gallery layouts for Meridian Heist.
//
// Every room fits on one screen: the thief crosses a single room, guards
// patrol open routes, and several paths (main hall, side corridor, vent
// shaft) reach the loot. Patrol waypoints were laid out so the straight leg
// between any two never crosses a wall or a piece of cover, so a guard
// never gets stuck sliding on a corner.

import { ROOM } from './config.js';

/** The room's outer border walls, shared by every level. */
const BORDER_WALLS = [
  { x: 0, y: 72, w: 1280, h: 16 },
  { x: 0, y: 784, w: 1280, h: 16 },
  { x: 0, y: 72, w: 16, h: 728 },
  { x: 1264, y: 72, w: 16, h: 728 },
];

export const LEVELS = [
  {
    name: 'Gallery I — The Meridian Gallery',
    subtitle: 'Two guards, one camera. Learn the floor.',
    par: 150,
    playerStart: { x: 80, y: 720 },
    exit: { x: 590, y: 756, w: 100, h: 28 },
    star: { x: 640, y: 478 },
    starCase: { x: 580, y: 368, w: 120, h: 72 },
    loot: [
      { x: 60, y: 320, kind: 'painting' },
      { x: 1196, y: 320, kind: 'painting' },
      { x: 1150, y: 700, kind: 'gold' },
    ],
    walls: [
      ...BORDER_WALLS,
      { x: 400, y: 88, w: 18, h: 190 }, // divider, top middle-left
      { x: 860, y: 594, w: 18, h: 190 }, // divider, bottom right
      { x: 150, y: 470, w: 130, h: 18 }, // shelf wall, mid-left
    ],
    cover: [
      { x: 210, y: 210, w: 74, h: 74, kind: 'crate' },
      { x: 1080, y: 190, w: 64, h: 84, kind: 'statue' },
      { x: 300, y: 600, w: 92, h: 62, kind: 'pedestal' },
      { x: 920, y: 700, w: 74, h: 74, kind: 'crate' },
    ],
    doors: [],
    guards: [
      { waypoints: [[300, 320], [740, 320], [740, 560], [300, 560]], speed: 72 },
      { waypoints: [[1000, 170], [1000, 640], [920, 640], [920, 170]], speed: 72 },
    ],
    cameras: [
      { x: 640, y: 96, baseAngle: Math.PI / 2, sweep: 0.9, range: 300 },
    ],
    vent: { x: 60, y: 96, w: 300, h: 26 },
    hint: 'Click to toss a coin — guards walk to the noise. Press 2 for smoke, E to hack a camera.',
  },
  {
    name: 'Gallery II — The Vault Wing',
    subtitle: 'Three guards, two cameras, one locked vault door.',
    par: 180,
    playerStart: { x: 80, y: 720 },
    exit: { x: 590, y: 756, w: 100, h: 28 },
    star: { x: 1100, y: 262 },
    starCase: { x: 1040, y: 160, w: 120, h: 72 },
    loot: [
      { x: 60, y: 200, kind: 'painting' },
      { x: 1150, y: 700, kind: 'gold' },
      { x: 700, y: 700, kind: 'vase' },
    ],
    walls: [
      ...BORDER_WALLS,
      { x: 330, y: 88, w: 18, h: 260 }, // divider, top-left
      { x: 930, y: 450, w: 18, h: 334 }, // divider, bottom-right
      { x: 520, y: 88, w: 18, h: 90 }, // short divider, top-mid
      { x: 150, y: 580, w: 260, h: 18 }, // shelf wall, bottom-left
      { x: 940, y: 88, w: 18, h: 132 }, // vault wall, upper
      { x: 940, y: 308, w: 18, h: 80 }, // vault wall, lower
      { x: 940, y: 388, w: 180, h: 18 }, // vault wall, bottom
    ],
    cover: [
      { x: 540, y: 290, w: 74, h: 74, kind: 'crate' },
      { x: 760, y: 420, w: 80, h: 60, kind: 'pedestal' },
      { x: 150, y: 120, w: 64, h: 84, kind: 'statue' },
      { x: 300, y: 650, w: 74, h: 74, kind: 'crate' },
    ],
    doors: [
      // The vault's only front door: hack it (E) or walk around the long way.
      { x: 940, y: 220, w: 18, h: 88, locked: true, id: 'vault-door' },
    ],
    guards: [
      { waypoints: [[250, 400], [700, 400], [700, 500], [250, 500]], speed: 78 },
      { waypoints: [[850, 150], [850, 400], [640, 400], [640, 150]], speed: 78 },
      { waypoints: [[1000, 500], [1200, 500], [1200, 720], [1000, 720]], speed: 84 },
    ],
    cameras: [
      { x: 400, y: 96, baseAngle: Math.PI / 2, sweep: 0.8, range: 300 },
      { x: 1100, y: 96, baseAngle: Math.PI / 2, sweep: 0.7, range: 300 },
    ],
    vent: { x: 24, y: 120, w: 26, h: 280 },
    hint: 'The vault door is locked — press E beside it to hack it open, or take the long way round.',
  },
  {
    name: 'Gallery III — The Grand Atrium',
    subtitle: 'Four guards, three cameras. The big payout.',
    par: 210,
    playerStart: { x: 80, y: 720 },
    exit: { x: 590, y: 756, w: 100, h: 28 },
    star: { x: 640, y: 460 },
    starCase: { x: 580, y: 360, w: 120, h: 72 },
    loot: [
      { x: 60, y: 320, kind: 'painting' },
      { x: 1196, y: 320, kind: 'painting' },
      { x: 1180, y: 700, kind: 'gold' },
      { x: 120, y: 120, kind: 'vase' },
    ],
    walls: [
      ...BORDER_WALLS,
      { x: 430, y: 88, w: 18, h: 190 }, // divider, top-left
      { x: 830, y: 476, w: 18, h: 308 }, // divider, bottom-right
      { x: 150, y: 640, w: 260, h: 18 }, // shelf wall, bottom-left
      { x: 820, y: 88, w: 18, h: 220 }, // divider, top-right
    ],
    cover: [
      { x: 250, y: 200, w: 74, h: 74, kind: 'crate' },
      { x: 1050, y: 200, w: 64, h: 84, kind: 'statue' },
      { x: 300, y: 660, w: 92, h: 62, kind: 'pedestal' },
      { x: 760, y: 660, w: 74, h: 74, kind: 'crate' },
      { x: 1150, y: 480, w: 64, h: 84, kind: 'statue' },
    ],
    doors: [],
    guards: [
      { waypoints: [[300, 300], [760, 300], [760, 560], [300, 560]], speed: 84 },
      { waypoints: [[1000, 170], [1000, 640], [880, 640], [880, 170]], speed: 84 },
      { waypoints: [[520, 330], [520, 620], [180, 620], [180, 330]], speed: 90 },
      { waypoints: [[900, 740], [1100, 740], [1100, 450], [900, 450]], speed: 90 },
    ],
    cameras: [
      { x: 640, y: 96, baseAngle: Math.PI / 2, sweep: 0.9, range: 300 },
      { x: 220, y: 96, baseAngle: Math.PI / 2, sweep: 0.7, range: 300 },
      { x: 1180, y: 770, baseAngle: -Math.PI / 2, sweep: 0.7, range: 280 },
    ],
    vent: { x: 920, y: 96, w: 300, h: 26 },
    hint: 'Four guards, three cameras — read the cones before you move. The vent shaft is the quiet way.',
  },
];

/**
 * The solid rectangles a level presents right now: walls, cover, and any
 * door still locked. Hacked doors drop out of the list.
 */
export function levelSolids(level) {
  const solids = [...level.walls, ...level.cover];
  for (const door of level.doors) {
    if (door.locked) solids.push(door);
  }
  return solids;
}

/** The room bounds, for the renderer. */
export function roomBounds() {
  return ROOM;
}
