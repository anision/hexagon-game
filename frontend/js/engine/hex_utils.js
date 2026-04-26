// Axial coordinate directions for a hex grid
const HEX_DIRECTIONS = [
  [1, 0], [-1, 0],
  [0, 1], [0, -1],
  [1, -1], [-1, 1],
];

// All 18 cells at exactly 2 hex steps (jump targets)
const HEX_JUMP_OFFSETS = [
  [2, 0], [-2, 0], [0, 2], [0, -2],
  [2, -1], [2, -2], [1, -2],
  [-2, 1], [-2, 2], [-1, 2],
  [1, 1], [-1, -1],
];

export function isInBoard(q, r, radius = 4) {
  return Math.abs(q) <= radius && Math.abs(r) <= radius && Math.abs(q + r) <= radius;
}

export function getNeighbors(q, r, radius = 4) {
  return HEX_DIRECTIONS
    .map(([dq, dr]) => [q + dq, r + dr])
    .filter(([nq, nr]) => isInBoard(nq, nr, radius));
}

export function getJumpTargets(q, r, radius = 4) {
  return HEX_JUMP_OFFSETS
    .map(([dq, dr]) => [q + dq, r + dr])
    .filter(([nq, nr]) => isInBoard(nq, nr, radius));
}

export function hexDistance(q1, r1, q2, r2) {
  return Math.max(Math.abs(q2 - q1), Math.abs(r2 - r1), Math.abs((q2 + r2) - (q1 + r1)));
}
