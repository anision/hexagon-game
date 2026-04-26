import { isInBoard } from './hex_utils.js';

export class InvalidCoordinate extends Error {
  constructor(q, r) {
    super(`Invalid coordinate (${q}, ${r})`);
    this.name = 'InvalidCoordinate';
  }
}

const INITIAL_POSITIONS = {
  player1: [[0, -4], [-4, 4], [4, 0]],
  player2: [[0, 4], [4, -4], [-4, 0]],
};

export class HexBoard {
  constructor(radius = 4) {
    this.radius = radius;
    this.cells = new Map();
    this._init();
  }

  _init() {
    const r = this.radius;
    for (let q = -r; q <= r; q++) {
      for (let row = -r; row <= r; row++) {
        if (Math.abs(q + row) <= r) {
          this.cells.set(`${q},${row}`, 'empty');
        }
      }
    }
  }

  _key(q, r) {
    return `${q},${r}`;
  }

  get(q, r) {
    const key = this._key(q, r);
    if (!this.cells.has(key)) throw new InvalidCoordinate(q, r);
    return this.cells.get(key);
  }

  set(q, r, value) {
    const key = this._key(q, r);
    if (!this.cells.has(key)) throw new InvalidCoordinate(q, r);
    this.cells.set(key, value);
  }

  setup() {
    for (const [player, positions] of Object.entries(INITIAL_POSITIONS)) {
      for (const [q, r] of positions) {
        this.set(q, r, player);
      }
    }
  }

  countPieces() {
    let player1 = 0, player2 = 0, empty = 0;
    for (const value of this.cells.values()) {
      if (value === 'player1') player1++;
      else if (value === 'player2') player2++;
      else empty++;
    }
    return { player1, player2, empty };
  }
}
