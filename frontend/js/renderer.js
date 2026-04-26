/**
 * renderer.js — Canvas rendering for Hexagon
 *
 * Flat-top hexagon geometry using axial coordinates (q, r).
 * All drawing functions operate on a 2D Canvas context.
 *
 * Exportable pure functions (testable in Node.js):
 *   hexToPixel(q, r, size, cx, cy) → { x, y }
 *   pixelToHex(x, y, size, cx, cy) → { q, r } | null
 */

// ─── Colors ────────────────────────────────────────────────────────────────
const COLOR_EMPTY    = '#16213e';
const COLOR_P1       = '#4361ee';
const COLOR_P2       = '#e63946';
const COLOR_SELECTED = '#ffffff';
const COLOR_SHORT    = '#4ade80';
const COLOR_LONG     = '#fbbf24';
const COLOR_LAST     = '#94a3b8';
const COLOR_STROKE   = '#0f172a';

// ─── Geometry ───────────────────────────────────────────────────────────────

/**
 * Convert axial hex coordinates to pixel center (flat-top orientation).
 *
 * Flat-top layout matrix:
 *   x = size * (3/2 * q)
 *   y = size * (√3/2 * q + √3 * r)
 *
 * @param {number} q   - axial column
 * @param {number} r   - axial row
 * @param {number} size - hex size (center to vertex)
 * @param {number} cx  - canvas center x
 * @param {number} cy  - canvas center y
 * @returns {{ x: number, y: number }}
 */
export function hexToPixel(q, r, size, cx, cy) {
  const x = cx + size * (3 / 2) * q;
  const y = cy + size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
  return { x, y };
}

/**
 * Convert pixel coordinates to axial hex (flat-top orientation), with cube rounding.
 * Returns null if the resulting hex is outside the radius-4 board.
 *
 * @param {number} px  - pixel x
 * @param {number} py  - pixel y
 * @param {number} size - hex size
 * @param {number} cx  - canvas center x
 * @param {number} cy  - canvas center y
 * @returns {{ q: number, r: number } | null}
 */
export function pixelToHex(px, py, size, cx, cy) {
  const dx = px - cx;
  const dy = py - cy;

  // Inverse of flat-top matrix
  const qF = (2 / 3 * dx) / size;
  const rF = (-1 / 3 * dx + Math.sqrt(3) / 3 * dy) / size;

  // Cube rounding
  const sF = -qF - rF;
  let q = Math.round(qF);
  let r = Math.round(rF);
  let s = Math.round(sF);

  const dq = Math.abs(q - qF);
  const dr = Math.abs(r - rF);
  const ds = Math.abs(s - sF);

  if (dq > dr && dq > ds) {
    q = -r - s;
  } else if (dr > ds) {
    r = -q - s;
  }

  // Validate within radius-4 board
  if (Math.abs(q) > 4 || Math.abs(r) > 4 || Math.abs(q + r) > 4) {
    return null;
  }

  // Normalize -0 → 0
  return { q: q || 0, r: r || 0 };
}

// ─── Drawing helpers ─────────────────────────────────────────────────────────

/**
 * Draw a single flat-top hexagon path (without filling/stroking).
 */
function hexPath(ctx, x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i); // flat-top: starts at 0°
    const vx = x + size * Math.cos(angle);
    const vy = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(vx, vy);
    else ctx.lineTo(vx, vy);
  }
  ctx.closePath();
}

/**
 * Draw a filled hexagon with an optional border color.
 */
function drawHex(ctx, x, y, size, fillColor, borderColor = null, borderWidth = 3) {
  hexPath(ctx, x, y, size);
  ctx.fillStyle = fillColor;
  ctx.fill();

  if (borderColor) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.stroke();
  }
}

// ─── Canvas sizing ───────────────────────────────────────────────────────────

/**
 * Resize the canvas to fill its container / window, maintaining a square-ish ratio.
 * Returns the new hex size so callers can redraw.
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {number} hex size in pixels
 */
export function resizeCanvas(canvas) {
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
  canvas.width  = size;
  canvas.height = size;
  return computeHexSize(canvas);
}

/**
 * Compute the hex size that fits the board inside the canvas with padding.
 */
function computeHexSize(canvas) {
  // Board spans ~9 cells across (radius 4 → diameter 9).
  // For flat-top, width ≈ size * (3/2 * 8 + 1) = 13 * size
  // Use conservative padding: size = canvas.width / 14
  return Math.floor(Math.min(canvas.width, canvas.height) / 14);
}

// ─── Board drawing ───────────────────────────────────────────────────────────

/**
 * Draw the full board: cells, pieces, highlights and last-move border.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {HexBoard} board
 * @param {{ q: number, r: number } | null} selected     - currently selected cell
 * @param {Array<[number, number]>} shortMoves            - valid short-move targets
 * @param {Array<[number, number]>} longMoves             - valid long-move targets
 * @param {{ from: [number,number], to: [number,number] } | null} lastMove
 */
export function drawBoard(ctx, board, selected, shortMoves, longMoves, lastMove) {
  const canvas = ctx.canvas;
  const hexSize = computeHexSize(canvas);
  const cx = canvas.width  / 2;
  const cy = canvas.height / 2;

  // Build sets for O(1) lookup
  const shortSet = new Set((shortMoves || []).map(([q, r]) => `${q},${r}`));
  const longSet  = new Set((longMoves  || []).map(([q, r]) => `${q},${r}`));
  const lastSet  = new Set();
  if (lastMove) {
    lastSet.add(`${lastMove.from[0]},${lastMove.from[1]}`);
    lastSet.add(`${lastMove.to[0]},${lastMove.to[1]}`);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const [key, state] of board.cells) {
    const [q, r] = key.split(',').map(Number);
    const { x, y } = hexToPixel(q, r, hexSize, cx, cy);

    // Determine fill color
    let fill = COLOR_EMPTY;
    if (state === 'player1') fill = COLOR_P1;
    else if (state === 'player2') fill = COLOR_P2;
    else if (shortSet.has(key)) fill = COLOR_SHORT;
    else if (longSet.has(key))  fill = COLOR_LONG;

    // Determine border
    let border = COLOR_STROKE;
    let borderW = 1;
    if (selected && `${selected.q},${selected.r}` === key) {
      border = COLOR_SELECTED;
      borderW = 3;
    } else if (lastSet.has(key)) {
      border = COLOR_LAST;
      borderW = 3;
    }

    drawHex(ctx, x, y, hexSize - 1, fill, border, borderW);
  }
}

// ─── Conquest flash animation ─────────────────────────────────────────────────

/**
 * Flash white over the board for 150 ms to signal a conquest.
 * Calls `onComplete` when done and clears the `isAnimating` flag on the renderer object.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} rendererState - object with `isAnimating` boolean flag
 * @param {Function} onComplete  - called after animation finishes
 */
export function flashConquest(ctx, rendererState, onComplete) {
  const canvas = ctx.canvas;
  const START  = performance.now();
  const DURATION = 150;

  rendererState.isAnimating = true;

  function step(now) {
    const elapsed = now - START;
    if (elapsed >= DURATION) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rendererState.isAnimating = false;
      if (onComplete) onComplete();
      return;
    }
    // Alpha fades from 0.4 → 0 over DURATION
    const alpha = 0.4 * (1 - elapsed / DURATION);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
