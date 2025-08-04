import { dbWallet } from "../database";
import { Block } from "../models/Block";

export const BlockService = {
  async add(block: Block) {
    return await dbWallet.icrc3_blocks.put(block);
  },

  async getAll(): Promise<Block[]> {
    return await dbWallet.icrc3_blocks.toArray();
  },

  async getByCoin(coinAddress: string): Promise<Block[]> {
    return await dbWallet.icrc3_blocks
      .where("coinAddress")
      .equals(coinAddress)
      .toArray();
  },

  async getByBlockId(coinAddress: string, blockId: bigint) {
    return await dbWallet.icrc3_blocks
      .where("[coinAddress+blockId]")
      .equals([coinAddress + blockId])
      .first();
  },

  async deleteById(id: number) {
    return await dbWallet.icrc3_blocks.delete(id);
  },

  async getLatestBlockId(coinAddress: string): Promise<bigint | null> {
    const last = await dbWallet.icrc3_blocks
      .where("coinAddress")
      .equals(coinAddress)
      .reverse()
      .sortBy("blockId");
    return last.length > 0 ? last[0].blockId : null;
  },
};
