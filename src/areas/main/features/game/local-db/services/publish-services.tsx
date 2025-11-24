// services/publish-service.ts

import { dbGame } from '../database';
import { GamePublish } from '@shared/interfaces/game';

export const PublishService = {
  /** Publish game ke chain tertentu */
  async publishToChain(gameId: string, chainId: number, releaseDate?: number) {
    const publishRecord: GamePublish = {
      gameId: gameId,
      chainId: chainId,
      isPublished: true,
      releaseDate: releaseDate ?? Date.now(),
    };
    return dbGame.game_publish.put(publishRecord);
  },

  /** Cek apakah game sudah dipublish ke chain tertentu */
  async isPublishedToChain(gameId: string, chainId: number): Promise<boolean> {
    const record = await dbGame.game_publish.get([gameId, chainId]);
    return record?.isPublished ?? false;
  },

  /** Dapatkan semua chain yang didukung oleh game */
  async getSupportedChains(gameId: string) {
    return dbGame.game_publish.where('game_id').equals(gameId).toArray();
  },

  /** Dapatkan semua game yang dipublish ke chain tertentu */
  async getGamesInChain(chainId: number) {
    return dbGame.game_publish
      .where('[game_id+chain_id]')
      .between(['', chainId], ['\uffff', chainId])
      .toArray();
  },

  /** Hapus publish record (unpublish dari chain) */
  async unpublishFromChain(gameId: string, chainId: number) {
    return dbGame.game_publish.delete([gameId, chainId]);
  },
};
