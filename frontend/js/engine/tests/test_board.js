import assert from 'node:assert/strict';
import { HexBoard, InvalidCoordinate } from '../board.js';

let passed = 0, failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  ✅ ${name}`); passed++; }
  catch (e) { console.error(`  ❌ ${name}: ${e.message}`); failed++; }
}

console.log('\nboard.js');

// Inicialização
test('tabuleiro tem exatamente 61 células', () => {
  const board = new HexBoard();
  assert.equal(board.cells.size, 61);
});

test('todas as células iniciam como empty', () => {
  const board = new HexBoard();
  for (const v of board.cells.values()) assert.equal(v, 'empty');
});

// get / set
test('get retorna empty para célula válida', () => {
  assert.equal(new HexBoard().get(0, 0), 'empty');
});

test('get lança InvalidCoordinate para célula fora do tabuleiro', () => {
  assert.throws(() => new HexBoard().get(5, 0), InvalidCoordinate);
});

test('set atualiza o valor da célula', () => {
  const board = new HexBoard();
  board.set(0, 0, 'player1');
  assert.equal(board.get(0, 0), 'player1');
});

test('set lança InvalidCoordinate para célula fora do tabuleiro', () => {
  assert.throws(() => new HexBoard().set(5, 0, 'player1'), InvalidCoordinate);
});

// setup — posições iniciais
test('setup coloca 3 peças do player1', () => {
  const board = new HexBoard();
  board.setup();
  assert.equal(board.get(0, -4), 'player1');
  assert.equal(board.get(-4, 4), 'player1');
  assert.equal(board.get(4, 0), 'player1');
});

test('setup coloca 3 peças do player2', () => {
  const board = new HexBoard();
  board.setup();
  assert.equal(board.get(0, 4), 'player2');
  assert.equal(board.get(4, -4), 'player2');
  assert.equal(board.get(-4, 0), 'player2');
});

// countPieces
test('countPieces antes do setup: 61 empty', () => {
  const counts = new HexBoard().countPieces();
  assert.equal(counts.player1, 0);
  assert.equal(counts.player2, 0);
  assert.equal(counts.empty, 61);
});

test('countPieces após setup: 3+3+55', () => {
  const board = new HexBoard();
  board.setup();
  const counts = board.countPieces();
  assert.equal(counts.player1, 3);
  assert.equal(counts.player2, 3);
  assert.equal(counts.empty, 55);
});

test('countPieces sempre soma 61', () => {
  const board = new HexBoard();
  board.setup();
  const { player1, player2, empty } = board.countPieces();
  assert.equal(player1 + player2 + empty, 61);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
