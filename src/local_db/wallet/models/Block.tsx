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
export interface ICRC3BlockResponse {
  log_length: number;
  blocks: RawBlock[];
  archived_blocks: any[]; // bisa kamu detailkan jika perlu
}

interface RawBlock {
  id: bigint;
  block: {
    Map?: { _0_: string; _1_: any }[];
    Nat?: bigint;
    Int?: bigint;
    Text?: string;
    Blob?: number[];
    Array?: any[];
  };
}
