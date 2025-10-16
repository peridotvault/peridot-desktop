import Dexie, { Table } from 'dexie';
import { schema } from './schema';

import { Block } from './models/Block';
import { Coin } from './models/Coin';
import { UserProgress } from './models/UserProgress';

class WalletDatabase extends Dexie {
  coins!: Table<Coin, string>;
  blocks!: Table<Block, number>;
  user_progress!: Table<UserProgress, number>;

  constructor() {
    super('WalletDatabase');
    this.version(1).stores(schema);
  }
}

export const dbWallet = new WalletDatabase();
