import Dexie, { Table } from 'dexie';
import { schema } from './schema';
import {
  DraftCompositeKey,
  DraftPGL,
  GameId,
  GamePublish,
  PGLContractMeta,
} from '../../lib/interfaces/types-game';

class GameDatabase extends Dexie {
  game!: Table<PGLContractMeta, GameId>;
  game_drafts!: Table<DraftPGL, GameId>;
  game_publish!: Table<GamePublish, DraftCompositeKey>;

  constructor() {
    super('GameDatabase');
    this.version(3).stores(schema);
  }
}

export const dbGame = new GameDatabase();
