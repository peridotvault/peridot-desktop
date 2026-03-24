export interface Coin {
  coinAddress: string;
  coinArchiveAddress: string;
  name: string;
  symbol: string;
  logo: string;
  balance: number;
  fee: number;
  isChecked: number; //(0 and 1)
}

// export interface Coin {
//   network: string;
//   address: string;
//   balance: number;
//   name: string;
//   fee: number;
//   symbol: string;
//   logo: string;
//   isChecked: boolean;
// }
