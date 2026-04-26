/**
 * ai.js — Greedy AI for Hexagon
 *
 * Picks the move that maximises immediate captures.
 * Tie-break: short moves (duplication) over long moves; random among equals.
 * Testable in Node.js (pure logic, no DOM/Canvas dependency).
 */

import { getNeighbors } from './engine/hex_utils.js';

/**
 * Count how many opponent pieces would be captured if `player` moves to (toQ, toR).
 *
 * @param {HexBoard} board
 * @param {string}   player  - 'player1' | 'player2'
 * @param {number}   toQ
 * @param {number}   toR
 * @returns {number}
 */
function countCaptures(board, player, toQ, toR) {
  const opponent = player === 'player1' ? 'player2' : 'player1';
  return getNeighbors(toQ, toR).filter(([nq, nr]) => {
    try { return board.get(nq, nr) === opponent; } catch { return false; }
  }).length;
}

/**
 * Return the best move for the current player using a greedy capture heuristic.
 *
 * @param {HexGame} game
 * @returns {{ fromQ: number, fromR: number, toQ: number, toR: number } | null}
 */
export function getBestMove(game) {
  const player  = game.currentPlayer;
  const candidates = []; // { fromQ, fromR, toQ, toR, score, isShort }

  for (const [key, state] of game.board.cells) {
    if (state !== player) continue;
    const [fromQ, fromR] = key.split(',').map(Number);
    const { shortMoves, longMoves } = game.getValidMoves(fromQ, fromR);

    for (const [toQ, toR] of shortMoves) {
      candidates.push({
        fromQ, fromR, toQ, toR,
        score: countCaptures(game.board, player, toQ, toR),
        isShort: true,
      });
    }
    for (const [toQ, toR] of longMoves) {
      candidates.push({
        fromQ, fromR, toQ, toR,
        score: countCaptures(game.board, player, toQ, toR),
        isShort: false,
      });
    }
  }

  if (candidates.length === 0) return null;

  // Find max score
  const maxScore = Math.max(...candidates.map(c => c.score));
  const best = candidates.filter(c => c.score === maxScore);

  // Tie-break: prefer short moves (duplication grows piece count)
  const shorts = best.filter(c => c.isShort);
  const pool   = shorts.length > 0 ? shorts : best;

  // Random among equals
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return { fromQ: chosen.fromQ, fromR: chosen.fromR, toQ: chosen.toQ, toR: chosen.toR };
}
