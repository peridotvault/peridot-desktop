export interface Coin {
  coinAddress: string;
  coinArchiveAddress: string;
  name: string;
  symbol: string;
  logo: string;
  fee: bigint;
  isChecked: boolean;
}
