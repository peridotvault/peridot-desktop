import Dexie, { Table } from 'dexie';

export interface KeyValueRecord {
  key: string;
  value: unknown;
  updatedAt: number;
}

class AppDatabase extends Dexie {
  kv!: Table<KeyValueRecord, string>;

  constructor() {
    super('PeridotVaultApp');
    this.version(1).stores({
      kv: '&key, updatedAt',
    });
  }
}

export const appDb = new AppDatabase();

export async function setKvItem<T>(key: string, value: T): Promise<void> {
  await appDb.kv.put({ key, value, updatedAt: Date.now() });
}

export async function getKvItem<T>(key: string): Promise<T | null> {
  const record = await appDb.kv.get(key);
  return (record?.value as T) ?? null;
}

export async function deleteKvItem(key: string): Promise<void> {
  await appDb.kv.delete(key);
}
