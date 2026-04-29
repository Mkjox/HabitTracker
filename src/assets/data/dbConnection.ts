import * as SQLite from 'expo-sqlite';

export const dbPromise = SQLite.openDatabaseAsync("habits.db");

export const initializeDatabase = async () => {
  const db = await dbPromise;

  try {
    await db.execAsync("PRAGMA journal_mode = DELETE;");
    await db.execAsync("PRAGMA synchronous = FULL;");
    await db.execAsync("PRAGMA foreign_keys = ON;");
  } catch (error) {
    console.error("Error setting PRAGMA options:", error);
  }

  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category_id INTEGER,
        icon TEXT DEFAULT 'leaf',
        added_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        frequency_type TEXT DEFAULT 'daily',
        frequency_value INTEGER DEFAULT 0,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS habit_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        custom_value TEXT,
        UNIQUE(habit_id, date), 
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_habit_id_date ON habit_progress(habit_id, date);

      CREATE TABLE IF NOT EXISTS recycle_bin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER NOT NULL,
        habit_name TEXT NOT NULL,
        habit_description TEXT,
        category_id INTEGER,
        icon TEXT DEFAULT 'leaf',
        deleted_at TEXT DEFAULT (datetime('now')),
        frequency_type TEXT DEFAULT 'daily',
        frequency_value INTEGER DEFAULT 0
      );
    `);

    // Migration for existing tables
    try {
      await db.execAsync("ALTER TABLE habits ADD COLUMN icon TEXT DEFAULT 'leaf';");
      await db.execAsync("ALTER TABLE recycle_bin ADD COLUMN icon TEXT DEFAULT 'leaf';");
      
      await db.execAsync("ALTER TABLE habits ADD COLUMN frequency_type TEXT DEFAULT 'daily';");
      await db.execAsync("ALTER TABLE habits ADD COLUMN frequency_value INTEGER DEFAULT 0;");
      await db.execAsync("ALTER TABLE recycle_bin ADD COLUMN frequency_type TEXT DEFAULT 'daily';");
      await db.execAsync("ALTER TABLE recycle_bin ADD COLUMN frequency_value INTEGER DEFAULT 0;");
    } catch (e) {
      // Ignored if columns already exist
    }
  } catch (error) {
    console.error("Error initializing database tables:", error);
  }
};
