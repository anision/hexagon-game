/**
 * records.js — Auto-save game result on game over.
 *
 * saveGame(game, mode, playerId) calls POST /api/games with the result.
 * On failure it resolves normally so the game-over overlay always shows.
 */

/**
 * @param {HexGame} game       - finished game instance
 * @param {string}  mode       - 'hotseat' | 'ai'
 * @param {string}  playerId   - authenticated user's id (player1)
 * @returns {Promise<boolean>} true if saved, false on error
 */
export async function saveGame(game, mode, playerId) {
  const counts  = game.board.countPieces();
  const winner  = game.getWinner();

  const payload = {
    player2_id:    null,                        // always null in v1 (no p2 account)
    winner_id:     winner === 'player1' ? playerId : null,
    score_player1: counts.player1,
    score_player2: counts.player2,
    mode:          mode === 'ai' ? 'pvc' : 'pvp',
  };

  try {
    const res = await Auth.fetchWithAuth(
      `${Auth.getBackendUrl()}/api/games`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
    return res !== null && res.ok;
  } catch {
    return false;
  }
}
