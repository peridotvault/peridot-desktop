export interface Coin {
  network: string;
  address: string;
  balance: number;
  name: string;
  fee: number;
  symbol: string;
  logo: string;
  isChecked: boolean;
}

export interface ICRC1Metadata {
  balance: number | null;
  logo: string | null;
  decimals: number | null;
  name: string | null;
  symbol: string | null;
  fee: number | null;
}
