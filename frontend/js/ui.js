/**
 * ui.js — DOM updates for Hexagon (turn indicator, scoreboard, game-over overlay)
 *
 * All functions operate on fixed element IDs defined in index.html.
 * No Canvas dependency — pure DOM manipulation.
 */

/**
 * Update the turn indicator and scoreboard to reflect the current game state.
 *
 * @param {HexGame} game
 */
export function update(game) {
  const counts = game.board.countPieces();

  // Score
  const s1 = document.getElementById('score-p1');
  const s2 = document.getElementById('score-p2');
  if (s1) s1.textContent = counts.player1;
  if (s2) s2.textContent = counts.player2;

  // Turn indicator
  const turnEl = document.getElementById('turn-indicator');
  if (!turnEl) return;

  if (game.currentPlayer === 'player1') {
    turnEl.textContent  = 'Vez do Jogador 1';
    turnEl.dataset.player = '1';
  } else {
    turnEl.textContent  = 'Vez do Jogador 2';
    turnEl.dataset.player = '2';
  }
}

/**
 * Show the game-over overlay with the result and final score.
 *
 * @param {HexGame} game
 * @param {boolean} [saveFailed=false] - show save-error notice when true
 */
export function showGameOver(game, saveFailed = false) {
  const counts  = game.board.countPieces();
  const winner  = game.getWinner();

  const overlay  = document.getElementById('game-overlay');
  const msgEl    = document.getElementById('overlay-message');
  const scoreEl  = document.getElementById('overlay-score');
  const errorEl  = document.getElementById('save-error');

  if (!overlay || !msgEl || !scoreEl) return;

  let message;
  if (winner === 'player1')      message = 'Jogador 1 venceu!';
  else if (winner === 'player2') message = 'Jogador 2 venceu!';
  else                           message = 'Empate!';

  msgEl.textContent   = message;
  scoreEl.textContent = `${counts.player1} × ${counts.player2}`;

  if (errorEl) {
    errorEl.classList.toggle('hidden', !saveFailed);
  }

  overlay.classList.remove('hidden');
}

/**
 * Hide the game-over overlay.
 */
export function hideGameOver() {
  const overlay = document.getElementById('game-overlay');
  if (overlay) overlay.classList.add('hidden');
}
