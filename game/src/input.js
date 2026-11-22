// input.js — keyboard and mouse state for Meridian Heist.
// Keys are tracked by code so WASD and arrows both work; mouse clicks are
// converted to canvas coordinates and queued as a single toss per click.

import { VIEW_W, VIEW_H } from './config.js';

/** Attach listeners to the window/canvas and return the live input state. */
export function createInput(canvas) {
  const input = {
    keys: new Set(),
    /** The last click's canvas position, or null. */
    click: null,
    /** True on the frame a click arrived; main.js consumes it. */
    clickQueued: false,
    /** True on the frame a key was pressed (for menus). */
    pressed: new Set(),
  };

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
    if (!event.repeat) input.pressed.add(event.code);
    input.keys.add(event.code);
  });
  window.addEventListener('keyup', (event) => {
    input.keys.delete(event.code);
  });
  window.addEventListener('blur', () => {
    input.keys.clear();
  });

  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * VIEW_W;
    const y = ((event.clientY - rect.top) / rect.height) * VIEW_H;
    input.click = { x, y };
    input.clickQueued = true;
  });

  return input;
}

/** Clear the per-frame press flags; call once per frame after updating. */
export function endFrameInput(input) {
  input.pressed.clear();
  input.clickQueued = false;
}
