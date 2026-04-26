import assert from 'node:assert/strict';
import { HexGame, InvalidMove } from '../game.js';

let passed = 0, failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  ✅ ${name}`); passed++; }
  catch (e) { console.error(`  ❌ ${name}: ${e.message}`); failed++; }
}

function freshGame() { return new HexGame(); }

console.log('\ngame.js — movimentos e conquista');

// moveShort
test('moveShort: origem mantém a peça (duplicação)', () => {
  const game = freshGame();
  game.moveShort(0, -4, 0, -3);
  assert.equal(game.board.get(0, -4), 'player1'); // origem mantida
  assert.equal(game.board.get(0, -3), 'player1'); // destino recebe cópia
});

test('moveShort: lança InvalidMove se destino ocupado', () => {
  const game = freshGame();
  game.board.set(0, -3, 'player2');
  assert.throws(() => game.moveShort(0, -4, 0, -3), InvalidMove);
});

test('moveShort: lança InvalidMove se distância != 1', () => {
  const game = freshGame();
  assert.throws(() => game.moveShort(0, -4, 0, -2), InvalidMove);
});

test('moveShort: lança InvalidMove se peça não pertence ao jogador', () => {
  const game = freshGame();
  assert.throws(() => game.moveShort(0, 4, 0, 3), InvalidMove); // peça do P2, vez do P1
});

// moveLong
test('moveLong: origem fica vazia (pulo)', () => {
  const game = freshGame();
  game.moveLong(0, -4, 0, -2);
  assert.equal(game.board.get(0, -4), 'empty'); // origem vazia
  assert.equal(game.board.get(0, -2), 'player1'); // destino com peça
});

test('moveLong: lança InvalidMove se destino ocupado', () => {
  const game = freshGame();
  game.board.set(0, -2, 'player2');
  assert.throws(() => game.moveLong(0, -4, 0, -2), InvalidMove);
});

test('moveLong: lança InvalidMove se distância != 2', () => {
  const game = freshGame();
  assert.throws(() => game.moveLong(0, -4, 0, -3), InvalidMove); // distância 1
});

// Conquista — vizinhos reais de (0,-3): (1,-3),(-1,-3),(0,-2),(0,-4),(1,-4),(-1,-2)
test('conquista: peças adjacentes do oponente são convertidas', () => {
  const game = freshGame();
  game.board.set(0, -2, 'player2');
  game.board.set(-1, -2, 'player2');
  game.moveShort(0, -4, 0, -3);
  assert.equal(game.board.get(0, -2), 'player1');
  assert.equal(game.board.get(-1, -2), 'player1');
});

test('conquista: múltiplas peças conquistadas no mesmo turno', () => {
  const game = freshGame();
  game.board.set(0, -2, 'player2');
  game.board.set(-1, -2, 'player2');
  game.board.set(1, -3, 'player2');
  game.moveShort(0, -4, 0, -3);
  assert.equal(game.board.get(0, -2), 'player1');
  assert.equal(game.board.get(-1, -2), 'player1');
  assert.equal(game.board.get(1, -3), 'player1');
});

test('conquista: peças do próprio jogador não são afetadas', () => {
  const game = freshGame();
  game.board.set(-1, -2, 'player1');
  game.moveShort(0, -4, 0, -3);
  assert.equal(game.board.get(-1, -2), 'player1');
});

test('conquista após moveLong também ocorre', () => {
  const game = freshGame();
  game.board.set(0, -2, 'player2'); // vizinho do destino (0,-2) do long move
  // moveLong de (0,-4) para (0,-2) — destino ocupado, usar outro
  game.board.set(1, -3, 'player2'); // vizinho de (2,-4)
  game.moveLong(0, -4, 2, -4);
  // vizinhos de (2,-4): verificar se (1,-3) é adjacente
  // hexDistance(2,-4,1,-3) = max(1,1,0) = 1 ✓
  assert.equal(game.board.get(1, -3), 'player1');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
