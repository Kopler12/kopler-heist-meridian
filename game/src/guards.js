// guards.js — the gallery guards: patrol routes, vision cones, hearing,
// investigating a tossed coin, and chasing a thief they can see.
// A guard never teleports: it walks its route, pauses at each waypoint to
// look around, and only leaves the route when it hears or sees something.

import {
  TUNING,
  angleDiff,
  dist,
  lineBlocked,
  moveCircle,
  pointInSmoke,
  smokeBlocks,
  turnToward,
} from './config.js';

export class Guard {
  constructor(def) {
    this.waypoints = def.waypoints.map(([x, y]) => ({ x, y }));
    this.speed = def.speed ?? TUNING.guardPatrolSpeed;
    this.x = this.waypoints[0].x;
    this.y = this.waypoints[0].y;
    this.r = 15;
    this.angle = Math.PI / 2;
    this.wpIndex = 1;
    this.state = 'patrol'; // patrol | investigate | chase
    this.waitTimer = 0;
    this.scanPhase = Math.random() * Math.PI * 2;
    this.investigateTarget = null;
    this.lastSeen = null;
    this.loseSightTimer = 0;
    this.alerted = false; // cone turns red while the guard is on to you
  }

  /** Walk toward (tx, ty) at `speed`, facing the walk direction. */
  walkToward(tx, ty, speed, dt, solids) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 1) return true;
    const step = Math.min(d, speed * dt);
    const nx = (dx / d) * step;
    const ny = (dy / d) * step;
    this.angle = turnToward(this.angle, Math.atan2(dy, dx), 6 * dt);
    moveCircle(this, nx, ny, solids);
    return d <= 8;
  }

  /** Look around slowly while standing still (waypoint pause / investigating). */
  scan(dt, time) {
    this.angle += Math.sin(time * 0.9 + this.scanPhase) * 0.9 * dt;
  }

  update(dt, time, thief, solids, smokes) {
    const seen = this.seesThief(thief, solids, smokes);
    this.alerted = seen || this.state === 'chase';

    if (seen) {
      this.lastSeen = { x: thief.x, y: thief.y };
      this.loseSightTimer = 0;
      if (this.state !== 'chase') this.state = 'chase';
    } else if (this.state === 'chase') {
      this.loseSightTimer += dt;
      if (this.loseSightTimer > 2.0) {
        this.state = 'investigate';
        this.investigateTarget = this.lastSeen;
        this.waitTimer = 0;
      }
    }

    if (this.state === 'patrol') {
      if (this.waitTimer > 0) {
        this.waitTimer -= dt;
        this.scan(dt, time);
      } else {
        const wp = this.waypoints[this.wpIndex];
        if (this.walkToward(wp.x, wp.y, this.speed, dt, solids)) {
          this.wpIndex = (this.wpIndex + 1) % this.waypoints.length;
          this.waitTimer = 0.7;
        }
      }
    } else if (this.state === 'investigate') {
      const target = this.investigateTarget;
      if (target && !this.walkToward(target.x, target.y, TUNING.guardInvestigateSpeed, dt, solids)) {
        // still walking to the noise
      } else {
        this.waitTimer += dt;
        this.scan(dt, time);
        if (this.waitTimer > 2.6) {
          this.state = 'patrol';
          this.investigateTarget = null;
          this.waitTimer = 0;
        }
      }
    } else if (this.state === 'chase') {
      if (this.lastSeen) {
        this.walkToward(this.lastSeen.x, this.lastSeen.y, TUNING.guardChaseSpeed, dt, solids);
      }
    }
    return seen;
  }

  /** Send this guard to look at a noise (a tossed coin landing). */
  hearNoise(x, y) {
    if (this.state === 'chase') return;
    this.state = 'investigate';
    this.investigateTarget = { x, y };
    this.waitTimer = 0;
  }

  /** Can this guard see the thief right now? */
  seesThief(thief, solids, smokes) {
    // Smoke blinds both ways: a guard in smoke, or a thief in smoke, is unseen.
    if (pointInSmoke(this.x, this.y, smokes)) return false;
    if (pointInSmoke(thief.x, thief.y, smokes)) return false;

    const d = dist(this.x, this.y, thief.x, thief.y);
    // Bumped into: no cone needed.
    if (d < TUNING.guardHearRadius) {
      return !smokeBlocks(this.x, this.y, thief.x, thief.y, smokes);
    }
    if (d > TUNING.guardVisionRange) return false;
    const toThief = Math.atan2(thief.y - this.y, thief.x - this.x);
    // Sprinting is loud: a guard hears fast footsteps from further off.
    if (thief.sprinting && d < TUNING.guardSprintHearRadius) {
      if (angleDiff(toThief, this.angle) < TUNING.guardVisionHalfAngle * 1.6) {
        return !lineBlocked(this.x, this.y, thief.x, thief.y, solids)
          && !smokeBlocks(this.x, this.y, thief.x, thief.y, smokes);
      }
      return false;
    }
    if (angleDiff(toThief, this.angle) > TUNING.guardVisionHalfAngle) return false;
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
      range: TUNING.guardVisionRange,
      half: TUNING.guardVisionHalfAngle,
      alerted: this.alerted,
    };
  }
}
