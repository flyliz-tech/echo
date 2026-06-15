import * as SQLite from "expo-sqlite";

import {
  CREATE_TASKS_INDEX,
  CREATE_TASKS_TABLE,
  CREATE_TASKS_TRIGGER_TIME_INDEX,
  DB_NAME,
  MIGRATE_TASKS_V2,
  SCHEMA_VERSION,
} from "./schema";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync(DB_NAME);
  await migrate(db);
  return db;
}

async function migrate(database: SQLite.SQLiteDatabase): Promise<void> {
  const result = await database.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  );
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await database.execAsync(`
      ${CREATE_TASKS_TABLE}
      ${CREATE_TASKS_INDEX}
      ${CREATE_TASKS_TRIGGER_TIME_INDEX}
      PRAGMA user_version = 1;
    `);
  }

  if (currentVersion < 2) {
    await database.execAsync(`
      ${MIGRATE_TASKS_V2}
      PRAGMA user_version = 2;
    `);
  }
}

export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync("DELETE FROM tasks;");
}
