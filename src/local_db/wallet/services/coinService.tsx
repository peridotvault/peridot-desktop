import { dbWallet } from "../database";
import { Coin } from "../models/Coin";

export const CoinService = {
  async add(coin: Coin) {
    return await dbWallet.coins.put(coin);
  },

  async getAll(): Promise<Coin[]> {
    return await dbWallet.coins.toArray();
  },

  async getByAddress(coinAddress: string): Promise<Coin | undefined> {
    return await dbWallet.coins.get(coinAddress);
  },

  async delete(coinAddress: string) {
    return await dbWallet.coins.delete(coinAddress);
  },

  async update(coinAddress: string, data: Partial<Coin>) {
    return await dbWallet.coins.update(coinAddress, data);
  },
};
