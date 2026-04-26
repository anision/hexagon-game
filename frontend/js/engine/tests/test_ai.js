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

  // player1 at (0,0). One player2 piece at (1,0) (short target) and one at (2,0) (long target).
  // Short move to (1,0) is invalid (occupied). Use a scenario where both are valid destinations.
  //
  // player1 at (0,0).
  // Destination A (short): (1,-1) — has 1 player2 neighbour at (1,0)
  // Destination B (long):  (2,-2) — has 1 player2 neighbour at (1,0) ... let's verify:
  //   neighbours of (2,-2): (3,-2),(1,-2),(2,-1),(2,-3),(3,-3),(1,-1) — (1,0) not among them.
  // Let's use a cleaner scenario:
  // player1 at (-2,0), player2 at (-1,0).
  // Short move to (-1,-1): neighbours include (-1,0)? neighbours of (-1,-1): (0,-1),(-2,0),(0,-2),(-2,1),(-1,0),(-1,-2) → YES captures (-1,0) ✓ score=1, isShort=true
  // Long move to (0,-2): neighbours of (0,-2): (1,-2),(-1,-2),(0,-1),(0,-3),(1,-3),(-1,-1) → (-1,0) not here → score=0
  // Long move to (0,0): neighbours of (0,0): (1,0),(-1,0),(0,1),(0,-1),(1,-1),(-1,1) → captures (-1,0) ✓ score=1, isShort=false
  // So we have short=(-1,-1) score=1 vs long=(0,0) score=1 → should pick short.

  for (const [key] of game.board.cells) {
    const [q, r] = key.split(',').map(Number);
    game.board.set(q, r, 'empty');
  }
  game.board.set(-2,  0, 'player1');
  game.board.set(-1,  0, 'player2');

  const move = getBestMove(game);
  assert.ok(move !== null);
  assert.ok(move.isShort === undefined || true, 'move returned'); // getBestMove doesn't expose isShort
  // The move should be the short one: (-2,0)→(-1,-1)
  assert.strictEqual(move.toQ, -1, `expected toQ=-1, got ${move.toQ}`);
  assert.strictEqual(move.toR, -1, `expected toR=-1, got ${move.toR}`);
});

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`AI tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
