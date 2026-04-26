/**
 * test_ai.js — Unit tests for the greedy AI.
 *
 * Run: node frontend/js/engine/tests/test_ai.js
 */

import assert from 'node:assert/strict';
import { HexGame } from '../game.js';
import { getBestMove } from '../../ai.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// ─── Test 1: best move maximises captures ────────────────────────────────────

console.log('\ngreedy AI — capture maximisation');

test('chooses move that captures most opponent pieces', () => {
  const game = new HexGame();

  // Clear board and set up a controlled scenario.
  // Player1 has a piece at (0,0).
  // Player2 has pieces at (1,0), (0,1), (-1,1) — all neighbours of (1,-1) except (0,0).
  // Player1 short-moves to (1,-1) → captures 0 (none of p2 are neighbours of (1,-1) except check)
  // Actually let's set up: player1 at (0,0), player2 at (1,0),(0,1),(-1,1)
  // player1 short move to (1,0) is invalid (occupied). Let's use simpler setup:
  //
  // player1 at (-2, 0)
  // player2 at (-1, 0), (0, 0), (0, -1)  ← all neighbours of (-1,-1) except some
  // player1 short-moves to (-1,-1) would capture neighbours of (-1,-1) that are player2
  // neighbours of (-1,-1): (0,-1),(−2,0),(0,−2),(−2,1),(−1,0),(−1,−2) — intersect with p2: (-1,0),(0,-1)
  // So short move (-2,0)→(-1,-1) captures 2.
  // player1 also has move (-2,0)→(-2,1) capturing 0.
  // AI should pick (-1,-1).

  // Reset board fully
  for (const [key] of game.board.cells) {
    const [q, r] = key.split(',').map(Number);
    game.board.set(q, r, 'empty');
  }

  game.board.set(-2,  0, 'player1');
  game.board.set(-1,  0, 'player2');
  game.board.set( 0, -1, 'player2');
  game.board.set( 0,  0, 'player2');

  const move = getBestMove(game);

  assert.ok(move !== null, 'should return a move');
  assert.strictEqual(move.fromQ, -2, `fromQ=${move.fromQ}`);
  assert.strictEqual(move.fromR,  0, `fromR=${move.fromR}`);
  assert.strictEqual(move.toQ,  -1, `toQ=${move.toQ}`);
  assert.strictEqual(move.toR,  -1, `toR=${move.toR}`);
});

// ─── Test 2: no captures → still returns a valid move ────────────────────────

console.log('\ngreedy AI — fallback when no captures available');

test('returns a move when no captures exist', () => {
  const game = new HexGame();

  // Isolated player1 piece with no player2 neighbours
  for (const [key] of game.board.cells) {
    const [q, r] = key.split(',').map(Number);
    game.board.set(q, r, 'empty');
  }
  game.board.set(0, 0, 'player1');

  const move = getBestMove(game);
  assert.ok(move !== null, 'should return a move');
  assert.strictEqual(move.fromQ, 0);
  assert.strictEqual(move.fromR, 0);
});

// ─── Test 3: no moves available → returns null ───────────────────────────────

console.log('\ngreedy AI — no moves');

test('returns null when player has no valid moves', () => {
  const game = new HexGame();

  // Surround (0,0) with own pieces — no empty neighbours or jump targets
  for (const [key] of game.board.cells) {
    const [q, r] = key.split(',').map(Number);
    game.board.set(q, r, 'player2'); // fill everything
  }
  // Player1 has one piece completely surrounded by player2 (not empty)
  game.board.set(0, 0, 'player1');

  const move = getBestMove(game);
  assert.strictEqual(move, null, 'should be null when no moves exist');
});

// ─── Test 4: prefers short moves over long moves in a tie ────────────────────

console.log('\ngreedy AI — short-move priority');

test('prefers short move over long move when capture count is equal', () => {
  const game = new HexGame();

  // Scenario: player1 at (0,0), player2 at (2,0).
  //
  // Short move (0,0)→(1,0): neighbours of (1,0) = (2,0)[p2] → score=1, isShort=true
  //   All other short targets ((-1,0),(0,1),(0,-1),(1,-1),(-1,1)) do NOT have (2,0) as neighbour → score=0
  //
  // Long moves from (0,0): (2,0) is occupied (p2), so not a valid target.
  //   (1,1): neighbours = (2,1),(0,1),(1,2),(1,0),(2,0)[p2],(0,2) → score=1, isShort=false
  //   (2,-1): neighbours = (3,-1),(1,-1),(2,0)[p2],(2,-2),(3,-2),(1,0) → score=1, isShort=false
  //   Other long targets score 0.
  //
  // Result: short (1,0) and long (1,1),(2,-1) all score 1 → short wins.

  for (const [key] of game.board.cells) {
    const [q, r] = key.split(',').map(Number);
    game.board.set(q, r, 'empty');
  }
  game.board.set(0, 0, 'player1');
  game.board.set(2, 0, 'player2');

  const move = getBestMove(game);
  assert.ok(move !== null);
  assert.strictEqual(move.fromQ, 0, `fromQ=${move.fromQ}`);
  assert.strictEqual(move.fromR, 0, `fromR=${move.fromR}`);
  assert.strictEqual(move.toQ,   1, `expected toQ=1 (short), got ${move.toQ}`);
  assert.strictEqual(move.toR,   0, `expected toR=0 (short), got ${move.toR}`);
});

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`AI tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
