export interface Block {
  id?: number; // auto-increment
  coinAddress: string;
  blockId: bigint;
  timestamp: bigint;
  amt: number;
  op: string;
  from: string;
  to: string;
  memo: string;
}
