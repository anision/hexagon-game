/**
 * main.js — Bootstrap for Hexagon
 *
 * Reads ?mode=hotseat|ai from the URL.
 * In AI mode, schedules the AI move (800ms delay) after each human move.
 */

import { HexGame }    from './engine/game.js';
import { drawBoard, resizeCanvas } from './renderer.js';
import { setupInput, state as inputState } from './input.js';
import { getBestMove } from './ai.js';
import * as ui        from './ui.js';

// ─── Auth ─────────────────────────────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const tokenFromUrl = params.get('token');
if (tokenFromUrl) {
  Auth.setToken(tokenFromUrl);
  const cleanUrl = window.location.pathname + '?mode=' + (params.get('mode') || 'hotseat');
  history.replaceState({}, document.title, cleanUrl);
}
if (!Auth.isLoggedIn()) {
  window.location.href = 'login.html';
}

// ─── Mode ─────────────────────────────────────────────────────────────────
const gameMode = params.get('mode') === 'ai' ? 'ai' : 'hotseat';

// ─── DOM ──────────────────────────────────────────────────────────────────
const canvas     = document.getElementById('game-canvas');
const btnRestart = document.getElementById('btn-restart');
const aiThinking = document.getElementById('ai-thinking');

// ─── Renderer geometry ────────────────────────────────────────────────────
const rendererState = { hexSize: 0, cx: 0, cy: 0 };

function computeRendererGeometry() {
  rendererState.hexSize = Math.floor(Math.min(canvas.width, canvas.height) / 14);
  rendererState.cx      = canvas.width  / 2;
  rendererState.cy      = canvas.height / 2;
}

// ─── Game instance ────────────────────────────────────────────────────────
let game;

function redrawClean() {
  drawBoard(canvas.getContext('2d'), game.board, null, [], [], inputState.lastMove);
}

// ─── AI move ─────────────────────────────────────────────────────────────
function scheduleAiMove() {
  if (game.isGameOver() || game.currentPlayer !== 'player2') return;

  inputState.isAiTurn = true;
  if (aiThinking) aiThinking.classList.remove('hidden');

  setTimeout(() => {
    const move = getBestMove(game);
    if (move) {
      game.move(move.fromQ, move.fromR, move.toQ, move.toR);
      inputState.lastMove = { from: [move.fromQ, move.fromR], to: [move.toQ, move.toR] };
    }

    if (aiThinking) aiThinking.classList.add('hidden');
    inputState.isAiTurn = false;

    redrawClean();
    ui.update(game);

    if (game.isGameOver()) {
      ui.showGameOver(game);
    }
  }, 800);
}

// ─── Init ─────────────────────────────────────────────────────────────────
function initGame() {
  inputState.selectedCell = null;
  inputState.shortMoves   = [];
  inputState.longMoves    = [];
  inputState.lastMove     = null;
  inputState.isAnimating  = false;
  inputState.isAiTurn     = false;

  if (aiThinking) aiThinking.classList.add('hidden');

  game = new HexGame();
  computeRendererGeometry();
  redrawClean();
  ui.update(game);
  ui.hideGameOver();

  const onMove = gameMode === 'ai' ? scheduleAiMove : null;
  setupInput(canvas, game, rendererState, ui, onMove);
}

// ─── Resize ───────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  resizeCanvas(canvas);
  computeRendererGeometry();
  redrawClean();
});

// ─── Restart → mode selection ─────────────────────────────────────────────
btnRestart.addEventListener('click', () => {
  window.location.href = 'mode-select.html';
});

// ─── Player profile ───────────────────────────────────────────────────────
async function loadProfile() {
  const res = await Auth.fetchWithAuth(`${Auth.getBackendUrl()}/api/players/me`);
  if (!res) return;
  const player = await res.json();
  const header = document.getElementById('game-header');
  const avatar = player.avatar_url
    ? `<img src="${player.avatar_url}" alt="avatar" class="player-avatar" />`
    : `<div class="player-avatar player-initials">${player.name.charAt(0).toUpperCase()}</div>`;
  header.innerHTML = `
    <h1 class="game-title">Hexagon</h1>
    <div class="player-info">
      ${avatar}
      <span class="player-name">${player.name}</span>
      <button class="btn-logout" onclick="Auth.logout()">Sair</button>
    </div>
  `;
}

// ─── Bootstrap ────────────────────────────────────────────────────────────
resizeCanvas(canvas);
initGame();
loadProfile();
