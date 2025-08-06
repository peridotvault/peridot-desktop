export const schema = {
  coins: "coinAddress,coinArchiveAddress,isChecked",
  blocks:
    "++id, coinArchiveAddress, blockId, timestamp, op, from, to, [coinArchiveAddress+blockId]",
  user_progress:
    "++id, principalId, coinAddress, lastSavedBlock, [principalId+coinAddress]",
};
