// cameras.js — the gallery's security cameras: fixed mounts that sweep a
// fixed arc, and a hack that shuts one down for a while. A camera that is
// hacked shows a dead grey cone until it reboots.

import {
  TUNING,
  angleDiff,
  dist,
  lineBlocked,
  pointInSmoke,
  smokeBlocks,
} from './config.js';

export class SecurityCamera {
  constructor(def) {
    this.x = def.x;
    this.y = def.y;
    this.baseAngle = def.baseAngle;
    this.sweep = def.sweep ?? 0.8;
    this.range = def.range ?? TUNING.cameraVisionRange;
    this.half = TUNING.cameraVisionHalfAngle;
    this.phase = Math.random() * Math.PI * 2;
    this.angle = def.baseAngle;
    this.disabledTimer = 0; // seconds left while hacked
  }

  get disabled() {
    return this.disabledTimer > 0;
  }

  /** Sweep the arc back and forth; count the hack down. */
  update(dt, time) {
    if (this.disabledTimer > 0) this.disabledTimer -= dt;
    this.angle = this.baseAngle + Math.sin(time * 0.55 + this.phase) * this.sweep;
  }

  /** Shut this camera down for the hack duration. */
  hack() {
    this.disabledTimer = TUNING.hackCameraSeconds;
  }

  /** Can this camera see the thief right now? */
  seesThief(thief, solids, smokes) {
    if (this.disabled) return false;
    if (pointInSmoke(thief.x, thief.y, smokes)) return false;
    const d = dist(this.x, this.y, thief.x, thief.y);
    if (d > this.range) return false;
    const toThief = Math.atan2(thief.y - this.y, thief.x - this.x);
    if (angleDiff(toThief, this.angle) > this.half) return false;
    if (lineBlocked(this.x, this.y, thief.x, thief.y, solids)) return false;
    if (smokeBlocks(this.x, this.y, thief.x, thief.y, smokes)) return false;
    return true;
  }

  /** Vision cone geometry for the renderer. */
  cone() {
    return {
      x: this.x,
      y: this.y,
      angle: this.angle,
      range: this.range,
      half: this.half,
      disabled: this.disabled,
    };
  }
}
