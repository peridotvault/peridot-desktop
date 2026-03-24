import { dbWallet } from '../database';
import { Coin } from '../models/Coin';

export const CoinService = {
  // Create
  async add(coin: Coin) {
    return await dbWallet.coins.put(coin);
  },

  async addManyIfMissing(coins: Coin[]) {
    // Insert hanya koin yang belum ada (berdasarkan coinAddress)
    const existing = await dbWallet.coins.toArray();
    const existingIds = new Set(existing.map((c) => c.coinAddress));
    const toInsert = coins.filter((c) => !existingIds.has(c.coinAddress));
    if (toInsert.length > 0) {
      await dbWallet.coins.bulkAdd(toInsert);
    }
  },

  async seedIfEmpty(defaultCoins: Coin[]) {
    const count = await dbWallet.coins.count();
    if (count === 0) {
      // First run → isi dari JSON
      await dbWallet.coins.bulkAdd(defaultCoins);
    }
  },

  // Read
  async getAll(): Promise<Coin[]> {
    return await dbWallet.coins.toArray();
  },

  async getByAddress(coinAddress: string): Promise<Coin | undefined> {
    return await dbWallet.coins.get(coinAddress);
  },

  async getCoinActive(): Promise<Coin[]> {
    return await dbWallet.coins.where('isChecked').equals(1).toArray();
  },

  // Update
  async update(coinAddress: string, data: Partial<Coin>) {
    return await dbWallet.coins.update(coinAddress, data);
  },

  async updateIsChecked(coinAddress: string) {
    const coin = await dbWallet.coins.get(coinAddress);
    if (!coin) throw new Error('Coin not found');

    return await dbWallet.coins.update(coinAddress, {
      isChecked: coin.isChecked === 1 ? 0 : 1,
    });
  },

  // Delete
  async delete(coinAddress: string) {
    return await dbWallet.coins.delete(coinAddress);
  },
};
