import Dexie, { Table } from "dexie";
import { Block } from "./models/Block";

import { Coin } from "./models/Coin";
import { schema } from "./schema";

class WalletDatabase extends Dexie {
  coins!: Table<Coin, string>;
  icrc3_blocks!: Table<Block, number>;

  constructor() {
    super("WalletDatabase");
    this.version(1).stores(schema);
  }
}

export const dbWallet = new WalletDatabase();
