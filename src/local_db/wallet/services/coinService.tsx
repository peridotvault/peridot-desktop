import { dbWallet } from "../database";
import { Coin } from "../models/Coin";

export const CoinService = {
  // Create
  async add(coin: Coin) {
    return await dbWallet.coins.put(coin);
  },

  // Read
  async getAll(): Promise<Coin[]> {
    return await dbWallet.coins.toArray();
  },

  async getByAddress(coinAddress: string): Promise<Coin | undefined> {
    return await dbWallet.coins.get(coinAddress);
  },

  async getCoinActive(): Promise<Coin[]> {
    return await dbWallet.coins.where("isChecked").equals(1).toArray();
  },

  // Update
  async update(coinAddress: string, data: Partial<Coin>) {
    return await dbWallet.coins.update(coinAddress, data);
  },

  async updateIsChecked(coinAddress: string) {
    const coin = await dbWallet.coins.get(coinAddress);
    if (!coin) throw new Error("Coin not found");

    return await dbWallet.coins.update(coinAddress, {
      isChecked: coin.isChecked === 1 ? 0 : 1,
    });
  },

  // Delete
  async delete(coinAddress: string) {
    return await dbWallet.coins.delete(coinAddress);
  },
};
