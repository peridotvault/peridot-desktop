import Dexie, { Table } from 'dexie';
import { schema } from './schema';
import { AppInterface } from '../../interfaces/app/GameInterface';
import { AppId } from '../../interfaces/CoreInterface';

class AppDatabase extends Dexie {
  app!: Table<AppInterface, AppId>;

  constructor() {
    super('AppDatabase');
    this.version(1).stores(schema);
  }
}

export const dbApp = new AppDatabase();
