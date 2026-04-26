/**
 * input.js — Click input handler for Hexagon
 *
 * Registers a click listener on the Canvas, converts pixel → hex,
 * manages piece selection state, dispatches moves to the game engine,
 * and triggers board redraws + UI updates.
 */

import { pixelToHex, drawBoard, flashConquest } from './renderer.js';

/**
 * Internal state shared between the click handler and animation logic.
 * Exported only for testing convenience — treat as private.
 */
export const state = {
  selectedCell: null,   // { q, r } | null
  shortMoves:   [],     // [q, r][]
  longMoves:    [],     // [q, r][]
  lastMove:     null,   // { from: [q,r], to: [q,r] } | null
  isAnimating:  false,
};

// AbortController to remove the previous listener on restart
let _inputAbort = null;

/**
 * Set up the Canvas click handler, replacing any previously registered one.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {HexGame}           game     — engine instance
 * @param {object}            renderer — { hexSize, cx, cy }
 * @param {object}            ui       — { update, showGameOver }
 */
export function setupInput(canvas, game, renderer, ui) {
  // Remove previous listener before attaching a new one (restart support)
  if (_inputAbort) _inputAbort.abort();
  _inputAbort = new AbortController();

  canvas.addEventListener('click', (event) => {
    // Block clicks during flash animation
    if (state.isAnimating) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (event.clientX - rect.left) * scaleX;
    const py = (event.clientY - rect.top)  * scaleY;

    const hex = pixelToHex(px, py, renderer.hexSize, renderer.cx, renderer.cy);

    // Click outside board
    if (!hex) {
      _clearSelection();
      _redraw(canvas, game, renderer);
      return;
    }

    const { q, r } = hex;
    const key = `${q},${r}`;

    // ── Case 1: click on a highlighted short-move target ──────────────────
    const isShort = state.shortMoves.some(([sq, sr]) => sq === q && sr === r);
    if (isShort && state.selectedCell) {
      const { q: fq, r: fr } = state.selectedCell;
      const prevCounts = game.board.countPieces();
      game.move(fq, fr, q, r);
      state.lastMove = { from: [fq, fr], to: [q, r] };
      _clearSelection();
      _afterMove(canvas, game, renderer, ui, prevCounts);
      return;
    }

    // ── Case 2: click on a highlighted long-move target ───────────────────
    const isLong = state.longMoves.some(([lq, lr]) => lq === q && lr === r);
    if (isLong && state.selectedCell) {
      const { q: fq, r: fr } = state.selectedCell;
      const prevCounts = game.board.countPieces();
      game.move(fq, fr, q, r);
      state.lastMove = { from: [fq, fr], to: [q, r] };
      _clearSelection();
      _afterMove(canvas, game, renderer, ui, prevCounts);
      return;
    }

    // ── Case 3: click on own piece → select it ────────────────────────────
    const cellState = game.board.get(q, r);
    if (cellState === game.currentPlayer) {
      const { shortMoves, longMoves } = game.getValidMoves(q, r);
      state.selectedCell = { q, r };
      state.shortMoves   = shortMoves;
      state.longMoves    = longMoves;
      _redraw(canvas, game, renderer);
      return;
    }

    // ── Case 4: any other click → cancel selection ────────────────────────
    _clearSelection();
    _redraw(canvas, game, renderer);
  }, { signal: _inputAbort.signal });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _clearSelection() {
  state.selectedCell = null;
  state.shortMoves   = [];
  state.longMoves    = [];
}

function _redraw(canvas, game, renderer) {
  const ctx = canvas.getContext('2d');
  drawBoard(
    ctx,
    game.board,
    state.selectedCell,
    state.shortMoves,
    state.longMoves,
    state.lastMove,
  );
}

function _afterMove(canvas, game, renderer, ui, prevCounts) {
  const counts = game.board.countPieces();
  // Conquest happened if the opponent lost pieces compared to before the move
  const opponent = game.currentPlayer === 'player1' ? 'player2' : 'player1';
  const hadConquest = counts[opponent] < prevCounts[opponent];

  _redraw(canvas, game, renderer);
  ui.update(game);

  if (game.isGameOver()) {
    ui.showGameOver(game);
    return;
  }

  if (hadConquest) {
    state.isAnimating = true;
    flashConquest(canvas.getContext('2d'), state, () => {
      _redraw(canvas, game, renderer);
    });
  }
}
