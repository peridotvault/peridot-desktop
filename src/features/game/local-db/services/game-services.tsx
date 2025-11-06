import { GameId, PGCContractMeta } from '@shared/lib/interfaces/game.types';
import { dbGame } from '../database';

export const gameService = {
  // Create
  async create(game: PGCContractMeta) {
    return await dbGame.game.put(game);
  },

  // Read
  async get() {
    return await dbGame.game.toArray();
  },

  // Update
  async update(game: Partial<PGCContractMeta>, gameId: GameId) {
    return await dbGame.game.update(gameId, game);
  },

  // Delete
  async delete(gameId: GameId) {
    return await dbGame.game.delete(gameId);
  },
};
