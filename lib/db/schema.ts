export const DB_NAME = "echo.db";
export const SCHEMA_VERSION = 1;

export const CREATE_TASKS_TABLE = `
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    trigger_type TEXT NOT NULL CHECK(trigger_type IN ('location', 'time', 'none')),
    latitude REAL,
    longitude REAL,
    radius_meters INTEGER DEFAULT 150,
    location_name TEXT,
    trigger_time TEXT,
    is_completed INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );
`;

export const CREATE_TASKS_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
`;

export const CREATE_TASKS_TRIGGER_TIME_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_tasks_trigger_time ON tasks(trigger_time);
`;
