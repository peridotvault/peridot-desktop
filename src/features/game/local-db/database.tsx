import Dexie, { Table } from 'dexie';
import { schema } from './schema';
import {
  DraftCompositeKey,
  DraftPGC,
  GameId,
  GamePublish,
  PGCContractMeta,
} from '@shared/interfaces/game.types';

class GameDatabase extends Dexie {
  game!: Table<PGCContractMeta, GameId>;
  game_drafts!: Table<DraftPGC, GameId>;
  game_publish!: Table<GamePublish, DraftCompositeKey>;

  constructor() {
    super('GameDatabase');
    this.version(4).stores(schema);
  }
}

export const dbGame = new GameDatabase();
