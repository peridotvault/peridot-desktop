export const schema = {
  coins: "coinAddress,isChecked",
  blocks: "++id, coinAddress, blockId, timestamp,op, from, to",
  user_progress: "++id, principalId, coinAddress",
};
