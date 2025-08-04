import Dexie, { type EntityTable } from "dexie";

interface BlockHistory {
  id: number;
  name: string;
  age: number;
}

const db = new Dexie("FriendsDatabase") as Dexie & {
  friends: EntityTable<
    BlockHistory,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  friends: "++id, name, age", // primary key "id" (for the runtime!)
});

export type { BlockHistory };
export { db };
