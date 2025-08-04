import { Principal } from "@dfinity/principal";

export interface ICRC1Metadata {
  balance: number | null;
  coinArchiveAddress: string | null;
  logo: string | null;
  decimals: number | null;
  name: string | null;
  symbol: string | null;
  fee: number | null;
}

export type ArchiveInfo = {
  start: bigint;
  end: bigint;
  canister_id: Principal;
};
