import { HexBoard } from './board.js';
import { getNeighbors, getJumpTargets, hexDistance } from './hex_utils.js';

export class InvalidMove extends Error {
  constructor(msg) { super(msg); this.name = 'InvalidMove'; }
}

export class NotYourTurn extends Error {
  constructor(player) { super(`Not your turn: ${player}`); this.name = 'NotYourTurn'; }
}

export class HexGame {
  constructor() {
    this.board = new HexBoard();
    this.board.setup();
    this.currentPlayer = 'player1';
  }

  // ── Move validation helpers ─────────────────────────────────────────

  _assertDestination(toQ, toR) {
    const dest = this.board.get(toQ, toR); // throws InvalidCoordinate if out of bounds
    if (dest !== 'empty') throw new InvalidMove(`Destination (${toQ},${toR}) is not empty`);
  }

  _capture(toQ, toR) {
    const opponent = this.currentPlayer === 'player1' ? 'player2' : 'player1';
    for (const [nq, nr] of getNeighbors(toQ, toR)) {
      if (this.board.get(nq, nr) === opponent) {
        this.board.set(nq, nr, this.currentPlayer);
      }
    }
  }

  // ── Moves ───────────────────────────────────────────────────────────

  moveShort(fromQ, fromR, toQ, toR) {
    if (this.board.get(fromQ, fromR) !== this.currentPlayer) {
      throw new InvalidMove(`No ${this.currentPlayer} piece at (${fromQ},${fromR})`);
    }
    if (hexDistance(fromQ, fromR, toQ, toR) !== 1) {
      throw new InvalidMove('Short move requires distance of exactly 1');
    }
    this._assertDestination(toQ, toR);

    // Duplicate: origin stays, copy goes to destination
    this.board.set(toQ, toR, this.currentPlayer);
    this._capture(toQ, toR);
  }

  moveLong(fromQ, fromR, toQ, toR) {
    if (this.board.get(fromQ, fromR) !== this.currentPlayer) {
      throw new InvalidMove(`No ${this.currentPlayer} piece at (${fromQ},${fromR})`);
    }
    if (hexDistance(fromQ, fromR, toQ, toR) !== 2) {
      throw new InvalidMove('Long move requires distance of exactly 2');
    }
    this._assertDestination(toQ, toR);

    // Jump: origin becomes empty, piece moves to destination
    this.board.set(fromQ, fromR, 'empty');
    this.board.set(toQ, toR, this.currentPlayer);
    this._capture(toQ, toR);
  }

  // ── Turn + game state ───────────────────────────────────────────────

  move(fromQ, fromR, toQ, toR) {
    if (this.board.get(fromQ, fromR) !== this.currentPlayer) {
      throw new NotYourTurn(this.currentPlayer);
    }
    const dist = hexDistance(fromQ, fromR, toQ, toR);
    if (dist === 1) this.moveShort(fromQ, fromR, toQ, toR);
    else if (dist === 2) this.moveLong(fromQ, fromR, toQ, toR);
    else throw new InvalidMove(`Invalid distance: ${dist}`);

    this.currentPlayer = this.currentPlayer === 'player1' ? 'player2' : 'player1';
  }

  isGameOver() {
    return this.board.countPieces().empty === 0;
  }

  getWinner() {
    if (!this.isGameOver()) return null;
    const { player1, player2 } = this.board.countPieces();
    if (player1 > player2) return 'player1';
    if (player2 > player1) return 'player2';
    return 'draw';
  }

  getValidMoves(q, r) {
    if (this.board.get(q, r) !== this.currentPlayer) {
      return { shortMoves: [], longMoves: [] };
    }
    const shortMoves = getNeighbors(q, r)
      .filter(([nq, nr]) => this.board.get(nq, nr) === 'empty');
    const longMoves = getJumpTargets(q, r)
      .filter(([nq, nr]) => this.board.get(nq, nr) === 'empty');
    return { shortMoves, longMoves };
  }
}
