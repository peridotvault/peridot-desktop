import Dexie, { Table } from 'dexie';
import { schema } from './schema';
import { UserInterface } from '@shared/interfaces/user/UserInterface';

class UserDatabase extends Dexie {
  user!: Table<UserInterface, string>;

  constructor() {
    super('UserDatabase');
    this.version(1).stores(schema);
  }
}

export const dbUser = new UserDatabase();
