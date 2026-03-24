import { dbWallet } from '../database';
import { UserProgress } from '../models/UserProgress';

export const UserProgressService = {
  async get(principalId: string, coinAddress: string): Promise<UserProgress | undefined> {
    return await dbWallet.user_progress.where({ principalId, coinAddress }).first();
  },

  async saveOrUpdate({
    principalId,
    coinAddress,
    lastSavedBlock,
  }: {
    principalId: string;
    coinAddress: string;
    lastSavedBlock: number;
  }) {
    const existing = await this.get(principalId, coinAddress);
    if (existing) {
      return await dbWallet.user_progress.update(existing.id!, {
        lastSavedBlock,
      });
    } else {
      return await dbWallet.user_progress.add({
        principalId,
        coinAddress,
        lastSavedBlock,
      });
    }
  },
};
