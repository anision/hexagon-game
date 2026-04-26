/**
 * test_renderer.js — Unit tests for hexToPixel and pixelToHex (pure math, testable in Node.js).
 *
 * Run: node frontend/js/engine/tests/test_renderer.js
 */

import assert from 'assert';
import { hexToPixel, pixelToHex } from '../../renderer.js';

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

function approx(a, b, tol = 0.001) {
  return Math.abs(a - b) < tol;
}

// ─── hexToPixel ───────────────────────────────────────────────────────────────

console.log('\nhexToPixel — flat-top geometry');

test('center hex (0,0) maps to canvas center', () => {
  const { x, y } = hexToPixel(0, 0, 40, 400, 350);
  assert.ok(approx(x, 400), `x=${x} expected 400`);
  assert.ok(approx(y, 350), `y=${y} expected 350`);
});

test('q=1, r=0 shifts right by 1.5*size', () => {
  const size = 40;
  const { x, y } = hexToPixel(1, 0, size, 0, 0);
  assert.ok(approx(x, size * 1.5),   `x=${x} expected ${size * 1.5}`);
  assert.ok(approx(y, size * Math.sqrt(3) / 2), `y=${y}`);
});

test('q=0, r=1 shifts down by √3*size', () => {
  const size = 40;
  const { x, y } = hexToPixel(0, 1, size, 0, 0);
  assert.ok(approx(x, 0),                `x=${x} expected 0`);
  assert.ok(approx(y, size * Math.sqrt(3)), `y=${y} expected ${size * Math.sqrt(3)}`);
});

test('symmetry: (q,r) and (-q,-r) are equidistant from center', () => {
  const size = 30;
  const cx = 300, cy = 300;
  const p1 = hexToPixel(2, -1, size, cx, cy);
  const p2 = hexToPixel(-2, 1, size, cx, cy);
  const d1 = Math.hypot(p1.x - cx, p1.y - cy);
  const d2 = Math.hypot(p2.x - cx, p2.y - cy);
  assert.ok(approx(d1, d2), `distances differ: ${d1} vs ${d2}`);
});

test('all 6 board vertices are equidistant from center', () => {
  const size = 40, cx = 400, cy = 350;
  const vertices = [
    [0, -4], [0, 4], [4, 0], [-4, 0], [4, -4], [-4, 4],
  ];
  const distances = vertices.map(([q, r]) => {
    const { x, y } = hexToPixel(q, r, size, cx, cy);
    return Math.round(Math.hypot(x - cx, y - cy) * 1000) / 1000;
  });
  const first = distances[0];
  distances.forEach((d, i) => {
    assert.ok(approx(d, first, 1), `vertex ${i} distance ${d} ≠ ${first}`);
  });
});

// ─── pixelToHex ───────────────────────────────────────────────────────────────

console.log('\npixelToHex — inverse geometry with cube rounding');

test('canvas center → (0,0)', () => {
  const result = pixelToHex(400, 350, 40, 400, 350);
  assert.deepStrictEqual(result, { q: 0, r: 0 });
});

test('pixel exactly at hex (2,-1) center → (2,-1)', () => {
  const size = 40, cx = 400, cy = 350;
  const { x, y } = hexToPixel(2, -1, size, cx, cy);
  const result = pixelToHex(x, y, size, cx, cy);
  assert.deepStrictEqual(result, { q: 2, r: -1 });
});

test('pixel slightly off center still rounds to correct hex', () => {
  const size = 40, cx = 400, cy = 350;
  const { x, y } = hexToPixel(1, 1, size, cx, cy);
  // Add small offset (less than half-hex)
  const result = pixelToHex(x + 5, y - 3, size, cx, cy);
  assert.deepStrictEqual(result, { q: 1, r: 1 });
});

test('pixel far outside board → null', () => {
  const result = pixelToHex(9999, 9999, 40, 400, 350);
  assert.strictEqual(result, null);
});

test('pixel at board edge (radius 4 vertex) → correct hex', () => {
  const size = 40, cx = 400, cy = 350;
  const { x, y } = hexToPixel(0, -4, size, cx, cy);
  const result = pixelToHex(x, y, size, cx, cy);
  assert.deepStrictEqual(result, { q: 0, r: -4 });
});

// ─── Round-trip ───────────────────────────────────────────────────────────────

console.log('\nRound-trip: hexToPixel → pixelToHex');

test('round-trip for all 61 board cells', () => {
  const size = 40, cx = 400, cy = 350;
  let count = 0;
  for (let q = -4; q <= 4; q++) {
    for (let r = -4; r <= 4; r++) {
      if (Math.abs(q) > 4 || Math.abs(r) > 4 || Math.abs(q + r) > 4) continue;
      const { x, y } = hexToPixel(q, r, size, cx, cy);
      const result = pixelToHex(x, y, size, cx, cy);
      assert.ok(result !== null, `(${q},${r}) → pixel → null`);
      assert.strictEqual(result.q, q, `q mismatch at (${q},${r}): got ${result.q}`);
      assert.strictEqual(result.r, r, `r mismatch at (${q},${r}): got ${result.r}`);
      count++;
    }
  }
  assert.strictEqual(count, 61, `expected 61 cells, got ${count}`);
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Renderer tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
