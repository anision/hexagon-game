import assert from 'node:assert/strict';
import { isInBoard, getNeighbors, getJumpTargets, hexDistance } from '../hex_utils.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ❌ ${name}: ${e.message}`);
    failed++;
  }
}

console.log('\nhex_utils.js');

// isInBoard
test('célula central (0,0) está no tabuleiro', () => {
  assert.equal(isInBoard(0, 0), true);
});
test('vértice (0,-4) está no tabuleiro', () => {
  assert.equal(isInBoard(0, -4), true);
});
test('célula (5,0) está fora do tabuleiro', () => {
  assert.equal(isInBoard(5, 0), false);
});
test('célula (3,3) está fora (q+r=6>4)', () => {
  assert.equal(isInBoard(3, 3), false);
});

// getNeighbors
test('célula central (0,0) tem 6 vizinhos', () => {
  assert.equal(getNeighbors(0, 0).length, 6);
});
test('vértice (0,-4) tem 3 vizinhos', () => {
  assert.equal(getNeighbors(0, -4).length, 3);
});
test('vértice (-4,4) tem 3 vizinhos', () => {
  assert.equal(getNeighbors(-4, 4).length, 3);
});
test('todos os vizinhos estão no tabuleiro', () => {
  const neighbors = getNeighbors(2, -3);
  assert.ok(neighbors.every(([q, r]) => isInBoard(q, r)));
});

// getJumpTargets
test('célula central (0,0) tem alvos de pulo no tabuleiro', () => {
  const targets = getJumpTargets(0, 0);
  assert.ok(targets.length > 0);
  assert.ok(targets.every(([q, r]) => isInBoard(q, r)));
});
test('célula (0,0) não tem si mesma como alvo de pulo', () => {
  const targets = getJumpTargets(0, 0);
  assert.ok(!targets.some(([q, r]) => q === 0 && r === 0));
});
test('todos os alvos de pulo estão a distância 2', () => {
  const targets = getJumpTargets(0, 0);
  assert.ok(targets.every(([q, r]) => hexDistance(0, 0, q, r) === 2));
});

// hexDistance
test('distância de (0,0) para (0,0) é 0', () => {
  assert.equal(hexDistance(0, 0, 0, 0), 0);
});
test('distância de (0,0) para vizinho (1,0) é 1', () => {
  assert.equal(hexDistance(0, 0, 1, 0), 1);
});
test('distância de (0,0) para (0,2) é 2', () => {
  assert.equal(hexDistance(0, 0, 0, 2), 2);
});
test('distância do centro (0,0) ao vértice (0,-4) é 4', () => {
  assert.equal(hexDistance(0, 0, 0, -4), 4);
});
test('distância entre vértices opostos (0,-4) e (0,4) é 8', () => {
  assert.equal(hexDistance(0, -4, 0, 4), 8);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
