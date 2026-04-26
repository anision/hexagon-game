/**
 * main.js — Bootstrap for Hexagon
 *
 * Connects the game engine (M3) to the Canvas renderer, click input handler
 * and DOM UI. Manages game lifecycle: init → play → game over → restart.
 */

import { HexGame }    from './engine/game.js';
import { drawBoard, resizeCanvas } from './renderer.js';
import { setupInput, state as inputState } from './input.js';
import * as ui        from './ui.js';

// ─── Auth: capture token from OAuth callback URL ───────────────────────────
const params = new URLSearchParams(window.location.search);
const tokenFromUrl = params.get('token');
if (tokenFromUrl) {
  Auth.setToken(tokenFromUrl);
  history.replaceState({}, document.title, '/');
}

if (!Auth.isLoggedIn()) {
  window.location.href = 'login.html';
}

// ─── DOM references ────────────────────────────────────────────────────────
const canvas     = document.getElementById('game-canvas');
const btnRestart = document.getElementById('btn-restart');

// ─── Renderer geometry (shared with input.js) ─────────────────────────────
const rendererState = {
  hexSize: 0,
  cx: 0,
  cy: 0,
};

// ─── Game instance ─────────────────────────────────────────────────────────
let game;

function computeRendererGeometry() {
  rendererState.hexSize = Math.floor(Math.min(canvas.width, canvas.height) / 14);
  rendererState.cx      = canvas.width  / 2;
  rendererState.cy      = canvas.height / 2;
}

/** Draw the board without any active selection (used on init and resize). */
function redrawClean() {
  const ctx = canvas.getContext('2d');
  drawBoard(ctx, game.board, null, [], [], inputState.lastMove);
}

/** Create a new game, reset all state, redraw, and wire up input. */
function initGame() {
  // Reset input selection state
  inputState.selectedCell = null;
  inputState.shortMoves   = [];
  inputState.longMoves    = [];
  inputState.lastMove     = null;
  inputState.isAnimating  = false;

  game = new HexGame();

  computeRendererGeometry();
  redrawClean();
  ui.update(game);
  ui.hideGameOver();

  setupInput(canvas, game, rendererState, ui);
}

// ─── Resize ───────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  resizeCanvas(canvas);
  computeRendererGeometry();
  redrawClean();
});

// ─── Restart button ───────────────────────────────────────────────────────
btnRestart.addEventListener('click', () => {
  initGame();
});

// ─── Player profile in header ─────────────────────────────────────────────
async function loadProfile() {
  const response = await Auth.fetchWithAuth(`${Auth.getBackendUrl()}/api/players/me`);
  if (!response) return;

  const player = await response.json();
  const header = document.getElementById('game-header');
  const avatarHtml = player.avatar_url
    ? `<img src="${player.avatar_url}" alt="avatar" class="player-avatar" />`
    : `<div class="player-avatar player-initials">${player.name.charAt(0).toUpperCase()}</div>`;

  header.innerHTML = `
    <h1 class="game-title">Hexagon</h1>
    <div class="player-info">
      ${avatarHtml}
      <span class="player-name">${player.name}</span>
      <button class="btn-logout" onclick="Auth.logout()">Sair</button>
    </div>
  `;
}

// ─── Bootstrap ────────────────────────────────────────────────────────────
resizeCanvas(canvas);
initGame();
loadProfile();
