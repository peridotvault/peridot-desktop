import { dbWallet } from "../database";
import { Block } from "../models/Block";

export const BlockService = {
  async add(block: Block) {
    const existing = await dbWallet.blocks
      .where({
        coinArchiveAddress: block.coinArchiveAddress,
        blockId: block.blockId,
      })
      .first();

    if (existing) {
      return;
    }

    return await dbWallet.blocks.put(block);
  },

  async getAll(): Promise<Block[]> {
    return await dbWallet.blocks.toArray();
  },

  async getByCoin(coinArchiveAddress: string): Promise<Block[]> {
    return await dbWallet.blocks
      .where("coinArchiveAddress")
      .equals(coinArchiveAddress)
      .toArray();
  },

  async getByBlockId(coinArchiveAddress: string, blockId: bigint) {
    return await dbWallet.blocks
      .where("[coinArchiveAddress+blockId]")
      .equals([coinArchiveAddress + blockId])
      .first();
  },

  async deleteById(id: number) {
    return await dbWallet.blocks.delete(id);
  },

  async getByPrincipal(principalId: string) {
    const allBlocks = await dbWallet.blocks.toArray();
    return allBlocks.filter(
      (block) => block.to === principalId || block.from === principalId
    );
  },

  async getLatestBlockId(coinArchiveAddress: string): Promise<number | null> {
    const last = await dbWallet.blocks
      .where("coinArchiveAddress")
      .equals(coinArchiveAddress)
      .reverse()
      .sortBy("blockId");
    return last.length > 0 ? last[0].blockId : null;
  },
};
